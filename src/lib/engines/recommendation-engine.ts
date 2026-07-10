import type { Property, Room, ProjectDevice, Switchboard, InfrastructureCheck, AutomationInterest, Priority } from '@/lib/types';

// ============================================================
// RECOMMENDATION ENGINE
// Rule-based, data-driven logic to analyze project configuration
// and determine recommendations, risk factors, and readiness.
// ============================================================

export interface RecommendationInput {
  property: Property | null;
  rooms: Room[];
  devices: ProjectDevice[];
  switchboards: Switchboard[];
  infrastructure: InfrastructureCheck | null;
  budgetRange: string | null;
  priority: Priority | null;
  automationInterests: AutomationInterest[];
}

export interface RecommendationOutput {
  automationLevel: 'essential' | 'standard' | 'premium' | 'luxury';
  controlSystem: string;
  roomPriorities: { roomName: string; priority: 'high' | 'medium' | 'low' }[];
  productCategories: string[];
  installationComplexity: 'simple' | 'moderate' | 'complex';
  surveyPriority: 'standard' | 'urgent';
  missingInfo: string[];
  riskWarnings: string[];
}

export function runRecommendationEngine(input: RecommendationInput): RecommendationOutput {
  const { property, rooms, devices, switchboards, infrastructure, priority, automationInterests } = input;

  // 1. Determine Automation Level
  let automationLevel: RecommendationOutput['automationLevel'] = 'essential';
  if (priority === 'luxury' || priority === 'maximum') {
    automationLevel = 'luxury';
  } else if (priority === 'premium') {
    automationLevel = 'premium';
  } else if (priority === 'best_value') {
    automationLevel = 'standard';
  }

  // 2. Determine Control System
  let controlSystem = 'Wired & Wireless Hybrid System';
  if (property && property.automation_type === 'retrofit') {
    controlSystem = 'Wireless RF & Smart Retrofit Modules (No wall damage)';
  } else if (property && property.automation_type === 'new_construction') {
    controlSystem = 'KNX / Bus Wired Smart Automation (Premium & bulletproof)';
  }

  // 3. Room Priorities
  const roomPriorities = rooms.map((room) => {
    let p: 'high' | 'medium' | 'low' = 'low';
    
    // Primary common/living/bed rooms are high priority
    if (
      room.room_type === 'living_room' ||
      room.room_type === 'master_bedroom' ||
      room.room_type === 'home_theatre' ||
      room.room_type === 'entrance'
    ) {
      p = 'high';
    } else if (
      room.room_type === 'bedroom' ||
      room.room_type === 'kitchen' ||
      room.room_type === 'dining_room' ||
      room.room_type === 'family_lounge'
    ) {
      p = 'medium';
    }

    return {
      roomName: room.name,
      priority: p,
    };
  });

  // 4. Product Categories
  const productCategories: string[] = ['Lighting Control', 'Smart Appliance Control'];
  if (automationInterests.includes('smart_security')) {
    productCategories.push('Surveillance Cameras', 'Access Control Locks', 'Safety Sensors');
  }
  if (automationInterests.includes('ai_automation')) {
    productCategories.push('AI Multi-Sensors', 'Automation Hubs');
  }
  if (devices.some((d) => d.device_type?.supports_dimming || d.dimming_required)) {
    productCategories.push('Phase Dimming Modules');
  }

  // 5. Installation Complexity
  let installationComplexity: RecommendationOutput['installationComplexity'] = 'moderate';
  if (property && property.num_floors > 2) {
    installationComplexity = 'complex';
  } else if (property && property.automation_type === 'retrofit' && rooms.length < 5) {
    installationComplexity = 'simple';
  }

  // 6. Survey Priority
  let surveyPriority: RecommendationOutput['surveyPriority'] = 'standard';
  if (property && (property.project_status === 'electrical_in_progress' || property.project_status === 'interior_in_progress')) {
    surveyPriority = 'urgent'; // Electrical work is running — surveyor needs to visit quickly to instruct wiring!
  }

  // 7. Missing Info
  const missingInfo: string[] = [];
  if (property && property.built_up_area === null) {
    missingInfo.push('Built-up area (sq. ft.) is missing — helps calculate signal coverage requirements');
  }
  if (infrastructure && infrastructure.neutral_wiring === null) {
    missingInfo.push('Neutral wiring status in switchboards is unknown');
  }
  if (infrastructure && infrastructure.internet_available === null) {
    missingInfo.push('Internet connection details at site are unverified');
  }

  // 8. Risk Warnings
  const riskWarnings: string[] = [];
  if (property && property.automation_type === 'retrofit' && infrastructure && infrastructure.neutral_wiring === false) {
    riskWarnings.push('Retrofit project with no neutral wire at switchboards. Requires neutral-less smart modules or pulling new wiring.');
  }
  if (property && property.num_floors > 1 && infrastructure && infrastructure.mesh_wifi === false) {
    riskWarnings.push('Multi-floor layout with single WiFi router. Requires addition of Mesh Nodes for reliable smart home connection.');
  }
  if (infrastructure && infrastructure.ups_available === false && infrastructure.inverter_available === false) {
    riskWarnings.push('No power backup available. Smart hubs and locks will go offline during power cuts.');
  }
  if (property && property.electrical_layout_available === false) {
    riskWarnings.push('Electrical wiring layout document is not available. Site survey is mandatory to map conduit runs.');
  }

  return {
    automationLevel,
    controlSystem,
    roomPriorities,
    productCategories,
    installationComplexity,
    surveyPriority,
    missingInfo,
    riskWarnings,
  };
}
