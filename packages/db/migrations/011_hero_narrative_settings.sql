-- ============================================================
-- Migration 011 — Bilingual hero narrative and evidence controls
-- Keeps English and Arabic editorial fields independent and gives the
-- homepage a calm/standard/off ambient-motion control.
-- ============================================================

INSERT INTO public.site_settings (key, value)
VALUES
  ('hero_eyebrow_en', 'Nous — Digital Systems / Doha'),
  ('hero_eyebrow_ar', 'نوس — أنظمة رقمية / الدوحة'),
  ('hero_headline_en', 'We make complex systems feel clear.'),
  ('hero_headline_ar', 'نحوّل التعقيد إلى أنظمة واضحة.'),
  ('hero_subtext_en', 'Strategy, software and intelligent products built by a senior Doha team—from first decision to live system.'),
  ('hero_subtext_ar', 'استراتيجية وبرمجيات ومنتجات ذكية يبنيها فريق خبير في الدوحة — من القرار الأول حتى النظام العامل.'),
  ('hero_location_en', 'Doha · Qatar'),
  ('hero_location_ar', 'الدوحة · قطر'),
  ('hero_cta_primary_en', 'Bring Us the Hard Problem'),
  ('hero_cta_primary_ar', 'اعرض علينا التحدّي'),
  ('hero_cta_secondary_en', 'See What Shipped'),
  ('hero_cta_secondary_ar', 'شاهد ما أنجزناه'),
  ('hero_motion_mode', 'standard'),
  ('hero_proof_1_value', 'Doha'),
  ('hero_proof_1_label_en', 'Senior team, based here'),
  ('hero_proof_1_label_ar', 'فريق خبير من الدوحة'),
  ('hero_proof_2_value', 'EN / AR'),
  ('hero_proof_2_label_en', 'Bilingual by design'),
  ('hero_proof_2_label_ar', 'ثنائي اللغة منذ التصميم'),
  ('hero_proof_3_value', '01 → Live'),
  ('hero_proof_3_label_en', 'Strategy through launch'),
  ('hero_proof_3_label_ar', 'من الاستراتيجية حتى الإطلاق')
ON CONFLICT (key) DO NOTHING;
