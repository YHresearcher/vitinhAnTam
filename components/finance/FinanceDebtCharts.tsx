'use client';

import React, { useMemo } from 'react';
import { LedgerItem } from './types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { Clock, AlertTriangle } from 'lucide-react';

interface Props {
  debtCustomersList: LedgerItem[];
}

const AGING_COLORS = ['#10b981', '#f59e0b', '#f97316', '#ef4444'];

export function FinanceDebtCharts({ debtCustomersList }: Props) {
  const { agingData, topDebtorsData, totalDebt } = useMemo(() => {
    const now = new Date().getTime();
    const aging = [
      { name: '< 7 Ngày', label: 'Dưới 7 ngày (An toàn)', value: 0, count: 0, color: AGING_COLORS[0] },
      { name: '7 - 14 Ngày', label: '7 - 14 ngày (Cần nhắc)', value: 0, count: 0, color: AGING_COLORS[1] },
      { name: '15 - 30 Ngày', label: '15 - 30 ngày (Theo dõi)', value: 0, count: 0, color: AGING_COLORS[2] },
      { name: '> 30 Ngày', label: 'Quá 30 ngày (Rủi ro)', value: 0, count: 0, color: AGING_COLORS[3] },
    ];

    const customerMap: Record<string, { name: string; amount: number; count: number }> = {};
    let sumDebt = 0;

    debtCustomersList.forEach((tx) => {
      const amount = tx.incomeAmount;
      sumDebt += amount;

      const txDate = new Date(tx.date).getTime();
      const diffDays = Math.max(0, Math.floor((now - txDate) / (1000 * 60 * 60 * 24)));
      if (diffDays < 7) {
        aging[0].value += amount;
        aging[0].count += 1;
      } else if (diffDays <= 14) {
        aging[1].value += amount;
        aging[1].count += 1;
      } else if (diffDays <= 30) {
        aging[2].value += amount;
        aging[2].count += 1;
      } else {
        aging[3].value += amount;
        aging[3].count += 1;
      }

      const custName = tx.partyName || 'Khách lẻ';
      if (!customerMap[custName]) {
        customerMap[custName] = { name: custName, amount: 0, count: 0 };
      }
      customerMap[custName].amount += amount;
      customerMap[custName].count += 1;
    });

    const topDebtors = Object.values(customerMap)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6)
      .map((c) => ({
        name: c.name.length > 14 ? `${c.name.slice(0, 12)}…` : c.name,
        fullName: c.name,
        amount: c.amount,
        count: c.count,
      }));

    return {
      agingData: aging.filter((a) => a.value > 0),
      topDebtorsData: topDebtors,
      totalDebt: sumDebt,
    };
  }, [debtCustomersList]);

  if (debtCustomersList.length === 0) return null;

  const formatCurrencyY = (v: number) => (v >= 1000000 ? `${(v / 1000000).toFixed(0)}Tr` : `${v}`);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-sans">
      {/* CHART 1: DEBT AGING PIE / DONUT */}
      <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Phân Loại Độ Tuổi Công Nợ
            </h4>
          </div>
          <span className="text-[11px] font-mono font-bold text-amber-700">
            {totalDebt.toLocaleString('vi-VN')}₫
          </span>
        </div>

        <div className="w-full h-48 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={agingData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
              >
                {agingData.map((entry, index) => (
                  <Cell key={`aging-pie-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip
                content={({ active, payload }: any) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    const percent = totalDebt > 0 ? Math.round((d.value / totalDebt) * 100) : 0;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl text-xs font-mono border border-slate-700">
                        <p className="font-bold border-b border-slate-700 pb-1 mb-1 font-sans">{d.label}</p>
                        <div className="text-amber-300 font-bold">{d.value.toLocaleString('vi-VN')}₫ ({percent}%)</div>
                        <div className="text-slate-400 text-[11px]">{d.count} đơn nợ</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

      {/* CHART 2: TOP DEBTORS BAR */}
      <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Top Khách Hàng Có Công Nợ Lớn Nhất
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">Ưu tiên theo dõi thu hồi</span>
        </div>

        <div className="w-full h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topDebtorsData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatCurrencyY} />
              <RechartsTooltip
                content={({ active, payload }: any) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl text-xs font-mono border border-slate-700">
                        <p className="font-bold border-b border-slate-700 pb-1 mb-1 font-sans">{d.fullName}</p>
                        <div className="text-rose-400 font-bold">Nợ: {d.amount.toLocaleString('vi-VN')}₫</div>
                        <div className="text-slate-400 text-[11px]">Số phiếu: {d.count}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="amount" name="Số Tiền Còn Nợ" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-xs font-mono">
          {agingData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-slate-600 truncate text-[11px]">
                {item.name}: <b>{item.value.toLocaleString('vi-VN')}₫</b>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
