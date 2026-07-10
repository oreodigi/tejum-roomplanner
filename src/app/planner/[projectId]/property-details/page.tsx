'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { createClient } from '@/lib/supabase/client';
import { usePlannerStore } from '@/lib/stores/planner-store';
import { PROPERTY_TYPES, PROJECT_STATUS_OPTIONS, AUTOMATION_TYPE_OPTIONS } from '@/lib/constants/property-types';
import { Building2, Layers, Ruler } from 'lucide-react';
import { PlannerStep } from '@/components/planner/PlannerStep';
import { ChoiceCard } from '@/components/planner/ChoiceCard';
import { QuantityStepper } from '@/components/planner/QuantityStepper';
import { StickyPlannerActions } from '@/components/planner/StickyPlannerActions';

interface PropertyFormData {
  property_type: string;
  num_floors: number;
  built_up_area: number | null;
  num_bedrooms: number;
  num_bathrooms: number;
  num_balconies: number;
  num_kitchens: number;
  num_parking: number;
  num_outdoor: number;
  project_status: string;
  automation_type: string;
}

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { setStep, markStepComplete, markSaved, markSaving, markSaveError } = usePlannerStore();
  const [isSaving, setIsSaving] = useState(false);

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { isDirty },
  } = useForm<PropertyFormData>({
    defaultValues: {
      property_type: '',
      num_floors: 1,
      built_up_area: null,
      num_bedrooms: 0,
      num_bathrooms: 0,
      num_balconies: 0,
      num_kitchens: 1,
      num_parking: 0,
      num_outdoor: 0,
      project_status: '',
      automation_type: '',
    },
  });

  const loadedRef = useRef(false);
  const selectedType = watch('property_type');

  useEffect(() => {
    setStep('property_details');
  }, [setStep]);

  // Load existing property
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    async function load() {
      const supabase = createClient();
      const { data: property } = await supabase
        .from('properties')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (property) {
        setValue('property_type', property.property_type);
        setValue('num_floors', property.num_floors);
        setValue('built_up_area', property.built_up_area);
        setValue('num_bedrooms', property.num_bedrooms);
        setValue('num_bathrooms', property.num_bathrooms);
        setValue('num_balconies', property.num_balconies);
        setValue('num_kitchens', property.num_kitchens);
        setValue('num_parking', property.num_parking);
        setValue('num_outdoor', property.num_outdoor);
        if (property.project_status) setValue('project_status', property.project_status);
        if (property.automation_type) setValue('automation_type', property.automation_type);
      }
    }
    load();
  }, [projectId, setValue]);

  // Auto-fill defaults when property type changes
  useEffect(() => {
    if (!selectedType) return;
    const template = PROPERTY_TYPES.find((p) => p.value === selectedType);
    if (template) {
      setValue('num_floors', template.defaultFloors);
      setValue('num_bedrooms', template.defaultBedrooms);
      setValue('num_bathrooms', template.defaultBathrooms);
    }
  }, [selectedType, setValue]);

  // Auto-save
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const watchedValues = watch();

  const autoSave = useCallback(async (data: PropertyFormData) => {
    if (!data.property_type) return;
    markSaving();
    try {
      const supabase = createClient();
      const propertyData = {
        project_id: projectId,
        property_type: data.property_type,
        num_floors: data.num_floors || 1,
        built_up_area: data.built_up_area || null,
        num_bedrooms: data.num_bedrooms || 0,
        num_bathrooms: data.num_bathrooms || 0,
        num_balconies: data.num_balconies || 0,
        num_kitchens: data.num_kitchens || 1,
        num_parking: data.num_parking || 0,
        num_outdoor: data.num_outdoor || 0,
        project_status: data.project_status || null,
        automation_type: data.automation_type || null,
      };

      const { data: existing } = await supabase
        .from('properties')
        .select('id')
        .eq('project_id', projectId)
        .single();

      if (existing) {
        await supabase.from('properties').update(propertyData).eq('id', existing.id);
      } else {
        await supabase.from('properties').insert(propertyData);
      }

      markSaved();
    } catch {
      markSaveError();
    }
  }, [projectId, markSaving, markSaved, markSaveError]);

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

  async function onSubmit() {
    setIsSaving(true);
    await autoSave(watchedValues);
    markStepComplete('property_details');

    const supabase = createClient();
    await supabase
      .from('projects')
      .update({ current_step: 'rooms' })
      .eq('id', projectId);
    
    setIsSaving(false);
    router.push(`/planner/${projectId}/rooms`);
  }

  function QuantityField({ label, name, min = 0, max = 20 }: { label: string; name: keyof PropertyFormData; min?: number; max?: number }) {
    const value = watch(name) as number;
    return (
      <div className="flex items-center justify-between py-3 border-b border-glass-border last:border-0">
        <span className="text-base text-text-primary">{label}</span>
        <QuantityStepper
          value={value || 0}
          onChange={(val) => setValue(name, val as never, { shouldDirty: true })}
          min={min}
          max={max}
        />
      </div>
    );
  }

  return (
    <PlannerStep>
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight text-text-primary">
          What kind of home are we planning?
        </h1>
        <p className="text-lg text-text-secondary">
          This helps us generate the right room layout for you.
        </p>
      </div>

      <div className="flex flex-col gap-10">
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PROPERTY_TYPES.map((pt) => (
              <ChoiceCard
                key={pt.value}
                title={pt.label}
                description={pt.description}
                icon={<span className="text-2xl">{pt.icon}</span>}
                selected={selectedType === pt.value}
                onClick={() => setValue('property_type', pt.value, { shouldDirty: true })}
              />
            ))}
          </div>
        </div>

        {selectedType && (
          <div className="animate-slide-up flex flex-col gap-8">
            <div className="bg-bg-card border-2 border-glass-border rounded-2xl p-6 lg:p-8">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
                <Layers className="w-6 h-6 text-accent" />
                Fine-tune room counts
              </h2>
              <div className="flex flex-col">
                <QuantityField label="Number of Floors" name="num_floors" min={1} max={10} />
                <QuantityField label="Bedrooms" name="num_bedrooms" />
                <QuantityField label="Bathrooms" name="num_bathrooms" />
                <QuantityField label="Balconies" name="num_balconies" />
                <QuantityField label="Kitchens" name="num_kitchens" min={1} max={5} />
                <QuantityField label="Living / Common Areas" name="num_outdoor" />
              </div>
            </div>

            <div className="bg-bg-card border-2 border-glass-border rounded-2xl p-6 lg:p-8">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
                <Building2 className="w-6 h-6 text-accent" />
                Construction Phase
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PROJECT_STATUS_OPTIONS.map((status) => (
                  <ChoiceCard
                    key={status.value}
                    title={status.label}
                    selected={watch('project_status') === status.value}
                    onClick={() => setValue('project_status', status.value, { shouldDirty: true })}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <StickyPlannerActions
        onBack={() => router.push(`/planner/${projectId}/automation-interest`)}
        onNext={onSubmit}
        isNextDisabled={!selectedType}
        isNextLoading={isSaving}
        nextText="Generate Rooms"
      />
    </PlannerStep>
  );
}
