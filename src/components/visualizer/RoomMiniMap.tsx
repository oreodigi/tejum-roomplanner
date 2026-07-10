'use client';

import { useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent } from 'react';
import { getDeviceDefinition } from '@/lib/constants/visual-planner';
import type { VisualPlannerRoom } from '@/lib/stores/visual-planner-store';
import { DeviceIcon, getDeviceVisual } from './DeviceIcon';

interface RoomMiniMapProps {
  room: VisualPlannerRoom;
  selectedDeviceKey: string | null;
  selectedPlacementId: string | null;
  onPlace: (position: { x: number; y: number; z: number }) => void;
  onSelectPlacement: (placementId: string | null) => void;
  onMovePlacement: (placementId: string, position: { x: number; y: number; z: number }) => void;
}

export function RoomMiniMap({ room, selectedDeviceKey, selectedPlacementId, onPlace, onSelectPlacement, onMovePlacement }: RoomMiniMapProps) {
  const [draggingPlacementId, setDraggingPlacementId] = useState<string | null>(null);
  const draggingPlacementRef = useRef<string | null>(null);
  const movedRef = useRef(false);

  function pointerToPosition(event: PointerEvent<SVGGElement>, y: number) {
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return null;
    const bounds = svg.getBoundingClientRect();
    const xRatio = Math.max(0.04, Math.min(0.96, (event.clientX - bounds.left) / bounds.width));
    const zRatio = Math.max(0.05, Math.min(0.95, (event.clientY - bounds.top) / bounds.height));
    return {
      x: (xRatio - 0.5) * room.layout.width_m,
      y,
      z: (zRatio - 0.5) * room.layout.length_m,
    };
  }
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
          const pointX = 180 + (placement.position.x / room.layout.width_m) * 310;
          const pointY = 140 + (placement.position.z / room.layout.length_m) * 230;
          const cx = Math.max(62, Math.min(298, pointX));
          const cy = Math.max(30, Math.min(250, pointY + (index % 2 === 0 ? -24 : 24)));
          const device = getDeviceDefinition(placement.device_key);
          const visual = getDeviceVisual(placement.device_key);
          return (
            <g
              key={placement.id}
              className={`room-minimap__device ${selectedPlacementId === placement.id ? 'is-selected' : ''} ${draggingPlacementId === placement.id ? 'is-dragging' : ''}`}
              style={{ '--device-color': visual.color } as CSSProperties}
              onPointerDown={(event) => {
                event.stopPropagation();
                event.currentTarget.setPointerCapture(event.pointerId);
                movedRef.current = false;
                draggingPlacementRef.current = placement.id;
                setDraggingPlacementId(placement.id);
                onSelectPlacement(placement.id);
              }}
              onPointerMove={(event) => {
                if (draggingPlacementRef.current !== placement.id) return;
                event.stopPropagation();
                const position = pointerToPosition(event, placement.position.y);
                if (!position) return;
                movedRef.current = true;
                onMovePlacement(placement.id, position);
              }}
              onPointerUp={(event) => {
                event.stopPropagation();
                event.currentTarget.releasePointerCapture(event.pointerId);
                draggingPlacementRef.current = null;
                setDraggingPlacementId(null);
              }}
              onClick={(event) => {
                event.stopPropagation();
                if (!movedRef.current) onSelectPlacement(placement.id);
              }}
            >
              <line x1={pointX} y1={pointY} x2={cx} y2={cy} />
              <circle cx={pointX} cy={pointY} r="4" />
              <rect x={cx - 52} y={cy - 15} width="104" height="30" rx="9" />
              <DeviceIcon deviceKey={placement.device_key} x={cx - 43} y={cy - 7} width="14" height="14" aria-hidden="true" />
              <text x={cx - 23} y={cy + 3}>{device.shortLabel}</text>
            </g>
          );
        })}
      </svg>
      <span>{room.layout.width_m}m × {room.layout.length_m}m</span>
      {selectedDeviceKey && <strong>Tap the plan to place</strong>}
    </div>
  );
}
