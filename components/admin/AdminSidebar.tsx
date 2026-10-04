'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Drawer } from 'antd';
import {
  LayoutDashboard,
  CircleDollarSign,
  Users,
  Wrench,
  ShoppingBag,
  Boxes,
  KeyRound,
  Truck,
  FileSpreadsheet,
  UserCog,
  Sliders,
  FileText,
  ExternalLink,
  ShieldCheck,
  LogOut,
  X,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useViTinhAnTamStore } from '@/lib/store';

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function AdminSidebar({ mobileOpen = false, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const {
    tickets,
    customers,
    onsiteDispatches,
    keyReleaseRequests,
    canAccessPayroll,
    canManageUsers,
    canAccessSettings,
    canAccessCRM,
    logout,
  } = useViTinhAnTamStore();

  const handleNavClick = () => {
    if (mobileOpen && onCloseMobile) {
      onCloseMobile();
    }
  };

  const pendingTicketsCount = tickets.filter(
    (t) => t.status === 'processing' || t.status === 'in_progress' || t.status === 'received'
  ).length;
  const pendingDispatchesCount = onsiteDispatches.filter(
    (d) => d.status !== 'completed' && d.status !== 'cancelled'
  ).length;
  const pendingKeyRequestsCount = keyReleaseRequests.filter(
    (r) => r.status === 'pending' || r.status === 'faulty_re_requesting' || r.status === 'auto_re_requested'
  ).length;

  const navItems = useMemo(() => {
    const rawNavItems = [
      {
        label: 'Tổng quan',
        href: '/dashboard',
        icon: LayoutDashboard,
        badge: null,
        badgeColor: '',
        visible: true,
      },
      {
        label: 'Tài chính & Doanh thu',
        href: '/tai-chinh',
        icon: CircleDollarSign,
        badge: null,
        badgeColor: '',
        visible: canAccessPayroll(),
      },
      {
        label: 'Khách hàng (CRM)',
        href: '/khach-hang',
        icon: Users,
        badge: customers.length > 0 ? `${customers.length}` : null,
        badgeColor: 'bg-slate-100 text-slate-700 font-mono border border-slate-200',
        visible: canAccessCRM(),
      },
      {
        label: 'Phiếu sửa chữa',
        href: '/phieu-sua-chua',
        icon: Wrench,
        badge: pendingTicketsCount > 0 ? `${pendingTicketsCount}` : null,
        badgeColor: 'bg-blue-100 text-blue-700 font-mono font-bold',
        visible: true,
      },
      {
        label: 'Quản lý đơn hàng',
        href: '/quan-ly-don-hang',
        icon: ShoppingBag,
        badge: null,
        badgeColor: '',
        visible: true,
      },
      {
        label: 'Kho máy & Linh kiện',
        href: '/kho-may',
        icon: Boxes,
        badge: null,
        badgeColor: '',
        visible: true,
      },
      {
        label: 'Kho key bản quyền',
        href: '/quan-ly-key',
        icon: KeyRound,
        badge: pendingKeyRequestsCount > 0 ? `${pendingKeyRequestsCount}` : null,
        badgeColor: 'bg-[#C0392B] text-white font-mono font-bold shadow-xs',
        visible: true,
      },
      {
        label: 'Cứu hộ tận nơi',
        href: '/cuu-ho-onsite',
        icon: Truck,
        badge: pendingDispatchesCount > 0 ? `${pendingDispatchesCount}` : null,
        badgeColor: 'bg-amber-100 text-amber-900 font-mono font-bold',
        visible: true,
      },
      {
        label: 'Bài viết & SEO',
        href: '/bai-viet',
        icon: FileText,
        badge: null,
        badgeColor: '',
        visible: true,
      },
      {
        label: 'Tiền công KTV',
        href: '/tien-cong',
        icon: FileSpreadsheet,
        badge: null,
        badgeColor: '',
        visible: canAccessPayroll(),
      },
      {
        label: 'Nhân sự & Phân quyền',
        href: '/thanh-vien',
        icon: UserCog,
        badge: null,
        badgeColor: '',
        visible: canManageUsers(),
      },
      {
        label: 'Cấu hình hệ thống',
        href: '/cai-dat',
        icon: Sliders,
        badge: null,
        badgeColor: '',
        visible: canAccessSettings(),
      },
    ];
    return rawNavItems.filter((item) => item.visible);
  }, [
    canAccessPayroll,
    canAccessCRM,
    canManageUsers,
    canAccessSettings,
    customers.length,
    pendingTicketsCount,
    pendingDispatchesCount,
    pendingKeyRequestsCount,
  ]);

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans select-none transition-colors duration-200">
      <div className="flex flex-col">
        {/* Header Branding */}
        <div className="min-h-[68px] py-2 px-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <Link
            href="/dashboard"
            prefetch={true}
            onClick={handleNavClick}
            className="focus:outline-none"
          >
            <Logo />
          </Link>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              aria-label="Đóng menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation links */}
        <nav className="flex flex-col gap-0.5 px-3 mt-3 overflow-y-auto max-h-[calc(100vh-210px)] scrollbar-thin">
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Phân hệ nghiệp vụ
          </div>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const IconComponent = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onClick={handleNavClick}
                className={`group flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-50/90 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200/80 dark:border-blue-800/80 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <IconComponent
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                    }`}
                  />
                  <span className="text-xs sm:text-[13px] truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded-full shrink-0 ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="my-2 border-t border-slate-100 dark:border-slate-800" />

          {/* Quick links */}
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Tiện ích nhanh
          </div>

          <Link
            href="/tra-cuu-bao-hanh"
            prefetch={true}
            onClick={handleNavClick}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors text-xs font-medium"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Tra cứu bảo hành</span>
          </Link>

          <Link
            href="/"
            prefetch={true}
            onClick={handleNavClick}
            className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors text-xs font-medium"
          >
            <div className="flex items-center gap-2.5">
              <ExternalLink className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
              <span>Xem trang chủ khách</span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Web</span>
          </Link>

          <div className="pt-1 px-1">
            <ThemeToggle variant="pill" className="w-full justify-between" />
          </div>

          <button
            type="button"
            onClick={() => {
              handleNavClick();
              logout();
            }}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-300 transition-colors text-xs font-semibold w-full text-left mt-1 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
            <span>Đăng xuất</span>
          </button>
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 text-center bg-slate-50/50 dark:bg-slate-900/50">
        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
          Vi Tính An Tâm • Portal v2.6
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 flex-col justify-between shadow-xs transition-colors duration-200">
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
        destroyOnClose
      >
        {mobileOpen ? sidebarContent : null}
      </Drawer>
    </>
  );
}
