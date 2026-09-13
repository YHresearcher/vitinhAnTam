-- ==========================================
-- SUPABASE SCHEMA: VI TÍNH AN TÂM CRM
-- ==========================================

-- 1. Bảng Khách hàng
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
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
  device_model TEXT NOT NULL, -- Dell OptiPlex 7060 SFF...
  brand TEXT NOT NULL DEFAULT 'Dell',
  form_factor TEXT DEFAULT 'SFF', -- SFF, Mini, Laptop, MT
  specs JSONB NOT NULL, -- { cpu: "i5-8500", ram: "16GB", ssd: "NVMe 256GB", ssd_health: 100, ssd_status: "Good" }
  qc_status TEXT DEFAULT 'pending_test', -- pending_test, testing, ready_to_sell, sold, reserved
  burn_in_duration INT DEFAULT 0, -- Số phút kiểm tra
  cost_price NUMERIC NOT NULL DEFAULT 0,
  retail_price NUMERIC NOT NULL DEFAULT 0,
  deposit_amount NUMERIC DEFAULT 0,
  warranty_months INT DEFAULT 12,
  quantity INT NOT NULL DEFAULT 1,
  shelf_location TEXT DEFAULT 'Kệ A1',
  image_urls TEXT[],
  customer_name TEXT,
  customer_phone TEXT,
  handover_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Bảng Kho linh kiện thay thế
CREATE TABLE IF NOT EXISTS spare_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_name TEXT NOT NULL,
  part_type TEXT NOT NULL, -- SSD, RAM, ThermalPaste, Adapter, Mainboard
  quantity_in_stock INT NOT NULL DEFAULT 0,
  warranty_months INT DEFAULT 36,
  distributor TEXT, -- Viễn Sơn, Vĩnh Xuân, Samsung Zin bóc máy
  unit_cost NUMERIC NOT NULL DEFAULT 0,
  unit_price NUMERIC NOT NULL DEFAULT 0
);

-- 4. Bảng Phiếu dịch vụ & Bảo hành đa tầng (Multi-tier Tickets)
CREATE TABLE IF NOT EXISTS service_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_code TEXT UNIQUE NOT NULL, -- #TK-2025-0590
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT,
  device_service_tag TEXT,
  device_name TEXT NOT NULL,
  reception_mode TEXT DEFAULT 'counter', -- 'counter' (Tại quầy) hoặc 'mobile' (Onsite)
  dispatch_address TEXT,
  technician_name TEXT DEFAULT 'KTV Trực ca',
  selected_services JSONB NOT NULL, -- [{ id: "ssd", name: "SSD Kingston 256GB", price: 550000, warranty: 36 }]
  multi_tier_warranty JSONB NOT NULL, -- { chassis_months: 12, ssd_months: 36, ram_months: 36, software_days: 30 }
  total_amount NUMERIC NOT NULL DEFAULT 0,
  visual_condition TEXT,
  inspection_photos TEXT[],
  status TEXT DEFAULT 'processing', -- processing, ready_deliver, completed, cancelled
  technician_note TEXT,
  estimated_completion TEXT,
  completed_at TIMESTAMPTZ,
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
  urgency TEXT DEFAULT 'normal', -- normal, urgent
  status TEXT DEFAULT 'preparing', -- preparing, on_the_way, arrived, completed
  issue_description TEXT,
  technician_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
