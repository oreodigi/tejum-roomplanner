'use client';

import { WandSparkles } from 'lucide-react';
import { DevicePalette } from './DevicePalette';
import { PlacementInspector } from './PlacementInspector';
import { RoomMiniMap } from './RoomMiniMap';
import type { RoomSetupProps } from './types';

export function MobileRoomSetup(props: RoomSetupProps) {
  const selectedPlacement = props.room.placements.find((placement) => placement.id === props.selectedPlacementId) ?? null;

  return (
    <div className="mobile-room-setup">
      <RoomMiniMap
        room={props.room}
        selectedDeviceKey={props.selectedDeviceKey}
        selectedPlacementId={props.selectedPlacementId}
        onPlace={props.onPlace}
        onSelectPlacement={props.onSelectPlacement}
      />
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
