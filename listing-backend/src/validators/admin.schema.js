import { z } from 'zod';

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
  propertyId: z.string().uuid(),
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
  propertyId: z.string().uuid({ message: 'Valid property UUID is required' }),
  userEmail: z.string().trim().toLowerCase().email({ message: 'Valid recipient email is required' }),
  reason: z.string().trim().min(8, {
    message: 'An audit reason of at least 8 characters is mandatory for administrative manual unlock'
  })
});
