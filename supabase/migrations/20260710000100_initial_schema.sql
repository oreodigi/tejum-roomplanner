-- Tejum Smart Home Requirement Planner
-- Full Database Schema Migration
-- Run this in Supabase SQL Editor

-- ============================================================
-- 1. IDENTITY & ACCESS
-- ============================================================

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','sales','admin','dealer')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  mobile TEXT,
  whatsapp TEXT,
  email TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  preferred_contact TEXT CHECK (preferred_contact IN ('phone','whatsapp','email')),
  relationship TEXT CHECK (relationship IN (
    'homeowner','family_member','builder','developer',
    'interior_designer','architect','contractor','consultant','other'
  )),
  user_id UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. LEADS & PROJECTS
-- ============================================================

CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  assigned_to UUID REFERENCES public.users(id),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN (
    'new','requirement_started','requirement_completed',
    'consultation_scheduled','site_survey_required','site_survey_completed',
    'boq_preparation','proposal_sent','negotiation',
    'won','lost','installation','support'
  )),
  source TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  lead_id UUID REFERENCES public.leads(id),
  created_by UUID REFERENCES public.users(id),
  name TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'customer' CHECK (mode IN ('customer','sales','admin')),
  automation_interests TEXT[] DEFAULT '{}',
  current_step TEXT DEFAULT 'customer_details',
  completion_pct SMALLINT DEFAULT 0,
  budget_range TEXT,
  priority TEXT,
  implementation_preference TEXT,
  status TEXT DEFAULT 'draft',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. PROPERTIES & ROOMS
-- ============================================================

CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE,
  property_type TEXT NOT NULL,
  num_floors SMALLINT DEFAULT 1,
  built_up_area NUMERIC,
  num_bedrooms SMALLINT DEFAULT 0,
  num_bathrooms SMALLINT DEFAULT 0,
  num_balconies SMALLINT DEFAULT 0,
  num_kitchens SMALLINT DEFAULT 1,
  num_parking SMALLINT DEFAULT 0,
  num_outdoor SMALLINT DEFAULT 0,
  project_status TEXT,
  automation_type TEXT,
  wiring_complete BOOLEAN,
  electrical_layout_available BOOLEAN,
  floor_plan_available BOOLEAN,
  interior_layout_available BOOLEAN,
  architect_involved BOOLEAN,
  interior_designer_involved BOOLEAN,
  electrician_assigned BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.property_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_type TEXT NOT NULL UNIQUE,
  default_rooms JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE public.floors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  floor_number SMALLINT NOT NULL DEFAULT 0,
  sort_order SMALLINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.room_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_type TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  icon TEXT,
  default_devices JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  floor_id UUID REFERENCES public.floors(id),
  room_template_id UUID REFERENCES public.room_templates(id),
  name TEXT NOT NULL,
  room_type TEXT NOT NULL,
  sort_order SMALLINT DEFAULT 0,
  is_optional BOOLEAN DEFAULT false,
  completion_pct SMALLINT DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 4. DEVICES
-- ============================================================

CREATE TABLE public.device_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  icon TEXT,
  sort_order SMALLINT DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE public.device_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.device_categories(id),
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  icon TEXT,
  supports_dimming BOOLEAN DEFAULT false,
  supports_speed_control BOOLEAN DEFAULT false,
  supports_rgb BOOLEAN DEFAULT false,
  supports_cct BOOLEAN DEFAULT false,
  supports_scheduling BOOLEAN DEFAULT true,
  config_schema JSONB DEFAULT '{}',
  sort_order SMALLINT DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE public.room_device_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_type TEXT NOT NULL,
  device_type_id UUID NOT NULL REFERENCES public.device_types(id),
  is_default BOOLEAN DEFAULT false,
  sort_order SMALLINT DEFAULT 0,
  UNIQUE (room_type, device_type_id)
);

