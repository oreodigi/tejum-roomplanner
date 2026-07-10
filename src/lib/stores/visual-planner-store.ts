'use client';

import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  getDefaultRoomDimensions,
  getDeviceDefinition,
  getRecommendedDeviceKeys,
  type AutomationPackage,
  type SetupTier,
} from '@/lib/constants/visual-planner';
import { generateRoomsForProperty } from '@/lib/engines/room-generator';
import { normalizePlacement } from '@/lib/engines/placement-geometry';
import type { DevicePlacement, PropertyType, RoomLayout, RoomType } from '@/lib/types';

export type VisualPlannerStep = 'welcome' | 'package' | 'property' | 'rooms' | 'configure' | 'review' | 'estimate' | 'contact' | 'complete';

export interface GuestPropertyDraft {
  propertyType: PropertyType;
  floors: number;
  bedrooms: number;
  bathrooms: number;
  balconies: number;
  kitchens: number;
  parking: number;
  outdoor: number;
  occupancy: 'new_home' | 'renovation' | 'occupied';
  city: string;
  budgetRange: string;
  timeline: string;
}

export interface VisualPlannerRoom {
  id: string;
  name: string;
  roomType: RoomType;
  floorNumber: number;
  floorName: string;
  setupTier: SetupTier;
  completionPct: number;
  layout: RoomLayout;
  placements: DevicePlacement[];
}

export interface GuestLeadDraft {
  name: string;
  phone: string;
  city: string;
  preferredContact: 'phone' | 'whatsapp' | 'email';
  email: string;
  conversionIntent: 'consultation' | 'site_visit' | 'boq' | 'whatsapp';
}

interface VisualPlannerState {
  step: VisualPlannerStep;
  automationPackage: AutomationPackage | null;
  property: GuestPropertyDraft;
  rooms: VisualPlannerRoom[];
  activeRoomId: string | null;
  lead: GuestLeadDraft;
  persistedProjectId: string | null;
  setStep: (step: VisualPlannerStep) => void;
  setAutomationPackage: (value: AutomationPackage) => void;
  updateProperty: (value: Partial<GuestPropertyDraft>) => void;
  generateRooms: () => void;
  addRoom: (roomType?: RoomType) => void;
  renameRoom: (roomId: string, name: string) => void;
  deleteRoom: (roomId: string) => void;
  duplicateRoom: (roomId: string) => void;
  moveRoom: (roomId: string, floorNumber: number) => void;
  setActiveRoom: (roomId: string | null) => void;
  setRoomTier: (roomId: string, tier: SetupTier) => void;
  updateRoomLayout: (roomId: string, layout: Partial<RoomLayout>) => void;
  addPlacement: (roomId: string, deviceKey: string, position?: DevicePlacement['position'], wallId?: string | null) => void;
  updatePlacement: (roomId: string, placementId: string, updates: Partial<DevicePlacement>) => void;
  deletePlacement: (roomId: string, placementId: string) => void;
  applyRecommendedSetup: (roomId: string) => void;
  markRoomComplete: (roomId: string) => void;
  updateLead: (value: Partial<GuestLeadDraft>) => void;
  setPersistedProjectId: (projectId: string) => void;
  reset: () => void;
}

const initialProperty: GuestPropertyDraft = {
  propertyType: '3bhk',
  floors: 1,
  bedrooms: 3,
  bathrooms: 3,
  balconies: 1,
  kitchens: 1,
  parking: 0,
  outdoor: 0,
  occupancy: 'new_home',
  city: '',
  budgetRange: '2.5l_5l',
  timeline: '3_6_months',
};

const initialLead: GuestLeadDraft = {
  name: '',
  phone: '',
  city: '',
  preferredContact: 'whatsapp',
  email: '',
  conversionIntent: 'consultation',
};

function buildLayout(roomType: RoomType): RoomLayout {
  const dimensions = getDefaultRoomDimensions(roomType);
  return {
    width_m: dimensions.width,
    length_m: dimensions.length,
    height_m: dimensions.height,
    shape: { type: 'rectangle' },
    openings: [],
    furniture: [],
  };
}

