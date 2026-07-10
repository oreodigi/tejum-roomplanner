'use client';

import { House, LayoutGrid, IndianRupee, Sparkles } from 'lucide-react';

interface MobileBottomNavProps {
  active: 'plan' | 'rooms' | 'estimate' | 'finish';
  onNavigate: (destination: 'plan' | 'rooms' | 'estimate' | 'finish') => void;
}

const ITEMS = [
  { id: 'plan' as const, label: 'Plan', icon: House },
  { id: 'rooms' as const, label: 'Rooms', icon: LayoutGrid },
  { id: 'estimate' as const, label: 'Estimate', icon: IndianRupee },
  { id: 'finish' as const, label: 'Finish', icon: Sparkles },
];

export function MobileBottomNav({ active, onNavigate }: MobileBottomNavProps) {
  return (
    <nav className="mobile-bottom-nav" aria-label="Planner sections">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        return <button type="button" key={item.id} className={active === item.id ? 'is-active' : ''} onClick={() => onNavigate(item.id)}><Icon /><span>{item.label}</span></button>;
      })}
    </nav>
  );
}
