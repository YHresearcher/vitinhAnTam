'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { DeadlineTrackingWidget } from '@/components/admin/DeadlineTrackingWidget';
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
    logout,
    keyReleaseRequests,
    approveKeyReleaseRequest,
    rejectKeyReleaseRequest,
  } = useViTinhAnTamStore();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Admin Key Request Popup states
  const [dismissedReqIds, setDismissedReqIds] = useState<string[]>([]);
  const [isApproving, setIsApproving] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('');

  // Find active pending request for Admin popup
  const activePendingRequest =
    currentUser.role === 'admin'
      ? keyReleaseRequests.find(
          (r) =>
            (r.status === 'pending' || r.status === 'faulty_re_requesting') &&
            !dismissedReqIds.includes(r.id)
        ) || null
      : null;

  const totalPendingKeyRequests = keyReleaseRequests.filter(
    (r) => r.status === 'pending' || r.status === 'faulty_re_requesting'
  ).length;

  // Sound chime when a new request arrives for Admin
  useEffect(() => {
    if (activePendingRequest && typeof window !== 'undefined') {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
          osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.45);
        }
      } catch (e) {
        // Audio playback error or autoplay policy
      }
    }
  }, [activePendingRequest]);

  const handleQuickApprove = async (reqId: string) => {
    setIsApproving(true);
    const res = await approveKeyReleaseRequest(reqId);
    setIsApproving(false);
    if (res.success) {
      setActionFeedback(res.message);
      setTimeout(() => setActionFeedback(null), 4000);
      setDismissedReqIds((prev) => [...prev, reqId]);
    } else {
      alert(res.message);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingRequestId) return;
    await rejectKeyReleaseRequest(rejectingRequestId, rejectReasonInput.trim() || 'Admin từ chối cấp key');
    setDismissedReqIds((prev) => [...prev, rejectingRequestId]);
    setRejectingRequestId(null);
    setRejectReasonInput('');
  };

  // Command palette navigation items
  const navItems = [
    { title: 'Tổng Quan Bảng Điều Khiển', path: '/dashboard', category: 'Trang Chính' },
    { title: 'Quản Lý Kho Key Bản Quyền Windows & Office', path: '/quan-ly-key', category: 'Bản Quyền' },
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
          <div className="flex items-center gap-3">
            {/* Mobile Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:text-blue-700 hover:bg-slate-100 transition-colors shrink-0 text-xs font-bold"
              aria-label="Open Admin Menu"
            >
              Menu
            </button>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Current User Role Only */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-400">Vai trò:</span>
              <span className="font-bold text-slate-800">{currentUser.roleTitle}</span>
            </div>

            {/* Quick Key Release Navigation with live count */}
            <Link
              href="/quan-ly-key"
              className={`flex items-center gap-1.5 h-9 px-3 rounded-lg border transition-all text-xs font-bold ${
                totalPendingKeyRequests > 0
                  ? 'bg-[#C0392B] text-white border-[#C0392B] shadow-xs animate-pulse'
                  : 'bg-[#FFFDF9] text-[#2B1810] border-[#E8E2D9] hover:border-[#C0392B]'
              }`}
            >
              <span>KHO KEY</span>
              {totalPendingKeyRequests > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-white text-[#C0392B] font-mono text-[10px] font-extrabold leading-none">
                  {totalPendingKeyRequests}
                </span>
              )}
            </Link>

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

      {/* FEEDBACK TOAST */}
      {actionFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2B1810] text-white px-5 py-3 rounded-xl shadow-xl border border-[#E8E2D9] text-xs font-bold animate-bounce">
          {actionFeedback}
        </div>
      )}

      {/* ADMIN POPUP NOTIFICATION MODAL CHO YÊU CẦU CẤP KEY */}
      {activePendingRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-2xl shadow-2xl border-2 border-[#C0392B] w-full max-w-lg overflow-hidden animate-fade-in font-sans">
            {/* Header */}
            <div className="p-4 bg-[#C0392B] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded font-mono">
                  {activePendingRequest.request_code}
                </span>
                <h3 className="text-sm sm:text-base font-black tracking-tight text-white mt-1">
                  {activePendingRequest.status === 'faulty_re_requesting'
                    ? 'YÊU CẦU ĐỔI KEY THAY THẾ DO LỖI KÍCH HOẠT'
                    : 'THÔNG BÁO YÊU CẦU CẤP KEY BẢN QUYỀN'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDismissedReqIds((prev) => [...prev, activePendingRequest.id])}
                className="text-white/80 hover:text-white text-xs font-bold px-2 py-1 rounded bg-black/20 hover:bg-black/30"
              >
                Đóng
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-4">
              <p className="text-xs text-[#6E5D53]">
                {activePendingRequest.status === 'faulty_re_requesting'
                  ? 'Key cấp trước đó không kích hoạt được trên máy khách. Hệ thống tự động ghi nhận key lỗi và phát sinh yêu cầu cấp lại key mới.'
                  : 'Kỹ thuật hoặc sales vừa gửi yêu cầu cấp license key cho khách hàng, vui lòng kiểm tra và duyệt cấp key.'}
              </p>

              {/* Request Details Card */}
              <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E8E2D9] space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-[#E8E2D9]">
                  <span className="text-[#6E5D53]">Người yêu cầu:</span>
                  <span className="font-bold text-[#2B1810]">
                    {activePendingRequest.requester_name} ({activePendingRequest.requester_role === 'technician' ? 'Kỹ thuật viên' : activePendingRequest.requester_role === 'sales' ? 'Kinh doanh (Sales)' : 'Quản trị'})
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#E8E2D9]">
                  <span className="text-[#6E5D53]">Phân loại key cần cấp:</span>
                  <span className="font-black text-[#C0392B] uppercase">
                    {activePendingRequest.category_name}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#E8E2D9]">
                  <span className="text-[#6E5D53]">Khách hàng:</span>
                  <span className="font-bold text-[#2B1810]">
                    {activePendingRequest.customer_name} ({activePendingRequest.customer_phone})
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-[#6E5D53]">Email nhận key:</span>
                  <span className="font-bold text-[#0F4C5C] font-mono underline">
                    {activePendingRequest.customer_email}
                  </span>
                </div>
              </div>

              {/* Faulty History Alert if any */}
              {activePendingRequest.faulty_history && activePendingRequest.faulty_history.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs space-y-1">
                  <div className="font-bold text-rose-800">
                    LỊCH SỬ KEY LỖI TRƯỚC ĐÓ:
                  </div>
                  {activePendingRequest.faulty_history.map((fh, idx) => (
                    <div key={idx} className="text-rose-700">
                      Mã key <span className="font-mono font-bold">{fh.key_code}</span>: {fh.reason}
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  disabled={isApproving}
                  onClick={() => handleQuickApprove(activePendingRequest.id)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white text-xs font-bold transition-all shadow-sm text-center"
                >
                  {isApproving ? 'Đang bốc key từ kho...' : 'CHẤP THUẬN & CẤP KEY TỰ ĐỘNG'}
                </button>
                <button
                  type="button"
                  onClick={() => setRejectingRequestId(activePendingRequest.id)}
                  className="py-2.5 px-4 rounded-xl bg-white border border-[#E8E2D9] text-[#6E5D53] hover:text-[#C0392B] hover:border-[#C0392B] text-xs font-bold transition-colors"
                >
                  TỪ CHỐI
                </button>
                <Link
                  href="/quan-ly-key"
                  onClick={() => setDismissedReqIds((prev) => [...prev, activePendingRequest.id])}
                  className="py-2.5 px-4 rounded-xl bg-[#2B1810] text-white hover:bg-black text-xs font-bold text-center"
                >
                  XEM TẠI KHO KEY
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectingRequestId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-2xl shadow-2xl border border-[#E8E2D9] w-full max-w-md p-5 space-y-4 font-sans">
            <h3 className="text-sm font-black text-[#2B1810]">
              TỪ CHỐI YÊU CẦU CẤP KEY
            </h3>
            <p className="text-xs text-[#6E5D53]">
              Vui lòng nhập lý do từ chối để nhân viên nắm rõ thông tin.
            </p>
            <input
              type="text"
              autoFocus
              placeholder="VD: Kho tạm hết key phiên bản này, chờ nhập bổ sung..."
              value={rejectReasonInput}
              onChange={(e) => setRejectReasonInput(e.target.value)}
              className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg text-xs bg-white text-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#C0392B]"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingRequestId(null)}
                className="px-4 py-2 rounded-lg text-xs font-bold text-[#6E5D53] hover:bg-slate-100"
              >
                HỦY
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-lg bg-[#C0392B] text-white text-xs font-bold hover:bg-[#A93226]"
              >
                XÁC NHẬN TỪ CHỐI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