CREATE TABLE public.project_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  device_type_id UUID NOT NULL REFERENCES public.device_types(id),
  quantity SMALLINT DEFAULT 1,
  is_existing BOOLEAN DEFAULT false,
  smart_automation BOOLEAN DEFAULT true,
  dimming_required BOOLEAN DEFAULT false,
  speed_control_required BOOLEAN DEFAULT false,
  scheduling_required BOOLEAN DEFAULT false,
  remote_control BOOLEAN DEFAULT true,
  voice_control BOOLEAN DEFAULT false,
  sensor_automation BOOLEAN DEFAULT false,
  ai_automation BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}',
  notes TEXT,
  status TEXT DEFAULT 'customer_confirmed' CHECK (status IN (
    'customer_confirmed','system_recommended','consultant_confirmed','survey_verified'
  )),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 5. SWITCHBOARDS & MAPPINGS
-- ============================================================

CREATE TABLE public.switchboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  board_number TEXT,
  location TEXT,
  num_modules SMALLINT,
  is_existing BOOLEAN DEFAULT false,
  num_switches SMALLINT DEFAULT 0,
  num_sockets SMALLINT DEFAULT 0,
  num_fan_regulators SMALLINT DEFAULT 0,
  num_dimmers SMALLINT DEFAULT 0,
  num_heavy_load SMALLINT DEFAULT 0,
  num_usb SMALLINT DEFAULT 0,
  num_two_way SMALLINT DEFAULT 0,
  neutral_available BOOLEAN,
  depth_available BOOLEAN,
  existing_brand TEXT,
  photo_url TEXT,
  notes TEXT,
  sort_order SMALLINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.switchboard_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  switchboard_id UUID NOT NULL REFERENCES public.switchboards(id) ON DELETE CASCADE,
  point_type TEXT NOT NULL CHECK (point_type IN (
    'switch','socket','fan_regulator','dimmer','heavy_load','usb','blank'
  )),
  position SMALLINT NOT NULL,
  label TEXT,
  device_id UUID REFERENCES public.project_devices(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.device_switchboard_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES public.project_devices(id) ON DELETE CASCADE,
  switchboard_id UUID NOT NULL REFERENCES public.switchboards(id),
  switch_position SMALLINT,
  control_type TEXT,
  is_primary BOOLEAN DEFAULT true,
  is_two_way BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 6. CONTROLS, SECURITY, AUTOMATION
-- ============================================================

CREATE TABLE public.control_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE public.room_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  control_type_id UUID NOT NULL REFERENCES public.control_types(id),
  is_primary BOOLEAN DEFAULT false,
  notes TEXT
);

