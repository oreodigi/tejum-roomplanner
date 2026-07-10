'use client';

import { OrbitControls } from '@react-three/drei';
import { useState } from 'react';
import type { DevicePlacement, SpatialVector } from '@/lib/types';
import type { VisualPlannerRoom } from '@/lib/stores/visual-planner-store';
import { DeviceModel } from './DeviceModel';
import { RoomFurnishings } from './RoomFurnishings';
import { RoomShell } from './RoomShell';

interface RoomSceneProps {
  room: VisualPlannerRoom;
  selectedPlacementId: string | null;
  selectedDeviceKey: string | null;
  showCeiling: boolean;
  topView: boolean;
  onSelectPlacement: (placementId: string | null) => void;
  onSurfacePlace: (position: SpatialVector, wallId: string) => void;
  onMovePlacement: (placementId: string, position: SpatialVector) => void;
  onDeletePlacement: (placementId: string) => void;
}

export function RoomScene({ room, selectedPlacementId, selectedDeviceKey, showCeiling, topView, onSelectPlacement, onSurfacePlace, onMovePlacement, onDeletePlacement }: RoomSceneProps) {
  const [dragging, setDragging] = useState(false);
  const { width_m: width, length_m: length, height_m: height } = room.layout;

  return (
    <>
      <color attach="background" args={['#1a2d34']} />
      <ambientLight intensity={0.85} />
      <hemisphereLight args={['#ffffff', '#b0c4de', 0.7]} />
      <directionalLight position={[5, 8, 5]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0005} />
      <group onPointerMissed={() => onSelectPlacement(null)}>
        <RoomShell width={width} length={length} height={height} showCeiling={showCeiling} selectedDeviceKey={selectedDeviceKey} onPlace={onSurfacePlace} />
        <RoomFurnishings roomType={room.roomType} width={width} length={length} />
        {room.placements.map((placement: DevicePlacement, index) => (
          <DeviceModel
            key={placement.id}
            placement={placement}
            labelLane={index % 3}
            roomWidth={width}
            roomLength={length}
            roomHeight={height}
            selected={placement.id === selectedPlacementId}
            onSelect={() => onSelectPlacement(placement.id)}
            onMove={(position) => onMovePlacement(placement.id, position)}
            onDelete={() => onDeletePlacement(placement.id)}
            onDragStateChange={setDragging}
          />
        ))}
      </group>
      <OrbitControls
        makeDefault
        target={[0, Math.min(1.5, height / 2), 0]}
        minDistance={3}
        maxDistance={14}
        maxPolarAngle={topView ? 0.05 : Math.PI / 2.02}
        minPolarAngle={topView ? 0 : 0.25}
        enablePan
        enabled={!dragging}
      />
    </>
  );
}
