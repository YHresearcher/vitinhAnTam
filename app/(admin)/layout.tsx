'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { RoleSwitcher } from '@/components/admin/RoleSwitcher';
import { SyncStatusBadge } from '@/components/SyncStatusBadge';
import { useViTinhAnTamStore } from '@/lib/store';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { currentUser, inventory, tickets } = useViTinhAnTamStore();
  const [searchQuery, setSearchQuery] = useState('');

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/kho-may?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex font-sans">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="pl-72 flex flex-col min-h-screen w-full">
        {/* Topbar */}
        <header className="fixed top-0 left-72 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 z-40 flex items-center justify-between px-8 shadow-xs">
          {/* Quick Search Ctrl+K */}
          <form onSubmit={handleQuickSearch} className="flex items-center gap-3 flex-1 max-w-lg">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tra cứu Service Tag, SĐT, Model máy..."
                className="w-full h-9 pl-9 pr-16 rounded-lg bg-slate-100 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                <kbd className="px-1 py-0.5 rounded text-[9px] bg-white border border-slate-200 text-slate-500 font-mono">
                  Ctrl
                </kbd>
                <kbd className="px-1 py-0.5 rounded text-[9px] bg-white border border-slate-200 text-slate-500 font-mono">
                  K
                </kbd>
              </div>
            </div>
          </form>

          {/* Right Header Actions */}
          <div className="flex items-center gap-4">
            {/* Branch Pill */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <span className="material-symbols-outlined text-blue-600 text-[16px]">location_on</span>
              <div className="flex flex-col text-left leading-none">
                <span className="text-[10px] text-slate-400">Chi nhánh</span>
                <span className="text-xs font-semibold text-slate-800 mt-0.5">Tân An, Long An</span>
              </div>
            </div>

            {/* Sync Badge */}
            <SyncStatusBadge />

            {/* Interactive Role Switcher (RBAC) */}
            <RoleSwitcher />

            {/* Create Ticket Button */}
            <Link
              href="/phieu-sua-chua/tao-moi"
              className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs font-semibold text-xs shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>+ Tạo phiếu mới</span>
            </Link>

            {/* User Profile */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
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
        <main className="pt-16 p-8 flex-1 bg-[#F8FAFC]">{children}</main>
      </div>
    </div>
  );
}