CREATE TABLE public.security_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  requirement_type TEXT NOT NULL,
  quantity SMALLINT DEFAULT 1,
  location TEXT,
  room_id UUID REFERENCES public.rooms(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.automation_scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  scene_type TEXT DEFAULT 'lighting',
  config JSONB NOT NULL DEFAULT '{}',
  is_preset BOOLEAN DEFAULT false,
  sort_order SMALLINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL,
  trigger_description TEXT,
  actions JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  natural_language TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 7. INFRASTRUCTURE
-- ============================================================

CREATE TABLE public.infrastructure_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE,
  internet_available BOOLEAN,
  internet_provider TEXT,
  router_location TEXT,
  num_wifi_routers SMALLINT,
  mesh_wifi BOOLEAN,
  internet_backup BOOLEAN,
  ups_available BOOLEAN,
  inverter_available BOOLEAN,
  generator_available BOOLEAN,
  network_rack BOOLEAN,
  ethernet_cabling BOOLEAN,
  neutral_wiring BOOLEAN,
  home_server_required BOOLEAN,
  risk_flags JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 8. COMMERCIAL — PRODUCTS, BOQ, ESTIMATES
-- ============================================================

CREATE TABLE public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  sort_order SMALLINT DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.product_categories(id),
  name TEXT NOT NULL,
  sku TEXT UNIQUE,
  brand TEXT,
  description TEXT,
  specifications JSONB DEFAULT '{}',
  cost_price NUMERIC(10,2),
  selling_price NUMERIC(10,2),
  mrp NUMERIC(10,2),
  unit TEXT DEFAULT 'piece',
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_type TEXT NOT NULL,
  rule_key TEXT NOT NULL,
  value NUMERIC(10,2) NOT NULL,
  multiplier NUMERIC(5,2) DEFAULT 1.0,
  conditions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.boq_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  floor TEXT,
  room_name TEXT,
  device_name TEXT,
  device_type TEXT,
  quantity SMALLINT DEFAULT 1,
  automation_type TEXT,
  switchboard TEXT,
  control_type TEXT,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT,
  unit_price NUMERIC(10,2),
  total_price NUMERIC(10,2),
  installation_notes TEXT,
  notes TEXT,
  sort_order SMALLINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  version SMALLINT DEFAULT 1,
  hardware_total NUMERIC(12,2) DEFAULT 0,
  installation_total NUMERIC(12,2) DEFAULT 0,
  programming_total NUMERIC(12,2) DEFAULT 0,
  integration_total NUMERIC(12,2) DEFAULT 0,
  design_total NUMERIC(12,2) DEFAULT 0,
  site_survey_total NUMERIC(12,2) DEFAULT 0,
  networking_total NUMERIC(12,2) DEFAULT 0,
  support_total NUMERIC(12,2) DEFAULT 0,
  warranty_total NUMERIC(12,2) DEFAULT 0,
  subtotal NUMERIC(12,2) DEFAULT 0,
  tax_pct NUMERIC(5,2) DEFAULT 18.00,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  grand_total NUMERIC(12,2) DEFAULT 0,
  range_low NUMERIC(12,2),
  range_high NUMERIC(12,2),
  status TEXT DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.estimate_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID NOT NULL REFERENCES public.estimates(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  quantity SMALLINT DEFAULT 1,
  unit_price NUMERIC(10,2),
  total_price NUMERIC(10,2),
  notes TEXT
);

CREATE TABLE public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id),
  estimate_id UUID REFERENCES public.estimates(id),
  version SMALLINT DEFAULT 1,
  content JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','sent','accepted','rejected','expired')),
  sent_at TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 9. SUPPORT, FILES, ACTIVITY
-- ============================================================

CREATE TABLE public.support_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration_months SMALLINT,
  price NUMERIC(10,2),
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE public.warranty_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration_months SMALLINT,
  price NUMERIC(10,2),
  coverage JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE public.site_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id),
  scheduled_date TIMESTAMPTZ,
  assigned_to UUID REFERENCES public.users(id),
  status TEXT DEFAULT 'requested' CHECK (status IN (
    'requested','scheduled','completed','cancelled'
  )),
  checklist JSONB DEFAULT '{}',
  findings JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  room_id UUID REFERENCES public.rooms(id),
  switchboard_id UUID REFERENCES public.switchboards(id),
  file_type TEXT NOT NULL CHECK (file_type IN (
    'floor_plan','electrical_plan','interior_layout','room_photo',
    'switchboard_photo','existing_quotation','other'
  )),
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.room_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  layout_type TEXT DEFAULT '2d' CHECK (layout_type IN ('2d','photo_annotation')),
  canvas_data JSONB NOT NULL DEFAULT '{}',
  dimensions JSONB DEFAULT '{}',
  background_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 10. INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX idx_customers_user_id ON public.customers(user_id);
