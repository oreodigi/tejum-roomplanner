import { z } from 'zod';

export const switchboardSchema = z.object({
  room_id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(100),
  board_number: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  num_modules: z.number().int().min(1).max(24).nullable().optional(),
  is_existing: z.boolean().default(false),
  num_switches: z.number().int().nonnegative().default(0),
  num_sockets: z.number().int().nonnegative().default(0),
  num_fan_regulators: z.number().int().nonnegative().default(0),
  num_dimmers: z.number().int().nonnegative().default(0),
  num_heavy_load: z.number().int().nonnegative().default(0),
  num_usb: z.number().int().nonnegative().default(0),
  num_two_way: z.number().int().nonnegative().default(0),
  neutral_available: z.boolean().nullable().optional(),
  depth_available: z.boolean().nullable().optional(),
  existing_brand: z.string().nullable().optional(),
  photo_url: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  sort_order: z.number().int().default(0),
});

export type SwitchboardInput = z.infer<typeof switchboardSchema>;
