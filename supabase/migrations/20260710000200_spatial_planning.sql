-- Spatial room planning for the visual configurator.

ALTER TABLE public.room_layouts
  DROP CONSTRAINT IF EXISTS room_layouts_layout_type_check;

ALTER TABLE public.room_layouts
  ADD CONSTRAINT room_layouts_layout_type_check
  CHECK (layout_type IN ('2d', '3d', 'photo_annotation'));

ALTER TABLE public.room_layouts
  ADD COLUMN IF NOT EXISTS width_m NUMERIC(6,2) NOT NULL DEFAULT 4 CHECK (width_m > 0),
  ADD COLUMN IF NOT EXISTS length_m NUMERIC(6,2) NOT NULL DEFAULT 4 CHECK (length_m > 0),
  ADD COLUMN IF NOT EXISTS height_m NUMERIC(6,2) NOT NULL DEFAULT 3 CHECK (height_m > 0),
  ADD COLUMN IF NOT EXISTS shape JSONB NOT NULL DEFAULT '{"type":"rectangle"}',
  ADD COLUMN IF NOT EXISTS openings JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS furniture JSONB NOT NULL DEFAULT '[]';

UPDATE public.room_layouts
SET
  width_m = COALESCE((dimensions->>'width_m')::NUMERIC, width_m),
  length_m = COALESCE((dimensions->>'length_m')::NUMERIC, length_m),
  height_m = COALESCE((dimensions->>'height_m')::NUMERIC, height_m)
WHERE dimensions IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_room_layouts_room_id_unique ON public.room_layouts(room_id);

CREATE TABLE IF NOT EXISTS public.device_placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_device_id UUID NOT NULL UNIQUE REFERENCES public.project_devices(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  wall_id TEXT,
  position JSONB NOT NULL DEFAULT '{"x":0,"y":0,"z":0}',
  rotation JSONB NOT NULL DEFAULT '{"x":0,"y":0,"z":0}',
  mounting_height_m NUMERIC(6,2) NOT NULL DEFAULT 0,
  placement_type TEXT NOT NULL CHECK (placement_type IN ('wall', 'ceiling', 'floor', 'corner', 'surface')),
  coverage JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_device_placements_room_id ON public.device_placements(room_id);
CREATE INDEX IF NOT EXISTS idx_device_placements_project_device_id ON public.device_placements(project_device_id);

ALTER TABLE public.device_placements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own device placements" ON public.device_placements FOR ALL
  USING (
    room_id IN (
      SELECT id FROM public.rooms WHERE project_id IN (
        SELECT id FROM public.projects WHERE created_by = auth.uid()
        OR customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
      )
    )
  )
  WITH CHECK (
    room_id IN (
      SELECT id FROM public.rooms WHERE project_id IN (
        SELECT id FROM public.projects WHERE created_by = auth.uid()
        OR customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
      )
    )
  );

INSERT INTO public.device_types (category_id, name, display_name, icon, sort_order)
SELECT id, 'router', 'WiFi Router', 'Router', 1
FROM public.device_categories
WHERE name = 'infrastructure'
  AND NOT EXISTS (SELECT 1 FROM public.device_types WHERE name = 'router');
