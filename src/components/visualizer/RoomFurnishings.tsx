'use client';

import type { RoomType } from '@/lib/types';

const WOOD = '#76513a';
const WOOD_DARK = '#40332e';
const FABRIC = '#b7a28f';
const FABRIC_DARK = '#806e64';
const METAL = '#879395';
const GLASS = '#75b6bd';
const CERAMIC = '#dce4df';

type Vec3 = [number, number, number];

function Box({ position, size, color, rotation = [0, 0, 0] }: { position: Vec3; size: Vec3; color: string; rotation?: Vec3 }) {
  return <mesh position={position} rotation={rotation} castShadow receiveShadow><boxGeometry args={size} /><meshStandardMaterial color={color} roughness={0.68} /></mesh>;
}

function Cushion({ position, size, color, rotation = [0, 0, 0] }: { position: Vec3; size: Vec3; color: string; rotation?: Vec3 }) {
  return <mesh position={position} rotation={rotation} scale={[size[0], size[1], size[2]]} castShadow><sphereGeometry args={[0.5, 16, 10]} /><meshStandardMaterial color={color} roughness={0.92} /></mesh>;
}

function Door({ position, rotation = [0, 0, 0] }: { position: Vec3; rotation?: Vec3 }) {
  return (
    <group position={position} rotation={rotation}>
      <Box position={[0, 1.05, 0]} size={[0.78, 2.1, 0.07]} color={WOOD} />
      <Box position={[-0.45, 1.05, 0]} size={[0.08, 2.22, 0.12]} color={WOOD_DARK} />
      <Box position={[0.45, 1.05, 0]} size={[0.08, 2.22, 0.12]} color={WOOD_DARK} />
      <Box position={[0, 2.16, 0]} size={[0.98, 0.08, 0.12]} color={WOOD_DARK} />
      <mesh position={[0.28, 1.05, -0.055]}><sphereGeometry args={[0.045, 12, 12]} /><meshStandardMaterial color={METAL} metalness={0.8} roughness={0.2} /></mesh>
    </group>
  );
}

function Bed({ width, length }: { width: number; length: number }) {
  const bedWidth = Math.min(2.15, width * 0.58);
  const bedLength = Math.min(2.35, length * 0.55);
  const z = -length / 2 + bedLength / 2 + 0.34;
  return (
    <group position={[0, 0, z]}>
      <Box position={[0, 0.23, 0]} size={[bedWidth, 0.34, bedLength]} color={WOOD_DARK} />
      <Box position={[0, 0.46, 0.03]} size={[bedWidth - 0.08, 0.18, bedLength - 0.1]} color="#e5ddd0" />
      <Box position={[0, 1.02, -bedLength / 2 + 0.07]} size={[bedWidth, 1.08, 0.12]} color={WOOD} />
      <Cushion position={[-bedWidth * 0.24, 0.63, -bedLength / 2 + 0.33]} size={[0.48, 0.1, 0.32]} color="#f3eee4" />
      <Cushion position={[bedWidth * 0.24, 0.63, -bedLength / 2 + 0.33]} size={[0.48, 0.1, 0.32]} color="#f3eee4" />
    </group>
  );
}

function BedsideTable({ position }: { position: Vec3 }) {
  return <group position={position}><Box position={[0, 0.38, 0]} size={[0.46, 0.7, 0.46]} color={WOOD} /><Box position={[0, 0.76, 0]} size={[0.5, 0.05, 0.5]} color={WOOD_DARK} /><mesh position={[0, 0.82, 0]}><cylinderGeometry args={[0.07, 0.07, 0.1, 16]} /><meshStandardMaterial color="#f4c75b" emissive="#f4c75b" emissiveIntensity={0.3} /></mesh></group>;
}

