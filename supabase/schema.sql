-- ==========================================
-- SUPABASE SCHEMA: VI TÍNH AN TÂM CRM
-- Đồng bộ với kiểu dữ liệu trong lib/supabase.ts
-- Chạy được lặp lại (idempotent): CREATE IF NOT EXISTS + ALTER ADD COLUMN IF NOT EXISTS
-- ==========================================

-- 1. Bảng Khách hàng
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_code TEXT,
  full_name TEXT NOT NULL,
  birth_date TEXT,
  phone TEXT UNIQUE NOT NULL,
  address TEXT,
  area_zone TEXT, -- P.2 Tân An, Thủ Thừa, Châu Thành...
  customer_tier TEXT DEFAULT 'Standard', -- Standard, VIP, Thân thiết
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Bảng Thiết bị / Kho máy Refurbished
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_tag TEXT UNIQUE NOT NULL, -- ST-8F4K92X, TP-994L2A...
  device_model TEXT, -- Dell OptiPlex 7060 SFF...
  model TEXT,
  brand TEXT NOT NULL DEFAULT 'Dell', -- Dell, HP, Lenovo, Asus, Khác
  form_factor TEXT DEFAULT 'SFF', -- SFF, Mini, Laptop, MT
  specs JSONB, -- { cpu, ram, ssd, ssd_health, ssd_status }
  specs_summary TEXT,
  cpu TEXT,
  ram TEXT,
  ssd_capacity TEXT,
  ssd_health INT,
  serial_number TEXT,
  qc_status TEXT DEFAULT 'pending_test', -- pending_test, testing, ready_to_sell, sold, reserved
  burn_in_duration INT DEFAULT 0, -- Số phút kiểm tra
  cost_price NUMERIC NOT NULL DEFAULT 0,
  import_price NUMERIC NOT NULL DEFAULT 0,
  retail_price NUMERIC NOT NULL DEFAULT 0,
  price NUMERIC NOT NULL DEFAULT 0,
  deposit_amount NUMERIC DEFAULT 0,
  warranty_months INT NOT NULL DEFAULT 12,
  warranty_type TEXT NOT NULL DEFAULT 'months' CHECK (warranty_type IN ('months', 'manufacturer')),
  -- `stock_quantity` là tên UI đang dùng, `quantity` là tên trong DB — luôn ghi đồng thời
  stock_quantity INT NOT NULL DEFAULT 1,
  quantity INT NOT NULL DEFAULT 1,
  shelf_location TEXT NOT NULL DEFAULT 'Kệ A1',
  image_urls TEXT[],
  customer_name TEXT,
  customer_phone TEXT,
  handover_date TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Bảng Kho linh kiện thay thế
CREATE TABLE IF NOT EXISTS spare_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_name TEXT NOT NULL,
  part_type TEXT NOT NULL, -- SSD, RAM, CPU, VGA, PSU, Mainboard, Screen, Adapter, ThermalPaste, KeyboardMouse
  condition TEXT DEFAULT 'new', -- new (mới 100%), used (zin bóc máy / cũ 99%)
  quantity_in_stock INT NOT NULL DEFAULT 0,
  warranty_months INT DEFAULT 36,
  warranty_type TEXT NOT NULL DEFAULT 'months' CHECK (warranty_type IN ('months', 'manufacturer')),
  distributor TEXT,
  unit_cost NUMERIC NOT NULL DEFAULT 0,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  shelf_location TEXT,
  notes TEXT
);

-- 4. Bảng Phiếu dịch vụ & Bảo hành đa tầng (Multi-tier Tickets)
-- Các cột JSONB đều có DEFAULT vì trong ServiceTicket (TS) chúng là optional
CREATE TABLE IF NOT EXISTS service_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_code TEXT UNIQUE NOT NULL, -- #TK-2025-0590
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT,
  device_service_tag TEXT,
  service_tag TEXT,
  device_name TEXT,
  device_model TEXT,
  ticket_type TEXT DEFAULT 'counter', -- counter, onsite
  reception_mode TEXT DEFAULT 'counter', -- counter (Tại quầy) hoặc mobile (Onsite)
  dispatch_address TEXT,
  technician_name TEXT DEFAULT 'KTV Trực ca',
  selected_services JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{ id, name, price, warranty_tier }]
  parts_used JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{ part_name, quantity, price, warranty_months }]
  multi_tier_warranty JSONB NOT NULL DEFAULT '{}'::jsonb, -- { chassis_months, ssd_months, ram_months, software_days }
  total_amount NUMERIC NOT NULL DEFAULT 0,
  estimated_cost NUMERIC DEFAULT 0,
  actual_cost NUMERIC DEFAULT 0,
  visual_condition TEXT,
  issue_description TEXT,
  "issueDescription" TEXT,
  inspection_photos TEXT[],
  -- received, diagnosing, in_progress, processing, ready, ready_deliver, completed, delivered, cancelled
  status TEXT DEFAULT 'received',
  technician_note TEXT,
  service_category TEXT DEFAULT 'sua_chua', -- sua_chua, bao_hanh
  warranty_duration_months INT,
  warranty_type TEXT NOT NULL DEFAULT 'months' CHECK (warranty_type IN ('months', 'manufacturer')),
  estimated_completion TEXT,
  repair_deadline TEXT,
  warranty_deadline TEXT,
  completed_at TIMESTAMPTZ,
  warranty_until TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Bảng Điều phối Cứu hộ Onsite
