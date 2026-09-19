import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vì Sao Chọn An Tâm | Câu Chuyện & Cam Kết Trách Nhiệm',
  description: 'Khởi nguồn từ những trăn trở rất thật của người dùng và hộ kinh doanh tại Long An - Tây Ninh. Vi Tính An Tâm ra đời để mang lại sự an tâm trọn vẹn.',
};

export default function WhyUsPage() {
  return (
    <div className="w-full">
      {/* 1. HERO BANNER - SINCERE & GENTLE */}
      <section className="relative bg-gradient-to-b from-blue-50/80 via-white to-slate-50/50 py-16 sm:py-20 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-5">
          

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight font-headline">
            BẮT ĐẦU TỪ NHỮNG NỖI LO RẤT THẬT CỦA NGƯỜI DÙNG
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Một chiếc máy tính phục vụ công việc và học tập không nhất thiết phải quá đắt đỏ.
            Nhưng cảm giác an tâm khi sử dụng thì luôn cần trọn vẹn.
          </p>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-16 text-slate-700">
        {/* 2. CHƯƠNG 1: NỖI ĐAU CỦA KHÁCH HÀNG */}
        <section className="space-y-6">
          <div className="border-l-4 border-orange-500 pl-4 space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-orange-600">NHỮNG TRĂN TRỞ ĐỜI THƯỜNG</div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              KHI MÁY TÍNH TRỞ THÀNH NỖI BẬN TÂM THAY VÌ TRỢ THỦ
            </h2>
          </div>

          <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-600">
            <p>
              Nhiều năm làm kỹ thuật thực tế dọc theo các trục đường tại Long An - Tây Ninh, chúng tôi thường xuyên gặp những câu chuyện rất quen thuộc nhưng chưa bao giờ hết trăn trở:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            {/* Card Nỗi đau 1: Hộ kinh doanh */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">storefront</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">VỚI CÁC HỘ KINH DOANH & CỬA HÀNG</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Chiếc máy tính gắn liền với doanh thu từng ngày: xuất hóa đơn điện tử, in hóa đơn, phần mềm kế toán. Nỗi sợ lớn nhất là máy bỗng dưng đơ giật hoặc lỗi màn hình xanh đúng lúc khách đông; hay nỗi lo virus tống tiền làm mất sạch dữ liệu do cài bản Windows lậu. Khi gặp sự cố, gọi thợ thì bị hẹn lần lữa, còn mua máy từ xa thì mỗi lần bảo hành lại phải tháo gửi chành xe, chờ đợi cả tuần lễ.
              </p>
            </div>

            {/* Card Nỗi đau 2: Gia đình & Phụ huynh */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">family_restroom</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">VỚI PHỤ HUYNH, GIÁO VIÊN & CÁN BỘ</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Muốn mua cho con chiếc máy học tập với ngân sách khiêm tốn (dưới 6 triệu). Ra siêu thị lớn thì máy mới vượt quá hạn mức; nhưng tìm mua máy cũ ở tiệm thì nơm nớp lo mua nhầm &quot;hàng bãi dạt chắp vá&quot;, dùng vài tháng là hỏng. Đặc biệt là tâm lý e ngại bị &quot;vặt tiền&quot; hoặc tráo đổi linh kiện zin khi phải để máy lại qua đêm.
              </p>
            </div>
          </div>
        </section>

        {/* 3. CHƯƠNG 2: VI TÍNH AN TÂM RA ĐỜI ĐỂ GIẢI QUYẾT ĐIỀU GÌ? */}
        <section className="p-7 sm:p-10 rounded-3xl bg-gradient-to-br from-blue-700 to-blue-900 text-white shadow-lg shadow-blue-900/10 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-medium backdrop-blur-xs">
            <span className="material-symbols-outlined text-sm text-orange-400">lightbulb</span>
            <span>MỤC TIÊU THÀNH LẬP</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
            VI TÍNH AN TÂM RA ĐỜI TỪ MONG MUỐN ĐƠN GIẢN: SỰ THẬT THÀ & MINH BẠCH
          </h2>

          <div className="space-y-3 text-xs sm:text-sm text-blue-100 leading-relaxed">
            <p>
              Chúng tôi không tham gia cuộc đua dìm giá bằng cách thu gom máy cũ nát hay linh kiện trôi nổi. Thay vào đó, Vi Tính An Tâm chọn cách làm chuẩn mực ngay từ đầu:
            </p>
            <blockquote className="border-l-2 border-orange-400 pl-4 py-1 italic text-white font-medium text-sm sm:text-base">
              &quot;Làm kỹ thuật trước hết là giữ chữ tín. Máy tính có thể là máy đã qua sử dụng, nhưng linh kiện nâng cấp phải là mới 100%, phần mềm phải sạch, và cách phục vụ phải trung thực trước mắt khách hàng.&quot;
            </blockquote>
          </div>
        </section>

        {/* 4. CHƯƠNG 3: CAM KẾT TIẾT CHẾ & THIẾT THỰC (KHÔNG KỂ LỂ DÀI DÒNG) */}
        <section className="space-y-6">
          <div className="border-l-4 border-blue-700 pl-4 space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-700">CHUẨN MỰC THỰC TẾ</div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              NHỮNG GÌ BẠN NHẬN ĐƯỢC KHI ĐẾN VỚI AN TÂM
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Cam kết 1 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                <span className="material-symbols-outlined text-base text-emerald-600">verified</span>
                <span>SSD/RAM MỚI 100% CHÍNH HÃNG</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ổ cứng SSD và RAM nâng cấp được <strong>bảo hành đổi mới 36 tháng</strong>. Thân máy bảo hành từ 6 đến 12 tháng rõ ràng.
              </p>
            </div>

            {/* Cam kết 2 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                <span className="material-symbols-outlined text-base text-emerald-600">verified</span>
                <span>100% WINDOWS PRO BẢN QUYỀN SẠCH</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kích hoạt bản quyền số theo máy. Tuyệt đối không dùng bản Ghost mod hay tool crack lậu, bảo vệ an toàn cho tài khoản và dữ liệu kế toán.
              </p>
            </div>

            {/* Cam kết 3 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                <span className="material-symbols-outlined text-base text-emerald-600">verified</span>
                <span>KỸ THUẬT MỞ: XEM TRỰC TIẾP TẠI CHỖ</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Nâng cấp, vệ sinh, sao chép dữ liệu lấy liền trong <strong>20–30 phút</strong> ngay trước mắt bạn. Không giữ máy qua đêm, xóa bỏ nỗi lo tráo đổi linh kiện.
              </p>
            </div>

            {/* Cam kết 4 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                <span className="material-symbols-outlined text-base text-emerald-600">verified</span>
                <span>PHỤC VỤ KHUNG GIỜ VÀNG (17:30 – 21:00)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hỗ trợ giao máy, kiểm tra và bảo dưỡng tận nơi vào chiều tối và trọn ngày cuối tuần — thời điểm thuận tiện nhất cho bạn.
              </p>
            </div>

            {/* Cam kết 5 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2 sm:col-span-2">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                <span className="material-symbols-outlined text-base text-emerald-600">verified</span>
                <span>KIỂM TRA BẢO HÀNH ĐIỆN TỬ BẰNG SERVICE TAG</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mỗi thiết bị đều có mã định danh riêng. Bạn chỉ cần tra cứu trên website để xem thời hạn bảo hành từng phần, không phụ thuộc vào tem giấy dễ rách hay mờ nét.
              </p>
            </div>
          </div>
        </section>

        {/* 5. LỜI KẾT & CTA */}
        <section className="p-7 sm:p-8 rounded-3xl bg-slate-100/90 border border-slate-200/80 text-center space-y-4">
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            BẠN CẦN MỘT CHIẾC MÁY TÍNH VỪA VẶN CHO NHU CẦU CỦA MÌNH?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Dù là mua máy cho con học, tìm bộ máy văn phòng bán hàng, hay chỉ đơn giản là cần kiểm tra nâng cấp chiếc máy cũ đang chậm chạp, An Tâm luôn sẵn lòng lắng nghe và tư vấn trung thực nhất.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/#danh-muc-san-pham"
              className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-colors"
            >
              Xem Danh Mục Máy
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
