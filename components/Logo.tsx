'use client';

import React from 'react';
import { useViTinhAnTamStore } from '@/lib/store';

interface LogoProps {
  className?: string;
}

export function Logo({ className = 'h-auto w-auto' }: LogoProps) {
  const { systemSettings } = useViTinhAnTamStore();
  const customLogoUrl = systemSettings?.logoUrl?.trim();

  // Logo tùy chỉnh luôn thay thế hoàn toàn logo hệ thống và phần nhận diện mặc định.
  if (customLogoUrl) {
    return (
      <div className={`flex items-center select-none ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={customLogoUrl}
          alt={systemSettings?.storeName || 'Logo Vi Tính An Tâm'}
          className="h-11 sm:h-12 w-auto max-h-14 max-w-[260px] sm:max-w-[340px] object-contain transition-transform hover:scale-102"
        />
      </div>
    );
  }

  // Graceful Default Branding khi chưa upload ảnh logo
  const storeName = systemSettings?.storeName || 'Vi Tính An Tâm';
  const parts = storeName.split(' ');
  const firstPart = parts[0] || 'VI TÍNH';
  const restPart = parts.slice(1).join(' ') || 'AN TÂM';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#C0392B] to-[#E67E22] text-white flex items-center justify-center font-black text-sm shadow-xs tracking-wider">
        VT
      </div>
      <div className="flex flex-col leading-none text-left">
        <div className="flex items-center gap-1">
          <span className="font-black text-base sm:text-lg text-slate-900 tracking-tight">{firstPart}</span>
          <span className="font-black text-base sm:text-lg text-[#C0392B] tracking-tight">{restPart}</span>
        </div>
        <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase mt-0.5">
          {systemSettings?.brandSlogan || 'Bán bằng tâm để bạn an tâm'}
        </span>
      </div>
    </div>
  );
}

