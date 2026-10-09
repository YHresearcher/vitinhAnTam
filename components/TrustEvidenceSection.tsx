'use client';

import React from 'react';
import Link from 'next/link';
import { useViTinhAnTamStore } from '@/lib/store';
import { TRANSLATIONS } from '@/lib/translations';
import { ShieldCheck, Cpu, HardDrive, ArrowRight } from 'lucide-react';

interface TrustEvidenceSectionProps {
  className?: string;
}

export function TrustEvidenceSection({ className = '' }: TrustEvidenceSectionProps) {
  const { currentLang } = useViTinhAnTamStore();
  const isEn = currentLang === 'en';
  const t = TRANSLATIONS[currentLang || 'vi'];
  const trust = t.trustEvidence;

  const columns = [
    {
      icon: Cpu,
      title: trust.process.title,
      items: trust.process.items,
      iconColor: 'text-[#C0392B]',
      bgColor: 'bg-[#FBE8DE]',
    },
    {
      icon: HardDrive,
      title: trust.components.title,
      items: trust.components.items,
      iconColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
    },
    {
      icon: ShieldCheck,
      title: trust.warranty.title,
      items: trust.warranty.items,
      iconColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      cta: trust.warranty.cta,
      href: '/tra-cuu-bao-hanh',
    },
  ];

  return (
    <section
      className={`py-12 lg:py-16 bg-white border-y border-[#E8E2D9] ${className}`}
      aria-labelledby="trust-evidence-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBE8DE] text-[#C0392B] border border-[#F2C4B2] text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{trust.tag}</span>
          </span>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((col, idx) => (
            <article
              key={idx}
              className="p-6 rounded-2xl border border-[#E8E2D9] bg-white hover:border-[#C0392B] hover:shadow-md transition-all duration-300 flex flex-col"
            >
              <header className="flex items-center gap-3 mb-5">
                <div className={`p-2.5 rounded-xl ${col.bgColor} shrink-0`}>
                  <col.icon className={`w-5 h-5 ${col.iconColor}`} aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-[#2B1810]">{col.title}</h3>
              </header>

              <ul className="space-y-3 flex-1 text-xs text-[#6E5D53] leading-relaxed">
                {col.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 mt-2 flex-shrink-0 rounded-full bg-[#C0392B]" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {col.cta && col.href && (
                <footer className="mt-6 pt-4 border-t border-[#E8E2D9]">
                  <Link
                    href={col.href}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-xs tracking-wide transition-all shadow-xs"
                  >
                    <span>{col.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </Link>
                </footer>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}