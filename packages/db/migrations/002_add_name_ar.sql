-- ============================================================
-- Migration 002 — Add name_ar columns
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- Safe to re-run (ADD COLUMN IF NOT EXISTS)
-- ============================================================

ALTER TABLE public.services  ADD COLUMN IF NOT EXISTS name_ar TEXT;
ALTER TABLE public.projects  ADD COLUMN IF NOT EXISTS name_ar TEXT;

-- Seed Arabic names for existing services
UPDATE public.services SET name_ar = 'أنظمة تُفكّر'       WHERE name = 'Artificial Intelligence' AND name_ar IS NULL;
UPDATE public.services SET name_ar = 'من الخادم للمستخدم'  WHERE name = 'Full-Stack Engineering'  AND name_ar IS NULL;
UPDATE public.services SET name_ar = 'في جيبك دائماً'      WHERE name = 'Mobile Development'      AND name_ar IS NULL;
UPDATE public.services SET name_ar = 'متجرك لا ينام'       WHERE name = 'E-Commerce Solutions'    AND name_ar IS NULL;
UPDATE public.services SET name_ar = 'خوادم لا تنام'       WHERE name = 'Cloud Infrastructure'   AND name_ar IS NULL;
UPDATE public.services SET name_ar = 'هويّة تُرى'           WHERE name = 'Design & Motion'         AND name_ar IS NULL;

-- Seed Arabic names for existing projects
UPDATE public.projects SET name_ar = 'أزايا ستوديو'  WHERE name = 'Azaya Studio'    AND name_ar IS NULL;
UPDATE public.projects SET name_ar = 'صندرة'          WHERE name = 'Sandara'         AND name_ar IS NULL;
UPDATE public.projects SET name_ar = 'حياتي للعناية'  WHERE name = 'Hayati Wellness' AND name_ar IS NULL;
