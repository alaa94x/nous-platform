-- Add url column to projects for linking to live client site
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS url TEXT;
