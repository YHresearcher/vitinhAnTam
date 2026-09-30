-- ============================================================================
-- SUPABASE FULL SCHEMA & DATA SEED: VI TÍNH AN TÂM CRM
-- Tự động sinh đồng bộ toàn bộ bảng và dữ liệu từ mã nguồn.
-- Chạy toàn bộ file này 1 lần trong Supabase SQL Editor.
-- ============================================================================

-- Dọn dẹp các bảng cũ trước đó (giúp chuyển cột id từ UUID sang TEXT tương thích 100% không còn lỗi 22P02)
DROP TABLE IF EXISTS warranty_provisions CASCADE;
DROP TABLE IF EXISTS key_release_requests CASCADE;
DROP TABLE IF EXISTS license_keys CASCADE;
DROP TABLE IF EXISTS key_categories CASCADE;
DROP TABLE IF EXISTS key_email_templates CASCADE;
DROP TABLE IF EXISTS customer_reviews CASCADE;
DROP TABLE IF EXISTS faqs CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS shift_logs CASCADE;
DROP TABLE IF EXISTS onsite_dispatches CASCADE;
DROP TABLE IF EXISTS service_tickets CASCADE;
DROP TABLE IF EXISTS spare_parts CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. BẢNG THÀNH VIÊN NỘI BỘ & PHÂN QUYỀN (users)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'technician',
  role_title TEXT,
  avatar_bg TEXT DEFAULT 'bg-slate-600',
  status TEXT DEFAULT 'active',
  permissions JSONB DEFAULT '{}'::jsonb,
  password_hash TEXT,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. BẢNG KHÁCH HÀNG (customers)
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  customer_code TEXT,
  full_name TEXT NOT NULL,
  birth_date TEXT,
  phone TEXT UNIQUE NOT NULL,
  address TEXT,
  area_zone TEXT,
  customer_tier TEXT DEFAULT 'Standard',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. BẢNG KHO MÁY & SẢN PHẨM (inventory_items)
CREATE TABLE IF NOT EXISTS inventory_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  service_tag TEXT UNIQUE NOT NULL,
  device_model TEXT,
  model TEXT,
  brand TEXT NOT NULL DEFAULT 'Dell',
  form_factor TEXT DEFAULT 'SFF',
  specs JSONB DEFAULT '{}'::jsonb,
  specs_summary TEXT,
  cpu TEXT,
  ram TEXT,
  ssd_capacity TEXT,
  ssd_health INT DEFAULT 100,
  serial_number TEXT,
  qc_status TEXT DEFAULT 'pending_test',
  burn_in_duration INT DEFAULT 0,
  cost_price NUMERIC NOT NULL DEFAULT 0,
  import_price NUMERIC NOT NULL DEFAULT 0,
  import_date TEXT,
  retail_price NUMERIC NOT NULL DEFAULT 0,
  price NUMERIC NOT NULL DEFAULT 0,
  deposit_amount NUMERIC DEFAULT 0,
  warranty_months INT NOT NULL DEFAULT 12,
  stock_quantity INT NOT NULL DEFAULT 1,
  quantity INT NOT NULL DEFAULT 1,
  shelf_location TEXT NOT NULL DEFAULT 'Kệ A1',
  image_urls TEXT[] DEFAULT '{}',
  customer_name TEXT,
  customer_phone TEXT,
  customer_code TEXT,
  sold_by TEXT,
  handover_date TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. BẢNG KHO LINH KIỆN THAY THẾ (spare_parts)
CREATE TABLE IF NOT EXISTS spare_parts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  part_name TEXT NOT NULL,
  part_type TEXT NOT NULL,
  condition TEXT DEFAULT 'new',
  quantity_in_stock INT NOT NULL DEFAULT 0,
  warranty_months INT DEFAULT 36,
  distributor TEXT,
  unit_cost NUMERIC NOT NULL DEFAULT 0,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  shelf_location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. BẢNG PHIẾU DỊCH VỤ SỬA CHỮA & BẢO HÀNH (service_tickets)
