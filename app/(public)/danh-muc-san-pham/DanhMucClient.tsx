'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Modal } from 'antd';
import {
  Cpu,
  HardDrive,
  ShieldCheck,
  Zap,
  ArrowRight,
  MessageSquare,
  Gift,
  Check,
  ScanLine,
  Search,
  Home,
  ChevronRight,
  Monitor,
  Laptop,
  Boxes,
  Wrench,
  ShoppingBag,
} from 'lucide-react';
import { useViTinhAnTamStore } from '@/lib/store';
import { formatVND } from '@/lib/supabase';
import { TRANSLATIONS } from '@/lib/translations';
import { getShowcaseProducts, ShowcaseItem } from '@/lib/productsData';

function ProductsCatalogContent() {
  const searchParams = useSearchParams();
  const { currentLang, inventory, systemSettings, keyCategories, licenseKeys, spareParts } = useViTinhAnTamStore();
  const isEn = currentLang === 'en';
  const t = TRANSLATIONS[currentLang || 'vi'];

  // 3 Tab Danh Mục Chính: Máy tính để bàn | Laptop | Linh kiện
  const tabParamRaw = searchParams.get('tab');
  const initialMainTab =
    tabParamRaw === 'laptop'
      ? 'laptop'
      : tabParamRaw === 'components' || tabParamRaw === 'linh-kien'
      ? 'components'
      : 'desktop';
  const [mainTab, setMainTab] = useState<'desktop' | 'laptop' | 'components'>(initialMainTab);
  const [partSubFilter, setPartSubFilter] = useState<'all' | 'ssd' | 'ram' | 'others'>('all');

  // Status Tab & Modal mua key được SUY RA từ URL.
  // State chỉ đóng vai trò GHI DE khi người dùng bấm nút — nhờ vậy không cần
  // useEffect + setState (tránh cascading render và lỗi react-hooks/set-state-in-effect).
  const tabStatusParam = searchParams.get('status') === 'sold' || tabParamRaw === 'sold' ? 'sold' : 'in_stock';
  const [statusTabOverride, setStatusTabOverride] = useState<'in_stock' | 'sold' | null>(null);
  const statusTab = statusTabOverride ?? tabStatusParam;
  const setStatusTab = (tab: 'in_stock' | 'sold') => setStatusTabOverride(tab);

  // Search keyword inside catalog
  const [searchKeyword, setSearchKeyword] = useState('');

  // Selected product for QC inspection modal
  const [selectedProduct, setSelectedProduct] = useState<ShowcaseItem | null>(null);

  // Modal for Buying License Keys — mở theo ?action=buy_key / ?buy_key=true / ?type=
  const buyKeyFromUrl =
    searchParams.get('action') === 'buy_key' || searchParams.get('buy_key') === 'true';
  const [buyKeyOpenOverride, setBuyKeyOpenOverride] = useState<boolean | null>(null);
  const isBuyKeyModalOpen = buyKeyOpenOverride ?? buyKeyFromUrl;
  const setIsBuyKeyModalOpen = (open: boolean) => setBuyKeyOpenOverride(open);

  const keyTypeFromUrl =
    buyKeyFromUrl && searchParams.get('type') === 'office' ? 'office' : 'windows';
  const [keyTypeOverride, setKeyTypeOverride] = useState<'windows' | 'office' | null>(null);
  const selectedKeyType = keyTypeOverride ?? keyTypeFromUrl;
  const setSelectedKeyType = (type: 'windows' | 'office') => setKeyTypeOverride(type);

  const inStockKeyCategories = useMemo(() => {
    return (keyCategories || [])
      .filter((cat) => {
        if (selectedKeyType === 'windows') {
          return cat.type === 'windows' || cat.name.toLowerCase().includes('windows');
        } else {
          return cat.type === 'office' || cat.name.toLowerCase().includes('office');
        }
      })
      .filter((cat) => {
        const count = (licenseKeys || []).filter(
          (k) => k.category_id === cat.id && k.status === 'available'
        ).length;
        return count > 0;
      });
  }, [keyCategories, licenseKeys, selectedKeyType]);

  const totalInStockKeys = useMemo(() => {
    return (keyCategories || []).reduce((sum, cat) => {
      const count = (licenseKeys || []).filter(
        (k) => k.category_id === cat.id && k.status === 'available'
      ).length;
      return sum + count;
    }, 0);
  }, [keyCategories, licenseKeys]);

  const allProducts = useMemo(() => getShowcaseProducts(isEn, inventory), [isEn, inventory]);

  // Phân tách Máy tính để bàn và Laptop
  const desktopProducts = useMemo(() => {
    return allProducts.filter((p) => p.category !== 'laptop');
  }, [allProducts]);

  const laptopProducts = useMemo(() => {
    return allProducts.filter((p) => p.category === 'laptop');
  }, [allProducts]);

  // Danh mục máy tính theo tab hiện tại (desktop hoặc laptop)
  const currentCategoryProducts = useMemo(() => {
    return mainTab === 'laptop' ? laptopProducts : desktopProducts;
  }, [mainTab, laptopProducts, desktopProducts]);

  const inStockCurrentCategory = useMemo(() => {
    return currentCategoryProducts.filter(
      (p) => !p.isSold && (typeof p.modelStockCount === 'number' ? p.modelStockCount > 0 : p.stockCount > 0)
    );
  }, [currentCategoryProducts]);

  const soldCurrentCategory = useMemo(() => {
    return currentCategoryProducts.filter((p) => p.isSold);
  }, [currentCategoryProducts]);

  const filteredInStock = useMemo(() => {
    const q = searchKeyword.trim().toLowerCase();
    if (!q) return inStockCurrentCategory;
    return inStockCurrentCategory.filter((item) => {
      return (
        item.name.toLowerCase().includes(q) ||
        item.serviceTag.toLowerCase().includes(q) ||
        item.specs.cpu.toLowerCase().includes(q) ||
        (item.customerName && item.customerName.toLowerCase().includes(q))
      );
    });
  }, [inStockCurrentCategory, searchKeyword]);

  const filteredSold = useMemo(() => {
    const q = searchKeyword.trim().toLowerCase();
    const list = !q
      ? soldCurrentCategory
      : soldCurrentCategory.filter((item) => {
          return (
            item.name.toLowerCase().includes(q) ||
            item.serviceTag.toLowerCase().includes(q) ||
            item.specs.cpu.toLowerCase().includes(q)
          );
        });
    return list.slice(0, 5);
  }, [soldCurrentCategory, searchKeyword]);

  const totalReadyStock = useMemo(
    () => inStockCurrentCategory.reduce((sum, item) => sum + item.stockCount, 0),
    [inStockCurrentCategory]
  );

  const inStockDesktopsCount = useMemo(
    () =>
      desktopProducts
        .filter(
          (p) => !p.isSold && (typeof p.modelStockCount === 'number' ? p.modelStockCount > 0 : p.stockCount > 0)
        )
        .reduce((sum, item) => sum + item.stockCount, 0),
    [desktopProducts]
  );

  const inStockLaptopsCount = useMemo(
    () =>
      laptopProducts
        .filter(
          (p) => !p.isSold && (typeof p.modelStockCount === 'number' ? p.modelStockCount > 0 : p.stockCount > 0)
        )
        .reduce((sum, item) => sum + item.stockCount, 0),
    [laptopProducts]
  );

  // Danh sách linh kiện kho (spare_parts) - Ẩn các mã linh kiện có tồn kho = 0
  const filteredSpareParts = useMemo(() => {
    let list = (spareParts || []).filter((p) => (Number(p.quantity_in_stock) || 0) > 0);
    if (partSubFilter === 'ssd') {
      list = list.filter((p) => (p.part_type || '').toUpperCase() === 'SSD' || (p.part_name || '').toUpperCase().includes('SSD'));
    } else if (partSubFilter === 'ram') {
      list = list.filter((p) => (p.part_type || '').toUpperCase() === 'RAM' || (p.part_name || '').toUpperCase().includes('RAM'));
    } else if (partSubFilter === 'others') {
      list = list.filter((p) => {
        const t = (p.part_type || '').toUpperCase();
        return t !== 'SSD' && t !== 'RAM' && !p.part_name.toUpperCase().includes('SSD') && !p.part_name.toUpperCase().includes('RAM');
      });
    }

    const q = searchKeyword.trim().toLowerCase();
    if (!q) return list;
    return list.filter((p) => {
      return (
        p.part_name.toLowerCase().includes(q) ||
        (p.part_type || '').toLowerCase().includes(q) ||
        (p.distributor || '').toLowerCase().includes(q) ||
        (p.shelf_location || '').toLowerCase().includes(q) ||
        (p.notes || '').toLowerCase().includes(q)
      );
    });
  }, [spareParts, partSubFilter, searchKeyword]);

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

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-inter text-[#2B1810]">
      {/* 1. Header & Breadcrumb */}
      <div className="bg-white border-b border-[#E8E2D9] pt-8 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-[#6E5D53] mb-4">
            <Link href="/" className="hover:text-[#C0392B] flex items-center gap-1 transition-colors">
              <Home className="w-3.5 h-3.5" />
              <span>{t.navbar.home}</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-[#2B1810]">{isEn ? 'PRODUCTS' : 'SẢN PHẨM'}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-[#2B1810] tracking-tight uppercase">
                {isEn ? 'PRODUCTS' : 'SẢN PHẨM'}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 3 TAB DANH MỤC CHÍNH (Desktop, Laptop, Linh kiện) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="danh-muc-san-pham">
        {/* Hero Tabs Switcher */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {/* TAB 1: Máy tính để bàn */}
          <button
            type="button"
            onClick={() => {
              setMainTab('desktop');
              setStatusTab('in_stock');
            }}
            className={`p-4 sm:p-5 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer ${
              mainTab === 'desktop'
                ? 'bg-white border-[#C0392B] shadow-md ring-2 ring-[#C0392B]/10'
                : 'bg-white/80 hover:bg-white border-[#E8E2D9] text-[#6E5D53] hover:text-[#2B1810]'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className={`p-3 rounded-xl transition-colors ${mainTab === 'desktop' ? 'bg-[#C0392B] text-white shadow-xs' : 'bg-[#FAF7F2] text-[#6E5D53]'}`}>
                <Monitor className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className={`font-bold text-sm sm:text-base ${mainTab === 'desktop' ? 'text-[#C0392B]' : 'text-[#2B1810]'}`}>
                  {t.catalog?.desktopTitle || (isEn ? 'Desktop PCs & Workstations' : 'Máy tính để bàn')}
                </div>
                <div className="text-xs text-[#9C8E85]">
                  {t.catalog?.desktopSub || 'Mini PC • SFF • Văn phòng • Đồ họa'}
                </div>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
              mainTab === 'desktop' ? 'bg-[#C0392B]/10 text-[#C0392B]' : 'bg-slate-100 text-slate-600'
            }`}>
              {inStockDesktopsCount} {t.catalog?.unitsSuffix || (isEn ? 'units' : 'máy')}
            </span>
          </button>

          {/* TAB 2: Laptop */}
          <button
            type="button"
            onClick={() => {
              setMainTab('laptop');
              setStatusTab('in_stock');
            }}
            className={`p-4 sm:p-5 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer ${
              mainTab === 'laptop'
                ? 'bg-white border-[#C0392B] shadow-md ring-2 ring-[#C0392B]/10'
                : 'bg-white/80 hover:bg-white border-[#E8E2D9] text-[#6E5D53] hover:text-[#2B1810]'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className={`p-3 rounded-xl transition-colors ${mainTab === 'laptop' ? 'bg-[#C0392B] text-white shadow-xs' : 'bg-[#FAF7F2] text-[#6E5D53]'}`}>
                <Laptop className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className={`font-bold text-sm sm:text-base ${mainTab === 'laptop' ? 'text-[#C0392B]' : 'text-[#2B1810]'}`}>
                  {t.catalog?.laptopTitle || (isEn ? 'Business Laptops' : 'Laptop')}
                </div>
                <div className="text-xs text-[#9C8E85]">
                  {t.catalog?.laptopSub || 'Dell Latitude • ThinkPad • HP'}
                </div>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
              mainTab === 'laptop' ? 'bg-[#C0392B]/10 text-[#C0392B]' : 'bg-slate-100 text-slate-600'
            }`}>
              {inStockLaptopsCount} {t.catalog?.unitsSuffix || (isEn ? 'units' : 'máy')}
            </span>
          </button>

          {/* TAB 3: Linh kiện */}
          <button
            type="button"
            onClick={() => setMainTab('components')}
            className={`p-4 sm:p-5 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer ${
              mainTab === 'components'
                ? 'bg-white border-[#C0392B] shadow-md ring-2 ring-[#C0392B]/10'
                : 'bg-white/80 hover:bg-white border-[#E8E2D9] text-[#6E5D53] hover:text-[#2B1810]'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className={`p-3 rounded-xl transition-colors ${mainTab === 'components' ? 'bg-[#C0392B] text-white shadow-xs' : 'bg-[#FAF7F2] text-[#6E5D53]'}`}>
                <Boxes className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className={`font-bold text-sm sm:text-base ${mainTab === 'components' ? 'text-[#C0392B]' : 'text-[#2B1810]'}`}>
                  {t.catalog?.partsTitle || (isEn ? 'Certified Spare Parts & Storage' : 'Linh kiện')}
                </div>
                <div className="text-xs text-[#9C8E85]">
                  {t.catalog?.partsSub || 'RAM • SSD Kingston / Samsung • Phụ kiện'}
                </div>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
              mainTab === 'components' ? 'bg-[#C0392B]/10 text-[#C0392B]' : 'bg-slate-100 text-slate-600'
            }`}>
              {(spareParts || []).filter((p) => (Number(p.quantity_in_stock) || 0) > 0).length} {t.catalog?.itemsSuffix || (isEn ? 'items' : 'mã hàng')}
            </span>
          </button>
        </div>

        {/* 3. TOOLBAR ĐIỀU KHIỂN & TÌM KIẾM THEO TAB */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-2.5 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs">
            {/* SUB-TABS KHI XEM MÁY TÍNH (DESKTOP HOẶC LAPTOP) */}
            {mainTab !== 'components' ? (
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9]">
                <button
                  type="button"
                  onClick={() => setStatusTab('in_stock')}
                  className={`px-4 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                    statusTab === 'in_stock'
                      ? 'bg-[#C0392B] text-white shadow-xs'
                      : 'text-[#6E5D53] hover:text-[#2B1810]'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${statusTab === 'in_stock' ? 'bg-white' : 'bg-emerald-500'}`}></span>
                  <span>{t.products.tabInStock || (isEn ? 'In Stock' : 'Sẵn hàng')}</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                    statusTab === 'in_stock' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-800'
                  }`}>
                    {inStockCurrentCategory.length} {t.catalog?.linesPrefix || (isEn ? 'models' : 'dòng')} ({totalReadyStock} {t.catalog?.unitsSuffix || (isEn ? 'units' : 'máy')})
                  </span>
                </button>

                {/* Nút MUA KEY đưa xuống kế bên Sẵn hàng */}
                <button
                  type="button"
                  onClick={() => setIsBuyKeyModalOpen(true)}
                  className="px-3.5 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 bg-amber-50 hover:bg-[#C0392B] text-[#C0392B] hover:text-white border border-[#C0392B]/30 uppercase tracking-wide cursor-pointer active:scale-95 shadow-2xs"
                >
                  <span>{t.catalog?.buyKeyBtn || (isEn ? '🔑 BUY LICENSE' : '🔑 MUA KEY')}</span>
                  {totalInStockKeys > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#C0392B] text-white font-mono font-bold group-hover:bg-white group-hover:text-[#C0392B]">
                      {totalInStockKeys}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStatusTab('sold')}
                  className={`px-4 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                    statusTab === 'sold'
                      ? 'bg-[#2B1810] text-white shadow-xs'
                      : 'text-[#6E5D53] hover:text-[#2B1810]'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${statusTab === 'sold' ? 'bg-white' : 'bg-slate-400'}`}></span>
                  <span>{t.products.soldBadge || (isEn ? 'Delivered' : 'Đã bàn giao')}</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                    statusTab === 'sold' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {soldCurrentCategory.length} {t.catalog?.unitsSuffix || (isEn ? 'units' : 'máy')}
                  </span>
                </button>
              </div>
            ) : (
              /* SUB-TABS KHI XEM LINH KIỆN */
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9]">
                <button
                  type="button"
                  onClick={() => setPartSubFilter('all')}
                  className={`px-3.5 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                    partSubFilter === 'all'
                      ? 'bg-[#C0392B] text-white shadow-xs'
                      : 'text-[#6E5D53] hover:text-[#2B1810]'
                  }`}
                >
                  {t.catalog?.subPartsAll || (isEn ? 'All Parts' : 'Tất cả')} ({spareParts?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setPartSubFilter('ssd')}
                  className={`px-3.5 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                    partSubFilter === 'ssd'
                      ? 'bg-[#C0392B] text-white shadow-xs'
                      : 'text-[#6E5D53] hover:text-[#2B1810]'
                  }`}
                >
                  {t.catalog?.subPartsSsd || (isEn ? 'SSD Storage' : 'Ổ cứng SSD')}
                </button>
                <button
                  type="button"
                  onClick={() => setPartSubFilter('ram')}
                  className={`px-3.5 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                    partSubFilter === 'ram'
                      ? 'bg-[#C0392B] text-white shadow-xs'
                      : 'text-[#6E5D53] hover:text-[#2B1810]'
                  }`}
                >
                  {t.catalog?.subPartsRam || (isEn ? 'RAM Memory' : 'Bộ nhớ RAM')}
                </button>
                <button
                  type="button"
                  onClick={() => setPartSubFilter('others')}
                  className={`px-3.5 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                    partSubFilter === 'others'
                      ? 'bg-[#C0392B] text-white shadow-xs'
                      : 'text-[#6E5D53] hover:text-[#2B1810]'
                  }`}
                >
                  {t.catalog?.subPartsOthers || (isEn ? 'Others' : 'Khác / Nguồn')}
                </button>

                {/* Nút MUA KEY */}
                <button
                  type="button"
                  onClick={() => setIsBuyKeyModalOpen(true)}
                  className="px-3.5 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 bg-amber-50 hover:bg-[#C0392B] text-[#C0392B] hover:text-white border border-[#C0392B]/30 uppercase tracking-wide cursor-pointer active:scale-95 shadow-2xs ml-1"
                >
                  <span>{t.catalog?.buyKeyBtn || (isEn ? '🔑 BUY LICENSE' : '🔑 MUA KEY')}</span>
                </button>
              </div>
            )}

            {/* Keyword Search Input */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder={
                  mainTab === 'components'
                    ? (isEn ? 'Search part name, SSD, RAM...' : 'Tìm tên linh kiện, SSD, RAM, vị trí...')
                    : (isEn ? 'Search model, S/N, CPU...' : 'Tìm model, S/N, cấu hình...')
                }
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9] text-xs font-medium text-[#2B1810] placeholder:text-[#9C8E85] focus:outline-none focus:border-[#C0392B] focus:bg-white transition-all"
              />
              <Search className="w-4 h-4 text-[#9C8E85] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchKeyword && (
                <button
                  type="button"
                  onClick={() => setSearchKeyword('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9C8E85] hover:text-[#2B1810]"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 4. HIỂN THỊ NỘI DUNG THEO TAB CHÍNH */}
        {mainTab !== 'components' ? (
          <>
            {/* Phân Đoạn 1: SẴN HÀNG */}
            {statusTab === 'in_stock' && (
              <div className="space-y-6 mb-16">
                <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                    <h2 className="text-lg sm:text-xl font-bold text-[#2B1810]">
                      {mainTab === 'laptop' ? (isEn ? 'Laptops In Stock' : 'Laptop Sẵn Hàng') : (isEn ? 'Desktops In Stock' : 'Máy Tính Để Bàn Sẵn Hàng')}
                    </h2>
                    <span className="text-xs text-slate-500 font-medium">
                      ({filteredInStock.length} {isEn ? 'models' : 'dòng máy'} • {totalReadyStock} {isEn ? 'units available' : 'chiếc sẵn có'})
                    </span>
                  </div>
                </div>

                {filteredInStock.length === 0 ? (
                  <div className="py-12 px-6 text-center bg-white rounded-2xl border border-dashed border-[#E8E2D9] space-y-4">
                    <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-700 mx-auto flex items-center justify-center">
                      {mainTab === 'laptop' ? <Laptop className="w-8 h-8" /> : <Monitor className="w-8 h-8" />}
                    </div>
                    <div className="max-w-md mx-auto space-y-2">
                      <h3 className="text-base font-bold text-[#2B1810]">
                        {mainTab === 'laptop'
                          ? 'Đợt Laptop Mới Đang Được Kiểm Định & Chuẩn Bị Về Kho'
                          : t.products.emptyInStock}
                      </h3>
                      <p className="text-xs text-[#6E5D53] leading-relaxed">
                        {mainTab === 'laptop'
                          ? 'Các dòng Laptop văn phòng, doanh nhân chuẩn zin (Dell Latitude, ThinkPad, HP) thường hết hàng rất nhanh. Quý khách vui lòng liên hệ trực tiếp hoặc để lại yêu cầu cấu hình mong muốn để An Tâm giữ máy ngay khi xuất xưởng!'
                          : 'Hiện chưa có sản phẩm phù hợp với từ khóa tìm kiếm. Quý khách vui lòng thử lại từ khóa khác.'}
                      </p>
                    </div>
                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                      <a
                        href={systemSettings?.zaloLink || 'https://zalo.me/0969624564'}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Nhắn Zalo Nhận Tư Vấn Máy</span>
                      </a>
                      <Link
                        href={`/dat-lich?service=${encodeURIComponent(mainTab === 'laptop' ? 'Tư vấn đặt Laptop theo yêu cầu' : 'Tư vấn máy tính')}`}
                        className="px-4 py-2.5 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-xs transition-colors"
                      >
                        Đặt cấu hình theo yêu cầu
                      </Link>
                    </div>
                  </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInStock.map((prod) => (
                  <div
                    key={prod.id}
                    className="group bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden"
                  >
                    {/* Image */}
                    <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
                      <Image
                        src={prod.img}
                        alt={prod.name}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      {prod.badge && (
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[85%]">
                          <span className="px-2 py-0.5 rounded-md bg-[#2B1810]/90 backdrop-blur-xs text-white text-[10px] font-semibold">
                            {prod.badge}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-baseline justify-between gap-2 mb-1.5">
                          <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-[#C0392B] transition-colors">
                            {prod.name}
                          </h3>
                        </div>
                        {prod.salePrice && prod.salePrice > 0 ? (
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-xl font-black text-[#C0392B] font-mono tracking-tight">
                              {formatVND(prod.salePrice)}
                            </span>
                            <span className="text-xs font-semibold text-slate-400 line-through font-mono">
                              {formatVND(prod.originalPrice || prod.price)}
                            </span>
                            {prod.originalPrice && prod.originalPrice > prod.salePrice && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                -{Math.round((1 - prod.salePrice / prod.originalPrice) * 100)}%
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="text-xl font-black text-[#C0392B] font-mono tracking-tight">
                            {formatVND(prod.originalPrice || prod.price)}
                          </div>
                        )}
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
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
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate font-medium text-slate-600">{isEn ? `${prod.warrantyMonths ?? 6}-month full-system warranty` : `Bảo hành toàn máy ${prod.warrantyMonths ?? 6} tháng`}</span>
                          </div>
                        </div>

                        {/* Gift & Highlight */}
                        <div className="mt-3.5 p-2 rounded-lg bg-amber-50/70 border border-amber-100 text-[11px] text-amber-900 flex items-start gap-1.5">
                          <Gift className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span className="leading-snug">{prod.specs.gift}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-2 flex items-center gap-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setSelectedProduct(prod)}
                          className="flex-1 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
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
            )}
          </div>
        )}

        {/* 4. Phân Đoạn 2: ĐÃ BÁN */}
        {statusTab === 'sold' && (
          <div className="space-y-6 mb-16">
            <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                <h2 className="text-lg sm:text-xl font-bold text-[#2B1810]">
                  {isEn ? '5 Recent Sales' : '5 máy bán gần đây'}
                </h2>
                <span className="text-xs text-slate-500 font-medium">({filteredSold.length} {isEn ? 'records' : 'thiết bị'})</span>
              </div>
              <span className="text-xs text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full font-medium">
                {isEn ? 'Transparency warranty archives' : 'Minh bạch hồ sơ bàn giao & bảo hành'}
              </span>
            </div>

            {filteredSold.length === 0 ? (
              <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-[#E8E2D9] p-8">
                <p className="text-sm text-[#6E5D53]">{t.products.emptySold}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSold.map((prod) => (
                  <div
                    key={prod.id}
                    className="group bg-[#FAF7F2] rounded-2xl border border-slate-200 hover:border-slate-300 shadow-2xs transition-all duration-300 flex flex-col overflow-hidden"
                  >
                    {/* Image & Sold Tag */}
                    <div className="relative aspect-16/10 bg-slate-200 overflow-hidden">
                      <Image
                        src={prod.img}
                        alt={prod.name}
                        fill
                        unoptimized
                        className="object-cover grayscale-30 group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[85%]">
                        <span className="px-2.5 py-1 rounded-md bg-slate-900 text-white text-[11px] font-bold tracking-tight shadow-xs">
                          {isEn ? 'Sold' : 'Đã bán'}
                        </span>
                        {prod.badge && (
                          <span className="px-2 py-0.5 rounded-md bg-white/90 text-slate-800 text-[10px] font-semibold">
                            {prod.badge}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-baseline justify-between gap-2 mb-1.5">
                          <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                            {prod.name}
                          </h3>
                        </div>

                        {/* Handover Meta (ẩn thông tin khách hàng & giá bán) */}
                        <div className="mt-3 p-2.5 rounded-lg bg-white border border-slate-200 text-xs space-y-1">
                          <div className="text-slate-500 text-[11px] font-mono">
                            📅 {t.products.handoverDateLabel}: <strong className="text-slate-700">{prod.handoverDate}</strong>
                          </div>
                          <div className="text-emerald-700 text-[11px] font-medium pt-1 border-t border-slate-100 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{t.products.warrantyActiveLabel}</span>
                          </div>
                        </div>

                        {/* Specs Grid */}
                        <div className="mt-3 space-y-1 text-xs text-slate-600">
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
                        </div>
                      </div>

                      {/* Actions for Sold Item */}
                      <div className="pt-2 flex items-center gap-2 border-t border-slate-200">
                        <Link
                          href={`/dat-lich?device=${encodeURIComponent(prod.name)}&service=${encodeURIComponent(isEn ? 'Order Similar Configuration' : 'Đặt cấu hình tương tự')}`}
                          className="flex-1 py-2.5 rounded-lg bg-[#2B1810] hover:bg-black text-white font-bold text-xs text-center transition-colors shadow-2xs flex items-center justify-center gap-1"
                        >
                          <span>{t.products.btnOrderSimilar}</span>
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
    </>
  ) : (
    /* ==================== TAB LINH KIỆN (SPARE PARTS) ==================== */
    <div className="space-y-6 mb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E2D9] pb-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
          <h2 className="text-lg sm:text-xl font-bold text-[#2B1810]">
            {isEn ? 'Genuine Spare Parts & Upgrades' : 'Linh Kiện Máy Tính & Ổ Cứng SSD / RAM'}
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            ({filteredSpareParts.length} {isEn ? 'parts available' : 'sản phẩm sẵn có'})
          </span>
        </div>
        <div className="text-xs text-[#6E5D53] flex items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{t.catalog?.partsWarrantyBadge || (isEn ? '12 - 36 Month Genuine Warranty • Complimentary On-Site Installation & Diagnostics' : 'Bảo hành chính hãng 12 - 36 tháng • Miễn phí công lắp đặt & kiểm tra')}</span>
        </div>
      </div>

      {filteredSpareParts.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-[#E8E2D9] p-8 space-y-3">
          <Boxes className="w-12 h-12 text-slate-400 mx-auto" />
          <p className="text-sm text-[#6E5D53]">
            {searchKeyword
              ? (isEn ? `No spare parts found matching query "${searchKeyword}".` : `Không tìm thấy linh kiện phù hợp với từ khóa "${searchKeyword}".`)
              : (t.catalog?.partsEmptyMsg || 'Chưa có dữ liệu linh kiện trong danh mục này.')}
          </p>
          <div className="pt-2">
            <a
              href={systemSettings?.zaloLink || 'https://zalo.me/0969624564'}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t.catalog?.partsZaloInquire || (isEn ? 'Inquire via Zalo for Component Availability' : 'Nhắn Zalo Hỏi Mẫu Linh Kiện Bạn Cần')}</span>
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpareParts.map((part) => {
            const partImg = getPartImage(part);
            const isAvailable = (part.quantity_in_stock || 0) > 0;
            const partType = (part.part_type || 'LINH KIỆN').toUpperCase();

            return (
              <div
                key={part.id}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-[#C0392B]/40 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Image Preview */}
                <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
                  <Image
                    src={partImg}
                    alt={part.part_name}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[85%]">
                    <span className="px-2 py-0.5 rounded-md bg-[#2B1810]/90 backdrop-blur-xs text-white text-[10px] font-semibold">
                      {partType}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-600/90 text-white text-[10px] font-semibold">
                      {part.condition === 'new' ? (t.catalog?.partsConditionNew || 'MỚI 100%') : (t.catalog?.partsConditionPulled || 'ZIN BÓC MÁY 99%')}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-tight shadow-xs ${
                      isAvailable ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-white'
                    }`}>
                      {isAvailable ? `${t.catalog?.partsInStock || (isEn ? 'IN STOCK' : 'CÒN SẴN')}: ${part.quantity_in_stock}` : (t.catalog?.partsOutOfStock || (isEn ? 'OUT OF STOCK' : 'TẠM HẾT'))}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-baseline justify-between gap-2 mb-1.5">
                      <h3 className="text-base font-bold text-slate-900 line-clamp-2 group-hover:text-[#C0392B] transition-colors leading-snug">
                        {part.part_name}
                      </h3>
                    </div>

                    {/* Nhà phân phối & Vị trí kho */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                      <span className="font-medium text-slate-700">
                        {part.distributor ? `${t.catalog?.partsDistributor || 'NPP'}: ${part.distributor}` : (t.catalog?.partsDistributorOfficial || (isEn ? 'Authorized Channel' : 'Phân phối chính hãng'))}
                      </span>
                      {part.shelf_location && (
                        <>
                          <span>•</span>
                          <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px] text-slate-600">
                            {t.catalog?.partsShelf || (isEn ? 'Shelf' : 'Kệ')} {part.shelf_location}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Ghi chú & cam kết */}
                    <div className="space-y-1 text-xs text-[#6E5D53] bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8E2D9]">
                      {part.notes ? (
                        <p className="line-clamp-2 leading-relaxed">💡 {part.notes}</p>
                      ) : (
                        <p className="leading-relaxed">💡 {t.catalog?.partsNotesDefault || (isEn ? 'Universal compatibility for Desktops & Laptops, with full data preservation & setup support.' : 'Tương thích chuẩn cho máy bàn & Laptop, hỗ trợ lắp ráp và sao lưu dữ liệu nguyên vẹn.')}</p>
                      )}
                    </div>

                    {/* Giá bán & Bảo hành */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                      <div>
                        <span className="text-xs text-slate-400 block">{t.products.priceLabel}</span>
                        <span className="text-xl font-black text-[#C0392B] tracking-tight">
                          {formatVND(part.unit_price || 0)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{t.catalog?.partsWarrantyLabel || (isEn ? 'Warranty' : 'Bảo hành')} {part.warranty_months ? `${part.warranty_months} ${t.catalog?.partsWarrantyMonths || (isEn ? 'months' : 'tháng')}` : `36 ${t.catalog?.partsWarrantyMonths || (isEn ? 'months' : 'tháng')}`}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center gap-2 border-t border-slate-200">
                    <a
                      href={systemSettings?.zaloLink || 'https://zalo.me/0969624564'}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                      <span>{isEn ? 'Inquire' : 'Tư vấn'}</span>
                    </a>
                    <Link
                      href={`/dat-lich?device=${encodeURIComponent(part.part_name)}&service=${encodeURIComponent(isEn ? 'Hardware Upgrade / Purchase Component' : 'Nâng cấp / Mua linh kiện')}`}
                      className="flex-1 py-2.5 rounded-lg bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-xs text-center transition-colors shadow-2xs flex items-center justify-center gap-1"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>{t.catalog?.partsOrderBtn || (isEn ? 'Order & Install' : 'Đặt Mua & Lắp Đặt')}</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  )}
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
                  <span>{selectedProduct.isSold ? t.products.soldBadge : t.qcModal.badge}</span>
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
                {selectedProduct.salePrice && selectedProduct.salePrice > 0 ? (
                  <div className="flex items-baseline gap-2 justify-end">
                    <div className="text-xl font-bold text-[#C0392B] font-mono">
                      {formatVND(selectedProduct.salePrice)}
                    </div>
                    <div className="text-xs font-semibold text-slate-400 line-through font-mono">
                      {formatVND(selectedProduct.originalPrice || selectedProduct.price)}
                    </div>
                  </div>
                ) : (
                  <div className="text-xl font-bold text-[#C0392B] font-mono">{formatVND(selectedProduct.originalPrice || selectedProduct.price)}</div>
                )}
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
                  href={`/mua-hang?device=${encodeURIComponent(selectedProduct.name)}&price=${selectedProduct.price}`}
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 py-3 rounded-lg bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-xs sm:text-sm text-center transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <span>{t.qcModal.btnReserve}</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </Link>
                <a
                  href={`${systemSettings.zaloLink || 'https://zalo.me/0909053058'}?text=${encodeURIComponent(isEn ? `Hello An Tam, I would like photos and details for ${selectedProduct.name}` : `Chào An Tâm, tôi quan tâm máy ${selectedProduct.name}, vui lòng gửi thêm hình ảnh thực tế`)}`}
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

      {/* MODAL MUA KEY BẢN QUYỀN WINDOWS & OFFICE (ĐƠN GIẢN HÓA) */}
      <Modal
        open={isBuyKeyModalOpen}
        onCancel={() => setIsBuyKeyModalOpen(false)}
        footer={null}
        width={560}
        centered
        className="custom-ant-modal"
      >
        <div className="p-4 sm:p-5 space-y-4 font-sans bg-white">
          {/* Header & Bộ chọn Windows / Office */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2D9]">
            <div>
              <h2 className="text-base font-black text-[#2B1810] uppercase tracking-tight">
                {isEn ? 'GENUINE SOFTWARE LICENSES' : 'MUA KEY BẢN QUYỀN'}
              </h2>
              <p className="text-xs text-[#6E5D53]">
                {selectedKeyType === 'windows'
                  ? isEn
                    ? 'Windows keys: digital license bound to the motherboard • 1-to-1 replacement guarantee'
                    : 'Key Windows: bản quyền số kích hoạt theo mainboard • Bảo hành 1 đổi 1.'
                  : isEn
                    ? 'Office & Microsoft 365 keys: online activation • 1-to-1 replacement guarantee'
                    : 'Key Office & Microsoft 365: kích hoạt online • Bảo hành 1 đổi 1.'}
              </p>
            </div>

            <div className="inline-flex p-1 rounded-lg bg-[#FAF7F2] border border-[#E8E2D9] self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setSelectedKeyType('windows')}
                className={`px-3 py-1.5 rounded-md font-bold text-xs transition-all ${selectedKeyType === 'windows'
                  ? 'bg-[#C0392B] text-white shadow-xs'
                  : 'text-[#6E5D53] hover:text-[#2B1810]'
                  }`}
              >
                WINDOWS
              </button>
              <button
                type="button"
                onClick={() => setSelectedKeyType('office')}
                className={`px-3 py-1.5 rounded-md font-bold text-xs transition-all ${selectedKeyType === 'office'
                  ? 'bg-[#C0392B] text-white shadow-xs'
                  : 'text-[#6E5D53] hover:text-[#2B1810]'
                  }`}
              >
                OFFICE
              </button>
            </div>
          </div>

          {/* Danh sách phiên bản trong kho (chỉ hiển thị khi stock > 0) */}
          {inStockKeyCategories.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#6E5D53] bg-[#FAF7F2] rounded-xl border border-[#E8E2D9]">
              {t.catalog?.buyKeyModalEmpty || (isEn ? 'This software category is temporarily out of instant stock. Please reach out to our team to place a priority reservation.' : 'Hiện tại danh mục này đang tạm hết key sẵn kho. Quý khách vui lòng liên hệ trực tiếp nhân viên để đặt trước.')}
            </div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {inStockKeyCategories.map((cat) => {
                const stock = (licenseKeys || []).filter(
                  (k) => k.category_id === cat.id && k.status === 'available'
                ).length;

                return (
                  <div
                    key={cat.id}
                    className="p-3.5 rounded-xl border border-[#E8E2D9] bg-[#FAF7F2]/40 hover:bg-white hover:border-[#C0392B] transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black text-xs sm:text-sm text-[#2B1810] uppercase">
                        {cat.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 font-mono">
                        {isEn ? `${stock} licenses in stock` : `Còn ${stock} key`}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-[#E8E2D9]">
                      <div className="text-[11px] text-[#6E5D53] font-medium mb-1.5">
                        {t.catalog?.buyKeyModalContact || (isEn ? 'Contact our technical sales team for commercial pricing:' : 'Liên hệ nhân viên để nhận giá tốt nhất:')}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {(systemSettings.zaloContacts && systemSettings.zaloContacts.length > 0
                          ? systemSettings.zaloContacts
                          : [
                            { id: '1', name: 'Kỹ Thuật 1', phone: '123456', role: 'Tư vấn' },
                            { id: '2', name: 'Kỹ Thuật 2', phone: '345678', role: 'Kỹ thuật' },
                            { id: '3', name: 'Kỹ Thuật 3', phone: '678910', role: 'Kỹ thuật' },
                          ]
                        ).map((contact) => (
                          <a
                            key={contact.id}
                            href={`https://zalo.me/${contact.phone}?text=${encodeURIComponent(
                              isEn
                                ? `Hello ${contact.name}, I would like to purchase license: ${cat.name}`
                                : `Chào ${contact.name}, tôi muốn mua key: ${cat.name}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-1.5 px-2 rounded-lg bg-white border border-[#E8E2D9] hover:border-[#C0392B] hover:bg-red-50/20 text-center transition-all group"
                          >
                            <div className="text-[11px] font-bold text-[#2B1810] group-hover:text-[#C0392B] truncate">
                              {contact.name}
                            </div>
                            <div className="text-[10px] text-blue-600 font-mono font-semibold">
                              Zalo: {contact.phone}
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default function ProductsCatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center text-xs text-slate-500">Loading catalog...</div>}>
      <ProductsCatalogContent />
    </Suspense>
  );
}
