'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { SyncStatusBadge } from './SyncStatusBadge';
import { useViTinhAnTamStore } from '@/lib/store';

export function Navbar() {
  const pathname = usePathname();
  const { currentUser, isLoggedIn, logout, systemSettings, currentLang, setLang } = useViTinhAnTamStore();

  const isEn = currentLang === 'en';

  return (
    <header className="sticky top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner Bar */}
      <div className="w-full bg-blue-50/90 border-b border-blue-100 text-xs py-1.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-700 text-xs">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-700 animate-pulse" />
            <span>
              {isEn ? 'Phục vụ tận nơi Long An - Tây Ninh • Hotline: ' : 'Phục vụ tận nơi Long An - Tây Ninh • Hotline: '}
              <a href={`tel:${systemSettings.hotline.replace(/\D/g, '')}`} className="text-orange-600 font-bold hover:underline">
                {systemSettings.hotline}
              </a>
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Sync Badge */}
            <SyncStatusBadge />

            {/* Language Switcher Vi / En */}
            <div className="inline-flex items-center rounded-lg bg-white border border-slate-200 p-0.5 shadow-2xs text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setLang('vi')}
                className={`px-2 py-0.5 rounded-md transition-all flex items-center gap-1 ${
                  !isEn
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-blue-700 hover:bg-slate-50'
                }`}
                title="Tiếng Việt (Mặc định)"
              >
                <span>🇻🇳</span>
                <span>VI</span>
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2 py-0.5 rounded-md transition-all flex items-center gap-1 ${
                  isEn
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-blue-700 hover:bg-slate-50'
                }`}
                title="English"
              >
                <span>🇬🇧</span>
                <span>EN</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          <Link
            href="/"
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              pathname === '/'
                ? 'bg-blue-50 text-blue-800 font-bold'
                : 'text-slate-600 hover:text-blue-700 hover:bg-slate-100'
            }`}
          >
            {isEn ? 'Home' : 'Trang chủ'}
          </Link>
          <Link
            href="/vi-sao-chon-an-tam"
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              pathname === "/vi-sao-chon-an-tam"
                ? "bg-blue-50 text-blue-800 font-bold"
                : "text-slate-600 hover:text-blue-700 hover:bg-slate-100"
            }`}
          >
            {isEn ? "Why Us" : "Vì sao chọn An Tâm"}
          </Link>
          <a
            href="/#danh-muc-san-pham"
            className="text-xs font-medium text-slate-600 hover:text-blue-700 px-3 py-1.5 rounded-lg transition-colors hover:bg-slate-100"
          >
            {isEn ? 'Products' : 'Sản phẩm'}
          </a>
          <a
            href="/#dich-vu-spa"
            className="text-xs font-medium text-slate-600 hover:text-blue-700 px-3 py-1.5 rounded-lg transition-colors hover:bg-slate-100"
          >
            {isEn ? 'On-site Services' : 'Dịch vụ tận nơi'}
          </a>
          <Link
            href="/tra-cuu-bao-hanh"
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              pathname === '/tra-cuu-bao-hanh'
                ? 'bg-blue-50 text-blue-800 font-bold font-semibold'
                : 'text-slate-600 hover:text-blue-700 hover:bg-slate-100'
            }`}
          >
            {isEn ? 'Check Warranty' : 'Kiểm tra bảo hành'}
          </Link>
          <Link
            href="/dat-lich"
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              pathname === '/dat-lich'
                ? 'bg-blue-50 text-blue-800 font-bold font-semibold'
                : 'text-slate-600 hover:text-blue-700 hover:bg-slate-100'
            }`}
          >
            {isEn ? 'Book Schedule' : 'Đặt lịch hẹn'}
          </Link>
          <a
            href="/#chinh-sach"
            className="text-xs font-medium text-slate-600 hover:text-blue-700 px-3 py-1.5 rounded-lg transition-colors hover:bg-slate-100"
          >
            {isEn ? 'Contact' : 'Liên hệ'}
          </a>
        </nav>

        {/* Right CTAs */}
        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href={`tel:${systemSettings.hotline.replace(/\D/g, '')}`}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-orange-50 text-orange-700 font-bold hover:bg-orange-100 transition-colors border border-orange-200 shadow-2xs"
          >
            <span className="material-symbols-outlined text-sm">phone_in_talk</span>
            <span>{systemSettings.hotline}</span>
          </a>

          {/* Sửa Tra cứu tem -> Kiểm tra bảo hành */}
          <Link
            href="/tra-cuu-bao-hanh"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-700 text-white shadow-xs hover:bg-blue-800 transition-all"
          >
            <span className="material-symbols-outlined text-sm">verified</span>
            <span>{isEn ? 'Check Warranty' : 'Kiểm tra bảo hành'}</span>
          </Link>

          {/* SINGLE UNIFIED LOGIN / USER ACCESS */}
          {isLoggedIn ? (
            <div className="flex items-center gap-1.5">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-2"
                title="Vào hệ thống quản lý"
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    currentUser.role === 'admin'
                      ? 'bg-blue-200'
                      : currentUser.role === 'technician'
                      ? 'bg-emerald-300'
                      : 'bg-purple-300'
                  }`}
                />
                <span className="hidden md:inline font-bold">
                  {currentUser.name.split(' ').slice(-2).join(' ')}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    currentUser.role === 'admin'
                      ? 'bg-white/25 text-white'
                      : currentUser.role === 'technician'
                      ? 'bg-emerald-800 text-white'
                      : 'bg-purple-800 text-white'
                  }`}
                >
                  {currentUser.role === 'admin'
                    ? 'Admin'
                    : currentUser.role === 'technician'
                    ? 'KTV'
                    : 'Sales'}
                </span>
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                title="Đăng xuất"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-base">logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">lock</span>
              <span>{isEn ? 'Sign In' : 'Đăng Nhập'}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
