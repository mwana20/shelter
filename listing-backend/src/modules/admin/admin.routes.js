import { Router } from 'express';
import { AdminController } from './admin.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { requireAdmin } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import {
  updateLockSettingsSchema,
  updatePropertyLockOverrideSchema,
  reviewPaymentSchema,
  manualUnlockSchema,
  propertyReviewSchema,
  propertyCorrectionSchema,
  subscriptionConfigSchema,
  manualSubscriptionGrantSchema,
  revokeSubscriptionSchema
} from './admin.validation.js';
import { uuidParamSchema, paginationQuerySchema } from '../../validators/common.schema.js';

const router = Router();

// Protect ALL admin routes with authenticate + requireAdmin
router.use(authenticate, requireAdmin);

// Location lock & payment configuration
router.get('/payment-settings', AdminController.getPaymentSettings);
router.put('/payment-settings', validate({ body: updateLockSettingsSchema }), AdminController.updatePaymentSettings);
router.post('/property-lock-override', validate({ body: updatePropertyLockOverrideSchema }), AdminController.updatePropertyLockOverride);

// Payments ledger & verification review
router.get('/payments', validate({ query: paginationQuerySchema }), AdminController.listAllPayments);
router.put('/payments/:id', validate({ params: uuidParamSchema, body: reviewPaymentSchema }), AdminController.reviewPayment);

// Owner approval
router.get('/owners', validate({ query: paginationQuerySchema }), AdminController.listPendingOwners);
router.put('/owners/:id/approve', validate({ params: uuidParamSchema }), AdminController.approveOwner);
router.put('/owners/:id/reject', validate({ params: uuidParamSchema }), AdminController.rejectOwner);

// Manual support unlock with audit logging
router.post('/payments/manual-unlock', validate({ body: manualUnlockSchema }), AdminController.manualUnlock);
// Property approval
router.get('/properties', validate({ query: paginationQuerySchema }), AdminController.listPendingProperties);
router.put('/properties/:id/approve', validate({ params: uuidParamSchema, body: propertyReviewSchema }), AdminController.approveProperty);
router.put('/properties/:id/reject', validate({ params: uuidParamSchema, body: propertyCorrectionSchema }), AdminController.rejectProperty);
router.put('/properties/:id/request-corrections', validate({ params: uuidParamSchema, body: propertyCorrectionSchema }), AdminController.requestPropertyCorrections);

// Subscription pricing, membership management and payment history
router.get('/subscriptions/config', AdminController.getSubscriptionConfig);
router.put('/subscriptions/config', validate({ body: subscriptionConfigSchema }), AdminController.updateSubscriptionConfig);
router.get('/subscriptions', validate({ query: paginationQuerySchema }), AdminController.listSubscriptions);
router.get('/subscriptions/users', validate({ query: paginationQuerySchema }), AdminController.listSubscriptionUsers);
router.post('/subscriptions/users/:id/grant', validate({ params: uuidParamSchema, body: manualSubscriptionGrantSchema }), AdminController.grantSubscription);
router.put('/subscriptions/:id/revoke', validate({ params: uuidParamSchema, body: revokeSubscriptionSchema }), AdminController.revokeSubscription);

export default router;
