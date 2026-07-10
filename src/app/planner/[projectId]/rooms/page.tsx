'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePlannerStore } from '@/lib/stores/planner-store';
import { generateRoomsForProperty } from '@/lib/engines/room-generator';
import { getRoomTypeOption, ROOM_TYPES } from '@/lib/constants/room-types';
import type { Room, Floor, PropertyType } from '@/lib/types';
import { Sparkles, Layers, Plus, X, Check, Search, Home } from 'lucide-react';
import { PlannerStep } from '@/components/planner/PlannerStep';
import { RoomCard } from '@/components/planner/RoomCard';
import { StickyPlannerActions } from '@/components/planner/StickyPlannerActions';

export default function RoomsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { setStep, markStepComplete, markSaved, markSaving } = usePlannerStore();

  const [floors, setFloors] = useState<(Floor & { rooms: Room[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [addFloorId, setAddFloorId] = useState<string | null>(null);

  useEffect(() => {
    setStep('rooms');
  }, [setStep]);

  const loadRooms = useCallback(async () => {
    const supabase = createClient();
    const { data: floorData } = await supabase
      .from('floors')
      .select('*')
      .eq('property_id', (await supabase.from('properties').select('id').eq('project_id', projectId).single()).data?.id || '')
      .order('floor_number');

    const { data: roomData } = await supabase
      .from('rooms')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order');

    if (floorData && roomData) {
      const floorsWithRooms = floorData.map((floor) => ({
        ...floor,
        rooms: roomData.filter((r) => r.floor_id === floor.id),
      }));
      setFloors(floorsWithRooms);
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadRooms();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [loadRooms]);

  async function handleGenerateRooms() {
    setGenerating(true);
    markSaving();

    const supabase = createClient();
    const { data: property } = await supabase
      .from('properties')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (!property) {
      setGenerating(false);
      return;
    }

    const generatedFloors = generateRoomsForProperty(
      property.property_type as PropertyType,
      property.num_floors,
      property.num_bedrooms,
      property.num_bathrooms,
      property.num_balconies,
      property.num_kitchens,
      property.num_parking,
      property.num_outdoor
    );

    await supabase.from('rooms').delete().eq('project_id', projectId);
    const { data: existingFloors } = await supabase.from('floors').select('id').eq('property_id', property.id);
    if (existingFloors?.length) {
      await supabase.from('floors').delete().eq('property_id', property.id);
    }

    for (const floor of generatedFloors) {
      const { data: newFloor } = await supabase
        .from('floors')
        .insert({
          property_id: property.id,
          name: floor.name,
          floor_number: floor.floor_number,
          sort_order: floor.floor_number,
        })
        .select()
        .single();

      if (newFloor) {
        const roomInserts = floor.rooms.map((room) => ({
          project_id: projectId,
          floor_id: newFloor.id,
          name: room.name,
          room_type: room.room_type,
          sort_order: room.sort_order,
        }));
        await supabase.from('rooms').insert(roomInserts);
      }
    }

    markSaved();
    await loadRooms();
    
    // Artificial delay for playful loading experience
    setTimeout(() => {
      setGenerating(false);
    }, 1500);
  }

  async function handleAddRoom(floorId: string, name: string, roomType: string) {
    const supabase = createClient();
    const maxOrder = floors.find((f) => f.id === floorId)?.rooms.reduce((max, r) => Math.max(max, r.sort_order), -1) ?? -1;
    await supabase.from('rooms').insert({
      project_id: projectId,
      floor_id: floorId,
      name,
      room_type: roomType,
      sort_order: maxOrder + 1,
    });
    setShowAddRoom(false);
    await loadRooms();
  }

  async function handleDeleteRoom(roomId: string) {
    if (!confirm('Remove this room from your plan?')) return;
    const supabase = createClient();
    await supabase.from('rooms').delete().eq('id', roomId);
    await loadRooms();
  }

  async function handleDuplicateRoom(room: Room) {
    const supabase = createClient();
    await supabase.from('rooms').insert({
      project_id: projectId,
      floor_id: room.floor_id,
      name: `${room.name} (Copy)`,
      room_type: room.room_type,
      sort_order: room.sort_order + 1,
    });
    await loadRooms();
  }

  const totalRooms = floors.reduce((sum, f) => sum + f.rooms.length, 0);

  if (generating) {
    return (
      <PlannerStep>
        <div className="flex flex-col items-center justify-center py-32 text-center h-[60vh]">
          <div className="w-16 h-16 mb-8 relative">
            <div className="absolute inset-0 border-4 border-accent/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-accent animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Creating your smart-home room map...</h2>
          <p className="text-text-secondary">Analyzing your property details</p>
        </div>
      </PlannerStep>
    );
  }

  return (
    <PlannerStep>
      <div className="flex flex-col gap-10">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight text-text-primary">
              Your Rooms
            </h1>
            <p className="text-lg text-text-secondary">
              {totalRooms > 0
                ? `${totalRooms} rooms across ${floors.length} floor${floors.length > 1 ? 's' : ''}. Add or edit as needed.`
                : 'Generate rooms based on your property type.'}
            </p>
          </div>
          {totalRooms > 0 && (
            <button
              type="button"
              onClick={handleGenerateRooms}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-accent bg-accent/10 hover:bg-accent/20 rounded-xl transition-colors"
            >
              <Sparkles className="w-4 h-4" /> Regenerate
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : totalRooms === 0 ? (
          <div className="text-center py-20 bg-bg-card border-2 border-glass-border rounded-3xl p-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mb-6">
              <Home className="w-10 h-10 text-accent" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Let&apos;s build your home</h2>
            <p className="text-text-secondary mb-8 max-w-md mx-auto">
              We&apos;ll create a smart-home blueprint tailored to your property. You can easily customize it in the next step.
            </p>
            <button
              type="button"
              onClick={handleGenerateRooms}
              className="flex items-center gap-3 px-8 py-4 bg-accent text-bg-primary rounded-xl font-bold hover:bg-accent-light transition-all shadow-[0_0_20px_rgba(6,182,212,0.15)]"
            >
              <Sparkles className="w-5 h-5" /> Generate Room Map
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {floors.map((floor) => (
              <div key={floor.id}>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-glass-border">
                  <div className="w-8 h-8 rounded-lg bg-bg-card border border-glass-border flex items-center justify-center">
                    <Layers className="w-4 h-4 text-accent" />
                  </div>
                  <h2 className="text-xl font-bold">{floor.name}</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {floor.rooms.map((room) => (
                    <RoomCard
                      key={room.id}
                      name={room.name}
                      floor={floor.name}
                      onEdit={() => router.push(`/planner/${projectId}/rooms/${room.id}`)}
                      onDuplicate={() => handleDuplicateRoom(room)}
                      onRemove={() => handleDeleteRoom(room.id)}
                    />
                  ))}
                  
                  {/* Add Room Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setAddFloorId(floor.id);
                      setShowAddRoom(true);
                    }}
                    className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-glass-border hover:border-accent hover:bg-accent/5 text-text-muted hover:text-accent transition-all min-h-[160px]"
                  >
                    <div className="w-10 h-10 rounded-full bg-glass flex items-center justify-center">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Add Room</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddRoom && addFloorId && (
        <AddRoomModal
          floorId={addFloorId}
          onAdd={handleAddRoom}
          onClose={() => setShowAddRoom(false)}
        />
      )}

      <StickyPlannerActions
        onBack={() => router.push(`/planner/${projectId}/property-details`)}
        onNext={() => {
          markStepComplete('rooms');
          router.push(`/planner/${projectId}/rooms/${floors[0]?.rooms[0]?.id || ''}`);
        }}
        isNextDisabled={totalRooms === 0}
        nextText="Plan Room by Room"
      />
    </PlannerStep>
  );
}

// Add Room Modal
function AddRoomModal({
  floorId,
  onAdd,
  onClose,
}: {
  floorId: string;
  onAdd: (floorId: string, name: string, roomType: string) => void;
  onClose: () => void;
}) {
  const [selectedType, setSelectedType] = useState('');
  const [customName, setCustomName] = useState('');
  const [search, setSearch] = useState('');

  const filteredTypes = ROOM_TYPES.filter(r => r.value !== 'custom' && r.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-md">
      <div className="bg-bg-card border border-glass-border w-full max-w-xl max-h-[85vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-glass-border flex items-center justify-between bg-bg-primary/50">
          <h3 className="text-xl font-bold">Add New Room</h3>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-text-primary bg-glass rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-secondary mb-2">Room Type</label>
            <div className="relative mb-4">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search room types..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-bg-input border border-glass-border rounded-xl pl-10 pr-4 py-3 text-sm focus:border-accent outline-none transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto pr-2">
              {filteredTypes.map((rt) => (
                <button
                  key={rt.value}
                  type="button"
                  onClick={() => {
                    setSelectedType(rt.value);
                    setCustomName(rt.label);
                  }}
                  className={`px-3 py-2 text-left text-sm rounded-xl border transition-all ${
                    selectedType === rt.value 
                      ? 'border-accent bg-accent-muted text-accent font-medium' 
                      : 'border-glass-border bg-glass hover:bg-glass-border-hover text-text-secondary'
                  }`}
                >
                  {rt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Custom Name</label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full bg-bg-input border border-glass-border rounded-xl px-4 py-3 text-sm focus:border-accent outline-none transition-colors"
              placeholder="e.g., Master Bedroom"
            />
          </div>
        </div>

        <div className="p-6 border-t border-glass-border bg-bg-primary/50 flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="px-6 py-3 font-medium text-text-secondary hover:text-text-primary transition-colors">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (selectedType && customName.trim()) {
                onAdd(floorId, customName.trim(), selectedType);
              }
            }}
            disabled={!selectedType || !customName.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-accent text-bg-primary hover:bg-accent-light disabled:opacity-50 transition-colors"
          >
            <Plus className="w-5 h-5" /> Add Room
          </button>
        </div>
      </div>
    </div>
  );
}