CREATE INDEX idx_leads_customer_id ON public.leads(customer_id);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_projects_customer_id ON public.projects(customer_id);
CREATE INDEX idx_projects_lead_id ON public.projects(lead_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_floors_property_id ON public.floors(property_id);
CREATE INDEX idx_rooms_project_id ON public.rooms(project_id);
CREATE INDEX idx_rooms_floor_id ON public.rooms(floor_id);
CREATE INDEX idx_project_devices_room_id ON public.project_devices(room_id);
CREATE INDEX idx_switchboards_room_id ON public.switchboards(room_id);
CREATE INDEX idx_switchboard_points_switchboard_id ON public.switchboard_points(switchboard_id);
CREATE INDEX idx_device_mappings_device_id ON public.device_switchboard_mappings(device_id);
CREATE INDEX idx_device_mappings_switchboard_id ON public.device_switchboard_mappings(switchboard_id);
CREATE INDEX idx_room_controls_room_id ON public.room_controls(room_id);
CREATE INDEX idx_security_req_project_id ON public.security_requirements(project_id);
CREATE INDEX idx_automation_scenes_project_id ON public.automation_scenes(project_id);
CREATE INDEX idx_automation_rules_project_id ON public.automation_rules(project_id);
CREATE INDEX idx_boq_items_project_id ON public.boq_items(project_id);
CREATE INDEX idx_estimates_project_id ON public.estimates(project_id);
CREATE INDEX idx_uploaded_files_project_id ON public.uploaded_files(project_id);
CREATE INDEX idx_activities_project_id ON public.activities(project_id);
CREATE INDEX idx_room_device_recs_room_type ON public.room_device_recommendations(room_type);

-- ============================================================
-- 11. ROW LEVEL SECURITY (RLS) — Basic Policies
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.floors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.switchboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.switchboard_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_switchboard_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infrastructure_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Public read for templates and reference data
ALTER TABLE public.property_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_device_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.control_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warranty_plans ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read reference/template data
CREATE POLICY "Anyone can read property_templates" ON public.property_templates FOR SELECT USING (true);
CREATE POLICY "Anyone can read room_templates" ON public.room_templates FOR SELECT USING (true);
CREATE POLICY "Anyone can read device_categories" ON public.device_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can read device_types" ON public.device_types FOR SELECT USING (true);
CREATE POLICY "Anyone can read room_device_recommendations" ON public.room_device_recommendations FOR SELECT USING (true);
CREATE POLICY "Anyone can read control_types" ON public.control_types FOR SELECT USING (true);
CREATE POLICY "Anyone can read product_categories" ON public.product_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Anyone can read support_plans" ON public.support_plans FOR SELECT USING (true);
CREATE POLICY "Anyone can read warranty_plans" ON public.warranty_plans FOR SELECT USING (true);

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Admin can manage everything (use service role key for admin operations)
-- More granular policies will be added per-feature as needed

-- Customers can manage their own projects
CREATE POLICY "Users can read own customers" ON public.customers FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert customers" ON public.customers FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own customers" ON public.customers FOR UPDATE USING (user_id = auth.uid());

-- Project access: creator or linked customer
CREATE POLICY "Users can read own projects" ON public.projects FOR SELECT
  USING (created_by = auth.uid() OR customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert projects" ON public.projects FOR INSERT
  WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE
  USING (created_by = auth.uid() OR customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()));

-- Cascade project access to child tables
CREATE POLICY "Users can access own properties" ON public.properties FOR ALL
  USING (project_id IN (SELECT id FROM public.projects WHERE created_by = auth.uid() OR customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())));

CREATE POLICY "Users can access own floors" ON public.floors FOR ALL
  USING (property_id IN (SELECT id FROM public.properties WHERE project_id IN (SELECT id FROM public.projects WHERE created_by = auth.uid() OR customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()))));

CREATE POLICY "Users can access own rooms" ON public.rooms FOR ALL
  USING (project_id IN (SELECT id FROM public.projects WHERE created_by = auth.uid() OR customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())));

CREATE POLICY "Users can access own devices" ON public.project_devices FOR ALL
  USING (room_id IN (SELECT id FROM public.rooms WHERE project_id IN (SELECT id FROM public.projects WHERE created_by = auth.uid() OR customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()))));

CREATE POLICY "Users can access own switchboards" ON public.switchboards FOR ALL
  USING (room_id IN (SELECT id FROM public.rooms WHERE project_id IN (SELECT id FROM public.projects WHERE created_by = auth.uid() OR customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()))));

