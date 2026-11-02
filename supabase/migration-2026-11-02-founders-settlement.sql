-- ============================================================
-- FILE ONLY — DO NOT APPLY IN THIS TASK.
-- Bảng tất toán quỹ founders theo tháng (bảng chốt 2026-11-02).
-- Chỉ chạy khi chủ shop quyết dùng đồng bộ Supabase thay vì chỉ
-- localStorage. Hiện tại app vẫn chạy tốt chỉ với localStorage:
-- khi 2 bảng này chưa có, lệnh select lỗi và store bỏ qua lặng,
-- dữ liệu vẫn nằm ở localStorage của trình duyệt admin.
--
-- QUAN TRỌNG (bài học từ bảng faqs + TVK):
-- - Bảng tạo bằng SQL thô KHÔNG tự có quyền cho API role: bắt buộc
--   có lệnh GRANT bên dưới, nếu không app đọc/ghi đều lỗi 42501.
-- - KHÔNG bật RLS khi chưa có policy: RLS bật mà 0 policy thì mọi
--   lệnh đọc đều trả về rỗng (sự cố faqs 2026-10-31). 2 bảng này cố
--   tình KHÔNG bật RLS, giống hệt 2 bảng tài chính hiện có
--   (warranty_provisions, admin_deductions) — app chỉ đồng bộ khi đã
--   đăng nhập bằng session HMAC của shop.
-- ============================================================

-- Một dòng cho mỗi tháng: chi phí thực tế + trạng thái chốt.
-- id = 'YYYY-MM' (ví dụ '2026-11').
CREATE TABLE IF NOT EXISTS founder_settlements (
  id TEXT PRIMARY KEY,
  costs JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'settled')),
  settled_at TIMESTAMPTZ,
  settled_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tổng vốn tự có của người bỏ vốn chính: đúng 1 dòng, id = 'main'.
-- amount NULL = chưa nhập (gốc chưa đối trừ, phần 14% chỉ tích lũy).
CREATE TABLE IF NOT EXISTS founder_capital (
  id TEXT PRIMARY KEY,
  amount NUMERIC,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by TEXT
);

-- Quyền cho API role (bắt buộc — xem ghi chú đầu file). Chỉ cấp cho
-- authenticated: sau khi đăng nhập, app đổi client sang JWT nhân viên
-- (role authenticated, xem setStaffAccessToken trong lib/supabase.ts).
-- KHÔNG cấp cho anon — bảng này chỉ admin ghi, không phải dữ liệu công khai.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE founder_settlements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE founder_capital TO authenticated;
