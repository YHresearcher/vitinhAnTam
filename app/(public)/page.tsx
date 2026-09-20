'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Modal } from 'antd';
import {
  CheckCircle,
  Cpu,
  HardDrive,
  ShieldCheck,
  Zap,
  Monitor,
  Sparkles,
  Clock,
  Wrench,
  Search,
  ArrowRight,
  ArrowUp,
  Star,
  Phone,
  MessageSquare,
  ChevronDown,
  Gift,
  Server,
  Activity,
  Check,
  MapPin,
  Flame,
  BadgeCheck,
} from 'lucide-react';
import { useViTinhAnTamStore } from '@/lib/store';
import { formatVND } from '@/lib/supabase';
import {
  TRANSLATIONS,
  ENGLISH_PRODUCT_DETAILS,
  ENGLISH_FAQS,
  ENGLISH_REVIEWS,
} from '@/lib/translations';

interface ShowcaseItem {
  id: string;
  name: string;
  serviceTag: string;
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
  stockCount: number;
  shelfLocation: string;
  qcStatus: string;
  burnInDuration: number;
}

export default function HomePage() {
  const router = useRouter();
  const { inventory, faqs, reviews, currentLang } = useViTinhAnTamStore();

  const isEn = currentLang === 'en';
  const t = TRANSLATIONS[currentLang || 'vi'];

  // Search state for quick warranty lookup
  const [searchInput, setSearchInput] = useState('ST-8F4K92X');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Category filter
  const [activeCategory, setActiveCategory] = useState<'all' | 'office' | 'laptop' | 'workstation'>('all');

  // Modal for QC & S/N inspection
  const [selectedProduct, setSelectedProduct] = useState<ShowcaseItem | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchInput.trim();
    if (!query) {
      showToast(isEn ? 'Please enter a Service Tag or phone number!' : 'Vui lòng nhập S/N Service Tag hoặc Số điện thoại!');
      return;
    }
    router.push(`/tra-cuu-bao-hanh?tag=${encodeURIComponent(query)}`);
  };

  // Raw base products
  const baseProducts = [
    {
      id: 'p1',
      serviceTag: 'ST-8F4K92X',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_XqyuhdmpmXoCW362MXDLpcj2fNG91cxGDOoIMY0LGcYQAskQWuyJGtcsSnW0pBpyLO7bw1OrQ8wi9mVpOdu-SK1yucTaIPtmGcTUId2_FdxPu1gMtxhRdNoVedwLcITop_byvLpE2nKuxZpLreAdydKpuBCXJR75xOyyXcpwwH66s-vVPj1s4vIPbbmFtAedHsuaex4ZmglXWeieUbZdSc15AyrCaOY-zQ7eyOf4Okia2O9UINYf',
      category: 'office' as const,
      price: 4950000,
      stockCount: inventory.find((i) => i.service_tag === 'ST-8F4K92X')?.quantity ?? 1,
      shelfLocation: isEn ? 'Handover Rack A1' : (inventory.find((i) => i.service_tag === 'ST-8F4K92X')?.shelf_location || 'Kệ Bàn Giao'),
      qcStatus: inventory.find((i) => i.service_tag === 'ST-8F4K92X')?.qc_status || 'ready_to_sell',
      burnInDuration: 45,
      vi: {
        name: 'Dell OptiPlex 7060 SFF',
        badge: 'LOẠI A >95% NGUYÊN BẢN',
        subBadge: 'Win 11 Pro Bản Quyền Số',
        desc: 'Đồng bộ siêu êm, tối ưu tác vụ văn phòng, kế toán MISA đa nhiệm.',
        specs: {
          cpu: 'Core i5-8500 (6 nhân 6 luồng 4.10GHz)',
          ram: 'RAM 16GB DDR4 Bus 2666 (Nâng max 64GB)',
          storage: 'SSD NVMe 256GB Kingston Mới 100% (BH 36T)',
          highlight: 'Thân máy BH 12 tháng • Đổi mới tận nơi 2h',
          gift: 'Tặng combo phím chuột & lót chuột văn phòng',
        },
      },
    },
    {
      id: 'p2',
      serviceTag: 'HP-400G5M',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHypgTcRCO_QFnVWMl5MSGKNjC1WqxTCuKKxWunkvUn9ZMEKWhqPlSEBdDO0-9BpqFr3znjewmjJWd9I1QDCFVWp3bfTpdOUeo3AQP7c9L6A9d1dnWmkW-L1qmwyjqOaRtFcxgODM3sVpYEKKoh4_yX-gbUvpBxNV7XFwOPJERylPsS7sp62N0fT1Ive8lwSLth1DrVYuXtwPUfP4C1iAyKWy-1Dd2jt2azAeCeaSDwZus9pJuDtWB',
      category: 'office' as const,
      price: 3400000,
      stockCount: inventory.find((i) => i.service_tag === 'HP-400G5M')?.quantity ?? 5,
      shelfLocation: isEn ? 'Rack A1 - Level 2' : (inventory.find((i) => i.service_tag === 'HP-400G5M')?.shelf_location || 'Kệ A1 - Tầng 2'),
      qcStatus: inventory.find((i) => i.service_tag === 'HP-400G5M')?.qc_status || 'ready_to_sell',
      burnInDuration: 45,
      vi: {
        name: 'HP ProDesk 400 G5 Mini',
        badge: 'SIÊU GỌN 1 LÍT • TIẾT KIỆM ĐIỆN',
        subBadge: 'Quầy Thu Ngân / Kế Toán',
        desc: 'Gọn gàng trong lòng bàn tay, gắn lưng màn hình, hoạt động 24/7 êm ái.',
        specs: {
          cpu: 'Core i3-8100T mát êm, tiêu thụ điện chỉ 35W',
          ram: 'RAM 8GB DDR4 Bus 2666 (Nâng cấp tối đa 32GB)',
          storage: 'SSD 128GB M.2 Mới BH 36T + 500GB HDD dữ liệu',
          highlight: 'Thân máy BH 12 tháng • Cài sẵn Win 10/11 Pro OEM',
          gift: 'Tích hợp sẵn Wifi 2 băng tần + Bluetooth',
        },
      },
    },
    {
      id: 'p3',
      serviceTag: 'TP-994L2A',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAY3Z2OKz-xUCFThbDz7BYlPSSjEDsLAhCI4x2H1Up8nZwKBKYBuh7yIYXl6t4mtKIB4g3G0C-18V4mCSHCutXdsJkFacBrXKtB0j-Clmzr9Mog8CnHDhmvjqywzWS7jrpznsTqmR-iZ6hx6bZXeJn_qkONjyUPHu5grKL2C1QIFfRrIGT3llnDDr9RplUzoBtcP9rwwmdNGC5r1nR4joN0h_J9lWRXkR1ZVe8A_ZvdRivoFKlk7oAa',
      category: 'laptop' as const,
      price: 6200000,
      stockCount: inventory.find((i) => i.service_tag === 'TP-994L2A')?.quantity ?? 2,
      shelfLocation: isEn ? 'Laptop Rack B2' : (inventory.find((i) => i.service_tag === 'TP-994L2A')?.shelf_location || 'Kệ Laptop B2'),
      qcStatus: inventory.find((i) => i.service_tag === 'TP-994L2A')?.qc_status || 'ready_to_sell',
      burnInDuration: 45,
      vi: {
        name: 'ThinkPad T480s (Mỏng Nhẹ)',
        badge: 'CHUẨN QUÂN ĐỘI MỸ • VỎ CARBON',
        subBadge: 'Pin Zin 4-5H (Sức khỏe >85%)',
        desc: 'Bàn phím gõ êm số 1, vỏ sợi carbon siêu nhẹ 1.3kg, cực kỳ bền bỉ.',
        specs: {
          cpu: 'Core i5-8250U (4 nhân 8 luồng mạnh mẽ)',
          ram: 'RAM 16GB DDR4 đa nhiệm lướt web thả ga',
          storage: 'SSD 256GB NVMe siêu tốc (BH 36T đổi mới)',
          highlight: 'Kèm sạc Type-C Zin 65W • BH máy 06 tháng',
          gift: 'Màn 14" FHD IPS chống chói + Tặng túi chống sốc',
        },
      },
    },
    {
      id: 'p4',
      serviceTag: 'DV-3670I7',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHGuIrduG_aQa0fIxHB2G8eJVrnLqRVQXGS9uKbJZzSO6i-Q-8scMRHwCrMKPFIoZUU3F92-ySxJkq9bjUm9EBp59F9wGDuzXaegpW9yq3CGs57uhUJbuaBwppDhw7A9lT_ko5HNGgFq_6H2s-OeM6ET7FICEqiBPxQBAYsf0V1gzfIBV-57d46Z5chBxyUxqQtR5JDcy6MKxeinRLSv36JnAhn4o7AIb0WwwPPZodOycfilrkCRJX',
      category: 'workstation' as const,
      price: 7500000,
      stockCount: inventory.find((i) => i.service_tag === 'DV-3670I7')?.quantity ?? 3,
      shelfLocation: isEn ? 'Workstation Bay W1' : (inventory.find((i) => i.service_tag === 'DV-3670I7')?.shelf_location || 'Kệ Workstation W1'),
      qcStatus: inventory.find((i) => i.service_tag === 'DV-3670I7')?.qc_status || 'ready_to_sell',
      burnInDuration: 45,
      vi: {
        name: 'Dell Vostro 3670 MT (Core i7)',
        badge: 'CASE LỚN THOÁNG MÁT • DỄ NÂNG CẤP',
        subBadge: 'Đồ Họa & Kỹ Thuật',
        desc: 'Chuyên AutoCAD, Photoshop, Corel, Render video & mở 50 tab Chrome.',
        specs: {
          cpu: 'Core i7-8700 (6 nhân 12 luồng Turbo 4.60GHz)',
          ram: 'RAM 16GB DDR4 kênh đôi tản nhiệt tốt',
          storage: 'SSD 512GB NVMe Mới 100% (BH 36 Tháng)',
          highlight: 'Nguồn CST chuẩn 80 Plus • BH 12 tháng',
          gift: 'Card rời GTX 1050Ti 4GB GDDR5 chuyên đồ họa',
        },
      },
    },
  ];

  // Dynamically assemble showcase items in selected language
  const showcaseProducts: ShowcaseItem[] = baseProducts.map((p) => {
    if (isEn && ENGLISH_PRODUCT_DETAILS[p.id]) {
      const en = ENGLISH_PRODUCT_DETAILS[p.id];
      return {
        id: p.id,
        name: en.name,
        serviceTag: p.serviceTag,
        badge: en.badge,
        subBadge: en.subBadge,
        desc: en.desc,
        img: p.img,
        category: p.category,
        specs: {
          cpu: en.cpu,
          ram: en.ram,
          storage: en.storage,
          highlight: en.highlight,
          gift: en.gift,
        },
        price: p.price,
        stockCount: p.stockCount,
        shelfLocation: p.shelfLocation,
        qcStatus: p.qcStatus,
        burnInDuration: p.burnInDuration,
      };
    }
    return {
      id: p.id,
      name: p.vi.name,
      serviceTag: p.serviceTag,
      badge: p.vi.badge,
      subBadge: p.vi.subBadge,
      desc: p.vi.desc,
      img: p.img,
      category: p.category,
      specs: p.vi.specs,
      price: p.price,
      stockCount: p.stockCount,
      shelfLocation: p.shelfLocation,
      qcStatus: p.qcStatus,
      burnInDuration: p.burnInDuration,
    };
  });

  const filteredProducts =
    activeCategory === 'all'
      ? showcaseProducts
      : showcaseProducts.filter((p) => p.category === activeCategory);

  const totalReadyStock = showcaseProducts.reduce((sum, item) => sum + item.stockCount, 0);

  // Active FAQs and Reviews depending on language
  const activeFaqs = isEn ? ENGLISH_FAQS : faqs;
  const activeReviews = isEn ? ENGLISH_REVIEWS : reviews;

  return (
    <div className="min-h-screen bg-white text-slate-800 antialiased selection:bg-blue-700 selection:text-white pb-10">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 right-4 z-50 bg-white text-slate-900 px-4 py-3 rounded-xl shadow-2xl border-2 border-blue-700 text-blue-700 text-xs font-semibold flex items-center gap-2.5 animate-bounce">
          <CheckCircle className="w-4 h-4 text-blue-700 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="w-full">
        {/* AMBIENT LIGHT MESH DECORATIONS */}
        <div className="relative w-full overflow-hidden">
          <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[100px] pointer-events-none -z-10" />
          <div className="absolute top-[40%] -right-32 w-[450px] h-[450px] bg-sky-100/60 rounded-full blur-[100px] pointer-events-none -z-10" />

          {/* 1. HERO BANNER SECTION */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 lg:pt-12 lg:pb-16">
            <div className="max-w-4xl mx-auto text-left space-y-6">
              <div className="space-y-4">
                <span className="text-xs uppercase tracking-[0.2em] font-bold text-blue-700 flex items-center gap-2">
                  <span className="w-6 h-0.5 bg-blue-700" />
                  {t.hero.brandTag}
                </span>
                <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.2]">
                  {t.hero.mainTitle}
                </h1>
                <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs sm:text-sm font-bold shadow-xs">
                    <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                    <span>{t.hero.badgeWindows}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-xs sm:text-sm font-bold shadow-xs">
                    <Zap className="w-4 h-4 text-orange-600 shrink-0" />
                    <span>{t.hero.badge2h}</span>
                  </span>
                </div>
              </div>

              <p className="text-lg sm:text-xl text-slate-700 font-medium leading-relaxed">
                {t.hero.description}
              </p>

              {/* 3 Trụ Cột Nổi Bật */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                <div className="p-4 rounded-xl bg-white border border-blue-100 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all group">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                    <Monitor className="w-5 h-5 text-blue-700" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase">{t.hero.pillar1Title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-snug">
                    {t.hero.pillar1Desc}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-blue-100 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all group">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase">{t.hero.pillar2Title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-snug">
                    {t.hero.pillar2Desc}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-blue-100 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all group">
                  <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase">{t.hero.pillar3Title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-snug">
                    {t.hero.pillar3Desc}
                  </p>
                </div>
              </div>

              {/* Quick Warranty Lookup Bar */}
              <div className="pt-2">
                <form
                  onSubmit={handleSearchSubmit}
                  className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 to-sky-50/70 border border-blue-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
                >
                  <div className="flex items-center gap-2 text-blue-800 shrink-0 font-bold text-xs sm:text-sm pl-1">
                    <Search className="w-4 h-4 text-blue-600" />
                    <span>{t.hero.quickSearchLabel}</span>
                  </div>
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder={t.hero.quickSearchPlaceholder}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>{t.hero.quickSearchBtn}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Dual CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <a
                  href="#danh-muc-san-pham"
                  className="px-6 py-3.5 rounded-xl bg-orange-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-orange-500/25 hover:bg-orange-600 transition-all flex items-center gap-2 hover:scale-[1.02]"
                >
                  <Monitor className="w-4 h-4" />
                  <span>{t.hero.btnBrowseStock}</span>
                </a>
                <Link
                  href="/dat-lich"
                  className="px-6 py-3.5 rounded-xl bg-white border-2 border-blue-700 hover:border-blue-800 text-blue-700 hover:text-blue-800 font-bold text-sm shadow-xs transition-all flex items-center gap-2"
                >
                  <Wrench className="w-4 h-4" />
                  <span>{t.hero.btnScheduleService}</span>
                </Link>
              </div>
            </div>
          </section>

          {/* 2. KHỐI 1: DANH MỤC PC & LAPTOP TUYỂN CHỌN */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20" id="danh-muc-san-pham">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-blue-700 font-bold mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-700" />
                  <span>{t.products.tag}</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {t.products.title}
                </h2>
              </div>
              <div className="text-xs text-slate-500 font-medium">
                {t.products.readyCount} <strong className="text-blue-700 font-bold">{totalReadyStock}</strong> {t.products.readyCountSuffix}
              </div>
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
                {t.products.catAll} ({totalReadyStock})
              </button>
              <button
                onClick={() => setActiveCategory('office')}
                className={`px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all shadow-xs ${
                  activeCategory === 'office'
                    ? 'bg-blue-700 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-700'
                }`}
              >
                {t.products.catOffice}
              </button>
              <button
                onClick={() => setActiveCategory('laptop')}
                className={`px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all shadow-xs ${
                  activeCategory === 'laptop'
                    ? 'bg-blue-700 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-700'
                }`}
              >
                {t.products.catLaptop}
              </button>
              <button
                onClick={() => setActiveCategory('workstation')}
                className={`px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all shadow-xs ${
                  activeCategory === 'workstation'
                    ? 'bg-blue-700 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-700'
                }`}
              >
                {t.products.catWorkstation}
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
                      <Image
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        alt={prod.name}
                        src={prod.img}
                      />
                      <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md shadow-xs z-10">
                        {prod.badge}
                      </span>
                      <span className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-xs text-blue-700 border border-blue-200 text-[10px] font-semibold px-2 py-0.5 rounded">
                        {prod.subBadge}
                      </span>
                      {/* Real stock badge */}
                      <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>{t.products.inStock} {prod.stockCount} {t.products.inStockSuffix}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h3 className="text-base font-bold text-slate-900 leading-snug">{prod.name}</h3>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold shrink-0">
                        S/N: {prod.serviceTag}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500">{prod.desc}</p>
                    <ul className="my-3 space-y-1.5 text-xs text-slate-700">
                      <li className="flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                        <span>{prod.specs.cpu}</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                        <span>{prod.specs.ram}</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <HardDrive className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                        <span>{prod.specs.storage}</span>
                      </li>
                      <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                        <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{prod.specs.highlight}</span>
                      </li>
                      <li className="flex items-center gap-1.5 text-slate-600">
                        <Gift className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{prod.specs.gift}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-slate-100 mt-2 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500">{t.products.priceLabel}</span>
                      <span className="text-lg font-black text-orange-600 font-mono">
                        {formatVND(prod.price)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedProduct(prod)}
                        className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs tracking-wide transition-all text-center block shadow-xs"
                      >
                        {t.products.btnInspect}
                      </button>
                      <Link
                        href={`/dat-lich?device=${encodeURIComponent(prod.name)}&service=${encodeURIComponent(isEn ? 'Purchase In-Stock Unit' : 'Đặt mua máy có sẵn')}`}
                        className="w-full py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs tracking-wide transition-all text-center block shadow-xs"
                      >
                        {t.products.btnOrder}
                      </Link>
                    </div>
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
                  <Zap className="w-4 h-4 text-blue-700" /> {t.services.tag}
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {t.services.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  {t.services.subtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {/* Gói 1 */}
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-300 hover:bg-white transition-all group">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg group-hover:rotate-6 transition-transform">
                      x5
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{t.services.pkg1Title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {t.services.pkg1Desc}
                    </p>
                    <div className="pt-2 space-y-2 text-xs text-slate-700">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{t.services.pkg1F1}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{t.services.pkg1F2}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{t.services.pkg1F3}</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-slate-200 mt-6 space-y-3">
                    <div>
                      <div className="text-xs text-slate-500 font-medium">{t.services.feeLabel}</div>
                      <div className="text-base sm:text-lg font-bold text-blue-700">{t.services.pkg1Price}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{t.services.pkg1Sub}</div>
                    </div>
                    <Link
                      href={`/dat-lich?service=${encodeURIComponent(t.services.pkg1Title)}`}
                      className="w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs tracking-wide transition-all text-center block shadow-xs"
                    >
                      {t.services.btnBookPkg}
                    </Link>
                  </div>
                </div>

                {/* Gói 2 */}
                <div className="p-6 rounded-2xl bg-blue-50/50 border-2 border-blue-500 shadow-sm flex flex-col justify-between hover:bg-white transition-all group relative">
                  <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-blue-700 text-white font-bold text-[10px] tracking-wide shadow-xs">
                    {t.services.pkg2Badge}
                  </div>
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg group-hover:rotate-6 transition-transform">
                      <Flame className="w-6 h-6 text-blue-700" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{t.services.pkg2Title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {t.services.pkg2Desc}
                    </p>
                    <div className="pt-2 space-y-2 text-xs text-slate-700">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{t.services.pkg2F1}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{t.services.pkg2F2}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{t.services.pkg2F3}</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-slate-200 mt-6 space-y-3">
                    <div>
                      <div className="text-xs text-slate-500 font-medium">{t.services.feeLabel}</div>
                      <div className="text-base sm:text-lg font-bold text-blue-700">{t.services.pkg2Price}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{t.services.pkg2Sub}</div>
                    </div>
                    <Link
                      href={`/dat-lich?service=${encodeURIComponent(t.services.pkg2Title)}`}
                      className="w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs tracking-wide transition-all text-center block shadow-xs"
                    >
                      {t.services.btnBookPkg}
                    </Link>
                  </div>
                </div>

                {/* Gói 3 */}
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-300 hover:bg-white transition-all group">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg group-hover:rotate-6 transition-transform">
                      <ShieldCheck className="w-6 h-6 text-indigo-700" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{t.services.pkg3Title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {t.services.pkg3Desc}
                    </p>
                    <div className="pt-2 space-y-2 text-xs text-slate-700">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{t.services.pkg3F1}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{t.services.pkg3F2}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{t.services.pkg3F3}</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-slate-200 mt-6 space-y-3">
                    <div>
                      <div className="text-xs text-slate-500 font-medium">{t.services.feeLabel}</div>
                      <div className="text-base sm:text-lg font-bold text-blue-700">{t.services.pkg3Price}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{t.services.pkg3Sub}</div>
                    </div>
                    <Link
                      href={`/dat-lich?service=${encodeURIComponent(t.services.pkg3Title)}`}
                      className="w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs tracking-wide transition-all text-center block shadow-xs"
                    >
                      {t.services.btnBookPkg}
                    </Link>
                  </div>
                </div>
              </div>

              {/* Big CTA */}
              <div className="text-center">
                <Link
                  href="/dat-lich"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm sm:text-base tracking-wide shadow-lg shadow-orange-500/30 transition-all hover:scale-[1.02]"
                >
                  <Zap className="w-5 h-5 text-white" />
                  <span>{t.services.btnBigDispatch}</span>
                </Link>
              </div>
            </div>
          </section>

          {/* 4. KHỐI 3: BANNER KIỂM TRA BẢO HÀNH ĐIỆN TỬ */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="tra-cuu-bao-hanh">
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-lg shadow-blue-900/10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center shrink-0 backdrop-blur-xs">
                  <ShieldCheck className="w-6 h-6 text-orange-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-bold uppercase tracking-tight">
                    {t.warrantyBanner.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
                    {t.warrantyBanner.desc}
                  </p>
                </div>
              </div>
              <Link
                href="/tra-cuu-bao-hanh"
                className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 transition-all shrink-0 flex items-center gap-2"
              >
                <span>{t.warrantyBanner.btnCheck}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>

          {/* 5. KHỐI 4: QUY TRÌNH KIỂM ĐỊNH & BẰNG CHỨNG */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {t.qcProcess.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                {t.qcProcess.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 transition-all relative">
                <div className="text-3xl font-black text-slate-200 absolute top-4 right-4">01</div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
                  <Zap className="w-5 h-5 text-blue-700" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase">{t.qcProcess.s1Title}</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {t.qcProcess.s1Desc}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 transition-all relative">
                <div className="text-3xl font-black text-slate-200 absolute top-4 right-4">02</div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  <Flame className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase">{t.qcProcess.s2Title}</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {t.qcProcess.s2Desc}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 transition-all relative">
                <div className="text-3xl font-black text-slate-200 absolute top-4 right-4">03</div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <HardDrive className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase">{t.qcProcess.s3Title}</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {t.qcProcess.s3Desc}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 transition-all relative">
                <div className="text-3xl font-black text-slate-200 absolute top-4 right-4">04</div>
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase">{t.qcProcess.s4Title}</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {t.qcProcess.s4Desc}
                </p>
              </div>
            </div>

            {/* NHẬN XÉT CỦA KHÁCH HÀNG */}
            <div className="space-y-6 pt-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {t.reviews.title}
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="flex text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="font-bold text-slate-900">5.0 / 5.0</span>
                  <span>• {t.reviews.ratingText}</span>
                </div>
              </div>

              {/* Ticker / Marquee auto-scrolling container */}
              <div className="relative overflow-hidden w-full py-2">
                <div className="animate-marquee-slow gap-5 flex items-stretch">
                  {[...activeReviews, ...activeReviews].map((rev, idx) => (
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
                          <div className="flex text-amber-500">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className="w-3 h-3 fill-current" />
                            ))}
                          </div>
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

          {/* 6. KHỐI 5: FAQ DẠNG COLLAPSED ACCORDION */}
          <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 scroll-mt-20" id="faq-an-tam">
            <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
              <div className="text-xs uppercase tracking-widest text-blue-700 font-bold">
                {t.faq.tag}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {t.faq.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                {t.faq.subtitle}
              </p>
            </div>

            <div className="space-y-3">
              {activeFaqs.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden transition-all"
                  >
                    {/* Collapsed Header */}
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-5 h-5 text-blue-700" />
                        </div>
                        <span className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                          {item.question}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${
                          isOpen ? 'rotate-180 text-blue-700' : ''
                        }`}
                      />
                    </button>

                    {/* Expandable Content */}
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
                      {t.coverage.title}
                    </h2>
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs text-slate-600">
                      {t.coverage.desc}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-medium">
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-blue-700 shrink-0" /> TP. Tân An (P1 - P7)
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-blue-700 shrink-0" /> Khánh Hậu &amp; Tân Khánh
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-blue-700 shrink-0" /> TT. Thủ Thừa &amp; Xã liền kề
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-blue-700 shrink-0" /> Châu Thành (Long An)
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-blue-700 shrink-0" /> Huyện Tân Trụ (Lân cận)
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-blue-700 shrink-0" /> KCN Tân Hương &amp; Lợi Bình Nhơn
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50/70 border-l-4 border-amber-500 border border-amber-200">
                    <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      {t.coverage.goldenHourTitle}
                    </h4>
                    <p className="text-xs text-amber-900/90 mt-1 leading-relaxed">
                      {t.coverage.goldenHourDesc}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-slate-500">{t.coverage.hotlineLabel}</div>
                    <div className="text-xl sm:text-2xl font-black text-blue-700 tracking-tight font-mono">
                      0909.053.058
                    </div>
                  </div>
                  <a
                    href="tel:0909053058"
                    className="w-full sm:w-auto px-6 py-3 rounded-lg bg-blue-700 text-white font-bold text-xs tracking-wide shadow-xs hover:bg-blue-800 transition-all text-center"
                  >
                    {t.coverage.btnCallTech}
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
                    {t.coverage.hqBadge}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">
                    {t.coverage.hqTitle}
                  </h3>
                  <p className="text-xs text-slate-700">
                    {t.coverage.hqAddress}
                  </p>
                  <div className="pt-2">
                    <a
                      className="inline-flex items-center gap-1.5 text-xs text-blue-700 font-bold hover:underline"
                      href="https://maps.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MapPin className="w-3.5 h-3.5" /> {t.coverage.mapLink}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* FLOATING CIRCULAR ACTION BUTTONS */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
        {/* Kiểm tra bảo hành theo S/N */}
        <Link
          href="/tra-cuu-bao-hanh"
          className="pointer-events-auto w-12 h-12 rounded-full bg-white hover:bg-blue-50 text-blue-700 border-2 border-blue-700 shadow-xl shadow-blue-600/15 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 group relative"
          title={t.floating.warrantyTooltip}
        >
          <ShieldCheck className="w-6 h-6 text-blue-700" />
          <span className="opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 absolute right-14 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold whitespace-nowrap shadow-xl flex items-center gap-1.5">
            <span>{t.floating.warrantyTooltip}</span>
          </span>
        </Link>

        {/* Gọi điện Hotline */}
        <a
          href="tel:0909053058"
          className="pointer-events-auto w-13 h-13 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/35 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 group relative"
          title={t.floating.hotlineTooltip}
        >
          <Phone className="w-6 h-6 animate-pulse" />
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
          title={t.floating.zaloTooltip}
        >
          <MessageSquare className="w-6 h-6" />
          <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
          </span>
          <span className="opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 absolute right-16 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold whitespace-nowrap shadow-xl flex items-center gap-1.5">
            <span className="font-bold text-sky-300">Zalo:</span>
            <span>{isEn ? 'Direct Tech Chat' : 'Nhắn kỹ thuật trực ca'}</span>
          </span>
        </a>

        {/* Scroll to Top */}
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="pointer-events-auto w-9 h-9 rounded-full bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 shadow-md flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 group relative"
          title={t.floating.backToTop}
        >
          <ArrowUp className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {/* QC & S/N INSPECTION MODAL */}
      <Modal
        open={!!selectedProduct}
        onCancel={() => setSelectedProduct(null)}
        footer={null}
        centered
        width={680}
        title={null}
        className="qc-detail-modal"
      >
        {selectedProduct && (
          <div className="p-2 sm:p-4 space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-1.5">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  <span>{t.qcModal.badge}</span>
                </div>
                <h3 className="text-xl font-black text-slate-900">{selectedProduct.name}</h3>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  {t.qcModal.serviceTag}{' '}
                  <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {selectedProduct.serviceTag}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs text-slate-400">{t.qcModal.priceLabel}</div>
                <div className="text-xl font-black text-orange-600 font-mono">{formatVND(selectedProduct.price)}</div>
              </div>
            </div>

            {/* Hardware & Test Evidence Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  <span>{t.qcModal.cpuMemoryTitle}</span>
                </div>
                <p className="text-slate-600">{selectedProduct.specs.cpu}</p>
                <p className="text-slate-600">{selectedProduct.specs.ram}</p>
                <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 pt-1 border-t border-slate-200/60">
                  <Check className="w-3.5 h-3.5" />
                  <span>{t.qcModal.stressTestGood}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-emerald-600" />
                  <span>{t.qcModal.storageTitle}</span>
                </div>
                <p className="text-slate-600">{selectedProduct.specs.storage}</p>
                <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 pt-1 border-t border-slate-200/60">
                  <Check className="w-3.5 h-3.5" />
                  <span>{t.qcModal.diskInfoGood}</span>
                </div>
              </div>
            </div>

            {/* Warehouse & QC Meta */}
            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 text-xs space-y-2">
              <div className="font-bold text-blue-900 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-blue-700" />
                  <span>{t.qcModal.warehouseStatusTitle}</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
                  {t.qcModal.inWarehouseCount} {selectedProduct.stockCount} {t.qcModal.inWarehouseSuffix}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-700 text-[11px]">
                <div>
                  • {t.qcModal.shelfLocation} <strong>{selectedProduct.shelfLocation}</strong>
                </div>
                <div>
                  • {t.qcModal.burnInDuration} <strong>{selectedProduct.burnInDuration} {t.qcModal.minutes}</strong>
                </div>
                <div>
                  • {t.qcModal.osLicense} <strong>{t.qcModal.osLicenseVal}</strong>
                </div>
                <div>
                  • {t.qcModal.policy} <strong>{t.qcModal.policyVal}</strong>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href={`/dat-lich?device=${encodeURIComponent(selectedProduct.name)}&service=${encodeURIComponent(isEn ? 'Order In-Stock Computer' : 'Đặt mua máy có sẵn')}`}
                onClick={() => setSelectedProduct(null)}
                className="flex-1 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm text-center transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>{t.qcModal.btnReserve}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={`https://zalo.me/0909053058?text=${encodeURIComponent(isEn ? `Hello An Tam, I would like photos and details for ${selectedProduct.name} (S/N: ${selectedProduct.serviceTag})` : `Chào An Tâm, tôi quan tâm máy ${selectedProduct.name} (S/N: ${selectedProduct.serviceTag})`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm text-center transition-all shadow-md flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{t.qcModal.btnZaloPhotos}</span>
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
