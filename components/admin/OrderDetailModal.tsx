'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  MapPin,
  CreditCard,
  Truck,
  ShieldCheck,
  Award,
  ArrowRight,
  Clock,
  CheckCircle2,
  PackageCheck,
  UserCheck,
  Tag,
  Share2,
} from 'lucide-react';
import { CRM_TIER_CONFIG, calculateCustomerTier } from '@/lib/crmTiers';
import { Customer, UserAccount } from '@/lib/supabase';

export interface Order {
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
  delivery_staff_id?: string;
  delivery_staff_name?: string;
  delivery_fee?: number;
  note?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  created_at?: string;
  referral_code?: string;
  created_by_id?: string;
  created_by_name?: string;
  seller_id?: string;
  seller_name?: string;
  assigned_care_id?: string;
  assigned_care_name?: string;
}

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
  currentUser: UserAccount;
  users: UserAccount[];
  customers: Customer[];
  canConfirmOrder: boolean;
  onChangeStatus: (orderId: string, newStatus: string) => void;
  onExecuteSale: (order: Order) => void;
  onUpdateAssignedCare: (orderId: string, careId: string, careName: string) => Promise<void>;
}

export default function OrderDetailModal({
  order,
  onClose,
  currentUser,
  users,
  customers,
  canConfirmOrder,
  onChangeStatus,
  onExecuteSale,
  onUpdateAssignedCare,
}: OrderDetailModalProps) {
  const [selectedCareId, setSelectedCareId] = useState('');
  const [isUpdatingCare, setIsUpdatingCare] = useState(false);

  useEffect(() => {
    if (order) {
      setSelectedCareId(order.assigned_care_id || '');
    }
  }, [order]);

  if (!order) return null;

  const isAdmin = currentUser.role === 'admin';
  const cleanPhone = (order.customer_phone || '').replace(/\D/g, '');
  const matchedCustomer = customers.find((c) => c.phone.replace(/\D/g, '') === cleanPhone);

  const tierKey = matchedCustomer
    ? calculateCustomerTier(matchedCustomer.total_spent, matchedCustomer.last_purchase_date).effectiveTier
    : 'standard';
  const tierConf = CRM_TIER_CONFIG[tierKey];
  const discountAmount = Math.round((Number(order.device_price) || 0) * tierConf.discountRate);

  const isWalkIn = (!order.referral_code || order.referral_code === 'Khách vãng lai') && !order.seller_name;

  const handleSaveCare = async () => {
    if (!isAdmin) return;
    const selectedUser = users.find((u) => u.id === selectedCareId);
    if (!selectedUser) return;
    setIsUpdatingCare(true);
    try {
      await onUpdateAssignedCare(order.id, selectedUser.id, selectedUser.name);
    } finally {
      setIsUpdatingCare(false);
    }
  };

  const statusMap = {
    pending: { label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-900 border-amber-300', icon: Clock },
    confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-900 border-blue-300', icon: CheckCircle2 },
    processing: { label: 'Đang đóng gói / QC', color: 'bg-purple-100 text-purple-900 border-purple-300', icon: PackageCheck },
    completed: { label: 'Hoàn tất xuất kho', color: 'bg-emerald-100 text-emerald-900 border-emerald-300', icon: ShieldCheck },
    cancelled: { label: 'Đã hủy', color: 'bg-rose-100 text-rose-900 border-rose-300', icon: X },
  };

  const currentSt = statusMap[order.status] || statusMap.pending;
  const StIcon = currentSt.icon;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in font-sans">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 p-5 sm:p-6 my-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-black text-slate-900 text-base sm:text-lg">
                Đơn Hàng {order.order_code}
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentSt.color}`}>
                <StIcon className="w-3.5 h-3.5" />
                <span>{currentSt.label}</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Thời gian đặt: {order.created_at ? new Date(order.created_at).toLocaleString('vi-VN') : 'Vừa xong'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thông tin sản phẩm & Giá */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-slate-900">{order.device_name}</div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 font-mono">
              {order.device_tag && <span>Tag / Serial: <strong className="text-blue-700">{order.device_tag}</strong></span>}
              <span>•</span>
              <span className="capitalize">
                {order.delivery_method === 'delivery'
                  ? `Giao tận nơi${order.delivery_staff_name ? ` (${order.delivery_staff_name}${order.delivery_fee ? ` • +${order.delivery_fee.toLocaleString('vi-VN')}₫` : ''})` : ''}`
                  : 'Nhận tại cửa hàng'}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-lg font-black text-[#C0392B] font-mono">
              {Number(order.device_price || 0).toLocaleString('vi-VN')} ₫
            </div>
            <div className="text-[11px] text-slate-500">
              {order.payment_method === 'qr' ? 'Thanh toán QR Code' : 'Tiền mặt tại quầy'}
            </div>
          </div>
        </div>

        {/* Khách hàng & CRM */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Box Khách hàng */}
          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <User className="w-4 h-4 text-blue-600" />
              <span>Thông Tin Khách Hàng</span>
            </div>
            <div className="space-y-1.5 text-slate-700">
              <div>Họ tên: <strong className="text-slate-900">{order.customer_name}</strong></div>
              <div className="flex items-center gap-1.5">
                <span>SĐT:</span>
                <a href={`tel:${order.customer_phone}`} className="font-mono text-blue-600 hover:underline font-bold">
                  {order.customer_phone}
                </a>
              </div>
              {order.customer_address && (
                <div className="flex items-start gap-1 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{order.customer_address}</span>
                </div>
              )}

              {/* CRM Tier badge */}
              <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${tierConf.badgeBg} ${tierConf.badgeTextColor} ${tierConf.badgeBorder}`}>
                  <Award className="w-3 h-3" />
                  <span>{tierConf.label}</span>
                </span>
                {tierConf.discountRate > 0 && (
                  <span className="font-mono font-bold text-emerald-700 text-[11px]">
                    Ưu đãi: -{discountAmount.toLocaleString('vi-VN')}₫
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Box Nguồn & Phân công */}
          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <Share2 className="w-4 h-4 text-purple-600" />
              <span>Nguồn Đơn &amp; Nhân Sự Phụ Trách</span>
            </div>
            <div className="space-y-1.5 text-slate-700">
              <div>
                Nguồn / Giới thiệu:{' '}
                <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                  isWalkIn ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                }`}>
                  {order.referral_code || 'Khách vãng lai'}
                </span>
              </div>
              <div>
                Người tạo đơn: <strong>{order.created_by_name || 'Hệ thống Website'}</strong>
              </div>
              <div>
                Người bán: <strong>{order.seller_name || order.created_by_name || 'Chưa gán'}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* KHU VỰC NGƯỜI CHĂM SÓC KHÁCH HÀNG (CSKH) */}
        <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-blue-900">
              <UserCheck className="w-4 h-4 text-blue-700" />
              <span>Người Chăm Sóc Khách Hàng (Assigned Customer Care)</span>
            </div>
            {isAdmin ? (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 border border-blue-300 rounded font-semibold text-[10px]">
                Quyền Admin: Cho phép phân công
              </span>
            ) : (
              <span className="text-[10px] text-slate-500 italic">
                Chỉ Admin mới có quyền điều chuyển
              </span>
            )}
          </div>

          {isAdmin ? (
            <div className="flex items-center gap-2 pt-1">
              <select
                value={selectedCareId}
                onChange={(e) => setSelectedCareId(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chưa chỉ định nhân sự chăm sóc --</option>
                {users
                  .filter((u) => u.status === 'active')
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.roleTitle || u.role})
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={handleSaveCare}
                disabled={isUpdatingCare || !selectedCareId}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors cursor-pointer shrink-0"
              >
                {isUpdatingCare ? 'Đang lưu...' : 'Lưu Phân Công'}
              </button>
            </div>
          ) : (
            <div className="pt-1 flex items-center gap-2">
              <span className="text-slate-600">Nhân viên phụ trách CSKH:</span>
              <strong className="text-blue-950 font-bold text-sm">
                {order.assigned_care_name || 'Chưa phân công'}
              </strong>
            </div>
          )}
        </div>

        {/* Ghi chú */}
        {order.note && (
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1">
            <span className="font-bold text-amber-900">Ghi chú đơn hàng:</span>
            <p className="text-slate-700 whitespace-pre-wrap">{order.note}</p>
          </div>
        )}

        {/* Nút hành động trạng thái */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            {order.status !== 'completed' && order.status !== 'cancelled' && (
              <button
                type="button"
                onClick={() => {
                  onChangeStatus(order.id, 'cancelled');
                  onClose();
                }}
                className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg font-semibold transition-colors cursor-pointer"
              >
                Hủy đơn
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold cursor-pointer"
            >
              Đóng
            </button>

            {order.status === 'pending' && (
              <button
                type="button"
                disabled={!canConfirmOrder}
                onClick={() => {
                  onChangeStatus(order.id, 'confirmed');
                  onClose();
                }}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Xác nhận đơn</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {order.status === 'confirmed' && (
              <button
                type="button"
                onClick={() => {
                  onChangeStatus(order.id, 'processing');
                  onClose();
                }}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Đóng gói &amp; QC</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {order.status === 'processing' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onExecuteSale(order);
                }}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Xuất kho &amp; Phân bổ dòng tiền</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
