import { z } from 'zod';

export const customerSchema = z.object({
  full_name: z.string().min(1, 'Name is required').max(100),
  mobile: z.string().regex(/^\+?[0-9\s\-()]{10,20}$/, 'Invalid phone number').or(z.string().length(0)).nullable().optional(),
  whatsapp: z.string().regex(/^\+?[0-9\s\-()]{10,20}$/, 'Invalid phone number').or(z.string().length(0)).nullable().optional(),
  email: z.string().email('Invalid email address').or(z.string().length(0)).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  state: z.string().max(100).nullable().optional(),
  pincode: z.string().regex(/^[0-9]{6}$/, 'Must be a 6-digit Indian pincode').or(z.string().length(0)).nullable().optional(),
  preferred_contact: z.enum(['phone', 'whatsapp', 'email']).optional(),
  relationship: z.enum([
    'homeowner', 'family_member', 'builder', 'developer',
    'interior_designer', 'architect', 'contractor', 'consultant', 'other'
  ]).optional(),
});

export type CustomerInput = z.infer<typeof customerSchema>;
