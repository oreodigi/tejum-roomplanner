'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePlannerStore } from '@/lib/stores/planner-store';
import { ArrowRight, Plus, FolderOpen, Clock } from 'lucide-react';

export default function NewProjectPage() {
  const router = useRouter();
  const { setProject, setStep, reset } = usePlannerStore();
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!projectName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Your session has expired. Please sign in again and retry.');
      }

      const { data: existingProfile, error: profileLookupError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (profileLookupError) {
        throw profileLookupError;
      }

      if (!existingProfile) {
        const fallbackName =
          typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name.trim()
            ? user.user_metadata.full_name.trim()
            : (user.email?.split('@')[0] || projectName.trim());

        const { error: profileInsertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            full_name: fallbackName,
            role: 'customer',
          });

        if (profileInsertError) {
          throw profileInsertError;
        }
      }

      // Create customer record
      const { data: customer, error: custErr } = await supabase
        .from('customers')
        .insert({
          full_name: projectName.trim(),
          user_id: user.id,
        })
        .select()
        .single();

      if (custErr) throw custErr;

      // Create project
      const { data: project, error: projErr } = await supabase
        .from('projects')
        .insert({
          customer_id: customer.id,
          created_by: user.id,
          name: projectName.trim(),
          mode: 'customer',
          current_step: 'customer_details',
        })
        .select()
        .single();

      if (projErr) throw projErr;

      // Initialize planner state
      reset();
      setProject(project.id, customer.id);
      setStep('customer_details');

      router.push(`/planner/${project.id}/customer-details`);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string') {
        setError(err.message);
      } else {
        setError('Failed to create project');
      }
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10 animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          Start Your Smart Home Plan
        </h1>
        <p className="text-text-secondary text-lg">
          Give your project a name to get started
        </p>
      </div>

      <div className="glass-card-static p-6 sm:p-8 animate-slide-up">
        <form onSubmit={handleCreateProject} className="flex flex-col gap-6">
          <div>
            <label htmlFor="projectName" className="input-label">Project Name</label>
            <input
              id="projectName"
              type="text"
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="input-field text-lg"
              placeholder="e.g., My Dream Home, Green Valley Villa, 3 BHK Automation"
              autoFocus
            />
            <p className="text-xs text-text-muted mt-2">
              You can use your name, property name, or any identifier
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-error-muted text-error text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !projectName.trim()}
            className="btn-primary text-base !py-3"
          >
            {loading ? (
              'Creating Project...'
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Create Project & Start Planning
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Existing Projects */}
      <div className="mt-10 text-center">
        <p className="text-text-muted text-sm mb-3">Have an existing plan?</p>
        <button
          onClick={() => router.push('/planner/projects')}
          className="btn-ghost"
        >
          <FolderOpen className="w-4 h-4" />
          View My Projects
        </button>
      </div>

      {/* Quick info */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
        {[
          { icon: <Clock className="w-5 h-5" />, text: 'Takes 15–30 minutes' },
          { icon: <FolderOpen className="w-5 h-5" />, text: 'Auto-saves your progress' },
          { icon: <ArrowRight className="w-5 h-5" />, text: 'Continue anytime' },
        ].map((item) => (
          <div key={item.text} className="flex items-center gap-3 text-sm text-text-secondary">
            <div className="text-gold">{item.icon}</div>
            {item.text}
          </div>
        ))}
      </div>
    </div>
  );
}
