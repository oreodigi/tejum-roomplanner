'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Home, IndianRupee, LayoutGrid, Lightbulb, Sparkles } from 'lucide-react';
import { PLANNER_STEPS, getStepIndex } from '@/lib/constants/steps';
import { formatCompactCurrency } from '@/lib/engines/visual-estimate-engine';
import { usePlannerStore } from '@/lib/stores/planner-store';
import { createClient } from '@/lib/supabase/client';

export function ProgressFlowPanel() {
  const [hydrated, setHydrated] = useState(false);
  const params = useParams<{ projectId?: string }>();
  const projectId = params.projectId;
  const { currentStep, completedSteps } = usePlannerStore();
  const currentIdx = getStepIndex(hydrated ? currentStep : 'customer_details');
  const completionPct = usePlannerStore((state) => state.getCompletionPct());

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setHydrated(true), 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const { data } = useQuery({
    queryKey: ['planner-progress', projectId],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const supabase = createClient();
      const { data: rooms, error: roomsError } = await supabase.from('rooms').select('id, completion_pct').eq('project_id', projectId!);
      if (roomsError) throw roomsError;
      const roomIds = (rooms ?? []).map((room) => room.id);
      const devicesResult = roomIds.length
        ? await supabase.from('project_devices').select('id').in('room_id', roomIds)
        : { data: [], error: null };
      if (devicesResult.error) throw devicesResult.error;
      const { data: estimate } = await supabase.from('estimates').select('range_low, range_high').eq('project_id', projectId!).order('version', { ascending: false }).limit(1).maybeSingle();
      return {
        roomsCount: rooms?.length ?? 0,
        configuredRooms: rooms?.filter((room) => room.completion_pct === 100).length ?? 0,
        devicesCount: devicesResult.data?.length ?? 0,
        rangeLow: Number(estimate?.range_low ?? 0),
        rangeHigh: Number(estimate?.range_high ?? 0),
      };
    },
  });

  const stats = data ?? { roomsCount: 0, configuredRooms: 0, devicesCount: 0, rangeLow: 0, rangeHigh: 0 };
  const nextAction = stats.roomsCount === 0
    ? 'Generate your room map'
    : stats.configuredRooms < stats.roomsCount
      ? `Configure ${stats.roomsCount - stats.configuredRooms} remaining rooms`
      : stats.rangeHigh === 0
        ? 'Review devices and calculate estimate'
        : 'Book a consultation or site survey';

  return (
    <div className="h-full bg-bg-secondary flex flex-col p-6 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-primary flex items-center gap-2"><Home className="w-5 h-5 text-accent" /> Smart Home Plan</h2>
        <div className="text-sm text-text-secondary mt-1">{hydrated ? completionPct : 0}% complete</div>
        <div className="w-full h-1.5 bg-glass rounded-full mt-3 overflow-hidden"><div className="h-full bg-accent transition-all duration-700 ease-out" style={{ width: `${hydrated ? completionPct : 0}%` }} /></div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-5">
        <div className="rounded-xl border border-glass-border bg-bg-card p-3"><LayoutGrid className="w-4 h-4 text-accent mb-2" /><strong className="block text-sm">{stats.configuredRooms}/{stats.roomsCount}</strong><span className="text-[10px] text-text-muted">rooms ready</span></div>
        <div className="rounded-xl border border-glass-border bg-bg-card p-3"><Lightbulb className="w-4 h-4 text-gold mb-2" /><strong className="block text-sm">{stats.devicesCount}</strong><span className="text-[10px] text-text-muted">devices selected</span></div>
        {stats.rangeHigh > 0 && <div className="col-span-2 rounded-xl border border-glass-border bg-bg-card p-3"><IndianRupee className="w-4 h-4 text-accent mb-2" /><strong className="block text-sm">{formatCompactCurrency(stats.rangeLow)} – {formatCompactCurrency(stats.rangeHigh)}</strong><span className="text-[10px] text-text-muted">preliminary range</span></div>}
      </div>

      <div className="rounded-xl bg-accent-muted p-3 mb-6 flex gap-2"><Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" /><div><span className="block text-[10px] uppercase tracking-wider text-accent font-bold">Next best action</span><strong className="block text-xs mt-1 text-text-primary">{nextAction}</strong></div></div>

      <div className="flex-1"><div className="space-y-6">
        {PLANNER_STEPS.map((step, idx) => {
          const isCompleted = hydrated && completedSteps.includes(step.id);
          const isCurrent = idx === currentIdx;
          const isFuture = idx > currentIdx;
          return (
            <div key={step.id} className="relative flex gap-4">
              {idx !== PLANNER_STEPS.length - 1 && <div className={`absolute left-3 top-8 bottom-[-16px] w-[2px] rounded-full transition-colors ${isCompleted ? 'bg-accent' : 'bg-glass-border'}`} />}
              <div className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full mt-0.5 shadow-sm transition-colors ${isCompleted ? 'bg-accent text-text-inverse' : isCurrent ? 'bg-accent-muted border-2 border-accent text-accent' : 'bg-glass border border-glass-border text-text-muted'}`}>{isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-2 h-2 fill-current" />}</div>
              <div className={`flex-1 ${isFuture ? 'opacity-50' : 'opacity-100'}`}><h4 className={`text-sm font-semibold transition-colors ${isCurrent ? 'text-accent' : 'text-text-primary'}`}>{step.title}</h4>{isCurrent && <div className="text-xs text-text-secondary mt-1 animate-fade-in">{step.subtitle}</div>}{step.id === 'rooms' && stats.roomsCount > 0 && <div className="text-xs font-medium text-accent mt-1 bg-accent-muted inline-block px-2 py-0.5 rounded-full">{stats.roomsCount} rooms planned</div>}{step.id === 'room_config' && stats.devicesCount > 0 && <div className="text-xs font-medium text-accent mt-1 bg-accent-muted inline-block px-2 py-0.5 rounded-full">{stats.devicesCount} devices added</div>}</div>
            </div>
          );
        })}
      </div></div>
    </div>
  );
}
