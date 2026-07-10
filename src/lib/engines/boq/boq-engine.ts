import type { DevicePlacement, ProjectReadiness } from '@/lib/types';
import type { GuestPropertyDraft } from '@/lib/stores/visual-planner-store';
import type { BOQLineItem, BOQEstimate } from './boq-types';
import { getDeviceDefinition } from '@/lib/constants/visual-planner';

export function calculateBOQ(
  placements: DevicePlacement[],
  property: GuestPropertyDraft,
  readiness: ProjectReadiness
): BOQEstimate {
  const items: BOQLineItem[] = [];
  
  // 1. Aggregate Hardware
  const hardwareMap = new Map<string, { quantity: number; name: string; low: number; high: number }>();
  
  for (const placement of placements) {
    const def = getDeviceDefinition(placement.device_key);
    if (!def) continue;

    const existing = hardwareMap.get(placement.device_key);
    if (existing) {
      existing.quantity += 1;
    } else {
      hardwareMap.set(placement.device_key, {
        quantity: 1,
        name: def.label,
        low: def.priceLow,
        high: def.priceHigh,
      });
    }
  }

  for (const [key, data] of hardwareMap.entries()) {
    items.push({
      id: key,
      category: 'hardware',
      name: data.name,
      quantity: data.quantity,
      unitPriceLow: data.low,
      unitPriceHigh: data.high,
      totalLow: data.low * data.quantity,
      totalHigh: data.high * data.quantity,
    });
  }

  // 2. Infer Networking Infrastructure
  // Basic rule: 1 router per floor + 1 extra AP if many rooms
  let routerCount = property.floors;
  if (property.bedrooms >= 4) routerCount += 1; // Need extra coverage

  if (readiness.network === 'mesh_wifi' || readiness.network === 'need_recommendation' || !readiness.network) {
    items.push({
      id: 'mesh_router',
      category: 'networking',
      name: 'Enterprise Mesh WiFi Node',
      quantity: routerCount,
      unitPriceLow: 8000,
      unitPriceHigh: 15000,
      totalLow: 8000 * routerCount,
      totalHigh: 15000 * routerCount,
    });
  }

  // 3. Infrastructure (e.g. smart hubs)
  // 1 Hub per 30 devices
  const totalDevices = placements.length;
  if (totalDevices > 0) {
    const hubCount = Math.ceil(totalDevices / 30);
    items.push({
      id: 'smart_hub',
      category: 'infrastructure',
      name: 'Smart Home Automation Hub',
      quantity: hubCount,
      unitPriceLow: 12000,
      unitPriceHigh: 25000,
      totalLow: 12000 * hubCount,
      totalHigh: 25000 * hubCount,
    });
  }

  // 4. Installation & Programming Labor
  // Usually estimated at 15-20% of hardware cost for premium setups
  let hwTotalLow = 0;
  let hwTotalHigh = 0;
  items.filter(i => i.category === 'hardware' || i.category === 'infrastructure').forEach(i => {
    hwTotalLow += i.totalLow;
    hwTotalHigh += i.totalHigh;
  });

  items.push({
    id: 'installation_labor',
    category: 'installation',
    name: 'Professional Installation',
    quantity: 1,
    unitPriceLow: Math.round(hwTotalLow * 0.1),
    unitPriceHigh: Math.round(hwTotalHigh * 0.15),
    totalLow: Math.round(hwTotalLow * 0.1),
    totalHigh: Math.round(hwTotalHigh * 0.15),
  });

  items.push({
    id: 'programming',
    category: 'programming',
    name: 'System Programming & Tuning',
    quantity: 1,
    unitPriceLow: Math.round(hwTotalLow * 0.05),
    unitPriceHigh: Math.round(hwTotalHigh * 0.1),
    totalLow: Math.round(hwTotalLow * 0.05),
    totalHigh: Math.round(hwTotalHigh * 0.1),
  });

  // Calculate Subtotals
  const estimate: BOQEstimate = {
    items,
    hardwareTotal: [0, 0],
    networkingTotal: [0, 0],
    installationTotal: [0, 0],
    programmingTotal: [0, 0],
    grandTotal: [0, 0]
  };

  for (const item of items) {
    if (item.category === 'hardware' || item.category === 'infrastructure') {
      estimate.hardwareTotal[0] += item.totalLow;
      estimate.hardwareTotal[1] += item.totalHigh;
    } else if (item.category === 'networking') {
      estimate.networkingTotal[0] += item.totalLow;
      estimate.networkingTotal[1] += item.totalHigh;
    } else if (item.category === 'installation') {
      estimate.installationTotal[0] += item.totalLow;
      estimate.installationTotal[1] += item.totalHigh;
    } else if (item.category === 'programming') {
      estimate.programmingTotal[0] += item.totalLow;
      estimate.programmingTotal[1] += item.totalHigh;
    }

    estimate.grandTotal[0] += item.totalLow;
    estimate.grandTotal[1] += item.totalHigh;
  }

  return estimate;
}
