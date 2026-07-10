'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Plus, 
  ArrowRight, 
  Clock, 
  FileText, 
  Calendar,
  AlertCircle,
  FolderOpen,
  MessageCircle,
  Award,
  Check
} from 'lucide-react';
import type { Project } from '@/lib/types';
import { useVisualPlannerStore } from '@/lib/stores/visual-planner-store';
import { useRouter } from 'next/navigation';

export default function AccountOverviewPage() {
  const [userName, setUserName] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const store = useVisualPlannerStore();
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: customer } = await supabase.from('customers').select('full_name').eq('user_id', user.id).single();
        if (customer) setUserName(customer.full_name);
        else setUserName(user.email?.split('@')[0] || 'User');

        const { data: userProjects } = await supabase
          .from('projects')
          .select('*, properties(*), leads(*)')
          .order('updated_at', { ascending: false });
        
        if (userProjects) setProjects(userProjects);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const activePlans = projects.filter(p => p.status === 'draft' || p.status === 'in_progress');
  const submittedPlans = projects.filter(p => !['draft', 'in_progress', 'archived'].includes(p.status));
  const recentPlans = projects.slice(0, 3);
  
  // Find local draft if any
  const hasLocalDraft = store.lastUpdatedAt !== null && (store.automationPackage !== null || store.rooms.length > 0);

  function startNewPlan() {
    store.reset();
    router.push('/planner/new');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-bg-tertiary p-6 sm:p-8 rounded-2xl border border-border-color relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {userName.split(' ')[0]}</h1>
          <p className="text-text-secondary">Ready to continue shaping your intelligent home?</p>
        </div>
        <button onClick={startNewPlan} className="btn-primary shrink-0 relative z-10 w-full md:w-auto">
          <Plus className="w-4 h-4" /> Start New Plan
        </button>
        {/* Decorative background element */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-gold-muted/20 to-transparent pointer-events-none" />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 sm:p-5 flex flex-col gap-2">
          <div className="w-8 h-8 rounded-lg bg-bg-secondary flex items-center justify-center text-text-muted mb-1">
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-2xl font-bold text-text-primary">{activePlans.length + (hasLocalDraft ? 1 : 0)}</span>
          <span className="text-xs text-text-secondary font-medium uppercase tracking-wider">Active Plans</span>
        </div>
        <div className="glass-card p-4 sm:p-5 flex flex-col gap-2">
          <div className="w-8 h-8 rounded-lg bg-bg-secondary flex items-center justify-center text-text-muted mb-1">
            <Check className="w-4 h-4" />
          </div>
          <span className="text-2xl font-bold text-text-primary">{submittedPlans.length}</span>
          <span className="text-xs text-text-secondary font-medium uppercase tracking-wider">Submitted</span>
        </div>
        <div className="glass-card p-4 sm:p-5 flex flex-col gap-2">
          <div className="w-8 h-8 rounded-lg bg-bg-secondary flex items-center justify-center text-text-muted mb-1">
            <FileText className="w-4 h-4" />
          </div>
          <span className="text-2xl font-bold text-text-primary">0</span>
          <span className="text-xs text-text-secondary font-medium uppercase tracking-wider">Documents</span>
        </div>
        <div className="glass-card p-4 sm:p-5 flex flex-col gap-2 border-gold/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gold/5" />
          <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold mb-1 relative z-10">
            <Calendar className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold text-text-primary relative z-10 mt-auto leading-tight">No upcoming events</span>
          <span className="text-xs text-gold font-medium uppercase tracking-wider relative z-10 mt-1">Status</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Continue Planning Card */}
          {hasLocalDraft && (
            <section>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-gold" /> Pick up where you left off
              </h2>
              <div className="glass-card-static p-5 sm:p-6 border-gold/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-gold" />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-gold/10 text-gold uppercase tracking-wide">Local Draft</span>
                    <span className="text-xs text-text-muted">{store.lastUpdatedAt ? new Date(store.lastUpdatedAt).toLocaleDateString() : 'Recently'}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{store.property.propertyType.toUpperCase()} Smart Home</h3>
                  <p className="text-sm text-text-secondary mb-3">{store.rooms.length} Rooms configured</p>
                  <div className="flex items-center gap-3 max-w-xs">
                    <div className="progress-bar !h-1.5 flex-1">
                      <div className="progress-bar-fill" style={{ width: `${store.rooms.length > 0 ? Math.round((store.rooms.filter(r => r.completionPct === 100).length / store.rooms.length) * 100) : 0}%` }} />
                    </div>
                    <span className="text-xs font-medium">{store.rooms.length > 0 ? Math.round((store.rooms.filter(r => r.completionPct === 100).length / store.rooms.length) * 100) : 0}%</span>
                  </div>
                </div>
                <Link href="/planner/new" className="btn-primary shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                  Continue Plan <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </section>
          )}

          {/* Recent Plans */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Recent Plans</h2>
              <Link href="/account/plans" className="text-sm text-gold hover:text-gold-light font-medium flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {recentPlans.length === 0 && !hasLocalDraft ? (
              <div className="glass-card-static p-8 text-center border-dashed">
                <FolderOpen className="w-10 h-10 text-text-muted mx-auto mb-3" />
                <h3 className="font-semibold mb-1">No plans yet</h3>
                <p className="text-sm text-text-secondary mb-4">Your first smart home starts here.</p>
                <button onClick={startNewPlan} className="btn-primary inline-flex">
                  Create My First Plan
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPlans.map(project => (
                  <Link key={project.id} href={`/account/plans/${project.id}`} className="glass-card p-4 flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-bg-secondary flex items-center justify-center shrink-0">
                      <FolderOpen className="w-5 h-5 text-text-secondary group-hover:text-gold transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold truncate pr-4">{project.name}</h3>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-bg-secondary text-text-secondary whitespace-nowrap">
                          {project.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted">
                        Updated {new Date(project.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <div className="glass-card-static p-5 rounded-2xl border-border-color">
            <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-text-muted">Quick Actions</h3>
            <div className="space-y-2">
              <button onClick={startNewPlan} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-bg-secondary transition-colors text-left text-sm font-medium">
                <Plus className="w-4 h-4 text-text-muted" /> Start new plan
              </button>
              <Link href="/account/plans" className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-bg-secondary transition-colors text-left text-sm font-medium">
                <FolderOpen className="w-4 h-4 text-text-muted" /> View all plans
              </Link>
              <Link href="/account/support" className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-bg-secondary transition-colors text-left text-sm font-medium">
                <MessageCircle className="w-4 h-4 text-text-muted" /> Contact support
              </Link>
            </div>
          </div>
          
          <div className="bg-gold/10 rounded-2xl p-5 border border-gold/20">
            <h3 className="font-bold text-gold mb-2 text-sm flex items-center gap-2"><Award className="w-4 h-4" /> Tejum Assurance</h3>
            <p className="text-xs text-text-secondary leading-relaxed mb-4">
              Every submitted plan is reviewed by our smart-home experts to ensure seamless integration and compatibility.
            </p>
            <Link href="/account/support" className="text-xs font-bold text-gold hover:text-gold-light uppercase tracking-wider">
              Learn More &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
