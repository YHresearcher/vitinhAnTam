"use client";

import React from "react";
import { FinancialSummaryData } from "./types";
import { useViTinhAnTamStore } from "@/lib/store";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";

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

      {/* 4-PILLARS COMPARATIVE RECHARTS BAR CHART */}
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
        </div>

        <div className="w-full h-64 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { name: "Bán Máy", revenue: stream.machine.rev, cost: stream.machine.cost, profit: stream.machine.profit },
                { name: "Sửa Chữa", revenue: stream.ticket.rev, cost: stream.ticket.cost, profit: stream.ticket.profit },
                { name: "Cứu Hộ Onsite", revenue: stream.onsite.rev, cost: stream.onsite.cost, profit: stream.onsite.profit },
                { name: "Key Bản Quyền", revenue: stream.key.rev, cost: stream.key.cost, profit: stream.key.profit },
              ]}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
              <YAxis
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => (v >= 1000000 ? `${(v / 1000000).toFixed(0)}Tr` : `${v}`)}
              />
              <RechartsTooltip
                content={({ active, payload, label }: any) => {
                  if (active && payload && payload.length) {
                    const rev = payload.find((p: any) => p.dataKey === 'revenue')?.value || 0;
                    const cost = payload.find((p: any) => p.dataKey === 'cost')?.value || 0;
                    const profit = payload.find((p: any) => p.dataKey === 'profit')?.value || 0;
                    const margin = rev > 0 ? Math.round((profit / rev) * 100) : 0;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-700">
                        <p className="font-bold border-b border-slate-700 pb-1 mb-1.5">{label}</p>
                        <div className="space-y-1 font-mono">
                          <div className="text-blue-400">Doanh thu: {rev.toLocaleString('vi-VN')}₫</div>
                          <div className="text-slate-400">Chi phí vốn: {cost.toLocaleString('vi-VN')}₫</div>
                          <div className="text-emerald-400 font-bold">Lãi gộp: +{profit.toLocaleString('vi-VN')}₫ ({margin}%)</div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} iconType="circle" />
              <Bar dataKey="revenue" name="Doanh Thu" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={22} />
              <Bar dataKey="cost" name="Chi Phí Vốn" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={22} />
              <Bar dataKey="profit" name="Lợi Nhuận Gộp" fill="#10b981" radius={[4, 4, 0, 0]} barSize={22} />
            </BarChart>
          </ResponsiveContainer>
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
