-- =========================================================
-- MIGRATION: BLOG CMS (Categories, Posts, SEO & Grounding)
-- Vi Tính An Tâm — Supabase Migration
-- =========================================================

-- 1. Create table blog_categories
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create table blog_posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL DEFAULT '',
  content_json JSONB,
  cover_image TEXT,
  category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  author_id TEXT,
  author_name TEXT DEFAULT 'Vi Tính An Tâm',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  
  -- SEO & Metadata
  meta_title TEXT,
  meta_description TEXT,
  focus_keyword TEXT,
  faq_schema JSONB DEFAULT '[]'::jsonb,
  
  -- Reading Metrics
  reading_time_minutes INTEGER DEFAULT 1,
  word_count INTEGER DEFAULT 0,
  
  -- Business Grounding & CRO
  related_inventory_ids TEXT[] DEFAULT '{}',
  service_cta_type TEXT DEFAULT 'spa_laptop',
  
  -- Metrics & Dates
  view_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Indexes for fast lookup & SEO
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_id ON blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies: Public read published posts, authenticated/anon full access based on app logic
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can read blog_categories' AND tablename = 'blog_categories') THEN
    CREATE POLICY "Public can read blog_categories" ON blog_categories FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can read published blog_posts' AND tablename = 'blog_posts') THEN
    CREATE POLICY "Public can read published blog_posts" ON blog_posts FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow insert/update/delete for app services' AND tablename = 'blog_posts') THEN
    CREATE POLICY "Allow insert/update/delete for app services" ON blog_posts FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow full control for categories' AND tablename = 'blog_categories') THEN
    CREATE POLICY "Allow full control for categories" ON blog_categories FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 6. Insert default categories
INSERT INTO blog_categories (name, slug, description)
VALUES 
  ('Thủ thuật & Hướng dẫn', 'thu-thuat-huong-dan', 'Mẹo sử dụng máy tính, khắc phục lỗi hệ điều hành và tối ưu hiệu suất'),
  ('Đánh giá phần cứng & Laptop', 'danh-gia-phan-cung', 'Phân tích chi tiết các dòng máy tính xách tay, linh kiện PC và phụ kiện'),
  ('Kinh nghiệm sửa chữa', 'kinh-nghiem-sua-chua', 'Chia sẻ kỹ thuật chẩn đoán và khắc phục sự cố phần cứng, cứu hộ dữ liệu'),
  ('Tin tức công nghệ', 'tin-tuc-cong-nghe', 'Cập nhật xu hướng công nghệ mới, bảo mật thông tin và giải pháp doanh nghiệp')
ON CONFLICT (slug) DO NOTHING;
