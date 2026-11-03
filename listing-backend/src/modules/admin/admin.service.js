import { prisma } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { getPagination, formatPaginationResponse } from '../../utils/pagination.js';
import { logAudit } from '../../middlewares/auditLog.js';
import { sendEmail } from '../notifications/email.service.js';

async function sendEmailSafe(to, subject, html) {
  try {
    await sendEmail({ to, subject, html });
  } catch (err) {
    console.error('Email send failed:', err?.message || err);
  }
}

export class AdminService {
  static async getPaymentSettings() {
    let settings = await prisma.locationLockSetting.findUnique({
      where: { id: 'global_setting' }
    });

    if (!settings) {
      settings = await prisma.locationLockSetting.create({
        data: {
          id: 'global_setting',
          enabledGlobally: false, // Default is OFF
          unlockFeeAmount: 15.00,
          unlockFeeCurrency: 'USD',
          gatewayEnabled: true,
          merchantCodeEnabled: true,
          merchantCode: 'SHELTER-MBL-784',
          merchantName: 'Sheltered Global Escrow Services Ltd',
          paymentInstructions: 'Transfer the exact fee to merchant code SHELTER-MBL-784 via Mobile Money or Bank Wire, then submit your transaction ID.',
          supportedChannels: ['MTN Mobile Money', 'Airtel Money', 'Stanbic FlexiPay', 'Bank Wire'],
          verificationMode: 'AUTOMATIC'
        }
      });
    }

    return settings;
  }

  static async updatePaymentSettings(data, adminUser, req) {
    const updated = await prisma.locationLockSetting.upsert({
      where: { id: 'global_setting' },
      update: data,
      create: {
        id: 'global_setting',
        ...data
      }
    });

    await logAudit({
      actorId: adminUser.id,
      action: 'UPDATE_PAYMENT_SETTINGS',
      details: data,
      targetType: 'LOCATION_LOCK_SETTING',
      targetId: 'global_setting',
      req
    });

    return updated;
  }

  static async updatePropertyLockOverride(data, adminUser, req) {
    const override = await prisma.propertyLockOverride.upsert({
      where: { propertyId: data.propertyId },
      update: {
        isLocked: data.isLocked,
        customFee: data.customFee || null,
        reason: data.reason || null
      },
      create: {
        propertyId: data.propertyId,
        isLocked: data.isLocked,
        customFee: data.customFee || null,
        reason: data.reason || null
      }
    });

    await logAudit({
      actorId: adminUser.id,
      action: 'SET_PROPERTY_LOCK_OVERRIDE',
      details: data,
      targetType: 'PROPERTY',
      targetId: data.propertyId,
      req
    });

    return override;
  }

