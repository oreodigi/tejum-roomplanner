'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePlannerStore } from '@/lib/stores/planner-store';
import type { Customer, SiteSurvey, ProjectDevice } from '@/lib/types';
import { 
  Calendar, CheckCircle2, User, Lightbulb,
  Sparkles, Download, ArrowLeft
} from 'lucide-react';
import { PlannerStep } from '@/components/planner/PlannerStep';
import { SmartSummaryCard, SummaryItem } from '@/components/planner/SmartSummaryCard';

export default function SummaryPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { setStep, reset } = usePlannerStore();

  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [survey, setSurvey] = useState<SiteSurvey | null>(null);
  const [devices, setDevices] = useState<ProjectDevice[]>([]);
  const [roomCount, setRoomCount] = useState(0);

  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('10:00');
  const [surveyNotes, setSurveyNotes] = useState('');
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    setStep('summary');
  }, [setStep]);

  const loadData = useCallback(async () => {
    const supabase = createClient();

    const { data: proj } = await supabase.from('projects').select('*').eq('id', projectId).single();

    if (proj) {
      const { data: cust } = await supabase.from('customers').select('*').eq('id', proj.customer_id).single();
      setCustomer(cust);
    }

    const { data: surveyData } = await supabase.from('site_surveys').select('*').eq('project_id', projectId).maybeSingle();
    setSurvey(surveyData);

    const { data: roomsData } = await supabase.from('rooms').select('id', { count: 'exact' }).eq('project_id', projectId);
    setRoomCount(roomsData?.length || 0);

    const { data: allProjectDevices } = await supabase
      .from('project_devices')
      .select('*, rooms!inner(project_id)')
      .eq('rooms.project_id', projectId);

    setDevices(allProjectDevices || []);

    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => void loadData(), 0);
    return () => clearTimeout(timeoutId);
  }, [loadData]);

  async function handleScheduleSurvey(e: React.FormEvent) {
    e.preventDefault();
    if (!scheduledDate) return;

    setScheduling(true);
    const supabase = createClient();
    const dt = new Date(`${scheduledDate}T${scheduledTime}:00`);
    const surveyData = {
      project_id: projectId,
      scheduled_date: dt.toISOString(),
      notes: surveyNotes,
      status: 'requested',
    };

    if (survey) {
      await supabase.from('site_surveys').update(surveyData).eq('id', survey.id);
    } else {
      await supabase.from('site_surveys').insert(surveyData);
    }

    const { data: updatedSurvey } = await supabase.from('site_surveys').select('*').eq('project_id', projectId).single();
    setSurvey(updatedSurvey);
    setScheduling(false);
  }

  function handleStartNew() {
    reset();
    router.push('/planner/new');
  }

  if (loading) {
    return (
      <PlannerStep>
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
          <span className="text-text-secondary font-medium">Preparing your summary...</span>
        </div>
      </PlannerStep>
    );
  }

  const totalDevices = devices.reduce((sum, d) => sum + (d.quantity || 1), 0);
  const estimatedBudget = totalDevices * 3500; // Placeholder calculation

  return (
    <PlannerStep>
      <div className="flex flex-col gap-10 pb-10">
        
        {/* Success Header */}
        <div className="text-center bg-bg-card border border-glass-border rounded-3xl p-10 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-accent-light to-accent"></div>
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Your Smart Home Plan Is Ready
          </h1>
          <p className="text-lg text-text-secondary max-w-lg mx-auto mb-8">
            Congratulations {customer?.full_name || 'Guest'}! We&apos;ve mapped out your requirements and prepared your configurations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => alert('Proposal PDF generation is preparing...')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-accent text-text-inverse rounded-xl font-bold hover:bg-accent-light transition-colors"
            >
              <Download className="w-5 h-5" /> Download Proposal
            </button>
            <button
              onClick={() => alert('BOQ Excel spreadsheet is preparing...')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-glass border border-glass-border text-text-primary hover:bg-glass-border-hover rounded-xl font-semibold transition-colors"
            >
              <Download className="w-5 h-5" /> Export BOQ
            </button>
          </div>
        </div>

        {/* Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SmartSummaryCard 
            title="Customer Details" 
            icon={<User className="w-5 h-5" />}
            onEdit={() => router.push(`/planner/${projectId}/customer-details`)}
          >
            <SummaryItem label="Name" value={customer?.full_name || 'Not provided'} />
            <SummaryItem label="Email" value={customer?.email || 'Not provided'} />
            <SummaryItem label="Phone" value={customer?.mobile || 'Not provided'} />
          </SmartSummaryCard>

          <SmartSummaryCard 
            title="Project Scope" 
            icon={<Lightbulb className="w-5 h-5" />}
            onEdit={() => router.push(`/planner/${projectId}/rooms`)}
          >
            <SummaryItem label="Total Rooms" value={roomCount} />
            <SummaryItem label="Smart Devices" value={totalDevices} />
            <SummaryItem 
              label="Estimated Budget" 
              value={<span className="text-accent font-bold">₹{estimatedBudget.toLocaleString('en-IN')}*</span>} 
            />
          </SmartSummaryCard>
        </div>

        {/* Next Steps & Survey */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-bg-card border border-glass-border rounded-3xl p-8">
            <h2 className="text-xl font-bold flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-accent" />
              What Happens Next?
            </h2>
            <div className="flex flex-col gap-6">
              {[
                { step: '1', title: 'Consultation Call', desc: 'A senior architect will review configurations and layouts with you.' },
                { step: '2', title: 'On-site Survey', desc: 'An engineer will verify wiring, router range, and conduit depths.' },
                { step: '3', title: 'Proposal Sign-off', desc: 'We lock in the BOQ quote and coordinate with your decorator.' },
                { step: '4', title: 'Handover', desc: 'We complete cabling, hardware installation, and program smart scenes.' },
              ].map((step) => (
                <div key={step.step} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold shrink-0">
                    {step.step}
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary">{step.title}</h4>
                    <p className="text-sm text-text-secondary mt-1">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-bg-card border border-glass-border rounded-3xl p-8">
            <h2 className="text-xl font-bold flex items-center gap-3 mb-2">
              <Calendar className="w-6 h-6 text-accent" />
              Schedule Site Survey
            </h2>
            <p className="text-sm text-text-secondary mb-6">Book a physical visit by our automation engineer</p>

            {survey ? (
              <div className="p-6 rounded-2xl bg-success/10 border border-success/20 flex flex-col gap-4">
                <div className="flex items-center gap-3 text-success font-bold">
                  <CheckCircle2 className="w-6 h-6 shrink-0" />
                  <span>Survey Requested</span>
                </div>
                <div>
                  <div className="text-sm text-text-secondary mb-1">Requested For:</div>
                  <div className="font-bold text-text-primary">
                    {new Date(survey.scheduled_date || '').toLocaleDateString('en-IN', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })} at {new Date(survey.scheduled_date || '').toLocaleTimeString('en-IN', {
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                </div>
                <p className="text-xs text-text-muted">
                  Our team will call you within 24 hours to confirm.
                </p>
              </div>
            ) : (
              <form onSubmit={handleScheduleSurvey} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Select Date</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-bg-input border border-glass-border rounded-xl px-4 py-3 text-sm focus:border-accent outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Select Time Slot</label>
                  <select
                    required
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full bg-bg-input border border-glass-border rounded-xl px-4 py-3 text-sm focus:border-accent outline-none transition-colors"
                  >
                    <option value="10:00">10:00 AM – 12:00 PM</option>
                    <option value="12:00">12:00 PM – 02:00 PM</option>
                    <option value="14:00">02:00 PM – 04:00 PM</option>
                    <option value="16:00">04:00 PM – 06:00 PM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Notes</label>
                  <textarea
                    value={surveyNotes}
                    onChange={(e) => setSurveyNotes(e.target.value)}
                    className="w-full bg-bg-input border border-glass-border rounded-xl px-4 py-3 text-sm focus:border-accent outline-none transition-colors min-h-[80px]"
                    placeholder="e.g. Call before coming..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={scheduling}
                  className="w-full py-4 bg-glass border border-glass-border text-text-primary hover:bg-glass-border-hover rounded-xl font-bold transition-colors mt-2"
                >
                  {scheduling ? 'Scheduling...' : 'Request Survey'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-glass-border">
          <button
            type="button"
            onClick={() => router.push(`/planner/${projectId}/rooms`)}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Rooms
          </button>
          <button
            onClick={handleStartNew}
            className="px-6 py-3 bg-glass border border-glass-border text-text-primary hover:bg-glass-border-hover rounded-xl font-semibold transition-colors"
          >
            Start New Plan
          </button>
        </div>

      </div>
    </PlannerStep>
  );
}
