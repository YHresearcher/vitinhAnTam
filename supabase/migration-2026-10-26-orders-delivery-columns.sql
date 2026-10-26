-- BUG GỐC (phát hiện khi kiểm chứng live 2026-10-26): giao diện xuất kho
-- vẫn thu thập người giao hàng (delivery_staff_id/name/fee) và route PATCH
-- /api/orders vẫn nhận các trường này, NHƯNG bảng orders chưa từng có 3 cột
-- đó — PATCH gặp lỗi cột thì lặng lẽ rơi vào safePatch bỏ qua, nên mọi
-- lần gán người giao từ trước đến nay đều KHÔNG được lưu (chỉ còn tên
-- người giao trong ghi chú bán hàng + thù lao đã cộng vào bảng lương theo tên).
-- Migration này tạo 3 cột để việc gán người giao thực sự được lưu, và để
-- mục "Giao máy tận nơi" trong trang Thống kê hiệu quả kinh doanh (lọc theo
-- delivery_staff_id) có dữ liệu mà hiện.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_staff_id TEXT,
  ADD COLUMN IF NOT EXISTS delivery_staff_name TEXT,
  ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC DEFAULT 0;
