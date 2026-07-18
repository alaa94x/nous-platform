-- Mobile clarity pass: update only known legacy values so custom stakeholder
-- copy remains untouched. The admin portal exposes the same shorter defaults.
UPDATE public.site_settings
SET value = 'Bring Us Your Problem'
WHERE key = 'hero_cta_primary_en'
  AND value IN ('Bring Us the Hard Problem', 'Bring us the hard problem');

UPDATE public.site_settings
SET value = 'اعرض علينا مشكلتك'
WHERE key = 'hero_cta_primary_ar'
  AND value IN ('اعرض علينا التحدّي', 'اعرض علينا التحدي');

UPDATE public.site_settings
SET value = 'WhatsApp'
WHERE key = 'hero_cta_secondary_en'
  AND value IN ('Talk to us on WhatsApp', 'Talk To Us On WhatsApp', 'See What Shipped', 'View Selected Works');

UPDATE public.site_settings
SET value = 'واتساب'
WHERE key = 'hero_cta_secondary_ar'
  AND value IN ('تحدث معنا عبر واتساب', 'شاهد ما أنجزناه');

UPDATE public.site_settings
SET value = 'Tell us what you need.'
WHERE key = 'contact_title_en'
  AND value IN ('Bring us the hard problem.', 'Bring Us the Hard Problem');

UPDATE public.site_settings
SET value = 'أخبرنا بما تحتاجه.'
WHERE key = 'contact_title_ar'
  AND value IN ('اعرض علينا التحدّي.', 'اعرض علينا التحدي.');

UPDATE public.site_settings
SET value = 'Contact us'
WHERE key = 'contact_cta_en'
  AND value IN ('Start the Conversation', 'Start Your Build');

UPDATE public.site_settings
SET value = 'تواصل معنا'
WHERE key = 'contact_cta_ar'
  AND value IN ('ابدأ الحوار', 'ابدأ مشروعك');
