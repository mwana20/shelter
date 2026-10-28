import { Router } from 'express';
import { MediaController } from './media.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { validate } from '../../middlewares/validate.js';
import { presignedUrlSchema, confirmMediaSchema } from './media.validation.js';
import { uuidParamSchema } from '../../validators/common.schema.js';

const router = Router();

router.use(authenticate);

router.post('/presigned-url', validate({ body: presignedUrlSchema }), MediaController.getPresignedUploadUrl);
router.post('/property/:propertyId/confirm', validate({ body: confirmMediaSchema }), MediaController.confirmUpload);
router.delete('/:id', validate({ params: uuidParamSchema }), MediaController.deleteMedia);

export default router;
