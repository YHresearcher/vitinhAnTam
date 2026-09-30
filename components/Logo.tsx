'use client';

import React from 'react';
import { useViTinhAnTamStore } from '@/lib/store';
import { TRANSLATIONS } from '@/lib/translations';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  slogan?: string;
}

/**
 * Biểu tượng Logo Hệ Thống Mới - Vi Tính An Tâm (Sắc Lư Trung Hỏa)
 * Tích hợp vi mạch công nghệ, lõi khiên bảo hộ tâm đức và ánh kim quang hiện đại
 */
export function SystemBrandIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <div
      className={`relative rounded-xl bg-gradient-to-br from-[#C0392B] via-[#D9531E] to-[#F39C12] p-[1.5px] shadow-md shadow-[#C0392B]/20 shrink-0 group transition-transform hover:scale-105 flex items-center justify-center ${className}`}
    >
      <div className="w-full h-full bg-gradient-to-br from-[#B03A2E] via-[#C0392B] to-[#D9531E] rounded-[10px] flex items-center justify-center p-1.5 overflow-hidden relative">
        {/* Ánh sáng phản chiếu chéo nhẹ */}
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-white/15 rounded-full blur-xs pointer-events-none" />
        
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 36 36"
          fill="none"
          className="w-full h-full text-white drop-shadow-xs"
        >
          {/* Vòng mạch công nghệ kết nối (Tech nodes) */}
          <path
            d="M6 13h4M26 13h4M6 23h4M26 23h4M18 4v4M18 28v4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeOpacity="0.4"
          />
          <circle cx="6" cy="13" r="1.2" fill="currentColor" fillOpacity="0.7" />
          <circle cx="30" cy="13" r="1.2" fill="currentColor" fillOpacity="0.7" />
          <circle cx="6" cy="23" r="1.2" fill="currentColor" fillOpacity="0.7" />
          <circle cx="30" cy="23" r="1.2" fill="currentColor" fillOpacity="0.7" />
          <circle cx="18" cy="4" r="1.2" fill="currentColor" fillOpacity="0.7" />

          {/* Viền Khiên Công Nghệ An Tâm */}
          <path
            d="M18 7.5L27 11.5v7.5c0 6.5-4.5 11.5-9 13.5-4.5-2-9-7-9-13.5V11.5L18 7.5z"
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Lõi Chữ [AT] & Dấu Chứng Nhận Tận Tâm */}
          <path
            d="M14 19l3 3 5.5-6"
            stroke="#FFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18 10v2"
            stroke="#FFE082"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
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

  // Chế độ 2 (Mặc định): Biểu tượng Logo Hệ Thống Mới + Tên thương hiệu & Slogan
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
        <SystemBrandIcon className="w-11 h-11 sm:w-12 sm:h-12" />
      )}

      {/* Typography: Tên thương hiệu & Slogan (Đồng bộ một màu thương hiệu duy nhất) */}
      <div className="flex flex-col leading-tight justify-center">
        <span className={`font-black text-xs sm:text-sm tracking-tight ${variant === 'dark' ? 'text-white' : 'text-[#C0392B]'}`}>
          {systemSettings?.storeName || 'Vi Tính An Tâm'}
        </span>
        <span className={`text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase mt-0.5 ${variant === 'dark' ? 'text-slate-400' : 'text-[#6E5D53]'}`}>
          {currentSlogan}
        </span>
      </div>
    </div>
  );
}

