import type { PlannerStep } from '@/lib/types';

// ============================================================
// PLANNER STEP DEFINITIONS
// ============================================================

export interface StepDefinition {
  id: PlannerStep;
  title: string;
  subtitle: string;
  icon: string; // Lucide icon name
  customerVisible: boolean;
  weight: number; // For completion % calculation
}

export const PLANNER_STEPS: StepDefinition[] = [
  {
    id: 'customer_details',
    title: 'Your Details',
    subtitle: 'Tell us about yourself',
    icon: 'User',
    customerVisible: true,
    weight: 5,
  },
  {
    id: 'automation_interest',
    title: 'Automation Interest',
    subtitle: 'What would you like to automate?',
    icon: 'Sparkles',
    customerVisible: true,
    weight: 5,
  },
  {
    id: 'property_details',
    title: 'Property Details',
    subtitle: 'Tell us about your property',
    icon: 'Building2',
    customerVisible: true,
    weight: 10,
  },
  {
    id: 'rooms',
    title: 'Your Rooms',
    subtitle: 'Review and manage rooms',
    icon: 'LayoutGrid',
    customerVisible: true,
    weight: 15,
  },
  {
    id: 'room_config',
    title: 'Room Configuration',
    subtitle: 'Devices, switchboards & controls',
    icon: 'Settings2',
    customerVisible: true,
    weight: 25,
  },
  {
    id: 'lighting',
    title: 'Smart Lighting',
    subtitle: 'Scenes, moods & automation',
    icon: 'Lightbulb',
    customerVisible: true,
    weight: 8,
  },
  {
    id: 'security',
    title: 'Smart Security',
    subtitle: 'Locks, cameras & sensors',
    icon: 'Shield',
    customerVisible: true,
    weight: 8,
  },
  {
    id: 'ai_automation',
    title: 'AI Automation',
    subtitle: 'Smart routines for your lifestyle',
    icon: 'Brain',
    customerVisible: true,
    weight: 7,
  },
  {
    id: 'infrastructure',
    title: 'Infrastructure',
    subtitle: 'Network & electrical readiness',
    icon: 'Wifi',
    customerVisible: true,
    weight: 5,
  },
  {
    id: 'budget',
    title: 'Budget & Priority',
    subtitle: 'Your investment preferences',
    icon: 'IndianRupee',
    customerVisible: true,
    weight: 3,
  },
  {
    id: 'review',
    title: 'Review',
    subtitle: 'Review your requirements',
    icon: 'ClipboardCheck',
    customerVisible: true,
    weight: 4,
  },
  {
    id: 'recommendation',
    title: 'Recommendations',
    subtitle: 'Our suggestions for you',
    icon: 'Award',
    customerVisible: true,
    weight: 2,
  },
  {
    id: 'estimate',
    title: 'Estimate',
    subtitle: 'Preliminary project estimate',
    icon: 'Calculator',
    customerVisible: true,
    weight: 2,
  },
  {
    id: 'summary',
    title: 'Summary',
    subtitle: 'Your smart home plan',
    icon: 'FileText',
    customerVisible: true,
    weight: 1,
  },
];

export function getStepIndex(stepId: PlannerStep): number {
  return PLANNER_STEPS.findIndex((s) => s.id === stepId);
}

export function getNextStep(currentStep: PlannerStep): PlannerStep | null {
  const idx = getStepIndex(currentStep);
  if (idx < 0 || idx >= PLANNER_STEPS.length - 1) return null;
  return PLANNER_STEPS[idx + 1].id;
}

export function getPrevStep(currentStep: PlannerStep): PlannerStep | null {
  const idx = getStepIndex(currentStep);
  if (idx <= 0) return null;
  return PLANNER_STEPS[idx - 1].id;
}

export function getStepPath(projectId: string, step: PlannerStep): string {
  const stepRouteMap: Record<PlannerStep, string> = {
    customer_details: 'customer-details',
    automation_interest: 'automation-interest',
    property_details: 'property-details',
    rooms: 'rooms',
    room_config: 'rooms',
    lighting: 'lighting',
    security: 'security',
    ai_automation: 'ai-automation',
    infrastructure: 'infrastructure',
    budget: 'budget',
    review: 'review',
    recommendation: 'recommendation',
    estimate: 'estimate',
    summary: 'summary',
  };
  return `/planner/${projectId}/${stepRouteMap[step]}`;
}
