'use client';

import React from 'react';
import { usePlannerStore } from '@/lib/stores/planner-store';
import { PLANNER_STEPS, getStepIndex } from '@/lib/constants/steps';

export function MobileProgressBar() {
  const { currentStep, completedSteps } = usePlannerStore();
  const currentIdx = getStepIndex(currentStep);
  const completionPct = usePlannerStore((s) => s.getCompletionPct());
  const currentStepData = PLANNER_STEPS[currentIdx];

  return (
    <div className="bg-bg-primary/95 backdrop-blur-xl border-b border-glass-border p-4 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-text-primary">
          {currentStepData?.title || 'Planning'}
        </span>
        <span className="text-xs font-medium text-accent">
          {completionPct}%
        </span>
      </div>
      <div className="flex gap-1 h-1.5">
        {PLANNER_STEPS.map((step, idx) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = idx === currentIdx;
          
          return (
            <div
              key={step.id}
              className={`flex-1 rounded-full transition-all duration-300 ${
                isCompleted ? 'bg-accent' : 
                isCurrent ? 'bg-accent opacity-60' : 'bg-glass'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
