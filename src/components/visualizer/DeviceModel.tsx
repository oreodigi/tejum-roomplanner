'use client';

import { Html } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { X } from 'lucide-react';
import { useMemo, useState, type CSSProperties } from 'react';
import { Plane, Vector3 } from 'three';
import type { DevicePlacement } from '@/lib/types';
import { CoverageCone } from './CoverageCone';
import { DeviceIcon, getDeviceVisual } from './DeviceIcon';

interface DeviceModelProps {
  placement: DevicePlacement;
  labelLane: number;
  roomWidth: number;
  roomLength: number;
  roomHeight: number;
  selected: boolean;
  onSelect: () => void;
  onMove: (position: DevicePlacement['position']) => void;
  onDelete: () => void;
  onDragStateChange: (dragging: boolean) => void;
}

function DeviceGeometry({ deviceKey, color }: { deviceKey: string; color: string }) {
  if (deviceKey === 'fan') {
    return (
      <group>
        <mesh position={[0, -0.12, 0]}><cylinderGeometry args={[0.04, 0.04, 0.28, 16]} /><meshStandardMaterial color="#879598" metalness={0.75} roughness={0.28} /></mesh>
        <mesh><cylinderGeometry args={[0.14, 0.14, 0.08, 24]} /><meshStandardMaterial color={color} metalness={0.2} roughness={0.32} /></mesh>
        {[0, 1, 2, 3].map((blade) => (
          <mesh key={blade} rotation={[0, (Math.PI * 2 * blade) / 4, 0]} position={[0.36 * Math.sin((Math.PI * 2 * blade) / 4), 0, 0.36 * Math.cos((Math.PI * 2 * blade) / 4)]}>
            <boxGeometry args={[0.11, 0.035, 0.62]} /><meshStandardMaterial color={color} roughness={0.34} />
          </mesh>
        ))}
      </group>
    );
  }
  if (['main_light', 'ceiling_light'].includes(deviceKey)) {
    return <group><mesh><cylinderGeometry args={[0.22, 0.22, 0.07, 32]} /><meshStandardMaterial color="#eef3ef" emissive={color} emissiveIntensity={0.5} /></mesh><mesh position={[0, -0.045, 0]}><cylinderGeometry args={[0.17, 0.17, 0.025, 32]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} /></mesh></group>;
  }
  if (deviceKey === 'smoke_sensor') {
    return <mesh><cylinderGeometry args={[0.17, 0.19, 0.06, 28]} /><meshStandardMaterial color="#f3f4ee" emissive={color} emissiveIntensity={0.35} /></mesh>;
  }
  if (deviceKey === 'ac') {
    return <group><mesh><boxGeometry args={[0.95, 0.22, 0.25]} /><meshStandardMaterial color="#e6ece9" roughness={0.35} /></mesh><mesh position={[0, -0.115, 0.02]}><boxGeometry args={[0.76, 0.015, 0.015]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} /></mesh></group>;
  }
  if (deviceKey === 'tv') {
    return <group><mesh><boxGeometry args={[0.9, 0.52, 0.045]} /><meshStandardMaterial color="#151c21" metalness={0.5} roughness={0.22} /></mesh><mesh position={[0, 0, -0.027]}><boxGeometry args={[0.78, 0.41, 0.012]} /><meshStandardMaterial color="#1f8a91" emissive="#0b3e45" emissiveIntensity={0.45} /></mesh></group>;
  }
  if (['cctv', 'video_doorbell', 'motion_sensor'].includes(deviceKey)) {
    return <group><mesh><boxGeometry args={[0.22, 0.14, 0.12]} /><meshStandardMaterial color="#e7eeeb" roughness={0.3} /></mesh><mesh position={[0, -0.005, 0.067]}><sphereGeometry args={[0.055, 16, 12]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} /></mesh></group>;
  }
  if (deviceKey === 'router') {
    return <group><mesh><boxGeometry args={[0.48, 0.11, 0.32]} /><meshStandardMaterial color="#e7eeeb" roughness={0.35} /></mesh><mesh position={[0, 0.08, 0]}><boxGeometry args={[0.025, 0.22, 0.025]} /><meshStandardMaterial color={color} /></mesh></group>;
  }
  if (deviceKey === 'scene_control') {
    return <group><mesh><boxGeometry args={[0.28, 0.42, 0.07]} /><meshStandardMaterial color="#f0f3ee" roughness={0.3} /></mesh><mesh position={[0, 0.06, -0.04]}><boxGeometry args={[0.12, 0.12, 0.012]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} /></mesh><mesh position={[0, -0.1, -0.04]}><boxGeometry args={[0.12, 0.04, 0.012]} /><meshStandardMaterial color="#8fa09e" /></mesh></group>;
  }
  if (deviceKey === 'curtain') {
    return <group><mesh position={[0, 0.1, 0]}><boxGeometry args={[1.2, 0.05, 0.05]} /><meshStandardMaterial color="#ccc" metalness={0.6} /></mesh><mesh position={[0, -0.4, 0]}><boxGeometry args={[1.1, 1, 0.03]} /><meshStandardMaterial color="#e5e0d8" roughness={0.9} transparent opacity={0.8} /></mesh><mesh position={[0, 0.1, 0.03]}><sphereGeometry args={[0.04, 16, 12]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} /></mesh></group>;
  }
  if (deviceKey === 'smart_lock') {
    return <group><mesh><boxGeometry args={[0.1, 0.35, 0.06]} /><meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} /></mesh><mesh position={[0, 0.05, 0.03]}><boxGeometry args={[0.06, 0.06, 0.01]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} /></mesh><mesh position={[0, -0.05, 0.05]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.015, 0.015, 0.15]} /><meshStandardMaterial color="#888" metalness={0.9} /></mesh></group>;
  }
  if (deviceKey === 'smart_plug') {
    return <group><mesh><boxGeometry args={[0.12, 0.12, 0.06]} /><meshStandardMaterial color="#f3f4ee" roughness={0.4} /></mesh><mesh position={[0, 0, 0.03]}><boxGeometry args={[0.06, 0.06, 0.01]} /><meshStandardMaterial color="#222" /></mesh><mesh position={[0, 0.04, 0.03]}><circleGeometry args={[0.01, 16]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} /></mesh></group>;
  }
  if (['gas_leak_sensor', 'water_leak_sensor'].includes(deviceKey)) {
    return <mesh><cylinderGeometry args={[0.08, 0.09, 0.04, 24]} /><meshStandardMaterial color="#f3f4ee" emissive={color} emissiveIntensity={0.3} /></mesh>;
  }
  return <mesh><boxGeometry args={[0.2, 0.2, 0.1]} /><meshStandardMaterial color="#e7eeeb" roughness={0.35} /></mesh>;
}