function Wardrobe({ position }: { position: Vec3 }) {
  return <group position={position}><Box position={[0, 1.15, 0]} size={[0.76, 2.25, 1.55]} color={WOOD_DARK} /><Box position={[-0.19, 1.15, -0.79]} size={[0.02, 2.05, 0.02]} color={METAL} /><Box position={[0.19, 1.15, -0.79]} size={[0.02, 2.05, 0.02]} color={METAL} /></group>;
}

function Sofa({ position, rotation = [0, 0, 0], width = 2.45 }: { position: Vec3; rotation?: Vec3; width?: number }) {
  return (
    <group position={position} rotation={rotation}>
      <Box position={[0, 0.34, 0]} size={[width, 0.42, 0.9]} color={FABRIC_DARK} />
      <Box position={[0, 0.82, 0.3]} size={[width, 0.82, 0.2]} color={FABRIC_DARK} />
      <Box position={[-width / 2 + 0.12, 0.62, 0]} size={[0.24, 0.68, 0.92]} color={FABRIC} />
      <Box position={[width / 2 - 0.12, 0.62, 0]} size={[0.24, 0.68, 0.92]} color={FABRIC} />
      <Cushion position={[-width * 0.22, 0.64, -0.04]} size={[0.55, 0.25, 0.42]} color={FABRIC} />
      <Cushion position={[width * 0.22, 0.64, -0.04]} size={[0.55, 0.25, 0.42]} color={FABRIC} />
    </group>
  );
}

function CoffeeTable({ position }: { position: Vec3 }) {
  return <group position={position}><mesh position={[0, 0.46, 0]} castShadow><cylinderGeometry args={[0.72, 0.72, 0.11, 32]} /><meshStandardMaterial color={WOOD} roughness={0.45} /></mesh><Box position={[0, 0.22, 0]} size={[0.12, 0.45, 0.12]} color={METAL} /></group>;
}

function MediaConsole({ position, rotation = [0, 0, 0] }: { position: Vec3; rotation?: Vec3 }) {
  return <group position={position} rotation={rotation}><Box position={[0, 0.4, 0]} size={[1.7, 0.65, 0.42]} color={WOOD_DARK} /><Box position={[0, 1.25, 0.08]} size={[1.55, 0.92, 0.06]} color="#151c21" /><Box position={[0, 1.25, 0.045]} size={[1.36, 0.74, 0.012]} color="#226c74" /></group>;
}

function DiningTable({ width, length }: { width: number; length: number }) {
  const tableWidth = Math.min(2.35, width * 0.55);
  const tableLength = Math.min(1.2, length * 0.36);
  return (
    <group position={[0, 0, 0.1]}>
      <Box position={[0, 0.86, 0]} size={[tableWidth, 0.12, tableLength]} color={WOOD} />
      {[-1, 1].map((side) => <Box key={side} position={[side * tableWidth * 0.38, 0.42, 0]} size={[0.1, 0.8, tableLength - 0.08]} color={WOOD_DARK} />)}
      {[-1, 1].map((side) => <Sofa key={side} position={[0, 0, side * (tableLength / 2 + 0.42)]} rotation={[0, side < 0 ? 0 : Math.PI, 0]} width={Math.min(1.65, tableWidth * 0.74)} />)}
      <Box position={[-tableWidth / 2 - 0.4, 0.42, 0]} size={[0.65, 0.72, 0.55]} color={FABRIC_DARK} />
      <Box position={[tableWidth / 2 + 0.4, 0.42, 0]} size={[0.65, 0.72, 0.55]} color={FABRIC_DARK} />
    </group>
  );
}

