-- Migration 003: Seed Arabic headline settings
-- Run in Supabase SQL Editor after migrations 001 and 002
-- These keys are used by Hero.tsx for the Arabic companion headlines

INSERT INTO public.site_settings (key, value)
VALUES
  ('hero_line1_ar', 'نُهندِس'),
  ('hero_line2_ar', 'الذكاء')
ON CONFLICT (key) DO NOTHING;