function createPlacement(deviceKey: string, room: VisualPlannerRoom, index: number): DevicePlacement {
  const device = getDeviceDefinition(deviceKey);
  const width = room.layout.width_m;
  const length = room.layout.length_m;
  let wallId: string | null = null;
  let position = { x: 0, y: device.mountingHeightM, z: 0 };

  if (deviceKey === 'fan') {
    position = { x: 0, y: room.layout.height_m - 0.08, z: 0 };
  } else if (device.placementType === 'ceiling') {
    const side = index % 2 === 0 ? -1 : 1;
    position = { x: side * Math.min(0.8, width * 0.18), y: room.layout.height_m - 0.08, z: 0 };
  } else if (device.placementType === 'corner') {
    position = { x: index % 2 === 0 ? -width / 2 : width / 2, y: device.mountingHeightM, z: -length / 2 };
  } else if (deviceKey === 'scene_control') {
    wallId = 'back';
    position = { x: -width / 2 + 0.38, y: device.mountingHeightM, z: -length / 2 };
  } else if (deviceKey === 'ac') {
    wallId = 'right';
    position = { x: width / 2, y: device.mountingHeightM, z: -length * 0.2 };
  } else if (deviceKey === 'tv') {
    wallId = 'right';
    position = { x: width / 2, y: device.mountingHeightM, z: length * 0.25 };
  } else if (deviceKey === 'curtain') {
    wallId = 'back';
    position = { x: width * 0.28, y: device.mountingHeightM, z: -length / 2 };
  } else {
    wallId = 'back';
    position = { x: -width / 2 + 0.45 + (index % 3) * 0.75, y: device.mountingHeightM, z: -length / 2 };
  }

  return normalizePlacement({
    id: nanoid(),
    device_key: device.key,
    display_name: device.label,
    wall_id: wallId,
    position,
    rotation: { x: 0, y: 0, z: 0 },
    mounting_height_m: device.mountingHeightM,
    placement_type: device.placementType,
    coverage: device.coverage
      ? { kind: device.coverage, rangeM: device.coverage === 'network' ? 8 : 5, angleDeg: device.coverage === 'network' ? 360 : 90 }
      : null,
  }, room.layout);
}

