'use client';

import React from 'react';
import { useViTinhAnTamStore } from '@/lib/store';

interface ThemeToggleProps {
  variant?: 'icon' | 'pill' | 'switch';
  className?: string;
}

export function ThemeToggle({ variant = 'icon', className = '' }: ThemeToggleProps) {
  const { themeMode, toggleTheme } = useViTinhAnTamStore();
  const isDark = themeMode === 'dark';

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
          isDark
            ? 'bg-[#1C2541] border-[#2D3A66] text-[#F1F5F9] hover:bg-[#232F52] hover:border-[#3A4B7C] shadow-xs'
            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
        } ${className}`}
        title={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối (Dark Blue)'}
        aria-label="Đổi giao diện Sáng / Tối"
      >
        <span className="text-sm leading-none">{isDark ? '☀️' : '🌙'}</span>
        <span>{isDark ? 'Giao diện Tối' : 'Giao diện Sáng'}</span>
      </button>
    );
  }

  if (variant === 'switch') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`flex items-center justify-between w-full px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
          isDark
            ? 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1C2541]'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        } ${className}`}
        title={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối (Dark Blue)'}
      >
        <span>Chế độ hiển thị</span>
        <span className="inline-flex items-center gap-1 font-bold text-[11px] px-2 py-0.5 rounded-full border border-current">
          <span>{isDark ? '☀️ Sáng' : '🌙 Tối'}</span>
        </span>
      </button>
    );
  }

  // Default 'icon' variant for public navbar
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
        isDark
          ? 'bg-[#1C2541] border border-[#2D3A66] text-amber-400 hover:bg-[#232F52] hover:text-amber-300 shadow-xs'
          : 'bg-[#EFE9DF] border border-[#E8E2D9] text-slate-700 hover:text-[#C0392B] hover:bg-[#FAF7F2] shadow-2xs'
      } ${className}`}
      title={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối (Dark Blue)'}
      aria-label="Đổi giao diện Sáng / Tối"
    >
      {isDark ? (
        // Sun icon for switching back to light
        <svg
          className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        // Moon icon for switching to dark blue
        <svg
          className="w-4 h-4 text-slate-700 transition-transform hover:-rotate-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
}
