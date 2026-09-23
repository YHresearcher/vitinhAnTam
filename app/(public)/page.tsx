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
  ArrowRight,
  ArrowUp,
  PhoneCall,
  MessageSquare,
  ChevronDown,
  Gift,
  Check,
  ScanLine,
  Search,
} from 'lucide-react';
import { useViTinhAnTamStore } from '@/lib/store';
import { formatVND } from '@/lib/supabase';
import {
  TRANSLATIONS,
  ENGLISH_PRODUCT_DETAILS,
  ENGLISH_FAQS,
} from '@/lib/translations';
import { getShowcaseProducts, ShowcaseItem } from '@/lib/productsData';

export default function HomePage() {
  const router = useRouter();
  const { currentLang, inventory, systemSettings } = useViTinhAnTamStore();
  const isEn = currentLang === 'en';
  const t = TRANSLATIONS[currentLang || 'vi'];

  // Search state for quick warranty lookup - khởi tạo rỗng không giữ S/N tạm
  const [searchInput, setSearchInput] = useState('');
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
      showToast(isEn ? 'Please enter a Service Tag or phone number!' : 'Vui lòng nhập Service Tag hoặc Số điện thoại!');
      return;
    }
    router.push(`/tra-cuu-bao-hanh?tag=${encodeURIComponent(query)}`);
  };

  // Trang chủ chỉ thể hiện máy đang có sẵn tại shop
  const allProducts = getShowcaseProducts(isEn, inventory);
  const inStockProducts = allProducts.filter((p) => !p.isSold);
  const filteredInStock = inStockProducts.filter((p) => {
    if (activeCategory === 'all') return true;
    return p.category === activeCategory;
  });
  const totalReadyStock = inStockProducts.reduce((acc, curr) => acc + curr.stockCount, 0);



  const activeFaqs = isEn && ENGLISH_FAQS ? ENGLISH_FAQS : [
    {
      question: 'Tại sao máy tính cũ tại Vi Tính An Tâm được gọi là "Chuẩn A Tuyển Chọn"?',
      answer:
        'Toàn bộ máy tại Vi Tính An Tâm đều được tuyển chọn kỹ lưỡng từ các tập đoàn doanh nghiệp, cam kết 100% bo mạch chủ nguyên bản, không sửa chữa chắp vá. Mỗi máy trước khi đến tay khách hàng đều trải qua quy trình kiểm định 24 bước (test RAM, stress test CPU, kiểm tra bad sector SSD 100% health).',
    },
    {
      question: 'Chính sách bảo hành 1 đổi 1 tận nơi trong 2 giờ hoạt động như thế nào?',
      answer:
        'Khi máy gặp bất kỳ sự cố phần cứng nào, quý khách chỉ cần liên hệ hotline kỹ thuật hoặc tra cứu mã S/N trên web. Đội ngũ kỹ thuật sẽ mang linh kiện thay thế trực tiếp đến tận nhà hỗ trợ nhanh chóng tại TP. Tân An (Phường 1 đến Phường 7, Khánh Hậu, Tân Khánh); các khu vực lân cận (Thủ Thừa, Châu Thành, Tân Trụ) hỗ trợ theo lịch hẹn nhanh trong ngày. Đặc biệt ưu tiên khung giờ cứu hộ khẩn từ 17:30 đến 21:00.',
    },
    {
      question: 'Windows bản quyền số vĩnh viễn có lợi ích gì cho kế toán và văn phòng?',
      answer:
        'Máy được kích hoạt bản quyền số Microsoft OEM chính thức theo bo mạch chủ. Hệ thống hoàn toàn sạch, cập nhật bảo mật liên tục từ Microsoft, không chứa mã độc hay công cụ bẻ khóa, an toàn tuyệt đối cho dữ liệu kế toán MISA, hóa đơn điện tử và giao dịch ngân hàng.',
    },
    {
      question: 'Tôi có thể nâng cấp RAM hoặc SSD theo nhu cầu riêng được không?',
      answer:
        'Hoàn toàn được. Vi Tính An Tâm luôn sẵn linh kiện RAM Kingston/Samsung và SSD NVMe chính hãng mới 100% bảo hành 36 tháng để nâng cấp theo nhu cầu công việc của quý khách ngay khi bàn giao.',
    },
  ];

  return (
    <div className="w-full relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-lg bg-[#2B1810] text-white text-xs font-semibold shadow-xl border border-[#3E291F] flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="w-full">
        {/* HERO BANNER SECTION (Đã xóa ambient blur AI, thay bằng nền Beige ấm) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 lg:pt-12 lg:pb-16">
          <div className="max-w-4xl mx-auto text-left space-y-6">
            <div className="space-y-4">
              <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#C0392B] flex items-center gap-2">
                <span className="w-6 h-0.5 bg-[#C0392B]" />
                {t.hero.brandTag}
              </span>
              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black text-[#2B1810] tracking-tight leading-[1.2]">
                {t.hero.mainTitle}
              </h1>
              <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
                <span className="inline-flex items-center px-3 py-1 rounded-md bg-[#FFFDF9] border border-[#E8E2D9] text-[#2B1810] text-xs sm:text-sm font-bold shadow-xs">
                  {t.hero.badgeWindows}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-md bg-[#FBE8DE] border border-[#F2C4B2] text-[#C0392B] text-xs sm:text-sm font-bold shadow-xs">
                  {t.hero.badge2h}
                </span>
              </div>
            </div>

            {/* 3 Trụ Cột Nổi Bật */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* Pillar 01 */}
              <div className="p-5 rounded-xl bg-white border-2 border-[#C0392B]/20 shadow-md hover:border-[#C0392B] hover:shadow-lg transition-all group">
                <div className="text-3xl font-black text-[#E8E2D9] leading-none mb-3 font-mono">01</div>
                <h3 className="text-sm font-black text-[#2B1810] uppercase tracking-wide leading-snug">{t.hero.pillar1Title}</h3>
                <p className="text-xs text-[#6E5D53] mt-2 leading-snug">{t.hero.pillar1Desc}</p>
              </div>

              {/* Pillar 02 - Nổi bật */}
              <div className="p-5 rounded-xl bg-[#C0392B] border-2 border-[#C0392B] shadow-lg shadow-[#C0392B]/20 hover:bg-[#A93226] transition-all group">
                <div className="text-3xl font-black text-white/30 leading-none mb-3 font-mono">02</div>
                <h3 className="text-sm font-black text-white uppercase tracking-wide leading-snug">{t.hero.pillar2Title}</h3>
                <p className="text-xs text-white/80 mt-2 leading-snug">{t.hero.pillar2Desc}</p>
              </div>

              {/* Pillar 03 */}
              <div className="p-5 rounded-xl bg-white border-2 border-[#C0392B]/20 shadow-md hover:border-[#C0392B] hover:shadow-lg transition-all group">
                <div className="text-3xl font-black text-[#E8E2D9] leading-none mb-3 font-mono">03</div>
                <h3 className="text-sm font-black text-[#2B1810] uppercase tracking-wide leading-snug">{t.hero.pillar3Title}</h3>
                <p className="text-xs text-[#6E5D53] mt-2 leading-snug">{t.hero.pillar3Desc}</p>
              </div>
            </div>

            {/* Quick Warranty Lookup Bar - Ô trống, không giữ format ví dụ */}
            <div className="pt-2">
              <form
                onSubmit={handleSearchSubmit}
                className="p-3 sm:p-4 rounded-lg bg-[#FAF7F2] border border-[#E8E2D9] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
              >
                <div className="flex items-center gap-2 text-[#2B1810] shrink-0 font-bold text-xs sm:text-sm pl-1">
                  <ScanLine className="w-4 h-4 text-[#C0392B]" strokeWidth={1.5} />
                  <span>{t.hero.quickSearchLabel}</span>
                </div>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={t.hero.quickSearchPlaceholder}
                  className="flex-1 px-3.5 py-2.5 rounded-lg bg-white border border-[#D4C9BC] text-[#2B1810] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#C0392B] font-mono"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <span>{t.hero.quickSearchBtn}</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </form>
            </div>

            {/* Dual CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <a
                href="#danh-muc-san-pham"
                className="px-6 py-3.5 rounded-lg bg-[#D9531E] text-white font-bold text-sm tracking-wide shadow-md shadow-[#D9531E]/20 hover:bg-[#C0392B] transition-all flex items-center gap-2"
              >
                <span>{t.hero.btnBrowseStock}</span>
              </a>
              <Link
                href="/dat-lich"
                className="px-6 py-3.5 rounded-lg bg-white border-2 border-[#C0392B] text-[#C0392B] hover:bg-[#FBE8DE] font-bold text-sm shadow-xs transition-all flex items-center gap-2"
              >
                <span>{t.hero.btnScheduleService}</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 2. KHỐI 1: DANH MỤC MÁY ĐANG CÓ SẴN TẠI SHOP */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20 font-inter" id="danh-muc-san-pham">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-[#C0392B] font-bold mb-1">
                {t.products.tag}
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-[#2B1810] tracking-tight">
                {t.products.title}
              </h2>
            </div>
            <div className="text-xs text-[#6E5D53] font-medium bg-[#FAF7F2] px-3.5 py-2 rounded-lg border border-[#E8E2D9] inline-flex items-center gap-2 self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>
                {t.products.readyCount} <strong className="text-[#C0392B] font-bold font-mono">{totalReadyStock}</strong> {t.products.readyCountSuffix}
              </span>
            </div>
          </div>

          {/* Controls: Category Filter Chips & Quick Note */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 p-3 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9]">
            {/* Category Filter Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`px-3.5 py-1.5 rounded-lg font-semibold text-xs transition-all shadow-2xs ${
                  activeCategory === 'all'
                    ? 'bg-[#2B1810] text-white'
                    : 'bg-white border border-[#E8E2D9] text-[#6E5D53] hover:border-[#2B1810]'
                }`}
              >
                {t.products.catAll}
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('office')}
                className={`px-3.5 py-1.5 rounded-lg font-semibold text-xs transition-all shadow-2xs ${
                  activeCategory === 'office'
                    ? 'bg-[#2B1810] text-white'
                    : 'bg-white border border-[#E8E2D9] text-[#6E5D53] hover:border-[#2B1810]'
                }`}
              >
                {t.products.catOffice}
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('laptop')}
                className={`px-3.5 py-1.5 rounded-lg font-semibold text-xs transition-all shadow-2xs ${
                  activeCategory === 'laptop'
                    ? 'bg-[#2B1810] text-white'
                    : 'bg-white border border-[#E8E2D9] text-[#6E5D53] hover:border-[#2B1810]'
                }`}
              >
                {t.products.catLaptop}
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('workstation')}
                className={`px-3.5 py-1.5 rounded-lg font-semibold text-xs transition-all shadow-2xs ${
                  activeCategory === 'workstation'
                    ? 'bg-[#2B1810] text-white'
                    : 'bg-white border border-[#E8E2D9] text-[#6E5D53] hover:border-[#2B1810]'
                }`}
              >
                {t.products.catWorkstation}
              </button>
            </div>

            {/* Informational Sub-badge */}
            <div className="text-xs text-emerald-800 font-medium flex items-center gap-1.5 px-1">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isEn ? '100% In-Stock • 2h Fast Delivery in Tan An' : '100% Máy sẵn kho • Giao hỏa tốc 2 giờ TP. Tân An'}</span>
            </div>
          </div>

          {/* MÁY ĐANG SẴN TẠI SHOP (IN-STOCK) */}
          <div className="space-y-4 mb-8">
            {filteredInStock.length === 0 ? (
              <div className="p-8 rounded-lg bg-white border border-slate-200 text-center text-xs text-slate-500">
                {t.products.emptyInStock}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredInStock.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-[#C0392B]/50 hover:shadow-md transition-all font-inter group relative"
                  >
                    <div>
                      <div className="relative h-44 rounded-md overflow-hidden mb-3.5 bg-slate-50 border border-slate-200">
                        <Image
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          alt={prod.name}
                          src={prod.img}
                          unoptimized
                        />
                        <span className="absolute top-2 left-2 bg-[#D9531E] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs z-10 font-inter">
                          {prod.badge}
                        </span>
                        <span className="absolute bottom-2 right-2 bg-white/95 text-slate-700 border border-slate-200 text-[10px] font-medium px-2 py-0.5 rounded font-inter">
                          {prod.subBadge}
                        </span>
                        {/* Real stock badge */}
                        <span className="absolute top-2 right-2 bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs flex items-center gap-1 font-inter">
                          <Check className="w-3 h-3" strokeWidth={2} />
                          <span>{t.products.inStock} {prod.stockCount} {t.products.inStockSuffix}</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1">{prod.name}</h3>
                        <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-50 text-slate-600 font-semibold shrink-0 border border-slate-200">
                          S/N: {prod.serviceTag}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 font-inter line-clamp-2 mt-0.5">{prod.desc}</p>
                      <ul className="my-3 space-y-1.5 text-xs text-slate-700 font-inter">
                        <li className="flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-[#C0392B] shrink-0" strokeWidth={1.5} />
                          <span className="truncate">{prod.specs.cpu}</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="w-3.5 h-3.5 text-center font-bold text-[10px] text-[#C0392B]">RAM</span>
                          <span className="truncate">{prod.specs.ram}</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <HardDrive className="w-3.5 h-3.5 text-[#C0392B] shrink-0" strokeWidth={1.5} />
                          <span className="truncate">{prod.specs.storage}</span>
                        </li>
                        <li className="flex items-center gap-1.5 text-emerald-800 font-medium">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" strokeWidth={1.5} />
                          <span className="truncate">{prod.specs.highlight}</span>
                        </li>
                        <li className="flex items-center gap-1.5 text-slate-500">
                          <Gift className="w-3.5 h-3.5 text-[#D97706] shrink-0" strokeWidth={1.5} />
                          <span className="truncate">{prod.specs.gift}</span>
                        </li>
                      </ul>
                    </div>

                    <div className="pt-3 border-t border-slate-200 mt-2 space-y-2">
                      <div className="flex items-baseline justify-between font-inter">
                        <span className="text-xs text-slate-500">{t.products.priceLabel}</span>
                        <span className="text-lg font-bold text-[#C0392B] font-mono">
                          {formatVND(prod.price)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedProduct(prod)}
                          className="w-full py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs tracking-wide transition-colors text-center block shadow-xs border border-slate-200"
                        >
                          {t.products.btnInspect}
                        </button>
                        <Link
                          href={`/dat-lich?device=${encodeURIComponent(prod.name)}&service=${encodeURIComponent(isEn ? 'Purchase In-Stock Unit' : 'Đặt mua máy có sẵn')}`}
                          className="w-full py-2 rounded-lg bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-xs tracking-wide transition-colors text-center block shadow-xs"
                        >
                          {t.products.btnOrder}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </section>

        {/* 3. KHỐI 2: MENU GÓI DỊCH VỤ & SPA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20" id="dich-vu-spa">
          <div className="p-8 sm:p-12 rounded-lg bg-[#FFFDF9] border border-[#E8E2D9] shadow-xs relative overflow-hidden">
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
              <div className="inline-flex items-center px-3.5 py-1 rounded-md bg-[#FBE8DE] text-[#C0392B] border border-[#F2C4B2] text-xs font-bold uppercase">
                {t.services.tag}
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-[#2B1810] tracking-tight">
                {t.services.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#6E5D53]">
                {t.services.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {/* Gói 1 */}
              <div className="p-6 rounded-lg bg-white border border-[#E8E2D9] shadow-xs flex flex-col justify-between hover:border-[#C0392B] transition-all group">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-md bg-[#FAF7F2] text-[#C0392B] flex items-center justify-center font-black text-sm border border-[#E8E2D9]">
                    01
                  </div>
                  <h3 className="text-lg font-bold text-[#2B1810]">{t.services.pkg1Title}</h3>
                  <p className="text-xs text-[#6E5D53] leading-relaxed">
                    {t.services.pkg1Desc}
                  </p>
                  <div className="pt-2 space-y-2 text-xs text-[#2B1810]">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span>{t.services.pkg1F1}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span>{t.services.pkg1F2}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span>{t.services.pkg1F3}</span>
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t border-[#E8E2D9] mt-6 space-y-3">
                  <div>
                    <div className="text-xs text-[#6E5D53] font-medium">{t.services.feeLabel}</div>
                    <div className="text-base sm:text-lg font-bold text-[#C0392B]">{t.services.pkg1Price}</div>
                    <div className="text-[11px] text-[#6E5D53] mt-0.5">{t.services.pkg1Sub}</div>
                  </div>
                  <Link
                    href={`/dat-lich?service=${encodeURIComponent(t.services.pkg1Title)}`}
                    className="w-full py-2.5 rounded-lg bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-xs tracking-wide transition-all text-center block shadow-xs"
                  >
                    {t.services.btnBookPkg}
                  </Link>
                </div>
              </div>

              {/* Gói 2 - Nổi Bật */}
              <div className="p-6 rounded-lg bg-[#FFFDF9] border-2 border-[#C0392B] shadow-md flex flex-col justify-between transition-all group relative">
                <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-md bg-[#C0392B] text-white font-bold text-[10px] tracking-wide shadow-xs">
                  {t.services.pkg2Badge}
                </div>
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-md bg-[#FBE8DE] text-[#C0392B] flex items-center justify-center font-black text-sm border border-[#F2C4B2]">
                    02
                  </div>
                  <h3 className="text-lg font-bold text-[#2B1810]">{t.services.pkg2Title}</h3>
                  <p className="text-xs text-[#6E5D53] leading-relaxed">
                    {t.services.pkg2Desc}
                  </p>
                  <div className="pt-2 space-y-2 text-xs text-[#2B1810]">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span>{t.services.pkg2F1}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span>{t.services.pkg2F2}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span>{t.services.pkg2F3}</span>
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t border-[#E8E2D9] mt-6 space-y-3">
                  <div>
                    <div className="text-xs text-[#6E5D53] font-medium">{t.services.feeLabel}</div>
                    <div className="text-base sm:text-lg font-bold text-[#C0392B]">{t.services.pkg2Price}</div>
                    <div className="text-[11px] text-[#6E5D53] mt-0.5">{t.services.pkg2Sub}</div>
                  </div>
                  <Link
                    href={`/dat-lich?service=${encodeURIComponent(t.services.pkg2Title)}`}
                    className="w-full py-2.5 rounded-lg bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-xs tracking-wide transition-all text-center block shadow-xs"
                  >
                    {t.services.btnBookPkg}
                  </Link>
                </div>
              </div>

              {/* Gói 3 */}
              <div className="p-6 rounded-lg bg-white border border-[#E8E2D9] shadow-xs flex flex-col justify-between hover:border-[#C0392B] transition-all group">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-md bg-[#FAF7F2] text-[#C0392B] flex items-center justify-center font-black text-sm border border-[#E8E2D9]">
                    03
                  </div>
                  <h3 className="text-lg font-bold text-[#2B1810]">{t.services.pkg3Title}</h3>
                  <p className="text-xs text-[#6E5D53] leading-relaxed">
                    {t.services.pkg3Desc}
                  </p>
                  <div className="pt-2 space-y-2 text-xs text-[#2B1810]">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span>{t.services.pkg3F1}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span>{t.services.pkg3F2}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span>{t.services.pkg3F3}</span>
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t border-[#E8E2D9] mt-6 space-y-3">
                  <div>
                    <div className="text-xs text-[#6E5D53] font-medium">{t.services.feeLabel}</div>
                    <div className="text-base sm:text-lg font-bold text-[#C0392B]">{t.services.pkg3Price}</div>
                    <div className="text-[11px] text-[#6E5D53] mt-0.5">{t.services.pkg3Sub}</div>
                  </div>
                  <Link
                    href={`/dat-lich?service=${encodeURIComponent(t.services.pkg3Title)}`}
                    className="w-full py-2.5 rounded-lg bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-xs tracking-wide transition-all text-center block shadow-xs"
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
                className="inline-flex items-center gap-3 px-8 py-4 rounded-lg bg-[#D9531E] hover:bg-[#C0392B] text-white font-black text-sm sm:text-base tracking-wide shadow-lg shadow-[#D9531E]/20 transition-all hover:scale-[1.02]"
              >
                <span>{t.services.btnBigDispatch}</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </section>


        {/* 5. KHỐI 4: QUY TRÌNH KIỂM ĐỊNH 4 BƯỚC (Phá grid: bước 03 lệch nhịp, typography số đậm) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black text-[#2B1810] tracking-tight">
              {t.qcProcess.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#6E5D53]">
              {t.qcProcess.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {/* Step 01 */}
            <div className="p-6 rounded-lg bg-white border border-[#E8E2D9] shadow-xs hover:border-[#C0392B] transition-all">
              <div className="text-4xl font-black text-[#E8E2D9] leading-none mb-3">01</div>
              <h3 className="text-sm font-bold text-[#2B1810] uppercase">{t.qcProcess.s1Title}</h3>
              <p className="text-xs text-[#6E5D53] mt-2 leading-relaxed">
                {t.qcProcess.s1Desc}
              </p>
            </div>

            {/* Step 02 */}
            <div className="p-6 rounded-lg bg-white border border-[#E8E2D9] shadow-xs hover:border-[#C0392B] transition-all">
              <div className="text-4xl font-black text-[#E8E2D9] leading-none mb-3">02</div>
              <h3 className="text-sm font-bold text-[#2B1810] uppercase">{t.qcProcess.s2Title}</h3>
              <p className="text-xs text-[#6E5D53] mt-2 leading-relaxed">
                {t.qcProcess.s2Desc}
              </p>
            </div>

            {/* Step 03 */}
            <div className="p-6 rounded-lg bg-white border border-[#E8E2D9] shadow-xs hover:border-[#C0392B] transition-all">
              <div className="text-4xl font-black text-[#E8E2D9] leading-none mb-3">03</div>
              <h3 className="text-sm font-bold text-[#2B1810] uppercase">{t.qcProcess.s3Title}</h3>
              <p className="text-xs text-[#6E5D53] mt-2 leading-relaxed">
                {t.qcProcess.s3Desc}
              </p>
            </div>

            {/* Step 04 */}
            <div className="p-6 rounded-lg bg-white border border-[#E8E2D9] shadow-xs hover:border-[#C0392B] transition-all">
              <div className="text-4xl font-black text-[#E8E2D9] leading-none mb-3">04</div>
              <h3 className="text-sm font-bold text-[#2B1810] uppercase">{t.qcProcess.s4Title}</h3>
              <p className="text-xs text-[#6E5D53] mt-2 leading-relaxed">
                {t.qcProcess.s4Desc}
              </p>
            </div>
          </div>
        </section>

        {/* 6. KHỐI 5: FAQ DẠNG COLLAPSED ACCORDION */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 scroll-mt-20" id="faq-an-tam">
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
            <div className="text-xs uppercase tracking-widest text-[#C0392B] font-bold">
              {t.faq.tag}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#2B1810] tracking-tight">
              {t.faq.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#6E5D53]">
              {t.faq.subtitle}
            </p>
          </div>

          <div className="space-y-3">
            {activeFaqs.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-lg bg-white border border-[#E8E2D9] shadow-xs overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-[#FAF7F2] transition-colors"
                  >
                    <span className="text-sm sm:text-base font-bold text-[#2B1810] leading-snug">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#6E5D53] transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-[#C0392B]' : ''
                      }`}
                      strokeWidth={1.5}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#6E5D53] leading-relaxed border-t border-[#E8E2D9] bg-[#FFFDF9]">
                      <p>{item.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* FLOATING ACTION BUTTONS (Gồm Hotline 0909.053.058, Zalo, WhatsApp, Tra Cứu, Bỏ Pulse/Ping) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
        {/* 1. Kiểm tra bảo hành theo S/N */}
        <Link
          href="/tra-cuu-bao-hanh"
          className="pointer-events-auto w-12 h-12 rounded-lg bg-white hover:bg-[#FAF7F2] text-[#C0392B] border-2 border-[#C0392B] shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 group relative"
          title={t.floating.warrantyTooltip}
        >
          <ShieldCheck className="w-5 h-5 text-[#C0392B]" strokeWidth={1.5} />
          <span className="opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 absolute right-14 px-3 py-1.5 rounded-lg bg-[#2B1810] text-white text-xs font-semibold whitespace-nowrap shadow-xl flex items-center gap-1.5">
            <span>{t.floating.warrantyTooltip}</span>
          </span>
        </Link>

        {/* 2. Gọi điện Hotline 0909.053.058 (Không pulse) */}
        <a
          href={`tel:${(systemSettings.hotline || '0909053058').replace(/\./g, '')}`}
          className="pointer-events-auto w-12 h-12 rounded-lg bg-[#D9531E] hover:bg-[#C0392B] text-white shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 group relative"
          title={`Hotline: ${systemSettings.hotline || '0909.053.058'}`}
        >
          <PhoneCall className="w-5 h-5" strokeWidth={1.5} />
          <span className="opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 absolute right-14 px-3 py-1.5 rounded-lg bg-[#2B1810] text-white text-xs font-semibold whitespace-nowrap shadow-xl flex items-center gap-1.5">
            <span className="text-[#E8A87C] font-bold">Hotline:</span>
            <span>{systemSettings.hotline || '0909.053.058'} (24/7)</span>
          </span>
        </a>

        {/* 3. Nhắn Zalo Kỹ Thuật (Không ping) */}
        <a
          href={systemSettings.zaloLink || 'https://zalo.me/0909053058'}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto w-12 h-12 rounded-lg bg-[#0068FF] hover:bg-[#0054d1] text-white shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 group relative"
          title="Zalo: Nhắn Kỹ Thuật Trực Ca"
        >
          <MessageSquare className="w-5 h-5" strokeWidth={1.5} />
          <span className="opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 absolute right-14 px-3 py-1.5 rounded-lg bg-[#2B1810] text-white text-xs font-semibold whitespace-nowrap shadow-xl flex items-center gap-1.5">
            <span className="font-bold text-sky-300">Zalo:</span>
            <span>{isEn ? 'Direct Tech Chat' : 'Nhắn kỹ thuật trực ca'}</span>
          </span>
        </a>

        {/* 4. Widget Nút WhatsApp (Yêu cầu 10) */}
        <a
          href={systemSettings.whatsappLink || 'https://wa.me/84909053058'}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto w-12 h-12 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 group relative"
          title="WhatsApp: Tư vấn máy & hỗ trợ kỹ thuật"
        >
          {/* SVG biểu tượng WhatsApp chuẩn */}
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.97.531 1.939.814 2.796.814 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.767-5.768-5.767zm7.551 5.766c0 4.164-3.388 7.551-7.551 7.551-1.31 0-2.573-.342-3.682-.992l-4.349 1.141 1.161-4.241c-.72-1.156-1.101-2.493-1.101-3.859 0-4.164 3.388-7.551 7.551-7.551s7.551 3.387 7.551 7.551zm-5.834 2.052c-.179.497-.886.917-1.258.97-.373.053-.836.082-2.392-.562-1.865-.772-3.064-2.673-3.158-2.798-.093-.125-.762-1.015-.762-1.936 0-.92.483-1.372.655-1.558.172-.186.376-.232.502-.232.125 0 .252.002.361.008.115.006.269-.044.421.32.158.379.542 1.322.589 1.418.047.096.079.208.016.333-.063.125-.094.204-.188.314-.094.11-.198.246-.282.33-.094.094-.192.197-.082.386.11.189.489.808 1.05 1.308.723.644 1.332.844 1.521.938.189.094.3-.079.41-.205.11-.126.471-.548.597-.736.126-.188.252-.157.422-.094.17.063 1.082.51 1.27.604.188.094.314.141.36.22.046.078.046.452-.133.949z" />
          </svg>
          <span className="opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 absolute right-14 px-3 py-1.5 rounded-lg bg-[#2B1810] text-white text-xs font-semibold whitespace-nowrap shadow-xl flex items-center gap-1.5">
            <span className="font-bold text-emerald-400">WhatsApp:</span>
            <span>{isEn ? 'Direct WhatsApp Chat' : 'Chat WhatsApp tư vấn máy'}</span>
          </span>
        </a>

        {/* 5. Scroll to Top */}
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="pointer-events-auto w-9 h-9 rounded-lg bg-white hover:bg-[#FAF7F2] text-[#6E5D53] hover:text-[#2B1810] border border-[#E8E2D9] shadow-md flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 group relative"
          title={t.floating.backToTop}
        >
          <ArrowUp className="w-4 h-4 text-[#2B1810]" strokeWidth={1.5} />
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
          <div className="p-2 sm:p-4 space-y-6 font-inter">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 text-xs font-semibold mb-1.5 border border-slate-200">
                  <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.5} />
                  <span>{t.qcModal.badge}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">{selectedProduct.name}</h3>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  {t.qcModal.serviceTag}{' '}
                  <span className="font-bold text-slate-900 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 font-mono">
                    {selectedProduct.serviceTag}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs text-slate-500">{t.qcModal.priceLabel}</div>
                <div className="text-xl font-bold text-[#C0392B] font-mono">{formatVND(selectedProduct.price)}</div>
              </div>
            </div>

            {/* Hardware & Test Evidence Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-[#C0392B]" strokeWidth={1.5} />
                  <span>{t.qcModal.cpuMemoryTitle}</span>
                </div>
                <p className="text-slate-600 font-mono">{selectedProduct.specs.cpu}</p>
                <p className="text-slate-600 font-mono">{selectedProduct.specs.ram}</p>
                <div className="text-[11px] text-emerald-800 font-medium flex items-center gap-1 pt-1 border-t border-slate-200">
                  <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.5} />
                  <span>{t.qcModal.stressTestGood}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-[#C0392B]" strokeWidth={1.5} />
                  <span>{t.qcModal.storageTitle}</span>
                </div>
                <p className="text-slate-600 font-mono">{selectedProduct.specs.storage}</p>
                <div className="text-[11px] text-emerald-800 font-medium flex items-center gap-1 pt-1 border-t border-slate-200">
                  <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.5} />
                  <span>{t.qcModal.diskInfoGood}</span>
                </div>
              </div>
            </div>

            {/* Warehouse / Handover Meta */}
            {selectedProduct.isSold ? (
              <div className="p-3.5 rounded-lg bg-amber-50/60 border border-amber-200 text-xs space-y-2">
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" strokeWidth={1.5} />
                    <span>{isEn ? 'Handover & Warranty Record' : 'Hồ Sơ Bàn Giao & Bảo Hành'}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-white text-[10px] font-bold">
                    {t.products.soldBadge}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 text-[11px]">
                  <div>
                    • {t.products.soldToLabel}: <strong className="text-slate-900">{selectedProduct.customerName} ({selectedProduct.customerArea})</strong>
                  </div>
                  <div>
                    • {t.products.handoverDateLabel}: <strong className="text-slate-900 font-mono">{selectedProduct.handoverDate}</strong>
                  </div>
                  <div>
                    • {isEn ? 'Warranty status' : 'Tình trạng bảo hành'}: <strong className="text-emerald-700">{t.products.warrantyActiveLabel}</strong>
                  </div>
                  <div>
                    • {t.qcModal.burnInDuration}: <strong className="text-slate-900 font-mono">{selectedProduct.burnInDuration} {t.qcModal.minutes}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span>{t.qcModal.warehouseStatusTitle}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#C0392B] text-white text-[10px] font-bold">
                    {t.qcModal.inWarehouseCount} {selectedProduct.stockCount} {t.qcModal.inWarehouseSuffix}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600 text-[11px]">
                  <div>
                    • {t.qcModal.burnInDuration} <strong className="text-slate-900 font-mono">{selectedProduct.burnInDuration} {t.qcModal.minutes}</strong>
                  </div>
                  <div>
                    • {t.qcModal.osLicense} <strong className="text-slate-900">{t.qcModal.osLicenseVal}</strong>
                  </div>
                  <div>
                    • {t.qcModal.policy} <strong className="text-slate-900">{t.qcModal.policyVal}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            {selectedProduct.isSold ? (
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href={`/tra-cuu-bao-hanh?tag=${encodeURIComponent(selectedProduct.serviceTag)}`}
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 py-3 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm text-center transition-all shadow-xs flex items-center justify-center gap-2 font-mono"
                >
                  <Search className="w-4 h-4" strokeWidth={1.5} />
                  <span>{t.products.btnLookupWarranty}</span>
                </Link>
                <Link
                  href={`/dat-lich?device=${encodeURIComponent(selectedProduct.name)}&service=${encodeURIComponent(isEn ? 'Order Similar Configuration' : 'Đặt cấu hình tương tự')}`}
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 py-3 rounded-lg bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-xs sm:text-sm text-center transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <span>{t.products.btnOrderSimilar}</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href={`/dat-lich?device=${encodeURIComponent(selectedProduct.name)}&service=${encodeURIComponent(isEn ? 'Order In-Stock Computer' : 'Đặt mua máy có sẵn')}`}
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 py-3 rounded-lg bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-xs sm:text-sm text-center transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <span>{t.qcModal.btnReserve}</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </Link>
                <a
                  href={`${systemSettings.zaloLink || 'https://zalo.me/0909053058'}?text=${encodeURIComponent(isEn ? `Hello An Tam, I would like photos and details for ${selectedProduct.name} (S/N: ${selectedProduct.serviceTag})` : `Chào An Tâm, tôi quan tâm máy ${selectedProduct.name} (S/N: ${selectedProduct.serviceTag})`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-5 rounded-lg bg-[#0068FF] hover:bg-[#0054d1] text-white font-bold text-xs sm:text-sm text-center transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
                  <span>{t.qcModal.btnZaloPhotos}</span>
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
