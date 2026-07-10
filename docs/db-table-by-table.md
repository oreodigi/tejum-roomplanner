# Database Table-By-Table

This document explains the main Supabase/Postgres tables used by the Tejum Smart Planner and how they relate to the planner flow.

## Identity And Access

### `public.users`
- Purpose: App-level user profile tied to `auth.users`.
- Key fields:
  - `id`: same UUID as Supabase Auth user
  - `full_name`: display name
  - `role`: `customer`, `sales`, `admin`, or `dealer`
  - `is_active`: soft activity flag
- Used for:
  - role-based UI decisions
  - admin authorization
  - linking planner ownership to a signed-in person

### `public.customers`
- Purpose: Customer/contact record for a planning engagement.
- Key fields:
  - `full_name`, `mobile`, `whatsapp`, `email`
  - `city`, `state`, `pincode`
  - `preferred_contact`
  - `relationship`
  - `user_id`: owning signed-in app user
- Used for:
  - customer details step
  - lead creation and project ownership
  - admin lead and proposal views

## Leads And Projects

### `public.leads`
- Purpose: Sales pipeline record around a customer.
- Key fields:
  - `customer_id`
  - `assigned_to`
  - `status`
  - `source`
  - `notes`
- Used for:
  - internal sales pipeline
  - admin dashboard and lead detail pages

### `public.projects`
- Purpose: Main planner record. Nearly everything hangs off this.
- Key fields:
  - `customer_id`
  - `lead_id`
  - `created_by`
  - `name`
  - `mode`
  - `automation_interests`
  - `current_step`
  - `completion_pct`
  - `budget_range`, `priority`, `implementation_preference`
  - `status`
- Used for:
  - route ownership
  - planner progress
  - recommendation and estimate inputs
  - admin BOQ/proposal workflows

## Property And Layout

### `public.properties`
- Purpose: Property-level structure and construction context for a project.
- Key fields:
  - `project_id`
  - `property_type`
  - `num_floors`, `built_up_area`
  - `num_bedrooms`, `num_bathrooms`, `num_balconies`
  - `num_kitchens`, `num_parking`, `num_outdoor`
  - `project_status`
  - `automation_type`
  - layout and wiring readiness booleans
- Used for:
  - property details step
  - room generation
  - recommendation and estimate logic

### `public.property_templates`
- Purpose: Reusable default room-generation patterns per property type.
- Used for:
  - future/default planning templates

### `public.floors`
- Purpose: Floor structure for a property.
- Key fields:
  - `property_id`
  - `name`
  - `floor_number`
  - `sort_order`
- Used for:
  - room grouping
  - floor-based planner display

### `public.room_templates`
- Purpose: Standard room-type definitions and default device hints.
- Used for:
  - room generation
  - room metadata

### `public.rooms`
- Purpose: Actual room records inside a project.
- Key fields:
  - `project_id`
  - `floor_id`
  - `name`
  - `room_type`
  - `sort_order`
  - `completion_pct`
- Used for:
  - room list step
  - room config step
  - downstream recommendation, lighting, security, BOQ, estimate logic

## Devices And Electrical Mapping

### `public.device_categories`
- Purpose: Top-level classification such as lighting, security, sensors, controls.
- Used for:
  - product and device reference
  - planner lookups

### `public.device_types`
- Purpose: Individual smart-device types.
- Key fields:
  - `category_id`
  - `name`, `display_name`
  - capability flags such as dimming, RGB, speed control
- Used for:
  - room device configuration
  - estimation logic
  - BOQ mapping

### `public.room_device_recommendations`
- Purpose: Default recommended device types by room type.
- Used for:
  - auto-populating room devices

### `public.project_devices`
- Purpose: Actual configured devices for a specific room.
- Key fields:
  - `room_id`
  - `device_type_id`
  - `quantity`
  - `smart_automation`
  - dimming/speed/voice/sensor/AI flags
  - `status`
- Used for:
  - room config
  - recommendation engine
  - estimate engine
  - BOQ compilation

### `public.switchboards`
- Purpose: Electrical switchboard/backbox structure for each room.
- Key fields:
  - `room_id`
  - `name`, `location`
  - counts of switches, sockets, regulators, dimmers
  - `neutral_available`, `depth_available`
- Used for:
  - electrical planning
  - retrofit/new-install analysis
  - estimate logic

### `public.switchboard_points`
- Purpose: Granular slots/positions within a switchboard.
- Used for:
  - fine-grained mapping of devices to points

### `public.device_switchboard_mappings`
- Purpose: Links devices to switchboards and control points.
- Used for:
  - future detailed BOQ/wiring output

