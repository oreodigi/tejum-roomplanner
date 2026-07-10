'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePlannerStore } from '@/lib/stores/planner-store';
import type { Room, AutomationScene } from '@/lib/types';
import { ArrowLeft, ArrowRight, Sparkles, Check, Plus, Trash2, Film, Moon, PartyPopper, Sun, Home, Loader2 } from 'lucide-react';

interface ScenePreset {
  name: string;
  description: string;
  icon: React.ReactNode;
  tone: string;
  defaultConfig: {
    rooms?: string[];
    brightness?: number;
    color_temp?: string;
  };
}

const SCENE_PRESETS: ScenePreset[] = [
  {
    name: 'Movie Night',
    description: 'Dimmed ceiling spotlights, warm ambient backlights, and smart curtains closed.',
    icon: <Film className="w-5 h-5" />,
    tone: 'border-info/25 hover:border-info/50 text-info bg-info-muted',
    defaultConfig: { brightness: 20, color_temp: 'Warm' },
  },
  {
    name: 'Good Night',
    description: 'Turns off all common area lights, sets low-level pathway lighting, and locks the doors.',
    icon: <Moon className="w-5 h-5" />,
    tone: 'border-accent/25 hover:border-accent/50 text-accent bg-accent-muted',
    defaultConfig: { brightness: 0, color_temp: 'Warm' },
  },
  {
    name: 'Party / Dinner',
    description: 'Warm, cozy chandelier lighting at 60%, side lamps on, and accent wall wash lights on.',
    icon: <PartyPopper className="w-5 h-5" />,
    tone: 'border-error/25 hover:border-error/50 text-error bg-error-muted',
    defaultConfig: { brightness: 60, color_temp: 'Warm' },
  },
  {
    name: 'Reading / Work',
    description: 'Bright cool daylight output focused on study desk and reading chairs.',
    icon: <Sun className="w-5 h-5" />,
    tone: 'border-warning/25 hover:border-warning/50 text-warning bg-warning-muted',
    defaultConfig: { brightness: 90, color_temp: 'Cool' },
  },
  {
    name: 'Welcome Home',
    description: 'Foyer and living lights activate automatically to a warm guiding glow when you unlock the door.',
    icon: <Home className="w-5 h-5" />,
    tone: 'border-success/25 hover:border-success/50 text-success bg-success-muted',
    defaultConfig: { brightness: 70, color_temp: 'Warm' },
  },
];

