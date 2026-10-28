import { Router } from 'express';
import express from 'express';
import { PaymentController } from './payment.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { validate } from '../../middlewares/validate.js';
import {
  createGatewaySessionSchema,
  submitMerchantTransactionSchema,
  checkPaymentStatusSchema
} from '../../validators/payment.schema.js';
import { paginationQuerySchema, uuidParamSchema } from '../../validators/common.schema.js';

const router = Router();

// Stripe Webhook (Raw body)
router.post(
  '/webhook/stripe',
  express.raw({ type: 'application/json' }),
  PaymentController.handleStripeWebhook
);

// Protected routes (Require login)
router.use(authenticate);

router.post(
  '/location-unlock/gateway-session',
  validate({ body: createGatewaySessionSchema }),
  PaymentController.createGatewaySession
);

router.post(
  '/location-unlock/verify-gateway',
  PaymentController.verifyGatewayPayment
);

router.post(
  '/location-unlock/submit-transaction',
  validate({ body: submitMerchantTransactionSchema }),
  PaymentController.submitMerchantTransaction
);

router.get(
  '/location-unlock/status/:id',
  validate({ params: uuidParamSchema }),
  PaymentController.getPaymentStatus
);

router.get(
  '/my-payments',
  validate({ query: paginationQuerySchema }),
  PaymentController.getMyPayments
);

export default router;
