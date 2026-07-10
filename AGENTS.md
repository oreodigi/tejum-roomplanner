<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Tejum Smart Planner Design Philosophy
1. **Interactive Configurator**: The planner must feel like a playful, premium, interactive smart-home configurator experience. Avoid generic SaaS admin forms (no standard radio buttons, checkboxes, or plain inputs).
2. **Aesthetic**: Use a dark navy/charcoal background with electric blue/teal accents, glassmorphism, and large touch targets.
3. **Components**: Use `ChoiceCard`, `RoomCard`, `QuantityStepper`, and `DeviceToggleCard` for inputs. Wrap pages in `PlannerStep` and `PlannerShell` for smooth slide/fade animations.