## Controls, Security, Automation

### `public.control_types`
- Purpose: Available room-control styles such as touch panels, retrofit modules, app control, voice control.
- Used for:
  - room controls tab

### `public.room_controls`
- Purpose: Chosen control type per room.
- Used for:
  - room configuration
  - recommendation and commercial logic

### `public.security_requirements`
- Purpose: Security features requested for a project.
- Key fields:
  - `project_id`
  - `requirement_type`
  - `quantity`
  - `room_id`
  - `location`
- Used for:
  - security step
  - review and recommendation

### `public.automation_scenes`
- Purpose: Scene-based automations such as movie night or welcome home.
- Key fields:
  - `project_id`
  - `name`
  - `scene_type`
  - `config`
  - `is_preset`
- Used for:
  - lighting step
  - review and recommendation context

### `public.automation_rules`
- Purpose: Trigger/action rules for AI or smart routines.
- Key fields:
  - `project_id`
  - `trigger_type`
  - `natural_language`
  - `actions`
- Used for:
  - AI automation step
  - recommendation logic

## Infrastructure

### `public.infrastructure_checks`
- Purpose: Technical readiness assessment for network and power.
- Key fields:
  - internet/router/mesh data
  - UPS/inverter/generator flags
  - ethernet and neutral wiring flags
  - `risk_flags`
- Used for:
  - infrastructure step
  - recommendation engine risk analysis

## Commercial Outputs

### `public.product_categories`
- Purpose: Catalog grouping for products.

### `public.products`
- Purpose: Hardware/commercial product catalog.
- Key fields:
  - `category_id`
  - `name`, `sku`, `brand`
  - `cost_price`, `selling_price`, `mrp`
  - `unit`
  - `is_active`
- Used for:
  - admin product catalog
  - BOQ mapping

### `public.pricing_rules`
- Purpose: Pricing adjustments and commercial rules.
- Used for:
  - future pricing logic

### `public.boq_items`
- Purpose: Bill of quantities line items generated from project devices.
- Key fields:
  - `project_id`
  - `room_name`, `device_name`
  - `quantity`
  - `product_id`, `product_name`
  - `unit_price`, `total_price`
- Used for:
  - admin BOQ editor
  - proposal preparation

### `public.estimates`
- Purpose: Stored commercial estimate output.
- Key fields:
  - totals for hardware, installation, programming, design, networking
  - tax and grand total
  - low/high range
- Used for:
  - estimate step
  - admin dashboard and lead detail
  - proposal summary

### `public.estimate_items`
- Purpose: Detailed item-level commercial estimate breakdown.
- Used for:
  - future granular estimate reporting

### `public.proposals`
- Purpose: Proposal document data for a project.
- Key fields:
  - `project_id`
  - `estimate_id`
  - `content`
  - `status`
  - `version`
- Used for:
  - admin proposal builder

## Site Survey And Files

### `public.site_surveys`
- Purpose: On-site survey request/scheduling record.
- Key fields:
  - `project_id`
  - `scheduled_date`
  - `assigned_to`
  - `status`
  - `checklist`, `findings`, `notes`
- Used for:
  - summary page scheduling
  - admin lead follow-up

### `public.uploaded_files`
- Purpose: Files linked to a project.
- Used for:
  - future floor plans, diagrams, survey attachments

### `public.room_layouts`
- Purpose: Visual or structured room layout artifacts.
- Used for:
  - future room design support

## Activity And Support

### `public.activities`
- Purpose: Audit/activity stream on a project.
- Used for:
  - future event tracking and admin history

### `public.support_plans`
- Purpose: Reference support-plan offerings.

### `public.warranty_plans`
- Purpose: Reference warranty-plan offerings.

## Relationship Summary

- `auth.users` -> `public.users`
- `public.users` -> `public.customers`
- `public.customers` -> `public.projects`
- `public.projects` -> `properties`, `rooms`, `security_requirements`, `automation_scenes`, `automation_rules`, `infrastructure_checks`, `boq_items`, `estimates`, `proposals`, `site_surveys`
- `rooms` -> `project_devices`, `switchboards`, `room_controls`

## Practical Reading Order

If you want to understand one full project from top to bottom, inspect tables in this order:

1. `public.users`
2. `public.customers`
3. `public.projects`
4. `public.properties`
5. `public.rooms`
6. `public.project_devices`
7. `public.automation_scenes`
8. `public.security_requirements`
9. `public.automation_rules`
10. `public.infrastructure_checks`
11. `public.estimates`
12. `public.boq_items`
13. `public.proposals`
