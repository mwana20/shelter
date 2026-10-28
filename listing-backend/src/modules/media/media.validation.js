import { z } from 'zod';

export const presignedUrlSchema = z.object({
  propertyId: z.string().uuid(),
  fileName: z.string().min(1),
  fileType: z.string().regex(/^image\/(jpeg|png|webp|avif)$/, {
    message: 'Only JPEG, PNG, WebP, and AVIF images are supported'
  })
});

export const confirmMediaSchema = z.object({
  storageKey: z.string().min(1),
  publicUrl: z.string().url(),
  mimeType: z.string().optional(),
  fileSize: z.number().int().positive().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
  isFeatured: z.boolean().optional()
});
