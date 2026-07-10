'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Project } from '@/lib/types';
import { Plus, ChevronRight, FolderOpen } from 'lucide-react';

export default function ProjectsListPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Projects</h1>
          <p className="text-text-secondary text-sm mt-1">
            Your smart home plans
          </p>
        </div>
        <Link href="/planner/new" className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> New Project
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 glass-card-static p-10">
          <FolderOpen className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">No projects yet</h2>
          <p className="text-text-secondary text-sm mb-6">
            Start your first smart home plan
          </p>
          <Link href="/planner/new" className="btn-primary">
            <Plus className="w-4 h-4" /> Create Your First Project
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/planner/${project.id}/customer-details`}
              className="glass-card p-4 sm:p-5 flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-gold-muted flex items-center justify-center shrink-0">
                <span className="text-gold font-bold text-lg">
                  {project.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{project.name}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-text-muted">
                    {project.completion_pct}% complete
                  </span>
                  <span className="text-xs text-text-muted">
                    {new Date(project.updated_at).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <div className="progress-bar mt-2 !h-1.5">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${project.completion_pct}%` }}
                  />
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-gold transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