function Kitchen({ width, length }: { width: number; length: number }) {
  const counterWidth = Math.max(2.2, Math.min(width - 0.5, 3.8));
  const islandWidth = Math.min(1.7, width * 0.42);
  return (
    <group>
      <Box position={[0, 0.52, -length / 2 + 0.42]} size={[counterWidth, 0.92, 0.72]} color={WOOD_DARK} />
      <Box position={[0, 1.02, -length / 2 + 0.42]} size={[counterWidth + 0.08, 0.08, 0.78]} color={CERAMIC} />
      <Box position={[-counterWidth * 0.24, 1.08, -length / 2 + 0.37]} size={[0.55, 0.02, 0.3]} color="#7b9291" />
      <Box position={[counterWidth * 0.22, 1.08, -length / 2 + 0.37]} size={[0.45, 0.02, 0.3]} color="#252b2c" />
      <Box position={[0, 0.5, 0.25]} size={[islandWidth, 0.88, 0.68]} color={WOOD} />
      <Box position={[0, 1, 0.25]} size={[islandWidth + 0.08, 0.08, 0.74]} color={CERAMIC} />
      <Box position={[width / 2 - 0.42, 1.25, -length / 2 + 0.42]} size={[0.55, 1.8, 0.65]} color="#aeb8b5" />
      <Box position={[-width / 2 + 0.32, 1.7, -length / 2 + 0.37]} size={[0.04, 1.2, 0.04]} color={METAL} />
      <Box position={[0, 1.7, -length / 2 + 0.37]} size={[counterWidth, 0.04, 0.04]} color={METAL} />
    </group>
  );
}

function BathroomFixtures({ width, length }: { width: number; length: number }) {
  return <group><mesh position={[-width / 2 + 0.62, 0.22, -length / 2 + 0.62]} castShadow><cylinderGeometry args={[0.36, 0.36, 0.1, 24]} /><meshStandardMaterial color={CERAMIC} roughness={0.35} /></mesh><Box position={[width / 2 - 0.62, 0.42, -length / 2 + 0.62]} size={[0.48, 0.78, 0.72]} color={CERAMIC} /><Box position={[width / 2 - 0.62, 0.88, -length / 2 + 0.62]} size={[0.48, 0.08, 0.72]} color={GLASS} /><Box position={[0, 0.18, length / 2 - 0.45]} size={[width - 0.4, 0.08, 0.68]} color={CERAMIC} /></group>;
}

export function RoomFurnishings({ roomType, width, length }: { roomType: RoomType; width: number; length: number }) {
  const bedroom = ['bedroom', 'master_bedroom', 'guest_bedroom'].includes(roomType);
  const living = ['living_room', 'family_lounge', 'home_theatre'].includes(roomType);
  const dining = roomType === 'dining_room';
  const kitchen = roomType === 'kitchen';
  const bathroom = ['bathroom', 'master_bathroom', 'guest_bathroom', 'powder_room'].includes(roomType);

  return (
    <group raycast={() => null}>
      {bedroom && (() => {
        const bedLength = Math.min(2.35, length * 0.55);
        const bedZ = -length / 2 + bedLength / 2 + 0.34;
        const bedWidth = Math.min(2.15, width * 0.58);
        return <>
          <Bed width={width} length={length} />
          <BedsideTable position={[-bedWidth / 2 - 0.3, 0, bedZ - bedLength / 2 + 0.22]} />
          <BedsideTable position={[bedWidth / 2 + 0.3, 0, bedZ - bedLength / 2 + 0.22]} />
          <Wardrobe position={[-width / 2 + 0.45, 0, length / 2 - 0.9]} />
          <Door position={[width / 2 - 0.06, 0, length / 2 - 0.8]} rotation={[0, Math.PI / 2, 0]} />
        </>;
      })()}
      {living && <><Sofa position={[0, 0, -length / 2 + 0.68]} /><Sofa position={[-width / 2 + 0.72, 0, 0.25]} rotation={[0, Math.PI / 2, 0]} width={1.8} /><CoffeeTable position={[0.35, 0, 0.25]} /><MediaConsole position={[width / 2 - 0.27, 0, 0.05]} rotation={[0, Math.PI / 2, 0]} /></>}
      {dining && <DiningTable width={width} length={length} />}
      {kitchen && <Kitchen width={width} length={length} />}
      {bathroom && <BathroomFixtures width={width} length={length} />}
    </group>
  );
}
