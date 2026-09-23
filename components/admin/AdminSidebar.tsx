'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Drawer } from 'antd';
import { Logo } from '@/components/Logo';
import { useViTinhAnTamStore } from '@/lib/store';

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function AdminSidebar({ mobileOpen = false, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const { tickets, currentUser, canAccessPayroll, canAccessSettings, customers, logout } = useViTinhAnTamStore();

  const pendingTicketsCount = tickets.filter((t) => t.status === 'processing').length;

  const navItems = [
    {
      label: 'Tổng quan',
      href: '/dashboard',
      badge: null,
    },
    {
      label: 'Khách hàng',
      href: '/khach-hang',
      badge: `${customers.length}`,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      label: 'Phiếu sửa chữa',
      href: '/phieu-sua-chua',
      badge: pendingTicketsCount > 0 ? `${pendingTicketsCount}` : null,
      badgeColor: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'Kho hàng',
      href: '/kho-may',
      badge: null,
    },
    {
      label: 'Cứu hộ tận nơi',
      href: '/cuu-ho-onsite',
      badge: 'Khẩn',
      badgeColor: 'bg-red-100 text-red-700',
    },
    {
      label: 'Tiền công',
      href: '/tien-cong',
      badge: canAccessPayroll() ? 'Admin' : 'Khóa',
      badgeColor: canAccessPayroll() ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500',
    },
    {
      label: 'Nhân sự',
      href: '/thanh-vien',
      badge: canAccessPayroll() ? 'Admin' : 'Khóa',
      badgeColor: canAccessPayroll() ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500',
    },
    {
      label: 'Cài đặt',
      href: '/cai-dat',
      badge: canAccessSettings() ? 'Admin' : 'Khóa',
      badgeColor: canAccessSettings() ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500',
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full bg-white font-sans">
      <div className="flex flex-col">
        {/* Header Branding */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
          <Link href="/dashboard" onClick={onCloseMobile}>
            <Logo />
          </Link>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden px-2 py-1 rounded text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            >
              Đóng
            </button>
          )}
        </div>

        {/* Technician Live Shift Badge */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <div className="flex flex-col leading-none">
                <span className="text-[11px] font-semibold text-slate-900">
                  {currentUser.role === 'admin'
                    ? 'Admin Trực ban'
                    : currentUser.role === 'technician'
                    ? 'KTV Trực ca'
                    : 'Kinh doanh'}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium mt-0.5">
                  Trực tuyến
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
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3.5 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80 shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium'
                }`}
              >
                <span className="text-sm">{item.label}</span>
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
            onClick={onCloseMobile}
            className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all text-xs font-medium"
          >
            Tra cứu bảo hành
          </Link>

          <Link
            href="/"
            onClick={onCloseMobile}
            className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all text-xs font-medium"
          >
            Xem trang chủ
          </Link>

          <button
            type="button"
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              logout();
            }}
            className="px-3.5 py-2 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all text-xs font-semibold w-full text-left"
          >
            Đăng xuất
          </button>
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-100 text-center">
        <div className="text-[11px] text-slate-400 font-medium">
          Vi Tính An Tâm
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-72 bg-white border-r border-slate-200 z-50 flex-col justify-between shadow-xs">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer using Ant Design */}
      <Drawer
        open={mobileOpen}
        onClose={onCloseMobile}
        placement="left"
        styles={{ body: { padding: 0 } }}
        width={280}
        closable={false}
      >
        {sidebarContent}
      </Drawer>
    </>
  );
}
