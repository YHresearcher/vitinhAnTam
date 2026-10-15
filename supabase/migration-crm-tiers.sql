-- ==============================================================================
-- MIGRATION: Nâng Cấp Hệ Thống CRM Phân Hạng Thành Viên & Chăm Sóc Khách Hàng
-- ==============================================================================

-- 1. Bổ sung các cột theo dõi chi tiêu, hạng thành viên và nhân viên phụ trách vào bảng customers
ALTER TABLE customers 
  ADD COLUMN IF NOT EXISTS total_spent BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS customer_tier TEXT DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS last_purchase_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS assigned_sales_id TEXT,
  ADD COLUMN IF NOT EXISTS assigned_sales_name TEXT;

-- 2. Đảm bảo cột birth_date tồn tại
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS birth_date TEXT;

-- 3. Tạo index phục vụ tìm kiếm và rà soát lịch CRM nhanh chóng
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_tier ON customers(customer_tier);
CREATE INDEX IF NOT EXISTS idx_customers_assigned_sales ON customers(assigned_sales_id);
CREATE INDEX IF NOT EXISTS idx_customers_last_purchase ON customers(last_purchase_date);

-- 4. Cập nhật comment mô tả logic phân hạng
COMMENT ON COLUMN customers.customer_tier IS 'Hạng thành viên: standard (<3M), member (3M-10M), loyal (11M-18M), vip (19M-30M), vvip (>30M)';
COMMENT ON COLUMN customers.total_spent IS 'Tổng chi tiêu tích lũy (VNĐ) dùng để thăng hạng và chiết khấu';
COMMENT ON COLUMN customers.last_purchase_date IS 'Ngày mua hàng gần nhất để tính thời gian giảm hạng sau 12 tháng không mua lại';
