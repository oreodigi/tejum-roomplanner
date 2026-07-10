# Customer Journey

This document explains the customer-facing journey through the Tejum Smart Planner.

## Goal

The planner helps a customer define:
- what kind of property they have
- what rooms exist
- what automation they want
- how technically ready the property is
- what budget and rollout style they prefer

The app then turns that into:
- a structured smart-home requirement set
- recommended architecture and device direction
- a preliminary estimate range
- a sales-ready project record for the internal team

*Note: The entire customer-facing journey is built as a premium, interactive configurator. Standard forms are replaced with large touch-friendly `ChoiceCard`s, `QuantityStepper`s, and an animated two-column `PlannerShell`.*

## Entry Points

The customer normally enters through:
- landing page `/`
- login `/login`
- registration `/register`
- planner start `/planner/new`

## End-To-End Customer Flow

### 1. Account Creation Or Login

The user either:
- creates an account on `/register`, or
- signs in on `/login`

Once authenticated, the app uses Supabase Auth plus a matching `public.users` profile row.

### 2. Create A Project

On `/planner/new`, the user gives the project a simple name.

What happens behind the scenes:
- a `customers` row is created or linked for that signed-in user
- a `projects` row is created
- planner state is initialized
- the customer is redirected into the first step

### 3. Customer Details

Route: `/planner/[projectId]/customer-details`

The user provides:
- full name
- phone/email
- city/state
- preferred contact method
- relationship to the project

This becomes the base contact profile for the project and later appears in admin lead/proposal views.

### 4. Automation Interest

Route: `/planner/[projectId]/automation-interest`

The user indicates what they care about:
- smart controls
- lighting
- security
- AI automation
- complete smart home
- upgrade existing setup
- unsure / wants guidance

This shapes recommendations later.

### 5. Property Details

Route: `/planner/[projectId]/property-details`

The user defines the physical context:
- property type
- floors
- area
- number of bedrooms/bathrooms/balconies
- construction status
- new construction vs retrofit
- whether floor plans or electrical layouts exist
- whether architect/designer/electrician are involved

This is where the technical foundation of the project is captured.

### 6. Room Planning

Route: `/planner/[projectId]/rooms`

The system generates a room structure based on property inputs.

The user can then:
- keep the generated rooms
- rename rooms
- add extra rooms
- remove irrelevant rooms
- duplicate rooms

This step translates the property into real planning zones. *Uses a dynamic grid of `RoomCard` components organized by floor.*

### 7. Per-Room Configuration

Route: `/planner/[projectId]/rooms/[roomId]`

For each room, the user configures:
- smart devices
- device quantities
- whether automation is needed
- switchboards and their module counts
- control style such as touch panels, retrofit modules, app control, voice, etc.

This is where the planner becomes room-specific instead of generic. *Uses interactive `DeviceToggleCard`s that conditionally reveal `QuantityStepper`s.*

### 8. Smart Lighting

Route: `/planner/[projectId]/lighting`

The user selects or creates scenes such as:
- movie night
- reading/work
- good night
- welcome home
- custom moods

These scenes can be applied to specific rooms.

### 9. Security

Route: `/planner/[projectId]/security`

The user defines security requirements such as:
- smart lock
- video doorbell
- indoor/outdoor CCTV
- smoke sensor
- gas leak sensor
- water leak sensor
- intrusion sensors

They can also set quantities and room/location associations.

### 10. AI Automation

Route: `/planner/[projectId]/ai-automation`

The user enables behavioral rules like:
- arrival mode
- departure mode
- bedtime
- motion-triggered scenes
- safety responses
- custom natural-language routines

This step captures intent beyond individual devices.

### 11. Infrastructure

Route: `/planner/[projectId]/infrastructure`

The user describes technical readiness:
- internet availability
- router placement
- mesh wifi needs
- ethernet cabling
- neutral wiring
- backup power
- rack/server preferences

This is critical for determining feasibility and complexity.

### 12. Budget And Priority

Route: `/planner/[projectId]/budget`

The user picks:
- budget range
- quality/prioritization level
- rollout preference such as full now vs phase-wise

This affects both recommendation strategy and commercial outputs.

### 13. Review

Route: `/planner/[projectId]/review`

The customer sees a consolidated summary of:
- personal details
- property structure
- rooms
- lighting scenes
- security setup
- automation rules
- infrastructure
- budget choices

This is the confirmation point before analysis.

### 14. Recommendation

Route: `/planner/[projectId]/recommendation`

The app runs its recommendation engine and produces:
- recommended control architecture
- product-category direction
- room priority suggestions
- installation complexity
- risk warnings

This is the technical interpretation layer.

### 15. Estimate

Route: `/planner/[projectId]/estimate`

The app runs its estimation engine and produces:
- hardware total
- installation total
- programming total
- networking total
- tax
- grand total
- estimated low/high range

This is a preliminary commercial result, not a final locked quote.

### 16. Summary

Route: `/planner/[projectId]/summary`

The customer sees:
- final planning summary
- next steps
- survey scheduling option
- future deliverable direction

At this point the project is ready for internal sales/admin follow-up.

## What The Customer Actually Gets

By the end of the journey, the customer has not just filled a form. They have created:
- a structured smart-home project record
- room-by-room intent and device needs
- automation preferences
- infra readiness context
- a recommendation-ready and estimate-ready project

## What Happens After The Customer Finishes

Internally, the system can now support:
- lead tracking
- survey scheduling
- BOQ generation
- estimate editing
- proposal creation
- product mapping

So the customer journey is both:
- a self-service planning experience
- a data-capture engine for the sales/solution team

## Summary

In simple terms, the customer journey is:

1. Sign in
2. Create a project
3. Describe the customer and property
4. Build rooms
5. Configure devices, scenes, security, automation, and infra
6. Confirm preferences
7. Receive recommendations and estimate range
8. Hand off into sales and survey workflow
