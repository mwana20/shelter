import { Router } from 'express';
import { SubscriptionController } from './subscription.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { validate } from '../../middlewares/validate.js';
import {
  selectSubscriptionSchema,
  subscriptionMapUnlockSchema,
  subscriptionQuoteSchema
} from './subscription.validation.js';

const router = Router();

router.get('/plans', SubscriptionController.getPlans);
router.get('/quote', validate({ query: subscriptionQuoteSchema }), SubscriptionController.getQuote);
router.get('/me', authenticate, SubscriptionController.getMine);
router.post('/select', authenticate, validate({ body: selectSubscriptionSchema }), SubscriptionController.selectPlan);
router.post('/map-unlocks', authenticate, validate({ body: subscriptionMapUnlockSchema }), SubscriptionController.unlockMap);

export default router;
