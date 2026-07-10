# Tejum Smart Planner

A playful, premium, interactive smart-home configurator and estimation tool built with Next.js, Tailwind CSS, and Supabase.

## Features

- **Premium Guided UX**: A dark-mode, glassmorphic, two-column layout providing a seamless app-like experience.
- **Dynamic Room Mapping**: Auto-generates property layouts based on home type (e.g., 3BHK, Villa).
- **Interactive Device Selection**: Large touch-friendly toggles and steppers instead of boring form inputs.
- **Live Progress Tracking**: Visual timeline tracking the user's progress through the configuration journey.
- **End-to-End Workflow**: Captures customer details, automation interests, per-room device requirements, estimates, and BOQ generation.

## Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router, React 19)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/)
- **Database / Auth**: [Supabase](https://supabase.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: Zustand (via custom hooks)

## Getting Started

First, ensure your environment variables are set up in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Documentation

- [Customer Journey](docs/customer-journey.md) - Explains the step-by-step user flow.
- [Database Table-by-Table](docs/db-table-by-table.md) - Details the Supabase relational schema.
- [UI Components](docs/ui-components.md) - Documents the premium UI design system and custom React components used in the planner.

## UI Design Guidelines

When developing new features for this project:
1. **Never use standard HTML forms**: Always opt for `ChoiceCard`, `DeviceToggleCard`, or `QuantityStepper`.
2. **Prioritize animations**: Wrap route content in `<PlannerStep>` for smooth transitions.
3. **Keep it premium**: Maintain the dark navy/charcoal aesthetic with electric blue and teal accents.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).
