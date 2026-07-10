import { z } from 'zod';

export const roomSchema = z.object({
  name: z.string().min(1, 'Room name is required').max(100),
  room_type: z.string().min(1, 'Room type is required'),
  floor_id: z.string().uuid().nullable().optional(),
  sort_order: z.number().int().default(0),
  is_optional: z.boolean().default(false),
  metadata: z.record(z.string(), z.any()).default({}),
});

export type RoomInput = z.infer<typeof roomSchema>;
