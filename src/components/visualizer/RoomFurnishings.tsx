'use client';

import type { RoomType } from '@/lib/types';

const WOOD = '#6c4934';
const WOOD_DARK = '#3b2b25';
const FABRIC = '#c4a98d';
const FABRIC_DARK = '#8d7464';
const METAL = '#9da8aa';
const GLASS = '#84b9c4';
const CERAMIC = '#d9dedb';

function Box({ position, size, color, rotation = [0, 0, 0] }: { position: [number, number, number]; size: [number, number, number]; color: string; rotation?: [number, number, number] }) {
  return <mesh position={position} rotation={rotation} castShadow receiveShadow><boxGeometry args={size} /><meshStandardMaterial color={color} roughness={0.7} /></mesh>;
}

function Door({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <Box position={[0, 1.05, 0]} size={[0.9, 2.1, 0.06]} color="#5b4034" />
      <Box position={[-0.5, 1.05, 0]} size={[0.08, 2.25, 0.12]} color={WOOD_DARK} />
      <Box position={[0.5, 1.05, 0]} size={[0.08, 2.25, 0.12]} color={WOOD_DARK} />
      <Box position={[0, 2.15, 0]} size={[1.08, 0.08, 0.12]} color={WOOD_DARK} />
      <mesh position={[0.3, 1.08, -0.05]} castShadow><sphereGeometry args={[0.045, 12, 12]} /><meshStandardMaterial color={METAL} metalness={0.8} roughness={0.25} /></mesh>
    </group>
  );
}

function Bed({ width, length }: { width: number; length: number }) {
  const bedWidth = Math.min(2.15, width * 0.58);
  const bedLength = Math.min(2.45, length * 0.58);
  return (
    <group position={[0, 0, -0.45]}>
      <Box position={[0, 0.25, 0]} size={[bedWidth, 0.35, bedLength]} color={WOOD_DARK} />
      <Box position={[0, 0.5, 0.04]} size={[bedWidth - 0.08, 0.18, bedLength - 0.1]} color="#e7e1d5" />
      <Box position={[0, 1.02, -bedLength / 2 + 0.08]} size={[bedWidth, 1.05, 0.12]} color={WOOD} />
      <Box position={[-bedWidth * 0.27, 0.63, -bedLength / 2 + 0.34]} size={[0.55, 0.12, 0.38]} color="#f2eee4" />
      <Box position={[bedWidth * 0.27, 0.63, -bedLength / 2 + 0.34]} size={[0.55, 0.12, 0.38]} color="#f2eee4" />
    </group>
  );
}

function BedsideTable({ position }: { position: [number, number, number] }) {
  return <group><Box position={[position[0], 0.4, position[2]]} size={[0.42, 0.7, 0.42]} color={WOOD} /><Box position={[position[0], 0.78, position[2]]} size={[0.48, 0.04, 0.48]} color={WOOD_DARK} /><mesh position={[position[0], 0.82, position[2]]}><cylinderGeometry args={[0.08, 0.08, 0.12, 16]} /><meshStandardMaterial color="#f5c85b" emissive="#f5c85b" emissiveIntensity={0.35} /></mesh></group>;
}

function Wardrobe({ position }: { position: [number, number, number] }) {
  return <group><Box position={[position[0], 1.2, position[2]]} size={[1.7, 2.35, 0.48]} color={WOOD_DARK} /><Box position={[position[0] - 0.42, 1.2, position[2] - 0.25]} size={[0.03, 2.15, 0.02]} color={METAL} /><Box position={[position[0] + 0.42, 1.2, position[2] - 0.25]} size={[0.03, 2.15, 0.02]} color={METAL} /></group>;
}

