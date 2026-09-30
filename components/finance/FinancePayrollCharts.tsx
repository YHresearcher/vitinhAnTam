'use client';

import React from 'react';
import { Users } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
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

export interface TechChartItem {
  name: string;
  fullName: string;
  wage: number;
  bonus: number;
  total: number;
  ticketsDone: number;
}

export interface TechPieItem {
  name: string;
  value: number;
  tickets: number;
  color: string;
}

interface Props {
  chartData: TechChartItem[];
  pieData: TechPieItem[];
  totalPayroll: number;
}

export function FinancePayrollCharts({ chartData, pieData, totalPayroll }: Props) {
  const formatCurrencyY = (v: number) => (v >= 1000000 ? `${(v / 1000000).toFixed(0)}Tr` : `${v}`);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-sans">
      {/* COMPOSED BAR & LINE CHART */}
      <div className="lg:col-span-8 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-600" />
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            So Sánh Thu Nhập (Lương + Thưởng) &amp; Năng Suất KTV
          </h4>
        </div>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
              <YAxis yAxisId="left" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatCurrencyY} />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}m`} />
              <RechartsTooltip
                content={({ active, payload }: any) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl text-xs border border-slate-700">
                        <p className="font-bold border-b border-slate-700 pb-1 mb-1.5">{d.fullName}</p>
                        <div className="space-y-1 font-mono">
                          <div className="text-slate-300">Lương ca: {d.wage.toLocaleString('vi-VN')}₫</div>
                          <div className="text-amber-400">Thưởng: {d.bonus.toLocaleString('vi-VN')}₫</div>
                          <div className="text-purple-300 font-bold">Tổng nhận: {d.total.toLocaleString('vi-VN')}₫</div>
                          <div className="text-emerald-400 font-bold pt-1 border-t border-slate-800">
                            Số máy xử lý: {d.ticketsDone} thiết bị
                          </div>
      {/* DONUT SHARE OF PAYROLL */}
      <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex flex-col justify-between items-center text-center space-y-3">
        <div className="w-full text-left">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Tỷ Trọng Quỹ Lương
          </h4>
          <p className="text-[11px] text-slate-400">Phân bổ chi trả giữa các kỹ thuật viên</p>
        </div>

        <div className="w-full h-44 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`tech-pie-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip
                content={({ active, payload }: any) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    const percent = totalPayroll > 0 ? Math.round((d.value / totalPayroll) * 100) : 0;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-mono">
                        <p className="font-bold border-b border-slate-700 pb-1 mb-1 font-sans">{d.name}</p>
                        <div className="text-purple-300 font-bold">{d.value.toLocaleString('vi-VN')}₫ ({percent}%)</div>
                        <div className="text-emerald-400 text-[11px]">Xử lý: {d.tickets} máy</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Mini Legend List */}
        <div className="w-full space-y-1.5 text-xs font-mono">
          {pieData.map((ktv) => {
            const percent = totalPayroll > 0 ? Math.round((ktv.value / totalPayroll) * 100) : 0;
            return (
              <div key={ktv.name} className="flex items-center justify-between p-1.5 bg-slate-50 rounded-xl">
                <span className="flex items-center gap-1.5 text-slate-700 font-sans truncate font-medium">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ktv.color }} />
                  {ktv.name}
                </span>
                <span className="font-bold text-slate-900">{percent}%</span>
              </div>
            );
          })}
        </div>
      </div>

                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} iconType="circle" />
              <Bar yAxisId="left" dataKey="wage" name="Lương Ca" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={18} />
              <Bar yAxisId="left" dataKey="bonus" name="Thưởng KPI" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={18} />
              <Line yAxisId="right" type="monotone" dataKey="ticketsDone" name="Máy Xử Lý" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