export const useVisualPlannerStore = create<VisualPlannerState>()(
  persist(
    (set, get) => ({
      step: 'welcome',
      automationPackage: null,
      property: initialProperty,
      rooms: [],
      activeRoomId: null,
      lead: initialLead,
      persistedProjectId: null,

      setStep: (step) => set({ step }),
      setAutomationPackage: (automationPackage) => set({ automationPackage }),
      updateProperty: (value) => set((state) => ({ property: { ...state.property, ...value } })),
      generateRooms: () => {
        const { property, rooms } = get();
        const generated = generateRoomsForProperty(
          property.propertyType,
          property.floors,
          property.bedrooms,
          property.bathrooms,
          property.balconies,
          property.kitchens,
          property.parking,
          property.outdoor,
        );
        const existingBySignature = new Map(rooms.map((room) => [`${room.floorNumber}:${room.name}`, room]));
        const nextRooms = generated.flatMap((floor) =>
          floor.rooms.map((room) => {
            const existing = existingBySignature.get(`${room.floor_number}:${room.name}`);
            return existing ?? {
              id: nanoid(),
              name: room.name,
              roomType: room.room_type,
              floorNumber: room.floor_number,
              floorName: room.floor_name,
              setupTier: 'comfort' as SetupTier,
              completionPct: 0,
              layout: buildLayout(room.room_type),
              placements: [],
            };
          }),
        );
        set({ rooms: nextRooms, activeRoomId: nextRooms[0]?.id ?? null });
      },
      addRoom: (roomType = 'custom') => set((state) => {
        const floorNumber = 0;
        const room: VisualPlannerRoom = {
          id: nanoid(),
          name: roomType === 'custom' ? `Custom Room ${state.rooms.filter((item) => item.roomType === 'custom').length + 1}` : 'New Room',
          roomType,
          floorNumber,
          floorName: 'Ground Floor',
          setupTier: 'comfort',
          completionPct: 0,
          layout: buildLayout(roomType),
          placements: [],
        };
        return { rooms: [...state.rooms, room], activeRoomId: room.id };
      }),
      renameRoom: (roomId, name) => set((state) => ({ rooms: state.rooms.map((room) => room.id === roomId ? { ...room, name } : room) })),
      deleteRoom: (roomId) => set((state) => {
        const rooms = state.rooms.filter((room) => room.id !== roomId);
        return { rooms, activeRoomId: state.activeRoomId === roomId ? rooms[0]?.id ?? null : state.activeRoomId };
      }),
      duplicateRoom: (roomId) => set((state) => {
        const source = state.rooms.find((room) => room.id === roomId);
        if (!source) return state;
        const duplicate = {
          ...source,
          id: nanoid(),
          name: `${source.name} Copy`,
          placements: source.placements.map((placement) => ({ ...placement, id: nanoid() })),
          completionPct: 0,
        };
        return { rooms: [...state.rooms, duplicate], activeRoomId: duplicate.id };
      }),
      moveRoom: (roomId, floorNumber) => set((state) => ({
        rooms: state.rooms.map((room) => room.id === roomId ? { ...room, floorNumber, floorName: floorNumber === 0 ? 'Ground Floor' : `Floor ${floorNumber}` } : room),
      })),
      setActiveRoom: (activeRoomId) => set({ activeRoomId }),
      setRoomTier: (roomId, setupTier) => set((state) => ({ rooms: state.rooms.map((room) => room.id === roomId ? { ...room, setupTier } : room) })),
      updateRoomLayout: (roomId, layout) => set((state) => ({ rooms: state.rooms.map((room) => room.id === roomId ? { ...room, layout: { ...room.layout, ...layout } } : room) })),
      addPlacement: (roomId, deviceKey, position, wallId) => set((state) => ({
        rooms: state.rooms.map((room) => {
          if (room.id !== roomId) return room;
          const placement = createPlacement(deviceKey, room, room.placements.length);
          const adjustedPosition = position ?? placement.position;
          const normalized = normalizePlacement({ ...placement, position: adjustedPosition, wall_id: wallId ?? placement.wall_id }, room.layout);
          return {
            ...room,
            placements: [...room.placements, {
              ...normalized,
            }],
          };
        }),
      })),
      updatePlacement: (roomId, placementId, updates) => set((state) => ({
        rooms: state.rooms.map((room) => room.id === roomId ? {
          ...room,
          placements: room.placements.map((placement) => placement.id === placementId
            ? normalizePlacement({ ...placement, ...updates, position: { ...placement.position, ...(updates.position ?? {}) } }, room.layout)
            : placement),
        } : room),
      })),
      deletePlacement: (roomId, placementId) => set((state) => ({
        rooms: state.rooms.map((room) => room.id === roomId ? { ...room, placements: room.placements.filter((placement) => placement.id !== placementId) } : room),
      })),
      applyRecommendedSetup: (roomId) => set((state) => ({
        rooms: state.rooms.map((room) => {
          if (room.id !== roomId) return room;
          const keys = getRecommendedDeviceKeys(room.roomType, room.setupTier, state.automationPackage);
          return { ...room, placements: keys.map((key, index) => createPlacement(key, room, index)), completionPct: 80 };
        }),
      })),
      markRoomComplete: (roomId) => set((state) => ({ rooms: state.rooms.map((room) => room.id === roomId ? { ...room, completionPct: 100 } : room) })),
      updateLead: (value) => set((state) => ({ lead: { ...state.lead, ...value } })),
      setPersistedProjectId: (persistedProjectId) => set({ persistedProjectId }),
      reset: () => set({ step: 'welcome', automationPackage: null, property: { ...initialProperty }, rooms: [], activeRoomId: null, lead: { ...initialLead }, persistedProjectId: null }),
    }),
    {
      name: 'tejum-visual-planner-v1',
      version: 2,
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<VisualPlannerState>;
        return {
          ...currentState,
          ...persisted,
          property: { ...initialProperty, ...persisted.property },
          lead: { ...initialLead, ...persisted.lead },
        };
      },
      partialize: (state) => ({
        step: state.step,
        automationPackage: state.automationPackage,
        property: state.property,
        rooms: state.rooms,
        activeRoomId: state.activeRoomId,
        lead: state.lead,
        persistedProjectId: state.persistedProjectId,
      }),
    },
  ),
);
