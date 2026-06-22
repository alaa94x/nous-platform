-- ============================================================
-- Migration 007 — Supabase Storage bucket for project images
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Create the bucket (public so URLs work without auth)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-images',
  'project-images',
  true,
  5242880,   -- 5 MB max (we compress client-side first, actual uploads ~300-800 KB)
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Public read (anyone can view images via URL)
DROP POLICY IF EXISTS "project_images_public_read" ON storage.objects;
CREATE POLICY "project_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-images');

-- Authenticated upload / update / delete (admin only)
DROP POLICY IF EXISTS "project_images_auth_insert" ON storage.objects;
CREATE POLICY "project_images_auth_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'project-images');

DROP POLICY IF EXISTS "project_images_auth_update" ON storage.objects;
CREATE POLICY "project_images_auth_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'project-images');

DROP POLICY IF EXISTS "project_images_auth_delete" ON storage.objects;
CREATE POLICY "project_images_auth_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'project-images');
