'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { WandSparkles } from 'lucide-react';
import { SETUP_TIERS } from '@/lib/constants/visual-planner';
import { DevicePalette } from './DevicePalette';
import { PlacementInspector } from './PlacementInspector';
import type { RoomSetupProps } from './types';
import { VisualizerToolbar } from './VisualizerToolbar';

const RoomCanvas3D = dynamic(() => import('./RoomCanvas3D'), {
  ssr: false,
  loading: () => <div className="room-canvas room-canvas--loading"><span>Preparing room visualizer…</span></div>,
});

export function DesktopRoomSetup(props: RoomSetupProps) {
  const [topView, setTopView] = useState(false);
  const selectedPlacement = props.room.placements.find((placement) => placement.id === props.selectedPlacementId) ?? null;

  return (
    <div className="desktop-room-setup">
      <section className="desktop-room-setup__canvas">
        <div className="room-setup-titlebar">
          <div><span>Visual room setup</span><h2>{props.room.name}</h2></div>
          <VisualizerToolbar showCeiling={props.showCeiling} topView={topView} onToggleCeiling={props.onToggleCeiling} onToggleView={() => setTopView((value) => !value)} />
        </div>
        <RoomCanvas3D
          room={props.room}
          selectedPlacementId={props.selectedPlacementId}
          selectedDeviceKey={props.selectedDeviceKey}
          showCeiling={props.showCeiling}
          topView={topView}
          onSelectPlacement={props.onSelectPlacement}
          onPlace={props.onPlace}
        />
      </section>
      <aside className="desktop-room-setup__panel">
        <div className="setup-tier-row">
          {SETUP_TIERS.map((tier) => <span key={tier.id} className={props.room.setupTier === tier.id ? 'is-active' : ''}>{tier.label}</span>)}
        </div>
        <button type="button" className="recommended-setup-button" onClick={props.onApplyRecommended}>
          <WandSparkles /><span><strong>Apply recommended setup</strong><small>Auto-place a balanced device plan</small></span>
        </button>
        <div className="panel-section-heading"><span>Add a device</span><small>{props.room.placements.length} placed</small></div>
        <DevicePalette selectedDeviceKey={props.selectedDeviceKey} onSelect={props.onSelectDevice} />
        <PlacementInspector
          placement={selectedPlacement}
          onUpdate={(updates) => selectedPlacement && props.onUpdatePlacement(selectedPlacement.id, updates)}
          onDelete={() => selectedPlacement && props.onDeletePlacement(selectedPlacement.id)}
        />
        <div className="dimension-editor">
          {([['width_m', 'Width'], ['length_m', 'Length'], ['height_m', 'Height']] as const).map(([key, label]) => (
            <label key={key}><span>{label}</span><input type="number" min="1" max="20" step="0.1" value={props.room.layout[key]} onChange={(event) => props.onUpdateDimensions({ [key]: Number(event.target.value) })} /><small>m</small></label>
          ))}
        </div>
      </aside>
    </div>
  );
}