CREATE POLICY "Users can access own switchboard_points" ON public.switchboard_points FOR ALL
  USING (switchboard_id IN (SELECT id FROM public.switchboards WHERE room_id IN (SELECT id FROM public.rooms WHERE project_id IN (SELECT id FROM public.projects WHERE created_by = auth.uid() OR customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())))));

CREATE POLICY "Users can access own device_mappings" ON public.device_switchboard_mappings FOR ALL
  USING (device_id IN (SELECT id FROM public.project_devices WHERE room_id IN (SELECT id FROM public.rooms WHERE project_id IN (SELECT id FROM public.projects WHERE created_by = auth.uid() OR customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())))));

CREATE POLICY "Users can access own room_controls" ON public.room_controls FOR ALL
  USING (room_id IN (SELECT id FROM public.rooms WHERE project_id IN (SELECT id FROM public.projects WHERE created_by = auth.uid() OR customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()))));

CREATE POLICY "Users can access own security_requirements" ON public.security_requirements FOR ALL
  USING (project_id IN (SELECT id FROM public.projects WHERE created_by = auth.uid() OR customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())));

CREATE POLICY "Users can access own automation_scenes" ON public.automation_scenes FOR ALL
  USING (project_id IN (SELECT id FROM public.projects WHERE created_by = auth.uid() OR customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())));

CREATE POLICY "Users can access own automation_rules" ON public.automation_rules FOR ALL
  USING (project_id IN (SELECT id FROM public.projects WHERE created_by = auth.uid() OR customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())));

CREATE POLICY "Users can access own infrastructure_checks" ON public.infrastructure_checks FOR ALL
  USING (project_id IN (SELECT id FROM public.projects WHERE created_by = auth.uid() OR customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())));

CREATE POLICY "Users can access own boq_items" ON public.boq_items FOR ALL
  USING (project_id IN (SELECT id FROM public.projects WHERE created_by = auth.uid() OR customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())));

CREATE POLICY "Users can access own estimates" ON public.estimates FOR ALL
  USING (project_id IN (SELECT id FROM public.projects WHERE created_by = auth.uid() OR customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())));

CREATE POLICY "Users can access own estimate_items" ON public.estimate_items FOR ALL
  USING (estimate_id IN (SELECT id FROM public.estimates WHERE project_id IN (SELECT id FROM public.projects WHERE created_by = auth.uid() OR customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()))));

CREATE POLICY "Users can access own proposals" ON public.proposals FOR ALL
  USING (project_id IN (SELECT id FROM public.projects WHERE created_by = auth.uid() OR customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())));

CREATE POLICY "Users can access own site_surveys" ON public.site_surveys FOR ALL
  USING (project_id IN (SELECT id FROM public.projects WHERE created_by = auth.uid() OR customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())));

CREATE POLICY "Users can access own uploaded_files" ON public.uploaded_files FOR ALL
  USING (project_id IN (SELECT id FROM public.projects WHERE created_by = auth.uid() OR customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())));

CREATE POLICY "Users can access own room_layouts" ON public.room_layouts FOR ALL
  USING (room_id IN (SELECT id FROM public.rooms WHERE project_id IN (SELECT id FROM public.projects WHERE created_by = auth.uid() OR customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()))));

CREATE POLICY "Users can access own activities" ON public.activities FOR ALL
  USING (project_id IN (SELECT id FROM public.projects WHERE created_by = auth.uid() OR customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())));

-- Pricing rules readable by authenticated users, writable by admin (via service role)
CREATE POLICY "Authenticated can read pricing_rules" ON public.pricing_rules FOR SELECT USING (auth.role() = 'authenticated');

-- Leads access for assigned users
CREATE POLICY "Users can access own leads" ON public.leads FOR ALL
  USING (customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()) OR assigned_to = auth.uid());
