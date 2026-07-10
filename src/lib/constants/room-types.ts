import type { RoomType } from '@/lib/types';

// ============================================================
// ROOM TYPE DEFINITIONS (display metadata)
// ============================================================

export interface RoomTypeOption {
  value: RoomType;
  label: string;
  icon: string;
  category: 'living' | 'bedroom' | 'bathroom' | 'kitchen' | 'utility' | 'outdoor' | 'special';
}

export const ROOM_TYPES: RoomTypeOption[] = [
  { value: 'entrance', label: 'Entrance', icon: 'DoorOpen', category: 'living' },
  { value: 'foyer', label: 'Foyer', icon: 'ArrowRightFromLine', category: 'living' },
  { value: 'living_room', label: 'Living Room', icon: 'Sofa', category: 'living' },
  { value: 'dining_room', label: 'Dining Room', icon: 'UtensilsCrossed', category: 'living' },
  { value: 'family_lounge', label: 'Family Lounge', icon: 'Armchair', category: 'living' },
  { value: 'kitchen', label: 'Kitchen', icon: 'ChefHat', category: 'kitchen' },
  { value: 'master_bedroom', label: 'Master Bedroom', icon: 'BedDouble', category: 'bedroom' },
  { value: 'bedroom', label: 'Bedroom', icon: 'Bed', category: 'bedroom' },
  { value: 'guest_bedroom', label: 'Guest Bedroom', icon: 'Bed', category: 'bedroom' },
  { value: 'master_bathroom', label: 'Master Bathroom', icon: 'Bath', category: 'bathroom' },
  { value: 'bathroom', label: 'Bathroom', icon: 'ShowerHead', category: 'bathroom' },
  { value: 'guest_bathroom', label: 'Guest Bathroom', icon: 'ShowerHead', category: 'bathroom' },
  { value: 'powder_room', label: 'Powder Room', icon: 'Droplets', category: 'bathroom' },
  { value: 'balcony', label: 'Balcony', icon: 'Fence', category: 'outdoor' },
  { value: 'terrace', label: 'Terrace', icon: 'Sun', category: 'outdoor' },
  { value: 'garden', label: 'Garden', icon: 'Trees', category: 'outdoor' },
  { value: 'outdoor', label: 'Outdoor Area', icon: 'Mountain', category: 'outdoor' },
  { value: 'pool', label: 'Pool', icon: 'Waves', category: 'outdoor' },
  { value: 'parking', label: 'Parking', icon: 'Car', category: 'outdoor' },
  { value: 'passage', label: 'Passage', icon: 'MoveRight', category: 'utility' },
  { value: 'staircase', label: 'Staircase', icon: 'TrendingUp', category: 'utility' },
  { value: 'utility', label: 'Utility Area', icon: 'Wrench', category: 'utility' },
  { value: 'laundry', label: 'Laundry', icon: 'WashingMachine', category: 'utility' },
  { value: 'store_room', label: 'Store Room', icon: 'Package', category: 'utility' },
  { value: 'servant_room', label: 'Servant Room', icon: 'Bed', category: 'utility' },
  { value: 'study', label: 'Study', icon: 'BookOpen', category: 'special' },
  { value: 'home_theatre', label: 'Home Theatre', icon: 'Monitor', category: 'special' },
  { value: 'gym', label: 'Gym', icon: 'Dumbbell', category: 'special' },
  { value: 'puja_room', label: 'Puja Room', icon: 'Flame', category: 'special' },
  { value: 'custom', label: 'Custom Room', icon: 'Plus', category: 'special' },
];

export function getRoomTypeOption(roomType: RoomType): RoomTypeOption | undefined {
  return ROOM_TYPES.find((r) => r.value === roomType);
}

// ============================================================
// DEVICE RECOMMENDATIONS PER ROOM TYPE
// These define which devices are shown for each room type.
// The actual device_type IDs come from the database; these are
// device type *names* used for seed matching.
// ============================================================

export interface DeviceRecommendation {
  device_name: string;
  is_default: boolean;
}

