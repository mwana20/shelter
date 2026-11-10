import { Router } from 'express';
import { MediaController } from './media.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { presignedUrlSchema, refreshUploadSchema, uploadBatchParamsSchema } from './media.validation.js';
import { uuidParamSchema } from '../../validators/common.schema.js';

const router = Router();

router.get('/limits', MediaController.getUploadLimits);
router.post('/presigned-url', authenticate, authorize('SELLER', 'AGENT'), validate({ body: presignedUrlSchema }), MediaController.getPresignedUploadUrls);
router.post('/presigned-url/:batchId/refresh', authenticate, authorize('SELLER', 'AGENT'), validate({ params: uploadBatchParamsSchema, body: refreshUploadSchema }), MediaController.refreshPresignedUploadUrls);
router.delete('/:id', authenticate, authorize('SELLER', 'AGENT', 'ADMIN'), validate({ params: uuidParamSchema }), MediaController.deleteMedia);

export default router;
