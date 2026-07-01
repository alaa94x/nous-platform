-- Migration 004: Dual-view fields for Fields of Mastery section
-- Adds: name_tech_ar, business_tags, engineering_tags, business_subtext
-- Renames: business_pills → business_outcomes, tech_pills → engineering_stack (via new columns + copy)

ALTER TABLE services
  ADD COLUMN IF NOT EXISTS name_tech_ar      text          DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS business_tags     text[]        DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS engineering_tags  text[]        DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS business_subtext  text          DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS business_outcomes text[]        DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS engineering_stack text[]        DEFAULT '{}';

-- Copy existing data into new semantic columns
UPDATE services SET
  business_outcomes  = COALESCE(business_pills, '{}'),
  engineering_stack  = COALESCE(tech_pills, '{}');

-- Seed business_tags and engineering_tags per service (based on idx)
UPDATE services SET
  business_tags    = ARRAY['Experience', 'Automation'],
  engineering_tags = ARRAY['ML', 'AI']
WHERE idx = '01';

UPDATE services SET
  business_tags    = ARRAY['Growth', 'Conversion'],
  engineering_tags = ARRAY['Web', 'API']
WHERE idx = '02';

UPDATE services SET
  business_tags    = ARRAY['Reach', 'Engagement'],
  engineering_tags = ARRAY['iOS', 'Android']
WHERE idx = '03';

UPDATE services SET
  business_tags    = ARRAY['Revenue', 'Loyalty'],
  engineering_tags = ARRAY['Retail', 'SaaS']
WHERE idx = '04';

UPDATE services SET
  business_tags    = ARRAY['Reliability', 'Scale'],
  engineering_tags = ARRAY['DevOps', 'Cloud']
WHERE idx = '05';

UPDATE services SET
  business_tags    = ARRAY['Brand', 'Identity'],
  engineering_tags = ARRAY['UX', 'Visual']
WHERE idx = '06';
