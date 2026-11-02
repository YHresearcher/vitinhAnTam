-- ============================================================
-- Vi Tinh An Tam — 2026-10-23 — Blog song ngu (phuong an 2):
-- them cot ban tieng Anh cho blog_posts + ten tieng Anh cho chuyen muc.
-- Ban Anh duoc dich 1 lan va luu co dinh (blog-en-1/2/3.sql).
-- ============================================================

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS title_en text,
  ADD COLUMN IF NOT EXISTS excerpt_en text,
  ADD COLUMN IF NOT EXISTS content_en text,
  ADD COLUMN IF NOT EXISTS meta_title_en text,
  ADD COLUMN IF NOT EXISTS meta_description_en text,
  ADD COLUMN IF NOT EXISTS faq_schema_en jsonb;

ALTER TABLE public.blog_categories
  ADD COLUMN IF NOT EXISTS name_en text;

UPDATE public.blog_categories SET name_en = 'Hardware & Laptop Reviews'
WHERE id = '9cd43b47-19ec-4050-bedc-c55439f4e23a';
UPDATE public.blog_categories SET name_en = 'Repair Experience'
WHERE id = 'c82fec61-48f5-4970-b296-73ac6c151e23';
UPDATE public.blog_categories SET name_en = 'Tips & Guides'
WHERE id = '18ca3f15-9ff7-471e-940b-f4bfc051f630';
UPDATE public.blog_categories SET name_en = 'Tech News'
WHERE id = '27093a1e-6ae9-4c23-993f-4fe3d81a506d';

-- Kiem tra:
SELECT name, name_en FROM public.blog_categories;
