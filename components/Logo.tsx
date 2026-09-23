'use client';

import React from 'react';
import { useViTinhAnTamStore } from '@/lib/store';
import { TRANSLATIONS } from '@/lib/translations';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  slogan?: string;
}

export function Logo({ className = 'h-10 w-auto', variant = 'light', slogan }: LogoProps) {
  const { currentLang } = useViTinhAnTamStore();
  const currentSlogan =
    slogan ||
    TRANSLATIONS[currentLang || 'vi']?.navbar?.slogan ||
    (currentLang === 'en' ? 'Sold with Care, Keeping You Carefree' : 'Bán bằng tâm để bạn an tâm');

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Sắc Lư Trung Hỏa - Chiếc Khiên An Tâm Đỏ Gạch & Cam Cháy */}
      <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-[#C0392B] to-[#D9531E] flex items-center justify-center shadow-md shadow-[#C0392B]/20 shrink-0 group transition-transform hover:scale-105">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          className="w-5 h-5 text-white drop-shadow-xs"
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

      {/* Typography: VI TÍNH (Nâu Đất) + AN TÂM (Đỏ Gạch) */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1">
          <span className={`font-black text-base tracking-tight ${variant === 'dark' ? 'text-white' : 'text-[#2B1810]'}`}>
            VI TÍNH
          </span>
          <span className="font-black text-base tracking-tight text-[#C0392B]">
            AN TÂM
          </span>
        </div>
        <span className={`text-[10px] font-semibold tracking-wider uppercase mt-0.5 ${variant === 'dark' ? 'text-slate-400' : 'text-[#6E5D53]'}`}>
          {currentSlogan}
        </span>
      </div>
    </div>
  );
}
