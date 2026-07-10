import { z } from 'zod';

export const propertySchema = z.object({
  property_type: z.string().min(1, 'Property type is required'),
  num_floors: z.number().int().min(1).max(10),
  built_up_area: z.number().positive('Area must be positive').nullable().optional(),
  num_bedrooms: z.number().int().min(0).max(20),
  num_bathrooms: z.number().int().min(0).max(20),
  num_balconies: z.number().int().min(0).max(20),
  num_kitchens: z.number().int().min(1).max(5),
  num_parking: z.number().int().min(0).max(20),
  num_outdoor: z.number().int().min(0).max(20),
  project_status: z.string().nullable().optional(),
  automation_type: z.string().nullable().optional(),
  wiring_complete: z.boolean().nullable().optional(),
  electrical_layout_available: z.boolean().nullable().optional(),
  floor_plan_available: z.boolean().nullable().optional(),
  interior_layout_available: z.boolean().nullable().optional(),
  architect_involved: z.boolean().nullable().optional(),
  interior_designer_involved: z.boolean().nullable().optional(),
  electrician_assigned: z.boolean().nullable().optional(),
});

export type PropertyInput = z.infer<typeof propertySchema>;
