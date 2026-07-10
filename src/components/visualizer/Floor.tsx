'use client';

import type { ThreeEvent } from '@react-three/fiber';
import type { PlacementType, SpatialVector } from '@/lib/types';

interface FloorProps {
  width: number;
  length: number;
  selectedPlacementType?: PlacementType | null;
  onPlace: (position: SpatialVector, wallId: string) => void;
}

export function Floor({ width, length, selectedPlacementType, onPlace }: FloorProps) {
  const isValid = selectedPlacementType === 'floor' || selectedPlacementType === 'surface';
  const color = isValid ? '#9bcbb4' : '#d8cdbb';

  return (
    <mesh
      position={[0, -0.06, 0]}
      receiveShadow
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        onPlace({ x: event.point.x, y: 0.05, z: event.point.z }, 'floor');
      }}
    >
      <boxGeometry args={[width, 0.12, length]} />
      <meshStandardMaterial color={color} roughness={0.6} metalness={0.05} />
    </mesh>
  );
}
