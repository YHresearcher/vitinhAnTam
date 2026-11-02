---
target: trang chủ
total_score: 28
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
target_identity: "file:/Users/phanthanh/Documents/vitinhAnTam/app/(public)/HomeClient.tsx"
target_fingerprint: "sha256:74034611fc6d1fa7c682d7d48406f6c57536ebca8ce62f15bd3d7a55ee4cf9dc"
target_path: /Users/phanthanh/Documents/vitinhAnTam/app/(public)/HomeClient.tsx
timestamp: 2026-11-02T14-10-58Z
slug: app-public-homeclient-tsx
---
# Design Critique: Trang chủ Vi Tính An Tâm (vitinhantam.com)
Method: dual-agent (A: 6dc6cdab-3734-4f67-8909-45ab44c31d92 · B: 400d0f11-cf5d-49d2-b163-a01cac99eb98)

## Design Health Score (Nielsen's 10 Heuristics)

| # | Heuristic | Score | Key Issue |
|---|---|:---:|---|
| 1 | Visibility of System Status | 3/4 | Bộ đếm kho trực tiếp (`totalReadyStock`, `totalAvailableKeys`) chạy tốt, toast báo lỗi tìm kiếm nhanh; thiếu trạng thái active rõ ràng ở tab "Tất cả". |
| 2 | Match System / Real World | 2/4 | Ngôn ngữ kỹ thuật mộc mạc chuẩn giới thợ vi tính VN ("zin bóc máy", "tra keo"); bị trừ điểm nặng do xung đột địa chỉ (Tây Ninh vs Long An) và nút CTA gói dịch vụ 1 dẫn nhầm vào kho bán máy. |
| 3 | User Control and Freedom | 3/4 | Modal QC thoát dễ dàng qua backdrop/Esc; cuộn mượt tốt; thiếu nút quay lại xem tất cả khi đang lọc tab linh kiện/phần mềm. |
| 4 | Consistency and Standards | 2/4 | Layout ép `font-inter` ghi đè `Be Vietnam Pro` định nghĩa trong globals; nút CTA gói 1 dẫn vào kho máy, gói 2 vào đặt lịch, gói 3 mở Zalo; link "Quy định bảo hành" ở footer nhảy vòng lặp lại `#chinh-sach`. |
| 5 | Error Prevention | 3/4 | Ô tìm kiếm bảo hành tự trim khoảng trắng, chặn rỗng và có placeholder rõ ràng. |
| 6 | Recognition Rather Than Recall | 4/4 | Biểu tượng CPU, RAM, SSD kèm nhãn rõ ràng; số tiền định dạng monospace; Modal QC lặp lại toàn bộ thông số chi tiết để khách không phải nhớ. |
| 7 | Flexibility and Efficiency | 3/4 | Có anchor link nhanh cho khách quay lại; tư vấn Zalo trực tiếp từng món; menu desktop bị ẩn sớm ở màn hình < 1280px (xl). |
| 8 | Aesthetic and Minimalist Design | 2/4 | Widget liên hệ nổi 5 nút chiếm 280px màn hình di động; Hero dồn quá nhiều thông tin cùng lúc (ticker, tìm kiếm, dual CTA, thẻ cam kết con). |
| 9 | Error Recovery | 3/4 | Thông báo toast lịch sự khi nhập sai Service Tag (`role="status"`, `aria-live="polite"`). |
| 10 | Help and Documentation | 3/4 | Accordion FAQ giải đáp đúng 4 nỗi sợ lớn nhất; thiếu trang tài liệu chính sách bảo hành chi tiết bằng văn bản. |
| **Total** | | **28/40** | **Good (70.0%)** |

## Design Specificity Verdict

- **LLM Assessment**: Semi-Bespoke Hybrid. Vi Tính An Tâm sở hữu câu chuyện thương hiệu rất mạnh và độc bản tại thị trường máy tính cũ Việt Nam: *"Bán bằng tâm để bạn an tâm"* với cam kết bảo hành 6 tháng nguyên máy và minh bạch linh kiện ("Mới báo mới, cũ báo cũ"). Đặc tính bespoke thể hiện xuất sắc ở **Modal Kiểm định QC & S/N**, bộ đếm kho hàng thực tế, và ô tra cứu bảo hành ngay tại Hero. Tuy nhiên, tính đặc trưng này bị pha loãng bởi ảnh stock render laptop bóng bẩy thay vì ảnh bàn kỹ thuật thực tế, bảng màu cool slate của Tailwind lấn át màu giấy kem ấm `#FAF7F2`, và sự mâu thuẫn địa lý giữa Tây Ninh và Long An.
- **Deterministic Scan**: CLI detector bắt lỗi `gradient-text` (AI tell) tại `_components/HeroSection.tsx:62`. Đồng thời phát hiện toàn bộ thư mục `app/(public)/_components/` (6 file) là mã chết tồn đọng sau đợt refactor dở dang, vì `page.tsx` đang gọi component nguyên khối `HomeClient.tsx` (1.318 dòng).
- **Technical & Accessibility Inspection**: Phát hiện lỗi nghiêm trọng đứt gãy ARIA trong Accordion FAQ (`aria-labelledby="faq-question-idx"` trỏ tới ID không tồn tại), Modal QC bị gỡ mất tiêu đề accessible (`title={null}`), và menu mobile trong header sticky không có `max-h` gây tràn màn hình trên điện thoại nhỏ.

