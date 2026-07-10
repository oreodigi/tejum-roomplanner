import type { AutomationPackage } from '@/lib/constants/visual-planner';
import type { DevicePlacement, ProjectReadiness } from '@/lib/types';
import type { GuestPropertyDraft } from '@/lib/stores/visual-planner-store';
import { calculateBOQ } from './boq/boq-engine';

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
  property: GuestPropertyDraft,
  readiness: ProjectReadiness
): VisualEstimate {
  const boq = calculateBOQ(placements, property, readiness);

  return {
    hardwareLow: boq.hardwareTotal[0] + boq.networkingTotal[0],
    hardwareHigh: boq.hardwareTotal[1] + boq.networkingTotal[1],
    installationLow: boq.installationTotal[0],
    installationHigh: boq.installationTotal[1],
    integrationLow: boq.programmingTotal[0],
    integrationHigh: boq.programmingTotal[1],
    rangeLow: boq.grandTotal[0],
    rangeHigh: boq.grandTotal[1],
  };
}

export function formatCompactCurrency(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(value >= 1000000 ? 1 : 2).replace(/\.00$/, '')}L`;
  if (value >= 1000) return `₹${Math.round(value / 1000)}K`;
  return `₹${value.toLocaleString('en-IN')}`;
}
