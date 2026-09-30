'use client';

import React, { useState, useMemo } from 'react';
import { LedgerItem } from './types';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

interface Props {
  ledgerList: LedgerItem[];
}

export function FinanceLedgerCharts({ ledgerList }: Props) {
  const [viewMode, setViewMode] = useState<'flow' | 'category'>('flow');

  const { totalIncome, totalExpense, netCash, timelineData, categoryData } = useMemo(() => {
    let income = 0;
    let expense = 0;
    const timeMap: Record<string, { label: string; income: number; expense: number; net: number }> = {};
    const catMap: Record<string, { name: string; income: number; expense: number; count: number }> = {};

    ledgerList.forEach((tx) => {
      income += tx.incomeAmount;
      expense += tx.expenseAmount;

      const d = new Date(tx.date);
      if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const key = `${d.getFullYear()}-${month}-${day}`;
        const label = `${day}/${month}`;

        if (!timeMap[key]) {
          timeMap[key] = { label, income: 0, expense: 0, net: 0 };
        }
        timeMap[key].income += tx.incomeAmount;
        timeMap[key].expense += tx.expenseAmount;
        timeMap[key].net += (tx.incomeAmount - tx.expenseAmount);
      }

      const cat = tx.categoryLabel || tx.category || 'Khác';
      if (!catMap[cat]) {
        catMap[cat] = { name: cat, income: 0, expense: 0, count: 0 };
      }
      catMap[cat].income += tx.incomeAmount;
      catMap[cat].expense += tx.expenseAmount;
      catMap[cat].count += 1;
    });

    return {
      totalIncome: income,
      totalExpense: expense,
      netCash: income - expense,
      timelineData: Object.keys(timeMap).sort().map((k) => timeMap[k]),
      categoryData: Object.values(catMap).sort((a, b) => (b.income + b.expense) - (a.income + a.expense)),
    };
  }, [ledgerList]);

  const formatCurrencyY = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(0)}Tr`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return `${val}`;
  };

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
              Phân Tích Dòng Tiền Sổ Quỹ ({ledgerList.length} Giao Dịch)
            </h3>
            <p className="text-[11px] text-slate-500">
              Biểu đồ trực quan thu chi và biến động số dư thực tế
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('flow')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer font-medium ${
              viewMode === 'flow'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Dòng Tiền Theo Ngày
          </button>
          <button
            type="button"
            onClick={() => setViewMode('category')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer font-medium ${
              viewMode === 'category'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Theo Nghiệp Vụ
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-1">
        <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl text-center">
          <span className="text-[10px] font-bold text-emerald-800 uppercase flex items-center justify-center gap-1">
            <ArrowUpRight className="w-3 h-3 text-emerald-600" /> Tổng Thu Vào
          </span>
          <div className="text-sm sm:text-base font-black font-mono text-emerald-900 mt-0.5">
            +{totalIncome.toLocaleString('vi-VN')}₫
          </div>
        </div>

        <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-2xl text-center">
          <span className="text-[10px] font-bold text-rose-800 uppercase flex items-center justify-center gap-1">
            <ArrowDownRight className="w-3 h-3 text-rose-600" /> Tổng Chi Ra
          </span>
          <div className="text-sm sm:text-base font-black font-mono text-rose-900 mt-0.5">
            -{totalExpense.toLocaleString('vi-VN')}₫
          </div>
        </div>

        <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl text-center">
          <span className="text-[10px] font-bold text-blue-800 uppercase">Dòng Tiền Ròng</span>
      {/* CHART RENDERING */}
      {viewMode === 'flow' ? (
        <div className="w-full h-56 pt-2">
          {timelineData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-xs text-slate-400">
              Không có giao dịch nào thỏa điều kiện lọc.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={timelineData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="ledgerIncomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatCurrencyY} />
                <RechartsTooltip
                  content={({ active, payload, label }: any) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900/95 text-white p-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-mono">
                          <p className="font-bold text-slate-200 border-b border-slate-700 pb-1 mb-1.5 font-sans">{label}</p>
                          <div className="text-emerald-400">Thu vào: +{d.income.toLocaleString('vi-VN')}₫</div>
                          <div className="text-rose-400">Chi ra: -{d.expense.toLocaleString('vi-VN')}₫</div>
                          <div className="text-cyan-300 font-bold pt-1 border-t border-slate-800">
                            Ròng: {d.net >= 0 ? '+' : ''}{d.net.toLocaleString('vi-VN')}₫
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} iconType="circle" />
                <Area type="monotone" dataKey="income" name="Thu Vào" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#ledgerIncomeGrad)" />
                <Bar dataKey="expense" name="Chi Ra" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={16} />
                <Line type="monotone" dataKey="net" name="Dòng Tiền Ròng" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3, fill: '#06b6d4' }} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      ) : (
        <div className="w-full h-56 pt-2">
          {categoryData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-xs text-slate-400">
              Không có dữ liệu hạng mục.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatCurrencyY} />
                <RechartsTooltip
                  content={({ active, payload, label }: any) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900/95 text-white p-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-mono">
                          <p className="font-bold text-slate-200 border-b border-slate-700 pb-1 mb-1.5 font-sans">
                            {label} ({d.count} GD)
                          </p>
                          <div className="text-emerald-400">Thu: +{d.income.toLocaleString('vi-VN')}₫</div>
                          <div className="text-rose-400">Chi: -{d.expense.toLocaleString('vi-VN')}₫</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} iconType="circle" />
                <Bar dataKey="income" name="Thu Vào" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="expense" name="Chi Ra" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

          <div className="text-sm sm:text-base font-black font-mono text-blue-900 mt-0.5">
            {netCash >= 0 ? '+' : ''}{netCash.toLocaleString('vi-VN')}₫
          </div>
        </div>
      </div>
    </div>
  );
}
