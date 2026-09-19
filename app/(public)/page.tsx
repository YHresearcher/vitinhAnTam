'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useViTinhAnTamStore } from '@/lib/store';
import { formatVND } from '@/lib/supabase';

interface ProductShowcase {
  id: string;
  name: string;
  badge: string;
  subBadge: string;
  desc: string;
  img: string;
  category: 'office' | 'laptop' | 'workstation';
  specs: {
    cpu: string;
    ram: string;
    storage: string;
    highlight: string;
    gift: string;
  };
  price: number;
}

const PRODUCTS: ProductShowcase[] = [
  {
    id: 'p1',
    name: 'Dell OptiPlex 7060 SFF',
    badge: 'LOẠI A >95% NGUYÊN BẢN',
    subBadge: 'Win 11 Pro Bản Quyền Số',
    desc: 'Đồng bộ siêu êm, tối ưu tác vụ văn phòng, kế toán MISA đa nhiệm.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_XqyuhdmpmXoCW362MXDLpcj2fNG91cxGDOoIMY0LGcYQAskQWuyJGtcsSnW0pBpyLO7bw1OrQ8wi9mVpOdu-SK1yucTaIPtmGcTUId2_FdxPu1gMtxhRdNoVedwLcITop_byvLpE2nKuxZpLreAdydKpuBCXJR75xOyyXcpwwH66s-vVPj1s4vIPbbmFtAedHsuaex4ZmglXWeieUbZdSc15AyrCaOY-zQ7eyOf4Okia2O9UINYf',
    category: 'office',
    specs: {
      cpu: 'Core i5-8500 (6 nhân 6 luồng 4.10GHz)',
      ram: 'RAM 16GB DDR4 Bus 2666 (Nâng max 64GB)',
      storage: 'SSD NVMe 256GB Mới 100% (BH 36T)',
      highlight: 'Thân máy BH 12 tháng • Đổi mới tận nơi 2h',
      gift: 'Tặng combo phím chuột & lót chuột văn phòng',
    },
    price: 4950000,
  },
  {
    id: 'p2',
    name: 'HP ProDesk 400 G5 Mini',
    badge: 'SIÊU GỌN 1 LÍT • TIẾT KIỆM ĐIỆN',
    subBadge: 'Quầy Thu Ngân / Kế Toán',
    desc: 'Gọn gàng trong lòng bàn tay, gắn lưng màn hình, hoạt động 24/7 êm ái.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHypgTcRCO_QFnVWMl5MSGKNjC1WqxTCuKKxWunkvUn9ZMEKWhqPlSEBdDO0-9BpqFr3znjewmjJWd9I1QDCFVWp3bfTpdOUeo3AQP7c9L6A9d1dnWmkW-L1qmwyjqOaRtFcxgODM3sVpYEKKoh4_yX-gbUvpBxNV7XFwOPJERylPsS7sp62N0fT1Ive8lwSLth1DrVYuXtwPUfP4C1iAyKWy-1Dd2jt2azAeCeaSDwZus9pJuDtWB',
    category: 'office',
    specs: {
      cpu: 'Core i3-8100T mát êm, tiêu thụ điện chỉ 35W',
      ram: 'RAM 8GB DDR4 Bus 2666 (Nâng cấp tối đa 32GB)',
      storage: 'SSD 128GB M.2 Mới BH 36T + 500GB HDD dữ liệu',
      highlight: 'Thân máy BH 12 tháng • Cài sẵn Win 10/11 Pro OEM',
      gift: 'Tích hợp sẵn Wifi 2 băng tần + Bluetooth',
    },
    price: 3400000,
  },
  {
    id: 'p3',
    name: 'ThinkPad T480s (Mỏng Nhẹ)',
    badge: 'CHUẨN QUÂN ĐỘI MỸ • VỎ CARBON',
    subBadge: 'Pin Zin 4-5H (Sức khỏe >85%)',
    desc: 'Bàn phím gõ êm số 1, vỏ sợi carbon siêu nhẹ 1.3kg, cực kỳ bền bỉ.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAY3Z2OKz-xUCFThbDz7BYlPSSjEDsLAhCI4x2H1Up8nZwKBKYBuh7yIYXl6t4mtKIB4g3G0C-18V4mCSHCutXdsJkFacBrXKtB0j-Clmzr9Mog8CnHDhmvjqywzWS7jrpznsTqmR-iZ6hx6bZXeJn_qkONjyUPHu5grKL2C1QIFfRrIGT3llnDDr9RplUzoBtcP9rwwmdNGC5r1nR4joN0h_J9lWRXkR1ZVe8A_ZvdRivoFKlk7oAa',
    category: 'laptop',
    specs: {
      cpu: 'Core i5-8250U (4 nhân 8 luồng mạnh mẽ)',
      ram: 'RAM 16GB DDR4 đa nhiệm lướt web thả ga',
      storage: 'SSD 256GB NVMe siêu tốc (BH 36T đổi mới)',
      highlight: 'Kèm sạc Type-C Zin 65W • BH máy 06 tháng',
      gift: 'Màn 14" FHD IPS chống chói + Tặng túi chống sốc',
    },
    price: 6200000,
  },
  {
    id: 'p4',
    name: 'Dell Vostro 3670 MT (Core i7)',
    badge: 'CASE LỚN THOÁNG MÁT • DỄ NÂNG CẤP',
    subBadge: 'Đồ Họa & Kỹ Thuật',
    desc: 'Chuyên AutoCAD, Photoshop, Corel, Render video & mở 50 tab Chrome.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHGuIrduG_aQa0fIxHB2G8eJVrnLqRVQXGS9uKbJZzSO6i-Q-8scMRHwCrMKPFIoZUU3F92-ySxJkq9bjUm9EBp59F9wGDuzXaegpW9yq3CGs57uhUJbuaBwppDhw7A9lT_ko5HNGgFq_6H2s-OeM6ET7FICEqiBPxQBAYsf0V1gzfIBV-57d46Z5chBxyUxqQtR5JDcy6MKxeinRLSv36JnAhn4o7AIb0WwwPPZodOycfilrkCRJX',
    category: 'workstation',
    specs: {
      cpu: 'Core i7-8700 (6 nhân 12 luồng Turbo 4.60GHz)',
      ram: 'RAM 16GB DDR4 kênh đôi tản nhiệt tốt',
      storage: 'SSD 512GB NVMe Mới 100% (BH 36 Tháng)',
      highlight: 'Nguồn CST chuẩn 80 Plus • BH 12 tháng',
      gift: 'Card rời GTX 1050Ti 4GB GDDR5 chuyên đồ họa',
    },
    price: 7500000,
  },
];


