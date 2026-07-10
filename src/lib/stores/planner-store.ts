import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlannerStep, AutomationInterest, ProjectMode } from '@/lib/types';
import { PLANNER_STEPS } from '@/lib/constants/steps';

// ============================================================
// PLANNER STORE — Zustand with auto-save
// ============================================================

export interface PlannerState {
  // Project identity
  projectId: string | null;
  customerId: string | null;
  mode: ProjectMode;
  currentStep: PlannerStep;

  // Step completion tracking
  completedSteps: PlannerStep[];
  skippedSteps: PlannerStep[];

  // Draft data (local, before persisting to DB)
  customerDraft: {
    full_name?: string;
    mobile?: string;
    whatsapp?: string;
    email?: string;
    city?: string;
    state?: string;
    pincode?: string;
    preferred_contact?: string;
    relationship?: string;
  };

  automationInterests: AutomationInterest[];

  // Save state
  isDirty: boolean;
  lastSavedAt: string | null;
  saveStatus: 'saved' | 'saving' | 'unsaved' | 'error';

  // Actions
  setProject: (projectId: string, customerId: string) => void;
  setMode: (mode: ProjectMode) => void;
  setStep: (step: PlannerStep) => void;
  markStepComplete: (step: PlannerStep) => void;
  markStepSkipped: (step: PlannerStep) => void;
  setCustomerDraft: (data: Partial<PlannerState['customerDraft']>) => void;
  setAutomationInterests: (interests: AutomationInterest[]) => void;
  markDirty: () => void;
  markSaved: () => void;
  markSaving: () => void;
  markSaveError: () => void;
  getCompletionPct: () => number;
  reset: () => void;
}

const initialState = {
  projectId: null,
  customerId: null,
  mode: 'customer' as ProjectMode,
  currentStep: 'customer_details' as PlannerStep,
  completedSteps: [] as PlannerStep[],
  skippedSteps: [] as PlannerStep[],
  customerDraft: {},
  automationInterests: [] as AutomationInterest[],
  isDirty: false,
  lastSavedAt: null,
  saveStatus: 'saved' as const,
};

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setProject: (projectId, customerId) =>
        set({ projectId, customerId }),

      setMode: (mode) =>
        set({ mode }),

      setStep: (step) =>
        set({ currentStep: step }),

      markStepComplete: (step) =>
        set((state) => ({
          completedSteps: state.completedSteps.includes(step)
            ? state.completedSteps
            : [...state.completedSteps, step],
          skippedSteps: state.skippedSteps.filter((s) => s !== step),
        })),

      markStepSkipped: (step) =>
        set((state) => ({
          skippedSteps: state.skippedSteps.includes(step)
            ? state.skippedSteps
            : [...state.skippedSteps, step],
        })),

      setCustomerDraft: (data) =>
        set((state) => ({
          customerDraft: { ...state.customerDraft, ...data },
          isDirty: true,
          saveStatus: 'unsaved',
        })),

      setAutomationInterests: (interests) =>
        set({
          automationInterests: interests,
          isDirty: true,
          saveStatus: 'unsaved',
        }),

      markDirty: () =>
        set({ isDirty: true, saveStatus: 'unsaved' }),

      markSaved: () =>
        set({
          isDirty: false,
          saveStatus: 'saved',
          lastSavedAt: new Date().toISOString(),
        }),

      markSaving: () =>
        set({ saveStatus: 'saving' }),

      markSaveError: () =>
        set({ saveStatus: 'error' }),

      getCompletionPct: () => {
        const state = get();
        const totalWeight = PLANNER_STEPS.reduce((sum, s) => sum + s.weight, 0);
        const completedWeight = PLANNER_STEPS.filter((s) =>
          state.completedSteps.includes(s.id)
        ).reduce((sum, s) => sum + s.weight, 0);
        return Math.round((completedWeight / totalWeight) * 100);
      },

      reset: () => set(initialState),
    }),
    {
      name: 'tejum-planner-state',
      partialize: (state) => ({
        projectId: state.projectId,
        customerId: state.customerId,
        mode: state.mode,
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
        skippedSteps: state.skippedSteps,
        customerDraft: state.customerDraft,
        automationInterests: state.automationInterests,
        lastSavedAt: state.lastSavedAt,
      }),
    }
  )
);
