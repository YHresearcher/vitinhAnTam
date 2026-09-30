"use client";

import React from "react";
import { FinancialSummaryData } from "./types";
import { CashflowTimelinePoint, CategoryDistributionPoint } from "./financeSummaryHelpers";
import { useViTinhAnTamStore } from "@/lib/store";
import { FinanceOverviewCharts } from "./FinanceOverviewCharts";
import { ShieldCheck, ArrowRight, Wallet } from "lucide-react";

interface Props {
  financialSummary: FinancialSummaryData;
  timeframeLabel: string;
  timelineData?: CashflowTimelinePoint[];
  categoryData?: CategoryDistributionPoint[];
  onOpenWarrantyFund?: () => void;
}

const PIE_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ec4899"];

export function FinanceOverviewTab({
  financialSummary,
  timeframeLabel,
  timelineData = [],
  onOpenWarrantyFund,
}: Props) {
  const { warrantyProvisions } = useViTinhAnTamStore();
  const { stream, totalRevenue, totalExpense, netProfit, profitMargin } = financialSummary;

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
      color: "#2563eb",
    },
    {
      title: "2. Sửa Chữa Tiếp Nhận",
      count: `${stream.ticket.count} Phiếu`,
      badgeBg: "bg-emerald-100 text-emerald-800",
      rev: stream.ticket.rev,
      cost: stream.ticket.cost,
      profit: stream.ticket.profit,
      color: "#10b981",
    },
    {
      title: "3. Cứu Hộ Onsite",
      count: `${stream.onsite.count} Ca`,
      badgeBg: "bg-amber-100 text-amber-800",
      rev: stream.onsite.rev,
      cost: stream.onsite.cost,
      profit: stream.onsite.profit,
      color: "#f59e0b",
    },
    {
      title: "4. Key Win & Office",
      count: `${stream.key.count} Key`,
      badgeBg: "bg-rose-100 text-rose-800",
      rev: stream.key.rev,
      cost: stream.key.cost,
      profit: stream.key.profit,
      color: "#f43f5e",
    },
  ];

  const pillarChartData = cards.map((c) => ({
    name: c.title.replace(/^\d+\.\s*/, ""),
    rev: c.rev,
    cost: c.cost,
    profit: c.profit,
    margin: c.rev > 0 ? Math.round((c.profit / c.rev) * 100) : 0,
    color: c.color,
    count: c.count,
  }));

  const pieData = cards
    .filter((c) => c.rev > 0)
    .map((c, idx) => ({
      name: c.title.replace(/^\d+\.\s*/, ""),
      value: c.rev,
      profit: c.profit,
      color: c.color || PIE_COLORS[idx % PIE_COLORS.length],
    }));

  return (
    <div className="space-y-6">
      {/* 4 PILLARS KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const margin = c.rev > 0 ? Math.round((c.profit / c.rev) * 100) : 0;
          const costRatio = c.rev > 0 ? Math.round((c.cost / c.rev) * 100) : 0;
          return (
            <div
              key={c.title}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-slate-700 uppercase tracking-tight">{c.title}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold font-mono ${c.badgeBg}`}>
                    {c.count}
                  </span>
                </div>
                <div>
                  <div className="text-xl font-black text-slate-900 font-mono">
                    {c.rev.toLocaleString("vi-VN")}₫
                  </div>
                  <div className="text-[11px] text-slate-400 font-sans mt-0.5">Doanh thu phát sinh</div>
                </div>

                {/* Progress bar representing cost vs profit */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                  <div className="bg-rose-400 h-full" style={{ width: `${costRatio}%` }} title={`Giá vốn: ${costRatio}%`} />
                  <div className="bg-emerald-500 h-full" style={{ width: `${margin}%` }} title={`Lãi gộp: ${margin}%`} />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-500">
                  <span>Giá vốn:</span>
                  <span className="text-rose-600 font-semibold">{c.cost.toLocaleString("vi-VN")}₫</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-700">
                  <span>Lãi gộp:</span>
                  <span>+{c.profit.toLocaleString("vi-VN")}₫</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-100/70 text-[11px]">
                  <span className="text-slate-400">Tỷ suất gộp:</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                    {margin}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* INTERACTIVE VISUAL CHARTS SECTION */}
      <FinanceOverviewCharts
        timeframeLabel={timeframeLabel}
        profitMargin={profitMargin}
        netProfit={netProfit}
        totalRevenue={totalRevenue}
        timelineData={timelineData}
        pillarChartData={pillarChartData}
        pieData={pieData}
      />

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
