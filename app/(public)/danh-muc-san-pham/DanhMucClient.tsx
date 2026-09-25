'use client';

import React, { useState, useEffect, Suspense } from 'react';
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
  PhoneCall,
  MessageSquare,
  Gift,
  Check,
  ScanLine,
  Search,
  CheckCircle,
  Home,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useViTinhAnTamStore } from '@/lib/store';
import { formatVND } from '@/lib/supabase';
import { TRANSLATIONS } from '@/lib/translations';
import { getShowcaseProducts, ShowcaseItem } from '@/lib/productsData';

function ProductsCatalogContent() {
  const searchParams = useSearchParams();
  const { currentLang, inventory, systemSettings, keyCategories, licenseKeys } = useViTinhAnTamStore();
  const isEn = currentLang === 'en';
  const t = TRANSLATIONS[currentLang || 'vi'];

  // Status Tab: 'in_stock' | 'sold'
  const initialTab = searchParams.get('tab') === 'sold' ? 'sold' : 'in_stock';
  const [statusTab, setStatusTab] = useState<'in_stock' | 'sold'>(initialTab);

  // Search keyword inside catalog
  const [searchKeyword, setSearchKeyword] = useState('');

  // Selected product for QC inspection modal
  const [selectedProduct, setSelectedProduct] = useState<ShowcaseItem | null>(null);

  // Modal for Buying License Keys
  const [isBuyKeyModalOpen, setIsBuyKeyModalOpen] = useState(false);
  const [selectedKeyType, setSelectedKeyType] = useState<'windows' | 'office'>('windows');

  // Open modal if URL has ?action=buy_key or ?buy_key=true
  useEffect(() => {
    const action = searchParams.get('action');
    const buyKeyParam = searchParams.get('buy_key');
    const typeParam = searchParams.get('type');
    if (action === 'buy_key' || buyKeyParam === 'true') {
      if (typeParam === 'office') setSelectedKeyType('office');
      else setSelectedKeyType('windows');
      setIsBuyKeyModalOpen(true);
    }
  }, [searchParams]);

  // Update tab if URL searchParam changes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'sold') setStatusTab('sold');
    else setStatusTab('in_stock');
  }, [searchParams]);

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

  const totalInStockKeys = (keyCategories || []).reduce((sum, cat) => {
    const count = (licenseKeys || []).filter(
      (k) => k.category_id === cat.id && k.status === 'available'
    ).length;
    return sum + count;
  }, 0);

  const allProducts = getShowcaseProducts(isEn, inventory);
  const inStockProducts = allProducts.filter((p) => !p.isSold);
  const soldProducts = allProducts.filter((p) => p.isSold);

  const filterByKeyword = (list: ShowcaseItem[]) => {
    return list.filter((item) => {
      const matchKw =
        !searchKeyword.trim() ||
        item.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        item.serviceTag.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        item.specs.cpu.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (item.customerName && item.customerName.toLowerCase().includes(searchKeyword.toLowerCase()));
      return matchKw;
    });
  };

  const filteredInStock = filterByKeyword(inStockProducts);
  const filteredSold = filterByKeyword(soldProducts);
  const totalReadyStock = inStockProducts.reduce((sum, item) => sum + item.stockCount, 0);

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

            {/* Quick stock status pill */}
            <div className="text-xs text-[#6E5D53] font-medium bg-[#FAF7F2] px-4 py-2.5 rounded-xl border border-[#E8E2D9] inline-flex items-center gap-2.5 self-start md:self-auto shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <span>
                {t.products.readyCount}{' '}
                <strong className="text-[#C0392B] font-bold font-mono text-sm">{totalReadyStock}</strong>{' '}
                {t.products.readyCountSuffix}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Controls & Search Toolbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="danh-muc-san-pham">
        {/* Controls wrapper */}
        <div className="space-y-4 mb-8">
          {/* Status Tabs: Sẵn hàng vs Đã bán */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-2 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs">
            {/* Primary Switcher Tabs */}
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
                <span>{isEn ? 'In Stock' : 'Sẵn hàng'}</span>
                <span className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${
                  statusTab === 'in_stock' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-800'
                }`}>
                  {inStockProducts.length}
                </span>
              </button>

              {/* Nút MUA KEY đưa xuống kế bên Sẵn hàng */}
              <button
                type="button"
                onClick={() => setIsBuyKeyModalOpen(true)}
                className="px-3.5 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 bg-amber-50 hover:bg-[#C0392B] text-[#C0392B] hover:text-white border border-[#C0392B]/30 uppercase tracking-wide cursor-pointer active:scale-95 shadow-2xs"
              >
                <span>🔑 MUA KEY</span>
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
                <span>{isEn ? 'Sold' : 'Đã bán'}</span>
                <span className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${
                  statusTab === 'sold' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  {soldProducts.length}
                </span>
              </button>
            </div>

            {/* Keyword Search Input */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder={isEn ? 'Search model, S/N, CPU...' : 'Tìm model, S/N, cấu hình...'}
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

        {/* 3. Phân Đoạn 1: SẴN HÀNG */}
        {statusTab === 'in_stock' && (
          <div className="space-y-6 mb-16">
            <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                <h2 className="text-lg sm:text-xl font-bold text-[#2B1810]">
                  {isEn ? 'In Stock' : 'Sẵn hàng'}
                </h2>
                <span className="text-xs text-slate-500 font-medium">({filteredInStock.length} {isEn ? 'units' : 'máy'})</span>
              </div>
            </div>

            {filteredInStock.length === 0 ? (
              <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-[#E8E2D9] p-8">
                <p className="text-sm text-[#6E5D53]">{t.products.emptyInStock}</p>
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
                        <div className="text-xl font-black text-[#C0392B] font-mono tracking-tight">
                          {formatVND(prod.price)}
                        </div>
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
                  {isEn ? 'Sold' : 'Đã bán'}
                </h2>
                <span className="text-xs text-slate-500 font-medium">({filteredSold.length} {isEn ? 'records' : 'thiết bị lưu trữ'})</span>
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
                        <div className="text-base font-bold text-slate-700 font-mono">
                          {formatVND(prod.price)}
                          <span className="text-xs text-slate-400 font-normal ml-1">
                            ({isEn ? 'Delivered' : 'Đã giao'})
                          </span>
                        </div>

                        {/* Handover & Customer Meta */}
                        <div className="mt-3 p-2.5 rounded-lg bg-white border border-slate-200 text-xs space-y-1">
                          <div className="text-slate-800 font-semibold truncate">
                            <span className="text-slate-400 font-normal">{t.products.soldToLabel}: </span>
                            {prod.customerName}
                          </div>
                          <div className="text-slate-500 text-[11px] truncate">
                            📍 {prod.customerArea}
                          </div>
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
                          href={`/tra-cuu-bao-hanh?tag=${encodeURIComponent(prod.serviceTag)}`}
                          className="flex-1 py-2.5 rounded-lg border border-slate-300 hover:bg-white text-slate-800 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 font-mono"
                          title={isEn ? "View warranty history of this device" : "Xem lịch sử bảo hành thiết bị này"}
                        >
                          <Search className="w-3.5 h-3.5 text-slate-600" />
                          <span>{t.products.btnLookupWarranty}</span>
                        </Link>
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
                  href={`/mua-hang?device=${encodeURIComponent(selectedProduct.name)}&price=${selectedProduct.price}&tag=${encodeURIComponent(selectedProduct.serviceTag)}`}
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
                MUA KEY BẢN QUYỀN
              </h2>
              <p className="text-xs text-[#6E5D53]">
                Kích hoạt theo máy, bảo hành 1 đổi 1.
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
              Hiện tại danh mục này đang tạm hết key sẵn kho. Quý khách vui lòng liên hệ trực tiếp nhân viên để đặt trước.
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
                        Còn {stock} key
                      </span>
                    </div>

                    <div className="pt-2 border-t border-[#E8E2D9]">
                      <div className="text-[11px] text-[#6E5D53] font-medium mb-1.5">
                        Liên hệ nhân viên để nhận giá tốt nhất:
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
                              `Chào ${contact.name}, tôi muốn mua key: ${cat.name}`
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
