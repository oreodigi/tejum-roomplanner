'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePlannerStore } from '@/lib/stores/planner-store';
import { runEstimationEngine, type EstimateOutput } from '@/lib/engines/estimation-engine';
import type { ProjectDevice } from '@/lib/types';
import {
  ArrowLeft, ArrowRight, Calculator,
  Info, AlertTriangle, ShieldCheck, Loader2
} from 'lucide-react';

export default function EstimatePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { setStep, markStepComplete } = usePlannerStore();

  const [loading, setLoading] = useState(true);
  const [estimate, setEstimate] = useState<EstimateOutput | null>(null);

  useEffect(() => {
    setStep('estimate');
  }, [setStep]);

  const savedRef = useRef(false);

  const calculateAndSaveEstimate = useCallback(async () => {
    const supabase = createClient();

    // Fetch required details
    const { data: property } = await supabase.from('properties').select('*').eq('project_id', projectId).single();
    const { data: rooms } = await supabase.from('rooms').select('*').eq('project_id', projectId);
    
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

    // Calculate
    const output = runEstimationEngine({
      property,
      rooms: rooms || [],
      devices: allDevices,
      switchboards: switchboards || [],
    });

    setEstimate(output);
    setLoading(false);

    // Save to DB (only once)
    if (!savedRef.current) {
      savedRef.current = true;
      const { data: existing } = await supabase
        .from('estimates')
        .select('id')
        .eq('project_id', projectId)
        .single();

      const dbData = {
        project_id: projectId,
        hardware_total: output.hardwareTotal,
        installation_total: output.installationTotal,
        programming_total: output.programmingTotal,
        integration_total: output.integrationTotal,
        design_total: output.designTotal,
        site_survey_total: output.siteSurveyTotal,
        networking_total: output.networkingTotal,
        subtotal: output.subtotal,
        tax_amount: output.taxAmount,
        grand_total: output.grandTotal,
        range_low: output.rangeLow,
        range_high: output.rangeHigh,
        status: 'draft',
      };

      if (existing) {
        await supabase.from('estimates').update(dbData).eq('id', existing.id);
      } else {
        await supabase.from('estimates').insert(dbData);
      }
    }
  }, [projectId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void calculateAndSaveEstimate();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [calculateAndSaveEstimate]);

  function formatCurrency(val: number) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  }

  async function handleContinue() {
    markStepComplete('estimate');
    
    const supabase = createClient();
    await supabase
      .from('projects')
      .update({ current_step: 'summary' })
      .eq('id', projectId);

    router.push(`/planner/${projectId}/summary`);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-gold" />
        <span className="text-text-secondary text-sm">Calculating preliminary estimate...</span>
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="w-12 h-12 text-error mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Failed to calculate estimate</h2>
        <button onClick={() => router.push(`/planner/${projectId}/recommendation`)} className="btn-secondary">
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Preliminary Project Estimate</h1>
        <p className="text-text-secondary">
          Range values configured based on device counts, installation complexity, and services
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Cost Range display */}
        <div className="glass-card-static p-8 text-center bg-gradient-to-br from-gold-muted/10 to-transparent border border-gold/30 rounded-2xl">
          <div className="text-xs uppercase tracking-wider text-gold font-bold mb-3">Estimated Budget Range</div>
          <div className="text-3xl sm:text-5xl font-black text-gold tracking-tight">
            {formatCurrency(estimate.rangeLow)} – {formatCurrency(estimate.rangeHigh)}
          </div>
          <p className="text-xs text-text-muted mt-4 max-w-md mx-auto leading-relaxed">
            *Preliminary range only. Final pricing will be locked during the physical site survey 
            based on exact cable lengths and product finishes.
          </p>
        </div>

        {/* Cost Breakdown */}
        <div className="glass-card-static p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-gold" />
            Cost Breakdown
          </h2>
          <div className="flex flex-col gap-3 text-sm divide-y divide-glass-border">
            {[
              { label: 'Smart Hardware & Modules', val: estimate.hardwareTotal, desc: 'Controllers, switch sensors, dimmers' },
              { label: 'Cabling & Installation Service', val: estimate.installationTotal, desc: 'Conduit laying, module wiring' },
              { label: 'System Programming & Tuning', val: estimate.programmingTotal, desc: 'Scene configurations, app setup' },
              { label: 'Multi-device Integration', val: estimate.integrationTotal, desc: 'Interlock triggers, voice controls' },
              { label: 'System Design & Engineering', val: estimate.designTotal, desc: 'Schematics, load calculation sheets' },
              { label: 'Network Infrastructure Setup', val: estimate.networkingTotal, desc: 'Base switch, rack wiring, router' },
              { label: 'Site Survey & Deployment Plan', val: estimate.siteSurveyTotal, desc: 'Engineer physical site inspection' },
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-3 first:pt-0">
                <div>
                  <div className="font-medium text-text-primary">{item.label}</div>
                  <div className="text-xs text-text-muted mt-0.5">{item.desc}</div>
                </div>
                <div className="font-semibold text-text-primary">{formatCurrency(item.val)}</div>
              </div>
            ))}

            {/* Subtotal & Taxes */}
            <div className="flex justify-between items-center py-4 border-t-2 border-glass-border">
              <span className="font-bold text-text-primary">Subtotal</span>
              <span className="font-bold text-text-primary">{formatCurrency(estimate.subtotal)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-none">
              <span className="text-xs text-text-secondary">Government Taxes (18% GST)</span>
              <span className="text-sm font-semibold text-text-secondary">{formatCurrency(estimate.taxAmount)}</span>
            </div>
            <div className="flex justify-between items-center py-4 border-t border-glass-border bg-gold-muted/5 px-4 rounded-lg mt-2">
              <span className="font-black text-gold text-base sm:text-lg">Grand Total (Incl. Taxes)</span>
              <span className="font-black text-gold text-base sm:text-lg">{formatCurrency(estimate.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Guarantees Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-card-static p-4 flex gap-3 text-xs leading-relaxed text-text-secondary">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-text-primary block mb-1">Tejum Turnkey Guarantee</strong>
              Includes 12 months comprehensive remote and on-site support, 
              software configuration updates, and full coordination with your decorator.
            </div>
          </div>
          <div className="glass-card-static p-4 flex gap-3 text-xs leading-relaxed text-text-secondary">
            <Info className="w-5 h-5 text-gold shrink-0 mt-0.5" />
            <div>
              <strong className="text-text-primary block mb-1">Estimate Policy</strong>
              Ranges are calculated with a -15% to +20% margin. In standard conditions, 
              final quotation values remain within these bounds.
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-glass-border">
          <button
            type="button"
            onClick={() => router.push(`/planner/${projectId}/recommendation`)}
            className="btn-ghost"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Recommendation
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className="btn-primary"
          >
            View Plan Summary <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
