-- ============================================================
-- Migration 006 — Replace placeholder projects with real client sites
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Add url column if not already added by migration 005
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS url TEXT;

-- Remove old placeholder projects
DELETE FROM public.projects
WHERE name IN ('Azaya Studio', 'Sandara', 'Hayati Wellness');

-- Insert real client projects (safe: ON CONFLICT DO NOTHING)
INSERT INTO public.projects (name, name_ar, description, year, tags, image_url, url, sort_order, active)
VALUES
  (
    'Stitched',
    'ستيتشد',
    'Luxury Modest Fashion — Abayas & Seasonal Collections',
    '2024',
    ARRAY['Fashion', 'Shopify', 'UX Design'],
    'https://stitchedqa.com/cdn/shop/files/DarzEidAlAdha_desktop.jpg?v=1748358820&width=1500',
    'https://stitchedqa.com',
    1,
    true
  ),
  (
    'Elite Collections',
    'إيليت كولكشنز',
    'Arabic Leather Artisans — Premium Handcrafted Goods',
    '2024',
    ARRAY['E-Commerce', 'CRM', 'Admin Portal'],
    null,
    'https://elitecollections.qa',
    2,
    true
  ),
  (
    'The Seventh Sense',
    'الحاسة السابعة',
    'Natural Self-Care & Body Rituals by Shopify',
    '2025',
    ARRAY['Wellness', 'Shopify', 'Branding'],
    null,
    'https://the-seventhsense.com',
    3,
    true
  )
ON CONFLICT DO NOTHING;
