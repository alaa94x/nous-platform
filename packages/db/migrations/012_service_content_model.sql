-- ============================================================
-- Migration 012 — Complete service editorial content model
-- Makes the fields already exposed in the admin portal reproducible in a
-- fresh database instead of relying on undocumented dashboard changes.
-- ============================================================

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS name_tech            TEXT,
  ADD COLUMN IF NOT EXISTS name_tech_ar         TEXT,
  ADD COLUMN IF NOT EXISTS business_pills       TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS business_tags        TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS engineering_tags     TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS business_outcomes    TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS engineering_stack    TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS business_subtext     TEXT;
