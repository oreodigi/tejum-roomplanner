'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { createClient } from '@/lib/supabase/client';
import { usePlannerStore } from '@/lib/stores/planner-store';
import {
  ArrowLeft, ArrowRight, Wifi, ShieldAlert, CheckCircle,
  HelpCircle, AlertTriangle, Zap, Server, Loader2
} from 'lucide-react';

interface InfraFormData {
  internet_available: string;
  internet_provider: string;
  router_location: string;
  num_wifi_routers: number;
  mesh_wifi: string;
  internet_backup: string;
  ups_available: string;
  inverter_available: string;
  generator_available: string;
  network_rack: string;
  ethernet_cabling: string;
  neutral_wiring: string;
  home_server_required: string;
  notes: string;
}

export default function InfrastructurePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { setStep, markStepComplete, markSaved, markSaving, markSaveError } = usePlannerStore();

  const [loading, setLoading] = useState(true);
  const [propertyFloors, setPropertyFloors] = useState(1);
  const [propertyType, setPropertyType] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<InfraFormData>({
    defaultValues: {
      internet_available: '',
      internet_provider: '',
      router_location: '',
      num_wifi_routers: 1,
      mesh_wifi: '',
      internet_backup: '',
      ups_available: '',
      inverter_available: '',
      generator_available: '',
      network_rack: '',
      ethernet_cabling: '',
      neutral_wiring: '',
      home_server_required: '',
      notes: '',
    },
  });

  const loadedRef = useRef(false);

  useEffect(() => {
    setStep('infrastructure');
  }, [setStep]);

  // Load existing infra check + property floor details
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    async function load() {
      const supabase = createClient();

      // Get property info for risk calculations
      const { data: prop } = await supabase
        .from('properties')
        .select('num_floors, property_type')
        .eq('project_id', projectId)
        .single();
      
      if (prop) {
        setPropertyFloors(prop.num_floors || 1);
        setPropertyType(prop.property_type || '');
      }

      // Get existing infra check
      const { data: infra } = await supabase
        .from('infrastructure_checks')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (infra) {
        if (infra.internet_available !== null) setValue('internet_available', infra.internet_available ? 'yes' : 'no');
        setValue('internet_provider', infra.internet_provider || '');
        setValue('router_location', infra.router_location || '');
        setValue('num_wifi_routers', infra.num_wifi_routers || 1);
        if (infra.mesh_wifi !== null) setValue('mesh_wifi', infra.mesh_wifi ? 'yes' : 'no');
        if (infra.internet_backup !== null) setValue('internet_backup', infra.internet_backup ? 'yes' : 'no');
        if (infra.ups_available !== null) setValue('ups_available', infra.ups_available ? 'yes' : 'no');
        if (infra.inverter_available !== null) setValue('inverter_available', infra.inverter_available ? 'yes' : 'no');
        if (infra.generator_available !== null) setValue('generator_available', infra.generator_available ? 'yes' : 'no');
        if (infra.network_rack !== null) setValue('network_rack', infra.network_rack ? 'yes' : 'no');
        if (infra.ethernet_cabling !== null) setValue('ethernet_cabling', infra.ethernet_cabling ? 'yes' : 'no');
        if (infra.neutral_wiring !== null) setValue('neutral_wiring', infra.neutral_wiring ? 'yes' : 'no');
        if (infra.home_server_required !== null) setValue('home_server_required', infra.home_server_required ? 'yes' : 'no');
        setValue('notes', infra.notes || '');
      }
      setLoading(false);
    }
    load();
  }, [projectId, setValue]);

  // Compute Risk Flags dynamically
  const watchedValues = watch();

  const getRiskFlags = useCallback((data: InfraFormData): string[] => {
    const flags: string[] = [];

    // WiFi risks
    if (data.internet_available === 'no') {
      flags.push('no_internet');
    }
    if (propertyFloors > 1 && data.mesh_wifi === 'no') {
      flags.push('multi_floor_no_mesh');
    }
    if (data.num_wifi_routers === 1 && propertyFloors > 1) {
      flags.push('weak_wifi_coverage');
    }

    // Power risks
    if (data.ups_available === 'no' && data.inverter_available === 'no' && data.generator_available === 'no') {
      flags.push('no_power_backup');
    }

    // Wiring risks
    if (data.neutral_wiring === 'no') {
      flags.push('no_neutral_wire');
    }
    if (data.ethernet_cabling === 'no') {
      flags.push('no_ethernet_backhaul');
    }

    return flags;
  }, [propertyFloors]);

  const riskFlags = getRiskFlags(watchedValues);

  // Auto-save
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const autoSave = useCallback(async (data: InfraFormData) => {
    markSaving();
    try {
      const supabase = createClient();
      const flags = getRiskFlags(data);

      const dbData = {
        project_id: projectId,
        internet_available: data.internet_available ? data.internet_available === 'yes' : null,
        internet_provider: data.internet_provider || null,
        router_location: data.router_location || null,
        num_wifi_routers: data.num_wifi_routers || 1,
        mesh_wifi: data.mesh_wifi ? data.mesh_wifi === 'yes' : null,
        internet_backup: data.internet_backup ? data.internet_backup === 'yes' : null,
        ups_available: data.ups_available ? data.ups_available === 'yes' : null,
        inverter_available: data.inverter_available ? data.inverter_available === 'yes' : null,
        generator_available: data.generator_available ? data.generator_available === 'yes' : null,
        network_rack: data.network_rack ? data.network_rack === 'yes' : null,
        ethernet_cabling: data.ethernet_cabling ? data.ethernet_cabling === 'yes' : null,
        neutral_wiring: data.neutral_wiring ? data.neutral_wiring === 'yes' : null,
        home_server_required: data.home_server_required ? data.home_server_required === 'yes' : null,
        risk_flags: flags,
        notes: data.notes || null,
      };

      const { data: existing } = await supabase
        .from('infrastructure_checks')
        .select('id')
        .eq('project_id', projectId)
        .single();

      if (existing) {
        await supabase.from('infrastructure_checks').update(dbData).eq('id', existing.id);
      } else {
        await supabase.from('infrastructure_checks').insert(dbData);
      }

      markSaved();
    } catch {
      markSaveError();
    }
  }, [projectId, markSaving, markSaved, markSaveError, getRiskFlags]);

  useEffect(() => {
    if (!isDirty) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      autoSave(watchedValues);
    }, 2000);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [watchedValues, isDirty, autoSave]);

  async function onSubmit(data: InfraFormData) {
    await autoSave(data);
    markStepComplete('infrastructure');

    const supabase = createClient();
    await supabase
      .from('projects')
      .update({ current_step: 'budget' })
      .eq('id', projectId);

    router.push(`/planner/${projectId}/budget`);
  }

  function YesNoField({ label, name }: { label: string; name: keyof InfraFormData }) {
    const val = watch(name) as string;
    return (
      <div className="flex items-center justify-between py-3 border-b border-glass-border last:border-0">
        <span className="text-sm flex-1 pr-4">{label}</span>
        <div className="flex gap-2">
          {['yes', 'no', ''].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setValue(name, option as never, { shouldDirty: true })}
              className={`text-xs px-3 py-1.5 rounded-full transition-all font-medium ${
                val === option
                  ? option === 'yes'
                    ? 'bg-success-muted text-success'
                    : option === 'no'
                    ? 'bg-error-muted text-error'
                    : 'bg-glass text-text-muted'
                  : 'bg-glass/50 text-text-muted hover:bg-glass'
              }`}
            >
              {option === 'yes' ? 'Yes' : option === 'no' ? 'No' : 'Skip'}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-gold" />
        <span className="text-text-secondary text-sm">Loading technical checklist...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Infrastructure & Wiring Check</h1>
        <p className="text-text-secondary">
          Check if your electrical and network wiring is smart-home ready
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
        {/* Network & WiFi */}
        <div className="glass-card-static p-5 sm:p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Wifi className="w-5 h-5 text-gold" />
            Network & WiFi
          </h2>
          <YesNoField label="Is active internet available at the site?" name="internet_available" />
          
          {watch('internet_available') === 'yes' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-glass-border/30">
              <div>
                <label htmlFor="internet_provider" className="input-label">Internet Provider</label>
                <input
                  id="internet_provider"
                  {...register('internet_provider')}
                  className="input-field"
                  placeholder="e.g. Jio Fiber, Airtel Black"
                />
              </div>
              <div>
                <label htmlFor="router_location" className="input-label">Primary Router Location</label>
                <input
                  id="router_location"
                  {...register('router_location')}
                  className="input-field"
                  placeholder="e.g. Living room, Foyer"
                />
              </div>
              <div className="sm:col-span-2">
                <YesNoField label="Do you use a Mesh WiFi system?" name="mesh_wifi" />
              </div>
              <div className="sm:col-span-2">
                <YesNoField label="Is there a standby/backup internet line?" name="internet_backup" />
              </div>
            </div>
          )}
        </div>

        {/* Electrical & Wiring */}
        <div className="glass-card-static p-5 sm:p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-gold" />
            Electrical & Wiring
          </h2>
          <YesNoField label="Do all switchboards have a Neutral wire?" name="neutral_wiring" />
          <YesNoField label="Is structured Ethernet cabling (Cat6/Cat6A) available?" name="ethernet_cabling" />
          <YesNoField label="Is there a dedicated Network/IT Rack?" name="network_rack" />
        </div>

        {/* Power Backup */}
        <div className="glass-card-static p-5 sm:p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-gold" />
            Power Backup
          </h2>
          <YesNoField label="Is a dedicated UPS available for network devices?" name="ups_available" />
          <YesNoField label="Is a home power Inverter available?" name="inverter_available" />
          <YesNoField label="Is a power Generator available?" name="generator_available" />
        </div>

        {/* Risk Assessment Box */}
        {riskFlags.length > 0 && (
          <div className="glass-card-static p-5 border-rose-500/20 bg-rose-950/10 flex gap-4 animate-fade-in">
            <ShieldAlert className="w-7 h-7 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-rose-400 text-sm sm:text-base">Technical Risks Identified</h3>
              <p className="text-xs text-text-secondary mt-1">
                Our recommendation engine flagged these details that might limit smart device features.
                Don&apos;t worry — we can resolve these during installation!
              </p>
              <ul className="list-disc pl-4 text-xs text-rose-300 mt-3 flex flex-col gap-1">
                {riskFlags.includes('no_neutral_wire') && (
                  <li><strong>No Neutral Wire:</strong> Smart switchboards require neutral wires. We will recommend retrofit battery/RF modules or help you add neutrals.</li>
                )}
                {riskFlags.includes('multi_floor_no_mesh') && (
                  <li><strong>Multi-floor, No Mesh:</strong> Large smart homes require a mesh network for device communication. We will include a mesh network recommendation.</li>
                )}
                {riskFlags.includes('no_power_backup') && (
                  <li><strong>No Power Backup:</strong> Smart homes perform best when hubs and routers are on UPS/Inverter backup.</li>
                )}
                {riskFlags.includes('no_internet') && (
                  <li><strong>No Internet:</strong> Internet connection is required for remote app control and updates.</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* No risks box */}
        {riskFlags.length === 0 && (
          <div className="glass-card-static p-5 border-emerald-500/20 bg-emerald-950/10 flex gap-4 animate-fade-in">
            <CheckCircle className="w-7 h-7 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-emerald-400 text-sm sm:text-base">Technical Readiness: Strong</h3>
              <p className="text-xs text-text-secondary mt-1">
                Your property matches all prerequisite conditions for smart automation.
                We will recommend standard high-performance protocols.
              </p>
            </div>
          </div>
        )}

        {/* Custom notes */}
        <div>
          <label htmlFor="notes" className="input-label">Additional Technical Notes</label>
          <textarea
            id="notes"
            {...register('notes')}
            className="input-field min-h-[100px]"
            placeholder="Share any special electrical, plumbing, or structural observations..."
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-glass-border">
          <button
            type="button"
            onClick={() => router.push(`/planner/${projectId}/ai-automation`)}
            className="btn-ghost"
          >
            <ArrowLeft className="w-4 h-4" /> Back to AI
          </button>
          <button type="submit" className="btn-primary">
            Continue to Budget <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