CREATE TABLE IF NOT EXISTS onsite_dispatches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  area_zone TEXT NOT NULL,
  scheduled_time TEXT NOT NULL,
  distance_km NUMERIC,
  estimated_arrival_minutes INT,
  urgency TEXT DEFAULT 'normal', -- normal, urgent
  -- pending, preparing, dispatched, on_the_way, arrived, in_progress, completed, cancelled
  status TEXT DEFAULT 'preparing',
  issue_summary TEXT,
  issue_description TEXT,
  technician_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Bảng Chấm công / Tiền công (Admin only)
-- BẢN CŨ THIẾU BẢNG NÀY -> truy vấn `shift_logs` luôn lỗi và làm hỏng cả lần đồng bộ Supabase
CREATE TABLE IF NOT EXISTS shift_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_name TEXT,
  ktv_name TEXT,
  ktv_role TEXT,
  shift_date DATE NOT NULL,
  shift_name TEXT,
  shift_type TEXT DEFAULT 'full_day', -- full_day, morning, afternoon, night_onsite
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

-- ==========================================
-- MIGRATION CHO DB ĐÃ TỒN TẠI
-- CREATE TABLE IF NOT EXISTS sẽ KHÔNG thêm cột mới vào bảng cũ -> cần ALTER ở đây
-- ==========================================
ALTER TABLE customers ADD COLUMN IF NOT EXISTS customer_code TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS birth_date TEXT;

ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS device_model TEXT;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS specs JSONB;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS specs_summary TEXT;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS cpu TEXT;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS ram TEXT;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS ssd_capacity TEXT;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS ssd_health INT;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS serial_number TEXT;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS import_price NUMERIC DEFAULT 0;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS original_price NUMERIC DEFAULT 0;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS sale_price NUMERIC DEFAULT 0;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS stock_quantity INT NOT NULL DEFAULT 1;
ALTER TABLE inventory_items ALTER COLUMN device_model DROP NOT NULL;
ALTER TABLE inventory_items ALTER COLUMN warranty_months SET NOT NULL;
ALTER TABLE inventory_items ALTER COLUMN shelf_location SET NOT NULL;

ALTER TABLE spare_parts ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'new';
ALTER TABLE spare_parts ADD COLUMN IF NOT EXISTS shelf_location TEXT;
ALTER TABLE spare_parts ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE spare_parts ADD COLUMN IF NOT EXISTS original_price NUMERIC DEFAULT 0;
ALTER TABLE spare_parts ADD COLUMN IF NOT EXISTS sale_price NUMERIC DEFAULT 0;

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
-- Các cột này bị NOT NULL trong bản cũ nhưng ServiceTicket phía client không bắt buộc -> làm hỏng insert
ALTER TABLE service_tickets ALTER COLUMN device_name DROP NOT NULL;
ALTER TABLE service_tickets ALTER COLUMN selected_services SET DEFAULT '[]'::jsonb;
ALTER TABLE service_tickets ALTER COLUMN multi_tier_warranty SET DEFAULT '{}'::jsonb;

ALTER TABLE onsite_dispatches ADD COLUMN IF NOT EXISTS distance_km NUMERIC;
ALTER TABLE onsite_dispatches ADD COLUMN IF NOT EXISTS estimated_arrival_minutes INT;
ALTER TABLE onsite_dispatches ADD COLUMN IF NOT EXISTS issue_summary TEXT;

-- ==========================================
-- 7. Bảng Đơn hàng (Orders) — khách đặt từ website
-- ==========================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code TEXT UNIQUE NOT NULL,        -- ORD-20250620-XXXX
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT,
  device_name TEXT,
  device_tag TEXT,                         -- service_tag tham chiếu thiết bị
  device_price NUMERIC DEFAULT 0,
  payment_method TEXT DEFAULT 'cash',      -- qr, cash
  delivery_method TEXT DEFAULT 'pickup',   -- pickup, delivery
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, confirmed, processing, completed, cancelled
  confirmed_by TEXT,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Bảng Thông báo nội bộ
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'order',      -- order, ticket, system
  title TEXT NOT NULL,
  body TEXT,
  reference_id TEXT,                       -- ID đơn hàng / phiếu sửa
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
