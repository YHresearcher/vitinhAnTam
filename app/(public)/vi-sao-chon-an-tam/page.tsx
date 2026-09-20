'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useViTinhAnTamStore } from '@/lib/store';
import { TRANSLATIONS } from '@/lib/translations';
import {
  AlertTriangle,
  CheckCircle2,
  Zap,
  Store,
  GraduationCap,
  Briefcase,
  Phone,
  Calendar,
  ThumbsUp,
} from 'lucide-react';

type SegmentKey = 'all' | 'business' | 'student' | 'officer';

export default function WhyUsPage() {
  const { currentLang } = useViTinhAnTamStore();
  const t = TRANSLATIONS[currentLang || 'vi'].whyUs;

  const [selectedSegment, setSelectedSegment] = useState<SegmentKey>('all');

  const segments = [
    {
      key: 'all',
      label: t.segments.all,
      icon: ThumbsUp,
    },
    {
      key: 'business',
      label: t.segments.business,
      icon: Store,
      problem: t.segmentDetails.business.problem,
      solution: t.segmentDetails.business.solution,
      recommendedDevice: t.segmentDetails.business.recommendedDevice,
      priceRange: t.segmentDetails.business.priceRange,
    },
    {
      key: 'student',
      label: t.segments.student,
      icon: GraduationCap,
      problem: t.segmentDetails.student.problem,
      solution: t.segmentDetails.student.solution,
      recommendedDevice: t.segmentDetails.student.recommendedDevice,
      priceRange: t.segmentDetails.student.priceRange,
    },
    {
      key: 'officer',
      label: t.segments.officer,
      icon: Briefcase,
      problem: t.segmentDetails.officer.problem,
      solution: t.segmentDetails.officer.solution,
      recommendedDevice: t.segmentDetails.officer.recommendedDevice,
      priceRange: t.segmentDetails.officer.priceRange,
    },
  ];

  const currentSegment = segments.find((s) => s.key === selectedSegment) || segments[0];

  return (
    <div className="w-full">
      {/* 1. HERO BANNER */}
      <section className="relative bg-gradient-to-b from-blue-50/80 via-white to-slate-50/50 py-12 sm:py-16 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-4 h-4 text-blue-700" />
            <span>{t.heroBadge}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {t.heroTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t.heroDesc}
          </p>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12 text-slate-700">
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
            {t.comparisons.map((item) => {
              return (
                <div
                  key={item.id}
                  className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-all grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                >
                  <div className="md:col-span-5 space-y-1.5 border-b md:border-b-0 md:border-r border-slate-200 pb-3 md:pb-0 md:pr-4">
                    <div className="flex items-center gap-1.5 text-rose-600 font-bold text-xs uppercase tracking-wide">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{t.riskTag}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{item.riskTitle}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.riskDesc}</p>
                  </div>
                  <div className="md:col-span-7 space-y-1.5 md:pl-2">
                    <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs uppercase tracking-wide">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t.resultTag}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{item.resultTitle}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.resultDesc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. GIẢI PHÁP TƯƠNG TÁC CHO TỪNG NHÓM KHÁCH HÀNG (INTERACTIVE TABS) */}
        <section className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight">
              {t.solutionsTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              {t.solutionsDesc}
            </p>
          </div>

          {/* Interactive Category Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {segments.map((seg) => {
              const Icon = seg.icon;
              const isSelected = selectedSegment === seg.key;
              return (
                <button
                  key={seg.key}
                  type="button"
                  onClick={() => setSelectedSegment(seg.key as SegmentKey)}
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
              {/* Nhóm 1: Business */}
              <div className="p-5 rounded-2xl bg-white space-y-3 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-2">
                    <Store className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold uppercase">{t.segments.business}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2">
                    <strong>{t.concernLabel}</strong> {t.segmentDetails.business.problem}<br />
                    <strong>{t.actualResultLabel}</strong> {t.segmentDetails.business.solution}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 text-xs font-semibold text-blue-700">
                  {t.recommendedModelLabel} {t.segmentDetails.business.recommendedDevice}
                </div>
              </div>

              {/* Nhóm 2: Student */}
              <div className="p-5 rounded-2xl bg-white space-y-3 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center font-bold mb-2">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold uppercase">{t.segments.student}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2">
                    <strong>{t.concernLabel}</strong> {t.segmentDetails.student.problem}<br />
                    <strong>{t.actualResultLabel}</strong> {t.segmentDetails.student.solution}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 text-xs font-semibold text-orange-700">
                  {t.recommendedModelLabel} {t.segmentDetails.student.recommendedDevice}
                </div>
              </div>

              {/* Nhóm 3: Officer */}
              <div className="p-5 rounded-2xl bg-white space-y-3 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-2">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold uppercase">{t.segments.officer}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2">
                    <strong>{t.concernLabel}</strong> {t.segmentDetails.officer.problem}<br />
                    <strong>{t.actualResultLabel}</strong> {t.segmentDetails.officer.solution}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 text-xs font-semibold text-emerald-700">
                  {t.recommendedModelLabel} {t.segmentDetails.officer.recommendedDevice}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-white text-slate-900 space-y-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  {React.createElement(currentSegment.icon, { className: 'w-6 h-6' })}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{currentSegment.label}</h3>
                  <p className="text-xs text-slate-500">{t.specializedLabel}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200">
                  <span className="font-bold text-rose-700 uppercase block mb-1">{t.concernLabel}</span>
                  <p className="text-slate-700 leading-relaxed">{currentSegment.problem}</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <span className="font-bold text-emerald-700 uppercase block mb-1">{t.actualResultLabel}</span>
                  <p className="text-slate-700 leading-relaxed">{currentSegment.solution}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] text-slate-500 uppercase font-bold">{t.recommendedModelLabel}</span>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">{currentSegment.recommendedDevice}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-base font-black text-orange-600 font-mono">{currentSegment.priceRange}</span>
                  <Link
                    href={`/dat-lich?device=${encodeURIComponent(currentSegment.recommendedDevice || '')}`}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    {t.btnBookInspect}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 4. LỜI KẾT & NÚT HÀNH ĐỘNG */}
        <section className="p-7 sm:p-8 rounded-3xl bg-blue-50/70 border border-blue-200/80 text-center space-y-4">
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
              {t.btnBrowseInventory}
            </Link>
            <a
              href="tel:0909053058"
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5"
            >
              <Phone className="w-4 h-4" />
              <span>{t.btnHotline}</span>
            </a>
            <Link
              href="/dat-lich"
              className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>{t.btnBookOnsiteTech}</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
