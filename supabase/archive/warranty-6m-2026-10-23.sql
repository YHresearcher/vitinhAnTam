-- ============================================================
-- Vi Tinh An Tam — 2026-10-23 — Chinh sach bao hanh dong loat 6 thang
-- Chay TUNG lenh mot trong Supabase SQL Editor, bao cao ket qua tung lenh.
-- ============================================================

-- PHAN A: May ton kho (chua ban) -> bao hanh 6 thang.
-- May da ban (qc_status sold/dealer_sold) giu nguyen dieu khoan luc ban.
-- LUU Y: bang inventory_items KHONG co cot "type" (linh kien nam o bang spare_parts rieng).
-- Ban chay dau tien loi 42703 (column "type" does not exist) — dung ban sua duoi day:
UPDATE inventory_items
SET warranty_months = 6
WHERE COALESCE(qc_status, '') NOT IN ('sold', 'dealer_sold');

-- Kiem tra sau Phan A:
SELECT brand, model, qc_status, warranty_months
FROM inventory_items
ORDER BY created_at;

-- PHAN B: Bai viet 1 — sua cau bao hanh "6–12 thang" thanh chinh sach 6 thang dong loat
-- + cap nhat meta_description + cau tra loi FAQ ve bao hanh.
UPDATE blog_posts
SET content = replace(
      content,
      'Máy cũ tốt đến đâu cũng cần bảo hành thật: tối thiểu 6–12 tháng, có phiếu hoặc tra cứu được theo số S/N và số điện thoại.',
      'Máy cũ tốt đến đâu cũng cần bảo hành thật. Chuẩn nên chọn là <strong>máy tính cũ bảo hành 6 tháng</strong> đồng loạt cho toàn bộ máy, có phiếu hoặc tra cứu được theo số S/N và số điện thoại — đây cũng là chính sách Vi Tính An Tâm đang áp dụng cho mọi dòng máy bán ra.'
    ),
    meta_description = 'Hướng dẫn chọn máy tính văn phòng cũ bảo hành 6 tháng: 7 tiêu chí kiểm tra bo mạch, SSD, pin và chính sách bảo hành cần hỏi rõ trước khi mua, áp dụng tại Tây Ninh.',
    faq_schema = replace(
      faq_schema::text,
      'Máy được bảo hành chu đáo theo chính sách cửa hàng và tra cứu được online bằng số S/N hoặc số điện thoại tại trang Tra cứu bảo hành.',
      'Mọi máy tại Vi Tính An Tâm đều được bảo hành đồng loạt 6 tháng toàn bộ máy, và tra cứu được online bằng số S/N hoặc số điện thoại tại trang Tra cứu bảo hành.'
    )::jsonb
WHERE slug = 'mua-may-tinh-van-phong-cu-7-tieu-chi-kiem-tra';

