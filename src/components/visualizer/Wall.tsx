'use client';

import type { ThreeEvent } from '@react-three/fiber';
import type { SpatialVector } from '@/lib/types';

interface WallProps {
  id: string;
  position: [number, number, number];
  size: [number, number, number];
  onPlace: (position: SpatialVector, wallId: string) => void;
}

export function Wall({ id, position, size, onPlace }: WallProps) {
  return (
    <mesh
      position={position}
      receiveShadow
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        onPlace({ x: event.point.x, y: event.point.y, z: event.point.z }, id);
      }}
    >
      <boxGeometry args={size} />
      <meshStandardMaterial color="#e9e3d8" roughness={0.92} />
    </mesh>
  );
}
