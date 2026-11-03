import { z } from 'zod';
import { stringIdSchema } from './common.schema.js';

export const createGatewaySessionSchema = z.object({
  propertyId: stringIdSchema
});

export const submitMerchantTransactionSchema = z.object({
  propertyId: stringIdSchema,
  transactionId: z
    .string()
    .trim()
    .min(6, { message: 'Transaction ID must be at least 6 characters long' })
    .max(30, { message: 'Transaction ID cannot exceed 30 characters' })
    .regex(/^[A-Za-z0-9_-]+$/, {
      message: 'Transaction ID can only contain letters, numbers, hyphens, and underscores'
    })
});

export const checkPaymentStatusSchema = z.object({
  id: stringIdSchema
});
