'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useViTinhAnTamStore } from '@/lib/store';

interface Order {
  id: string;
  order_code: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  device_name: string;
  device_price: number;
  device_tag?: string;
  payment_method: 'qr' | 'cash';
  delivery_method: 'pickup' | 'delivery';
  status: string;
  created_at?: string;
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  processing: 'Đang xử lý',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
};

/**
 * Widget thông báo đơn hàng mới từ website.
 * Tự động poll /api/orders định kỳ; khi có đơn pending mới → popup + âm thanh.
 * Chỉ hiển thị cho admin / sales / technician.
 */
export function NewOrderNotificationWidget() {
  const { currentUser, isLoggedIn, inventory, reserveInventoryItem } = useViTinhAnTamStore();
  const canView = Boolean(
    isLoggedIn &&
      currentUser &&
      ['admin', 'sales_manager', 'tech_manager', 'sales', 'technician'].includes(currentUser.role)
  );

  // Chỉ cần 1 trong 3 người: admin, sales_manager, tech_manager xác nhận đơn hàng
  const canConfirm = Boolean(
    currentUser && ['admin', 'sales_manager', 'tech_manager'].includes(currentUser.role)
  );

  const [orders, setOrders] = useState<Order[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState<string | null>(null);
  const prevPendingCount = useRef(0);
  const initialized = useRef(false);

  const fetchOrders = useCallback(async () => {
    if (!canView) return;
    try {
      const res = await fetch('/api/orders?status=pending', { cache: 'no-store' });
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const list: Order[] = json.data;
        // Phát âm thanh + mở popup khi có đơn mới
        if (initialized.current && list.length > prevPendingCount.current) {
          setIsOpen(true);
          try {
            const AudioCtx =
              window.AudioContext ||
              (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
            if (AudioCtx) {
              const ctx = new AudioCtx();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(659.25, ctx.currentTime);
              osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
              gain.gain.setValueAtTime(0.15, ctx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start();
              osc.stop(ctx.currentTime + 0.45);
            }
          } catch {
            // Silently ignore
          }
        }
        prevPendingCount.current = list.length;
        initialized.current = true;
        setOrders(list);
      }
    } catch {
      // Bỏ qua lỗi mạng
    }
  }, [canView]);

  useEffect(() => {
    if (!canView) return;
    fetchOrders();
    const timer = setInterval(fetchOrders, 30000); // Poll mỗi 30 giây
    return () => clearInterval(timer);
  }, [canView, fetchOrders]);

  const handleConfirm = async (order: Order) => {
    if (!canConfirm) {
      alert('Chỉ Admin, Sales Manager hoặc Technical Manager mới có quyền xác nhận đơn hàng!');
      return;
    }
    setIsConfirming(order.id);
    try {
      // Tìm máy trong kho để chuyển sang trạng thái "Đang đợi bán" (reserved)
      let matched = inventory.find(
        (i) => i.service_tag === order.device_tag && i.qc_status !== 'sold'
      );
      if (!matched && order.device_name) {
        matched = inventory.find(
          (i) =>
            i.qc_status === 'ready_to_sell' &&
            (order.device_name.toLowerCase().includes((i.device_model || i.model || '').toLowerCase()) ||
              (i.device_model || i.model || '').toLowerCase().includes(order.device_name.toLowerCase()))
        );
      }

      if (matched) {
        await reserveInventoryItem({
          itemId: matched.id,
          customerName: order.customer_name,
          customerPhone: order.customer_phone,
          orderCode: order.order_code,
          orderId: order.id,
          deliveryMethod: order.delivery_method,
        });
      }

      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: order.id,
          status: 'confirmed',
          matched_device_tag: matched?.service_tag,
        }),
      });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== order.id));
        prevPendingCount.current = Math.max(0, prevPendingCount.current - 1);
      }
    } finally {
      setIsConfirming(null);
    }
  };

  if (!canView || orders.length === 0) return null;

  const formatVND = (n: number) => `${Number(n || 0).toLocaleString('vi-VN')}₫`;


  return (
    <aside
      aria-label="Đơn Hàng Mới Cần Xác Nhận"
      className={`fixed right-4 print:hidden transition-all duration-200 ${
        isOpen ? 'bottom-6 z-[70]' : 'bottom-[232px] z-40'
      }`}
    >
      {isOpen ? (
        <div className="w-[340px] sm:w-[380px] rounded-xl overflow-hidden shadow-2xl border border-red-200 bg-white">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2B1810] via-red-950 to-[#C0392B] text-white p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-300"></span>
              </span>
              <span className="text-xs font-black tracking-wide uppercase">
                🛒 ĐƠN HÀNG MỚI CẦN XÁC NHẬN
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-mono text-[10px] font-bold">
                {orders.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/30 text-white flex items-center justify-center text-sm font-bold transition-colors"
              aria-label="Đóng thông báo đơn hàng"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="max-h-[50vh] overflow-y-auto divide-y divide-slate-100">
            {orders.map((order) => (
              <div key={order.id} className="p-3.5 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-black text-sm text-[#C0392B]">{order.order_code}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                    {STATUS_LABEL[order.status] || order.status}
                  </span>
                </div>
                <div className="text-xs text-slate-800">
                  <strong>{order.customer_name}</strong> — {order.customer_phone}
                </div>
                <div className="text-xs text-slate-600">{order.device_name}</div>
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-semibold">
                    {order.payment_method === 'cash' ? '💵 Tiền mặt' : '🏦 Chuyển khoản QR'}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-semibold">
                    {order.delivery_method === 'delivery' ? '🚚 Giao tận nơi' : '🏪 Nhận tại cửa hàng'}
                  </span>
                  {order.device_price > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-red-50 border border-red-200 font-mono font-bold text-[#C0392B]">
                      {formatVND(order.device_price)}
                    </span>
                  )}
                </div>
                {canConfirm ? (
                  <button
                    type="button"
                    onClick={() => handleConfirm(order)}
                    disabled={isConfirming === order.id}
                    className="mt-1 w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    {isConfirming === order.id ? 'Đang xác nhận...' : '✓ Xác nhận đơn hàng'}
                  </button>
                ) : (
                  <div className="mt-1 w-full py-1.5 px-2 rounded-lg bg-slate-100 text-slate-500 text-[11px] font-semibold text-center border border-slate-200">
                    ⏳ Chờ Admin / Quản lý xác nhận
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex flex-col items-center justify-center w-[80px] h-[80px] rounded-xl shadow-xl border border-red-300 bg-white hover:scale-105 active:scale-95 transition-all cursor-pointer select-none group"
          title="Xem đơn hàng mới từ website"
        >
          <span className="text-xl leading-none">🛒</span>
          <span className="text-[10px] font-black text-red-700 uppercase mt-1 leading-tight text-center px-1">
            Đơn mới
          </span>
          <span className="text-lg font-black font-mono text-[#C0392B] leading-none mt-0.5">
            {orders.length}
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping inline-block ml-1 align-middle" />
          </span>
        </button>
      )}
    </aside>
  );
}
