'use client';

import { Canvas } from '@react-three/fiber';
import { getDeviceDefinition } from '@/lib/constants/visual-planner';
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
  onDeletePlacement: (placementId: string) => void;
}

export default function RoomCanvas3D({ room, selectedPlacementId, selectedDeviceKey, showCeiling, topView = false, onSelectPlacement, onPlace, onMovePlacement, onDeletePlacement }: RoomCanvas3DProps) {
  function handleSurfacePlace(position: SpatialVector, wallId: string) {
    if (!selectedDeviceKey) return;
    const def = getDeviceDefinition(selectedDeviceKey);
    if (def.placementType === 'ceiling' && wallId !== 'ceiling') return;
    if (def.placementType === 'floor' && wallId !== 'floor') return;
    if (def.placementType === 'wall' && (wallId === 'ceiling' || wallId === 'floor')) return;
    if (def.placementType === 'corner' && (wallId === 'ceiling' || wallId === 'floor')) return;
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
          selectedDeviceKey={selectedDeviceKey}
          showCeiling={showCeiling}
          topView={topView}
          onSelectPlacement={onSelectPlacement}
          onSurfacePlace={handleSurfacePlace}
          onMovePlacement={onMovePlacement}
          onDeletePlacement={onDeletePlacement}
        />
      </Canvas>
      {selectedDeviceKey && (
        <div className="canvas-hint">
          {(() => {
            const t = getDeviceDefinition(selectedDeviceKey).placementType;
            if (t === 'ceiling') return 'Tap the ceiling to place this device';
            if (t === 'floor') return 'Tap the floor to place this device';
            if (t === 'wall') return 'Tap a wall to place this device';
            if (t === 'corner') return 'Tap a corner area to place this device';
            return 'Tap a surface area to place this device';
          })()}
        </div>
      )}
      {!selectedDeviceKey && room.placements.length > 0 && <div className="canvas-drag-hint">Drag a device to move it</div>}
    </div>
  );
}
