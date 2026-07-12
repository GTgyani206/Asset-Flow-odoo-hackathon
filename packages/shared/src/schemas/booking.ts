import { z } from 'zod';

export const createBookingSchema = z.object({
  resourceId: z.string().uuid('Invalid resource ID'),
  startTime: z.string().datetime({ message: 'Invalid start time (must be UTC ISO string)' }),
  endTime: z.string().datetime({ message: 'Invalid end time (must be UTC ISO string)' }),
}).refine((data) => new Date(data.startTime) < new Date(data.endTime), {
  message: 'Start time must be before end time',
  path: ['endTime'],
});

export const createAllocationSchema = z.object({
  assetId: z.string().uuid('Invalid asset ID'),
  employeeId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
}).refine((data) => data.employeeId || data.departmentId, {
  message: 'Allocation must be assigned to either an employee or a department',
  path: ['employeeId'],
}).refine((data) => !(data.employeeId && data.departmentId), {
  message: 'Allocation cannot be assigned to both an employee and a department simultaneously',
  path: ['employeeId'],
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CreateAllocationInput = z.infer<typeof createAllocationSchema>;
