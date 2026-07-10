'use client';

import type { LucideIcon, LucideProps } from 'lucide-react';
import {
  BellRing,
  Blinds,
  Cctv,
  CloudAlert,
  Droplets,
  Fan,
  Flame,
  Lightbulb,
  LockKeyhole,
  PanelsTopLeft,
  PlugZap,
  Router,
  ScanLine,
  Snowflake,
  Speaker,
  SunMedium,
  Tv,
} from 'lucide-react';
import { getDeviceDefinition } from '@/lib/constants/visual-planner';

const DEVICE_ICONS: Record<string, LucideIcon> = {
  BellRing,
  Blinds,
  Cctv,
  CloudAlert,
  Droplets,
  Fan,
  Flame,
  Lightbulb,
  LockKeyhole,
  PanelsTopLeft,
  PlugZap,
  Router,
  ScanLine,
  Snowflake,
  Speaker,
  SunMedium,
  Tv,
};

const DEVICE_VISUALS = {
  controls: { color: '#f8c80e', label: 'Controls' },
  lighting: { color: '#ff9f1c', label: 'Lighting' },
  climate: { color: '#44c7f4', label: 'Climate' },
  security: { color: '#ff6262', label: 'Security' },
  sensors: { color: '#39d39f', label: 'Sensors' },
  entertainment: { color: '#b98cff', label: 'Entertainment' },
  power: { color: '#5b91ff', label: 'Power & network' },
} as const;

export function getDeviceVisual(deviceKey: string) {
  if (['scene_control'].includes(deviceKey)) return DEVICE_VISUALS.controls;
  if (['main_light', 'ceiling_light'].includes(deviceKey)) return DEVICE_VISUALS.lighting;
  if (['fan', 'ac', 'curtain'].includes(deviceKey)) return DEVICE_VISUALS.climate;
  if (['smart_lock', 'video_doorbell', 'cctv'].includes(deviceKey)) return DEVICE_VISUALS.security;
  if (['motion_sensor', 'gas_leak_sensor', 'smoke_sensor', 'water_leak_sensor'].includes(deviceKey)) return DEVICE_VISUALS.sensors;
  if (['tv', 'home_theatre'].includes(deviceKey)) return DEVICE_VISUALS.entertainment;
  return DEVICE_VISUALS.power;
}

interface DeviceIconProps extends LucideProps {
  deviceKey: string;
}

export function DeviceIcon({ deviceKey, ...props }: DeviceIconProps) {
  const definition = getDeviceDefinition(deviceKey);
  const Icon = DEVICE_ICONS[definition.icon] ?? PanelsTopLeft;
  return <Icon {...props} />;
}
