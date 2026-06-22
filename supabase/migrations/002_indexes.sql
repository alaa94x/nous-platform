-- ── Migration 002: Schema additions + Performance indexes ─────────────────────
-- Run after 001_rls_policies.sql
-- IMPORTANT: Run the ALTER TABLE statements FIRST (top of this file),
-- then the indexes that filter on the new columns.

-- ── Schema additions ──────────────────────────────────────────────────────────

-- Soft-delete support for contacts
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Arabic service names
ALTER TABLE services ADD COLUMN IF NOT EXISTS name_ar text;

-- Supabase Storage path for project images
ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_storage_path text;

-- ── Contacts: admin filters ───────────────────────────────────────────────────
-- Partial indexes only include non-deleted rows for efficiency
CREATE INDEX IF NOT EXISTS contacts_status_idx
  ON contacts (status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS contacts_created_at_idx
  ON contacts (created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS contacts_email_idx
  ON contacts (email)
  WHERE deleted_at IS NULL;

-- ── Analytics events: dashboard aggregations ──────────────────────────────────
CREATE INDEX IF NOT EXISTS analytics_event_idx
  ON analytics_events (event);

CREATE INDEX IF NOT EXISTS analytics_created_at_idx
  ON analytics_events (created_at DESC);

CREATE INDEX IF NOT EXISTS analytics_session_idx
  ON analytics_events (session_id);

-- ── Services / Projects: ordered active lists ─────────────────────────────────
CREATE INDEX IF NOT EXISTS services_sort_idx
  ON services (sort_order, active);

CREATE INDEX IF NOT EXISTS projects_sort_idx
  ON projects (sort_order, active);
