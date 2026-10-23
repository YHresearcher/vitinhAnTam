-- Migration 2026-10-23: Cấu hình Widget liên hệ trang chủ
-- Thêm cột contact_widget (jsonb) vào bảng system_settings để lưu
-- trạng thái bật/tắt các nút của widget liên hệ nổi ở trang chủ
-- (tra cứu bảo hành, hotline, Zalo, WhatsApp, lên đầu trang).
-- Chạy thủ công trong Supabase SQL Editor.

ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS contact_widget jsonb;
