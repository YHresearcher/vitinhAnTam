'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { useViTinhAnTamStore } from '@/lib/store';

export function AdminSidebar() {
  const pathname = usePathname();
  const { tickets, currentUser, canAccessPayroll, canAccessSettings, systemSettings } = useViTinhAnTamStore();

  const pendingTicketsCount = tickets.filter((t) => t.status === 'processing').length;

  const navItems = [
    {
      label: 'Tổng quan',
      href: '/dashboard',
      icon: 'grid_view',
      badge: null,
    },
    {
      label: 'Phiếu sửa chữa',
      href: '/phieu-sua-chua',
      icon: 'build',
      badge: pendingTicketsCount > 0 ? `${pendingTicketsCount}` : null,
      badgeColor: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'Kho máy & Linh kiện',
      href: '/kho-may',
      icon: 'inventory_2',
      badge: null,
    },
    {
      label: 'Cứu hộ Onsite',
      href: '/cuu-ho-onsite',
      icon: 'electric_moped',
      badge: 'Khẩn',
      badgeColor: 'bg-red-100 text-red-700',
    },
    {
      label: 'Tiền công & Ca làm',
      href: '/tien-cong',
      icon: 'payments',
      badge: canAccessPayroll() ? 'Admin' : 'Khóa',
      badgeColor: canAccessPayroll() ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500',
    },
    {
      label: 'Thành viên & Phân quyền',
      href: '/thanh-vien',
      icon: 'manage_accounts',
      badge: canAccessPayroll() ? 'Admin' : 'Khóa',
      badgeColor: canAccessPayroll() ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500',
    },
    {
      label: 'Cấu hình hệ thống',
      href: '/cai-dat',
      icon: 'settings',
      badge: canAccessSettings() ? 'Admin' : 'Khóa',
      badgeColor: canAccessSettings() ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500',
    },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-white border-r border-slate-200 z-50 flex flex-col justify-between shadow-xs">
      <div className="flex flex-col">
        {/* Header Branding */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
          <Link href="/dashboard">
            <Logo />
          </Link>
        </div>

        {/* Technician Live Shift Badge */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[11px] font-semibold text-slate-900">
                  {currentUser.role === 'admin'
                    ? 'Admin Trực ban'
                    : currentUser.role === 'technician'
                    ? 'KTV Trực ca'
                    : 'Kinh doanh Trực quầy'}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium mt-0.5">
                  Trực tuyến (Online)
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">
              Ca 1
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex flex-col gap-1 px-3 mt-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-all group ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200/80 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`material-symbols-outlined text-[20px] transition-colors ${
                      isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="text-sm">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="my-2 border-t border-slate-100" />

          {/* Quick links to public */}
          <Link
            href="/tra-cuu-bao-hanh"
            className="flex items-center gap-3 px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all text-xs"
          >
            <span className="material-symbols-outlined text-[18px] text-slate-400">verified_user</span>
            <span>Cổng Kiểm tra bảo hành</span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-3 px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all text-xs"
          >
            <span className="material-symbols-outlined text-[18px] text-slate-400">arrow_back</span>
            <span>Xem Website khách hàng</span>
          </Link>
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 flex flex-col gap-3 border-t border-slate-100">
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-blue-600 text-[20px]">support_agent</span>
            <div className="flex flex-col leading-none">
              <span className="text-[11px] font-semibold text-slate-900">Hotline Kỹ thuật</span>
              <span className="text-[10px] text-slate-500 mt-0.5">{systemSettings.hotline}</span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-blue-600 font-bold">24/7</span>
        </div>
        <div className="text-[11px] text-center text-slate-400 font-medium">
          © Vi tính An Tâm v2.4.0 (Stitch CRM)
        </div>
      </div>
    </aside>
  );
}
