'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { SyncStatusBadge } from './SyncStatusBadge';
import { useViTinhAnTamStore } from '@/lib/store';
import { User, LogOut, LogIn, Menu, X } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { currentUser, isLoggedIn, logout, systemSettings, currentLang, setLang } = useViTinhAnTamStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isEn = currentLang === 'en';

  return (
    <header className="sticky top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Main Header */}
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
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
          <a
            href="/#chinh-sach"
            className="text-xs font-medium text-slate-600 hover:text-blue-700 px-3 py-1.5 rounded-lg transition-colors hover:bg-slate-100"
          >
            {isEn ? 'Contact' : 'Liên hệ'}
          </a>
        </nav>

        {/* Right CTAs */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Language Switcher Vi / En */}
          <div className="inline-flex items-center rounded-lg bg-slate-100 border border-slate-200 p-0.5 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setLang('vi')}
              className={`px-2 py-0.5 rounded-md transition-all flex items-center gap-1 ${
                !isEn
                  ? "bg-blue-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-blue-700"
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
                  ? "bg-blue-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-blue-700"
              }`}
              title="English"
            >
              <span>🇬🇧</span>
              <span>EN</span>
            </button>
          </div>

          {/* SINGLE UNIFIED LOGIN / USER ACCESS */}
          {isLoggedIn ? (
            <div className="flex items-center gap-0.5">
              <Link
                href="/dashboard"
                className="p-1.5 rounded-lg text-slate-700 hover:text-blue-700 hover:bg-slate-100 transition-colors"
                title="Vào hệ thống quản trị (Dashboard)"
              >
                <User className="w-5 h-5" />
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                title="Đăng xuất"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="p-1.5 rounded-lg text-slate-700 hover:text-blue-700 hover:bg-slate-100 transition-colors flex items-center justify-center"
              title={isEn ? "Sign In" : "Đăng nhập"}
            >
              <LogIn className="w-5 h-5" />
            </Link>
          )}

          {/* Mobile Menu Button Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-slate-700 hover:text-blue-700 hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`block px-3 py-2 text-sm font-semibold rounded-lg ${
              pathname === '/' ? 'bg-blue-50 text-blue-800' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            {isEn ? 'Home' : 'Trang chủ'}
          </Link>
          <Link
            href="/vi-sao-chon-an-tam"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`block px-3 py-2 text-sm font-semibold rounded-lg ${
              pathname === '/vi-sao-chon-an-tam' ? 'bg-blue-50 text-blue-800' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            {isEn ? 'Why Us' : 'Vì sao chọn An Tâm'}
          </Link>
          <a
            href="/#danh-muc-san-pham"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            {isEn ? 'Products' : 'Sản phẩm'}
          </a>
          <a
            href="/#dich-vu-spa"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            {isEn ? 'On-site Services' : 'Dịch vụ tận nơi'}
          </a>
          <a
            href="/#chinh-sach"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            {isEn ? 'Contact' : 'Liên hệ'}
          </a>
        </div>
      )}
    </header>
  );
}
