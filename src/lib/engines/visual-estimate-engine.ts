import { getDeviceDefinition, type AutomationPackage } from '@/lib/constants/visual-planner';
import type { DevicePlacement } from '@/lib/types';

export interface VisualEstimate {
  hardwareLow: number;
  hardwareHigh: number;
  installationLow: number;
  installationHigh: number;
  integrationLow: number;
  integrationHigh: number;
  rangeLow: number;
  rangeHigh: number;
}

export function calculateVisualEstimate(
  placements: DevicePlacement[],
  automationPackage: AutomationPackage | null,
): VisualEstimate {
  const hardwareLow = placements.reduce((sum, placement) => sum + getDeviceDefinition(placement.device_key).priceLow, 0);
  const hardwareHigh = placements.reduce((sum, placement) => sum + getDeviceDefinition(placement.device_key).priceHigh, 0);
  const installationLow = Math.round(hardwareLow * 0.12);
  const installationHigh = Math.round(hardwareHigh * 0.18);
  const integrationFactor = automationPackage === 'full_home' || automationPackage === 'not_sure' ? 0.1 : 0.06;
  const integrationLow = Math.max(placements.length > 0 ? 12000 : 0, Math.round(hardwareLow * integrationFactor));
  const integrationHigh = Math.max(placements.length > 0 ? 24000 : 0, Math.round(hardwareHigh * (integrationFactor + 0.04)));

  return {
    hardwareLow,
    hardwareHigh,
    installationLow,
    installationHigh,
    integrationLow,
    integrationHigh,
    rangeLow: hardwareLow + installationLow + integrationLow,
    rangeHigh: hardwareHigh + installationHigh + integrationHigh,
  };
}

export function formatCompactCurrency(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(value >= 1000000 ? 1 : 2).replace(/\.00$/, '')}L`;
  if (value >= 1000) return `₹${Math.round(value / 1000)}K`;
  return `₹${value.toLocaleString('en-IN')}`;
}
