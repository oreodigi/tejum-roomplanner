# Tejum Smart Room Planner

Tejum Smart Room Planner is a guest-first smart-home configurator for Indian homes. A customer selects an automation direction, generates a property-specific room map, configures devices in 2D or 3D, reviews a preliminary estimate, and submits the structured plan to Tejum for consultation, site survey, or BOQ preparation.

Production: [https://plan.tejum.com](https://plan.tejum.com)

## Customer Flow

1. Choose Full Home Automation, Smart Controls, Smart Lights, Smart Security, or Recommend for Me.
2. Select a property type and adjust floors, bedrooms, bathrooms, and balconies.
3. Generate and edit the room map.
4. Configure every room using the desktop 3D viewer or the mobile 2D/3D switcher.
5. Review device coverage, gaps, and suggested upgrades.
6. Review a preliminary hardware, installation, and integration range.
7. Request consultation, site visit, BOQ, or WhatsApp follow-up.

Planning starts without an account. The guest draft is persisted in browser storage under `tejum-visual-planner-v1`. Supabase records are created after lead capture.

## 3D Room Visualizer

The visualizer is built with Three.js, React Three Fiber, and Drei. It includes:

- rectangular room geometry with a floor, three cutaway walls, and an optional ceiling
- room-specific generated furniture for bedrooms, living rooms, dining rooms, kitchens, and bathrooms
- device-specific 3D meshes, labels, category colors, coverage cones, and delete controls
- physics-aware placement normalization for wall, ceiling, corner, floor, and surface devices
- constrained dragging that preserves mounting surfaces, height rules, room boundaries, and wall rotations
- top view and orbit-camera controls on desktop
- 2D and 3D room modes on mobile
- connected furnished 3BHK prototype at `/planner/3bhk` with room navigation, first-person walkthrough, and cross-room device placement

The shared placement rules live in `src/lib/engines/placement-geometry.ts`. All placement creation and updates must pass through that engine.

## Architecture Map

```text
src/app/planner/new/page.tsx
  -> VisualPlannerApp
     -> visual-planner-store (guest draft and persistence)
     -> DesktopRoomSetup / MobileRoomSetup
        -> RoomCanvas3D
           -> RoomScene
              -> RoomShell
              -> RoomFurnishings
              -> DeviceModel
        -> RoomMiniMap

visual-planner-store
  -> createPlacement
  -> normalizePlacement
  -> localStorage
  -> POST /api/planner/guest after lead capture
```

## Main Features

- Guest-first planning with no login required
- Property-aware room generation
- Room rename, duplicate, delete, floor move, and regeneration
- Essential, Comfort, Premium, and Luxury AI room presets
- Desktop and mobile 3D visualization
- Mobile interactive 2D floor plan
- Realistic device mounting constraints and rotations
- Device movement, removal, category colors, and coverage visualization
- Room-specific furniture staging
- Live hardware, installation, and integration estimate range
- Light and dark mode with persistent preference
- Supabase persistence for customers, leads, projects, rooms, layouts, devices, placements, and estimates
- Authenticated admin, sales, BOQ, proposal, and product catalogue routes

## Technology

- Next.js 16 App Router and React 19
- TypeScript and Tailwind CSS 4
- Supabase Auth and Postgres
- Zustand and TanStack Query
- Three.js, React Three Fiber, Drei, and Postprocessing
- next-themes and Lucide React

## Environment

Create `.env.local` from `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_server_only_service_role_key
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only. Never expose it through a `NEXT_PUBLIC_` variable or commit it.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000/planner/new`.

Required checks before pushing:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

For visualizer changes, also verify the planner in a real browser at desktop and mobile widths. Test 2D and 3D placement, constrained dragging, deletion, room switching, and console errors.

## Database

Schema, migrations, and seed data are under `supabase/`. Apply linked migrations with:

```bash
npx supabase db push --linked
```

The spatial schema stores room dimensions, room layouts, and `device_placements`. The guest planner API maps each visual placement to a `project_devices` row before linking the spatial placement.

## Documentation

- [Documentation Index](docs/README.md)
- [3D Visualizer Handbook](docs/visualizer/README.md)
- [Device Placement Rules](docs/visualizer/device-placement.md)
- [Furniture and Room Layouts](docs/visualizer/furniture-layouts.md)
- [Visualizer Testing and Extension](docs/visualizer/testing-and-extension.md)
- [Customer Journey](docs/customer-journey.md)
- [Admin and Sales Workflow](docs/admin-sales-workflow.md)
- [Database Table by Table](docs/db-table-by-table.md)
- [Visual Planner Architecture](docs/visual-planner-architecture.md)
- [UI Components](docs/ui-components.md)

## Contribution Rules

Read `AGENTS.md` before editing. Visualizer changes must preserve the existing guest data flow, normalize all placements, use room-relative dimensions, avoid unconstrained coordinates, and include browser verification.
