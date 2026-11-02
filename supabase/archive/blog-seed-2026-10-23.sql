-- 3 bài viết SEO đầu tiên cho Vi Tính An Tâm (2026-10-23)
-- Chạy trong Supabase SQL Editor, project xcntykeeeapidreqiueg

INSERT INTO public.blog_posts
  (id, title, slug, excerpt, content, category_id, tags, author_name, status,
   meta_title, meta_description, focus_keyword, faq_schema,
   reading_time_minutes, word_count, service_cta_type, view_count,
   published_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Mua Máy Tính Văn Phòng Cũ: 7 Tiêu Chí Kiểm Tra Để Chọn Đúng Máy Bền, Giá Tốt',
  'mua-may-tinh-van-phong-cu-7-tieu-chi-kiem-tra',
  'Máy tính văn phòng cũ giúp tiết kiệm 40–60% chi phí so với máy mới, nhưng chọn sai là ôm về một "cục nợ" hỏng vặt. Dưới đây là 7 tiêu chí mà kỹ thuật viên Vi Tính An Tâm dùng để tuyển từng chiếc máy — bạn hoàn toàn có thể tự kiểm tra trước khi xuống tiền.',
  $html$
<p>Một bộ máy tính văn phòng mới có giá 10–15 triệu đồng, trong khi một chiếc <strong>máy tính văn phòng cũ</strong> dòng doanh nghiệp (Dell OptiPlex, HP EliteDesk, Lenovo ThinkCentre) chỉ từ 3–6 triệu nhưng độ bền lại nhỉnh hơn hẳn máy phổ thông mới cùng tầm giá. Vấn đề là: máy cũ "hên xui" hay không phụ thuộc hoàn toàn vào khâu kiểm tra. Bài này tổng hợp 7 tiêu chí cốt lõi để bạn chọn đúng chiếc máy chạy ổn định 3–5 năm tiếp theo.</p>

<h2>Vì sao doanh nghiệp nhỏ nên cân nhắc máy tính văn phòng cũ?</h2>
<p>Các dòng máy đồng bộ doanh nghiệp được thiết kế để chạy 8–12 giờ mỗi ngày trong môi trường văn phòng lớn, linh kiện đạt chuẩn cao hơn hẳn máy lắp ráp giá rẻ. Khi các tập đoàn nâng cấp hệ thống, những chiếc máy này ra thị trường với giá chỉ còn 30–40% giá gốc nhưng phần lớn tuổi thọ vẫn còn nguyên. Nếu biết cách kiểm tra, đây là bài toán chi phí rất hời cho kế toán, bán hàng, thu ngân và nhân viên văn phòng.</p>

<h2>7 tiêu chí kiểm tra khi mua máy tính cũ</h2>

<h3>1. Mainboard phải nguyên bản, chưa qua sửa chữa</h3>
<p>Đây là tiêu chí quan trọng nhất. Mainboard từng hàn sửa, thay tụ, "độ" lại đường điện sẽ phát sinh lỗi chập chờn rất khó chẩn đoán. Hãy yêu cầu người bán cho xem bên trong máy: bo mạch phải sạch, không vết hàn lạ, không tụ phồng. Máy tại Vi Tính An Tâm đều được tuyển theo tiêu chí <strong>bo mạch nguyên bản 100%, chưa qua sửa chữa chắp vá</strong>.</p>

<h3>2. Sức khỏe SSD phải từ 90% trở lên</h3>
<p>SSD là linh kiện "hao mòn theo thời gian" rõ nhất. Dùng phần mềm CrystalDiskInfo để xem mục Health Status: dưới 80% là ổ đã chai nhiều, nguy cơ chậm và mất dữ liệu. Máy tốt phải đạt 95–100% và tổng dung lượng đã ghi (Total Host Writes) ở mức thấp so với tuổi thọ thiết kế.</p>

<h3>3. CPU và RAM đủ cho công việc thực tế</h3>
<p>Với nhu cầu văn phòng (Word, Excel, phần mềm kế toán, bán hàng, duyệt web nhiều tab), cấu hình "ngọt" nhất là CPU Intel Core i5 thế hệ 8 trở lên, RAM 8–16GB. Đừng trả thêm tiền cho cấu hình mạnh không dùng tới, nhưng cũng đừng mua RAM 4GB — Windows 11 và Chrome sẽ khiến máy treo liên tục.</p>

<h3>4. Nguồn điện ổn định, đúng công suất</h3>
<p>Bộ nguồn yếu hoặc sắp hỏng là nguyên nhân hàng đầu khiến máy tự khởi động lại, treo ngẫu nhiên. Ưu tiên máy đồng bộ dùng nguồn zin theo hãng; nếu là máy lắp ráp, nguồn phải có công suất thực từ 400W trở lên của thương hiệu rõ ràng.</p>

<h3>5. Nhiệt độ và độ ồn khi chạy tải</h3>
<p>Cho máy chạy thử 15–20 phút với tác vụ nặng (mở nhiều tab, phát video, chạy phần mềm thực tế). Máy tốt phải êm, nhiệt độ CPU ổn định dưới 75°C. Quạt hú to, máy nóng ran là dấu hiệu keo tản nhiệt đã khô hoặc hệ thống tản nhiệt có vấn đề.</p>

<h3>6. Windows phải là bản quyền số sạch</h3>
<p>Nhiều máy cũ trôi nổi được cài Windows bằng công cụ bẻ khóa (crack) — rủi ro mã độc, bị khóa kích hoạt giữa chừng và đặc biệt nguy hiểm với máy chứa dữ liệu kế toán, hóa đơn điện tử. Hãy chọn máy được <strong>kích hoạt bản quyền số Microsoft theo máy</strong>, vào Settings kiểm tra được dòng "Windows is activated with a digital license".</p>

<h3>7. Chính sách bảo hành rõ ràng, tra cứu được</h3>
<p>Máy cũ tốt đến đâu cũng cần bảo hành thật: tối thiểu 6–12 tháng, có phiếu hoặc tra cứu được theo số S/N và số điện thoại. Tránh xa nơi bán "bao test 7 ngày" — phần lớn lỗi máy cũ xuất hiện sau vài tuần sử dụng. Tại Vi Tính An Tâm, khách hàng có thể <a href="/tra-cuu-bao-hanh">tra cứu bảo hành online</a> bất cứ lúc nào bằng S/N của máy.</p>

<h2>Cấu hình tham khảo theo nhu cầu</h2>
<ul>
<li><strong>Kế toán, bán hàng, thu ngân:</strong> Core i5 Gen 8–10, RAM 8GB, SSD 256GB — đủ mượt cho MISA, KiotViet, Excel nhiều file.</li>
<li><strong>Nhân viên văn phòng, CSKH:</strong> Core i5 Gen 8, RAM 16GB, SSD 256GB — thoải mái 20–30 tab trình duyệt.</li>
<li><strong>Thiết kế nhẹ, kỹ thuật:</strong> Core i7, RAM 16–32GB, SSD 512GB, cân nhắc thêm card đồ họa rời.</li>
</ul>

<h2>Mua máy tính văn phòng cũ ở đâu uy tín tại Tây Ninh?</h2>
<p>Tiêu chí chọn nơi mua cũng quan trọng như chọn máy: có địa chỉ cửa hàng rõ ràng, cho kiểm tra máy trực tiếp, bảo hành bằng văn bản và hỗ trợ kỹ thuật sau bán. Vi Tính An Tâm (52 Nguyễn Cửu Vân, phường Long An, tỉnh Tây Ninh) chuyên máy đồng bộ và laptop doanh nghiệp tuyển chọn — mỗi máy đều qua kiểm định phần cứng, vệ sinh, tra keo tản nhiệt trước khi giao, bảo hành chu đáo và hỗ trợ tận nơi khi cần.</p>
<p>Xem các máy đang có sẵn tại <a href="/#san-pham">kho máy Vi Tính An Tâm</a> hoặc gọi hotline <strong>0909.053.058</strong> để được tư vấn cấu hình đúng nhu cầu và ngân sách của bạn.</p>
$html$,
  '9cd43b47-19ec-4050-bedc-c55439f4e23a',
  ARRAY['máy tính cũ','máy văn phòng','kinh nghiệm mua máy','dell optiplex','mua máy tính cũ'],
  'Vi Tính An Tâm',
  'published',
  'Mua Máy Tính Văn Phòng Cũ Cần Kiểm Tra Gì? 7 Tiêu Chí Quan Trọng',
  'Kinh nghiệm mua máy tính văn phòng cũ bền, giá tốt: kiểm tra mainboard, sức khỏe SSD, RAM, nguồn và chính sách bảo hành. Máy tuyển chọn tại Vi Tính An Tâm, Tây Ninh.',
  'máy tính văn phòng cũ',
  '[{"question":"Mua máy tính văn phòng cũ có bền không?","answer":"Có, nếu chọn đúng dòng máy đồng bộ doanh nghiệp (Dell OptiPlex, HP EliteDesk, Lenovo ThinkCentre) với mainboard nguyên bản và SSD còn khỏe. Những dòng này được thiết kế chạy bền 5–7 năm trong môi trường văn phòng."},{"question":"Nên chọn cấu hình nào cho nhân viên kế toán, bán hàng?","answer":"Core i5 thế hệ 8 trở lên, RAM 8–16GB, SSD 256GB là cấu hình cân bằng nhất: chạy mượt phần mềm kế toán, bán hàng và nhiều tab trình duyệt."},{"question":"Máy cũ tại Vi Tính An Tâm được bảo hành bao lâu?","answer":"Máy được bảo hành chu đáo theo chính sách cửa hàng và tra cứu được online bằng số S/N hoặc số điện thoại tại trang Tra cứu bảo hành."}]'::jsonb,
  5, 820, 'none', 0, now(), now(), now()
);

