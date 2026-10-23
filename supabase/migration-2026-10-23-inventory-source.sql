-- Migration 2026-10-23: nguồn nhập cho thiết bị trong kho (inventory_items.source)
-- 'vtat'     = kho Vi Tính An Tâm — không thời hạn
-- 'reseller' = hàng Reseller — app tự xoá khỏi kho sau 7 ngày kể từ
--              import_date nếu chưa bán (store sweep phía client, chỉ
--              phiên nhân viên có quyền sửa kho mới kích hoạt được)
-- Máy hiện có mặc định 'vtat' (hàng của shop, không bị áp hạn 7 ngày).
-- Cột này CHỈ dành cho nhân viên: không grant cho anon (danh sách cột
-- công khai của khách vãng lai không chứa source — xem đợt B3).

ALTER TABLE public.inventory_items
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'vtat';

COMMENT ON COLUMN public.inventory_items.source IS
  'Nguồn nhập: vtat = kho VTAT (không thời hạn), reseller = hàng Reseller (tự xoá khỏi kho sau 7 ngày chưa bán)';
