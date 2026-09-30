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

  const handleScrollToAnchor = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    if (pathname === '/') {
      e.preventDefault();
      const element = document.getElementById(targetId);
      if (element) {
        const headerOffset = 70;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
        window.history.pushState(null, '', `/#${targetId}`);
      }
    }
  };

  return (
    <header className="sticky top-0 w-full z-50 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8E2D9] shadow-xs">
      {/* Main Header */}
      <div className="min-h-[64px] sm:min-h-[72px] py-1.5 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Logo with Slogan */}
        <div className="flex items-center gap-2.5">
          <Link href="/" className="shrink-0">
            <Logo />
          </Link>
        </div>

        {/* Desktop Navigation - Tăng kích thước chữ từng hạng mục */}
        <nav className="hidden md:flex items-center gap-1.5" aria-label="Menu chính">
          <Link
            href="/"
            aria-current={pathname === '/' ? 'page' : undefined}
            className={`px-3.5 py-2 text-sm lg:text-[15px] font-bold rounded-lg transition-colors ${
              pathname === '/'
                ? 'bg-[#FBE8DE] text-[#C0392B]'
                : 'text-[#5C4D44] hover:text-[#C0392B] hover:bg-[#F4EFEA]'
            }`}
          >
            {t.home}
          </Link>
          <Link
            href="/vi-sao-chon-an-tam"
            aria-current={pathname === '/vi-sao-chon-an-tam' ? 'page' : undefined}
            className={`px-3.5 py-2 text-sm lg:text-[15px] font-bold rounded-lg transition-colors ${
              pathname === '/vi-sao-chon-an-tam'
                ? 'bg-[#FBE8DE] text-[#C0392B]'
                : 'text-[#5C4D44] hover:text-[#C0392B] hover:bg-[#F4EFEA]'
            }`}
          >
            {t.whyUs}
          </Link>
          <Link
            href="/#san-pham"
            onClick={(e) => handleScrollToAnchor(e, 'san-pham')}
            className="text-sm lg:text-[15px] font-bold text-[#5C4D44] hover:text-[#C0392B] px-3.5 py-2 rounded-lg transition-colors hover:bg-[#F4EFEA]"
          >
            {t.products}
          </Link>
          <Link
            href="/#dich-vu-spa"
            onClick={(e) => handleScrollToAnchor(e, 'dich-vu-spa')}
            className="text-sm lg:text-[15px] font-bold text-[#5C4D44] hover:text-[#C0392B] px-3.5 py-2 rounded-lg transition-colors hover:bg-[#F4EFEA]"
          >
            {t.services}
          </Link>
          <Link
            href="/#chinh-sach"
            onClick={(e) => handleScrollToAnchor(e, 'chinh-sach')}
            className="text-sm lg:text-[15px] font-bold text-[#5C4D44] hover:text-[#C0392B] px-3.5 py-2 rounded-lg transition-colors hover:bg-[#F4EFEA]"
          >
            {t.contact}
          </Link>
        </nav>

        {/* Right CTAs */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Language Switcher - SVG Flags */}
          <div className="inline-flex items-center rounded-lg bg-[#EFE9DF] border border-[#E8E2D9] p-1 gap-1">
            <button
              type="button"
              onClick={() => setLang('vi')}
              className={`w-8 h-7 rounded-md transition-all flex items-center justify-center ${
                !isEn
                  ? 'bg-white shadow-xs border border-[#D5CCC1] scale-105'
                  : 'opacity-40 hover:opacity-100 hover:bg-white/60'
              }`}
              title="Tiếng Việt"
              aria-label="Tiếng Việt"
            >
              <svg className="w-5 h-3.5 rounded-[2px] shadow-2xs" viewBox="0 0 30 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="30" height="20" rx="1.5" fill="#DA251D" />
                <polygon
                  points="15,4 16.9,9.8 23,9.8 18.1,13.4 19.9,19.2 15,15.6 10.1,19.2 11.9,13.4 7,9.8 13.1,9.8"
                  fill="#FFFF00"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`w-8 h-7 rounded-md transition-all flex items-center justify-center ${
                isEn
                  ? 'bg-white shadow-xs border border-[#D5CCC1] scale-105'
                  : 'opacity-40 hover:opacity-100 hover:bg-white/60'
              }`}
              title="English"
              aria-label="English"
            >
              <svg className="w-5 h-3.5 rounded-[2px] shadow-2xs overflow-hidden" viewBox="0 0 60 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <clipPath id="uk-flag-clip">
                  <rect width="60" height="36" rx="3" />
                </clipPath>
                <g clipPath="url(#uk-flag-clip)">
                  <rect width="60" height="36" fill="#012169" />
                  <path d="M0,0 L60,36 M60,0 L0,36" stroke="#FFFFFF" strokeWidth="6" />
                  <path d="M0,0 L60,36" stroke="#C8102E" strokeWidth="2" />
                  <path d="M60,0 L0,36" stroke="#C8102E" strokeWidth="2" />
                  <path d="M30,0 V36 M0,18 H60" stroke="#FFFFFF" strokeWidth="10" />
                  <path d="M30,0 V36 M0,18 H60" stroke="#C8102E" strokeWidth="6" />
                </g>
              </svg>
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
            className={`block px-3.5 py-2.5 text-base font-bold rounded-lg ${
              pathname === '/' ? 'bg-[#FBE8DE] text-[#C0392B]' : 'text-[#2B1810] hover:bg-[#F4EFEA]'
            }`}
          >
            {t.home}
          </Link>
          <Link
            href="/vi-sao-chon-an-tam"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`block px-3.5 py-2.5 text-base font-bold rounded-lg ${
              pathname === '/vi-sao-chon-an-tam' ? 'bg-[#FBE8DE] text-[#C0392B]' : 'text-[#2B1810] hover:bg-[#F4EFEA]'
            }`}
          >
            {t.whyUs}
          </Link>
          <Link
            href="/#san-pham"
            onClick={(e) => {
              handleScrollToAnchor(e, 'san-pham');
              setIsMobileMenuOpen(false);
            }}
            className="block px-3.5 py-2.5 text-base font-bold text-[#2B1810] hover:bg-[#F4EFEA] rounded-lg"
          >
            {t.products}
          </Link>
          <Link
            href="/#dich-vu-spa"
            onClick={(e) => {
              handleScrollToAnchor(e, 'dich-vu-spa');
              setIsMobileMenuOpen(false);
            }}
            className="block px-3.5 py-2.5 text-base font-bold text-[#2B1810] hover:bg-[#F4EFEA] rounded-lg"
          >
            {t.services}
          </Link>
          <Link
            href="/#chinh-sach"
            onClick={(e) => {
              handleScrollToAnchor(e, 'chinh-sach');
              setIsMobileMenuOpen(false);
            }}
            className="block px-3.5 py-2.5 text-base font-bold text-[#2B1810] hover:bg-[#F4EFEA] rounded-lg"
          >
            {t.contact}
          </Link>

          {/* Mobile Language Switcher */}
          <div className="pt-2 border-t border-[#E8E2D9] flex items-center justify-between px-3.5">
            <span className="text-xs font-bold text-[#6E5D53]">Ngôn ngữ / Language:</span>
            <div className="inline-flex items-center rounded-lg bg-[#EFE9DF] border border-[#E8E2D9] p-1 gap-1">
              <button
                type="button"
                onClick={() => {
                  setLang('vi');
                  setIsMobileMenuOpen(false);
                }}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                  !isEn ? 'bg-white text-[#C0392B] shadow-xs' : 'text-[#6E5D53]'
                }`}
              >
                <span>🇻🇳</span>
                <span>Tiếng Việt</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLang('en');
                  setIsMobileMenuOpen(false);
                }}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                  isEn ? 'bg-white text-[#C0392B] shadow-xs' : 'text-[#6E5D53]'
                }`}
              >
                <span>🇬🇧</span>
                <span>English</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
