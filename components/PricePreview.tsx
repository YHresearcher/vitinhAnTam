'use client';

import React from 'react';

/**
 * Định dạng tiền Việt có phân tách đơn vị đầy đủ: 350000 -> "350.000 ₫"
 * Dùng cho preview phía trên ô nhập giá để người dùng dễ quan sát.
 */
export const formatMoney = (value: number): string => {
  const safe = Number.isFinite(value) ? Math.round(value) : 0;
  return `${new Intl.NumberFormat('vi-VN').format(safe)} ₫`;
};

interface PricePreviewProps {
  /** Giá trị hiện tại của ô nhập */
  value: number;
  /** Nhãn nhỏ bên trái, ví dụ "Giá đầu vào" / "Giá bán" */
  label?: string;
  /** Tông màu: 'slate' (mặc định) | 'emerald' (lợi nhuận) | 'rose' (chi phí) */
  tone?: 'slate' | 'emerald' | 'rose' | 'blue' | 'purple';
  /** Giá trị = 0 thì hiển thị chữ này thay vì "0 ₫" */
  emptyText?: string;
}

const TONE_CLASSES: Record<NonNullable<PricePreviewProps['tone']>, { bg: string; text: string }> = {
  slate: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-800' },
  emerald: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
  rose: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700' },
  blue: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
  purple: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700' },
};

/**
 * Preview giá hiển thị PHÍA TRÊN ô nhập.
 * Ví dụ ô nhập đang gõ 350000 -> preview hiện "350.000 ₫".
 */
export function PricePreview({
  value,
  label = 'Hiển thị',
  tone = 'slate',
  emptyText = 'Chưa nhập giá',
}: PricePreviewProps) {
  const palette = TONE_CLASSES[tone];
  const isZero = !value;

  return (
    <div
      className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md border mb-1.5 ${palette.bg}`}
      aria-live="polite"
    >
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <span className={`text-xs font-black font-mono tabular-nums ${isZero ? 'text-slate-400' : palette.text}`}>
        {isZero ? emptyText : formatMoney(value)}
      </span>
    </div>
  );
}
