'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Lead, Customer, Project, SiteSurvey, Estimate } from '@/lib/types';
import { ArrowLeft, Calendar, User, Mail, Phone, MapPin, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.leadId as string;

  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState<Lead | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [survey, setSurvey] = useState<SiteSurvey | null>(null);
  const [estimate, setEstimate] = useState<Estimate | null>(null);

  const loadData = useCallback(async () => {
    try {
      const supabase = createClient();

      // Lead
      const { data: leadData } = await supabase.from('leads').select('*').eq('id', leadId).single();
      setLead(leadData);

      if (leadData) {
        // Customer
        const { data: custData } = await supabase.from('customers').select('*').eq('id', leadData.customer_id).single();
        setCustomer(custData);

        // Project
        const { data: projData } = await supabase.from('projects').select('*').eq('customer_id', leadData.customer_id).single();
        setProject(projData);

        if (projData) {
          // Survey
          const { data: surveyData } = await supabase.from('site_surveys').select('*').eq('project_id', projData.id).single();
          setSurvey(surveyData);

          // Estimate
          const { data: estData } = await supabase.from('estimates').select('*').eq('project_id', projData.id).single();
          setEstimate(estData);
        }
      }

      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadData();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadData]);

  // Update lead status Won/Lost
  async function handleUpdateStatus(status: Lead['status']) {
    const supabase = createClient();
    await supabase.from('leads').update({ status }).eq('id', leadId);
    
    // update project as well
    if (project) {
      await supabase.from('projects').update({ status: status === 'won' ? 'won' : 'lost' }).eq('id', project.id);
    }

    setLead((prev) => (prev ? { ...prev, status } : null));
  }

  function formatCurrency(val: number) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
        <span className="text-text-secondary text-sm">Loading lead profile...</span>
      </div>
    );
  }

  if (!lead || !customer) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Lead not found</h2>
        <button onClick={() => router.push('/leads')} className="btn-secondary">
          Back to Leads
        </button>
      </div>
    );
  }



  return (
    <div className="animate-fade-in max-w-4xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push('/leads')}
          className="p-2 rounded-lg hover:bg-glass text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Lead: {customer.full_name}
          </h1>
          <p className="text-text-secondary text-sm mt-0.5 capitalize">
            Current Status: <strong className="text-gold">{lead.status.replace(/_/g, ' ')}</strong>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Customer Profile */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Customer Details */}
          <div className="glass-card-static p-5 flex flex-col gap-4">
            <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2 border-b border-glass-border pb-2 mb-1">
              <User className="w-5 h-5 text-gold" />
              Customer Contact Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-text-muted shrink-0" />
                <div>
                  <div className="text-[10px] text-text-muted uppercase">Mobile</div>
                  <div className="font-medium">{customer.mobile || '—'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-text-muted shrink-0" />
                <div>
                  <div className="text-[10px] text-text-muted uppercase">Email</div>
                  <div className="font-medium truncate max-w-[200px]">{customer.email || '—'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-text-muted shrink-0" />
                <div>
                  <div className="text-[10px] text-text-muted uppercase">Location</div>
                  <div className="font-medium">{customer.city ? `${customer.city}, ${customer.state || ''}` : '—'}</div>
                </div>
              </div>
              <div>
                <div className="text-[10px] text-text-muted uppercase">Role/Relationship</div>
                <div className="font-medium capitalize mt-0.5">{customer.relationship || '—'}</div>
              </div>
            </div>
          </div>

          {/* Site Survey Details */}
          <div className="glass-card-static p-5 flex flex-col gap-4">
            <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2 border-b border-glass-border pb-2 mb-1">
              <Calendar className="w-5 h-5 text-gold" />
              Site Survey Request
            </h3>
            {survey ? (
              <div className="flex flex-col gap-3 text-sm">
                <div>
                  <span className="text-[10px] text-text-muted uppercase">Scheduled Slots</span>
                  <div className="font-bold text-text-primary mt-1">
                    {new Date(survey.scheduled_date || '').toLocaleDateString('en-IN', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })} at {new Date(survey.scheduled_date || '').toLocaleTimeString('en-IN', {
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                </div>
                {survey.notes && (
                  <div>
                    <span className="text-[10px] text-text-muted uppercase">Site Instructions</span>
                    <p className="text-xs text-text-secondary bg-glass-border/10 p-3 rounded mt-1 leading-relaxed">
                      {survey.notes}
                    </p>
                  </div>
                )}
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-text-secondary">Survey Status:</span>
                  <span className="text-xs bg-gold/10 text-gold border border-gold/20 px-2 py-0.5 rounded uppercase font-bold">
                    {survey.status}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-text-muted py-2">No site survey has been requested for this plan yet.</p>
            )}
          </div>
        </div>

        {/* Right Column: Actions & Estimate Overview */}
        <div className="flex flex-col gap-6">
          {/* Estimate Card */}
          {estimate && (
            <div className="glass-card-static p-5 border border-gold/30 bg-gradient-to-br from-gold-muted/5 to-transparent flex flex-col justify-between min-h-[140px]">
              <div>
                <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Preliminary Pricing</span>
                <h3 className="text-xl sm:text-2xl font-black text-gold mt-1">
                  {formatCurrency(estimate.grand_total)}
                </h3>
                <div className="text-[10px] text-text-muted mt-2">
                  Range: {formatCurrency(estimate.range_low || 0)} – {formatCurrency(estimate.range_high || 0)}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-glass-border/30 flex justify-between items-center text-xs">
                <span className="text-text-muted">GST (18% included)</span>
                <span className="font-semibold text-text-secondary">{formatCurrency(estimate.tax_amount)}</span>
              </div>
            </div>
          )}

          {/* Action Links */}
          <div className="glass-card-static p-4 flex flex-col gap-2.5">
            <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Project Handover Operations</h4>
            
            {project && (
              <>
                <Link
                  href={`/projects/${project.id}/boq`}
                  className="btn-primary text-xs !py-2.5 flex items-center justify-between w-full"
                >
                  Edit Spreadsheet BOQ
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href={`/projects/${project.id}/proposal`}
                  className="btn-secondary text-xs !py-2.5 flex items-center justify-between w-full"
                >
                  Configure Proposal Document
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}

            {/* Won/Lost controls */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-glass-border">
              <button
                onClick={() => handleUpdateStatus('won')}
                className="btn-primary !bg-emerald-600 hover:!bg-emerald-500 !text-white text-xs py-2 w-1/2"
              >
                Mark Won
              </button>
              <button
                onClick={() => handleUpdateStatus('lost')}
                className="btn-secondary border-error/30 text-error hover:bg-error-muted text-xs py-2 w-1/2"
              >
                Mark Lost
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
