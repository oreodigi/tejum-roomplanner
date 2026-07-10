import type { AdvisorContext, DeviceRecommendation } from './advisor-types';
import { baseRoomRule, tierRule } from './room-rules';
import { readinessRule } from './readiness-rules';
import { budgetRule } from './budget-rules';

const ALL_RULES = [baseRoomRule, tierRule, readinessRule, budgetRule];

export function generateRoomRecommendations(context: AdvisorContext): DeviceRecommendation[] {
  const recommendationsMap = new Map<string, DeviceRecommendation>();

  // Run all rules
  for (const rule of ALL_RULES) {
    const result = rule(context);

    // Process additions
    for (const addition of result.additions) {
      if (!recommendationsMap.has(addition.deviceKey)) {
        // Base confidence starts at 50 if it's an addition
        // If it is strictly required, start at 90
        const baseConfidence = addition.isRequired ? 90 : 50;
        recommendationsMap.set(addition.deviceKey, {
          ...addition,
          confidence: baseConfidence,
        });
      } else {
        // Just ensure required flag is updated and quantity maxed out
        const existing = recommendationsMap.get(addition.deviceKey)!;
        existing.isRequired = existing.isRequired || addition.isRequired;
        existing.quantity = Math.max(existing.quantity, addition.quantity);
      }
    }

    // Process confidence modifiers
    for (const [deviceKey, modifier] of Object.entries(result.confidenceModifiers)) {
      if (recommendationsMap.has(deviceKey)) {
        const existing = recommendationsMap.get(deviceKey)!;
        existing.confidence = Math.max(0, Math.min(100, existing.confidence + modifier));
      }
    }

    // Process removals
    for (const removal of result.removals) {
      recommendationsMap.delete(removal);
    }
  }

  // Filter out low confidence recommendations (< 40) unless they are strictly required
  return Array.from(recommendationsMap.values()).filter(rec => rec.isRequired || rec.confidence >= 40);
}
