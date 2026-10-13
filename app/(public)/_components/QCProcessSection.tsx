'use client';

import React from 'react';
import { useViTinhAnTamStore } from '@/lib/store';
import { TRANSLATIONS } from '@/lib/translations';

interface QCProcessSectionProps {
  isEn: boolean;
  t: any;
}

export default function QCProcessSection({ isEn, t }: QCProcessSectionProps) {
  return (
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
  );
}
