'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePlannerStore } from '@/lib/stores/planner-store';
import type { Room, SecurityRequirement, SecurityRequirementType } from '@/lib/types';
import { ArrowLeft, ArrowRight, Shield, Lock, Eye, Video, Flame, Cloud, Droplets, Loader2 } from 'lucide-react';

interface SecurityOption {
  type: SecurityRequirementType;
  label: string;
  desc: string;
  icon: React.ReactNode;
  category: 'access' | 'surveillance' | 'safety';
}

const SECURITY_OPTIONS: SecurityOption[] = [
  // Access Control
  {
    type: 'smart_lock',
    label: 'Smart Main Door Lock',
    desc: 'Biometric fingerprint, PIN code, RFID card, and emergency key backup.',
    icon: <Lock className="w-5 h-5 text-gold" />,
    category: 'access',
  },
  {
    type: 'video_doorbell',
    label: 'Video Doorbell',
    desc: 'HD camera, 2-way talk, motion alerts, and integration with indoor screens.',
    icon: <Video className="w-5 h-5 text-gold" />,
    category: 'access',
  },
  // Surveillance
  {
    type: 'cctv_outdoor',
    label: 'Outdoor CCTV Camera',
    desc: 'Weatherproof HD security camera with color night vision and AI human detection.',
    icon: <Eye className="w-5 h-5 text-indigo-400" />,
    category: 'surveillance',
  },
  {
    type: 'cctv_indoor',
    label: 'Indoor CCTV Camera',
    desc: '360° pan-tilt camera with physical privacy shield mode.',
    icon: <Eye className="w-5 h-5 text-indigo-400" />,
    category: 'surveillance',
  },
  // Sensors & Safety
  {
    type: 'gas_leak_sensor',
    label: 'Kitchen Gas Leak Sensor',
    desc: 'Detects LPG/CNG leak, sounds built-in siren, and alerts your phone immediately.',
    icon: <Flame className="w-5 h-5 text-rose-400" />,
    category: 'safety',
  },
  {
    type: 'smoke_sensor',
    label: 'Smoke Detector',
    desc: 'Photoelectric sensor to detect smoke early and trigger alarms.',
    icon: <Cloud className="w-5 h-5 text-rose-400" />,
    category: 'safety',
  },
  {
    type: 'water_leak_sensor',
    label: 'Water Flood Sensor',
    desc: 'Placed near washing machines or bathroom drains to detect water leaks early.',
    icon: <Droplets className="w-5 h-5 text-cyan-400" />,
    category: 'safety',
  },
  {
    type: 'door_sensor',
    label: 'Door/Window Intrusion Sensor',
    desc: 'Triggers alarm if doors or windows are opened while security is armed.',
    icon: <Shield className="w-5 h-5 text-emerald-400" />,
    category: 'safety',
  },
];

