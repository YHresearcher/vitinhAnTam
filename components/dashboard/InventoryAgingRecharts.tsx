'use client';

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Package } from 'lucide-react';

export interface InventoryStatusData {
  rts: number;
  qc: number;
  repair: number;
  sold: number;
  agingCount: number;
}

interface Props {
  inventoryData: InventoryStatusData;
  totalDevices: number;
}

export function InventoryAgingRecharts({ inventoryData, totalDevices }: Props) {
  const chartData = [
    { name: 'Sẵn Sàng Bán (RTS)', value: inventoryData.rts, color: '#10b981' },
    { name: 'Đang QC / Test', value: inventoryData.qc, color: '#f59e0b' },
    { name: 'Cần Sửa Chữa', value: inventoryData.repair, color: '#8b5cf6' },
    { name: 'Đã Bán & Xuất Kho', value: inventoryData.sold, color: '#3b82f6' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 font-sans flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-900">Trạng Thái &amp; Phân Bổ Kho Máy</h2>
        </div>
        <span className="text-sm font-mono font-black text-slate-900">{totalDevices} thiết bị</span>
      </div>

      <div className="w-full h-52 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }: any) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  const pct = totalDevices > 0 ? Math.round((d.value / totalDevices) * 100) : 0;
                  return (
                    <div className="bg-slate-900/95 text-white p-2.5 rounded-xl shadow-xl border border-slate-700 text-xs backdrop-blur-md">
                      <p className="font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                        {d.name}
                      </p>
                      <p className="text-slate-300 font-mono text-sm mt-0.5">
                        {d.value} máy ({pct}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend
              verticalAlign="bottom"
              wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {inventoryData.agingCount > 0 ? (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs">
          <span className="text-rose-700 font-medium">⚠️ Cảnh báo tồn lâu (&gt;30 ngày):</span>
          <span className="font-mono font-bold text-rose-800 bg-rose-200/60 px-2 py-0.5 rounded">
            {inventoryData.agingCount} máy cần thanh lý
          </span>
        </div>
      ) : (
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-700">
          <span>Tốc độ luân chuyển kho đạt tiêu chuẩn</span>
          <span className="font-bold">0 máy tồn trễ</span>
        </div>
      )}
    </div>
  );
}
