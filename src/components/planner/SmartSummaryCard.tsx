'use client';

import React from 'react';
import { Edit2 } from 'lucide-react';

interface SmartSummaryCardProps {
  title: string;
  icon?: React.ReactNode;
  onEdit?: () => void;
  children: React.ReactNode;
}

export function SmartSummaryCard({ title, icon, onEdit, children }: SmartSummaryCardProps) {
  return (
    <div className="bg-bg-card border border-glass-border rounded-2xl overflow-hidden hover:border-glass-border-hover transition-colors">
      <div className="px-6 py-4 border-b border-glass-border bg-bg-primary/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && <div className="text-accent">{icon}</div>}
          <h3 className="font-semibold text-text-primary text-lg">{title}</h3>
        </div>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-accent transition-colors px-3 py-1.5 rounded-lg hover:bg-accent/10"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        )}
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

export function SummaryItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-glass-border last:border-0 last:pb-0">
      <span className="text-text-secondary text-sm mb-1 sm:mb-0">{label}</span>
      <span className="text-text-primary font-medium text-sm text-right">{value}</span>
    </div>
  );
}
