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
    (currentLang === 'en' ? 'Sold from the Heart, Safe from the Start' : 'Bán bằng tâm để bạn an tâm');

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Sắc Cam Năng Lượng - Biểu tượng Chiếc Khiên Công Nghệ An Tâm */}
      <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md shadow-orange-500/25 shrink-0 group transition-transform hover:scale-105">
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

      {/* Typography: VI TÍNH (Dark Slate) + AN TÂM (Royal Blue) */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1">
          <span className={`font-black text-base tracking-tight ${variant === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            VI TÍNH
          </span>
          <span className="font-black text-base tracking-tight text-blue-700">
            AN TÂM
          </span>
        </div>
        <span className={`text-[10px] font-bold tracking-wider uppercase mt-0.5 ${variant === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
          {currentSlogan}
        </span>
      </div>
    </div>
  );
}
