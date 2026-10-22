'use client';

import React from 'react';

// Thẻ thống kê dùng chung cho khu vực quản trị (P2 — gom các bản sao
// chép tay ở từng trang về một nguồn duy nhất; giao diện giữ nguyên
// 100% so với các thẻ cũ):
// - variant "plain": thẻ trắng slate (Khách hàng, Tiền công…)
// - variant "brand": thẻ tông màu thương hiệu #FFFDF9 (Quản lý key…)
export type StatCardTone =
  | 'slate'
  | 'amber'
  | 'purple'
  | 'emerald'
  | 'blue'
  | 'rose';

const PLAIN_VALUE_TONE: Record<StatCardTone, string> = {
  slate: 'text-slate-900',
  amber: 'text-amber-700',
  purple: 'text-purple-700',
  emerald: 'text-emerald-700',
  blue: 'text-blue-700',
  rose: 'text-rose-700',
};

const BRAND_CONTAINER_TONE: Record<StatCardTone, string> = {
  slate: 'border-[#E8E2D9]',
  amber: 'border-amber-200',
  purple: 'border-purple-200',
  emerald: 'border-emerald-200',
  blue: 'border-blue-200',
  rose: 'border-rose-200',
};

const BRAND_LABEL_TONE: Record<StatCardTone, string> = {
  slate: 'text-[#6E5D53]',
  amber: 'text-amber-800',
  purple: 'text-purple-800',
  emerald: 'text-emerald-800',
  blue: 'text-blue-800',
  rose: 'text-rose-800',
};

const BRAND_VALUE_TONE: Record<StatCardTone, string> = {
  slate: 'text-[#2B1810]',
  amber: 'text-amber-700',
  purple: 'text-purple-700',
  emerald: 'text-emerald-700',
  blue: 'text-blue-700',
  rose: 'text-rose-700',
};

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  tone?: StatCardTone;
  variant?: 'plain' | 'brand';
  /** Dòng mô tả phụ dưới giá trị (chỉ variant brand dùng theo thiết kế cũ) */
  sub?: string;
  /** Giá trị dùng font mono (mặc định true ở cả 2 variant như thiết kế cũ) */
  mono?: boolean;
}

export function StatCard({
  label,
  value,
  tone = 'slate',
  variant = 'plain',
  sub,
  mono = true,
}: StatCardProps) {
  if (variant === 'brand') {
    return (
      <div
        className={`bg-[#FFFDF9] p-4 rounded-xl border shadow-xs ${BRAND_CONTAINER_TONE[tone]}`}
      >
        <div
          className={`text-[11px] font-bold uppercase tracking-wider ${BRAND_LABEL_TONE[tone]}`}
        >
          {label}
        </div>
        <div
          className={`text-2xl font-black mt-1 ${BRAND_VALUE_TONE[tone]} ${mono ? 'font-mono' : ''}`}
        >
          {value}
        </div>
        {sub && (
          <div className={`text-[11px] mt-0.5 ${BRAND_LABEL_TONE[tone]}`}>{sub}</div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div
        className={`text-xl font-bold mt-1 ${PLAIN_VALUE_TONE[tone]} ${mono ? 'font-mono' : ''}`}
      >
        {value}
      </div>
    </div>
  );
}
