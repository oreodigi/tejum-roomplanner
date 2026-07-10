'use client';

import { getDeviceDefinition } from '@/lib/constants/visual-planner';
import type { SpatialVector } from '@/lib/types';
import { Ceiling } from './Ceiling';
import { Floor } from './Floor';
import { Wall } from './Wall';

interface RoomShellProps {
  width: number;
  length: number;
  height: number;
  showCeiling: boolean;
  selectedDeviceKey?: string | null;
  onPlace: (position: SpatialVector, wallId: string) => void;
}

export function RoomShell({ width, length, height, showCeiling, selectedDeviceKey, onPlace }: RoomShellProps) {
  const selectedPlacementType = selectedDeviceKey ? getDeviceDefinition(selectedDeviceKey).placementType : null;

  return (
    <group>
      <Floor width={width} length={length} selectedPlacementType={selectedPlacementType} onPlace={onPlace} />
      <Wall id="back" position={[0, height / 2, -length / 2]} size={[width, height, 0.1]} opacity={1} selectedPlacementType={selectedPlacementType} onPlace={onPlace} />
      <Wall id="left" position={[-width / 2, height / 2, 0]} size={[0.1, height, length]} opacity={0.35} selectedPlacementType={selectedPlacementType} onPlace={onPlace} />
      <Wall id="right" position={[width / 2, height / 2, 0]} size={[0.1, height, length]} opacity={0.35} selectedPlacementType={selectedPlacementType} onPlace={onPlace} />
      <Ceiling width={width} length={length} height={height} visible={showCeiling} selectedPlacementType={selectedPlacementType} onPlace={onPlace} />
      
      {/* Skirting / Baseboards */}
      <mesh position={[0, 0.05, -length / 2 + 0.06]} receiveShadow>
        <boxGeometry args={[width, 0.1, 0.02]} />
        <meshStandardMaterial color="#c4b8a6" roughness={0.8} />
      </mesh>
      <mesh position={[-width / 2 + 0.06, 0.05, 0]} receiveShadow>
        <boxGeometry args={[0.02, 0.1, length]} />
        <meshStandardMaterial color="#c4b8a6" roughness={0.8} transparent opacity={0.35} />
      </mesh>
      <mesh position={[width / 2 - 0.06, 0.05, 0]} receiveShadow>
        <boxGeometry args={[0.02, 0.1, length]} />
        <meshStandardMaterial color="#c4b8a6" roughness={0.8} transparent opacity={0.35} />
      </mesh>
    </group>
  );
}
