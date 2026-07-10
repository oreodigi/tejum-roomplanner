'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Box, Eye, EyeOff, Map, WandSparkles } from 'lucide-react';
import { DevicePalette } from './DevicePalette';
import { PlacementInspector } from './PlacementInspector';
import { RoomMiniMap } from './RoomMiniMap';
import type { RoomSetupProps } from './types';

const RoomCanvas3D = dynamic(() => import('./RoomCanvas3D'), {
  ssr: false,
  loading: () => <div className="room-canvas room-canvas--loading"><span>Preparing 3D room...</span></div>,
});

export function MobileRoomSetup(props: RoomSetupProps) {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const selectedPlacement = props.room.placements.find((placement) => placement.id === props.selectedPlacementId) ?? null;

  return (
    <div className="mobile-room-setup">
      <div className="mobile-view-toolbar">
        <div className="mobile-view-switch" role="group" aria-label="Room view">
          <button type="button" className={viewMode === '2d' ? 'is-active' : ''} onClick={() => setViewMode('2d')} aria-pressed={viewMode === '2d'}>
            <Map /><span>2D plan</span>
          </button>
          <button type="button" className={viewMode === '3d' ? 'is-active' : ''} onClick={() => setViewMode('3d')} aria-pressed={viewMode === '3d'}>
            <Box /><span>3D room</span>
          </button>
        </div>
        {viewMode === '3d' && (
          <button type="button" className="mobile-ceiling-toggle" onClick={props.onToggleCeiling} aria-pressed={props.showCeiling}>
            {props.showCeiling ? <EyeOff /> : <Eye />}
            <span>{props.showCeiling ? 'Hide ceiling' : 'Show ceiling'}</span>
          </button>
        )}
      </div>
      <div className={`mobile-room-viewport is-${viewMode}`}>
        {viewMode === '2d' ? (
          <RoomMiniMap
            room={props.room}
            selectedDeviceKey={props.selectedDeviceKey}
            selectedPlacementId={props.selectedPlacementId}
            onPlace={props.onPlace}
            onSelectPlacement={props.onSelectPlacement}
          />
        ) : (
          <RoomCanvas3D
            room={props.room}
            selectedPlacementId={props.selectedPlacementId}
            selectedDeviceKey={props.selectedDeviceKey}
            showCeiling={props.showCeiling}
            onSelectPlacement={props.onSelectPlacement}
            onPlace={props.onPlace}
          />
        )}
      </div>
      <div className="mobile-room-setup__recommendation">
        <div><strong>{props.room.setupTier.replace('_', ' ')} setup</strong><span>{props.room.placements.length} devices placed</span></div>
        <button type="button" onClick={props.onApplyRecommended}><WandSparkles /> Apply</button>
      </div>
      <div className="mobile-device-tray">
        <span>Add a device</span>
        <DevicePalette horizontal selectedDeviceKey={props.selectedDeviceKey} onSelect={props.onSelectDevice} />
      </div>
      {selectedPlacement && (
        <PlacementInspector
          placement={selectedPlacement}
          onUpdate={(updates) => props.onUpdatePlacement(selectedPlacement.id, updates)}
          onDelete={() => props.onDeletePlacement(selectedPlacement.id)}
        />
      )}
    </div>
  );
}
