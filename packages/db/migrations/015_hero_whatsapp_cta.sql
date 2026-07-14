-- Keep existing custom copy intact while moving the original proof CTA to WhatsApp.
UPDATE public.site_settings
SET value = 'Talk to us on WhatsApp'
WHERE key = 'hero_cta_secondary_en'
  AND value IN ('See What Shipped', 'View Selected Works');

UPDATE public.site_settings
SET value = 'تحدث معنا عبر واتساب'
WHERE key = 'hero_cta_secondary_ar'
  AND value = 'شاهد ما أنجزناه';
