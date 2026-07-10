import type { ProjectReadiness, AutomationScenario, DevicePlacement } from '@/lib/types';
import type { GuestPropertyDraft, VisualPlannerRoom } from '@/lib/stores/visual-planner-store';
import type { BOQEstimate } from '../boq/boq-types';

export type ValidationSeverity = 'info' | 'warning' | 'critical';

export interface ValidationNotice {
  code: string;
  severity: ValidationSeverity;
  message: string;
  resolution?: string;
}

export function validateSmartHomePlan(
  property: GuestPropertyDraft,
  readiness: ProjectReadiness,
  rooms: VisualPlannerRoom[],
  scenarios: AutomationScenario[],
  boq: BOQEstimate
): ValidationNotice[] {
  const notices: ValidationNotice[] = [];
  
  // 1. Budget mismatch check
  if (property.budgetRange === 'under_1l' && boq.grandTotal[0] > 150000) {
    notices.push({
      code: 'BUDGET_EXCEEDED',
      severity: 'warning',
      message: 'Your selected features exceed the indicated budget.',
      resolution: 'Consider removing some premium integrations or upgrading your budget range.',
    });
  }

  // 2. Electrical readiness mismatch
  if (readiness.electrical === 'switchboards_installed' && property.occupancy === 'occupied') {
    const hasCurtains = rooms.some(r => r.placements.some((p: DevicePlacement) => p.device_key === 'curtain'));
    if (hasCurtains) {
      notices.push({
        code: 'HARDWIRED_RETROFIT',
        severity: 'critical',
        message: 'Curtain motors require dedicated wiring which might not be present.',
        resolution: 'We will need to assess if surface wiring is acceptable or if civil work is required.',
      });
    }
  }

  // 3. Network coverage warning
  const totalArea = rooms.reduce((acc, r) => acc + (r.layout.width_m * r.layout.length_m), 0);
  // Rough conversion to sqft: 1 sq m = 10.76 sq ft. Assuming layout dimensions are in meters.
  const totalSqft = totalArea * 10.76;
  if (totalSqft > 3000 && property.floors > 1 && readiness.network !== 'mesh_wifi') {
    notices.push({
      code: 'NETWORK_COVERAGE',
      severity: 'warning',
      message: 'Large multi-floor properties require robust networking.',
      resolution: 'We have included Enterprise Mesh WiFi in your estimate to ensure stable performance.',
    });
  }

  // 4. Power backup for heavy loads
  if (readiness.backupPower === 'none') {
    const hasHeavyLoad = rooms.some(r => r.placements.some((p: DevicePlacement) => p.device_key === 'ac'));
    if (hasHeavyLoad) {
      notices.push({
        code: 'NO_BACKUP_POWER',
        severity: 'info',
        message: 'No backup power is specified, but heavy loads (ACs) are automated.',
        resolution: 'During power outages, automation for these devices will be unavailable.',
      });
    }
  }

  // 5. Incomplete mapping
  const emptyRooms = rooms.filter(r => r.placements.length === 0);
  if (emptyRooms.length > 0) {
    notices.push({
      code: 'EMPTY_ROOMS',
      severity: 'info',
      message: `You have ${emptyRooms.length} room(s) with no devices placed.`,
      resolution: 'You can leave them as is, or our consultants can suggest a setup for them.',
    });
  }

  return notices;
}
