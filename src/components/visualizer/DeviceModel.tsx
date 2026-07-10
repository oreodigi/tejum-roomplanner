'use client';

import { Float, Html } from '@react-three/drei';
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
        <mesh><cylinderGeometry args={[0.13, 0.13, 0.12, 20]} /><meshStandardMaterial color={color} /></mesh>
        {[0, 1, 2].map((blade) => (
          <mesh key={blade} rotation={[0, (Math.PI * 2 * blade) / 3, 0]} position={[0.45 * Math.sin((Math.PI * 2 * blade) / 3), 0, 0.45 * Math.cos((Math.PI * 2 * blade) / 3)]}>
            <boxGeometry args={[0.12, 0.035, 0.72]} /><meshStandardMaterial color={color} roughness={0.34} />
          </mesh>
        ))}
      </group>
    );
  }
  if (['main_light', 'ceiling_light', 'smoke_sensor'].includes(deviceKey)) {
    return <mesh><cylinderGeometry args={[0.18, 0.18, 0.08, 28]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.42} /></mesh>;
  }
  if (['cctv', 'video_doorbell', 'motion_sensor'].includes(deviceKey)) {
    return <mesh><sphereGeometry args={[0.16, 20, 16]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} /></mesh>;
  }
  if (deviceKey === 'router') {
    return <mesh><boxGeometry args={[0.48, 0.11, 0.32]} /><meshStandardMaterial color={color} /></mesh>;
  }
  return <mesh><boxGeometry args={[0.28, 0.32, 0.09]} /><meshStandardMaterial color={color} /></mesh>;
}

export function DeviceModel({ placement, labelLane, roomWidth, roomLength, selected, onSelect, onMove, onDelete, onDragStateChange }: DeviceModelProps) {
  const [dragging, setDragging] = useState(false);
  const dragPlane = useMemo(() => new Plane(new Vector3(0, 1, 0), -placement.position.y), [placement.position.y]);
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
    const margin = 0.16;
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
      <Float speed={1.3 + labelLane * 0.16} rotationIntensity={0.08} floatIntensity={0.06}>
        <DeviceGeometry deviceKey={placement.device_key} color={visual.color} />
      </Float>
      {placement.coverage && <CoverageCone coverage={placement.coverage} />}
      <Html center position={[0, 0.48, 0]} distanceFactor={6.5} zIndexRange={[30, 0]}>
        <div
          className={`device-model-label is-lane-${labelLane} ${selected ? 'is-selected' : ''} ${dragging ? 'is-dragging' : ''}`}
          style={{ '--device-color': visual.color } as CSSProperties}
        >
          <span><DeviceIcon deviceKey={placement.device_key} aria-hidden="true" /></span>
          <strong>{placement.display_name}</strong>
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
