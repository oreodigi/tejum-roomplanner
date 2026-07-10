'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ChoiceCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  selected?: boolean;
  recommended?: boolean;
  onClick?: () => void;
  badgeText?: string;
}

export function ChoiceCard({
  title,
  description,
  icon,
  selected = false,
  recommended = false,
  onClick,
  badgeText,
}: ChoiceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
        selected
          ? 'border-accent bg-accent-muted shadow-[0_0_30px_rgba(6,182,212,0.15)]'
          : 'border-glass-border bg-bg-card hover:border-glass-border-hover hover:bg-bg-card-hover'
      }`}
    >
      {/* Background Glow Effect */}
      <div className={`absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 transition-opacity duration-300 ${selected ? 'opacity-100' : 'group-hover:opacity-100'}`} />
      
      <div className="relative z-10 flex gap-5 items-start">
        {icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
            selected ? 'bg-accent text-bg-primary' : 'bg-glass text-accent group-hover:bg-glass-border'
          }`}>
            {icon}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className={`font-semibold text-lg transition-colors ${selected ? 'text-accent' : 'text-text-primary'}`}>
              {title}
            </h3>
            {recommended && (
              <span className="text-[10px] uppercase tracking-wider font-bold bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                Recommended
              </span>
            )}
            {badgeText && !recommended && (
              <span className="text-[10px] uppercase tracking-wider font-bold bg-glass text-text-secondary px-2 py-0.5 rounded-full">
                {badgeText}
              </span>
            )}
          </div>
          
          {description && (
            <p className="text-sm text-text-secondary leading-relaxed">
              {description}
            </p>
          )}
        </div>

        <div className="shrink-0 flex items-center justify-center w-6 h-6 ml-2">
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            selected ? 'border-accent bg-accent text-bg-primary' : 'border-glass-border'
          }`}>
            {selected && <CheckCircle2 className="w-4 h-4" />}
          </div>
        </div>
      </div>
    </button>
  );
}
