'use client';

import React from 'react';
import Link from 'next/link';
import { useViTinhAnTamStore } from '@/lib/store';
import { TRANSLATIONS } from '@/lib/translations';
import { MapPin, Send, Clock, ShieldCheck, CheckCircle, Lock } from 'lucide-react';

export function Footer() {
  const { currentLang, systemSettings } = useViTinhAnTamStore();
  const t = TRANSLATIONS[currentLang || 'vi'].footer;

  return (
    <footer id="chinh-sach" className="w-full bg-[#1C130E] border-t border-[#332219] pt-12 pb-10 text-[#D7CCC8] mt-16 shadow-[0_-4px_24px_rgba(0,0,0,0.2)] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 text-sm">
          {/* Cột 1: Trụ sở & Hotline */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#D9531E] flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#D9531E] shrink-0" strokeWidth={1.5} />
              <span>{t.hubTitle}</span>
            </h3>
            <p className="text-[#BCAAA4] text-xs leading-relaxed">
              {currentLang === 'en' ? t.hubAddress : (systemSettings.address || t.hubAddress)}
            </p>
            <div className="pt-1 space-y-1.5 text-xs text-[#BCAAA4]">
              <p>
                <strong className="text-white font-bold">{t.hotlineLabel}</strong>{' '}
                <a
                  href={`tel:${systemSettings.hotline.replace(/\./g, '')}`}
                  className="text-[#E67E22] font-bold hover:underline"
                >
                  {systemSettings.hotline || '0909.053.058'}
                </a>
              </p>
              <p>
                <strong className="text-white font-bold">{t.techSupportLabel}</strong>{' '}
                {t.techSupportValue}
              </p>
              <p>
                <strong className="text-white font-bold">{t.emailLabel}</strong>{' '}
                <a href={`mailto:${systemSettings.email}`} className="hover:text-white transition-colors">
                  {systemSettings.email || 'lienhe@vitinhantam.com'}
                </a>
              </p>
            </div>
          </div>

          {/* Cột 2: Bán kính phục vụ */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#D9531E] flex items-center gap-1.5">
              <Send className="w-4 h-4 text-[#D9531E] shrink-0" strokeWidth={1.5} />
              <span>{t.radiusTitle}</span>
            </h3>
            <p className="text-[#BCAAA4] text-xs leading-relaxed">{t.radiusDesc}</p>
            <ul className="text-xs space-y-1.5 text-[#BCAAA4]">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D9531E]" />
                <span>{t.tanAn}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D9531E]" />
                <span>{t.thuThua}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D9531E]" />
                <span>{t.chauThanh}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D9531E]" />
                <span>{t.tanTru}</span>
              </li>
            </ul>
          </div>

          {/* Cột 3: Giờ phục vụ */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#D9531E] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#D9531E] shrink-0" strokeWidth={1.5} />
              <span>{t.hoursTitle}</span>
            </h3>
            <div className="text-xs space-y-2 text-[#BCAAA4]">
              <div className="p-2.5 rounded-lg bg-[#271B14] border border-[#3E291F]">
                <strong className="text-white font-bold block mb-0.5">{t.weekdayTitle}</strong>
                <span>{t.weekdayIntake}</span><br />
                <span className="text-[#E67E22] font-semibold">{t.weekdayPriority}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#271B14] border border-[#3E291F]">
                <strong className="text-white font-bold block mb-0.5">{t.weekendTitle}</strong>
                <span>{t.weekendHours}</span>
              </div>
            </div>
          </div>

          {/* Cột 4: Cam kết */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#D9531E] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#D9531E] shrink-0" strokeWidth={1.5} />
              <span>{t.policiesTitle}</span>
            </h3>
            <ul className="text-xs space-y-2 text-[#BCAAA4]">
              <li className="flex items-start gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>{t.swapPolicy}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>{t.privacyPolicy}</span>
              </li>
            </ul>
            {/* Trust Signals */}
            <div className="pt-2 border-t border-[#3E291F]">
              <p className="text-[10px] font-bold text-[#8D7B73] uppercase tracking-wider mb-2">
                {currentLang === 'en' ? 'AN TAM COMMITMENTS' : 'CAM KẾT AN TÂM'}
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {(() => {
                  const signals = TRANSLATIONS[currentLang || 'vi'].footerTrust?.signals;
                  return signals ? signals.map((s, i) => (
                    <span key={i} className="flex items-center gap-1 text-[10px] text-[#BCAAA4]">
                      <CheckCircle className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                      <span>{s}</span>
                    </span>
                  )) : null;
                })()}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-[#332219] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8D7B73]">
          <p>© {new Date().getFullYear()} Vi Tính An Tâm (vitinhantam.com) - {currentLang === 'en' ? 'Sold with Care, Keeping You Carefree.' : 'Bán bằng tâm để bạn an tâm.'}</p>
          <div className="flex flex-wrap items-center gap-5">
            <a className="hover:text-[#E67E22] transition-colors font-medium" href="#chinh-sach">
              {t.warrantyTerms}
            </a>
            <Link className="hover:text-[#E67E22] transition-colors flex items-center gap-1.5 font-medium" href="/login">
              <Lock className="w-3.5 h-3.5 text-[#D9531E]" strokeWidth={1.5} />
              <span>{t.internalLogin}</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
