<!-- BEGIN:nextjs-agent-rules -->
# Next.js 16 Rules

This project uses Next.js 16 and React 19. APIs, conventions, and file structure may differ from older Next.js versions. Read the relevant guide in `node_modules/next/dist/docs/` before changing routing, caching, proxy, middleware, server actions, or rendering behavior. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Tejum Smart Planner Agent Guide

## Start Here

Before changing the planner, read:

1. `README.md`
2. `docs/README.md`
3. `docs/visual-planner-architecture.md`
4. `docs/visualizer/README.md` for any 2D/3D work
5. `docs/visualizer/device-placement.md` for device placement changes
6. `docs/visualizer/furniture-layouts.md` for furniture changes

Inspect the actual source and current git status before editing. Preserve unrelated user changes in a dirty worktree.

## Product Principles

- The planner is a guided customer configurator, not a generic admin form.
- Preserve the guest-first flow and existing Supabase handoff.
- Use large touch targets and dedicated mobile layouts.
- Maintain both light and dark themes.
- Do not remove 2D or 3D options from mobile.
- Personal and project details must persist when users navigate backward.

## Visualizer Invariants

- `src/lib/engines/placement-geometry.ts` is the source of truth for placement constraints.
- Every new or updated placement must pass through `normalizePlacement`.
- Do not write arbitrary positions directly into the store.
- Wall devices must remain flush with a valid wall and use the matching Y rotation.
- Ceiling devices must remain at `height_m - 0.08`.
- Corner devices must remain at room corners and face diagonally into the room.
- Floor devices must remain at floor height.
- Surface devices keep their mounting height and remain inside room bounds.
- Furniture positions and sizes must be derived from room width and length.
- Furniture groups use floor-relative Y coordinates. Do not add the same vertical offset at both group and mesh level.
- Furniture is visual staging and must not mutate project device data.
- Keep room shell and furniture non-blocking for device placement interactions.
- Device delete controls must remain keyboard-accessible and have an `aria-label`.

## Component Boundaries

- `RoomCanvas3D`: Canvas, camera, and top-level 3D props
- `RoomScene`: lights, shell, furniture, device models, and orbit controls
- `RoomShell`: floor, walls, and ceiling placement surfaces
- `RoomFurnishings`: generated room-type furniture
- `DeviceModel`: mesh, label, dragging, selection, coverage, and delete action
- `RoomMiniMap`: mobile/desktop 2D coordinate projection and drag interaction
- `visual-planner-store`: persisted guest draft and all placement mutations

Do not duplicate placement physics inside UI components. UI components emit intent; the store normalizes and persists the result.

## Design Direction

- Use the established TEJUM palette and supplied landing assets.
- Avoid generic SaaS card grids and decorative effects that reduce clarity.
- Device categories have stable colors defined in `DeviceIcon.tsx`.
- Device meshes should resemble real mounting proportions and remain readable at room scale.
- Motion must communicate placement, selection, or state. Do not make mounted devices float.
- Use cutaway walls to keep furniture visible while preserving wall geometry.

## Verification

Run:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

For planner or visualizer changes, use a real browser and verify:

- desktop 3D room setup
- mobile 2D and 3D modes
- recommended setup anchors
- manual placement
- constrained dragging for each placement type
- delete from the floating X control
- room switching and back navigation
- no horizontal mobile overflow
- no runtime console errors

Do not claim deployment success until the Vercel deployment is Ready and `https://plan.tejum.com` responds successfully.

## Documentation Maintenance

When visualizer behavior changes, update the matching files under `docs/visualizer/` in the same commit. When routes, persistence, data flow, or customer steps change, update `README.md` and the relevant architecture or journey document.
