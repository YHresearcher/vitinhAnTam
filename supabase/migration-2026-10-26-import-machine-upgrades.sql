-- Nhập máy 2026-10-26: thông tin người bán (hàng reseller), linh kiện đã
-- test theo từng máy, cờ "đã test trước khi nhập". Ảnh máy dùng cột
-- image_urls đã có sẵn trong app (thêm nếu DB cũ chưa có cột này).
-- Chạy 1 lần trong Supabase SQL Editor. Các cột mới KHÔNG nằm trong danh
-- sách cột công khai của app nên khách vãng lai không đọc được SĐT người bán.
alter table public.inventory_items
  add column if not exists seller_name text,
  add column if not exists seller_phone text,
  add column if not exists seller_note text,
  add column if not exists components jsonb not null default '[]'::jsonb,
  add column if not exists tested_before_import boolean not null default false;

alter table public.inventory_items
  add column if not exists image_urls text[];