export default function SmartLightingPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { setStep, markStepComplete, markSaved, markSaving } = usePlannerStore();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [scenes, setScenes] = useState<AutomationScene[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCustomModal, setShowCustomModal] = useState(false);

  useEffect(() => {
    setStep('lighting');
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

    // Fetch existing lighting scenes
    const { data: sceneData } = await supabase
      .from('automation_scenes')
      .select('*')
      .eq('project_id', projectId)
      .eq('scene_type', 'lighting')
      .order('sort_order');
    setScenes(sceneData || []);

    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadData();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadData]);

  // Toggle scene preset
  async function handleTogglePreset(preset: ScenePreset) {
    const supabase = createClient();
    const existing = scenes.find((s) => s.name === preset.name);

    markSaving();

    if (existing) {
      // Remove scene
      await supabase.from('automation_scenes').delete().eq('id', existing.id);
      setScenes((prev) => prev.filter((s) => s.id !== existing.id));
    } else {
      // Add scene
      const sortOrder = scenes.length;
      const { data: newScene } = await supabase
        .from('automation_scenes')
        .insert({
          project_id: projectId,
          name: preset.name,
          description: preset.description,
          scene_type: 'lighting',
          config: {
            rooms: rooms.map((r) => r.id), // default to all rooms
            brightness: preset.defaultConfig.brightness,
            color_temp: preset.defaultConfig.color_temp,
          },
          is_preset: true,
          sort_order: sortOrder,
        })
        .select()
        .single();

      if (newScene) {
        setScenes((prev) => [...prev, newScene]);
      }
    }

    markSaved();
  }

  // Toggle room in scene
  async function handleToggleRoomInScene(scene: AutomationScene, roomId: string) {
    const supabase = createClient();
    const currentRooms = scene.config.rooms || [];
    let nextRooms: string[];

    if (currentRooms.includes(roomId)) {
      nextRooms = currentRooms.filter((id) => id !== roomId);
    } else {
      nextRooms = [...currentRooms, roomId];
    }

    const nextConfig = { ...scene.config, rooms: nextRooms };

    markSaving();
    await supabase
      .from('automation_scenes')
      .update({ config: nextConfig })
      .eq('id', scene.id);

    setScenes((prev) =>
      prev.map((s) => (s.id === scene.id ? { ...s, config: nextConfig } : s))
    );
    markSaved();
  }

  // Add Custom Scene
  async function handleAddCustomScene(name: string, desc: string) {
    const supabase = createClient();
    const sortOrder = scenes.length;

    markSaving();
    const { data: newScene } = await supabase
      .from('automation_scenes')
      .insert({
        project_id: projectId,
        name,
        description: desc,
        scene_type: 'lighting',
        config: { rooms: rooms.map((r) => r.id) },
        is_preset: false,
        sort_order: sortOrder,
      })
      .select()
      .single();

    if (newScene) {
      setScenes((prev) => [...prev, newScene]);
      setShowCustomModal(false);
    }
    markSaved();
  }

  // Delete Scene
  async function handleDeleteScene(id: string) {
    const supabase = createClient();
    markSaving();
    await supabase.from('automation_scenes').delete().eq('id', id);
    setScenes((prev) => prev.filter((s) => s.id !== id));
    markSaved();
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-gold" />
        <span className="text-text-secondary text-sm">Loading lighting preferences...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Smart Lighting & Moods</h1>
        <p className="text-text-secondary">
          Configure preset lighting scenes that fit your lifestyle
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Preset Scenes */}
        <div>
          <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold" />
            Mood Presets
          </h2>
          <p className="text-sm text-text-muted mb-4">Toggle scenes you would like programmed in your home</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SCENE_PRESETS.map((preset) => {
              const isEnabled = scenes.some((s) => s.name === preset.name);

              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleTogglePreset(preset)}
                  className={`selection-card text-left flex gap-4 border ${preset.tone} ${
                    isEnabled ? 'selected' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-bg-card flex items-center justify-center shrink-0 border border-glass-border">
                    {preset.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-primary text-sm sm:text-base">{preset.name}</h3>
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">{preset.description}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    isEnabled ? 'border-gold bg-gold' : 'border-glass-border'
                  }`}>
                    {isEnabled && <span className="text-text-inverse text-[10px] font-bold">✓</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Scenes Details */}
        {scenes.length > 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Active Scenes Configuration</h2>
            <div className="flex flex-col gap-4">
              {scenes.map((scene) => (
                <div key={scene.id} className="glass-card-static p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-glass-border pb-3">
                    <div>
                      <h3 className="font-semibold text-gold">{scene.name}</h3>
                      <p className="text-xs text-text-muted mt-0.5">{scene.description}</p>
                    </div>
                    {!scene.is_preset && (
                      <button
                        onClick={() => handleDeleteScene(scene.id)}
                        className="text-text-muted hover:text-error transition-all"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    )}
                  </div>

                  {/* Rooms Checklist */}
                  <div>
                    <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                      Apply to Rooms
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {rooms.map((room) => {
                        const isChecked = (scene.config.rooms || []).includes(room.id);
                        return (
                          <button
                            key={room.id}
                            type="button"
                            onClick={() => handleToggleRoomInScene(scene, room.id)}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium flex items-center gap-1.5 ${
                              isChecked
                                ? 'bg-gold-muted text-gold border-gold/30'
                                : 'border-glass-border text-text-muted hover:border-glass-border-hover'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3" />}
                            {room.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add custom scene CTA */}
        <div className="text-center py-4">
          <button
            type="button"
            onClick={() => setShowCustomModal(true)}
            className="btn-secondary !py-2.5 !px-6"
          >
            <Plus className="w-4 h-4" /> Create Custom Scene
          </button>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-8 border-t border-glass-border">
          <button
            type="button"
            onClick={() => router.push(`/planner/${projectId}/rooms`)}
            className="btn-ghost"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Rooms
          </button>
          <button
            type="button"
            onClick={() => {
              markStepComplete('lighting');
              router.push(`/planner/${projectId}/security`);
            }}
            className="btn-primary"
          >
            Continue to Security <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MODAL: CUSTOM SCENE */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card-static w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Create Custom Scene</h3>

            <div className="flex flex-col gap-4 mb-6">
              <div>
                <label className="input-label">Scene Name</label>
                <input
                  id="custom_scene_name"
                  type="text"
                  className="input-field"
                  placeholder="e.g. Romance, Morning Yoga"
                />
              </div>

              <div>
                <label className="input-label">Description</label>
                <textarea
                  id="custom_scene_desc"
                  className="input-field min-h-[80px]"
                  placeholder="Describe the lighting mood..."
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const nameInput = document.getElementById('custom_scene_name') as HTMLInputElement;
                  const descInput = document.getElementById('custom_scene_desc') as HTMLTextAreaElement;
                  if (nameInput && nameInput.value) {
                    handleAddCustomScene(nameInput.value, descInput.value);
                  }
                }}
                className="btn-primary text-sm"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
