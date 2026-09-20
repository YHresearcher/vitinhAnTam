'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useViTinhAnTamStore } from '@/lib/store';
import { translations } from '@/lib/i18n';
import {
  AlertTriangle,
  CheckCircle2,
  Zap,
  Store,
  GraduationCap,
  Briefcase,
  ArrowRight,
  Phone,
  Calendar,
  ShieldCheck,
  Cpu,
  Clock,
  ThumbsUp,
  Award,
  Sparkles,
  Flame,
  FileSearch,
} from 'lucide-react';

export default function WhyUsPage() {
  const { currentLang } = useViTinhAnTamStore();
  const t = translations[currentLang].whyUsPage;

  const [selectedSegment, setSelectedSegment] = useState<'all' | 'business' | 'student' | 'officer'>('all');

  const comparisonIcons = [Cpu, ShieldCheck, CheckCircle2, Clock];

  const segmentTabs = [
    { key: 'all', label: t.tabAll, icon: ThumbsUp },
    { key: 'business', label: t.tabAccountant, icon: Store },
    { key: 'student', label: t.tabStudent, icon: GraduationCap },
    { key: 'officer', label: t.tabOffice, icon: Briefcase },
  ];

  const getActiveSegmentDetail = () => {
    switch (selectedSegment) {
      case 'business':
        return {
          ...t.accountantDetails,
          icon: Store,
        };
      case 'student':
        return {
          ...t.studentDetails,
          icon: GraduationCap,
        };
      case 'officer':
        return {
          ...t.officeDetails,
          icon: Briefcase,
        };
      default:
        return null;
    }
  };

  const activeDetail = getActiveSegmentDetail();

  return (
    <div className="w-full min-h-screen bg-slate-50/40">
      {/* 1. HERO BANNER */}
      <section className="relative bg-gradient-to-b from-blue-50/90 via-white to-slate-50/60 py-12 sm:py-16 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider shadow-2xs">
            <Zap className="w-4 h-4 text-blue-700" />
            <span>{t.preHeader}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {t.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-14 text-slate-700">
        {/* 2. BẢNG NGUYÊN NHÂN - KẾT QUẢ (CAUSE & EFFECT MATRIX) */}
        <section className="space-y-6">
          <div className="text-center space-y-1.5">
            <span className="text-xs uppercase font-bold text-blue-700 tracking-wider">
              {t.matrixTag}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {t.matrixTitle}
            </h2>
          </div>

          <div className="space-y-4">
            {t.comparisonItems.map((item, idx) => {
              const Icon = comparisonIcons[idx % comparisonIcons.length];
              return (
                <div
                  key={idx}
                  className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-all grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                >
                  <div className="md:col-span-5 space-y-1.5 border-b md:border-b-0 md:border-r border-slate-200 pb-3 md:pb-0 md:pr-4">
                    <div className="flex items-center gap-1.5 text-rose-600 font-bold text-xs uppercase tracking-wide">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{currentLang === 'en' ? 'Industry Risk & Cause' : 'Nguyên nhân & Rủi ro cũ'}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{item.riskTitle}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.riskDesc}</p>
                  </div>
                  <div className="md:col-span-7 space-y-1.5 md:pl-2">
                    <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs uppercase tracking-wide">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{currentLang === 'en' ? 'Verified Guarantee at An Tam' : 'Kết quả thực tế tại An Tam'}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{item.resultTitle}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.resultDesc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. 4 TIÊU CHUẨN KIỂM ĐỊNH KHÁC BIỆT */}
        <section className="rounded-3xl bg-gradient-to-br from-blue-900 to-slate-900 text-white p-7 sm:p-10 shadow-md space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-blue-300 uppercase tracking-widest inline-flex items-center gap-1.5">
              <Award className="w-4 h-4 text-blue-400" />
              <span>{t.standardsTitle}</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {currentLang === 'en' ? '24-Step Technical Certification Protocol' : 'Quy Trình Kiểm Tra 24 Bước Đo Lường Được'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {t.standardsDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">{t.s1.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{t.s1.desc}</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-300 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">{t.s2.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{t.s2.desc}</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-300 flex items-center justify-center font-bold">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">{t.s3.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{t.s3.desc}</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                <FileSearch className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">{t.s4.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{t.s4.desc}</p>
            </div>
          </div>
        </section>

        {/* 4. GIẢI PHÁP TƯƠNG TÁC CHO TỪNG NHÓM KHÁCH HÀNG (INTERACTIVE TABS) */}
        <section className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight">
              {t.segmentsTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              {t.segmentsSubtitle}
            </p>
          </div>

          {/* Interactive Category Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {segmentTabs.map((seg) => {
              const Icon = seg.icon;
              const isSelected = selectedSegment === seg.key;
              return (
                <button
                  key={seg.key}
                  type="button"
                  onClick={() => setSelectedSegment(seg.key as any)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shadow-xs ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-blue-500/25 ring-2 ring-blue-400'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{seg.label}</span>
                </button>
              );
            })}
          </div>

          {/* Segment Details Content */}
          {selectedSegment === 'all' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-900 pt-2">
              {/* Nhóm 1: Doanh nghiệp / Kế toán */}
              <div className="p-5 rounded-2xl bg-white space-y-3 flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-2">
                    <Store className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold uppercase">{t.tabAccountant}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2">
                    <strong>{t.concernLabel}</strong> {t.overviewAccountant.problem}<br />
                    <strong>{t.solutionLabel}</strong> {t.overviewAccountant.result}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 text-xs font-semibold text-blue-700">
                  {t.overviewAccountant.device}
                </div>
              </div>

              {/* Nhóm 2: Học sinh / Phụ huynh */}
              <div className="p-5 rounded-2xl bg-white space-y-3 flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center font-bold mb-2">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold uppercase">{t.tabStudent}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2">
                    <strong>{t.concernLabel}</strong> {t.overviewStudent.problem}<br />
                    <strong>{t.solutionLabel}</strong> {t.overviewStudent.result}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 text-xs font-semibold text-orange-700">
                  {t.overviewStudent.device}
                </div>
              </div>

              {/* Nhóm 3: Cán bộ / Văn phòng */}
              <div className="p-5 rounded-2xl bg-white space-y-3 flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-2">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold uppercase">{t.tabOffice}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2">
                    <strong>{t.concernLabel}</strong> {t.overviewOffice.problem}<br />
                    <strong>{t.solutionLabel}</strong> {t.overviewOffice.result}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 text-xs font-semibold text-emerald-700">
                  {t.overviewOffice.device}
                </div>
              </div>
            </div>
          ) : activeDetail ? (
            <div className="p-6 rounded-2xl bg-white text-slate-900 space-y-4 animate-fade-in shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  {React.createElement(activeDetail.icon, { className: 'w-6 h-6' })}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{activeDetail.label}</h3>
                  <p className="text-xs text-slate-500">{t.detailSubtitle}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200">
                  <span className="font-bold text-rose-700 uppercase block mb-1">{t.concernLabel}</span>
                  <p className="text-slate-700 leading-relaxed">{activeDetail.problem}</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <span className="font-bold text-emerald-700 uppercase block mb-1">{t.solutionLabel}</span>
                  <p className="text-slate-700 leading-relaxed">{activeDetail.solution}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] text-slate-500 uppercase font-bold">{t.recommendedLabel}</span>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">{activeDetail.recommendedDevice}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-base font-black text-orange-600 font-mono">{activeDetail.priceRange}</span>
                  <Link
                    href={`/dat-lich?device=${encodeURIComponent(activeDetail.recommendedDevice || '')}`}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    {t.bookViewBtn}
                  </Link>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        {/* 5. BẢNG SO SÁNH GIÁ TRỊ TOÀN DIỆN */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-700">
              {currentLang === 'en' ? 'BENCHMARK AUDIT' : 'ĐỐI CHIẾU TIÊU CHÍ'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {t.tableTitle}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="py-3.5 px-4 font-bold text-slate-800 bg-slate-50 rounded-tl-xl w-1/4">
                    {t.colCriteria}
                  </th>
                  <th className="py-3.5 px-4 font-black text-blue-700 bg-blue-50/70 border-x border-blue-200/80 w-5/12">
                    {t.colAnTam}
                  </th>
                  <th className="py-3.5 px-4 font-medium text-slate-500 bg-slate-50 rounded-tr-xl w-1/3">
                    {t.colTraditional}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[t.row1, t.row2, t.row3, t.row4, t.row5].map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{r.crit}</td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-800 bg-blue-50/30 border-x border-blue-100/80 flex items-start gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{r.anTam}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{r.other}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 6. LỜI KẾT & NÚT HÀNH ĐỘNG */}
        <section className="p-7 sm:p-9 rounded-3xl bg-blue-50/70 border border-blue-200/80 text-center space-y-4">
          <h3 className="text-base sm:text-xl font-bold text-slate-900">
            {t.ctaTitle}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            {t.ctaDesc}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/#danh-muc-san-pham"
              className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-colors"
            >
              {t.ctaBtnInventory}
            </Link>
            <a
              href="tel:0909053058"
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5"
            >
              <Phone className="w-4 h-4" />
              <span>{t.ctaBtnPhone}</span>
            </a>
            <Link
              href="/dat-lich"
              className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>{t.ctaBtnBooking}</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
