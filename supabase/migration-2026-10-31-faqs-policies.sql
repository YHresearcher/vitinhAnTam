-- Quyen doc/ghi cho bang faqs (2026-10-31).
-- NGUYEN NHAN: RLS bat tren faqs nhung KHONG CO policy nao, nen trang chu
-- tieng Viet (doc qua anon key) tra ve rong du 4 dong van co trong bang.
-- Blog_posts co policy doc cong khai nen hien binh thuong.
-- FIX: mo 2 policy giong mau blog_posts. Idempotent: chay lai khong doi gi.
DROP POLICY IF EXISTS "Public can read faqs" ON public.faqs;
CREATE POLICY "Public can read faqs" ON public.faqs FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow insert/update/delete for app services" ON public.faqs;
CREATE POLICY "Allow insert/update/delete for app services" ON public.faqs FOR ALL TO authenticated USING (true) WITH CHECK (true);
