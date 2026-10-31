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
  Search,
  Sparkles,
  Zap,
  Star,
  Clock,
  Monitor,
} from 'lucide-react';
import { useViTinhAnTamStore } from '@/lib/store';
import { formatVND } from '@/lib/supabase';
import {
  TRANSLATIONS,
  ENGLISH_FAQS,
  ENGLISH_REVIEWS,
} from '@/lib/translations';
import { getShowcaseProducts, ShowcaseItem } from '@/lib/productsData';

export default function HomePage() {
  const router = useRouter();
  const { currentLang, inventory, systemSettings, keyCategories, licenseKeys, faqs, reviews, spareParts, isLoading } = useViTinhAnTamStore();
  const isEn = currentLang === 'en';
  const t = TRANSLATIONS[currentLang || 'vi'];

  // Search state for quick warranty lookup
  const [searchInput, setSearchInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Modal for QC & S/N inspection
  const [selectedProduct, setSelectedProduct] = useState<ShowcaseItem | null>(null);
  const [homeProductTab, setHomeProductTab] = useState<'all' | 'hardware' | 'components' | 'software'>('all');

  // Handle smooth scroll on initial anchor load or hash change
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#', '');
      const element = document.getElementById(hash);
      if (element) {
        const timer = setTimeout(() => {
          const headerOffset = 75;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });
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
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      window.history.pushState(null, '', `/#${targetId}`);
    }
  };

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

  // Lấy dữ liệu sản phẩm (Memoized để tăng tốc độ phản hồi UI)
  const allProducts = useMemo(() => getShowcaseProducts(isEn, inventory), [isEn, inventory]);
  // Ẩn các model máy có số lượng tồn kho = 0 khỏi danh sách, và gom 1 đại diện duy nhất cho mỗi dòng máy
  const inStockProducts = useMemo(() => {
    const list = allProducts.filter((p) => {
      if (p.isSold) return false;
      const count = typeof p.modelStockCount === 'number' ? p.modelStockCount : p.stockCount;
      return count > 0;
    });

    const seenModels = new Set<string>();
    const uniqueList: typeof list = [];
    for (const p of list) {
      const key = (p.modelName || p.name || '').trim().toLowerCase();
      if (!seenModels.has(key)) {
        seenModels.add(key);
        uniqueList.push(p);
      }
    }
    return uniqueList;
  }, [allProducts]);
  
  // QUY TẮC HIỂN THỊ KHO MÁY: sắp xếp mới nhất trước (theo ngày nhập kho);
  // mục "Tất cả" chỉ hiện 3 máy mới nhất, tab "Máy tính & Laptop" (xem
  // toàn bộ kho) hiện toàn bộ.
  const sortedInStockProducts = useMemo(
    () =>
      [...inStockProducts].sort((a, b) => (b.addedAt || '').localeCompare(a.addedAt || '')),
    [inStockProducts]
  );
  const featuredProducts = useMemo(() => sortedInStockProducts.slice(0, 3), [sortedInStockProducts]);
  const displayedProducts = homeProductTab === 'hardware' ? sortedInStockProducts : featuredProducts;

  // QUY TẮC HIỂN THỊ LINH KIỆN: toàn bộ RAM & SSD còn hàng, mới nhất
  // trước (theo created_at nếu dữ liệu có); mục "Tất cả" chỉ hiện 3
  // linh kiện mới nhất, tab "Linh kiện" hiện toàn bộ.
  const allComponents = useMemo(() => {
    const list = (spareParts || []).filter((p) => {
      const stock = Number(p.quantity_in_stock) || 0;
      if (stock <= 0) return false;
      const type = (p.part_type || '').toUpperCase();
      const name = (p.part_name || '').toUpperCase();
      return (
        type === 'RAM' ||
        type === 'SSD' ||
        name.includes('RAM') ||
        name.includes('SSD') ||
        name.includes('NVME')
      );
    });
    return [...list].sort((a, b) =>
      ((b as { created_at?: string }).created_at || '').localeCompare(
        (a as { created_at?: string }).created_at || ''
      )
    );
  }, [spareParts]);
  const featuredComponents = useMemo(() => allComponents.slice(0, 3), [allComponents]);
  const displayedComponents = homeProductTab === 'components' ? allComponents : featuredComponents;

  const getPartImage = (part: { part_type?: string; part_name?: string }) => {
    const type = (part.part_type || '').toUpperCase();
    const name = (part.part_name || '').toUpperCase();
    if (type === 'SSD' || name.includes('SSD') || name.includes('NVME')) {
      return 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=80';
    }
    if (type === 'RAM' || name.includes('RAM') || name.includes('DDR')) {
      return 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=600&auto=format&fit=crop&q=80';
    }
    return 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80';
  };
  
  // Catalog key công khai (chỉ số lượng + giá theo phân loại, không có mã
  // key) cho khách vãng lai — dữ liệu key đầy đủ chỉ nhân viên mới có.
  const [publicKeyCatalog, setPublicKeyCatalog] = useState<
    Array<{ id: string; name: string; type: string; description: string; availableStock: number; price: number }>
  >([]);
  useEffect(() => {
    let cancelled = false;
    fetch('/api/keys/public-catalog')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json?.success && Array.isArray(json.categories)) {
          setPublicKeyCatalog(json.categories);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  // Software products available in stock
  const availableSoftwareCategories = useMemo(() => {
    const fromStore = (keyCategories || [])
      .map((cat) => {
        const keys = (licenseKeys || []).filter(
          (k) => k.category_id === cat.id && k.status === 'available'
        );
        return {
          ...cat,
          availableStock: keys.length,
          // Giá hiển thị: mặc định phân loại > 0, else giá bán đầu tiên > 0,
          // else giá của key đầu tiên (có thể 0 → giao diện hiện "Liên hệ").
          price:
            typeof cat.default_unit_price === 'number' && cat.default_unit_price > 0
              ? cat.default_unit_price
              : (keys.find((k) => (k.unit_price || 0) > 0)?.unit_price ??
                keys[0]?.unit_price ??
                0),
        };
      })
      .filter((cat) => cat.availableStock > 0);
    if (fromStore.length > 0) return fromStore;
    // Khách vãng lai: dùng catalog công khai tổng hợp
    return publicKeyCatalog.map((cat) => ({
      id: cat.id,
      name: cat.name,
      type: cat.type as 'windows' | 'office' | 'others',
      description: cat.description,
      is_default: false,
      availableStock: cat.availableStock,
      price: cat.price,
    }));
  }, [keyCategories, licenseKeys, publicKeyCatalog]);

  // QUY TẮC HIỂN THỊ KEY Ở TRANG CHỦ: mục "Tất cả" chỉ hiện 3 phân loại
  // nổi bật — Windows 11 Pro, Office 2021, Microsoft 365 — theo đúng thứ
  // tự này; tab "Phần mềm & Key" (xem toàn bộ) hiện mọi phân loại còn hàng.
  const featuredSoftwareCategories = useMemo(() => {
    const patterns = ['WINDOWS 11 PRO', 'OFFICE 2021', '365'];
    return patterns
      .map((p) => availableSoftwareCategories.find((c) => c.name.toUpperCase().includes(p)))
      .filter((c): c is (typeof availableSoftwareCategories)[number] => Boolean(c));
  }, [availableSoftwareCategories]);
  const displayedSoftwareCategories =
    homeProductTab === 'software' ? availableSoftwareCategories : featuredSoftwareCategories;
  // Tổng số key đang sẵn sàng — dùng cho chip trạng thái kho ở hero
  const totalAvailableKeys = useMemo(
    () => availableSoftwareCategories.reduce((sum, c) => sum + (c.availableStock || 0), 0),
    [availableSoftwareCategories]
  );

  const totalReadyStock = useMemo(
    () => inStockProducts.reduce((acc, curr) => acc + curr.stockCount, 0),
    [inStockProducts]
  );

  const activeFaqs = useMemo(() => {
    if (isEn && ENGLISH_FAQS) return ENGLISH_FAQS;
    if (faqs && faqs.length > 0) {
      return faqs.map((f) => ({ question: f.question, answer: f.answer }));
    }
    return [];
  }, [isEn, faqs]);

  // Danh sách đánh giá khách hàng (Được khôi phục và tối ưu hóa)
  const displayReviews = useMemo(() => {
    if (isEn && ENGLISH_REVIEWS && ENGLISH_REVIEWS.length > 0) return ENGLISH_REVIEWS;
    if (reviews && reviews.length > 0) return reviews;
    return [];
  }, [isEn, reviews]);

  const zaloMessage = encodeURIComponent(
    isEn
      ? `Hello An Tam, I would like photos and details for ${selectedProduct?.name || ''}`
      : `Chào An Tâm, tôi quan tâm máy ${selectedProduct?.name || ''}, vui lòng gửi thêm hình ảnh thực tế`
  );

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

            {/* Trạng thái kho trực tiếp (thay chip brandTag cũ bị trùng tên
                thương hiệu với header): số máy + số key đang có sẵn thật */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-6 pb-5 border-b border-slate-200/60 text-xs">
              <div className="flex items-center gap-2">
                {isLoading ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-500 text-[10px] font-extrabold uppercase tracking-wider border border-slate-200 animate-pulse">
                    {isEn ? 'Loading stock…' : 'Đang tải kho…'}
                  </span>
                ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-200">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  {isEn
                    ? `In stock now: ${totalReadyStock} computers • ${totalAvailableKeys} license keys`
                    : `Có sẵn tại kho: ${totalReadyStock} máy • ${totalAvailableKeys} key bản quyền`}
                </span>
                )}
              </div>
              <span className="hidden sm:block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {isEn ? 'On-site rescue & support' : 'Cứu hộ & hỗ trợ tận nơi'}
              </span>
            </div>

            {/* Main Hero: 2-column with content left & image showcase right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 py-10 lg:py-16 items-center">

              {/* Left Column: Headlines & Actions */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                {/* Tag bự: bảo hành là lý do mạnh nhất để khách dám mua máy cũ */}
                <span className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-lg bg-[#C0392B] text-white text-base sm:text-lg font-black uppercase tracking-wide shadow-md">
                  <ShieldCheck className="w-5 h-5" />
                  {t.hero.warrantyTag || (isEn ? '6-MONTH WARRANTY' : 'BẢO HÀNH 6 THÁNG')}
                </span>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#1A0F0A] tracking-tight leading-[1.12]">
                  {t.hero.mainTitle}
                </h1>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl font-normal">
                  {t.hero.description}
                </p>

                {/* Main CTA buttons - Tối ưu phần chọn lựa theo Hick's Law */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href="#san-pham"
                    onClick={(e) => scrollToSection(e, 'san-pham')}
                    className="px-7 py-3.5 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 group cursor-pointer"
                  >
                    <span>{t.hero.btnBrowseStock || (isEn ? 'Browse Inventory' : 'Xem Máy Nổi Bật')}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <Link
                    href="/dat-lich"
                    className="px-6 py-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm transition-all shadow-2xs hover:-translate-y-0.5"
                  >
                    {t.hero.btnScheduleService || (isEn ? 'Book Service' : 'Đặt Lịch Kỹ Thuật')}
                  </Link>
                </div>

                {/* Quick warranty search box */}
                <div className="pt-2">
                  <div className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isEn ? 'Check warranty & service history by Phone Number / Warranty Code:' : 'Tra cứu bảo hành & lịch sử sửa chữa theo Số Điện Thoại / Mã Bảo Hành:'}</span>
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
                        placeholder={t.hero.quickSearchPlaceholder || (isEn ? 'Enter phone number or warranty code...' : 'Nhập Số Điện Thoại hoặc Mã Phiếu Bảo Hành...')}
                        aria-label="Nhập Số Điện Thoại hoặc Mã Bảo Hành"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#C0392B] focus:border-transparent font-medium shadow-2xs"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all flex items-center gap-1 shadow-2xs shrink-0"
                    >
                      <span>{t.hero.quickSearchBtn || (isEn ? 'Lookup' : 'Tra Cứu')}</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column: Hero Showroom Image (Clean & Modern) */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200/90 aspect-16/11 group bg-slate-100">
                  <Image
                    src="/images/hero-showroom.jpg"
                    alt="Showroom Vi Tính An Tâm - Máy Tính Doanh Nghiệp Tuyển Chọn"
                    fill
                    priority
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                  />
                </div>

                {/* Sub-card trust badges underneath image */}
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{isEn ? 'Operating System' : 'Hệ thống'}</div>
                    <div className="text-xs font-bold text-slate-900 mt-0.5">{isEn ? 'Genuine Windows OEM' : 'Windows Bản Quyền Số'}</div>
                    <div className="text-[11px] text-slate-500">{isEn ? 'Lifetime motherboard entitlement' : 'Vĩnh viễn theo bo mạch chủ'}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{isEn ? 'Technical Support' : 'Hỗ trợ kỹ thuật'}</div>
                    <div className="text-xs font-bold text-slate-900 mt-0.5">{isEn ? 'Rapid On-Site Response' : 'Ứng Phó Nhanh'}</div>
                    <div className="text-[11px] text-slate-500">{isEn ? 'On-site dispatch & remote diagnostics' : 'Tận nơi hoặc qua UltraViewer'}</div>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom 2 Stats Strip */}
            <div className="border-t border-slate-200/80 py-6 grid grid-cols-2 divide-x divide-slate-200/80">
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

        {/* 2. DANH MỤC SẢN PHẨM TRANG CHỦ — Card Grid Layout */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20" id="san-pham">
          <span id="danh-muc-san-pham" className="sr-only" />
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-2xl sm:text-4xl font-black text-[#1A0F0A] tracking-tight">
                {t.products.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-2xl">
                {isEn
                  ? 'Showcasing featured enterprise computers in stock. Tested with deep hardware stress-tests and covered by attentive warranty.'
                  : 'Danh mục máy tính và laptop tuyển chọn có sẵn tại cửa hàng. Kiểm định thực tế bằng phần mềm chuyên dụng, bảo hành chu đáo.'}
              </p>
            </div>
          </div>

          {/* Category Filter Tabs: Tất Cả, Máy Tính & Laptop, Linh Kiện, Phần Mềm & Key */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 p-3 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9]">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setHomeProductTab(homeProductTab === 'hardware' ? 'all' : 'hardware')}
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
                onClick={() => setHomeProductTab(homeProductTab === 'components' ? 'all' : 'components')}
                className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  homeProductTab === 'components'
                    ? 'bg-[#2B1810] text-white shadow-xs'
                    : 'bg-white border border-[#E8E2D9] text-[#6E5D53] hover:border-[#2B1810]'
                }`}
              >
                <span>{isEn ? 'Components (RAM / SSD)' : 'LINH KIỆN (RAM / SSD)'}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-mono">
                  {isLoading ? '…' : allComponents.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setHomeProductTab(homeProductTab === 'software' ? 'all' : 'software')}
                className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  homeProductTab === 'software'
                    ? 'bg-[#C0392B] text-white shadow-xs'
                    : 'bg-white border border-[#E8E2D9] text-[#C0392B] hover:border-[#C0392B]'
                }`}
              >
                <span>{isEn ? 'Software & License Keys' : 'PHẦN MỀM & KEY BẢN QUYỀN'}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-mono">
                  {isLoading ? '…' : availableSoftwareCategories.length}
                </span>
              </button>
            </div>
          </div>

          {/* 1. MÁY TÍNH ĐỒNG BỘ & LAPTOP DOANH NGHIỆP */}
          {/* 1. MÁY TÍNH ĐỒNG BỘ & LAPTOP DOANH NGHIỆP */}
          {(homeProductTab === 'all' || homeProductTab === 'hardware') && (
            <div className="space-y-6 mb-10">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-hidden="true">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
                      <div className="aspect-16/10 bg-slate-200" />
                      <div className="p-5 space-y-3">
                        <div className="h-4 bg-slate-200 rounded w-3/4" />
                        <div className="h-3 bg-slate-200 rounded w-1/2" />
                        <div className="h-3 bg-slate-200 rounded w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : displayedProducts.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-2xl bg-white border border-dashed border-slate-200">
                  <Monitor className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-600">
                    {isEn ? 'Hardware inventory is currently being updated.' : 'Kho máy tính đang được cập nhật thiết bị mới từ hệ thống.'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {isEn ? 'Please contact our hotline or Zalo for instant consultation.' : 'Quý khách vui lòng liên hệ Hotline/Zalo để được tư vấn cấu hình phù hợp.'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedProducts.map((prod) => (
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
                          <div className="absolute top-3 left-3 flex items-center">
                            <span className="px-2.5 py-1 rounded-md bg-emerald-700 text-white text-[11px] font-bold tracking-tight shadow-xs flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                              <span>
                                {isEn
                                  ? `${typeof prod.modelStockCount === 'number' ? prod.modelStockCount : prod.stockCount} in stock`
                                  : `Sẵn kho ${typeof prod.modelStockCount === 'number' ? prod.modelStockCount : prod.stockCount} máy`}
                              </span>
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
                              <div className="flex items-center gap-2">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="truncate font-medium text-slate-600">{prod.warrantyType === 'manufacturer' ? (isEn ? 'Manufacturer warranty' : 'Bảo hành theo nhà sản xuất') : (isEn ? `${prod.warrantyMonths ?? 6}-month warranty` : `Bảo hành ${prod.warrantyMonths ?? 6} tháng`)}</span>
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
                              href={`/mua-hang?device=${encodeURIComponent(prod.name)}&price=${prod.price}&tag=${encodeURIComponent(prod.serviceTag || '')}`}
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
                  {homeProductTab === 'all' && sortedInStockProducts.length > 3 && (
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setHomeProductTab('hardware')}
                        className="px-5 py-2.5 rounded-xl bg-white border border-[#E8E2D9] hover:border-[#C0392B] text-[#C0392B] font-bold text-xs uppercase tracking-wider transition-all"
                      >
                        {isEn
                          ? `View all ${sortedInStockProducts.length} computers in stock →`
                          : `Xem toàn bộ kho máy (${sortedInStockProducts.length} sản phẩm) →`}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* 1.5. LINH KIỆN NÂNG CẤP (RAM, SSD CHÍNH HÃNG TRONG KHO HÀNG) */}
          {(homeProductTab === 'all' || homeProductTab === 'components') && (
            <div className="space-y-6 mb-10 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#C0392B]"></div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
                    {isEn ? 'GENUINE UPGRADE COMPONENTS (RAM, HIGH-SPEED SSD)' : 'LINH KIỆN NÂNG CẤP CHÍNH HÃNG (RAM, SSD CHUYÊN DỤNG)'}
                  </h3>
                </div>
                <Link
                  href="/danh-muc-san-pham?tab=components"
                  className="text-xs font-bold text-[#C0392B] hover:underline uppercase cursor-pointer flex items-center gap-1"
                >
                  <span>{isEn ? 'All components →' : 'Xem toàn bộ linh kiện →'}</span>
                </Link>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-hidden="true">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
                      <div className="aspect-16/10 bg-slate-200" />
                      <div className="p-5 space-y-3">
                        <div className="h-4 bg-slate-200 rounded w-3/4" />
                        <div className="h-3 bg-slate-200 rounded w-1/2" />
                        <div className="h-3 bg-slate-200 rounded w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : displayedComponents.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-white border border-[#E8E2D9] text-xs text-[#6E5D53]">
                  {isEn ? 'Components are currently being replenished.' : 'Kho linh kiện RAM & SSD đang được cập nhật thêm.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedComponents.map((part) => (
                    <div
                      key={part.id}
                      className="group bg-white rounded-2xl border border-slate-200 hover:border-[#C0392B] shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden"
                    >
                      {/* Image & Badges */}
                      <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
                        <Image
                          src={getPartImage(part)}
                          alt={part.part_name}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[85%]">
                          <span className="px-2.5 py-1 rounded-md bg-emerald-700 text-white text-[11px] font-bold tracking-tight shadow-xs flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                            <span>{isEn ? `IN STOCK (${part.quantity_in_stock})` : `SẴN KHO (${part.quantity_in_stock})`}</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-[#2B1810]/90 backdrop-blur-xs text-white text-[10px] font-semibold">
                            {part.warranty_months ? `BH ${part.warranty_months}T` : 'CHÍNH HÃNG'}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#FBE8DE] text-[#C0392B]">
                              {part.part_type || 'LINH KIỆN'}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">
                              {part.condition === 'new' ? 'Mới 100% Chính Hãng' : 'Zin bóc máy'}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-slate-900 line-clamp-2 group-hover:text-[#C0392B] transition-colors leading-snug">
                            {part.part_name}
                          </h3>
                          <div className="text-2xl font-black text-[#C0392B] font-mono tracking-tight mt-1.5">
                            {formatVND(part.unit_price)}
                          </div>
                          {part.notes && (
                            <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                              {part.notes}
                            </p>
                          )}

                          {/* Quick spec info */}
                          <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{isEn ? 'Warranty:' : 'Bảo hành:'} <strong>{part.warranty_type === 'manufacturer' ? 'Theo nhà sản xuất' : (part.warranty_months ? `${part.warranty_months} tháng (1 đổi 1)` : 'Chính hãng')}</strong></span>
                            </div>
                            {part.distributor && (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">{isEn ? 'Distributor:' : 'Phân phối:'} {part.distributor}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-3 flex items-center gap-2 border-t border-slate-100">
                          <Link
                            href={`https://zalo.me/${systemSettings.zaloNumber || '0909053058'}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                            <span>{isEn ? 'Consult' : 'Tư vấn'}</span>
                          </Link>
                          <Link
                            href={`/mua-hang?device=${encodeURIComponent(part.part_name)}&price=${part.unit_price}&tag=${encodeURIComponent(part.id)}`}
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
              )}
            </div>
          )}

          {/* Nút Xem Toàn Bộ Kho Hàng */}
          <div className="pt-2 pb-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/danh-muc-san-pham"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-sm sm:text-base tracking-wide shadow-lg shadow-[#C0392B]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 group text-center cursor-pointer"
            >
              <span>
                {isEn ? 'View Entire Inventory' : 'Xem toàn bộ kho hàng'}
              </span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </a>
          </div>

          {/* 2. PHẦN MỀM & KEY BẢN QUYỀN WINDOWS / OFFICE */}
          {(homeProductTab === 'all' || homeProductTab === 'software') && (
            <div className="space-y-4 mb-8 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#C0392B]"></div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
                    {isEn ? 'GENUINE DIGITAL LICENSE KEYS (WINDOWS & OFFICE)' : 'KEY BẢN QUYỀN SỐ CHÍNH HÃNG (WINDOWS & OFFICE)'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setHomeProductTab('software')}
                  className="text-xs font-bold text-[#C0392B] hover:underline uppercase cursor-pointer"
                >
                  {isEn ? 'All License Keys →' : 'Xem toàn bộ kho key →'}
                </button>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-hidden="true">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
                      <div className="aspect-16/10 bg-slate-200" />
                      <div className="p-5 space-y-3">
                        <div className="h-4 bg-slate-200 rounded w-3/4" />
                        <div className="h-3 bg-slate-200 rounded w-1/2" />
                        <div className="h-3 bg-slate-200 rounded w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : displayedSoftwareCategories.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-white border border-[#E8E2D9] text-xs text-[#6E5D53]">
                  {isEn ? 'License keys are temporarily being replenished.' : 'Các phiên bản key bản quyền đang được cập nhật thêm vào kho.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedSoftwareCategories.map((cat) => (
                    <div
                      key={cat.id}
                      className="group bg-white rounded-2xl border border-[#E8E2D9] hover:border-[#C0392B] shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden p-6"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#FBE8DE] text-[#C0392B]">
                            {cat.type === 'office' ? (isEn ? 'OFFICE SUITE' : 'ỨNG DỤNG VĂN PHÒNG') : (isEn ? 'OPERATING SYSTEM' : 'HỆ ĐIỀU HÀNH')}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>{isEn ? `${cat.availableStock} licenses available` : `Còn ${cat.availableStock} key`}</span>
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
                            <span>
                              {cat.name.toUpperCase().includes('365')
                                ? // Microsoft 365 là THUÊ BAO 12 tháng — không được ghi
                                  // "vĩnh viễn" dù type trong DB đang là 'office'
                                  isEn
                                  ? '12-month subscription plan with 1TB OneDrive included'
                                  : 'Gói thuê bao 12 tháng, kèm 1TB OneDrive'
                                : cat.type === 'windows'
                                  ? isEn
                                    ? 'Lifetime digital license bound to the motherboard'
                                    : 'Bản quyền số vĩnh viễn theo mainboard'
                                  : cat.type === 'office'
                                    ? isEn
                                      ? 'Perpetual license, one-time online activation — no recurring fees'
                                      : 'Bản quyền vĩnh viễn, kích hoạt online 1 lần — không phí gia hạn định kỳ'
                                    : isEn
                                      ? 'Genuine license with 1-to-1 replacement warranty'
                                      : 'Bản quyền chính hãng, bảo hành 1 đổi 1'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{isEn ? 'Official Microsoft security updates & genuine patches' : 'Cập nhật Windows / Office Update chính hãng'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{isEn ? 'Remote activation & installation support included' : 'Hỗ trợ cài đặt từ xa qua UltraViewer / AnyDesk'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-5 mt-4 border-t border-slate-100 flex items-center gap-2">
                        <Link
                          href={`/mua-hang?device=${encodeURIComponent(cat.name)}&price=${cat.price}&tag=${encodeURIComponent(cat.type || 'KEY')}`}
                          className="flex-1 py-2.5 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-xs transition-colors shadow-2xs text-center uppercase tracking-wider block"
                        >
                          {isEn ? 'BUY LICENSE DIRECTLY' : 'MUA KEY TRỰC TIẾP'}
                        </Link>
                        <a
                          href={`https://zalo.me/${systemSettings.zaloNumber || '0909053058'}?text=${encodeURIComponent(isEn ? `Hello Vi Tinh An Tam, I need consultation on license: ${cat.name}` : `Chào Vi Tính An Tâm, tôi cần tư vấn key bản quyền: ${cat.name}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 px-3.5 rounded-xl border border-[#E8E2D9] hover:bg-slate-50 text-[#2B1810] font-semibold text-xs transition-colors"
                        >
                          {isEn ? 'Chat Zalo' : 'Zalo'}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* 3. DỊCH VỤ KỸ THUẬT & PHÒNG LAB ĐO KIỂM PHẦN CỨNG (Có hình ảnh thực tế) */}
        <section className="bg-[#FAF7F2] border-y border-[#E8E2D9] py-16 scroll-mt-20" id="dich-vu-spa">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-flex items-center px-3 py-1 rounded-md bg-[#FBE8DE] text-[#C0392B] border border-[#F2C4B2] text-xs font-bold uppercase tracking-wider">
                {t.services.tag}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#2B1810] tracking-tight mt-4">
                {t.services.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#6E5D53] leading-relaxed mt-3">
                {t.services.subtitle}
              </p>
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white border border-[#E8E2D9] text-[11px] font-bold text-[#2B1810] mt-4">
                {t.services.commitmentBadge}
              </div>
            </div>

            {/* 3 Service Packages Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {/* Gói 1 */}
              <div className="p-6 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs flex flex-col justify-between hover:border-[#C0392B] transition-all group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-10 h-10 rounded-lg bg-[#FAF7F2] text-[#C0392B] flex items-center justify-center font-black text-sm border border-[#E8E2D9]">
                      01
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-[11px] font-semibold border border-slate-200">
                      <Clock className="w-3 h-3 text-[#C0392B]" />
                      <span>{t.services.pkg1Time || '⏱️ Xử lý 30 - 45 phút • Xem trực tiếp'}</span>
                    </div>
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
                    href="/danh-muc-san-pham"
                    className="w-full py-2.5 rounded-lg bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-xs tracking-wide transition-all text-center block shadow-xs"
                  >
                    {t.services.btnPkg1 || t.services.btnBookPkg}
                  </Link>
                </div>
              </div>

              {/* Gói 2 - Nổi Bật */}
              <div className="p-6 rounded-2xl bg-[#FFFDF9] border-2 border-[#C0392B] shadow-md flex flex-col justify-between transition-all group relative">
                <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-md bg-[#C0392B] text-white font-bold text-[10px] tracking-wide shadow-xs">
                  {t.services.pkg2Badge}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-10 h-10 rounded-lg bg-[#FBE8DE] text-[#C0392B] flex items-center justify-center font-black text-sm border border-[#F2C4B2]">
                      02
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 text-[11px] font-semibold border border-amber-200">
                      <Clock className="w-3 h-3 text-[#C0392B]" />
                      <span>{t.services.pkg2Time || '⏱️ Xử lý 45 - 60 phút • Lấy liền trong ngày'}</span>
                    </div>
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
                    {t.services.btnPkg2 || t.services.btnBookPkg}
                  </Link>
                </div>
              </div>

              {/* Gói 3 */}
              <div className="p-6 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs flex flex-col justify-between hover:border-[#C0392B] transition-all group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-10 h-10 rounded-lg bg-[#FAF7F2] text-[#C0392B] flex items-center justify-center font-black text-sm border border-[#E8E2D9]">
                      03
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-[11px] font-semibold border border-slate-200">
                      <Clock className="w-3 h-3 text-[#C0392B]" />
                      <span>{t.services.pkg3Time || '⏱️ Xử lý 20 - 40 phút • Bảo toàn dữ liệu'}</span>
                    </div>
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
                    href="https://zalo.me/0909053058"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-lg bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-xs tracking-wide transition-all text-center block shadow-xs"
                  >
                    {t.services.btnPkg3 || t.services.btnBookPkg}
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

        {/* 5. BẰNG CHỨNG XÃ HỘI & ĐÁNH GIÁ KHÁCH HÀNG (SOCIAL PROOF & REVIEWS) */}
        {displayReviews.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20 border-t border-[#E8E2D9]" id="danh-gia">
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold shadow-2xs">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{isEn ? 'Satisfied Corporate & Private Clients' : 'Khách Hàng Doanh Nghiệp & Cá Nhân Đã Đánh Giá'}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-[#2B1810] tracking-tight">
                {t.reviews.title || (isEn ? 'CLIENT TESTIMONIALS & FEEDBACK' : 'NHẬN XÉT CỦA KHÁCH HÀNG')}
              </h2>
              <p className="text-xs sm:text-sm text-[#6E5D53]">
                {t.reviews.ratingText || (isEn ? 'From corporate & private clients' : 'Từ khách hàng doanh nghiệp & cá nhân')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayReviews.slice(0, 6).map((rev, idx) => (
                <div
                  key={rev.id || idx}
                  className="p-6 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs hover:border-[#C0392B] hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Star Rating & Verified Badge */}
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

                    {/* Comment Quote */}
                    <p className="text-xs sm:text-sm text-[#2B1810] italic leading-relaxed pt-1">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </div>

                  {/* Author Info */}
                  <div className="pt-4 border-t border-[#E8E2D9] mt-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-[#2B1810] group-hover:text-[#C0392B] transition-colors">
                        {rev.name}
                      </div>
                      <div className="text-[11px] text-[#6E5D53]">{rev.role}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{rev.location}</div>
                    </div>
                    {rev.service && (
                      <div className="text-right shrink-0">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-[#FAF7F2] border border-[#E8E2D9] text-[10px] font-bold text-[#6E5D53]">
                          {rev.service}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. FAQ DẠNG COLLAPSED ACCORDION */}
        {activeFaqs.length > 0 && (
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
        )}
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
                  <span>{t.qcModal.badge}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">{selectedProduct.name}</h3>
                <div className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                  <span className="text-slate-500">{t.qcModal.serviceTag || (isEn ? 'QC Status:' : 'Trạng thái kiểm định:')}</span>
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                    {isEn ? '100% Factory Standard Passed' : '100% Đạt Chuẩn Xuất Xưởng'}
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
                  {t.qcModal.inWarehouseCount} {typeof selectedProduct.modelStockCount === 'number' ? selectedProduct.modelStockCount : selectedProduct.stockCount} {t.qcModal.inWarehouseSuffix}
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
                href={`/mua-hang?device=${encodeURIComponent(selectedProduct.name)}&price=${selectedProduct.price}&tag=${encodeURIComponent(selectedProduct.serviceTag || '')}`}
                onClick={() => setSelectedProduct(null)}
                className="flex-1 py-3 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-xs sm:text-sm text-center transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <span>{t.products.btnOrder || 'Đặt Mua Máy'}</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </Link>
              <a
                href={`${systemSettings.zaloLink || 'https://zalo.me/0909053058'}?text=${zaloMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-5 rounded-xl bg-[#0068FF] hover:bg-[#0054d1] text-white font-bold text-xs sm:text-sm text-center transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
                <span>{t.qcModal.btnZaloPhotos || (isEn ? 'Chat Zalo For Real Photos' : 'Chat Zalo Xem Thêm Ảnh Thật')}</span>
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
