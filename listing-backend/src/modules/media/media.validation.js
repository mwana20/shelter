import { z } from 'zod';
import { stringIdSchema } from '../../validators/common.schema.js';

const imageMimeType = z.enum(['image/jpeg', 'image/png', 'image/webp']);
const thumbnailMimeType = z.enum(['image/jpeg', 'image/webp']);
const uploadFileSchema = z.object({
  clientId: z.string().regex(/^[a-z0-9-]{1,32}$/),
  kind: z.enum(['IMAGE', 'VIDEO']),
  mimeType: z.string().min(1),
  fileSize: z.number().int().positive(),
  thumbnail: z.object({
    mimeType: thumbnailMimeType,
    fileSize: z.number().int().positive()
  }).optional()
}).superRefine((file, context) => {
  if (file.kind === 'IMAGE') {
    if (!imageMimeType.safeParse(file.mimeType).success) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['mimeType'], message: 'Images must be JPEG, PNG, or WebP.' });
    }
    if (!file.thumbnail) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['thumbnail'], message: 'An optimized image thumbnail is required.' });
    }
  } else {
    if (file.mimeType !== 'video/mp4') {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['mimeType'], message: 'Videos must be MP4.' });
    }
    if (file.thumbnail && !thumbnailMimeType.safeParse(file.thumbnail.mimeType).success) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['thumbnail', 'mimeType'], message: 'Video posters must be JPEG or WebP.' });
    }
  }
});

const exactMediaSet = (files, context) => {
  const imageCount = files.filter((file) => file.kind === 'IMAGE').length;
  const videoCount = files.filter((file) => file.kind === 'VIDEO').length;
  if (imageCount !== 4 || videoCount !== 1) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'A property requires exactly four images and one MP4 video.' });
  }
  if (new Set(files.map((file) => file.clientId)).size !== files.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'Upload identifiers must be unique.' });
  }
};

export const presignedUrlSchema = z.object({
  propertyId: stringIdSchema.optional(),
  files: z.array(uploadFileSchema).length(5)
}).superRefine((payload, context) => exactMediaSet(payload.files, context));

export const refreshUploadSchema = z.object({
  clientIds: z.array(z.string().regex(/^[a-z0-9-]{1,32}$/)).min(1).max(5)
});

export const uploadBatchParamsSchema = z.object({ batchId: z.string().uuid() });

export const mediaRefsSchema = z.array(z.object({
  clientId: z.string().regex(/^[a-z0-9-]{1,32}$/),
  kind: z.enum(['IMAGE', 'VIDEO']),
  storageKey: z.string().min(1).max(512),
  thumbnailStorageKey: z.string().min(1).max(512).optional()
})).length(5).superRefine((files, context) => exactMediaSet(files, context));
