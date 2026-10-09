'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Modal } from 'antd';
import {
  CheckCircle,
  Cpu,
  HardDrive,
  ShieldCheck,
  ArrowRight,
  MessageSquare,
  ChevronDown,
  Gift,
  Check,
  ScanLine,
  Sparkles,
  Zap,
  Star,
} from 'lucide-react';
import { useViTinhAnTamStore } from '@/lib/store';
import { formatVND } from '@/lib/supabase';
import {
  TRANSLATIONS,
  ENGLISH_FAQS,
  ENGLISH_REVIEWS,
} from '@/lib/translations';
import { initialCustomerReviews } from '@/lib/mockData';
import { getShowcaseProducts, ShowcaseItem } from '@/lib/productsData';
import { TrustEvidenceSection } from '@/components/TrustEvidenceSection';
import { FeaturedProductCard } from '@/components/FeaturedProductCard';

export default function HomePage() {
  const router = useRouter();
  const { currentLang, inventory, systemSettings, keyCategories, licenseKeys, faqs, reviews } = useViTinhAnTamStore();
  const isEn = currentLang === 'en';
  const t = TRANSLATIONS[currentLang || 'vi'];

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<ShowcaseItem | null>(null);
  const [homeProductTab, setHomeProductTab] = useState<'hardware' | 'software'>('hardware');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#', '');
      const element = document.getElementById(hash);
      if (element) {
        const timer = setTimeout(() => {
          const headerOffset = 75;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 75;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      window.history.pushState(null, '', `/#${targetId}`);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const allProducts = useMemo(() => getShowcaseProducts(isEn, inventory), [isEn, inventory]);
  const inStockProducts = useMemo(() => allProducts.filter((p) => !p.isSold), [allProducts]);

  // Admin-curated featured products (isFeatured flag) — fallback to first 3
  const featuredProducts = useMemo(() => {
    const featured = inStockProducts.filter((p) => p.isFeatured);
    return featured.length >= 3 ? featured.slice(0, 3) : inStockProducts.slice(0, 3);
  }, [inStockProducts]);

  const availableSoftwareCategories = useMemo(() => {
    return (keyCategories || [])
      .map((cat) => {
        const keys = (licenseKeys || []).filter(
          (k) => k.category_id === cat.id && k.status === 'available'
        );
        return {
          ...cat,
          availableStock: keys.length,
          price: keys[0]?.unit_price || (cat.type === 'office' ? 450000 : 350000),
        };
      })
      .filter((cat) => cat.availableStock > 0);
  }, [keyCategories, licenseKeys]);

  const totalReadyStock = useMemo(
    () => inStockProducts.reduce((acc, curr) => acc + curr.stockCount, 0),
    [inStockProducts]
  );

  const activeFaqs = useMemo(() => {
    const objectionFaqs = t.faqObjections;
    if (objectionFaqs && objectionFaqs.length > 0) {
      return objectionFaqs.map((f) => ({ question: f.question, answer: f.answer }));
    }
    if (isEn && ENGLISH_FAQS) return ENGLISH_FAQS;
    if (faqs && faqs.length > 0) {
      return faqs.map((f) => ({ question: f.question, answer: f.answer }));
    }
    return [
      {
        question: 'Máy tính tại Vi Tính An Tâm được kiểm tra và tuyển chọn như thế nào?',
        answer: 'Toàn bộ máy tính tại Vi Tính An Tâm cam kết bo mạch nguyên bản 100%, chưa từng qua sửa chữa. Trước khi giao, kỹ thuật viên kiểm tra toàn diện bằng phần mềm test tải chuyên dụng (FurMark, AIDA64, CrystalDiskInfo) để đảm bảo máy vận hành êm mát, ổn định và bền bỉ.',
      },
    ];
  }, [isEn, faqs, t.faqObjections]);

  const socialProofSegments = useMemo(() => {
    if (t.socialProof?.segments) return t.socialProof.segments;
    return [];
  }, [t.socialProof]);

  return (
    <div className="w-full relative selection:bg-[#C0392B] selection:text-white">
      {toastMessage && (
        <div role="status" aria-live="polite" className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-lg bg-[#2B1810] text-white text-xs font-semibold shadow-xl border border-[#3E291F] flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="w-full">
        {/* ================================================================ */}
        {/* 1. HERO — Trust-First Headline + 4 Inline Badges + Image         */}
        {/* ================================================================ */}
        <section className="bg-gradient-to-b from-[#FDFBF7] via-white to-[#F8FAFC] border-b border-slate-200/80 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="flex flex-wrap items-center justify-between gap-3 pt-6 pb-5 border-b border-slate-200/60 text-xs">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-[#FBE8DE] text-[#C0392B] text-[10px] font-extrabold uppercase tracking-wider border border-[#F2C4B2]">
                {t.hero.brandTag}
              </span>
              <Link
                href="/tra-cuu-bao-hanh"
                className="text-[#6E5D53] hover:text-[#C0392B] font-semibold flex items-center gap-1"
              >
                <ShieldCheck className="w-3 h-3" />
                <span>{isEn ? 'S/N Warranty Lookup' : 'Tra cứu bảo hành S/N'}</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 py-10 lg:py-16 items-center">

              {/* Left: Headline + Trust Badges + CTA */}
              <div className="lg:col-span-7 flex flex-col gap-5">
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#1A0F0A] tracking-tight leading-[1.12]">
                  {t.hero.mainTitle}
                </h1>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                  {t.hero.description}
                </p>

                {/* 4 Trust Badges — Inline, scannable */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(t.hero.trustBadges || []).map((badge, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C0392B] flex-shrink-0" aria-hidden="true" />
                      <span>{badge}</span>
                    </div>
                  ))}
                </div>

                {/* CTAs — Single primary, one secondary */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href="#san-pham"
                    onClick={(e) => scrollToSection(e, 'san-pham')}
                    className="px-7 py-3.5 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 group cursor-pointer"
                  >
                    <span>{t.hero.btnBrowseStock}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <Link
                    href="/dat-lich"
                    className="px-6 py-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm transition-all shadow-2xs hover:-translate-y-0.5"
                  >
                    {t.hero.btnScheduleService}
                  </Link>
                </div>
              </div>

              {/* Right: Showroom Image + Trust Cards */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200/90 aspect-16/11 group bg-slate-100">
                  <Image
                    src="/images/hero-showroom.jpg"
                    alt="Showroom Vi Tính An Tâm"
                    fill
                    priority
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{isEn ? 'System' : 'Hệ thống'}</div>
                    <div className="text-xs font-bold text-slate-900 mt-0.5">{isEn ? 'Genuine Digital Windows' : 'Windows Bản Quyền Số'}</div>
                    <div className="text-[11px] text-slate-500">{isEn ? 'Permanent motherboard entitlement' : 'Vĩnh viễn theo bo mạch chủ'}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{isEn ? 'Support' : 'Hỗ trợ kỹ thuật'}</div>
                    <div className="text-xs font-bold text-slate-900 mt-0.5">{isEn ? 'Prompt Response' : 'Ứng Phó Nhanh'}</div>
                    <div className="text-[11px] text-slate-500">{isEn ? 'On-site or via UltraViewer' : 'Tận nơi hoặc qua UltraViewer'}</div>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom stats strip */}
            <div className="border-t border-slate-200/80 py-6 grid grid-cols-2 divide-x divide-slate-200/80">
              <div className="px-2 sm:px-6 text-center sm:text-left">
                <div className="text-2xl sm:text-3xl font-black text-[#C0392B] font-mono">100%</div>
                <div className="text-xs sm:text-sm font-semibold text-slate-800 mt-0.5">
                  {isEn ? 'Component transparency' : 'Minh bạch linh kiện'}
                </div>
                <div className="text-[11px] text-slate-500 hidden sm:block">
                  {isEn ? 'New is new, used is used — fully honest' : 'Mới báo mới, cũ báo cũ rõ ràng'}
                </div>
              </div>
              <div className="px-2 sm:px-6 text-center sm:text-left">
                <div className="text-2xl sm:text-3xl font-black text-[#1A0F0A] font-mono">
                  {isEn ? 'Dedicated' : 'Tận Tâm'}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-800 mt-0.5">
                  {isEn ? 'Prompt assistance' : 'Hỗ trợ nhanh chóng'}
                </div>
                <div className="text-[11px] text-slate-500 hidden sm:block">
                  {isEn ? 'Minimizing workflow disruption' : 'Hạn chế tối đa gián đoạn công việc'}
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ================================================================ */}
        {/* 2. TRUST EVIDENCE SECTION (New)                                   */}
        {/* ================================================================ */}
        <TrustEvidenceSection />

        {/* ================================================================ */}
        {/* 3. FEATURED PRODUCTS (3 admin-curated, with trust badges)         */}
        {/* ================================================================ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20" id="san-pham">
          <span id="danh-muc-san-pham" className="sr-only" />

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-2xl sm:text-4xl font-black text-[#1A0F0A] tracking-tight">
                {isEn ? 'FEATURED INVENTORY' : 'MÁY NỔI BẬT TRONG KHO'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-2xl">
                {isEn
                  ? 'Curated enterprise desktops and laptops, tested and ready. Each unit includes its grade, burn-in duration, and warranty details.'
                  : 'Máy tính để bàn và laptop doanh nghiệp tuyển chọn, đã kiểm tra sẵn sàng giao. Kèm thông tin cấp độ, thời gian test tải và bảo hành chi tiết.'}
              </p>
            </div>
            <Link
              href="/danh-muc-san-pham"
              className="text-xs font-bold text-[#C0392B] hover:underline shrink-0 hidden sm:block"
            >
              {isEn ? 'View All Inventory →' : 'Xem toàn bộ kho máy →'}
            </Link>
          </div>

          {/* Product tabs: Hardware / Software */}
          <div className="flex items-center gap-2 mb-8 p-3 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9]">
            <button
              type="button"
              onClick={() => setHomeProductTab('hardware')}
              className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
                homeProductTab === 'hardware'
                  ? 'bg-[#2B1810] text-white shadow-xs'
                  : 'bg-white border border-[#E8E2D9] text-[#6E5D53] hover:border-[#2B1810]'
              }`}
            >
              {isEn ? 'COMPUTERS & LAPTOPS' : 'MÁY TÍNH & LAPTOP'}
            </button>
            <button
              type="button"
              onClick={() => setHomeProductTab('software')}
              className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                homeProductTab === 'software'
                  ? 'bg-[#C0392B] text-white shadow-xs'
                  : 'bg-white border border-[#E8E2D9] text-[#C0392B] hover:border-[#C0392B]'
              }`}
            >
              <span>{isEn ? 'LICENSE KEYS' : 'KEY BẢN QUYỀN'}</span>
              {availableSoftwareCategories.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-mono">
                  {availableSoftwareCategories.length}
                </span>
              )}
            </button>
          </div>

          {/* Hardware */}
          {homeProductTab === 'hardware' && (
            <div className="space-y-6 mb-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProducts.map((prod) => (
                  <FeaturedProductCard
                    key={prod.id}
                    product={prod}
                    onInspect={setSelectedProduct}
                  />
                ))}
              </div>

              <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/danh-muc-san-pham"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-sm sm:text-base tracking-wide shadow-lg shadow-[#C0392B]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 group text-center"
                >
                  <span>
                    {isEn
                      ? `View All ${totalReadyStock} Units in Stock`
                      : `Xem Toàn Bộ Kho Máy (${totalReadyStock} máy)`}
                  </span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                </Link>
              </div>
            </div>
          )}

          {/* Software & Keys */}
          {homeProductTab === 'software' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#C0392B]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
                  {isEn ? 'GENUINE DIGITAL LICENSE KEYS (LIFETIME ON MOTHERBOARD)' : 'KEY BẢN QUYỀN SỐ CHÍNH HÃNG (VĨNH VIỄN THEO MAINBOARD)'}
                </h3>
              </div>

              {availableSoftwareCategories.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-white border border-[#E8E2D9] text-xs text-[#6E5D53]">
                  {isEn ? 'License keys are being replenished.' : 'Các phiên bản key bản quyền đang được cập nhật thêm vào kho.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableSoftwareCategories.map((cat) => (
                    <div
                      key={cat.id}
                      className="group bg-white rounded-2xl border border-[#E8E2D9] hover:border-[#C0392B] shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden p-6"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#FBE8DE] text-[#C0392B]">
                            {cat.type === 'office' ? (isEn ? 'OFFICE APPS' : 'ỨNG DỤNG VĂN PHÒNG') : (isEn ? 'OS' : 'HỆ ĐIỀU HÀNH')}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>{isEn ? `${cat.availableStock} keys left` : `Còn ${cat.availableStock} key`}</span>
                          </span>
                        </div>

                        <div>
                          <h4 className="text-base font-black text-[#2B1810] group-hover:text-[#C0392B] transition-colors uppercase">
                            {cat.name}
                          </h4>
                          <div className="text-2xl font-black text-[#C0392B] font-mono tracking-tight mt-1">
                            {formatVND(cat.price)}
                          </div>
                          <p className="text-xs text-[#6E5D53] mt-2 leading-relaxed">{cat.description}</p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-[#6E5D53]">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{isEn ? 'Lifetime activation tied to motherboard' : 'Kích hoạt vĩnh viễn theo máy, không hết hạn'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{isEn ? 'Official Windows/Office updates' : 'Cập nhật Windows / Office Update chính hãng'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{isEn ? 'Remote setup via UltraViewer / AnyDesk' : 'Hỗ trợ cài đặt từ xa qua UltraViewer / AnyDesk'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-5 mt-4 border-t border-slate-100">
                        <Link
                          href={`/mua-hang?device=${encodeURIComponent(cat.name)}&price=${cat.price}&tag=${encodeURIComponent(cat.type || 'KEY')}`}
                          className="w-full py-2.5 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-xs transition-colors shadow-2xs text-center uppercase tracking-wider block"
                        >
                          {isEn ? 'BUY LICENSE KEY' : 'MUA KEY TRỰC TIẾP'}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* ================================================================ */}
        {/* 4. SERVICE PACKAGES (kept from original, minor trust tweaks)       */}
        {/* ================================================================ */}
        <section className="bg-[#FAF7F2] border-y border-[#E8E2D9] py-16 scroll-mt-20" id="dich-vu-spa">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-sm p-6 sm:p-10 mb-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 relative aspect-16/10 rounded-xl overflow-hidden shadow-md border border-slate-200 group">
                  <Image
                    src="/images/tech-service-lab.jpg"
                    alt={isEn ? 'Hardware QC Lab' : 'Phòng Kỹ Thuật Kiểm Định Phần Cứng'}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] font-mono uppercase bg-[#C0392B] px-2 py-0.5 rounded font-bold">
                      {isEn ? 'TECHNICAL STANDARD' : 'TIÊU CHUẨN KỸ THUẬT'}
                    </span>
                    <p className="text-xs font-semibold mt-1">
                      {isEn ? 'Sonic cleaning • Arctic MX-4 • FurMark / AIDA64' : 'Vệ sinh siêu âm • Keo tản nhiệt Arctic MX-4 • Stress test FurMark / AIDA64'}
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-6 space-y-4">
                  <div className="inline-flex items-center px-3 py-1 rounded-md bg-[#FBE8DE] text-[#C0392B] border border-[#F2C4B2] text-xs font-bold uppercase tracking-wider">
                    {t.services.tag}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#2B1810] tracking-tight">
                    {t.services.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#6E5D53] leading-relaxed">
                    {isEn
                      ? 'Every device serviced or delivered undergoes thorough inspection under realistic workloads. Original hardware, transparent pricing, zero hidden fees.'
                      : 'An Tâm cam kết bo mạch chủ nguyên bản 100%, chưa từng qua sửa chữa. Toàn bộ quy trình kiểm định chất lượng được thực hiện thực tế qua các phần mềm đo kiểm chuyên dụng (stress test nhiệt độ, xung nhịp vi xử lý, sức khỏe ổ cứng) trước khi bàn giao.'}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E8E2D9]">
                      <div className="text-xs font-bold text-[#2B1810]">{isEn ? 'Premium Thermal Compound' : 'Keo Tản Nhiệt Cao Cấp'}</div>
                      <div className="text-[11px] text-[#6E5D53] mt-0.5">{isEn ? 'Authentic Arctic MX-4, drops heat by 5-12°C.' : 'Sử dụng Arctic MX-4 chính hãng, giảm nhiệt 5-12°C.'}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E8E2D9]">
                      <div className="text-xs font-bold text-[#2B1810]">{isEn ? 'Digital OEM License' : 'Bản Quyền Số OEM'}</div>
                      <div className="text-[11px] text-[#6E5D53] mt-0.5">{isEn ? 'Clean Windows, safe for business data.' : 'Windows sạch vĩnh viễn theo mainboard.'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Packages */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {[
                {
                  num: '01',
                  title: t.services.pkg1Title,
                  time: t.services.pkg1Time,
                  desc: t.services.pkg1Desc,
                  f1: t.services.pkg1F1, f2: t.services.pkg1F2, f3: t.services.pkg1F3,
                  price: t.services.pkg1Price, sub: t.services.pkg1Sub,
                  badge: null,
                },
                {
                  num: '02',
                  title: t.services.pkg2Title,
                  time: t.services.pkg2Time,
                  desc: t.services.pkg2Desc,
                  f1: t.services.pkg2F1, f2: t.services.pkg2F2, f3: t.services.pkg2F3,
                  price: t.services.pkg2Price, sub: t.services.pkg2Sub,
                  badge: t.services.pkg2Badge,
                  highlighted: true,
                },
                {
                  num: '03',
                  title: t.services.pkg3Title,
                  time: t.services.pkg3Time,
                  desc: t.services.pkg3Desc,
                  f1: t.services.pkg3F1, f2: t.services.pkg3F2, f3: t.services.pkg3F3,
                  price: t.services.pkg3Price, sub: t.services.pkg3Sub,
                  badge: null,
                },
              ].map((pkg, idx) => (
                <div
                  key={idx}
                  className={`p-6 rounded-2xl ${
                    pkg.highlighted
                      ? 'bg-[#FFFDF9] border-2 border-[#C0392B] shadow-md relative'
                      : 'bg-white border border-[#E8E2D9] shadow-xs hover:border-[#C0392B]'
                  } flex flex-col justify-between transition-all group`}
                >
                  {pkg.badge && (
                    <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-md bg-[#C0392B] text-white font-bold text-[10px] tracking-wide shadow-xs">
                      {pkg.badge}
                    </div>
                  )}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="w-10 h-10 rounded-lg bg-[#FAF7F2] text-[#C0392B] flex items-center justify-center font-black text-sm border border-[#E8E2D9]">
                        {pkg.num}
                      </div>
                      <span className="text-[11px] text-slate-500 font-semibold">{pkg.time}</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#2B1810]">{pkg.title}</h3>
                    <p className="text-xs text-[#6E5D53] leading-relaxed">{pkg.desc}</p>
                    <div className="pt-2 space-y-2 text-xs text-[#2B1810]">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                        <span>{pkg.f1}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                        <span>{pkg.f2}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                        <span>{pkg.f3}</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-[#E8E2D9] mt-6 space-y-3">
                    <div>
                      <div className="text-xs text-[#6E5D53] font-medium">{t.services.feeLabel}</div>
                      <div className="text-lg font-bold text-[#C0392B]">{pkg.price}</div>
                      <div className="text-[11px] text-[#6E5D53] mt-0.5">{pkg.sub}</div>
                    </div>
                    <Link
                      href={`/dat-lich?service=${encodeURIComponent(pkg.title)}`}
                      className={`w-full py-2.5 rounded-lg ${
                        pkg.highlighted
                          ? 'bg-[#C0392B] hover:bg-[#A93226]'
                          : 'bg-[#C0392B] hover:bg-[#A93226]'
                      } text-white font-bold text-xs tracking-wide transition-all text-center block shadow-xs`}
                    >
                      {t.services.btnBookPkg}
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link
                href="/dat-lich"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-[#D9531E] hover:bg-[#C0392B] text-white font-bold text-sm sm:text-base tracking-wide shadow-lg shadow-[#D9531E]/20 transition-all hover:scale-[1.02]"
              >
                <span>{t.services.btnBigDispatch}</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* 5. SOCIAL PROOF — Persona-based testimonials                       */}
        {/* ================================================================ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20 border-t border-[#E8E2D9]" id="danh-gia">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold shadow-2xs">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{isEn ? '1,200+ Satisfied Clients' : '1.200+ Khách Hàng Doanh Nghiệp & Cá Nhân Tin Chọn'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#2B1810] tracking-tight">
              {t.socialProof?.title || (isEn ? 'CLIENT TESTIMONIALS' : 'KHÁCH HÀNG CHIA SẺ')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {socialProofSegments.length >= 3 ? (
              socialProofSegments.slice(0, 3).map((seg, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs hover:border-[#C0392B] hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C0392B] bg-[#FBE8DE] px-2 py-0.5 rounded inline-block">
                      {seg.persona}
                    </span>
                    <p className="text-xs sm:text-sm text-[#2B1810] italic leading-relaxed pt-1">
                      &ldquo;{seg.quote}&rdquo;
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#E8E2D9] mt-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-xs text-[#2B1810]">{seg.author}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {seg.model} • {seg.warranty}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              (isEn ? ENGLISH_REVIEWS : (reviews.length > 0 ? reviews : initialCustomerReviews)).slice(0, 3).map((rev, idx) => (
                <div
                  key={rev.id || idx}
                  className="p-6 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs hover:border-[#C0392B] hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        <span>{isEn ? 'Verified' : 'Đã xác thực'}</span>
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#2B1810] italic leading-relaxed pt-1">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#E8E2D9] mt-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-[#2B1810] group-hover:text-[#C0392B] transition-colors">{rev.name}</div>
                      <div className="text-[11px] text-[#6E5D53]">{rev.role}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{rev.location}</div>
                    </div>
                    {rev.service && (
                      <span className="shrink-0 inline-block px-2.5 py-1 rounded-md bg-[#FAF7F2] border border-[#E8E2D9] text-[10px] font-bold text-[#6E5D53]">
                        {rev.service}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ================================================================ */}
        {/* 6. FAQ — Objection-Handling Accordion                              */}
        {/* ================================================================ */}
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
                  className="rounded-xl bg-white border border-[#E8E2D9] shadow-xs overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${idx}`}
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
                    <div id={`faq-answer-${idx}`} role="region" className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#6E5D53] leading-relaxed border-t border-[#E8E2D9] bg-[#FFFDF9]">
                      <p>{item.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

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
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-xs font-bold mb-1.5 border border-emerald-200">
                  <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.5} />
                  <span>{selectedProduct.isSold ? t.products.soldBadge : `Còn ${selectedProduct.stockCount} máy`}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">{selectedProduct.name}</h3>
                <div className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                  <span className="text-slate-500">{t.qcModal.serviceTag}</span>
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                    {isEn ? '100% QC Passed' : '100% Đạt Chuẩn'}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs text-slate-500">{t.qcModal.priceLabel}</div>
                <div className="text-xl font-bold text-[#C0392B] font-mono">{formatVND(selectedProduct.price)}</div>
              </div>
            </div>

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

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href={`/mua-hang?device=${encodeURIComponent(selectedProduct.name)}&price=${selectedProduct.price}&tag=${encodeURIComponent(selectedProduct.serviceTag || '')}`}
                onClick={() => setSelectedProduct(null)}
                className="flex-1 py-3 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-xs sm:text-sm text-center transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <span>{t.products.btnOrder}</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </Link>
              <a
                href={`${systemSettings.zaloLink || 'https://zalo.me/0909053058'}?text=${encodeURIComponent(isEn ? `Hello An Tam, I would like photos and details for ${selectedProduct.name}` : `Chào An Tâm, tôi quan tâm máy ${selectedProduct.name}, vui lòng gửi thêm hình ảnh thực tế`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-5 rounded-xl bg-[#0068FF] hover:bg-[#0054d1] text-white font-bold text-xs sm:text-sm text-center transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
                <span>{t.qcModal.btnZaloPhotos}</span>
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}