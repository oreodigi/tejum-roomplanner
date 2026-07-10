# Tejum Smart Planner UI Components

This document details the newly introduced premium UI component system designed to provide a playful, interactive, and visually stunning smart-home planning experience.

## Design Philosophy
- **Vibe:** Premium, modern, app-like configurator. Not a school exam or a SaaS admin form.
- **Colors:** Dark navy/charcoal background, glassmorphism containers, white elements, electric blue/teal accents.
- **Interactions:** Large touch targets, fluid slide/fade animations, animated progress.

## Core Shell Components

### `PlannerShell`
Replaces the standard single-column layout. Implements a responsive two-column layout on desktop:
- **Left Column:** Main interaction area for questions and cards.
- **Right Column:** Sticky `ProgressFlowPanel` showing live journey progression.

### `ProgressFlowPanel`
A vertical animated timeline and live summary diagram. It shows completed steps, the current active step, and dynamically displays project metrics (e.g., number of rooms planned, devices added).

### `PlannerStep`
An animation wrapper used inside every planner route. It handles smooth slide-up and fade-in transitions when navigating between steps to give an AJAX-like feel without full page reloads.

### `StickyPlannerActions`
A bottom-anchored action bar providing clear "Back", "Next", and "Skip" buttons. It handles loading states and prevents the user from being lost at the bottom of long pages.

## Interactive Elements (Form Replacements)

### `ChoiceCard`
Replaces standard radio buttons and checkboxes. It is a large, clickable card containing an icon, a bold title, and a description. It features a glowing border and background shift when selected.

### `QuantityStepper`
Replaces generic HTML number inputs. A large, touch-friendly component with bold minus/plus controls and a central numeric display, ideal for mobile usage.

### `DeviceToggleCard`
A specialized `ChoiceCard` that reveals an inline `QuantityStepper` once selected. Used heavily in the Room-by-Room device setup.

### `RoomCard`
A visual summary card for rooms, showing the room icon, name, and floor. It provides contextual actions like Edit and Duplicate.

### `SmartSummaryCard`
A premium display widget for the final review steps, replacing plain HTML tables with glass-morphic containers, icons, and clearly separated key-value pairs.
