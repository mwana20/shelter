import { prisma } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { getPagination, formatPaginationResponse } from '../../utils/pagination.js';
import { logAudit } from '../../middlewares/auditLog.js';
import { sendEmail } from '../notifications/email.service.js';
import { addCalendarMonths, SubscriptionService } from '../subscriptions/subscription.service.js';

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
    const where = query.status === 'ALL'
      ? {}
      : { status: query.status ? query.status.toUpperCase() : 'PENDING_REVIEW' };
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: { select: { id: true, email: true, fullName: true, phone: true, role: true } },
          media: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
          reviewHistory: { orderBy: { createdAt: 'desc' } }
        }
      }),
      prisma.property.count({ where })
    ]);
    return formatPaginationResponse(properties, total, page, limit);
  }

  static async approveProperty(propertyId, adminUser, req) {
    return this.updatePropertyReview(propertyId, 'ACTIVE', 'APPROVED', req.body?.notes || null, adminUser, req);
  }

  static async rejectProperty(propertyId, notes, adminUser, req) {
    return this.updatePropertyReview(propertyId, 'REJECTED', 'REJECTED', notes, adminUser, req);
  }

  static async requestPropertyCorrections(propertyId, notes, adminUser, req) {
    return this.updatePropertyReview(propertyId, 'CORRECTION_REQUESTED', 'CORRECTIONS_REQUESTED', notes, adminUser, req);
  }

  static async updatePropertyReview(propertyId, status, action, notes, adminUser, req) {
    if (status !== 'ACTIVE' && (!notes || notes.trim().length < 5)) {
      throw ApiError.badRequest('Review notes of at least five characters are required.');
    }
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw ApiError.notFound('Property not found');

    const updated = await prisma.$transaction(async (transaction) => {
      const result = await transaction.property.update({
        where: { id: propertyId },
        data: { status, reviewNote: notes }
      });
      await transaction.propertyReview.create({
        data: {
          propertyId,
          actorId: adminUser.id,
          fromStatus: property.status,
          toStatus: status,
          action,
          notes
        }
      });
      return result;
    });

    const owner = await prisma.user.findUnique({ where: { id: property.ownerId } });
    const message = status === 'ACTIVE'
      ? `Your property "${property.title}" has been approved and is now live.`
      : status === 'CORRECTION_REQUESTED'
        ? `Corrections are required for "${property.title}": ${notes}`
        : `Your property "${property.title}" was rejected: ${notes}`;
    if (owner) {
      await prisma.notification.create({
        data: {
          userId: owner.id,
          type: `PROPERTY_${action}`,
          title: status === 'ACTIVE' ? 'Property Approved' : status === 'CORRECTION_REQUESTED' ? 'Corrections Requested' : 'Property Rejected',
          message,
          link: status === 'ACTIVE' ? `/#/property-detail?id=${property.id}` : '/#/seller-dashboard'
        }
      });
      await sendEmailSafe(owner.email, `Property review update: ${property.title}`, `<h2>Property Review Update</h2><p>Dear ${owner.fullName},</p><p>${message}</p>`);
    }

    await logAudit({
      actorId: adminUser.id,
      action: `PROPERTY_${action}`,
      details: { propertyId, title: property.title, notes },
      targetType: 'PROPERTY',
      targetId: propertyId,
      req
    });

    return { success: true, message: status === 'ACTIVE' ? 'Property approved' : status === 'CORRECTION_REQUESTED' ? 'Corrections requested' : 'Property rejected', property: updated };
  }

  static async getSubscriptionConfig() {
    return SubscriptionService.getConfig();
  }

  static async updateSubscriptionConfig(data, adminUser, req) {
    const updated = await prisma.$transaction(async (transaction) => {
      const config = await transaction.subscriptionConfig.upsert({
        where: { id: 'global_setting' },
        update: {
          baseMonthlyPrice: data.baseMonthlyPrice,
          currency: data.currency,
          freeValidityDays: data.freeValidityDays,
          freeListingLimit: data.freeListingLimit,
          freeMapUnlockLimit: data.freeMapUnlockLimit,
          paidListingLimit: data.paidListingLimit,
          paidMapUnlockLimit: data.paidMapUnlockLimit
        },
        create: {
          id: 'global_setting',
          baseMonthlyPrice: data.baseMonthlyPrice,
          currency: data.currency,
          freeValidityDays: data.freeValidityDays,
          freeListingLimit: data.freeListingLimit,
          freeMapUnlockLimit: data.freeMapUnlockLimit,
          paidListingLimit: data.paidListingLimit,
          paidMapUnlockLimit: data.paidMapUnlockLimit
        }
      });
      await transaction.subscriptionDiscount.deleteMany({ where: { configId: config.id } });
      await transaction.subscriptionDiscount.createMany({
        data: data.discounts.map((discount) => ({ ...discount, configId: config.id }))
      });
      await transaction.auditLog.create({
        data: {
          actorId: adminUser.id,
          action: 'UPDATE_SUBSCRIPTION_SETTINGS',
          details: JSON.stringify(data),
          targetType: 'SUBSCRIPTION_CONFIG',
          targetId: config.id,
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      });
      return transaction.subscriptionConfig.findUnique({
        where: { id: config.id },
        include: { discounts: { orderBy: { minMonths: 'asc' } } }
      });
    });
    return updated;
  }

  static async listSubscriptions(query = {}) {
    const { page, limit, skip } = getPagination(query, 20);
    const where = {};
    if (query.status && query.status !== 'ALL') where.status = query.status.toUpperCase();
    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, fullName: true, role: true } },
          payments: { orderBy: { createdAt: 'desc' } }
        }
      }),
      prisma.subscription.count({ where })
    ]);
    return formatPaginationResponse(subscriptions, total, page, limit);
  }

  static async listSubscriptionUsers(query = {}) {
    const { page, limit, skip } = getPagination(query, 100);
    const where = {
      role: { in: ['SELLER', 'AGENT'] },
      ...(query.search
        ? {
            OR: [
              { fullName: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } }
            ]
          }
        : {})
    };
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          accountStatus: true,
          subscriptions: {
            where: { status: 'ACTIVE', expiresAt: { gt: new Date() } },
            orderBy: { startsAt: 'desc' },
            take: 1
          }
        }
      }),
      prisma.user.count({ where })
    ]);
    return formatPaginationResponse(users, total, page, limit);
  }

  static async grantSubscription(userId, data, adminUser, req) {
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) throw ApiError.notFound('User not found');
    if (!['SELLER', 'AGENT'].includes(targetUser.role)) {
      throw ApiError.badRequest('Subscriptions can only be granted to property owners and brokers.');
    }

    const config = await SubscriptionService.getConfig();
    const now = new Date();
    const quote = data.plan === 'PAID'
      ? SubscriptionService.calculatePrice(config, data.durationMonths)
      : {
          durationMonths: 0,
          baseMonthlyPrice: 0,
          originalTotal: 0,
          discountPercent: 0,
          discountAmount: 0,
          totalAmount: 0,
          currency: config.currency
        };
    const expiresAt = data.plan === 'FREE'
      ? new Date(now.getTime() + config.freeValidityDays * 24 * 60 * 60 * 1000)
      : addCalendarMonths(now, quote.durationMonths);

    const subscription = await prisma.$transaction(async (transaction) => {
      const active = await SubscriptionService.getActiveSubscription(userId, transaction);
      if (active) {
        await transaction.subscription.update({
          where: { id: active.id },
          data: { status: 'REVOKED' }
        });
      }
      const created = await transaction.subscription.create({
        data: {
          userId,
          plan: data.plan,
          status: 'ACTIVE',
          durationMonths: quote.durationMonths,
          baseMonthlyPrice: quote.baseMonthlyPrice,
          originalTotal: quote.originalTotal,
          discountPercent: quote.discountPercent,
          discountAmount: quote.discountAmount,
          totalAmount: quote.totalAmount,
          currency: quote.currency,
          startsAt: now,
          expiresAt
        }
      });
      await transaction.auditLog.create({
        data: {
          actorId: adminUser.id,
          action: 'MANUAL_GRANT_SUBSCRIPTION',
          details: JSON.stringify({ userId, plan: data.plan, durationMonths: quote.durationMonths, reason: data.reason }),
          targetType: 'SUBSCRIPTION',
          targetId: created.id,
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      });
      return created;
    });
    await prisma.notification.create({
      data: {
        userId,
        type: 'SUBSCRIPTION_GRANTED',
        title: 'Subscription granted',
        message: `An administrator granted you a ${data.plan.toLowerCase()} subscription through ${expiresAt.toLocaleDateString()}.`,
        link: '/#/seller-dashboard'
      }
    });
    return subscription;
  }

  static async revokeSubscription(subscriptionId, reason, adminUser, req) {
    const subscription = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
    if (!subscription) throw ApiError.notFound('Subscription not found');
    if (subscription.status !== 'ACTIVE' && subscription.status !== 'PENDING_PAYMENT') {
      throw ApiError.conflict('Only active or pending subscriptions can be revoked.');
    }

    const updated = await prisma.$transaction(async (transaction) => {
      const result = await transaction.subscription.update({
        where: { id: subscriptionId },
        data: { status: 'REVOKED' }
      });
      await transaction.auditLog.create({
        data: {
          actorId: adminUser.id,
          action: 'REVOKE_SUBSCRIPTION',
          details: JSON.stringify({ userId: subscription.userId, reason }),
          targetType: 'SUBSCRIPTION',
          targetId: subscriptionId,
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      });
      return result;
    });
    await prisma.notification.create({
      data: {
        userId: subscription.userId,
        type: 'SUBSCRIPTION_REVOKED',
        title: 'Subscription update',
        message: `An administrator revoked your subscription: ${reason}`,
        link: '/#/seller-dashboard'
      }
    });
    return updated;
  }
}
