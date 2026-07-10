'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePlannerStore } from '@/lib/stores/planner-store';
import { getRoomTypeOption, ROOM_DEVICE_DEFAULTS } from '@/lib/constants/room-types';
import type { Room, ProjectDevice, DeviceCategory, DeviceType } from '@/lib/types';
import {
  ArrowLeft,
  Lightbulb,
  AlertTriangle,
  Monitor,
  Fan,
  Video,
  Speaker,
  Lock,
  ChevronDown,
  SlidersHorizontal,
  ShieldCheck,
  PlugZap,
  Thermometer,
} from 'lucide-react';
import { PlannerStep } from '@/components/planner/PlannerStep';
import { DeviceToggleCard } from '@/components/planner/DeviceToggleCard';
import { StickyPlannerActions } from '@/components/planner/StickyPlannerActions';

const DEVICE_GROUPS = [
  {
    id: 'everyday-controls',
    title: 'Lighting & everyday controls',
    description: 'Lights, scenes and the controls you use every day',
    categoryNames: ['lighting', 'control'],
    Icon: Lightbulb,
  },
  {
    id: 'comfort-climate',
    title: 'Comfort & climate',
    description: 'Cooling, airflow and automated window coverings',
    categoryNames: ['climate', 'window_covering'],
    Icon: Thermometer,
  },
  {
    id: 'entertainment',
    title: 'Entertainment',
    description: 'Television, audio and home theatre equipment',
    categoryNames: ['entertainment'],
    Icon: Monitor,
  },
  {
    id: 'safety-security',
    title: 'Safety & security',
    description: 'Access, cameras and early-warning sensors',
    categoryNames: ['security', 'sensor'],
    Icon: ShieldCheck,
  },
  {
    id: 'power-infrastructure',
    title: 'Power & infrastructure',
    description: 'Smart plugs, appliances and network equipment',
    categoryNames: ['appliance', 'infrastructure'],
    Icon: PlugZap,
  },
] as const;

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
  const [deviceCategories, setDeviceCategories] = useState<DeviceCategory[]>([]);
  const [openGroupIds, setOpenGroupIds] = useState(() => new Set<string>(['everyday-controls']));

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

      const [{ data: typesData }, { data: categoriesData }] = await Promise.all([
        supabase.from('device_types').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('device_categories').select('*').eq('is_active', true).order('sort_order'),
      ]);
      setDeviceTypes(typesData || []);
      setDeviceCategories(categoriesData || []);

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
    markSaving();
    const supabase = createClient();

    try {
      if (existing) {
        const { error } = await supabase.from('project_devices').delete().eq('id', existing.id);
        if (error) throw error;
        setDevices(prev => prev.filter(d => d.id !== existing.id));
      } else {
        const { data: newDev, error } = await supabase
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
        if (error) throw error;
        if (newDev) setDevices(prev => [...prev, newDev]);
      }
      markSaved();
    } catch (error) {
      console.error(error);
      markSaveError();
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

  async function handleRoomComplete() {
    markSaving();
    const supabase = createClient();
    const { error } = await supabase.from('rooms').update({ completion_pct: 100 }).eq('id', roomId);
    if (error) {
      markSaveError();
      return;
    }

    const { data: projectRooms } = await supabase
      .from('rooms')
      .select('id')
      .eq('project_id', projectId)
      .order('sort_order');
    const currentIndex = projectRooms?.findIndex((item) => item.id === roomId) ?? -1;
    const nextRoom = currentIndex >= 0 ? projectRooms?.[currentIndex + 1] : null;
    markSaved();

    if (nextRoom) {
      router.push(`/planner/${projectId}/rooms/${nextRoom.id}`);
      return;
    }

    await supabase.from('projects').update({ current_step: 'review' }).eq('id', projectId);
    router.push(`/planner/${projectId}/review`);
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
  const categoryNameById = new Map(deviceCategories.map((category) => [category.id, category.name]));
  const groupedDeviceTypes = DEVICE_GROUPS.map((group) => ({
    ...group,
    devices: deviceTypes
      .filter((type) => (group.categoryNames as readonly string[]).includes(categoryNameById.get(type.category_id) ?? ''))
      .sort((a, b) => a.sort_order - b.sort_order),
  })).filter((group) => group.devices.length > 0);
  const groupedDeviceIds = new Set(groupedDeviceTypes.flatMap((group) => group.devices.map((type) => type.id)));
  const otherDevices = deviceTypes.filter((type) => !groupedDeviceIds.has(type.id));

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

        <div className="device-accordion-list">
          {[...groupedDeviceTypes, ...(otherDevices.length ? [{
            id: 'other',
            title: 'Other devices',
            description: 'Additional devices available for this room',
            categoryNames: [],
            Icon: SlidersHorizontal,
            devices: otherDevices,
          }] : [])].map((group) => {
            const selectedCount = group.devices.filter((type) => devices.some((device) => device.device_type_id === type.id)).length;
            const GroupIcon = group.Icon;

            return (
              <details
                className="device-accordion"
                key={group.id}
                open={openGroupIds.has(group.id)}
                onToggle={(event) => {
                  const isOpen = event.currentTarget.open;
                  setOpenGroupIds((current) => {
                    const next = new Set(current);
                    if (isOpen) next.add(group.id);
                    else next.delete(group.id);
                    return next;
                  });
                }}
              >
                <summary>
                  <span className="device-accordion__icon"><GroupIcon /></span>
                  <span className="device-accordion__title"><strong>{group.title}</strong><small>{group.description}</small></span>
                  <span className="device-accordion__count">{selectedCount} of {group.devices.length} selected</span>
                  <ChevronDown className="device-accordion__chevron" />
                </summary>
                <div className="device-accordion__content">
                  {group.devices.map((type) => {
                    const deviceConfig = devices.find((device) => device.device_type_id === type.id);
                    return (
                      <DeviceToggleCard
                        key={type.id}
                        title={type.display_name}
                        icon={getDeviceIcon(type.name)}
                        selected={Boolean(deviceConfig)}
                        quantity={deviceConfig?.quantity || 1}
                        onToggle={() => handleToggleDevice(type)}
                        onQuantityChange={(quantity) => {
                          if (deviceConfig) void saveDeviceChange(deviceConfig, { quantity });
                        }}
                        showQuantity
                      />
                    );
                  })}
                </div>
              </details>
            );
          })}
        </div>
      </div>

      <StickyPlannerActions
        onBack={() => router.push(`/planner/${projectId}/rooms`)}
        onNext={handleRoomComplete}
        nextText="Save & Next Room"
      />
    </PlannerStep>
  );
}
