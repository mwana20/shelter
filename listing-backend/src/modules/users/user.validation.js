import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().optional(),
  country: z.string().trim().optional(),
  region: z.string().trim().max(120).optional(),
  district: z.string().trim().max(120).optional(),
  neighborhood: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(2000).optional(),
  companyName: z.string().trim().optional(),
  agencyLicense: z.string().trim().optional(),
  avatarUrl: z.string().url().optional()
});
