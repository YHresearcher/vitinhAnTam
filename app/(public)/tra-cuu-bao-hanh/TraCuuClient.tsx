'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useViTinhAnTamStore } from '@/lib/store';
import { formatDateVN, InventoryItem, ServiceTicket, Customer, supabase } from '@/lib/supabase';
import { TRANSLATIONS } from '@/lib/translations';
import { DigitalMemberCard } from '@/components/public/DigitalMemberCard';
import {
  Search,
  Monitor,
  CheckCircle2,
  Calendar,
  User,
  ShieldCheck,
  Headset,
  Phone,
  HelpCircle,
} from 'lucide-react';

interface SearchResultData {
  item?: InventoryItem;
  ticket?: ServiceTicket;
  customer?: Customer;
  order?: Record<string, unknown>;
}

function WarrantyLookupContent() {
  const searchParams = useSearchParams();
  const urlTag =
    searchParams.get('tag') ||
    searchParams.get('ticket') ||
    searchParams.get('code') ||
    searchParams.get('q') ||
    '';

  const { findWarrantyByTagOrPhone, systemSettings, currentLang } = useViTinhAnTamStore();
  const t = TRANSLATIONS[currentLang || 'vi'].warrantyLookup;

  const [searchInput, setSearchInput] = useState(urlTag);
  const [searchResult, setSearchResult] = useState<SearchResultData | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  const executeSearch = useCallback((query: string) => {
    const q = query.trim();
    if (!q) {
      showToast(t.toastEmpty);
      return;
    }
    setIsSearching(true);
    setHasSearched(true);
    setTimeout(async () => {
      // 1. Thử tìm nhanh trong bộ nhớ client
      let res: SearchResultData | null = findWarrantyByTagOrPhone(q);

      // 2. Tra cứu qua API bảo hành tổng hợp (hỗ trợ đầy đủ SĐT, Service Tag, vượt qua RLS và tìm cả đơn mua máy)
      try {
        const resp = await fetch(`/api/warranty/search?q=${encodeURIComponent(q)}`);
        if (resp.ok) {
          const apiJson = await resp.json();
          if (apiJson.found && apiJson.data) {
            res = {
              item: (apiJson.data.item as InventoryItem) || res?.item,
              ticket: (apiJson.data.ticket as ServiceTicket) || res?.ticket,
              customer: (apiJson.data.customer as Customer) || res?.customer,
              order: apiJson.data.order as Record<string, unknown>,
            };
          }
        }
      } catch (apiErr) {
        console.warn('Lỗi gọi API tra cứu bảo hành:', apiErr);
      }

      setIsSearching(false);
      if (res && (res.item || res.ticket || res.order)) {
        setSearchResult(res);
        showToast(t.toastSuccess);
      } else {
        setSearchResult(null);
        showToast(t.toastNotFound);
      }
    }, 200);
  }, [findWarrantyByTagOrPhone, showToast, t.toastEmpty, t.toastNotFound, t.toastSuccess]);

  useEffect(() => {
    if (!urlTag) return;
    const timer = setTimeout(() => {
      executeSearch(urlTag);
    }, 50);
    return () => clearTimeout(timer);
  }, [urlTag, executeSearch]);

  // Tính toán thời hạn bảo hành thực tế của máy:
  // Ưu tiên theo phiếu bán/giao hàng thực tế (ticket), sau đó tới thông tin máy (item)
  const calculateWarrantyMonths = (): number => {
    if (searchResult?.ticket?.warranty_duration_months) {
      return Number(searchResult.ticket.warranty_duration_months);
    }
    const rawStart = searchResult?.item?.handover_date || searchResult?.ticket?.created_at;
    if (searchResult?.ticket?.warranty_until && rawStart) {
      const startMs = new Date(rawStart).getTime();
      const endMs = new Date(searchResult.ticket.warranty_until).getTime();
      if (!isNaN(startMs) && !isNaN(endMs) && endMs > startMs) {
        const months = Math.round((endMs - startMs) / (1000 * 60 * 60 * 24 * 30.4375));
        if (months > 0) return months;
      }
    }
    if (searchResult?.item?.warranty_months) {
      return Number(searchResult.item.warranty_months);
    }
    return 12;
  };

  const warrantyMonths = calculateWarrantyMonths();

  const handoverDateRaw =
    searchResult?.item?.handover_date ||
    searchResult?.ticket?.created_at ||
    (searchResult?.order?.created_at as string) ||
    '2025-05-15';

  const startDate = new Date(handoverDateRaw);
  const validStartDate = Number.isNaN(startDate.getTime()) ? new Date() : startDate;

  // Hạn bảo hành phần cứng máy
  const expiryDate = searchResult?.ticket?.warranty_until
    ? new Date(searchResult.ticket.warranty_until)
    : (() => {
        const d = new Date(validStartDate);
        d.setMonth(d.getMonth() + warrantyMonths);
        return d;
      })();

  const nowTimestamp = Date.now();
  const totalDays = Math.max(1, Math.ceil((expiryDate.getTime() - validStartDate.getTime()) / (1000 * 60 * 60 * 24)));
  const remainingDays = Math.max(0, Math.ceil((expiryDate.getTime() - nowTimestamp) / (1000 * 60 * 60 * 24)));
  const machineProgress = Math.min(100, Math.max(0, Math.round(((totalDays - remainingDays) / totalDays) * 100)));

  // Hỗ trợ Kỹ thuật & Phần mềm: 12 tháng
  const softwareExpiryDate = new Date(validStartDate);
  softwareExpiryDate.setMonth(softwareExpiryDate.getMonth() + 12);
  const softwareTotalDays = Math.max(1, Math.ceil((softwareExpiryDate.getTime() - validStartDate.getTime()) / (1000 * 60 * 60 * 24)));
  const softwareRemainingDays = Math.max(0, Math.ceil((softwareExpiryDate.getTime() - nowTimestamp) / (1000 * 60 * 60 * 24)));
  const softwareProgress = Math.min(100, Math.max(0, Math.round(((softwareTotalDays - softwareRemainingDays) / softwareTotalDays) * 100)));

  const deviceTitle =
    searchResult?.item?.device_model ||
    searchResult?.ticket?.device_name ||
    (searchResult?.order?.device_name as string) ||
    (currentLang === 'en' ? 'Desktop / Laptop System' : 'Máy tính PC / Laptop');

  const serialOrTag =
    searchResult?.item?.service_tag ||
    searchResult?.item?.serial_number ||
    searchResult?.ticket?.device_service_tag ||
    (searchResult?.order?.device_tag as string) ||
    (searchResult?.order?.order_code as string) ||
    'ST-AT2025';

  const customerDisplayName =
    searchResult?.item?.customer_name ||
    searchResult?.ticket?.customer_name ||
    searchResult?.customer?.full_name ||
    (searchResult?.order?.customer_name as string) ||
    t.personalCustomer;

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 right-4 z-50 bg-white text-slate-900 px-4 py-3 rounded-2xl shadow-2xl border-2 border-[#C0392B] text-xs font-semibold flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-[#C0392B]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FBE8DE] text-[#C0392B] border border-[#F2C4B2] text-xs font-bold uppercase tracking-wider mb-3">
          <ShieldCheck className="w-4 h-4 text-[#C0392B]" />
          <span>{t.badge}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
          {t.titleMain} <span className="text-[#C0392B]">{t.titleHighlight}</span>
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          {t.description}
        </p>

        {/* Input Box - SĐT hoặc Serial Number / Service Tag */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="bg-white p-2 sm:p-2.5 rounded-2xl shadow-md border border-[#E8E2D9]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                executeSearch(searchInput);
              }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
            >
              <div className="relative flex-1 flex items-center min-w-0">
                <Search className="text-slate-400 ml-3 w-5 h-5 shrink-0" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={t.placeholder}
                  className="w-full bg-transparent px-3 py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isSearching}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-xs sm:text-sm shadow-xs transition-all shrink-0 active:scale-95 disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSearching ? t.checking : t.btnCheck}</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Result Display */}
      {searchResult ? (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mt-4 space-y-6 animate-fade-in">
          {/* Digital VIP Member Card (Nếu có thông tin khách hàng) */}
          {(searchResult.customer || searchResult.item?.customer_phone || searchResult.ticket?.customer_phone) && (
            <div className="mb-2">
              <DigitalMemberCard
                customer={
                  searchResult.customer || {
                    id: searchResult.item?.id || searchResult.ticket?.id || 'cust-lookup',
                    full_name: customerDisplayName,
                    phone: searchResult.item?.customer_phone || searchResult.ticket?.customer_phone || '',
                    address: searchResult.ticket?.customer_address || '',
                    total_spent: searchResult.item?.price || searchResult.item?.retail_price || 0,
                    last_purchase_date: searchResult.item?.handover_date || searchResult.ticket?.created_at,
                  }
                }
                isEn={currentLang === 'en'}
              />
            </div>
          )}

          {/* Header Identity Card */}
          <div className="rounded-3xl bg-white border border-[#E8E2D9] p-6 sm:p-8 shadow-sm relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              {/* Device Identity */}
              <div className="flex items-start md:items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#FBE8DE] border border-[#F2C4B2] flex items-center justify-center text-[#C0392B] shrink-0">
                  <Monitor className="w-8 h-8 text-[#C0392B]" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900">
                      {deviceTitle}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-semibold">
                      {t.originalSelected}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-mono">
                      <span className="text-slate-500 font-semibold">{t.serialLabel}</span>
                      <span className="text-[#C0392B] font-black bg-[#FBE8DE] border border-[#F2C4B2] px-2 py-0.5 rounded">
                        {serialOrTag}
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{customerDisplayName}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t.handoverDate} {formatDateVN(validStartDate.toISOString())}</span>
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
                    {t.activeStatus}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  {t.verifiedBySystem}
                </span>
              </div>
            </div>

            {/* Quick Summary Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 bg-[#FAF7F2] rounded-2xl p-4">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">{t.packageLabel}</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {currentLang === 'en' ? `An Tam Care (${warrantyMonths}M)` : `An Tam Care (${warrantyMonths}T)`}
                </p>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">{t.ssdHealthLabel}</span>
                <p className="text-sm font-bold text-emerald-600 mt-0.5">
                  {t.ssdHealthValue}
                </p>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">{t.osLicenseLabel}</span>
                <p className="text-sm font-bold text-[#C0392B] mt-0.5">{t.osLicenseValue}</p>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">{t.privilegeLabel}</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{t.privilegeValue}</p>
              </div>
            </div>
          </div>

          {/* Complete System Warranty Cards */}
          <div className="rounded-3xl bg-white border border-[#E8E2D9] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {t.multiTierTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t.multiTierDesc}
                </p>
              </div>
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-[#FBE8DE] text-[#C0392B] border border-[#F2C4B2]">
                {t.tiersBadge}
              </span>
            </div>

            <div className="space-y-4">
              {/* Thẻ 1: Bảo hành toàn bộ máy PC / Laptop (Đồng bộ, không tách rời linh kiện) */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D9] space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-[#C0392B] text-white font-bold flex items-center justify-center text-xs shrink-0">
                      1
                    </span>
                    <span className="font-bold text-slate-900">{t.tier1Name}</span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      ({currentLang === 'en' ? 'Valid until ' : 'Hạn đến '} {formatDateVN(expiryDate.toISOString())})
                    </span>
                  </div>
                  <span className="font-semibold text-[#C0392B] shrink-0">
                    {remainingDays > 0
                      ? (currentLang === 'en' ? `${remainingDays} days remaining` : `Còn ${remainingDays} ngày bảo hành`)
                      : (currentLang === 'en' ? 'Expired' : 'Hết hạn bảo hành')}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#C0392B] h-full rounded-full transition-all duration-500" style={{ width: `${machineProgress}%` }} />
                </div>
              </div>

              {/* Thẻ 2: Hỗ trợ Kỹ thuật & Phần mềm: 12 tháng */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D9] space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-slate-800 text-white font-bold flex items-center justify-center text-xs shrink-0">
                      2
                    </span>
                    <span className="font-bold text-slate-900">{t.tier3Name}</span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      ({currentLang === 'en' ? '12 months • Until ' : '12 tháng • Hạn đến '} {formatDateVN(softwareExpiryDate.toISOString())})
                    </span>
                  </div>
                  <span className="font-semibold text-slate-800 shrink-0">{t.tier3Remaining}</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-slate-700 h-full rounded-full transition-all duration-500" style={{ width: `${softwareProgress}%` }} />
                </div>
              </div>

              {/* Thẻ 3: Linh kiện nâng cấp nếu có trên phiếu tiếp nhận / sửa chữa */}
              {searchResult.ticket?.parts_used && searchResult.ticket.parts_used.length > 0 && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                        +
                      </span>
                      <span className="font-bold text-emerald-950">{t.tier2Name}</span>
                    </div>
                    <span className="font-semibold text-emerald-700">{t.tier2Remaining}</span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {searchResult.ticket.parts_used.map((part, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs bg-white/80 px-3 py-1.5 rounded-lg border border-emerald-100">
                        <span className="font-medium text-slate-800">{part.part_name} (x{part.quantity})</span>
                        <span className="text-emerald-700 font-mono font-bold text-[11px]">
                          {part.warranty_months
                            ? currentLang === 'en'
                              ? `${part.warranty_months} months`
                              : `${part.warranty_months} tháng`
                            : currentLang === 'en'
                            ? '36 months'
                            : '36 tháng'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>



            {/* Bottom Support Actions */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-600 flex items-center gap-1.5">
                <Headset className="w-4 h-4 text-[#C0392B]" />
                <span>
                  {t.leadTechLabel}{' '}
                  <strong className="text-slate-900">{t.leadTechName}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <a
                  href={systemSettings.zaloLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-800 font-semibold transition-all text-center border border-slate-200"
                >
                  {t.btnZaloTech}
                </a>
                <Link
                  href="/dat-lich"
                  className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-[#C0392B] text-white text-xs font-semibold hover:bg-[#A93226] transition-all text-center shadow-xs"
                >
                  {t.btnScheduleMaintenance}
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : hasSearched && (
        /* Empty State */
        <section className="max-w-2xl mx-auto px-4 mt-8">
          <div className="p-8 rounded-3xl bg-white border border-[#E8E2D9] text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {t.notFoundTitle} &quot;{searchInput}&quot;
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              {t.notFoundDesc}
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <a
                href="tel:0909053058"
                className="px-4 py-2 rounded-xl bg-[#D9531E] hover:bg-[#C0392B] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{t.btnCallHotline}</span>
              </a>
              <a
                href={systemSettings.zaloLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
              >
                {t.btnZaloSupport}
              </a>
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
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#C0392B] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <WarrantyLookupContent />
    </Suspense>
  );
}
