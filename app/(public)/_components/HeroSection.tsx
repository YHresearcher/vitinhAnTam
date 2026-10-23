'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface HeroSectionProps {
  onSearchSubmit: (e: React.FormEvent, query: string) => void;
  searchInput: string;
  setSearchInput: (value: string) => void;
  isEn: boolean;
  t: any;
}

export default function HeroSection({
  onSearchSubmit,
  searchInput,
  setSearchInput,
  isEn,
  t
}: HeroSectionProps) {
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(e, searchInput);
  };

  return (
    <section className="bg-gradient-to-b from-[#FDFBF7] via-white to-[#F8FAFC] border-b border-slate-200/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top status bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 pb-5 border-b border-slate-200/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-[#FBE8DE] text-[#C0392B] tracking-wide font-semibold">
              {t.hero.badgeOpen || 'CỬA HÀNG MỞ CỬA'} 7:30 - 21:00
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-[#6E5D53]">
              {t.hero.location || '📍'} {t.hero.locationDetail}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="tel:+84775175088"
              className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-[#6E5D53] font-mono hover:bg-slate-50"
            >
              ☎️ 0775 175 088
            </Link>
            <Link
              href="https://zalo.me/0909053058"
              target="_blank"
              className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-[#C0392B] text-white font-bold hover:bg-[#A93226]"
            >
              Zalo
            </Link>
          </div>
        </div>
{/* Main Hero Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-10 lg:py-14">
          {/* Left Column: Text + CTA */}
          <div className="lg:col-span-7 space-y-6">
            <div className="max-w-3xl space-y-4">
              <h1 className="text-3xl sm:text-5xl font-black text-[#1A0F0A] tracking-tight leading-tight">
                <span className="inline-block bg-gradient-to-r from-[#C0392B] to-[#D9531E] bg-clip-text text-transparent">
                  {isEn ? 'Enterprise-Grade' : 'MÁY TÍNH CŨ'}
                </span>
                <br />
                <span className="text-[#C0392B]">{t.hero.title}</span>
              </h1>
              <p className="text-base sm:text-lg text-[#6E5D53] leading-relaxed">
                {t.hero.description || (isEn
                  ? 'Dell/Lenovo/HP refurbished desktop & laptop. Genuine digital OEM license. Ready stock in Long An, Tay Ninh.'
                  : 'Máy đồng bộ Dell/Lenovo/HP, laptop doanh nhân. Key Windows bản quyền số vĩnh viễn. Có sẵn tại phường Long An, tỉnh Tây Ninh')}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/danh-muc-san-pham"
                className="inline-flex items-center px-6 py-3.5 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-sm tracking-wide shadow-lg"
              >
                {t.hero.ctaBrowse || (isEn ? 'Browse Products' : 'XEM SẢN PHẨM')}
              </Link>

              <Link
                href="/vi-sao-chon-an-tam"
                className="inline-flex items-center px-6 py-3.5 rounded-xl bg-black hover:bg-neutral-900 text-white font-bold text-sm tracking-wide shadow-lg"
              >
                {t.hero.ctaWhyUs || (isEn ? 'Why Choose Us' : 'VÌ SAO CHỌN AN TÂM')}
              </Link>
            </div>

            {/* Search Form */}
            <div className="pt-2 rounded-xl bg-white/70 border border-slate-200/60 backdrop-blur-sm p-4 max-w-xl">
              <form className="flex gap-2" onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={t.hero.searchPlaceholder || 'Serial Tag / SĐT'}
                  className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-lg bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-xs"
                >
                  Tra Cứu
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Image */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200/90 aspect-16/11 group bg-slate-100">
              <Image
                src="/images/hero-showroom.jpg"
                alt="Showroom"
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Bottom Stats Strip */}
        <div className="border-t border-slate-200/80 py-6 grid grid-cols-2 divide-x divide-slate-200/80">
          <div className="px-2 sm:px-6 text-center sm:text-left">
            <div className="text-2xl sm:text-3xl font-black text-[#C0392B] font-mono">
              100%
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-800 mt-0.5">
              {isEn ? 'Component transparency' : 'Minh bạch linh kiện'}
            </div>
          </div>
          <div className="px-2 sm:px-6 text-center sm:text-left">
            <div className="text-2xl sm:text-3xl font-black text-[#1A0F0A] font-mono">
              {isEn ? 'Dedicated' : 'Tận Tâm'}
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-800 mt-0.5">
              {isEn ? 'Prompt assistance' : 'Hỗ trợ nhanh chóng'}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
