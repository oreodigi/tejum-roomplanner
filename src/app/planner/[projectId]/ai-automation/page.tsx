'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePlannerStore } from '@/lib/stores/planner-store';
import type { AutomationRule, AutomationTriggerType } from '@/lib/types';
import { ArrowLeft, ArrowRight, Brain, Sparkles, Info, Loader2, Smartphone } from 'lucide-react';

interface RulePreset {
  triggerType: AutomationTriggerType;
  label: string;
  desc: string;
  naturalLanguage: string;
}

const RULE_PRESETS: RulePreset[] = [
  {
    triggerType: 'arrival',
    label: 'Smart Arrival Routine',
    desc: 'When you arrive home after sunset, unlock the main door, disarm security, and turn on the Welcome Home lighting scene.',
    naturalLanguage: 'When I arrive home after dark, unlock the door and set welcome lights.',
  },
  {
    triggerType: 'departure',
    label: 'One-Touch Away Mode',
    desc: 'When leaving, arm all security cameras and sensors, turn off all lights, fans, and ACs, and close all motorized curtains.',
    naturalLanguage: 'Turn off everything and arm security when I leave the house.',
  },
  {
    triggerType: 'bedtime',
    label: 'Intelligent Bedtime Routine',
    desc: 'At bedtime, lock the main doors, arm ground floor perimeter sensors, slowly dim bedroom lights to zero, and set AC to 24°C.',
    naturalLanguage: 'Lock up, set bedroom AC to 24, and fade out lights at bedtime.',
  },
  {
    triggerType: 'motion_detected',
    label: 'Midnight Guiding Lights',
    desc: 'Between 11:00 PM and 6:00 AM, if motion is detected in the passage, turn on the passage and bathroom lights at a soft 10% brightness.',
    naturalLanguage: 'Set soft guiding lights in the passage at night if motion is detected.',
  },
  {
    triggerType: 'leak_detected',
    label: 'Emergency Safety Response',
    desc: 'If water or gas leak is detected, flash all lights red, sound sirens, close the main water valve, and send immediate phone notifications.',
    naturalLanguage: 'Flash lights red, shut main valves, and sound sirens on any leak detection.',
  },
];

export default function AIAutomationPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { setStep, markStepComplete, markSaved, markSaving } = usePlannerStore();

  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [customDescription, setCustomDescription] = useState('');

  useEffect(() => {
    setStep('ai_automation');
  }, [setStep]);

  const loadRules = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('project_id', projectId);
    setRules(data || []);
    
    // Find if a custom rule exists to populate custom text box
    const custom = data?.find((r) => r.trigger_type === 'custom');
    if (custom) {
      setCustomDescription(custom.natural_language || '');
    }

    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadRules();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadRules]);

  // Toggle rule
  async function handleToggleRule(preset: RulePreset) {
    const supabase = createClient();
    const existing = rules.find((r) => r.trigger_type === preset.triggerType);

    markSaving();

    if (existing) {
      // Remove
      await supabase.from('automation_rules').delete().eq('id', existing.id);
      setRules((prev) => prev.filter((r) => r.id !== existing.id));
    } else {
      // Insert
      const { data: newRule } = await supabase
        .from('automation_rules')
        .insert({
          project_id: projectId,
          trigger_type: preset.triggerType,
          trigger_description: preset.desc,
          natural_language: preset.naturalLanguage,
          actions: [], // actions will be compiled by recommendation engine
          is_active: true,
        })
        .select()
        .single();

      if (newRule) {
        setRules((prev) => [...prev, newRule]);
      }
    }

    markSaved();
  }

  // Save Custom Rule
  async function handleSaveCustomRule() {
    const supabase = createClient();
    const existing = rules.find((r) => r.trigger_type === 'custom');

    markSaving();

    if (!customDescription.trim()) {
      if (existing) {
        await supabase.from('automation_rules').delete().eq('id', existing.id);
        setRules((prev) => prev.filter((r) => r.id !== existing.id));
      }
      markSaved();
      return;
    }

    const ruleData = {
      project_id: projectId,
      trigger_type: 'custom' as AutomationTriggerType,
      trigger_description: 'Custom user-defined automation routine',
      natural_language: customDescription.trim(),
      actions: [],
      is_active: true,
    };

    if (existing) {
      await supabase.from('automation_rules').update(ruleData).eq('id', existing.id);
      setRules((prev) =>
        prev.map((r) => (r.id === existing.id ? { ...r, natural_language: customDescription.trim() } : r))
      );
    } else {
      const { data: newRule } = await supabase
        .from('automation_rules')
        .insert(ruleData)
        .select()
        .single();
      if (newRule) {
        setRules((prev) => [...prev, newRule]);
      }
    }

    markSaved();
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-gold" />
        <span className="text-text-secondary text-sm">Loading automation preferences...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">AI & Smart Routines</h1>
        <p className="text-text-secondary">
          Configure intelligent routines to run your home automatically
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Presets */}
        <div>
          <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <Brain className="w-5 h-5 text-gold" />
            Lifestyle Automation Presets
          </h2>
          <p className="text-sm text-text-muted mb-4">Toggle the routines you want active in your home</p>

          <div className="flex flex-col gap-4">
            {RULE_PRESETS.map((preset) => {
              const isEnabled = rules.some((r) => r.trigger_type === preset.triggerType);

              return (
                <button
                  key={preset.triggerType}
                  type="button"
                  onClick={() => handleToggleRule(preset)}
                  className={`selection-card text-left flex gap-4 ${
                    isEnabled ? 'selected' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-gold-muted flex items-center justify-center text-gold shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-primary text-sm sm:text-base">{preset.label}</h3>
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">{preset.desc}</p>
                  </div>
                  <div className={`w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    isEnabled ? 'border-gold bg-gold' : 'border-glass-border'
                  }`}>
                    {isEnabled && <span className="text-bg-primary text-[10px] font-bold">✓</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Automation */}
        <div className="glass-card-static p-5 sm:p-6">
          <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-gold" />
            Custom Smart Routine
          </h2>
          <p className="text-sm text-text-muted mb-4">
            Describe in plain English any other automated behaviors you would like.
          </p>

          <div className="flex flex-col gap-4">
            <textarea
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              onBlur={handleSaveCustomRule}
              className="input-field min-h-[100px]"
              placeholder="e.g. When the garden soil gets dry, automatically start the sprinkler system for 10 minutes..."
            />
            <div className="flex justify-between items-center text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> Saves automatically on click away
              </span>
              <button
                type="button"
                onClick={handleSaveCustomRule}
                className="btn-primary !py-1.5 !px-3 text-xs"
              >
                Save Routine
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-8 border-t border-glass-border">
          <button
            type="button"
            onClick={() => router.push(`/planner/${projectId}/security`)}
            className="btn-ghost"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Security
          </button>
          <button
            type="button"
            onClick={() => {
              markStepComplete('ai_automation');
              router.push(`/planner/${projectId}/infrastructure`);
            }}
            className="btn-primary"
          >
            Continue to Infrastructure <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
