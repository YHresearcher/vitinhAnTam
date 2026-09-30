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
  Cell,
} from 'recharts';
import { Clock, AlertTriangle, CheckCircle2, Flame } from 'lucide-react';

export interface SlaHealthData {
  overdue: number;
  nearDeadline: number;
  onTrack: number;
  readyDeliver: number;
  completed: number;
}

interface Props {
  slaData: SlaHealthData;
}

export function SlaHealthDashboardChart({ slaData }: Props) {
  const chartData = [
    { name: 'Quá Hạn', count: slaData.overdue, color: '#e11d48', desc: 'Cần can thiệp gấp' },
    { name: 'Gần Hạn (24h)', count: slaData.nearDeadline, color: '#f59e0b', desc: 'Đang đếm ngược' },
    { name: 'Đang Xử Lý', count: slaData.onTrack, color: '#3b82f6', desc: 'Đúng tiến độ' },
    { name: 'Chờ Giao', count: slaData.readyDeliver, color: '#10b981', desc: 'Đã hoàn tất QC' },
    { name: 'Nghiệm Thu', count: slaData.completed, color: '#64748b', desc: 'Đã bàn giao khách' },
  ];

  const totalActive = slaData.overdue + slaData.nearDeadline + slaData.onTrack + slaData.readyDeliver;
  const onTrackRate = totalActive > 0 ? Math.round(((totalActive - slaData.overdue) / totalActive) * 100) : 100;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 font-sans flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Tiến Độ &amp; Sức Khỏe SLA Dịch Vụ</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Giám sát thời gian hoàn tất ca sửa chữa</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[11px] text-slate-500 font-medium">Tỷ lệ đúng hạn:</span>
          <span
            className={`font-mono font-bold text-xs ${
              onTrackRate >= 90 ? 'text-emerald-600' : onTrackRate >= 70 ? 'text-amber-600' : 'text-rose-600'
            }`}
          >
            {onTrackRate}%
          </span>
        </div>
      </div>

      <div className="w-full h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
            <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              content={({ active, payload }: any) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-slate-900/95 text-white p-2.5 rounded-xl shadow-xl border border-slate-700 text-xs backdrop-blur-md">
                      <p className="font-bold">{d.name}</p>
                      <p className="text-slate-300 font-mono text-sm mt-0.5">{d.count} thiết bị</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{d.desc}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={28}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
        <div className="bg-rose-50/70 p-2 rounded-xl border border-rose-100">
          <div className="text-[10px] text-rose-600 font-semibold">Quá Hạn</div>
          <div className="text-base font-black font-mono text-rose-700">{slaData.overdue}</div>
        </div>
        <div className="bg-amber-50/70 p-2 rounded-xl border border-amber-100">
          <div className="text-[10px] text-amber-700 font-semibold">Cần Giao 24h</div>
          <div className="text-base font-black font-mono text-amber-800">{slaData.nearDeadline}</div>
        </div>
        <div className="bg-emerald-50/70 p-2 rounded-xl border border-emerald-100">
          <div className="text-[10px] text-emerald-700 font-semibold">Đã Xong Chờ Giao</div>
          <div className="text-base font-black font-mono text-emerald-800">{slaData.readyDeliver}</div>
        </div>
      </div>
    </div>
  );
}
