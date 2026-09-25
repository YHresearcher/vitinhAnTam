'use client';

import React from 'react';
import { useViTinhAnTamStore } from '@/lib/store';
import { TRANSLATIONS } from '@/lib/translations';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  slogan?: string;
}

export function Logo({ className = 'h-auto w-auto', variant = 'light', slogan }: LogoProps) {
  const { currentLang, systemSettings } = useViTinhAnTamStore();
  const currentSlogan =
    slogan ||
    systemSettings?.brandSlogan ||
    TRANSLATIONS[currentLang || 'vi']?.navbar?.slogan ||
    (currentLang === 'en' ? 'Sold with Care, Keeping You Carefree' : 'Bán bằng tâm để bạn an tâm');

  const customLogoUrl = systemSettings?.logoUrl?.trim();
  const displayMode = systemSettings?.logoDisplayMode || 'icon_with_text';

  // Chế độ 1: Chỉ hiển thị hình ảnh Logo đầy đủ (dành cho banner logo ngang)
  if (customLogoUrl && displayMode === 'image_only') {
    return (
      <div className={`flex items-center select-none ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={customLogoUrl}
          alt={systemSettings?.storeName || 'Vi Tính An Tâm'}
          className="h-12 sm:h-14 md:h-16 w-auto max-h-16 max-w-[360px] sm:max-w-[440px] object-contain transition-transform hover:scale-105"
        />
      </div>
    );
  }

  // Chế độ 2 (Mặc định): Biểu tượng Logo + Tên thương hiệu & Slogan
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {customLogoUrl ? (
        <div className="shrink-0 flex items-center justify-center transition-transform hover:scale-105">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={customLogoUrl}
            alt={systemSettings?.storeName || 'Logo'}
            className="h-12 sm:h-14 md:h-16 w-auto max-h-16 max-w-[180px] sm:max-w-[220px] object-contain"
          />
        </div>
      ) : (
        /* Sắc Lư Trung Hỏa - Chiếc Khiên An Tâm Đỏ Gạch & Cam Cháy */
        <div className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-xl bg-gradient-to-br from-[#C0392B] to-[#D9531E] flex items-center justify-center shadow-md shadow-[#C0392B]/20 shrink-0 group transition-transform hover:scale-105">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            className="w-7 h-7 sm:w-7.5 sm:h-7.5 text-white drop-shadow-xs"
          >
            <path
              d="M12 2l7 3.5v5.5c0 5-3.5 9.5-7 11-3.5-1.5-7-6-7-11V5.5L12 2z"
              fill="currentColor"
              fillOpacity="0.15"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
            <path
              d="M9 12l2 2 4-4"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      {/* Typography: Tên thương hiệu & Slogan GIẢM X2 (tinh tế, nhỏ gọn, không lấn át logo) */}
      <div className="flex flex-col leading-tight justify-center">
        <div className="flex items-center gap-1">
          <span className={`font-black text-xs sm:text-sm tracking-tight ${variant === 'dark' ? 'text-white' : 'text-[#2B1810]'}`}>
            {systemSettings?.storeName ? systemSettings.storeName.split(' ')[0] : 'VI TÍNH'}
          </span>
          <span className="font-black text-xs sm:text-sm tracking-tight text-[#C0392B]">
            {systemSettings?.storeName ? systemSettings.storeName.split(' ').slice(1).join(' ') : 'AN TÂM'}
          </span>
        </div>
        <span className={`text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase mt-0.5 ${variant === 'dark' ? 'text-slate-400' : 'text-[#6E5D53]'}`}>
          {currentSlogan}
        </span>
      </div>
    </div>
  );
}