export const ROOM_DEVICE_DEFAULTS: Record<string, DeviceRecommendation[]> = {
  bedroom: [
    { device_name: 'main_light', is_default: true },
    { device_name: 'ceiling_light', is_default: false },
    { device_name: 'spotlight', is_default: false },
    { device_name: 'cove_light', is_default: false },
    { device_name: 'bedside_light', is_default: false },
    { device_name: 'fan', is_default: true },
    { device_name: 'ac', is_default: true },
    { device_name: 'tv', is_default: false },
    { device_name: 'curtain', is_default: true },
    { device_name: 'blind', is_default: false },
    { device_name: 'smart_plug', is_default: false },
    { device_name: 'charging_point', is_default: false },
    { device_name: 'geyser', is_default: false },
    { device_name: 'motion_sensor', is_default: false },
    { device_name: 'temperature_sensor', is_default: false },
    { device_name: 'scene_control', is_default: false },
  ],
  master_bedroom: [
    { device_name: 'main_light', is_default: true },
    { device_name: 'ceiling_light', is_default: false },
    { device_name: 'spotlight', is_default: false },
    { device_name: 'cove_light', is_default: true },
    { device_name: 'bedside_light', is_default: true },
    { device_name: 'fan', is_default: true },
    { device_name: 'ac', is_default: true },
    { device_name: 'tv', is_default: true },
    { device_name: 'curtain', is_default: true },
    { device_name: 'blind', is_default: false },
    { device_name: 'smart_plug', is_default: false },
    { device_name: 'charging_point', is_default: false },
    { device_name: 'geyser', is_default: false },
    { device_name: 'motion_sensor', is_default: false },
    { device_name: 'temperature_sensor', is_default: false },
    { device_name: 'scene_control', is_default: true },
  ],
  guest_bedroom: [
    { device_name: 'main_light', is_default: true },
    { device_name: 'fan', is_default: true },
    { device_name: 'ac', is_default: true },
    { device_name: 'curtain', is_default: true },
    { device_name: 'smart_plug', is_default: false },
    { device_name: 'motion_sensor', is_default: false },
  ],
  living_room: [
    { device_name: 'main_light', is_default: true },
    { device_name: 'ceiling_light', is_default: false },
    { device_name: 'spotlight', is_default: false },
    { device_name: 'cove_light', is_default: true },
    { device_name: 'chandelier', is_default: false },
    { device_name: 'decorative_light', is_default: false },
    { device_name: 'fan', is_default: true },
    { device_name: 'ac', is_default: true },
    { device_name: 'tv', is_default: true },
    { device_name: 'home_theatre', is_default: false },
    { device_name: 'sound_system', is_default: false },
    { device_name: 'curtain', is_default: true },
    { device_name: 'blind', is_default: false },
    { device_name: 'smart_plug', is_default: false },
    { device_name: 'motion_sensor', is_default: false },
    { device_name: 'scene_control', is_default: true },
  ],
  kitchen: [
    { device_name: 'main_light', is_default: true },
    { device_name: 'counter_light', is_default: false },
    { device_name: 'chimney', is_default: true },
    { device_name: 'exhaust', is_default: false },
    { device_name: 'refrigerator', is_default: false },
    { device_name: 'microwave', is_default: false },
    { device_name: 'oven', is_default: false },
    { device_name: 'dishwasher', is_default: false },
    { device_name: 'water_purifier', is_default: false },
    { device_name: 'geyser', is_default: false },
    { device_name: 'appliance_plug', is_default: true },
    { device_name: 'gas_leak_sensor', is_default: true },
    { device_name: 'smoke_sensor', is_default: false },
    { device_name: 'water_leak_sensor', is_default: false },
  ],
  bathroom: [
    { device_name: 'main_light', is_default: true },
    { device_name: 'mirror_light', is_default: false },
    { device_name: 'decorative_light', is_default: false },
    { device_name: 'exhaust', is_default: true },
    { device_name: 'geyser', is_default: true },
    { device_name: 'motion_sensor', is_default: false },
    { device_name: 'water_leak_sensor', is_default: false },
  ],
  master_bathroom: [
    { device_name: 'main_light', is_default: true },
    { device_name: 'mirror_light', is_default: true },
    { device_name: 'decorative_light', is_default: false },
    { device_name: 'exhaust', is_default: true },
    { device_name: 'geyser', is_default: true },
    { device_name: 'motion_sensor', is_default: true },
    { device_name: 'water_leak_sensor', is_default: false },
  ],
  guest_bathroom: [
    { device_name: 'main_light', is_default: true },
    { device_name: 'exhaust', is_default: true },
    { device_name: 'geyser', is_default: true },
    { device_name: 'motion_sensor', is_default: false },
  ],
  entrance: [
    { device_name: 'main_light', is_default: true },
    { device_name: 'decorative_light', is_default: false },
    { device_name: 'smart_lock', is_default: true },
    { device_name: 'video_doorbell', is_default: true },
    { device_name: 'cctv', is_default: false },
    { device_name: 'door_sensor', is_default: false },
    { device_name: 'motion_sensor', is_default: true },
    { device_name: 'scene_control', is_default: false },
  ],
  garden: [
    { device_name: 'garden_light', is_default: true },
    { device_name: 'gate_light', is_default: false },
    { device_name: 'facade_light', is_default: false },
    { device_name: 'water_pump', is_default: false },
    { device_name: 'irrigation', is_default: false },
    { device_name: 'gate_motor', is_default: false },
    { device_name: 'cctv', is_default: true },
    { device_name: 'motion_sensor', is_default: true },
  ],
  outdoor: [
    { device_name: 'garden_light', is_default: true },
    { device_name: 'facade_light', is_default: false },
    { device_name: 'water_pump', is_default: false },
    { device_name: 'cctv', is_default: true },
    { device_name: 'motion_sensor', is_default: true },
  ],
  parking: [
    { device_name: 'main_light', is_default: true },
    { device_name: 'gate_motor', is_default: false },
    { device_name: 'cctv', is_default: true },
    { device_name: 'motion_sensor', is_default: true },
  ],
  dining_room: [
    { device_name: 'main_light', is_default: true },
    { device_name: 'chandelier', is_default: false },
    { device_name: 'cove_light', is_default: false },
    { device_name: 'fan', is_default: true },
    { device_name: 'ac', is_default: false },
    { device_name: 'scene_control', is_default: false },
  ],
  passage: [
    { device_name: 'main_light', is_default: true },
    { device_name: 'motion_sensor', is_default: true },
  ],
  staircase: [
    { device_name: 'main_light', is_default: true },
    { device_name: 'motion_sensor', is_default: true },
  ],
  balcony: [
    { device_name: 'main_light', is_default: true },
    { device_name: 'decorative_light', is_default: false },
    { device_name: 'smart_plug', is_default: false },
  ],
  terrace: [
    { device_name: 'main_light', is_default: true },
    { device_name: 'decorative_light', is_default: false },
    { device_name: 'cctv', is_default: false },
    { device_name: 'smart_plug', is_default: false },
  ],
  study: [
    { device_name: 'main_light', is_default: true },
    { device_name: 'desk_light', is_default: false },
    { device_name: 'fan', is_default: true },
    { device_name: 'ac', is_default: false },
    { device_name: 'smart_plug', is_default: true },
    { device_name: 'curtain', is_default: false },
  ],
  home_theatre: [
    { device_name: 'main_light', is_default: true },
    { device_name: 'cove_light', is_default: true },
    { device_name: 'ac', is_default: true },
    { device_name: 'tv', is_default: true },
    { device_name: 'home_theatre', is_default: true },
    { device_name: 'sound_system', is_default: true },
    { device_name: 'curtain', is_default: true },
    { device_name: 'scene_control', is_default: true },
  ],
  puja_room: [
    { device_name: 'main_light', is_default: true },
    { device_name: 'decorative_light', is_default: true },
    { device_name: 'smart_plug', is_default: false },
  ],
  utility: [
    { device_name: 'main_light', is_default: true },
    { device_name: 'appliance_plug', is_default: false },
  ],
  foyer: [
    { device_name: 'main_light', is_default: true },
    { device_name: 'decorative_light', is_default: true },
    { device_name: 'scene_control', is_default: false },
    { device_name: 'motion_sensor', is_default: false },
  ],
  family_lounge: [
    { device_name: 'main_light', is_default: true },
    { device_name: 'cove_light', is_default: false },
    { device_name: 'fan', is_default: true },
    { device_name: 'ac', is_default: true },
    { device_name: 'tv', is_default: true },
    { device_name: 'curtain', is_default: false },
    { device_name: 'scene_control', is_default: false },
  ],
  gym: [
    { device_name: 'main_light', is_default: true },
    { device_name: 'fan', is_default: true },
    { device_name: 'ac', is_default: true },
    { device_name: 'tv', is_default: false },
    { device_name: 'sound_system', is_default: false },
    { device_name: 'smart_plug', is_default: false },
  ],
};

export const FLOOR_NAMES: Record<number, string> = {
  [-1]: 'Basement',
  0: 'Ground Floor',
  1: 'First Floor',
  2: 'Second Floor',
  3: 'Third Floor',
  4: 'Fourth Floor',
  5: 'Fifth Floor',
};
