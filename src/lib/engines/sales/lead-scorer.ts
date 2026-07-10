import type { ProjectReadiness } from '@/lib/types';
import type { GuestPropertyDraft, VisualPlannerRoom } from '@/lib/stores/visual-planner-store';
import type { AutomationPackage } from '@/lib/constants/visual-planner';
import type { BOQEstimate } from '../boq/boq-types';

export interface LeadScore {
  score: number; // 0 to 100
  tier: 'hot' | 'warm' | 'cold';
  reasons: string[];
}

export function calculateLeadScore(
  property: GuestPropertyDraft,
  readiness: ProjectReadiness,
  rooms: VisualPlannerRoom[],
  automationPackage: AutomationPackage | null,
  boq: BOQEstimate
): LeadScore {
  let score = 0;
  const reasons: string[] = [];

  // 1. Budget and Estimate
  if (property.budgetRange === '25l_plus') {
    score += 30;
    reasons.push('High indicated budget');
  } else if (property.budgetRange === '1l_2.5l') {
    score += 15;
    reasons.push('Medium indicated budget');
  }

  // If the estimate is very large, it's a high value lead
  if (boq.grandTotal[0] > 500000) {
    score += 20;
    reasons.push('High estimated system value');
  } else if (boq.grandTotal[0] > 200000) {
    score += 10;
  }

  // 2. Readiness / Timeline
  if (readiness.condition === 'new_construction' || property.occupancy === 'new_home') {
    score += 15;
    reasons.push('New construction/home (easier implementation)');
  }
  if (readiness.interior === 'design_stage' || readiness.interior === 'wip') {
    score += 15;
    reasons.push('Professional designer onboarded (serious project)');
  }
  
  // 3. Completeness of plan
  const configuredRooms = rooms.filter(r => r.placements.length > 0).length;
  if (configuredRooms > 0 && configuredRooms === rooms.length) {
    score += 10;
    reasons.push('Fully configured room map');
  } else if (configuredRooms > 0) {
    score += 5;
    reasons.push('Partially configured room map');
  }

  // 4. Automation Package
  if (automationPackage === 'full_home') {
    score += 10;
    reasons.push('Full home automation package selected');
  }

  // Cap at 100
  score = Math.min(100, Math.max(0, score));

  let tier: 'hot' | 'warm' | 'cold' = 'cold';
  if (score >= 60) tier = 'hot';
  else if (score >= 30) tier = 'warm';

  return { score, tier, reasons };
}
