'use client';

import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts';
import { ShieldCheck, PieChart as PieIcon, TrendingUp } from 'lucide-react';

export interface WarrantyStats {
  lockedTotal: number;
  unlockedTotal: number;
  pendingTotal: number;
  settledTotal: number;
  activeFundTotal: number;
  lockedCount: number;
  unlockedCount: number;
  pendingCount: number;
  settledCount?: number;
}

export interface WarrantyMonthlyPoint {
  month: string;
  provisioned: number;
  unlocked: number;
}

interface Props {
  stats: WarrantyStats;
  monthlyTrend: WarrantyMonthlyPoint[];
}

const STATUS_COLORS = {
  locked: '#f59e0b',
  unlocked: '#10b981',
  pending: '#f43f5e',
  settled: '#8b5cf6',
};

export function FinanceWarrantyCharts({ stats, monthlyTrend }: Props) {
  const pieData = [
    { name: 'Đang phong tỏa (🔒)', value: stats.lockedTotal, count: stats.lockedCount, color: STATUS_COLORS.locked },
    { name: 'Đã giải tỏa (🔓)', value: stats.unlockedTotal, count: stats.unlockedCount, color: STATUS_COLORS.unlocked },
    { name: 'Chờ duyệt (⏳)', value: stats.pendingTotal, count: stats.pendingCount, color: STATUS_COLORS.pending },
    { name: 'Đã kết chuyển (✓)', value: stats.settledTotal, count: stats.settledCount || 0, color: STATUS_COLORS.settled },
  ].filter((d) => d.value > 0);

  const totalAllProvisions = stats.lockedTotal + stats.unlockedTotal + stats.pendingTotal + stats.settledTotal;

  const formatCurrencyY = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}Tr`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return `${val}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 font-sans">
      {/* CHART 1: DONUT STATUS BREAKDOWN */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-purple-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Cơ Cấu Trạng Thái Quỹ Bảo Hành 5%
            </h4>
          </div>
          <span className="text-[11px] font-mono font-bold text-slate-500">
            Tổng: {totalAllProvisions.toLocaleString('vi-VN')}₫
          </span>
        </div>

        <div className="w-full h-60 relative flex items-center justify-center">
          {pieData.length === 0 ? (
            <div className="text-xs text-slate-400">Chưa có khoản trích lập bảo hành nào.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={88}
                  paddingAngle={4}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`w-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      const percent = totalAllProvisions > 0 ? Math.round((d.value / totalAllProvisions) * 100) : 0;
                      return (
                        <div className="bg-slate-900/95 text-white p-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-mono">
                          <p className="font-bold text-slate-200 border-b border-slate-700 pb-1 mb-1 font-sans">{d.name}</p>
                          <div className="text-purple-300 font-bold">{d.value.toLocaleString('vi-VN')}₫ ({percent}%)</div>
                          <div className="text-slate-400 text-[11px] mt-0.5">{d.count} thiết bị</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}

          {/* Inner Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Quỹ Khả Dụng</span>
            <span className="text-xs font-black text-slate-900 font-mono">
              {stats.activeFundTotal.toLocaleString('vi-VN')}₫
            </span>
          </div>
        </div>

        {/* Mini Legend Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
            <span className="text-slate-600 truncate">Phong tỏa: <b className="font-mono text-slate-900">{stats.lockedTotal.toLocaleString('vi-VN')}₫</b></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-slate-600 truncate">Đã giải tỏa: <b className="font-mono text-slate-900">{stats.unlockedTotal.toLocaleString('vi-VN')}₫</b></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
            <span className="text-slate-600 truncate">Chờ duyệt: <b className="font-mono text-slate-900">{stats.pendingTotal.toLocaleString('vi-VN')}₫</b></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
            <span className="text-slate-600 truncate">Đã kết chuyển: <b className="font-mono text-slate-900">{stats.settledTotal.toLocaleString('vi-VN')}₫</b></span>
          </div>
        </div>
      </div>

      {/* CHART 2: MONTHLY PROVISION & MATURITY BAR CHART */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Dòng Trích Lập &amp; Kế Hoạch Giải Tỏa
            </h4>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Theo chu kỳ bán &amp; bảo hành</span>
        </div>

        <div className="w-full h-60">
          {monthlyTrend.length === 0 ? (
            <div className="flex items-center justify-center h-full text-xs text-slate-400">
              Chưa có dữ liệu trích lập theo tháng.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatCurrencyY} />
                <RechartsTooltip
                  content={({ active, payload, label }: any) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900/95 text-white p-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-mono">
                          <p className="font-bold text-slate-200 border-b border-slate-700 pb-1 mb-1.5 font-sans">{label}</p>
                          <div className="text-purple-400">Trích lập mới: {d.provisioned.toLocaleString('vi-VN')}₫</div>
                          <div className="text-emerald-400">Đến hạn mở: {d.unlocked.toLocaleString('vi-VN')}₫</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} iconType="circle" />
                <Bar dataKey="provisioned" name="Trích Lập (5%)" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={18} />
                <Bar dataKey="unlocked" name="Đã Mở / Khả Dụng" fill="#10b981" radius={[4, 4, 0, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="p-2.5 bg-purple-50 rounded-2xl border border-purple-100 flex items-center justify-between text-[11px] text-purple-900">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            Trích tự động 5% mỗi đơn máy bán để bảo vệ an toàn rủi ro linh kiện bảo hành
          </span>
        </div>
      </div>
    </div>
  );
}
