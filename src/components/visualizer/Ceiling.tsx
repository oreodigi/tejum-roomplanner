'use client';

import type { ThreeEvent } from '@react-three/fiber';
import type { SpatialVector } from '@/lib/types';

interface CeilingProps {
  width: number;
  length: number;
  height: number;
  visible: boolean;
  onPlace: (position: SpatialVector, wallId: string) => void;
}

export function Ceiling({ width, length, height, visible, onPlace }: CeilingProps) {
  if (!visible) return null;

  return (
    <mesh
      position={[0, height, 0]}
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        onPlace({ x: event.point.x, y: height - 0.08, z: event.point.z }, 'ceiling');
      }}
    >
      <boxGeometry args={[width, 0.08, length]} />
      <meshStandardMaterial color="#f3eee5" transparent opacity={0.28} depthWrite={false} />
    </mesh>
  );
}
