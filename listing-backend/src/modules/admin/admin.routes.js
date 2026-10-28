import { Router } from 'express';
import { AdminController } from './admin.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { requireAdmin } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import {
  updateLockSettingsSchema,
  updatePropertyLockOverrideSchema,
  reviewPaymentSchema,
  manualUnlockSchema
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

// Manual support unlock with audit logging
router.post('/payments/manual-unlock', validate({ body: manualUnlockSchema }), AdminController.manualUnlock);

export default router;
