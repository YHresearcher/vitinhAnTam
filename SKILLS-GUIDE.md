# SKILLS-GUIDE.md — Hướng dẫn gọi Skills khi làm việc với repo vitinhAnTam

File này tra cứu nhanh: **tác vụ → skill nào nên được gọi**. Các skill nằm trong
`/Users/thanhphan/Documents/Cline/Skills/<ten-skill>/SKILL.md` và được gọi qua lệnh
`skills(skill: "<ten-skill>", args: "<bối cảnh cụ thể>")` trong lúc chat với agent.

Nguyên tắc chung:
- Gọi skill **trước khi bắt tay vào** loại công việc tương ứng, không đợi khi mắc lỗi.
- Args của skill nên nêu **bối cảnh repo cụ thể** (Next.js 16 + Tailwind + antd + Supabase,
  RBAC `canEditStock()`/`canSellAndEditWarranty()`, dữ liệu `inventory_items` 1 dòng = 1 máy).
- Kết hợp nhiều skill theo thứ tự: `planning-and-task-breakdown` → skill kỹ thuật →
  `code-review-and-quality` trước khi commit/push.

## Bảng tra cứu nhanh

| Tác vụ thường gặp trong repo | Skill gọi kèm | Ghi chú |
|---|---|---|
| Thêm/sửa UI trang admin hoặc public (kho máy, dashboard, CRM, mua hàng...) | `frontend-ui-engineering` | Đòi hỏi: empty state, mobile-first, giữ design system Tailwind hiện có, không thêm lib UI mới |
| Chỉ cần đổi màu/spacing/ponsive, sửa component Tailwind | `ui-styling` | Dùng khi chạm `<table>`, modal, badge, form |
| Tính năng mới chạm nhiều file (store + trang + modal) | `planning-and-task-breakdown` rồi `incremental-implementation` | Chia lát mỏng: type → store → UI → kiểm chứng |
| Sửa bug (lỗi sync, số liệu sai, bán hàng, tồn kho) | `debugging-and-error-recovery` | Bắt đầu từ reproducer/log, không đoán; Supabase lỗi nằm trong `.error` (xem `runSupabaseWrite`) |
| Viết/đổi logic thuần (tính tồn kho, phân bổ dòng tiền, bảo hành) | `test-driven-development` | Repo chưa có test runner — nếu TDD thì dùng script Node cô lập để kiểm chứng logic trước khi gắn vào store |
| Rà chất lượng trước khi commit/push | `code-review-and-quality` | Checklist riêng cho repo: RBAC, `quantity`/`stock_quantity` ghi đồng thời, Supabase sync |
| Đổi API/DB schema (bảng Supabase, type trong `lib/supabase.ts`) | `deprecation-and-migration` | Migration trong `supabase/migration-*.sql`, luôn `ADD COLUMN IF NOT EXISTS` |
| Viết tài liệu/README/ghi chú thay đổi | `documentation-and-adrs` | |
| Tối ưu tốc độ (trang kho máy ~3.500 dòng, dashboard nhiều memo) | `performance-optimization` | Ưu tiên `useMemo` đúng chỗ, tránh render lại modal lớn |

## Quy tắc riêng của repo này (kèm skill UI)

- **1 dòng `inventory_items` = 1 máy** (sau thay đổi nhập lô theo batch): mỗi máy có
  `service_tag` riêng (Tag gốc, Tag-2, Tag-3...), `serial_number` và `ssd_health` riêng.
  Khi sửa UI kho máy, không được assume `stock_quantity > 1` cho máy mới nhập.
- **Máy đã bán (`qc_status = 'sold'` / `'dealer_sold'`)**: read-only — không nút bán/sửa giá/
  xóa/sửa tồn kho; chỉ Admin đổi được người chăm sóc khách hàng (`assigned_sales_*` trên CRM).
- **Không còn nút "In tem"** trong kho máy (đã gỡ `ThermalLabelModal` khỏi trang này;
  trang Dashboard vẫn giữ tính năng in tem riêng).
- Quyền: `canEditStock()` = Admin; `canSellAndEditWarranty()` = Admin & Sales.
- Đồng bộ Supabase: mọi write đi qua `runSupabaseWrite` (bắt lỗi `.error` thật).

## Ví dụ lệnh gọi skill

```
skills(skill: "frontend-ui-engineering",
       args: "Design tab Đã bán trong /kho-may: read-only, admin đổi NV phụ trách, Tailwind hiện có")
skills(skill: "debugging-and-error-recovery",
       args: "Bán 1 máy trong lô 5 nhưng tồn kho không trừ — kiểm tra sellInventoryItem trong lib/store.tsx")
skills(skill: "incremental-implementation",
       args: "Nhập lô máy theo batch: state batchUnits → handleCreateNewItem → UI form → grouped table")
```
