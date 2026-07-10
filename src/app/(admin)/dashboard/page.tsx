'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SiteSurvey, Project } from '@/lib/types';
import {
  Users, Calendar, CheckCircle2, IndianRupee,
  ArrowUpRight, FolderOpen, Loader2
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalLeads: number;
  activeSurveys: number;
  wonProjects: number;
  pipelineValue: number;
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    activeSurveys: 0,
    wonProjects: 0,
    pipelineValue: 0,
  });
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentSurveys, setRecentSurveys] = useState<(SiteSurvey & { project?: Project })[]>([]);

  useEffect(() => {
    async function loadStats() {
      try {
        const supabase = createClient();

        // 1. Leads
        const { count: leadsCount } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true });

        // 2. Active Surveys
        const { count: surveyCount } = await supabase
          .from('site_surveys')
          .select('*', { count: 'exact', head: true })
          .in('status', ['requested', 'scheduled']);

        // 3. Won Projects
        const { count: wonCount } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'won');

        // 4. Pipeline Value (Sum of estimate grand totals)
        const { data: estimates } = await supabase
          .from('estimates')
          .select('grand_total');
        const pipeSum = estimates?.reduce((sum, e) => sum + Number(e.grand_total), 0) || 0;

        setStats({
          totalLeads: leadsCount || 0,
          activeSurveys: surveyCount || 0,
          wonProjects: wonCount || 0,
          pipelineValue: pipeSum,
        });

        // Recent Projects
        const { data: projData } = await supabase
          .from('projects')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(5);
        setRecentProjects(projData || []);

        // Recent Surveys
        const { data: surveyList } = await supabase
          .from('site_surveys')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        
        // Fetch project details for surveys
        if (surveyList && surveyList.length > 0) {
          const projectIds = surveyList.map((s) => s.project_id);
          const { data: pData } = await supabase
            .from('projects')
            .select('*')
            .in('id', projectIds);
          
          const joinedSurveys = surveyList.map((s) => ({
            ...s,
            project: pData?.find((p) => p.id === s.project_id),
          }));
          setRecentSurveys(joinedSurveys);
        }

        setLoading(false);
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    }
    loadStats();
  }, []);

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
        <span className="text-text-secondary text-sm">Compiling KPI metrics...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Dashboard Overview</h1>
        <p className="text-text-secondary text-sm mt-0.5">Tejum Smart Sales and Projects health board</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Active Pipeline Leads',
            value: stats.totalLeads,
            icon: <Users className="w-5 h-5 text-gold" />,
            desc: 'New and ongoing sales pipeline leads',
          },
          {
            label: 'Site Surveys Scheduled',
            value: stats.activeSurveys,
            icon: <Calendar className="w-5 h-5 text-indigo-400" />,
            desc: 'Physical site surveys pending completion',
          },
          {
            label: 'Confirmed Won Projects',
            value: stats.wonProjects,
            icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
            desc: 'Converted and signed proposal files',
          },
          {
            label: 'Estimated Pipeline Value',
            value: formatCurrency(stats.pipelineValue),
            icon: <IndianRupee className="w-5 h-5 text-amber-500" />,
            desc: 'Aggregate value of all client estimators',
          },
        ].map((kpi, idx) => (
          <div key={idx} className="glass-card-static p-5 flex flex-col justify-between min-h-[120px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{kpi.label}</span>
              <div className="p-2 rounded-lg bg-glass border border-glass-border">
                {kpi.icon}
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">{kpi.value}</div>
              <div className="text-[10px] text-text-muted mt-1 leading-tight">{kpi.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent project requirements updates */}
        <div className="glass-card-static p-5 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-glass-border pb-3">
            <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
              <FolderOpen className="w-4.5 h-4.5 text-gold" />
              Recent Requirement Plans
            </h3>
            <Link href="/projects" className="text-xs text-gold hover:text-gold-light flex items-center gap-0.5">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {recentProjects.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-6">No recent projects.</p>
            ) : (
              recentProjects.map((p) => (
                <div key={p.id} className="flex justify-between items-center text-xs sm:text-sm py-1 border-b border-glass-border/30 last:border-0 pb-2">
                  <div>
                    <span className="font-semibold text-text-primary block">{p.name}</span>
                    <span className="text-xs text-text-secondary">Step: {p.current_step.replace(/_/g, ' ')}</span>
                  </div>
                  <span className="text-xs bg-gold-muted text-gold px-2 py-0.5 rounded border border-gold/10 font-medium">
                    {p.completion_pct}%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Site surveys pipeline list */}
        <div className="glass-card-static p-5 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-glass-border pb-3">
            <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
              <Calendar className="w-4.5 h-4.5 text-gold" />
              Recent Survey Requests
            </h3>
            <Link href="/leads" className="text-xs text-gold hover:text-gold-light flex items-center gap-0.5">
              View Leads <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {recentSurveys.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-6">No recent survey bookings.</p>
            ) : (
              recentSurveys.map((s) => (
                <div key={s.id} className="flex justify-between items-center text-xs sm:text-sm py-1 border-b border-glass-border/30 last:border-0 pb-2">
                  <div>
                    <span className="font-semibold text-text-primary block">{s.project?.name || 'Smart Home survey'}</span>
                    <span className="text-xs text-text-muted">
                      {s.scheduled_date ? new Date(s.scheduled_date).toLocaleDateString('en-IN') : 'Unscheduled'}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                    s.status === 'requested'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : s.status === 'scheduled'
                      ? 'bg-info-muted text-info border-info/20'
                      : 'bg-success-muted text-success border-success/20'
                  }`}>
                    {s.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
