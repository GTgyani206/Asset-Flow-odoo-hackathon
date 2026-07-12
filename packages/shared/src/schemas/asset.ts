import { z } from 'zod';

export const assetStateSchema = z.enum([
  'AVAILABLE',
  'ALLOCATED',
  'RESERVED',
  'UNDER_MAINTENANCE',
  'LOST',
  'RETIRED',
  'DISPOSED',
]);

export const createAssetSchema = z.object({
  name: z.string().min(1, 'Asset name is required'),
  serialNumber: z.string().nullish(),
  categoryId: z.string().uuid('Invalid category ID'),
  locationId: z.string().uuid('Invalid location ID'),
  status: assetStateSchema.default('AVAILABLE'),
});

export const updateAssetSchema = z.object({
  name: z.string().min(1).optional(),
  serialNumber: z.string().nullish(),
  categoryId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  status: assetStateSchema.optional(),
  version: z.number().int('Version must be an integer'), // For optimistic concurrency control
});

export type AssetState = z.infer<typeof assetStateSchema>;
export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;
