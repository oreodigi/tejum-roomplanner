import type { AutomationPackage, SetupTier } from '@/lib/constants/visual-planner';
import type { ProjectReadiness, RoomType } from '@/lib/types';
import type { GuestPropertyDraft } from '@/lib/stores/visual-planner-store';

export interface AdvisorContext {
  property: GuestPropertyDraft;
  readiness: ProjectReadiness;
  automationPackage: AutomationPackage | null;
  roomType: RoomType;
  setupTier: SetupTier;
  floorNumber: number;
}

export interface DeviceRecommendation {
  deviceKey: string;
  confidence: number; // 0 to 100
  reason: string;
  isRequired: boolean; // e.g. switchboard for new construction
  quantity: number;
}

export interface RuleResult {
  additions: Omit<DeviceRecommendation, 'confidence'>[];
  removals: string[]; // deviceKeys to actively suppress
  confidenceModifiers: Record<string, number>; // Adjust confidence by + or -
}

export type AdvisorRule = (context: AdvisorContext) => RuleResult;
