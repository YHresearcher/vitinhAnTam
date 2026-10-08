'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Laptop,
  Clock,
  User,
  Phone,
  Package,
  MapPin,
  ExternalLink,
  Ban,
  ShieldCheck,
  X,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { useViTinhAnTamStore } from '@/lib/store';
import { formatVND, InventoryItem } from '@/lib/supabase';
import { message, Modal } from 'antd';

export function PendingSaleWidget() {
  const router = useRouter();
  const { inventory, cancelReservationItem, isLoggedIn, currentUser } = useViTinhAnTamStore();
  const [isOpen, setIsOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Hiển thị cho admin, sales_manager, tech_manager, sales, technician
  const canView = Boolean(
    isLoggedIn &&
      currentUser &&
      ['admin', 'sales_manager', 'tech_manager', 'sales', 'technician'].includes(currentUser.role)
  );

  // Quyền thao tác hủy giữ máy (Admin & 2 Managers & Sales)
  const canManage = Boolean(
    currentUser &&
      ['admin', 'sales_manager', 'tech_manager', 'sales'].includes(currentUser.role)
  );

  // Lọc các máy đang ở trạng thái 'reserved' (Đang đợi bán do khách đặt hàng)
  const reservedMachines = useMemo(() => {
    return inventory.filter((item) => item.qc_status === 'reserved');
  }, [inventory]);

  if (!canView) return null;

  const handleGoToWarehouse = (item: InventoryItem) => {
    setIsOpen(false);
    const searchParam = encodeURIComponent(item.service_tag);
    router.push(`/kho-may?search=${searchParam}&status=reserved`);
  };

  const handleCancelReservation = (item: InventoryItem) => {
    Modal.confirm({
      title: 'Xác nhận khách không mua?',
      icon: <AlertCircle className="w-5 h-5 text-amber-500 inline-block mr-2" />,
      content: (
        <div className="text-xs space-y-1.5 text-slate-600">
          <p>
            Bạn có chắc chắn muốn hủy giữ máy{' '}
            <strong>
              {item.device_model || item.model || item.brand} ({item.service_tag})
            </strong>{' '}
            cho khách hàng <strong>{item.customer_name || 'chưa có tên'}</strong>?
          </p>
          <p className="text-slate-500 italic">
            Thông tin khách hàng đặt trước sẽ được xóa và máy được đưa về lại trạng thái{' '}
            <span className="text-emerald-600 font-bold">Lưu kho (Sẵn bán)</span>.
          </p>
        </div>
      ),
      okText: 'Xác nhận Không Mua',
      okType: 'danger',
      cancelText: 'Đóng',
      async onOk() {
        setCancellingId(item.id);
        try {
          const ok = await cancelReservationItem(item.id, item.reserved_order_id);
          if (ok) {
            message.success(
              `Đã hủy giữ máy ${item.service_tag} và đưa thiết bị về lưu kho sẵn sàng bán!`
            );
          } else {
            message.error('Không thể hủy giữ máy, vui lòng thử lại.');
          }
        } catch {
          message.error('Đã xảy ra lỗi khi hủy giữ máy.');
        } finally {
          setCancellingId(null);
        }
      },
    });
  };

  return (
    <aside
      aria-label="Máy Đợi Bán"
      className={`fixed right-4 font-sans print:hidden transition-all duration-200 ${
        isOpen ? 'bottom-6 z-[70]' : 'bottom-[140px] z-40'
      }`}
    >
      {isOpen ? (
        <div className="w-[350px] sm:w-[410px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-purple-200 dark:border-purple-900 overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-950 text-white p-3.5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-white/15 text-purple-200">
                <Laptop className="w-4 h-4" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-black tracking-wide uppercase">
                    MÁY ĐỢI BÁN (KHÁCH ĐẶT)
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono text-[10px] font-black">
                    {reservedMachines.length}
                  </span>
                </div>
                <p className="text-[10px] text-purple-200">
                  Thiết bị giữ chỗ cho đơn đặt hàng từ website
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/25 text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              title="Đóng widget"
              aria-label="Đóng widget"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List of Reserved Machines */}
          <div className="overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-2.5 space-y-2.5 flex-1 max-h-[55vh]">
            {reservedMachines.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400 dark:text-slate-500 space-y-2">
                <Package className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="font-medium">Hiện không có máy nào đang đợi bán.</p>
                <p className="text-[11px] text-slate-400">
                  Khi khách đặt hàng và admin xác nhận, máy sẽ tự động xuất hiện tại đây.
                </p>
              </div>
            ) : (
              reservedMachines.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-purple-100 dark:border-purple-950/60 bg-purple-50/30 dark:bg-slate-800/60 space-y-2 shadow-2xs hover:border-purple-300 dark:hover:border-purple-700 transition-all text-xs"
                >
                  {/* Machine Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono font-bold text-xs text-purple-800 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/80 px-2 py-0.5 rounded">
                          {item.service_tag}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">
                          Đang đợi bán
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white mt-1 line-clamp-1">
                        {item.device_model || item.model || `${item.brand} ${item.form_factor}`}
                      </h3>
                      <div className="text-[11px] font-mono font-bold text-[#C0392B] dark:text-red-400">
                        {formatVND(item.retail_price || item.price || 0)}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">
                        <MapPin className="w-2.5 h-2.5 text-slate-400" />
                        {item.shelf_location || 'Kho'}
                      </span>
                    </div>
                  </div>

                  {/* Customer Info Card */}
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-purple-100 dark:border-slate-700 space-y-1 text-[11px]">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200 truncate">
                        <User className="w-3 h-3 text-purple-600 shrink-0" />
                        <span className="truncate">{item.customer_name || 'Khách đặt qua Website'}</span>
                      </div>
                      {item.customer_phone && (
                        <a
                          href={`tel:${item.customer_phone}`}
                          className="flex items-center gap-1 text-blue-600 hover:underline font-mono text-[10px] shrink-0"
                          title="Gọi cho khách"
                        >
                          <Phone className="w-2.5 h-2.5" />
                          <span>{item.customer_phone}</span>
                        </a>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                      <span>
                        Mã đơn:{' '}
                        <strong className="text-slate-700 dark:text-slate-300 font-mono">
                          {item.reserved_order_code || 'Online'}
                        </strong>
                      </span>
                      <span className="text-purple-700 dark:text-purple-300 font-medium">
                        {item.reserved_delivery_method === 'delivery' ? 'Giao tận nơi' : 'Nhận tại quầy'}
                      </span>
                    </div>

                    {item.reserved_at && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Clock className="w-2.5 h-2.5" />
                        <span>
                          {new Date(item.reserved_at).toLocaleDateString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: '2-digit',
                            month: '2-digit',
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-purple-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleCancelReservation(item)}
                      disabled={cancellingId === item.id}
                      className="py-1.5 px-2 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                      title="Khách không có nhu cầu mua nữa, hủy giữ máy và đưa về lưu kho"
                    >
                      <Ban className="w-3 h-3" />
                      <span>{cancellingId === item.id ? 'Đang hủy...' : 'Không mua'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleGoToWarehouse(item)}
                      className="py-1.5 px-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs"
                      title="Xem thông tin chi tiết và thao tác xuất bán trong kho"
                    >
                      <span>Xem trong kho</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 text-[11px] flex items-center justify-between px-3 text-slate-500 dark:text-slate-400">
            <span>Quản lý máy đợi bán từ đơn khách</span>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push('/kho-may?status=reserved');
              }}
              className="text-purple-600 dark:text-purple-400 hover:underline font-bold flex items-center gap-0.5"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        /* Floating Trigger Button */
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex flex-col items-center justify-center w-[76px] sm:w-[80px] h-[78px] rounded-xl shadow-xl border border-purple-300 dark:border-purple-800 bg-white dark:bg-slate-900 hover:scale-105 active:scale-95 transition-all cursor-pointer select-none group"
          title="Xem máy đợi bán (do khách đặt hàng)"
        >
          <div className="relative">
            <span className="text-xl leading-none">💻</span>
            {reservedMachines.length > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-600" />
              </span>
            )}
          </div>
          <span className="text-[10px] font-black text-purple-700 dark:text-purple-400 uppercase mt-1 leading-tight text-center px-1">
            Đợi bán
          </span>
          <span className="text-lg font-black font-mono text-purple-900 dark:text-purple-200 leading-none mt-0.5">
            {reservedMachines.length}
          </span>
        </button>
      )}
    </aside>
  );
}
