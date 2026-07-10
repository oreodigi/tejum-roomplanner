'use client';

import { Html } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import type { DevicePlacement } from '@/lib/types';
import { CoverageCone } from './CoverageCone';
import { DeviceIcon } from './DeviceIcon';

interface DeviceModelProps {
  placement: DevicePlacement;
  labelLane: number;
  selected: boolean;
  onSelect: () => void;
}

function DeviceGeometry({ deviceKey }: { deviceKey: string }) {
  if (deviceKey === 'fan') {
    return (
      <group>
        <mesh><cylinderGeometry args={[0.13, 0.13, 0.12, 20]} /><meshStandardMaterial color="#153e47" /></mesh>
        {[0, 1, 2].map((blade) => (
          <mesh key={blade} rotation={[0, (Math.PI * 2 * blade) / 3, 0]} position={[0.45 * Math.sin((Math.PI * 2 * blade) / 3), 0, 0.45 * Math.cos((Math.PI * 2 * blade) / 3)]}>
            <boxGeometry args={[0.12, 0.035, 0.72]} /><meshStandardMaterial color="#d8cdbb" />
          </mesh>
        ))}
      </group>
    );
  }
  if (['main_light', 'ceiling_light', 'smoke_sensor'].includes(deviceKey)) {
    return <mesh><cylinderGeometry args={[0.18, 0.18, 0.08, 28]} /><meshStandardMaterial color="#ffd95a" emissive="#ffce26" emissiveIntensity={0.55} /></mesh>;
  }
  if (['cctv', 'video_doorbell', 'motion_sensor'].includes(deviceKey)) {
    return <mesh><sphereGeometry args={[0.16, 20, 16]} /><meshStandardMaterial color="#153e47" emissive="#14b8a6" emissiveIntensity={0.24} /></mesh>;
  }
  if (deviceKey === 'router') {
    return <mesh><boxGeometry args={[0.48, 0.11, 0.32]} /><meshStandardMaterial color="#153e47" /></mesh>;
  }
  return <mesh><boxGeometry args={[0.28, 0.32, 0.09]} /><meshStandardMaterial color="#f4efe5" /></mesh>;
}

export function DeviceModel({ placement, labelLane, selected, onSelect }: DeviceModelProps) {
  return (
    <group
      position={[placement.position.x, placement.position.y, placement.position.z]}
      rotation={[placement.rotation.x, placement.rotation.y, placement.rotation.z]}
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        onSelect();
      }}
    >
      {selected && (
        <mesh scale={1.5}>
          <sphereGeometry args={[0.24, 20, 16]} />
          <meshBasicMaterial color="#ffce26" wireframe transparent opacity={0.78} />
        </mesh>
      )}
      <DeviceGeometry deviceKey={placement.device_key} />
      {placement.coverage && <CoverageCone coverage={placement.coverage} />}
      <Html center position={[0, 0.48, 0]} distanceFactor={6.5} zIndexRange={[30, 0]}>
        <div className={`device-model-label is-lane-${labelLane} ${selected ? 'is-selected' : ''}`}>
          <span><DeviceIcon deviceKey={placement.device_key} aria-hidden="true" /></span>
          <strong>{placement.display_name}</strong>
        </div>
      </Html>
    </group>
  );
}
