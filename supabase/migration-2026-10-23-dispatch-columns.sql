-- Bổ sung các cột phía app đã dùng từ lâu nhưng bảng chưa có
-- (2026-10-23): ticket_code (mã ca hiển thị), technician_fee (tiền
-- công KTV) và fee_synced_to_payroll (đã cộng lương chưa). Thiếu các
-- cột này, mọi câu ghi kèm chúng bị PostgREST từ chối toàn bộ
-- (PGRST204) — nguyên nhân ca cứu hộ tạo mới không lưu được xuống DB.
ALTER TABLE public.onsite_dispatches ADD COLUMN IF NOT EXISTS ticket_code text;
ALTER TABLE public.onsite_dispatches ADD COLUMN IF NOT EXISTS technician_fee numeric;
ALTER TABLE public.onsite_dispatches ADD COLUMN IF NOT EXISTS fee_synced_to_payroll boolean NOT NULL DEFAULT false;
