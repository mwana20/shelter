import { prisma } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { StripeService } from '../payments/stripe.service.js';

const money = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export function addCalendarMonths(date, months) {
  const result = new Date(date);
  const day = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
  result.setUTCDate(Math.min(day, lastDay));
  return result;
}

export class SubscriptionService {
  static async getConfig() {
    return prisma.subscriptionConfig.upsert({
      where: { id: 'global_setting' },
      update: {},
      create: {
        id: 'global_setting',
        baseMonthlyPrice: 0,
        currency: 'USD',
        freeValidityDays: 30,
        freeListingLimit: 1,
        freeMapUnlockLimit: 1,
        paidListingLimit: 0,
        paidMapUnlockLimit: 0
      },
      include: { discounts: { orderBy: { minMonths: 'asc' } } }
    });
  }

  static calculatePrice(config, durationMonths) {
    if (!Number.isInteger(durationMonths) || durationMonths < 1 || durationMonths > 48) {
      throw ApiError.badRequest('Paid subscriptions must be between 1 and 48 whole months.');
    }

    const discount = config.discounts.find((item) =>
      durationMonths >= item.minMonths && durationMonths <= item.maxMonths
    );
    const baseMonthlyPrice = money(config.baseMonthlyPrice);
    const discountPercent = money(discount?.discountPercent || 0);
    const originalTotal = money(baseMonthlyPrice * durationMonths);
    const discountAmount = money(originalTotal * discountPercent / 100);
    const totalAmount = money(originalTotal - discountAmount);
    const years = Math.floor(durationMonths / 12);
    const months = durationMonths % 12;

    return {
      durationMonths,
      durationDisplay: [
        years ? `${years} ${years === 1 ? 'year' : 'years'}` : '',
        months ? `${months} ${months === 1 ? 'month' : 'months'}` : ''
      ].filter(Boolean).join(' '),
      currency: config.currency,
      baseMonthlyPrice,
      originalTotal,
      discountPercent,
      discountAmount,
      totalAmount,
      savings: discountAmount,
      effectiveMonthlyCost: money(totalAmount / durationMonths)
    };
  }

  static async getPlans() {
    const config = await this.getConfig();
    return {
      free: {
        name: 'Free',
        validityDays: config.freeValidityDays,
        listingLimit: config.freeListingLimit,
        mapUnlockLimit: config.freeMapUnlockLimit,
        price: 0
      },
      paid: {
        name: 'Paid',
        minimumMonths: 1,
        maximumMonths: 48,
        currency: config.currency,
        baseMonthlyPrice: money(config.baseMonthlyPrice),
        listingLimit: config.paidListingLimit,
        mapUnlockLimit: config.paidMapUnlockLimit,
        discounts: config.discounts.map((item) => ({
          minMonths: item.minMonths,
          maxMonths: item.maxMonths,
          discountPercent: money(item.discountPercent)
        }))
      }
    };
  }

  static async getQuote(durationMonths) {
    const config = await this.getConfig();
    if (Number(config.baseMonthlyPrice) <= 0) {
      throw ApiError.badRequest('Paid subscription pricing is not configured yet.');
    }
    return this.calculatePrice(config, Number(durationMonths));
  }

  static async expireSubscriptions() {
    const now = new Date();
    const pendingCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return prisma.$transaction(async (transaction) => {
      const expired = await transaction.subscription.updateMany({
        where: { status: 'ACTIVE', expiresAt: { lte: now } },
        data: { status: 'EXPIRED' }
      });
      const abandoned = await transaction.subscription.findMany({
        where: { status: 'PENDING_PAYMENT', createdAt: { lte: pendingCutoff } },
        select: { id: true }
      });
      const abandonedIds = abandoned.map(({ id }) => id);
      if (abandonedIds.length) {
        await transaction.subscriptionPayment.updateMany({
          where: { subscriptionId: { in: abandonedIds }, status: 'PENDING' },
          data: { status: 'EXPIRED' }
        });
        await transaction.subscription.updateMany({
          where: { id: { in: abandonedIds }, status: 'PENDING_PAYMENT' },
          data: { status: 'FAILED' }
        });
      }
      return { expired: expired.count, abandoned: abandonedIds.length };
    });
  }

