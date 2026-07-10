'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePlannerStore } from '@/lib/stores/planner-store';
import type { Project, Customer, Estimate, BOQItem } from '@/lib/types';
import { ArrowLeft, Printer, Loader2, Send } from 'lucide-react';

interface ProposalContent {
  intro: string;
  terms: string;
  scope: string;
}

export default function ProposalBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { markSaved, markSaving, markSaveError } = usePlannerStore();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [boqItems, setBOQItems] = useState<BOQItem[]>([]);

  // Proposal State
  const [proposalId, setProposalId] = useState<string | null>(null);
  const [status, setStatus] = useState<'draft' | 'sent' | 'accepted' | 'rejected'>('draft');
  const [content, setContent] = useState<ProposalContent>({
    intro: 'Dear Customer,\n\nThank you for choosing TEJUM Smart. We are pleased to submit our custom turnkey smart automation proposal tailored for your property. Our system architecture guarantees premium performance, clean wire conduits, and seamless integration.',
    scope: 'Complete room-by-room smart automation spanning lighting controls, motorized curtain setups, security locks, and safety sensors. The network backbone will be managed by a high-availability rack router with dual-band WiFi mesh coverage.',
    terms: '1. 50% advance on layout sign-off.\n2. 40% on hardware module delivery at site.\n3. 10% on system commissioning and handoff.\n\nAll hardware components carry a 12-month standard brand warranty.',
  });

  const loadData = useCallback(async () => {
    try {
      const supabase = createClient();

      // Project
      const { data: proj } = await supabase.from('projects').select('*').eq('id', projectId).single();
      setProject(proj);

      if (proj) {
        // Customer
        const { data: cust } = await supabase.from('customers').select('*').eq('id', proj.customer_id).single();
        setCustomer(cust);
      }

      // Estimate
      const { data: est } = await supabase.from('estimates').select('*').eq('project_id', projectId).single();
      setEstimate(est);

      // BOQ
      const { data: boq } = await supabase.from('boq_items').select('*').eq('project_id', projectId);
      setBOQItems(boq || []);

      // Proposal (existing)
      const { data: prop } = await supabase
        .from('proposals')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (prop) {
        setProposalId(prop.id);
        setStatus(prop.status as never);
        if (prop.content) {
          setContent({
            intro: prop.content.intro || content.intro,
            scope: prop.content.scope || content.scope,
            terms: prop.content.terms || content.terms,
          });
        }
      }

      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }, [projectId, content.intro, content.scope, content.terms]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadData();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadData]);

  // Save Proposal
  async function handleSaveProposal(nextStatus = status) {
    markSaving();
    const supabase = createClient();
    try {
      const dbData = {
        project_id: projectId,
        estimate_id: estimate?.id || null,
        content: content as never,
        status: nextStatus,
        version: 1,
      };

      if (proposalId) {
        await supabase.from('proposals').update(dbData).eq('id', proposalId);
      } else {
        const { data: inserted } = await supabase.from('proposals').insert(dbData).select().single();
        if (inserted) setProposalId(inserted.id);
      }

      setStatus(nextStatus);
      markSaved();
    } catch {
      markSaveError();
    }
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
        <span className="text-text-secondary text-sm">Loading proposal workspace...</span>
      </div>
    );
  }

  const issuedDate = new Date().toLocaleDateString('en-IN');
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 30);
  const validUntilDate = validUntil.toLocaleDateString('en-IN');

  return (
    <div className="animate-fade-in flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-glass text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Interactive Proposal Builder</h1>
            <p className="text-text-secondary text-sm mt-0.5">Customize cover letters, payment terms, and review proposal layouts</p>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => window.print()}
            className="btn-secondary text-xs !py-2 !px-3"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
          <button
            onClick={() => handleSaveProposal('sent')}
            className="btn-primary text-xs !py-2 !px-4"
          >
            <Send className="w-4 h-4" /> Send Proposal
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Columns: Proposal Preview (Paper-like view) */}
        <div className="lg:col-span-2 glass-card-static p-8 sm:p-12 bg-white text-slate-800 shadow-xl flex flex-col gap-6 print:border-0 print:shadow-none min-h-[842px]">
          {/* Branded Letterhead */}
          <div className="flex justify-between items-start border-b-2 border-slate-200 pb-6">
            <div>
              <div className="text-2xl font-black tracking-wider text-slate-900">TEJUM SMART</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Smart Automation Systems</div>
            </div>
            <div className="text-right text-xs text-slate-500">
              <div>Tejum Smart Home Pvt. Ltd.</div>
              <div>contact@tejum.com</div>
              <div>+91 99000 88000</div>
            </div>
          </div>

          {/* Customer Metadata */}
          <div className="flex justify-between text-xs text-slate-600 mt-2">
            <div>
              <div className="font-bold text-slate-800 uppercase">Prepared For:</div>
              <div className="font-semibold text-slate-900 text-sm mt-1">{customer?.full_name}</div>
              <div>{customer?.city}, {customer?.state || 'India'}</div>
              <div>{customer?.mobile}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-slate-800 uppercase">Proposal Metadata:</div>
              <div>Date: {issuedDate}</div>
              <div>Valid until: {validUntilDate}</div>
              <div>Version: v1.0</div>
            </div>
          </div>

          {/* Intro Letter (Editable in sidebar) */}
          <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap pt-4">
            {content.intro}
          </div>

          {/* Project Scope */}
          <div className="pt-4 flex flex-col gap-2">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide border-b border-slate-200 pb-1">
              Project Automation Scope
            </h3>
            <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
              {content.scope}
            </p>
          </div>

          {/* Pricing Table Summary */}
          {estimate && (
            <div className="pt-4 flex flex-col gap-2">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide border-b border-slate-200 pb-1">
                Commercial Summary
              </h3>
              <div className="flex flex-col gap-2 pt-2 text-sm text-slate-700">
                <div className="flex justify-between">
                  <span>Smart Automation Equipment</span>
                  <span>{formatCurrency(estimate.hardware_total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Wiring & Installation Services</span>
                  <span>{formatCurrency(estimate.installation_total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hubs & System Programming</span>
                  <span>{formatCurrency(estimate.programming_total)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-2 text-base">
                  <span>Total Project Price (GST 18% Incl.)</span>
                  <span className="text-slate-950">{formatCurrency(estimate.grand_total)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Terms */}
          <div className="pt-4 flex flex-col gap-2">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide border-b border-slate-200 pb-1">
              Payment & Milestone terms
            </h3>
            <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
              {content.terms}
            </p>
          </div>
        </div>

        {/* Right Column: Editor Controls Sidebar */}
        <div className="flex flex-col gap-6 print:hidden">
          {/* Status Settings */}
          <div className="glass-card-static p-5 flex flex-col gap-4">
            <h3 className="font-bold text-xs text-text-secondary uppercase tracking-wider">Proposal Status</h3>
            <div className="flex flex-wrap gap-2">
              {['draft', 'sent', 'accepted', 'rejected'].map((st) => (
                <button
                  key={st}
                  onClick={() => handleSaveProposal(st as never)}
                  className={`text-xs px-3 py-1.5 rounded font-semibold capitalize border transition-all ${
                    status === st
                      ? st === 'accepted'
                        ? 'bg-success-muted text-success border-success/30'
                        : st === 'rejected'
                        ? 'bg-error-muted text-error border-error/30'
                        : 'bg-gold-muted text-gold border-gold/30'
                      : 'border-glass-border text-text-secondary hover:border-glass-border-hover'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Document Section Editors */}
          <div className="glass-card-static p-5 flex flex-col gap-4">
            <h3 className="font-bold text-xs text-text-secondary uppercase tracking-wider">Edit Content Sections</h3>

            <div>
              <label htmlFor="intro_edit" className="input-label !text-xs">Letter Introduction</label>
              <textarea
                id="intro_edit"
                value={content.intro}
                onChange={(e) => setContent((prev) => ({ ...prev, intro: e.target.value }))}
                onBlur={() => handleSaveProposal()}
                className="input-field !text-xs min-h-[100px] text-text-primary"
              />
            </div>

            <div>
              <label htmlFor="scope_edit" className="input-label !text-xs">Project Scope Summary</label>
              <textarea
                id="scope_edit"
                value={content.scope}
                onChange={(e) => setContent((prev) => ({ ...prev, scope: e.target.value }))}
                onBlur={() => handleSaveProposal()}
                className="input-field !text-xs min-h-[100px] text-text-primary"
              />
            </div>

            <div>
              <label htmlFor="terms_edit" className="input-label !text-xs">Payment Inclusions & Terms</label>
              <textarea
                id="terms_edit"
                value={content.terms}
                onChange={(e) => setContent((prev) => ({ ...prev, terms: e.target.value }))}
                onBlur={() => handleSaveProposal()}
                className="input-field !text-xs min-h-[100px] text-text-primary"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
