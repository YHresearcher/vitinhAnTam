'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useViTinhAnTamStore } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { formatDateVN } from '@/lib/supabase';
import {
  Search,
  Monitor,
  CheckCircle2,
  Calendar,
  User,
  ShieldCheck,
  HardDrive,
  Cpu,
  Layers,
  Wrench,
  Headset,
  Phone,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  Hash,
} from 'lucide-react';

function WarrantyLookupContent() {
  const searchParams = useSearchParams();
  const urlTag = searchParams.get('tag') || '';

  const { findWarrantyByTagOrPhone, systemSettings, currentLang } = useViTinhAnTamStore();
  const t = translations[currentLang].warrantyPage;

  const [searchInput, setSearchInput] = useState(urlTag || 'ST-8F4K92X');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const executeSearch = (query: string) => {
    const q = query.trim();
    if (!q) {
      showToast(t.toastEnterQuery);
      return;
    }
    setIsSearching(true);
    setHasSearched(true);
    setTimeout(() => {
      const res = findWarrantyByTagOrPhone(q);
      setIsSearching(false);
      if (res && (res.item || res.ticket)) {
        setSearchResult(res);
        showToast(t.toastFound);
      } else {
        setSearchResult(null);
        showToast(t.toastNotFound(q));
      }
    }, 250);
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
        <div className="fixed bottom-20 right-4 z-50 bg-white text-slate-900 px-4 py-3 rounded-2xl shadow-2xl border-2 border-blue-600 text-xs font-semibold flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>{t.badgePre}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
          {t.title} <span className="text-blue-600">{t.titleHighlight}</span>
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          {t.subtitle}
        </p>

        {/* Input Box - SĐT hoặc Serial Number / Service Tag */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="bg-white p-2 sm:p-2.5 rounded-2xl shadow-md border border-slate-200">
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
                  placeholder={t.searchPlaceholder}
                  className="w-full bg-transparent px-3 py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isSearching}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all shrink-0 active:scale-95 disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSearching ? t.searchingBtn : t.searchBtn}</span>
              </button>
            </form>
          </div>

          {/* Preset Quick Chips */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
            <span>{t.presetPrompt}</span>
            <button
              onClick={() => handlePreset('ST-8F4K92X')}
              className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-mono text-[11px] border border-slate-200 transition-colors"
            >
              {t.tagDellLabel}
            </button>
            <button
              onClick={() => handlePreset('TP-994L2A')}
              className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-mono text-[11px] border border-slate-200 transition-colors"
            >
              {t.tagThinkPadLabel}
            </button>
            <button
              onClick={() => handlePreset('0918234891')}
              className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-mono text-[11px] border border-slate-200 transition-colors"
            >
              {t.tagPhoneLabel}
            </button>
          </div>
        </div>
      </section>

      {/* Result Display */}
      {searchResult ? (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mt-4 space-y-6 animate-fade-in">
          {/* Header Identity Card */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              {/* Device Identity */}
              <div className="flex items-start md:items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <Monitor className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900">
                      {searchResult.item?.device_model || searchResult.ticket?.device_name}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-semibold">
                      {t.deviceSelectedBadge}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-mono">
                      <span className="text-slate-500 font-semibold">{t.snLabel}</span>
                      <span className="text-blue-700 font-black bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                        {searchResult.item?.service_tag || searchResult.ticket?.device_service_tag}
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {searchResult.item?.customer_name || searchResult.ticket?.customer_name || t.customerLabel}
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t.handoverDateLabel} {formatDateVN(searchResult.item?.handover_date) || '15/05/2025'}</span>
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
                    {t.statusActiveBadge}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  {t.authSubtitle}
                </span>
              </div>
            </div>

            {/* Quick Summary Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 bg-slate-50/70 rounded-2xl p-4">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">{t.ribbonPackage}</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">An Tâm Care Gold (12M)</p>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">{t.ribbonSsd}</span>
                <p className="text-sm font-bold text-emerald-600 mt-0.5">
                  100% Good (0% Bad)
                </p>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">{t.ribbonOs}</span>
                <p className="text-sm font-bold text-blue-600 mt-0.5">Win 11 Pro OEM Digital</p>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">{t.ribbonPrivilege}</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{currentLang === 'en' ? '2-Hour On-Site Swap' : '1 Đổi 1 Tận Nơi 2H'}</p>
              </div>
            </div>
          </div>

          {/* Multi-tier Warranty Cards */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {t.multiTierTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t.multiTierSubtitle}
                </p>
              </div>
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {t.multiTierBadge}
              </span>
            </div>

            <div className="space-y-4">
              {/* Tier 1: Chassis & Mainboard */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                      1
                    </span>
                    <span className="font-bold text-slate-900">{t.tier1Title}</span>
                    <span className="text-slate-500 font-mono">(15/05/2026)</span>
                  </div>
                  <span className="font-semibold text-blue-700">{t.tier1Remaining}</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '70%' }} />
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {t.tier1Note}
                </p>
              </div>

              {/* Tier 2: New SSD & RAM */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                      2
                    </span>
                    <span className="font-bold text-slate-900">{t.tier2Title}</span>
                    <span className="text-slate-500 font-mono">(15/05/2028)</span>
                  </div>
                  <span className="font-semibold text-emerald-700">{t.tier2Remaining}</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '15%' }} />
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {t.tier2Note}
                </p>
              </div>

              {/* Tier 3: Software support */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                      3
                    </span>
                    <span className="font-bold text-slate-900">{t.tier3Title}</span>
                    <span className="text-slate-500 font-mono">(30D)</span>
                  </div>
                  <span className="font-semibold text-indigo-700">{t.tier3Remaining}</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: '85%' }} />
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {t.tier3Note}
                </p>
              </div>
            </div>

            {/* Bottom Support Actions */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-600 flex items-center gap-1.5">
                <Headset className="w-4 h-4 text-blue-600" />
                <span>
                  {t.techLeaderLabel}{' '}
                  <strong className="text-slate-900">Trịnh Minh Tuấn (Lead Engineer)</strong>
                </span>
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <a
                  href={systemSettings.zaloLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-800 font-semibold transition-all text-center border border-slate-200"
                >
                  {t.zaloTechBtn}
                </a>
                <Link
                  href="/dat-lich"
                  className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all text-center shadow-xs"
                >
                  {t.bookServiceBtn}
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : hasSearched && (
        /* Empty State */
        <section className="max-w-2xl mx-auto px-4 mt-8">
          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {t.emptyTitle(searchInput)}
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              {t.emptyDesc}
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <a
                href="tel:0909053058"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{t.callHotlineBtn}</span>
              </a>
              <a
                href={systemSettings.zaloLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
              >
                {t.supportZaloBtn}
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
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <WarrantyLookupContent />
    </Suspense>
  );
}
