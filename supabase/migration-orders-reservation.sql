-- ==========================================
-- MIGRATION: Reservation (đơn giữ máy) + Đơn hàng website
-- Chạy một lần trong Supabase Dashboard → SQL Editor (an toàn chạy lặp lại)
-- ==========================================

-- 1. Cột reservation trên kho máy (dùng cho PendingSaleWidget & sync đơn hàng)
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS reserved_order_code TEXT;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS reserved_order_id TEXT;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS reserved_delivery_method TEXT;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS reserved_at TIMESTAMPTZ;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS reserved_note TEXT;

-- 2. Đảm bảo bảng orders tồn tại (nếu chưa chạy schema.sql mới)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT,
  device_name TEXT,
  device_tag TEXT,
  device_price NUMERIC DEFAULT 0,
  payment_method TEXT DEFAULT 'cash',
  delivery_method TEXT DEFAULT 'pickup',
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  confirmed_by TEXT,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Đảm bảo bảng notifications tồn tại
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'order',
  title TEXT NOT NULL,
  body TEXT,
  reference_id TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. RLS: cho phép anon/authenticated đọc-ghi orders & notifications
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_orders" ON orders;
DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
DROP POLICY IF EXISTS "anon_update_orders" ON orders;
DROP POLICY IF EXISTS "anon_delete_orders" ON orders;
CREATE POLICY "anon_select_orders" ON orders FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_orders" ON orders FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_orders" ON orders FOR DELETE TO anon, authenticated USING (true);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_notifications" ON notifications;
DROP POLICY IF EXISTS "anon_insert_notifications" ON notifications;
DROP POLICY IF EXISTS "anon_update_notifications" ON notifications;
DROP POLICY IF EXISTS "anon_delete_notifications" ON notifications;
CREATE POLICY "anon_select_notifications" ON notifications FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_notifications" ON notifications FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_notifications" ON notifications FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_notifications" ON notifications FOR DELETE TO anon, authenticated USING (true);

-- 5. RLS cho cột reservation trên inventory_items (bảng đã có policy từ rls-policies.sql;
--    nếu inventory_items chưa bật RLS thì chạy lại file supabase/rls-policies.sql)
