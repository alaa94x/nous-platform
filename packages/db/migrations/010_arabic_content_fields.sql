-- ============================================================
-- Migration 010 — Arabic content fields
-- Keeps English and Arabic editorial content independently editable in admin.
-- ============================================================

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS business_subtext_ar TEXT;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS description_ar TEXT,
  ADD COLUMN IF NOT EXISTS tagline_ar    TEXT,
  ADD COLUMN IF NOT EXISTS overview_ar   TEXT,
  ADD COLUMN IF NOT EXISTS challenge_ar  TEXT,
  ADD COLUMN IF NOT EXISTS solution_ar   TEXT,
  ADD COLUMN IF NOT EXISTS results_ar    JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS services_ar   TEXT[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.projects.results_ar IS
  'Arabic result cards. Same shape as results: [{value, metric, note}].';
