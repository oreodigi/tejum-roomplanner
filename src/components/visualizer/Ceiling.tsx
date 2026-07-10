'use client';

import type { ThreeEvent } from '@react-three/fiber';
import type { PlacementType, SpatialVector } from '@/lib/types';

interface CeilingProps {
  width: number;
  length: number;
  height: number;
  visible: boolean;
  selectedPlacementType?: PlacementType | null;
  onPlace: (position: SpatialVector, wallId: string) => void;
}

export function Ceiling({ width, length, height, visible, selectedPlacementType, onPlace }: CeilingProps) {
  if (!visible && selectedPlacementType !== 'ceiling') return null;

  const isValid = selectedPlacementType === 'ceiling';
  const color = isValid ? '#9bcbb4' : '#f3eee5';
  const opacity = isValid ? 0.6 : 0.28;

  return (
    <mesh
      position={[0, height, 0]}
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        onPlace({ x: event.point.x, y: height - 0.08, z: event.point.z }, 'ceiling');
      }}
    >
      <boxGeometry args={[width, 0.08, length]} />
      <meshStandardMaterial color={color} transparent opacity={opacity} depthWrite={false} side={2} />
    </mesh>
  );
}
