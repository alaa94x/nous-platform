-- ============================================================
-- Nous Platform — Analytics Enhancements
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- Adds session tracking, country, referrer, and device columns
-- ============================================================

ALTER TABLE public.analytics_events
  ADD COLUMN IF NOT EXISTS session_id TEXT,
  ADD COLUMN IF NOT EXISTS country    TEXT,
  ADD COLUMN IF NOT EXISTS referrer   TEXT,
  ADD COLUMN IF NOT EXISTS device     TEXT;

-- Speed up per-session lookups
CREATE INDEX IF NOT EXISTS analytics_events_session_idx
  ON public.analytics_events (session_id);

-- Speed up country aggregations
CREATE INDEX IF NOT EXISTS analytics_events_country_idx
  ON public.analytics_events (country);
