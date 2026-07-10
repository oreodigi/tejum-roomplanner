import type {
  AutomationInterest,
  PlacementType,
  PropertyType,
  RoomType,
} from '@/lib/types';

export type AutomationPackage = 'full_home' | 'controls' | 'lighting' | 'security' | 'not_sure';
export type SetupTier = 'essential' | 'comfort' | 'premium' | 'luxury_ai';

export interface DeviceDefinition {
  key: string;
  label: string;
  shortLabel: string;
  icon: string;
  placementType: PlacementType;
  mountingHeightM: number;
  priceLow: number;
  priceHigh: number;
  coverage?: 'camera' | 'motion' | 'network';
}

export const AUTOMATION_PACKAGES: Array<{
  id: AutomationPackage;
  title: string;
  description: string;
  eyebrow: string;
  interest: AutomationInterest;
  icon: string;
}> = [
  { id: 'full_home', title: 'Full Home Automation', description: 'Controls, lighting, security and intelligent routines.', eyebrow: 'Complete experience', interest: 'complete_smart_home', icon: 'Sparkles' },
  { id: 'controls', title: 'Smart Controls', description: 'Switches, touch panels, app and voice control.', eyebrow: 'Everyday convenience', interest: 'smart_controls', icon: 'SlidersHorizontal' },
  { id: 'lighting', title: 'Smart Lights', description: 'Dimming, scenes, motion and mood lighting.', eyebrow: 'Atmosphere on demand', interest: 'smart_lighting', icon: 'Lightbulb' },
  { id: 'security', title: 'Smart Security', description: 'Locks, cameras, sensors and video doorbells.', eyebrow: 'Protection that responds', interest: 'smart_security', icon: 'ShieldCheck' },
  { id: 'not_sure', title: 'Recommend for Me', description: 'We will balance comfort, safety and your budget.', eyebrow: 'Guided by Tejum', interest: 'not_sure', icon: 'WandSparkles' },
];

export const VISUAL_PROPERTY_TYPES: Array<{
  id: PropertyType;
  label: string;
  compact: string;
  floors: number;
  bedrooms: number;
  bathrooms: number;
  icon: string;
}> = [
  { id: 'studio_apartment', label: 'Studio', compact: 'Studio', floors: 1, bedrooms: 0, bathrooms: 1, icon: 'BedSingle' },
  { id: '1bhk', label: '1 BHK', compact: '1 bed', floors: 1, bedrooms: 1, bathrooms: 1, icon: 'Building2' },
  { id: '2bhk', label: '2 BHK', compact: '2 beds', floors: 1, bedrooms: 2, bathrooms: 2, icon: 'Building2' },
  { id: '3bhk', label: '3 BHK', compact: '3 beds', floors: 1, bedrooms: 3, bathrooms: 3, icon: 'Building2' },
  { id: '4bhk', label: '4 BHK', compact: '4 beds', floors: 1, bedrooms: 4, bathrooms: 4, icon: 'Building2' },
  { id: '5bhk', label: '5 BHK', compact: '5 beds', floors: 1, bedrooms: 5, bathrooms: 5, icon: 'Building2' },
  { id: '2storey_villa', label: '2 Storey Villa', compact: '2 floors', floors: 2, bedrooms: 4, bathrooms: 4, icon: 'House' },
  { id: '3storey_villa', label: '3 Storey Villa', compact: '3 floors', floors: 3, bedrooms: 5, bathrooms: 5, icon: 'HousePlus' },
  { id: 'duplex', label: 'Duplex', compact: '2 levels', floors: 2, bedrooms: 3, bathrooms: 3, icon: 'PanelsTopLeft' },
  { id: 'independent_house', label: 'Independent House', compact: 'House', floors: 1, bedrooms: 3, bathrooms: 3, icon: 'Home' },
  { id: 'custom', label: 'Custom Property', compact: 'Custom', floors: 1, bedrooms: 2, bathrooms: 2, icon: 'PencilRuler' },
];

