'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Plus, KeyRound, Menu } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { DeadlineTrackingWidget } from '@/components/admin/DeadlineTrackingWidget';
import { NewOrderNotificationWidget } from '@/components/admin/NewOrderNotificationWidget';
import { AdminKeyReleasePopup } from '@/components/admin/AdminKeyReleasePopup';
import { RequesterKeyTestPopup } from '@/components/admin/RequesterKeyTestPopup';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useViTinhAnTamStore } from '@/lib/store';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const {
    currentUser,
    isLoggedIn,
    isLoading,
    canAccessPayroll,
    canManageUsers,
    canAccessSettings,
    canAccessCRM,
    logout,
    themeMode,
  } = useViTinhAnTamStore();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Dark mode lifecycle specifically for admin portal
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (themeMode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [themeMode]);

  // Command palette navigation items filtered by permissions
  const navItems = [
    { title: 'Tổng Quan Bảng Điều Khiển', path: '/dashboard', category: 'Trang Chính', visible: true },
    { title: 'Phân Hệ Quản Lý Tài Chính & Doanh Thu', path: '/tai-chinh', category: 'Tài Chính', visible: canAccessPayroll() },
    { title: 'Quản Lý Kho Key Bản Quyền Windows & Office', path: '/quan-ly-key', category: 'Bản Quyền', visible: true },
    { title: 'Danh Sách Phiếu Sửa Chữa', path: '/phieu-sua-chua', category: 'Nghiệp Vụ', visible: true },
    { title: 'Lập Phiếu Tiếp Nhận Máy Mới', path: '/phieu-sua-chua/tao-moi', category: 'Nghiệp Vụ', visible: true },
    { title: 'Quản Lý Kho Máy & Linh Kiện', path: '/kho-may', category: 'Hàng Hóa', visible: true },
    { title: 'Quản Lý Khách Hàng (CRM)', path: '/khach-hang', category: 'Khách Hàng', visible: canAccessCRM() },
    { title: 'Điều Phối Cứu Hộ Tận Nơi (Onsite)', path: '/cuu-ho-onsite', category: 'Điều Phối', visible: true },
    { title: 'Bảng Kê Tiền Công & Lương KTV', path: '/tien-cong', category: 'Tài Chính', visible: canAccessPayroll() },
    { title: 'Quản Lý Thành Viên & Phân Quyền', path: '/thanh-vien', category: 'Hệ Thống', visible: canManageUsers() },
    { title: 'Cấu Hình Doanh Nghiệp & Nội Dung Web', path: '/cai-dat', category: 'Hệ Thống', visible: canAccessSettings() },
  ].filter((item) => item.visible);

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

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Màn hình chờ đang tải dữ liệu / kiểm tra phiên
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-12 h-12 border-3 border-red-200 border-t-red-600 rounded-full animate-spin mb-4" />
        <h2 className="text-sm font-bold text-slate-800 mb-1">Đang tải trung tâm điều phối Vi Tính An Tâm...</h2>
        <p className="text-xs text-slate-500">Đang đồng bộ quyền hạn và dữ liệu hệ thống</p>
      </div>
    );
  }

  // Màn hình yêu cầu đăng nhập nếu chưa có phiên
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold mb-3 border border-amber-200">
          Bảo Mật Nội Bộ
        </span>
        <h2 className="text-base font-bold text-slate-900 mb-1">Yêu cầu xác thực tài khoản</h2>
        <p className="text-xs text-slate-500 mb-4 max-w-sm">
          Bạn cần đăng nhập bằng tài khoản nội bộ (Admin, Kỹ thuật hoặc Sales) để truy cập hệ thống quản trị.
        </p>
        <Link
          href="/login"
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
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
        <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 z-40 flex items-center justify-between px-3 sm:px-6 lg:px-8 shadow-xs">
          <div className="flex items-center gap-3">
            {/* Mobile Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:text-blue-700 hover:bg-slate-50 transition-colors shrink-0 flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              aria-label="Mở menu quản trị"
            >
              <Menu className="w-4 h-4 text-slate-600" />
              <span>Menu</span>
            </button>

            {/* Quick Command Palette Search trigger */}
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 text-slate-500 hover:text-slate-800 transition-all text-xs cursor-pointer w-48 md:w-64"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="flex-1 text-left truncate">Tìm trang, S/N, SĐT...</span>
              <kbd className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-400 shadow-2xs">⌘K</kbd>
            </button>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Current User Role Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-700">{currentUser.roleTitle}</span>
            </div>

            {/* Quick Key Navigation */}
            <Link
              href="/quan-ly-key"
              className="flex items-center gap-1.5 h-8.5 px-2.5 sm:px-3 rounded-lg border transition-all text-xs font-bold bg-[#FFFDF9] text-[#2B1810] border-[#E8E2D9] hover:border-[#C0392B] hover:bg-red-50/30 shrink-0"
              title="Kho Key Bản Quyền"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#C0392B]" />
              <span className="hidden xs:inline font-mono">KHO KEY</span>
            </Link>

            {/* Theme Toggle Icon Button (Dark / Light) */}
            <ThemeToggle variant="icon" />

            {/* Create Ticket Button */}
            <Link
              href="/phieu-sua-chua/tao-moi"
              className="flex items-center gap-1 h-8.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs font-semibold text-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Tạo phiếu</span>
            </Link>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div
                className={`w-7.5 h-7.5 rounded-full ${currentUser.avatarBg} text-white flex items-center justify-center font-bold text-xs shadow-xs`}
                title={currentUser.name}
              >
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden md:flex flex-col leading-tight text-left">
                <span className="text-xs font-bold text-slate-800">{currentUser.name}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Đăng xuất khỏi hệ thống"
                className="px-2 py-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded text-xs font-semibold transition-colors cursor-pointer"
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
                onChange={(e) => {
                  setPaletteQuery(e.target.value);
                  setSelectedIndex(0);
                }}
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

      {/* NEW ORDER NOTIFICATION WIDGET (Đơn hàng mới từ website — sales/admin/ktv xác nhận) */}
      <NewOrderNotificationWidget />

      {/* ADMIN KEY RELEASE POPUP (Thông báo & duyệt cấp key thời gian thực) */}
      <AdminKeyReleasePopup />

      {/* REQUESTER KEY TEST POPUP (Popup nhận key & kiểm tra hoạt động cho kỹ thuật / sales) */}
      <RequesterKeyTestPopup />
    </div>
  );
}
