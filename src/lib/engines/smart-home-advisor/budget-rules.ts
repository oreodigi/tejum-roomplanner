import type { AdvisorRule, RuleResult } from './advisor-types';

export const budgetRule: AdvisorRule = ({ property }) => {
  const result: RuleResult = { additions: [], removals: [], confidenceModifiers: {} };

  if (property.budgetRange === 'under_1l') {
    // Highly restrict premium additions
    result.removals.push('curtain', 'smart_lock', 'video_doorbell', 'home_theatre', 'cctv');
    result.confidenceModifiers['scene_control'] = -30;
  } else if (property.budgetRange === '1l_2.5l') {
    // Still fairly restricted
    result.confidenceModifiers['curtain'] = -40;
    result.confidenceModifiers['smart_lock'] = -10;
  } else if (property.budgetRange === '25l_plus') {
    // Sky is the limit
    result.confidenceModifiers['curtain'] = +50;
    result.confidenceModifiers['scene_control'] = +50;
    result.confidenceModifiers['motion_sensor'] = +40;
    result.confidenceModifiers['video_doorbell'] = +30;
    result.confidenceModifiers['smart_lock'] = +30;
  }

  return result;
};
