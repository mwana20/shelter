import { stripe } from '../../config/stripe.js';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';
import { prisma } from '../../config/database.js';

export class StripeService {
  static async createCheckoutSession({ user, property, feeAmount, feeCurrency }) {
    // If Stripe SDK is configured with valid secret key
    if (stripe) {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: feeCurrency.toLowerCase(),
              product_data: {
                name: `Location Unlock: ${property.title}`,
                description: `Unlock exact GPS coordinates, cadastral plot info, and street directions for listing ID: ${property.id}`
              },
              unit_amount: Math.round(Number(feeAmount) * 100)
            },
            quantity: 1
          }
        ],
        mode: 'payment',
        success_url: env.STRIPE.SUCCESS_URL.replace('{PROPERTY_ID}', property.id),
        cancel_url: env.STRIPE.CANCEL_URL.replace('{PROPERTY_ID}', property.id),
        customer_email: user.email,
        metadata: {
          userId: user.id,
          propertyId: property.id,
          purpose: 'LOCATION_UNLOCK',
          amount: String(feeAmount),
          currency: feeCurrency
        }
      });

      return {
        sessionId: session.id,
        checkoutUrl: session.url,
        isSandbox: false
      };
    }

    // Standalone Sandbox Simulator Mode (When user has not provided live Stripe keys yet)
    const simulatedSessionId = `cs_sandbox_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      sessionId: simulatedSessionId,
      checkoutUrl: `${env.APP_URL}/#/property-detail?id=${property.id}&simulated_gateway=true&session_id=${simulatedSessionId}`,
      isSandbox: true
    };
  }

  static async createSubscriptionCheckoutSession({ user, subscription, payment, quote }) {
    if (!stripe) {
      throw ApiError.badRequest('Paid subscriptions are unavailable until Stripe is configured.');
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: quote.currency.toLowerCase(),
            product_data: {
              name: `Shelter ${subscription.durationMonths}-month subscription`,
              description: `Paid property listing plan for ${quote.durationDisplay}`
            },
            unit_amount: Math.round(quote.totalAmount * 100)
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${env.APP_URL}/?page=subscription&payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.APP_URL}/?page=subscription&payment=cancelled`,
      customer_email: user.email,
      metadata: {
        purpose: 'SUBSCRIPTION',
        userId: user.id,
        subscriptionId: subscription.id,
        subscriptionPaymentId: payment.id
      }
    });

    if (!session.url) {
      throw ApiError.badRequest('Stripe did not return a checkout URL.');
    }
    return { sessionId: session.id, checkoutUrl: session.url };
  }

  static async getSubscriptionCheckoutSession(sessionId) {
    if (!stripe) throw ApiError.badRequest('Paid subscriptions are unavailable until Stripe is configured.');
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return {
      status: session.status,
      paymentStatus: session.payment_status,
      checkoutUrl: session.status === 'open' ? session.url : null
    };
  }

  static async handleWebhookEvent(payload, signature) {
    if (!stripe) {
      throw ApiError.badRequest('Stripe is not configured on this server');
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, env.STRIPE.WEBHOOK_SECRET);
    } catch (err) {
      throw ApiError.badRequest(`Webhook Signature Verification Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      const session = event.data.object;
      const { userId, propertyId, purpose } = session.metadata || {};

      if (purpose === 'SUBSCRIPTION') {
        const { SubscriptionService } = await import('../subscriptions/subscription.service.js');
        await SubscriptionService.activatePaidSubscription(session);
      }

      if (purpose === 'LOCATION_UNLOCK' && userId && propertyId) {
        // Record payment as verified
        const payment = await prisma.payment.upsert({
          where: { gatewaySessionId: session.id },
          update: {
            status: 'VERIFIED',
            gatewayReference: session.payment_intent || session.id,
            verifiedAt: new Date(),
            auditNotes: 'Automated Stripe Webhook confirmation'
          },
          create: {
            userId,
            propertyId,
            paymentMethod: 'GATEWAY_STRIPE',
            amount: Number(session.amount_total) / 100,
            currency: (session.currency || 'USD').toUpperCase(),
            status: 'VERIFIED',
            purpose: 'LOCATION_UNLOCK',
            gatewaySessionId: session.id,
            gatewayReference: session.payment_intent || session.id,
            verifiedAt: new Date(),
            auditNotes: 'Automated Stripe Webhook confirmation'
          }
        });

        // Grant location unlock
        await prisma.locationUnlock.upsert({
          where: {
            userId_propertyId: { userId, propertyId }
          },
          update: {
            paymentId: payment.id,
            unlockedAt: new Date()
          },
          create: {
            userId,
            propertyId,
            paymentId: payment.id,
            unlockMethod: 'GATEWAY_STRIPE',
            unlockedAt: new Date()
          }
        });
      }
    }

    if (
      event.type === 'checkout.session.expired' ||
      event.type === 'checkout.session.async_payment_failed'
    ) {
      const { SubscriptionService } = await import('../subscriptions/subscription.service.js');
      await SubscriptionService.failCheckoutSession(
        event.data.object.id,
        event.type === 'checkout.session.expired' ? 'EXPIRED' : 'FAILED'
      );
    }

    return { received: true };
  }
}
