'use client';

import React, { useState } from 'react';
import { useViTinhAnTamStore } from '@/lib/store';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  hideSlogan?: boolean;
}

export function Logo({ className = '', variant = 'light', hideSlogan = false }: LogoProps) {
  const { currentLang, systemSettings } = useViTinhAnTamStore();
  const [hasError, setHasError] = useState(false);

  // Đường dẫn ảnh logo
  const logoSrc = systemSettings?.logoUrl?.trim() || '/img/header/logo.png';
  const isEn = currentLang === 'en';
  const sloganText = isEn ? 'Sold with Care, Keeping You Carefree' : 'Bán bằng tâm để bạn an tâm';

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Biểu tượng Logo / Image */}
      <div className="shrink-0 flex items-center justify-center">
        {!hasError && logoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoSrc}
            alt="Logo Vi Tính An Tâm"
            onError={() => setHasError(true)}
            className="h-10 sm:h-11 md:h-12 w-auto max-h-12 max-w-[120px] object-contain transition-transform hover:scale-105"
          />
        ) : (
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-[#C0392B] to-[#E67E22] text-white flex items-center justify-center font-black text-sm sm:text-base shadow-sm tracking-wider">
            VT
          </div>
        )}
      </div>

      {/* Brand Name & Slogan (Hardcoded & Bất Biến) */}
      <div className="flex flex-col leading-none text-left justify-center">
        <div className="flex items-center gap-1 sm:gap-1.5 whitespace-nowrap">
          <span
            className={`font-black text-base sm:text-lg lg:text-[19px] tracking-tight uppercase ${
              variant === 'dark' ? 'text-white' : 'text-[#2B1810]'
            }`}
          >
            VI TÍNH
          </span>
          <span className="font-black text-base sm:text-lg lg:text-[19px] tracking-tight text-[#C0392B] uppercase">
            AN TÂM
          </span>
        </div>
        {!hideSlogan && (
          <span
            className={`text-[10px] sm:text-[11px] lg:text-[11.5px] font-semibold tracking-wide whitespace-nowrap mt-1 uppercase ${
              variant === 'dark' ? 'text-slate-300' : 'text-[#6E5D53]'
            }`}
          >
            {sloganText}
          </span>
        )}
      </div>
    </div>
  );
}