interface CustomerReview {
  name: string;
  role: string;
  comment: string;
  service: string;
  location: string;
}

const CUSTOMER_REVIEWS: CustomerReview[] = [
  {
    name: 'Anh Minh Tuấn',
    role: 'Kế toán trưởng - Cty Vận Tải',
    comment: 'Trang bị 6 bộ máy Dell OptiPlex cho phòng kế toán dùng phần mềm MISA và hóa đơn điện tử. Máy chạy cực êm, khởi động 5 giây. Kỹ thuật viên hỗ trợ tận nơi rất chu đáo.',
    service: 'Dell OptiPlex 7060 SFF',
    location: 'Tân An (Long An - Tây Ninh)',
  },
  {
    name: 'Chị Mai Lan',
    role: 'Giáo viên trường THCS',
    comment: 'Gói bảo dưỡng máy tính và nâng cấp SSD làm dàn máy cũ chạy nhanh như mới. Thích nhất là quy trình làm trực tiếp trước mặt mình, giữ nguyên toàn bộ giáo án và hình ảnh.',
    service: 'Nâng cấp SSD NVMe & Spa máy',
    location: 'Thủ Thừa (Long An - Tây Ninh)',
  },
  {
    name: 'Chú Bảy Nam',
    role: 'Khách hàng cá nhân',
    comment: 'Tôi lớn tuổi không rành vi tính, may có cháu kỹ thuật qua tận nhà lúc 18h30 cài lại máy in và kiểm tra nguồn máy. Phục vụ tận tình, giải thích rõ ràng, giá cả phải chăng.',
    service: 'Cứu hộ máy tính tận nơi',
    location: 'Trảng Bàng (Long An - Tây Ninh)',
  },
  {
    name: 'Anh Quốc Hoàng',
    role: 'Giám đốc Công ty Xây Dựng',
    comment: 'Chính sách bảo hành 1 đổi 1 tận nơi trong 2 giờ là lý do công ty tôi chọn An Tâm làm đối tác kỹ thuật dài hạn. Yên tâm tuyệt đối về an toàn dữ liệu nội bộ.',
    service: 'Bảo trì hệ thống PC văn phòng',
    location: 'KCN Đức Hòa (Long An - Tây Ninh)',
  },
  {
    name: 'Chị Thúy Nga',
    role: 'Kinh doanh trực tuyến',
    comment: 'Máy tính bị treo nguồn giữa ca tối, gọi hotline được KTV tới kiểm tra ngay trong hơn 1 tiếng. Thay nguồn mới chính hãng bảo hành 36 tháng có tem niêm phong rất yên tâm.',
    service: 'Thay nguồn & Vệ sinh máy',
    location: 'Gò Dầu (Long An - Tây Ninh)',
  },
];

