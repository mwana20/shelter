import { z } from 'zod';
import { stringIdSchema } from '../../validators/common.schema.js';

export const subscriptionQuoteSchema = z.object({
  months: z.coerce.number().int().min(1).max(48)
});

export const selectSubscriptionSchema = z.object({
  plan: z.enum(['FREE', 'PAID']),
  durationMonths: z.number().int().min(1).max(48).optional()
}).superRefine((data, context) => {
  if (data.plan === 'PAID' && data.durationMonths === undefined) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['durationMonths'],
      message: 'Select a whole-month duration from 1 to 48.'
    });
  }
});

export const subscriptionMapUnlockSchema = z.object({
  propertyId: stringIdSchema
});
