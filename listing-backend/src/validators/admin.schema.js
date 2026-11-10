import { z } from 'zod';
import { stringIdSchema } from './common.schema.js';

export const updateLockSettingsSchema = z.object({
  enabledGlobally: z.boolean().optional(),
  unlockFeeAmount: z.number().positive().optional(),
  unlockFeeCurrency: z.string().length(3).optional(),
  gatewayEnabled: z.boolean().optional(),
  merchantCodeEnabled: z.boolean().optional(),
  merchantCode: z.string().trim().min(2).optional(),
  merchantName: z.string().trim().min(2).optional(),
  paymentInstructions: z.string().trim().min(10).optional(),
  supportedChannels: z.array(z.string()).optional(),
  txIdMinLength: z.number().int().min(4).max(20).optional(),
  txIdMaxLength: z.number().int().min(10).max(60).optional(),
  txIdRegexPattern: z.string().min(1).optional(),
  verificationMode: z.enum(['AUTOMATIC', 'MANUAL_ADMIN_REVIEW']).optional()
});

export const updatePropertyLockOverrideSchema = z.object({
  propertyId: stringIdSchema,
  isLocked: z.boolean(),
  customFee: z.number().positive().optional(),
  reason: z.string().trim().optional()
});

export const reviewPaymentSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  rejectionReason: z.string().trim().min(5, {
    message: 'A clear rejection reason of at least 5 characters is mandatory when rejecting a payment'
  }).optional()
}).refine((data) => data.action !== 'REJECT' || !!data.rejectionReason, {
  message: 'Rejection reason is required when rejecting a payment',
  path: ['rejectionReason']
});

export const manualUnlockSchema = z.object({
  propertyId: stringIdSchema,
  userEmail: z.string().trim().toLowerCase().email({ message: 'Valid recipient email is required' }),
  reason: z.string().trim().min(8, {
    message: 'An audit reason of at least 8 characters is mandatory for administrative manual unlock'
  })
});

export const propertyReviewSchema = z.object({
  notes: z.string().trim().min(5).max(2000).optional()
});

export const propertyCorrectionSchema = z.object({
  notes: z.string().trim().min(5).max(2000)
});

const subscriptionDiscountSchema = z.object({
  minMonths: z.number().int().min(1).max(48),
  maxMonths: z.number().int().min(1).max(48),
  discountPercent: z.number().min(0).max(100)
}).refine((discount) => discount.minMonths <= discount.maxMonths, {
  message: 'Discount duration range is invalid.',
  path: ['maxMonths']
});

export const subscriptionConfigSchema = z.object({
  baseMonthlyPrice: z.number().min(0),
  currency: z.string().trim().length(3).transform((value) => value.toUpperCase()),
  freeValidityDays: z.number().int().min(1).max(3650),
  freeListingLimit: z.number().int().min(0).max(1),
  freeMapUnlockLimit: z.number().int().min(0).max(1),
  paidListingLimit: z.number().int().min(0).max(100000),
  paidMapUnlockLimit: z.number().int().min(0).max(100000),
  discounts: z.array(subscriptionDiscountSchema).min(1)
}).superRefine((config, context) => {
  const sorted = [...config.discounts].sort((a, b) => a.minMonths - b.minMonths);
  for (let index = 1; index < sorted.length; index += 1) {
    if (sorted[index].minMonths <= sorted[index - 1].maxMonths) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['discounts', index],
        message: 'Discount duration ranges cannot overlap.'
      });
    }
    if (sorted[index].discountPercent < sorted[index - 1].discountPercent) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['discounts', index, 'discountPercent'],
        message: 'Longer subscription tiers cannot have a lower discount.'
      });
    }
  }
});

export const manualSubscriptionGrantSchema = z.object({
  plan: z.enum(['FREE', 'PAID']),
  durationMonths: z.number().int().min(1).max(48).optional(),
  reason: z.string().trim().min(8).max(2000)
}).superRefine((data, context) => {
  if (data.plan === 'PAID' && data.durationMonths === undefined) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['durationMonths'],
      message: 'Paid manual grants require a duration from 1 to 48 months.'
    });
  }
});

export const revokeSubscriptionSchema = z.object({
  reason: z.string().trim().min(8).max(2000)
});
