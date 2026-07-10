'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { createClient } from '@/lib/supabase/client';
import { usePlannerStore } from '@/lib/stores/planner-store';
import { INDIAN_STATES } from '@/lib/constants/property-types';
import { ArrowRight, User, Phone, Mail, MapPin } from 'lucide-react';

interface CustomerFormData {
  full_name: string;
  mobile: string;
  whatsapp: string;
  email: string;
  city: string;
  state: string;
  pincode: string;
  preferred_contact: string;
  relationship: string;
}

const RELATIONSHIPS = [
  { value: 'homeowner', label: 'Homeowner', emoji: '🏠' },
  { value: 'family_member', label: 'Family Member', emoji: '👨‍👩‍👧‍👦' },
  { value: 'builder', label: 'Builder', emoji: '🏗️' },
  { value: 'developer', label: 'Developer', emoji: '🏢' },
  { value: 'interior_designer', label: 'Interior Designer', emoji: '🎨' },
  { value: 'architect', label: 'Architect', emoji: '📐' },
  { value: 'contractor', label: 'Contractor', emoji: '🔧' },
  { value: 'consultant', label: 'Consultant', emoji: '💼' },
  { value: 'other', label: 'Other', emoji: '➕' },
];

const CONTACT_METHODS = [
  { value: 'phone', label: 'Phone Call', icon: '📞' },
  { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
  { value: 'email', label: 'Email', icon: '📧' },
];

export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { setStep, markStepComplete, markSaved, markSaving, markSaveError, customerId } = usePlannerStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<CustomerFormData>({
    defaultValues: {
      full_name: '',
      mobile: '',
      whatsapp: '',
      email: '',
      city: '',
      state: '',
      pincode: '',
      preferred_contact: 'whatsapp',
      relationship: 'homeowner',
    },
  });

  const loadedRef = useRef(false);

  // Load existing customer data
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    async function loadData() {
      const supabase = createClient();
      const { data: project } = await supabase
        .from('projects')
        .select('customer_id')
        .eq('id', projectId)
        .single();

      if (project?.customer_id) {
        const { data: customer } = await supabase
          .from('customers')
          .select('*')
          .eq('id', project.customer_id)
          .single();

        if (customer) {
          Object.entries(customer).forEach(([key, value]) => {
            if (value && key in ({} as CustomerFormData)) {
              setValue(key as keyof CustomerFormData, value as string);
            }
          });
        }
      }
    }
    loadData();
  }, [projectId, setValue]);

  // Auto-save with debounce
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const watchedValues = watch();

  const autoSave = useCallback(async (data: CustomerFormData) => {
    markSaving();
    try {
      const supabase = createClient();
      const { data: project } = await supabase
        .from('projects')
        .select('customer_id')
        .eq('id', projectId)
        .single();

      if (project?.customer_id) {
        await supabase
          .from('customers')
          .update({
            full_name: data.full_name,
            mobile: data.mobile,
            whatsapp: data.whatsapp,
            email: data.email,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            preferred_contact: data.preferred_contact || null,
            relationship: data.relationship || null,
          })
          .eq('id', project.customer_id);
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

  // Set current step
  useEffect(() => {
    setStep('customer_details');
  }, [setStep]);

  async function onSubmit(data: CustomerFormData) {
    await autoSave(data);
    markStepComplete('customer_details');

    // Update project step
    const supabase = createClient();
    await supabase
      .from('projects')
      .update({ current_step: 'automation_interest' })
      .eq('id', projectId);

    router.push(`/planner/${projectId}/automation-interest`);
  }

  const selectedRelationship = watch('relationship');
  const selectedContact = watch('preferred_contact');

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Your Details</h1>
        <p className="text-text-secondary">
          Tell us about yourself and how to reach you
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
        {/* Who is this for */}
        <div>
          <h2 className="text-lg font-semibold mb-1">Who is this smart home project for?</h2>
          <p className="text-sm text-text-muted mb-4">Select your role in this project</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 stagger-children">
            {RELATIONSHIPS.map((rel) => (
              <label
                key={rel.value}
                className={`selection-card flex items-center gap-3 cursor-pointer ${
                  selectedRelationship === rel.value ? 'selected' : ''
                }`}
              >
                <input
                  type="radio"
                  value={rel.value}
                  {...register('relationship')}
                  className="sr-only"
                />
                <span className="text-xl">{rel.emoji}</span>
                <span className="text-sm font-medium">{rel.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Personal Details */}
        <div className="glass-card-static p-5 sm:p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-gold" />
            Personal Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="full_name" className="input-label">Full Name *</label>
              <input
                id="full_name"
                {...register('full_name', { required: 'Name is required' })}
                className={`input-field ${errors.full_name ? 'input-error' : ''}`}
                placeholder="Your full name"
              />
              {errors.full_name && <p className="error-message">{errors.full_name.message}</p>}
            </div>
            <div>
              <label htmlFor="mobile" className="input-label">
                <Phone className="w-3.5 h-3.5 inline mr-1" /> Mobile Number *
              </label>
              <input
                id="mobile"
                {...register('mobile', { required: 'Mobile is required' })}
                className={`input-field ${errors.mobile ? 'input-error' : ''}`}
                placeholder="+91 98765 43210"
              />
              {errors.mobile && <p className="error-message">{errors.mobile.message}</p>}
            </div>
            <div>
              <label htmlFor="whatsapp" className="input-label">WhatsApp Number</label>
              <input
                id="whatsapp"
                {...register('whatsapp')}
                className="input-field"
                placeholder="Same as mobile if blank"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="email" className="input-label">
                <Mail className="w-3.5 h-3.5 inline mr-1" /> Email Address
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="glass-card-static p-5 sm:p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gold" />
            Location
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="city" className="input-label">City</label>
              <input
                id="city"
                {...register('city')}
                className="input-field"
                placeholder="e.g., Mumbai"
              />
            </div>
            <div>
              <label htmlFor="state" className="input-label">State</label>
              <select id="state" {...register('state')} className="input-field">
                <option value="">Select State</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="pincode" className="input-label">Pincode</label>
              <input
                id="pincode"
                {...register('pincode')}
                className="input-field"
                placeholder="400001"
              />
            </div>
          </div>
        </div>

        {/* Contact Preference */}
        <div>
          <h2 className="text-lg font-semibold mb-1">Preferred Contact Method</h2>
          <p className="text-sm text-text-muted mb-4">How would you like us to reach you?</p>
          <div className="flex flex-wrap gap-3">
            {CONTACT_METHODS.map((method) => (
              <label
                key={method.value}
                className={`selection-card flex items-center gap-2 cursor-pointer !p-3 ${
                  selectedContact === method.value ? 'selected' : ''
                }`}
              >
                <input
                  type="radio"
                  value={method.value}
                  {...register('preferred_contact')}
                  className="sr-only"
                />
                <span>{method.icon}</span>
                <span className="text-sm font-medium">{method.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-4 border-t border-glass-border">
          <div />
          <button type="submit" className="btn-primary">
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
