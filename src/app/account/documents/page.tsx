import { FileText, Download } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DocumentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch projects that belong to this user
  // Also fetch the customer id
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('user_id', user.id)
    .single();

  let query = supabase.from('projects').select('id, name, created_at, status');
  
  if (customer) {
    query = query.or(`created_by.eq.${user.id},customer_id.eq.${customer.id}`);
  } else {
    query = query.eq('created_by', user.id);
  }

  const { data: projects } = await query.order('created_at', { ascending: false });

  // Only show projects that are not completely empty drafts. Wait, actually all submitted projects should have an estimate.
  const submittedProjects = projects?.filter(p => p.status !== 'draft') || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Documents</h1>
        <p className="text-text-secondary text-sm mt-1">
          Your estimates, BOQs, and technical plans
        </p>
      </div>

      {submittedProjects.length === 0 ? (
        <div className="text-center py-20 glass-card-static p-10 max-w-xl mx-auto border-dashed">
          <FileText className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">No documents yet</h2>
          <p className="text-text-secondary text-sm mb-6">
            Submit a smart home plan to receive your detailed estimate and Bill of Quantities (BOQ).
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {submittedProjects.map((project) => (
            <div key={project.id} className="glass-card-static p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="w-10 h-10 rounded-lg bg-bg-tertiary flex items-center justify-center text-gold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-xs bg-bg-tertiary px-2 py-1 rounded-full text-text-secondary">
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-semibold text-text-primary mb-1 line-clamp-1">{project.name}</h3>
                <p className="text-sm text-text-secondary mb-4">Preliminary Estimate</p>
              </div>
              
              <a 
                href={`/api/documents/generate?projectId=${project.id}`} 
                target="_blank" 
                rel="noreferrer"
                className="btn-secondary w-full py-2 text-sm gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
