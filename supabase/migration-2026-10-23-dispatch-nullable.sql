-- Nới ràng buộc NOT NULL cho các cột tuỳ chọn của ca cứu hộ onsite
-- (2026-10-23). Nguyên nhân gốc của lỗi "tạo ca không lưu được DB"
-- (đã bắt được lỗi gốc 23502 qua insert thử): cột area_zone bị đặt
-- NOT NULL không có giá trị mặc định, trong khi phía app coi khu vực
-- là thông tin tuỳ chọn (để trống = không gửi) → mọi ca tạo mà không
-- điền khu vực đều bị Postgres từ chối toàn bộ. Các cột tuỳ chọn còn
-- lại cũng được nới tương tự để đồng nhất với mô hình dữ liệu phía app.
ALTER TABLE public.onsite_dispatches ALTER COLUMN area_zone DROP NOT NULL;
ALTER TABLE public.onsite_dispatches ALTER COLUMN scheduled_time DROP NOT NULL;
ALTER TABLE public.onsite_dispatches ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE public.onsite_dispatches ALTER COLUMN issue_summary DROP NOT NULL;
ALTER TABLE public.onsite_dispatches ALTER COLUMN issue_description DROP NOT NULL;
ALTER TABLE public.onsite_dispatches ALTER COLUMN technician_name DROP NOT NULL;
