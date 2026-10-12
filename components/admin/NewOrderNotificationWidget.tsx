'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShoppingCart, Phone, MessageSquare, Check, ExternalLink, ChevronDown, BellRing } from 'lucide-react';
import { useViTinhAnTamStore } from '@/lib/store';
import { CustomerOrder } from '@/lib/supabase';
import { message } from 'antd';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  processing: 'Đang xử lý',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
};

/**
 * Widget thông báo đơn hàng mới từ website.
 * Tự động mở khi có đơn pending, phát âm thanh cảnh báo,
 * có thể thu nhỏ thành floating pill tiện dụng, không che khuất màn hình.
 */
export function NewOrderNotificationWidget() {
  const {
    currentUser,
    isLoggedIn,
    pendingOrders,
    fetchPendingOrders,
    confirmPendingOrder,
  } = useViTinhAnTamStore();

  const canView = Boolean(
    isLoggedIn &&
      currentUser &&
      ['admin', 'sales_manager', 'tech_manager', 'sales', 'technician'].includes(currentUser.role)
  );

  const canConfirm = Boolean(
    currentUser && ['admin', 'sales_manager', 'tech_manager'].includes(currentUser.role)
  );

  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmingId, setIsConfirmingId] = useState<string | null>(null);
  const prevCount = useRef(0);
  const hasUserDismissed = useRef(false);

  // Phát chuông thông báo đơn hàng
  const playChime = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch {
      // Bỏ qua lỗi audio trình duyệt
    }
  };

  // Tự động mở khi có đơn hàng mới
  useEffect(() => {
    if (!canView) return;
    const count = pendingOrders.length;

    if (count > 0) {
      // Nếu có thêm đơn mới phát sinh hoặc chưa từng bấm thu nhỏ
      if (count > prevCount.current || !hasUserDismissed.current) {
        setIsOpen(true);
        if (count > prevCount.current) {
          playChime();
        }
      }
    } else {
      setIsOpen(false);
      hasUserDismissed.current = false;
    }
    prevCount.current = count;
  }, [canView, pendingOrders.length]);

  const handleConfirm = async (order: CustomerOrder) => {
    if (!canConfirm) {
      message.warning('Chỉ Admin, Sales Manager hoặc Quản lý Kỹ thuật mới có quyền xác nhận đơn!');
      return;
    }
    setIsConfirmingId(order.id);
    try {
      const success = await confirmPendingOrder(order);
      if (success) {
        message.success(`Đã xác nhận đơn hàng ${order.order_code}! Thiết bị đã được chuyển sang trạng thái "Đang đợi bán".`);
      } else {
        message.error('Không thể xác nhận đơn hàng lúc này. Vui lòng thử lại!');
      }
    } catch {
      message.error('Lỗi khi gửi yêu cầu xác nhận đơn.');
    } finally {
      setIsConfirmingId(null);
    }
  };

  const handleDismiss = () => {
    hasUserDismissed.current = true;
    setIsOpen(false);
  };

  if (!canView || pendingOrders.length === 0) return null;

  const formatVND = (n: number) => `${Number(n || 0).toLocaleString('vi-VN')}₫`;

  return (
    <aside
      aria-label="Đơn Hàng Mới Cần Xác Nhận"
      className="fixed print:hidden transition-all duration-300 z-[80]"
      style={{
        bottom: isOpen ? '24px' : '24px',
        right: isOpen ? '16px' : '108px', // Không đè lên Deadline widget ở right-4 (khoảng 80px width)
      }}
    >
      {isOpen ? (
        /* ================= KHUNG THÔNG BÁO CHI TIẾT (MỞ RỘNG) ================= */
        <div className="w-[360px] sm:w-[410px] rounded-2xl overflow-hidden shadow-2xl border border-red-300 dark:border-red-900 bg-white dark:bg-slate-900 animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2B1810] via-red-950 to-[#C0392B] text-white p-3.5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-300"></span>
              </span>
              <BellRing className="w-4 h-4 text-amber-300 animate-bounce" />
              <span className="text-xs font-black tracking-wide uppercase">
                ĐƠN HÀNG MỚI TỪ WEBSITE
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-mono text-xs font-black">
                {pendingOrders.length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleDismiss}
                className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/30 text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                title="Thu nhỏ thanh thông báo"
                aria-label="Thu nhỏ thông báo"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body: Danh sách đơn hàng */}
          <div className="max-h-[55vh] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-1">
            {pendingOrders.map((order) => {
              const cleanPhone = String(order.customer_phone || '').replace(/\D/g, '');
              const isConfirmingThis = isConfirmingId === order.id;

              return (
                <div key={order.id} className="p-3.5 space-y-2 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 rounded-xl transition-colors">
                  {/* Mã đơn & Trạng thái */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-black text-sm text-[#C0392B] dark:text-rose-400">
                      {order.order_code}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800">
                      {STATUS_LABEL[order.status] || order.status}
                    </span>
                  </div>

                  {/* Thông tin khách hàng & Nút liên hệ */}
                  <div className="flex items-start justify-between gap-2 text-xs">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {order.customer_name}
                      </div>
                      <div className="text-slate-500 font-mono text-[11px]">
                        {order.customer_phone}
                      </div>
                    </div>
                    {cleanPhone && (
                      <div className="flex items-center gap-1 shrink-0">
                        <a
                          href={`https://zalo.me/${cleanPhone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center gap-1 transition-colors border border-blue-200"
                          title="Mở Zalo nhắn tin với khách"
                        >
                          <MessageSquare className="w-3 h-3 text-blue-600" />
                          <span>Zalo</span>
                        </a>
                        <a
                          href={`tel:${cleanPhone}`}
                          className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] transition-colors border border-slate-200"
                          title="Gọi điện cho khách"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Thiết bị & Giá */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700 space-y-1">
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                      {order.device_name}
                    </div>
                    {order.device_tag && (
                      <div className="text-[10px] text-slate-500 font-mono">
                        S/N: {order.device_tag}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/40 dark:border-slate-700">
                      <span className="text-[10px] text-slate-500">Tổng tiền:</span>
                      <span className="font-mono font-black text-sm text-[#C0392B] dark:text-rose-400">
                        {formatVND(order.device_price)}
                      </span>
                    </div>
                  </div>

                  {/* Hình thức thanh toán & Giao nhận */}
                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300">
                      {order.payment_method === 'cash' ? '💵 Tiền mặt' : '🏦 Chuyển khoản QR'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300">
                      {order.delivery_method === 'delivery' ? '🚚 Giao tận nơi' : '🏪 Nhận tại quầy'}
                    </span>
                  </div>

                  {order.customer_address && order.delivery_method === 'delivery' && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-amber-50/60 dark:bg-amber-950/30 p-1.5 rounded border border-amber-200/60 text-xs">
                      📍 {order.customer_address}
                    </div>
                  )}

                  {/* Nút thao tác xác nhận */}
                  {canConfirm ? (
                    <button
                      type="button"
                      onClick={() => handleConfirm(order)}
                      disabled={isConfirmingThis}
                      className="mt-1 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99]"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isConfirmingThis ? 'Đang xác nhận...' : 'Xác nhận đơn & Giữ máy'}</span>
                    </button>
                  ) : (
                    <div className="mt-1 w-full py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 text-[11px] font-semibold text-center border border-slate-200 dark:border-slate-700">
                      ⏳ Chờ Admin / Quản lý xác nhận
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer chuyển sang trang Quản lý đơn hàng */}
          <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500">
              Cần kiểm tra chi tiết?
            </span>
            <Link
              href="/quan-ly-don-hang"
              onClick={() => setIsOpen(false)}
              className="font-bold text-[#C0392B] dark:text-rose-400 hover:underline flex items-center gap-1"
            >
              <span>Vào trang Đơn Hàng</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      ) : (
        /* ================= NÚT FLOATING PILL THU NHỎ (GỌN GÀNG, ĐẲNG CẤP) ================= */
        <button
          type="button"
          onClick={() => {
            hasUserDismissed.current = false;
            setIsOpen(true);
          }}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-[#2B1810] via-red-950 to-[#C0392B] text-white shadow-xl shadow-red-950/30 border border-amber-400/40 hover:scale-105 active:scale-95 transition-all cursor-pointer font-sans group select-none"
          title="Bấm để xem danh sách đơn hàng mới cần xác nhận"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-300"></span>
          </span>
          <ShoppingCart className="w-4 h-4 text-amber-300" />
          <span className="text-xs font-black uppercase tracking-wide">
            Đơn mới
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white text-[#C0392B] font-mono text-xs font-black shadow-xs">
            {pendingOrders.length}
          </span>
        </button>
      )}
    </aside>
  );
}
