# 3D Room Visualizer Handbook

This document explains how the Tejum 3D room visualizer is assembled, how data moves through it, and which files own each behavior.

## Purpose

The visualizer is a guided smart-home planning tool. It is not a general CAD editor. Its job is to show a believable rectangular room, stage common furniture, place smart-home devices on physically valid mounting surfaces, and preserve those placements for estimate and sales handoff.

## Coordinate System

## Connected Home Prototype

`/planner/3bhk` renders the `urban-3bhk-1650` template from `src/lib/constants/home-templates.ts`. `HomePlanner3D` composes room-relative furniture in one apartment coordinate system and supports overview, pointer-lock walkthrough, room navigation, and wall/floor device placement. It remains separate from persisted guest projects until template placements are migrated into the planner store and Supabase.

Room dimensions are meters.

- `x`: room width; negative is left, positive is right
- `y`: height; `0` is floor level
- `z`: room length; negative is the back wall, positive is the open/front side
- room center: `{ x: 0, y: 0, z: 0 }`

For a room of width `W`, length `L`, and height `H`:

- back wall: `z = -L / 2`
- left wall: `x = -W / 2`
- right wall: `x = W / 2`
- ceiling: `y = H`
- floor: `y = 0`

Device anchors use an inset of `0.14m` so meshes do not z-fight with room surfaces.

## Data Model

Each room is a `VisualPlannerRoom` containing a `RoomLayout` and `DevicePlacement[]`.

Important placement fields:

```ts
interface DevicePlacement {
  id: string;
  device_key: string;
  display_name: string;
  wall_id?: string | null;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  mounting_height_m: number;
  placement_type: 'wall' | 'ceiling' | 'floor' | 'corner' | 'surface';
  coverage?: CoverageData | null;
}
```

## Render Pipeline

`RoomCanvas3D` creates the React Three Fiber canvas and camera. It passes room state and callbacks into `RoomScene`.

`RoomScene` renders:

1. scene background and lighting
2. `RoomShell`
3. `RoomFurnishings`
4. one `DeviceModel` per placement
5. `OrbitControls`

Orbit controls are disabled while a device is being dragged so camera movement and device movement do not compete.

## Room Shell

`RoomShell` contains:

- a floor mesh
- back, left, and right wall meshes
- an optional ceiling mesh

The front is open for an isometric cutaway view. Side walls are partly transparent and the back wall is more opaque. Floor, wall, and ceiling meshes also act as manual placement surfaces.

## Furniture

`RoomFurnishings` chooses a generated layout from `roomType`, `width`, and `length`. Furniture does not create database furniture records and does not intercept device placement pointer events.

All furniture groups are floor-relative. A group positioned at `y = 0` contains child meshes with their real height offsets.

See [Furniture and Room Layouts](furniture-layouts.md) for the complete catalog.

## Devices

`DeviceModel` owns:

- device mesh selection
- category color
- placement transform
- selection indicator
- coverage visualization
- pointer capture and constrained drag
- floating HTML icon/name label
- floating X delete control

Device meshes do not use floating animation. Mounted hardware must remain visually attached to its surface.

## Placement Lifecycle

```text
palette selection
  -> user clicks 3D surface or 2D plan
  -> store creates DevicePlacement
  -> normalizePlacementGeometry
  -> normalized position, wall, height, rotation
  -> Zustand persistence
  -> 2D and 3D re-render from the same object
```

Dragging follows the same final normalization path. The UI supplies a candidate point; the engine decides the legal point.

## Camera and Controls

Default perspective camera:

- position: `[7, 5.5, 7]`
- field of view: `42`
- target height: up to `1.5m`
- distance range: `3m` to `14m`

Top view moves the camera to `[0, 9, 0.01]` and restricts the polar angle.

## Coverage

Coverage geometry is displayed for devices with coverage metadata:

- camera: directional cone
- motion: directional cone
- network: radial area

Coverage is planning guidance and does not model wall attenuation or measured RF propagation.

## State and Persistence

All placement mutations are owned by `visual-planner-store.ts`. The browser draft is saved under `tejum-visual-planner-v1`.

When the customer submits the lead form, the guest API writes the layout and placements to Supabase and links them to project devices.

## Related Documents

- [Device Placement Rules](device-placement.md)
- [Furniture and Room Layouts](furniture-layouts.md)
- [Testing and Extension Guide](testing-and-extension.md)
- [Visual Planner Architecture](../visual-planner-architecture.md)