function Sofa({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return <group position={position} rotation={rotation}><Box position={[0, 0.38, 0]} size={[2.5, 0.45, 0.85]} color={FABRIC_DARK} /><Box position={[0, 0.9, 0.28]} size={[2.5, 0.8, 0.22]} color={FABRIC} /><Box position={[-1.12, 0.68, 0]} size={[0.22, 0.72, 0.88]} color={FABRIC} /><Box position={[1.12, 0.68, 0]} size={[0.22, 0.72, 0.88]} color={FABRIC} /></group>;
}

function CoffeeTable({ position }: { position: [number, number, number] }) {
  return <group position={position}><Box position={[0, 0.48, 0]} size={[1.25, 0.1, 0.7]} color={WOOD} /><Box position={[-0.48, 0.22, -0.24]} size={[0.07, 0.5, 0.07]} color={METAL} /><Box position={[0.48, 0.22, -0.24]} size={[0.07, 0.5, 0.07]} color={METAL} /><Box position={[-0.48, 0.22, 0.24]} size={[0.07, 0.5, 0.07]} color={METAL} /><Box position={[0.48, 0.22, 0.24]} size={[0.07, 0.5, 0.07]} color={METAL} /></group>;
}

function DiningTable({ width }: { width: number }) {
  const tableWidth = Math.min(2.3, width * 0.55);
  return <group position={[0, 0, -0.15]}><Box position={[0, 0.86, 0]} size={[tableWidth, 0.12, 1.15]} color={WOOD} /><Box position={[-tableWidth * 0.38, 0.42, -0.4]} size={[0.1, 0.8, 0.1]} color={WOOD_DARK} /><Box position={[tableWidth * 0.38, 0.42, -0.4]} size={[0.1, 0.8, 0.1]} color={WOOD_DARK} /><Box position={[-tableWidth * 0.38, 0.42, 0.4]} size={[0.1, 0.8, 0.1]} color={WOOD_DARK} /><Box position={[tableWidth * 0.38, 0.42, 0.4]} size={[0.1, 0.8, 0.1]} color={WOOD_DARK} /><Box position={[0, 0.48, -1]} size={[1.05, 0.65, 0.38]} color={FABRIC_DARK} /><Box position={[0, 0.48, 1]} size={[1.05, 0.65, 0.38]} color={FABRIC_DARK} /></group>;
}

function Kitchen({ width, length }: { width: number; length: number }) {
  const counterWidth = Math.min(width - 0.5, 3.8);
  return <group><Box position={[0, 0.52, -length / 2 + 0.42]} size={[counterWidth, 0.9, 0.7]} color={WOOD_DARK} /><Box position={[0, 1, -length / 2 + 0.42]} size={[counterWidth + 0.06, 0.08, 0.76]} color={CERAMIC} /><Box position={[-counterWidth / 2 + 0.45, 1.55, -length / 2 + 0.38]} size={[0.06, 0.85, 0.06]} color={METAL} /><Box position={[0, 1.72, -length / 2 + 0.38]} size={[counterWidth, 0.06, 0.05]} color={METAL} /><Box position={[0, 0.48, 0.35]} size={[Math.min(1.8, width * 0.45), 0.82, 0.62]} color={WOOD} /><Box position={[0, 0.94, 0.35]} size={[Math.min(1.9, width * 0.48), 0.08, 0.68]} color={CERAMIC} /><Box position={[width / 2 - 0.38, 1.25, -length / 2 + 0.4]} size={[0.5, 1.8, 0.58]} color="#aeb6b3" /></group>;
}

function BathroomFixtures({ width, length }: { width: number; length: number }) {
  return <group><mesh position={[-width / 2 + 0.7, 0.28, -length / 2 + 0.75]} castShadow><cylinderGeometry args={[0.38, 0.38, 0.12, 24]} /><meshStandardMaterial color={CERAMIC} roughness={0.35} /></mesh><Box position={[width / 2 - 0.7, 0.45, -length / 2 + 0.65]} size={[0.45, 0.75, 0.8]} color={CERAMIC} /><Box position={[width / 2 - 0.7, 0.9, -length / 2 + 0.65]} size={[0.45, 0.08, 0.8]} color={GLASS} /></group>;
}

export function RoomFurnishings({ roomType, width, length }: { roomType: RoomType; width: number; length: number }) {
  const bedroom = ['bedroom', 'master_bedroom', 'guest_bedroom'].includes(roomType);
  const living = ['living_room', 'family_lounge', 'home_theatre'].includes(roomType);
  const dining = roomType === 'dining_room';
  const kitchen = roomType === 'kitchen';
  const bathroom = ['bathroom', 'master_bathroom'].includes(roomType);

  return (
    <group raycast={() => null}>
      {bedroom && <><Bed width={width} length={length} /><BedsideTable position={[-Math.min(1.35, width * 0.33), 0.65, -0.45]} /><BedsideTable position={[Math.min(1.35, width * 0.33), 0.65, -0.45]} /><Wardrobe position={[width / 2 - 0.75, 1.2, length / 2 - 0.48]} /><Door position={[-width / 2 + 0.08, 1.1, length / 2 - 0.85]} rotation={[0, Math.PI / 2, 0]} /><Door position={[width / 2 - 0.08, 1.1, -length / 2 + 0.85]} rotation={[0, Math.PI / 2, 0]} /></>}
      {living && <><Sofa position={[-0.8, 0, -length / 2 + 1.15]} /><Sofa position={[-width / 2 + 0.75, 0, 0.55]} rotation={[0, Math.PI / 2, 0]} /><CoffeeTable position={[0.55, 0, 0.15]} /><Box position={[width / 2 - 0.35, 0.65, -length / 2 + 0.45]} size={[0.5, 1.2, 1.6]} color={WOOD_DARK} /></>}
      {dining && <DiningTable width={width} />}
      {kitchen && <Kitchen width={width} length={length} />}
      {bathroom && <BathroomFixtures width={width} length={length} />}
    </group>
  );
}
