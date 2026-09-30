'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Users } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts';

export interface TechSummary {
  name: string;
  totalWage: number;
  totalBonus: number;
  shiftsCount: number;
  ticketsDone: number;
}

interface Props {
  technicianPayrollSummary: TechSummary[];
  timeframeLabel: string;
}

export function FinancePayrollTab({ technicianPayrollSummary, timeframeLabel }: Props) {
  const chartData = technicianPayrollSummary.map((ktv) => ({
    name: ktv.name.split(' ').slice(-1)[0] || ktv.name,
    fullName: ktv.name,
    wage: ktv.totalWage,
    bonus: ktv.totalBonus,
    total: ktv.totalWage + ktv.totalBonus,
    ticketsDone: ktv.ticketsDone,
  }));

  return (
    <div className="space-y-4 font-sans">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Bảng Tổng Hợp Chi Trả Tiền Công &amp; Lương KTV
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Thống kê số ca trực, số máy xử lý &amp; tổng quỹ lương đã chi trong {timeframeLabel}
          </p>
        </div>
        <Link
          href="/tien-cong"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5"
        >
          <span>Bảng Kê Chi Tiết Tiền Công</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Recharts Visual */}
      {technicianPayrollSummary.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Biểu Đồ Thu Nhập &amp; Sản Lượng KTV ({timeframeLabel})
            </h4>
          </div>
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => (v >= 1000000 ? `${(v / 1000000).toFixed(0)}Tr` : `${v}`)}
                />
                <RechartsTooltip
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-700">
                          <p className="font-bold border-b border-slate-700 pb-1 mb-1.5">{d.fullName}</p>
                          <div className="space-y-1 font-mono">
                            <div className="text-slate-300">Lương ca: {d.wage.toLocaleString('vi-VN')}₫</div>
                            <div className="text-amber-400">Thưởng: {d.bonus.toLocaleString('vi-VN')}₫</div>
                            <div className="text-emerald-400 font-bold">Tổng: {d.total.toLocaleString('vi-VN')}₫</div>
                            <div className="text-cyan-300 text-[11px]">Đã xử lý: {d.ticketsDone} thiết bị</div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} iconType="circle" />
                <Bar dataKey="wage" name="Lương Ca" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="bonus" name="Thưởng Hoàn Thành" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {technicianPayrollSummary.length === 0 ? (
          <div className="col-span-3 bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
            Không có ca trực nào được ghi nhận trong khoảng thời gian này.
          </div>
        ) : (
          technicianPayrollSummary.map((ktv) => {
            const totalPayout = ktv.totalWage + ktv.totalBonus;

            return (
              <div key={ktv.name} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                      {ktv.name.slice(0, 1)}
                    </div>
                    <span className="font-bold text-sm text-slate-900">{ktv.name}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 font-mono">
                    {ktv.shiftsCount} CA
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-500">
                    <span>Lương cứng ca:</span>
                    <span>{ktv.totalWage.toLocaleString('vi-VN')}₫</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Thưởng hoàn thành:</span>
                    <span>{ktv.totalBonus.toLocaleString('vi-VN')}₫</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Số máy xử lý:</span>
                    <span>{ktv.ticketsDone} thiết bị</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100 text-sm">
                    <span>Tổng nhận:</span>
                    <span className="text-emerald-700 font-black">{totalPayout.toLocaleString('vi-VN')}₫</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
