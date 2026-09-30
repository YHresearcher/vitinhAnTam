'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Users } from 'lucide-react';

export interface TechWorkloadPoint {
  name: string;
  completed: number;
  inProgress: number;
  isOutsourced?: boolean;
}

interface Props {
  data: TechWorkloadPoint[];
}

export function TechnicianWorkloadRecharts({ data }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 font-sans flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-600" />
          <h2 className="text-sm font-bold text-slate-900">Phân Bổ Ca Trực &amp; Năng Suất KTV</h2>
        </div>
        <span className="text-[11px] text-slate-500 font-medium">{data.length} nhân sự</span>
      </div>

      <div className="w-full h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
            <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              content={({ active, payload }: any) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-slate-900/95 text-white p-2.5 rounded-xl shadow-xl border border-slate-700 text-xs backdrop-blur-md">
                      <p className="font-bold flex items-center gap-1.5">
                        {d.name}
                        {d.isOutsourced && (
                          <span className="text-[9px] bg-amber-500 text-slate-900 px-1 py-0.2 rounded font-bold">
                            Thuê ngoài
                          </span>
                        )}
                      </p>
                      <div className="space-y-1 font-mono mt-1 text-[11px]">
                        <div className="text-emerald-400">Hoàn tất: {d.completed} máy</div>
                        <div className="text-purple-400">Đang xử lý: {d.inProgress} máy</div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} iconType="circle" />
            <Bar dataKey="completed" name="Đã Nghiệm Thu" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16} />
            <Bar dataKey="inProgress" name="Đang Xử Lý" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Tự động cân bằng khối lượng công việc</span>
        <span className="text-blue-600 font-semibold">Theo dõi real-time</span>
      </div>
    </div>
  );
}
