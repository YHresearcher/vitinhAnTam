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
  Award,
  Plus,
  Eye,
} from 'lucide-react';
import { useViTinhAnTamStore } from '@/lib/store';
import { supabase, isSupabaseConfigured, type InventoryItem, type UserAccount } from '@/lib/supabase';
import { CRM_TIER_CONFIG, calculateCustomerTier } from '@/lib/crmTiers';
import CashflowSaleConfirmModal, { CashflowSaleConfirmData } from '@/components/admin/CashflowSaleConfirmModal';
import CreateOrderModal from '@/components/admin/CreateOrderModal';
import OrderDetailModal, { Order } from '@/components/admin/OrderDetailModal';

const STATUSES = [
  { id: 'pending', label: 'Chờ xác nhận', icon: Clock, color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { id: 'confirmed', label: 'Đã xác nhận', icon: CheckCircle2, color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { id: 'processing', label: 'Đang đóng gói / QC', icon: PackageCheck, color: 'bg-purple-50 text-purple-800 border-purple-200' },
  { id: 'completed', label: 'Hoàn tất xuất kho', icon: ShieldCheck, color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  // Đã loại bỏ cột 'cancelled' để ẩn các đơn hàng đã hủy khỏi giao diện quản lý
];

export default function OrderManagementPage() {
  const {
    currentUser,
    inventory,
    customers,
    users,
    sellInventoryItem,
    updateInventoryItem,
    reserveInventoryItem,
    cancelReservationItem,
    creditTechnicianPayroll,
  } = useViTinhAnTamStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [executingOrder, setExecutingOrder] = useState<Order | null>(null);
  const [changingDeliveryOrder, setChangingDeliveryOrder] = useState<Order | null>(null);
  const [cashflowOrderData, setCashflowOrderData] = useState<CashflowSaleConfirmData | null>(null);
  const [isSubmittingOrderSale, setIsSubmittingOrderSale] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<Order | null>(null);

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
        if (selectedOrderDetail && selectedOrderDetail.id === orderId) {
          setSelectedOrderDetail((prev) =>
            prev ? { ...prev, status: newStatus as Order['status'] } : null
          );
        }
      } else {
        message.error('Không thể cập nhật trạng thái đơn hàng!');
      }
    } catch {
      message.error('Đã xảy ra lỗi khi kết nối máy chủ!');
    }
  };

  const handleUpdateAssignedCare = async (orderId: string, careId: string, careName: string) => {
    if (currentUser?.role !== 'admin') {
      message.error('Chỉ admin mới có quyền thay đổi người chăm sóc khách hàng!');
      return;
    }
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: orderId,
          assigned_care_id: careId,
          assigned_care_name: careName,
        }),
      });
      if (res.ok) {
        message.success(`Đã phân công ${careName} chăm sóc khách hàng đơn này!`);
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, assigned_care_id: careId, assigned_care_name: careName }
              : o
          )
        );
        if (selectedOrderDetail && selectedOrderDetail.id === orderId) {
          setSelectedOrderDetail((prev) =>
            prev ? { ...prev, assigned_care_id: careId, assigned_care_name: careName } : null
          );
        }
      } else {
        const data = await res.json().catch(() => ({}));
        message.error(data.message || 'Lỗi cập nhật người chăm sóc');
      }
    } catch {
      message.error('Lỗi kết nối khi cập nhật người chăm sóc');
    }
  };

  const executeSale = (
    order: Order,
    matchedItem: InventoryItem,
    warranty: { months: number; type: 'months' | 'manufacturer' },
    deliveryInfo: {
      deliveryMethod: 'pickup' | 'delivery';
      deliveryStaffId?: string;
      deliveryStaffName?: string;
      deliveryFee?: number;
      shippingAddress?: string;
    }
  ) => {
    const currentCost = Number(matchedItem.import_price || matchedItem.cost_price || 0);
    const isWalkIn = (!order.referral_code || order.referral_code === 'Khách vãng lai') && !order.seller_name;
    const isKeyOrder =
      /key|bản quyền|windows|office/i.test(order.device_name || '') ||
      /key|bản quyền|windows|office/i.test(matchedItem?.device_model || matchedItem?.model || '');

    const deliveryNote = deliveryInfo.deliveryMethod === 'delivery'
      ? `[Giao tận nơi: ${deliveryInfo.deliveryStaffName || 'KTV'} - Thù lao: ${Number(deliveryInfo.deliveryFee || 0).toLocaleString('vi-VN')}₫]`
      : '[Khách nhận tại quầy]';

    setCashflowOrderData({
      item: matchedItem,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      customerAddress: deliveryInfo.shippingAddress || order.customer_address || '',
      serialNumber: matchedItem.serial_number || matchedItem.service_tag,
      warrantyMonths: warranty.months,
      warrantyType: warranty.type,
      soldPrice: Number(order.device_price) || 0,
      costPrice: currentCost,
      orderCode: order.order_code,
      referralCode: order.referral_code || 'Khách vãng lai',
      sellerName: order.seller_name || (isWalkIn ? 'Khách vãng lai' : order.referral_code),
      isWalkIn,
      productType: isKeyOrder ? 'key' : 'machine',
      deliveryMethod: deliveryInfo.deliveryMethod,
      deliveryStaffId: deliveryInfo.deliveryStaffId,
      deliveryStaffName: deliveryInfo.deliveryStaffName,
      deliveryFee: deliveryInfo.deliveryFee,
      notes: `Từ đơn online: ${order.order_code}. ${deliveryNote}. ${order.note || ''}`,
    });
  };

  const handleFinalizeOrderSale = async (finalData: CashflowSaleConfirmData) => {
    if (!executingOrder || isSubmittingOrderSale) return;
    setIsSubmittingOrderSale(true);

    try {
      const { item, costPrice, soldPrice, warrantyMonths, warrantyType } = finalData;

      // Đồng bộ giá vốn nếu có điều chỉnh
      if (costPrice !== (item.import_price || item.cost_price || 0)) {
        await updateInventoryItem(item.id, { import_price: costPrice });
      }

      const isKey =
        finalData.productType === 'key' ||
        /key|bản quyền|windows|office/i.test(executingOrder.device_name || '') ||
        /key|bản quyền|windows|office/i.test(item.device_model || item.model || '');

      const isWalkIn = Boolean(finalData.isWalkIn) || finalData.referralCode === 'Khách vãng lai';
      const profit = Math.max(0, soldPrice - costPrice);
      // Nếu là khách vãng lai, hoa hồng sales = 0₫ và gộp trọn vào lợi nhuận chung
      const sellerBonus = isWalkIn ? 0 : Math.round(profit * 0.10);
      const lenderBonus = Math.round(profit * 0.05);
      const lenderTotal = costPrice + lenderBonus;
      // Trích cho Admin: 10% đối với Key, 5% đối với máy tính/linh kiện
      const adminRate = isKey ? 0.10 : 0.05;
      const adminDeduction = Math.round(profit * adminRate);
      const remainingProfit = profit - sellerBonus - lenderBonus - adminDeduction;

      const adminRateLabel = isKey ? '10%' : '5%';
      const remainingPercentLabel = isKey
        ? (isWalkIn ? '85%' : '75%')
        : (isWalkIn ? '90%' : '80%');

      const sellerLabel = isWalkIn
        ? 'Khách vãng lai (10% hoa hồng gộp vào lợi nhuận chung)'
        : `${finalData.sellerName || executingOrder.seller_name || 'Sale'} (10%: ${sellerBonus.toLocaleString('vi-VN')}₫)`;

      const deliveryNote = finalData.deliveryMethod === 'delivery'
        ? `[Giao tận nơi: ${finalData.deliveryStaffName || 'KTV'} - Thù lao: ${Number(finalData.deliveryFee || 0).toLocaleString('vi-VN')}₫]`
        : '[Khách nhận tại quầy]';

      const cashflowNote = `[Đơn online: ${executingOrder.order_code}] ${deliveryNote} | Giá bán: ${soldPrice.toLocaleString('vi-VN')}₫ | Vốn nhập: ${costPrice.toLocaleString('vi-VN')}₫ | Lợi nhuận: ${profit.toLocaleString('vi-VN')}₫ | Nguồn: ${sellerLabel} | Hoàn người cho vay (Vốn+5%LN): ${lenderTotal.toLocaleString('vi-VN')}₫ | Trích Admin (${adminRateLabel}): ${adminDeduction.toLocaleString('vi-VN')}₫ | ${isWalkIn ? `LN chung doanh nghiệp (${remainingPercentLabel})` : `LN còn lại (${remainingPercentLabel})`}: ${remainingProfit.toLocaleString('vi-VN')}₫. ${executingOrder.note || ''}`;

      const res = await sellInventoryItem({
        itemId: item.id,
        customerName: executingOrder.customer_name,
        customerPhone: executingOrder.customer_phone,
        birthDate: '',
        customerAddress: finalData.customerAddress || executingOrder.customer_address || '',
        serialNumber: item.serial_number || item.service_tag,
        warrantyMonths,
        warrantyType,
        soldPrice,
        notes: cashflowNote,
      });

      if (res.success) {
        // Tự động ghi nhận tiền công cho nhân viên đi giao hàng (như điều phối ca dịch vụ)
        if (
          finalData.deliveryMethod === 'delivery' &&
          finalData.deliveryStaffName &&
          finalData.deliveryFee &&
          finalData.deliveryFee > 0
        ) {
          await creditTechnicianPayroll(
            finalData.deliveryStaffName,
            finalData.deliveryFee,
            `Giao đơn hàng [${executingOrder.order_code}] đến ${executingOrder.customer_name}`
          );
        }

        await changeStatus(executingOrder.id, 'completed');

        // Cập nhật thông tin giao hàng trên đơn hàng
        try {
          await fetch('/api/orders', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: executingOrder.id,
              status: 'completed',
              delivery_method: finalData.deliveryMethod,
              delivery_staff_id: finalData.deliveryStaffId,
              delivery_staff_name: finalData.deliveryStaffName,
              delivery_fee: finalData.deliveryFee,
              note: `${executingOrder.note || ''} • ${deliveryNote}`.trim(),
            }),
          });
        } catch {
          // best-effort
        }

        if (
          finalData.deliveryMethod === 'delivery' &&
          finalData.deliveryStaffName &&
          finalData.deliveryFee &&
          finalData.deliveryFee > 0
        ) {
          message.success(
            `Đã xuất kho & tự động ghi nhận ${finalData.deliveryFee.toLocaleString('vi-VN')}₫ tiền công cho ${finalData.deliveryStaffName}!`
          );
        } else {
          message.success(`Đã xuất kho (khách nhận tại quầy) & kích hoạt bảo hành cho ${executingOrder.customer_name}!`);
        }

        setCashflowOrderData(null);
        setExecutingOrder(null);
      } else {
        message.error(res.message || 'Lỗi khi xuất kho thiết bị!');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Lỗi khi xuất kho';
      message.error(errorMsg);
    } finally {
      setIsSubmittingOrderSale(false);
    }
  };

  // Đổi hình thức giao nhận SAU KHI đã xuất phiếu (đơn hoàn tất).
  // pickup -> delivery: ghi nhận tiền công cho người giao mới (như lúc xuất kho).
  // delivery -> pickup: KHÔNG tự hoàn tiền công đã ghi nhận (không có cơ chế
  // hoàn an toàn) — modal cảnh báo rõ để admin tự điều chỉnh ở bảng lương.
  const handleChangeDelivery = async (
    order: Order,
    info: { method: 'pickup' | 'delivery'; staffId?: string; staffName?: string; fee?: number }
  ) => {
    const wasDelivery = order.delivery_method === 'delivery';
    const nowDelivery = info.method === 'delivery';
    const newStaffId = nowDelivery ? info.staffId || '' : '';
    const newStaffName = nowDelivery ? info.staffName || '' : '';
    const newFee = nowDelivery ? info.fee || 0 : 0;
    const oldLabel = wasDelivery ? 'Giao tận nơi' : 'Nhận tại quầy';
    const newLabel = nowDelivery ? 'Giao tận nơi' : 'Nhận tại quầy';
    const changeNote = `[Đổi giao nhận ${new Date().toLocaleDateString('vi-VN')}: ${oldLabel} → ${newLabel}${
      nowDelivery && newStaffName ? ` (${newStaffName} — ${newFee.toLocaleString('vi-VN')}đ)` : ''
    }]`;
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: order.id,
          delivery_method: info.method,
          delivery_staff_id: newStaffId,
          delivery_staff_name: newStaffName,
          delivery_fee: newFee,
          note: `${order.note || ''} • ${changeNote}`.trim(),
        }),
      });
      if (!res.ok) throw new Error('Không cập nhật được đơn hàng.');
      if (!wasDelivery && nowDelivery && newStaffName && newFee > 0) {
        await creditTechnicianPayroll(
          newStaffName,
          newFee,
          `Giao đơn hàng [${order.order_code}] đến ${order.customer_name}`
        );
      }
      message.success(`Đã đổi hình thức giao nhận đơn ${order.order_code}: ${newLabel}!`);
      setChangingDeliveryOrder(null);
      await fetchOrders(true);
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : 'Lỗi khi đổi hình thức giao nhận!');
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
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tiếp nhận đơn đặt hàng từ Website, xuất kho tự động và lập phiếu bảo hành điện tử.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
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

          <button
            type="button"
            onClick={() => setIsCreatingOrder(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Tạo đơn hàng</span>
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
                    list.map((order) => {
                      const isWalkIn = (!order.referral_code || order.referral_code === 'Khách vãng lai') && !order.seller_name;
                      return (
                        <div
                          key={order.id}
                          onClick={() => setSelectedOrderDetail(order)}
                          className="bg-white p-3 rounded-xl border border-slate-200 hover:border-blue-400 shadow-2xs hover:shadow-md transition-all text-xs space-y-2 cursor-pointer group"
                        >
                          {/* Dòng 1: Mã đơn & Thời gian */}
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-slate-800 bg-slate-100 group-hover:bg-blue-50 group-hover:text-blue-700 px-2 py-0.5 rounded text-[10px] transition-colors">
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

                          {/* Dòng 2: Thiết bị & Giá */}
                          <div>
                            <div className="font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                              {order.device_name}
                            </div>
                            <div className="text-xs font-black text-[#C0392B] font-mono mt-0.5">
                              {Number(order.device_price || 0).toLocaleString('vi-VN')}₫
                            </div>
                          </div>

                          {/* Dòng 3: Khách hàng tối giản */}
                          <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                            <div className="flex items-center gap-1 font-semibold text-slate-800 truncate">
                              <User className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{order.customer_name}</span>
                            </div>
                            <span className="font-mono text-slate-500 shrink-0 text-[10px]">
                              {order.customer_phone ? (order.customer_phone.slice(-4) ? `*${order.customer_phone.slice(-4)}` : order.customer_phone) : ''}
                            </span>
                          </div>

                          {/* Dòng 4: Tag Nguồn & CSKH ngắn gọn */}
                          <div className="flex items-center gap-1 flex-wrap text-[10px]">
                            <span className={`px-1.5 py-0.2 rounded font-medium border truncate max-w-[140px] ${
                              isWalkIn ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-purple-50 text-purple-700 border-purple-200'
                            }`}>
                              {isWalkIn ? 'Vãng lai' : (order.seller_name ? `Bán: ${order.seller_name}` : `Mã: ${order.referral_code}`)}
                            </span>
                            <span className="px-1.5 py-0.2 rounded font-medium bg-blue-50 text-blue-700 border border-blue-200 truncate max-w-[120px]">
                              CSKH: {order.assigned_care_name || 'Chưa gán'}
                            </span>
                          </div>

                          {/* Nút thao tác nhanh */}
                          <div
                            className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => setSelectedOrderDetail(order)}
                              className="text-[11px] font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1 py-1 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Chi tiết</span>
                            </button>

                            {order.status === 'pending' && canConfirmOrder && (
                              <button
                                type="button"
                                onClick={() => changeStatus(order.id, 'confirmed')}
                                className="px-2.5 py-1 text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                              >
                                <span>Xác nhận</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            )}
                            {order.status === 'confirmed' && (
                              <button
                                type="button"
                                onClick={() => changeStatus(order.id, 'processing')}
                                className="px-2.5 py-1 text-[11px] font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                              >
                                <span>QC &amp; Gói</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            )}
                            {order.status === 'processing' && (
                              <button
                                type="button"
                                onClick={() => setExecutingOrder(order)}
                                className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                              >
                                <ShieldCheck className="w-3 h-3" />
                                <span>Xuất kho</span>
                              </button>
                            )}
                            {order.status === 'completed' && canConfirmOrder && (
                              <button
                                type="button"
                                onClick={() => setChangingDeliveryOrder(order)}
                                className="px-2.5 py-1 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                                title="Đổi hình thức giao nhận sau khi đã xuất phiếu"
                              >
                                <Truck className="w-3 h-3" />
                                <span>Đổi giao nhận</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedOrderDetail && (
        <OrderDetailModal
          order={selectedOrderDetail}
          onClose={() => setSelectedOrderDetail(null)}
          currentUser={currentUser}
          users={users}
          customers={customers}
          canConfirmOrder={canConfirmOrder}
          onChangeStatus={changeStatus}
          onExecuteSale={(ord) => setExecutingOrder(ord)}
          onUpdateAssignedCare={handleUpdateAssignedCare}
        />
      )}

      {isCreatingOrder && (
        <CreateOrderModal
          isOpen={isCreatingOrder}
          onClose={() => setIsCreatingOrder(false)}
          inventory={inventory}
          currentUser={currentUser}
          onOrderCreated={() => fetchOrders(true)}
        />
      )}

      {changingDeliveryOrder && (
        <ChangeDeliveryModal
          order={changingDeliveryOrder}
          users={users}
          onClose={() => setChangingDeliveryOrder(null)}
          onSave={(info) => handleChangeDelivery(changingDeliveryOrder, info)}
        />
      )}

      {executingOrder && (
        <ExecuteOrderModal
          order={executingOrder}
          inventory={inventory}
          users={users}
          onClose={() => setExecutingOrder(null)}
          onConfirm={(i, w, deliveryInfo) => executeSale(executingOrder, i, w, deliveryInfo)}
        />
      )}

      {cashflowOrderData && (
        <CashflowSaleConfirmModal
          data={cashflowOrderData}
          onClose={() => setCashflowOrderData(null)}
          onConfirm={handleFinalizeOrderSale}
          isSubmitting={isSubmittingOrderSale}
          actionTitle="Xác Nhận & Xuất Kho Ngay"
        />
      )}
    </div>
  );
}

function ExecuteOrderModal({
  order,
  inventory,
  users,
  onClose,
  onConfirm,
}: {
  order: Order;
  inventory: InventoryItem[];
  users: UserAccount[];
  onClose: () => void;
  onConfirm: (
    i: InventoryItem,
    warranty: { months: number; type: 'months' | 'manufacturer' },
    deliveryInfo: {
      deliveryMethod: 'pickup' | 'delivery';
      deliveryStaffId?: string;
      deliveryStaffName?: string;
      deliveryFee?: number;
      shippingAddress?: string;
    }
  ) => void;
}) {
  const matchedItem = order.device_tag
    ? inventory.find((i) => i.service_tag === order.device_tag && i.qc_status !== 'sold')
    : null;
  const [selectedTag, setSelectedTag] = useState<string>(matchedItem?.service_tag || '');
  const [months, setMonths] = useState(6);
  const [warrantyType, setWarrantyType] = useState<'months' | 'manufacturer'>('months');

  // Giao hàng tận nơi vs Khách đến lấy
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>(
    order.delivery_method === 'delivery' ? 'delivery' : 'pickup'
  );
  const [shippingAddress, setShippingAddress] = useState<string>(order.customer_address || '');
  const [deliveryStaffId, setDeliveryStaffId] = useState<string>(order.delivery_staff_id || '');
  const [deliveryFee, setDeliveryFee] = useState<number>(order.delivery_fee ?? 50000);

  const availableMachines = useMemo(
    () => inventory.filter((i) => i.qc_status !== 'sold'),
    [inventory]
  );

  const activeStaffList = useMemo(
    () => users.filter((u) => u.status === 'active'),
    [users]
  );

  const handleContinue = () => {
    if (!selectedTag) {
      message.warning('Vui lòng chọn máy xuất từ kho!');
      return;
    }
    const item = inventory.find((i) => i.service_tag === selectedTag);
    if (!item) return;

    if (deliveryMethod === 'delivery' && !deliveryStaffId) {
      message.warning('Vui lòng chỉ định nhân viên / KTV đi giao hàng!');
      return;
    }

    const assignedStaff = activeStaffList.find((u) => u.id === deliveryStaffId);

    onConfirm(item, { months, type: warrantyType }, {
      deliveryMethod,
      deliveryStaffId: deliveryMethod === 'delivery' ? deliveryStaffId : undefined,
      deliveryStaffName: deliveryMethod === 'delivery' ? assignedStaff?.name : undefined,
      deliveryFee: deliveryMethod === 'delivery' ? deliveryFee : 0,
      shippingAddress: deliveryMethod === 'delivery' ? shippingAddress : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 p-6 animate-scale-up max-h-[92vh] flex flex-col">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1 shrink-0">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>Hoàn Tất &amp; Xuất Kho Đơn: {order.order_code}</span>
        </h2>
        <p className="text-xs text-slate-500 mb-4 shrink-0">
          Hệ thống sẽ cập nhật trừ tồn kho, kiểm tra hình thức giao hàng và kích hoạt bảo hành điện tử.
        </p>

        <div className="space-y-4 overflow-y-auto pr-1 flex-1">
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
              Thời hạn bảo hành
            </label>
            <select
              value={warrantyType === 'manufacturer' ? 'manufacturer' : 'months:6'}
              onChange={(e) => {
                const v = e.target.value;
                if (v === 'manufacturer') {
                  setWarrantyType('manufacturer');
                } else {
                  setWarrantyType('months');
                  setMonths(6);
                }
              }}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="months:6">6 Tháng</option>
              <option value="manufacturer">Theo nhà sản xuất</option>
            </select>
          </div>

          {/* Hình thức nhận hàng: Giao hàng tận nơi vs Khách đến lấy */}
          <div className="pt-3 border-t border-slate-200">
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Hình thức giao nhận hàng (*)
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setDeliveryMethod('pickup')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                  deliveryMethod === 'pickup'
                    ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-500/20 text-blue-950 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-xl shrink-0">🏪</span>
                <div>
                  <div className="text-xs font-bold">Khách đến lấy</div>
                  <div className="text-[10px] text-slate-500 font-normal">Nhận tại cửa hàng</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryMethod('delivery')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                  deliveryMethod === 'delivery'
                    ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-500/20 text-amber-950 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-xl shrink-0">🚚</span>
                <div>
                  <div className="text-xs font-bold">Giao hàng tận nơi</div>
                  <div className="text-[10px] text-slate-500 font-normal">Chỉ định KTV đi giao</div>
                </div>
              </button>
            </div>

            {deliveryMethod === 'delivery' && (
              <div className="mt-3 p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3 text-xs animate-in fade-in duration-150">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Địa chỉ giao hàng
                  </label>
                  <input
                    type="text"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Số nhà, tên đường, phường/xã..."
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Chỉ định nhân viên đi giao (*)
                  </label>
                  <select
                    value={deliveryStaffId}
                    onChange={(e) => setDeliveryStaffId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">-- Chọn nhân viên / KTV đi giao hàng --</option>
                    {activeStaffList.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.roleTitle || u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-800">
                      Chi phí tiền công cho nhân viên (₫)
                    </label>
                    <span className="text-[10px] text-emerald-700 font-bold">
                      ⚡ Tự động ghi nhận như điều phối dịch vụ
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      step={10000}
                      value={deliveryFee}
                      onChange={(e) => setDeliveryFee(Math.max(0, Number(e.target.value) || 0))}
                      className="flex-1 px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-mono font-bold text-emerald-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="VD: 50.000"
                    />
                    <div className="flex items-center gap-1">
                      {[50000, 100000].map((fee) => (
                        <button
                          key={fee}
                          type="button"
                          onClick={() => setDeliveryFee(fee)}
                          className={`px-2 py-1 rounded text-[11px] font-semibold border cursor-pointer transition-all ${
                            deliveryFee === fee
                              ? 'bg-amber-200 border-amber-400 text-amber-900 font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {fee / 1000}k
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span>Tiếp tục: Phân bổ dòng tiền</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
// Đổi hình thức giao nhận sau khi đã xuất phiếu (chỉ đơn hoàn tất).
// Cho phép đổi cả người giao + thù lao trên đơn giao (vd: người giao cũ bận).
function ChangeDeliveryModal({
  order,
  users,
  onClose,
  onSave,
}: {
  order: Order;
  users: UserAccount[];
  onClose: () => void;
  onSave: (info: { method: 'pickup' | 'delivery'; staffId?: string; staffName?: string; fee?: number }) => void;
}) {
  const [method, setMethod] = useState<'pickup' | 'delivery'>(order.delivery_method || 'pickup');
  const [staffId, setStaffId] = useState<string>(order.delivery_staff_id || '');
  const [fee, setFee] = useState<number>(order.delivery_fee ?? 50000);
  const [saving, setSaving] = useState(false);

  const activeStaffList = useMemo(() => users.filter((u) => u.status === 'active'), [users]);
  const staffName = activeStaffList.find((u) => u.id === staffId)?.name;
  const wasDelivery = order.delivery_method === 'delivery';
  const changed =
    method !== order.delivery_method ||
    (method === 'delivery' &&
      (staffId !== (order.delivery_staff_id || '') || fee !== (order.delivery_fee || 0)));

  const handleSave = () => {
    if (method === 'delivery' && !staffId) {
      message.warning('Vui lòng chọn nhân viên / KTV đi giao hàng!');
      return;
    }
    setSaving(true);
    try {
      onSave({ method, staffId: staffId || undefined, staffName, fee });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-5 animate-scale-up">
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Đổi hình thức giao nhận</h2>
            <p className="text-xs text-slate-500">
              Đơn: <strong className="text-slate-900 font-mono">{order.order_code}</strong>
              {' • '}
              {order.customer_name} — {order.device_name}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Hiện tại:{' '}
              <strong className="text-slate-900">
                {wasDelivery
                  ? `Giao tận nơi${order.delivery_staff_name ? ` — ${order.delivery_staff_name}` : ''}${order.delivery_fee ? ` (${order.delivery_fee.toLocaleString('vi-VN')}đ)` : ''}`
                  : 'Khách nhận tại quầy'}
              </strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 px-2 py-1 text-xs font-semibold rounded-lg hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">Hình thức mới</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setMethod('pickup')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                  method === 'pickup'
                    ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-500/20 text-blue-950 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-xl shrink-0">🏪</span>
                <div>
                  <div className="text-xs font-bold">Khách nhận tại quầy</div>
                  <div className="text-[10px] text-slate-500 font-normal">Không cần người giao</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setMethod('delivery')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                  method === 'delivery'
                    ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-500/20 text-amber-950 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-xl shrink-0">🚚</span>
                <div>
                  <div className="text-xs font-bold">Giao hàng tận nơi</div>
                  <div className="text-[10px] text-slate-500 font-normal">Chỉ định người đi giao</div>
                </div>
              </button>
            </div>
          </div>

          {method === 'delivery' && (
            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3 animate-in fade-in duration-150">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Địa chỉ giao hàng (theo đơn)</label>
                <p className="text-xs text-slate-700 bg-white border border-amber-300 rounded-lg px-3 py-2">
                  {order.customer_address || '— Chưa có địa chỉ —'}
                </p>
                {!order.customer_address && (
                  <p className="text-[11px] text-amber-800 mt-1">
                    Đơn chưa có địa chỉ giao — người giao sẽ thấy &quot;Chưa có địa chỉ&quot; trên thẻ việc.
                  </p>
                )}
              </div>
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Chỉ định nhân viên đi giao (*)</label>
                <select
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Chọn nhân viên / KTV đi giao hàng --</option>
                  {activeStaffList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.roleTitle || u.role})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Thù lao giao (đ)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={fee}
                    onChange={(e) => setFee(Math.max(0, Number(e.target.value) || 0))}
                    className="w-28 px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-1">
                    {[50000, 100000].map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFee(f)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold border transition-all cursor-pointer ${
                          fee === f
                            ? 'bg-amber-100 border-amber-400 text-amber-800'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {f === 50000 ? '50k' : '100k'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {!wasDelivery && staffName && fee > 0 && (
                <p className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                  Sẽ ghi nhận {fee.toLocaleString('vi-VN')}đ tiền công cho {staffName} vào bảng lương.
                </p>
              )}
            </div>
          )}

          {wasDelivery && method === 'pickup' && (order.delivery_fee || 0) > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
              ⚠️ Tiền công đã ghi nhận cho {order.delivery_staff_name || 'người giao cũ'} (
              {(order.delivery_fee || 0).toLocaleString('vi-VN')}đ) sẽ <strong>KHÔNG tự hoàn lại</strong> —
              nếu cần hoàn, admin tự điều chỉnh ở bảng lương.
            </div>
          )}

          <p className="text-[11px] text-slate-400">
            Chỉ đổi khi hàng chưa thực sự giao cho khách. Đơn đã đổi sẽ hiện ngay trên tab
            &quot;Công việc của bạn&quot; của người được giao.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!changed || saving}
            className="px-5 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            {saving ? 'Đang lưu…' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
}
