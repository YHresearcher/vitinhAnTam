-- Đồng sáng lập (Vận hành) không được ghi bảng blog_posts ở tầng RLS —
-- mở rộng policy 2026-10-26 (vốn chặn outsourced/salesman): Bài viết & SEO
-- là trang chỉ Admin (proxy + sidebar đã chặn), policy này là lớp chặn cuối
-- cho mọi gọi API trực tiếp. JWT do /api/auth/supabase-token cấp mang claim
-- user_role = vai trò trong app; mọi vai trò khác vẫn ghi bình thường.
-- Service role bypass RLS nên các tác vụ server không bị ảnh hưởng.
-- CHƯA ÁP DỤNG LIVE — chỉ chạy khi owner duyệt (xem quy trình an toàn
-- supabase_live_sql_safety trước khi chạy).
DROP POLICY IF EXISTS "Allow insert/update/delete for app services" ON public.blog_posts;
CREATE POLICY "Allow insert/update/delete for app services" ON public.blog_posts
  FOR ALL TO authenticated
  USING ((auth.jwt() ->> 'user_role') NOT IN ('outsourced', 'salesman', 'co_founder'))
  WITH CHECK ((auth.jwt() ->> 'user_role') NOT IN ('outsourced', 'salesman', 'co_founder'));
