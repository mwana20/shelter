import { z } from 'zod';

export const uuidParamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid UUID format' })
});

export const paginationQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('12'),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().optional(),
  status: z.string().optional()
});
