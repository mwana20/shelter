import { Router } from 'express';
import { InAppNotificationController } from './inapp.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { validate } from '../../middlewares/validate.js';
import { uuidParamSchema, paginationQuerySchema } from '../../validators/common.schema.js';

const router = Router();
router.use(authenticate);

router.get('/', validate({ query: paginationQuerySchema }), InAppNotificationController.list);
router.get('/unread-count', InAppNotificationController.unreadCount);
router.put('/:id/read', validate({ params: uuidParamSchema }), InAppNotificationController.markRead);
router.put('/read-all', InAppNotificationController.markAllRead);

export default router;