import { z } from 'zod';
import { stringIdSchema } from '../../validators/common.schema.js';

export const unlockPropertyParamSchema = z.object({
  propertyId: stringIdSchema
});
