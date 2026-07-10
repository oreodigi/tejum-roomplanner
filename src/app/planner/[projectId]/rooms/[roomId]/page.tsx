'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePlannerStore } from '@/lib/stores/planner-store';
import { getRoomTypeOption, ROOM_DEVICE_DEFAULTS } from '@/lib/constants/room-types';
import type { Room, ProjectDevice, DeviceType } from '@/lib/types';
import { ArrowLeft, Lightbulb, Loader2, AlertTriangle, Monitor, Fan, Video, Speaker, Lock } from 'lucide-react';
import { PlannerStep } from '@/components/planner/PlannerStep';
import { DeviceToggleCard } from '@/components/planner/DeviceToggleCard';
import { StickyPlannerActions } from '@/components/planner/StickyPlannerActions';

export default function RoomConfigPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const roomId = params.roomId as string;
  const { markSaved, markSaving, markSaveError } = usePlannerStore();

  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState<Room | null>(null);
  const [devices, setDevices] = useState<ProjectDevice[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);

  const initializeDefaultDevices = useCallback(async (roomType: string, allTypes: DeviceType[]) => {
    const supabase = createClient();
    const defaults = ROOM_DEVICE_DEFAULTS[roomType] || ROOM_DEVICE_DEFAULTS.bedroom;

    const inserts = defaults
      .map((d) => {
        const type = allTypes.find((t) => t.name === d.device_name);
        if (!type) return null;
        return {
          room_id: roomId,
          device_type_id: type.id,
          quantity: 1,
          smart_automation: d.is_default,
          status: 'system_recommended' as const,
        };
      })
      .filter((x) => x !== null);

    if (inserts.length > 0) {
      await supabase.from('project_devices').insert(inserts);
      const { data: projectDevices } = await supabase
        .from('project_devices')
        .select('*, device_type:device_type_id (*)')
        .eq('room_id', roomId);
      setDevices(projectDevices || []);
    } else {
      setDevices([]);
    }
  }, [roomId]);

  const loadRoomData = useCallback(async () => {
    try {
      const supabase = createClient();

      const { data: roomData } = await supabase.from('rooms').select('*').eq('id', roomId).single();
      setRoom(roomData);
      if (!roomData) return;

      const { data: typesData } = await supabase.from('device_types').select('*').eq('is_active', true).order('sort_order');
      setDeviceTypes(typesData || []);

      const { data: projectDevices } = await supabase
        .from('project_devices')
        .select('*, device_type:device_type_id (*)')
        .eq('room_id', roomId)
        .order('created_at');
      
      if (projectDevices && projectDevices.length === 0 && typesData) {
        await initializeDefaultDevices(roomData.room_type, typesData);
      } else {
        setDevices(projectDevices || []);
      }

      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }, [initializeDefaultDevices, roomId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => void loadRoomData(), 0);
    return () => clearTimeout(timeoutId);
  }, [loadRoomData]);

  const saveDeviceChange = async (device: ProjectDevice, updates: Partial<ProjectDevice>) => {
    markSaving();
    const supabase = createClient();
    try {
      const { error } = await supabase.from('project_devices').update(updates).eq('id', device.id);
      if (error) throw error;
      setDevices((prev) => prev.map((d) => (d.id === device.id ? { ...d, ...updates } : d)));
      markSaved();
    } catch (e) {
      console.error(e);
      markSaveError();
    }
  };

  async function handleToggleDevice(deviceType: DeviceType) {
    const existing = devices.find(d => d.device_type_id === deviceType.id);
    
    if (existing) {
      // Remove it
      markSaving();
      const supabase = createClient();
      await supabase.from('project_devices').delete().eq('id', existing.id);
      setDevices(prev => prev.filter(d => d.id !== existing.id));
      markSaved();
    } else {
      // Add it
      markSaving();
      const supabase = createClient();
      const { data: newDev } = await supabase
        .from('project_devices')
        .insert({
          room_id: roomId,
          device_type_id: deviceType.id,
          quantity: 1,
          smart_automation: true,
          status: 'customer_confirmed',
        })
        .select('*, device_type:device_type_id (*)')
        .single();

      if (newDev) {
        setDevices(prev => [...prev, newDev]);
      }
      markSaved();
    }
  }

  function getDeviceIcon(name: string) {
    const lower = name.toLowerCase();
    if (lower.includes('light') || lower.includes('led')) return <Lightbulb className="w-7 h-7" />;
    if (lower.includes('fan') || lower.includes('ac') || lower.includes('curtain')) return <Fan className="w-7 h-7" />;
    if (lower.includes('tv') || lower.includes('projector')) return <Monitor className="w-7 h-7" />;
    if (lower.includes('camera') || lower.includes('cctv')) return <Video className="w-7 h-7" />;
    if (lower.includes('speaker') || lower.includes('audio')) return <Speaker className="w-7 h-7" />;
    if (lower.includes('lock') || lower.includes('sensor')) return <Lock className="w-7 h-7" />;
    return <Lightbulb className="w-7 h-7" />;
  }

  if (loading) {
    return (
      <PlannerStep>
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
          <span className="text-text-secondary font-medium">Loading room layout...</span>
        </div>
      </PlannerStep>
    );
  }

  if (!room) {
    return (
      <PlannerStep>
        <div className="text-center py-20 bg-bg-card rounded-3xl border border-glass-border">
          <AlertTriangle className="w-12 h-12 text-error mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Room not found</h2>
          <button onClick={() => router.push(`/planner/${projectId}/rooms`)} className="btn-secondary mt-4">
            Back to Rooms
          </button>
        </div>
      </PlannerStep>
    );
  }

  const roomMeta = getRoomTypeOption(room.room_type);

  return (
    <PlannerStep>
      <div className="flex flex-col gap-8 pb-10">
        <div>
          <button
            type="button"
            onClick={() => router.push(`/planner/${projectId}/rooms`)}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Room Map
          </button>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
              {room.name}
            </h1>
            <span className="px-4 py-1.5 bg-accent/10 text-accent font-semibold rounded-full text-sm">
              {roomMeta?.label || room.room_type}
            </span>
          </div>
          <p className="text-lg text-text-secondary mt-2">
            Select the devices you want to automate in this room.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {deviceTypes.map(type => {
            const deviceConfig = devices.find(d => d.device_type_id === type.id);
            const isSelected = !!deviceConfig;
            
            return (
              <DeviceToggleCard
                key={type.id}
                title={type.display_name}
                icon={getDeviceIcon(type.name)}
                selected={isSelected}
                quantity={deviceConfig?.quantity || 1}
                onToggle={() => handleToggleDevice(type)}
                onQuantityChange={(qty) => {
                  if (deviceConfig) saveDeviceChange(deviceConfig, { quantity: qty });
                }}
                showQuantity={true}
              />
            );
          })}
        </div>
      </div>

      <StickyPlannerActions
        onBack={() => router.push(`/planner/${projectId}/rooms`)}
        onNext={() => router.push(`/planner/${projectId}/summary`)}
        nextText="Done Configuring"
      />
    </PlannerStep>
  );
}
