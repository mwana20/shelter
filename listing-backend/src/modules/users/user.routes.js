import { Router } from 'express';
import { UserController } from './user.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { requireAdmin } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { updateProfileSchema } from './user.validation.js';
import { uuidParamSchema, paginationQuerySchema } from '../../validators/common.schema.js';

const router = Router();

router.use(authenticate);

router.get('/profile', UserController.getProfile);
router.patch('/profile', validate({ body: updateProfileSchema }), UserController.updateProfile);

// Admin-only endpoints
router.get('/', requireAdmin, validate({ query: paginationQuerySchema }), UserController.listUsers);
router.get('/:id', requireAdmin, validate({ params: uuidParamSchema }), UserController.getUserById);

export default router;