## Overall Impression
Giao diện toát lên sự trung thực, đáng tin cậy về mặt nội dung kỹ thuật và giải tỏa được tâm lý sợ "luộc đồ/hàng dựng" của người mua máy cũ. Tuy nhiên, kiến trúc mã nguồn đang ở dạng nguyên khối 1.318 dòng gây re-render trên từng phím gõ, widget liên hệ di động quá cồng kềnh, và một số nút bấm điều hướng bị sai đích làm giảm tính chuyên nghiệp.

## What's Working
1. **Modal QC & Kiểm định S/N — Cỗ máy tạo dựng niềm tin:** Cho phép khách hàng xem trực tiếp thời lượng stress-test, trạng thái ổ cứng CrystalDiskInfo và bản quyền Windows số theo mainboard. Đây là vũ khí chuyển đổi cao nhất của website.
2. **Ngôn ngữ copy chân thật, giải tỏa triệt để lo âu:** Tránh hoàn toàn sáo ngữ doanh nghiệp, dùng đúng từ ngữ thợ máy: *"Mới báo mới, cũ báo cũ rõ ràng"*, *"Kích hoạt online 1 lần dùng ổn định lâu dài"*, *"Bo mạch nguyên bản, chưa qua sửa chữa chắp vá"*.
3. **Minh bạch kho hàng và giá cả niêm yết:** Không dùng trò "Liên hệ để biết giá", hiển thị số lượng tồn kho theo thời gian thực và giá VND rõ ràng.

## Priority Issues
- **[P0] Lỗi điều hướng nút Gói Dịch vụ 1 & Link bảo hành vòng lặp**: Nút "Xem chi tiết/Đặt gói" của Gói 1 (Vệ sinh & Tra keo) dẫn nhầm vào `/danh-muc-san-pham` thay vì `/dat-lich`. Link "Quy định bảo hành" ở footer trỏ về `#chinh-sach` (chính footer).
- **[P1] Xung đột địa chỉ giữa Tây Ninh & Long An**: Header/Meta ghi "Tây Ninh & Sài Gòn", nhưng footer ghi "phường Long An, tỉnh Tây Ninh" (phường Long An thuộc TP. Tân An, tỉnh Long An) và liệt kê các huyện của Long An.
- **[P1] Widget liên hệ nổi trên Mobile quá tải (Cột 5 nút 280px)**: Chiếm hơn 35% chiều dọc màn hình điện thoại, che lấp giá sản phẩm và nút đặt hàng; badge đỏ số '3' giả thông báo chưa đọc gây ức chế.
- **[P2] Lỗi đứt gãy ARIA & Accessible Name (FAQ & Modal)**: FAQ accordion trỏ tới `aria-labelledby` không tồn tại; Modal QC bị đặt `title={null}` làm mất tên accessible cho trình đọc màn hình.
- **[P2] Mã nguồn nguyên khối 1.318 dòng & 0% SSR cho kho hàng**: Gõ tìm kiếm bảo hành làm re-render toàn bộ 1.318 dòng; danh mục sản phẩm phụ thuộc hoàn toàn vào client fetch (Supabase waterfall), ban đầu tải về mảng rỗng.

## Persona Red Flags
- **Alex (Power User / Thợ săn cấu hình)**: Mở bằng laptop 13 inch (1280px) bị ép vào menu hamburger mobile vì breakpoint để `xl:flex`. Muốn lọc nhanh máy theo RAM 16GB hay SSD NVMe thì trang chủ không có bộ lọc sâu.
- **Jordan (Sinh viên lần đầu mua laptop cũ, sợ bị lừa)**: Rất thích Modal QC, nhưng kéo xuống chân trang thấy mâu thuẫn giữa Tây Ninh và Long An, bấm vào link "Quy định bảo hành" thì trang chỉ giật nhẹ tại chỗ không ra văn bản cam kết nào, nảy sinh nghi ngờ website lừa đảo.
- **Chú Ba (Chủ tiệm tạp hóa 58 tuổi)**: Muốn đặt dịch vụ vệ sinh máy tính bàn 100k, bấm nút ở Gói 1 thì bị văng sang trang bán laptop 8 triệu, tưởng bị "treo đầu dê bán thịt chó".

## Minor Observations
- Hiệu ứng chấm xanh nhấp nháy (`animate-ping`, `animate-pulse`) xuất hiện đồng thời ở 4 vị trí khác nhau tạo cảm giác xao nhãng.
- Nút WhatsApp ở Việt Nam (đặc biệt Tây Ninh, Long An) hầu như không ai dùng ngoài Zalo và gọi trực tiếp, gây rác giao diện.
- Nút CTA to màu đỏ "Xem toàn bộ kho hàng" đặt cắt ngang giữa mục Linh kiện và Key bản quyền khiến khách tưởng trang đã hết.

## Questions to Consider
- *Tại sao quy trình kiểm định 4 bước - thứ chứng minh mạnh mẽ nhất cho cam kết "An Tâm" - lại bị đặt tận mục số 4 sau cả gói sửa chữa thay vì đặt ngay dưới Hero?*
- *Có cần thiết duy trì 5 nút liên hệ nổi cố định trên mobile khi 99% khách hàng Việt Nam chỉ liên hệ qua Zalo và Hotline?*
- *Có nên tách component 1.318 dòng thành các section độc lập và chuyển dữ liệu kho máy sang Server Component (SSR)?*
