'use client';

import type { SpatialVector } from '@/lib/types';
import { Ceiling } from './Ceiling';
import { Floor } from './Floor';
import { Wall } from './Wall';

interface RoomShellProps {
  width: number;
  length: number;
  height: number;
  showCeiling: boolean;
  onPlace: (position: SpatialVector, wallId: string) => void;
}

export function RoomShell({ width, length, height, showCeiling, onPlace }: RoomShellProps) {
  return (
    <group>
      <Floor width={width} length={length} onPlace={onPlace} />
      <Wall id="back" position={[0, height / 2, -length / 2]} size={[width, height, 0.1]} opacity={0.76} onPlace={onPlace} />
      <Wall id="left" position={[-width / 2, height / 2, 0]} size={[0.1, height, length]} opacity={0.3} onPlace={onPlace} />
      <Wall id="right" position={[width / 2, height / 2, 0]} size={[0.1, height, length]} opacity={0.3} onPlace={onPlace} />
      <Ceiling width={width} length={length} height={height} visible={showCeiling} onPlace={onPlace} />
    </group>
  );
}
