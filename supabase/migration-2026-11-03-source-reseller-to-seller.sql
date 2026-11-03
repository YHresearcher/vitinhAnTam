-- Migration 2026-11-03: đổi tên nguồn nhập 'reseller' → 'seller' (inventory_items.source)
-- Lý do: app đã đổi mọi tham chiếu 'reseller' thành 'seller' (kho-may, store,
-- types) nên dữ liệu cũ phải chuyển theo, nếu không máy Seller cũ sẽ không
-- còn khớp điều kiện quét tự động (source = 'seller') và không hiện đúng
-- nhãn nguồn nhập.
-- Idempotent: chạy lại lần 2 không đổi gì (không còn hàng nào = 'reseller').
-- CHƯA ÁP LIVE — chỉ chạy khi có phê duyệt riêng sau khi code mới đã lên.

UPDATE public.inventory_items
  SET source = 'seller'
  WHERE source = 'reseller';

COMMENT ON COLUMN public.inventory_items.source IS
  'Nguồn nhập: vtat = kho VTAT (không thời hạn), seller = hàng Seller (tự xoá khỏi kho sau 7 ngày chưa bán)';
