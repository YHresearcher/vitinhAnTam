'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { RoleSwitcher } from '@/components/admin/RoleSwitcher';
import { SyncStatusBadge } from '@/components/SyncStatusBadge';
import { useViTinhAnTamStore } from '@/lib/store';
import { Search, MapPin, Plus, Menu } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { currentUser } = useViTinhAnTamStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/kho-may?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex font-sans">
      {/* Sidebar (Desktop Persistent + Mobile Drawer) */}
      <AdminSidebar
        mobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="pl-0 lg:pl-72 flex flex-col min-h-screen w-full">
        {/* Topbar */}
        <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 z-40 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-xs">
          <div className="flex items-center gap-3 flex-1 max-w-lg">
            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-700 hover:text-blue-700 hover:bg-slate-100 transition-colors shrink-0"
              aria-label="Open Admin Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Quick Search */}
            <form onSubmit={handleQuickSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tra cứu S/N, SĐT, Model máy..."
                className="w-full h-9 pl-9 pr-16 rounded-lg bg-slate-100 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-all"
              />
              <div className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 items-center gap-0.5">
                <kbd className="px-1 py-0.5 rounded text-[9px] bg-white border border-slate-200 text-slate-500 font-mono">
                  Ctrl
                </kbd>
                <kbd className="px-1 py-0.5 rounded text-[9px] bg-white border border-slate-200 text-slate-500 font-mono">
                  K
                </kbd>
              </div>
            </form>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Branch Pill */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <MapPin className="text-blue-600 w-4 h-4" />
              <div className="flex flex-col text-left leading-none">
                <span className="text-[10px] text-slate-400">Khu vực</span>
                <span className="text-xs font-semibold text-slate-800 mt-0.5">Long An - Tây Ninh</span>
              </div>
            </div>

            {/* Sync Badge */}
            <SyncStatusBadge />

            {/* Interactive Role Switcher (RBAC) */}
            <RoleSwitcher />

            {/* Create Ticket Button */}
            <Link
              href="/phieu-sua-chua/tao-moi"
              className="flex items-center gap-1.5 h-9 px-3 sm:px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs font-semibold text-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">+ Tạo phiếu</span>
            </Link>

            {/* User Profile */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div
                className={`w-8 h-8 rounded-full ${currentUser.avatarBg} text-white flex items-center justify-center font-bold text-xs shadow-xs`}
              >
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden md:flex flex-col leading-tight text-left">
                <span className="text-xs font-bold text-slate-900">{currentUser.name}</span>
                <span className="text-[10px] text-slate-500">{currentUser.roleTitle}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="mt-16 p-4 sm:p-6 lg:p-8 flex-1 bg-white">{children}</main>
      </div>
    </div>
  );
}