interface FaqItem {
  question: string;
  answer: string;
  icon: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    icon: 'schedule',
    question: 'Chính sách xử lý nhanh tận nơi trong 2 giờ áp dụng vào thời gian nào?',
    answer: 'Khi máy tính gặp sự cố hoặc cần hỗ trợ linh kiện, quý khách chỉ cần nhập SĐT / Service Tag hoặc gọi Hotline 0909.053.058. Đội ngũ kỹ thuật cơ động của Vi tính An Tâm sẽ mang sẵn linh kiện hoặc máy thay thế đến tận nơi trong bán kính 10km (khu vực Long An - Tây Ninh (Tân An, Bến Lức, Trảng Bàng, Gò Dầu, TP. Tây Ninh)) để xử lý ngay. Đặc biệt, dịch vụ xử lý nhanh trong 2 giờ được ưu tiên cao điểm nhất trong khung giờ vàng từ 17:30 đến 21:00 các ngày trong tuần (và trọn ngày Thứ 7, Chủ Nhật từ 08:00 đến 21:00) nhằm phục vụ quý khách ngoài giờ hành chính mà không làm gián đoạn công việc tại cơ quan hay văn phòng.',
  },
  {
    icon: 'sync',
    question: 'Chính sách bảo hành 1 đổi 1 tận nơi trong 15 phút hoạt động ra sao?',
    answer: 'Đối với linh kiện phần cứng (SSD, RAM, nguồn, quạt) phát sinh lỗi, kỹ thuật viên mang linh kiện mới chính hãng nguyên tem đến tận nơi thay thế ngay tại chỗ trong 15 - 30 phút, cam kết không giữ máy ngâm đồ làm ảnh hưởng đến tiến độ công việc của khách hàng.',
  },
  {
    icon: 'security',
    question: 'Nâng cấp SSD và cài lại máy có bị mất dữ liệu hóa đơn thuế & MISA không?',
    answer: 'Hoàn toàn an tâm! Kỹ thuật viên áp dụng quy trình sao lưu và Clone nguyên bản từ ổ cứng cũ sang SSD mới. Toàn bộ chữ ký số, hóa đơn điện tử, dữ liệu phần mềm kế toán MISA, file ngoài màn hình Desktop và tài khoản Zalo / trình duyệt đều được giữ nguyên 100%, không cần cài đặt lại từ đầu.',
  },
  {
    icon: 'verified_user',
    question: 'Máy tính cũ tại An Tâm có được mở nắp kiểm tra linh kiện bên trong không?',
    answer: 'Khách hàng có toàn quyền yêu cầu kỹ thuật mở nắp thùng máy để kiểm tra trực tiếp bo mạch sạch đẹp nguyên bản, xem nhãn SSD / RAM chính hãng mới nguyên hộp và chạy phần mềm kiểm tra sức khỏe ổ cứng CrystalDiskInfo 100% Good trước khi quyết định thanh toán.',
  },
];

