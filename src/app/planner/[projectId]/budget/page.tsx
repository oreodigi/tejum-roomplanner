'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePlannerStore } from '@/lib/stores/planner-store';
import type { BudgetRange, Priority, ImplementationPreference } from '@/lib/types';
import {
  ArrowLeft, ArrowRight, IndianRupee, Sparkles, Scale,
  Clock, Check, Loader2, HelpCircle
} from 'lucide-react';

interface BudgetOption {
  value: BudgetRange;
  label: string;
  desc: string;
}

interface PriorityOption {
  value: Priority;
  label: string;
  desc: string;
  emoji: string;
}

interface PhaseOption {
  value: ImplementationPreference;
  label: string;
  desc: string;
}

const BUDGET_OPTIONS: BudgetOption[] = [
  { value: 'under_1l', label: 'Under ₹1 Lakh', desc: 'Basic smart lighting and plug automation' },
  { value: '1l_2.5l', label: '₹1L – ₹2.5 Lakhs', desc: 'Smart lighting, fans, and security for primary rooms' },
  { value: '2.5l_5l', label: '₹2.5L – ₹5 Lakhs', desc: 'Whole-home automation (lighting, security, climate)' },
  { value: '5l_10l', label: '₹5L – ₹10 Lakhs', desc: 'Premium touch switches, multi-room audio, smart security' },
  { value: '10l_25l', label: '₹10L – ₹25 Lakhs', desc: 'Luxury automation with premium glass touch panels' },
  { value: '25l_plus', label: '₹25 Lakhs +', desc: 'Full custom integration, home cinema, high-end controls' },
  { value: 'need_recommendation', label: 'Need Recommendation', desc: 'We will suggest a budget based on your configuration' },
];

const PRIORITY_OPTIONS: PriorityOption[] = [
  { value: 'essential', label: 'Essential Controls', desc: 'Budget-friendly. Focuses on lights, fans, and safety.', emoji: '🔌' },
  { value: 'best_value', label: 'Best Value', desc: 'Balanced. Adds smart locks, sensors, and basic voice control.', emoji: '⚖️' },
  { value: 'premium', label: 'Premium Experience', desc: 'Premium. Touch panels, mood lighting, and full integration.', emoji: '✨' },
  { value: 'luxury', label: 'Luxury & Aesthetics', desc: 'Exquisite. Smart glass touch keypads, climate, curtains, and cinema.', emoji: '💎' },
  { value: 'maximum', label: 'Maximum Custom', desc: 'Ultimate. No compromise setup with bespoke finishes and integrations.', emoji: '👑' },
];

const PHASE_OPTIONS: PhaseOption[] = [
  { value: 'complete_now', label: 'Complete All At Once', desc: 'Wire and configure all rooms now.' },
  { value: 'phase_wise', label: 'Phase-wise Rollout', desc: 'Wire everything now, add devices floor-by-floor.' },
  { value: 'essential_rooms', label: 'Essential Rooms First', desc: 'Automate living room and master bedroom now, others later.' },
  { value: 'need_recommendation', label: 'Help Me Decide', desc: 'Our consultants will recommend a deployment roadmap.' },
];

export default function BudgetPriorityPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { setStep, markStepComplete, markSaved, markSaving } = usePlannerStore();

  const [budget, setBudget] = useState<BudgetRange | null>(null);
  const [priority, setPriority] = useState<Priority | null>(null);
  const [phase, setPhase] = useState<ImplementationPreference | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setStep('budget');
  }, [setStep]);

  // Load existing project budget details
  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: project } = await supabase
        .from('projects')
        .select('budget_range, priority, implementation_preference')
        .eq('id', projectId)
        .single();

      if (project) {
        setBudget(project.budget_range as BudgetRange);
        setPriority(project.priority as Priority);
        setPhase(project.implementation_preference as ImplementationPreference);
      }
      setLoading(false);
    }
    load();
  }, [projectId]);

  // Save changes helper
  const handleSave = useCallback(async (
    b: BudgetRange | null,
    p: Priority | null,
    ph: ImplementationPreference | null
  ) => {
    const supabase = createClient();
    markSaving();
    await supabase
      .from('projects')
      .update({
        budget_range: b,
        priority: p,
        implementation_preference: ph,
      })
      .eq('id', projectId);
    markSaved();
  }, [projectId, markSaving, markSaved]);

  function handleSelectBudget(val: BudgetRange) {
    setBudget(val);
    handleSave(val, priority, phase);
  }

  function handleSelectPriority(val: Priority) {
    setPriority(val);
    handleSave(budget, val, phase);
  }

  function handleSelectPhase(val: ImplementationPreference) {
    setPhase(val);
    handleSave(budget, priority, val);
  }

  async function handleContinue() {
    if (!budget || !priority || !phase) return;
    markStepComplete('budget');

    const supabase = createClient();
    await supabase
      .from('projects')
      .update({ current_step: 'review' })
      .eq('id', projectId);

    router.push(`/planner/${projectId}/review`);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-gold" />
        <span className="text-text-secondary text-sm">Loading budget preferences...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Budget & Priority</h1>
        <p className="text-text-secondary">
          Help us align our proposal with your budget and automation priorities
        </p>
      </div>

      <div className="flex flex-col gap-10">
        {/* Budget Range */}
        <div>
          <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-gold" />
            Budget Range
          </h2>
          <p className="text-sm text-text-muted mb-4">Select your target budget range</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger-children">
            {BUDGET_OPTIONS.map((opt) => {
              const isSelected = budget === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectBudget(opt.value)}
                  className={`selection-card text-left flex gap-3 ${
                    isSelected ? 'selected' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{opt.label}</h3>
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">{opt.desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    isSelected ? 'border-gold bg-gold' : 'border-glass-border'
                  }`}>
                    {isSelected && <span className="text-bg-primary text-[10px] font-bold">✓</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Priority Level */}
        <div>
          <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <Scale className="w-5 h-5 text-gold" />
            Automation Priority
          </h2>
          <p className="text-sm text-text-muted mb-4">Select your priority alignment</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRIORITY_OPTIONS.map((opt) => {
              const isSelected = priority === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectPriority(opt.value)}
                  className={`selection-card text-left flex gap-4 ${
                    isSelected ? 'selected' : ''
                  }`}
                >
                  <span className="text-2xl mt-0.5">{opt.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base">{opt.label}</h3>
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">{opt.desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    isSelected ? 'border-gold bg-gold' : 'border-glass-border'
                  }`}>
                    {isSelected && <span className="text-bg-primary text-[10px] font-bold">✓</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Phase Rollout */}
        <div>
          <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gold" />
            Implementation Preference
          </h2>
          <p className="text-sm text-text-muted mb-4">How would you like to install the smart home equipment?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PHASE_OPTIONS.map((opt) => {
              const isSelected = phase === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectPhase(opt.value)}
                  className={`selection-card text-left flex gap-3 ${
                    isSelected ? 'selected' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base">{opt.label}</h3>
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">{opt.desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    isSelected ? 'border-gold bg-gold' : 'border-glass-border'
                  }`}>
                    {isSelected && <span className="text-bg-primary text-[10px] font-bold">✓</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-8 border-t border-glass-border">
          <button
            type="button"
            onClick={() => router.push(`/planner/${projectId}/infrastructure`)}
            className="btn-ghost"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button
            type="button"
            onClick={handleContinue}
            disabled={!budget || !priority || !phase}
            className="btn-primary"
          >
            Review Requirements <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
