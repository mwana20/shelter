import { z } from 'zod';

const uuidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
const applicationIdPattern = /^(?=.*\d)[A-Za-z]+(?:[-_][A-Za-z0-9]+)+$/;

export const stringIdSchema = z
  .string()
  .trim()
  .min(1, { message: 'Identifier is required' })
  .refine((value) => uuidPattern.test(value) || applicationIdPattern.test(value), {
    message: 'Identifier must be a valid UUID or an application ID such as prop-mbale-1'
  });

export const uuidParamSchema = z.object({
  id: stringIdSchema
});

export const paginationQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('12'),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().optional(),
  status: z.string().optional()
});