-- PHAN C: Bai tru cot — "may tinh cu bao hanh 6 thang"
INSERT INTO public.blog_posts
  (id, title, slug, excerpt, content, category_id, tags, author_name, status,
   meta_title, meta_description, focus_keyword, faq_schema,
   reading_time_minutes, word_count, service_cta_type, view_count,
   published_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Máy Tính Cũ Bảo Hành 6 Tháng: Quyền Lợi Gồm Những Gì, Khác Gì "Bao Test" 7 Ngày?',
  'may-tinh-cu-bao-hanh-6-thang-quyen-loi',
  'Bảo hành 6 tháng đồng loạt cho máy tính cũ gồm những quyền lợi gì, áp dụng cho linh kiện nào, khác gì "bao test 7 ngày"? Vi Tính An Tâm giải thích minh bạch để bạn yên tâm trước khi mua.',
  $html$<p>Khi mua máy tính cũ, câu hỏi quan trọng nhất không phải "máy này giá bao nhiêu" mà là <strong>"lỗi thì ai chịu, trong bao lâu"</strong>. Tại Vi Tính An Tâm, mọi máy tính cũ — PC đồng bộ và laptop doanh nghiệp — đều được <strong>bảo hành đồng loạt 6 tháng toàn bộ máy</strong>, không phân biệt dòng máy hay giá bán. Bài này giải thích rõ quyền lợi đó gồm những gì và khác gì kiểu "bao test 7 ngày" phổ biến trên thị trường máy cũ.</p>

<h2>"Bảo hành đồng loạt 6 tháng" nghĩa là gì?</h2>
<p><strong>Đồng loạt</strong> nghĩa là mọi máy bán ra đều cùng một thời hạn 6 tháng — không có chuyện máy đắt bảo hành lâu, máy rẻ bảo hành ngắn, và không cần mặc cả. <strong>Toàn bộ máy</strong> nghĩa là phạm vi bảo hành bao phủ phần cứng của cả chiếc máy: thân máy, mainboard, CPU, RAM, ổ cứng và nguồn đối với PC; mainboard, CPU, RAM, ổ cứng, bàn phím và màn hình đối với laptop.</p>
<p>Riêng <strong>pin laptop</strong> là linh kiện hao mòn theo thời gian nên được xử lý minh bạch theo cách khác: trước khi bán, pin được kiểm tra và báo rõ sức khỏe (máy bán ra có pin đạt từ 80% trở lên), khách xem số liệu thực tế rồi mới quyết định — thay vì hứa bảo hành pin dài hạn một cách hình thức.</p>

<h2>So sánh: bảo hành 6 tháng, bao test 7 ngày và bán đứt</h2>
<table>
<thead><tr><th>Tiêu chí</th><th>Bảo hành đồng loạt 6 tháng</th><th>"Bao test" 7 ngày</th><th>Bán đứt, không bảo hành</th></tr></thead>
<tbody>
<tr><td>Thời gian được hỗ trợ khi lỗi phần cứng</td><td>6 tháng kể từ ngày bàn giao</td><td>7 ngày đầu</td><td>Không có</td></tr>
<tr><td>Phạm vi</td><td>Toàn bộ phần cứng của máy</td><td>Thường chỉ lỗi "không lên nguồn"</td><td>—</td></tr>
<tr><td>Giấy tờ, tra cứu</td><td>Có phiếu và <a href="/tra-cuu-bao-hanh">tra cứu online bằng S/N</a></td><td>Thường là thỏa thuận miệng</td><td>—</td></tr>
<tr><td>Khi lỗi xảy ra sau 1–2 tháng</td><td>Được sửa hoặc thay linh kiện tương đương miễn phí</td><td>Khách tự chịu chi phí</td><td>Khách tự chịu chi phí</td></tr>
</tbody>
</table>
<p>Thực tế sử dụng cho thấy phần lớn lỗi của máy cũ — ổ cứng xuống cấp, RAM lỗi, quạt và nguồn yếu — thường bộc lộ sau vài tuần đến vài tháng, tức là nằm ngoài cửa sổ 7 ngày "bao test". Đó là lý do thời hạn 6 tháng mới là mốc có ý nghĩa bảo vệ người mua.</p>

<h2>Khi máy lỗi trong thời gian bảo hành, quy trình thế nào?</h2>
<h3>Bước 1: Liên hệ và mô tả tình trạng</h3>
<p>Gọi hotline <strong>0909.053.058</strong> hoặc nhắn Zalo, kèm số S/N của máy. Nhiều lỗi phần mềm và lỗi nhẹ được xử lý ngay từ xa qua UltraViewer, không cần mang máy đi.</p>
<h3>Bước 2: Kiểm tra, xác định lỗi phần cứng</h3>
<p>Nếu cần kiểm tra trực tiếp, khách mang máy đến cửa hàng tại <strong>52 Nguyễn Cửu Vân, phường Long An, tỉnh Tây Ninh</strong> (hoặc thỏa thuận nhận máy tận nơi trong khu vực). Kỹ thuật kiểm tra và thông báo rõ lỗi thuộc phạm vi bảo hành hay không trước khi làm.</p>
<h3>Bước 3: Sửa chữa hoặc thay linh kiện tương đương</h3>
<p>Lỗi phần cứng trong phạm vi bảo hành được sửa chữa hoặc thay linh kiện tương đương <strong>miễn phí</strong>, có thông báo thời gian dự kiến cụ thể — không để khách chờ vô định.</p>
<h3>Bước 4: Bàn giao và cập nhật hồ sơ</h3>
<p>Máy được kiểm tra lại trước khi bàn giao; lịch sử sửa chữa được lưu vào hồ sơ điện tử của máy để lần tra cứu sau minh bạch.</p>

<h2>Những trường hợp không thuộc bảo hành</h2>
<p>Để rõ ràng ngay từ đầu, bảo hành không áp dụng cho: hư hỏng do rơi vỡ, vào nước, cháy nổ hoặc nguồn điện bất ổn; máy đã tự ý tháo sửa tại nơi khác làm mất dấu niêm phong kiểm tra; và lỗi phần mềm phát sinh do người dùng cài đặt thêm (trường hợp này cửa hàng vẫn hỗ trợ xử lý, một số công việc tính phí dịch vụ theo bảng giá công khai). Mọi điều kiện đều được ghi rõ khi bàn giao, không có điều khoản ẩn.</p>

<h2>Vì sao An Tâm chọn đồng loạt 6 tháng thay vì "tùy máy 6–12 tháng"?</h2>
<p>Vì đồng loạt thì <strong>dễ nhớ, dễ kiểm chứng và công bằng</strong>: khách mua máy 5 triệu hay 15 triệu đều được bảo vệ như nhau. Chính sách này cũng buộc cửa hàng phải tuyển chọn đầu vào kỹ — chỉ những máy đạt chuẩn mới dám đứng ra bảo hành nửa năm. Bạn có thể <a href="/tra-cuu-bao-hanh">tra cứu thời hạn bảo hành</a> của bất kỳ máy nào bằng số S/N ngay trên website, và xem các dòng máy đang bán tại <a href="/#san-pham">trang sản phẩm</a>.</p>

<h2>Câu hỏi thường gặp</h2>
<h3>Máy tính cũ bảo hành 6 tháng gồm những gì?</h3>
<p>Gồm toàn bộ phần cứng của máy (thân máy, mainboard, CPU, RAM, ổ cứng, nguồn; laptop thêm bàn phím và màn hình): lỗi phần cứng trong 6 tháng được sửa chữa hoặc thay linh kiện tương đương miễn phí. Pin laptop được kiểm tra và báo rõ sức khỏe từ 80% trở lên trước khi bán.</p>
<h3>Hết 6 tháng bảo hành, máy lỗi thì sao?</h3>
<p>Cửa hàng vẫn nhận sửa chữa với bảng giá linh kiện và tiền công công khai, báo giá trước khi làm. Linh kiện thay mới chính hãng có thời hạn bảo hành riêng theo linh kiện (thường 12–36 tháng tùy loại).</p>
<h3>Máy mua ở nơi khác mang đến An Tâm sửa được không?</h3>
<p>Được. Vi Tính An Tâm nhận kiểm tra và sửa chữa máy từ mọi nguồn, báo tình trạng và chi phí rõ ràng trước khi sửa; khách ở xa có thể đặt lịch qua trang <a href="/dat-lich">đặt lịch sửa chữa</a>.</p>$html$,
  'c82fec61-48f5-4970-b296-73ac6c151e23',
  ARRAY['bảo hành máy tính cũ', 'máy tính cũ bảo hành 6 tháng', 'bao test 7 ngày', 'chính sách bảo hành'],
  'Vi Tính An Tâm',
  'published',
  'Máy Tính Cũ Bảo Hành 6 Tháng Gồm Quyền Lợi Gì? Khác Bao Test 7 Ngày Ra Sao?',
  'Máy tính cũ bảo hành 6 tháng tại Vi Tính An Tâm gồm những quyền lợi gì, áp dụng cho linh kiện nào, khác gì bao test 7 ngày? Giải thích rõ ràng, minh bạch trước khi mua.',
  'máy tính cũ bảo hành 6 tháng',
  '[{"question":"Máy tính cũ bảo hành 6 tháng gồm những gì?","answer":"Gồm toàn bộ phần cứng của máy (thân máy, mainboard, CPU, RAM, ổ cứng, nguồn; laptop thêm bàn phím và màn hình): lỗi phần cứng trong 6 tháng được sửa chữa hoặc thay linh kiện tương đương miễn phí. Pin laptop được kiểm tra và báo rõ sức khỏe từ 80% trở lên trước khi bán."},{"question":"Hết 6 tháng bảo hành, máy lỗi thì sao?","answer":"Cửa hàng vẫn nhận sửa chữa với bảng giá linh kiện và tiền công công khai, báo giá trước khi làm. Linh kiện thay mới chính hãng có thời hạn bảo hành riêng theo linh kiện (thường 12–36 tháng tùy loại)."},{"question":"Máy mua ở nơi khác mang đến An Tâm sửa được không?","answer":"Được. Vi Tính An Tâm nhận kiểm tra và sửa chữa máy từ mọi nguồn, báo tình trạng và chi phí rõ ràng trước khi sửa; khách ở xa có thể đặt lịch qua trang Đặt lịch sửa chữa trên website."}]'::jsonb,
  5, 780, 'none', 0, now(), now(), now()
);

-- PHAN D: Kiem tra tong the
SELECT title, slug, status FROM blog_posts ORDER BY published_at;
