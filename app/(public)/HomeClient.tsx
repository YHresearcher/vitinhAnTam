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

// Components
import HeroSection from './_components/HeroSection';
import ProductTabsSection from './_components/ProductTabsSection';
import ServicesSection from './_components/ServicesSection';
import QCProcessSection from './_components/QCProcessSection';
import ReviewsSection from './_components/ReviewsSection';
import FAQSection from './_components/FAQSection';
import QCModal from './_components/QCModal';

export default function HomePage() {
  const router = useRouter();
  const { currentLang, inventory, systemSettings, keyCategories, licenseKeys, faqs, reviews, spareParts } = useViTinhAnTamStore();
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
  const inStockProducts = useMemo(() => allProducts.filter((p) => !p.isSold), [allProducts]);

  // YÊU CẦU 1: Trang chủ chỉ lấy đúng 3 sản phẩm nổi bật đang sẵn kho
  const featuredProducts = useMemo(() => inStockProducts.slice(0, 3), [inStockProducts]);

  // 3 sản phẩm RAM & SSD ngẫu nhiên / sẵn kho từ kho linh kiện (spareParts)
  const featuredComponents = useMemo(() => {
    const list = (spareParts || []).filter((p) => {
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

    if (list.length === 0) return [];

    // Chọn phong phú cả SSD và RAM, lấy đúng 3 sản phẩm
    const ssds = list.filter((p) => (p.part_type || '').toUpperCase() === 'SSD' || (p.part_name || '').toUpperCase().includes('SSD'));
    const rams = list.filter((p) => (p.part_type || '').toUpperCase() === 'RAM' || (p.part_name || '').toUpperCase().includes('RAM'));

    const picked: typeof list = [];
    if (ssds.length > 0) picked.push(ssds[0]);
    if (rams.length > 0) picked.push(rams[0]);
    if (ssds.length > 1 && picked.length < 3) picked.push(ssds[1]);
    if (rams.length > 1 && picked.length < 3) picked.push(rams[1]);

    for (const item of list) {
      if (picked.length >= 3) break;
      if (!picked.some((x) => x.id === item.id)) {
        picked.push(item);
      }
    }
    return picked.slice(0, 3);
  }, [spareParts]);

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

  // Software products available in stock
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
    if (isEn && ENGLISH_FAQS) return ENGLISH_FAQS;
    if (faqs && faqs.length > 0) {
      return faqs.map((f) => ({ question: f.question, answer: f.answer }));
    }
    return [
      {
        question: 'Máy tính tại Vi Tính An Tâm được kiểm tra và tuyển chọn như thế nào?',
        answer:
          'Toàn bộ máy tính tại Vi Tính An Tâm cam kết bo mạch nguyên bản 100%, chưa từng qua sửa chữa. Trước khi giao, kỹ thuật viên kiểm tra toàn diện bằng phần mềm test tải chuyên dụng (FurMark, AIDA64, CrystalDiskInfo) để đảm bảo máy vận hành êm mát, ổn định và bền bỉ.',
      },
      {
        question: 'Chính sách bảo hành và hỗ trợ kỹ thuật tại An Tâm hoạt động như thế nào?',
        answer:
          'An Tâm áp dụng chính sách bảo hành chu đáo, đổi mới linh kiện nhanh chóng. Cửa hàng hỗ trợ xử lý kỹ thuật tận nơi hoặc hỗ trợ trực tiếp từ xa qua UltraViewer / AnyDesk để công việc của bạn luôn được thông suốt.',
      },
    ];
  }, [isEn, faqs]);

  // Danh sách đánh giá khách hàng (Được khôi phục và tối ưu hóa)
  const displayReviews = useMemo(() => {
    if (isEn && ENGLISH_REVIEWS && ENGLISH_REVIEWS.length > 0) return ENGLISH_REVIEWS;
    if (reviews && reviews.length > 0) return reviews;
    return [];
  }, [isEn, reviews]);

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
        <HeroSection
          onSearchSubmit={handleSearchSubmit}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          isEn={isEn}
          t={t}
        />

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
                  {featuredComponents.length}
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
                  {availableSoftwareCategories.length}
                </span>
              </button>
            </div>
          </div>

          {/* Product Tabs Section */}
          <ProductTabsSection
            isEn={isEn}
            t={t}
          />

          {/* 3. DỊCH VỤ KỸ THUẬT & PHÒNG LAB ĐO KIỂM PHẦN CỨNG (Có hình ảnh thực tế) */}
          <ServicesSection
            isEn={isEn}
            t={t}
          />

          {/* 4. QUY TRÌNH KIỂM ĐỊNH QC 4 BƯỚC */}
          <QCProcessSection
            isEn={isEn}
            t={t}
          />

          {/* 5. BẰNG CHỨNG XÃ HỘI & ĐÁNH GIÁ KHÁCH HÀNG (SOCIAL PROOF & REVIEWS) */}
          {displayReviews.length > 0 && (
            <ReviewsSection
              isEn={isEn}
              t={t}
            />
          )}

          {/* 6. FAQ DẠNG COLLAPSED ACCORDION */}
          <FAQSection
            isEn={isEn}
            t={t}
          />
        </section>

        {/* QC & S/N INSPECTION MODAL */}
        <QCModal
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
          isEn={isEn}
          t={t}
          systemSettings={systemSettings}
        />
      </main>
    </div>
  );
}