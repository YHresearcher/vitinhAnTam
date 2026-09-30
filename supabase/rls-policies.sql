-- ==========================================
-- RLS POLICIES: VI TÍNH AN TÂM CRM
-- Chạy trong Supabase Dashboard → SQL Editor
-- Cho phép publishable/anon key đọc & ghi các bảng nghiệp vụ.
-- LƯU Ý: chính sách này mở hoàn toàn cho anon — phù hợp app nội bộ.
-- Khi lên production nên siết lại theo auth.uid()/role.
-- ==========================================

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'customers',
    'inventory_items',
    'spare_parts',
    'service_tickets',
    'onsite_dispatches',
    'shift_logs',
    'system_settings',
    'orders',
    'notifications'
  ]
  LOOP
    -- Bật RLS (an toàn khi chạy lặp lại)
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);

    -- Xóa policy cũ nếu có rồi tạo lại
    EXECUTE format('DROP POLICY IF EXISTS "anon_select_%s" ON %I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "anon_insert_%s" ON %I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "anon_update_%s" ON %I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "anon_delete_%s" ON %I', t, t);

    EXECUTE format(
      'CREATE POLICY "anon_select_%s" ON %I FOR SELECT TO anon, authenticated USING (true)', t, t);
    EXECUTE format(
      'CREATE POLICY "anon_insert_%s" ON %I FOR INSERT TO anon, authenticated WITH CHECK (true)', t, t);
    EXECUTE format(
      'CREATE POLICY "anon_update_%s" ON %I FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true)', t, t);
    EXECUTE format(
      'CREATE POLICY "anon_delete_%s" ON %I FOR DELETE TO anon, authenticated USING (true)', t, t);
  END LOOP;
END $$;
