'use client';

import React from 'react';
import { Check } from 'lucide-react';
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
    <div className={`device-option ${selected ? 'is-selected' : ''}`}>
      <button
        type="button"
        onClick={onToggle}
        className="device-option__toggle"
        aria-pressed={selected}
      >
        <span className="device-option__icon">{icon}</span>
        <span className="device-option__name">{title}</span>
        <span className="device-option__state">{selected ? <><Check /> Added</> : 'Add'}</span>
      </button>
      {selected && showQuantity && (
        <div className="device-option__quantity">
          <span>Quantity</span>
          <QuantityStepper value={quantity} onChange={(value) => onQuantityChange?.(value)} min={1} />
        </div>
      )}
    </div>
  );
}
