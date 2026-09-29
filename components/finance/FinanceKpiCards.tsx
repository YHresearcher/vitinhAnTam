'use client';

import React from 'react';
import { FinancialSummaryData } from './types';
import { ArrowUpRight, ArrowDownRight, TrendingUp, CreditCard, Layers } from 'lucide-react';

interface Props {
  financialSummary: FinancialSummaryData;
  timeframeLabel: string;
}

export function FinanceKpiCards({ financialSummary, timeframeLabel }: Props) {
  const { totalOrdersCount, totalRevenue, totalExpense, netProfit, profitMargin, roiRate, collectedCash, uncollectedReceivable, totalAssetTiedCapital } = financialSummary;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {/* DOANH THU */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span className="font-bold uppercase text-[10px]">Tổng Doanh Thu</span>
          <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px] font-mono">
            {totalOrdersCount} ĐƠN
          </span>
        </div>
        <div className="text-xl font-black text-blue-700 font-mono">
          {totalRevenue.toLocaleString('vi-VN')}₫
        </div>
        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
          <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
          <span>Kỳ: {timeframeLabel}</span>
        </div>
      </div>

      {/* CHI PHÍ */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span className="font-bold uppercase text-[10px]">Tổng Vốn &amp; Chi Phí</span>
          <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-bold text-[10px] font-mono">
            VỐN + LƯƠNG
          </span>
        </div>
        <div className="text-xl font-black text-rose-600 font-mono">
          {totalExpense.toLocaleString('vi-VN')}₫
        </div>
        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
          <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
          <span>Vốn hàng + công KTV</span>
        </div>
      </div>

      {/* LỢI NHUẬN RÒNG */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span className="font-bold uppercase text-[10px]">Lợi Nhuận Ròng</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px] font-mono">
            MARGIN {profitMargin}%
          </span>
        </div>
        <div className={`text-xl font-black font-mono ${netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
          {netProfit >= 0 ? '+' : ''}
          {netProfit.toLocaleString('vi-VN')}₫
        </div>
        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          <span>ROI: {roiRate}%</span>
        </div>
      </div>

      {/* DÒNG TIỀN ĐÃ THU */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span className="font-bold uppercase text-[10px]">Tiền Đã Thu Về</span>
          <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-bold text-[10px] font-mono">
            THỰC THU
          </span>
        </div>
        <div className="text-xl font-black text-purple-700 font-mono">
          {collectedCash.toLocaleString('vi-VN')}₫
        </div>
        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
          <CreditCard className="w-3.5 h-3.5 text-purple-600" />
          <span>Chưa thu: {uncollectedReceivable.toLocaleString('vi-VN')}₫</span>
        </div>
      </div>

      {/* VỐN HÀNG TỒN */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span className="font-bold uppercase text-[10px]">Vốn Đọng Kho Hàng</span>
          <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-bold text-[10px] font-mono">
            TỒN KHO RTS
          </span>
        </div>
        <div className="text-xl font-black text-amber-700 font-mono">
          {totalAssetTiedCapital.toLocaleString('vi-VN')}₫
        </div>
        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-amber-600" />
          <span>Máy, linh kiện &amp; key tồn</span>
        </div>
      </div>
    </div>
  );
}
