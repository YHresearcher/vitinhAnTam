-- Migration: Thêm quản lý giá gốc (original_price) và giá giảm (sale_price) cho máy tính và linh kiện
-- Áp dụng cho bảng inventory_items và spare_parts

-- 1. Bảng inventory_items (Kho máy)
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS original_price NUMERIC DEFAULT 0;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS sale_price NUMERIC DEFAULT 0;

-- Tự động đồng bộ original_price ban đầu theo cột price/retail_price nếu có sẵn
UPDATE inventory_items 
SET original_price = COALESCE(price, retail_price, 0)
WHERE (original_price IS NULL OR original_price = 0) AND (price > 0 OR retail_price > 0);

-- 2. Bảng spare_parts (Kho linh kiện)
ALTER TABLE spare_parts ADD COLUMN IF NOT EXISTS original_price NUMERIC DEFAULT 0;
ALTER TABLE spare_parts ADD COLUMN IF NOT EXISTS sale_price NUMERIC DEFAULT 0;

-- Tự động đồng bộ original_price theo unit_price nếu có sẵn
UPDATE spare_parts 
SET original_price = COALESCE(unit_price, 0)
WHERE (original_price IS NULL OR original_price = 0) AND unit_price > 0;
