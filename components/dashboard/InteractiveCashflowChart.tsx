'use client';

import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export interface CashflowDataPoint {
  label: string;
  income: number;
  expense: number;
  profit?: number;
}

interface Props {
  data: CashflowDataPoint[];
  isAdmin: boolean;
  timeframe: 'day' | 'week' | 'month' | 'quarter' | 'year';
  onTimeframeChange: (timeframe: 'day' | 'week' | 'month' | 'quarter' | 'year') => void;
  onOpenDrilldown?: () => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const income = payload.find((p: any) => p.dataKey === 'income')?.value || 0;
    const expense = payload.find((p: any) => p.dataKey === 'expense')?.value || 0;
    const profit = payload.find((p: any) => p.dataKey === 'profit')?.value || (income - expense);
    const margin = income > 0 ? Math.round((profit / income) * 100) : 0;

    return (
      <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs backdrop-blur-md">
        <p className="font-bold text-slate-200 border-b border-slate-700 pb-1 mb-1.5">{label}</p>
        <div className="space-y-1 font-mono">
          <div className="flex justify-between items-center gap-4 text-emerald-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Doanh Thu:
            </span>
            <span className="font-bold">{income.toLocaleString('vi-VN')}₫</span>
          </div>
          {expense > 0 && (
            <div className="flex justify-between items-center gap-4 text-rose-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                Chi Phí:
              </span>
              <span className="font-bold">{expense.toLocaleString('vi-VN')}₫</span>
            </div>
          )}
          <div className="flex justify-between items-center gap-4 text-cyan-300 pt-1 border-t border-slate-800">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Lợi Nhuận:
            </span>
            <span className="font-bold">+{profit.toLocaleString('vi-VN')}₫ ({margin}%)</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function InteractiveCashflowChart({
  data,
  isAdmin,
  timeframe,
  onTimeframeChange,
  onOpenDrilldown,
}: Props) {
  const chartData = data.map((d) => ({
    ...d,
    profit: d.income - d.expense,
  }));

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(0)}Tr`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return `${value}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 font-sans flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-sm font-bold text-slate-900">
            {isAdmin ? 'Biểu Đồ Dòng Tiền & Doanh Thu' : 'Biểu Đồ Sản Lượng Bán Hàng & Dịch Vụ'}
          </h2>
          {isAdmin && onOpenDrilldown && (
            <button
              type="button"
              onClick={onOpenDrilldown}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-0.5 rounded-lg border border-blue-200 transition-colors"
            >
              Phân tích ROI &amp; Margin →
            </button>
          )}
        </div>

        {/* Timeframe switch */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto text-xs">
          {[
            { key: 'day', label: 'Ngày' },
            { key: 'week', label: 'Tuần' },
            { key: 'month', label: 'Tháng' },
            { key: 'quarter', label: 'Quý' },
            { key: 'year', label: 'Năm' },
          ].map(({ key, label }) => {
            const isActive = timeframe === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onTimeframeChange(key as any)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full h-64 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="label"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatYAxis}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} iconType="circle" />
            <Area
              type="monotone"
              dataKey="income"
              name="Doanh Thu"
              stroke="#10b981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#incomeGrad)"
            />
            {isAdmin && (
              <Bar
                dataKey="expense"
                name="Chi Phí / Giá Vốn"
                fill="#f43f5e"
                radius={[4, 4, 0, 0]}
                barSize={16}
              />
            )}
            <Line
              type="monotone"
              dataKey="profit"
              name="Lợi Nhuận Ròng"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={{ r: 3, fill: '#06b6d4', strokeWidth: 1, stroke: '#fff' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
