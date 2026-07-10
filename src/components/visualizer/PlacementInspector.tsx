'use client';

import { Move3D, Trash2 } from 'lucide-react';
import type { DevicePlacement } from '@/lib/types';

interface PlacementInspectorProps {
  placement: DevicePlacement | null;
  onUpdate: (updates: Partial<DevicePlacement>) => void;
  onDelete: () => void;
}

export function PlacementInspector({ placement, onUpdate, onDelete }: PlacementInspectorProps) {
  if (!placement) {
    return (
      <div className="placement-inspector is-empty">
        <Move3D aria-hidden="true" />
        <div><strong>Select a placed device</strong><span>Move it precisely or remove it.</span></div>
      </div>
    );
  }

  return (
    <div className="placement-inspector">
      <div className="placement-inspector__heading">
        <div><span>Selected device</span><strong>{placement.display_name}</strong></div>
        <button type="button" onClick={onDelete} aria-label={`Remove ${placement.display_name}`}><Trash2 /></button>
      </div>
      <div className="placement-inspector__coordinates">
        {(['x', 'y', 'z'] as const).map((axis) => (
          <label key={axis}>
            <span>{axis.toUpperCase()}</span>
            <input
              type="number"
              step="0.1"
              value={Number(placement.position[axis].toFixed(2))}
              onChange={(event) => onUpdate({ position: { ...placement.position, [axis]: Number(event.target.value) } })}
            />
          </label>
        ))}
      </div>
    </div>
  );
}