  static async getActiveSubscription(userId, transaction = prisma) {
    const now = new Date();
    return transaction.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        startsAt: { lte: now },
        expiresAt: { gt: now }
      },
      orderBy: { startsAt: 'desc' }
    });
  }

  static async getMySubscription(userId) {
    await this.expireSubscriptions();
    const [active, history, config, listingsUsed] = await Promise.all([
      this.getActiveSubscription(userId),
      prisma.subscription.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          payments: { orderBy: { createdAt: 'desc' } },
          _count: { select: { mapUnlocks: true } }
        }
      }),
      this.getConfig(),
      prisma.property.count({
        where: {
          ownerId: userId,
          status: { in: ['ACTIVE', 'APPROVED', 'PENDING_REVIEW', 'CORRECTION_REQUESTED'] }
        }
      })
    ]);

    return {
      current: active,
      history,
      privileges: active
        ? {
            plan: active.plan,
            expiresAt: active.expiresAt,
            listingLimit: active.plan === 'FREE' ? config.freeListingLimit : config.paidListingLimit,
            listingsUsed,
            mapUnlockLimit: active.plan === 'FREE' ? config.freeMapUnlockLimit : config.paidMapUnlockLimit,
            mapUnlocksUsed: history.find((item) => item.id === active.id)?._count.mapUnlocks || 0
          }
        : { plan: null, listingLimit: 0, listingsUsed, mapUnlockLimit: 0, mapUnlocksUsed: 0 }
    };
  }

  static async selectPlan(userId, plan, durationMonths) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.unauthorized('User not found');
    if (!user.emailVerified) throw ApiError.forbidden('Verify your email before selecting a subscription.');
    if (!['SELLER', 'AGENT'].includes(user.role)) {
      throw ApiError.forbidden('Subscriptions are available to property owners and brokers.');
    }

    await this.expireSubscriptions();
    const active = await this.getActiveSubscription(userId);
    if (plan === 'FREE') {
      if (active) {
        if (active.plan === 'FREE') return { subscription: active, alreadyActive: true };
        throw ApiError.conflict('An active paid subscription cannot be replaced with a Free Plan.');
      }
      const config = await this.getConfig();
      const startsAt = new Date();
      const expiresAt = new Date(startsAt.getTime() + config.freeValidityDays * 24 * 60 * 60 * 1000);
      const subscription = await prisma.$transaction(async (transaction) => {
        const created = await transaction.subscription.create({
          data: {
            userId,
            plan: 'FREE',
            status: 'ACTIVE',
            durationMonths: 0,
            baseMonthlyPrice: 0,
            originalTotal: 0,
            discountPercent: 0,
            discountAmount: 0,
            totalAmount: 0,
            currency: config.currency,
            startsAt,
            expiresAt
          }
        });
        await transaction.auditLog.create({
          data: {
            actorId: userId,
            action: 'ACTIVATE_FREE_SUBSCRIPTION',
            details: `Free subscription activated until ${expiresAt.toISOString()}`,
            targetType: 'SUBSCRIPTION',
            targetId: created.id
          }
        });
        return created;
      });
      return { subscription, alreadyActive: false };
    }

    if (plan !== 'PAID') throw ApiError.badRequest('Select either the Free or Paid Plan.');
    const config = await this.getConfig();
    const quote = this.calculatePrice(config, Number(durationMonths));
    if (quote.baseMonthlyPrice <= 0 || quote.totalAmount <= 0) {
      throw ApiError.badRequest('Paid subscription pricing is not configured yet.');
    }
    const pending = await prisma.subscription.findFirst({
      where: { userId, plan: 'PAID', status: 'PENDING_PAYMENT' },
      orderBy: { createdAt: 'desc' },
      include: { payments: { where: { status: 'PENDING' }, orderBy: { createdAt: 'desc' }, take: 1 } }
    });
    if (pending) {
      if (pending.durationMonths !== quote.durationMonths) {
        throw ApiError.conflict('A paid checkout is already pending. Complete or wait for it to expire before selecting another duration.');
      }
      const pendingPayment = pending.payments[0];
      if (!pendingPayment?.gatewaySessionId) {
        throw ApiError.conflict('Your checkout is being prepared. Please try again in a moment.');
      }
      const checkout = await StripeService.getSubscriptionCheckoutSession(pendingPayment.gatewaySessionId);
      if (checkout.checkoutUrl) {
        return {
          subscription: pending,
          paymentId: pendingPayment.id,
          quote,
          checkoutUrl: checkout.checkoutUrl
        };
      }
      if (checkout.status === 'complete' && checkout.paymentStatus === 'paid') {
        throw ApiError.conflict('Payment was received and is awaiting secure confirmation.');
      }
      if (checkout.status === 'expired') {
        await this.failCheckoutSession(pendingPayment.gatewaySessionId, 'EXPIRED');
      } else {
        throw ApiError.conflict('Checkout is no longer available. Contact support if your payment was already completed.');
      }
    }

    let subscription;
    let payment;
    try {
      ({ subscription, payment } = await prisma.$transaction(async (transaction) => {
        const createdSubscription = await transaction.subscription.create({
          data: {
            userId,
            plan: 'PAID',
            status: 'PENDING_PAYMENT',
            durationMonths: quote.durationMonths,
            baseMonthlyPrice: quote.baseMonthlyPrice,
            originalTotal: quote.originalTotal,
            discountPercent: quote.discountPercent,
            discountAmount: quote.discountAmount,
            totalAmount: quote.totalAmount,
            currency: quote.currency
          }
        });
        const createdPayment = await transaction.subscriptionPayment.create({
          data: {
            userId,
            subscriptionId: createdSubscription.id,
            amount: quote.totalAmount,
            currency: quote.currency,
            status: 'PENDING'
          }
        });
        return { subscription: createdSubscription, payment: createdPayment };
      }));
    } catch (error) {
      if (error?.code === 'P2002') {
        throw ApiError.conflict('A paid checkout is already being created. Retry shortly to continue it.');
      }
      throw error;
    }

    try {
      const checkout = await StripeService.createSubscriptionCheckoutSession({
        user,
        subscription,
        payment,
        quote
      });
      await prisma.subscriptionPayment.update({
        where: { id: payment.id },
        data: { gatewaySessionId: checkout.sessionId }
      });
      return { subscription, paymentId: payment.id, quote, checkoutUrl: checkout.checkoutUrl };
    } catch (error) {
      await prisma.$transaction([
        prisma.subscriptionPayment.update({ where: { id: payment.id }, data: { status: 'FAILED' } }),
        prisma.subscription.update({ where: { id: subscription.id }, data: { status: 'FAILED' } })
      ]);
      throw error;
    }
  }

  static async activatePaidSubscription(session) {
    const { userId, subscriptionId, subscriptionPaymentId } = session.metadata || {};
    if (!userId || !subscriptionId || !subscriptionPaymentId || session.payment_status !== 'paid') {
      return { activated: false };
    }

    return prisma.$transaction(async (transaction) => {
      const payment = await transaction.subscriptionPayment.findUnique({
        where: { id: subscriptionPaymentId },
        include: { subscription: true }
      });
      if (!payment || payment.userId !== userId || payment.subscriptionId !== subscriptionId) {
        throw ApiError.badRequest('Subscription payment metadata does not match the recorded payment.');
      }
      if (payment.gatewaySessionId !== session.id) {
        throw ApiError.badRequest('Subscription payment session does not match the recorded session.');
      }
      if (payment.status === 'VERIFIED') return { activated: false, alreadyProcessed: true };
      if (payment.status !== 'PENDING' || payment.subscription.status !== 'PENDING_PAYMENT') {
        return { activated: false };
      }
      const expectedCents = Math.round(Number(payment.amount) * 100);
      if (
        session.amount_total !== expectedCents ||
        String(session.currency).toUpperCase() !== payment.currency.toUpperCase()
      ) {
        throw ApiError.badRequest('Paid amount does not match the subscription price.');
      }

      const now = new Date();
      const current = await this.getActiveSubscription(userId, transaction);
      const startsAt = current?.plan === 'PAID' && current.expiresAt > now
        ? current.expiresAt
        : now;
      const expiresAt = addCalendarMonths(startsAt, payment.subscription.durationMonths);
      if (current?.plan === 'FREE') {
        await transaction.subscription.update({
          where: { id: current.id },
          data: { status: 'REVOKED' }
        });
      }
      await transaction.subscriptionPayment.update({
        where: { id: payment.id },
        data: {
          status: 'VERIFIED',
          gatewayReference: session.payment_intent || session.id,
          paidAt: now
        }
      });
      const updated = await transaction.subscription.update({
        where: { id: subscriptionId },
        data: { status: 'ACTIVE', startsAt, expiresAt }
      });
      return { activated: true, subscription: updated };
    });
  }

  static async failCheckoutSession(sessionId, status) {
    if (!['FAILED', 'EXPIRED'].includes(status)) {
      throw ApiError.badRequest('Invalid subscription payment status.');
    }
    const payment = await prisma.subscriptionPayment.findUnique({
      where: { gatewaySessionId: sessionId }
    });
    if (!payment || payment.status !== 'PENDING') return;

    await prisma.$transaction([
      prisma.subscriptionPayment.update({
        where: { id: payment.id },
        data: { status }
      }),
      prisma.subscription.updateMany({
        where: { id: payment.subscriptionId, status: 'PENDING_PAYMENT' },
        data: { status: 'FAILED' }
      })
    ]);
  }

  static async unlockMap(userId, propertyId) {
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property || property.status !== 'ACTIVE') throw ApiError.notFound('Approved property not found');
    const paidUnlock = await prisma.locationUnlock.findUnique({
      where: { userId_propertyId: { userId, propertyId } }
    });
    if (paidUnlock) return { unlocked: true, alreadyUnlocked: true };

    const active = await this.getActiveSubscription(userId);
    if (!active) throw ApiError.forbidden('An active subscription is required to unlock a listing map.');
    const existing = await prisma.subscriptionMapUnlock.findUnique({
      where: { subscriptionId_propertyId: { subscriptionId: active.id, propertyId } }
    });
    if (existing) return { unlocked: true, alreadyUnlocked: true };

    const config = await this.getConfig();
    const mapLimit = active.plan === 'FREE' ? config.freeMapUnlockLimit : config.paidMapUnlockLimit;
    try {
      await prisma.$transaction(async (transaction) => {
        const alreadyUnlocked = await transaction.subscriptionMapUnlock.findUnique({
          where: { subscriptionId_propertyId: { subscriptionId: active.id, propertyId } }
        });
        if (alreadyUnlocked) return;
        const used = await transaction.subscriptionMapUnlock.count({
          where: { subscriptionId: active.id }
        });
        if (mapLimit > 0 && used >= mapLimit) {
          throw ApiError.forbidden('Your plan has used all available map unlocks. Upgrade or renew to continue.');
        }
        await transaction.subscriptionMapUnlock.create({
          data: { userId, subscriptionId: active.id, propertyId }
        });
      }, { isolationLevel: 'Serializable' });
      return { unlocked: true, alreadyUnlocked: false };
    } catch (error) {
      if (error.code === 'P2002') return { unlocked: true, alreadyUnlocked: true };
      throw error;
    }
  }
}
