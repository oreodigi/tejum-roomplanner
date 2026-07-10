'use client';

import type { CSSProperties } from 'react';
import { DEVICE_CATALOG } from '@/lib/constants/visual-planner';
import { DeviceIcon, getDeviceVisual } from './DeviceIcon';

interface DevicePaletteProps {
  selectedDeviceKey: string | null;
  onSelect: (deviceKey: string | null) => void;
  horizontal?: boolean;
}

export function DevicePalette({ selectedDeviceKey, onSelect, horizontal = false }: DevicePaletteProps) {
  return (
    <div className={`device-palette ${horizontal ? 'is-horizontal' : ''}`}>
      {DEVICE_CATALOG.map((device) => {
        const selected = selectedDeviceKey === device.key;
        const visual = getDeviceVisual(device.key);
        return (
          <button
            type="button"
            key={device.key}
            className={`device-palette__item ${selected ? 'is-selected' : ''}`}
            onClick={() => onSelect(selected ? null : device.key)}
            aria-pressed={selected}
            style={{ '--device-color': visual.color } as CSSProperties}
          >
            <DeviceIcon deviceKey={device.key} aria-hidden="true" />
            <span>{device.shortLabel}</span>
          </button>
        );
      })}
    </div>
  );
}
