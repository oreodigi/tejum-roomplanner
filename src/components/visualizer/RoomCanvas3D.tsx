'use client';

import { Canvas } from '@react-three/fiber';
import type { SpatialVector } from '@/lib/types';
import type { VisualPlannerRoom } from '@/lib/stores/visual-planner-store';
import { RoomScene } from './RoomScene';

interface RoomCanvas3DProps {
  room: VisualPlannerRoom;
  selectedPlacementId: string | null;
  selectedDeviceKey: string | null;
  showCeiling: boolean;
  topView?: boolean;
  onSelectPlacement: (placementId: string | null) => void;
  onPlace: (position: SpatialVector, wallId?: string | null) => void;
  onMovePlacement: (placementId: string, position: SpatialVector) => void;
}

export default function RoomCanvas3D({ room, selectedPlacementId, selectedDeviceKey, showCeiling, topView = false, onSelectPlacement, onPlace, onMovePlacement }: RoomCanvas3DProps) {
  function handleSurfacePlace(position: SpatialVector, wallId: string) {
    if (!selectedDeviceKey) return;
    onPlace(position, wallId);
  }

  return (
    <div className="room-canvas" aria-label={`3D setup for ${room.name}`}>
      <Canvas
        shadows
        dpr={[1, 1.6]}
        camera={{ position: topView ? [0, 9, 0.01] : [7, 5.5, 7], fov: 42 }}
        gl={{ antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: true }}
      >
        <RoomScene
          room={room}
          selectedPlacementId={selectedPlacementId}
          showCeiling={showCeiling}
          topView={topView}
          onSelectPlacement={onSelectPlacement}
          onSurfacePlace={handleSurfacePlace}
          onMovePlacement={onMovePlacement}
        />
      </Canvas>
      {selectedDeviceKey && <div className="canvas-hint">Tap a wall, ceiling or floor to place</div>}
      {!selectedDeviceKey && room.placements.length > 0 && <div className="canvas-drag-hint">Drag a device to move it</div>}
    </div>
  );
}
