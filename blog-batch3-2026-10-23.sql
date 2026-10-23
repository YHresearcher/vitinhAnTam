-- ============================================================
-- Vi Tinh An Tam — 2026-10-23 — Blog dot 3
-- Bai 7: Laptop cu cho sinh vien duoi 8 trieu
-- Bai 8: May tinh cho ke toan chay MISA
-- Bai 9: Kiem tra pin laptop cu / do chai pin
-- Chay TUNG lenh mot, bao cao ket qua tung lenh.
-- ============================================================

-- BAI 7: Laptop cu cho sinh vien
INSERT INTO public.blog_posts
  (id, title, slug, excerpt, content, category_id, tags, author_name, status,
   meta_title, meta_description, focus_keyword, faq_schema,
   reading_time_minutes, word_count, service_cta_type, view_count,
   published_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Laptop Cũ Cho Sinh Viên: Chọn Sao Để Dùng Tốt Hết 4 Năm Học Với Dưới 8 Triệu?',
  'laptop-cu-cho-sinh-vien-duoi-8-trieu',
  'Dưới 8 triệu vẫn mua được laptop cũ bền cho sinh viên: các dòng ThinkPad, Latitude, EliteBook đáng mua, cấu hình theo từng nhóm ngành và 5 tiêu chí riêng cho sinh viên.',
  $html$<p>Với ngân sách <strong>dưới 8 triệu đồng</strong>, sinh viên hoàn toàn có thể mua được một chiếc laptop cũ dòng doanh nghiệp như <strong>ThinkPad T480/T490, Dell Latitude 5400/5420 hay HP EliteBook 840</strong> với Core i5 thế hệ 8 trở lên, RAM 8–16GB và SSD 256GB — đủ mượt cho học online, làm bài tập, đồ án và cả lập trình cơ bản, dùng tốt hết 4 năm học nếu chọn đúng. Bài này chỉ rõ nên chọn cấu hình nào theo nhóm ngành và những lỗi chọn máy mà sinh viên hay mắc nhất.</p>

<h2>Sinh viên thực sự cần cấu hình gì?</h2>
<h3>Nhóm ngành kinh tế, xã hội, ngôn ngữ</h3>
<p>Nhu cầu chủ yếu là Word, PowerPoint, Excel, học online qua Zoom/Teams và tra cứu tài liệu. Cấu hình <strong>Core i5 thế hệ 8, RAM 8GB, SSD 256GB</strong> là dư sức; hãy dành phần ngân sách còn lại cho pin khỏe và màn hình đẹp thay vì cấu hình cao hơn.</p>
<h3>Nhóm ngành công nghệ thông tin</h3>
<p>Lập trình cần <strong>RAM 16GB</strong> (chạy máy ảo, Docker, nhiều IDE cùng lúc) và quan trọng nhất là máy <strong>nâng cấp được RAM về sau</strong> — chọn các đời có 2 khe RAM như ThinkPad dòng T hoặc Latitude 5xxx, tránh máy RAM hàn chết 8GB.</p>
<h3>Nhóm ngành kỹ thuật, thiết kế nhẹ</h3>
<p>Ngoài cấu hình như nhóm IT, nên ưu tiên <strong>màn hình từ 14 inch, độ sáng tốt</strong> để nhìn bản vẽ và làm Photoshop/Canva không mỏi mắt. Nhu cầu render 3D nặng thì nên cân nhắc máy trạm cũ hoặc PC — laptop dưới 8 triệu chỉ phù hợp thiết kế 2D nhẹ.</p>

<h2>Gợi ý theo từng mức ngân sách</h2>
<table>
<thead><tr><th>Ngân sách</th><th>Dòng máy tham khảo</th><th>Cấu hình điển hình</th></tr></thead>
<tbody>
<tr><td>5–6 triệu</td><td>ThinkPad T480, Latitude 5400, EliteBook 840 G5</td><td>Core i5 gen 8, RAM 8GB, SSD 256GB</td></tr>
<tr><td>6–7 triệu</td><td>ThinkPad T490, Latitude 5410/5420, EliteBook 840 G6/G7</td><td>Core i5 gen 10, RAM 8–16GB, SSD 256–512GB</td></tr>
<tr><td>7–8 triệu</td><td>ThinkPad T14 Gen 1, Latitude 5420, EliteBook 840 G8</td><td>Core i5 gen 10/11, RAM 16GB, SSD 512GB</td></tr>
</tbody>
</table>
<p><em>Giá và cấu hình tham khảo tại thời điểm viết (10/2026), thay đổi theo tình trạng từng máy.</em></p>

<h2>5 tiêu chí riêng dành cho sinh viên</h2>
<h3>1. Nhẹ và pin khỏe để mang đi học cả ngày</h3>
<p>Ưu tiên máy dưới 1,5 kg và <a href="/tin-tuc/kiem-tra-pin-laptop-cu-do-chai-pin">pin còn từ 80% sức khỏe trở lên</a> — bạn sẽ mang máy qua lại giữa lớp, thư viện và quán cà phê mỗi ngày.</p>
<h3>2. Nâng cấp được để "lớn" cùng bạn</h3>
<p>Năm nhất RAM 8GB là đủ, năm ba làm đồ án có thể cần 16GB. Máy nâng cấp được giúp bạn chỉ tốn vài trăm nghìn nâng RAM thay vì đổi máy mới.</p>
<h3>3. Bền, chịu được va đập nhẹ trong balo</h3>
<p>Đây là lý do nên chọn dòng doanh nghiệp thay vì laptop phổ thông cũ: khung cứng, bản lề chắc, linh kiện thay rẻ nếu lỡ làm hỏng (xem thêm bài <a href="/tin-tuc/thinkpad-vs-elitebook-vs-latitude-chon-dong-nao">so sánh ThinkPad, EliteBook và Latitude</a>).</p>
<h3>4. Đủ cổng kết nối</h3>
<p>Cần ít nhất cổng HDMI để thuyết trình, USB cho chuột và USB dữ liệu, và Wi-Fi ổn định. Hầu hết laptop business đều đáp ứng tốt.</p>
<h3>5. Có bảo hành rõ ràng và hỗ trợ từ xa</h3>
<p>Sinh viên ở xa nhà, máy hỏng giữa kỳ thi là ác mộng. Chọn nơi bán có <a href="/tin-tuc/may-tinh-cu-bao-hanh-6-thang-quyen-loi">bảo hành 6 tháng đồng loạt</a> và hỗ trợ xử lý từ xa — tại Vi Tính An Tâm, nhiều lỗi phần mềm được hỗ trợ ngay qua UltraViewer dù bạn đang ở tỉnh khác.</p>

<h2>Những sai lầm sinh viên hay mắc khi mua laptop cũ</h2>
<p><strong>Mua laptop gaming cũ:</strong> cấu hình nghe mạnh nhưng máy nặng 2,5 kg trở lên, pin yếu, quạt ồn và thường đã "cày" game nhiều năm. <strong>Mua máy siêu mỏng hàn chết RAM 4–8GB:</strong> rẻ lúc mua nhưng không nâng cấp được, hai năm sau là đuối. <strong>Ham đời máy quá cũ giá rẻ:</strong> Core i thế hệ 7 trở về trước không cài được Windows 11 chính thức, ngày càng nhiều phần mềm học tập yêu cầu hệ điều hành mới. <strong>Bỏ qua kiểm tra pin và bản lề:</strong> hai chi phí phát sinh phổ biến nhất sau khi mua máy cũ — hãy áp dụng đủ <a href="/tin-tuc/mua-may-tinh-van-phong-cu-7-tieu-chi-kiem-tra">7 tiêu chí kiểm tra máy cũ</a> trước khi xuống tiền.</p>

<h2>Câu hỏi thường gặp</h2>
<h3>8 triệu có mua được laptop học lập trình không?</h3>
<p>Được. ThinkPad T490 hoặc Latitude 5420 với RAM 16GB và SSD 512GB trong tầm giá này đủ cho học lập trình các năm đầu và giữa; khi cần nặng hơn, bạn nâng RAM lên 32GB thay vì đổi máy.</p>
<h3>Laptop cũ có dùng hết 4 năm đại học không?</h3>
<p>Có, nếu chọn dòng doanh nghiệp đời 2019 trở đi, SSD còn khỏe và pin từ 80% trở lên. Đây là nhóm máy được thiết kế để doanh nghiệp dùng 5–7 năm, nên 4 năm học là mục tiêu hoàn toàn khả thi.</p>
<h3>Sinh viên ở trọ nên mua laptop hay PC?</h3>
<p>Nên mua laptop: gọn, mang lên lớp và về quê dễ dàng, có pin nên không sợ mất điện giữa buổi học online. PC chỉ hợp nếu bạn ở cố định lâu dài và cần màn hình lớn làm đồ họa.</p>$html$,
  '18ca3f15-9ff7-471e-940b-f4bfc051f630',
  ARRAY['laptop cũ cho sinh viên', 'laptop dưới 8 triệu', 'thinkpad cũ', 'laptop học tập'],
  'Vi Tính An Tâm',
  'published',
  'Laptop Cũ Cho Sinh Viên Dưới 8 Triệu: Chọn Sao Để Dùng Hết 4 Năm Học?',
  'Dưới 8 triệu mua được laptop cũ nào cho sinh viên? Gợi ý ThinkPad, Latitude, EliteBook theo từng nhóm ngành, cấu hình cần thiết và 5 tiêu chí chọn máy dùng bền hết 4 năm học.',
  'laptop cũ cho sinh viên',
  '[{"question":"8 triệu có mua được laptop học lập trình không?","answer":"Được. ThinkPad T490 hoặc Dell Latitude 5420 với RAM 16GB, SSD 512GB trong tầm giá này đủ cho học lập trình; khi cần nặng hơn có thể nâng RAM lên 32GB thay vì đổi máy."},{"question":"Laptop cũ có dùng hết 4 năm đại học không?","answer":"Có, nếu chọn dòng doanh nghiệp đời 2019 trở đi, SSD còn khỏe và pin từ 80% trở lên — nhóm máy này được thiết kế để dùng bền 5–7 năm."},{"question":"Sinh viên ở trọ nên mua laptop hay PC?","answer":"Nên mua laptop vì gọn, dễ mang đi học và về quê, có pin nên không sợ mất điện giữa buổi học online."}]'::jsonb,
  5, 830, 'none', 0, now(), now(), now()
);