export const DEVICE_CATALOG: DeviceDefinition[] = [
  { key: 'scene_control', label: 'Smart switchboard', shortLabel: 'Switchboard', icon: 'PanelsTopLeft', placementType: 'wall', mountingHeightM: 1.2, priceLow: 8500, priceHigh: 14500 },
  { key: 'main_light', label: 'Smart light control', shortLabel: 'Light', icon: 'Lightbulb', placementType: 'ceiling', mountingHeightM: 3, priceLow: 1800, priceHigh: 3200 },
  { key: 'ceiling_light', label: 'Dimmable ceiling light', shortLabel: 'Dimmable', icon: 'SunMedium', placementType: 'ceiling', mountingHeightM: 3, priceLow: 2800, priceHigh: 5200 },
  { key: 'fan', label: 'Smart fan control', shortLabel: 'Fan', icon: 'Fan', placementType: 'ceiling', mountingHeightM: 3, priceLow: 3200, priceHigh: 5600 },
  { key: 'ac', label: 'AC control', shortLabel: 'AC', icon: 'Snowflake', placementType: 'wall', mountingHeightM: 2.25, priceLow: 4500, priceHigh: 7500 },
  { key: 'curtain', label: 'Curtain automation', shortLabel: 'Curtain', icon: 'Blinds', placementType: 'wall', mountingHeightM: 2.6, priceLow: 16000, priceHigh: 28000 },
  { key: 'motion_sensor', label: 'Motion sensor', shortLabel: 'Motion', icon: 'ScanLine', placementType: 'corner', mountingHeightM: 2.2, priceLow: 3500, priceHigh: 6500, coverage: 'motion' },
  { key: 'smart_lock', label: 'Smart lock', shortLabel: 'Lock', icon: 'LockKeyhole', placementType: 'wall', mountingHeightM: 1.05, priceLow: 22000, priceHigh: 48000 },
  { key: 'video_doorbell', label: 'Video doorbell', shortLabel: 'Doorbell', icon: 'BellRing', placementType: 'wall', mountingHeightM: 1.4, priceLow: 9500, priceHigh: 18000, coverage: 'camera' },
  { key: 'cctv', label: 'CCTV camera', shortLabel: 'Camera', icon: 'Cctv', placementType: 'corner', mountingHeightM: 2.4, priceLow: 7500, priceHigh: 15000, coverage: 'camera' },
  { key: 'gas_leak_sensor', label: 'Gas leak sensor', shortLabel: 'Gas sensor', icon: 'Flame', placementType: 'wall', mountingHeightM: 0.45, priceLow: 3500, priceHigh: 6500 },
  { key: 'smoke_sensor', label: 'Smoke sensor', shortLabel: 'Smoke', icon: 'CloudAlert', placementType: 'ceiling', mountingHeightM: 3, priceLow: 3200, priceHigh: 6200 },
  { key: 'water_leak_sensor', label: 'Water leak sensor', shortLabel: 'Leak sensor', icon: 'Droplets', placementType: 'floor', mountingHeightM: 0.05, priceLow: 2800, priceHigh: 5200 },
  { key: 'tv', label: 'TV / media control', shortLabel: 'Media', icon: 'Tv', placementType: 'wall', mountingHeightM: 1.3, priceLow: 4500, priceHigh: 8500 },
  { key: 'home_theatre', label: 'Home theatre control', shortLabel: 'Theatre', icon: 'Speaker', placementType: 'surface', mountingHeightM: 0.8, priceLow: 9000, priceHigh: 18000 },
  { key: 'smart_plug', label: 'Smart power point', shortLabel: 'Smart plug', icon: 'PlugZap', placementType: 'wall', mountingHeightM: 0.45, priceLow: 1800, priceHigh: 3600 },
  { key: 'router', label: 'WiFi router', shortLabel: 'Router', icon: 'Router', placementType: 'surface', mountingHeightM: 0.8, priceLow: 8000, priceHigh: 18000, coverage: 'network' },
];

export const SETUP_TIERS: Array<{ id: SetupTier; label: string; description: string }> = [
  { id: 'essential', label: 'Essential', description: 'The right daily controls' },
  { id: 'comfort', label: 'Comfort', description: 'Convenience and sensors' },
  { id: 'premium', label: 'Premium', description: 'Scenes, dimming and curtains' },
  { id: 'luxury_ai', label: 'Luxury AI', description: 'Full-room intelligence' },
];

const ROOM_BASES: Partial<Record<RoomType, string[]>> = {
  entrance: ['scene_control', 'smart_lock', 'video_doorbell'],
  foyer: ['scene_control', 'main_light', 'motion_sensor'],
  living_room: ['scene_control', 'main_light', 'main_light', 'fan', 'ac', 'tv'],
  family_lounge: ['scene_control', 'main_light', 'fan', 'ac', 'tv'],
  dining_room: ['scene_control', 'main_light', 'main_light'],
  kitchen: ['scene_control', 'main_light', 'gas_leak_sensor', 'smoke_sensor'],
  master_bedroom: ['scene_control', 'main_light', 'fan', 'ac'],
  bedroom: ['scene_control', 'main_light', 'fan', 'ac'],
  guest_bedroom: ['scene_control', 'main_light', 'fan'],
  bathroom: ['scene_control', 'main_light', 'water_leak_sensor'],
  master_bathroom: ['scene_control', 'main_light', 'water_leak_sensor'],
  balcony: ['main_light', 'motion_sensor'],
  passage: ['main_light', 'motion_sensor'],
  utility: ['main_light', 'water_leak_sensor', 'smart_plug'],
  parking: ['main_light', 'cctv', 'motion_sensor'],
  home_theatre: ['scene_control', 'ceiling_light', 'tv', 'home_theatre'],
};

export function getDeviceDefinition(key: string): DeviceDefinition {
  return DEVICE_CATALOG.find((device) => device.key === key) ?? DEVICE_CATALOG[0];
}

export function getRecommendedDeviceKeys(
  roomType: RoomType,
  tier: SetupTier,
  automationPackage: AutomationPackage | null,
): string[] {
  const base = [...(ROOM_BASES[roomType] ?? ['scene_control', 'main_light'])];

  if (automationPackage === 'lighting' && !base.includes('ceiling_light')) base.push('ceiling_light');
  if (automationPackage === 'security' && ['entrance', 'balcony', 'parking', 'outdoor'].includes(roomType)) base.push('cctv');
  if (tier !== 'essential' && ['living_room', 'master_bedroom', 'bedroom'].includes(roomType)) base.push('motion_sensor');
  if (['premium', 'luxury_ai'].includes(tier) && ['living_room', 'master_bedroom', 'bedroom'].includes(roomType)) {
    base.push('ceiling_light', 'curtain');
  }
  if (tier === 'luxury_ai') base.push('smart_plug');

  return base.slice(0, 12);
}

export function getDefaultRoomDimensions(roomType: RoomType) {
  const dimensions: Partial<Record<RoomType, [number, number, number]>> = {
    bedroom: [4, 4, 3],
    guest_bedroom: [4, 4, 3],
    master_bedroom: [5, 4.5, 3],
    living_room: [6, 5, 3],
    family_lounge: [6, 5, 3],
    kitchen: [4, 3, 3],
    bathroom: [2.5, 2, 3],
    master_bathroom: [2.8, 2.2, 3],
    balcony: [4, 1.5, 3],
    passage: [5, 1.2, 3],
  };
  const [width, length, height] = dimensions[roomType] ?? [4, 4, 3];
  return { width, length, height };
}
