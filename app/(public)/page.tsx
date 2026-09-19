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

export default function HomePage() {
  const { findWarrantyByTagOrPhone } = useViTinhAnTamStore();

  // Search state
  const [searchInput, setSearchInput] = useState('ST-8F4K92X');
  const [searchResult, setSearchResult] = useState<any>(() => {
    return findWarrantyByTagOrPhone('ST-8F4K92X');
  });
  const [isSearching, setIsSearching] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
    <div className="min-h-screen bg-white text-slate-800 antialiased selection:bg-blue-600 selection:text-white pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 right-4 z-50 bg-white text-slate-900 px-4 py-3 rounded-xl shadow-2xl border-2 border-blue-600 text-xs font-semibold flex items-center gap-2.5 animate-bounce">
          <span className="material-symbols-outlined text-blue-600 text-lg">check_circle</span>
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
                <div className="space-y-3">
                  <span className="text-xs uppercase tracking-[0.2em] font-bold text-blue-600 flex items-center gap-2">
                    <span className="w-6 h-0.5 bg-blue-600" />
                    Đơn vị tiên phong máy chuẩn A tại Long An
                  </span>
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                    Máy Tính Cũ Chuẩn A – Cài Sẵn Win Bản Quyền Số –{' '}
                    <span className="text-blue-600">Đổi Mới Tận Nơi Trong 2 Giờ</span>
                  </h1>
                </div>

                <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl">
                  Chuyên cung cấp PC đồng bộ văn phòng, laptop doanh nhân tuyển chọn kỹ lưỡng &amp; dịch vụ hồi sinh máy tính cấp tốc tại Thành phố Tân An và các huyện lân cận tỉnh Long An.
                </p>

                {/* 3 Cam Kết Thép */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                  <div className="p-4 rounded-xl bg-white border border-blue-100 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all group">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-xl">verified_user</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">100% Win Bản Quyền Sạch</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-snug">
                      Active kỹ thuật số vĩnh viễn, không cài lậu, an toàn dữ liệu thuế &amp; kế toán.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-blue-100 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all group">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-xl">swap_horiz</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">Bảo Hành 1 Đổi 1 - 15 Phút</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-snug">
                      Đổi linh kiện/máy ngay tại quầy hoặc trong 2 giờ tận nơi, không giữ máy ngâm đồ.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-blue-100 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all group">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-xl">memory</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">SSD/RAM Mới Hãng 36T</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-snug">
                      Linh kiện Kingston/Samsung mới 100% nguyên hộp, bảo hành hãng trọn vẹn 3 năm.
                    </p>
                  </div>
                </div>

                {/* Dual CTA Buttons */}
                <div className="flex flex-wrap items-center gap-3.5 pt-3">
                  <a
                    href="#danh-muc-san-pham"
                    className="px-6 py-3.5 rounded-lg bg-blue-600 text-white font-semibold text-sm tracking-wide shadow-xs hover:bg-blue-700 transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">computer</span>
                    <span>Xem Danh Mục Máy Sẵn Có</span>
                  </a>
                  <Link
                    href="/dat-lich"
                    className="px-6 py-3.5 rounded-lg bg-white border border-slate-300 hover:border-blue-400 text-slate-700 hover:text-blue-600 font-semibold text-sm shadow-xs transition-all flex items-center gap-2"
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
                      <span>SẴN KHO TÂN AN</span>
                    </div>
                  </div>

                  {/* Diagnostics Badge Preview */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">Tiêu chuẩn tuyển chọn máy:</span>
                      <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
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

          {/* 2. KHỐI 1: DANH MỤC PC & LAPTOP TUYỂN CHỌN */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20" id="danh-muc-san-pham">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <div className="text-xs uppercase tracking-widest text-blue-600 font-bold mb-1">
                  Thiết Bị Sẵn Hàng - Giao Trong 60 Phút
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  PC &amp; Laptop Tuyển Chọn Chuẩn Doanh Nghiệp
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
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                Tất cả (28 máy sẵn)
              </button>
              <button
                onClick={() => setActiveCategory('office')}
                className={`px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all shadow-xs ${
                  activeCategory === 'office'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                PC Văn Phòng - Kế Toán (3 - 6tr)
              </button>
              <button
                onClick={() => setActiveCategory('laptop')}
                className={`px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all shadow-xs ${
                  activeCategory === 'laptop'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                Laptop Doanh Nhân (Bền Bỉ)
              </button>
              <button
                onClick={() => setActiveCategory('workstation')}
                className={`px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all shadow-xs ${
                  activeCategory === 'workstation'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600'
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
                      <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
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
                        <span className="material-symbols-outlined text-sm text-blue-600">memory</span>
                        <span>{prod.specs.cpu}</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-blue-600">developer_board</span>
                        <span>{prod.specs.ram}</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-blue-600">storage</span>
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
                      <span className="text-lg font-bold text-blue-600 font-mono">
                        {formatVND(prod.price)}
                      </span>
                    </div>
                    <a
                      href="tel:0903892100"
                      className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs tracking-wide transition-all text-center block shadow-xs"
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
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                  <span className="material-symbols-outlined text-sm text-blue-600">bolt</span> Cứu hộ máy chậm - đơ - sập nguồn
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  Dịch Vụ Tận Nơi &amp; &quot;Spa Hồi Sinh Máy Cũ&quot; Trong 2 Giờ
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
                    <h3 className="text-lg font-bold text-slate-900">Gói Hồi Sinh Máy Cũ (Tăng Tốc x5)</h3>
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
                    <div className="text-base sm:text-lg font-bold text-blue-600">Báo giá minh bạch sau kiểm tra</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Tư vấn nâng cấp đúng nhu cầu, không vẽ bệnh</div>
                  </div>
                </div>

                {/* Gói 2 */}
                <div className="p-6 rounded-2xl bg-blue-50/50 border-2 border-blue-500 shadow-sm flex flex-col justify-between hover:bg-white transition-all group relative">
                  <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-blue-600 text-white font-bold text-[10px] tracking-wide shadow-xs">
                    ĐƯỢC ĐẶT NHIỀU NHẤT
                  </div>
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg group-hover:rotate-6 transition-transform">
                      <span className="material-symbols-outlined text-2xl">ac_unit</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Spa Làm Mát Chuyên Sâu</h3>
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
                    <div className="text-base sm:text-lg font-bold text-blue-600">Báo giá tận nơi theo dòng máy</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Kiểm tra nhiệt độ CPU &amp; cánh quạt miễn phí</div>
                  </div>
                </div>

                {/* Gói 3 */}
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-300 hover:bg-white transition-all group">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg group-hover:rotate-6 transition-transform">
                      <span className="material-symbols-outlined text-2xl">security</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Tối Ưu Windows Bản Quyền</h3>
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
                    <div className="text-base sm:text-lg font-bold text-blue-600">Báo giá theo nhu cầu cài đặt</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Hỗ trợ phần mềm văn phòng &amp; kết nối máy in</div>
                  </div>
                </div>
              </div>

              {/* Big CTA */}
              <div className="text-center">
                <Link
                  href="/dat-lich"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-blue-600 text-white font-bold text-sm sm:text-base tracking-wide shadow-sm hover:bg-blue-700 transition-all hover:scale-[1.01]"
                >
                  <span className="material-symbols-outlined text-xl">electric_moped</span>
                  <span>Đặt Lịch Kỹ Thuật Viên Qua Tận Nơi Trong 2 Giờ (Hotline: 0903.892.100)</span>
                </Link>
              </div>
            </div>
          </section>

          {/* 4. KHỐI 3: TRA CỨU BẢO HÀNH (SĐT HOẶC SERVICE TAG) */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20" id="tra-cuu-bao-hanh">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <div className="text-xs uppercase tracking-widest text-blue-600 font-bold">Minh Bạch Tuyệt Đối 24/7</div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Cổng Tra Cứu Bảo Hành Điện Tử
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Nhập Số điện thoại mua hàng hoặc mã Service Tag trên tem máy để tra cứu quyền lợi bảo hành đa tầng tức thì.
              </p>
            </div>

            {/* Search Box - Text/Tag Only as requested */}
            <div className="max-w-3xl mx-auto p-5 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm mb-8">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch gap-3">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Nhập Số điện thoại (vd: 0918...) hoặc Service Tag (vd: ST-8F4K92X)..."
                    className="w-full pl-11 pr-4 py-3.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-7 py-3.5 rounded-lg bg-blue-600 text-white font-semibold text-sm shadow-xs hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-lg">verified</span>
                  <span>{isSearching ? 'Đang tìm...' : 'Tra Cứu Ngay'}</span>
                </button>
              </form>

              {/* Quick Presets */}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>Gợi ý tìm nhanh:</span>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('ST-8F4K92X')}
                  className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[11px] font-semibold hover:bg-blue-100 border border-blue-100"
                >
                  ST-8F4K92X (Dell OptiPlex)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('PC-GAMING-9921')}
                  className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[11px] font-semibold hover:bg-blue-100 border border-blue-100"
                >
                  PC-GAMING-9921
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('0918234891')}
                  className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-semibold hover:bg-slate-200 border border-slate-200"
                >
                  SĐT: 0918234891
                </button>
              </div>
            </div>

            {/* Search Result - Multi-tier Display */}
            {searchResult && (
              <div
                id="lookup-result"
                className="max-w-3xl mx-auto p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm transition-all space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900 font-headline">
                        {searchResult.item?.device_model || searchResult.ticket?.device_name || 'Thiết bị An Tâm'}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-xs font-mono text-blue-700 font-semibold">
                        Tag: {searchResult.item?.service_tag || searchResult.ticket?.device_service_tag || 'ST-XXXX'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Chủ sở hữu: <strong className="text-slate-800">{searchResult.item?.customer_name || searchResult.ticket?.customer_name || 'Khách hàng'}</strong>{' '}
                      • Bàn giao: {searchResult.item?.handover_date || '15/05/2025'}
                    </p>
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      ĐANG TRONG HẠN BẢO HÀNH CHÍNH THỨC
                    </span>
                  </div>
                </div>

                {/* Multi-tier Warranty breakdown */}
                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    Phân Rã Thời Hạn Bảo Hành Đa Tầng (Multi-tier Warranty)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-xs text-slate-500">Tầng 1: Thân máy &amp; Bo mạch</div>
                      <div className="text-sm font-bold text-slate-900 mt-1">BH 12 Tháng</div>
                      <div className="text-[11px] text-blue-600 font-semibold mt-0.5">
                        Còn hiệu lực đến 15/05/2026
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-xs text-slate-500">Tầng 2: Ổ cứng SSD Mới</div>
                      <div className="text-sm font-bold text-slate-900 mt-1">
                        Sức khỏe: {searchResult.item?.specs.ssd_health || 100}% ({searchResult.item?.specs.ssd_status || 'Good'})
                      </div>
                      <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                        BH Hãng Kingston 36T
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-xs text-slate-500">Tầng 3: Dịch vụ phần mềm</div>
                      <div className="text-sm font-bold text-slate-900 mt-1">Hỗ trợ Ultraviewer</div>
                      <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                        Miễn phí 30 ngày từ xa
                      </div>
                    </div>
                  </div>
                </div>

                {/* Support CTAs */}
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-600 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-blue-600 text-base">support_agent</span>
                    <span>KTV phụ trách: <strong className="text-slate-900">Trịnh Minh Tuấn (KTV Tân An)</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <a
                      href="https://zalo.me/0903892100"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-800 font-semibold transition-all text-center border border-slate-200"
                    >
                      Nhắn Zalo Kỹ thuật
                    </a>
                    <Link
                      href="/dat-lich"
                      className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all text-center shadow-xs"
                    >
                      Báo Sự Cố Tận Nơi (2 Giờ)
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* 5. KHỐI 4: QUY TRÌNH KIỂM ĐỊNH & BẰNG CHỨNG */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <div className="text-xs uppercase tracking-widest text-blue-600 font-bold">Quy Chuẩn Kỹ Thuật Độc Quyền</div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Quy Trình Kiểm Định 4 Lớp Trước Khi Giao
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Chúng tôi từ chối nhập máy sửa chữa chắp vá. Mỗi linh kiện xuất kho đều phải vượt qua bài kiểm tra áp lực khắt khe.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-sm hover:border-blue-300 transition-all relative">
                <div className="text-3xl font-black text-slate-200 absolute top-4 right-4">01</div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined">electric_meter</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">Kiểm Tra Tụ &amp; Nguồn CST</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Đo dòng điện tải thực tế, soi tụ điện bo mạch chống phù nổ, bảo đảm nguồn CST cấp điện sạch không sụt áp.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-sm hover:border-blue-300 transition-all relative">
                <div className="text-3xl font-black text-slate-200 absolute top-4 right-4">02</div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined">speed</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">Stress Test 45 Phút</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Chạy toàn tải phần mềm FurMark ép nhiệt độ &amp; MemTest86 kiểm tra triệt để lỗi dump xanh RAM trước khi đóng nắp.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-sm hover:border-blue-300 transition-all relative">
                <div className="text-3xl font-black text-slate-200 absolute top-4 right-4">03</div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined">health_and_safety</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">Kiểm Định CrystalDiskInfo</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Chỉ chấp nhận ổ cứng đạt 100% Good, không có bất kỳ Bad Sector nào. Xuất file log lưu trữ bảo hành.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-sm hover:border-blue-300 transition-all relative">
                <div className="text-3xl font-black text-slate-200 absolute top-4 right-4">04</div>
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined">qr_code_2</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">Dán Tem &amp; Cấp Mã Định Danh</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Dán tem vỡ niêm phong ốc chống tráo đổi và kích hoạt mã định danh bảo hành điện tử tức thời vào hệ thống CRM.
                </p>
              </div>
            </div>

            {/* Evidence & Reviews */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs uppercase tracking-wider font-bold text-blue-600">
                      Chứng Minh Kỹ Thuật Thực Tế
                    </span>
                    <span className="text-xs text-slate-500">Hình ảnh thật tại Hub kỹ thuật</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-xl overflow-hidden bg-slate-50 border border-slate-200 p-2.5">
                      <img
                        className="w-full h-40 object-cover rounded-lg border border-slate-200"
                        alt="CrystalDiskInfo kiểm tra sức khỏe ổ cứng 100% Good"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuC029CoruBnm8fGWkyE63vDItpJxzogQcmjrNCOdfRe7TTfyvWh34tjVM1cLsfj96Au6DIUr7C8S8KBLoU2qf_PNbB5m4_uDEnHsXrmRWfUGcvaRAQ3Imj33rRPWd9Ea3e6KWm8IJr9-eQaPTgVMKQ790bu89u7v9iaqYvqriddhK_gRe63stu7raFwUoj5-Bc6fkcZgKbW-dS4Uqex9BY_rcKNN_yKffyFClJnHV0vl2jMBIPUuRfv"
                      />
                      <p className="text-[11px] text-slate-700 mt-2 text-center font-semibold">
                        100% Ổ cứng mới hoặc tuyển Good 100%
                      </p>
                    </div>
                    <div className="rounded-xl overflow-hidden bg-slate-50 border border-slate-200 p-2.5">
                      <img
                        className="w-full h-40 object-cover rounded-lg border border-slate-200"
                        alt="Windows 11 kích hoạt bản quyền số vĩnh viễn"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCgYulbBrii7ddd9JwGC9F1tAjwJXQsAVNEqjDOY9QDXkHW2E_-UVvvv_yRSTfF8khSQXqJhwzL9xyqdLgK0rxsA6wHoY2wzEhsVoVlErALdMl6ffFxdBWQj1Uq4uIBA3pTlJDlX9-Xm1TU9m4wNP0yflZaaCPxg8M5nLPQ9G-SwaKmQ6RJnHVAzM45ACVzVqhR4jjd6mQV8wut27upo3Hcsqy7WQjnJHE8LadmKv3-KfkH_peScHQ"
                      />
                      <p className="text-[11px] text-slate-700 mt-2 text-center font-semibold">
                        Bản quyền số vĩnh viễn (Digital License)
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-base">verified</span>
                  <span>Khách hàng có quyền yêu cầu mở xem trực tiếp linh kiện bên trong máy trước khi thanh toán.</span>
                </div>
              </div>

              <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500 fill-current">grade</span>
                      <span className="text-xl font-bold text-slate-900">4.9 / 5.0</span>
                    </div>
                    <span className="text-xs text-slate-500">128 đánh giá Google Maps</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Anh Tuấn (Kế toán Xây Dựng - P.2 Tân An)</span>
                      <div className="text-amber-500 text-xs">★★★★★</div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      &quot;Mua cây Dell 7060 của An Tâm dùng gần 8 tháng nay chạy MISA cực mượt. Có hôm quạt bị kẹt bụi gọi KTV chạy qua vệ sinh tận nhà chỉ sau 40 phút. Dịch vụ rất uy tín!&quot;
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Chị Mai Lan (Thị trấn Thủ Thừa)</span>
                      <div className="text-amber-500 text-xs">★★★★★</div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      &quot;Gói Spa máy và nâng SSD 256GB làm máy cũ của mình chạy nhanh hơn hẳn, không bị đơ giật như trước. Ưng nhất là giữ nguyên toàn bộ ảnh gia đình và tài liệu.&quot;
                    </p>
                  </div>
                </div>
                <div className="pt-4 mt-2">
                  <a
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-bold"
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Xem tất cả 128 đánh giá thực tế trên Google Maps →
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* 6. KHỐI 5: FAQ */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-20" id="faq-an-tam">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <div className="text-xs uppercase tracking-widest text-blue-600 font-bold">
                Giải Đáp Thắc Mắc &amp; Minh Bạch Quyền Lợi
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Câu Hỏi Thường Gặp Của Khách Hàng
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Những băn khoăn thực tế của cơ quan, văn phòng và người dùng máy tính tại TP. Tân An cùng các huyện lân cận.
              </p>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-blue-300 transition-all">
                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-blue-600 text-lg shrink-0 mt-0.5">help</span>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    Chính sách bảo hành 1 đổi 1 tận nơi trong 2 giờ hoạt động thế nào?
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-7">
                  Khi gặp sự cố phần cứng, quý khách chỉ cần nhập SĐT/Service Tag hoặc gọi Hotline 0903.892.100. KTV An Tâm sẽ mang sẵn linh kiện hoặc máy thay thế đến tận nơi trong bán kính 10km (Tân An, Thủ Thừa, Châu Thành) để đổi mới ngay trong 15-30 phút, tuyệt đối không giữ máy ngâm đồ làm gián đoạn công việc.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-blue-300 transition-all">
                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-blue-600 text-lg shrink-0 mt-0.5">security</span>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    Nâng cấp SSD và cài lại máy có bị mất dữ liệu hóa đơn thuế &amp; MISA không?
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-7">
                  Hoàn toàn an tâm! Kỹ thuật viên áp dụng quy trình Clone Sector-by-Sector nguyên bản từ ổ cứng cũ sang SSD NVMe mới. Toàn bộ chữ ký số, hóa đơn điện tử, dữ liệu phần mềm kế toán MISA, file Desktop và tài khoản Zalo/trình duyệt đều được giữ nguyên 100%, không cần kích hoạt lại chứng thư số.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-blue-300 transition-all">
                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-blue-600 text-lg shrink-0 mt-0.5">schedule</span>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    Tôi làm giờ hành chính, Vi Tính An Tâm có hỗ trợ ngoài giờ sau 17h30 không?
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-7">
                  Có. Chúng tôi có khung giờ vàng cứu hộ ngoài giờ: <strong>17h30 – 21h00 các ngày trong tuần</strong> và <strong>08h00 – 20h00 cả thứ Bảy, Chủ Nhật</strong>. Kỹ thuật viên qua trực tiếp văn phòng hoặc nhà riêng tại Tân An và các xã lân cận mà không phụ thu bất kỳ khoản phí ngoài giờ nào.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-blue-300 transition-all">
                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-blue-600 text-lg shrink-0 mt-0.5">verified_user</span>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    Máy tính cũ tại An Tâm có được mở nắp xem bên trong trước khi trả tiền không?
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-7">
                  Khách hàng được quyền mở nắp thùng máy kiểm tra trực tiếp bo mạch sạch đẹp không sửa chữa, soi quạt tản, xem nhãn SSD/RAM chính hãng nguyên hộp và trực tiếp test CrystalDiskInfo 100% Good, FurMark ép nhiệt độ ổn định trước khi quyết định thanh toán.
                </p>
              </div>
            </div>
          </section>

          {/* 7. KHỐI 6: PHỦ SÓNG & TRỤ SỞ */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" id="chinh-sach">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="space-y-1">
                    <div className="text-xs uppercase tracking-widest text-blue-600 font-bold">Phủ Sóng Toàn Diện 10KM</div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      Mạng Lưới Kỹ Thuật Lưu Động Long An
                    </h2>
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs text-slate-600">
                      Đội cơ động tiếp nhận kiểm tra, giao máy và đổi mới linh kiện tận nơi trong vòng 30 - 60 phút tại các khu vực:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-medium">
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-blue-600 text-sm">location_on</span> TP. Tân An (P1 - P7)
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-blue-600 text-sm">location_on</span> Khánh Hậu &amp; Tân Khánh
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-blue-600 text-sm">location_on</span> TT. Thủ Thừa &amp; Xã liền kề
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-blue-600 text-sm">location_on</span> Châu Thành (Long An)
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-blue-600 text-sm">location_on</span> Huyện Tân Trụ (Lân cận)
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-blue-600 text-sm">near_me</span> KCN Tân Hương &amp; Lợi Bình Nhơn
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50/70 border-l-4 border-amber-500 border border-amber-200">
                    <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-amber-600 text-base">schedule</span>
                      Khung Giờ Vàng Cứu Hộ Ngoài Giờ (Dành cho cơ quan &amp; dân văn phòng)
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
                    <div className="text-xl sm:text-2xl font-black text-blue-600 tracking-tight font-mono">
                      0903.892.100
                    </div>
                  </div>
                  <a
                    href="tel:0903892100"
                    className="w-full sm:w-auto px-6 py-3 rounded-lg bg-blue-600 text-white font-bold text-xs tracking-wide shadow-xs hover:bg-blue-700 transition-all text-center"
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
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-600 text-white text-[10px] font-bold shadow-xs">
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
                      className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-bold hover:underline"
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

      {/* FOOTER - CLEAN WHITE CANVAS & BLUE PRIMARY */}
      <footer className="w-full bg-white border-t border-slate-200 pt-16 pb-10 text-slate-600 mt-16 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pb-10 border-b border-slate-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-600/20">
                  <span className="material-symbols-outlined text-2xl">verified_user</span>
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Vi Tính An Tâm</h2>
                  <p className="text-xs text-slate-500 font-medium">Bán bằng tâm để bạn an tâm • TP. Tân An, Long An</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="px-4 py-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs flex items-center gap-2.5 text-slate-700 font-medium">
                  <span className="material-symbols-outlined text-blue-600 text-base">verified_user</span>
                  <span>100% Win bản quyền sạch</span>
                </div>
                <div className="px-4 py-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs flex items-center gap-2.5 text-slate-700 font-medium">
                  <span className="material-symbols-outlined text-blue-600 text-base">sync</span>
                  <span>Bảo hành 1 đổi 1 trong 15 phút</span>
                </div>
                <div className="px-4 py-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs flex items-center gap-2.5 text-slate-700 font-medium">
                  <span className="material-symbols-outlined text-blue-600 text-base">memory</span>
                  <span>SSD/RAM mới bảo hành 36T</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-10 text-sm">
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">home_pin</span>
                <span>Hub Kỹ Thuật TP. Tân An</span>
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed">45 Nguyễn Huệ, Phường 1, TP. Tân An, Tỉnh Long An</p>
              <div className="pt-1 space-y-1.5 text-xs text-slate-600">
                <p><strong className="text-slate-900 font-bold">Hotline / Zalo:</strong> <span className="text-blue-600 font-bold">0903.892.100</span></p>
                <p><strong className="text-slate-900 font-bold">Hỗ trợ kỹ thuật:</strong> 24/7 trực ca tiếp nhận</p>
                <p><strong className="text-slate-900 font-bold">Email:</strong> lienhe@vitinhantham.vn</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">near_me</span>
                <span>Ranh Giới Dịch Vụ (10km)</span>
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Đội cơ động tiếp nhận kiểm tra &amp; sửa chữa tận nơi có mặt trong 2 giờ:
              </p>
              <ul className="text-xs space-y-1.5 text-slate-600">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>Thành phố Tân An (nội thành &amp; ngoại thành)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>Huyện Thủ Thừa (thị trấn &amp; xã liền kề)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>Huyện Châu Thành (bán kính kết nối)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>Huyện Tân Trụ (khu vực lân cận)</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">schedule</span>
                <span>Giờ Phục Vụ Linh Hoạt</span>
              </h3>
              <div className="text-xs space-y-2 text-slate-600">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <strong className="text-slate-900 font-bold block mb-0.5">Thứ 2 - Thứ 6:</strong>
                  <span>Tiếp khách văn phòng: 08h00 - 17h30</span><br />
                  <span className="text-blue-700 font-semibold">Cứu hộ tận nơi ưu tiên: 17h30 - 21h00</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <strong className="text-slate-900 font-bold block mb-0.5">Thứ 7 &amp; Chủ Nhật:</strong>
                  <span>Phục vụ trọn ngày: 08h00 - 21h00</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">policy</span>
                <span>Chính Sách &amp; Điều Lệ</span>
              </h3>
              <ul className="text-xs space-y-2 text-slate-600">
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-emerald-600 text-sm shrink-0 mt-0.5">check_circle</span>
                  <span>Chính sách 1 đổi 1 tận nơi nhanh chóng</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-emerald-600 text-sm shrink-0 mt-0.5">check_circle</span>
                  <span>Cam kết tuyệt đối bảo mật dữ liệu khách hàng</span>
                </li>
                <li className="flex items-start gap-1.5 text-rose-600 font-medium">
                  <span className="material-symbols-outlined text-rose-600 text-sm shrink-0 mt-0.5">cancel</span>
                  <span>Lưu ý: Không cung cấp dịch vụ cho thuê</span>
                </li>
                <li className="flex items-start gap-1.5 text-rose-600 font-medium">
                  <span className="material-symbols-outlined text-rose-600 text-sm shrink-0 mt-0.5">cancel</span>
                  <span>Lưu ý: Không nhận cứu dữ liệu phòng lab</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2025 Vi Tính An Tâm (vitinhantham.vn) - Tận tâm trao chất lượng.</p>
            <div className="flex items-center gap-6">
              <a className="hover:text-blue-600 transition-colors font-medium" href="#chinh-sach">
                Quy định bảo hành
              </a>
              <Link className="hover:text-blue-600 transition-colors flex items-center gap-1 font-medium" href="/login">
                <span className="material-symbols-outlined text-sm text-blue-600">lock</span>
                <span>Đăng nhập nội bộ</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* MOBILE STICKY BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-md py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="hidden lg:flex items-center gap-2.5 text-xs text-slate-600">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">verified_user</span>
            </div>
            <div>
              <p className="font-bold text-slate-900 leading-tight">Hỗ trợ Kỹ thuật Tân An 24/7</p>
              <p className="text-[11px] text-slate-500">Đổi mới linh kiện tận nơi trong 2 giờ • Hotline trực ca</p>
            </div>
          </div>
          <div className="flex items-center justify-center sm:justify-end gap-2 sm:gap-3 w-full md:w-auto">
            <a
              className="flex-1 sm:flex-none px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 shadow-xs transition-all"
              href="https://zalo.me/0903892100"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="material-symbols-outlined text-base sm:text-lg">chat</span>
              <span>Nhắn Zalo Kỹ thuật</span>
            </a>
            <a
              className="flex-1 sm:flex-none px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 shadow-xs transition-all"
              href="tel:0903892100"
            >
              <span className="material-symbols-outlined text-base sm:text-lg animate-pulse">phone_in_talk</span>
              <span>Gọi: 0903.892.100</span>
            </a>
            <Link
              className="flex-1 sm:flex-none px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-white hover:bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 shadow-xs transition-all border-2 border-blue-600"
              href="/tra-cuu-bao-hanh"
            >
              <span className="material-symbols-outlined text-base sm:text-lg text-blue-600">verified</span>
              <span>Tra Cứu Tem</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
