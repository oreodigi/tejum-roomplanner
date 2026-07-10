# Tejum Planner Documentation

This directory is the engineering and operational handbook for the Tejum Smart Room Planner. It is written for developers, AI coding agents, sales/admin users, and anyone taking over the project.

## Product and Workflow

- [Customer Journey](customer-journey.md): customer-facing planner flow from welcome to lead submission
- [Admin and Sales Workflow](admin-sales-workflow.md): lead qualification, survey, BOQ, proposal, and pipeline flow
- [Database Table by Table](db-table-by-table.md): Supabase schema responsibilities and relationships

## Engineering

- [Visual Planner Architecture](visual-planner-architecture.md): application state, room generation, estimates, persistence, and route boundaries
- [UI Components](ui-components.md): guided configurator component system
- [3D Visualizer Handbook](visualizer/README.md): scene architecture, coordinate system, rendering, interactions, and data flow
- [Device Placement Rules](visualizer/device-placement.md): catalog, mounting surfaces, heights, rotations, anchors, and drag constraints
- [Furniture and Room Layouts](visualizer/furniture-layouts.md): generated furniture by room type and placement formulas
- [Testing and Extension Guide](visualizer/testing-and-extension.md): safe change workflow and browser acceptance checks

## Source-of-Truth Order

When documentation and code disagree, verify the current behavior in this order:

1. `src/lib/engines/placement-geometry.ts`
2. `src/lib/stores/visual-planner-store.ts`
3. `src/lib/constants/visual-planner.ts`
4. `src/components/visualizer/`
5. `src/app/api/planner/guest/route.ts`
6. documentation in this directory

Fix outdated documentation in the same change that corrects the implementation.
