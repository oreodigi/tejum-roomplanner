-- ============================================================
-- SEED DATA for Tejum Smart Home Planner
-- Run this AFTER migration.sql
-- ============================================================

-- Device Categories
INSERT INTO public.device_categories (name, display_name, icon, sort_order) VALUES
  ('lighting', 'Lighting', 'Lightbulb', 1),
  ('climate', 'Climate Control', 'Thermometer', 2),
  ('entertainment', 'Entertainment', 'Monitor', 3),
  ('window_covering', 'Window Coverings', 'Blinds', 4),
  ('appliance', 'Appliances', 'Plug', 5),
  ('sensor', 'Sensors', 'Eye', 6),
  ('security', 'Security', 'Shield', 7),
  ('control', 'Control Systems', 'Settings2', 8),
  ('infrastructure', 'Infrastructure', 'Wifi', 9);

-- Device Types — Lighting
INSERT INTO public.device_types (category_id, name, display_name, icon, supports_dimming, supports_rgb, supports_cct, sort_order) VALUES
  ((SELECT id FROM public.device_categories WHERE name='lighting'), 'main_light', 'Main Light', 'Lightbulb', true, false, false, 1),
  ((SELECT id FROM public.device_categories WHERE name='lighting'), 'ceiling_light', 'Ceiling Light', 'Lightbulb', true, false, true, 2),
  ((SELECT id FROM public.device_categories WHERE name='lighting'), 'spotlight', 'Spotlight', 'Lightbulb', true, false, true, 3),
  ((SELECT id FROM public.device_categories WHERE name='lighting'), 'cove_light', 'Cove Light', 'Lightbulb', true, true, true, 4),
  ((SELECT id FROM public.device_categories WHERE name='lighting'), 'bedside_light', 'Bedside Light', 'Lightbulb', true, false, true, 5),
  ((SELECT id FROM public.device_categories WHERE name='lighting'), 'chandelier', 'Chandelier', 'Lightbulb', true, false, false, 6),
  ((SELECT id FROM public.device_categories WHERE name='lighting'), 'decorative_light', 'Decorative Light', 'Lightbulb', true, true, true, 7),
  ((SELECT id FROM public.device_categories WHERE name='lighting'), 'counter_light', 'Counter Light', 'Lightbulb', true, false, true, 8),
  ((SELECT id FROM public.device_categories WHERE name='lighting'), 'mirror_light', 'Mirror Light', 'Lightbulb', true, false, true, 9),
  ((SELECT id FROM public.device_categories WHERE name='lighting'), 'desk_light', 'Desk Light', 'Lightbulb', true, false, true, 10),
  ((SELECT id FROM public.device_categories WHERE name='lighting'), 'garden_light', 'Garden Light', 'Lightbulb', true, true, true, 11),
  ((SELECT id FROM public.device_categories WHERE name='lighting'), 'gate_light', 'Gate Light', 'Lightbulb', false, false, false, 12),
  ((SELECT id FROM public.device_categories WHERE name='lighting'), 'facade_light', 'Facade Light', 'Lightbulb', true, true, true, 13);

-- Device Types — Climate
INSERT INTO public.device_types (category_id, name, display_name, icon, supports_speed_control, sort_order) VALUES
  ((SELECT id FROM public.device_categories WHERE name='climate'), 'fan', 'Fan', 'Fan', true, 1),
  ((SELECT id FROM public.device_categories WHERE name='climate'), 'ac', 'Air Conditioner', 'Thermometer', false, 2),
  ((SELECT id FROM public.device_categories WHERE name='climate'), 'exhaust', 'Exhaust Fan', 'Fan', true, 3),
  ((SELECT id FROM public.device_categories WHERE name='climate'), 'chimney', 'Chimney', 'Wind', false, 4);

-- Device Types — Entertainment
INSERT INTO public.device_types (category_id, name, display_name, icon, sort_order) VALUES
  ((SELECT id FROM public.device_categories WHERE name='entertainment'), 'tv', 'TV', 'Monitor', 1),
  ((SELECT id FROM public.device_categories WHERE name='entertainment'), 'home_theatre', 'Home Theatre', 'Speaker', 2),
  ((SELECT id FROM public.device_categories WHERE name='entertainment'), 'sound_system', 'Sound System', 'Volume2', 3);

-- Device Types — Window Coverings
INSERT INTO public.device_types (category_id, name, display_name, icon, sort_order) VALUES
  ((SELECT id FROM public.device_categories WHERE name='window_covering'), 'curtain', 'Curtain', 'Blinds', 1),
  ((SELECT id FROM public.device_categories WHERE name='window_covering'), 'blind', 'Blind', 'Blinds', 2);

