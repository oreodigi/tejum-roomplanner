// ============================================================
// Core TypeScript types for Tejum Smart Home Planner
// These mirror the database schema
// ============================================================

// --- Identity & Access ---

export type UserRole = 'customer' | 'sales' | 'admin' | 'dealer';

export interface User {
  id: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ContactMethod = 'phone' | 'whatsapp' | 'email';
export type Relationship =
  | 'homeowner'
  | 'family_member'
  | 'builder'
  | 'developer'
  | 'interior_designer'
  | 'architect'
  | 'contractor'
  | 'consultant'
  | 'other';

export interface Customer {
  id: string;
  full_name: string;
  mobile: string | null;
  whatsapp: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  preferred_contact: ContactMethod | null;
  relationship: Relationship | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

// --- Leads & Projects ---

export type LeadStatus =
  | 'new'
  | 'requirement_started'
  | 'requirement_completed'
  | 'consultation_scheduled'
  | 'site_survey_required'
  | 'site_survey_completed'
  | 'boq_preparation'
  | 'proposal_sent'
  | 'negotiation'
  | 'won'
  | 'lost'
  | 'installation'
  | 'support';

export interface Lead {
  id: string;
  customer_id: string;
  assigned_to: string | null;
  status: LeadStatus;
  source: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type ProjectMode = 'customer' | 'sales' | 'admin';

export type AutomationInterest =
  | 'complete_smart_home'
  | 'smart_controls'
  | 'smart_lighting'
  | 'smart_security'
  | 'ai_automation'
  | 'upgrade_existing'
  | 'not_sure';

export type BudgetRange =
  | 'under_1l'
  | '1l_2.5l'
  | '2.5l_5l'
  | '5l_10l'
  | '10l_25l'
  | '25l_plus'
  | 'need_recommendation';

export type Priority =
  | 'essential'
  | 'best_value'
  | 'premium'
  | 'luxury'
  | 'maximum';

export type ImplementationPreference =
  | 'complete_now'
  | 'phase_wise'
  | 'essential_rooms'
  | 'need_recommendation';

export interface Project {
  id: string;
  customer_id: string;
  lead_id: string | null;
  created_by: string | null;
  name: string;
  mode: ProjectMode;
  automation_interests: AutomationInterest[];
  current_step: PlannerStep;
  completion_pct: number;
  budget_range: BudgetRange | null;
  priority: Priority | null;
  implementation_preference: ImplementationPreference | null;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// --- Property ---

export type PropertyType =
  | 'studio_apartment'
  | '1bhk'
  | '2bhk'
  | '3bhk'
  | '4bhk'
  | '5bhk'
  | '6plus_bhk'
  | 'penthouse'
  | 'duplex'
  | '2storey_villa'
  | '3storey_villa'
  | 'independent_house'
  | 'farmhouse'
  | 'office'
  | 'retail'
  | 'hospitality'
  | 'custom';

export type ProjectStatus =
  | 'planning'
  | 'construction_started'
  | 'electrical_in_progress'
  | 'interior_in_progress'
  | 'nearly_completed'
  | 'ready'
  | 'occupied'
  | 'renovation';

export type AutomationType =
  | 'new_construction'
  | 'retrofit'
  | 'partial_renovation'
  | 'not_sure';

export interface Property {
  id: string;
  project_id: string;
  property_type: PropertyType;
  num_floors: number;
  built_up_area: number | null;
  num_bedrooms: number;
  num_bathrooms: number;
  num_balconies: number;
  num_kitchens: number;
  num_parking: number;
  num_outdoor: number;
  project_status: ProjectStatus | null;
  automation_type: AutomationType | null;
  wiring_complete: boolean | null;
  electrical_layout_available: boolean | null;
  floor_plan_available: boolean | null;
  interior_layout_available: boolean | null;
  architect_involved: boolean | null;
  interior_designer_involved: boolean | null;
  electrician_assigned: boolean | null;
  created_at: string;
  updated_at: string;
}

// --- Rooms ---

export type RoomType =
  | 'entrance'
  | 'foyer'
  | 'living_room'
  | 'dining_room'
  | 'kitchen'
  | 'master_bedroom'
  | 'bedroom'
  | 'guest_bedroom'
  | 'master_bathroom'
  | 'bathroom'
  | 'guest_bathroom'
  | 'powder_room'
  | 'balcony'
  | 'terrace'
  | 'passage'
  | 'staircase'
  | 'utility'
  | 'parking'
  | 'garden'
  | 'outdoor'
  | 'family_lounge'
  | 'study'
  | 'home_theatre'
  | 'gym'
  | 'puja_room'
  | 'store_room'
  | 'servant_room'
  | 'laundry'
  | 'pool'
  | 'custom';

export interface Floor {
  id: string;
  property_id: string;
  name: string;
  floor_number: number;
  sort_order: number;
  created_at: string;
}

export interface Room {
  id: string;
  project_id: string;
  floor_id: string | null;
  room_template_id: string | null;
  name: string;
  room_type: RoomType;
  sort_order: number;
  is_optional: boolean;
  completion_pct: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface RoomTemplate {
  id: string;
  room_type: RoomType;
  display_name: string;
  icon: string | null;
  default_devices: string[];
  is_active: boolean;
}

// --- Devices ---

export type DeviceStatus =
  | 'customer_confirmed'
  | 'system_recommended'
  | 'consultant_confirmed'
  | 'survey_verified';

export interface DeviceCategory {
  id: string;
  name: string;
  display_name: string;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface DeviceType {
  id: string;
  category_id: string;
  name: string;
  display_name: string;
  icon: string | null;
  supports_dimming: boolean;
  supports_speed_control: boolean;
  supports_rgb: boolean;
  supports_cct: boolean;
  supports_scheduling: boolean;
  config_schema: Record<string, unknown>;
  sort_order: number;
  is_active: boolean;
}

export interface ProjectDevice {
  id: string;
  room_id: string;
  device_type_id: string;
  quantity: number;
  is_existing: boolean;
  smart_automation: boolean;
  dimming_required: boolean;
  speed_control_required: boolean;
  scheduling_required: boolean;
  remote_control: boolean;
  voice_control: boolean;
  sensor_automation: boolean;
  ai_automation: boolean;
  config: Record<string, unknown>;
  notes: string | null;
  status: DeviceStatus;
  created_at: string;
  updated_at: string;
  // Joined fields
  device_type?: DeviceType;
}

// --- Switchboards ---

export type PointType =
  | 'switch'
  | 'socket'
  | 'fan_regulator'
  | 'dimmer'
  | 'heavy_load'
  | 'usb'
  | 'blank';

export interface Switchboard {
  id: string;
  room_id: string;
  name: string;
  board_number: string | null;
  location: string | null;
  num_modules: number | null;
  is_existing: boolean;
  num_switches: number;
  num_sockets: number;
  num_fan_regulators: number;
  num_dimmers: number;
  num_heavy_load: number;
  num_usb: number;
  num_two_way: number;
  neutral_available: boolean | null;
  depth_available: boolean | null;
  existing_brand: string | null;
  photo_url: string | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SwitchboardPoint {
  id: string;
  switchboard_id: string;
  point_type: PointType;
  position: number;
  label: string | null;
  device_id: string | null;
  created_at: string;
}

export interface DeviceSwitchboardMapping {
  id: string;
  device_id: string;
  switchboard_id: string;
  switch_position: number | null;
  control_type: string | null;
  is_primary: boolean;
  is_two_way: boolean;
  notes: string | null;
  created_at: string;
}

// --- Controls ---

export interface ControlType {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
}

export interface RoomControl {
  id: string;
  room_id: string;
  control_type_id: string;
  is_primary: boolean;
  notes: string | null;
  // Joined
  control_type?: ControlType;
}

// --- Security ---

export type SecurityRequirementType =
  | 'smart_lock'
  | 'video_doorbell'
  | 'cctv_outdoor'
  | 'cctv_indoor'
  | 'door_sensor'
  | 'window_sensor'
  | 'motion_sensor'
  | 'glass_break_sensor'
  | 'gas_leak_sensor'
  | 'smoke_sensor'
  | 'water_leak_sensor'
  | 'panic_button'
  | 'siren'
  | 'visitor_access'
  | 'staff_access'
  | 'temporary_access'
  | 'emergency_alerts';

export interface SecurityRequirement {
  id: string;
  project_id: string;
  requirement_type: SecurityRequirementType;
  quantity: number;
  location: string | null;
  room_id: string | null;
  notes: string | null;
  created_at: string;
}

// --- Automation ---

export interface AutomationScene {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  scene_type: string;
  config: {
    rooms?: string[];
    lights?: { brightness?: number; color?: string }[];
    curtains?: string;
    ac?: { temperature?: number; mode?: string };
    devices?: Record<string, unknown>[];
  };
  is_preset: boolean;
  sort_order: number;
  created_at: string;
}

export type AutomationTriggerType =
  | 'arrival'
  | 'departure'
  | 'bedtime'
  | 'wake_up'
  | 'leak_detected'
  | 'motion_detected'
  | 'high_energy'
  | 'custom';

export interface AutomationRule {
  id: string;
  project_id: string;
  trigger_type: AutomationTriggerType;
  trigger_description: string | null;
  actions: { device?: string; action?: string; params?: Record<string, unknown> }[];
  is_active: boolean;
  natural_language: string | null;
  created_at: string;
}

// --- Infrastructure ---

export interface InfrastructureCheck {
  id: string;
  project_id: string;
  internet_available: boolean | null;
  internet_provider: string | null;
  router_location: string | null;
  num_wifi_routers: number | null;
  mesh_wifi: boolean | null;
  internet_backup: boolean | null;
  ups_available: boolean | null;
  inverter_available: boolean | null;
  generator_available: boolean | null;
  network_rack: boolean | null;
  ethernet_cabling: boolean | null;
  neutral_wiring: boolean | null;
  home_server_required: boolean | null;
  risk_flags: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// --- Commercial ---

export interface Product {
  id: string;
  category_id: string;
  name: string;
  sku: string | null;
  brand: string | null;
  description: string | null;
  specifications: Record<string, unknown>;
  cost_price: number | null;
  selling_price: number | null;
  mrp: number | null;
  unit: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface BOQItem {
  id: string;
  project_id: string;
  floor: string | null;
  room_name: string | null;
  device_name: string | null;
  device_type: string | null;
  quantity: number;
  automation_type: string | null;
  switchboard: string | null;
  control_type: string | null;
  product_id: string | null;
  product_name: string | null;
  unit_price: number | null;
  total_price: number | null;
  installation_notes: string | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
}

export interface Estimate {
  id: string;
  project_id: string;
  version: number;
  hardware_total: number;
  installation_total: number;
  programming_total: number;
  integration_total: number;
  design_total: number;
  site_survey_total: number;
  networking_total: number;
  support_total: number;
  warranty_total: number;
  subtotal: number;
  tax_pct: number;
  tax_amount: number;
  grand_total: number;
  range_low: number | null;
  range_high: number | null;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface SiteSurvey {
  id: string;
  project_id: string;
  scheduled_date: string | null;
  assigned_to: string | null;
  status: 'requested' | 'scheduled' | 'completed' | 'cancelled';
  checklist: Record<string, unknown>;
  findings: Record<string, unknown>;
  notes: string | null;
  created_at: string;
}

// --- Planner Steps ---

export type PlannerStep =
  | 'customer_details'
  | 'automation_interest'
  | 'property_details'
  | 'rooms'
  | 'room_config'
  | 'lighting'
  | 'security'
  | 'ai_automation'
  | 'infrastructure'
  | 'budget'
  | 'review'
  | 'recommendation'
  | 'estimate'
  | 'summary';
