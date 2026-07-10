'use client';

import type { ThreeEvent } from '@react-three/fiber';
import type { PlacementType, SpatialVector } from '@/lib/types';

interface WallProps {
  id: string;
  position: [number, number, number];
  size: [number, number, number];
  opacity?: number;
  selectedPlacementType?: PlacementType | null;
  onPlace: (position: SpatialVector, wallId: string) => void;
}

export function Wall({ id, position, size, opacity = 0.82, selectedPlacementType, onPlace }: WallProps) {
  const isValid = selectedPlacementType === 'wall' || selectedPlacementType === 'corner';
  const color = isValid ? '#9bcbb4' : '#e4dfd5';
  const displayOpacity = isValid ? Math.max(0.6, opacity) : opacity;

  return (
    <mesh
      position={position}
      receiveShadow
      castShadow={id === 'back'}
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        onPlace({ x: event.point.x, y: event.point.y, z: event.point.z }, id);
      }}
    >
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.8} transparent={displayOpacity < 1} opacity={displayOpacity} depthWrite={displayOpacity >= 0.8} />
    </mesh>
  );
}