  static async listAllPayments(query) {
    const { page, limit, skip } = getPagination(query, 20);
    const where = {};

    if (query.status && query.status !== 'ALL') {
      where.status = query.status.toUpperCase();
    }

    if (query.paymentMethod && query.paymentMethod !== 'ALL') {
      where.paymentMethod = query.paymentMethod.toUpperCase();
    }

    if (query.propertyId) {
      where.propertyId = query.propertyId;
    }

    if (query.search) {
      where.OR = [
        { submittedTxId: { contains: query.search, mode: 'insensitive' } },
        { gatewayReference: { contains: query.search, mode: 'insensitive' } },
        { user: { email: { contains: query.search, mode: 'insensitive' } } },
        { property: { title: { contains: query.search, mode: 'insensitive' } } }
      ];
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, fullName: true, email: true, phone: true }
          },
          property: {
            select: { id: true, title: true, district: true, country: true }
          }
        }
      }),
      prisma.payment.count({ where })
    ]);

    return formatPaginationResponse(payments, total, page, limit);
  }

  static async reviewPayment(paymentId, action, rejectionReason, adminUser, req) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId }
    });

    if (!payment) {
      throw ApiError.notFound('Payment record not found');
    }

    if (action === 'APPROVE') {
      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'VERIFIED',
          verifiedAt: new Date(),
          verifiedByAdminId: adminUser.id,
          auditNotes: `Manually verified & approved by admin ${adminUser.email}`
        }
      });

      // Grant location unlock
      await prisma.locationUnlock.upsert({
        where: {
          userId_propertyId: { userId: payment.userId, propertyId: payment.propertyId }
        },
        update: {
          paymentId: payment.id,
          unlockedAt: new Date()
        },
        create: {
          userId: payment.userId,
          propertyId: payment.propertyId,
          paymentId: payment.id,
          unlockMethod: payment.paymentMethod,
          unlockedAt: new Date()
        }
      });

      await logAudit({
        actorId: adminUser.id,
        action: 'APPROVE_PAYMENT',
        details: { paymentId, amount: payment.amount, txId: payment.submittedTxId },
        targetType: 'PAYMENT',
        targetId: paymentId,
        req
      });

      return {
        success: true,
        message: 'Payment approved and property location unlocked for user',
        payment: updatedPayment
      };
    } else if (action === 'REJECT') {
      if (!rejectionReason || rejectionReason.trim().length < 5) {
        throw ApiError.badRequest('A clear rejection reason (minimum 5 characters) is required when rejecting a payment');
      }

      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'REJECTED',
          rejectionReason: rejectionReason.trim(),
          verifiedByAdminId: adminUser.id,
          auditNotes: `Rejected by admin ${adminUser.email}: ${rejectionReason.trim()}`
        }
      });

      await logAudit({
        actorId: adminUser.id,
        action: 'REJECT_PAYMENT',
        details: { paymentId, reason: rejectionReason.trim() },
        targetType: 'PAYMENT',
        targetId: paymentId,
        req
      });

      return {
        success: true,
        message: 'Payment rejected. Reason recorded for user view.',
        payment: updatedPayment
      };
    }
  }

  static async manualUnlock(data, adminUser, req) {
    const user = await prisma.user.findUnique({
      where: { email: data.userEmail.toLowerCase().trim() }
    });

    if (!user) {
      throw ApiError.notFound(`No user found with email address '${data.userEmail}'`);
    }

    const property = await prisma.property.findUnique({
      where: { id: data.propertyId }
    });

    if (!property) {
      throw ApiError.notFound('Property not found');
    }

    // Create an administrative payment record
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        propertyId: property.id,
        paymentMethod: 'MANUAL_ADMIN_OVERRIDE',
        amount: 0,
        currency: 'USD',
        status: 'VERIFIED',
        purpose: 'LOCATION_UNLOCK',
        verifiedAt: new Date(),
        verifiedByAdminId: adminUser.id,
        auditNotes: `Administrative support unlock. Reason: ${data.reason.trim()}`
      }
    });

    // Create or update unlock record
    const unlock = await prisma.locationUnlock.upsert({
      where: {
        userId_propertyId: { userId: user.id, propertyId: property.id }
      },
      update: {
        paymentId: payment.id,
        unlockedAt: new Date()
      },
      create: {
        userId: user.id,
        propertyId: property.id,
        paymentId: payment.id,
        unlockMethod: 'MANUAL_ADMIN_OVERRIDE',
        unlockedAt: new Date()
      }
    });

    await logAudit({
      actorId: adminUser.id,
      action: 'MANUAL_SUPPORT_UNLOCK',
      details: {
        propertyId: property.id,
        propertyTitle: property.title,
        recipientUserId: user.id,
        recipientEmail: user.email,
        reason: data.reason.trim()
      },
      targetType: 'LOCATION_UNLOCK',
      targetId: unlock.id,
      req
    });

    return {
      success: true,
      message: `Property location successfully unlocked for ${user.email}. Audit log recorded.`,
      unlock
    };
  }

  static async listPendingOwners(query = {}) {
    const { page, limit, skip } = getPagination(query, 20);
    const where = { role: { in: ['SELLER', 'AGENT'] } };
    if (query.status && query.status !== 'ALL') {
      where.accountStatus = query.status.toUpperCase();
    }
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          role: true,
          accountStatus: true,
          approvedAt: true,
          companyName: true,
          agencyLicense: true,
          country: true,
          createdAt: true
        }
      }),
      prisma.user.count({ where })
    ]);
    return formatPaginationResponse(users, total, page, limit);
  }

  static async approveOwner(ownerId, adminUser, req) {
    const user = await prisma.user.findUnique({ where: { id: ownerId } });
    if (!user) throw ApiError.notFound('User not found');
    if (user.role !== 'SELLER' && user.role !== 'AGENT') {
      throw ApiError.badRequest('Only seller/agent accounts require approval');
    }
    const updated = await prisma.user.update({
      where: { id: ownerId },
      data: { accountStatus: 'APPROVED', approvedAt: new Date(), approvedById: adminUser.id }
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'ACCOUNT_APPROVED',
        title: 'Account Approved',
        message: 'Your seller account has been approved. You can now list properties.',
        link: '/#/seller-dashboard'
      }
    });

    await sendEmailSafe(user.email, 'Your Sheltered account has been approved', `<h2>Account Approved</h2><p>Dear ${user.fullName},</p><p>Your seller account has been approved. You can now list properties.</p>`);

    await logAudit({
      actorId: adminUser.id,
      action: 'APPROVE_OWNER',
      details: { ownerId, email: user.email },
      targetType: 'USER',
      targetId: ownerId,
      req
    });

    return { success: true, message: 'Owner account approved', user: updated };
  }

  static async rejectOwner(ownerId, reason, adminUser, req) {
    const user = await prisma.user.findUnique({ where: { id: ownerId } });
    if (!user) throw ApiError.notFound('User not found');
    const updated = await prisma.user.update({
      where: { id: ownerId },
      data: { accountStatus: 'REJECTED', approvedById: adminUser.id }
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'ACCOUNT_REJECTED',
        title: 'Account Rejected',
        message: reason ? `Your account application was rejected: ${reason}` : 'Your account application was rejected.',
        link: '/#/sign-in'
      }
    });

    await sendEmailSafe(user.email, 'Your Sheltered account application update', `<h2>Account Application Update</h2><p>Dear ${user.fullName},</p><p>Your account application was not approved.</p>${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}`);

    await logAudit({
      actorId: adminUser.id,
      action: 'REJECT_OWNER',
      details: { ownerId, email: user.email, reason },
      targetType: 'USER',
      targetId: ownerId,
      req
    });

    return { success: true, message: 'Owner account rejected', user: updated };
  }
  static async listPendingProperties(query = {}) {
    const { page, limit, skip } = getPagination(query, 20);
    const where = {};
    if (query.status && query.status !== 'ALL') {
      where.status = query.status.toUpperCase();
    } else {
      where.status = 'PENDING_REVIEW';
    }
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { owner: { select: { id: true, email: true, fullName: true } }, media: true }
      }),
      prisma.property.count({ where })
    ]);
    return formatPaginationResponse(properties, total, page, limit);
  }

  static async approveProperty(propertyId, adminUser, req) {
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw ApiError.notFound('Property not found');
    const updated = await prisma.property.update({
      where: { id: propertyId },
      data: { status: 'ACTIVE' }
    });

    const owner = await prisma.user.findUnique({ where: { id: property.ownerId } });
    if (owner) {
      await prisma.notification.create({
        data: {
          userId: owner.id,
          type: 'PROPERTY_APPROVED',
          title: 'Property Approved',
          message: `Your property "${property.title}" has been approved and is now live.`,
          link: `/#/property-detail?id=${property.id}`
        }
      });
      await sendEmailSafe(owner.email, `Your property has been approved: ${property.title}`, `<h2>Property Approved</h2><p>Dear ${owner.fullName},</p><p>Your property <strong>${property.title}</strong> has been approved and is now live.</p>`);
    }

    await logAudit({
      actorId: adminUser.id,
      action: 'APPROVE_PROPERTY',
      details: { propertyId, title: property.title },
      targetType: 'PROPERTY',
      targetId: propertyId,
      req
    });

    return { success: true, message: 'Property approved', property: updated };
  }

  static async rejectProperty(propertyId, reason, adminUser, req) {
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw ApiError.notFound('Property not found');
    const updated = await prisma.property.update({
      where: { id: propertyId },
      data: { status: 'REJECTED' }
    });

    const owner = await prisma.user.findUnique({ where: { id: property.ownerId } });
    if (owner) {
      await prisma.notification.create({
        data: {
          userId: owner.id,
          type: 'PROPERTY_REJECTED',
          title: 'Property Rejected',
          message: reason ? `Your property "${property.title}" was rejected: ${reason}` : `Your property "${property.title}" was rejected.`,
          link: '/#/seller-dashboard'
        }
      });
      await sendEmailSafe(owner.email, `Property review update: ${property.title}`, `<h2>Property Review Update</h2><p>Dear ${owner.fullName},</p><p>Your property <strong>${property.title}</strong> was not approved.</p>${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}`);
    }

    await logAudit({
      actorId: adminUser.id,
      action: 'REJECT_PROPERTY',
      details: { propertyId, title: property.title, reason },
      targetType: 'PROPERTY',
      targetId: propertyId,
      req
    });

    return { success: true, message: 'Property rejected', property: updated };
  }
}
