import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vì Sao Chọn An Tâm | Bảng Giải Pháp & Kết Quả Thực Tế',
  description: 'Giải quyết trực tiếp mọi mối lo máy tính của bạn bằng kết quả đo lường được: SSD/RAM mới 100%, Win bản quyền số, xử lý tận nơi 2h tại Long An - Tây Ninh.',
};

export default function WhyUsPage() {
  return (
    <div className="w-full">
      {/* 1. HERO BANNER - CRISP & DIRECT */}
      <section className="relative bg-gradient-to-b from-blue-50/80 via-white to-slate-50/50 py-12 sm:py-16 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-sm">bolt</span>
            <span>RÕ RÀNG • MINH BẠCH • KẾT QUẢ THỰC TẾ</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight font-headline">
            VÌ SAO KHÁCH HÀNG LỰA CHỌN VI TÍNH AN TÂM?
          </h1>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12 text-slate-700">
        {/* 2. BẢNG NGUYÊN NHÂN - KẾT QUẢ (CAUSE & EFFECT MATRIX) */}
        <section className="space-y-6">
          <div className="space-y-4">
            {/* Item 1 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-all grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-5 space-y-1.5 border-b md:border-b-0 md:border-r border-slate-200 pb-3 md:pb-0 md:pr-4">
                <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wide">
                  <span className="material-symbols-outlined text-base">warning</span>
                  <span>Nguyên nhân &amp; Rủi ro cũ</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">Mua máy cũ sợ linh kiện nát, hỏng vặt</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sợ mua nhầm máy chắp vá, SSD cũ sắp chết làm mất dữ liệu, vừa mua vài tháng đã phải tốn tiền sửa.
                </p>
              </div>
              <div className="md:col-span-7 space-y-1.5 md:pl-2">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wide">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  <span>Kết quả thực tế tại An Tâm</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">100% SSD/RAM MỚI • BAO DÙNG THỬ 30 NGÀY</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Bảo hành thiết bị và linh kiện từ 3 đến 36 tháng. Thân máy Dell, HP, IBM loại A được bao dùng thử 30 ngày 1 đổi 1.
                </p>
              </div>
            </div>

            {/* Item 2 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-all grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-5 space-y-1.5 border-b md:border-b-0 md:border-r border-slate-200 pb-3 md:pb-0 md:pr-4">
                <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wide">
                  <span className="material-symbols-outlined text-base">warning</span>
                  <span>Nguyên nhân &amp; Rủi ro cũ</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">Win lậu gây đơ máy, dính virus tống tiền</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Bản Ghost mod lại dính mã độc, bị ngắt giữa chừng khi xuất hóa đơn hay khai thuế kế toán MISA.
                </p>
              </div>
              <div className="md:col-span-7 space-y-1.5 md:pl-2">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wide">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  <span>Kết quả thực tế tại An Tâm</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">100% WINDOWS PRO BẢN QUYỀN SỐ VĨNH VIỄN</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Kích hoạt bản quyền gốc theo máy, tuyệt đối không dùng tool crack lậu. Hệ điều hành sạch giúp máy chạy siêu mượt và an toàn dữ liệu.
                </p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-all grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-5 space-y-1.5 border-b md:border-b-0 md:border-r border-slate-200 pb-3 md:pb-0 md:pr-4">
                <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wide">
                  <span className="material-symbols-outlined text-base">warning</span>
                  <span>Nguyên nhân &amp; Rủi ro cũ</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">E ngại bị &quot;luộc đồ&quot; khi để máy lại tiệm</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tâm lý lo lắng bị tráo đổi RAM, SSD hoặc linh kiện zin khi phải gửi máy qua đêm để sửa chữa.
                </p>
              </div>
              <div className="md:col-span-7 space-y-1.5 md:pl-2">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wide">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  <span>Kết quả thực tế tại An Tâm</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">KỸ THUẬT MỞ: XEM TRỰC TIẾP LẤY LIỀN 20 PHÚT</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Kỹ thuật viên thao tác minh bạch ngay trước mắt bạn. Nâng cấp, vệ sinh xong lấy ngay trong 20–30 phút, không giữ máy ngâm đồ.
                </p>
              </div>
            </div>

            {/* Item 4 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-all grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-5 space-y-1.5 border-b md:border-b-0 md:border-r border-slate-200 pb-3 md:pb-0 md:pr-4">
                <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wide">
                  <span className="material-symbols-outlined text-base">warning</span>
                  <span>Nguyên nhân &amp; Rủi ro cũ</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">Bận giờ làm việc, bảo hành chờ cả tuần</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Không thể mang máy đi tiệm trong giờ hành chính; khi bị lỗi phải gửi chành xe chờ đợi gián đoạn công việc.
                </p>
              </div>
              <div className="md:col-span-7 space-y-1.5 md:pl-2">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wide">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  <span>Kết quả thực tế tại An Tâm</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">XỬ LÝ TẬN NƠI 2H • PHỤC VỤ KHUNG 17:30 - 21:00</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Đội kỹ thuật hỗ trợ giao máy, thay thế linh kiện tận nơi trong 2h tại Long An - Tây Ninh. Phục vụ chiều tối và trọn ngày cuối tuần.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. GIẢI PHÁP CHO TỪNG NHÓM KHÁCH HÀNG */}
        <section className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-lg sm:text-2xl font-bold text-white uppercase tracking-tight">
              GIẢI PHÁP ĐÚNG NHU CẦU - TIẾT KIỆM CHI PHÍ
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Chọn cấu hình chuẩn xác giúp bạn đạt hiệu quả cao nhất với mức ngân sách tối ưu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-900">
            {/* Nhóm 1 */}
            <div className="p-5 rounded-2xl bg-white space-y-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-lg">storefront</span>
              </div>
              <h3 className="text-sm font-bold uppercase">Hộ Kinh Doanh / Kế Toán</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>Nguyên nhân:</strong> Treo máy lúc bán hàng.<br />
                <strong>Kết quả:</strong> PC Dell/HP đồng bộ siêu bền + Win bản quyền số ➔ Chạy mượt 24/7, xuất hóa đơn xèo xèo.
              </p>
            </div>

            {/* Nhóm 2 */}
            <div className="p-5 rounded-2xl bg-white space-y-3">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-lg">school</span>
              </div>
              <h3 className="text-sm font-bold uppercase">Học Sinh / Phụ Huynh</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>Nguyên nhân:</strong> Máy mới quá đắt tiền.<br />
                <strong>Kết quả:</strong> Laptop Dell, IBM ThinkPad nồi đồng cối đá dưới 6 triệu ➔ Tiết kiệm 50% chi phí, dùng bền 3-5 năm.
              </p>
            </div>

            {/* Nhóm 3 */}
            <div className="p-5 rounded-2xl bg-white space-y-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-lg">home_repair_service</span>
              </div>
              <h3 className="text-sm font-bold uppercase">Cán Bộ / Nhân Viên VT</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>Nguyên nhân:</strong> Bận rộn không đi tiệm được.<br />
                <strong>Kết quả:</strong> Kỹ thuật ghé tận nhà ngoài giờ hành chính ➔ Xử lý ngay tại chỗ, không ảnh hưởng công việc.
              </p>
            </div>
          </div>
        </section>

        {/* 4. LỜI KẾT & NÚT HÀNH ĐỘNG */}
        <section className="p-7 sm:p-8 rounded-3xl bg-blue-50/70 border border-blue-200/80 text-center space-y-4">
          <h3 className="text-base sm:text-xl font-bold text-slate-900">
            SẴN SÀNG TRẢI NGHIỆM SỰ AN TÂM TRỌN VẸN?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Liên hệ ngay với Vi Tính An Tâm để được tư vấn chọn dòng máy PC/Laptop nồi đồng cối đá Dell, HP, IBM vừa vặn nhất với nhu cầu của bạn.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/#danh-muc-san-pham"
              className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-colors"
            >
              Xem Danh Mục PC / Laptop
            </Link>
            <a
              href="tel:0909053058"
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">phone_in_talk</span>
              <span>Hotline / Zalo: 0909.053.058</span>
            </a>
            <Link
              href="/dat-lich"
              className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
            >
              Đặt Lịch Kỹ Thuật Tận Nơi
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