export default function SmartSecurityPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { setStep, markStepComplete, markSaved, markSaving } = usePlannerStore();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [requirements, setRequirements] = useState<SecurityRequirement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setStep('security');
  }, [setStep]);

  const loadData = useCallback(async () => {
    const supabase = createClient();

    // Fetch rooms
    const { data: roomData } = await supabase
      .from('rooms')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order');
    setRooms(roomData || []);

    // Fetch existing security requirements
    const { data: reqData } = await supabase
      .from('security_requirements')
      .select('*')
      .eq('project_id', projectId);
    setRequirements(reqData || []);

    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadData();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadData]);

  // Add/Remove security option
  async function handleToggleOption(option: SecurityOption) {
    const supabase = createClient();
    const existing = requirements.find((r) => r.requirement_type === option.type);

    markSaving();

    if (existing) {
      // Delete
      await supabase.from('security_requirements').delete().eq('id', existing.id);
      setRequirements((prev) => prev.filter((r) => r.id !== existing.id));
    } else {
      // Insert with default qty 1
      const { data: newReq } = await supabase
        .from('security_requirements')
        .insert({
          project_id: projectId,
          requirement_type: option.type,
          quantity: 1,
        })
        .select()
        .single();

      if (newReq) {
        setRequirements((prev) => [...prev, newReq]);
      }
    }

    markSaved();
  }

  // Update quantity
  async function handleUpdateQty(req: SecurityRequirement, qty: number) {
    const supabase = createClient();
    markSaving();

    await supabase
      .from('security_requirements')
      .update({ quantity: qty })
      .eq('id', req.id);

    setRequirements((prev) =>
      prev.map((r) => (r.id === req.id ? { ...r, quantity: qty } : r))
    );
    markSaved();
  }

  // Update Room assignment
  async function handleUpdateRoom(req: SecurityRequirement, roomId: string | null) {
    const supabase = createClient();
    markSaving();

    await supabase
      .from('security_requirements')
      .update({ room_id: roomId })
      .eq('id', req.id);

    setRequirements((prev) =>
      prev.map((r) => (r.id === req.id ? { ...r, room_id: roomId } : r))
    );
    markSaved();
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-gold" />
        <span className="text-text-secondary text-sm">Loading security preferences...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Smart Security & Surveillance</h1>
        <p className="text-text-secondary">
          Protect your home with advanced intrusion detection and safety monitoring
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Categories */}
        {['access', 'surveillance', 'safety'].map((cat) => {
          const catOptions = SECURITY_OPTIONS.filter((o) => o.category === cat);
          const title = cat === 'access' ? 'Access Control' : cat === 'surveillance' ? 'Video Surveillance' : 'Sensors & Safety';
          const desc = cat === 'access' ? 'Keyless entry and guest authorization' : cat === 'surveillance' ? 'IP Cameras and night surveillance' : 'Early warning leak, smoke and intrusion sensors';

          return (
            <div key={cat} className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-semibold capitalize">{title}</h2>
                <p className="text-xs text-text-muted">{desc}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {catOptions.map((option) => {
                  const req = requirements.find((r) => r.requirement_type === option.type);
                  const isSelected = !!req;

                  return (
                    <div
                      key={option.type}
                      className={`selection-card flex flex-col gap-4 !cursor-default ${
                        isSelected ? 'selected' : ''
                      }`}
                    >
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-lg bg-bg-card flex items-center justify-center shrink-0 border border-glass-border">
                          {option.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-text-primary text-sm sm:text-base">{option.label}</h3>
                          <p className="text-xs text-text-secondary mt-1 leading-relaxed">{option.desc}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleOption(option)}
                          className={`w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                            isSelected ? 'border-gold bg-gold' : 'border-glass-border hover:border-glass-border-hover'
                          }`}
                        >
                          {isSelected && <span className="text-bg-primary text-[10px] font-bold">✓</span>}
                        </button>
                      </div>

                      {/* Additional config if selected */}
                      {req && (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-glass-border/30 animate-fade-in">
                          {/* Quantity */}
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-text-secondary font-medium">Quantity:</span>
                            <div className="qty-control !border-glass-border/50">
                              <button
                                type="button"
                                className="qty-btn !w-7 !h-7 !text-sm"
                                onClick={() => handleUpdateQty(req, Math.max(1, req.quantity - 1))}
                              >
                                −
                              </button>
                              <span className="qty-value !w-7 !py-0.5 text-xs">{req.quantity}</span>
                              <button
                                type="button"
                                className="qty-btn !w-7 !h-7 !text-sm"
                                onClick={() => handleUpdateQty(req, req.quantity + 1)}
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Room Assignment */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-text-secondary font-medium">Location:</span>
                            <select
                              value={req.room_id || ''}
                              onChange={(e) => handleUpdateRoom(req, e.target.value || null)}
                              className="input-field !py-1 !px-2.5 text-xs max-w-[150px]"
                            >
                              <option value="">Default Location</option>
                              {rooms.map((r) => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-8 border-t border-glass-border">
          <button
            type="button"
            onClick={() => router.push(`/planner/${projectId}/lighting`)}
            className="btn-ghost"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Lighting
          </button>
          <button
            type="button"
            onClick={() => {
              markStepComplete('security');
              router.push(`/planner/${projectId}/ai-automation`);
            }}
            className="btn-primary"
          >
            Continue to AI Automation <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
