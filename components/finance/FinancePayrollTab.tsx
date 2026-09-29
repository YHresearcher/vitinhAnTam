'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

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
