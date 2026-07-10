'use client';

import React from 'react';
import { Edit2, Copy, Trash2, Box } from 'lucide-react';

interface RoomCardProps {
  name: string;
  floor: string;
  icon?: React.ReactNode;
  devicesCount?: number;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onRemove?: () => void;
  isActive?: boolean;
}

export function RoomCard({
  name,
  floor,
  icon = <Box className="w-6 h-6" />,
  devicesCount = 0,
  onEdit,
  onDuplicate,
  onRemove,
  isActive = false,
}: RoomCardProps) {
  return (
    <div className={`group relative bg-bg-card border-2 rounded-2xl p-5 transition-all duration-300 ${
      isActive ? 'border-accent bg-accent-muted' : 'border-glass-border hover:border-glass-border-hover'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
          isActive ? 'bg-accent text-text-inverse' : 'bg-glass text-accent group-hover:bg-glass-border'
        }`}>
          {icon}
        </div>
        
        {/* Action Menu (Visible on hover/focus) */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          {onDuplicate && (
            <button type="button" onClick={onDuplicate} className="p-2 text-text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-colors" title="Duplicate">
              <Copy className="w-4 h-4" />
            </button>
          )}
          {onRemove && (
            <button type="button" onClick={onRemove} className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors" title="Remove">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-text-primary mb-1">{name}</h3>
        <p className="text-sm text-text-secondary">{floor}</p>
      </div>

      <div className="flex items-center justify-between mt-auto">
        <div className="text-xs font-medium text-text-secondary bg-glass px-3 py-1.5 rounded-full">
          {devicesCount} Devices
        </div>
        
        {onEdit && (
          <button 
            type="button" 
            onClick={onEdit}
            className="flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-light transition-colors"
          >
            Edit Room <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
