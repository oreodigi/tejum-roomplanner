'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePlannerStore } from '@/lib/stores/planner-store';
import type { Customer, Property, Room, AutomationScene, SecurityRequirement, AutomationRule, InfrastructureCheck, Project } from '@/lib/types';
import { ArrowLeft, ArrowRight, User, Building2, Lightbulb, Shield, Brain, Wifi, IndianRupee, Loader2, Sparkles } from 'lucide-react';

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { setStep, markStepComplete, markSaved, markSaving } = usePlannerStore();

  const [loading, setLoading] = useState(true);

  // All project components
  const [project, setProject] = useState<Project | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [scenes, setScenes] = useState<AutomationScene[]>([]);
  const [security, setSecurity] = useState<SecurityRequirement[]>([]);
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [infra, setInfra] = useState<InfrastructureCheck | null>(null);

  useEffect(() => {
    setStep('review');
  }, [setStep]);

  const loadAllData = useCallback(async () => {
    const supabase = createClient();

    // Project
    const { data: proj } = await supabase.from('projects').select('*').eq('id', projectId).single();
    setProject(proj);

    if (proj) {
      // Customer
      const { data: cust } = await supabase.from('customers').select('*').eq('id', proj.customer_id).single();
      setCustomer(cust);
    }

    // Property
    const { data: prop } = await supabase.from('properties').select('*').eq('project_id', projectId).single();
    setProperty(prop);

    // Rooms
    const { data: roomList } = await supabase.from('rooms').select('*').eq('project_id', projectId).order('sort_order');
    setRooms(roomList || []);

    // Scenes
    const { data: sceneList } = await supabase.from('automation_scenes').select('*').eq('project_id', projectId);
    setScenes(sceneList || []);

    // Security
    const { data: secList } = await supabase.from('security_requirements').select('*').eq('project_id', projectId);
    setSecurity(secList || []);

    // Rules
    const { data: ruleList } = await supabase.from('automation_rules').select('*').eq('project_id', projectId);
    setRules(ruleList || []);

    // Infra
    const { data: infraCheck } = await supabase.from('infrastructure_checks').select('*').eq('project_id', projectId).single();
    setInfra(infraCheck);

    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadAllData();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadAllData]);

  async function handleConfirm() {
    markSaving();

    const supabase = createClient();

    // Trigger Recommendation and Estimation engines by calling API routes or updates
    // In our client flow, we can trigger calculations directly or update project status to 'completed'
    await supabase
      .from('projects')
      .update({
        current_step: 'recommendation',
        status: 'requirement_completed',
        completion_pct: 100, // Mark 100% on review confirmation
      })
      .eq('id', projectId);

    markStepComplete('review');
    markSaved();

    router.push(`/planner/${projectId}/recommendation`);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-gold" />
        <span className="text-text-secondary text-sm">Compiling Smart Home Plan...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Review Your Requirements</h1>
        <p className="text-text-secondary">
          Double check your details before we calculate recommendations and pricing estimates
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Section 1: Customer Details */}
        {customer && (
          <div className="glass-card-static p-5">
            <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2 border-b border-glass-border pb-2 mb-3">
              <User className="w-5 h-5 text-gold" />
              Customer Details
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-text-muted text-xs">Name</div>
                <div className="font-semibold mt-0.5">{customer.full_name}</div>
              </div>
              <div>
                <div className="text-text-muted text-xs">Mobile</div>
                <div className="font-semibold mt-0.5">{customer.mobile || '—'}</div>
              </div>
              <div>
                <div className="text-text-muted text-xs">Preferred Contact</div>
                <div className="font-semibold mt-0.5 capitalize">{customer.preferred_contact || '—'}</div>
              </div>
              <div>
                <div className="text-text-muted text-xs">City</div>
                <div className="font-semibold mt-0.5">{customer.city || '—'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Property & Rooms */}
        {property && (
          <div className="glass-card-static p-5">
            <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2 border-b border-glass-border pb-2 mb-3">
              <Building2 className="w-5 h-5 text-gold" />
              Property & Rooms
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
              <div>
                <div className="text-text-muted text-xs">Property Type</div>
                <div className="font-semibold mt-0.5 capitalize">{property.property_type.replace('_', ' ')}</div>
              </div>
              <div>
                <div className="text-text-muted text-xs">Floors</div>
                <div className="font-semibold mt-0.5">{property.num_floors} Floor(s)</div>
              </div>
              <div>
                <div className="text-text-muted text-xs">Area</div>
                <div className="font-semibold mt-0.5">{property.built_up_area ? `${property.built_up_area} sq. ft.` : '—'}</div>
              </div>
              <div>
                <div className="text-text-muted text-xs">Total Rooms</div>
                <div className="font-semibold mt-0.5">{rooms.length} Room(s)</div>
              </div>
            </div>

            <div>
              <div className="text-text-muted text-xs mb-2">Configured Rooms List</div>
              <div className="flex flex-wrap gap-2">
                {rooms.map((r) => (
                  <span key={r.id} className="text-xs bg-glass px-2.5 py-1 rounded-full border border-glass-border">
                    {r.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Smart Lighting */}
        <div className="glass-card-static p-5">
          <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2 border-b border-glass-border pb-2 mb-3">
            <Lightbulb className="w-5 h-5 text-gold" />
            Smart Lighting Scenes
          </h2>
          {scenes.length === 0 ? (
            <p className="text-xs text-text-muted">No lighting scenes configured.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {scenes.map((s) => (
                <div key={s.id} className="flex justify-between items-center text-sm py-1">
                  <div>
                    <span className="font-semibold">{s.name}</span>
                    <span className="text-xs text-text-muted ml-2">({s.config.rooms?.length || 0} Rooms)</span>
                  </div>
                  <span className="text-xs text-success-muted text-success font-medium">Enabled</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 4: Security */}
        <div className="glass-card-static p-5">
          <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2 border-b border-glass-border pb-2 mb-3">
            <Shield className="w-5 h-5 text-gold" />
            Security & Surveillance
          </h2>
          {security.length === 0 ? (
            <p className="text-xs text-text-muted">No security features configured.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {security.map((s) => (
                <div key={s.id} className="flex justify-between items-center py-1">
                  <span className="font-semibold capitalize">{s.requirement_type.replace(/_/g, ' ')}</span>
                  <span className="text-xs bg-glass px-2 py-0.5 rounded border border-glass-border">
                    Qty: {s.quantity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 5: AI & Routines */}
        <div className="glass-card-static p-5">
          <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2 border-b border-glass-border pb-2 mb-3">
            <Brain className="w-5 h-5 text-gold" />
            AI & Smart Routines
          </h2>
          {rules.length === 0 ? (
            <p className="text-xs text-text-muted">No automation rules configured.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {rules.map((r) => (
                <div key={r.id} className="text-sm py-1 border-b border-glass-border/30 last:border-0 pb-2">
                  <span className="font-semibold capitalize text-gold">{r.trigger_type.replace(/_/g, ' ')}</span>
                  <p className="text-xs text-text-secondary mt-1">{r.natural_language}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 6: Infrastructure & Readiness */}
        {infra && (
          <div className="glass-card-static p-5">
            <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2 border-b border-glass-border pb-2 mb-3">
              <Wifi className="w-5 h-5 text-gold" />
              Technical Infrastructure
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-text-muted text-xs">Internet line</div>
                <div className="font-semibold mt-0.5">{infra.internet_available ? 'Yes' : 'No'}</div>
              </div>
              <div>
                <div className="text-text-muted text-xs">Mesh WiFi</div>
                <div className="font-semibold mt-0.5">{infra.mesh_wifi ? 'Yes' : 'No'}</div>
              </div>
              <div>
                <div className="text-text-muted text-xs">Neutral Wire</div>
                <div className="font-semibold mt-0.5">{infra.neutral_wiring ? 'Yes' : 'No'}</div>
              </div>
              <div>
                <div className="text-text-muted text-xs">Ethernet Cabling</div>
                <div className="font-semibold mt-0.5">{infra.ethernet_cabling ? 'Yes' : 'No'}</div>
              </div>
              <div>
                <div className="text-text-muted text-xs">Backup Power</div>
                <div className="font-semibold mt-0.5">
                  {infra.ups_available || infra.inverter_available || infra.generator_available ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 7: Budget & Priorities */}
        {project && (
          <div className="glass-card-static p-5">
            <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2 border-b border-glass-border pb-2 mb-3">
              <IndianRupee className="w-5 h-5 text-gold" />
              Budget & Priority
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-text-muted text-xs">Budget Range</div>
                <div className="font-semibold mt-0.5 capitalize">{project.budget_range?.replace(/_/g, ' ')}</div>
              </div>
              <div>
                <div className="text-text-muted text-xs">Automation Level</div>
                <div className="font-semibold mt-0.5 capitalize">{project.priority}</div>
              </div>
              <div>
                <div className="text-text-muted text-xs">Rollout Roadmap</div>
                <div className="font-semibold mt-0.5 capitalize">{project.implementation_preference?.replace(/_/g, ' ')}</div>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation warning banner */}
        <div className="p-4 rounded-lg bg-gold-muted border border-gold/20 flex gap-3 text-sm">
          <Sparkles className="w-5 h-5 text-gold shrink-0 mt-0.5 animate-pulse" />
          <p className="text-text-secondary leading-relaxed">
            By clicking confirm, we will process your choices using our 
            <strong> Tejum Intelligent Recommendation Engine</strong> to compile a recommended product BOQ 
            and complete financial estimate range.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-glass-border">
          <button
            type="button"
            onClick={() => router.push(`/planner/${projectId}/budget`)}
            className="btn-ghost"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="btn-primary"
          >
            Generate My Plan & Estimate <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
