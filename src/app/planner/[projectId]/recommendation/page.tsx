'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePlannerStore } from '@/lib/stores/planner-store';
import { runRecommendationEngine, type RecommendationOutput } from '@/lib/engines/recommendation-engine';
import type { ProjectDevice } from '@/lib/types';
import {
  ArrowLeft, ArrowRight, Award, ShieldAlert, Cpu,
  CheckCircle2, AlertCircle, Wrench, Calendar, Loader2
} from 'lucide-react';

export default function RecommendationPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { setStep, markStepComplete } = usePlannerStore();

  const [loading, setLoading] = useState(true);
  const [recommendation, setRecommendation] = useState<RecommendationOutput | null>(null);

  useEffect(() => {
    setStep('recommendation');
  }, [setStep]);

  const loadAndRunEngine = useCallback(async () => {
    const supabase = createClient();

    // Load project details
    const { data: project } = await supabase.from('projects').select('*').eq('id', projectId).single();
    if (!project) return;

    const { data: property } = await supabase.from('properties').select('*').eq('project_id', projectId).single();
    const { data: rooms } = await supabase.from('rooms').select('*').eq('project_id', projectId);
    
    // Fetch all project devices across all rooms
    let allDevices: ProjectDevice[] = [];
    if (rooms && rooms.length > 0) {
      const roomIds = rooms.map((r) => r.id);
      const { data: devList } = await supabase
        .from('project_devices')
        .select('*, device_type:device_type_id(*)')
        .in('room_id', roomIds);
      allDevices = devList || [];
    }

    const { data: switchboards } = await supabase
      .from('switchboards')
      .select('*')
      .in('room_id', rooms?.map((r) => r.id) || []);

    const { data: infra } = await supabase
      .from('infrastructure_checks')
      .select('*')
      .eq('project_id', projectId)
      .single();

    // Run engine
    const output = runRecommendationEngine({
      property,
      rooms: rooms || [],
      devices: allDevices,
      switchboards: switchboards || [],
      infrastructure: infra,
      budgetRange: project.budget_range,
      priority: project.priority,
      automationInterests: project.automation_interests || [],
    });

    setRecommendation(output);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadAndRunEngine();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadAndRunEngine]);

  async function handleContinue() {
    markStepComplete('recommendation');
    
    const supabase = createClient();
    await supabase
      .from('projects')
      .update({ current_step: 'estimate' })
      .eq('id', projectId);

    router.push(`/planner/${projectId}/estimate`);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-gold" />
        <span className="text-text-secondary text-sm">Analyzing configuration & compiling report...</span>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Failed to generate recommendation</h2>
        <button onClick={() => router.push(`/planner/${projectId}/review`)} className="btn-secondary">
          Back to Review
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Our Recommendations</h1>
        <p className="text-text-secondary">
          Personalized system specifications curated by our recommendation engine
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Core system details */}
        <div className="glass-card-static p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between border-l-4 border-gold bg-gold-muted/5">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-xl bg-gold-muted flex items-center justify-center text-gold shrink-0">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Recommended Architecture</div>
              <h3 className="text-lg font-bold text-text-primary mt-1">{recommendation.controlSystem}</h3>
              <p className="text-xs text-text-muted mt-0.5">Custom fit for your layout & construction status</p>
            </div>
          </div>
          <div className="flex flex-col gap-1 items-start sm:items-end">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Automation Tier</span>
            <span className="text-sm font-bold bg-gold/10 text-gold border border-gold/20 px-3 py-1 rounded-full uppercase tracking-wide">
              {recommendation.automationLevel}
            </span>
          </div>
        </div>

        {/* Categories & Installation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="glass-card-static p-5 flex flex-col gap-3">
            <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-gold" />
              Recommended Modules
            </h3>
            <ul className="flex flex-col gap-2">
              {recommendation.productCategories.map((cat) => (
                <li key={cat} className="flex items-center gap-2 text-sm text-text-secondary">
                  <CheckCircle2 className="w-4.5 h-4.5 text-success shrink-0" />
                  {cat}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card-static p-5 flex flex-col gap-4">
            <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
              <Wrench className="w-5 h-5 text-gold" />
              Installation Logistics
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <div className="text-text-muted">Complexity</div>
                <div className="font-bold text-text-primary mt-0.5 capitalize">{recommendation.installationComplexity}</div>
              </div>
              <div>
                <div className="text-text-muted">Survey Priority</div>
                <div className="font-bold text-text-primary mt-0.5 capitalize flex items-center gap-1.5">
                  {recommendation.surveyPriority === 'urgent' ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-error animate-ping" />
                      <span className="text-error font-bold">Urgent</span>
                    </>
                  ) : (
                    'Standard'
                  )}
                </div>
              </div>
            </div>
            <div className="bg-glass-border/10 p-3 rounded text-[11px] text-text-muted flex gap-2">
              <Calendar className="w-4 h-4 shrink-0 mt-0.5" />
              <span>We recommend scheduling a physical site survey to lock in cabling details.</span>
            </div>
          </div>
        </div>

        {/* Technical Risk Warnings */}
        {recommendation.riskWarnings.length > 0 && (
          <div className="glass-card-static p-5 !border-error/25 !bg-error-muted flex flex-col gap-3">
            <h3 className="font-semibold text-error text-sm sm:text-base flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              Technical Risk Factors
            </h3>
            <ul className="flex flex-col gap-2 pl-2">
              {recommendation.riskWarnings.map((warning, idx) => (
                <li key={idx} className="flex gap-2 text-xs text-text-secondary leading-relaxed">
                  <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Room priority mapping */}
        <div className="glass-card-static p-5">
          <h3 className="font-semibold text-sm sm:text-base mb-4">Room Automation Roadmap</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recommendation.roomPriorities.map((rp) => (
              <div key={rp.roomName} className="flex items-center justify-between p-3 rounded bg-bg-input/30 border border-glass-border/30">
                <span className="text-sm font-medium">{rp.roomName}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize border ${
                  rp.priority === 'high'
                    ? 'bg-error-muted text-error border-error/25'
                    : rp.priority === 'medium'
                    ? 'bg-warning-muted text-warning border-warning/25'
                    : 'bg-glass text-text-muted border-glass-border'
                }`}>
                  {rp.priority} Priority
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-glass-border">
          <button
            type="button"
            onClick={() => router.push(`/planner/${projectId}/review`)}
            className="btn-ghost"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Review
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className="btn-primary"
          >
            View Pricing Estimate <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
