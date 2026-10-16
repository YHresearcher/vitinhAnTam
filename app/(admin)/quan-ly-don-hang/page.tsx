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
import { supabase, isSupabaseConfigured, type InventoryItem } from '@/lib/supabase';
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
  const { currentUser, inventory, customers, users, sellInventoryItem, updateInventoryItem, reserveInventoryItem, cancelReservationItem } = useViTinhAnTamStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [executingOrder, setExecutingOrder] = useState<Order | null>(null);
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
          'x-staff-role': currentUser.role,
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

  const executeSale = (order: Order, matchedItem: InventoryItem, warrantyMonths: number) => {
    const currentCost = Number(matchedItem.import_price || matchedItem.cost_price || 0);
    const isWalkIn = (!order.referral_code || order.referral_code === 'Khách vãng lai') && !order.seller_name;
    const isKeyOrder =
      /key|bản quyền|windows|office/i.test(order.device_name || '') ||
      /key|bản quyền|windows|office/i.test(matchedItem?.device_model || matchedItem?.model || '');

    setCashflowOrderData({
      item: matchedItem,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      customerAddress: order.customer_address || '',
      serialNumber: matchedItem.serial_number || matchedItem.service_tag,
      warrantyMonths,
      soldPrice: Number(order.device_price) || 0,
      costPrice: currentCost,
      orderCode: order.order_code,
      referralCode: order.referral_code || 'Khách vãng lai',
      sellerName: order.seller_name || (isWalkIn ? 'Khách vãng lai' : order.referral_code),
      isWalkIn,
      productType: isKeyOrder ? 'key' : 'machine',
      notes: `Từ đơn online: ${order.order_code}. ${order.note || ''}`,
    });
  };

  const handleFinalizeOrderSale = async (finalData: CashflowSaleConfirmData) => {
    if (!executingOrder || isSubmittingOrderSale) return;
    setIsSubmittingOrderSale(true);

    try {
      const { item, costPrice, soldPrice, warrantyMonths } = finalData;

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
      const sellerBonus = isWalkIn ? 0 : Math.round(profit * 0.15);
      const lenderBonus = Math.round(profit * 0.05);
      const lenderTotal = costPrice + lenderBonus;
      // Trích cho Admin: 10% đối với Key, 5% đối với máy tính/linh kiện
      const adminRate = isKey ? 0.10 : 0.05;
      const adminDeduction = Math.round(profit * adminRate);
      const remainingProfit = profit - sellerBonus - lenderBonus - adminDeduction;

      const adminRateLabel = isKey ? '10%' : '5%';
      const remainingPercentLabel = isKey
        ? (isWalkIn ? '85%' : '70%')
        : (isWalkIn ? '90%' : '75%');

      const sellerLabel = isWalkIn
        ? 'Khách vãng lai (15% hoa hồng gộp vào lợi nhuận chung)'
        : `${finalData.sellerName || executingOrder.seller_name || 'Sale'} (15%: ${sellerBonus.toLocaleString('vi-VN')}₫)`;

      const cashflowNote = `[Đơn online: ${executingOrder.order_code}] Giá bán: ${soldPrice.toLocaleString('vi-VN')}₫ | Vốn nhập: ${costPrice.toLocaleString('vi-VN')}₫ | Lợi nhuận: ${profit.toLocaleString('vi-VN')}₫ | Nguồn: ${sellerLabel} | Hoàn người cho vay (Vốn+5%LN): ${lenderTotal.toLocaleString('vi-VN')}₫ | Trích Admin (${adminRateLabel}): ${adminDeduction.toLocaleString('vi-VN')}₫ | ${isWalkIn ? `LN chung doanh nghiệp (${remainingPercentLabel})` : `LN còn lại (${remainingPercentLabel})`}: ${remainingProfit.toLocaleString('vi-VN')}₫. ${executingOrder.note || ''}`;

      const res = await sellInventoryItem({
        itemId: item.id,
        customerName: executingOrder.customer_name,
        customerPhone: executingOrder.customer_phone,
        birthDate: '',
        customerAddress: executingOrder.customer_address || '',
        serialNumber: item.serial_number || item.service_tag,
        warrantyMonths,
        soldPrice,
        notes: cashflowNote,
      });

      if (res.success) {
        await changeStatus(executingOrder.id, 'completed');
        message.success(`Đã xuất kho, phân bổ dòng tiền & kích hoạt bảo hành cho ${executingOrder.customer_name}!`);
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

      {executingOrder && (
        <ExecuteOrderModal order={executingOrder} inventory={inventory} onClose={() => setExecutingOrder(null)} onConfirm={(i, m) => executeSale(executingOrder, i, m)} />
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
            <span>Tiếp tục: Phân bổ dòng tiền</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}