'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Check } from 'lucide-react';
import { useViTinhAnTamStore } from '@/lib/store';
import { TRANSLATIONS } from '@/lib/translations';

interface ServicesSectionProps {
  isEn: boolean;
  t: any;
}

export default function ServicesSection({ isEn, t }: ServicesSectionProps) {
  return (
    <section className="bg-[#FAF7F2] border-y border-[#E8E2D9] py-16 scroll-mt-20" id="dich-vu-spa">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Service Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Gói 1 */}
          <div className="p-6 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs flex flex-col justify-between hover:border-[#C0392B] transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-[#FAF7F2] text-[#C0392B] flex items-center justify-center font-bold">01</div>
                <div className="text-xs px-2 py-1 rounded bg-slate-100"><Clock className="w-3 h-3 inline" /> 30-45 phút</div>
              </div>
              <h3 className="text-lg font-bold text-[#2B1810]">{t.services.pkg1Title}</h3>
              <p className="text-xs text-[#6E5D53]">{t.services.pkg1Desc}</p>
            </div>
            <div className="pt-4 border-t mt-4">
              <Link href={`/dat-lich?service=${encodeURIComponent(t.services.pkg1Title)}`} className="w-full py-2.5 rounded-lg bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-xs text-center block">
                {t.services.btnBookPkg}
              </Link>
            </div>
          </div>

          {/* Gói 2 */}
          <div className="p-6 rounded-2xl bg-white border border-[#C0392B] shadow-md flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-[#C0392B] text-white flex items-center justify-center font-bold">02</div>
                <div className="text-xs px-2 py-1 rounded bg-[#C0392B]/10 text-[#C0392B]"><Clock className="w-3 h-3 inline" /> 1-1.5 tiếng</div>
              </div>
              <h3 className="text-lg font-bold text-[#2B1810]">{t.services.pkg2Title}</h3>
              <p className="text-xs text-[#6E5D53]">{t.services.pkg2Desc}</p>
            </div>
            <div className="pt-4 border-t mt-4">
              <Link href={`/dat-lich?service=${encodeURIComponent(t.services.pkg2Title)}`} className="w-full py-2.5 rounded-lg bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-xs text-center block">
                {t.services.btnBookPkg}
              </Link>
            </div>
          </div>

          {/* Gói 3 */}
          <div className="p-6 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs flex flex-col justify-between hover:border-[#C0392B] transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-[#FAF7F2] text-[#C0392B] flex items-center justify-center font-bold">03</div>
                <div className="text-xs px-2 py-1 rounded bg-slate-100"><Clock className="w-3 h-3 inline" /> 20-40 phút</div>
              </div>
              <h3 className="text-lg font-bold text-[#2B1810]">{t.services.pkg3Title}</h3>
              <p className="text-xs text-[#6E5D53]">{t.services.pkg3Desc}</p>
            </div>
            <div className="pt-4 border-t mt-4">
              <Link href={`/dat-lich?service=${encodeURIComponent(t.services.pkg3Title)}`} className="w-full py-2.5 rounded-lg bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-xs text-center block">
                {t.services.btnBookPkg}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