export function DeviceModel({ placement, labelLane, roomWidth, roomLength, roomHeight, selected, onSelect, onMove, onDelete, onDragStateChange }: DeviceModelProps) {
  const [dragging, setDragging] = useState(false);
  const dragPlane = useMemo(() => {
    if (placement.placement_type === 'wall') {
      if (placement.wall_id === 'left') return new Plane(new Vector3(1, 0, 0), roomWidth / 2 - 0.14);
      if (placement.wall_id === 'right') return new Plane(new Vector3(1, 0, 0), -roomWidth / 2 + 0.14);
      return new Plane(new Vector3(0, 0, 1), roomLength / 2 - 0.14);
    }
    return new Plane(new Vector3(0, 1, 0), -placement.position.y);
  }, [placement.placement_type, placement.wall_id, placement.position.y, roomWidth, roomLength]);
  const visual = getDeviceVisual(placement.device_key);

  function setDragState(next: boolean) {
    setDragging(next);
    onDragStateChange(next);
  }

  function handlePointerMove(event: ThreeEvent<PointerEvent>) {
    if (!dragging) return;
    event.stopPropagation();
    const point = new Vector3();
    if (!event.ray.intersectPlane(dragPlane, point)) return;
    const margin = 0.14;
    if (placement.placement_type === 'wall') {
      onMove({ x: point.x, y: Math.max(0.2, Math.min(roomHeight - 0.18, point.y)), z: point.z });
      return;
    }
    if (placement.placement_type === 'corner') {
      onMove({ x: point.x, y: Math.max(0.4, Math.min(roomHeight - 0.2, point.y)), z: point.z });
      return;
    }
    onMove({
      x: Math.max(-roomWidth / 2 + margin, Math.min(roomWidth / 2 - margin, point.x)),
      y: placement.position.y,
      z: Math.max(-roomLength / 2 + margin, Math.min(roomLength / 2 - margin, point.z)),
    });
  }

  return (
    <group
      position={[placement.position.x, placement.position.y, placement.position.z]}
      rotation={[placement.rotation.x, placement.rotation.y, placement.rotation.z]}
      onPointerDown={(event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        (event.target as unknown as { setPointerCapture: (pointerId: number) => void }).setPointerCapture(event.pointerId);
        onSelect();
        setDragState(true);
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={(event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        (event.target as unknown as { releasePointerCapture: (pointerId: number) => void }).releasePointerCapture(event.pointerId);
        setDragState(false);
      }}
      onPointerCancel={() => setDragState(false)}
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
      <DeviceGeometry deviceKey={placement.device_key} color={visual.color} />
      {placement.coverage && <CoverageCone coverage={placement.coverage} />}
      <Html center position={[0, 0.48, 0]} distanceFactor={6.5} zIndexRange={[30, 0]}>
        <div
          className={`device-model-label ${selected ? 'is-selected is-full' : 'is-compact'} is-lane-${labelLane} ${dragging ? 'is-dragging' : ''}`}
          style={{ '--device-color': visual.color } as CSSProperties}
          onPointerEnter={(e) => e.currentTarget.classList.add('is-full')}
          onPointerLeave={(e) => { if (!selected) e.currentTarget.classList.remove('is-full'); }}
        >
          <span><DeviceIcon deviceKey={placement.device_key} aria-hidden="true" /></span>
          <strong className="label-text">{placement.display_name}</strong>
          <button
            type="button"
            className="device-model-label__delete"
            aria-label={`Remove ${placement.display_name}`}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
          >
            <X aria-hidden="true" />
          </button>
        </div>
      </Html>
    </group>
  );
}
