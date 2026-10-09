'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatVND } from '@/lib/supabase';
import { Cpu, Zap, HardDrive, CheckCircle, ScanLine, ArrowRight, MessageSquare, Gift } from 'lucide-react';
import { TrustBadge } from './TrustBadge';
import type { ShowcaseItem } from '@/lib/productsData';
import { useViTinhAnTamStore } from '@/lib/store';
import { TRANSLATIONS } from '@/lib/translations';

interface FeaturedProductCardProps {
  product: ShowcaseItem;
  onInspect?: (product: ShowcaseItem) => void;
}

export function FeaturedProductCard({ product, onInspect }: FeaturedProductCardProps) {
  const { currentLang, systemSettings } = useViTinhAnTamStore();
  const isEn = currentLang === 'en';
  const t = TRANSLATIONS[currentLang || 'vi'];

  const trustBadges = [
    product.grade ? <TrustBadge key="grade" label={product.grade} variant="grade" /> : null,
    <TrustBadge key="warranty" label={`BH ${product.warrantyMonths || 12}T máy`} variant="warranty" size="sm" />,
    product.testDuration ? <TrustBadge key="test" label={`Test ${product.testDuration}p FurMark`} variant="test" size="sm" /> : null,
    <TrustBadge key="os" label="Win Pro DL" variant="os" size="sm" />,
  ].filter(Boolean);

  return (
    <article
      className="group bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden"
    >
      {/* Image & Stock Badge */}
      <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
        <Image
          src={product.img}
          alt={product.name}
          fill
          priority={false}
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[85%]">
          <span className="px-2.5 py-1 rounded-md bg-emerald-700 text-white text-[11px] font-bold tracking-tight shadow-xs flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" aria-hidden="true" />
            <span>{t.products.inStockBadge || 'SẴN KHO'}</span>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-[#2B1810]/90 backdrop-blur-xs text-white text-[10px] font-semibold">
            {product.isSold ? t.products.soldBadge : `Còn ${product.stockCount} máy`}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-[#C0392B] transition-colors">
            {product.name}
          </h3>
          <div className="text-2xl font-black text-[#C0392B] font-mono tracking-tight mt-1">
            {formatVND(product.price)}
          </div>
          <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
            {product.desc}
          </p>

          {/* Trust Badges Row */}
          <div className="mt-3 flex flex-wrap gap-2">
            {trustBadges}
          </div>

          {/* Specs Grid */}
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate font-mono">{product.specs.cpu}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate font-mono">{product.specs.ram}</span>
            </div>
            <div className="flex items-center gap-2">
              <HardDrive className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate font-mono">{product.specs.storage}</span>
            </div>
            <div className="flex items-center gap-2 pt-0.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate font-medium text-emerald-800">{product.specs.highlight}</span>
            </div>
          </div>

          {/* Gift badge */}
          {product.specs.gift && (
            <div className="mt-3.5 p-2 rounded-lg bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-1.5">
              <Gift className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span className="leading-snug">{product.specs.gift}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-3 flex items-center gap-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onInspect?.(product)}
            className="flex-1 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <ScanLine className="w-3.5 h-3.5 text-slate-500" />
            <span>{t.products.btnInspect}</span>
          </button>
          <Link
            href={`/mua-hang?device=${encodeURIComponent(product.name)}&price=${product.price}&tag=${encodeURIComponent(product.serviceTag || '')}`}
            className="flex-1 py-2.5 rounded-lg bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-xs text-center transition-colors shadow-2xs flex items-center justify-center gap-1"
          >
            <span>{t.products.btnOrder}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}