'use client';

import React, { useState, useEffect } from 'react';
import { PricePreview, formatMoney } from '@/components/PricePreview';
import { X, Tag, DollarSign, ArrowRight, Check, AlertCircle, Percent, Sparkles } from 'lucide-react';

export interface EditPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  itemName: string;
  itemSubtext?: string;
  costPrice?: number; // Giá đầu vào / vốn
  initialOriginalPrice: number; // Giá gốc
  initialSalePrice?: number; // Giá giảm
  canEditCost?: boolean;
  onSave: (data: {
    originalPrice: number;
    salePrice: number;
    costPrice?: number;
  }) => Promise<void> | void;
}

export default function EditPriceModal({
  isOpen,
  onClose,
  title,
  itemName,
  itemSubtext,
  costPrice = 0,
  initialOriginalPrice,
  initialSalePrice = 0,
  canEditCost = false,
  onSave,
}: EditPriceModalProps) {
  const [origPrice, setOrigPrice] = useState<number>(initialOriginalPrice || 0);
  const [salePrice, setSalePrice] = useState<number>(initialSalePrice || 0);
  const [costPriceVal, setCostPriceVal] = useState<number>(costPrice || 0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setOrigPrice(initialOriginalPrice || 0);
      setSalePrice(initialSalePrice || 0);
      setCostPriceVal(costPrice || 0);
      setIsSaving(false);
    }
  }, [isOpen, initialOriginalPrice, initialSalePrice, costPrice]);

  if (!isOpen) return null;

  const effectiveSellingPrice = salePrice > 0 ? salePrice : origPrice;
  const hasSale = salePrice > 0;
  const profit = effectiveSellingPrice - costPriceVal;
  const marginPercent = effectiveSellingPrice > 0 ? Math.round((profit / effectiveSellingPrice) * 100) : 0;
  const discountPercent =
    hasSale && origPrice > salePrice ? Math.round(((origPrice - salePrice) / origPrice) * 100) : 0;

  const handleApplyDiscountPercent = (percent: number) => {
    if (origPrice <= 0) return;
    const discounted = Math.round((origPrice * (100 - percent)) / 100 / 10000) * 10000;
    setSalePrice(discounted);
  };

  const handleRemoveSale = () => {
    setSalePrice(0);
  };

  const handleSetContactPrice = () => {
    setOrigPrice(0);
    setSalePrice(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        originalPrice: Number(origPrice) || 0,
        salePrice: Number(salePrice) || 0,
        costPrice: canEditCost ? Number(costPriceVal) || 0 : undefined,
      });
      onClose();
    } catch (err) {
      console.error('Error saving price:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">{title}</h3>
              <p className="text-xs text-slate-300 truncate max-w-[280px]">
                {itemName} {itemSubtext ? `• ${itemSubtext}` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* LIVE PREVIEW BOX - Minh hoạ quy tắc hiển thị */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                Xem trước hiển thị trên website & kho
              </span>
              {hasSale && (
                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  Đang bật giá giảm
                </span>
              )}
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Giá bán áp dụng cho khách:</div>
                {hasSale ? (
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-xl font-black text-rose-600 font-mono">
                      {formatMoney(salePrice)}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 line-through font-mono">
                      {formatMoney(origPrice)}
                    </span>
                    {discountPercent > 0 && (
                      <span className="text-[11px] font-extrabold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                        -{discountPercent}%
                      </span>
                    )}
                  </div>
                ) : origPrice <= 0 ? (
                  <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    Giá Liên Hệ
                  </span>
                ) : (
                  <div className="text-xl font-black text-slate-900 font-mono mt-0.5">
                    {formatMoney(origPrice)}
                  </div>
                )}
              </div>

              {costPriceVal > 0 && (
                <div className="text-right border-l pl-3 border-slate-100">
                  <div className="text-[10px] text-slate-400">Lợi nhuận dự kiến:</div>
                  <div
                    className={`text-xs font-bold font-mono ${
                      profit >= 0 ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {profit >= 0 ? '+' : ''}
                    {formatMoney(profit)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Margin: {marginPercent}%
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* INPUTS GRID */}
          <div className="space-y-4">
            {/* 1. Giá Gốc (Original Price) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>Giá gốc niêm yết (VNĐ)</span>
                  <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleSetContactPrice}
                  className={`text-[11px] font-semibold transition-colors ${
                    origPrice === 0
                      ? 'text-amber-600 font-bold'
                      : 'text-slate-500 hover:text-amber-600'
                  }`}
                >
                  {origPrice === 0 ? '✓ Đang để "Liên Hệ"' : 'Đặt "Liên Hệ (0 đ)"'}
                </button>
              </div>

              <PricePreview
                value={origPrice}
                label="Giá gốc"
                tone="slate"
                emptyText="Liên hệ (0 ₫)"
              />
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={origPrice === 0 ? '' : origPrice}
                  onChange={(e) => setOrigPrice(e.target.value === '' ? 0 : Number(e.target.value))}
                  placeholder="Ví dụ: 4850000"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-hidden"
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400 pointer-events-none">
                  đ
                </span>
              </div>
            </div>

            {/* 2. Giá Giảm (Sale Price) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>Giá giảm khuyến mãi (VNĐ)</span>
                  <span className="text-slate-400 font-normal">(Tùy chọn)</span>
                </label>
                {hasSale && (
                  <button
                    type="button"
                    onClick={handleRemoveSale}
                    className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline"
                  >
                    Xóa giá giảm (bán theo giá gốc)
                  </button>
                )}
              </div>

              <PricePreview
                value={salePrice}
                label="Giá giảm"
                tone="rose"
                emptyText="Không giảm giá (0 ₫)"
              />
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={salePrice === 0 ? '' : salePrice}
                  onChange={(e) => setSalePrice(e.target.value === '' ? 0 : Number(e.target.value))}
                  placeholder="Để trống hoặc 0 nếu không giảm..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-rose-600 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all outline-hidden"
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400 pointer-events-none">
                  đ
                </span>
              </div>

              {/* Quick % Buttons */}
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[11px] text-slate-400">Chọn nhanh:</span>
                <button
                  type="button"
                  onClick={() => handleApplyDiscountPercent(5)}
                  disabled={origPrice <= 0}
                  className="px-2 py-0.5 text-[11px] font-semibold rounded bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 border border-slate-200 transition-colors disabled:opacity-40"
                >
                  -5%
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyDiscountPercent(10)}
                  disabled={origPrice <= 0}
                  className="px-2 py-0.5 text-[11px] font-semibold rounded bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 border border-slate-200 transition-colors disabled:opacity-40"
                >
                  -10%
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyDiscountPercent(15)}
                  disabled={origPrice <= 0}
                  className="px-2 py-0.5 text-[11px] font-semibold rounded bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 border border-slate-200 transition-colors disabled:opacity-40"
                >
                  -15%
                </button>
                <button
                  type="button"
                  onClick={handleRemoveSale}
                  className="px-2 py-0.5 text-[11px] font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors ml-auto"
                >
                  Bỏ giảm giá
                </button>
              </div>
            </div>

            {/* 3. Giá Đầu Vào (Chỉ khi có quyền Admin) */}
            {canEditCost && (
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-600">
                    Giá đầu vào / Giá vốn (VNĐ)
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Chỉ Admin quản lý</span>
                </div>
                <PricePreview
                  value={costPriceVal}
                  label="Giá vốn"
                  tone="slate"
                  emptyText="0 ₫"
                />
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={costPriceVal === 0 ? '' : costPriceVal}
                    onChange={(e) => setCostPriceVal(e.target.value === '' ? 0 : Number(e.target.value))}
                    placeholder="Nhập giá vốn nhập kho..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-slate-400 transition-all outline-hidden"
                  />
                  <span className="absolute right-3.5 top-2 text-xs font-bold text-slate-400 pointer-events-none">
                    đ
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSaving ? (
                <span>Đang lưu...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Lưu giá bán</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
