-- Editorial controls for the Living Logic homepage chapters and native Arabic testimonials.
alter table public.testimonials
  add column if not exists quote_ar text,
  add column if not exists author_ar text,
  add column if not exists role_ar text;

insert into public.site_settings (key, value) values
  ('about_title_en', 'Why Nous'),
  ('about_title_ar', 'لماذا نوس'),
  ('capabilities_label_en', '[ THE SYSTEMS ]'),
  ('capabilities_label_ar', '[ الأنظمة ]'),
  ('capabilities_title_en', 'What We Build'),
  ('capabilities_title_ar', 'ما نبنيه'),
  ('process_title_en', 'How the Work Moves'),
  ('process_title_ar', 'كيف يتحرّك العمل'),
  ('process_engagement_title_en', 'Engagement Shapes'),
  ('process_engagement_title_ar', 'أشكال التعاون'),
  ('works_label_en', '[ THE ARCHIVE ]'),
  ('works_label_ar', '[ الأرشيف ]'),
  ('works_title_en', 'Selected Work'),
  ('works_title_ar', 'أعمال مختارة'),
  ('testimonials_label_en', 'What clients experienced'),
  ('testimonials_label_ar', 'ما اختبره عملاؤنا'),
  ('testimonials_title_en', 'Signals from the Work'),
  ('testimonials_title_ar', 'أثر العمل'),
  ('faq_label_en', 'Before We Begin'),
  ('faq_label_ar', 'قبل أن نبدأ'),
  ('faq_title_en', 'Direct Answers'),
  ('faq_title_ar', 'إجابات مباشرة'),
  ('contact_title_en', 'Bring us the hard problem.'),
  ('contact_title_ar', 'اعرض علينا التحدّي.'),
  ('contact_cta_en', 'Start the Conversation'),
  ('contact_cta_ar', 'ابدأ الحوار'),
  ('contact_response_note_en', 'Reply within 24 hours'),
  ('contact_response_note_ar', 'نرد خلال ٢٤ ساعة')
on conflict (key) do nothing;
