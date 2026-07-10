import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AUTOMATION_PACKAGES } from '@/lib/constants/visual-planner';
import { createServiceClient } from '@/lib/supabase/server';
import { calculateBOQ } from '@/lib/engines/boq/boq-engine';
import { generateSiteSurveyChecklist } from '@/lib/engines/sales/site-survey';
import type { PropertyType, ProjectReadiness } from '@/lib/types';

const vectorSchema = z.object({ x: z.number().finite(), y: z.number().finite(), z: z.number().finite() });
const placementSchema = z.object({
  id: z.string().min(1).max(64),
  device_key: z.string().min(1).max(80),
  display_name: z.string().min(1).max(120),
  wall_id: z.string().max(40).nullable().optional(),
  position: vectorSchema,
  rotation: vectorSchema,
  mounting_height_m: z.number().min(0).max(12),
  placement_type: z.enum(['wall', 'ceiling', 'floor', 'corner', 'surface']),
  coverage: z.object({
    kind: z.enum(['camera', 'motion', 'network']),
    angleDeg: z.number().min(0).max(360).optional(),
    rangeM: z.number().min(0).max(100),
    direction: vectorSchema.optional(),
  }).nullable().optional(),
});

const roomSchema = z.object({
  id: z.string().min(1).max(64),
  name: z.string().trim().min(1).max(100),
  roomType: z.string().min(1).max(80),
  floorNumber: z.number().int().min(0).max(10),
  floorName: z.string().min(1).max(80),
  setupTier: z.enum(['essential', 'comfort', 'premium', 'luxury_ai']),
  completionPct: z.number().int().min(0).max(100),
  layout: z.object({
    width_m: z.number().min(1).max(50),
    length_m: z.number().min(1).max(50),
    height_m: z.number().min(1.8).max(12),
    shape: z.record(z.string(), z.unknown()),
    openings: z.array(z.unknown()).max(50),
    furniture: z.array(z.unknown()).max(100),
  }),
  placements: z.array(placementSchema).max(80),
});

const requestSchema = z.object({
  automationPackage: z.enum(['full_home', 'controls', 'lighting', 'security', 'not_sure']),
  property: z.object({
    propertyType: z.enum([
      'studio_apartment', '1bhk', '2bhk', '3bhk', '4bhk', '5bhk', '6plus_bhk',
      'penthouse', 'duplex', '2storey_villa', '3storey_villa', 'independent_house',
      'farmhouse', 'office', 'retail', 'hospitality', 'custom'
    ]) as z.ZodType<PropertyType>,
    floors: z.number().int().min(1).max(10),
    bedrooms: z.number().int().min(0).max(30),
    bathrooms: z.number().int().min(0).max(30),
    balconies: z.number().int().min(0).max(20),
    kitchens: z.number().int().min(1).max(10),
    parking: z.number().int().min(0).max(20),
    outdoor: z.number().int().min(0).max(20),
    occupancy: z.enum(['new_home', 'renovation', 'occupied']),
    city: z.string().trim().max(100),
    budgetRange: z.string().max(80),
    timeline: z.string().max(80),
  }),
  rooms: z.array(roomSchema).min(1).max(80),
  lead: z.object({
    name: z.string().trim().min(2).max(120),
    phone: z.string().trim().min(10).max(20),
    city: z.string().trim().min(2).max(100),
    email: z.union([z.string().email(), z.literal('')]),
    preferredContact: z.enum(['phone', 'whatsapp', 'email']),
    conversionIntent: z.enum(['consultation', 'site_visit', 'boq', 'whatsapp']),
  }),
  estimate: z.object({
    hardwareLow: z.number().nonnegative(),
    hardwareHigh: z.number().nonnegative(),
    installationLow: z.number().nonnegative(),
    installationHigh: z.number().nonnegative(),
    integrationLow: z.number().nonnegative(),
    integrationHigh: z.number().nonnegative(),
    rangeLow: z.number().nonnegative(),
    rangeHigh: z.number().nonnegative(),
  }),
  readiness: z.object({
    condition: z.string().nullable().optional(),
    electrical: z.string().nullable().optional(),
    interior: z.string().nullable().optional(),
    automationApproach: z.string().nullable().optional(),
    backupPower: z.string().nullable().optional(),
    network: z.string().nullable().optional(),
  }).optional(),
  scenarios: z.array(z.object({
    id: z.string(),
    isEnabled: z.boolean(),
    deviceOverrides: z.record(z.string(), z.unknown()).optional(),
  })).optional(),
  leadScore: z.object({
    score: z.number(),
    tier: z.enum(['hot', 'warm', 'cold']),
    reasons: z.array(z.string()),
  }).optional(),
});

function assertData<T>(data: T | null, error: { message: string } | null, label: string): T {
  if (error || !data) throw new Error(error?.message || `Could not create ${label}.`);
  return data;
}

