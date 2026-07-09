-- ============================================================
-- Migration 009 — Case-study fields on projects
-- Run in: Supabase Dashboard → SQL Editor → New Query
--
-- Turns `projects` into the single source of truth for the /work/[slug]
-- case-study pages (previously hardcoded in three page.tsx files). The
-- homepage Works grid keeps using the same rows. RLS is unchanged: the
-- existing public_read policy already exposes active projects, and these
-- are just extra columns on that table.
-- ============================================================

-- ── Schema ──────────────────────────────────────────────────
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS slug          TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS tagline       TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS overview      TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS challenge     TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS solution      TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS results       JSONB   NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS tech          TEXT[]  NOT NULL DEFAULT '{}';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS services      TEXT[]  NOT NULL DEFAULT '{}';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS external_url  TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS is_case_study BOOLEAN NOT NULL DEFAULT false;

-- One case-study page per slug. Partial unique index so non-case-study
-- projects (slug NULL) are unconstrained.
CREATE UNIQUE INDEX IF NOT EXISTS projects_slug_unique
  ON public.projects (slug)
  WHERE slug IS NOT NULL;

-- ── Backfill the three existing case studies ────────────────
-- Matched by name (the rows seeded in migration 006). Content mirrors the
-- three hardcoded page.tsx files exactly, so there is no visual regression
-- once the dynamic route reads from here.

UPDATE public.projects SET
  slug          = 'stitched',
  is_case_study = true,
  tagline       = 'Premium fashion e-commerce for the Qatar market.',
  external_url  = 'https://stitchedqa.com',
  services      = ARRAY['E-Commerce Solutions', 'Full-Stack Engineering', 'Design & Motion'],
  tech          = ARRAY['Next.js', 'Shopify', 'Headless Commerce', 'Twilio', 'PostgreSQL', 'Figma'],
  overview      = 'Stitched is a Doha-based premium fashion brand serving customers across Qatar. Nous was brought in to design and build their full e-commerce experience, from brand identity and storefront design through to the technical build on Shopify.',
  challenge     = 'The client needed a bilingual (Arabic/English) storefront that felt premium and editorial, integrated with their existing CRM and inventory systems, and optimized for mobile-first Gulf shoppers who primarily use WhatsApp for post-purchase support.',
  solution      = 'We built a custom headless Shopify storefront using Next.js, with a fully RTL-capable Arabic layout and automated WhatsApp order notifications via the Twilio API. The design system uses a restrained dark palette with editorial typography to reflect the brand''s premium positioning.',
  results       = '[
    {"metric": "Storefront live", "value": "6 weeks", "note": "from brief to launch"},
    {"metric": "Mobile sessions", "value": "78%", "note": "of all traffic"},
    {"metric": "Bilingual", "value": "AR + EN", "note": "full RTL support"}
  ]'::jsonb
WHERE name = 'Stitched';

UPDATE public.projects SET
  slug          = 'elite-collections',
  is_case_study = true,
  tagline       = 'Luxury retail, digitized for Doha.',
  external_url  = NULL,
  services      = ARRAY['Full-Stack Engineering', 'Design & Motion', 'E-Commerce Solutions'],
  tech          = ARRAY['Next.js', 'Supabase', 'Tailwind CSS', 'Calendly API', 'Figma', 'Framer'],
  overview      = 'Elite Collections is a luxury retail brand based in Doha, Qatar. Nous designed and built their complete digital presence, encompassing brand identity, a curated product catalog, and an appointment booking system for private shopping experiences.',
  challenge     = 'Luxury retail in the Gulf market demands a digital presence that matches the in-store experience: unhurried, exclusive, and visually immaculate. The brand needed a bilingual platform that communicated prestige without being cold, and that funneled high-intent buyers toward private appointments rather than impulsive checkouts.',
  solution      = 'We built a custom Next.js platform with a restrained editorial design system, a Supabase-powered product catalog manageable from a custom admin, and a Calendly-integrated private appointment booking flow. The Arabic version was built RTL-native, not retrofitted.',
  results       = '[
    {"metric": "Launch timeline", "value": "8 weeks", "note": "design to production"},
    {"metric": "Languages", "value": "2", "note": "Arabic + English, both native"},
    {"metric": "Admin panel", "value": "Custom", "note": "no third-party CMS dependency"}
  ]'::jsonb
WHERE name = 'Elite Collections';

UPDATE public.projects SET
  slug          = 'the-seventh-sense',
  is_case_study = true,
  tagline       = 'An immersive brand experience platform.',
  external_url  = NULL,
  services      = ARRAY['Design & Motion', 'Full-Stack Engineering', 'Artificial Intelligence'],
  tech          = ARRAY['Next.js', 'GSAP', 'Three.js', 'Supabase', 'Tailwind CSS', 'Figma'],
  overview      = 'The Seventh Sense is a creative brand based in Doha, Qatar. Nous designed and developed their digital platform, an immersive web experience that uses motion, 3D, and editorial typography to communicate the brand''s identity in a way that static design cannot.',
  challenge     = 'The client wanted a web presence that felt like an experience, not a brochure. The brief called for cinematic-quality motion, bilingual content, and a CMS that a non-technical team could use to update the site without breaking the design.',
  solution      = 'We built a Next.js platform with GSAP ScrollTrigger for scroll-driven narrative sequences, Three.js for 3D ambient elements, and a custom Supabase-backed CMS with a locked design system so editors can change content without touching layout. All motion respects prefers-reduced-motion.',
  results       = '[
    {"metric": "Motion budget", "value": "< 280KB", "note": "compressed JS for animations"},
    {"metric": "Accessibility", "value": "WCAG AA", "note": "including reduced-motion path"},
    {"metric": "CMS adoption", "value": "100%", "note": "team self-sufficient from day one"}
  ]'::jsonb
WHERE name = 'The Seventh Sense';

-- ── Verify (optional) ───────────────────────────────────────
-- SELECT name, slug, is_case_study, jsonb_array_length(results) AS result_count
-- FROM public.projects ORDER BY sort_order;
