-- Living Field editorial controls replace the previous hero evidence table.
-- Legacy hero_proof_* settings are intentionally left intact for rollback and
-- historical data safety, but the current hero no longer renders them.

insert into public.site_settings (key, value) values
  ('hero_reveal_1_en', 'Find the signal.'),
  ('hero_reveal_1_ar', 'نجد الإشارة.'),
  ('hero_reveal_2_en', 'Shape the system.'),
  ('hero_reveal_2_ar', 'نصوغ النظام.'),
  ('hero_reveal_3_en', 'Make it live.'),
  ('hero_reveal_3_ar', 'نطلقه للحياة.'),
  ('hero_reveal_hint_en', 'Move through the field to reveal the signal'),
  ('hero_reveal_hint_ar', 'المس المجال لاكتشاف الإشارة')
on conflict (key) do nothing;