export async function POST(request: Request) {
  let customerId: string | null = null;
  let leadId: string | null = null;
  let projectId: string | null = null;

  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Planner persistence is not configured.' }, { status: 503 });
    }

    const body = requestSchema.parse(await request.json());
    const supabase = await createServiceClient();
    const packageDefinition = AUTOMATION_PACKAGES.find((item) => item.id === body.automationPackage);

    const customerResult = await supabase.from('customers').insert({
      full_name: body.lead.name,
      mobile: body.lead.phone,
      whatsapp: body.lead.preferredContact === 'whatsapp' ? body.lead.phone : null,
      email: body.lead.email || null,
      city: body.lead.city,
      preferred_contact: body.lead.preferredContact,
      relationship: 'homeowner',
      user_id: null,
    }).select('id').single();
    customerId = assertData(customerResult.data, customerResult.error, 'customer').id;

    // 2. Create the Lead
    const leadData: any = {
      customer_id: customerId,
      status: 'new',
      source: 'visual_planner',
      estimated_value_low: body.estimate.rangeLow,
      estimated_value_high: body.estimate.rangeHigh,
      automation_package: packageDefinition?.title ?? 'Custom setup',
      conversion_intent: body.lead.conversionIntent,
      metadata: {
        budget_range: body.property.budgetRange,
        timeline: body.property.timeline,
        readiness: body.readiness ?? null,
      },
    };

    if (body.leadScore) {
      leadData.lead_score = body.leadScore.score;
      leadData.lead_tier = body.leadScore.tier;
      leadData.metadata.lead_score_reasons = body.leadScore.reasons;
    }

    const leadResult = await supabase.from('leads').insert(leadData).select('id').single();
    leadId = assertData(leadResult.data, leadResult.error, 'lead').id;

    // 3. Generate internal sales metadata
    const allPlacements = body.rooms.flatMap(r => r.placements);
    const propertyParams = body.property;
    
    // Convert readiness strings to properly typed ProjectReadiness
    const readinessParams: ProjectReadiness = {
      condition: (body.readiness?.condition as any) || null,
      automationApproach: (body.readiness?.automationApproach as any) || null,
      electrical: (body.readiness?.electrical as any) || null,
      interior: (body.readiness?.interior as any) || null,
      ceiling: null,
      network: (body.readiness?.network as any) || null,
      backupPower: (body.readiness?.backupPower as any) || null,
      floorPlan: null,
    };

    const boq = calculateBOQ(allPlacements, propertyParams, readinessParams);
    const siteSurvey = generateSiteSurveyChecklist(propertyParams, readinessParams, body.rooms);

    // 4. Create the Project
    const projectResult = await supabase.from('projects').insert({
      customer_id: customerId,
      lead_id: leadId,
      name: `${body.property.city || 'Home'} Smart Setup`,
      status: 'draft',
      city: body.property.city || null,
      property_type: body.property.propertyType,
      floors: body.property.floors,
      bedrooms: body.property.bedrooms,
      metadata: {
        ...body.property,
        scenarios: body.scenarios ?? null,
        boq_items: boq.items,
        infrastructure_checks: siteSurvey,
      },
      hardware_estimate_low: body.estimate.hardwareLow,
      hardware_estimate_high: body.estimate.hardwareHigh,
      installation_estimate_low: body.estimate.installationLow,
      installation_estimate_high: body.estimate.installationHigh,
      integration_estimate_low: body.estimate.integrationLow,
      integration_estimate_high: body.estimate.integrationHigh,
    }).select('id').single();
    projectId = assertData(projectResult.data, projectResult.error, 'project').id;

    const propertyResult = await supabase.from('properties').insert({
      project_id: projectId,
      property_type: body.property.propertyType,
      num_floors: body.property.floors,
      num_bedrooms: body.property.bedrooms,
      num_bathrooms: body.property.bathrooms,
      num_balconies: body.property.balconies,
      num_kitchens: body.property.kitchens,
      num_parking: body.property.parking,
      num_outdoor: body.property.outdoor,
      project_status: body.property.occupancy === 'new_home' ? 'planning' : body.property.occupancy === 'renovation' ? 'renovation' : 'occupied',
      automation_type: body.property.occupancy === 'new_home' ? 'new_construction' : 'retrofit',
    }).select('id').single();
    const propertyId = assertData(propertyResult.data, propertyResult.error, 'property').id;

    const floorNumbers = Array.from(new Set(body.rooms.map((room) => room.floorNumber))).sort((a, b) => a - b);
    const floorsResult = await supabase.from('floors').insert(floorNumbers.map((floorNumber) => ({
      property_id: propertyId,
      name: floorNumber === 0 ? 'Ground Floor' : `Floor ${floorNumber}`,
      floor_number: floorNumber,
      sort_order: floorNumber,
    }))).select('id, floor_number');
    const floors = assertData(floorsResult.data, floorsResult.error, 'floors');
    const floorIdByNumber = new Map(floors.map((floor) => [floor.floor_number, floor.id]));

    const roomsResult = await supabase.from('rooms').insert(body.rooms.map((room, index) => ({
      project_id: projectId,
      floor_id: floorIdByNumber.get(room.floorNumber) ?? null,
      name: room.name,
      room_type: room.roomType,
      sort_order: index,
      completion_pct: room.completionPct,
      metadata: { guest_room_id: room.id, setup_tier: room.setupTier },
    }))).select('id, metadata');
    const savedRooms = assertData(roomsResult.data, roomsResult.error, 'rooms');
    const roomIdByGuestId = new Map(savedRooms.map((room) => [(room.metadata as { guest_room_id: string }).guest_room_id, room.id]));

    const roomLayoutsResult = await supabase.from('room_layouts').insert(body.rooms.map((room) => ({
      room_id: roomIdByGuestId.get(room.id),
      layout_type: '3d',
      dimensions: { width_m: room.layout.width_m, length_m: room.layout.length_m, height_m: room.layout.height_m },
      width_m: room.layout.width_m,
      length_m: room.layout.length_m,
      height_m: room.layout.height_m,
      shape: room.layout.shape,
      openings: room.layout.openings,
      furniture: room.layout.furniture,
      canvas_data: { source: 'visual_guest_planner' },
    })));
    if (roomLayoutsResult.error) throw new Error(roomLayoutsResult.error.message);

    const deviceKeys = Array.from(new Set(body.rooms.flatMap((room) => room.placements.map((placement) => placement.device_key))));
    const deviceTypesResult = await supabase.from('device_types').select('id, name').in('name', deviceKeys);
    const deviceTypes = assertData(deviceTypesResult.data, deviceTypesResult.error, 'device types');
    const deviceTypeIdByKey = new Map(deviceTypes.map((device) => [device.name, device.id]));
    const placementRows = body.rooms.flatMap((room) => room.placements.map((placement) => ({ room, placement }))).filter(({ placement }) => deviceTypeIdByKey.has(placement.device_key));

    if (placementRows.length > 0) {
      const projectDevicesResult = await supabase.from('project_devices').insert(placementRows.map(({ room, placement }) => ({
        room_id: roomIdByGuestId.get(room.id),
        device_type_id: deviceTypeIdByKey.get(placement.device_key),
        quantity: 1,
        smart_automation: true,
        sensor_automation: ['motion_sensor', 'gas_leak_sensor', 'smoke_sensor', 'water_leak_sensor'].includes(placement.device_key),
        ai_automation: room.setupTier === 'luxury_ai',
        config: { guest_placement_id: placement.id, setup_tier: room.setupTier },
        status: 'customer_confirmed',
      }))).select('id, config');
      const projectDevices = assertData(projectDevicesResult.data, projectDevicesResult.error, 'project devices');
      const projectDeviceIdByPlacementId = new Map(projectDevices.map((device) => [(device.config as { guest_placement_id: string }).guest_placement_id, device.id]));

      const placementsResult = await supabase.from('device_placements').insert(placementRows.map(({ room, placement }) => ({
        project_device_id: projectDeviceIdByPlacementId.get(placement.id),
        room_id: roomIdByGuestId.get(room.id),
        wall_id: placement.wall_id ?? null,
        position: placement.position,
        rotation: placement.rotation,
        mounting_height_m: placement.mounting_height_m,
        placement_type: placement.placement_type,
        coverage: placement.coverage ?? {},
      })));
      if (placementsResult.error) throw new Error(placementsResult.error.message);
    }

    const averageHardware = Math.round((body.estimate.hardwareLow + body.estimate.hardwareHigh) / 2);
    const averageInstallation = Math.round((body.estimate.installationLow + body.estimate.installationHigh) / 2);
    const averageIntegration = Math.round((body.estimate.integrationLow + body.estimate.integrationHigh) / 2);
    const subtotal = averageHardware + averageInstallation + averageIntegration;
    const taxAmount = Math.round(subtotal * 0.18);
    const estimateResult = await supabase.from('estimates').insert({
      project_id: projectId,
      hardware_total: averageHardware,
      installation_total: averageInstallation,
      integration_total: averageIntegration,
      programming_total: averageIntegration,
      subtotal,
      tax_pct: 18,
      tax_amount: taxAmount,
      grand_total: subtotal + taxAmount,
      range_low: body.estimate.rangeLow,
      range_high: body.estimate.rangeHigh,
      status: 'preliminary',
      notes: 'Visual planner estimate. Final quote subject to site survey, brand selection and infrastructure review.',
    });
    if (estimateResult.error) throw new Error(estimateResult.error.message);

    return NextResponse.json({ projectId, leadId }, { status: 201 });
  } catch (error) {
    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY ? await createServiceClient() : null;
    if (supabase) {
      if (projectId) await supabase.from('projects').delete().eq('id', projectId);
      if (leadId) await supabase.from('leads').delete().eq('id', leadId);
      if (customerId) await supabase.from('customers').delete().eq('id', customerId);
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Some planner details are incomplete or invalid.' }, { status: 400 });
    }
    console.error('Guest planner persistence failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not save your plan.' }, { status: 500 });
  }
}