CREATE TABLE IF NOT EXISTS service_tickets (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  ticket_code TEXT UNIQUE NOT NULL,
  customer_id TEXT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT,
  device_service_tag TEXT,
  service_tag TEXT,
  device_name TEXT,
  device_model TEXT,
  ticket_type TEXT DEFAULT 'counter',
  reception_mode TEXT DEFAULT 'counter',
  dispatch_address TEXT,
  technician_name TEXT DEFAULT 'KTV Trực ca',
  selected_services JSONB NOT NULL DEFAULT '[]'::jsonb,
  parts_used JSONB NOT NULL DEFAULT '[]'::jsonb,
  multi_tier_warranty JSONB NOT NULL DEFAULT '{}'::jsonb,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  estimated_cost NUMERIC DEFAULT 0,
  actual_cost NUMERIC DEFAULT 0,
  visual_condition TEXT,
  issue_description TEXT,
  "issueDescription" TEXT,
  inspection_photos TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'received',
  technician_note TEXT,
  service_category TEXT DEFAULT 'sua_chua',
  warranty_duration_months INT,
  estimated_completion TEXT,
  repair_deadline TEXT,
  warranty_deadline TEXT,
  completed_at TIMESTAMPTZ,
  warranty_until TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. BẢNG CỨU HỘ ONSITE (onsite_dispatches)
CREATE TABLE IF NOT EXISTS onsite_dispatches (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  area_zone TEXT NOT NULL,
  scheduled_time TEXT NOT NULL,
  distance_km NUMERIC DEFAULT 0,
  estimated_arrival_minutes INT DEFAULT 30,
  urgency TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'preparing',
  issue_summary TEXT,
  issue_description TEXT,
  technician_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. BẢNG CHẤM CÔNG & TIỀN CÔNG KTV (shift_logs)
CREATE TABLE IF NOT EXISTS shift_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  technician_name TEXT,
  ktv_name TEXT,
  ktv_role TEXT,
  shift_date DATE NOT NULL DEFAULT CURRENT_DATE,
  shift_name TEXT,
  shift_type TEXT DEFAULT 'full_day',
  base_wage NUMERIC NOT NULL DEFAULT 0,
  tickets_completed INT NOT NULL DEFAULT 0,
  commission_per_ticket NUMERIC DEFAULT 0,
  total_commission NUMERIC DEFAULT 0,
  bonus_amount NUMERIC DEFAULT 0,
  bonus NUMERIC DEFAULT 0,
  total_wage NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. BẢNG CẤU HÌNH DOANH NGHIỆP & HỆ THỐNG (system_settings)
CREATE TABLE IF NOT EXISTS system_settings (
  id INT PRIMARY KEY DEFAULT 1,
  logo_url TEXT,
  logo_display_mode TEXT DEFAULT 'icon_with_text',
  favicon_url TEXT,
  brand_slogan TEXT DEFAULT 'Bán bằng tâm để bạn an tâm',
  hotline TEXT DEFAULT '0909.053.058',
  zalo_number TEXT DEFAULT '0909053058',
  zalo_link TEXT DEFAULT 'https://zalo.me/0909053058',
  zalo_contacts JSONB DEFAULT '[]'::jsonb,
  whatsapp_number TEXT DEFAULT '0909053058',
  whatsapp_link TEXT DEFAULT 'https://wa.me/84909053058',
  email TEXT DEFAULT 'lienhe@vitinhantam.com',
  address TEXT DEFAULT '52 Nguyễn Cửu Vân, P. Long An, tỉnh Tây Ninh',
  street_address TEXT DEFAULT '52 Nguyễn Cửu Vân',
  district TEXT DEFAULT 'P. Long An',
  city TEXT DEFAULT 'Tây Ninh',
  service_areas TEXT DEFAULT 'Khu vực địa phương & các vùng lân cận',
  working_hours_weekday TEXT DEFAULT '08h00 - 17h30 (Hỗ trợ linh hoạt: 17h30 - 21h00)',
  working_hours_weekend TEXT DEFAULT '08h00 - 12h00 (Chiều hỗ trợ Onsite theo lịch hẹn)',
  prime_hours TEXT DEFAULT '17h30 - 21h00 (Khung giờ vàng cứu hộ)',
  footer_about TEXT,
  footer_copyright TEXT,
  store_name TEXT DEFAULT 'Vi Tính An Tâm',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. BẢNG CÂU HỎI THƯỜNG GẶP (faqs)
CREATE TABLE IF NOT EXISTS faqs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  icon TEXT DEFAULT 'HelpCircle',
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. BẢNG ĐÁNH GIÁ CỦA KHÁCH HÀNG (customer_reviews)
CREATE TABLE IF NOT EXISTS customer_reviews (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  role TEXT,
  comment TEXT NOT NULL,
  service TEXT,
  location TEXT,
  rating INT DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. BẢNG DANH MỤC KEY BẢN QUYỀN (key_categories)
CREATE TABLE IF NOT EXISTS key_categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'windows',
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. BẢNG KHO KEY BẢN QUYỀN (license_keys)
CREATE TABLE IF NOT EXISTS license_keys (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  category_id TEXT NOT NULL,
  category_name TEXT NOT NULL,
  license_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  assigned_to_customer TEXT,
  assigned_to_phone TEXT,
  assigned_at TIMESTAMPTZ,
  request_id TEXT,
  faulty_reason TEXT,
  release_request_id TEXT,
  import_price NUMERIC DEFAULT 0,
  unit_price NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  activated_at TIMESTAMPTZ
);

-- 13. BẢNG YÊU CẦU CẤP PHÁT KEY (key_release_requests)
CREATE TABLE IF NOT EXISTS key_release_requests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  request_code TEXT UNIQUE NOT NULL,
  requester_id TEXT,
  requester_name TEXT NOT NULL,
  requester_role TEXT NOT NULL DEFAULT 'technician',
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  category_id TEXT NOT NULL,
  category_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  assigned_key_id TEXT,
  assigned_key_code TEXT,
  released_key_id TEXT,
  admin_note TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- 14. BẢNG MẪU EMAIL BÀN GIAO KEY (key_email_templates)
CREATE TABLE IF NOT EXISTS key_email_templates (
  id INT PRIMARY KEY DEFAULT 1,
  subject TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  reply_to TEXT NOT NULL,
  header_title TEXT NOT NULL,
  support_hotline TEXT NOT NULL,
  support_zalo TEXT NOT NULL,
  body_intro TEXT NOT NULL,
  instructions_windows TEXT NOT NULL,
  instructions_office TEXT NOT NULL,
  footer_text TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 15. BẢNG QUỸ DỰ PHÒNG BẢO HÀNH 5% (warranty_provisions)
CREATE TABLE IF NOT EXISTS warranty_provisions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  item_id TEXT NOT NULL,
  item_type TEXT NOT NULL DEFAULT 'machine',
  item_title TEXT NOT NULL,
  serial_number TEXT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_code TEXT,
  seller_name TEXT,
  sale_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  warranty_months INT NOT NULL DEFAULT 12,
  warranty_expiry_date TIMESTAMPTZ NOT NULL,
  sale_price NUMERIC NOT NULL DEFAULT 0,
  cost_price NUMERIC NOT NULL DEFAULT 0,
  net_profit NUMERIC NOT NULL DEFAULT 0,
  provision_rate NUMERIC NOT NULL DEFAULT 0.05,
  provision_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'locked',
  approved_at TIMESTAMPTZ,
  approved_by TEXT,
  unlocked_at TIMESTAMPTZ,
  settled_at TIMESTAMPTZ,
  settlement_year INT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- MIGRATION CHO CÁC BẢNG NẾU ĐÃ TỒN TẠI (ALTER ADD COLUMN IF NOT EXISTS)
-- ============================================================================
ALTER TABLE customers ADD COLUMN IF NOT EXISTS customer_code TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS birth_date TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS device_model TEXT;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS specs JSONB DEFAULT '{}'::jsonb;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS specs_summary TEXT;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS cpu TEXT;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS ram TEXT;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS ssd_capacity TEXT;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS ssd_health INT DEFAULT 100;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS serial_number TEXT;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS import_price NUMERIC DEFAULT 0;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS import_date TEXT;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS stock_quantity INT NOT NULL DEFAULT 1;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS customer_code TEXT;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS sold_by TEXT;
ALTER TABLE inventory_items ALTER COLUMN device_model DROP NOT NULL;
ALTER TABLE inventory_items ALTER COLUMN warranty_months SET NOT NULL;
ALTER TABLE inventory_items ALTER COLUMN shelf_location SET NOT NULL;

ALTER TABLE spare_parts ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'new';
ALTER TABLE spare_parts ADD COLUMN IF NOT EXISTS shelf_location TEXT;
ALTER TABLE spare_parts ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE service_tickets ADD COLUMN IF NOT EXISTS service_tag TEXT;
ALTER TABLE service_tickets ADD COLUMN IF NOT EXISTS device_model TEXT;
ALTER TABLE service_tickets ADD COLUMN IF NOT EXISTS ticket_type TEXT DEFAULT 'counter';
ALTER TABLE service_tickets ADD COLUMN IF NOT EXISTS parts_used JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE service_tickets ADD COLUMN IF NOT EXISTS estimated_cost NUMERIC DEFAULT 0;
ALTER TABLE service_tickets ADD COLUMN IF NOT EXISTS actual_cost NUMERIC DEFAULT 0;
ALTER TABLE service_tickets ADD COLUMN IF NOT EXISTS "issueDescription" TEXT;
ALTER TABLE service_tickets ADD COLUMN IF NOT EXISTS service_category TEXT DEFAULT 'sua_chua';
ALTER TABLE service_tickets ADD COLUMN IF NOT EXISTS warranty_duration_months INT;
ALTER TABLE service_tickets ADD COLUMN IF NOT EXISTS repair_deadline TEXT;
ALTER TABLE service_tickets ADD COLUMN IF NOT EXISTS warranty_deadline TEXT;
ALTER TABLE service_tickets ADD COLUMN IF NOT EXISTS warranty_until TEXT;
ALTER TABLE service_tickets ALTER COLUMN device_name DROP NOT NULL;
ALTER TABLE service_tickets ALTER COLUMN selected_services SET DEFAULT '[]'::jsonb;
ALTER TABLE service_tickets ALTER COLUMN multi_tier_warranty SET DEFAULT '{}'::jsonb;

ALTER TABLE onsite_dispatches ADD COLUMN IF NOT EXISTS distance_km NUMERIC DEFAULT 0;
ALTER TABLE onsite_dispatches ADD COLUMN IF NOT EXISTS estimated_arrival_minutes INT DEFAULT 30;
ALTER TABLE onsite_dispatches ADD COLUMN IF NOT EXISTS issue_summary TEXT;

-- ============================================================================
-- CẤU HÌNH BẢO MẬT & QUYỀN TRUY CẬP (RLS)
-- Tắt RLS để kết nối từ Anon Key đọc/ghi suôn sẻ không bị mã lỗi 42501
-- ============================================================================
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE spare_parts DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE onsite_dispatches DISABLE ROW LEVEL SECURITY;
ALTER TABLE shift_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE faqs DISABLE ROW LEVEL SECURITY;
ALTER TABLE customer_reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE key_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE license_keys DISABLE ROW LEVEL SECURITY;
ALTER TABLE key_release_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE key_email_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_provisions DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- DỮ LIỆU MẪU BAN ĐẦU (SEED DATA - AN TOÀN KHÔNG BỊ TRÙNG LẶP ON CONFLICT)
-- ============================================================================

-- 1. SEED THÀNH VIÊN NỘI BỘ
INSERT INTO users (id, username, name, email, phone, role, role_title, avatar_bg, status, permissions)
VALUES
  ('u-admin-1', 'thanhphan', 'Thanh Phan', 'thanhphan@vitinhantam.com', '0909.053.058', 'admin', 'Quản trị viên (Admin)', 'bg-blue-600', 'active', '{"can_edit_stock": true, "can_update_repair_status": true, "can_access_payroll": true, "can_manage_users": true}'::jsonb),
  ('u-sales-1', 'sales01', 'Sales 01', 'sales01@vitinhantam.com', '0933.345.678', 'sales', 'Chuyên viên Bán hàng & CSKH', 'bg-purple-600', 'active', '{"can_edit_stock": false, "can_update_repair_status": false, "can_access_payroll": false, "can_manage_users": false}'::jsonb),
  ('u-tech-1', 'tech01', 'Kỹ thuật viên 01', 'tech01@vitinhantam.com', '0977.123.456', 'technician', 'Kỹ thuật viên phần cứng & QC', 'bg-emerald-600', 'active', '{"can_edit_stock": false, "can_update_repair_status": true, "can_access_payroll": false, "can_manage_users": false}'::jsonb),
  ('u-outsourced-1', 'ktv_ngoai01', 'Trần Văn Cường (KTV Thuê Ngoài)', 'cuong.ktvngoai@vitinhantam.com', '0988.765.432', 'outsourced', 'Kỹ thuật viên đối tác / Thuê ngoài', 'bg-amber-600', 'active', '{"can_edit_stock": false, "can_update_repair_status": true, "can_access_payroll": false, "can_manage_users": false}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 2. SEED CẤU HÌNH HỆ THỐNG
INSERT INTO system_settings (id, brand_slogan, hotline, zalo_number, zalo_link, whatsapp_number, whatsapp_link, email, address, street_address, district, city, service_areas, working_hours_weekday, working_hours_weekend, prime_hours, store_name, zalo_contacts)
VALUES (
  1,
  'Bán bằng tâm để bạn an tâm',
  '0909.053.058',
  '0909053058',
  'https://zalo.me/0909053058',
  '0909053058',
  'https://wa.me/84909053058',
  'lienhe@vitinhantam.com',
  '52 Nguyễn Cửu Vân, P. Long An, tỉnh Tây Ninh',
  '52 Nguyễn Cửu Vân',
  'P. Long An',
  'Tây Ninh',
  'Khu vực địa phương & các vùng lân cận',
  '08h00 - 17h30 (Hỗ trợ linh hoạt: 17h30 - 21h00)',
  '08h00 - 12h00 (Chiều hỗ trợ Onsite theo lịch hẹn)',
  '17h30 - 21h00 (Khung giờ vàng cứu hộ)',
  'Vi Tính An Tâm',
  '[{"id":"zalo-1","name":"Kỹ Thuật 1","phone":"123456","role":"Tư vấn bán hàng & cấu hình máy"},{"id":"zalo-2","name":"Kỹ Thuật 2","phone":"345678","role":"Hỗ trợ phần cứng & bảo hành"},{"id":"zalo-3","name":"Kỹ Thuật 3","phone":"678910","role":"Cứu hộ khẩn cấp & key bản quyền"}]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  brand_slogan = EXCLUDED.brand_slogan,
  hotline = EXCLUDED.hotline,
  zalo_number = EXCLUDED.zalo_number,
  zalo_link = EXCLUDED.zalo_link,
  email = EXCLUDED.email,
  address = EXCLUDED.address,
  updated_at = now();

-- 3. SEED MẪU EMAIL CẤP KEY
INSERT INTO key_email_templates (id, subject, sender_name, reply_to, header_title, support_hotline, support_zalo, body_intro, instructions_windows, instructions_office, footer_text)
VALUES (
  1,
  'Bàn Giao Key Bản Quyền Chính Hãng — Vi Tính An Tâm',
  'Vi Tính An Tâm — Bộ Phận Bản Quyền',
  'lienhe@vitinhantam.com',
  'XÁC NHẬN BÀN GIAO KEY BẢN QUYỀN CHÍNH HÃNG',
  '0909.053.058',
  '0909053058',
  'Kính gửi Quý khách hàng, Vi Tính An Tâm xin gửi thông tin mã bản quyền chính hãng đã được kích hoạt thành công cho thiết bị của quý khách:',
  'Vào Cài đặt (Settings) -> Kích hoạt (Activation) -> Thay đổi mã khóa (Change product key) -> Dán key và chọn Kích hoạt.',
  'Mở ứng dụng Word hoặc Excel -> Chọn Tài khoản (Account) -> Thay đổi giấy phép (Change License) -> Nhập key -> Xác nhận kích hoạt qua Internet.',
  'Cảm ơn Quý khách đã tin tưởng và sử dụng dịch vụ của Vi Tính An Tâm. Mọi thắc mắc kỹ thuật vui lòng liên hệ hotline 0909.053.058 để được hỗ trợ tức thì.'
)
ON CONFLICT (id) DO NOTHING;

-- 4. SEED DANH MỤC KEY BẢN QUYỀN
INSERT INTO key_categories (id, name, type, description, is_default)
VALUES
  ('cat-win-pro', 'WINDOWS 11 PROFESSIONAL', 'windows', 'Key kích hoạt số vĩnh viễn gắn mainboard theo mã phần cứng, hỗ trợ cập nhật trọn đời.', true),
  ('cat-win-home', 'WINDOWS 11 HOME', 'windows', 'Bản quyền số dành cho người dùng cá nhân & laptop gia đình.', true),
  ('cat-off-pro-21', 'OFFICE PRO PLUS 2021', 'office', 'Kích hoạt vĩnh viễn Word, Excel, PowerPoint, Outlook, Access 2021 trọn bộ.', true),
  ('cat-off-365', 'MICROSOFT 365 FAMILY / PERSONAL', 'office', 'Gói bản quyền thuê bao 12 tháng kèm 1TB OneDrive đám mây.', true),
  ('cat-kaspersky', 'KASPERSKY PLUS / PREMIUM', 'others', 'Bản quyền phần mềm diệt virus bảo vệ thanh toán trực tuyến và mã hóa dữ liệu.', true)
ON CONFLICT (id) DO NOTHING;

-- 5. SEED KHÁCH HÀNG
INSERT INTO customers (id, customer_code, full_name, phone, address, area_zone, customer_tier, notes)
VALUES
  ('c1', '15059080', 'Anh Minh (Cty May Mặc Tân An)', '0918421908', '42 Hùng Vương, P.2, Tân An', 'P.2 Tân An', 'VIP', 'Khách dự án văn phòng, thường mua số lượng máy bộ mini'),
  ('c2', '22049977', 'Chú Bảy (Tạp hoá Tân Tây)', '0908889977', 'Ngã 3 Thủ Thừa, TT. Thủ Thừa', 'TT. Thủ Thừa', 'Thân thiết', 'Máy tính quầy thu ngân tính tiền, ưu tiên cứu hộ nhanh'),
  ('c3', '03084578', 'Anh Hoàng (Đại lý VLXD Tân An)', '0903124578', 'QL1A, P.5, Tân An', 'P.5 Tân An', 'Standard', 'Sử dụng phần mềm bán hàng MISA, bảo hành chu đáo'),
  ('c4', '18091234', 'Chị Ngọc Mai (Tiệm Vàng Kim Mai)', '0913981234', 'Chợ Thủ Thừa, Long An', 'TT. Thủ Thừa', 'VIP', 'Yêu cầu độ bảo mật cao, camera và máy tính lưu trữ tốt'),
  ('c5', '10109101', 'Trường Tiểu Học Hướng Thọ Phú', '02723829101', 'Xã Hướng Thọ Phú, Tân An', 'Tân An', 'VIP', 'Hợp đồng bảo trì định kỳ phòng máy giáo viên và học sinh')
ON CONFLICT (id) DO NOTHING;

-- 6. SEED KHO MÁY & SẢN PHẨM TRƯNG BÀY (inventory_items - Toàn bộ máy sẵn có và máy đã bán bàn giao)
INSERT INTO inventory_items (id, service_tag, device_model, model, brand, form_factor, specs, specs_summary, cpu, ram, ssd_capacity, ssd_health, serial_number, qc_status, burn_in_duration, cost_price, import_price, retail_price, price, warranty_months, stock_quantity, quantity, shelf_location, image_urls, customer_name, customer_phone, handover_date)
VALUES
  ('inv-hp-400g5', 'HP-400G5M', 'HP ProDesk 400 G5 Mini (Siêu Nhỏ Gọn)', 'HP ProDesk 400 G5 Mini', 'HP', 'Mini', 
   '{"cpu": "Core i5-8500T (Tiết kiệm điện, mát máy)", "ram": "RAM 8GB DDR4 (Hỗ trợ nâng lên 32GB)", "ssd": "SSD M.2 NVMe 256GB Siêu Tốc (Mới BH 36T)", "ssd_health": 100, "highlight": "Có Wi-Fi AC + Bluetooth bắt sóng xa", "gift": "Tặng combo phím chuột văn phòng mới", "badge": "TIẾT KIỆM ĐIỆN 65W", "subBadge": "Nhỏ như quyển sổ tay", "desc": "Gọn gàng trên bàn làm việc, tích hợp sẵn Wi-Fi + Bluetooth."}'::jsonb, 
   'Core i5-8500T / 8GB / 256GB NVMe / Wi-Fi', 'Core i5-8500T', '8GB DDR4', '256GB NVMe', 100, 'SN-400G5-8500T-01', 'ready_to_sell', 30, 3200000, 3200000, 4350000, 4350000, 12, 5, 5, 'Kệ A1 - Tầng 2', 
   '{"https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80"}', NULL, NULL, NULL),

  ('inv-tp-t480s', 'TP-994L2A', 'Lenovo ThinkPad T480s (Doanh Nhân Vỏ Carbon)', 'Lenovo ThinkPad T480s', 'Lenovo', 'Laptop', 
   '{"cpu": "Core i5-8350U vPro (Bảo mật phần cứng)", "ram": "RAM 16GB DDR4 2400MHz", "ssd": "SSD NVMe 256GB Tốc độ cao (Mới BH 36T)", "ssd_health": 98, "highlight": "Màn hình 14.0 inch Full HD IPS chống chói", "gift": "Tặng túi chống sốc cao cấp + Chuột quang", "badge": "CHUẨN ĐỘ BỀN QUÂN ĐỘI", "subBadge": "Pin 4-6h liên tục", "desc": "Khung magie siêu bền 1.3kg, bàn phím gõ êm số 1 thế giới."}'::jsonb, 
   'Core i5-8350U / 16GB / 256GB NVMe / 14" FHD IPS', 'Core i5-8350U', '16GB DDR4', '256GB NVMe', 98, 'SN-T480S-994L2A', 'ready_to_sell', 60, 5200000, 5200000, 6850000, 6850000, 12, 3, 3, 'Kệ Laptop L1', 
   '{"https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80"}', NULL, NULL, NULL),

  ('inv-dl-7490', 'DL-7490A1', 'Dell Latitude 7490 Nhôm Nguyên Khối', 'Dell Latitude 7490', 'Dell', 'Laptop', 
   '{"cpu": "Core i5-8350U (4 nhân 8 luồng upto 3.60GHz)", "ram": "RAM 8GB DDR4 (Lên 16GB +400k)", "ssd": "SSD M.2 256GB (Khởi động máy 5 giây)", "ssd_health": 100, "highlight": "Bàn phím có đèn LED nền làm việc ban đêm", "gift": "Balo chống nước An Tâm + Sạc Oval zin", "badge": "VIỀN MÀN HÌNH SIÊU MỎNG", "subBadge": "Nhẹ 1.4kg", "desc": "Vỏ hợp kim Carbon đen mờ sang trọng, mở rộng góc 180 độ."}'::jsonb, 
   'Core i5-8350U / 8GB / 256GB SSD / Led phím', 'Core i5-8350U', '8GB DDR4', '256GB SSD', 100, 'SN-7490-A1-0982', 'ready_to_sell', 40, 4500000, 4500000, 5950000, 5950000, 12, 2, 2, 'Tủ bảo quản kỹ thuật D1', 
   '{"https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80"}', NULL, NULL, NULL),

  ('inv-ws-t3620', 'WS-T3620', 'Dell Precision Tower 3620 Workstation', 'Dell Precision 3620', 'Dell', 'MT', 
   '{"cpu": "Intel Xeon E3-1240 v5 / Core i7-6700", "ram": "RAM 16GB DDR4 ECC Tự Sửa Lỗi", "ssd": "SSD 256GB + HDD 1TB Lưu Trữ Dữ Liệu Lớn", "ssd_health": 100, "highlight": "Card rời NVIDIA Quadro Render 24/24", "gift": "Cài đặt miễn phí bộ Adobe, CAD bản quyền ổn định", "badge": "ĐỒ HỌA CHUYÊN NGHIỆP", "subBadge": "Nguồn 80 Plus Gold", "desc": "Chuyên trị AutoCAD, Revit, SketchUp, Photoshop mượt mà."}'::jsonb, 
   'Xeon E3-1240 v5 / 16GB ECC / 256GB + 1TB / Quadro', 'Xeon E3-1240 v5', '16GB DDR4 ECC', '256GB + 1TB', 100, 'SN-T3620-WS-001', 'ready_to_sell', 90, 6000000, 6000000, 7850000, 7850000, 12, 1, 1, 'Khu vực kiểm tra kỹ thuật E', 
   '{"https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&auto=format&fit=crop&q=80"}', NULL, NULL, NULL),

  ('inv-dell-3670', 'DELL-3670-MT', 'Dell Vostro 3670 MT (Core i7 Đa Nhiệm)', 'Dell Vostro 3670 MT', 'Dell', 'MT', 
   '{"cpu": "Core i7-8700 (6 nhân 12 luồng Turbo 4.6GHz)", "ram": "RAM 16GB DDR4 Kênh Đôi", "ssd": "SSD 512GB NVMe Mới 100% (BH 36T)", "ssd_health": 100, "highlight": "Card đồ họa rời GTX 1050Ti 4GB GDDR5", "gift": "Combo phím chuột giả cơ + Lót chuột lớn", "badge": "HIỆU NĂNG CAO CẤP", "subBadge": "Thùng máy tản nhiệt êm", "desc": "Xử lý mượt mà tác vụ văn phòng nặng, xuất nhiều màn hình cùng lúc."}'::jsonb, 
   'Core i7-8700 / 16GB / 512GB NVMe / GTX 1050Ti', 'Core i7-8700', '16GB DDR4', '512GB NVMe', 100, 'SN-3670MT-8700-01', 'ready_to_sell', 45, 5800000, 5800000, 7500000, 7500000, 12, 2, 2, 'Kệ Kiểm Thử C1', 
   '{"https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&auto=format&fit=crop&q=80"}', NULL, NULL, NULL),

  ('inv-asus-ux3402', 'NB-ASUS-2024', 'Asus Zenbook 14 OLED UX3402', 'Asus Zenbook 14 OLED', 'Asus', 'Laptop', 
   '{"cpu": "Core i5-1240P (12 nhân 16 luồng thế hệ mới)", "ram": "RAM 16GB LPDDR5 4800MHz Siêu Nhanh", "ssd": "SSD 512GB PCIe 4.0 NVMe Tốc Độ Cao", "ssd_health": 96, "highlight": "Màn hình OLED 2.8K sắc nét bảo vệ mắt", "gift": "Bao da chính hãng + Chuột Bluetooth", "badge": "MÀN HÌNH 2.8K OLED 90HZ", "subBadge": "Siêu mỏng nhẹ 1.39kg", "desc": "Màn hình màu 100% DCI-P3 chuẩn điện ảnh, vỏ nhôm xanh sang trọng."}'::jsonb, 
   'Core i5-1240P / 16GB LPDDR5 / 512GB / OLED 2.8K', 'Core i5-1240P', '16GB LPDDR5', '512GB NVMe', 96, 'SN-ASUS-UX3402-09', 'ready_to_sell', 45, 11000000, 11000000, 13500000, 13500000, 12, 1, 1, 'Kệ Laptop L2', 
   '{"https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80"}', NULL, NULL, NULL),

  -- MÁY ĐÃ BÀN GIAO THỰC TẾ (LƯU TRỮ VÀ TRA CỨU BẢO HÀNH)
  ('inv-sold-st8f', 'ST-8F4K92X', 'Dell OptiPlex 7060 SFF Đồng Bộ', 'Dell OptiPlex 7060 SFF', 'Dell', 'SFF', 
   '{"cpu": "Core i5-8500 (6 nhân 6 luồng 4.10GHz)", "ram": "RAM 16GB DDR4 Bus 2666", "ssd": "SSD NVMe 256GB Kingston Mới 100%", "ssd_health": 100, "highlight": "Hợp đồng bảo trì định kỳ 10 máy OptiPlex", "gift": "Kèm màn hình Dell 24\" & bộ phím chuột đồng bộ", "badge": "ĐÃ BÀN GIAO TẬN NƠI", "subBadge": "Bảo hành chu đáo, đổi nhanh", "desc": "Đã hoàn tất bàn giao và lắp đặt mạng LAN cho bộ phận văn phòng."}'::jsonb, 
   'Core i5-8500 / 16GB / 256GB NVMe', 'Core i5-8500', '16GB DDR4', '256GB NVMe', 100, 'SN-7060-8F4K92X', 'sold', 45, 3800000, 3800000, 4950000, 4950000, 12, 0, 0, 'Đã bàn giao khách hàng', 
   '{"https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=800&auto=format&fit=crop&q=80"}', 'Cty TNHH Vận Tải Long An (Anh Tuấn)', '0918234891', '15/05/2025'),

  ('inv-sold-pc9921', 'PC-GAMING-9921', 'PC Gaming & Đồ Họa Core i5 13400F', 'PC Gaming Core i5 13400F', 'Khác', 'MT', 
   '{"cpu": "Core i5-13400F (10C/16T Turbo 4.6GHz)", "ram": "RAM 32GB DDR4 Bus 3200 Tản Thép", "ssd": "SSD NVMe 512GB Kingston NV2 Gen4", "ssd_health": 100, "highlight": "Card rời RTX 3060 12GB GDDR6 Dual Fan", "gift": "Nguồn Xigmatek 650W 80 Plus + Vỏ case kính", "badge": "ĐÃ GIAO KHÁCH HÀNG", "subBadge": "Bảo hành 24 tháng", "desc": "Bộ PC dựng hình AutoCAD và render video cho văn phòng gia đình."}'::jsonb, 
   'Core i5-13400F / 32GB / 512GB / RTX 3060 12GB', 'Core i5-13400F', '32GB DDR4', '512GB NVMe', 100, 'SN-GAMING-13400-01', 'sold', 60, 13500000, 13500000, 16800000, 16800000, 24, 0, 0, 'Đã bàn giao khách hàng', 
   '{"https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80"}', 'Nguyễn Văn Bảy (Chú Bảy Tân An)', '0918234567', '20/04/2025'),

  ('inv-sold-hp840', 'HP-840G5-HQ', 'HP EliteBook 840 G5 Vỏ Nhôm Bạc', 'HP EliteBook 840 G5', 'HP', 'Laptop', 
   '{"cpu": "Core i5-8250U (4 nhân 8 luồng)", "ram": "RAM 16GB DDR4 Kênh Đôi", "ssd": "SSD 256GB M.2 NVMe Siêu Bền", "ssd_health": 98, "highlight": "Màn hình 14.0\" Full HD IPS chống chói", "gift": "Dock chuyển đổi Type-C + Cặp da cao cấp", "badge": "ĐÃ BÀN GIAO DOANH NGHIỆP", "subBadge": "Hóa đơn VAT đầy đủ", "desc": "Máy làm việc cơ động cho kỹ sư công trình, bàn phím gõ êm nhẹ."}'::jsonb, 
   'Core i5-8250U / 16GB / 256GB SSD / 14" FHD IPS', 'Core i5-8250U', '16GB DDR4', '256GB SSD', 98, 'SN-840G5-HQ-0991', 'sold', 45, 4800000, 4800000, 6200000, 6200000, 12, 0, 0, 'Đã bàn giao khách hàng', 
   '{"https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80"}', 'Cty Thiết Kế Hoàng Quân (Anh Quân)', '0909112233', '02/05/2025'),

  ('inv-sold-hp400g4', 'HP-400G4-POS', 'HP ProDesk 400 G4 Mini (Máy Tính Tiền POS)', 'HP ProDesk 400 G4 Mini', 'HP', 'Mini', 
   '{"cpu": "Core i3-7100T (Tiết kiệm điện 35W)", "ram": "RAM 8GB DDR4 Bus 2400", "ssd": "SSD 128GB NVMe + HDD 500GB", "ssd_health": 97, "highlight": "Lắp gọn sau lưng màn hình POS", "gift": "KTV hỗ trợ đấu nối máy in nhiệt & quét mã vạch", "badge": "ĐÃ LẮP ĐẶT TẬN NƠI", "subBadge": "Cài sẵn KiotViet & MISA", "desc": "Hệ thống bán hàng chạy 24/7 ổn định, kích thước siêu nhỏ gọn."}'::jsonb, 
   'Core i3-7100T / 8GB / 128GB SSD + 500GB HDD', 'Core i3-7100T', '8GB DDR4', '128GB SSD', 97, 'SN-400G4-POS-LAN', 'sold', 30, 2500000, 2500000, 3450000, 3450000, 12, 0, 0, 'Đã bàn giao khách hàng', 
   '{"https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80"}', 'Chị Lan - Tạp hoá Tân Tây', '0908889977', '18/05/2025'),

  ('inv-len-m720q', 'LEN-M720Q-01', 'Lenovo ThinkCentre M720q Tiny', 'Lenovo ThinkCentre M720q Tiny', 'Lenovo', 'Mini', 
   '{"cpu": "Intel Core i5-8400T (6 nhân)", "ram": "8GB DDR4 Bus 2666", "ssd": "SSD 256GB NVMe", "ssd_health": 99, "badge": "SIÊU BỀN TIẾT KIỆM ĐIỆN", "subBadge": "Bảo hành 12 tháng", "desc": "Máy bộ tí hon chuyên văn phòng, quầy lễ tân, xuất 2 màn hình nét căng."}'::jsonb, 
   'Core i5-8400T / 8GB / 256GB NVMe', 'Core i5-8400T', '8GB DDR4', '256GB NVMe', 99, 'SN-M720Q-8400T-01', 'ready_to_sell', 120, 3600000, 3600000, 4900000, 4900000, 12, 4, 4, 'Kệ B2 - Tầng 2', 
   '{"https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=400&q=80"}', NULL, NULL, NULL),

  ('inv-dell-p3630', 'DELL-P3630-TWR', 'Dell Precision 3630 Tower', 'Dell Precision 3630 Tower', 'Dell', 'MT', 
   '{"cpu": "Intel Core i7-8700 (6 nhân 12 luồng)", "ram": "32GB DDR4 Bus 2666", "ssd": "SSD 512GB NVMe + HDD 1TB", "ssd_health": 100, "badge": "WORKSTATION ĐỒ HỌA NẶNG", "subBadge": "Bảo hành 12 tháng", "desc": "Trạm làm việc chuyên render 3D, dựng phim và tính toán kỹ thuật nặng."}'::jsonb, 
   'Core i7-8700 / 32GB / 512GB SSD + 1TB HDD / GTX 1660 Super', 'Core i7-8700', '32GB DDR4', '512GB NVMe', 100, 'SN-P3630-8700-01', 'ready_to_sell', 360, 10500000, 10500000, 14500000, 14500000, 12, 1, 1, 'Kệ A3 - Chuyên dụng', 
   '{"https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=400&q=80"}', NULL, NULL, NULL),

  ('inv-hp-800g4', 'HP-ELITE-800G4', 'HP EliteDesk 800 G4 SFF', 'HP EliteDesk 800 G4 SFF', 'HP', 'SFF', 
   '{"cpu": "Intel Core i7-8700 (6 nhân 12 luồng)", "ram": "16GB DDR4", "ssd": "SSD 256GB NVMe", "ssd_health": 97, "badge": "ĐANG CHẠY QC BURNING", "subBadge": "Kiểm định 100%", "desc": "Máy đang trong buồng thử tải FurMark và MemTest 60 phút."}'::jsonb, 
   'Core i7-8700 / 16GB / 256GB SSD', 'Core i7-8700', '16GB DDR4', '256GB NVMe', 97, 'SN-800G4-8700-02', 'testing', 60, 5800000, 5800000, 7800000, 7800000, 12, 1, 1, 'Khu QC Kiểm Định', 
   '{"https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=400&q=80"}', NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- 7. SEED KHO LINH KIỆN THAY THẾ (spare_parts)
INSERT INTO spare_parts (id, part_name, part_type, condition, quantity_in_stock, warranty_months, distributor, unit_cost, unit_price, shelf_location, notes)
VALUES
  ('sp-1', 'SSD Kingston NV2 250GB NVMe PCIe 4.0', 'SSD', 'new', 12, 36, 'Viễn Sơn', 480000, 650000, 'Kệ LK-A1', 'Hàng new chính hãng đổi mới 36T'),
  ('sp-2', 'SSD Kingston NV2 500GB NVMe PCIe 4.0', 'SSD', 'new', 8, 36, 'Viễn Sơn', 820000, 1050000, 'Kệ LK-A1', 'Tốc độ đọc 3500MB/s'),
  ('sp-3', 'RAM DDR4 8GB Bus 2666/3200 Samsung/Hynix', 'RAM', 'new', 20, 36, 'Vĩnh Xuân', 350000, 480000, 'Kệ LK-A2', 'Zin bóc máy hoặc new bảo hành 3 năm'),
  ('sp-4', 'RAM DDR4 16GB Bus 2666/3200 Kingston', 'RAM', 'new', 15, 36, 'Viễn Sơn', 650000, 890000, 'Kệ LK-A2', 'Bản quyền & tản nhiệt nhôm'),
  ('sp-5', 'Keo tản nhiệt Thermalright TF7 2g', 'ThermalPaste', 'new', 25, 0, 'Phân phối chính hãng', 60000, 100000, 'Kệ LK-B1', 'Hạ 15-20 độ, chuyên dụng spa làm mát'),
  ('sp-6', 'Nguồn Dell OptiPlex SFF 260W 80 Plus Bronze', 'PSU', 'used', 5, 12, 'Zin bóc máy Dell', 350000, 550000, 'Kệ LK-C1', 'Zin tháo máy bộ nguyên bản chưa sửa'),
  ('sp-7', 'CPU Intel Core i7-8700 (6C/12T Tray)', 'CPU', 'used', 5, 12, 'Kho Kỹ Thuật Tân An', 2100000, 2650000, 'Tủ Kính CPU', 'Chân socket đẹp keng, test Cinebench mát'),
  ('sp-8', 'Card Đồ Họa ASUS Phoenix GTX 1050Ti 4GB GDDR5', 'VGA', 'used', 4, 12, 'Hàng tuyển chọn phòng nét sạch', 1450000, 1850000, 'Kệ LK-VGA', 'Nguyên tem void, furmark 68 độ C')
ON CONFLICT (id) DO NOTHING;

-- 8. SEED PHIẾU DỊCH VỤ SỬA CHỮA & TIẾP NHẬN (service_tickets)
INSERT INTO service_tickets (id, ticket_code, customer_id, customer_name, customer_phone, customer_address, device_service_tag, service_tag, device_name, device_model, ticket_type, reception_mode, technician_name, selected_services, multi_tier_warranty, total_amount, visual_condition, status, technician_note, estimated_completion, completed_at, created_at)
VALUES
  ('tk-1', '#TK-2025-0590', 'c1', 'Cty TNHH Vận Tải Long An (Anh Tuấn)', '0918234891', 'KCN Lợi Bình Nhơn, Long An', 'ST-8F4K92X', 'ST-8F4K92X', 'Dell OptiPlex 7060 SFF', 'Dell OptiPlex 7060 SFF', 'counter', 'counter', 'Trịnh Minh Tuấn', 
   '[{"id": "srv-1", "name": "Nâng cấp SSD NVMe Kingston 256GB", "price": 550000, "warranty_tier": "BH Hãng 36T"}, {"id": "srv-2", "name": "Gói Spa Làm Mát Chuyên Sâu Keo TF7", "price": 100000, "warranty_tier": "Hạ 18°C"}, {"id": "srv-3", "name": "Clone Windows 11 Pro Giữ Dữ Liệu MISA", "price": 150000, "warranty_tier": "Bản quyền số"}]'::jsonb,
   '{"chassis_months": 12, "ssd_months": 36, "ram_months": 36, "software_days": 30, "expiry_date": "2026-05-15"}'::jsonb,
   800000, 'Thùng máy đẹp >95%, trầy nhẹ mặt hông, ốc zin nguyên vẹn', 'completed', 'Đã test CrystalDiskInfo 100% Good, nhiệt độ FurMark ổn định 62°C', now() - interval '3 days', now() - interval '2 days', now() - interval '4 days'),

  ('tk-2', '#TK-2025-0591', 'c2', 'Nguyễn Văn Bảy (Chú Bảy Tân An)', '0918234567', 'Số 15 Huỳnh Văn Nhất, P.3, Tân An', 'PC-GAMING-9921', 'PC-GAMING-9921', 'PC Gaming Core i5 13400F', 'PC Gaming Core i5 13400F', 'counter', 'counter', 'Trịnh Minh Tuấn',
   '[{"id": "srv-4", "name": "Vệ sinh tản nhiệt nước & Tra keo TF7", "price": 150000, "warranty_tier": "BH 03 Tháng"}, {"id": "srv-5", "name": "Tối ưu Win 11 Pro sạch không rác", "price": 120000, "warranty_tier": "Hỗ trợ 30 ngày"}]'::jsonb,
   '{"chassis_months": 24, "ssd_months": 36, "ram_months": 36, "software_days": 30, "expiry_date": "2027-04-20"}'::jsonb,
   270000, 'Vỏ case kính cường lực sáng đẹp, bám bụi lưới lọc đáy', 'ready_deliver', 'Khách hẹn chiều 17h qua lấy', now() + interval '18 hours', NULL, now() - interval '30 hours'),

  ('tk-3', '#TK-2025-0592', 'c4', 'Chị Lan - Tạp hoá Tân Tây', '0908889977', 'Ngã 3 Thủ Thừa, Huyện Thủ Thừa', 'HP-400G4-POS', 'HP-400G4-POS', 'HP ProDesk 400 G4 Mini', 'HP ProDesk 400 G4 Mini', 'mobile', 'mobile', 'Huỳnh Minh Trí',
   '[{"id": "srv-6", "name": "Cứu hộ Onsite kiểm tra kêu tít tít lỏng RAM", "price": 150000, "warranty_tier": "Bảo hành 30 ngày"}, {"id": "srv-7", "name": "Vệ sinh chân đồng & kiểm tra cổng COM máy in", "price": 100000, "warranty_tier": "BH 01 Tháng"}]'::jsonb,
   '{"chassis_months": 6, "ssd_months": 12, "ram_months": 12, "software_days": 30}'::jsonb,
   250000, 'Vỏ máy hơi dính dầu mỡ buôn bán, chân cắm nguồn chắc chắn', 'in_progress', 'KTV Trí đang di chuyển qua Tân Tây kiểm tra RAM', now() + interval '44 hours', NULL, now() - interval '10 hours'),

  ('tk-4', '#TK-2025-0593', 'c3', 'Anh Hoàng (Đại lý VLXD Tân An)', '0903124578', 'QL1A, P.5, Tân An', 'DELL-VOSTRO-3681', 'DELL-VOSTRO-3681', 'Dell Vostro 3681 SFF', 'Dell Vostro 3681 SFF', 'counter', 'counter', 'Trịnh Minh Tuấn',
   '[{"id": "srv-bh-1", "name": "Bảo hành SSD NVMe Kingston 500GB lỗi không nhận", "price": 0, "warranty_tier": "BH Đổi Mới 1-1"}]'::jsonb,
   '{"chassis_months": 12, "ssd_months": 36}'::jsonb,
   0, 'Máy còn nguyên tem bảo hành Vi Tính An Tâm dán ốc hông', 'received', 'Tiếp nhận bảo hành SSD đổi mới, gửi hãng test tốc độ đọc ghi', now() + interval '52 hours', NULL, now() - interval '6 hours'),

  ('tk-5', '#TK-2025-0594', 'c5', 'Trường Tiểu Học Hướng Thọ Phú', '02723829101', 'Xã Hướng Thọ Phú, Tân An', 'HP-PRO-DESK-600', 'HP-PRO-DESK-600', 'HP ProDesk 600 G3 SFF', 'HP ProDesk 600 G3 SFF', 'counter', 'counter', 'Huỳnh Minh Trí',
   '[{"id": "srv-9", "name": "Sửa nguồn máy bộ HP bật không lên đèn", "price": 250000, "warranty_tier": "BH 03 Tháng"}]'::jsonb,
   '{"chassis_months": 3}'::jsonb,
   250000, 'Vỏ thùng trầy xước theo thời gian, có tem phòng máy trường học', 'in_progress', 'Đã báo giá thay tụ nguồn, hẹn bàn giao sáng nay', now() - interval '4 hours', NULL, now() - interval '52 hours')
ON CONFLICT (id) DO NOTHING;

-- 9. SEED CỨU HỘ ONSITE TẬN NƠI (onsite_dispatches)
INSERT INTO onsite_dispatches (id, customer_name, phone, address, area_zone, scheduled_time, urgency, status, issue_description, technician_name, created_at)
VALUES
  ('ons-1', 'Anh Minh - Cty May Long An', '0918.421.908', '42 Hùng Vương, P.2, Tân An', 'P.2 Tân An', '14:30', 'urgent', 'preparing', 'Dàn PC văn phòng tắt đột ngột liên tục, cần bộ test công suất nguồn CST & PSU dự phòng 550W', 'Huỳnh Minh Trí', now() - interval '4 hours'),
  ('ons-2', 'Chị Lan - Tạp hoá Tân Tây', '0908.889.977', 'Ngã 3 Thủ Thừa, Huyện Thủ Thừa', 'TT. Thủ Thừa', '16:00', 'normal', 'preparing', 'Mini PC Dell Micro cắm máy in hoá đơn kêu 3 tiếng tít tít, nghi lỏng RAM, cần vệ sinh chân đồng', 'Trịnh Minh Tuấn', now() - interval '2 hours')
ON CONFLICT (id) DO NOTHING;

-- 10. SEED NHẬT KÝ CA TRỰC KỸ THUẬT (shift_logs)
INSERT INTO shift_logs (id, ktv_name, ktv_role, shift_date, shift_name, base_wage, tickets_completed, commission_per_ticket, total_commission, bonus_amount, total_wage, notes, created_at)
VALUES
  ('s1', 'Trịnh Minh Tuấn', 'Kỹ thuật viên trưởng', '2025-05-20', 'Ca 1 (08:00 - 16:00)', 250000, 4, 50000, 200000, 50000, 500000, 'Hoàn thành 4 ticket, hỗ trợ test 2 máy bãi đạt chuẩn 100%', now() - interval '1 day'),
  ('s2', 'Huỳnh Minh Trí', 'KTV Cơ động Onsite', '2025-05-20', 'Ca 2 (13:00 - 21:00)', 280000, 3, 60000, 180000, 100000, 560000, '2 ca cứu hộ Onsite Tân An & Thủ Thừa thành công đúng giờ', now() - interval '1 day')
ON CONFLICT (id) DO NOTHING;

-- 11. SEED CÂU HỎI THƯỜNG GẶP (faqs)
INSERT INTO faqs (id, icon, question, answer, order_index)
VALUES
  ('faq-1', 'Clock', 'Khi máy tính gặp sự cố, An Tâm hỗ trợ kỹ thuật như thế nào?', 'Khi máy tính phát sinh vấn đề hoặc cần xử lý kỹ thuật, quý khách chỉ cần nhắn Zalo hoặc gọi trực tiếp. An Tâm luôn ưu tiên ứng phó nhanh nhất có thể: hỗ trợ từ xa qua UltraViewer/TeamViewer ngay lập tức cho lỗi phần mềm, hoặc linh hoạt đến hỗ trợ tận nơi đối với vấn đề phần cứng.', 1),
  ('faq-2', 'RefreshCw', 'Chính sách bảo hành và đổi trả linh kiện được xử lý ra sao?', 'Linh kiện hoặc máy phát sinh sự cố trong thời gian bảo hành sẽ được kiểm tra và xử lý nhanh chóng. Trường hợp linh kiện lỗi, An Tâm đổi ngay linh kiện tương đương hoặc mới theo cam kết từng gói cấu hình, không giam máy kéo dài.', 2),
  ('faq-3', 'ShieldCheck', 'Nâng cấp SSD và cài lại máy có bị mất dữ liệu công việc & hóa đơn không?', 'Hoàn toàn an tâm! Kỹ thuật viên áp dụng quy trình sao lưu và Clone nguyên bản từ ổ cứng cũ sang SSD mới. Toàn bộ chữ ký số, hóa đơn điện tử, dữ liệu phần mềm kế toán MISA, file ngoài Desktop và Zalo đều được giữ nguyên 100%.', 3),
  ('faq-4', 'CheckCircle2', 'Máy tính cũ tại An Tâm có được mở nắp kiểm tra linh kiện bên trong không?', 'Khách hàng có toàn quyền yêu cầu kỹ thuật mở nắp thùng máy để kiểm tra trực tiếp: bo mạch sạch đẹp nguyên bản chưa qua sửa chữa, tình trạng linh kiện minh bạch, kiểm tra sức khỏe ổ cứng bằng CrystalDiskInfo trước khi quyết định nhận máy.', 4)
ON CONFLICT (id) DO NOTHING;

-- 12. SEED ĐÁNH GIÁ KHÁCH HÀNG (customer_reviews)
INSERT INTO customer_reviews (id, name, role, comment, service, location, rating)
VALUES
  ('rev-1', 'Anh Minh Tuấn', 'Quản lý vận hành - Cty Vận Tải', 'Trang bị 6 bộ máy Dell OptiPlex cho văn phòng dùng phần mềm quản lý và hóa đơn điện tử. Máy chạy cực êm, khởi động 5 giây. Kỹ thuật viên hỗ trợ tận nơi rất chu đáo.', 'Dell OptiPlex 7060 SFF', 'Tân An (Long An - Tây Ninh)', 5),
  ('rev-2', 'Chị Mai Lan', 'Giáo viên trường THCS', 'Gói bảo dưỡng máy tính và nâng cấp SSD làm dàn máy cũ chạy nhanh như mới. Thích nhất là quy trình làm trực tiếp trước mặt mình, giữ nguyên toàn bộ giáo án và hình ảnh.', 'Nâng cấp SSD NVMe & Spa máy', 'Thủ Thừa (Long An - Tây Ninh)', 5),
  ('rev-3', 'Chú Bảy Nam', 'Khách hàng cá nhân', 'Tôi lớn tuổi không rành vi tính, may có cháu kỹ thuật qua tận nhà lúc 18h30 cài lại máy in và kiểm tra nguồn máy. Phục vụ tận tình, giải thích rõ ràng, giá cả phải chăng.', 'Cứu hộ máy tính tận nơi', 'Trảng Bàng (Long An - Tây Ninh)', 5),
  ('rev-4', 'Anh Hoàng Long', 'Giám đốc Công ty Xây Dựng', 'Mua bộ máy bàn Dell Precision dùng thiết kế đồ họa và AutoCAD. Máy chạy mượt mà, render nhanh. Dịch vụ chăm sóc sau bán hàng của Vi Tính An Tâm rất tuyệt vời.', 'Dell Precision Workstation', 'Tây Ninh', 5)
ON CONFLICT (id) DO NOTHING;

-- 13. SEED KHO KEY BẢN QUYỀN (license_keys)
INSERT INTO license_keys (id, category_id, category_name, license_code, status, import_price, unit_price, notes)
VALUES
  ('key-w11p-001', 'cat-win-pro', 'WINDOWS 11 PROFESSIONAL', 'W269N-WFGWX-YVC9B-4J6C9-T83GX', 'available', 150000, 350000, 'Key OEM số vĩnh viễn Digital License'),
  ('key-w11p-002', 'cat-win-pro', 'WINDOWS 11 PROFESSIONAL', 'VK7JG-NPHTM-C97JM-9MPGT-3V66T', 'available', 150000, 350000, 'Key số vĩnh viễn gắn mainboard'),
  ('key-w11p-003', 'cat-win-pro', 'WINDOWS 11 PROFESSIONAL', 'MH37W-N47XK-V7XM9-C7227-GCQG9', 'available', 150000, 350000, 'Key kho sẵn sàng'),
  ('key-off21-001', 'cat-off-pro-21', 'OFFICE PRO PLUS 2021', 'TKN68-4XXG6-39QF9-HYW28-XXXXX', 'available', 220000, 490000, 'Office Pro Plus 2021 kích hoạt online 1 PC'),
  ('key-off21-002', 'cat-off-pro-21', 'OFFICE PRO PLUS 2021', 'FXYTK-NJJ8C-GB6DW-3DYQT-XXXXX', 'available', 220000, 490000, 'Office Pro Plus 2021 kích hoạt vĩnh viễn'),
  ('key-off365-001', 'cat-off-365', 'MICROSOFT 365 FAMILY / PERSONAL', '365FM-89KLT-XXXXX-YYYYY-ZZZZZ', 'available', 290000, 590000, 'Gói thuê bao 1 năm + 1TB OneDrive')
ON CONFLICT (id) DO NOTHING;

-- 14. SEED QUỸ DỰ PHÒNG BẢO HÀNH 5% (warranty_provisions)
INSERT INTO warranty_provisions (id, item_id, item_type, item_title, serial_number, customer_name, customer_phone, customer_code, seller_name, sale_date, warranty_months, warranty_expiry_date, sale_price, cost_price, net_profit, provision_rate, provision_amount, status, approved_at, approved_by)
VALUES
  ('wp-01', 'inv-sold-st8f', 'machine', 'Dell OptiPlex 7060 SFF (Core i5-8500 / 16GB / 256GB SSD)', 'SN-7060-8F4K92X', 'Anh Trần Minh Đức', '0918123456', '15053456', 'Võ Minh Tâm (Admin)', now() - interval '185 days', 12, now() + interval '180 days', 5350000, 4200000, 1150000, 0.05, 57500, 'locked', now() - interval '185 days', 'Võ Minh Tâm (Admin)'),
  ('wp-02', 'inv-hp-400g5', 'machine', 'HP ProDesk 400 G5 Mini (Core i5-8500T / 8GB / 256GB SSD)', 'SN-400G5-8500T-01', 'Nguyễn Văn Hùng', '0988123456', '12023456', 'Võ Minh Tâm (Admin)', now() - interval '370 days', 12, now() - interval '5 days', 5800000, 4200000, 1600000, 0.05, 80000, 'unlocked', now() - interval '370 days', 'Võ Minh Tâm (Admin)')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- HOÀN TẤT TOÀN DIỆN SCHEMA VÀ SEED DỮ LIỆU
-- ============================================================================
