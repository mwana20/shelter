import { z } from 'zod';

export const unlockPropertyParamSchema = z.object({
  propertyId: z.string().uuid({ message: 'Valid property UUID is required' })
});
