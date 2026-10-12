'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  Phone,
  MessageSquare,
  Check,
  ExternalLink,
  ChevronDown,
  BellRing,
  Volume2,
  VolumeX,
  Copy,
  Clock,
  Sparkles,
  Wrench,
  Truck,
  MapPin,
  Calendar,
} from 'lucide-react';
import { useViTinhAnTamStore } from '@/lib/store';
import { CustomerOrder, ServiceTicket } from '@/lib/supabase';
import { message } from 'antd';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  processing: 'Đang xử lý',
  received: 'Mới tiếp nhận',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
};

function formatOrderTime(createdAt?: string): string {
  if (!createdAt) return 'Vừa đặt';
  try {
    const d = new Date(createdAt);
    if (isNaN(d.getTime())) return 'Vừa đặt';
    const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diffSec < 60) return 'Vừa xong';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} giờ trước`;
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  } catch {
    return 'Vừa đặt';
  }
}

function TicketItemCard({
  ticket,
  isConfirming,
  onConfirm,
  onCopyPhone,
  onClose,
}: {
  ticket: ServiceTicket;
  isConfirming: boolean;
  onConfirm: (t: ServiceTicket) => void;
  onCopyPhone: (phone: string, e: React.MouseEvent) => void;
  onClose: () => void;
}) {
  const cleanPhone = String(ticket.customer_phone || '').replace(/\D/g, '');
  const isOnsite = ticket.ticket_type === 'onsite' || ticket.reception_mode === 'mobile';

  return (
    <div className="p-3 space-y-2 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200/70">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-black text-sm text-blue-700 dark:text-blue-400">{ticket.ticket_code}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${isOnsite ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-blue-100 text-blue-800 border-blue-300'}`}>
            {isOnsite ? '🚚 Onsite' : '🏪 Quầy'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{formatOrderTime(ticket.created_at)}</span>
        </div>
      </div>
      <div className="flex items-start justify-between gap-2 text-xs bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200/80">
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100">{ticket.customer_name}</div>
          <div className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
            <span>{ticket.customer_phone}</span>
            <button type="button" onClick={(e) => onCopyPhone(ticket.customer_phone, e)} className="text-slate-400 p-0.5"><Copy className="w-3 h-3" /></button>
          </div>
        </div>
        {cleanPhone && (
          <div className="flex items-center gap-1.5 shrink-0">
            <a href={`https://zalo.me/${cleanPhone}`} target="_blank" rel="noreferrer" className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-[11px] font-bold flex items-center gap-1 border border-blue-200">
              <MessageSquare className="w-3 h-3 text-blue-600" /><span>Zalo</span>
            </a>
            <a href={`tel:${cleanPhone}`} className="p-1.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200"><Phone className="w-3 h-3 text-emerald-600" /></a>
          </div>
        )}
      </div>
      <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200/80 text-xs space-y-1">
        <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
          <Wrench className="w-3.5 h-3.5 text-blue-600" /><span>{ticket.issue_description || 'Kiểm tra máy'}</span>
        </div>
        {ticket.device_name && <div className="text-[11px] text-slate-600">Thiết bị: <strong>{ticket.device_name}</strong></div>}
        {(ticket.estimated_completion || ticket.technician_note) && (
          <div className="text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-amber-600" /><span>{ticket.estimated_completion || ticket.technician_note}</span>
          </div>
        )}
      </div>
      {(ticket.customer_address || ticket.dispatch_address) && (
        <div className="text-[11px] text-slate-600 bg-amber-50/70 p-1.5 rounded-lg border border-amber-200/70 flex items-start gap-1">
          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" /><span>{ticket.customer_address || ticket.dispatch_address}</span>
        </div>
      )}
      <div className="pt-1 flex items-center gap-2">
        <button type="button" onClick={() => onConfirm(ticket)} disabled={isConfirming} className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50">
          <Check className="w-3.5 h-3.5" /><span>{isConfirming ? 'Đang tiếp nhận...' : 'Tiếp Nhận Dịch Vụ'}</span>
        </button>
        <Link href={isOnsite ? '/cuu-ho-onsite' : `/phieu-sua-chua?ticketId=${ticket.id}`} onClick={onClose} className="py-2 px-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1" title="Chi tiết phiếu">
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

/**
 * Widget thông báo Đơn Hàng Mới & Yêu Cầu Dịch Vụ Mới từ website:
 * - Đơn mua máy / linh kiện / key (pendingOrders)
 * - Đơn yêu cầu dịch vụ / đặt lịch sửa chữa, cứu hộ onsite (pendingServiceRequests)
 * - Tự động popup & phát chuông khi có yêu cầu mới
 * - Bố cục hợp lý tại bottom-20 right-4 (xếp tầng trên DeadlineTrackingWidget bottom-6 right-4)
 */
export function NewOrderNotificationWidget() {
  const {
    currentUser,
    isLoggedIn,
    pendingOrders,
    confirmPendingOrder,
    tickets,
    confirmServiceTicket,
  } = useViTinhAnTamStore();

  const canView = Boolean(
    isLoggedIn &&
      currentUser &&
      ['admin', 'sales_manager', 'tech_manager', 'sales', 'technician'].includes(currentUser.role)
  );

  const canConfirm = Boolean(
    currentUser && ['admin', 'sales_manager', 'tech_manager'].includes(currentUser.role)
  );

  // Danh sách yêu cầu dịch vụ / đặt lịch mới
  const pendingServiceRequests = useMemo(() => {
    return (tickets || []).filter((t) => {
      const isOnlineBooking = t.visual_condition === 'Tiếp nhận qua hệ thống đặt lịch Online';
      const isPending = t.status === 'received' || (isOnlineBooking && t.status === 'processing');
      return isPending;
    });
  }, [tickets]);

  const totalCount = pendingOrders.length + pendingServiceRequests.length;

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'tickets'>('orders');
  const [isConfirmingId, setIsConfirmingId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [, setTick] = useState(0);

  const prevTotalCount = useRef(0);
  const hasUserDismissed = useRef(false);

  // Tự động chuyển tab nếu tab hiện tại không có dữ liệu
  useEffect(() => {
    if (activeTab === 'orders' && pendingOrders.length === 0 && pendingServiceRequests.length > 0) {
      setActiveTab('tickets');
    } else if (activeTab === 'tickets' && pendingServiceRequests.length === 0 && pendingOrders.length > 0) {
      setActiveTab('orders');
    }
  }, [activeTab, pendingOrders.length, pendingServiceRequests.length]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('ant_order_chime_muted');
      if (savedMute === 'true') setIsMuted(true);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  const playChime = () => {
    if (isMuted) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch {}
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !isMuted;
    setIsMuted(nextState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ant_order_chime_muted', String(nextState));
    }
    if (!nextState) {
      playChime();
      message.info('Đã bật chuông thông báo.');
    } else {
      message.info('Đã tắt chuông thông báo.');
    }
  };

  // Tự động mở khi có đơn hàng hoặc yêu cầu dịch vụ mới
  useEffect(() => {
    if (!canView) return;

    if (totalCount > 0 && !hasUserDismissed.current) {
      setIsOpen(true);
      if (totalCount > prevTotalCount.current) {
        playChime();
      }
    } else if (totalCount === 0) {
      setIsOpen(false);
      hasUserDismissed.current = false;
    }
    prevTotalCount.current = totalCount;
  }, [canView, totalCount, isMuted]);

  const handleConfirmOrder = async (order: CustomerOrder) => {
    if (!canConfirm) {
      message.warning('Chỉ Admin hoặc Quản lý mới có quyền xác nhận đơn!');
      return;
    }
    setIsConfirmingId(order.id);
    try {
      const success = await confirmPendingOrder(order);
      if (success) {
        message.success(`Đã xác nhận đơn hàng ${order.order_code}! Thiết bị chuyển sang "Đang đợi bán".`);
      } else {
        message.error('Không thể xác nhận đơn hàng lúc này.');
      }
    } catch {
      message.error('Lỗi khi gửi yêu cầu xác nhận đơn.');
    } finally {
      setIsConfirmingId(null);
    }
  };

  const handleConfirmTicket = async (ticket: ServiceTicket) => {
    setIsConfirmingId(ticket.id);
    try {
      const success = await confirmServiceTicket(ticket.id, currentUser?.name);
      if (success) {
        message.success(`Đã tiếp nhận yêu cầu dịch vụ ${ticket.ticket_code}! Chuyển sang khâu chẩn đoán.`);
      } else {
        message.error('Không thể cập nhật trạng thái phiếu lúc này.');
      }
    } catch {
      message.error('Lỗi khi tiếp nhận yêu cầu dịch vụ.');
    } finally {
      setIsConfirmingId(null);
    }
  };

  const handleCopyPhone = (phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      navigator.clipboard.writeText(phone);
      message.success(`Đã sao chép SĐT: ${phone}`);
    } catch {
      message.info(`Số điện thoại: ${phone}`);
    }
  };

  const handleDismiss = () => {
    hasUserDismissed.current = true;
    setIsOpen(false);
  };

  if (!canView || totalCount === 0) return null;

  const formatVND = (n: number) => `${Number(n || 0).toLocaleString('vi-VN')}₫`;

  return (
    <aside
      aria-label="Thông Báo Đơn Hàng & Yêu Cầu Dịch Vụ Mới"
      className={`fixed print:hidden transition-all duration-300 ${
        isOpen
          ? 'bottom-3 right-3 left-3 sm:left-auto sm:bottom-6 sm:right-4 w-auto sm:w-[440px] max-w-[440px] z-[85]'
          : 'bottom-20 right-4 z-40'
      }`}
    >
      {isOpen ? (
        <div className="w-full rounded-2xl overflow-hidden shadow-2xl border-2 border-red-500/80 dark:border-red-700 bg-white dark:bg-slate-900 animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2B1810] via-red-950 to-[#C0392B] text-white p-3.5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-300"></span>
              </span>
              <BellRing className="w-4 h-4 text-amber-300 animate-bounce" />
              <span className="text-xs font-black tracking-wide uppercase">
                YÊU CẦU MỚI TỪ WEBSITE
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-mono text-xs font-black">
                {totalCount}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleToggleMute}
                className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/30 text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                title={isMuted ? 'Bật chuông thông báo' : 'Tắt chuông thông báo'}
                aria-label="Bật tắt chuông"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-amber-300" /> : <Volume2 className="w-3.5 h-3.5 text-white" />}
              </button>

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

          {/* Subheader: Tabs Switcher */}
          <div className="bg-slate-100 dark:bg-slate-800/80 p-1.5 border-b border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-white dark:bg-slate-900 text-[#C0392B] dark:text-rose-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Đơn Mua Hàng</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-100 text-red-700 font-mono font-bold">
                {pendingOrders.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tickets')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'tickets'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Dịch Vụ & Đặt Lịch</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-700 font-mono font-bold">
                {pendingServiceRequests.length}
              </span>
            </button>
          </div>

          {/* Body Content */}
          <div className="max-h-[55vh] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-2 space-y-2">
            {activeTab === 'orders' ? (
              pendingOrders.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Không có đơn mua hàng nào đang chờ xử lý.
                </div>
              ) : (
                pendingOrders.map((order) => {
              const cleanPhone = String(order.customer_phone || '').replace(/\D/g, '');
              const isConfirmingThis = isConfirmingId === order.id;
              const timeAgoText = formatOrderTime(order.created_at);

              return (
                <div
                  key={order.id}
                  className="p-3 space-y-2.5 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 rounded-xl transition-all border border-slate-200/60 dark:border-slate-700/60"
                >
                  {/* Mã đơn & Thời gian */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-black text-sm text-[#C0392B] dark:text-rose-400">
                        {order.order_code}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800">
                        {STATUS_LABEL[order.status] || order.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{timeAgoText}</span>
                    </div>
                  </div>

                  {/* Thông tin khách hàng & Nút liên hệ */}
                  <div className="flex items-start justify-between gap-2 text-xs bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-700">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {order.customer_name}
                      </div>
                      <div className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                        <span>{order.customer_phone}</span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyPhone(order.customer_phone, e)}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5"
                          title="Sao chép số điện thoại"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {cleanPhone && (
                      <div className="flex items-center gap-1 shrink-0">
                        <a
                          href={`https://zalo.me/${cleanPhone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/70 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[11px] font-bold flex items-center gap-1 transition-colors border border-blue-200 dark:border-blue-800"
                          title="Mở Zalo nhắn tin trực tiếp với khách"
                        >
                          <MessageSquare className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          <span>Zalo</span>
                        </a>
                        <a
                          href={`tel:${cleanPhone}`}
                          className="p-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-[11px] transition-colors border border-emerald-200 dark:border-emerald-800"
                          title="Bấm gọi trực tiếp cho khách"
                        >
                          <Phone className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Thiết bị & Giá */}
                  <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-700 space-y-1">
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                      {order.device_name}
                    </div>
                    {order.device_tag && (
                      <div className="text-[10px] text-slate-500 font-mono">
                        Mã máy / S/N: <strong className="text-slate-700 dark:text-slate-300">{order.device_tag}</strong>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700">
                      <span className="text-[10px] text-slate-500">Tổng tiền đơn:</span>
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
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-amber-50/70 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-200/70 dark:border-amber-900/50">
                      📍 <strong>Địa chỉ giao:</strong> {order.customer_address}
                    </div>
                  )}

                  {order.note && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-200/70 dark:border-slate-700/60">
                      📝 <strong>Ghi chú:</strong> {order.note}
                    </div>
                  )}

                  {/* Nút thao tác xác nhận đơn */}
                  {canConfirm && (
                    <button
                      type="button"
                      onClick={() => handleConfirmOrder(order)}
                      disabled={isConfirmingThis}
                      className="mt-1 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99]"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>{isConfirmingThis ? 'Đang xác nhận...' : 'Xác nhận đơn & Giữ máy'}</span>
                    </button>
                  )}
                </div>
              );
            })
          )
        ) : (
          /* TAB 2: YÊU CẦU DỊCH VỤ / ĐẶT LỊCH */
            pendingServiceRequests.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Không có yêu cầu dịch vụ nào đang chờ xử lý.
              </div>
            ) : (
              pendingServiceRequests.map((tk) => (
                <TicketItemCard
                  key={tk.id}
                  ticket={tk}
                  isConfirming={isConfirmingId === tk.id}
                  onConfirm={handleConfirmTicket}
                  onCopyPhone={handleCopyPhone}
                  onClose={() => setIsOpen(false)}
                />
              ))
            )
          )}
          </div>

          {/* Footer Link */}
          <div className="bg-slate-50 dark:bg-slate-800 px-3.5 py-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">Cửa hàng Vi Tính An Tâm</span>
            <div className="flex items-center gap-3">
              <Link
                href="/quan-ly-don-hang"
                onClick={() => setIsOpen(false)}
                className="text-[#C0392B] dark:text-rose-400 font-bold hover:underline text-[11px]"
              >
                QL Đơn hàng →
              </Link>
              <Link
                href="/phieu-sua-chua"
                onClick={() => setIsOpen(false)}
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline text-[11px]"
              >
                QL Phiếu SC →
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* ================= FLOATING PILL KHI THU NHỎ (STACKED AT bottom-20 right-4) ================= */
        <button
          type="button"
          onClick={() => {
            hasUserDismissed.current = false;
            setIsOpen(true);
          }}
          className="group flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-[#2B1810] via-red-950 to-[#C0392B] text-white shadow-xl hover:shadow-2xl border-2 border-red-400 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Nhấp để xem đơn hàng & yêu cầu dịch vụ mới"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-300"></span>
          </span>
          <BellRing className="w-4 h-4 text-amber-300 animate-bounce" />
          <span className="text-xs font-bold tracking-wide">
            {pendingOrders.length > 0 && pendingServiceRequests.length > 0
              ? `${totalCount} Đơn & Dịch vụ`
              : pendingServiceRequests.length > 0
              ? `${pendingServiceRequests.length} Yêu cầu DV`
              : `${pendingOrders.length} Đơn hàng mới`}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono text-[11px] font-black">
            {totalCount}
          </span>
        </button>
      )}
    </aside>
  );
}
