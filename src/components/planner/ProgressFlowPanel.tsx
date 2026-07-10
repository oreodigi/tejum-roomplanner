'use client';

import React from 'react';
import { usePlannerStore } from '@/lib/stores/planner-store';
import { PLANNER_STEPS, getStepIndex } from '@/lib/constants/steps';
import { Home, CheckCircle2, Circle, ChevronRight } from 'lucide-react';

export function ProgressFlowPanel() {
  const { currentStep, completedSteps } = usePlannerStore();
  const currentIdx = getStepIndex(currentStep);
  const completionPct = usePlannerStore((s) => s.getCompletionPct());

  // Derive counts from store (we'll assume the store has these or we calculate them)
  const roomsCount = 0;
  const devicesCount = 0;
  
  return (
    <div className="h-full bg-bg-secondary flex flex-col p-6 overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
          <Home className="w-5 h-5 text-accent" />
          Smart Home Plan
        </h2>
        <div className="text-sm text-text-secondary mt-1">
          {completionPct}% Complete
        </div>
        
        {/* Animated Progress Bar */}
        <div className="w-full h-1.5 bg-glass rounded-full mt-3 overflow-hidden">
          <div 
            className="h-full bg-accent transition-all duration-700 ease-out" 
            style={{ width: `${completionPct}%` }} 
          />
        </div>
      </div>

      <div className="flex-1">
        <div className="space-y-6">
          {PLANNER_STEPS.map((step, idx) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = idx === currentIdx;
            const isFuture = idx > currentIdx;

            return (
              <div key={step.id} className="relative flex gap-4">
                {/* Timeline Line */}
                {idx !== PLANNER_STEPS.length - 1 && (
                  <div className={`absolute left-3 top-8 bottom-[-16px] w-[2px] rounded-full transition-colors ${
                    isCompleted ? 'bg-accent' : 'bg-glass-border'
                  }`} />
                )}
                
                {/* Node Icon */}
                <div className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full mt-0.5 shadow-sm transition-colors ${
                  isCompleted ? 'bg-accent text-bg-primary' : 
                  isCurrent ? 'bg-accent-muted border-2 border-accent text-accent' : 
                  'bg-glass border border-glass-border text-text-muted'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-2 h-2 fill-current" />}
                </div>

                {/* Content */}
                <div className={`flex-1 ${isFuture ? 'opacity-50' : 'opacity-100'}`}>
                  <h4 className={`text-sm font-semibold transition-colors ${
                    isCurrent ? 'text-accent' : 'text-text-primary'
                  }`}>
                    {step.title}
                  </h4>
                  
                  {isCurrent && (
                    <div className="text-xs text-text-secondary mt-1 animate-fade-in">
                      {step.subtitle}
                    </div>
                  )}

                  {/* Contextual Stats based on step */}
                  {step.id === 'rooms' && roomsCount > 0 && (
                    <div className="text-xs font-medium text-accent mt-1 bg-accent-muted inline-block px-2 py-0.5 rounded-full">
                      {roomsCount} Rooms Planned
                    </div>
                  )}
                  {step.id === 'room_config' && devicesCount > 0 && (
                    <div className="text-xs font-medium text-accent mt-1 bg-accent-muted inline-block px-2 py-0.5 rounded-full">
                      {devicesCount} Devices Added
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
