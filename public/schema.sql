-- ==============================================================================
-- CƠ SỞ DỮ LIỆU VI TÍNH AN TÂM (SUPABASE POSTGRESQL SCHEMA)
-- Hệ thống Quản lý Thiết bị, Bảo hành điện tử, Ticket Dịch vụ & Tính tiền công
-- ==============================================================================

-- 1. BẢNG KHÁCH HÀNG (CUSTOMERS)
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    address TEXT,
    crm_tier VARCHAR(50) DEFAULT 'Regular', -- 'Regular', 'VIP'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BẢNG THIẾT BỊ & KHO MÁY (DEVICES / INVENTORY)
CREATE TABLE IF NOT EXISTS devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_tag VARCHAR(100) UNIQUE NOT NULL,
    brand VARCHAR(100) NOT NULL, -- 'Dell', 'HP', 'Lenovo', 'Khác'
    model VARCHAR(255) NOT NULL,
    form_factor VARCHAR(100), -- 'Small Form Factor', 'Ultra-slim Mini', 'Mini Tower', 'Laptop FHD'
    cpu VARCHAR(150),
    ram VARCHAR(150),
    storage VARCHAR(150),
    ssd_health_percent INT DEFAULT 100,
    ssd_health_status VARCHAR(50) DEFAULT 'Good', -- 'Good', 'Caution', 'Bad'
    status VARCHAR(50) DEFAULT 'ready', -- 'ready', 'testing', 'reserved', 'sold'
    status_label VARCHAR(100) DEFAULT 'Sẵn sàng xuất bán',
    cost_price NUMERIC(12, 2) DEFAULT 0,
    list_price NUMERIC(12, 2) DEFAULT 0,
    warranty_months INT DEFAULT 12,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    handover_date DATE,
    warranty_package VARCHAR(100),
    warranty_expiry_date DATE,
    components_warranty JSONB,
    technical_logs JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BẢNG PHIẾU DỊCH VỤ / TICKET TIẾP NHẬN (TICKETS)
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_code VARCHAR(50) UNIQUE NOT NULL,
    reception_mode VARCHAR(20) DEFAULT 'counter', -- 'counter', 'mobile'
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address TEXT,
    service_tag VARCHAR(100),
    device_model VARCHAR(255),
    visual_condition TEXT,
    selected_services JSONB,
    total_price NUMERIC(12, 2) DEFAULT 0,
    internal_notes TEXT,
    status VARCHAR(50) DEFAULT 'received', -- 'received', 'in_progress', 'completed', 'delivered'
    ktv_name VARCHAR(100) DEFAULT 'Nguyễn Văn An',
    estimated_completion VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BẢNG CA LÀM VIỆC & TÍNH TIỀN CÔNG KTV (SHIFT_LOGS)
CREATE TABLE IF NOT EXISTS shift_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ktv_name VARCHAR(100) NOT NULL,
    ktv_role VARCHAR(100) DEFAULT 'Kỹ thuật viên',
    shift_date DATE NOT NULL,
    shift_name VARCHAR(50) NOT NULL, -- 'Ca 1 (8h - 12h)', 'Ca 2 (13h - 17h)', 'Ca 3 (17h - 21h)'
    base_wage NUMERIC(12, 2) DEFAULT 200000,
    tickets_completed INT DEFAULT 0,
    commission_per_ticket NUMERIC(12, 2) DEFAULT 50000,
    total_commission NUMERIC(12, 2) DEFAULT 0,
    bonus_amount NUMERIC(12, 2) DEFAULT 0,
    total_wage NUMERIC(12, 2) DEFAULT 200000,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BẢNG ĐẶT LỊCH HẸN DỊCH VỤ PUBLIC (APPOINTMENTS)
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    device_type VARCHAR(100) NOT NULL,
    service_needed TEXT NOT NULL,
    appointment_date DATE NOT NULL,
    time_slot VARCHAR(100) NOT NULL,
    location_type VARCHAR(20) DEFAULT 'counter', -- 'counter', 'onsite'
    address TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BẬT ROW LEVEL SECURITY (TÙY CHỌN CHO PHÉP ĐỌC PUBLIC)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access for devices" ON devices FOR SELECT USING (true);
CREATE POLICY "Allow public read/insert for appointments" ON appointments FOR ALL USING (true);
CREATE POLICY "Allow public read/insert for tickets" ON tickets FOR ALL USING (true);
CREATE POLICY "Allow public read for customers" ON customers FOR SELECT USING (true);
CREATE POLICY "Allow public read for shift_logs" ON shift_logs FOR ALL USING (true);
