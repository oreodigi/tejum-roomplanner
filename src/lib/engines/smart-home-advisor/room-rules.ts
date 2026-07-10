import type { AdvisorRule, RuleResult } from './advisor-types';

export const baseRoomRule: AdvisorRule = ({ roomType }) => {
  const result: RuleResult = { additions: [], removals: [], confidenceModifiers: {} };

  // Everyone gets a scene control and main light
  result.additions.push({ deviceKey: 'scene_control', reason: 'Essential room control', isRequired: true, quantity: 1 });
  result.additions.push({ deviceKey: 'main_light', reason: 'Basic illumination', isRequired: true, quantity: 1 });

  if (roomType.includes('bedroom')) {
    result.additions.push({ deviceKey: 'fan', reason: 'Climate comfort', isRequired: false, quantity: 1 });
    result.additions.push({ deviceKey: 'ac', reason: 'Climate control', isRequired: false, quantity: 1 });
    // In bedrooms, typically want a 2-way switch near bed
    result.additions.push({ deviceKey: 'scene_control', reason: 'Bedside 2-way control', isRequired: false, quantity: 1 });
  }

  if (roomType === 'living_room' || roomType === 'family_lounge') {
    result.additions.push({ deviceKey: 'fan', reason: 'Climate comfort', isRequired: false, quantity: 1 });
    result.additions.push({ deviceKey: 'ac', reason: 'Climate control', isRequired: false, quantity: 1 });
    result.additions.push({ deviceKey: 'tv', reason: 'Media entertainment', isRequired: false, quantity: 1 });
    // Extra lights for living room
    result.additions.push({ deviceKey: 'main_light', reason: 'Layered illumination', isRequired: false, quantity: 1 });
  }

  if (roomType === 'kitchen') {
    result.additions.push({ deviceKey: 'smoke_sensor', reason: 'Fire safety', isRequired: true, quantity: 1 });
    result.additions.push({ deviceKey: 'gas_leak_sensor', reason: 'Gas safety', isRequired: true, quantity: 1 });
  }

  if (roomType === 'bathroom' || roomType === 'master_bathroom') {
    result.additions.push({ deviceKey: 'water_leak_sensor', reason: 'Flood protection', isRequired: false, quantity: 1 });
  }

  if (roomType === 'entrance') {
    result.additions.push({ deviceKey: 'video_doorbell', reason: 'Visitor monitoring', isRequired: true, quantity: 1 });
    result.additions.push({ deviceKey: 'smart_lock', reason: 'Keyless entry', isRequired: true, quantity: 1 });
  }

  if (roomType === 'balcony' || roomType === 'passage') {
    result.additions.push({ deviceKey: 'motion_sensor', reason: 'Automated path lighting', isRequired: false, quantity: 1 });
  }

  return result;
};

export const tierRule: AdvisorRule = ({ setupTier, roomType }) => {
  const result: RuleResult = { additions: [], removals: [], confidenceModifiers: {} };

  if (setupTier === 'essential') {
    // Suppress premium features
    result.removals.push('curtain', 'home_theatre', 'smart_plug');
    result.confidenceModifiers['scene_control'] = -20; // less likely to need multiples
  }

  if (setupTier === 'comfort') {
    result.confidenceModifiers['motion_sensor'] = +30;
    result.confidenceModifiers['ac'] = +20;
  }

  if (setupTier === 'premium' || setupTier === 'luxury_ai') {
    if (['living_room', 'master_bedroom'].includes(roomType)) {
      result.additions.push({ deviceKey: 'curtain', reason: 'Automated privacy & sunlight', isRequired: false, quantity: 1 });
      result.additions.push({ deviceKey: 'ceiling_light', reason: 'Mood dimming', isRequired: false, quantity: 2 });
    }
    result.confidenceModifiers['scene_control'] = +40;
    result.confidenceModifiers['tv'] = +30;
  }

  if (setupTier === 'luxury_ai') {
    result.additions.push({ deviceKey: 'smart_plug', reason: 'Appliance automation', isRequired: false, quantity: 1 });
    result.confidenceModifiers['motion_sensor'] = +50; // AI tier uses occupancy sensors heavily
  }

  return result;
};
