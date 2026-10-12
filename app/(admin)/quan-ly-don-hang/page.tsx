'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { message } from 'antd';
import {
  ShoppingBag,
  RefreshCw,
  Search,
  User,
  Phone,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
  PackageCheck,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useViTinhAnTamStore } from '@/lib/store';
import { supabase, isSupabaseConfigured, type InventoryItem } from '@/lib/supabase';

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
  note?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  created_at?: string;
}

const STATUSES = [
  { id: 'pending', label: 'Chờ xác nhận', icon: Clock, color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { id: 'confirmed', label: 'Đã xác nhận', icon: CheckCircle2, color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { id: 'processing', label: 'Đang đóng gói / QC', icon: PackageCheck, color: 'bg-purple-50 text-purple-800 border-purple-200' },
  { id: 'completed', label: 'Hoàn tất xuất kho', icon: ShieldCheck, color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  // Đã loại bỏ cột 'cancelled' để ẩn các đơn hàng đã hủy khỏi giao diện quản lý
];

export default function OrderManagementPage() {
  const { currentUser, inventory, sellInventoryItem, reserveInventoryItem, cancelReservationItem } = useViTinhAnTamStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [executingOrder, setExecutingOrder] = useState<Order | null>(null);

  // Chỉ 1 trong 3 người: admin, sales_manager, tech_manager có quyền xác nhận đơn hàng
  const canConfirmOrder = Boolean(
    currentUser && ['admin', 'sales_manager', 'tech_manager'].includes(currentUser.role)
  );

  const fetchOrders = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const res = await fetch('/api/orders?limit=100', {
        cache: 'no-store',
        headers: {
          'x-staff-role': currentUser?.role || 'admin',
        },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setOrders(json.data);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Bỏ qua lỗi gọi API
    }

    // Dự phòng trực tiếp từ Supabase nếu API bị chặn hoặc rỗng
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
        if (!error && Array.isArray(data)) {
          setOrders(data as Order[]);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Direct Supabase orders error:', err);
      }
    }
    setLoading(false);
  }, [currentUser?.role]);

  useEffect(() => {
    fetchOrders(false);
    const tm = setInterval(() => fetchOrders(false), 30000);
    return () => clearInterval(tm);
  }, [fetchOrders]);

  const changeStatus = async (orderId: string, newStatus: string) => {
    if (newStatus === 'confirmed' && !canConfirmOrder) {
      message.warning('Chỉ Admin, Sales Manager hoặc Technical Manager mới có quyền xác nhận đơn hàng!');
      return;
    }
    try {
      const targetOrder = orders.find((o) => o.id === orderId);
      let matchedTag = targetOrder?.device_tag;

      // 1. Tự động liên kết và chuyển trạng thái máy trong kho sang "Đang đợi bán" khi xác nhận đơn
      if (newStatus === 'confirmed' && targetOrder) {
        let matched = targetOrder.device_tag
          ? inventory.find((i) => i.service_tag === targetOrder.device_tag && i.qc_status !== 'sold')
          : null;
        if (!matched && targetOrder.device_name) {
          matched = inventory.find(
            (i) =>
              i.qc_status === 'ready_to_sell' &&
              (targetOrder.device_name.toLowerCase().includes((i.device_model || i.model || '').toLowerCase()) ||
                (i.device_model || i.model || '').toLowerCase().includes(targetOrder.device_name.toLowerCase()))
          );
        }

        if (matched) {
          matchedTag = matched.service_tag;
          await reserveInventoryItem({
            itemId: matched.id,
            customerName: targetOrder.customer_name,
            customerPhone: targetOrder.customer_phone,
            orderCode: targetOrder.order_code,
            orderId: targetOrder.id,
            deliveryMethod: targetOrder.delivery_method,
            note: targetOrder.note,
          });
          message.info(
            `Đã ghi nhận máy ${matched.service_tag} trong kho chuyển sang [Đang đợi bán] cho khách ${targetOrder.customer_name}!`
          );
        }
      } else if (newStatus === 'cancelled' && targetOrder) {
        // Nếu hủy đơn, giải phóng máy trong kho về lại lưu kho sẵn bán
        const reservedItem = inventory.find(
          (i) => i.reserved_order_id === targetOrder.id || i.reserved_order_code === targetOrder.order_code
        );
        if (reservedItem) {
          await cancelReservationItem(reservedItem.id);
          message.info(`Đã hủy giữ máy ${reservedItem.service_tag} và đưa về lưu kho sẵn bán.`);
        }
      }

      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderId,
          status: newStatus,
          matched_device_tag: matchedTag,
        }),
      });
      if (res.ok) {
        message.success('Cập nhật trạng thái đơn hàng thành công!');
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as Order['status'] } : o))
        );
      } else {
        message.error('Không thể cập nhật trạng thái đơn hàng!');
      }
    } catch {
      message.error('Đã xảy ra lỗi khi kết nối máy chủ!');
    }
  };

  const executeSale = async (order: Order, matchedItem: InventoryItem, warrantyMonths: number) => {
    try {
      const res = await sellInventoryItem({
        itemId: matchedItem.id,
        customerName: order.customer_name,
        customerPhone: order.customer_phone,
        birthDate: '',
        customerAddress: order.customer_address || '',
        serialNumber: matchedItem.serial_number || matchedItem.service_tag,
        warrantyMonths,
        soldPrice: order.device_price,
        notes: `Từ đơn online: ${order.order_code}. ${order.note || ''}`,
      });

      if (res.success) {
        await changeStatus(order.id, 'completed');
        message.success(`Đã xuất kho & kích hoạt bảo hành cho ${order.customer_name}!`);
        setExecutingOrder(null);
      } else {
        message.error(res.message || 'Lỗi khi xuất kho thiết bị!');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Lỗi khi xuất kho';
      message.error(errorMsg);
    }
  };

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase().trim();
    return orders.filter(
      (o) =>
        o.order_code.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.includes(q) ||
        o.device_name.toLowerCase().includes(q)
    );
  }, [orders, searchQuery]);

  return (
    <div className="space-y-5 max-w-7xl mx-auto font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[#C0392B]" />
            <span>Quản Lý Đơn Hàng Online</span>
            <span className="text-xs px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-full border border-blue-200 font-mono">
              {orders.length} đơn
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tiếp nhận đơn đặt hàng từ Website, xuất kho tự động và lập phiếu bảo hành điện tử.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm mã đơn, tên, SĐT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 w-44 sm:w-56"
            />
          </div>

          <button
            type="button"
            onClick={() => fetchOrders(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {loading && orders.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-600">Đang đồng bộ danh sách đơn hàng...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 items-start">
          {STATUSES.map((col) => {
            const list = filteredOrders.filter((o) => o.status === col.id);
            const ColIcon = col.icon;
            return (
              <div
                key={col.id}
                className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-2.5 flex flex-col min-h-[480px]"
              >
                <div
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold border mb-2.5 shadow-2xs ${col.color}`}
                >
                  <div className="flex items-center gap-1.5">
                    <ColIcon className="w-3.5 h-3.5" />
                    <span>{col.label}</span>
                  </div>
                  <span className="font-mono text-[11px] px-1.5 py-0.2 rounded-full bg-white/80">
                    {list.length}
                  </span>
                </div>
                <div className="space-y-2.5 overflow-y-auto max-h-[calc(100vh-260px)] pr-0.5 scrollbar-thin flex-1">
                  {list.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-slate-400 font-medium border border-dashed border-slate-200 rounded-xl">
                      Không có đơn
                    </div>
                  ) : (
                    list.map((order) => (
                      <div
                        key={order.id}
                        className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                            {order.order_code}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {order.created_at
                              ? new Date(order.created_at).toLocaleDateString('vi-VN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Vừa xong'}
                          </span>
                        </div>

                        <div>
                          <div className="font-bold text-slate-900 line-clamp-1">{order.device_name}</div>
                          <div className="text-xs font-black text-[#C0392B] font-mono mt-0.5">
                            {Number(order.device_price || 0).toLocaleString('vi-VN')}₫
                          </div>
                        </div>

                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 space-y-1 text-[11px]">
                          <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                            <User className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{order.customer_name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600 font-mono">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <a href={`tel:${order.customer_phone}`} className="hover:underline text-blue-600">
                              {order.customer_phone}
                            </a>
                          </div>
                          {order.customer_address && (
                            <div className="flex items-start gap-1.5 text-slate-500 line-clamp-2">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                              <span>{order.customer_address}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                            <Truck className="w-3 h-3 text-slate-500" />
                            {order.delivery_method === 'delivery' ? 'Giao tận nơi' : 'Tại tiệm'}
                          </span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                            <CreditCard className="w-3 h-3 text-slate-500" />
                            {order.payment_method === 'qr' ? 'QR Code' : 'Tiền mặt'}
                          </span>
                        </div>
                        {order.note && (
                          <div className="text-[10px] text-slate-500 italic bg-amber-50/70 p-1.5 rounded border border-amber-100">
                            &quot;{order.note}&quot;
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-100 flex flex-col gap-1">
                          {order.status === 'pending' && (
                            canConfirmOrder ? (
                              <button
                                type="button"
                                onClick={() => changeStatus(order.id, 'confirmed')}
                                className="w-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                              >
                                <span>Xác nhận đơn</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            ) : (
                              <div className="w-full text-[11px] font-semibold bg-slate-100 text-slate-500 py-1.5 rounded-lg text-center border border-slate-200">
                                ⏳ Chờ Admin / Quản lý duyệt
                              </div>
                            )
                          )}
                          {order.status === 'confirmed' && (
                            <button
                              type="button"
                              onClick={() => changeStatus(order.id, 'processing')}
                              className="w-full text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                            >
                              <span>Đóng gói &amp; QC</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                          {order.status === 'processing' && (
                            <button
                              type="button"
                              onClick={() => setExecutingOrder(order)}
                              className="w-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Xuất kho &amp; Tạo BH</span>
                            </button>
                          )}
                          {order.status !== 'completed' && order.status !== 'cancelled' && (
                            <button
                              type="button"
                              onClick={() => changeStatus(order.id, 'cancelled')}
                              className="w-full text-[10px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 py-1 rounded transition-colors text-center cursor-pointer"
                            >
                              Hủy đơn
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {executingOrder && (
        <ExecuteOrderModal order={executingOrder} inventory={inventory} onClose={() => setExecutingOrder(null)} onConfirm={(i, m) => executeSale(executingOrder, i, m)} />
      )}
    </div>
  );
}
function ExecuteOrderModal({
  order,
  inventory,
  onClose,
  onConfirm,
}: {
  order: Order;
  inventory: InventoryItem[];
  onClose: () => void;
  onConfirm: (i: InventoryItem, months: number) => void;
}) {
  const matchedItem = order.device_tag
    ? inventory.find((i) => i.service_tag === order.device_tag && i.qc_status !== 'sold')
    : null;
  const [selectedTag, setSelectedTag] = useState<string>(matchedItem?.service_tag || '');
  const [months, setMonths] = useState(12);

  const availableMachines = useMemo(
    () => inventory.filter((i) => i.qc_status !== 'sold'),
    [inventory]
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 p-6 animate-scale-up">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>Hoàn Tất &amp; Xuất Kho Đơn: {order.order_code}</span>
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Hệ thống sẽ cập nhật trừ tồn kho, lưu hồ sơ CRM khách hàng và kích hoạt bảo hành điện tử.
        </p>

        <div className="space-y-4 mb-6">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="text-slate-800">
              Khách hàng: <strong className="font-bold">{order.customer_name}</strong> • SĐT: <strong className="font-mono">{order.customer_phone}</strong>
            </div>
            <div className="text-slate-600">
              Thiết bị: <strong className="text-slate-900">{order.device_name}</strong>
            </div>
            <div className="text-[#C0392B] font-mono font-bold">
              Giá bán: {Number(order.device_price || 0).toLocaleString('vi-VN')}₫
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Chọn máy xuất từ kho (*)
            </label>
            <select
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
            >
              <option value="">-- Chọn máy sẵn sàng từ kho ({availableMachines.length} máy) --</option>
              {availableMachines.map((m) => (
                <option key={m.id} value={m.service_tag}>
                  [{m.service_tag}] {m.device_model || m.model || m.brand} - {m.cpu || ''} ({m.qc_status === 'ready_to_sell' ? 'Sẵn sàng' : 'Chờ test'})
                </option>
              ))}
            </select>
            {matchedItem && (
              <p className="text-[11px] text-emerald-600 mt-1 font-semibold">
                ✓ Đã tự động chọn đúng mã Service Tag theo đơn đặt hàng.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Thời hạn bảo hành (Tháng)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:bg-white focus:outline-none"
                value={months}
                onChange={(e) => setMonths(Math.max(1, Number(e.target.value) || 1))}
                min={1}
                max={36}
              />
              <div className="flex items-center gap-1">
                {[1, 3, 6, 12, 24].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMonths(m)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold border transition-all cursor-pointer ${
                      months === m
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {m}T
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            disabled={!selectedTag}
            onClick={() => {
              const item = inventory.find((i) => i.service_tag === selectedTag);
              if (item) onConfirm(item, months);
            }}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Xác nhận xuất kho &amp; Kích hoạt BH</span>
          </button>
        </div>
      </div>
    </div>
  );
}