'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Tooltip } from 'antd';
import { useViTinhAnTamStore } from '@/lib/store';

interface ThemeToggleProps {
  variant?: 'icon' | 'pill' | 'switch';
  className?: string;
}

export function ThemeToggle({ variant = 'icon', className = '' }: ThemeToggleProps) {
  const { themeMode, toggleTheme } = useViTinhAnTamStore();
  const isDark = themeMode === 'dark';

  const titleText = isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối';

  if (variant === 'pill') {
    return (
      <Tooltip title={titleText} placement="bottom">
        <button
          type="button"
          onClick={toggleTheme}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
            isDark
              ? 'bg-[#1C2541] border-[#2D3A66] text-[#F1F5F9] hover:bg-[#232F52] hover:border-[#3A4B7C] shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
          } ${className}`}
          aria-label={titleText}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
          <span>{isDark ? 'Giao diện Tối' : 'Giao diện Sáng'}</span>
        </button>
      </Tooltip>
    );
  }

  // Default 'icon' variant for header / navigation bar
  return (
    <Tooltip title={titleText} placement="bottom">
      <button
        type="button"
        onClick={toggleTheme}
        className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
          isDark
            ? 'bg-[#1C2541] border-[#2D3A66] text-amber-400 hover:bg-[#232F52] hover:text-amber-300 shadow-xs'
            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-2xs'
        } ${className}`}
        aria-label={titleText}
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-slate-700 transition-transform duration-300 hover:-rotate-12" />
        )}
      </button>
    </Tooltip>
  );
}
