'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { SyncStatusBadge } from './SyncStatusBadge';
import { useViTinhAnTamStore } from '@/lib/store';

export function Navbar() {
  const pathname = usePathname();
  const { currentUser, isLoggedIn, logout } = useViTinhAnTamStore();

  return (
    <header className="sticky top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner Bar */}
      <div className="w-full bg-blue-50/90 border-b border-blue-100 text-xs py-1.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-700 text-xs">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>
              Phục vụ tận nơi Tân An &amp; Long An • Hotline:{' '}
              <a href="tel:0903892100" className="text-blue-600 font-bold hover:underline">
                0903.892.100
              </a>
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Sync Badge */}
            <SyncStatusBadge />
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
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100'
            }`}
          >
            Trang chủ
          </Link>
          <a
            href="/#danh-muc-san-pham"
            className="text-xs font-medium text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-lg transition-colors hover:bg-slate-100"
          >
            Sản phẩm
          </a>
          <a
            href="/#dich-vu-spa"
            className="text-xs font-medium text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-lg transition-colors hover:bg-slate-100"
          >
            Dịch vụ tận nơi
          </a>
          <Link
            href="/tra-cuu-bao-hanh"
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              pathname === '/tra-cuu-bao-hanh'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100'
            }`}
          >
            Tra cứu bảo hành
          </Link>
          <Link
            href="/dat-lich"
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              pathname === '/dat-lich'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100'
            }`}
          >
            Đặt lịch hẹn
          </Link>
          <a
            href="/#chinh-sach"
            className="text-xs font-medium text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-lg transition-colors hover:bg-slate-100"
          >
            Liên hệ
          </a>
        </nav>

        {/* Right CTAs */}
        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href="tel:0903892100"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 transition-colors border border-blue-200"
          >
            <span className="material-symbols-outlined text-sm">phone_in_talk</span>
            <span>0903.892.100</span>
          </a>

          <Link
            href="/tra-cuu-bao-hanh"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white shadow-xs hover:bg-blue-700 transition-all"
          >
            <span className="material-symbols-outlined text-sm">qr_code_scanner</span>
            <span>Tra cứu tem</span>
          </Link>

          {/* SINGLE UNIFIED LOGIN / USER ACCESS - WHITE & BLUE THEME */}
          {isLoggedIn ? (
            <div className="flex items-center gap-1.5">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-2"
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
              <span>Đăng Nhập</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
