# Visual Planner Architecture

## Entry Point

`/planner/new` renders `VisualPlannerApp`. The route is public in the Next.js proxy. Other planner project routes remain authenticated.

## State

`useVisualPlannerStore` persists the guest draft under `tejum-visual-planner-v1`. It owns package, property, generated rooms, layouts, device placements, contact draft, active room, and conversion state.

The existing authenticated `usePlannerStore` is preserved for legacy project pages.

## Room Generation

`generateRoomsForProperty` now builds all maps from effective floor and room counts. It distributes bedrooms, bathrooms, balconies, passages, and stairs across floors and adds requested parking/outdoor spaces.

## Recommendations And Estimate

`visual-planner.ts` contains device definitions and room presets mapped to real `device_types.name` values. `visual-estimate-engine.ts` calculates low/high hardware, installation, and integration amounts from placed devices.

## Visualizer

Desktop loads `RoomCanvas3D` dynamically with SSR disabled. The scene uses lightweight geometry only:

- floor and three walls
- optional ceiling
- orbit camera controls
- simple device geometry
- selected-device indicator
- camera, motion, and network coverage geometry
- editable placement coordinates and room dimensions

Mobile uses `RoomMiniMap`, an interactive SVG top view. Taps are translated into room coordinates and use the device mounting rules for Y position.

## Persistence

`POST /api/planner/guest` validates the complete draft with Zod and uses a server-only Supabase service client. It maps each visual placement to one `project_devices` row, then links `device_placements.project_device_id` to preserve BOQ/estimate compatibility.

If persistence fails midway, the endpoint removes the partially created project, lead, and customer.

## Themes

`next-themes` applies a `light` or `dark` class to the root. Tailwind color utilities resolve through runtime CSS tokens, so old and new screens share the same theme contract. Theme preference follows the system initially and persists after user selection.

## Known MVP Boundaries

- Rooms are rectangular; irregular polygons are stored but not edited visually.
- Furniture and opening types are represented in the data model but do not yet have editing tools.
- Desktop placement is click-based rather than full drag-and-drop CAD behavior.
- Mobile intentionally uses top-view instead of WebGL for clarity and performance.
- Prices are planning ranges, not product-specific quotations.
