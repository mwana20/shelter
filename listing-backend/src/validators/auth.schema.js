import { z } from 'zod';
import { calculateAge } from '../utils/age.js';

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, { message: 'Full name is required (minimum 2 characters)' })
    .max(100, { message: 'Full name cannot exceed 100 characters' }),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: 'Please enter a valid email address' }),

  phone: z.string().trim().optional(),

  dateOfBirth: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Valid date of birth is required' })
    .refine(
      (val) => {
        try {
          return calculateAge(val) >= 18;
        } catch {
          return false;
        }
      },
      { message: 'You must be at least 18 years old to create an account.' }
    ),

  country: z.string().trim().optional(),
  region: z.string().trim().max(120).optional(),
  district: z.string().trim().max(120).optional(),
  neighborhood: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(2000).optional(),

  role: z.enum(['BUYER', 'SELLER', 'AGENT']).optional().default('BUYER'),

  companyName: z.string().trim().optional(),
  agencyLicense: z.string().trim().optional(),

  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' }),

  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password and confirm-password fields must match',
  path: ['confirmPassword']
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email({ message: 'Valid email is required' }),
  password: z.string().min(1, { message: 'Password is required' })
});

export const verifyEmailSchema = z.object({
  token: z.string().trim().optional(),
  code: z.string().trim().length(6, { message: 'Security code must be exactly 6 digits' }).optional(),
  email: z.string().trim().toLowerCase().email().optional()
}).refine((data) => data.token || (data.code && data.email), {
  message: 'Either verification token or email with 6-digit code is required'
});

export const resendVerificationSchema = z.object({
  email: z.string().trim().toLowerCase().email({ message: 'Valid email is required' })
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email({ message: 'Valid email is required' })
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, { message: 'Reset token is required' }),
  newPassword: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' }),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'New password and confirm new password fields must match',
  path: ['confirmPassword']
});
