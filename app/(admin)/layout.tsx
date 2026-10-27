'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { message } from 'antd';
import { Search, Menu, Home, LogOut } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { DeadlineTrackingWidget } from '@/components/admin/DeadlineTrackingWidget';
import { NewOrderNotificationWidget } from '@/components/admin/NewOrderNotificationWidget';
import { AdminKeyReleasePopup } from '@/components/admin/AdminKeyReleasePopup';
import { RequesterKeyTestPopup } from '@/components/admin/RequesterKeyTestPopup';
import { SalesDailyReminderModal } from '@/components/admin/SalesDailyReminderModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useViTinhAnTamStore } from '@/lib/store';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    currentUser,
    isLoggedIn,
    isLoading,
    canAccessPayroll,
    canManageUsers,
    canAccessSettings,
    canAccessCRM,
    isFieldStaff,
    logout,
    themeMode,
    currentLang,
    setLang,
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
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    }
    return () => {
      // Khi rời khỏi khu vực quản trị về trang khách, luôn trả về theme sáng
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    };
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
    { title: 'Công việc của bạn', path: '/cong-viec-cua-toi', category: 'Công việc', visible: !!currentUser && ['sales_manager', 'salesman'].includes(currentUser.role) },
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

  // Tự động đăng xuất sau 30 phút không hoạt động
  useEffect(() => {
    if (!isLoggedIn) return;

    const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 phút
    let timer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        message.warning('Phiên đăng nhập đã hết hạn do không hoạt động trong 30 phút.');
        logout();
        router.push('/login');
      }, INACTIVITY_TIMEOUT_MS);
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [isLoggedIn, logout, router]);

  // Nhân viên hiện trường chỉ được dùng "Thống kê hiệu quả kinh doanh",
  // trừ NVKD (salesman) được vào thêm kho để bán và xin key. Chặn cả
  // đường gõ trực tiếp URL vào trang chung (dashboard, phiếu, đơn, bài
  // viết...). Sidebar đã ẩn các mục này; đây là lớp chặn thứ hai để
  // không lọt qua đường link trực tiếp hay bảng lệnh.
  const fieldAllowedPaths =
    currentUser.role === 'salesman'
      ? ['/viec-cua-toi', '/kho-may', '/quan-ly-key', '/cong-viec-cua-toi']
      : ['/viec-cua-toi'];
  const isRestrictedForFieldStaff =
    isLoggedIn && isFieldStaff() && !fieldAllowedPaths.includes(pathname);
  // Thông báo rõ lý do bị chặn (mỗi trang bị khóa chỉ báo một lần) thay vì
  // chuyển hướng im lặng — người dùng cần biết mình không có quyền vào trang đó.
  const deniedNoticeForRef = useRef<string | null>(null);
  useEffect(() => {
    if (isRestrictedForFieldStaff) {
      if (deniedNoticeForRef.current !== pathname) {
        deniedNoticeForRef.current = pathname;
        message.warning('Bạn không có quyền truy cập trang này. Đang chuyển về trang làm việc của bạn.');
      }
      router.replace('/viec-cua-toi');
    }
  }, [isRestrictedForFieldStaff, pathname, router]);

  // Màn hình chờ đang tải dữ liệu / kiểm tra phiên
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-12 h-12 border-3 border-red-200 dark:border-red-900 border-t-red-600 rounded-full animate-spin mb-4" />
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Đang tải trung tâm điều phối Vi Tính An Tâm...</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Đang đồng bộ quyền hạn và dữ liệu hệ thống</p>
      </div>
    );
  }

  // Màn hình yêu cầu đăng nhập nếu chưa có phiên
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-sans">
        <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-full text-xs font-bold mb-3 border border-amber-200 dark:border-amber-800">
          Bảo Mật Nội Bộ
        </span>
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">Yêu cầu xác thực tài khoản</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-sm">
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

  // Không render trang chung cho nhân viên hiện trường trong lúc chuyển hướng
  if (isRestrictedForFieldStaff) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <span className="px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-bold mb-3 border border-rose-200">
          Không có quyền truy cập
        </span>
        <p className="text-sm font-bold text-slate-800 mb-1">Bạn không có quyền truy cập trang này.</p>
        <p className="text-xs text-slate-500">Tài khoản hiện trường chỉ xem được ca và thu nhập của mình. Đang chuyển về Thống kê hiệu quả kinh doanh...</p>
      </div>
    );
  }

  return (
    <div className="admin-scope min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans transition-colors duration-200">
      {/* Sidebar (Desktop Persistent + Mobile Drawer) */}
      <AdminSidebar
        mobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="pl-0 lg:pl-72 flex flex-col min-h-screen w-full">
        {/* Topbar */}
        <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-40 flex items-center justify-between px-3 sm:px-6 lg:px-8 shadow-xs transition-colors duration-200">
          <div className="flex items-center gap-3">
            {/* Mobile Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0 flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              aria-label="Mở menu quản trị"
            >
              <Menu className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span>Menu</span>
            </button>

            {/* Quick Command Palette Search trigger */}
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100/80 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all text-xs cursor-pointer w-48 md:w-64"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span className="flex-1 text-left truncate">Tìm trang, S/N, SĐT...</span>
              <kbd className="text-[10px] font-mono bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-300 shadow-2xs">⌘K</kbd>
            </button>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* View public website icon button */}
            <Link
              href="/"
              prefetch={true}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 sm:p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              title="Xem trang chủ website khách"
              aria-label="Xem trang chủ"
            >
              <Home className="w-4 h-4" />
            </Link>

            {/* Language Switcher - Hide on very small screens to preserve user space */}
            <div className="hidden sm:inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setLang('vi')}
                className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                  currentLang === 'vi'
                    ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-2xs font-black'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
                title="Tiếng Việt"
              >
                VN
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                  currentLang === 'en'
                    ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-2xs font-black'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
                title="English"
              >
                EN
              </button>
            </div>

            {/* Theme Toggle Icon Button (Dark / Light) */}
            <ThemeToggle variant="icon" />

            {/* User Profile & Logout - FULLY OPTIMIZED FOR MOBILE */}
            <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-slate-200 dark:border-slate-700 min-w-0">
              <div
                className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full ${currentUser.avatarBg} text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0`}
                title={`${currentUser.name} (${currentUser.roleTitle})`}
              >
                {currentUser.name.charAt(0)}
              </div>
              <div className="flex flex-col leading-tight text-left min-w-0 max-w-[110px] xs:max-w-[145px] sm:max-w-[185px] md:max-w-none">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {currentUser.name}
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-medium">
                    {currentUser.roleTitle}
                  </span>
                  {(currentUser.referral_code || currentUser.username) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const id = currentUser.referral_code || currentUser.username || '';
                        navigator.clipboard?.writeText(id);
                        message.success(`Đã sao chép mã ID: ${id}`);
                      }}
                      title="Mã ID nhân viên / Mã giới thiệu (Click để sao chép)"
                      className="inline-flex items-center gap-0.5 text-[9.5px] font-mono font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800/80 px-1 py-0.2 rounded hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors cursor-pointer select-all shrink-0"
                    >
                      ID: {currentUser.referral_code || currentUser.username}
                    </button>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Đăng xuất khỏi hệ thống"
                className="p-1.5 sm:p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer shrink-0"
                aria-label="Đăng xuất"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="mt-16 p-4 sm:p-6 lg:p-8 flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">{children}</main>
      </div>

      {/* COMMAND PALETTE MODAL (Ctrl + K) */}
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center p-4 pt-20">
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input Header */}
            <form onSubmit={handlePaletteSubmit} className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <input
                type="text"
                autoFocus
                value={paletteQuery}
                onChange={(e) => {
                  setPaletteQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Tìm trang, tra cứu S/N hoặc SĐT..."
                className="flex-1 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none bg-transparent"
              />
              <span className="text-xs text-slate-400 dark:text-slate-500 px-2 font-mono">ESC để đóng</span>
            </form>

            {/* Results / Navigation List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filteredNavItems.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                  Không tìm thấy tính năng nào. Bấm <strong>Enter</strong> để tra cứu toàn bộ kho máy với từ khóa &quot;{paletteQuery}&quot;.
                </div>
              ) : (
                filteredNavItems.map((item, idx) => (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => handleSelectNav(item.path)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer ${
                      idx === selectedIndex
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{item.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono">
                      {item.category}
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Footer Tip */}
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between px-4">
              <span>Điều hướng phím tắt nhanh toàn hệ thống</span>
              <span className="font-mono text-slate-400 dark:text-slate-500">Vi Tính An Tâm</span>
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

      {/* SALES DAILY CRM REMINDER MODAL (Nhắc sinh nhật 3 ngày & chăm sóc sau bán hàng 1, 3, 6, 12 tháng) */}
      <SalesDailyReminderModal />
    </div>
  );
}
