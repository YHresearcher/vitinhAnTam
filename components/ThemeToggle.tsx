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
      <button
        type="button"
        onClick={toggleTheme}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
          isDark
            ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-slate-600'
            : 'bg-slate-100/80 border-slate-200 text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
        } ${className}`}
        aria-label={titleText}
        title={titleText}
      >
        <div className="flex items-center gap-2">
          {isDark ? (
            <Moon className="w-4 h-4 text-indigo-400" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
          <span>{isDark ? 'Giao diện Tối' : 'Giao diện Sáng'}</span>
        </div>
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
            isDark
              ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/60'
              : 'bg-amber-100 text-amber-800 border border-amber-200'
          }`}
        >
          {isDark ? 'Dark' : 'Light'}
        </span>
      </button>
    );
  }

  // Default 'icon' variant for header / navigation bar
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggleTheme();
      }}
      className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
        isDark
          ? 'bg-[#1C2541] border-[#2D3A66] text-amber-400 hover:bg-[#232F52] hover:text-amber-300 shadow-xs'
          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-2xs'
      } ${className}`}
      aria-label={titleText}
      title={titleText}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700 transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
}
