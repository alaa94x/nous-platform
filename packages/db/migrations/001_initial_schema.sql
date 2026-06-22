-- ============================================================
-- Nous Platform — Initial Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- Safe to re-run (all statements are idempotent)
-- ============================================================

-- ── site_settings ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.site_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── services ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.services (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idx         TEXT,
  name        TEXT NOT NULL,
  category    TEXT,
  tech_pills  TEXT[],
  sort_order  INT NOT NULL DEFAULT 0,
  active      BOOLEAN NOT NULL DEFAULT true
);

-- ── projects ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  year        TEXT,
  tags        TEXT[],
  image_url   TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  active      BOOLEAN NOT NULL DEFAULT true
);

-- ── contacts ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contacts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  services    TEXT[],
  message     TEXT,
  status      TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_review', 'closed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── analytics_events ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event       TEXT NOT NULL,
  path        TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Row Level Security ────────────────────────────────────
ALTER TABLE public.site_settings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Drop policies first so the script is safe to re-run
DROP POLICY IF EXISTS "public_read_settings"   ON public.site_settings;
DROP POLICY IF EXISTS "public_read_services"   ON public.services;
DROP POLICY IF EXISTS "public_read_projects"   ON public.projects;
DROP POLICY IF EXISTS "public_insert_contacts" ON public.contacts;
DROP POLICY IF EXISTS "public_insert_analytics" ON public.analytics_events;

-- Public can read settings, active services, active projects
CREATE POLICY "public_read_settings"
  ON public.site_settings FOR SELECT USING (true);

CREATE POLICY "public_read_services"
  ON public.services FOR SELECT USING (active = true);

CREATE POLICY "public_read_projects"
  ON public.projects FOR SELECT USING (active = true);

-- Anyone can submit a contact form (no public read)
CREATE POLICY "public_insert_contacts"
  ON public.contacts FOR INSERT WITH CHECK (true);

-- Analytics: public insert only
CREATE POLICY "public_insert_analytics"
  ON public.analytics_events FOR INSERT WITH CHECK (true);

-- ── Seed: site_settings ───────────────────────────────────
-- Keys must match exactly what the code expects
INSERT INTO public.site_settings (key, value) VALUES
  ('site_name',          'nous.'),
  ('hero_line1',         'Engineered'),
  ('hero_line2',         'Intelligence'),
  ('hero_subtext_en',    'Transforming complex visions into intelligent systems and quiet luxury interfaces. We design and develop websites and apps that deliver true value, dedicating ourselves to excellence and embodying mastery in every detail.'),
  ('hero_subtext_ar',    'نحوّل الرؤى المعقدة إلى أنظمة ذكية وواجهات فاخرة. نصمم ونطور مواقع وتطبيقات تقدم قيمة حقيقية، ونكرس جهودنا لنمنحك التميز، مجسدين معاني الإتقان والإحسان في كل تفصيل.'),
  ('hero_location',      'Doha, Qatar · 2025'),
  ('hero_cta_primary',   'Initialize Project'),
  ('hero_cta_secondary', 'View Selected Works'),
  ('contact_email',      'nouslab@icould.com'),
  ('footer_location',    'Qatar · 2025'),
  ('footer_copyright',   '© 2025 Nous. All Rights Reserved.'),
  ('footer_badge',       'AN NOUS MASTERPIECE ✦ AN NOUS MASTERPIECE ✦ ')
ON CONFLICT (key) DO NOTHING;

-- ── Seed: services ────────────────────────────────────────
INSERT INTO public.services (idx, name, category, tech_pills, sort_order) VALUES
  ('01', 'Artificial Intelligence', 'ML · AI',        ARRAY['LLMs', 'RAG', 'TensorFlow', 'PyTorch', 'NLP', 'Agents'],             1),
  ('02', 'Full-Stack Engineering',  'Web · API',      ARRAY['React', 'Next.js', 'Node.js', 'Go', 'Python', 'PostgreSQL'],         2),
  ('03', 'Mobile Development',      'iOS · Android',  ARRAY['React Native', 'Swift', 'Flutter', 'Kotlin', 'PWA'],                 3),
  ('04', 'E-Commerce Solutions',    'Retail · SaaS',  ARRAY['Shopify', 'Headless', 'Stripe', 'WooCommerce', 'CRM'],              4),
  ('05', 'Cloud Infrastructure',    'DevOps · Scale', ARRAY['AWS', 'GCP', 'Docker', 'K8s', 'Terraform', 'CI/CD'],                5),
  ('06', 'Design & Motion',         'UX · Visual',    ARRAY['Figma', 'Framer', 'GSAP', 'Three.js', 'Motion Design'],             6)
ON CONFLICT DO NOTHING;

-- ── Seed: projects ────────────────────────────────────────
INSERT INTO public.projects (name, description, year, tags, sort_order) VALUES
  ('Azaya Studio',    'Premium Abaya E-Commerce Platform',     '2024', ARRAY['Fashion', 'Shopify', 'UX Design'],   1),
  ('Sandara',         'Arabic Leather Goods + Enterprise CRM', '2024', ARRAY['E-Commerce', 'CRM', 'Admin Portal'], 2),
  ('Hayati Wellness', 'Wellness & Body Products by Shopify',   '2025', ARRAY['Health', 'Shopify', 'Branding'],     3)
ON CONFLICT DO NOTHING;
