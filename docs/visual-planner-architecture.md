# Visual Planner Architecture

## Route and Entry Point

`/planner/new` is the public guest configurator. It renders `VisualPlannerApp`, which selects the active guided step from the persisted visual planner store.

Authenticated project, admin, sales, BOQ, proposal, and catalogue routes remain separate. The guest planner does not replace the legacy authenticated project store.

## Guest State

`src/lib/stores/visual-planner-store.ts` owns:

- active planner step
- automation package
- property draft
- generated rooms
- room dimensions and setup tiers
- spatial device placements
- active room
- contact/conversion draft
- persisted project ID

Zustand persists this state under `tejum-visual-planner-v1`. Backward navigation and page reloads must not clear customer answers.

## Room Generation

`src/lib/engines/room-generator.ts` generates a room map from effective property counts. Each room receives:

- ID, name, type, floor number, and floor name
- setup tier
- completion percentage
- rectangular `RoomLayout`
- device placements

Default dimensions come from `getDefaultRoomDimensions` in `src/lib/constants/visual-planner.ts`.

## Device Recommendations

`src/lib/constants/visual-planner.ts` contains the device catalog and room presets. A recommended setup selects device keys based on room type, setup tier, and automation package.

`createPlacement` assigns each recommended device an initial room-aware anchor. `normalizePlacement` then enforces its final surface, mounting height, bounds, and rotation.

## Placement Geometry

`src/lib/engines/placement-geometry.ts` is the shared placement source of truth.

It handles:

- nearest valid wall resolution
- room-edge margins
- wall plane coordinates
- ceiling and floor height enforcement
- corner snapping
- mounting-height clamping
- wall and corner rotations

The store calls normalization for recommended placement, manual placement, 2D dragging, 3D dragging, and inspector coordinate edits.

## 3D Visualizer

Desktop and mobile both lazy-load `RoomCanvas3D` with server-side rendering disabled.

The component chain is:

```text
RoomCanvas3D
  RoomScene
    RoomShell
      Floor
      Wall
      Ceiling
    RoomFurnishings
    DeviceModel[]
      DeviceGeometry
      CoverageCone
      Html label and delete action
    OrbitControls
```

The scene uses generated Three.js geometry. Furniture is room-specific and derived from dimensions. Side walls are rendered as cutaway surfaces so furniture remains visible from the default camera.

## 2D Visualizer

`RoomMiniMap` projects room coordinates into an SVG plan. It displays real device icons and labels, supports pointer dragging, and emits room coordinates back to the same store used by 3D.

The 2D display may offset labels for readability, but the anchor dot represents the actual placement coordinate.

## Desktop and Mobile

Desktop uses a full-width 3D workspace with a persistent device panel, top-view control, ceiling control, room dimensions, and placement inspector.

Mobile provides:

- horizontal room tabs
- explicit 2D and 3D modes
- ceiling toggle in 3D mode
- horizontal device tray
- recommendation action
- sticky room navigation
- bottom planner navigation

Both modes operate on the same room and placement objects.

## Estimate

`src/lib/engines/visual-estimate-engine.ts` calculates low and high ranges from actual placed device keys. It separates hardware, installation, and integration allowances.

These values are planning guidance, not final quotation values.

## Supabase Persistence

`POST /api/planner/guest` validates the complete guest draft with Zod and uses a server-only Supabase client.

The endpoint creates structured customer, lead, project, property, floor, room, layout, project-device, placement, and estimate records. Each spatial placement links to a `project_devices` record to preserve BOQ and proposal compatibility.

If persistence fails partway through, the endpoint cleans up the partial project chain.

## Themes

`next-themes` controls the root light/dark class. Planner surfaces resolve through runtime CSS tokens. The 3D scene uses its own material palette so room geometry remains legible in both UI themes.

## Current Boundaries

- Rooms are rectangular.
- The front wall is intentionally open for the default cutaway camera.
- Furniture is generated staging, not user-editable furniture data.
- Device collision avoidance is based on anchors and surface rules; it is not a rigid-body physics simulation.
- Existing wall devices drag on their current wall plane. Moving a device to another wall requires placing it on that wall again.
- Surface devices use a defined mounting height; they are not yet aware of individual furniture-top collision surfaces.
- Estimates use catalog ranges rather than final product SKUs.
