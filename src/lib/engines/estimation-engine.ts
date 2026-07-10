import type { Property, Room, ProjectDevice, Switchboard } from '@/lib/types';

// ============================================================
// ESTIMATION ENGINE
// Calculates preliminary costs based on:
// - Hardware: Count of devices & switchboards
// - Services: Programming, design, integration, support, warranty
// - Adjustments: Multipliers for complexity (retrofit vs new construction)
// ============================================================

export interface EstimateInput {
  property: Property | null;
  rooms: Room[];
  devices: ProjectDevice[];
  switchboards: Switchboard[];
}

export interface EstimateOutput {
  hardwareTotal: number;
  installationTotal: number;
  programmingTotal: number;
  integrationTotal: number;
  designTotal: number;
  siteSurveyTotal: number;
  networkingTotal: number;
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  rangeLow: number;
  rangeHigh: number;
}

export function runEstimationEngine(input: EstimateInput): EstimateOutput {
  const { property, rooms, devices, switchboards } = input;

  // 1. Fallback / Standard Unit Prices (INR)
  const DEVICE_PRICES: Record<string, number> = {
    main_light: 2500,
    ceiling_light: 3500,
    spotlight: 1500,
    cove_light: 4500,
    bedside_light: 2000,
    chandelier: 25000,
    decorative_light: 6000,
    fan: 3500,
    ac: 4500,
    tv: 2000,
    curtain: 12000,
    blind: 8000,
    smart_plug: 1800,
    appliance_plug: 2500,
    smart_lock: 18000,
    video_doorbell: 15000,
    cctv: 4500,
    cctv_outdoor: 6000,
    cctv_indoor: 4000,
    gas_leak_sensor: 2500,
    smoke_sensor: 3000,
    water_leak_sensor: 2500,
    door_sensor: 1800,
    motion_sensor: 3500,
    scene_control: 8000,
  };

  const INSTALLATION_PER_DEVICE = 500;
  const PROGRAMMING_PER_DEVICE = 300;

  // 2. Calculate Hardware & Labor Totals
  let hardwareTotal = 0;
  let installationTotal = 0;

  devices.forEach((device) => {
    const typeName = device.device_type?.name || 'smart_plug';
    const unitPrice = DEVICE_PRICES[typeName] || 2000;

    if (device.smart_automation) {
      hardwareTotal += unitPrice * device.quantity;
      installationTotal += INSTALLATION_PER_DEVICE * device.quantity;
    }
  });

  // Add Switchboard module hardware charges if any
  switchboards.forEach((board) => {
    // Basic backbox and touch module markup
    hardwareTotal += (board.num_modules || 12) * 800; // 800 INR per module
    installationTotal += 1000; // 1000 INR per switchboard install
  });

  // 3. Service Totals
  const deviceCount = devices.filter((d) => d.smart_automation).reduce((sum, d) => sum + d.quantity, 0);

  const programmingTotal = deviceCount * PROGRAMMING_PER_DEVICE;
  const integrationTotal = rooms.length * 2000; // 2000 INR per room integration charge
  const designTotal = Math.round(hardwareTotal * 0.05); // 5% design and planning fee
  const siteSurveyTotal = 2500; // Standard flat site survey preparation fee
  
  // Networking (Routers, Switches, Cable routing)
  let networkingTotal = 15000; // Base network infrastructure setup
  if (property && property.num_floors > 1) {
    networkingTotal += (property.num_floors - 1) * 8000; // add 8000 per additional floor node
  }

  // 4. Complexity Multipliers
  let multiplier = 1.0;
  if (property && property.automation_type === 'retrofit') {
    multiplier = 1.15; // Retrofit modules are slightly more complex to fit inside existing wiring boxes
  }

  hardwareTotal = Math.round(hardwareTotal * multiplier);
  installationTotal = Math.round(installationTotal * multiplier);

  // 5. Final Totals
  const subtotal = hardwareTotal + installationTotal + programmingTotal + integrationTotal + designTotal + siteSurveyTotal + networkingTotal;
  const taxPct = 0.18; // 18% GST standard for smart home equipment & services in India
  const taxAmount = Math.round(subtotal * taxPct);
  const grandTotal = subtotal + taxAmount;

  // 6. Cost Ranges (-15% to +20% for preliminary estimator bounds)
  const rangeLow = Math.round(grandTotal * 0.85);
  const rangeHigh = Math.round(grandTotal * 1.20);

  return {
    hardwareTotal,
    installationTotal,
    programmingTotal,
    integrationTotal,
    designTotal,
    siteSurveyTotal,
    networkingTotal,
    subtotal,
    taxAmount,
    grandTotal,
    rangeLow,
    rangeHigh,
  };
}
