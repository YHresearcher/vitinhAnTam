'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useViTinhAnTamStore } from '@/lib/store';
import { formatDateVN } from '@/lib/supabase';

function WarrantyLookupContent() {
  const searchParams = useSearchParams();
  const urlTag = searchParams.get('tag') || '';

  const { findWarrantyByTagOrPhone } = useViTinhAnTamStore();
  const [searchInput, setSearchInput] = useState(urlTag || 'ST-8F4K92X');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const executeSearch = (query: string) => {
    const q = query.trim();
    if (!q) {
      showToast('Vui lòng nhập Service Tag hoặc Số điện thoại mua máy!');
      return;
    }
    setIsSearching(true);
    setTimeout(() => {
      const res = findWarrantyByTagOrPhone(q);
      setIsSearching(false);
      if (res && (res.item || res.ticket)) {
        setSearchResult(res);
        showToast('Kiểm tra thành công!');
      } else {
        setSearchResult(null);
        showToast(`Không tìm thấy hồ sơ cho "${q}". Hãy thử ST-8F4K92X hoặc 0918234891!`);
      }
    }, 300);
  };

  useEffect(() => {
    if (urlTag) {
      setSearchInput(urlTag);
      executeSearch(urlTag);
    } else {
      executeSearch('ST-8F4K92X');
    }
  }, [urlTag]);

  const handlePreset = (tag: string) => {
    setSearchInput(tag);
    executeSearch(tag);
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 right-4 z-50 bg-white text-slate-900 px-4 py-3 rounded-xl shadow-2xl border-2 border-blue-600 text-xs font-semibold flex items-center gap-2.5 animate-bounce">
          <span className="material-symbols-outlined text-blue-600 text-lg">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 shadow-xs mb-5">
          <span className="inline-flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
          <span className="text-xs font-semibold tracking-wide uppercase text-blue-700">
            Cổng Dịch Vụ Khách Hàng Điện Tử
          </span>
          <span className="text-xs text-slate-300">•</span>
          <span className="text-xs text-slate-500 font-mono">Long An - Tây Ninh</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
          KIỂM TRA BẢO HÀNH ĐIỆN TỬ &amp; <span className="text-blue-600">LỊCH SỬ THIẾT BỊ</span>
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto">
          Minh bạch từng linh kiện — An tâm trọn vòng đời sử dụng tại Vi tính An Tâm.
        </p>

        {/* Input Box - SĐT hoặc Service Tag */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                executeSearch(searchInput);
              }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
            >
              <div className="relative flex-1 flex items-center min-w-0">
                <span className="material-symbols-outlined text-slate-400 ml-3 text-2xl shrink-0">
                  search
                </span>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Nhập Số điện thoại (0918...) hoặc Service Tag (ST-8F4K92X)..."
                  className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isSearching}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition-all shrink-0 active:scale-95 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-xl">verified</span>
                <span>{isSearching ? 'Đang kiểm tra...' : 'Kiểm Tra Ngay'}</span>
              </button>
            </form>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3.5 text-xs text-slate-500">
            <span className="font-medium text-slate-600">Tìm kiếm nhanh:</span>
            <button
              type="button"
              onClick={() => handlePreset('ST-8F4K92X')}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 text-[11px] font-mono transition-colors shadow-2xs"
            >
              ST-8F4K92X (Dell OptiPlex)
            </button>
            <button
              type="button"
              onClick={() => handlePreset('PC-GAMING-9921')}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 text-[11px] font-mono transition-colors shadow-2xs"
            >
              PC-GAMING-9921
            </button>
            <button
              type="button"
              onClick={() => handlePreset('0918234891')}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 text-[11px] font-mono transition-colors shadow-2xs"
            >
              SĐT: 0918.234.891
            </button>
          </div>
        </div>
      </section>

      {/* Result Display */}
      {searchResult && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mt-4 space-y-6">
          {/* Header Card */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              {/* Device Identity */}
              <div className="flex items-start md:items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <span className="material-symbols-outlined text-3xl">desktop_windows</span>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900 font-headline">
                      {searchResult.item?.device_model || searchResult.ticket?.device_name}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-semibold">
                      Đồng bộ doanh nghiệp
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-mono">
                      <span className="text-slate-500 font-semibold">Service Tag:</span>
                      <span className="text-blue-700 font-bold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                        {searchResult.item?.service_tag || searchResult.ticket?.device_service_tag}
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-slate-400">person</span>
                      <span>
                        {searchResult.item?.customer_name || searchResult.ticket?.customer_name || 'Khách hàng cá nhân'}
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-slate-400">calendar_today</span>
                      <span>Bàn giao: {formatDateVN(searchResult.item?.handover_date) || '15/05/2025'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Glowing Status Badge */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-1.5 shrink-0">
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-xs">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
                  </span>
                  <span className="text-xs font-bold tracking-wide uppercase">
                    Đang trong thời hạn bảo hành chính thức
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Xác thực bởi Vi tính An Tâm • Mã tra cứu: <code className="font-mono text-blue-700 font-semibold">AT-REC-8921</code>
                </span>
              </div>
            </div>

            {/* Quick Summary Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 bg-slate-50 rounded-xl p-4">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Gói dịch vụ</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">An Tâm Care Gold (12T)</p>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Sức khỏe Ổ cứng SSD</span>
                <p className="text-sm font-bold text-emerald-600 mt-0.5">
                  100% Good (0% Bad Sector)
                </p>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Bản quyền Hệ điều hành</span>
                <p className="text-sm font-bold text-blue-600 mt-0.5">Win 11 Pro Kỹ Thuật Số</p>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Chính sách đặc quyền</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">1 Đổi 1 Trong 2H Tận Nơi</p>
              </div>
            </div>
          </div>

          {/* Multi-tier Warranty Cards */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  CHI TIẾT THỜI HẠN BẢO HÀNH ĐA TẦNG (Multi-tier Warranty)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bảo hành độc lập theo từng linh kiện, không làm gián đoạn việc sử dụng của khách hàng
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                3 Tầng Bảo Hành
              </span>
            </div>

            <div className="space-y-4">
              {/* Tier 1: Chassis & Mainboard */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                      1
                    </span>
                    <span className="font-bold text-slate-900">Thân máy, Mainboard &amp; Nguồn CST</span>
                    <span className="text-slate-500 font-mono">(Hạn đến 15/05/2026)</span>
                  </div>
                  <span className="font-semibold text-blue-700">Còn 115 ngày bảo hành</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '70%' }} />
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  * Hỗ trợ đổi ngay bo mạch hoặc nguồn trong 15 phút tại quầy hoặc trong 2 giờ tận nơi tại Tân An.
                </p>
              </div>

              {/* Tier 2: New SSD & RAM */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                      2
                    </span>
                    <span className="font-bold text-slate-900">Ổ cứng SSD NVMe &amp; RAM Mới 100%</span>
                    <span className="text-slate-500 font-mono">(Hạn đến 15/05/2028)</span>
                  </div>
                  <span className="font-semibold text-emerald-700">Bảo hành hãng 36 tháng</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '15%' }} />
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  * Bảo hành đổi mới 100% nguyên hộp bởi nhà phân phối Viễn Sơn / Vĩnh Xuân.
                </p>
              </div>

              {/* Tier 3: Software support */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                      3
                    </span>
                    <span className="font-bold text-slate-900">Hỗ trợ Kỹ thuật &amp; Phần mềm Ultraviewer</span>
                    <span className="text-slate-500 font-mono">(30 ngày miễn phí)</span>
                  </div>
                  <span className="font-semibold text-indigo-700">Trực ca 24/7</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: '85%' }} />
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  * Hỗ trợ cài máy in hoá đơn, chữ ký số thuế, MISA và xử lý lỗi phát sinh qua mạng.
                </p>
              </div>
            </div>

            {/* Bottom Support Actions */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-600 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-600 text-base">support_agent</span>
                <span>
                  Kỹ thuật viên phụ trách:{' '}
                  <strong className="text-slate-900">Trịnh Minh Tuấn (KTV Trưởng)</strong>
                </span>
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <a
                  href="https://zalo.me/0909053058"
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
                  Đặt Lịch Bảo Dưỡng / Sửa Chữa
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default function WarrantyLookupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500 font-medium">Đang tải cổng tra cứu bảo hành điện tử...</p>
          </div>
        </div>
      }
    >
      <WarrantyLookupContent />
    </Suspense>
  );
}

