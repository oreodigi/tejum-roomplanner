-- Add columns for draft syncing
ALTER TABLE public.projects 
  ADD COLUMN draft_data JSONB DEFAULT '{}',
  ADD COLUMN room_count SMALLINT DEFAULT 0,
  ADD COLUMN property_type TEXT;

-- Make customer_id nullable for early drafts
ALTER TABLE public.projects 
  ALTER COLUMN customer_id DROP NOT NULL;

-- RLS Policies for projects
-- Ensure users can only read/update their own projects
-- Administrators should have full read access

DROP POLICY IF EXISTS "Users can read own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;

CREATE POLICY "Users can read own projects" ON public.projects FOR SELECT
  USING (
    created_by = auth.uid() OR 
    customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can insert projects" ON public.projects FOR INSERT
  WITH CHECK (
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE
  USING (
    created_by = auth.uid() OR 
    customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for leads
DROP POLICY IF EXISTS "Users can access own leads" ON public.leads;

CREATE POLICY "Users can read own leads" ON public.leads FOR SELECT
  USING (
    customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()) OR 
    assigned_to = auth.uid() OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can update own leads" ON public.leads FOR UPDATE
  USING (
    customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()) OR 
    assigned_to = auth.uid() OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for uploaded files (documents)
DROP POLICY IF EXISTS "Users can access own uploaded_files" ON public.uploaded_files;

CREATE POLICY "Users can read own uploaded_files" ON public.uploaded_files FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE 
        created_by = auth.uid() OR 
        customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
    ) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can insert own uploaded_files" ON public.uploaded_files FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM public.projects WHERE 
        created_by = auth.uid() OR 
        customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
    ) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );
