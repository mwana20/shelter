import { z } from 'zod';

export const createPropertySchema = z.object({
  title: z.string().trim().min(5).max(200),
  description: z.string().trim().min(20).max(5000),
  propertyType: z.string().trim().min(2),
  listingType: z.enum(['SALE', 'RENT', 'LEASE']),
  price: z.number().positive(),
  currency: z.string().default('USD'),
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().nonnegative().optional(),
  landSizeSqFt: z.number().positive().optional(),
  builtYear: z.number().int().min(1800).max(new Date().getFullYear() + 5).optional(),

  // Approximate public location
  country: z.string().trim().min(2),
  region: z.string().trim().min(2),
  district: z.string().trim().min(2),
  neighborhood: z.string().trim().optional(),

  // Confidential exact location
  exactAddress: z.string().trim().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  directionsGuide: z.string().trim().optional(),
  cadastralPlotNumber: z.string().trim().optional()
});

export const updatePropertySchema = createPropertySchema.partial();
