'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Award, Clock, Wrench } from 'lucide-react';
import { FinancePayrollCharts } from './FinancePayrollCharts';

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

const TECH_PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export function FinancePayrollTab({ technicianPayrollSummary, timeframeLabel }: Props) {
  const totalPayroll = technicianPayrollSummary.reduce((sum, k) => sum + k.totalWage + k.totalBonus, 0);
  const totalShifts = technicianPayrollSummary.reduce((sum, k) => sum + k.shiftsCount, 0);
  const totalTickets = technicianPayrollSummary.reduce((sum, k) => sum + k.ticketsDone, 0);

  const chartData = technicianPayrollSummary.map((ktv) => ({
    name: ktv.name.split(' ').slice(-1)[0] || ktv.name,
    fullName: ktv.name,
    wage: ktv.totalWage,
    bonus: ktv.totalBonus,
    total: ktv.totalWage + ktv.totalBonus,
    ticketsDone: ktv.ticketsDone,
  }));

  const pieData = technicianPayrollSummary.map((ktv, idx) => ({
    name: ktv.name,
    value: ktv.totalWage + ktv.totalBonus,
    tickets: ktv.ticketsDone,
    color: TECH_PIE_COLORS[idx % TECH_PIE_COLORS.length],
  }));

  const formatCurrencyY = (v: number) => (v >= 1000000 ? `${(v / 1000000).toFixed(0)}Tr` : `${v}`);

  return (
    <div className="space-y-5 font-sans">
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
            Bảng Tổng Hợp Chi Trả Tiền Công &amp; Lương KTV
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Thống kê số ca trực, số máy xử lý &amp; tổng quỹ lương đã chi trong {timeframeLabel}
          </p>
        </div>
        <Link
          href="/tien-cong"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>Bảng Kê Chi Tiết Tiền Công</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* KPI STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Tổng Quỹ Lương KTV</div>
            <div className="text-base font-black text-purple-900 font-mono">{totalPayroll.toLocaleString('vi-VN')}₫</div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Tổng Ca Trực Thực Hiện</div>
            <div className="text-base font-black text-blue-900 font-mono">{totalShifts} Ca Trực</div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Thiết Bị Đã Hoàn Tất</div>
            <div className="text-base font-black text-emerald-900 font-mono">{totalTickets} Máy</div>
          </div>
        </div>
      </div>

      {/* VISUAL RECHARTS SECTION: COMPOSED BAR + PIE */}
      {technicianPayrollSummary.length > 0 && (
        <FinancePayrollCharts
          chartData={chartData}
          pieData={pieData}
          totalPayroll={totalPayroll}
        />
      )}

      {/* TECH SUMMARY CARDS */}
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