export default function HomePage() {
  const { findWarrantyByTagOrPhone } = useViTinhAnTamStore();

  // Search state
  const [searchInput, setSearchInput] = useState('ST-8F4K92X');
  const [searchResult, setSearchResult] = useState<any>(() => {
    return findWarrantyByTagOrPhone('ST-8F4K92X');
  });
  const [isSearching, setIsSearching] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Category filter
  const [activeCategory, setActiveCategory] = useState<'all' | 'office' | 'laptop' | 'workstation'>('all');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchInput.trim();
    if (!query) {
      showToast('Vui lòng nhập Service Tag hoặc Số điện thoại!');
      return;
    }

    setIsSearching(true);
    setTimeout(() => {
      const res = findWarrantyByTagOrPhone(query);
      setIsSearching(false);
      if (res && (res.item || res.ticket)) {
        setSearchResult(res);
        showToast('Tra cứu thành công!');
        document.getElementById('lookup-result')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        setSearchResult(null);
        showToast(`Không tìm thấy hồ sơ cho "${query}". Hãy thử ST-8F4K92X hoặc 0918234891!`);
      }
    }, 300);
  };

  const handleSelectPreset = (tag: string) => {
    setSearchInput(tag);
    const res = findWarrantyByTagOrPhone(tag);
    if (res) {
      setSearchResult(res);
      showToast(`Đã tải hồ sơ: ${tag}`);
      document.getElementById('lookup-result')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const filteredProducts = activeCategory === 'all'
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-white text-slate-800 antialiased selection:bg-blue-700 selection:text-white pb-10">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 right-4 z-50 bg-white text-slate-900 px-4 py-3 rounded-xl shadow-2xl border-2 border-blue-700 text-blue-700 text-xs font-semibold flex items-center gap-2.5 animate-bounce">
          <span className="material-symbols-outlined text-blue-700 text-lg">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="w-full">
        {/* AMBIENT LIGHT MESH DECORATIONS */}
        <div className="relative w-full overflow-hidden">
          <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[100px] pointer-events-none -z-10" />
          <div className="absolute top-[40%] -right-32 w-[450px] h-[450px] bg-sky-100/60 rounded-full blur-[100px] pointer-events-none -z-10" />

          {/* 1. HERO BANNER SECTION */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 lg:pt-12 lg:pb-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Column */}
              <div className="lg:col-span-8 space-y-6">
                <div className="space-y-4">
                  <span className="text-xs uppercase tracking-[0.2em] font-bold text-blue-700 flex items-center gap-2">
                    <span className="w-6 h-0.5 bg-blue-700" />
                    VI TÍNH AN TÂM • CHUYÊN NGHIỆP & TẬN TÂM
                  </span>
                  <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.2]">
                    MÁY TÍNH CŨ TUYỂN CHỌN LOẠI 1
                  </h1>
                  <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs sm:text-sm font-bold shadow-xs">
                      <span className="material-symbols-outlined text-base">verified_user</span>
                      <span>WINDOWS BẢN QUYỀN</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-xs sm:text-sm font-bold shadow-xs">
                      <span className="material-symbols-outlined text-base text-orange-600">bolt</span>
                      <span>DỊCH VỤ XỬ LÝ TẬN NƠI TRONG 2 GIỜ</span>
                    </span>
                  </div>
                </div>

                <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl">
                  Chuyên cung cấp PC đồng bộ văn phòng, laptop doanh nhân tuyển chọn kỹ lưỡng &amp; dịch vụ hồi sinh máy tính cấp tốc khu vực Long An - Tây Ninh.
                </p>

                {/* 3 Trụ Cột Cam Kết */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                  <div className="p-4 rounded-xl bg-white border border-blue-100 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all group">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-xl">computer</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase">MÁY TÍNH CŨ TUYỂN CHỌN LOẠI 1</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-snug">
                      Ngoại hình đẹp, bo mạch nguyên bản, kiểm định 24 bước kỹ thuật nghiêm ngặt.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-blue-100 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all group">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-xl">verified_user</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase">WINDOWS BẢN QUYỀN</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-snug">
                      Kích hoạt kỹ thuật số sạch vĩnh viễn, an toàn dữ liệu thuế và kế toán MISA.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-blue-100 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all group">
                    <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-xl">schedule</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase">DỊCH VỤ XỬ LÝ TẬN NƠI TRONG 2 GIỜ</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-snug">
                      Đổi mới linh kiện tại chỗ, ưu tiên khung giờ vàng 17:30 – 21:00 các ngày trong tuần.
                    </p>
                  </div>
                </div>

                {/* Dual CTA Buttons */}
                <div className="flex flex-wrap items-center gap-3.5 pt-3">
                  <a
                    href="#danh-muc-san-pham"
                    className="px-6 py-3.5 rounded-xl bg-orange-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-orange-500/25 hover:bg-orange-600 transition-all flex items-center gap-2 hover:scale-[1.02]"
                  >
                    <span className="material-symbols-outlined text-lg">computer</span>
                    <span>Xem Danh Mục Máy Sẵn Có</span>
                  </a>
                  <Link
                    href="/dat-lich"
                    className="px-6 py-3.5 rounded-xl bg-white border-2 border-blue-700 hover:border-blue-800 text-blue-700 hover:text-blue-800 font-bold text-sm shadow-xs transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">home_repair_service</span>
                    <span>Đặt Lịch Nâng Cấp / Spa Tại Nhà</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Hero Live Station Showcase */}
              <div className="lg:col-span-4 relative">
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="relative h-64 sm:h-72 w-full rounded-xl overflow-hidden mb-4 border border-slate-200 bg-slate-100">
                    <img
                      className="w-full h-full object-cover"
                      alt="Máy tính đồng bộ doanh nghiệp và laptop tuyển chọn kỹ lưỡng tại Vi Tính An Tâm"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVHGVQdGoKoVXAwU6yjMLDBWAOvJvMJjMYYR-uGGp_yR16sbGNGfIGEVOI-jK5EAILW4owtjMgdNjqreUBRD3syOQ6OcUN6-yvS10I7Hqh9Ae-XW9vinCGiMR2fyCR5Rzcds6m7N29w5XAXbs-Aov2qfO1UDnRW3Vm7Je5H1DzWR2urIl3fYFAKLRqktLbhDsPj4GRtfMV3CNdDsWOVFl7arQwFItiQU2tj-mWbZRBt-i7YRGXhE19"
                    />
                    <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-md text-[11px] font-bold text-emerald-700 border border-slate-200 shadow-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>SẴN KHO LONG AN - TÂY NINH</span>
                    </div>
                  </div>

                  {/* Diagnostics Badge Preview */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">Tiêu chuẩn tuyển chọn máy:</span>
                      <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        Loại A (&gt;95%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                      <div className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full w-[96%]" />
                    </div>
                    <div className="pt-2 flex items-center justify-between text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span> 0% Bad Sector
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span> Sạc Zin Theo Máy
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          
          {/* ========================================================================= */}
          {/* REASSURANCE BANNER DẪN TỚI TAB VÌ SAO CHỌN AN TÂM */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-700 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-base">verified_user</span>
                </div>
                <span>
                  <strong className="text-slate-900 font-bold">Cam kết minh bạch:</strong> SSD/RAM mới 100% bảo hành 36 tháng đổi mới, thân máy 6 - 12 tháng. 100% Windows Pro bản quyền sạch.
                </span>
              </div>
              <Link
                href="/vi-sao-chon-an-tam"
                className="text-blue-700 hover:text-blue-800 font-bold flex items-center gap-1 shrink-0 group transition-colors"
              >
                <span>TÌM HIỂU THÊM</span>
                <span className="material-symbols-outlined text-base group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
              </Link>
            </div>
          </div>



          {/* 2. KHỐI 1: DANH MỤC PC & LAPTOP TUYỂN CHỌN */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20" id="danh-muc-san-pham">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <div className="text-xs uppercase tracking-widest text-blue-700 font-bold mb-1">
                  Thiết Bị Sẵn Hàng - Giao Trong 60 Phút
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  PC &amp; LAPTOP TUYỂN CHỌN CHUẨN DOANH NGHIỆP
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md">
                Máy nguyên bản đồng bộ, đã qua quy trình test 4 lớp 45 phút, cài sẵn Windows Pro &amp; ứng dụng làm việc sạch.
              </p>
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap gap-2.5 mb-8 pb-1">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all shadow-xs ${
                  activeCategory === 'all'
                    ? 'bg-blue-700 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-700'
                }`}
              >
                Tất cả (28 máy sẵn)
              </button>
              <button
                onClick={() => setActiveCategory('office')}
                className={`px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all shadow-xs ${
                  activeCategory === 'office'
                    ? 'bg-blue-700 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-700'
                }`}
              >
                PC Văn Phòng - Kế Toán (3 - 6tr)
              </button>
              <button
                onClick={() => setActiveCategory('laptop')}
                className={`px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all shadow-xs ${
                  activeCategory === 'laptop'
                    ? 'bg-blue-700 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-700'
                }`}
              >
                Laptop Doanh Nhân (Bền Bỉ)
              </button>
              <button
                onClick={() => setActiveCategory('workstation')}
                className={`px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all shadow-xs ${
                  activeCategory === 'workstation'
                    ? 'bg-blue-700 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-700'
                }`}
              >
                PC Đồ Họa &amp; Kỹ Thuật
              </button>
            </div>

            {/* Product Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition-all duration-300 group"
                >
                  <div>
                    <div className="relative h-44 rounded-lg overflow-hidden mb-3.5 bg-slate-100 border border-slate-100">
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        alt={prod.name}
                        src={prod.img}
                      />
                      <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md shadow-xs">
                        {prod.badge}
                      </span>
                      <span className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-xs text-blue-700 border border-blue-200 text-[10px] font-semibold px-2 py-0.5 rounded">
                        {prod.subBadge}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{prod.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{prod.desc}</p>
                    <ul className="my-3 space-y-1.5 text-xs text-slate-700">
                      <li className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-blue-700">memory</span>
                        <span>{prod.specs.cpu}</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-blue-700">developer_board</span>
                        <span>{prod.specs.ram}</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-blue-700">storage</span>
                        <span>{prod.specs.storage}</span>
                      </li>
                      <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                        <span className="material-symbols-outlined text-sm text-emerald-600">verified</span>
                        <span>{prod.specs.highlight}</span>
                      </li>
                      <li className="flex items-center gap-1.5 text-slate-600">
                        <span className="material-symbols-outlined text-sm text-amber-500">card_giftcard</span>
                        <span>{prod.specs.gift}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-slate-100 mt-2">
                    <div className="flex items-baseline justify-between mb-3">
                      <span className="text-xs text-slate-500">Giá trọn bộ niêm yết:</span>
                      <span className="text-lg font-black text-orange-600 font-mono">
                        {formatVND(prod.price)}
                      </span>
                    </div>
                    <a
                      href="tel:0909053058"
                      className="w-full py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs tracking-wide transition-all text-center block shadow-xs"
                    >
                      Đặt Lịch Test Máy Tận Nơi
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 3. KHỐI 2: MENU GÓI DỊCH VỤ & SPA */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20" id="dich-vu-spa">
            <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold uppercase">
                  <span className="material-symbols-outlined text-sm text-blue-700">bolt</span> DỊCH VỤ CỨU HỘ &amp; BẢO DƯỠNG MÁY TÍNH TẬN NƠI
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  DỊCH VỤ TẬN NƠI &amp; &quot;SPA HỒI SINH MÁY CŨ&quot; TRONG 2 GIỜ
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Không cần mang vác cồng kềnh ra tiệm. Kỹ thuật viên An Tâm mang trang thiết bị chuyên dụng đến kiểm tra, bảo dưỡng và tối ưu trực tiếp trước sự giám sát của quý khách.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {/* Gói 1 */}
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-300 hover:bg-white transition-all group">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg group-hover:rotate-6 transition-transform">
                      x5
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">GÓI HỒI SINH MÁY CŨ</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Biến máy tính đang chạy ổ cơ HDD ì ạch trở nên mượt mà như máy mới mua chỉ sau 45 phút.
                    </p>
                    <div className="pt-2 space-y-2 text-xs text-slate-700">
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-emerald-600 text-sm shrink-0">check</span>
                        <span>Thay SSD NVMe/SATA 256GB mới 100% Kingston chính hãng</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-emerald-600 text-sm shrink-0">check</span>
                        <span>Nâng RAM DDR3/DDR4 chính hãng theo bo mạch</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-emerald-600 text-sm shrink-0">check</span>
                        <span><strong>Clone Windows bản quyền:</strong> Giữ nguyên 100% phần mềm MISA, Zalo, tài liệu.</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-slate-200 mt-6">
                    <div className="text-xs text-slate-500 font-medium">Chi phí dịch vụ:</div>
                    <div className="text-base sm:text-lg font-bold text-blue-700">Báo giá minh bạch sau kiểm tra</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Tư vấn nâng cấp đúng nhu cầu, không vẽ bệnh</div>
                  </div>
                </div>

                {/* Gói 2 */}
                <div className="p-6 rounded-2xl bg-blue-50/50 border-2 border-blue-500 shadow-sm flex flex-col justify-between hover:bg-white transition-all group relative">
                  <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-blue-700 text-white font-bold text-[10px] tracking-wide shadow-xs">
                    ĐƯỢC ĐẶT NHIỀU NHẤT
                  </div>
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg group-hover:rotate-6 transition-transform">
                      <span className="material-symbols-outlined text-2xl">ac_unit</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">SPA LÀM MÁT CHUYÊN SÂU</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Khắc phục triệt để tình trạng quạt hú to, máy nóng bỏng tay, tắt đột ngột khi mở nhiều ứng dụng hoặc làm việc trưa hè.
                    </p>
                    <div className="pt-2 space-y-2 text-xs text-slate-700">
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-emerald-600 text-sm shrink-0">check</span>
                        <span>Thổi bụi công nghiệp sạch sâu buồng linh kiện &amp; cánh quạt</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-emerald-600 text-sm shrink-0">check</span>
                        <span>Tra keo tản nhiệt cao cấp <strong className="text-slate-900">Thermalright TF7 / Arctic MX4</strong></span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-emerald-600 text-sm shrink-0">check</span>
                        <span>Hạ nhiệt 15 - 20°C lập tức, bảo vệ tuổi thọ bo mạch &amp; chip CPU.</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-slate-200 mt-6">
                    <div className="text-xs text-slate-500 font-medium">Chi phí dịch vụ:</div>
                    <div className="text-base sm:text-lg font-bold text-blue-700">Báo giá tận nơi theo dòng máy</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Kiểm tra nhiệt độ CPU &amp; cánh quạt miễn phí</div>
                  </div>
                </div>

                {/* Gói 3 */}
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-300 hover:bg-white transition-all group">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg group-hover:rotate-6 transition-transform">
                      <span className="material-symbols-outlined text-2xl">security</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">TỐI ƯU WINDOWS BẢN QUYỀN</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Loại bỏ sạch các công cụ crack nguy hiểm tiềm ẩn mã độc đào coin hoặc đánh cắp tài khoản ngân hàng của cơ quan, hộ kinh doanh.
                    </p>
                    <div className="pt-2 space-y-2 text-xs text-slate-700">
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-emerald-600 text-sm shrink-0">check</span>
                        <span>Cài đặt Win 10/11 Pro sạch gốc từ Microsoft</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-emerald-600 text-sm shrink-0">check</span>
                        <span>Office OEM ổn định, chặn đứng virus quảng cáo nhảy popup</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-emerald-600 text-sm shrink-0">check</span>
                        <span>Tắt bỏ các tiến trình ngầm rác của Windows cho máy cấu hình yếu</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-slate-200 mt-6">
                    <div className="text-xs text-slate-500 font-medium">Chi phí dịch vụ:</div>
                    <div className="text-base sm:text-lg font-bold text-blue-700">Báo giá theo nhu cầu cài đặt</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Hỗ trợ phần mềm văn phòng &amp; kết nối máy in</div>
                  </div>
                </div>
              </div>

              {/* Big CTA */}
              <div className="text-center">
                <Link
                  href="/dat-lich"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm sm:text-base tracking-wide shadow-lg shadow-orange-500/30 transition-all hover:scale-[1.02]"
                >
                  <span className="material-symbols-outlined text-xl">electric_moped</span>
                  <span>Đặt Lịch Kỹ Thuật Viên Qua Tận Nơi Trong 2 Giờ (Hotline: 0909.053.058)</span>
                </Link>
              </div>
            </div>
          </section>

          {/* 4. KHỐI 3: BANNER KIỂM TRA BẢO HÀNH ĐIỆN TỬ */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="tra-cuu-bao-hanh">
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-lg shadow-blue-900/10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center shrink-0 backdrop-blur-xs">
                  <span className="material-symbols-outlined text-2xl text-orange-400">verified</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-bold uppercase tracking-tight">
                    CỔNG KIỂM TRA BẢO HÀNH ĐIỆN TỬ
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
                    Mọi thiết bị xuất kho đều được định danh bằng Service Tag. Tra cứu minh bạch thời hạn bảo hành phần cứng và bản quyền mà không sợ rách tem giấy.
                  </p>
                </div>
              </div>
              <Link
                href="/tra-cuu-bao-hanh"
                className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 transition-all shrink-0 flex items-center gap-2"
              >
                <span>Kiểm Tra Ngay</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>
          </section>

          {/* 5. KHỐI 4: QUY TRÌNH KIỂM ĐỊNH & BẰNG CHỨNG */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
                            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                QUY TRÌNH KIỂM ĐỊNH 4 LỚP TRƯỚC KHI GIAO
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Chúng tôi từ chối nhập máy sửa chữa chắp vá. Mỗi linh kiện xuất kho đều phải vượt qua bài kiểm tra áp lực khắt khe.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 transition-all relative">
                <div className="text-3xl font-black text-slate-200 absolute top-4 right-4">01</div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined">bolt</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase">NGUỒN ĐIỆN ỔN ĐỊNH</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Đo kiểm điện áp tải thực tế, chống sập nguồn hay đơ máy giữa giờ làm việc cao điểm.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 transition-all relative">
                <div className="text-3xl font-black text-slate-200 absolute top-4 right-4">02</div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined">mode_fan</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase">TẢN NHIỆT MÁT ÊM</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Tra keo gốm tản nhiệt xịn, quạt chạy êm ái, máy mát mẻ khi làm việc liên tục cả ngày.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 transition-all relative">
                <div className="text-3xl font-black text-slate-200 absolute top-4 right-4">03</div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined">storage</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase">Ổ CỨNG 100% SẠCH</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  SSD mới 100% chính hãng, không lỗi Bad Sector, bảo vệ toàn vẹn dữ liệu sổ sách kế toán.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 transition-all relative">
                <div className="text-3xl font-black text-slate-200 absolute top-4 right-4">04</div>
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined">verified</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase">BẢO HÀNH ĐỔI MỚI</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  SSD/RAM mới bảo hành 36 tháng đổi mới, thân máy 6 - 12 tháng, kích hoạt bảo hành điện tử.
                </p>
              </div>
            </div>

            {/* NHẬN XÉT CỦA KHÁCH HÀNG (DẠNG CUỘN NGANG TỰ ĐỘNG CHẬM RÃI, 5 REVIEW) */}
            <div className="space-y-6 pt-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    NHẬN XÉT CỦA KHÁCH HÀNG
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="flex text-amber-500">
                    <span className="material-symbols-outlined text-base fill-current">star</span>
                    <span className="material-symbols-outlined text-base fill-current">star</span>
                    <span className="material-symbols-outlined text-base fill-current">star</span>
                    <span className="material-symbols-outlined text-base fill-current">star</span>
                    <span className="material-symbols-outlined text-base fill-current">star</span>
                  </div>
                  <span className="font-bold text-slate-900">5.0 / 5.0</span>
                  <span>• Từ khách hàng doanh nghiệp &amp; cá nhân tại Long An - Tây Ninh</span>
                </div>
              </div>

              {/* Ticker / Marquee auto-scrolling container */}
              <div className="relative overflow-hidden w-full py-2">
                <div className="animate-marquee-slow gap-5 flex items-stretch">
                  {[...CUSTOMER_REVIEWS, ...CUSTOMER_REVIEWS].map((rev, idx) => (
                    <div
                      key={idx}
                      className="w-[320px] sm:w-[370px] p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all shrink-0 flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-xs shadow-xs">
                              {rev.name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="text-xs font-bold text-slate-900 leading-tight">{rev.name}</h3>
                              <p className="text-[11px] text-slate-500">{rev.role}</p>
                            </div>
                          </div>
                          <div className="text-amber-500 text-xs tracking-tighter">★★★★★</div>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed italic">
                          &quot;{rev.comment}&quot;
                        </p>
                      </div>
                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="text-blue-700 font-semibold">{rev.service}</span>
                        <span>{rev.location}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 6. KHỐI 5: FAQ DẠNG COLLAPSED TAB (CHỈ SHOW CÂU HỎI, CLICK BUNG CÂU TRẢ LỜI) */}
          <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 scroll-mt-20" id="faq-an-tam">
            <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
              <div className="text-xs uppercase tracking-widest text-blue-700 font-bold">
                Hỏi đáp &amp; Quyền lợi khách hàng
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                CÂU HỎI THƯỜNG GẶP
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Nhấn vào từng câu hỏi để xem chi tiết chính sách phục vụ của Vi tính An Tâm.
              </p>
            </div>

            <div className="space-y-3">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden transition-all"
                  >
                    {/* Collapsed Tab Header (Question only) */}
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-lg">{item.icon}</span>
                        </div>
                        <span className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                          {item.question}
                        </span>
                      </div>
                      <span
                        className={`material-symbols-outlined text-slate-400 transition-transform duration-200 shrink-0 ${
                          isOpen ? 'rotate-180 text-blue-700 font-bold' : ''
                        }`}
                      >
                        keyboard_arrow_down
                      </span>
                    </button>

                    {/* Expandable Tab Content (Answer) */}
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed pl-16 border-t border-slate-100 bg-slate-50/40 animate-fade-in">
                        <p>{item.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* 7. KHỐI 6: PHỦ SÓNG & TRỤ SỞ */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" id="chinh-sach">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="space-y-1">
                                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      MẠNG LƯỚI KỸ THUẬT LƯU ĐỘNG LONG AN - TÂY NINH
                    </h2>
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs text-slate-600">
                      Đội cơ động tiếp nhận kiểm tra, giao máy và đổi mới linh kiện tận nơi trong vòng 30 - 60 phút tại các khu vực:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-medium">
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-blue-700 text-sm">location_on</span> TP. Tân An (P1 - P7)
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-blue-700 text-sm">location_on</span> Khánh Hậu &amp; Tân Khánh
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-blue-700 text-sm">location_on</span> TT. Thủ Thừa &amp; Xã liền kề
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-blue-700 text-sm">location_on</span> Châu Thành (Long An)
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-blue-700 text-sm">location_on</span> Huyện Tân Trụ (Lân cận)
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-blue-700 text-sm">near_me</span> KCN Tân Hương &amp; Lợi Bình Nhơn
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50/70 border-l-4 border-amber-500 border border-amber-200">
                    <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-amber-600 text-base">schedule</span>
                      KHUNG GIỜ VÀNG CỨU HỘ NGOÀI GIỜ (DÀNH CHO CƠ QUAN & DÂN VĂN PHÒNG)
                    </h4>
                    <p className="text-xs text-amber-900/90 mt-1 leading-relaxed">
                      Ưu tiên cứu hộ tận nơi: <strong>17h30 – 21h00 các ngày trong tuần</strong> và{' '}
                      <strong>08h00 – 20h00 Thứ Bảy &amp; Chủ Nhật</strong>. Không phụ thu phí ngoài giờ.
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-slate-500">Hotline Khẩn Cấp &amp; Zalo Kỹ Thuật:</div>
                    <div className="text-xl sm:text-2xl font-black text-blue-700 tracking-tight font-mono">
                      0909.053.058
                    </div>
                  </div>
                  <a
                    href="tel:0909053058"
                    className="w-full sm:w-auto px-6 py-3 rounded-lg bg-blue-700 text-white font-bold text-xs tracking-wide shadow-xs hover:bg-blue-800 transition-all text-center"
                  >
                    Gọi Trực Tiếp KTV Ca Trực
                  </a>
                </div>
              </div>

              <div className="lg:col-span-5 rounded-3xl overflow-hidden border border-slate-200 shadow-sm min-h-[340px] flex flex-col justify-end relative bg-slate-100">
                <div
                  className="absolute inset-0 w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDPeBE7zx4jFr55whVIMpu_vvpknBNbLCErI1sjZyynZE37AS5A7PTHQTp3KSxm56vWHXOKRZ6peq8jgDZjQCpOvcU0uvxsDgouHKCuXDiySuHKXW_hTHV7R01vDu1Ww9Z0sAfhevZBIFXodWAnb1A2xgWxPzVU721Vw-uVl9Ocx4FoBq84hNS20zIpb692Kb5s307GQFMIC-8fsAJsXxouIUHpSwv0ubWCnjs6KeoqKkTha4Udk05l')",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
                <div className="relative p-6 space-y-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-700 text-white text-[10px] font-bold shadow-xs">
                    TRỤ SỞ CHÍNH
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">
                    Vi Tính An Tâm - Hub Tân An
                  </h3>
                  <p className="text-xs text-slate-700">
                    45 Nguyễn Huệ, Phường 1, TP. Tân An, Tỉnh Long An (Có bãi đỗ ô tô thuận tiện)
                  </p>
                  <div className="pt-2">
                    <a
                      className="inline-flex items-center gap-1.5 text-xs text-blue-700 font-bold hover:underline"
                      href="https://maps.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="material-symbols-outlined text-sm">directions</span> Chỉ đường trên Google Maps
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* FLOATING CIRCULAR ACTION BUTTONS (Góc phải màn hình) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
        {/* Kiểm tra bảo hành */}
        <Link
          href="/tra-cuu-bao-hanh"
          className="pointer-events-auto w-12 h-12 rounded-full bg-white hover:bg-blue-50 text-blue-700 border-2 border-blue-700 text-blue-700 shadow-xl shadow-blue-600/15 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 group relative"
          title="Kiểm tra bảo hành điện tử"
        >
          <span className="material-symbols-outlined text-2xl">qr_code_scanner</span>
          {/* Tooltip */}
          <span className="opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 absolute right-14 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold whitespace-nowrap shadow-xl flex items-center gap-1.5">
            <span>Kiểm tra bảo hành</span>
          </span>
        </Link>

        {/* Gọi điện Hotline */}
        <a
          href="tel:0909053058"
          className="pointer-events-auto w-13 h-13 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/35 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 group relative"
          title="Gọi Hotline kỹ thuật 24/7"
        >
          <span className="material-symbols-outlined text-2xl animate-pulse">phone_in_talk</span>
          {/* Tooltip */}
          <span className="opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 absolute right-15 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold whitespace-nowrap shadow-xl flex items-center gap-1.5">
            <span className="text-orange-400 font-bold">Hotline:</span>
            <span>0909.053.058 (24/7)</span>
          </span>
        </a>

        {/* Nhắn Zalo Kỹ Thuật */}
        <a
          href="https://zalo.me/0909053058"
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto w-14 h-14 rounded-full bg-[#0068FF] hover:bg-[#0054d1] text-white shadow-2xl shadow-blue-500/40 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 group relative"
          title="Nhắn tin Zalo kỹ thuật"
        >
          <span className="material-symbols-outlined text-2xl">chat</span>
          {/* Live Online Dot */}
          <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
          </span>
          {/* Tooltip */}
          <span className="opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 absolute right-16 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold whitespace-nowrap shadow-xl flex items-center gap-1.5">
            <span className="font-bold text-sky-300">Zalo:</span>
            <span>Nhắn Kỹ thuật trực ca</span>
          </span>
        </a>

        {/* Scroll to Top */}
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="pointer-events-auto w-9 h-9 rounded-full bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 shadow-md flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 group relative"
          title="Lên đầu trang"
        >
          <span className="material-symbols-outlined text-lg">arrow_upward</span>
        </button>
      </div>
    </div>
  );
}
