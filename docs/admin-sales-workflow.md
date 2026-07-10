# Admin And Sales Workflow

This document explains how the internal side of the Tejum Smart Planner is intended to work for sales, consultants, and admins.

## Purpose

The admin/sales side exists to turn customer-submitted planning data into:
- a manageable sales pipeline
- a survey and requirement validation workflow
- BOQ and commercial output
- proposal-ready documents

The admin routes are exposed at:
- `/dashboard`
- `/leads`
- `/projects/[projectId]/boq`
- `/projects/[projectId]/proposal`
- `/catalogue/products`

## Main Roles

### Customer
- creates and updates their own planning projects
- cannot access admin workspace

### Sales
- reviews incoming projects
- manages leads and status changes
- coordinates site survey and commercial follow-up

### Admin
- broad access to sales workspace
- manages product catalog
- can edit proposals and BOQ

### Dealer
- similar elevated access pattern for internal/commercial workflows

## Admin Workflow Overview

### 1. Customer Creates A Project

The workflow starts on the customer side.

By the time the customer reaches review/recommendation/estimate, the system already has:
- contact data
- property data
- room structure
- device intentions
- automation preferences
- budget signals

This means the internal team starts from a structured project, not from a blank lead sheet.

The primary guest visual planner now creates this structure only after conversion. Leads created through it use `source = visual_guest_planner`, include the requested next action in lead notes, and store timeline/package metadata on the project. A site-visit request starts at `site_survey_required`; other intents start at `requirement_completed`.

The internal team also receives room dimensions and spatial device placements, so consultants can validate mounting and coverage assumptions during the site survey.

### 2. Lead Appears In Internal Workspace

Internal users work from:
- `/dashboard`
- `/leads`

The lead/project pipeline is based on:
- `customers`
- `leads`
- `projects`
- `site_surveys`
- `estimates`

The admin team can see:
- recent requirement plans
- survey requests
- estimated pipeline value
- lead conversion state

### 3. Lead Qualification

At the lead level, the internal team reviews:
- customer details
- city/location
- relationship to project
- completion status of planner inputs
- whether estimate data exists

Typical decisions:
- is this a serious active project
- does it need a survey
- is it ready for BOQ
- should it move toward proposal

### 4. Survey Coordination

Customers can request a site survey from the summary step.

Internal users then use that data to:
- review requested slot
- assign follow-up
- confirm schedule
- track completion state

This is the bridge from digital requirement capture into physical validation.

### 5. Requirement Review

The internal team validates:
- room structure
- switchboard assumptions
- automation complexity
- lighting scene requests
- security requirements
- network/power readiness

This may result in:
- refining commercial interpretation
- validating what is feasible
- deciding what needs survey confirmation

### 6. BOQ Compilation

Route: `/projects/[projectId]/boq`

This screen converts planning intent into commercial line items.

Workflow:
- compile BOQ from `project_devices`
- map device intent to actual `products`
- adjust quantities and unit prices
- build a usable commercial spreadsheet structure

The BOQ page is where “smart bedroom with dimming and scene control” becomes a priced hardware list.

### 7. Estimate Review And Alignment

The planner generates a preliminary estimate automatically.

Internal users can use this to:
- validate reasonableness
- compare with BOQ output
- identify under-scoped or over-scoped assumptions
- shape the proposal narrative

The estimate is guidance, not necessarily the final signed commercial number.

### 8. Proposal Building

Route: `/projects/[projectId]/proposal`

The proposal builder lets internal users:
- prepare customer-facing proposal text
- customize intro/scope/terms
- include pricing summary
- move status from draft to sent/accepted/rejected

This is the client-facing commercial packaging layer.

### 9. Lead Status Management

Route: `/leads` and `/leads/[leadId]`

Internal users can progress leads through pipeline states such as:
- new
- requirement completed
- site survey completed
- BOQ preparation
- proposal sent
- won
- lost

This supports operational forecasting and follow-up discipline.

### 10. Product Catalog Management

Route: `/catalogue/products`

Internal users maintain the hardware catalog:
- products
- brands
- SKU
- MRP
- selling price
- active/inactive status

This is important because BOQ and proposal quality depends on clean product mapping.

## How Sales Should Use The System In Practice

### Recommended operational sequence

1. Watch incoming customer-created projects.
2. Review planner completion and estimate.
3. Contact customer for qualification and confirmation.
4. Schedule/complete site survey if needed.
5. Refine BOQ from actual project devices.
6. Align pricing and commercial assumptions.
7. Send proposal.
8. Update lead status to won/lost.

### What the system is good at

- collecting structured requirement data
- reducing back-and-forth in early discovery
- standardizing pre-sales smart-home planning
- creating a handoff from customer input to technical-commercial output

### What still requires human judgment

- feasibility validation
- actual site survey interpretation
- product-brand selection
- final pricing
- commercial negotiation
- installation-stage execution planning

## Page-Level Internal Responsibilities

### `/dashboard`
- high-level operational view
- KPI-style summary of leads, surveys, projects, and pipeline value

### `/leads`
- pipeline board
- stage movement and prioritization

### `/leads/[leadId]`
- detailed operational record for one lead
- quick jump into BOQ and proposal

### `/projects/[projectId]/boq`
- convert technical plan into line-item commercial structure

### `/projects/[projectId]/proposal`
- build the document and commercial narrative

### `/catalogue/products`
- maintain product/pricing catalog integrity

## Data Handoff Logic

The internal workflow depends on a clean sequence:

1. Customer fills planner data.
2. Planner writes structured records to project tables.
3. Recommendation and estimate engines generate technical/commercial guidance.
4. Sales/admin refine outputs into BOQ and proposal.
5. Lead status reflects actual commercial progress.

That means the planner is not a standalone consumer form. It is the structured front-end of the sales solutioning process.

## Summary

The admin/sales workflow is essentially:

1. receive structured smart-home intent
2. validate it
3. convert it into commercial line items
4. build proposal output
5. progress the lead through the sales cycle

The system works best when customer input, survey validation, BOQ mapping, and proposal handling all stay inside the same project record.
