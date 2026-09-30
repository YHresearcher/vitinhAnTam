'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  BarChart,
  Bar,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, BarChart3, LineChart as LineIcon } from 'lucide-react';
import { CashflowTimelinePoint } from './financeSummaryHelpers';

export interface PillarChartItem {
  name: string;
  rev: number;
  cost: number;
  profit: number;
  margin: number;
  color?: string;
  count?: string;
}

export interface PillarPieItem {
  name: string;
  value: number;
  profit: number;
  color: string;
}

interface Props {
  timeframeLabel: string;
  profitMargin: number;
  netProfit: number;
  totalRevenue: number;
  timelineData: CashflowTimelinePoint[];
  pillarChartData: PillarChartItem[];
  pieData: PillarPieItem[];
}

export function FinanceOverviewCharts({
  timeframeLabel,
  profitMargin,
  netProfit,
  totalRevenue,
  timelineData,
  pillarChartData,
  pieData,
}: Props) {
  const [activeChartView, setActiveChartView] = useState<'timeline' | 'pillars' | 'pie'>('timeline');

  const formatCurrencyY = (val: number) => {
    if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}Tỷ`;
    if (val >= 1000000) return `${(val / 1000000).toFixed(0)}Tr`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return `${val}`;
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Phân Tích Trực Quan Hiệu Quả Kinh Doanh ({timeframeLabel})</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            So sánh tương quan Doanh thu, Chi phí vốn &amp; Lợi nhuận qua các biểu đồ đa chiều
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/80 self-start sm:self-auto text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveChartView('timeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeChartView === 'timeline'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <LineIcon className="w-3.5 h-3.5" />
            <span>Dòng Tiền</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveChartView('pillars')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeChartView === 'pillars'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>4 Trụ Cột</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveChartView('pie')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeChartView === 'pie'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>Cơ Cấu %</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: TIMELINE */}
      {activeChartView === 'timeline' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono px-1">
            <span>Diễn biến Doanh Thu (Thu) vs Chi Phí (Vốn) vs Lợi Nhuận ròng</span>
            <span className="text-emerald-600 font-bold">Biên Lợi Nhuận: {profitMargin}%</span>
          </div>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={timelineData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatCurrencyY} />
                <RechartsTooltip
                  content={({ active, payload, label }: any) => {
                    if (active && payload && payload.length) {
                      const inc = payload.find((p: any) => p.dataKey === 'income')?.value || 0;
                      const exp = payload.find((p: any) => p.dataKey === 'expense')?.value || 0;
                      const pro = payload.find((p: any) => p.dataKey === 'profit')?.value || inc - exp;
                      const m = inc > 0 ? Math.round((pro / inc) * 100) : 0;
                      return (
                        <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 text-xs backdrop-blur-md">
                          <p className="font-bold text-slate-200 border-b border-slate-700 pb-1.5 mb-2">{label}</p>
                          <div className="space-y-1.5 font-mono">
                            <div className="flex justify-between items-center gap-4 text-blue-400">
                              <span>Doanh Thu:</span>
                              <span className="font-bold">{inc.toLocaleString('vi-VN')}₫</span>
                            </div>
                            <div className="flex justify-between items-center gap-4 text-rose-400">
                              <span>Chi Phí:</span>
                              <span className="font-bold">{exp.toLocaleString('vi-VN')}₫</span>
                            </div>
                            <div className="flex justify-between items-center gap-4 text-emerald-400 pt-1 border-t border-slate-800 font-bold">
                              <span>Lợi Nhuận:</span>
                              <span>+{pro.toLocaleString('vi-VN')}₫ ({m}%)</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} iconType="circle" />
                <Area type="monotone" dataKey="income" name="Doanh Thu" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                <Bar dataKey="expense" name="Chi Phí / Vốn" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={16} />
                <Line type="monotone" dataKey="profit" name="Lợi Nhuận Ròng" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3.5, fill: '#10b981', strokeWidth: 1, stroke: '#fff' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {/* VIEW 2: 4 PILLARS COMPARISON */}
      {activeChartView === 'pillars' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono px-1">
            <span>So sánh Doanh Thu, Vốn &amp; Lãi Gộp giữa 4 mảng hoạt động</span>
            <span className="text-blue-600 font-bold">Tổng Lãi Gộp: +{netProfit.toLocaleString('vi-VN')}₫</span>
          </div>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pillarChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatCurrencyY} />
                <RechartsTooltip
                  content={({ active, payload, label }: any) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 text-xs backdrop-blur-md">
                          <p className="font-bold text-slate-200 border-b border-slate-700 pb-1.5 mb-2">{label}</p>
                          <div className="space-y-1.5 font-mono">
                            <div className="flex justify-between items-center gap-4 text-blue-400">
                              <span>Doanh Thu:</span>
                              <span className="font-bold">{d.rev.toLocaleString('vi-VN')}₫</span>
                            </div>
                            <div className="flex justify-between items-center gap-4 text-rose-400">
                              <span>Giá Vốn:</span>
                              <span className="font-bold">{d.cost.toLocaleString('vi-VN')}₫</span>
                            </div>
                            <div className="flex justify-between items-center gap-4 text-emerald-400 pt-1 border-t border-slate-800 font-bold">
                              <span>Lãi Gộp:</span>
                              <span>+{d.profit.toLocaleString('vi-VN')}₫ ({d.margin}%)</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} iconType="circle" />
                <Bar dataKey="rev" name="Doanh Thu" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={22} />
                <Bar dataKey="cost" name="Giá Vốn / LK" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={22} />
                <Bar dataKey="profit" name="Lợi Nhuận Gộp" fill="#10b981" radius={[4, 4, 0, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* VIEW 3: DONUT BREAKDOWN */}
      {activeChartView === 'pie' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="w-full h-72 relative flex items-center justify-center">
            {pieData.length === 0 ? (
              <div className="text-xs text-slate-400">Chưa có dữ liệu doanh thu trong kỳ.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        const percent = totalRevenue > 0 ? Math.round((d.value / totalRevenue) * 100) : 0;
                        return (
                          <div className="bg-slate-900/95 text-white p-3 rounded-2xl shadow-xl border border-slate-700 text-xs">
                            <p className="font-bold text-slate-200 border-b border-slate-700 pb-1 mb-1.5">{d.name}</p>
                            <div className="space-y-1 font-mono">
                              <div className="text-blue-400">Doanh thu: {d.value.toLocaleString('vi-VN')}₫ ({percent}%)</div>
                              <div className="text-emerald-400">Lãi gộp: +{d.profit.toLocaleString('vi-VN')}₫</div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tổng Doanh Thu</span>
              <span className="text-sm font-black text-slate-900 font-mono">{totalRevenue.toLocaleString('vi-VN')}₫</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Chi Tiết Tỷ Trọng Đóng Góp
            </h4>
            <div className="space-y-2">
              {pillarChartData.map((c) => {
                const share = totalRevenue > 0 ? Math.round((c.rev / totalRevenue) * 100) : 0;
                return (
                  <div key={c.name} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-md" style={{ backgroundColor: c.color || '#2563eb' }} />
                      <div>
                        <div className="font-bold text-slate-800">{c.name}</div>
                        {c.count && <div className="text-[11px] text-slate-400 font-mono">{c.count}</div>}
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-bold text-slate-900">{c.rev.toLocaleString('vi-VN')}₫</div>
                      <div className="text-[11px] text-blue-600 font-bold">{share}% tổng thu</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
