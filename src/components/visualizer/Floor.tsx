'use client';

import type { ThreeEvent } from '@react-three/fiber';
import type { SpatialVector } from '@/lib/types';

interface FloorProps {
  width: number;
  length: number;
  onPlace: (position: SpatialVector, wallId: string) => void;
}

export function Floor({ width, length, onPlace }: FloorProps) {
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
      <meshStandardMaterial color="#d8cdbb" roughness={0.76} />
    </mesh>
  );
}
