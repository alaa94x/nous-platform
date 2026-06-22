-- ── Migration 001: Enable RLS on all tables ───────────────────────────────────
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query)
-- Service role key bypasses RLS — admin app uses service role, so no admin policies needed.

-- Enable RLS
ALTER TABLE site_settings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE services          ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects          ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events  ENABLE ROW LEVEL SECURITY;

-- ── site_settings: public read ──────────────────────────────────────────────
DROP POLICY IF EXISTS "public_read_settings" ON site_settings;
CREATE POLICY "public_read_settings" ON site_settings
  FOR SELECT USING (true);

-- ── services: public read (active only) ─────────────────────────────────────
DROP POLICY IF EXISTS "public_read_services" ON services;
CREATE POLICY "public_read_services" ON services
  FOR SELECT USING (active = true);

-- ── projects: public read (active only) ─────────────────────────────────────
DROP POLICY IF EXISTS "public_read_projects" ON projects;
CREATE POLICY "public_read_projects" ON projects
  FOR SELECT USING (active = true);

-- ── contacts: public insert only (form submissions) ──────────────────────────
-- No public read — only admin (service role) can read contacts.
DROP POLICY IF EXISTS "public_insert_contacts" ON contacts;
CREATE POLICY "public_insert_contacts" ON contacts
  FOR INSERT WITH CHECK (true);

-- ── analytics_events: public insert only ─────────────────────────────────────
DROP POLICY IF EXISTS "public_insert_analytics" ON analytics_events;
CREATE POLICY "public_insert_analytics" ON analytics_events
  FOR INSERT WITH CHECK (true);
