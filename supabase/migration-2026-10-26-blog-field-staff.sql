-- Chặn nhân viên hiện trường (KTV thuê ngoài, Salesman) ghi bảng blog_posts
-- ở tầng RLS — lớp chặn UI (sidebar + layout redirect) đã có, nhưng policy cũ
-- cho phép mọi tài khoản authenticated ghi (USING/WITH CHECK true), nên một
-- tài khoản hiện trường vẫn có thể ghi qua gọi API trực tiếp.
-- JWT do /api/auth/supabase-token cấp mang claim user_role = vai trò trong app,
-- policy dưới đây dựa vào claim đó: mọi vai trò khác vẫn ghi bình thường.
-- Service role bypass RLS nên các tác vụ server không bị ảnh hưởng.
DROP POLICY IF EXISTS "Allow insert/update/delete for app services" ON public.blog_posts;
CREATE POLICY "Allow insert/update/delete for app services" ON public.blog_posts
  FOR ALL TO authenticated
  USING ((auth.jwt() ->> 'user_role') NOT IN ('outsourced', 'salesman'))
  WITH CHECK ((auth.jwt() ->> 'user_role') NOT IN ('outsourced', 'salesman'));
