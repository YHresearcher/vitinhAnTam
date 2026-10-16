'use client';

import React, { useState, useEffect } from 'react';
import { InventoryItem } from '@/lib/supabase';
import { Coins, User, Landmark, ShieldCheck, Sparkles, ArrowRight, X } from 'lucide-react';

export interface CashflowSaleConfirmData {
  item: InventoryItem;
  customerName: string;
  customerPhone: string;
  customerBirthDate?: string;
  customerAddress?: string;
  serialNumber: string;
  warrantyMonths: number;
  soldPrice: number;
  saleDate?: string;
  costPrice: number;
  orderCode?: string;
  notes?: string;
  referralCode?: string;
  sellerName?: string;
  isWalkIn?: boolean;
  productType?: 'machine' | 'key' | 'part';
}

interface CashflowSaleConfirmModalProps {
  data: CashflowSaleConfirmData | null;
  onClose: () => void;
  onConfirm: (finalData: CashflowSaleConfirmData) => Promise<void> | void;
  isSubmitting?: boolean;
  actionTitle?: string;
}

export default function CashflowSaleConfirmModal({
  data,
  onClose,
  onConfirm,
  isSubmitting = false,
  actionTitle = 'Xác Nhận & Xuất Bán Ngay',
}: CashflowSaleConfirmModalProps) {
  const [costPrice, setCostPrice] = useState<number>(0);

  useEffect(() => {
    if (data) {
      setCostPrice(Number(data.costPrice) || 0);
    }
  }, [data]);

  if (!data) return null;

  const item = data.item;
  const soldPrice = Number(data.soldPrice) || 0;
  const profit = soldPrice - costPrice; // Lợi nhuận = giá bán ra - giá nhập
  const isProfitable = profit > 0;

  // Nhận diện sản phẩm Key vs Máy tính/Linh kiện
  const isKey =
    data.productType === 'key' ||
    (item && (
      Boolean((item as any).category_name) ||
      Boolean((item as any).license_code) ||
      /key|bản quyền|windows|office/i.test(item.device_model || item.model || '')
    )) ||
    Boolean(data.notes && /key|bản quyền|windows|office/i.test(data.notes));

  // Khách vãng lai: không có mã giới thiệu / để trống trên web và không có người bán -> 15% hoa hồng sales gộp vào lợi nhuận chung
  const isWalkIn =
    Boolean(data.isWalkIn) ||
    ((!data.referralCode || data.referralCode === 'Khách vãng lai') &&
     (!data.sellerName || data.sellerName === 'Khách vãng lai'));

  // 1. Tiền cho người bán (15% lợi nhuận) — Nếu là khách vãng lai, hoa hồng = 0₫
  const sellerCommission = isProfitable && !isWalkIn ? Math.round(profit * 0.15) : 0;
  // 2. Thưởng người cho vay vốn (5% lợi nhuận)
  const lenderBonus = isProfitable ? Math.round(profit * 0.05) : 0;
  // Tiền hoàn người cho vay vốn (tiền vốn nhập + 5% lợi nhuận)
  const lenderTotal = costPrice + lenderBonus;
  // 3. Số tiền trích cho Admin: 10% nếu là Key, 5% nếu là thiết bị máy tính/linh kiện
  const adminRate = isKey ? 0.10 : 0.05;
  const adminDeduction = isProfitable ? Math.round(profit * adminRate) : 0;
  const warrantyReserve = adminDeduction; // Giữ để tương thích biểu đồ
  // 4. Lợi nhuận còn lại của cửa hàng
  const remainingProfit = isProfitable
    ? profit - sellerCommission - lenderBonus - adminDeduction
    : profit;

  const handleConfirm = () => {
    onConfirm({
      ...data,
      costPrice,
    });
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in font-sans">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-4 my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
              <Coins className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Thống Kê Phân Bổ Dòng Tiền</span>
                {data.orderCode && (
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    Đơn #{data.orderCode}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kiểm tra phân bổ dòng tiền bán máy trước khi xuất kho chính thức
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors text-base font-bold cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thông tin thiết bị & khách hàng */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Thiết bị xuất bán</div>
            <div className="font-bold text-slate-800 text-sm mt-0.5">
              {item.brand} {item.device_model || item.model} ({item.form_factor || 'PC'})
            </div>
            <div className="text-slate-500 font-mono text-[11px] mt-0.5">
              Tag: <strong className="text-blue-700">{item.service_tag}</strong> • Serial: <strong className="text-slate-700">{data.serialNumber}</strong>
            </div>
          </div>
          <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Khách nhận hàng</div>
            <div className="font-bold text-slate-800 text-sm mt-0.5">
              {data.customerName}
            </div>
            <div className="text-slate-600 font-mono text-[11px] mt-0.5">
              SĐT: {data.customerPhone}
            </div>
          </div>
        </div>

        {/* 3 Chỉ số nền tảng: Giá bán ra - Giá vốn nhập - Lợi nhuận gộp */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
            <span className="text-[11px] text-blue-700 font-semibold uppercase tracking-wider block">
              1. Giá Bán Ra
            </span>
            <div className="text-lg font-black text-blue-800 font-mono mt-1">
              {soldPrice.toLocaleString('vi-VN')} ₫
            </div>
            <span className="text-[10px] text-blue-600 mt-0.5 block">Tổng thu từ khách hàng</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-600 font-semibold uppercase tracking-wider block">
                2. Giá Vốn Nhập
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Tự động lấy</span>
            </div>
            <div className="mt-1">
              <input
                type="number"
                step={50000}
                min={0}
                value={costPrice}
                onChange={(e) => setCostPrice(Math.max(0, Number(e.target.value) || 0))}
                className="w-full px-2 py-1 text-base font-black text-slate-800 font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Bạn có thể điều chỉnh giá vốn nếu máy chưa có giá vốn ban đầu"
              />
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Có thể chỉnh nhanh nếu cần</span>
          </div>

          <div className={`p-3 border rounded-xl ${
            isProfitable ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50/70 border-rose-200'
          }`}>
            <span className={`text-[11px] font-semibold uppercase tracking-wider block ${
              isProfitable ? 'text-emerald-700' : 'text-rose-700'
            }`}>
              3. Lợi Nhuận Gộp
            </span>
            <div className={`text-lg font-black font-mono mt-1 ${
              isProfitable ? 'text-emerald-800' : 'text-rose-700'
            }`}>
              {profit.toLocaleString('vi-VN')} ₫
            </div>
            <span className={`text-[10px] mt-0.5 block ${
              isProfitable ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              = Giá bán ra - Giá vốn nhập
            </span>
          </div>
        </div>

        {/* 4 Khoản phân bổ dòng tiền theo đúng yêu cầu */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>Chi Tiết 4 Khoản Phân Bổ Dòng Tiền</span>
            <span className="text-[11px] text-slate-500 lowercase font-normal">
              (tính trên lợi nhuận {profit > 0 ? profit.toLocaleString('vi-VN') + ' ₫' : '0 ₫'})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Khoản 1: Người bán 15% LN hoặc Khách vãng lai */}
            {isWalkIn ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>Nguồn: Khách vãng lai</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">
                    0% (Gộp LN chung)
                  </span>
                </div>
                <div className="text-base font-black text-slate-700 font-mono">
                  0 ₫
                </div>
                <p className="text-[11px] text-slate-600">
                  15% hoa hồng được cộng dồn trực tiếp vào lợi nhuận chung
                </p>
              </div>
            ) : (
              <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Tiền cho người bán {data.sellerName ? `(${data.sellerName})` : ''}</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono">
                    15% LN
                  </span>
                </div>
                <div className="text-base font-black text-indigo-950 font-mono">
                  {sellerCommission.toLocaleString('vi-VN')} ₫
                </div>
                <p className="text-[11px] text-indigo-700">
                  Hoa hồng cho nhân viên tư vấn &amp; chốt đơn
                </p>
              </div>
            )}

            {/* Khoản 2: Hoàn người cho vay vốn (Vốn + 5% LN) */}
            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Landmark className="w-3.5 h-3.5 text-amber-600" />
                  <span>Tiền hoàn người cho vay vốn</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono">
                  Vốn + 5% LN
                </span>
              </div>
              <div className="text-base font-black text-amber-950 font-mono">
                {lenderTotal.toLocaleString('vi-VN')} ₫
              </div>
              <p className="text-[11px] text-amber-800">
                Vốn gốc: {costPrice.toLocaleString('vi-VN')}₫ + Thưởng 5% LN: {lenderBonus.toLocaleString('vi-VN')}₫
              </p>
            </div>

            {/* Khoản 3: Trích cho Admin (10% cho Key, 5% cho Thiết bị máy tính) */}
            <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>{isKey ? 'Tiền trích cho Admin (Key bản quyền)' : 'Tiền trích cho Admin (Thiết bị)'}</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-mono">
                  {isKey ? '10% LN (Key)' : '5% LN (Máy)'}
                </span>
              </div>
              <div className="text-base font-black text-purple-950 font-mono">
                {adminDeduction.toLocaleString('vi-VN')} ₫
              </div>
              <p className="text-[11px] text-purple-700">
                {isKey
                  ? 'Khoản trích 10% lợi nhuận dành riêng cho Admin đối với sản phẩm Key'
                  : 'Khoản trích 5% lợi nhuận dành riêng cho Admin đối với thiết bị/linh kiện'}
              </p>
            </div>

            {/* Khoản 4: Lợi nhuận còn lại / Lợi nhuận chung */}
            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isWalkIn ? 'Lợi nhuận chung doanh nghiệp' : 'Lợi nhuận còn lại'}</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
                  {isKey
                    ? (isWalkIn ? '85% LN (gồm 15% vãng lai)' : '70% LN')
                    : (isWalkIn ? '90% LN (gồm 15% vãng lai)' : '75% LN')}
                </span>
              </div>
              <div className="text-base font-black text-emerald-950 font-mono">
                {remainingProfit.toLocaleString('vi-VN')} ₫
              </div>
              <p className="text-[11px] text-emerald-700">
                {isWalkIn
                  ? `Lợi nhuận ròng cửa hàng (hưởng trọn ${isKey ? '85%' : '90%'} do không có người giới thiệu)`
                  : 'Lợi nhuận ròng giữ lại cho cửa hàng'}
              </p>
            </div>
          </div>
        </div>

        {/* Thanh kiểm toán cân đối dòng tiền */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600 flex items-center gap-1">
              <span>Tổng dòng tiền phân bổ:</span>
              <strong className="text-slate-900 font-mono">{soldPrice.toLocaleString('vi-VN')} ₫</strong>
            </span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <span>✓ Khớp 100% dòng tiền</span>
            </span>
          </div>
          {/* Visual stacked bar */}
          <div className="w-full h-2.5 rounded-full overflow-hidden bg-slate-200 flex">
            {soldPrice > 0 && (
              <>
                <div
                  style={{ width: `${Math.max(4, (lenderTotal / soldPrice) * 100)}%` }}
                  className="bg-amber-500 h-full transition-all"
                  title={`Hoàn vốn vay: ${lenderTotal.toLocaleString('vi-VN')}₫`}
                />
                <div
                  style={{ width: `${Math.max(4, (sellerCommission / soldPrice) * 100)}%` }}
                  className="bg-indigo-500 h-full transition-all"
                  title={`Người bán: ${sellerCommission.toLocaleString('vi-VN')}₫`}
                />
                <div
                  style={{ width: `${Math.max(3, (adminDeduction / soldPrice) * 100)}%` }}
                  className="bg-purple-500 h-full transition-all"
                  title={`Trích Admin (${isKey ? '10%' : '5%'}): ${adminDeduction.toLocaleString('vi-VN')}₫`}
                />
                <div
                  style={{ width: `${Math.max(4, (remainingProfit / soldPrice) * 100)}%` }}
                  className="bg-emerald-500 h-full transition-all"
                  title={`Lợi nhuận còn lại: ${remainingProfit.toLocaleString('vi-VN')}₫`}
                />
              </>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 pt-0.5 font-mono">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Hoàn người vay vốn
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" /> {isWalkIn ? 'Vãng lai (0% gộp)' : 'Người bán (15%)'}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" /> {isKey ? 'Trích Admin (10%)' : 'Trích Admin (5%)'}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> {isKey ? (isWalkIn ? 'LN chung (85%)' : 'LN còn lại (70%)') : (isWalkIn ? 'LN chung (90%)' : 'LN còn lại (75%)')}
            </span>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            ← Quay lại chỉnh sửa
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirm}
            className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Đang hoàn tất...</span>
            ) : (
              <>
                <span>{actionTitle}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