-- BAI 8: May tinh cho ke toan
INSERT INTO public.blog_posts
  (id, title, slug, excerpt, content, category_id, tags, author_name, status,
   meta_title, meta_description, focus_keyword, faq_schema,
   reading_time_minutes, word_count, service_cta_type, view_count,
   published_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Máy Tính Cho Kế Toán: Cấu Hình Nào Chạy MISA, Excel Và Hóa Đơn Điện Tử Mượt, Ổn Định?',
  'may-tinh-cho-ke-toan-cau-hinh-chay-misa',
  'Kế toán cần máy tính cấu hình gì để chạy MISA, Excel nặng, phần mềm hóa đơn điện tử và token chữ ký số ổn định cả ngày? Cấu hình chuẩn và những chi tiết hay bị bỏ qua.',
  $html$<p>Máy tính cho kế toán không cần cấu hình mạnh — nó cần <strong>ổn định và đủ RAM</strong>. Cấu hình chuẩn cho hầu hết vị trí kế toán là: <strong>Core i5 thế hệ 8 trở lên, RAM 16GB, SSD 256–512GB</strong>, kèm màn hình đủ lớn để mở hai cửa sổ đối chiếu. Điểm khiến máy kế toán hay "treo" không phải CPU yếu, mà là RAM thiếu khi MISA, Excel nhiều sheet, trình duyệt tra cứu hóa đơn và phần mềm ký số chạy cùng lúc.</p>

<h2>Một ngày của máy kế toán: những gì chạy cùng lúc</h2>
<p>Hãy hình dung các ứng dụng mở đồng thời trên máy của một kế toán viên: phần mềm kế toán (MISA, FAST hoặc tương tự), vài file Excel trong đó có file hàng chục nghìn dòng, trình duyệt với cổng hóa đơn điện tử và trang thuế, phần mềm quản lý token chữ ký số, Zalo và email trao đổi chứng từ. Tổng cộng dễ dàng vượt 8GB RAM — đó là lý do <strong>RAM 16GB là khoản đầu tư đáng giá nhất</strong> cho máy kế toán, hơn hẳn việc nâng CPU.</p>
<p>Yếu tố thứ hai là <strong>SSD còn khỏe</strong>: mở phần mềm, tải dữ liệu nhiều năm và xuất báo cáo đều phụ thuộc tốc độ ổ cứng. Máy chậm dần theo thời gian thường do SSD xuống cấp — xem cách nhận biết ở bài <a href="/tin-tuc/dau-hieu-ssd-sap-hong-cach-kiem-tra-suc-khoe-o-cung">5 dấu hiệu SSD sắp hỏng</a>.</p>

<h2>PC đồng bộ hay laptop cho kế toán?</h2>
<h3>PC đồng bộ + màn hình 24 inch: lựa chọn phổ biến nhất</h3>
<p>Ngồi cố định cả ngày, màn hình lớn giúp đối chiếu số liệu đỡ mỏi mắt và ít sai sót. PC đồng bộ cũ dòng doanh nghiệp (Dell OptiPlex, HP EliteDesk) chạy êm cả ngày, linh kiện thay rẻ, chi phí mỗi bộ thấp — phù hợp trang bị cho cả phòng kế toán với cấu hình đồng nhất, dễ hỗ trợ và thay thế lẫn nhau.</p>
<h3>Laptop doanh nghiệp: khi cần linh hoạt</h3>
<p>Phù hợp kế toán dịch vụ làm cho nhiều công ty, hay phải mang máy về nhà làm thêm cuối tháng, hoặc cần mang theo khi đi quyết toán. Nên kết hợp thêm màn hình rời tại bàn làm việc cố định để có không gian đối chiếu rộng rãi.</p>

<h2>4 chi tiết kế toán hay bỏ qua khi chọn máy</h2>
<h3>1. Cổng USB cho token chữ ký số</h3>
<p>Token ký số hóa đơn và khai thuế cắm qua USB, một số đời token khá kén cổng. Hãy chọn máy có nhiều cổng USB và thử cắm token ngay khi nhận máy.</p>
<h3>2. Sao lưu dữ liệu kế toán</h3>
<p>Dữ liệu kế toán là tài sản không thể làm lại. Dù máy tốt đến đâu, hãy sao lưu thư mục dữ liệu ra ổ cứng ngoài hoặc đám mây theo lịch cố định — ổ cứng hỏng bất ngờ là rủi ro có thật với mọi máy, mới hay cũ.</p>
<h3>3. Windows và Office bản quyền sạch</h3>
<p>Máy chứa dữ liệu tài chính và tài khoản ngân hàng của công ty — tuyệt đối tránh Windows "bẻ khóa" tiềm ẩn mã độc đánh cắp thông tin. Chọn máy có bản quyền số theo máy và hiểu rõ các loại key như bài <a href="/tin-tuc/key-windows-office-ban-quyen-la-gi-phan-biet-cac-loai-key">phân biệt key Windows, Office bản quyền</a>.</p>
<h3>4. Bảo hành và tốc độ hỗ trợ</h3>
<p>Máy kế toán dừng giữa kỳ quyết toán là thiệt hại thật. Ưu tiên nơi bán có <a href="/tin-tuc/may-tinh-cu-bao-hanh-6-thang-quyen-loi">bảo hành 6 tháng đồng loạt</a>, hỗ trợ từ xa nhanh qua UltraViewer và có máy linh kiện thay thế sẵn — tiêu chí này quan trọng không kém cấu hình.</p>

<h2>Trang bị cho phòng kế toán nhiều máy</h2>
<p>Với đội 3–5 kế toán, nên chọn <strong>đồng nhất một cấu hình và một dòng máy</strong>: dễ cài đặt đồng loạt, linh kiện dùng chung, khi một máy lỗi có thể đổi ổ SSD sang máy khác để làm việc tiếp ngay. Chi phí mỗi bộ máy cũ dòng doanh nghiệp chỉ bằng một phần so với máy mới, mà trải nghiệm làm việc gần như tương đương. Bạn có thể xem các máy đang có sẵn tại <a href="/#san-pham">trang sản phẩm</a> hoặc gọi <strong>0909.053.058</strong> để được tư vấn theo số lượng nhân sự.</p>

<h2>Câu hỏi thường gặp</h2>
<h3>RAM 8GB có đủ cho kế toán không?</h3>
<p>Đủ nếu chỉ chạy phần mềm kế toán và Excel nhẹ. Nhưng khi mở đồng thời MISA, file Excel lớn, trình duyệt hóa đơn điện tử và phần mềm ký số, 8GB dễ bị đầy gây treo máy — RAM 16GB là mức nên chọn cho kế toán làm việc toàn thời gian.</p>
<h3>Máy cũ có cài được MISA và phần mềm ký số không?</h3>
<p>Được hoàn toàn bình thường. Các phần mềm kế toán và ký số chạy tốt trên Windows 10/11; máy đời Core i5 thế hệ 8 trở lên đáp ứng vượt yêu cầu của các phần mềm này.</p>
<h3>Dữ liệu kế toán trên máy cũ có an toàn không?</h3>
<p>An toàn nếu máy được cài Windows sạch bản quyền, SSD còn khỏe và có thói quen sao lưu định kỳ ra ổ cứng ngoài hoặc đám mây. Rủi ro lớn nhất không nằm ở việc máy cũ hay mới, mà ở phần mềm bẻ khóa và việc không sao lưu.</p>$html$,
  '18ca3f15-9ff7-471e-940b-f4bfc051f630',
  ARRAY['máy tính cho kế toán', 'máy chạy misa', 'máy tính văn phòng', 'cấu hình kế toán'],
  'Vi Tính An Tâm',
  'published',
  'Máy Tính Cho Kế Toán: Cấu Hình Chạy MISA, Excel, Hóa Đơn Điện Tử Mượt',
  'Kế toán cần cấu hình gì? Core i5, RAM 16GB, SSD khỏe cho MISA, Excel nặng và token chữ ký số. Kinh nghiệm chọn PC đồng bộ và laptop cũ ổn định cho phòng kế toán tại Tây Ninh.',
  'máy tính cho kế toán',
  '[{"question":"RAM 8GB có đủ cho kế toán không?","answer":"Đủ cho nhu cầu nhẹ, nhưng khi chạy đồng thời MISA, Excel lớn, trình duyệt hóa đơn điện tử và phần mềm ký số, 8GB dễ đầy gây treo máy. RAM 16GB là mức nên chọn cho kế toán toàn thời gian."},{"question":"Máy cũ có cài được MISA và phần mềm ký số không?","answer":"Được hoàn toàn bình thường trên Windows 10/11; máy Core i5 thế hệ 8 trở lên đáp ứng vượt yêu cầu của các phần mềm kế toán và ký số."},{"question":"Dữ liệu kế toán trên máy cũ có an toàn không?","answer":"An toàn nếu cài Windows sạch bản quyền, SSD còn khỏe và sao lưu định kỳ. Rủi ro lớn nhất là phần mềm bẻ khóa và không sao lưu, không phải máy cũ hay mới."}]'::jsonb,
  5, 840, 'none', 0, now(), now(), now()
);

