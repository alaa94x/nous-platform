-- ─────────────────────────────────────────────────────────────────────────────
-- 004_admin_rls_policies.sql
-- Full CRUD access for authenticated admin users on all content tables.
-- Run this in the Supabase SQL Editor.
-- ─────────────────────────────────────────────────────────────────────────────

-- Services
CREATE POLICY "admin_all_services"
  ON public.services FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Projects
CREATE POLICY "admin_all_projects"
  ON public.projects FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Site settings
CREATE POLICY "admin_all_settings"
  ON public.site_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Contacts (admin can update status / delete)
CREATE POLICY "admin_all_contacts"
  ON public.contacts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
