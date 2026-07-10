'use client';

import React from 'react';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

interface StickyPlannerActionsProps {
  onNext?: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  nextText?: string;
  backText?: string;
  isNextDisabled?: boolean;
  isNextLoading?: boolean;
  showBack?: boolean;
  showSkip?: boolean;
}

export function StickyPlannerActions({
  onNext,
  onBack,
  onSkip,
  nextText = 'Continue',
  backText = 'Back',
  isNextDisabled = false,
  isNextLoading = false,
  showBack = true,
  showSkip = false,
}: StickyPlannerActionsProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 lg:absolute lg:left-0 lg:right-0 z-40 p-4 lg:p-6 bg-bg-primary/95 backdrop-blur-xl border-t border-glass-border">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
        {showBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center gap-2 px-4 lg:px-6 py-3 lg:py-4 rounded-xl font-medium text-text-secondary hover:text-text-primary hover:bg-glass transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">{backText}</span>
          </button>
        ) : <div />}

        <div className="flex items-center gap-3">
          {showSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="px-4 lg:px-6 py-3 lg:py-4 font-medium text-text-muted hover:text-text-primary transition-colors"
            >
              Skip
            </button>
          )}
          
          {onNext && (
            <button
              type="button"
              onClick={onNext}
              disabled={isNextDisabled || isNextLoading}
              className="flex items-center justify-center gap-2 px-8 lg:px-10 py-3 lg:py-4 rounded-xl font-semibold bg-accent text-text-inverse hover:bg-accent-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isNextLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {nextText}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
