# Phase Next: Full System Audit

## 1. Current Architecture
The Tejum Smart Room Planner is currently a Next.js 16 + React 19 application utilizing Zustand for state management and Three.js/React-Three-Fiber for the 3D visualizer.
- **Frontend State**: Managed entirely by `useVisualPlannerStore` in `src/lib/stores/visual-planner-store.ts`, synchronized with `localStorage`.
- **Database**: Supabase PostgreSQL database.
- **Persistence Layer**: When the customer reaches the final step, the planner submits the state via `src/app/api/planner/guest/route.ts` which inserts records into `customers`, `leads`, `projects`, `properties`, `floors`, `rooms`, `room_layouts`, `project_devices`, `device_placements`, and `estimates`.
- **3D Engine**: Uses procedural geometry and bounding box collision detection in `src/lib/engines/placement-geometry.ts`.

## 2. Current Planner Data Model
The frontend model consists of:
- `GuestPropertyDraft`: Captures basic property constraints (type, floors, bedrooms, occupancy, city, budget, timeline).
- `VisualPlannerRoom`: Captures layout, setup tier (essential/comfort/premium/luxury_ai), and device placements.
- `DevicePlacement`: Strict 3D coordinates, wall constraints, and primitive coverage areas.
- `GuestLeadDraft`: Captures basic contact info and conversion intent.
- *Gap*: The frontend lacks data models for scenarios, infrastructure checks, readiness status, device compatibility, BOQ items, and validation issues.

## 3. Existing Recommendation Capabilities
- **Current State**: Extremely rudimentary. `getRecommendedDeviceKeys` in `visual-planner.ts` simply maps a `roomType` and `setupTier` to a hardcoded string array of device keys.
- **Limitation**: It ignores budget, new construction vs retrofit, property constraints, floor counts, and customer intent. It provides no reasoning, priority, or dependencies.

## 4. Missing Intelligence
- **Project Readiness**: The DB has fields for `wiring_complete`, `electrical_layout_available`, `interior_designer_involved`, etc., but the planner does not ask for or utilize this data.
- **Scenarios**: The database has `automation_scenes` and `automation_rules`, but the planner only plans standalone devices.
- **Room Purpose/Outcome**: Placements describe "what" and "where", but not "why".
- **Validation**: No checking if a chosen setup lacks necessary network backbone or if a curtain motor is chosen on a wall with no power availability.

## 5. Missing BOQ Capabilities
- **Current State**: `visual-estimate-engine.ts` calculates a rough aggregate `rangeLow` and `rangeHigh` directly from the `placements` array and a multiplier.
- **Target State**: Need a deterministic engine (`boq-engine.ts`) to aggregate duplicate items across rooms, add necessary backend infrastructure (routers, switches, hubs), estimate installation labor, and calculate precise line-item bounds.

## 6. Missing Sales Handoff Data
- **Current State**: Creates a `lead` and `project` in Supabase with a generic notes field.
- **Target State**: Needs a Lead Scoring algorithm (0-100), categorization (Hot, Qualified, Nurture), detailed project condition reports, and site survey prerequisite generation.

## 7. Database Gaps
The existing database schema (`20260710000100_initial_schema.sql`) is actually incredibly robust and anticipates this exact transformation. 
- It already has `infrastructure_checks`, `automation_scenes`, `boq_items`, `estimates` (with detailed breakdowns), `site_surveys`, and `device_switchboard_mappings`.
- *Minor Gap*: We may need to ensure Supabase RPCs or API routes are updated to properly populate these tables, as `route.ts` currently ignores them.

## 8. API Gaps
- `guest/route.ts` currently saves only minimal data. It needs to be expanded to insert:
  - `infrastructure_checks`
  - `automation_scenes`
  - `boq_items`
  - Detailed metadata in `projects` (lead score, readiness factors).
- We need a secure Save & Resume API (Phase 12) with token generation so users can return to their projects safely without exposing predictable UUIDs.

## 9. Technical Risks
- **State Bloat**: Adding scenarios, readiness, infrastructure, and validation logic into `visual-planner-store.ts` will make it massive and slow. We need to split the intelligence out into separate hooks or engines.
- **UX Complexity**: Asking detailed infrastructure questions risks turning the planner into a boring "technical questionnaire" which violates the product principle. We must use progressive disclosure and friendly phrasing.
- **Deterministic Rules**: Building a massive `if/else` rule engine for recommendations can become unmaintainable. We must use a clean, decoupled rule-evaluator pattern (e.g., scoring rules).

## 10. Exact Implementation Plan
- **Phase 2**: Add "Project Readiness" step before the Room Map. Collect condition, electrical/interior readiness, and ceiling/network data. Add to `visual-planner-store`.
- **Phase 3**: Create `src/lib/engines/smart-home-advisor/` to process the state and generate reasoned recommendations.
- **Phase 4**: Map recommendations into `SmartRoomPlan`s.
- **Phase 5**: Add "Your Smart Home Experiences" step with visual scenario selection.
- **Phase 6**: Create `InfrastructurePlanner` to infer router/mesh/power backup needs.
- **Phase 7**: Create `src/lib/engines/boq/` to aggregate line items and costs.
- **Phase 8**: Create `plan-validator` to catch incompatibilities and warn the user gently.
- **Phase 9**: Overhaul the final review stage to be outcome-focused rather than just a list of devices.
- **Phase 10 & 11**: Create internal algorithms to generate lead scores and site-survey checklists.
- **Phase 12**: Implement Share/Save functionality via API and `localStorage`.
- **Phase 13 & 14**: Write tests, verify flows in browser.
- **Phase 15**: Lint, build, clean.
