'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Lead, Customer, Project, Estimate } from '@/lib/types';
import { Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

type LeadWithDetails = Lead & {
  customer?: Customer;
  project?: Project;
  estimate?: Estimate;
};

const LEAD_COLUMNS = [
  { id: 'new', label: 'New / Draft' },
  { id: 'site_survey_completed', label: 'Survey Done' },
  { id: 'boq_preparation', label: 'BOQ Prep' },
  { id: 'proposal_sent', label: 'Proposal Sent' },
  { id: 'won', label: 'Won' },
  { id: 'lost', label: 'Lost' },
] as const;

export default function LeadsPage() {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<LeadWithDetails[]>([]);

  const loadLeads = useCallback(async () => {
    try {
      const supabase = createClient();

      // Fetch leads
      const { data: leadList } = await supabase
        .from('leads')
        .select('*')
        .order('updated_at', { ascending: false });

      if (leadList && leadList.length > 0) {
        // Fetch Customers
        const customerIds = leadList.map((l) => l.customer_id);
        const { data: custData } = await supabase
          .from('customers')
          .select('*')
          .in('id', customerIds);

        // Fetch Projects
        const { data: projData } = await supabase
          .from('projects')
          .select('*')
          .in('customer_id', customerIds);

        // Fetch Estimates
        const projectIds = projData?.map((p) => p.id) || [];
        const { data: estData } = await supabase
          .from('estimates')
          .select('*')
          .in('project_id', projectIds);

        const joinedLeads: LeadWithDetails[] = leadList.map((l) => {
          const customer = custData?.find((c) => c.id === l.customer_id);
          const project = projData?.find((p) => p.customer_id === l.customer_id);
          const estimate = estData?.find((e) => e.project_id === project?.id);

          return {
            ...l,
            customer,
            project,
            estimate,
          };
        });

        setLeads(joinedLeads);
      } else {
        setLeads([]);
      }
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadLeads();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadLeads]);

  // Update lead status
  async function handleMoveLead(leadId: string, nextStatus: Lead['status']) {
    const supabase = createClient();
    await supabase
      .from('leads')
      .update({ status: nextStatus })
      .eq('id', leadId);
    
    // Update local state
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: nextStatus } : l))
    );
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
        <span className="text-text-secondary text-sm">Loading sales pipeline...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in h-[calc(100vh-8rem)] min-h-[500px]">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Leads Pipeline</h1>
          <p className="text-text-secondary text-sm mt-0.5">Drag-and-drop or column transition leads board</p>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4 items-stretch select-none">
        {LEAD_COLUMNS.map((col) => {
          const colLeads = leads.filter((l) => {
            if (col.id === 'new') return l.status === 'new' || l.status === 'requirement_started' || l.status === 'requirement_completed';
            return l.status === col.id;
          });

          return (
            <div
              key={col.id}
              className="w-72 bg-bg-secondary/25 border border-glass-border/40 rounded-xl flex flex-col shrink-0 overflow-hidden"
            >
              {/* Column Header */}
              <div className="p-4 border-b border-glass-border bg-bg-secondary/40 flex items-center justify-between shrink-0">
                <span className="font-semibold text-sm">{col.label}</span>
                <span className="text-xs font-bold bg-glass px-2 py-0.5 rounded-full text-text-secondary">
                  {colLeads.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
                {colLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="glass-card p-4 flex flex-col gap-3 group relative cursor-default"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-text-primary group-hover:text-gold transition-colors">
                        {lead.customer?.full_name || 'Guest User'}
                      </h4>
                      <p className="text-xs text-text-muted mt-0.5 capitalize">
                        {lead.project?.name || 'Smart Home Project'}
                      </p>
                    </div>

                    <div className="flex justify-between items-center text-xs pt-2 border-t border-glass-border/30">
                      <div>
                        <div className="text-text-muted text-[10px] uppercase">City</div>
                        <div className="font-medium text-text-secondary mt-0.5">{lead.customer?.city || 'India'}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-text-muted text-[10px] uppercase">Estimate</div>
                        <div className="font-bold text-gold mt-0.5">
                          {lead.estimate ? formatCurrency(lead.estimate.grand_total) : '—'}
                        </div>
                      </div>
                    </div>

                    {/* Column shift controls */}
                    <div className="flex items-center justify-between pt-2 border-t border-glass-border/30">
                      <select
                        value={lead.status}
                        onChange={(e) => handleMoveLead(lead.id, e.target.value as never)}
                        className="bg-bg-input border border-glass-border text-[10px] px-2 py-1 rounded text-text-secondary font-medium"
                      >
                        <option value="new">Draft</option>
                        <option value="site_survey_completed">Survey Done</option>
                        <option value="boq_preparation">BOQ Prep</option>
                        <option value="proposal_sent">Proposal Sent</option>
                        <option value="won">Won</option>
                        <option value="lost">Lost</option>
                      </select>

                      <Link
                        href={`/leads/${lead.id}`}
                        className="text-[10px] font-bold text-gold hover:text-gold-light flex items-center gap-0.5"
                      >
                        Details <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}

                {colLeads.length === 0 && (
                  <div className="text-center py-10 text-[11px] text-text-muted">
                    No leads in column
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
