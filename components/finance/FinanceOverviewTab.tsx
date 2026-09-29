"use client";

import React from "react";
import { FinancialSummaryData } from "./types";
import { useViTinhAnTamStore } from "@/lib/store";

interface Props {
  financialSummary: FinancialSummaryData;
  timeframeLabel: string;
  onOpenWarrantyFund?: () => void;
}

export function FinanceOverviewTab({ financialSummary, timeframeLabel, onOpenWarrantyFund }: Props) {
  const { warrantyProvisions } = useViTinhAnTamStore();
  const { stream, totalRevenue, totalExpense, netProfit } = financialSummary;

  // 5% warranty calculation for current scope
  const lockedFund = warrantyProvisions
    .filter((p) => p.status === "locked")
    .reduce((sum, p) => sum + p.provision_amount, 0);

  const unlockedFund = warrantyProvisions
    .filter((p) => p.status === "unlocked")
    .reduce((sum, p) => sum + p.provision_amount, 0);

  const totalFund = lockedFund + unlockedFund;

  const cards = [
    {
      title: "1. Bán Kho Máy",
      count: `${stream.machine.count} Máy`,
      badgeBg: "bg-blue-100 text-blue-800",
      rev: stream.machine.rev,
      cost: stream.machine.cost,
      profit: stream.machine.profit,
      color: "bg-blue-600",
    },
    {
      title: "2. Sửa Chữa Tiếp Nhận",
      count: `${stream.ticket.count} Phiếu`,
      badgeBg: "bg-emerald-100 text-emerald-800",
      rev: stream.ticket.rev,
      cost: stream.ticket.cost,
      profit: stream.ticket.profit,
      color: "bg-emerald-600",
    },
    {
      title: "3. Cứu Hộ Onsite",
      count: `${stream.onsite.count} Ca`,
      badgeBg: "bg-amber-100 text-amber-800",
      rev: stream.onsite.rev,
      cost: stream.onsite.cost,
      profit: stream.onsite.profit,
      color: "bg-amber-500",
    },
    {
      title: "4. Key Win & Office",
      count: `${stream.key.count} Key`,
      badgeBg: "bg-rose-100 text-rose-800",
      rev: stream.key.rev,
      cost: stream.key.cost,
      profit: stream.key.profit,
      color: "bg-rose-500",
    },
  ];

  // Maximum value for bar scaling
  const maxBarValue = Math.max(
    1,
    ...cards.map((c) => Math.max(c.rev, c.cost, c.profit))
  );

  return (
    <div className="space-y-6">
      {/* 4 PILLARS KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const margin = c.rev > 0 ? Math.round((c.profit / c.rev) * 100) : 0;
          return (
            <div key={c.title} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-slate-700 uppercase tracking-tight">{c.title}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold font-mono ${c.badgeBg}`}>{c.count}</span>
              </div>
              <div className="text-xl font-black text-slate-900 font-mono">
                {c.rev.toLocaleString("vi-VN")}₫
              </div>
              <div className="pt-3 border-t border-slate-100 space-y-1 text-xs font-mono">
                <div className="flex justify-between text-slate-500">
                  <span>Giá vốn/Linh kiện:</span>
                  <span>{c.cost.toLocaleString("vi-VN")}₫</span>
                </div>
                <div className="flex justify-between font-black text-emerald-700">
                  <span>Lãi gộp:</span>
                  <span>+{c.profit.toLocaleString("vi-VN")}₫ ({margin}%)</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4-PILLARS COMPARATIVE BAR CHART VISUAL (REQUIREMENT 7) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
              Biểu Đồ So Sánh 4 Mảng Kinh Doanh ({timeframeLabel})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              So sánh trực quan Doanh thu, Chi phí vốn và Lợi nhuận gộp từng trụ cột
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold font-mono">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-600" /><span>Doanh Thu</span></div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-300" /><span>Chi Phí Vốn</span></div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500" /><span>Lãi Gộp</span></div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3">
          {cards.map((c) => {
            const revHeight = Math.max(8, Math.round((c.rev / maxBarValue) * 100));
            const costHeight = Math.max(8, Math.round((c.cost / maxBarValue) * 100));
            const profitHeight = Math.max(8, Math.round((Math.max(0, c.profit) / maxBarValue) * 100));

            return (
              <div key={c.title} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-3">
                <div className="text-xs font-bold text-slate-800 truncate">{c.title}</div>
                
                {/* 3 Bars in column */}
                <div className="h-36 flex items-end justify-center gap-3 pt-2 px-2 border-b border-slate-200">
                  {/* Revenue Bar */}
                  <div className="flex-1 flex flex-col items-center justify-end h-full group relative">
                    <span className="text-[10px] font-bold font-mono text-blue-700 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {(c.rev / 1000000).toFixed(1)}M
                    </span>
                    <div
                      style={{ height: `${revHeight}%` }}
                      className="w-full bg-blue-600 rounded-t-lg transition-all shadow-xs group-hover:bg-blue-700"
                    />
                  </div>

                  {/* Cost Bar */}
                  <div className="flex-1 flex flex-col items-center justify-end h-full group relative">
                    <span className="text-[10px] font-bold font-mono text-slate-600 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {(c.cost / 1000000).toFixed(1)}M
                    </span>
                    <div
                      style={{ height: `${costHeight}%` }}
                      className="w-full bg-slate-300 rounded-t-lg transition-all group-hover:bg-slate-400"
                    />
                  </div>

                  {/* Profit Bar */}
                  <div className="flex-1 flex flex-col items-center justify-end h-full group relative">
                    <span className="text-[10px] font-bold font-mono text-emerald-700 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {(c.profit / 1000000).toFixed(1)}M
                    </span>
                    <div
                      style={{ height: `${profitHeight}%` }}
                      className="w-full bg-emerald-500 rounded-t-lg transition-all shadow-xs group-hover:bg-emerald-600"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>Lãi: <strong className="text-emerald-700 font-bold">{c.profit.toLocaleString("vi-VN")}₫</strong></span>
                  <span>{c.rev > 0 ? Math.round((c.profit / c.rev) * 100) : 0}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CASHFLOW DISTRIBUTION STREAM VISUAL (REQUIREMENT 7) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
              Dòng Chảy Tài Chính & Phân Bổ Ngân Sách ({timeframeLabel})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Quy trình phân rã dòng tiền từ Doanh thu gộp đến Lợi nhuận ròng
            </p>
          </div>
          {onOpenWarrantyFund && (
            <button
              type="button"
              onClick={onOpenWarrantyFund}
              className="text-xs font-bold text-purple-700 hover:text-purple-900 transition-colors cursor-pointer"
            >
              Xem Chi Tiết Quỹ 5% →
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center text-xs pt-1 font-mono">
          {/* 1. Doanh thu */}
          <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-1">
            <div className="text-[10px] font-bold text-blue-900 uppercase">1. Tổng Doanh Thu</div>
            <div className="text-base font-black text-blue-800">{totalRevenue.toLocaleString("vi-VN")}₫</div>
            <div className="text-[10px] text-blue-600 font-sans">100% Thu từ 4 mảng</div>
          </div>

          {/* 2. Chi phí vốn */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
            <div className="text-[10px] font-bold text-slate-700 uppercase">2. Vốn / Linh Kiện</div>
            <div className="text-base font-black text-slate-800">-{totalExpense.toLocaleString("vi-VN")}₫</div>
            <div className="text-[10px] text-slate-500 font-sans">Giá nhập thiết bị & linh kiện</div>
          </div>

          {/* 3. Lãi gộp */}
          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-1">
            <div className="text-[10px] font-bold text-emerald-900 uppercase">3. Lợi Nhuận Gộp</div>
            <div className="text-base font-black text-emerald-800">+{netProfit.toLocaleString("vi-VN")}₫</div>
            <div className="text-[10px] text-emerald-600 font-sans">Doanh thu trừ giá vốn</div>
          </div>

          {/* 4. Quỹ Bảo Hành 5% */}
          <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-2xl space-y-1">
            <div className="text-[10px] font-bold text-purple-900 uppercase">4. Quỹ BH (5%)</div>
            <div className="text-base font-black text-purple-800">{totalFund.toLocaleString("vi-VN")}₫</div>
            <div className="text-[10px] text-purple-600 font-sans">Phong tỏa & tất toán 31/12</div>
          </div>

          {/* 5. Lãi Ròng */}
          <div className="p-4 bg-gradient-to-tr from-slate-900 to-slate-800 text-white rounded-2xl space-y-1 shadow-xs">
            <div className="text-[10px] font-bold text-amber-300 uppercase">5. Lợi Nhuận Ròng</div>
            <div className="text-base font-black text-white">
              {Math.max(0, netProfit - lockedFund).toLocaleString("vi-VN")}₫
            </div>
            <div className="text-[10px] text-slate-300 font-sans">Thực nhận sau trích quỹ</div>
          </div>
        </div>
      </div>
    </div>
  );
}
