# Customer Account Experience Audit

## 1. Existing Account Functionality
- **Authentication**: Basic Supabase Auth is set up. There is a `/login` and `/register` route. The middleware protects `/planner/*` routes (except `/planner/new`) by redirecting unauthenticated users to `/login`.
- **Dashboard**: There is a `/planner/projects/page.tsx` that serves as a rudimentary "My Projects" page, fetching all projects and showing basic completion percentages and dates.
- **Planner State Persistence**: The visual planner uses Zustand's `persist` middleware, storing the entire state (including the active UI step) in `localStorage`. 

## 2. Existing Project Ownership Model
- Projects belong to a customer via `customer_id`. The customer record maps to the `user_id` inside Supabase.
- The `api/planner/guest/route.ts` creates new leads and projects anonymously. Once submitted, it creates a project row.

## 3. Existing Local Draft Behavior
- Local drafts are implicitly stored in `localStorage` under the Zustand key.
- Whenever a user opens `/planner/new`, the `VisualPlannerApp` loads this state, meaning they instantly resume where they left off, down to the exact UI step. This creates poor UX when returning to start a *new* plan.

## 4. Existing Server-Side Saved Plan Behavior
- The `/api/planner/guest/share` route enables creating a temporary share token, and `resume` loads project data.
- However, continuous, debounced server-side saving of authenticated drafts is not fully implemented.

## 5. Authentication & Security Gaps
- **RLS**: The Supabase migrations (`20260710000100_initial_schema.sql`) define the tables but need thorough Row Level Security to ensure users only access their own profile, projects, and documents.
- **Login UX**: After logging in, the redirect logic exists but might not be sophisticated enough to return to exact document download flows or specific planner resume states. No dedicated loading/error feedback inside complex flows.

## 6. Missing Customer Account Pages
- The application lacks a true `/account` root portal.
- Missing: `/account` (Overview), `/account/plans` (My Plans UI), `/account/plans/[id]` (Plan Detail), `/account/profile`, `/account/support`.

## 7. Missing Document Functionality
- No server-side document generation exists.
- The system needs to generate PDFs for: Smart Home Plan, Room-by-Room Plan, Preliminary Estimate, Preliminary BOQ, Project Summary.

## 8. Exact Files & Routes to Create or Update
- **Create**:
  - `src/app/account/layout.tsx`
  - `src/app/account/page.tsx`
  - `src/app/account/plans/page.tsx`
  - `src/app/account/plans/[projectId]/page.tsx`
  - `src/app/account/documents/page.tsx`
  - `src/app/account/profile/page.tsx`
  - `src/app/account/support/page.tsx`
  - `src/app/api/documents/generate/route.ts`
  - PDF Generation Library (e.g. `@react-pdf/renderer` or `jspdf`) integration.
- **Update**:
  - `src/components/planner/VisualPlannerApp.tsx` (Decouple active UI step from persisting navigation directly to it on load)
  - `src/lib/stores/visual-planner-store.ts` (Add transient navigation state vs persisted draft state)
  - `src/app/login/page.tsx` and `src/lib/supabase/middleware.ts` (Handle redirects intelligently)
  - Supabase SQL Migrations (Add RLS policies)

## 9. Migration Requirements
- New RLS policies need to be created as a migration `20260710000300_rls_policies.sql`.
- Add `last_synced_at`, `sync_status` or similar tracking fields to `projects` table for the save-and-resume architecture.

## 10. Test Plan
- Verify anonymous local draft doesn't auto-navigate returning users without a prompt.
- Verify "Start New Plan" wipes transient state and creates a new ID.
- Verify auth flow handles redirects correctly.
- Verify RLS restricts downloading someone else's document.
- Verify PDF generation outputs correctly formatted project stats.
- Verify mobile UI scales properly without desktop table overflows.
