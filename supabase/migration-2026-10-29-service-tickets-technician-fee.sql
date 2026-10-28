-- Phiếu sửa chữa: thêm cột tiền công KTV + cờ đã kết chuyển lương.
-- Code (type ServiceTicket, modal phiếu, creditTechnicianPayroll) đã dùng
-- 2 cột này từ trước nhưng schema chưa từng có → PostgREST từ chối toàn
-- bộ câu ghi có chứa technician_fee (PGRST204), khiến phí/linh kiện/ghi
-- chú lưu qua modal đầy đủ không tới được DB, và câu INSERT phiếu mới
-- từ trình duyệt cũng rớt (chỉ còn bản ghi rút gọn qua /api/tickets).
-- Chạy từng câu một trong SQL Editor. Không sửa dữ liệu cũ.
ALTER TABLE IF EXISTS service_tickets
  ADD COLUMN IF NOT EXISTS technician_fee NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE IF EXISTS service_tickets
  ADD COLUMN IF NOT EXISTS fee_synced_to_payroll BOOLEAN NOT NULL DEFAULT false;
