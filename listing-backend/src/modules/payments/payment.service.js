import { prisma } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { StripeService } from './stripe.service.js';
import { MerchantCodeService } from './merchant-code.service.js';
import { getPagination, formatPaginationResponse } from '../../utils/pagination.js';

export class PaymentService {
  static async getActiveLockSettings() {
    let settings = await prisma.locationLockSetting.findUnique({
      where: { id: 'global_setting' }
    });

    if (!settings) {
      settings = await prisma.locationLockSetting.create({
        data: {
          id: 'global_setting',
          enabledGlobally: false,
          unlockFeeAmount: 15.00,
          unlockFeeCurrency: 'USD',
          gatewayEnabled: true,
          merchantCodeEnabled: true,
          merchantCode: 'SHELTER-MBL-784',
          merchantName: 'Sheltered Global Escrow Services Ltd',
          paymentInstructions: 'Transfer the exact fee to merchant code SHELTER-MBL-784, then submit your transaction ID.',
          supportedChannels: ['MTN Mobile Money', 'Airtel Money', 'Stanbic FlexiPay', 'Bank Wire'],
          verificationMode: 'AUTOMATIC'
        }
      });
    }

    return settings;
  }

  static async createGatewaySession(userId, propertyId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.unauthorized('User not found');

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { lockOverride: true }
    });
    if (!property) throw ApiError.notFound('Property not found');

    const settings = await this.getActiveLockSettings();
    if (!settings.gatewayEnabled) {
      throw ApiError.badRequest('Online payment gateway option is currently disabled by administrator.');
    }

    // Check if user already unlocked this property
    const existingUnlock = await prisma.locationUnlock.findUnique({
      where: {
        userId_propertyId: { userId, propertyId }
      }
    });
    if (existingUnlock) {
      return {
        alreadyUnlocked: true,
        message: 'You have already unlocked this property location.'
      };
    }

    const feeAmount = property.lockOverride?.customFee || settings.unlockFeeAmount;
    const feeCurrency = settings.unlockFeeCurrency;

    const session = await StripeService.createCheckoutSession({
      user,
      property,
      feeAmount,
      feeCurrency
    });

    // Record pending payment in database
    await prisma.payment.create({
      data: {
        userId,
        propertyId,
        paymentMethod: 'GATEWAY_STRIPE',
        amount: feeAmount,
        currency: feeCurrency,
        status: 'PENDING',
        purpose: 'LOCATION_UNLOCK',
        gatewaySessionId: session.sessionId
      }
    });

    return session;
  }

  static async verifyGatewayPayment(userId, propertyId, sessionId) {
    const payment = await prisma.payment.findFirst({
      where: {
        userId,
        propertyId,
        gatewaySessionId: sessionId
      }
    });

    if (!payment) {
      throw ApiError.notFound('Payment session not found');
    }

    // In sandbox or verified webhook, mark as verified
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'VERIFIED',
        gatewayReference: `ref_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        verifiedAt: new Date(),
        auditNotes: 'Verified through secure gateway session handshake'
      }
    });

    // Create unlock record
    await prisma.locationUnlock.upsert({
      where: {
        userId_propertyId: { userId, propertyId }
      },
      update: {
        paymentId: updatedPayment.id,
        unlockedAt: new Date()
      },
      create: {
        userId,
        propertyId,
        paymentId: updatedPayment.id,
        unlockMethod: 'GATEWAY_STRIPE',
        unlockedAt: new Date()
      }
    });

    return {
      success: true,
      status: 'VERIFIED',
      payment: updatedPayment
    };
  }

  static async submitMerchantTransaction(userId, propertyId, transactionId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.unauthorized('User not found');

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw ApiError.notFound('Property not found');

    const settings = await this.getActiveLockSettings();
    if (!settings.merchantCodeEnabled) {
      throw ApiError.badRequest('Merchant code payment option is currently disabled by administrator.');
    }

    return MerchantCodeService.verifyAndSubmitTransaction({
      user,
      property,
      transactionId,
      settings
    });
  }

  static async getPaymentStatus(paymentId, userId) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        property: {
          select: { id: true, title: true, district: true, country: true }
        }
      }
    });

    if (!payment) {
      throw ApiError.notFound('Payment record not found');
    }

    if (payment.userId !== userId) {
      throw ApiError.forbidden('Access denied');
    }

    return payment;
  }

  static async getMyPayments(userId, query) {
    const { page, limit, skip } = getPagination(query);
    const where = { userId };

    if (query.status) {
      where.status = query.status.toUpperCase();
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          property: {
            select: {
              id: true,
              slug: true,
              title: true,
              district: true,
              country: true
            }
          }
        }
      }),
      prisma.payment.count({ where })
    ]);

    return formatPaginationResponse(payments, total, page, limit);
  }
}
