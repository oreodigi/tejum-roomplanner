'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  value: number;
  onChange: (newValue: number) => void;
  min?: number;
  max?: number;
}

export function QuantityStepper({ value, onChange, min = 0, max = 99 }: QuantityStepperProps) {
  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className="flex items-center bg-bg-primary rounded-xl border border-glass-border overflow-hidden">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        className="w-10 h-10 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-glass disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Minus className="w-4 h-4" />
      </button>
      <div className="w-12 h-10 flex items-center justify-center font-semibold text-lg text-text-primary border-x border-glass-border">
        {value}
      </div>
      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        className="w-10 h-10 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-glass disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
