# Device Placement Rules

This document records the implemented mounting rules. The source of truth is `src/lib/constants/visual-planner.ts` plus `src/lib/engines/placement-geometry.ts`.

## Placement Types

| Type | Legal surface | Position rule | Rotation rule |
| --- | --- | --- | --- |
| `wall` | back, left, or right wall | flush to wall inset; Y fixed to mounting height | back `0`; left `+90deg`; right `-90deg` |
| `ceiling` | ceiling | Y equals room height minus `0.08m`; X/Z clamped inside room | no Y rotation |
| `corner` | room corner | X/Z snap to nearest corner; Y fixed to mounting height | left `+45deg`; right `-45deg` |
| `floor` | floor | Y equals `0.05m`; X/Z clamped | no Y rotation |
| `surface` | horizontal planning surface | Y equals mounting height; X/Z clamped | no Y rotation |

## Device Catalog

| Key | Label | Type | Mounting height | Intended placement |
| --- | --- | --- | --- | --- |
| `scene_control` | Smart switchboard | wall | `1.20m` | reachable wall position near room entry |
| `main_light` | Smart light control | ceiling | room ceiling | ceiling light point |
| `ceiling_light` | Dimmable ceiling light | ceiling | room ceiling | secondary ceiling light point |
| `fan` | Smart fan control | ceiling | room ceiling | room center by default |
| `ac` | AC control | wall | `2.25m` | upper section of right wall by default |
| `curtain` | Curtain automation | wall | `2.60m` | upper wall/window line |
| `motion_sensor` | Motion sensor | corner | `2.20m` | upper room corner facing inward |
| `smart_lock` | Smart lock | wall | `1.05m` | door-height wall mounting |
| `video_doorbell` | Video doorbell | wall | `1.40m` | entry wall near door |
| `cctv` | CCTV camera | corner | `2.40m` | upper corner facing inward |
| `gas_leak_sensor` | Gas leak sensor | wall | `0.45m` | low kitchen wall position |
| `smoke_sensor` | Smoke sensor | ceiling | room ceiling | ceiling detection point |
| `water_leak_sensor` | Water leak sensor | floor | `0.05m` | floor near wet area |
| `tv` | TV/media control | wall | `1.30m` | right wall media position by default |
| `home_theatre` | Home theatre control | surface | `0.80m` | media console or shelf level |
| `smart_plug` | Smart power point | wall | `0.45m` | low wall power position |
| `router` | WiFi router | surface | `0.80m` | shelf or console level |

## Recommended Anchors

Recommended setup does not distribute every device using a generic grid. It uses device-aware anchors:

- fan: room center at ceiling
- ceiling lights: offset to either side of center
- switchboard: back wall near the left side
- AC: upper right wall, toward the back
- TV: right wall, forward of center
- curtain: upper back wall
- motion/CCTV: room corner
- remaining wall devices: spaced along the back wall

Normalization runs after anchor selection, so all values are clamped to the actual room dimensions.

## Manual Placement

In 3D, the selected device receives the clicked floor, wall, or ceiling point. The engine then converts that point to the device's legal surface. For example, clicking the floor with a wall device does not leave it on the floor; it resolves to the nearest supported wall.

In 2D, a click supplies X/Z room coordinates. The store restores the device's legal Y value and surface.

## Dragging

- wall devices drag on their current vertical wall plane
- ceiling devices drag horizontally at ceiling height
- floor and surface devices drag horizontally at their defined Y height
- corner devices choose a valid corner from the candidate X/Z signs
- all positions remain inside the `0.14m` room inset

The store normalizes every drag update. UI coordinates are never trusted as final geometry.

## Rotation

Rotations are stored in radians in `DevicePlacement.rotation`.

```text
back wall:  y = 0
left wall:  y = +PI / 2
right wall: y = -PI / 2
left corner:  y = +PI / 4
right corner: y = -PI / 4
```

## Visual Categories

`DeviceIcon.tsx` assigns stable display categories:

| Category | Devices | Color |
| --- | --- | --- |
| Controls | switchboard | `#f8c80e` |
| Lighting | main and dimmable lights | `#ff9f1c` |
| Climate | fan, AC, curtain | `#44c7f4` |
| Security | lock, doorbell, CCTV | `#ff6262` |
| Sensors | motion, gas, smoke, water | `#39d39f` |
| Entertainment | TV, theatre | `#b98cff` |
| Power/network | plug, router, fallback | `#5b91ff` |

## Important Limitation

Surface devices currently use a planning mounting height. They do not raycast against the generated furniture top. A future furniture-aware surface system should add named surface anchors rather than bypassing normalization.
