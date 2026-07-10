'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePlannerStore } from '@/lib/stores/planner-store';
import type { AutomationInterest } from '@/lib/types';
import { Sparkles, Lightbulb, Shield, Brain, Settings2, RefreshCw, HelpCircle } from 'lucide-react';
import { PlannerStep } from '@/components/planner/PlannerStep';
import { ChoiceCard } from '@/components/planner/ChoiceCard';
import { StickyPlannerActions } from '@/components/planner/StickyPlannerActions';

const AUTOMATION_OPTIONS: {
  value: AutomationInterest;
  label: string;
  desc: string;
  icon: React.ReactNode;
}[] = [
  {
    value: 'complete_smart_home',
    label: 'Complete Smart Home',
    desc: 'Everything automated — controls, lighting, security, and AI',
    icon: <Sparkles className="w-6 h-6" />,
  },
  {
    value: 'smart_controls',
    label: 'Smart Controls',
    desc: 'Control lights, fans, ACs, and appliances from anywhere',
    icon: <Settings2 className="w-6 h-6" />,
  },
  {
    value: 'smart_lighting',
    label: 'Smart Lighting',
    desc: 'Mood scenes, dimming, colors, and motion-based lighting',
    icon: <Lightbulb className="w-6 h-6" />,
  },
  {
    value: 'smart_security',
    label: 'Smart Security',
    desc: 'Locks, cameras, sensors, access control, and alerts',
    icon: <Shield className="w-6 h-6" />,
  },
  {
    value: 'ai_automation',
    label: 'AI Automation',
    desc: 'Intelligent routines, energy saving, and smart scheduling',
    icon: <Brain className="w-6 h-6" />,
  },
  {
    value: 'upgrade_existing',
    label: 'Upgrade Existing Setup',
    desc: 'Already have some automation? Let us enhance it',
    icon: <RefreshCw className="w-6 h-6" />,
  },
  {
    value: 'not_sure',
    label: 'Not Sure — Recommend for Me',
    desc: 'We\'ll suggest the best automation for your property',
    icon: <HelpCircle className="w-6 h-6" />,
  },
];

export default function AutomationInterestPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { setStep, markStepComplete, markSaved, markSaving, automationInterests, setAutomationInterests } = usePlannerStore();

  const [selected, setSelected] = useState<AutomationInterest[]>(automationInterests);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setStep('automation_interest');
  }, [setStep]);

  // Load from DB
  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: project } = await supabase
        .from('projects')
        .select('automation_interests')
        .eq('id', projectId)
        .single();
      if (project?.automation_interests?.length) {
        setSelected(project.automation_interests as AutomationInterest[]);
      }
    }
    load();
  }, [projectId]);

  function toggleInterest(interest: AutomationInterest) {
    setSelected((prev) => {
      if (interest === 'complete_smart_home') {
        if (prev.includes('complete_smart_home')) return [];
        return ['complete_smart_home', 'smart_controls', 'smart_lighting', 'smart_security', 'ai_automation'];
      }

      if (interest === 'not_sure') {
        return prev.includes('not_sure') ? [] : ['not_sure'];
      }

      let next: AutomationInterest[] = prev.filter((i) => i !== 'not_sure' && i !== 'complete_smart_home');

      if (next.includes(interest)) {
        next = next.filter((i) => i !== interest);
      } else {
        next = [...next, interest];
      }

      const allCategories: AutomationInterest[] = ['smart_controls', 'smart_lighting', 'smart_security', 'ai_automation'];
      if (allCategories.every((c) => next.includes(c))) {
        next = ['complete_smart_home' as AutomationInterest, ...next];
      }

      return next;
    });
  }

  async function handleContinue() {
    if (selected.length === 0) return;

    setIsSaving(true);
    markSaving();
    const supabase = createClient();
    await supabase
      .from('projects')
      .update({
        automation_interests: selected,
        current_step: 'property_details',
      })
      .eq('id', projectId);

    setAutomationInterests(selected);
    markStepComplete('automation_interest');
    markSaved();
    setIsSaving(false);

    router.push(`/planner/${projectId}/property-details`);
  }

  return (
    <PlannerStep>
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight text-text-primary">
          What would you like your home to do for you?
        </h1>
        <p className="text-lg text-text-secondary">
          Select all that apply — we&apos;ll tailor the planner based on your choices.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {AUTOMATION_OPTIONS.map((option) => (
          <ChoiceCard
            key={option.value}
            title={option.label}
            description={option.desc}
            icon={option.icon}
            selected={selected.includes(option.value)}
            onClick={() => toggleInterest(option.value)}
            recommended={option.value === 'complete_smart_home'}
          />
        ))}
      </div>

      <StickyPlannerActions
        onBack={() => router.push(`/planner/${projectId}/customer-details`)}
        onNext={handleContinue}
        isNextDisabled={selected.length === 0}
        isNextLoading={isSaving}
      />
    </PlannerStep>
  );
}
