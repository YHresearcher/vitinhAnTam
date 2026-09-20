'use client';

import React from 'react';
import Link from 'next/link';
import { useViTinhAnTamStore } from '@/lib/store';
import { MapPin, Send, Clock, ShieldCheck, CheckCircle, Lock } from 'lucide-react';
import { translations } from '@/lib/i18n';

export function Footer() {
  const { currentLang } = useViTinhAnTamStore();
  const t = translations[currentLang].footer;

  return (
    <footer className="w-full bg-white border-t border-slate-200 pt-10 pb-10 text-slate-600 mt-16 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 text-sm">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-700 shrink-0" />
              <span>{t.hubTitle}</span>
            </h3>
            <p className="text-slate-600 text-xs leading-relaxed">{t.hubAddress}</p>
            <div className="pt-1 space-y-1.5 text-xs text-slate-600">
              <p><strong className="text-slate-900 font-bold">{t.hotlineZalo}</strong></p>
              <p><strong className="text-slate-900 font-bold">{t.supportHours}</strong></p>
              <p><strong className="text-slate-900 font-bold">{t.email}</strong></p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
              <Send className="w-4 h-4 text-blue-700 shrink-0" />
              <span>{t.serviceRadiusTitle}</span>
            </h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              {t.serviceRadiusDesc}
            </p>
            <ul className="text-xs space-y-1.5 text-slate-600">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-700" />
                <span>{t.radius1}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-700" />
                <span>{t.radius2}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-700" />
                <span>{t.radius3}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-700" />
                <span>{t.radius4}</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-700 shrink-0" />
              <span>{t.hoursTitle}</span>
            </h3>
            <div className="text-xs space-y-2 text-slate-600">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <strong className="text-slate-900 font-bold block mb-0.5">{t.weekdays}</strong>
                <span>{t.weekdaysReception}</span><br />
                <span className="text-blue-700 font-semibold">{t.weekdaysPriority}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <strong className="text-slate-900 font-bold block mb-0.5">{t.weekends}</strong>
                <span>{t.weekendsFull}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
              <span>{t.policyTitle}</span>
            </h3>
            <ul className="text-xs space-y-2 text-slate-600">
              <li className="flex items-start gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{t.policy1}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{t.policy2}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>{t.copyright}</p>
          <div className="flex flex-wrap items-center gap-5">
            <a className="hover:text-blue-700 transition-colors font-medium" href="#chinh-sach">
              {t.warrantyTerms}
            </a>
            <Link className="hover:text-blue-700 transition-colors flex items-center gap-1.5 font-medium" href="/login">
              <Lock className="w-3.5 h-3.5 text-blue-700" />
              <span>{t.adminLogin}</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
