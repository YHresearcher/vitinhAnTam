-- ==============================================================================
-- MIGRATION: Bổ sung trường zalo_chat_id vào bảng users
-- Mục đích: Cho phép kỹ thuật viên/nhân sự liên kết tài khoản Zalo với hệ thống,
-- tự động nhận thông báo ca trực, phiếu sửa chữa và cứu hộ tận nơi.
-- ==============================================================================

-- 1. Thêm cột zalo_chat_id nếu chưa có
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS zalo_chat_id TEXT;

-- 2. Đánh index để webhook tra cứu nhanh khi nhận tin nhắn từ Zalo Bot Platform
CREATE INDEX IF NOT EXISTS idx_users_zalo_chat_id ON public.users(zalo_chat_id);

COMMENT ON COLUMN public.users.zalo_chat_id IS 'ID Zalo của nhân sự (sender.id / chat_id) dùng để gửi thông báo điều phối riêng.';

