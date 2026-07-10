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

interface DeviceIconProps extends LucideProps {
  deviceKey: string;
}

export function DeviceIcon({ deviceKey, ...props }: DeviceIconProps) {
  const definition = getDeviceDefinition(deviceKey);
  const Icon = DEVICE_ICONS[definition.icon] ?? PanelsTopLeft;
  return <Icon {...props} />;
}
