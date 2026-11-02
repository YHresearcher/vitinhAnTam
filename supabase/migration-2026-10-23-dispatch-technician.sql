-- Giao việc cho KTV theo tài khoản (2026-10-23): phiếu điều phối onsite
-- gắn thêm technician_id (id tài khoản trong bảng users) bên cạnh
-- technician_name (vẫn giữ cho bảng lương/tra cứu cũ). Trang "Việc của
-- tôi" lọc việc theo technician_id; phiếu cũ chưa có id vẫn khớp theo
-- tên ở phía giao diện trong thời gian chuyển đổi.
ALTER TABLE public.onsite_dispatches
  ADD COLUMN IF NOT EXISTS technician_id text;

-- Backfill: gán id cho các phiếu cũ khớp tên KTV trong bảng users
UPDATE public.onsite_dispatches d
SET technician_id = u.id::text
FROM public.users u
WHERE d.technician_id IS NULL
  AND d.technician_name IS NOT NULL
  AND d.technician_name <> ''
  AND d.technician_name = u.name;
