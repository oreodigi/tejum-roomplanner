import { z } from 'zod';

export const projectDeviceSchema = z.object({
  room_id: z.string().uuid(),
  device_type_id: z.string().uuid(),
  quantity: z.number().int().min(1).max(100).default(1),
  is_existing: z.boolean().default(false),
  smart_automation: z.boolean().default(true),
  dimming_required: z.boolean().default(false),
  speed_control_required: z.boolean().default(false),
  scheduling_required: z.boolean().default(false),
  remote_control: z.boolean().default(true),
  voice_control: z.boolean().default(false),
  sensor_automation: z.boolean().default(false),
  ai_automation: z.boolean().default(false),
  config: z.record(z.string(), z.any()).default({}),
  notes: z.string().nullable().optional(),
  status: z.enum(['customer_confirmed', 'system_recommended', 'consultant_confirmed', 'survey_verified']).default('customer_confirmed'),
});

export type ProjectDeviceInput = z.infer<typeof projectDeviceSchema>;
