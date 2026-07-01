-- Migration 003: Add business_pills column to services
-- Supports the Vision Toggle (Business View / Engineering View) in the
-- Fields of Mastery section. tech_pills = engineering stack, business_pills = outcomes.

ALTER TABLE services
  ADD COLUMN IF NOT EXISTS business_pills text[] DEFAULT '{}' NOT NULL;

-- Seed business pills for the default services (safe to run multiple times)
UPDATE services SET business_pills = ARRAY['Smarter Decisions', 'Automation', 'Predictive Insight', 'Cost Reduction']
  WHERE name = 'Artificial Intelligence' AND (business_pills IS NULL OR business_pills = '{}');

UPDATE services SET business_pills = ARRAY['Custom Portals', 'Fast Delivery', 'Zero Downtime', 'High Conversion']
  WHERE name = 'Full-Stack Engineering' AND (business_pills IS NULL OR business_pills = '{}');

UPDATE services SET business_pills = ARRAY['Reach More Users', 'Native Speed', 'Offline-Ready', 'App Store Ready']
  WHERE name = 'Mobile Development' AND (business_pills IS NULL OR business_pills = '{}');

UPDATE services SET business_pills = ARRAY['More Revenue', 'Loyal Customers', 'Seamless Checkout', 'Global Scale']
  WHERE name = 'E-Commerce Solutions' AND (business_pills IS NULL OR business_pills = '{}');

UPDATE services SET business_pills = ARRAY['Always On', 'Instant Scale', 'Secure by Design', 'Lower Costs']
  WHERE name = 'Cloud Infrastructure' AND (business_pills IS NULL OR business_pills = '{}');

UPDATE services SET business_pills = ARRAY['Memorable Brand', 'Clear Communication', 'Delight Users', 'Stand Out']
  WHERE name = 'Design & Motion' AND (business_pills IS NULL OR business_pills = '{}');
