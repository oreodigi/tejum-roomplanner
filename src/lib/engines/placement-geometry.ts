import type { DevicePlacement, PlacementType, RoomLayout, SpatialVector } from '@/lib/types';

const EDGE = 0.14;

function nearestWall(position: SpatialVector, width: number, length: number): 'back' | 'left' | 'right' {
  const distances = [
    { id: 'back' as const, distance: Math.abs(position.z + length / 2) },
    { id: 'left' as const, distance: Math.abs(position.x + width / 2) },
    { id: 'right' as const, distance: Math.abs(position.x - width / 2) },
  ];
  return distances.sort((a, b) => a.distance - b.distance)[0].id;
}

export function getPlacementRotation(placementType: PlacementType, wallId: string | null | undefined): SpatialVector {
  if (placementType === 'wall') {
    if (wallId === 'left') return { x: 0, y: Math.PI / 2, z: 0 };
    if (wallId === 'right') return { x: 0, y: -Math.PI / 2, z: 0 };
  }
  if (placementType === 'corner') {
    if (wallId === 'left') return { x: 0, y: Math.PI / 4, z: 0 };
    if (wallId === 'right') return { x: 0, y: -Math.PI / 4, z: 0 };
  }
  return { x: 0, y: 0, z: 0 };
}

export function normalizePlacementGeometry(
  position: SpatialVector,
  placementType: PlacementType,
  wallId: string | null | undefined,
  layout: Pick<RoomLayout, 'width_m' | 'length_m' | 'height_m'>,
  mountingHeight: number,
) {
  const { width_m: width, length_m: length, height_m: height } = layout;
  const resolvedWall = placementType === 'wall' || placementType === 'corner'
    ? (wallId === 'back' || wallId === 'left' || wallId === 'right' ? wallId : nearestWall(position, width, length))
    : placementType === 'ceiling'
      ? 'ceiling'
      : placementType === 'floor'
        ? 'floor'
        : null;

  if (placementType === 'ceiling') {
    return {
      wallId: 'ceiling',
      position: { x: clamp(position.x, -width / 2 + EDGE, width / 2 - EDGE), y: height - 0.08, z: clamp(position.z, -length / 2 + EDGE, length / 2 - EDGE) },
      rotation: getPlacementRotation(placementType, resolvedWall),
    };
  }

  if (placementType === 'floor' || placementType === 'surface') {
    return {
      wallId: placementType === 'floor' ? 'floor' : null,
      position: { x: clamp(position.x, -width / 2 + EDGE, width / 2 - EDGE), y: placementType === 'floor' ? 0.05 : Math.max(0.2, mountingHeight), z: clamp(position.z, -length / 2 + EDGE, length / 2 - EDGE) },
      rotation: getPlacementRotation(placementType, null),
    };
  }

  if (placementType === 'corner') {
    const x = position.x >= 0 ? width / 2 - EDGE : -width / 2 + EDGE;
    const z = position.z >= 0 ? length / 2 - EDGE : -length / 2 + EDGE;
    return {
      wallId: x < 0 ? 'left' : 'right',
      position: { x, y: clamp(mountingHeight, 0.4, height - 0.2), z },
      rotation: getPlacementRotation(placementType, x < 0 ? 'left' : 'right'),
    };
  }

  const wall = resolvedWall ?? 'back';
  const y = clamp(mountingHeight, 0.2, height - 0.18);
  if (wall === 'left') return { wallId: wall, position: { x: -width / 2 + EDGE, y, z: clamp(position.z, -length / 2 + EDGE, length / 2 - EDGE) }, rotation: getPlacementRotation(placementType, wall) };
  if (wall === 'right') return { wallId: wall, position: { x: width / 2 - EDGE, y, z: clamp(position.z, -length / 2 + EDGE, length / 2 - EDGE) }, rotation: getPlacementRotation(placementType, wall) };
  return { wallId: 'back', position: { x: clamp(position.x, -width / 2 + EDGE, width / 2 - EDGE), y, z: -length / 2 + EDGE }, rotation: getPlacementRotation(placementType, 'back') };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function normalizePlacement(placement: DevicePlacement, layout: RoomLayout): DevicePlacement {
  const geometry = normalizePlacementGeometry(placement.position, placement.placement_type, placement.wall_id, layout, placement.mounting_height_m);
  return { ...placement, wall_id: geometry.wallId, position: geometry.position, rotation: geometry.rotation };
}
