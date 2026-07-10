# Tejum Smart Room Planner

A guest-first visual smart-home configurator for Indian homes. Customers choose an automation package, generate a property-specific room map, place devices room by room, see a preliminary estimate, and send the structured plan to Tejum for consultation, site survey, or BOQ preparation.

## Product Flow

1. Choose an automation package.
2. Choose a property type and essential counts.
3. Generate and adjust the room map.
4. Configure each room in 3D on desktop or top-view on mobile.
5. Review coverage, gaps, and upgrades.
6. See a preliminary estimate range.
7. Submit the plan for consultation, site visit, BOQ, or WhatsApp follow-up.

Planning starts without an account. The Zustand draft is persisted locally. Supabase records are created only after lead capture.

## Features

- Guest-first planning with no login required to start
- Property-aware room generation that respects adjusted counts
- Room rename, duplicate, delete, floor move, and regeneration controls
- Essential, Comfort, Premium, and Luxury AI room presets
- Lazy-loaded React Three Fiber room visualizer
- Clickable wall, ceiling, floor, corner, and surface placement zones
- Device movement, removal, coverage visualization, and room dimensions
- Mobile-specific top-view planner, device tray, sticky CTA, and bottom navigation
- Live hardware, installation, and integration estimate range
- System-aware light/dark mode with persistent preference
- Real Supabase customer, lead, project, room, device, layout, placement, and estimate persistence
- Authenticated legacy planner, admin leads, BOQ, proposal, and catalogue routes

## Tech Stack

- Next.js 16 App Router and React 19
- TypeScript and Tailwind CSS 4
- Supabase Auth and Postgres
- Zustand and TanStack Query
- Three.js, React Three Fiber, Drei, and Postprocessing
- next-themes and Lucide React

## Environment

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_server_only_service_role_key
```

`SUPABASE_SERVICE_ROLE_KEY` is used only by the server-side guest planner API. Never expose it through a `NEXT_PUBLIC_` variable.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000/planner/new`.

Quality checks:

```bash
npm run lint
npm run build
```

## Database

The main schema and seed are under `supabase/`. Apply linked migrations with:

```bash
npx supabase db push --linked
```

The spatial migration adds room dimensions, layout data, `device_placements`, RLS, and the infrastructure router device type.

## Documentation

- [Customer Journey](docs/customer-journey.md)
- [Admin and Sales Workflow](docs/admin-sales-workflow.md)
- [Database Table by Table](docs/db-table-by-table.md)
- [Visual Planner Architecture](docs/visual-planner-architecture.md)
- [UI Components](docs/ui-components.md)
