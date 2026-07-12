import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  name: z.string().min(1, 'Name is required'),
  tenantName: z.string().min(1, 'Tenant name is required for new tenant registration').optional(),
  tenantId: z.string().uuid('Invalid tenant ID').optional(),
});

export const bootstrapAdminSchema = z.object({
  secretKey: z.string().min(1, 'Bootstrap secret key is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  name: z.string().min(1, 'Name is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type BootstrapAdminInput = z.infer<typeof bootstrapAdminSchema>;
