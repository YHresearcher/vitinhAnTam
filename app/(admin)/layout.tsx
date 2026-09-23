'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { RoleSwitcher } from '@/components/admin/RoleSwitcher';
import { SyncStatusBadge } from '@/components/SyncStatusBadge';
import { DeadlineTrackingWidget } from '@/components/admin/DeadlineTrackingWidget';
import { useViTinhAnTamStore } from '@/lib/store';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { currentUser, isLoggedIn, isLoading, logout } = useViTinhAnTamStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Command palette navigation items
  const navItems = [
    { title: 'Tổng Quan Bảng Điều Khiển', path: '/dashboard', category: 'Trang Chính' },
    { title: 'Danh Sách Phiếu Sửa Chữa', path: '/phieu-sua-chua', category: 'Nghiệp Vụ' },
    { title: 'Lập Phiếu Tiếp Nhận Máy Mới', path: '/phieu-sua-chua/tao-moi', category: 'Nghiệp Vụ' },
    { title: 'Quản Lý Kho Máy & Linh Kiện', path: '/kho-may', category: 'Hàng Hóa' },
    { title: 'Quản Lý Khách Hàng (CRM)', path: '/khach-hang', category: 'Khách Hàng' },
    { title: 'Điều Phối Cứu Hộ Tận Nơi (Onsite)', path: '/cuu-ho-onsite', category: 'Điều Phối' },
    { title: 'Bảng Kê Tiền Công & Lương KTV', path: '/tien-cong', category: 'Kế Toán' },
    { title: 'Quản Lý Thành Viên & Phân Quyền', path: '/thanh-vien', category: 'Hệ Thống' },
    { title: 'Cấu Hình Doanh Nghiệp & Nội Dung Web', path: '/cai-dat', category: 'Hệ Thống' },
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.title.toLowerCase().includes(paletteQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(paletteQuery.toLowerCase()) ||
    item.path.toLowerCase().includes(paletteQuery.toLowerCase())
  );

  // Global Ctrl + K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [paletteQuery]);

  const handleSelectNav = (path: string) => {
    setIsCommandPaletteOpen(false);
    setPaletteQuery('');
    router.push(path);
  };

  const handlePaletteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filteredNavItems.length > 0 && selectedIndex < filteredNavItems.length) {
      handleSelectNav(filteredNavItems[selectedIndex].path);
    } else if (paletteQuery.trim()) {
      setIsCommandPaletteOpen(false);
      router.push(`/kho-may?search=${encodeURIComponent(paletteQuery.trim())}`);
      setPaletteQuery('');
    }
  };

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/kho-may?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Màn hình chờ kiểm tra quyền hoặc chuyển hướng nếu chưa đăng nhập
  if (isLoading || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold mb-3 border border-blue-200">
          Bảo Mật
        </span>
        <h2 className="text-base font-bold text-slate-900 mb-1">Yêu cầu xác thực tài khoản</h2>
        <p className="text-xs text-slate-500 mb-4 max-w-sm">
          Bạn cần đăng nhập bằng tài khoản nội bộ (Admin, Kỹ thuật hoặc Sales) để truy cập hệ thống quản trị.
        </p>
        <Link
          href="/login"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
        >
          Đến trang Đăng Nhập
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-scope min-h-screen bg-white text-slate-900 flex font-sans">
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
            {/* Mobile Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:text-blue-700 hover:bg-slate-100 transition-colors shrink-0 text-xs font-bold"
              aria-label="Open Admin Menu"
            >
              Menu
            </button>

            {/* Quick Search Button / Input triggering Command Palette */}
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="relative w-full h-9 px-3 pr-16 rounded-lg bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-slate-400 text-xs flex items-center justify-between transition-all text-left"
            >
              <span>Tra cứu S/N, SĐT, chuyển trang nhanh...</span>
              <div className="hidden sm:flex items-center gap-0.5">
                <kbd className="px-1 py-0.5 rounded text-[9px] bg-white border border-slate-300 text-slate-600 font-mono font-bold">
                  Ctrl
                </kbd>
                <kbd className="px-1 py-0.5 rounded text-[9px] bg-white border border-slate-300 text-slate-600 font-mono font-bold">
                  K
                </kbd>
              </div>
            </button>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Branch Pill */}
            <div className="hidden xl:flex items-center px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
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
              className="flex items-center h-9 px-3 sm:px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs font-semibold text-xs shrink-0"
            >
              <span>+ Tạo phiếu</span>
            </Link>

            {/* User Profile & Logout */}
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
              <button
                type="button"
                onClick={handleLogout}
                title="Đăng xuất khỏi hệ thống"
                className="px-2 py-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded text-xs font-semibold transition-colors ml-1"
              >
                Thoát
              </button>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="mt-16 p-4 sm:p-6 lg:p-8 flex-1 bg-white">{children}</main>
      </div>

      {/* COMMAND PALETTE MODAL (Ctrl + K) */}
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center p-4 pt-20">
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input Header */}
            <form onSubmit={handlePaletteSubmit} className="p-3 border-b border-slate-200 flex items-center gap-2">
              <input
                type="text"
                autoFocus
                value={paletteQuery}
                onChange={(e) => setPaletteQuery(e.target.value)}
                placeholder="Tìm trang, tra cứu S/N hoặc SĐT..."
                className="flex-1 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
              />
              <span className="text-xs text-slate-400 px-2 font-mono">ESC để đóng</span>
            </form>

            {/* Results / Navigation List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filteredNavItems.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  Không tìm thấy tính năng nào. Bấm <strong>Enter</strong> để tra cứu toàn bộ kho máy với từ khóa &quot;{paletteQuery}&quot;.
                </div>
              ) : (
                filteredNavItems.map((item, idx) => (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => handleSelectNav(item.path)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between text-xs transition-colors ${
                      idx === selectedIndex
                        ? 'bg-blue-50 text-blue-900 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-mono">
                      {item.category}
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Footer Tip */}
            <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between px-4">
              <span>Điều hướng phím tắt nhanh toàn hệ thống</span>
              <span className="font-mono text-slate-400">Vi Tính An Tâm</span>
            </div>
          </div>
        </div>
      )}

      {/* DEADLINE TRACKING WIDGET (Hạn chót sửa chữa / bảo hành < 3 ngày) */}
      <DeadlineTrackingWidget />
    </div>
  );
}