-- BAI 9: Kiem tra pin laptop cu
INSERT INTO public.blog_posts
  (id, title, slug, excerpt, content, category_id, tags, author_name, status,
   meta_title, meta_description, focus_keyword, faq_schema,
   reading_time_minutes, word_count, service_cta_type, view_count,
   published_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Kiểm Tra Pin Laptop Cũ: Độ Chai Bao Nhiêu Thì Nên Mua, Bao Nhiêu Thì Nên Bỏ?',
  'kiem-tra-pin-laptop-cu-do-chai-pin',
  'Cách tự kiểm tra pin laptop cũ bằng lệnh có sẵn trên Windows trong 1 phút: xem độ chai, chu kỳ sạc và các dấu hiệu pin hỏng — mốc 80% là ranh giới nên biết trước khi mua.',
  $html$<p>Pin là linh kiện quyết định trải nghiệm của một chiếc laptop cũ, và cũng là chỗ người mua dễ bị "qua mặt" nhất. Nguyên tắc ngắn gọn: <strong>pin còn từ 80% sức khỏe trở lên (độ chai dưới 20%) là nên mua; 70–80% chấp nhận được nếu bạn ít di chuyển hoặc giá đã trừ tương xứng; dưới 70% nên bỏ qua</strong> hoặc tính thêm chi phí thay pin. Tin tốt là bạn tự kiểm tra được con số này trong khoảng 1 phút bằng công cụ có sẵn trên Windows, không cần cài phần mềm.</p>

<h2>Độ chai pin là gì?</h2>
<p>Mỗi viên pin có <strong>dung lượng thiết kế</strong> (Design Capacity) do nhà sản xuất công bố và <strong>dung lượng sạc đầy thực tế hiện tại</strong> (Full Charge Capacity) giảm dần theo thời gian sử dụng. Tỉ lệ giữa hai con số là sức khỏe pin: ví dụ pin thiết kế 56.000 mWh nhưng nay sạc đầy chỉ còn 45.000 mWh thì sức khỏe đạt khoảng 80%, tức đã chai 20%. Con số liên quan thứ hai là <strong>chu kỳ sạc</strong> (Cycle Count) — số lần pin được sạc tương đương 100% dung lượng cộng dồn.</p>

<h2>Tự kiểm tra pin bằng báo cáo có sẵn trên Windows</h2>
<h3>Bước 1: Mở cửa sổ lệnh</h3>
<p>Nhấn phím Windows, gõ <strong>cmd</strong> và mở Command Prompt (hoặc Windows PowerShell).</p>
<h3>Bước 2: Chạy lệnh tạo báo cáo</h3>
<p>Gõ lệnh <strong>powercfg /batteryreport</strong> rồi nhấn Enter. Windows sẽ tạo một file báo cáo dạng trang web và hiện đường dẫn của file (thường nằm trong thư mục người dùng).</p>
<h3>Bước 3: Đọc hai con số quan trọng</h3>
<p>Mở file báo cáo, tìm mục pin: ghi lại <strong>DESIGN CAPACITY</strong> và <strong>FULL CHARGE CAPACITY</strong> rồi chia hai con số cho nhau để ra phần trăm sức khỏe; xem thêm <strong>CYCLE COUNT</strong> ở cùng mục. Khi đi mua máy, cứ yêu cầu người bán cho chạy lệnh này ngay trước mặt — nơi bán uy tín sẽ không ngại.</p>

<h2>Các mốc đánh giá sức khỏe pin</h2>
<table>
<thead><tr><th>Sức khỏe pin</th><th>Đánh giá</th><th>Lời khuyên</th></tr></thead>
<tbody>
<tr><td>90–100%</td><td>Rất tốt</td><td>Pin gần như mới — yên tâm mua nếu các tiêu chí khác đạt</td></tr>
<tr><td>80–90%</td><td>Tốt</td><td>Mức chuẩn của máy cũ chất lượng; đủ dùng văn phòng 4–6 giờ tùy máy</td></tr>
<tr><td>70–80%</td><td>Chấp nhận có điều kiện</td><td>Hợp với người dùng chủ yếu cắm sạc tại bàn, hoặc giá bán đã giảm tương xứng</td></tr>
<tr><td>Dưới 70%</td><td>Không nên mua</td><td>Thời lượng sử dụng ngắn và tụt nhanh; chỉ cân nhắc nếu dòng máy thay pin rẻ và giá đã trừ đủ</td></tr>
</tbody>
</table>

<h2>Dấu hiệu pin hỏng không cần xem số cũng nhận ra</h2>
<p><strong>Pin phồng:</strong> bàn phím hoặc touchpad bị đội lên, khe hở ở nắp máy — dấu hiệu nguy hiểm, tuyệt đối không mua và cũng nên ngừng dùng nếu máy của bạn gặp tình trạng này. <strong>Sập nguồn ở 20–30%:</strong> phần trăm pin báo không còn đáng tin. <strong>Tụt phần trăm rất nhanh</strong> trong vài phút đầu rút sạc. <strong>Chỉ dùng được khi cắm sạc:</strong> pin thực tế đã chết dù phần mềm có báo bao nhiêu phần trăm đi nữa. Hãy đối chiếu các dấu hiệu này với con số trong báo cáo để có bức tranh đầy đủ.</p>

<h2>Nếu phải thay pin thì tốn bao nhiêu?</h2>
<p>Pin thay cho các dòng laptop doanh nghiệp phổ biến (ThinkPad, EliteBook, Latitude) có giá tham khảo khoảng <strong>500.000–1.200.000 đồng</strong> tùy dòng và loại pin, và thường thay khá dễ — riêng ThinkPad T480 còn dùng pin rời tháo lắp không cần dụng cụ. Khi tính bài toán mua máy pin yếu giá rẻ, hãy cộng chi phí này vào giá máy rồi so sánh với máy pin khỏe sẵn, thay vì chỉ nhìn giá niêm yết. Đây cũng là một trong <a href="/tin-tuc/mua-may-tinh-van-phong-cu-7-tieu-chi-kiem-tra">7 tiêu chí kiểm tra khi mua máy cũ</a> mà bạn nên áp dụng đồng bộ.</p>

<h2>Cách Vi Tính An Tâm xử lý chuyện pin</h2>
<p>Pin là linh kiện hao mòn nên cửa hàng chọn minh bạch bằng số liệu thay vì lời hứa chung chung: mọi laptop bán ra đều được kiểm tra và <strong>báo rõ sức khỏe pin, đạt từ 80% trở lên</strong>, khách xem con số thực tế trước khi quyết định. Phần cứng còn lại của máy được <a href="/tin-tuc/may-tinh-cu-bao-hanh-6-thang-quyen-loi">bảo hành đồng loạt 6 tháng</a> toàn bộ máy. Nếu chiếc máy bạn đang dùng có dấu hiệu pin phồng hoặc chai nặng, hãy mang đến cửa hàng tại 52 Nguyễn Cửu Vân, phường Long An, tỉnh Tây Ninh để kiểm tra trực tiếp, hoặc gọi <strong>0909.053.058</strong>.</p>

<h2>Câu hỏi thường gặp</h2>
<h3>Chu kỳ sạc bao nhiêu là nhiều?</h3>
<p>Pin laptop thường bắt đầu chai rõ sau khoảng 800–1.000 chu kỳ sạc. Tuy vậy, phần trăm sức khỏe vẫn là con số quyết định: một viên pin 600 chu kỳ nhưng còn 85% sức khỏe vẫn tốt hơn pin 300 chu kỳ chỉ còn 72%.</p>
<h3>Pin 85% thì dùng được mấy tiếng?</h3>
<p>Tùy dòng máy và tác vụ: laptop doanh nghiệp 14 inch pin thiết kế khoảng 50–56 Wh ở mức 85% sức khỏe thường cho 4–6 giờ làm việc văn phòng (soạn thảo, web, sáng màn hình vừa phải); xem video liên tục hoặc mở nhiều ứng dụng nặng sẽ ít hơn.</p>
<h3>Có nên mua máy pin chai giá rẻ rồi tự thay pin?</h3>
<p>Được, nếu giá máy đã trừ đủ chi phí thay pin và đó là dòng dễ thay pin như ThinkPad hay Latitude. Hãy tính tổng chi phí (giá máy + pin mới) để so với máy pin khỏe sẵn trước khi quyết định.</p>$html$,
  'c82fec61-48f5-4970-b296-73ac6c151e23',
  ARRAY['kiểm tra pin laptop cũ', 'độ chai pin', 'pin laptop', 'kinh nghiệm mua laptop cũ'],
  'Vi Tính An Tâm',
  'published',
  'Kiểm Tra Pin Laptop Cũ: Độ Chai Bao Nhiêu Thì Nên Mua?',
  'Tự kiểm tra pin laptop cũ trong 1 phút bằng lệnh powercfg /batteryreport: cách đọc độ chai, chu kỳ sạc, các mốc 80% nên mua và dưới 70% nên bỏ qua, cùng dấu hiệu pin phồng nguy hiểm.',
  'kiểm tra pin laptop cũ',
  '[{"question":"Chu kỳ sạc bao nhiêu là nhiều?","answer":"Pin thường chai rõ sau 800–1.000 chu kỳ sạc, nhưng phần trăm sức khỏe mới là con số quyết định: pin 600 chu kỳ còn 85% vẫn tốt hơn pin 300 chu kỳ chỉ còn 72%."},{"question":"Pin 85% thì dùng được mấy tiếng?","answer":"Laptop doanh nghiệp 14 inch pin khoảng 50–56 Wh ở 85% sức khỏe thường cho 4–6 giờ làm việc văn phòng; tác vụ nặng hoặc xem video liên tục sẽ ít hơn."},{"question":"Có nên mua máy pin chai giá rẻ rồi tự thay pin?","answer":"Được nếu giá đã trừ đủ chi phí thay pin (tham khảo 500.000–1.200.000 đồng) và máy thuộc dòng dễ thay pin như ThinkPad hay Latitude; hãy so tổng chi phí với máy pin khỏe sẵn."}]'::jsonb,
  5, 850, 'none', 0, now(), now(), now()
);

-- KIEM TRA TONG THE
SELECT title, slug, status FROM blog_posts ORDER BY published_at;
