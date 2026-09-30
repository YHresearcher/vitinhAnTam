'use client';

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export interface RevenuePillar {
  name: string;
  value: number;
  cost: number;
  profit: number;
  count: number;
  color: string;
}

interface Props {
  data: RevenuePillar[];
  totalRevenue: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload as RevenuePillar;
    const margin = item.value > 0 ? Math.round((item.profit / item.value) * 100) : 0;

    return (
      <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs backdrop-blur-md">
        <p className="font-bold text-slate-200 border-b border-slate-700 pb-1 mb-1.5 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
          {item.name}
        </p>
        <div className="space-y-1 font-mono">
          <div className="flex justify-between gap-4 text-slate-300">
            <span>Sản lượng:</span>
            <span className="font-bold text-white">{item.count}</span>
          </div>
          <div className="flex justify-between gap-4 text-emerald-400">
            <span>Doanh thu:</span>
            <span className="font-bold">{item.value.toLocaleString('vi-VN')}₫</span>
          </div>
          <div className="flex justify-between gap-4 text-cyan-300 pt-1 border-t border-slate-800">
            <span>Lợi nhuận gộp:</span>
            <span className="font-bold">+{item.profit.toLocaleString('vi-VN')}₫ ({margin}%)</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function RevenuePillarsDonutChart({ data, totalRevenue }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 font-sans flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Cơ Cấu Doanh Thu 4 Trụ Cột</h2>
          <p className="text-xs text-slate-500 mt-0.5">Phân bổ nguồn thu theo nghiệp vụ</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 block font-medium">Tổng Thu</span>
          <span className="text-sm font-black font-mono text-slate-900">
            {totalRevenue.toLocaleString('vi-VN')}₫
          </span>
        </div>
      </div>

      <div className="w-full h-64 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend
              verticalAlign="bottom"
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
