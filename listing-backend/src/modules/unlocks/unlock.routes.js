import { Router } from 'express';
import { UnlockController } from './unlock.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { validate } from '../../middlewares/validate.js';
import { unlockPropertyParamSchema } from './unlock.validation.js';

const router = Router();

router.use(authenticate);

router.get('/my-unlocked', UnlockController.listMyUnlockedProperties);
router.get('/:propertyId', validate({ params: unlockPropertyParamSchema }), UnlockController.getUnlockedLocation);

export default router;
