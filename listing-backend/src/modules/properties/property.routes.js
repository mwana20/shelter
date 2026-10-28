import { Router } from 'express';
import { PropertyController } from './property.controller.js';
import { optionalAuthenticate, authenticate } from '../../middlewares/authenticate.js';
import { validate } from '../../middlewares/validate.js';
import {
  createPropertySchema,
  updatePropertySchema
} from '../../validators/property.schema.js';
import { uuidParamSchema } from '../../validators/common.schema.js';

const router = Router();

// Public / Authenticated read routes (uses optionalAuthenticate so logged-in users get their unlocked coordinates)
router.get('/', optionalAuthenticate, PropertyController.listProperties);
router.get('/id/:id', optionalAuthenticate, validate({ params: uuidParamSchema }), PropertyController.getPropertyById);
router.get('/:slug', optionalAuthenticate, PropertyController.getPropertyBySlug);

// Authenticated write routes
router.post('/', authenticate, validate({ body: createPropertySchema }), PropertyController.createProperty);
router.put('/:id', authenticate, validate({ params: uuidParamSchema, body: updatePropertySchema }), PropertyController.updateProperty);
router.delete('/:id', authenticate, validate({ params: uuidParamSchema }), PropertyController.deleteProperty);

export default router;
