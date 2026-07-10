'use client';

import { DevicePalette } from '@/components/visualizer/DevicePalette';

export function MobileDeviceTray({ selectedDeviceKey, onSelect }: { selectedDeviceKey: string | null; onSelect: (deviceKey: string | null) => void }) {
  return <div className="mobile-device-tray"><span>Devices</span><DevicePalette horizontal selectedDeviceKey={selectedDeviceKey} onSelect={onSelect} /></div>;
}