-- Device Types — Appliances
INSERT INTO public.device_types (category_id, name, display_name, icon, sort_order) VALUES
  ((SELECT id FROM public.device_categories WHERE name='appliance'), 'smart_plug', 'Smart Plug', 'Plug', 1),
  ((SELECT id FROM public.device_categories WHERE name='appliance'), 'appliance_plug', 'Appliance Plug', 'Plug', 2),
  ((SELECT id FROM public.device_categories WHERE name='appliance'), 'charging_point', 'Charging Point', 'BatteryCharging', 3),
  ((SELECT id FROM public.device_categories WHERE name='appliance'), 'geyser', 'Geyser / Water Heater', 'Flame', 4),
  ((SELECT id FROM public.device_categories WHERE name='appliance'), 'refrigerator', 'Refrigerator', 'Snowflake', 5),
  ((SELECT id FROM public.device_categories WHERE name='appliance'), 'microwave', 'Microwave', 'Microwave', 6),
  ((SELECT id FROM public.device_categories WHERE name='appliance'), 'oven', 'Oven', 'Flame', 7),
  ((SELECT id FROM public.device_categories WHERE name='appliance'), 'dishwasher', 'Dishwasher', 'Droplets', 8),
  ((SELECT id FROM public.device_categories WHERE name='appliance'), 'water_purifier', 'Water Purifier', 'Droplets', 9),
  ((SELECT id FROM public.device_categories WHERE name='appliance'), 'water_pump', 'Water Pump', 'Droplets', 10),
  ((SELECT id FROM public.device_categories WHERE name='appliance'), 'irrigation', 'Irrigation System', 'TreePine', 11),
  ((SELECT id FROM public.device_categories WHERE name='appliance'), 'gate_motor', 'Gate Motor', 'DoorOpen', 12);

-- Device Types — Sensors
INSERT INTO public.device_types (category_id, name, display_name, icon, sort_order) VALUES
  ((SELECT id FROM public.device_categories WHERE name='sensor'), 'motion_sensor', 'Motion Sensor', 'Eye', 1),
  ((SELECT id FROM public.device_categories WHERE name='sensor'), 'temperature_sensor', 'Temperature Sensor', 'Thermometer', 2),
  ((SELECT id FROM public.device_categories WHERE name='sensor'), 'gas_leak_sensor', 'Gas Leak Sensor', 'AlertTriangle', 3),
  ((SELECT id FROM public.device_categories WHERE name='sensor'), 'smoke_sensor', 'Smoke Sensor', 'Cloud', 4),
  ((SELECT id FROM public.device_categories WHERE name='sensor'), 'water_leak_sensor', 'Water Leak Sensor', 'Droplets', 5),
  ((SELECT id FROM public.device_categories WHERE name='sensor'), 'door_sensor', 'Door Sensor', 'DoorOpen', 6);

-- Device Types — Security
INSERT INTO public.device_types (category_id, name, display_name, icon, sort_order) VALUES
  ((SELECT id FROM public.device_categories WHERE name='security'), 'smart_lock', 'Smart Lock', 'Lock', 1),
  ((SELECT id FROM public.device_categories WHERE name='security'), 'video_doorbell', 'Video Doorbell', 'Video', 2),
  ((SELECT id FROM public.device_categories WHERE name='security'), 'cctv', 'CCTV Camera', 'Camera', 3);

-- Device Types — Controls
INSERT INTO public.device_types (category_id, name, display_name, icon, sort_order) VALUES
  ((SELECT id FROM public.device_categories WHERE name='control'), 'scene_control', 'Scene Control', 'Sparkles', 1);

-- Control Types
INSERT INTO public.control_types (name, display_name, description, icon) VALUES
  ('retrofit_module', 'Retrofit Smart Module', 'Keep existing switches, add smart modules behind them', 'Settings2'),
  ('mechanical_switch', 'Premium Mechanical Switch', 'Smart switch that looks and feels like a premium switch', 'ToggleLeft'),
  ('touch_panel', 'Touch Switch Panel', 'Elegant glass touch panels with LED indicators', 'Touchpad'),
  ('touchscreen_panel', 'Touchscreen Control Panel', 'Wall-mounted touchscreen for complete room control', 'Tablet'),
  ('scene_keypad', 'Scene Keypad', 'Dedicated buttons for preset scenes', 'LayoutGrid'),
  ('app_control', 'App Control', 'Control via TEJUM mobile app', 'Smartphone'),
  ('voice_control', 'Voice Control', 'Control via Alexa, Google Home, or Siri', 'Mic'),
  ('hybrid', 'Hybrid Setup', 'Mix of switches, touch panels, and app', 'Layers');

-- Support Plans
INSERT INTO public.support_plans (name, description, duration_months, price, features) VALUES
  ('Basic', 'Phone and email support during business hours', 12, 4999, '["Phone support", "Email support", "Business hours only", "48hr response time"]'),
  ('Standard', 'Priority support with remote diagnostics', 12, 9999, '["Priority phone support", "WhatsApp support", "Remote diagnostics", "24hr response time", "Quarterly health check"]'),
  ('Premium', 'Dedicated support with on-site visits', 12, 19999, '["Dedicated account manager", "24/7 support", "On-site visits (2/year)", "Remote diagnostics", "Monthly health check", "Software updates"]');

-- Warranty Plans
INSERT INTO public.warranty_plans (name, description, duration_months, price, coverage) VALUES
  ('Standard', 'Manufacturing defect coverage', 12, 0, '["Manufacturing defects", "Hardware replacement"]'),
  ('Extended', 'Extended warranty with accidental damage', 24, 7999, '["Manufacturing defects", "Hardware replacement", "Accidental damage", "Power surge protection"]'),
  ('Comprehensive', 'Full coverage including wear and tear', 36, 14999, '["All Extended coverage", "Wear and tear", "Software issues", "Free upgrades", "Annual maintenance"]');