INSERT INTO public.blog_posts
  (id, title, slug, excerpt, content, category_id, tags, author_name, status,
   meta_title, meta_description, focus_keyword, faq_schema,
   reading_time_minutes, word_count, service_cta_type, view_count,
   published_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Máy Tính Chạy Chậm, Treo Đơ: 5 Dấu Hiệu SSD Sắp Hỏng Và Cách Kiểm Tra Sức Khỏe Ổ Cứng',
  'dau-hieu-ssd-sap-hong-cach-kiem-tra-suc-khoe-o-cung',
  'Máy khởi động 5 phút chưa vào Windows, mở Excel thì treo đơ, thỉnh thoảng màn hình xanh? Rất có thể SSD của bạn đã "chai" và sắp hỏng hẳn. Nhận biết sớm 5 dấu hiệu này giúp bạn cứu dữ liệu trước khi quá muộn.',
  $html$
<p>SSD không hỏng đột ngột như nhiều người nghĩ — nó "báo trước" bằng hàng loạt dấu hiệu nhỏ mà chúng ta thường bỏ qua: máy chậm dần, mở file hay đơ, thỉnh thoảng tự khởi động lại. Đến khi SSD chết hẳn, dữ liệu kế toán, hình ảnh, tài liệu trong máy gần như không cứu được. Bài viết này giúp bạn nhận biết sớm và tự <strong>kiểm tra sức khỏe SSD</strong> ngay tại nhà.</p>

<h2>Vì sao SSD bị chai theo thời gian?</h2>
<p>Mỗi ô nhớ trên SSD chỉ chịu được một số lần ghi/xóa nhất định. Sau vài năm sử dụng, các ô nhớ mòn dần, bộ điều khiển phải liên tục "né" vùng lỗi khiến tốc độ đọc ghi giảm mạnh. Cộng thêm nhiệt độ cao và nguồn điện chập chờn, SSD xuống cấp nhanh hơn — đặc biệt ở máy văn phòng chạy liên tục 8–12 giờ mỗi ngày.</p>

<h2>5 dấu hiệu SSD sắp hỏng</h2>

<h3>1. Khởi động và mở phần mềm chậm bất thường</h3>
<p>Máy từng vào Windows trong 15 giây nay mất 2–3 phút, mở Word/Excel phải chờ rất lâu dù cấu hình không yếu. Đây là dấu hiệu kinh điển của SSD đã chai: tốc độ đọc ngẫu nhiên sụt giảm nghiêm trọng.</p>

<h3>2. Máy hay treo đơ vài giây rồi chạy tiếp</h3>
<p>Đang làm việc thì con trỏ chuột đứng hình, phần mềm "Not Responding" vài giây đến vài chục giây. Đó là lúc SSD vấp phải vùng nhớ lỗi và phải thử đọc lại nhiều lần.</p>

<h3>3. Xuất hiện lỗi file và màn hình xanh</h3>
<p>File tự dưng báo corrupted, Windows thỉnh thoảng màn hình xanh (BSOD) khi đang truy xuất dữ liệu, hoặc máy báo lỗi "disk read error" lúc khởi động. Dữ liệu của bạn đang thực sự gặp nguy hiểm ở giai đoạn này.</p>

<h3>4. Phần mềm kiểm tra báo Health thấp, có bad sector</h3>
<p>Đây là bằng chứng rõ ràng nhất: mục Health Status dưới 80%, hoặc xuất hiện cảnh báo vàng/đỏ. Dưới 50% thì nên thay ổ ngay trong tuần, đừng chờ.</p>

<h3>5. Máy nóng và quạt kêu to hơn bình thường</h3>
<p>SSD lỗi khiến hệ thống phải xử lý lại tác vụ liên tục, CPU và ổ cứng đều nóng lên. Nếu máy bỗng dưng ồn và nóng bất thường dù chỉ lướt web, nên kiểm tra tổng thể ngay.</p>

<h2>Cách tự kiểm tra sức khỏe SSD bằng CrystalDiskInfo</h2>
<ul>
<li>Tải phần mềm <strong>CrystalDiskInfo</strong> (miễn phí) và mở lên — thông tin ổ cứng hiện ngay màn hình chính.</li>
<li>Nhìn mục <strong>Health Status</strong>: "Good 100%" là khỏe; dưới 80% là đã chai nhiều; dưới 50% cần thay gấp.</li>
<li>Xem thêm <strong>Temperature</strong> (nhiệt độ nên dưới 50°C khi dùng thường) và <strong>Total Host Writes</strong> (tổng dữ liệu đã ghi — càng cao ổ càng "già").</li>
<li>Nếu trạng thái báo Caution/Bad hoặc có thông số Reallocated Sectors tăng, hãy <strong>sao lưu dữ liệu quan trọng ngay lập tức</strong>.</li>
</ul>

<h2>Thay SSD có mất dữ liệu không? Mất bao lâu?</h2>
<p>Nếu SSD cũ còn đọc được, kỹ thuật viên sẽ sao chép (clone) toàn bộ hệ điều hành, phần mềm và dữ liệu sang SSD mới — bạn nhận lại máy y như cũ, chỉ nhanh hơn hẳn, thường hoàn tất trong 30–60 phút. Trường hợp SSD đã chết hẳn, khả năng cứu dữ liệu phụ thuộc mức độ hỏng và chi phí sẽ cao hơn nhiều — đó là lý do nên thay ổ ngay khi thấy dấu hiệu đầu tiên.</p>
<p>Máy của bạn đang chậm bất thường? Mang máy đến Vi Tính An Tâm (52 Nguyễn Cửu Vân, phường Long An, tỉnh Tây Ninh) để được <strong>kiểm tra sức khỏe ổ cứng miễn phí</strong>, hoặc <a href="/dat-lich">đặt lịch kỹ thuật viên đến tận nơi</a>. Hotline: <strong>0909.053.058</strong>.</p>
$html$,
  'c82fec61-48f5-4970-b296-73ac6c151e23',
  ARRAY['ssd','kiểm tra ổ cứng','máy chạy chậm','thay ssd','sức khỏe ssd'],
  'Vi Tính An Tâm',
  'published',
  '5 Dấu Hiệu SSD Sắp Hỏng & Cách Kiểm Tra Sức Khỏe Ổ Cứng Tại Nhà',
  'Máy khởi động chậm, mở file treo đơ, thỉnh thoảng màn hình xanh? Rất có thể SSD đã chai. Xem 5 dấu hiệu SSD sắp hỏng và cách kiểm tra % sức khỏe ổ cứng trước khi mất dữ liệu.',
  'kiểm tra sức khỏe SSD',
  '[{"question":"SSD báo Health bao nhiêu % thì nên thay?","answer":"Dưới 80% nên lên kế hoạch thay và sao lưu dữ liệu thường xuyên. Dưới 50% hoặc xuất hiện bad sector thì nên thay ngay để tránh mất dữ liệu đột ngột."},{"question":"Thay SSD mới có mất dữ liệu và phần mềm không?","answer":"Không, nếu ổ cũ còn đọc được. Kỹ thuật viên sẽ clone toàn bộ Windows, phần mềm và dữ liệu sang ổ mới, bạn nhận máy về dùng tiếp như cũ."},{"question":"Kiểm tra sức khỏe SSD tại Vi Tính An Tâm có mất phí không?","answer":"Kiểm tra và tư vấn hoàn toàn miễn phí tại cửa hàng 52 Nguyễn Cửu Vân, phường Long An, tỉnh Tây Ninh, hoặc qua lịch hẹn kỹ thuật viên tận nơi."}]'::jsonb,
  4, 700, 'cuu_du_lieu', 0, now(), now(), now()
);

