-- ============================================================================
-- SUPABASE MIGRATION: VI TÍNH AN TÂM — USERS & SYSTEM SETTINGS PERSISTENCE
-- Ngày: 04/10/2026
-- Hướng dẫn: Copy và dán toàn bộ nội dung script này vào
-- Supabase Dashboard -> SQL Editor -> Nhấn 'RUN' để thực thi.
-- ============================================================================

-- 1. CẬP NHẬT BẢNG USERS (TÀI KHOẢN HỆ THỐNG)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'technician',
  role_title TEXT,
  avatar_bg TEXT DEFAULT 'bg-slate-600',
  status TEXT NOT NULL DEFAULT 'active',
  permissions JSONB DEFAULT '{"can_edit_stock":false,"can_update_repair_status":false,"can_access_payroll":false,"can_manage_users":false}'::jsonb,
  password_hash TEXT,
  password_changed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_login TIMESTAMPTZ
);

-- Đảm bảo các cột quan trọng tồn tại nếu bảng đã được tạo từ trước
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'technician';
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_title TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_bg TEXT DEFAULT 'bg-slate-600';
ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{"can_edit_stock":false,"can_update_repair_status":false,"can_access_payroll":false,"can_manage_users":false}'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- 2. CẬP NHẬT BẢNG SYSTEM_SETTINGS (CẤU HÌNH HỆ THỐNG & ZALO BOT)
CREATE TABLE IF NOT EXISTS system_settings (
  id INT PRIMARY KEY DEFAULT 1,
  logo_url TEXT,
  logo_display_mode TEXT DEFAULT 'icon_with_text',
  favicon_url TEXT,
  brand_slogan TEXT,
  hotline TEXT,
  zalo_number TEXT,
  zalo_link TEXT,
  zalo_contacts JSONB DEFAULT '[]'::jsonb,
  whatsapp_number TEXT,
  whatsapp_link TEXT,
  email TEXT,
  address TEXT,
  street_address TEXT,
  district TEXT,
  city TEXT,
  service_areas TEXT,
  working_hours_weekday TEXT,
  working_hours_weekend TEXT,
  prime_hours TEXT,
  footer_about TEXT,
  footer_copyright TEXT,
  store_name TEXT,
  payment_qr_url TEXT,
  bank_name TEXT,
  bank_account_number TEXT,
  bank_account_name TEXT,
  payment_qr_note TEXT,
  bot_api_base_url TEXT,
  zalo_bot_token TEXT,
  zalo_bot_secret_token TEXT,
  zalo_default_chat_id TEXT,
  custom_webhook_url TEXT,
  notify_on_new_booking BOOLEAN DEFAULT true,
  notify_on_new_order BOOLEAN DEFAULT true,
  notify_on_new_ticket BOOLEAN DEFAULT true,
  notify_on_key_request BOOLEAN DEFAULT true,
  default_warranty_months INT DEFAULT 12,
  enable_customer_care_reminders BOOLEAN DEFAULT false,
  customer_care_reminder_chat_id TEXT,
  customer_care_reminder_intervals INT[] DEFAULT ARRAY[1, 6, 12],
  customer_care_reminder_message TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Thêm các cột còn thiếu vào system_settings
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS payment_qr_url TEXT;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS bank_account_number TEXT;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS bank_account_name TEXT;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS payment_qr_note TEXT;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS bot_api_base_url TEXT;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS zalo_bot_token TEXT;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS zalo_bot_secret_token TEXT;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS zalo_default_chat_id TEXT;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS custom_webhook_url TEXT;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS notify_on_new_booking BOOLEAN DEFAULT true;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS notify_on_new_order BOOLEAN DEFAULT true;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS notify_on_new_ticket BOOLEAN DEFAULT true;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS notify_on_key_request BOOLEAN DEFAULT true;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS default_warranty_months INT DEFAULT 12;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS enable_customer_care_reminders BOOLEAN DEFAULT false;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS customer_care_reminder_chat_id TEXT;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS customer_care_reminder_intervals INT[] DEFAULT ARRAY[1, 6, 12];
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS customer_care_reminder_message TEXT;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 3. THIẾT LẬP ROW LEVEL SECURITY (RLS)
-- Bảng system_settings: Cho phép cả anon và authenticated đọc & ghi (hệ thống nội bộ)
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_system_settings" ON system_settings;
DROP POLICY IF EXISTS "anon_insert_system_settings" ON system_settings;
DROP POLICY IF EXISTS "anon_update_system_settings" ON system_settings;
CREATE POLICY "anon_select_system_settings" ON system_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_system_settings" ON system_settings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_system_settings" ON system_settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Bảng users: Cho phép server (service_role) toàn quyền; và cho phép anon/authenticated đọc danh sách nhân sự (để hiển thị KTV phụ trách, email thông báo đơn)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_all_users" ON users;
DROP POLICY IF EXISTS "anon_read_users" ON users;
DROP POLICY IF EXISTS "anon_write_users" ON users;

CREATE POLICY "service_role_all_users" ON users FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "anon_read_users" ON users FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_write_users" ON users FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
