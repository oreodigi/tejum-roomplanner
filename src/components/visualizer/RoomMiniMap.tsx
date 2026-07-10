'use client';

import type { MouseEvent } from 'react';
import type { VisualPlannerRoom } from '@/lib/stores/visual-planner-store';

interface RoomMiniMapProps {
  room: VisualPlannerRoom;
  selectedDeviceKey: string | null;
  selectedPlacementId: string | null;
  onPlace: (position: { x: number; y: number; z: number }) => void;
  onSelectPlacement: (placementId: string | null) => void;
}

export function RoomMiniMap({ room, selectedDeviceKey, selectedPlacementId, onPlace, onSelectPlacement }: RoomMiniMapProps) {
  function handleCanvasClick(event: MouseEvent<SVGSVGElement>) {
    if (!selectedDeviceKey) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const xRatio = (event.clientX - bounds.left) / bounds.width;
    const zRatio = (event.clientY - bounds.top) / bounds.height;
    onPlace({
      x: (xRatio - 0.5) * room.layout.width_m,
      y: 0.1,
      z: (zRatio - 0.5) * room.layout.length_m,
    });
  }

  return (
    <div className="room-minimap">
      <svg viewBox="0 0 360 280" role="img" aria-label={`Top view of ${room.name}`} onClick={handleCanvasClick}>
        <defs>
          <pattern id="room-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeOpacity="0.08" />
          </pattern>
        </defs>
        <rect x="12" y="12" width="336" height="256" rx="18" className="room-minimap__floor" />
        <rect x="12" y="12" width="336" height="256" rx="18" fill="url(#room-grid)" />
        <path d="M 12 94 L 12 12 L 348 12 L 348 268" className="room-minimap__wall" />
        <path d="M 12 94 L 12 150" className="room-minimap__wall" />
        <path d="M 12 150 Q 64 150 64 98" className="room-minimap__door" />
        {room.placements.map((placement, index) => {
          const cx = 180 + (placement.position.x / room.layout.width_m) * 310;
          const cy = 140 + (placement.position.z / room.layout.length_m) * 230;
          return (
            <g
              key={placement.id}
              className={`room-minimap__device ${selectedPlacementId === placement.id ? 'is-selected' : ''}`}
              onClick={(event) => {
                event.stopPropagation();
                onSelectPlacement(placement.id);
              }}
            >
              <circle cx={cx} cy={cy} r="15" />
              <text x={cx} y={cy + 4} textAnchor="middle">{index + 1}</text>
            </g>
          );
        })}
      </svg>
      <span>{room.layout.width_m}m × {room.layout.length_m}m</span>
      {selectedDeviceKey && <strong>Tap the plan to place</strong>}
    </div>
  );
}
