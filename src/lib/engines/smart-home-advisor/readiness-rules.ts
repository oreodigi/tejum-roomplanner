import type { AdvisorRule, RuleResult } from './advisor-types';

export const readinessRule: AdvisorRule = ({ readiness, property }) => {
  const result: RuleResult = { additions: [], removals: [], confidenceModifiers: {} };

  // If electrical is already completed and it's an occupied home/renovation without layout changes,
  // we might want to warn about hardwired things like curtain motors, or decrease their confidence.
  if (readiness.electrical === 'switchboards_installed' && property.occupancy === 'occupied') {
    result.confidenceModifiers['curtain'] = -40; // Hard to add curtain motors later without wiring
    result.confidenceModifiers['smart_lock'] = -20; // Hard to wire a smart lock, though battery models exist
    result.confidenceModifiers['video_doorbell'] = -20; // Might not have power at the door
  }

  // If it's a new construction, increase confidence for embedded/hardwired solutions
  if (readiness.condition === 'new_construction' || property.occupancy === 'new_home') {
    result.confidenceModifiers['curtain'] = +30;
    result.confidenceModifiers['cctv'] = +20; // Easier to run POE cables
    result.confidenceModifiers['router'] = +40; // Can easily plan network backbone
  }

  // If they have no designer and it's just an upgrade, keep it simple
  if (readiness.interior === 'no_designer' && readiness.automationApproach === 'upgrade') {
    result.confidenceModifiers['ceiling_light'] = -50; // Unlikely to change ceiling lights without false ceiling
    result.removals.push('ceiling_light'); // Actually remove it
  }

  // If they have no backup power, maybe suggest it or lower confidence on heavy loads
  if (readiness.backupPower === 'none') {
    result.confidenceModifiers['ac'] = -10; // Might not want to automate heavy loads if power is unstable
  }

  return result;
};
