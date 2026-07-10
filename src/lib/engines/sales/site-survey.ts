import type { ProjectReadiness } from '@/lib/types';
import type { GuestPropertyDraft, VisualPlannerRoom } from '@/lib/stores/visual-planner-store';

export interface SurveyChecklist {
  category: string;
  items: string[];
}

export function generateSiteSurveyChecklist(
  property: GuestPropertyDraft,
  readiness: ProjectReadiness,
  rooms: VisualPlannerRoom[]
): SurveyChecklist[] {
  const checklists: SurveyChecklist[] = [];
  const allPlacements = rooms.flatMap(r => r.placements);
  const deviceKeys = new Set(allPlacements.map(p => p.device_key));

  // 1. General Electrical
  const electricalItems: string[] = [];
  if (readiness.electrical === 'switchboards_installed' || property.occupancy === 'occupied') {
    electricalItems.push('Verify presence of neutral wire in switchboards.');
    electricalItems.push('Check depth of existing switchboard back-boxes (requires 2+ inches for retrofit modules).');
  } else {
    electricalItems.push('Coordinate with electrician for deep back-boxes and neutral wiring at all points.');
  }

  if (deviceKeys.has('ac')) {
    electricalItems.push('Verify AC tonnage and dedicated MCB ratings.');
  }
  
  if (electricalItems.length > 0) {
    checklists.push({ category: 'Electrical & Wiring', items: electricalItems });
  }

  // 2. Curtains & Blinds
  if (deviceKeys.has('curtain')) {
    checklists.push({
      category: 'Motorized Curtains',
      items: [
        'Check pelmet width and depth for motor housing.',
        'Verify provision for 230V power point at the curtain track end.',
        'Check window height and fabric weight limits.'
      ]
    });
  }

  // 3. Security & Access
  const securityItems: string[] = [];
  if (deviceKeys.has('smart_lock')) {
    securityItems.push('Measure door thickness (min 35mm required).');
    securityItems.push('Check existing lock mechanism and door material (wood vs metal).');
  }
  if (deviceKeys.has('video_doorbell') || deviceKeys.has('cctv')) {
    securityItems.push('Verify POE / power wiring availability at camera locations.');
    securityItems.push('Check field of view and ambient lighting for cameras.');
  }
  
  if (securityItems.length > 0) {
    checklists.push({ category: 'Security & Access', items: securityItems });
  }

  // 4. Networking
  const networkItems: string[] = [];
  if (property.floors > 1 || property.bedrooms >= 4 || readiness.network === 'mesh_wifi') {
    networkItems.push('Identify central location for main router/switch.');
    networkItems.push('Map out CAT6 drops for mesh nodes/APs on each floor.');
  }
  if (networkItems.length > 0) {
    checklists.push({ category: 'Networking Infrastructure', items: networkItems });
  }

  return checklists;
}