INSERT INTO public.blog_posts
  (id, title, slug, excerpt, content, category_id, tags, author_name, status,
   meta_title, meta_description, focus_keyword, faq_schema,
   reading_time_minutes, word_count, service_cta_type, view_count,
   published_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Key Windows, Office Bản Quyền Là Gì? Phân Biệt Các Loại Key Để Chọn Đúng Cho Văn Phòng',
  'key-windows-office-ban-quyen-la-gi-phan-biet-cac-loai-key',
  'Key Windows vĩnh viễn theo mainboard, key Office vĩnh viễn kích hoạt online, Microsoft 365 dạng thuê bao năm — ba loại này khác nhau thế nào và văn phòng của bạn nên chọn loại nào? Bài viết giải thích rõ ràng, không thuật ngữ khó hiểu.',
  $html$
<p>Rất nhiều máy văn phòng tại Việt Nam vẫn đang dùng Windows và Office "crack" — bẻ khóa bằng công cụ lậu. Hậu quả thường đến bất ngờ: key bị khóa giữa mùa quyết toán, máy dính mã độc qua công cụ crack, dữ liệu kế toán bị mã hóa. Trong khi đó, <strong>key Windows bản quyền</strong> và Office chính hãng hiện đã rẻ hơn rất nhiều so với vài năm trước. Vấn đề là có tới 3 loại key khác nhau và không phải loại nào cũng giống nhau.</p>

<h2>Key bản quyền là gì?</h2>
<p>Key bản quyền là mã kích hoạt do Microsoft cấp, chứng nhận phần mềm trên máy bạn là hợp pháp. Máy được kích hoạt bản quyền sẽ nhận đầy đủ bản vá bảo mật, không bị giới hạn tính năng, không hiện cảnh báo "Activate Windows" và an toàn cho dữ liệu công việc, hóa đơn điện tử, giao dịch ngân hàng.</p>

<h2>Phân biệt 3 loại key phổ biến</h2>

<h3>1. Key Windows — bản quyền số vĩnh viễn theo mainboard</h3>
<p>Windows 10/11 Pro và Home dạng <strong>Digital License</strong>: kích hoạt một lần, bản quyền "số" gắn với mainboard của máy và có hiệu lực vĩnh viễn. Cài lại Windows trên cùng máy vẫn tự kích hoạt lại, không cần nhập key. Đây là loại key phù hợp nhất cho máy văn phòng dùng lâu dài.</p>

<h3>2. Key Office — bản quyền vĩnh viễn, kích hoạt online</h3>
<p>Office 2019, 2021, 2024 Pro Plus dạng Retail: mua một lần, dùng vĩnh viễn bộ Word, Excel, PowerPoint, Outlook — <strong>không tốn phí gia hạn định kỳ</strong>. Key được kích hoạt online một lần khi cài đặt. Lưu ý quan trọng: key Office <em>không</em> gắn theo mainboard như Windows — hai loại key hoạt động theo cơ chế khác nhau, đừng để nơi bán kém uy tín tư vấn lẫn lộn cho bạn.</p>

<h3>3. Microsoft 365 — dạng thuê bao theo năm</h3>
<p>Microsoft 365 (Family/Personal) không phải key vĩnh viễn: đây là gói <strong>thuê bao 12 tháng</strong>, hết hạn phải gia hạn. Bù lại bạn luôn có Office phiên bản mới nhất kèm 1TB OneDrive lưu trữ đám mây. Phù hợp nếu bạn cần đồng bộ tài liệu nhiều thiết bị và thích dùng bản mới nhất.</p>

<h2>Rủi ro khi dùng key giá rẻ bất thường và phần mềm crack</h2>
<ul>
<li><strong>Key bị thu hồi:</strong> key "trôi" thường là key bán lậu theo lô, Microsoft có thể khóa bất cứ lúc nào — máy mất kích hoạt ngay giữa lúc cần việc.</li>
<li><strong>Mã độc từ công cụ crack:</strong> các tool bẻ khóa là nguồn lây virus, trojan đánh cắp mật khẩu ngân hàng và mã hóa dữ liệu đòi tiền chuộc phổ biến nhất trên máy văn phòng.</li>
<li><strong>Không nhận bản vá bảo mật:</strong> máy dùng cho kế toán, hóa đơn điện tử mà thiếu cập nhật là rủi ro trực tiếp cho doanh nghiệp.</li>
</ul>

<h2>Văn phòng của bạn nên chọn loại nào?</h2>
<ul>
<li>Máy cố định dùng lâu dài: <strong>Windows bản quyền số + Office vĩnh viễn</strong> — chi phí một lần, yên tâm nhiều năm.</li>
<li>Người hay đổi máy, cần lưu trữ đám mây và bản mới nhất: <strong>Microsoft 365</strong> theo năm.</li>
<li>Mua máy cũ: ưu tiên máy đã được cài sẵn Windows bản quyền số theo máy để không tốn thêm chi phí key.</li>
</ul>
<p>Tại Vi Tính An Tâm, key Windows và Office đều là hàng chính hãng, <strong>bảo hành 1 đổi 1</strong> nếu lỗi kích hoạt. Xem các loại key đang bán tại <a href="/#san-pham">mục Phần mềm &amp; Key bản quyền</a> hoặc gọi <strong>0909.053.058</strong> để được tư vấn đúng loại key cho nhu cầu của bạn — mua đúng ngay từ đầu luôn rẻ hơn mua rẻ rồi mua lại.</p>
$html$,
  '18ca3f15-9ff7-471e-940b-f4bfc051f630',
  ARRAY['key windows','key office','bản quyền','microsoft 365','cài win bản quyền'],
  'Vi Tính An Tâm',
  'published',
  'Key Windows, Office Bản Quyền Là Gì? Phân Biệt Windows / Office / Microsoft 365',
  'Key Windows bản quyền số vĩnh viễn theo mainboard, Office vĩnh viễn kích hoạt online, Microsoft 365 dạng thuê bao — khác nhau thế nào, nên chọn loại nào cho văn phòng?',
  'key windows bản quyền',
  '[{"question":"Key Windows bản quyền dùng được bao lâu?","answer":"Key Windows dạng bản quyền số (Digital License) có hiệu lực vĩnh viễn theo mainboard của máy. Cài lại Windows trên cùng máy vẫn tự kích hoạt lại, không tốn thêm chi phí."},{"question":"Key Office và Microsoft 365 khác nhau thế nào?","answer":"Key Office (2019/2021/2024) là bản quyền vĩnh viễn, mua một lần kích hoạt online, không phí định kỳ. Microsoft 365 là gói thuê bao 12 tháng, kèm 1TB OneDrive và luôn dùng phiên bản Office mới nhất."},{"question":"Mua key tại Vi Tính An Tâm có được bảo hành không?","answer":"Có. Key Windows và Office chính hãng tại cửa hàng được bảo hành 1 đổi 1 nếu xảy ra lỗi kích hoạt."}]'::jsonb,
  4, 720, 'cai_win', 0, now(), now(), now()
);

-- Kiểm tra sau khi đăng
SELECT title, status, slug FROM public.blog_posts ORDER BY created_at DESC;
