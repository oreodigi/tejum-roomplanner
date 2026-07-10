'use client';

import React from 'react';
import { QuantityStepper } from './QuantityStepper';

interface DeviceToggleCardProps {
  title: string;
  icon?: React.ReactNode;
  selected: boolean;
  quantity?: number;
  onToggle: () => void;
  onQuantityChange?: (newQuantity: number) => void;
  showQuantity?: boolean;
}

export function DeviceToggleCard({
  title,
  icon,
  selected,
  quantity = 1,
  onToggle,
  onQuantityChange,
  showQuantity = true,
}: DeviceToggleCardProps) {
  return (
    <div className={`relative w-full rounded-2xl border-2 transition-all duration-300 overflow-hidden flex flex-col ${
      selected 
        ? 'border-accent bg-accent-muted/50' 
        : 'border-glass-border bg-bg-card hover:border-glass-border-hover'
    }`}>
      <button
        type="button"
        onClick={onToggle}
        className="flex-1 p-5 flex flex-col items-center justify-center gap-3 w-full text-center"
      >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
          selected ? 'bg-accent text-bg-primary' : 'bg-glass text-text-secondary'
        }`}>
          {icon}
        </div>
        <span className={`font-medium transition-colors ${
          selected ? 'text-accent' : 'text-text-primary'
        }`}>
          {title}
        </span>
      </button>
      
      {/* Quantity Control Area (Only visible when selected and showQuantity is true) */}
      <div className={`transition-all duration-300 ease-in-out ${
        selected && showQuantity ? 'h-16 opacity-100 border-t border-accent/20' : 'h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="h-full flex items-center justify-center px-4 bg-bg-primary/40">
          <QuantityStepper 
            value={quantity} 
            onChange={(val) => onQuantityChange?.(val)} 
            min={1} 
          />
        </div>
      </div>
    </div>
  );
}
