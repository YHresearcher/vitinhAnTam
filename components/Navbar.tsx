'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { useViTinhAnTamStore } from '@/lib/store';
import { TRANSLATIONS } from '@/lib/translations';
import { User, LogOut, LogIn, Menu, X } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { isLoggedIn, logout, currentLang, setLang } = useViTinhAnTamStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isEn = currentLang === 'en';
  const t = TRANSLATIONS[currentLang || 'vi'].navbar;

  return (
    <header className="sticky top-0 w-full z-50 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8E2D9] shadow-xs">
      {/* Main Header */}
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Logo with Slogan */}
        <div className="flex items-center gap-2.5">
          <Link href="/" className="shrink-0">
            <Logo />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              pathname === '/'
                ? 'bg-[#FBE8DE] text-[#C0392B] font-bold'
                : 'text-[#6E5D53] hover:text-[#C0392B] hover:bg-[#F4EFEA]'
            }`}
          >
            {t.home}
          </Link>
          <Link
            href="/vi-sao-chon-an-tam"
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              pathname === '/vi-sao-chon-an-tam'
                ? 'bg-[#FBE8DE] text-[#C0392B] font-bold'
                : 'text-[#6E5D53] hover:text-[#C0392B] hover:bg-[#F4EFEA]'
            }`}
          >
            {t.whyUs}
          </Link>
          <Link
            href="/danh-muc-san-pham"
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              pathname === '/danh-muc-san-pham'
                ? 'bg-[#FBE8DE] text-[#C0392B] font-bold'
                : 'text-[#6E5D53] hover:text-[#C0392B] hover:bg-[#F4EFEA]'
            }`}
          >
            {t.products}
          </Link>
          <Link
            href="/#dich-vu-spa"
            className="text-xs font-medium text-[#6E5D53] hover:text-[#C0392B] px-3 py-1.5 rounded-lg transition-colors hover:bg-[#F4EFEA]"
          >
            {t.services}
          </Link>
          <Link
            href="/#chinh-sach"
            className="text-xs font-medium text-[#6E5D53] hover:text-[#C0392B] px-3 py-1.5 rounded-lg transition-colors hover:bg-[#F4EFEA]"
          >
            {t.contact}
          </Link>
        </nav>

        {/* Right CTAs */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Language Switcher Vi / En */}
          <div className="inline-flex items-center rounded-lg bg-[#EFE9DF] border border-[#E8E2D9] p-0.5 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setLang('vi')}
              className={`px-2 py-0.5 rounded-md transition-all flex items-center gap-1 ${
                !isEn
                  ? 'bg-[#C0392B] text-white shadow-xs'
                  : 'text-[#6E5D53] hover:text-[#C0392B]'
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
                  ? 'bg-[#C0392B] text-white shadow-xs'
                  : 'text-[#6E5D53] hover:text-[#C0392B]'
              }`}
              title="English (Professional)"
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
                className="p-1.5 rounded-lg text-[#2B1810] hover:text-[#C0392B] hover:bg-[#F4EFEA] transition-colors"
                title={t.adminPortal}
              >
                <User className="w-5 h-5" strokeWidth={1.5} />
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                title={t.logout}
                className="p-1.5 text-[#6E5D53] hover:text-[#C0392B] hover:bg-[#F4EFEA] rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="p-1.5 rounded-lg text-[#2B1810] hover:text-[#C0392B] hover:bg-[#F4EFEA] transition-colors flex items-center justify-center"
              title={t.signIn}
            >
              <LogIn className="w-5 h-5" strokeWidth={1.5} />
            </Link>
          )}

          {/* Mobile Menu Button Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-[#2B1810] hover:text-[#C0392B] hover:bg-[#F4EFEA] transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" strokeWidth={1.5} />
            ) : (
              <Menu className="w-6 h-6" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#E8E2D9] bg-[#FAF7F2] px-4 pt-2 pb-4 space-y-1 shadow-lg">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`block px-3 py-2 text-sm font-semibold rounded-lg ${
              pathname === '/' ? 'bg-[#FBE8DE] text-[#C0392B]' : 'text-[#2B1810] hover:bg-[#F4EFEA]'
            }`}
          >
            {t.home}
          </Link>
          <Link
            href="/vi-sao-chon-an-tam"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`block px-3 py-2 text-sm font-semibold rounded-lg ${
              pathname === '/vi-sao-chon-an-tam' ? 'bg-[#FBE8DE] text-[#C0392B]' : 'text-[#2B1810] hover:bg-[#F4EFEA]'
            }`}
          >
            {t.whyUs}
          </Link>
          <Link
            href="/danh-muc-san-pham"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`block px-3 py-2 text-sm font-semibold rounded-lg ${
              pathname === '/danh-muc-san-pham' ? 'bg-[#FBE8DE] text-[#C0392B]' : 'text-[#2B1810] hover:bg-[#F4EFEA]'
            }`}
          >
            {t.products}
          </Link>
          <Link
            href="/#dich-vu-spa"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-semibold text-[#2B1810] hover:bg-[#F4EFEA] rounded-lg"
          >
            {t.services}
          </Link>
          <Link
            href="/#chinh-sach"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-semibold text-[#2B1810] hover:bg-[#F4EFEA] rounded-lg"
          >
            {t.contact}
          </Link>
        </div>
      )}
    </header>
  );
}
