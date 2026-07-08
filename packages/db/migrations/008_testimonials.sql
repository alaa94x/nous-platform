-- ============================================================
-- Nous Platform — Testimonials
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- Safe to re-run (all statements are idempotent)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.testimonials (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote       TEXT NOT NULL,
  author      TEXT NOT NULL,
  role        TEXT,
  initials    TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  active      BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Public: read active testimonials only (homepage)
DROP POLICY IF EXISTS "public_read_testimonials" ON public.testimonials;
CREATE POLICY "public_read_testimonials" ON public.testimonials
  FOR SELECT USING (active = true);

-- Admin: full CRUD for authenticated admin users
DROP POLICY IF EXISTS "admin_all_testimonials" ON public.testimonials;
CREATE POLICY "admin_all_testimonials"
  ON public.testimonials FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
