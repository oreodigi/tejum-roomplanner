'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Project } from '@/lib/types';
import { Plus, ChevronRight, FolderOpen, Search, Filter } from 'lucide-react';
import { useVisualPlannerStore } from '@/lib/stores/visual-planner-store';
import { useRouter } from 'next/navigation';

export default function PlansListPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const store = useVisualPlannerStore();
  const router = useRouter();

  useEffect(() => {
    async function loadProjects() {
      const supabase = createClient();
      const { data } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });
      setProjects(data || []);
      setLoading(false);
    }
    loadProjects();
  }, []);

  const hasLocalDraft = store.lastUpdatedAt !== null && (store.automationPackage !== null || store.rooms.length > 0);

  function startNewPlan() {
    store.reset();
    router.push('/planner/new');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Plans</h1>
          <p className="text-text-secondary text-sm mt-1">
            Manage your smart home configurations
          </p>
        </div>
        <button onClick={startNewPlan} className="btn-primary shrink-0">
          <Plus className="w-4 h-4" /> Start New Plan
        </button>
      </div>

      <div className="flex items-center gap-3 pb-4 border-b border-border-color">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search plans..." 
            className="input-field pl-9 h-10 text-sm w-full"
          />
        </div>
        <button className="h-10 px-4 rounded-lg bg-bg-tertiary border border-border-color flex items-center gap-2 text-sm font-medium hover:bg-bg-secondary transition-colors">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : projects.length === 0 && !hasLocalDraft ? (
        <div className="text-center py-20 glass-card-static p-10 max-w-xl mx-auto border-dashed">
          <FolderOpen className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">No plans found</h2>
          <p className="text-text-secondary text-sm mb-6">
            You haven&apos;t created any smart home plans yet. Start planning your space room by room.
          </p>
          <button onClick={startNewPlan} className="btn-primary">
            Create Your First Plan
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {hasLocalDraft && (
            <div className="glass-card-static p-5 flex flex-col h-full border-gold/30 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gold/5" />
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-gold" />
              <div className="flex-1 relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gold/10 text-gold uppercase tracking-wide">Unsaved Draft</span>
                  <span className="text-xs text-text-muted">{store.lastUpdatedAt ? new Date(store.lastUpdatedAt).toLocaleDateString() : 'Recently'}</span>
                </div>
                <h3 className="font-bold text-lg mb-1">{store.property.propertyType.toUpperCase()} Smart Home</h3>
                <p className="text-sm text-text-secondary mb-4">{store.rooms.length} Rooms configured</p>
              </div>
              
              <div className="mt-auto relative z-10 pt-4 border-t border-border-color flex items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-text-muted">Progress</span>
                    <span className="text-xs font-medium">{store.rooms.length > 0 ? Math.round((store.rooms.filter(r => r.completionPct === 100).length / store.rooms.length) * 100) : 0}%</span>
                  </div>
                  <div className="progress-bar !h-1.5">
                    <div className="progress-bar-fill" style={{ width: `${store.rooms.length > 0 ? Math.round((store.rooms.filter(r => r.completionPct === 100).length / store.rooms.length) * 100) : 0}%` }} />
                  </div>
                </div>
                <Link href="/planner/new" className="w-10 h-10 rounded-full bg-gold text-bg-primary flex items-center justify-center hover:bg-gold-light transition-colors shrink-0">
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          )}

          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/planner/${project.id}/customer-details`}
              className="glass-card p-5 flex flex-col h-full group transition-all duration-300 hover:border-gold/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
                    project.status === 'draft' ? 'bg-bg-secondary text-text-secondary' : 
                    project.status === 'submitted' ? 'bg-success-muted text-success' : 
                    'bg-gold/10 text-gold'
                  }`}>
                    {project.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-text-muted">
                    {new Date(project.updated_at).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <h3 className="font-semibold text-text-primary group-hover:text-gold transition-colors">{project.name}</h3>
                <p className="text-sm text-text-secondary">Project Draft</p>
              </div>
              
              <div className="mt-auto pt-4 border-t border-border-color flex items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-text-muted">Progress</span>
                    <span className="text-xs font-medium">{project.completion_pct}%</span>
                  </div>
                  <div className="progress-bar !h-1.5">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${project.completion_pct}%` }}
                    />
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-bg-secondary text-text-primary flex items-center justify-center group-hover:bg-gold group-hover:text-bg-primary transition-colors shrink-0">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
