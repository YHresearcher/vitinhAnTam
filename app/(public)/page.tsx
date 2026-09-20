'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Modal } from 'antd';
import {
  CheckCircle,
  Cpu,
  HardDrive,
  ShieldCheck,
  Zap,
  Laptop,
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
import { formatVND, InventoryItem } from '@/lib/supabase';
import { translations } from '@/lib/i18n';

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
  const t = translations[currentLang];

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
      showToast(isEn ? 'Please enter a Service Tag S/N or Phone Number!' : 'Vui lòng nhập S/N Service Tag hoặc Số điện thoại!');
      return;
    }
    router.push(`/tra-cuu-bao-hanh?tag=${encodeURIComponent(query)}`);
  };

  // Build live showcase products mapped with real inventory and translated specs
  const showcaseProducts: ShowcaseItem[] = [
    {
      id: 'p1',
      name: 'Dell OptiPlex 7060 SFF',
      serviceTag: 'ST-8F4K92X',
      badge: isEn ? 'GRADE-A >95% ORIGINAL' : 'LOẠI A >95% NGUYÊN BẢN',
      subBadge: isEn ? 'Digital Win 11 Pro License' : 'Win 11 Pro Bản Quyền Số',
      desc: isEn
        ? 'Ultra-quiet enterprise SFF, optimized for multi-tasking, MISA accounting and office suites.'
        : 'Đồng bộ siêu êm, tối ưu tác vụ văn phòng, kế toán MISA đa nhiệm.',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_XqyuhdmpmXoCW362MXDLpcj2fNG91cxGDOoIMY0LGcYQAskQWuyJGtcsSnW0pBpyLO7bw1OrQ8wi9mVpOdu-SK1yucTaIPtmGcTUId2_FdxPu1gMtxhRdNoVedwLcITop_byvLpE2nKuxZpLreAdydKpuBCXJR75xOyyXcpwwH66s-vVPj1s4vIPbbmFtAedHsuaex4ZmglXWeieUbZdSc15AyrCaOY-zQ7eyOf4Okia2O9UINYf',
      category: 'office',
      specs: {
        cpu: isEn ? 'Intel Core i5-8500 (6C/6T up to 4.10GHz)' : 'Core i5-8500 (6 nhân 6 luồng 4.10GHz)',
        ram: isEn ? '16GB DDR4 RAM 2666MHz (Max 64GB)' : 'RAM 16GB DDR4 Bus 2666 (Nâng max 64GB)',
        storage: isEn ? 'New 256GB Kingston NVMe SSD (36M Warranty)' : 'SSD NVMe 256GB Kingston Mới 100% (BH 36T)',
        highlight: isEn ? '12-Month Chassis Warranty • 2H On-Site Swap' : 'Thân máy BH 12 tháng • Đổi mới tận nơi 2h',
        gift: isEn ? 'Complimentary Business Keyboard, Mouse & Pad' : 'Tặng combo phím chuột & lót chuột văn phòng',
      },
      price: 4950000,
      stockCount: inventory.find((i) => i.service_tag === 'ST-8F4K92X')?.quantity ?? 1,
      shelfLocation: inventory.find((i) => i.service_tag === 'ST-8F4K92X')?.shelf_location || (isEn ? 'Dispatch Shelf' : 'Kệ Bàn Giao'),
      qcStatus: inventory.find((i) => i.service_tag === 'ST-8F4K92X')?.qc_status || 'ready_to_sell',
      burnInDuration: 45,
    },
    {
      id: 'p2',
      name: 'HP ProDesk 400 G5 Mini',
      serviceTag: 'HP-400G5M',
      badge: isEn ? 'ULTRA-COMPACT 1L • ENERGY SAVING' : 'SIÊU GỌN 1 LÍT • TIẾT KIỆM ĐIỆN',
      subBadge: isEn ? 'POS Cashier / Accounting' : 'Quầy Thu Ngân / Kế Toán',
      desc: isEn
        ? 'Palm-sized desktop, mountable behind displays, 24/7 whisper-quiet reliability.'
        : 'Gọn gàng trong lòng bàn tay, gắn lưng màn hình, hoạt động 24/7 êm ái.',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHypgTcRCO_QFnVWMl5MSGKNjC1WqxTCuKKxWunkvUn9ZMEKWhqPlSEBdDO0-9BpqFr3znjewmjJWd9I1QDCFVWp3bfTpdOUeo3AQP7c9L6A9d1dnWmkW-L1qmwyjqOaRtFcxgODM3sVpYEKKoh4_yX-gbUvpBxNV7XFwOPJERylPsS7sp62N0fT1Ive8lwSLth1DrVYuXtwPUfP4C1iAyKWy-1Dd2jt2azAeCeaSDwZus9pJuDtWB',
      category: 'office',
      specs: {
        cpu: isEn ? 'Core i3-8100T (Cool 35W Power Draw)' : 'Core i3-8100T mát êm, tiêu thụ điện chỉ 35W',
        ram: isEn ? '8GB DDR4 RAM 2666MHz (Up to 32GB)' : 'RAM 8GB DDR4 Bus 2666 (Nâng cấp tối đa 32GB)',
        storage: isEn ? '128GB M.2 SSD (36M Warranty) + 500GB Data HDD' : 'SSD 128GB M.2 Mới BH 36T + 500GB HDD dữ liệu',
        highlight: isEn ? '12-Month Warranty • Pre-installed Win 10/11 Pro' : 'Thân máy BH 12 tháng • Cài sẵn Win 10/11 Pro OEM',
        gift: isEn ? 'Integrated Dual-band Wi-Fi + Bluetooth' : 'Tích hợp sẵn Wifi 2 băng tần + Bluetooth',
      },
      price: 3400000,
      stockCount: inventory.find((i) => i.service_tag === 'HP-400G5M')?.quantity ?? 5,
      shelfLocation: inventory.find((i) => i.service_tag === 'HP-400G5M')?.shelf_location || (isEn ? 'Shelf A1 - Level 2' : 'Kệ A1 - Tầng 2'),
      qcStatus: inventory.find((i) => i.service_tag === 'HP-400G5M')?.qc_status || 'ready_to_sell',
      burnInDuration: 45,
    },
    {
      id: 'p3',
      name: 'ThinkPad T480s (Mỏng Nhẹ)',
      serviceTag: 'TP-994L2A',
      badge: isEn ? 'MIL-SPEC TOUGH • CARBON FIBER' : 'CHUẨN QUÂN ĐỘI MỸ • VỎ CARBON',
      subBadge: isEn ? 'Genuine Battery 4-5H (>85% Health)' : 'Pin Zin 4-5H (Sức khỏe >85%)',
      desc: isEn
        ? 'Legendary tactile keyboard, ultra-light 1.3kg carbon chassis, outstanding durability.'
        : 'Bàn phím gõ êm số 1, vỏ sợi carbon siêu nhẹ 1.3kg, cực kỳ bền bỉ.',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAY3Z2OKz-xUCFThbDz7BYlPSSjEDsLAhCI4x2H1Up8nZwKBKYBuh7yIYXl6t4mtKIB4g3G0C-18V4mCSHCutXdsJkFacBrXKtB0j-Clmzr9Mog8CnHDhmvjqywzWS7jrpznsTqmR-iZ6hx6bZXeJn_qkONjyUPHu5grKL2C1QIFfRrIGT3llnDDr9RplUzoBtcP9rwwmdNGC5r1nR4joN0h_J9lWRXkR1ZVe8A_ZvdRivoFKlk7oAa',
      category: 'laptop',
      specs: {
        cpu: isEn ? 'Core i5-8250U (4C/8T High Efficiency)' : 'Core i5-8250U (4 nhân 8 luồng mạnh mẽ)',
        ram: isEn ? '16GB DDR4 RAM for effortless multi-tasking' : 'RAM 16GB DDR4 đa nhiệm lướt web thả ga',
        storage: isEn ? '256GB Ultra-Fast NVMe SSD (36M Swap Warranty)' : 'SSD 256GB NVMe siêu tốc (BH 36T đổi mới)',
        highlight: isEn ? 'Genuine 65W Type-C Charger • 6-Month Warranty' : 'Kèm sạc Type-C Zin 65W • BH máy 06 tháng',
        gift: isEn ? '14" FHD IPS Anti-Glare + Shockproof Sleeve' : 'Màn 14" FHD IPS chống chói + Tặng túi chống sốc',
      },
      price: 6200000,
      stockCount: inventory.find((i) => i.service_tag === 'TP-994L2A')?.quantity ?? 2,
      shelfLocation: inventory.find((i) => i.service_tag === 'TP-994L2A')?.shelf_location || (isEn ? 'Laptop Shelf B2' : 'Kệ Laptop B2'),
      qcStatus: inventory.find((i) => i.service_tag === 'TP-994L2A')?.qc_status || 'ready_to_sell',
      burnInDuration: 45,
    },
    {
      id: 'p4',
      name: 'Dell Vostro 3670 MT (Core i7)',
      serviceTag: 'DV-3670I7',
      badge: isEn ? 'ROOMY MID-TOWER • EASY TO UPGRADE' : 'CASE LỚN THOÁNG MÁT • DỄ NÂNG CẤP',
      subBadge: isEn ? 'CAD & Graphics Workstation' : 'Đồ Họa & Kỹ Thuật',
      desc: isEn
        ? 'Dedicated AutoCAD, Photoshop, Corel, video rendering, handles 50+ Chrome tabs.'
        : 'Chuyên AutoCAD, Photoshop, Corel, Render video & mở 50 tab Chrome.',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHGuIrduG_aQa0fIxHB2G8eJVrnLqRVQXGS9uKbJZzSO6i-Q-8scMRHwCrMKPFIoZUU3F92-ySxJkq9bjUm9EBp59F9wGDuzXaegpW9yq3CGs57uhUJbuaBwppDhw7A9lT_ko5HNGgFq_6H2s-OeM6ET7FICEqiBPxQBAYsf0V1gzfIBV-57d46Z5chBxyUxqQtR5JDcy6MKxeinRLSv36JnAhn4o7AIb0WwwPPZodOycfilrkCRJX',
      category: 'workstation',
      specs: {
        cpu: isEn ? 'Core i7-8700 (6C/12T Turbo up to 4.60GHz)' : 'Core i7-8700 (6 nhân 12 luồng Turbo 4.60GHz)',
        ram: isEn ? '16GB Dual-Channel DDR4 RAM' : 'RAM 16GB DDR4 kênh đôi tản nhiệt tốt',
        storage: isEn ? '512GB Kingston NVMe SSD (36M Warranty)' : 'SSD 512GB NVMe Mới 100% (BH 36 Tháng)',
        highlight: isEn ? '80 Plus Certified PSU • 12-Month Warranty' : 'Nguồn CST chuẩn 80 Plus • BH 12 tháng',
        gift: isEn ? 'Dedicated GTX 1050Ti 4GB GDDR5 GPU' : 'Card rời GTX 1050Ti 4GB GDDR5 chuyên đồ họa',
      },
      price: 7500000,
      stockCount: inventory.find((i) => i.service_tag === 'DV-3670I7')?.quantity ?? 3,
      shelfLocation: inventory.find((i) => i.service_tag === 'DV-3670I7')?.shelf_location || (isEn ? 'Workstation Shelf W1' : 'Kệ Workstation W1'),
      qcStatus: inventory.find((i) => i.service_tag === 'DV-3670I7')?.qc_status || 'ready_to_sell',
      burnInDuration: 45,
    },
  ];

  // Localized English reviews fallback
  const displayReviews = isEn
    ? [
        {
          name: 'Mr. Minh Tuan',
          role: 'Chief Accountant - Logistics Corp',
          comment: 'Equipped 6 Dell OptiPlex desktops for our accounting department running MISA and electronic invoicing. The computers boot in 5 seconds and operate silently. On-site technical support is extremely attentive.',
          service: 'Dell OptiPlex 7060 SFF',
          location: 'Tan An City',
        },
        {
          name: 'Ms. Mai Lan',
          role: 'Secondary School Teacher',
          comment: 'The PC maintenance package and SSD upgrade made my old computer run like brand new. I loved that the technician worked right in front of me, keeping all my lesson plans and student files completely intact.',
          service: 'NVMe SSD Upgrade & Thermal Spa',
          location: 'Thu Thua District',
        },
        {
          name: 'Mr. Bay Nam',
          role: 'Personal Client',
          comment: 'I am elderly and not tech-savvy. Luckily, the technician came right to my home at 18:30 to reinstall my printer drivers and check the power supply. Courteous service, crystal clear explanations, very reasonable pricing.',
          service: 'On-site Home PC Rescue',
          location: 'Trang Bang (Tay Ninh)',
        },
        {
          name: 'Mr. Quoc Hoang',
          role: 'Managing Director - Construction Co.',
          comment: 'The 1-to-1 immediate on-site replacement within 2 hours is the exact reason our company chose An Tam as our long-term technical partner. Absolute peace of mind regarding internal data security.',
          service: 'Corporate PC Maintenance Contract',
          location: 'Duc Hoa Industrial Park',
        },
        {
          name: 'Ms. Thuy Nga',
          role: 'Online Business Owner',
          comment: 'My power supply failed in the middle of an evening shift. Called the hotline and a technician arrived within an hour with a genuine sealed power supply backed by a 36-month warranty. Outstanding service!',
          service: 'PSU Replacement & Cleaning',
          location: 'Go Dau District',
        },
      ]
    : reviews;

  // Localized English FAQ fallback
  const displayFaqs = isEn
    ? [
        {
          id: 'faq-1',
          question: 'When does the rapid 2-hour on-site service apply?',
          answer: 'When your computer encounters an issue or requires replacement parts, simply enter your Phone / Service Tag or call Hotline 0909.053.058. An Tam mobile IT response units bring testing tools and replacement hardware directly to your site within a 10km radius (Tan An, Thu Thua, Chau Thanh, Tan Tru, and surrounding industrial parks). In particular, our 2-hour rapid dispatch is prioritized during Golden Hours from 17:30 to 21:00 on weekdays (and full day Saturday & Sunday from 08:00 to 21:00) so corporate operations are never interrupted during business hours.',
        },
        {
          id: 'faq-2',
          question: 'How does the 1-to-1 immediate on-site hardware swap operate?',
          answer: 'For hardware components (SSDs, RAM, power supplies, cooling fans) that develop faults, our technicians bring brand-new authentic replacement parts directly to your desk and swap them on-site in 15 - 30 minutes. We never hold your machine hostage in a repair queue.',
        },
        {
          id: 'faq-3',
          question: 'Will upgrading SSDs or servicing my PC cause loss of accounting data, MISA, or tax tokens?',
          answer: 'Absolutely not! Our certified engineers perform a byte-for-byte exact clone from your old drive to the new SSD. All digital signatures, electronic tax certificates, MISA accounting databases, desktop shortcuts, and saved browser logins are 100% preserved without requiring reinstallation.',
        },
        {
          id: 'faq-4',
          question: 'Can I inspect the internal hardware before finalizing payment?',
          answer: 'You have full authority to request our technician open the chassis to inspect the clean, unblemished motherboard, verify brand-new sealed RAM/SSD packaging, and run CrystalDiskInfo showing 100% Good health before making any payment.',
        },
      ]
    : faqs;

  const filteredProducts =
    activeCategory === 'all'
      ? showcaseProducts
      : showcaseProducts.filter((p) => p.category === activeCategory);

  const totalReadyStock = showcaseProducts.reduce((sum, item) => sum + item.stockCount, 0);

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
                  {t.hero.badgePre}
                </span>
                <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.2]">
                  {t.hero.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs sm:text-sm font-bold shadow-xs">
                    <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                    <span>{t.hero.badgeWin}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-xs sm:text-sm font-bold shadow-xs">
                    <Zap className="w-4 h-4 text-orange-600 shrink-0" />
                    <span>{t.hero.badge2h}</span>
                  </span>
                </div>
              </div>

              <p className="text-lg sm:text-xl text-slate-700 font-medium leading-relaxed">
                {t.hero.desc}
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
                    <span>{t.hero.quickSearchTitle}</span>
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
                  <span>{t.hero.ctaCatalog}</span>
                </a>
                <Link
                  href="/dat-lich"
                  className="px-6 py-3.5 rounded-xl bg-white border-2 border-blue-700 hover:border-blue-800 text-blue-700 hover:text-blue-800 font-bold text-sm shadow-xs transition-all flex items-center gap-2"
                >
                  <Wrench className="w-4 h-4" />
                  <span>{t.hero.ctaBooking}</span>
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
                  <span>{t.products.preHeader}</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {t.products.title}
                </h2>
              </div>
              <div className="text-xs text-slate-500 font-medium">
                {t.products.readyCount(totalReadyStock)}
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
                {t.products.filterAll(totalReadyStock)}
              </button>
              <button
                onClick={() => setActiveCategory('office')}
                className={`px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all shadow-xs ${
                  activeCategory === 'office'
                    ? 'bg-blue-700 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-700'
                }`}
              >
                {t.products.filterOffice}
              </button>
              <button
                onClick={() => setActiveCategory('laptop')}
                className={`px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all shadow-xs ${
                  activeCategory === 'laptop'
                    ? 'bg-blue-700 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-700'
                }`}
              >
                {t.products.filterLaptop}
              </button>
              <button
                onClick={() => setActiveCategory('workstation')}
                className={`px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all shadow-xs ${
                  activeCategory === 'workstation'
                    ? 'bg-blue-700 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-700'
                }`}
              >
                {t.products.filterWorkstation}
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
                      {/* Real stock badge */}
                      <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>{t.products.readyBadge(prod.stockCount)}</span>
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
                      <span className="text-xs text-slate-500">{t.products.listedPrice}</span>
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
                        {t.products.viewQcBtn}
                      </button>
                      <Link
                        href={`/dat-lich?device=${encodeURIComponent(prod.name)}&service=${encodeURIComponent(isEn ? 'Purchase In-Stock PC' : 'Đặt mua máy có sẵn')}`}
                        className="w-full py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs tracking-wide transition-all text-center block shadow-xs"
                      >
                        {t.products.orderNowBtn}
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
                  <Zap className="w-4 h-4 text-blue-700" /> {t.services.preHeader}
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {t.services.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  {t.services.desc}
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
                      <div className="text-xs text-slate-500 font-medium">{t.services.pkg1PriceLabel}</div>
                      <div className="text-base sm:text-lg font-bold text-blue-700">{t.services.pkg1PriceValue}</div>
                    </div>
                    <Link
                      href={`/dat-lich?service=${encodeURIComponent(isEn ? 'PC Rejuvenation Package' : 'Gói Hồi Sinh Máy Cũ')}`}
                      className="w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs tracking-wide transition-all text-center block shadow-xs"
                    >
                      {t.services.bookPkgBtn}
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
                      <div className="text-xs text-slate-500 font-medium">{t.services.pkg2PriceLabel}</div>
                      <div className="text-base sm:text-lg font-bold text-blue-700">{t.services.pkg2PriceValue}</div>
                    </div>
                    <Link
                      href={`/dat-lich?service=${encodeURIComponent(isEn ? 'Deep Cooling & Thermal Spa' : 'Spa Làm Mát Chuyên Sâu')}`}
                      className="w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs tracking-wide transition-all text-center block shadow-xs"
                    >
                      {t.services.bookPkgBtn}
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
                      <div className="text-xs text-slate-500 font-medium">{t.services.pkg3PriceLabel}</div>
                      <div className="text-base sm:text-lg font-bold text-blue-700">{t.services.pkg3PriceValue}</div>
                    </div>
                    <Link
                      href={`/dat-lich?service=${encodeURIComponent(isEn ? 'Licensed Windows & Security' : 'Tối Ưu Windows Bản Quyền')}`}
                      className="w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs tracking-wide transition-all text-center block shadow-xs"
                    >
                      {t.services.bookPkgBtn}
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
                  <span>{t.services.bigCta}</span>
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
                <span>{t.warrantyBanner.checkNowBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>

          {/* 5. KHỐI 4: QUY TRÌNH KIỂM ĐỊNH & BẰNG CHỨNG */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {t.inspection.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                {t.inspection.desc}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 transition-all relative">
                <div className="text-3xl font-black text-slate-200 absolute top-4 right-4">01</div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
                  <Zap className="w-5 h-5 text-blue-700" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase">{t.inspection.s1Title}</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {t.inspection.s1Desc}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 transition-all relative">
                <div className="text-3xl font-black text-slate-200 absolute top-4 right-4">02</div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  <Flame className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase">{t.inspection.s2Title}</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {t.inspection.s2Desc}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 transition-all relative">
                <div className="text-3xl font-black text-slate-200 absolute top-4 right-4">03</div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <HardDrive className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase">{t.inspection.s3Title}</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {t.inspection.s3Desc}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 transition-all relative">
                <div className="text-3xl font-black text-slate-200 absolute top-4 right-4">04</div>
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase">{t.inspection.s4Title}</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {t.inspection.s4Desc}
                </p>
              </div>
            </div>

            {/* NHẬN XÉT CỦA KHÁCH HÀNG (DẠNG CUỘN NGANG TỰ ĐỘNG CHẬM RÃI, ĐỒNG BỘ STORE) */}
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
                  {[...displayReviews, ...displayReviews].map((rev, idx) => (
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

          {/* 6. KHỐI 5: FAQ DẠNG COLLAPSED ACCORDION (ĐỒNG BỘ TỪ ADMIN) */}
          <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 scroll-mt-20" id="faq-an-tam">
            <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
              <div className="text-xs uppercase tracking-widest text-blue-700 font-bold">
                {t.faq.preHeader}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {t.faq.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                {t.faq.desc}
              </p>
            </div>

            <div className="space-y-3">
              {displayFaqs.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={item.id || idx}
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
                    {t.coverage.callTechBtn}
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
                      <MapPin className="w-3.5 h-3.5" /> {t.coverage.hqMapsLink}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* FLOATING CIRCULAR ACTION BUTTONS (Góc phải màn hình - Sử dụng Lucide Icons) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
        {/* Kiểm tra bảo hành theo S/N */}
        <Link
          href="/tra-cuu-bao-hanh"
          className="pointer-events-auto w-12 h-12 rounded-full bg-white hover:bg-blue-50 text-blue-700 border-2 border-blue-700 shadow-xl shadow-blue-600/15 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 group relative"
          title={t.floating.warrantyTitle}
        >
          <ShieldCheck className="w-6 h-6 text-blue-700" />
          {/* Tooltip */}
          <span className="opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 absolute right-14 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold whitespace-nowrap shadow-xl flex items-center gap-1.5">
            <span>{t.floating.warrantyTooltip}</span>
          </span>
        </Link>

        {/* Gọi điện Hotline */}
        <a
          href="tel:0909053058"
          className="pointer-events-auto w-13 h-13 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/35 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 group relative"
          title={t.floating.hotlineTitle}
        >
          <Phone className="w-6 h-6 animate-pulse" />
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
          title={t.floating.zaloTitle}
        >
          <MessageSquare className="w-6 h-6" />
          {/* Live Online Dot */}
          <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
          </span>
          {/* Tooltip */}
          <span className="opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 absolute right-16 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold whitespace-nowrap shadow-xl flex items-center gap-1.5">
            <span className="font-bold text-sky-300">Zalo:</span>
            <span>{t.floating.zaloTooltip}</span>
          </span>
        </a>

        {/* Scroll to Top */}
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="pointer-events-auto w-9 h-9 rounded-full bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 shadow-md flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 group relative"
          title={t.floating.scrollTop}
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
                  <span>{t.products.qcModalHeader}</span>
                </div>
                <h3 className="text-xl font-black text-slate-900">{selectedProduct.name}</h3>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  {t.products.qcSnTag} <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{selectedProduct.serviceTag}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs text-slate-400">{t.products.qcListedPrice}</div>
                <div className="text-xl font-black text-orange-600 font-mono">{formatVND(selectedProduct.price)}</div>
              </div>
            </div>

            {/* Hardware & Test Evidence Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  <span>{t.products.qcCpuRamTitle}</span>
                </div>
                <p className="text-slate-600">{selectedProduct.specs.cpu}</p>
                <p className="text-slate-600">{selectedProduct.specs.ram}</p>
                <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 pt-1 border-t border-slate-200/60">
                  <Check className="w-3.5 h-3.5" />
                  <span>{t.products.qcPrime95}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-emerald-600" />
                  <span>{t.products.qcStorageTitle}</span>
                </div>
                <p className="text-slate-600">{selectedProduct.specs.storage}</p>
                <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 pt-1 border-t border-slate-200/60">
                  <Check className="w-3.5 h-3.5" />
                  <span>{t.products.qcCrystalDisk}</span>
                </div>
              </div>
            </div>

            {/* Warehouse & QC Meta */}
            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 text-xs space-y-2">
              <div className="font-bold text-blue-900 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-blue-700" />
                  <span>{t.products.qcWarehouseTitle}</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
                  {t.products.qcStockCount(selectedProduct.stockCount)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-700 text-[11px]">
                <div>• {t.products.qcShelf} <strong>{selectedProduct.shelfLocation}</strong></div>
                <div>• {t.products.qcBurnIn} <strong>{selectedProduct.burnInDuration} {isEn ? 'minutes' : 'phút'}</strong></div>
                <div>• {t.products.qcLicense} <strong>Windows Pro {isEn ? 'Digital License' : 'Bản Quyền Số'}</strong></div>
                <div>• {t.products.qcPolicy} <strong>{isEn ? '12-Month 1-to-1 On-Site Swap in 2 Hours' : 'Bảo hành 12 tháng 1 đổi 1 tận nơi 2h'}</strong></div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href={`/dat-lich?device=${encodeURIComponent(selectedProduct.name)}&service=${encodeURIComponent(isEn ? 'Purchase In-Stock PC' : 'Đặt mua máy có sẵn')}`}
                onClick={() => setSelectedProduct(null)}
                className="flex-1 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm text-center transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>{t.products.qcBookDelivery}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={`https://zalo.me/0909053058?text=${encodeURIComponent(isEn ? `Hello An Tam, I am interested in ${selectedProduct.name} (S/N: ${selectedProduct.serviceTag})` : `Chào An Tâm, tôi quan tâm máy ${selectedProduct.name} (S/N: ${selectedProduct.serviceTag})`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm text-center transition-all shadow-md flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{t.products.qcChatZalo}</span>
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
