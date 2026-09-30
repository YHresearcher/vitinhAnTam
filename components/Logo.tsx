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
  // Không ghép thêm SystemBrandIcon, tên hoặc slogan mặc định vào logo tùy chỉnh.
  if (customLogoUrl) {
    return (
      <div className={`flex items-center select-none ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={customLogoUrl}
          alt={systemSettings?.storeName || 'Logo'}
          className="h-12 sm:h-14 md:h-16 w-auto max-h-16 max-w-[360px] sm:max-w-[440px] object-contain transition-transform hover:scale-105"
        />
      </div>
    );
  }

}

