'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Drawer } from 'antd';
import { Logo } from '@/components/Logo';
import { useViTinhAnTamStore } from '@/lib/store';
import {
  LayoutDashboard,
  Wrench,
  Boxes,
  Navigation,
  CircleDollarSign,
  Users,
  Settings,
  ShieldCheck,
  ArrowLeft,
  Headset,
  X,
} from 'lucide-react';

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function AdminSidebar({ mobileOpen = false, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const { tickets, currentUser, canAccessPayroll, canAccessSettings, systemSettings } = useViTinhAnTamStore();

  const pendingTicketsCount = tickets.filter((t) => t.status === 'processing').length;

  const navItems = [
    {
      label: 'Tổng quan',
      href: '/dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: 'Phiếu sửa chữa',
      href: '/phieu-sua-chua',
      icon: Wrench,
      badge: pendingTicketsCount > 0 ? `${pendingTicketsCount}` : null,
      badgeColor: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'Kho máy & Linh kiện',
      href: '/kho-may',
      icon: Boxes,
      badge: null,
    },
    {
      label: 'Cứu hộ Onsite',
      href: '/cuu-ho-onsite',
      icon: Navigation,
      badge: 'Khẩn',
      badgeColor: 'bg-red-100 text-red-700',
    },
    {
      label: 'Tiền công & Ca làm',
      href: '/tien-cong',
      icon: CircleDollarSign,
      badge: canAccessPayroll() ? 'Admin' : 'Khóa',
      badgeColor: canAccessPayroll() ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500',
    },
    {
      label: 'Thành viên & Phân quyền',
      href: '/thanh-vien',
      icon: Users,
      badge: canAccessPayroll() ? 'Admin' : 'Khóa',
      badgeColor: canAccessPayroll() ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500',
    },
    {
      label: 'Cấu hình hệ thống',
      href: '/cai-dat',
      icon: Settings,
      badge: canAccessSettings() ? 'Admin' : 'Khóa',
      badgeColor: canAccessSettings() ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500',
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full bg-white">
      <div className="flex flex-col">
        {/* Header Branding */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
          <Link href="/dashboard" onClick={onCloseMobile}>
            <Logo />
          </Link>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
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
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-all group ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200/80 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'
                    }`}
                  />
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
            onClick={onCloseMobile}
            className="flex items-center gap-3 px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all text-xs"
          >
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <span>Cổng Kiểm tra bảo hành S/N</span>
          </Link>

          <Link
            href="/"
            onClick={onCloseMobile}
            className="flex items-center gap-3 px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all text-xs"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>Xem Website khách hàng</span>
          </Link>
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 flex flex-col gap-3 border-t border-slate-100">
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Headset className="w-5 h-5 text-blue-600" />
            <div className="flex flex-col leading-none">
              <span className="text-[11px] font-semibold text-slate-900">Hotline Kỹ thuật</span>
              <span className="text-[10px] text-slate-500 mt-0.5">{systemSettings.hotline}</span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-blue-600 font-bold">24/7</span>
        </div>
        <div className="text-[11px] text-center text-slate-400 font-medium">
          © Vi tính An Tâm (Admin CRM)
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
