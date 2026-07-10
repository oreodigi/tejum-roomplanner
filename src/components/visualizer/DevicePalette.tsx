'use client';

import { BellRing, Blinds, Cctv, CloudAlert, Droplets, Fan, Flame, Lightbulb, LockKeyhole, PanelsTopLeft, PlugZap, Router, ScanLine, Snowflake, Speaker, SunMedium, Tv } from 'lucide-react';
import { DEVICE_CATALOG } from '@/lib/constants/visual-planner';

const ICONS = { BellRing, Blinds, Cctv, CloudAlert, Droplets, Fan, Flame, Lightbulb, LockKeyhole, PanelsTopLeft, PlugZap, Router, ScanLine, Snowflake, Speaker, SunMedium, Tv };

interface DevicePaletteProps {
  selectedDeviceKey: string | null;
  onSelect: (deviceKey: string | null) => void;
  horizontal?: boolean;
}

export function DevicePalette({ selectedDeviceKey, onSelect, horizontal = false }: DevicePaletteProps) {
  return (
    <div className={`device-palette ${horizontal ? 'is-horizontal' : ''}`}>
      {DEVICE_CATALOG.map((device) => {
        const Icon = ICONS[device.icon as keyof typeof ICONS] ?? PanelsTopLeft;
        const selected = selectedDeviceKey === device.key;
        return (
          <button
            type="button"
            key={device.key}
            className={`device-palette__item ${selected ? 'is-selected' : ''}`}
            onClick={() => onSelect(selected ? null : device.key)}
            aria-pressed={selected}
          >
            <Icon aria-hidden="true" />
            <span>{device.shortLabel}</span>
          </button>
        );
      })}
    </div>
  );
}
