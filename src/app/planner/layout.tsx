'use client';

import Link from 'next/link';
import { Home, ChevronRight, Save, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { usePlannerStore } from '@/lib/stores/planner-store';
import { PlannerShell } from '@/components/planner/PlannerShell';

export default function PlannerLayout({ children }: { children: React.ReactNode }) {
  const { saveStatus } = usePlannerStore();
  const pathname = usePathname();

  if (pathname === '/planner/new') return <>{children}</>;

  const saveIcons = {
    saved: <CheckCircle2 className="w-3.5 h-3.5" />,
    saving: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
    unsaved: <Save className="w-3.5 h-3.5" />,
    error: <AlertCircle className="w-3.5 h-3.5" />,
  };

  const saveLabels = {
    saved: 'Saved',
    saving: 'Saving...',
    unsaved: 'Unsaved',
    error: 'Save failed',
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary font-sans text-text-primary">
      {/* Top Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-bg-primary/90 border-b border-glass-border">
        <div className="px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
                <Home className="w-3.5 h-3.5 text-text-inverse" />
              </div>
              <span className="text-sm font-bold hidden sm:inline text-text-primary">TEJUM</span>
            </Link>
            <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
            <span className="text-sm text-text-secondary truncate">Smart Home Planner</span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle compact />
            <div className={`save-indicator ${saveStatus}`}>
              {saveIcons[saveStatus]}
              <span className="hidden sm:inline">{saveLabels[saveStatus]}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Shell */}
      <div className="flex-1 flex overflow-hidden">
        <PlannerShell>{children}</PlannerShell>
      </div>
    </div>
  );
}
