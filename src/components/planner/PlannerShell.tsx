'use client';

import React from 'react';
import { ProgressFlowPanel } from './ProgressFlowPanel';
import { MobileProgressBar } from './MobileProgressBar';
import { usePathname } from 'next/navigation';

export function PlannerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPlannerRoute = pathname.includes('/planner/');

  if (!isPlannerRoute || pathname === '/planner/new') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-bg-primary">
      {/* Mobile Top Progress */}
      <div className="lg:hidden sticky top-0 z-50">
        <MobileProgressBar />
      </div>

      {/* Left Area: Main Question Area */}
      <main className="flex-1 flex flex-col min-h-0 relative overflow-y-auto">
        <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-8 pb-32 lg:pb-8 flex flex-col">
          {children}
        </div>
      </main>

      {/* Right Area: Live Visual Diagram (Desktop Only) */}
      <aside className="hidden lg:block w-[400px] shrink-0 border-l border-glass-border shadow-2xl relative z-10">
        <ProgressFlowPanel />
      </aside>
    </div>
  );
}
