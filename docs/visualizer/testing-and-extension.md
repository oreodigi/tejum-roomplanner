# Visualizer Testing and Extension Guide

Use this guide when adding devices, furniture, room types, or placement behavior.

## Safe Change Sequence

1. Inspect `git status` and preserve unrelated changes.
2. Read the visualizer handbook and applicable placement/furniture document.
3. Update catalog or geometry source of truth first.
4. Update rendering components without duplicating constraints.
5. Update documentation in the same change.
6. Run static checks.
7. Run a fresh production bundle in a browser.
8. Test desktop and mobile.

## Add a Device

1. Add the definition to `DEVICE_CATALOG`.
2. Choose the correct `placementType` and mounting height.
3. Add it to room recommendations if required.
4. Add a Lucide icon mapping in `DeviceIcon.tsx`.
5. Add its category in `getDeviceVisual`.
6. Add or reuse a proportional mesh in `DeviceModel.tsx`.
7. Add special recommended-anchor logic only when generic placement is insufficient.
8. Update `device-placement.md`.
9. Verify recommended, manual, 2D drag, 3D drag, delete, and persistence behavior.

## Add Furniture or a Room Layout

1. Build furniture as floor-relative groups.
2. Derive size and position from room dimensions.
3. Use rotations in right-angle increments.
4. Preserve circulation and device visibility.
5. Keep furniture non-interactive unless adding an intentional surface-anchor system.
6. Test default and minimum dimensions.
7. Update `furniture-layouts.md`.

## Static Checks

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Desktop Acceptance

- room uses the full available width
- room shell, furniture, and device meshes render
- top view works
- ceiling toggle works
- recommended setup uses valid anchors
- wall devices are flush and correctly rotated
- ceiling devices remain at ceiling height
- corner sensors remain in corners
- drag does not rotate the camera
- delete X removes the correct placement
- placement inspector edits are normalized
- no browser console errors

## Mobile Acceptance

- room tabs are horizontally usable
- 2D and 3D buttons are visible
- 2D plan supports placement and drag
- 3D view renders without horizontal overflow
- ceiling toggle is reachable
- device tray remains usable
- sticky actions do not cover controls
- no browser console errors

Test at least `390x844` and one wider mobile viewport.

## Room Coverage

For furniture changes, visually inspect:

- living room
- dining room
- kitchen
- master bedroom
- bathroom
- one unsupported room type to confirm shell-only fallback

## Placement Data Check

Inspect persisted placement objects after applying recommendations. Confirm:

- `wall_id` matches the surface
- `position` is inside room bounds
- `y` matches mounting rules
- `rotation.y` matches wall/corner rules
- device keys and display names are preserved

## Deployment

After pushing, wait for the Vercel production deployment to become Ready. Verify `https://plan.tejum.com` returns successfully and perform a short live browser smoke test before reporting completion.
