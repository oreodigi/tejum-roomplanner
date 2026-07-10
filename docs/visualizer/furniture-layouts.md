# Furniture and Room Layouts

Furniture is generated in `src/components/visualizer/RoomFurnishings.tsx`. It provides visual context for device planning and does not create editable furniture records.

## Shared Rules

- All dimensions are meters.
- Furniture is positioned from room width and length.
- Furniture rests on the floor; parent groups use `y = 0`.
- Rotations use right-angle increments except objects that do not require rotation.
- Furniture does not receive pointer events, so it cannot block device placement.
- Layouts preserve a visible central planning area where possible.

## Bedroom Types

Applied to `bedroom`, `master_bedroom`, and `guest_bedroom`.

Furniture:

- bed frame, mattress, headboard, and pillows
- two bedside tables with small lamps
- wardrobe
- wall-embedded door and frame

Placement logic:

- bed is centered on the back wall
- bed width is at most `2.15m` or `58%` of room width
- bed length is at most `2.35m` or `55%` of room length
- headboard remains against the back wall
- bedside tables sit beside the head end of the bed
- wardrobe sits near the front-left side
- door sits in the back wall to the right of the bed

## Living and Lounge Types

Applied to `living_room`, `family_lounge`, and `home_theatre`.

Furniture:

- primary three-seat sofa
- secondary loveseat
- round coffee table
- media console and TV screen

Placement logic:

- primary sofa is against the back wall and faces into the room
- secondary sofa is against the left wall and faces the center
- coffee table occupies the shared seating center
- media console is on the right wall, facing the seating area

## Dining Room

Applied to `dining_room`.

Furniture:

- rectangular dining table
- six individual dining chairs

Placement logic:

- table is centered in the room
- table width is at most `2.35m` or `55%` of room width
- table length is at most `1.20m` or `36%` of room length
- two chairs sit along each long side
- one chair sits at each end
- every chair faces the table

## Kitchen

Applied to `kitchen`.

Furniture and appliances:

- back-wall base cabinets and worktop
- sink zone
- cooktop zone
- center island/work desk
- refrigerator block
- upper shelf/rail representation

Placement logic:

- main counter is flush with the back wall
- worktop is at approximately `1.0m`
- sink and cooktop sit on the back worktop
- island is centered forward of the counter
- refrigerator sits in the back-right corner
- shelf/rail remains above the counter

## Bathroom Types

Applied to `bathroom`, `master_bathroom`, `guest_bathroom`, and `powder_room`.

Furniture/fixtures:

- circular basin/fixture representation
- vanity and glass top
- front shower/bath platform

Placement logic:

- wet fixtures stay close to walls
- central floor area remains available for leak-sensor planning

## Unsupported Room Types

Entrance, foyer, balcony, terrace, passage, staircase, utility, parking, garden, outdoor, study, gym, puja room, store room, servant room, laundry, pool, and custom rooms currently render only the room shell and devices.

Add new staging by extending the room-type selection in `RoomFurnishings`. Keep dimensions room-relative and test minimum/default room sizes.

## Materials

The current generated palette uses warm wood, darker wood, neutral fabric, metal, glass, and ceramic materials. Meshes use standard materials with shadows. This keeps the bundle lightweight and avoids external model downloads.

## Future Model Assets

If GLTF/GLB assets are introduced:

1. Store optimized models under `public/models/`.
2. Document source and license.
3. Keep primitive fallbacks for loading/error states.
4. Draco-compress large models.
5. Normalize model scale to meters.
6. Set object origins at floor contact points.
7. Do not allow model meshes to intercept placement unless explicitly intended.
8. Verify mobile memory and frame rate before shipping.
