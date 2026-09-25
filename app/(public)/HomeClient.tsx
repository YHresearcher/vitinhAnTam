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
  ArrowRight,
  ArrowUp,
  PhoneCall,
  MessageSquare,
  ChevronDown,
  Gift,
  Check,
  ScanLine,
  Search,
  Sparkles,
  MapPin,
  Zap,
} from 'lucide-react';
import { useViTinhAnTamStore } from '@/lib/store';
import { formatVND } from '@/lib/supabase';
import {
  TRANSLATIONS,
  ENGLISH_FAQS,
} from '@/lib/translations';
import { getShowcaseProducts, ShowcaseItem } from '@/lib/productsData';

export default function HomePage() {
  const router = useRouter();
  const { currentLang, inventory, systemSettings, keyCategories, licenseKeys } = useViTinhAnTamStore();
  const isEn = currentLang === 'en';
  const t = TRANSLATIONS[currentLang || 'vi'];

  // Search state for quick warranty lookup
  const [searchInput, setSearchInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Modal for QC & S/N inspection
  const [selectedProduct, setSelectedProduct] = useState<ShowcaseItem | null>(null);

  // Modal for Buying License Keys
  const [isBuyKeyModalOpen, setIsBuyKeyModalOpen] = useState(false);
  const [isZaloModalOpen, setIsZaloModalOpen] = useState(false);
  const [selectedKeyType, setSelectedKeyType] = useState<'windows' | 'office'>('windows');
  const [homeProductTab, setHomeProductTab] = useState<'all' | 'hardware' | 'software'>('all');

  const inStockKeyCategories = (keyCategories || [])
    .filter((cat) => {
      if (selectedKeyType === 'windows') {
        return cat.type === 'windows' || cat.name.toLowerCase().includes('windows');
      } else {
        return cat.type === 'office' || cat.name.toLowerCase().includes('office');
      }
    })
    .filter((cat) => {
      // Rule: Dữ liệu nếu = 0 thì không hiển thị
      const count = (licenseKeys || []).filter(
        (k) => k.category_id === cat.id && k.status === 'available'
      ).length;
      return count > 0;
    });

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

  // Lấy dữ liệu sản phẩm
  const allProducts = getShowcaseProducts(isEn, inventory);
  const inStockProducts = allProducts.filter((p) => !p.isSold);
  
  // YÊU CẦU 1: Trang chủ chỉ lấy đúng 3 sản phẩm nổi bật đang sẵn kho
  const featuredProducts = inStockProducts.slice(0, 3);
  // Software products available in stock
  const availableSoftwareCategories = (keyCategories || [])
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

  const totalReadyStock = inStockProducts.reduce((acc, curr) => acc + curr.stockCount, 0);

  const activeFaqs = isEn && ENGLISH_FAQS ? ENGLISH_FAQS : [
    {
      question: 'Máy tính tại Vi Tính An Tâm được kiểm tra và tuyển chọn như thế nào?',
      answer:
        'Toàn bộ máy tại Vi Tính An Tâm đều thuộc dòng tuyển chọn cao cấp nguyên bản. Kỹ thuật viên không can thiệp hay kiểm tra chi tiết trên bo mạch chủ (mainboard) nhằm giữ nguyên trạng zin tuyệt đối của máy. Mọi quy trình kiểm định chất lượng được thực hiện thực tế 100% qua các phần mềm đo kiểm chuyên dụng: chạy thử tải nặng (stress test) FurMark / AIDA64, đo xung nhịp, nhiệt độ và kiểm tra sức khỏe ổ cứng trước khi bàn giao.',
    },
    {
      question: 'Chính sách bảo hành và hỗ trợ kỹ thuật tại An Tâm hoạt động như thế nào?',
      answer:
        'An Tâm áp dụng chính sách bảo hành nhanh chóng, hỗ trợ kỹ thuật tận nơi trong bán kính < 5km từ cửa hàng. Với các khách hàng ngoài bán kính 5km, chúng tôi tiếp nhận xử lý nhanh tại cửa hàng hoặc hỗ trợ kỹ thuật trực tiếp từ xa qua UltraViewer / AnyDesk để công việc của quý khách không bị gián đoạn.',
    },
    {
      question: 'Windows bản quyền số có lợi ích gì cho công việc văn phòng và kế toán?',
      answer:
        'Máy được kích hoạt bản quyền số Microsoft theo máy. Hệ thống sạch sẽ, bảo mật tốt, không chứa mã độc hay công cụ bẻ khóa, an toàn cho dữ liệu kế toán, hóa đơn điện tử và giao dịch ngân hàng.',
    },
    {
      question: 'Tôi có thể nâng cấp linh kiện RAM hoặc ổ cứng SSD theo nhu cầu được không?',
      answer:
        'Hoàn toàn được. Cửa hàng có sẵn cả linh kiện mới chính hãng bảo hành dài hạn lẫn linh kiện cũ tháo máy chất lượng tốt. An Tâm luôn tư vấn rõ ràng tình trạng (mới báo mới, cũ báo cũ) để quý khách an tâm lựa chọn theo ngân sách.',
    },
  ];

  return (
    <div className="w-full relative selection:bg-[#C0392B] selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div role="status" aria-live="polite" className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-lg bg-[#2B1810] text-white text-xs font-semibold shadow-xl border border-[#3E291F] flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="w-full">
        {/* 1. HERO SECTION — Professional Split Design with High-Res Showroom Image */}
        <section className="bg-gradient-to-b from-[#FDFBF7] via-white to-[#F8FAFC] border-b border-slate-200/80 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Top brand & store location status */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-6 pb-5 border-b border-slate-200/60 text-xs">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-[#FBE8DE] text-[#C0392B] text-[10px] font-extrabold uppercase tracking-wider border border-[#F2C4B2]">
                  {t.hero.brandTag || 'TIỆM VI TÍNH TỬ TẾ • TÂY NINH'}
                </span>
                <span className="hidden sm:inline text-slate-300">|</span>
                <span className="text-slate-600 font-medium hidden sm:inline">
                  {isEn ? 'Specializing in Enterprise Dell • HP • Lenovo ThinkPad' : 'Chuyên Dell • HP • Lenovo ThinkPad Doanh Nghiệp'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#C0392B] shrink-0" />
                <span>{isEn ? '52 Nguyen Cuu Van, Long An Ward, Tay Ninh' : '52 Nguyễn Cửu Vân, P. Long An, tỉnh Tây Ninh'}</span>
              </div>
            </div>

            {/* Main Hero: 2-column with content left & image showcase right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 py-10 lg:py-16 items-center">

              {/* Left Column: Headlines & Actions */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#1A0F0A] tracking-tight leading-[1.12]">
                  {t.hero.mainTitle}
                </h1>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl font-normal">
                  {t.hero.description}
                </p>

                {/* Main CTA buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href="#danh-muc-san-pham"
                    className="px-7 py-3.5 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 group"
                  >
                    <span>{t.hero.btnBrowseStock || 'Xem Máy Nổi Bật'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <Link
                    href="/dat-lich"
                    className="px-6 py-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm transition-all shadow-2xs"
                  >
                    {t.hero.btnScheduleService}
                  </Link>
                  <Link
                    href="/danh-muc-san-pham"
                    className="px-4 py-3.5 text-xs font-bold text-[#C0392B] hover:underline"
                  >
                    {isEn ? 'Full Catalog →' : 'Xem toàn bộ kho máy →'}
                  </Link>
                </div>

                {/* Quick warranty search box */}
                <div className="pt-2">
                  <div className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isEn ? 'Check warranty & factory QC records by Service Tag / Phone number:' : 'Tra cứu bảo hành & hồ sơ xuất xưởng theo Service Tag / Số điện thoại:'}</span>
                  </div>
                  <form
                    onSubmit={handleSearchSubmit}
                    role="search"
                    aria-label="Tra cứu bảo hành nhanh"
                    className="flex items-stretch gap-2 max-w-lg"
                  >
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder={t.hero.quickSearchPlaceholder || 'Nhập Service Tag (VD: HP-400G5M, DL-7490A1)...'}
                        aria-label="Nhập Service Tag"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#C0392B] focus:border-transparent font-mono shadow-2xs"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all flex items-center gap-1 shadow-2xs shrink-0"
                    >
                      <span>{t.hero.quickSearchBtn || 'Tra Cứu'}</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column: Hero Showroom Image with Floating Badges */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200/90 aspect-16/11 group">
                  <Image
                    src="/images/hero-showroom.jpg"
                    alt="Showroom Vi Tính An Tâm - Máy Tính Doanh Nghiệp Tuyển Chọn"
                    fill
                    priority
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                  />
                  {/* Subtle dark gradient overlay on bottom for badge contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                  {/* Floating Badges */}
                  <div className="absolute top-3.5 left-3.5">
                    <div className="px-3 py-1.5 rounded-lg bg-black/75 backdrop-blur-md text-white text-xs font-bold border border-white/20 shadow-lg flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isEn ? '100% Grade-A Original Motherboards' : '100% Mainboard Nguyên Zin Chuẩn A'}</span>
                    </div>
                  </div>

                  <div className="absolute bottom-3.5 left-3.5 right-3.5 flex flex-wrap items-center justify-between gap-2">
                    <div className="px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur-md text-[#1A0F0A] text-xs font-bold shadow-lg border border-white flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isEn ? 'Prompt warranty • On-site <5km' : 'Bảo hành nhanh • Tận nơi <5km'}</span>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-[#C0392B] text-white text-xs font-bold shadow-lg">
                      {isEn ? '⚡ 0% Installment via ID' : '⚡ Trả góp 0% qua CCCD'}
                    </div>
                  </div>
                </div>

                {/* Sub-card trust badges underneath image */}
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

            {/* Bottom 3 Stats Strip */}
            <div className="border-t border-slate-200/80 py-6 grid grid-cols-3 divide-x divide-slate-200/80">
              <div className="px-2 sm:px-6 text-center sm:text-left">
                <div className="text-2xl sm:text-3xl font-black text-[#1A0F0A] font-mono tabular-nums">
                  {totalReadyStock}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-800 mt-0.5">
                  {isEn ? 'Units in stock' : 'Máy có sẵn trong kho'}
                </div>
                <div className="text-[11px] text-slate-500 hidden sm:block">
                  {isEn ? 'Ready for immediate testing & handover' : 'Sẵn sàng bàn giao & kiểm tra máy'}
                </div>
              </div>

              <div className="px-2 sm:px-6 text-center sm:text-left">
                <div className="text-2xl sm:text-3xl font-black text-[#C0392B] font-mono">
                  100%
                </div>
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

        {/* 2. DANH MỤC SẢN PHẨM NỔI BẬT TRANG CHỦ — Card Grid Layout (3 Máy Duy Nhất) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20" id="danh-muc-san-pham">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-4 border-b border-slate-200">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBE8DE] text-[#C0392B] text-xs font-bold uppercase tracking-wider mb-2 border border-[#F2C4B2]">
                <Sparkles className="w-3.5 h-3.5 text-[#C0392B]" />
                <span>{isEn ? 'TOP 3 FEATURED SYSTEMS' : 'TOP 3 THIẾT BỊ NỔI BẬT'}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-[#1A0F0A] tracking-tight">
                {t.products.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-2xl">
                {isEn
                  ? 'Showcasing 3 featured enterprise computers in stock. Tested with deep hardware stress-tests and covered by on-site warranty.'
                  : 'Trưng bày 3 mẫu máy tiêu biểu đang sẵn sàng tại cửa hàng. Kiểm định 100% qua phần mềm chuyên dụng, bảo hành nhanh chóng tận nơi <5km.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsBuyKeyModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-xs transition-all shadow-sm hover:shadow-md flex items-center gap-1.5 uppercase tracking-wider"
              >
                <span>🔑 MUA KEY</span>
              </button>
              <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{isEn ? `${totalReadyStock} units in stock` : `${totalReadyStock} máy đang sẵn kho`}</span>
              </span>
            </div>
          </div>

                    {/* Category Filter Tabs: Tất Cả, Máy Tính & Laptop, Phần Mềm & Key */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 p-3 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9]">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setHomeProductTab('all')}
                className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
                  homeProductTab === 'all'
                    ? 'bg-[#2B1810] text-white shadow-xs'
                    : 'bg-white border border-[#E8E2D9] text-[#6E5D53] hover:border-[#2B1810]'
                }`}
              >
                {isEn ? 'All Products' : 'TẤT CẢ SẢN PHẨM'}
              </button>
              <button
                type="button"
                onClick={() => setHomeProductTab('hardware')}
                className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
                  homeProductTab === 'hardware'
                    ? 'bg-[#2B1810] text-white shadow-xs'
                    : 'bg-white border border-[#E8E2D9] text-[#6E5D53] hover:border-[#2B1810]'
                }`}
              >
                {isEn ? 'Computers & Laptops' : 'MÁY TÍNH & LAPTOP'}
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
                <span>{isEn ? 'Software & License Keys' : 'PHẦN MỀM & KEY BẢN QUYỀN'}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-mono">
                  {availableSoftwareCategories.length}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-xs text-emerald-800 font-semibold flex items-center gap-1.5 px-1">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{isEn ? 'Live Inventory • Prompt Warranty (<5km On-site)' : 'Sẵn Hàng Thực Tế • Bảo Hành Nhanh Tận Nơi <5km'}</span>
              </div>
            </div>
          </div>

          {/* 1. MÁY TÍNH ĐỒNG BỘ & LAPTOP DOANH NGHIỆP */}
          {(homeProductTab === 'all' || homeProductTab === 'hardware') && (
            <div className="space-y-4 mb-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#6E5D53]">
                  {isEn ? 'FEATURED COMPUTERS READY FOR DELIVERY' : 'MÁY TÍNH & LAPTOP TIÊU BIỂU SẴN SÀNG BÀN GIAO'}
                </h3>
                <span className="text-[11px] font-semibold text-slate-500">
                  {isEn ? '3 featured models' : '3 mẫu tiêu biểu'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((prod) => (
              <div
                key={prod.id}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Image & Badges */}
                <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
                  <Image
                    src={prod.img}
                    alt={prod.name}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[85%]">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-700 text-white text-[11px] font-bold tracking-tight shadow-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                      <span>{t.products.inStockBadge || 'SẴN KHO'}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#2B1810]/90 backdrop-blur-xs text-white text-[10px] font-semibold">
                      {prod.badge}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-xs text-white font-mono text-[11px] font-bold border border-white/20">
                      {prod.serviceTag}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-[#C0392B] transition-colors">
                      {prod.name}
                    </h3>
                    <div className="text-2xl font-black text-[#C0392B] font-mono tracking-tight mt-1">
                      {formatVND(prod.price)}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                      {prod.desc}
                    </p>

                    {/* Specs Grid */}
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate font-mono">{prod.specs.cpu}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate font-mono">{prod.specs.ram}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate font-mono">{prod.specs.storage}</span>
                      </div>
                      <div className="flex items-center gap-2 pt-0.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate font-medium text-emerald-800">{prod.specs.highlight}</span>
                      </div>
                    </div>

                    {/* Gift badge */}
                    {prod.specs.gift && (
                      <div className="mt-3.5 p-2 rounded-lg bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-1.5">
                        <Gift className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{prod.specs.gift}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions: Thông tin thiết bị & Đặt Mua Máy */}
                  <div className="pt-3 flex items-center gap-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedProduct(prod)}
                      className="flex-1 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <ScanLine className="w-3.5 h-3.5 text-slate-500" />
                      <span>{t.products.btnInspect}</span>
                    </button>
                    <Link
                      href={`/mua-hang?device=${encodeURIComponent(prod.name)}&price=${prod.price}&tag=${encodeURIComponent(prod.serviceTag)}`}
                      className="flex-1 py-2.5 rounded-lg bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-xs text-center transition-colors shadow-2xs flex items-center justify-center gap-1"
                    >
                      <span>{t.products.btnOrder}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

          {/* 2. PHẦN MỀM & KEY BẢN QUYỀN WINDOWS / OFFICE */}
          {(homeProductTab === 'all' || homeProductTab === 'software') && (
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#C0392B]"></div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
                    {isEn ? 'GENUINE DIGITAL LICENSE KEYS (LIFETIME ON MOTHERBOARD)' : 'KEY BẢN QUYỀN SỐ CHÍNH HÃNG (VĨNH VIỄN THEO MAINBOARD)'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBuyKeyModalOpen(true)}
                  className="text-xs font-bold text-[#C0392B] hover:underline uppercase"
                >
                  {isEn ? 'All License Keys →' : 'Xem toàn bộ kho key →'}
                </button>
              </div>

              {availableSoftwareCategories.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-white border border-[#E8E2D9] text-xs text-[#6E5D53]">
                  {isEn ? 'License keys are temporarily being replenished.' : 'Các phiên bản key bản quyền đang được cập nhật thêm vào kho.'}
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
                            {cat.type === 'office' ? 'ỨNG DỤNG VĂN PHÒNG' : 'HỆ ĐIỀU HÀNH'}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Còn {cat.availableStock} key</span>
                          </span>
                        </div>

                        <div>
                          <h4 className="text-base font-black text-[#2B1810] group-hover:text-[#C0392B] transition-colors uppercase">
                            {cat.name}
                          </h4>
                          <div className="text-2xl font-black text-[#C0392B] font-mono tracking-tight mt-1">
                            {formatVND(cat.price)}
                          </div>
                          <p className="text-xs text-[#6E5D53] mt-2 leading-relaxed">
                            {cat.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-[#6E5D53]">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Kích hoạt vĩnh viễn theo máy, không hết hạn</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Cập nhật Windows / Office Update chính hãng</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Hỗ trợ cài đặt từ xa qua UltraViewer / AnyDesk</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-5 mt-4 border-t border-slate-100 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedKeyType(cat.type === 'office' ? 'office' : 'windows');
                            setIsBuyKeyModalOpen(true);
                          }}
                          className="flex-1 py-2.5 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-xs transition-colors shadow-2xs text-center uppercase tracking-wider"
                        >
                          MUA KEY NGAY
                        </button>
                        <a
                          href={`https://zalo.me/${systemSettings.zaloNumber || '0909053058'}?text=${encodeURIComponent('Chào Vi Tính An Tâm, tôi cần tư vấn key bản quyền: ' + cat.name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 px-3.5 rounded-xl border border-[#E8E2D9] hover:bg-slate-50 text-[#2B1810] font-semibold text-xs transition-colors"
                        >
                          Zalo
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}


          {/* YÊU CẦU 1: Nút CTA đủ nổi bật để chuyển sang trang sản phẩm */}
          <div className="mt-12 pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/danh-muc-san-pham"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-sm sm:text-base tracking-wide shadow-lg shadow-[#C0392B]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 group text-center"
            >
              <span>{isEn ? `View All ${allProducts.length} Computers in Stock` : `Xem Toàn Bộ Kho Máy Tính Có Sẵn (${totalReadyStock} máy)`}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </Link>
            <Link
              href="/danh-muc-san-pham?tab=sold"
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold text-sm transition-all shadow-2xs flex items-center justify-center gap-2 text-center"
            >
              <span>{isEn ? 'View Actual Delivery Records' : 'Xem Hồ Sơ Bàn Giao Thực Tế'}</span>
            </Link>
          </div>
        </section>

        {/* 3. DỊCH VỤ KỸ THUẬT & PHÒNG LAB ĐO KIỂM PHẦN CỨNG (Có hình ảnh thực tế) */}
        <section className="bg-[#FAF7F2] border-y border-[#E8E2D9] py-16 scroll-mt-20" id="dich-vu-spa">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Split Feature: Hardware Testing Lab Image & Technical Standards */}
            <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-sm p-6 sm:p-10 mb-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Tech Lab Image */}
                <div className="lg:col-span-6 relative aspect-16/10 rounded-xl overflow-hidden shadow-md border border-slate-200 group">
                  <Image
                    src="/images/tech-service-lab.jpg"
                    alt="Phòng Kỹ Thuật Kiểm Định Phần Cứng Vi Tính An Tâm"
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
                      {isEn ? 'Sonic cleaning • Arctic MX-4 paste • FurMark / AIDA64 load testing' : 'Vệ sinh siêu âm • Keo tản nhiệt Arctic MX-4 • Stress test FurMark / AIDA64'}
                    </p>
                  </div>
                </div>

                {/* Technical Description */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="inline-flex items-center px-3 py-1 rounded-md bg-[#FBE8DE] text-[#C0392B] border border-[#F2C4B2] text-xs font-bold uppercase tracking-wider">
                    {t.services.tag}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#2B1810] tracking-tight">
                    {t.services.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#6E5D53] leading-relaxed">
                    {isEn
                      ? 'Every device serviced or delivered undergoes thermal and clock testing under realistic workloads with open hardware tracking. Zero component swapping, zero hidden fees.'
                      : 'Do máy thuộc dòng tuyển chọn cao cấp nguyên bản, kỹ thuật viên không can thiệp hay kiểm tra chi tiết trên bo mạch chủ (mainboard) để giữ nguyên trạng zin của máy. Toàn bộ quy trình kiểm định chất lượng được kiểm tra thực tế 100% qua các phần mềm đo kiểm chuyên dụng (stress test full-load nhiệt độ, xung nhịp vi xử lý, sức khỏe ổ cứng).'}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E8E2D9]">
                      <div className="text-xs font-bold text-[#2B1810]">{isEn ? 'Premium Thermal Compound' : 'Keo Tản Nhiệt Cao Cấp'}</div>
                      <div className="text-[11px] text-[#6E5D53] mt-0.5">{isEn ? 'Authentic Arctic MX-4 paste, drops heat by 5 - 12°C.' : 'Sử dụng Arctic MX-4 chính hãng, giảm nhiệt 5 - 12°C.'}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E8E2D9]">
                      <div className="text-xs font-bold text-[#2B1810]">{isEn ? 'Digital OEM License' : 'Bản Quyền Số OEM'}</div>
                      <div className="text-[11px] text-[#6E5D53] mt-0.5">{isEn ? 'Clean Windows tied to motherboard, safe for accounting.' : 'Windows sạch vĩnh viễn theo mainboard, an toàn cho kế toán.'}</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* 3 Service Packages Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {/* Gói 1 */}
              <div className="p-6 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs flex flex-col justify-between hover:border-[#C0392B] transition-all group">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-[#FAF7F2] text-[#C0392B] flex items-center justify-center font-black text-sm border border-[#E8E2D9]">
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
                    <div className="text-lg font-bold text-[#C0392B]">{t.services.pkg1Price}</div>
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
              <div className="p-6 rounded-2xl bg-[#FFFDF9] border-2 border-[#C0392B] shadow-md flex flex-col justify-between transition-all group relative">
                <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-md bg-[#C0392B] text-white font-bold text-[10px] tracking-wide shadow-xs">
                  {t.services.pkg2Badge}
                </div>
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-[#FBE8DE] text-[#C0392B] flex items-center justify-center font-black text-sm border border-[#F2C4B2]">
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
                    <div className="text-lg font-bold text-[#C0392B]">{t.services.pkg2Price}</div>
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
              <div className="p-6 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs flex flex-col justify-between hover:border-[#C0392B] transition-all group">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-[#FAF7F2] text-[#C0392B] flex items-center justify-center font-black text-sm border border-[#E8E2D9]">
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
                    <div className="text-lg font-bold text-[#C0392B]">{t.services.pkg3Price}</div>
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

            {/* Emergency dispatch banner CTA */}
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

        {/* 4. QUY TRÌNH KIỂM ĐỊNH QC 4 BƯỚC */}
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
            <div className="p-6 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs hover:border-[#C0392B] transition-all">
              <div className="text-4xl font-black text-[#E8E2D9] leading-none mb-3">01</div>
              <h3 className="text-sm font-bold text-[#2B1810] uppercase">{t.qcProcess.s1Title}</h3>
              <p className="text-xs text-[#6E5D53] mt-2 leading-relaxed">
                {t.qcProcess.s1Desc}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs hover:border-[#C0392B] transition-all">
              <div className="text-4xl font-black text-[#E8E2D9] leading-none mb-3">02</div>
              <h3 className="text-sm font-bold text-[#2B1810] uppercase">{t.qcProcess.s2Title}</h3>
              <p className="text-xs text-[#6E5D53] mt-2 leading-relaxed">
                {t.qcProcess.s2Desc}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs hover:border-[#C0392B] transition-all">
              <div className="text-4xl font-black text-[#E8E2D9] leading-none mb-3">03</div>
              <h3 className="text-sm font-bold text-[#2B1810] uppercase">{t.qcProcess.s3Title}</h3>
              <p className="text-xs text-[#6E5D53] mt-2 leading-relaxed">
                {t.qcProcess.s3Desc}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs hover:border-[#C0392B] transition-all">
              <div className="text-4xl font-black text-[#E8E2D9] leading-none mb-3">04</div>
              <h3 className="text-sm font-bold text-[#2B1810] uppercase">{t.qcProcess.s4Title}</h3>
              <p className="text-xs text-[#6E5D53] mt-2 leading-relaxed">
                {t.qcProcess.s4Desc}
              </p>
            </div>
          </div>
        </section>

        {/* 5. FAQ DẠNG COLLAPSED ACCORDION */}
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
                    <div id={`faq-answer-${idx}`} role="region" aria-labelledby={`faq-question-${idx}`} className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#6E5D53] leading-relaxed border-t border-[#E8E2D9] bg-[#FFFDF9]">
                      <p>{item.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* YÊU CẦU 2: FLOATING ACTION BUTTONS HÌNH TRÒN (ROUNDED-FULL) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
        {/* 1. Kiểm tra bảo hành theo S/N — Hình tròn */}
        <Link
          href="/tra-cuu-bao-hanh"
          className="pointer-events-auto w-12 h-12 rounded-full bg-white hover:bg-[#FAF7F2] text-[#C0392B] border-2 border-[#C0392B] shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 group relative"
          title={t.floating.warrantyTooltip}
          aria-label={t.floating.warrantyTooltip}
        >
          <ShieldCheck className="w-5 h-5 text-[#C0392B]" strokeWidth={1.5} />
          <span className="opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 absolute right-14 px-3 py-1.5 rounded-lg bg-[#2B1810] text-white text-xs font-semibold whitespace-nowrap shadow-xl flex items-center gap-1.5">
            <span>{t.floating.warrantyTooltip}</span>
          </span>
        </Link>

        {/* 2. Gọi điện Hotline 0909.053.058 — Hình tròn */}
        <a
          href={`tel:${(systemSettings.hotline || '0909053058').replace(/\./g, '')}`}
          className="pointer-events-auto w-12 h-12 rounded-full bg-[#D9531E] hover:bg-[#C0392B] text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 group relative"
          title={`Hotline: ${systemSettings.hotline || '0909.053.058'}`}
          aria-label={`Gọi hotline ${systemSettings.hotline || '0909.053.058'}`}
        >
          <PhoneCall className="w-5 h-5" strokeWidth={1.5} />
          <span className="opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 absolute right-14 px-3 py-1.5 rounded-lg bg-[#2B1810] text-white text-xs font-semibold whitespace-nowrap shadow-xl flex items-center gap-1.5">
            <span className="text-[#E8A87C] font-bold">Hotline:</span>
            <span>{systemSettings.hotline || '0909.053.058'} (24/7)</span>
          </span>
        </a>

        {/* 3. Nhắn Zalo Kỹ Thuật — Mở danh sách 3 số Zalo */}
        <div className="relative pointer-events-auto">
          <button
            type="button"
            onClick={() => setIsZaloModalOpen(!isZaloModalOpen)}
            className="w-12 h-12 rounded-full bg-[#0068FF] hover:bg-[#0054d1] text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 group relative cursor-pointer"
            title="Nhắn Zalo: Chọn kỹ thuật viên trực ca"
            aria-label="Mở danh sách 3 số Zalo kỹ thuật"
          >
            <MessageSquare className="w-5 h-5" strokeWidth={1.5} />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#C0392B] text-white text-[10px] font-mono font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs">
              3
            </span>
            <span className="opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 absolute right-14 px-3 py-1.5 rounded-lg bg-[#2B1810] text-white text-xs font-semibold whitespace-nowrap shadow-xl flex items-center gap-1.5">
              <span className="font-bold text-sky-300">Zalo:</span>
              <span>{isEn ? '3 Tech Hotlines' : '3 Số Zalo Kỹ Thuật'}</span>
            </span>
          </button>

          {/* Popover danh sách 3 số Zalo trực ca */}
          {isZaloModalOpen && (
            <div className="absolute right-0 bottom-14 w-72 sm:w-80 rounded-2xl bg-white border border-[#E8E2D9] shadow-2xl p-4 z-50 animate-fade-in font-sans">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#0068FF] text-white flex items-center justify-center text-xs font-black">
                    Z
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#2B1810] uppercase tracking-wide">
                      CHỌN KỸ THUẬT VIÊN ZALO
                    </h4>
                    <p className="text-[10px] text-[#6E5D53]">
                      Kết nối nhanh • Phục vụ trực tiếp
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsZaloModalOpen(false)}
                  className="w-6 h-6 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="py-2.5 space-y-2">
                {(systemSettings.zaloContacts || [
                  { id: 'zalo-1', name: 'Kỹ Thuật 1', phone: '123456', role: 'Tư vấn bán hàng & cấu hình máy' },
                  { id: 'zalo-2', name: 'Kỹ Thuật 2', phone: '345678', role: 'Hỗ trợ phần cứng & bảo hành' },
                  { id: 'zalo-3', name: 'Kỹ Thuật 3', phone: '678910', role: 'Cứu hộ khẩn cấp & key bản quyền' },
                ]).map((contact, idx) => {
                  const cleanPhone = (contact.phone || '').replace(/\D/g, '');
                  return (
                    <a
                      key={contact.id || idx}
                      href={`https://zalo.me/${cleanPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl border border-slate-100 hover:border-[#0068FF] bg-[#FAF7F2]/60 hover:bg-blue-50/40 transition-all flex items-center justify-between gap-2.5 group/item"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#2B1810] group-hover/item:text-[#0068FF] transition-colors">
                            {contact.name || `Kỹ Thuật ${idx + 1}`}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-white text-[#0068FF] border border-blue-200">
                            {contact.phone}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6E5D53] line-clamp-1">
                          {contact.role || 'Hỗ trợ kỹ thuật'}
                        </p>
                      </div>

                      <div className="px-2.5 py-1 rounded-lg bg-[#0068FF] text-white text-[11px] font-bold shrink-0 shadow-2xs group-hover/item:bg-[#0054d1] transition-colors">
                        Nhắn tin
                      </div>
                    </a>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-[#6E5D53]">
                <span>Tất cả số đều được Admin xác thực</span>
                <span className="font-semibold text-emerald-700">● Đang trực tuyến</span>
              </div>
            </div>
          )}
        </div>

        {/* 4. Widget Nút WhatsApp — Hình tròn */}
        <a
          href={systemSettings.whatsappLink || 'https://wa.me/84909053058'}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 group relative"
          title="WhatsApp: Tư vấn máy & hỗ trợ kỹ thuật"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.97.531 1.939.814 2.796.814 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.767-5.768-5.767zm7.551 5.766c0 4.164-3.388 7.551-7.551 7.551-1.31 0-2.573-.342-3.682-.992l-4.349 1.141 1.161-4.241c-.72-1.156-1.101-2.493-1.101-3.859 0-4.164 3.388-7.551 7.551-7.551s7.551 3.387 7.551 7.551zm-5.834 2.052c-.179.497-.886.917-1.258.97-.373.053-.836.082-2.392-.562-1.865-.772-3.064-2.673-3.158-2.798-.093-.125-.762-1.015-.762-1.936 0-.92.483-1.372.655-1.558.172-.186.376-.232.502-.232.125 0 .252.002.361.008.115.006.269-.044.421.32.158.379.542 1.322.589 1.418.047.096.079.208.016.333-.063.125-.094.204-.188.314-.094.11-.198.246-.282.33-.094.094-.192.197-.082.386.11.189.489.808 1.05 1.308.723.644 1.332.844 1.521.938.189.094.3-.079.41-.205.11-.126.471-.548.597-.736.126-.188.252-.157.422-.094.17.063 1.082.51 1.27.604.188.094.314.141.36.22.046.078.046.452-.133.949z" />
          </svg>
          <span className="opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 absolute right-14 px-3 py-1.5 rounded-lg bg-[#2B1810] text-white text-xs font-semibold whitespace-nowrap shadow-xl flex items-center gap-1.5">
            <span className="font-bold text-emerald-400">WhatsApp:</span>
            <span>{isEn ? 'Direct WhatsApp Chat' : 'Chat WhatsApp tư vấn máy'}</span>
          </span>
        </a>

        {/* 5. Scroll to Top — Hình tròn */}
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="pointer-events-auto w-10 h-10 rounded-full bg-white hover:bg-[#FAF7F2] text-[#6E5D53] hover:text-[#2B1810] border border-[#E8E2D9] shadow-md hover:shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 group relative"
          title={t.floating.backToTop}
          aria-label={t.floating.backToTop}
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

            {/* Warehouse Status Meta */}
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

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href={`/mua-hang?device=${encodeURIComponent(selectedProduct.name)}&price=${selectedProduct.price}&tag=${encodeURIComponent(selectedProduct.serviceTag)}`}
                onClick={() => setSelectedProduct(null)}
                className="flex-1 py-3 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-xs sm:text-sm text-center transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <span>{t.products.btnOrder || 'Đặt Mua Máy'}</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </Link>
              <a
                href={`${systemSettings.zaloLink || 'https://zalo.me/0909053058'}?text=${encodeURIComponent(isEn ? `Hello An Tam, I would like photos and details for ${selectedProduct.name} (S/N: ${selectedProduct.serviceTag})` : `Chào An Tâm, tôi quan tâm máy ${selectedProduct.name} (S/N: ${selectedProduct.serviceTag})`)}`}
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

      {/* MODAL MUA KEY BẢN QUYỀN WINDOWS & OFFICE */}
      <Modal
        open={isBuyKeyModalOpen}
        onCancel={() => setIsBuyKeyModalOpen(false)}
        footer={null}
        width={720}
        centered
        className="custom-ant-modal"
      >
        <div className="p-2 sm:p-5 space-y-5 font-sans bg-[#FFFDF9]">
          {/* Header */}
          <div className="border-b border-[#E8E2D9] pb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C0392B]">
              BẢN QUYỀN CHÍNH HÃNG 100% • BẢO HÀNH TRỌN ĐỜI
            </span>
            <h2 className="text-lg sm:text-xl font-black text-[#2B1810] tracking-tight mt-0.5 uppercase">
              MUA KEY BẢN QUYỀN WINDOWS &amp; OFFICE
            </h2>
            <p className="text-xs text-[#6E5D53] mt-1">
              Bản quyền vĩnh viễn, bảo hành kích hoạt 1 đổi 1 và hỗ trợ cài đặt từ xa qua UltraViewer hoặc AnyDesk.
            </p>
          </div>

          {/* Chọn loại: Windows vs Office */}
          <div>
            <label className="block text-xs font-black text-[#2B1810] mb-2 uppercase">
              BƯỚC 1: CHỌN LOẠI BẢN QUYỀN CẦN MUA
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedKeyType('windows')}
                className={`py-3.5 px-4 rounded-xl border-2 text-left transition-all ${
                  selectedKeyType === 'windows'
                    ? 'border-[#C0392B] bg-[#C0392B]/5 text-[#C0392B]'
                    : 'border-[#E8E2D9] bg-white text-[#6E5D53] hover:border-[#2B1810]'
                }`}
              >
                <div className="text-xs sm:text-sm font-black uppercase">
                  HỆ ĐIỀU HÀNH WINDOWS
                </div>
                <div className="text-[11px] text-[#6E5D53] mt-0.5">
                  Windows 11 Pro, Home, Windows 10...
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedKeyType('office')}
                className={`py-3.5 px-4 rounded-xl border-2 text-left transition-all ${
                  selectedKeyType === 'office'
                    ? 'border-[#C0392B] bg-[#C0392B]/5 text-[#C0392B]'
                    : 'border-[#E8E2D9] bg-white text-[#6E5D53] hover:border-[#2B1810]'
                }`}
              >
                <div className="text-xs sm:text-sm font-black uppercase">
                  ỨNG DỤNG VĂN PHÒNG OFFICE
                </div>
                <div className="text-[11px] text-[#6E5D53] mt-0.5">
                  Office 2021 Pro Plus, 2019, 365...
                </div>
              </button>
            </div>
          </div>

          {/* Danh sách các phiên bản kết nối database - nếu = 0 thì không hiển thị */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-black text-[#2B1810] uppercase">
                BƯỚC 2: CHỌN PHIÊN BẢN PHÙ HỢP (DỮ LIỆU KHO THỰC TẾ)
              </label>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Kết nối thời gian thực
              </span>
            </div>

            {inStockKeyCategories.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-[#FAF7F2] border border-[#E8E2D9] text-xs text-[#6E5D53] space-y-1">
                <div className="font-bold text-[#2B1810]">Hiện tại phiên bản này đang tạm hết key sẵn có trong kho.</div>
                <div>Quý khách vui lòng liên hệ trực tiếp với nhân viên để được hỗ trợ nhập thêm key nhanh chóng.</div>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {inStockKeyCategories.map((cat) => {
                  const stock = (licenseKeys || []).filter(
                    (k) => k.category_id === cat.id && k.status === 'available'
                  ).length;

                  return (
                    <div
                      key={cat.id}
                      className="p-4 rounded-xl border border-[#E8E2D9] bg-white hover:border-[#C0392B] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="space-y-1 max-w-sm">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs sm:text-sm font-black text-[#2B1810] uppercase">
                            {cat.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 font-mono">
                            Còn {stock} key sẵn sàng
                          </span>
                        </div>
                        <p className="text-xs text-[#6E5D53]">
                          {cat.description}
                        </p>
                      </div>

                      <a
                        href={`https://zalo.me/${systemSettings.zaloNumber || '0909053058'}?text=${encodeURIComponent('Chào Vi Tính An Tâm, tôi quan tâm mua key bản quyền: ' + cat.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-4 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white text-xs font-bold transition-all text-center shrink-0 shadow-xs uppercase tracking-wider"
                      >
                        LIÊN HỆ NHÂN VIÊN ĐỂ NHẬN GIÁ TỐT NHẤT
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Danh sách 3 chuyên viên tư vấn trực tiếp */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 uppercase">
              <span>ĐỘI NGŨ KỸ THUẬT &amp; TƯ VẤN SẴN SÀNG HỖ TRỢ TRỰC TIẾP:</span>
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Online Zalo 24/7
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(systemSettings.zaloContacts && systemSettings.zaloContacts.length > 0
                ? systemSettings.zaloContacts
                : [
                    { id: '1', name: 'Kỹ Thuật 1', phone: '123456', role: 'Tư vấn bán hàng' },
                    { id: '2', name: 'Kỹ Thuật 2', phone: '345678', role: 'Hỗ trợ phần cứng' },
                    { id: '3', name: 'Kỹ Thuật 3', phone: '678910', role: 'Cứu hộ & key bản quyền' },
                  ]
              ).map((contact) => (
                <a
                  key={contact.id}
                  href={`https://zalo.me/${contact.phone}?text=${encodeURIComponent('Chào ' + contact.name + ' - Vi Tính An Tâm, tôi muốn mua key bản quyền')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg bg-white border border-slate-200 hover:border-[#C0392B] hover:bg-slate-50 transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900 group-hover:text-[#C0392B]">
                      {contact.name}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 font-semibold">
                      Zalo: {contact.phone}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                    Nhắn tin →
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-3 border-t border-[#E8E2D9] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#6E5D53]">
            <span>
              Hotline tư vấn kỹ thuật &amp; giá sỉ: <strong className="text-[#2B1810] font-mono">{systemSettings.hotline}</strong>
            </span>
            <span className="font-bold text-[#C0392B]">
              VI TÍNH AN TÂM - BÁN BẰNG TÂM ĐỂ BẠN AN TÂM
            </span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
