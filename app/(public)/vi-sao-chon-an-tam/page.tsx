'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  CheckCircle2,
  Zap,
  Store,
  GraduationCap,
  Briefcase,
  ArrowRight,
  Phone,
  Calendar,
  ShieldCheck,
  Cpu,
  Clock,
  ThumbsUp,
} from 'lucide-react';

export default function WhyUsPage() {
  const [selectedSegment, setSelectedSegment] = useState<'all' | 'business' | 'student' | 'officer'>('all');

  const comparisonItems = [
    {
      id: 1,
      tag: 'SSD / RAM MỚI 100%',
      riskTitle: 'Mua máy cũ sợ linh kiện nát, hỏng vặt',
      riskDesc: 'Sợ mua nhầm máy chắp vá, SSD cũ sắp chết làm mất dữ liệu, vừa mua vài tháng đã phải tốn tiền sửa.',
      resultTitle: '100% SSD/RAM MỚI • BAO DÙNG THỬ 30 NGÀY',
      resultDesc: 'Lắp ráp ổ SSD & RAM chính hãng mới 100% nguyên hộp bảo hành 36 tháng. Thân máy nguyên bản được bao dùng thử 30 ngày 1 đổi 1.',
      icon: Cpu,
    },
    {
      id: 2,
      tag: 'WIN BẢN QUYỀN SỐ',
      riskTitle: 'Win lậu gây đơ máy, dính virus tống tiền',
      riskDesc: 'Bản Ghost lậu dính mã độc tống tiền Ransomware, bị ngắt giữa chừng khi xuất hóa đơn hay khai thuế kế toán MISA.',
      resultTitle: '100% WINDOWS PRO BẢN QUYỀN SỐ VĨNH VIỄN',
      resultDesc: 'Kích hoạt bản quyền gốc theo máy, tuyệt đối không dùng tool crack lậu. Hệ điều hành sạch giúp máy chạy siêu mượt và an toàn dữ liệu.',
      icon: ShieldCheck,
    },
    {
      id: 3,
      tag: 'KỸ THUẬT MINH BẠCH',
      riskTitle: 'E ngại bị "luộc đồ" khi để máy lại tiệm',
      riskDesc: 'Tâm lý lo lắng bị tráo đổi linh kiện zin hoặc bị nâng giá khi phải gửi máy qua đêm để sửa chữa.',
      resultTitle: 'KỸ THUẬT MỞ: XEM TRỰC TIẾP LẤY LIỀN 20 PHÚT',
      resultDesc: 'Kỹ thuật viên thao tác minh bạch ngay trước mắt bạn. Nâng cấp, vệ sinh xong lấy ngay trong 20–30 phút, không giữ máy ngâm đồ.',
      icon: CheckCircle2,
    },
    {
      id: 4,
      tag: 'CỨU HỘ TẬN NƠI 2H',
      riskTitle: 'Bận giờ làm việc, bảo hành chờ cả tuần',
      riskDesc: 'Không thể mang máy đi tiệm trong giờ hành chính; khi bị lỗi phải gửi chành xe chờ đợi gián đoạn công việc.',
      resultTitle: 'XỬ LÝ TẬN NƠI 2H • PHỤC VỤ KHUNG 17:30 - 21:00',
      resultDesc: 'Đội kỹ thuật hỗ trợ giao máy, thay thế linh kiện tận nơi trong 2h tại Long An - Tây Ninh. Phục vụ chiều tối và trọn ngày cuối tuần.',
      icon: Clock,
    },
  ];

  const segments = [
    {
      key: 'all',
      label: 'Tất cả giải pháp',
      icon: ThumbsUp,
    },
    {
      key: 'business',
      label: 'Hộ Kinh Doanh & Kế Toán',
      icon: Store,
      problem: 'Máy tính bị treo đơ lúc đang xuất hóa đơn điện tử hoặc tính tiền cho khách.',
      solution: 'PC Dell/HP đồng bộ siêu bền + Win bản quyền số ➔ Chạy mượt 24/7, xuất hóa đơn xèo xèo, hỗ trợ kỹ thuật cài máy in tận nơi.',
      recommendedDevice: 'Dell OptiPlex 7060 SFF (Core i5, 16GB RAM, SSD 256GB NVMe)',
      priceRange: '4.950.000₫',
    },
    {
      key: 'student',
      label: 'Học Sinh & Phụ Huynh',
      icon: GraduationCap,
      problem: 'Máy tính mới chính hãng quá đắt đỏ trong khi nhu cầu chỉ học tập và tin học văn phòng.',
      solution: 'Laptop Dell, ThinkPad vỏ carbon nồi đồng cối đá dưới 6 triệu ➔ Tiết kiệm 50% ngân sách, bàn phím gõ êm, dùng bền 3-5 năm.',
      recommendedDevice: 'ThinkPad T480s (Core i5, 16GB RAM, Màn 14" FHD chống chói)',
      priceRange: '6.200.000₫',
    },
    {
      key: 'officer',
      label: 'Cán Bộ & Nhân Viên Văn Phòng',
      icon: Briefcase,
      problem: 'Bận rộn giờ hành chính không thể mang máy ra tiệm sửa chữa hay cài đặt.',
      solution: 'Kỹ thuật viên ghé tận nhà ngoài giờ hành chính (17h30 - 21h00) hoặc xử lý qua Ultraviewer trong 15 phút.',
      recommendedDevice: 'HP ProDesk 400 G5 Mini (Gắn lưng màn hình, siêu tiết kiệm điện)',
      priceRange: '3.400.000₫',
    },
  ];

  const currentSegment = segments.find((s) => s.key === selectedSegment) || segments[0];

  return (
    <div className="w-full">
      {/* 1. HERO BANNER */}
      <section className="relative bg-gradient-to-b from-blue-50/80 via-white to-slate-50/50 py-12 sm:py-16 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-4 h-4 text-blue-700" />
            <span>RÕ RÀNG • MINH BẠCH • KẾT QUẢ THỰC TẾ</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            VÌ SAO KHÁCH HÀNG LỰA CHỌN VI TÍNH AN TÂM?
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Giải quyết trực tiếp mọi mối lo máy tính bằng cam kết đo lường được: 100% SSD mới, Windows bản quyền số vĩnh viễn, kiểm tra theo S/N máy và cứu hộ tận nơi trong 2 giờ.
          </p>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12 text-slate-700">
        {/* 2. BẢNG NGUYÊN NHÂN - KẾT QUẢ (CAUSE & EFFECT MATRIX) */}
        <section className="space-y-6">
          <div className="text-center space-y-1.5">
            <span className="text-xs uppercase font-bold text-blue-700 tracking-wider">
              SO SÁNH MINH BẠCH
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Mối Lo Thường Gặp &amp; Giải Pháp Thực Tế Tại An Tâm
            </h2>
          </div>

          <div className="space-y-4">
            {comparisonItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-all grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                >
                  <div className="md:col-span-5 space-y-1.5 border-b md:border-b-0 md:border-r border-slate-200 pb-3 md:pb-0 md:pr-4">
                    <div className="flex items-center gap-1.5 text-rose-600 font-bold text-xs uppercase tracking-wide">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Nguyên nhân &amp; Rủi ro cũ</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{item.riskTitle}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.riskDesc}</p>
                  </div>
                  <div className="md:col-span-7 space-y-1.5 md:pl-2">
                    <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs uppercase tracking-wide">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Kết quả thực tế tại An Tâm</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{item.resultTitle}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.resultDesc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. GIẢI PHÁP TƯƠNG TÁC CHO TỪNG NHÓM KHÁCH HÀNG (INTERACTIVE TABS) */}
        <section className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight">
              GIẢI PHÁP ĐÚNG NHU CẦU - TIẾT KIỆM CHI PHÍ
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Chọn nhóm đối tượng bên dưới để xem cấu hình và giải pháp tối ưu nhất cho bạn:
            </p>
          </div>

          {/* Interactive Category Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {segments.map((seg) => {
              const Icon = seg.icon;
              const isSelected = selectedSegment === seg.key;
              return (
                <button
                  key={seg.key}
                  type="button"
                  onClick={() => setSelectedSegment(seg.key as any)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shadow-xs ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-blue-500/25 ring-2 ring-blue-400'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{seg.label}</span>
                </button>
              );
            })}
          </div>

          {/* Segment Details Content */}
          {selectedSegment === 'all' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-900 pt-2">
              {/* Nhóm 1 */}
              <div className="p-5 rounded-2xl bg-white space-y-3 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-2">
                    <Store className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold uppercase">Hộ Kinh Doanh / Kế Toán</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2">
                    <strong>Vấn đề:</strong> Treo máy lúc xuất hóa đơn thuế.<br />
                    <strong>Kết quả:</strong> PC Dell/HP đồng bộ + Win bản quyền số ➔ Chạy 24/7 ổn định.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 text-xs font-semibold text-blue-700">
                  Cấu hình: Dell OptiPlex Core i5
                </div>
              </div>

              {/* Nhóm 2 */}
              <div className="p-5 rounded-2xl bg-white space-y-3 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center font-bold mb-2">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold uppercase">Học Sinh / Phụ Huynh</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2">
                    <strong>Vấn đề:</strong> Máy mới quá đắt tiền.<br />
                    <strong>Kết quả:</strong> ThinkPad T480s nồi đồng cối đá dưới 6 triệu ➔ Bền 3-5 năm.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 text-xs font-semibold text-orange-700">
                  Cấu hình: ThinkPad T480s Carbon
                </div>
              </div>

              {/* Nhóm 3 */}
              <div className="p-5 rounded-2xl bg-white space-y-3 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-2">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold uppercase">Cán Bộ / Văn Phòng</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2">
                    <strong>Vấn đề:</strong> Bận không mang máy đi tiệm được.<br />
                    <strong>Kết quả:</strong> KTV ghé tận nhà ngoài giờ hành chính ➔ Xử lý tại chỗ 20 phút.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 text-xs font-semibold text-emerald-700">
                  Cấu hình: HP ProDesk Mini 1L
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-white text-slate-900 space-y-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  {React.createElement(currentSegment.icon, { className: 'w-6 h-6' })}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{currentSegment.label}</h3>
                  <p className="text-xs text-slate-500">Giải pháp chuyên biệt cho nhu cầu của bạn</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200">
                  <span className="font-bold text-rose-700 uppercase block mb-1">Mối bận tâm chính:</span>
                  <p className="text-slate-700 leading-relaxed">{currentSegment.problem}</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <span className="font-bold text-emerald-700 uppercase block mb-1">Kết quả thực tế tại An Tâm:</span>
                  <p className="text-slate-700 leading-relaxed">{currentSegment.solution}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] text-slate-500 uppercase font-bold">Dòng máy đề xuất:</span>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">{currentSegment.recommendedDevice}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-base font-black text-orange-600 font-mono">{currentSegment.priceRange}</span>
                  <Link
                    href={`/dat-lich?device=${encodeURIComponent(currentSegment.recommendedDevice || '')}`}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    Đặt lịch xem máy
                  </Link>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 4. LỜI KẾT & NÚT HÀNH ĐỘNG */}
        <section className="p-7 sm:p-8 rounded-3xl bg-blue-50/70 border border-blue-200/80 text-center space-y-4">
          <h3 className="text-base sm:text-xl font-bold text-slate-900">
            SẴN SÀNG TRẢI NGHIỆM SỰ AN TÂM TRỌN VẸN?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Liên hệ ngay với Vi Tính An Tâm để được tư vấn cấu hình máy nồi đồng cối đá Dell, HP, ThinkPad vừa vặn nhất với nhu cầu của bạn.
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
              <Phone className="w-4 h-4" />
              <span>Hotline / Zalo: 0909.053.058</span>
            </a>
            <Link
              href="/dat-lich"
              className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Đặt Lịch Kỹ Thuật Tận Nơi</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
