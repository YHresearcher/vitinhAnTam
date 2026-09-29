'use client';

import React from 'react';
import { FinancialSummaryData } from './types';

interface Props {
  financialSummary: FinancialSummaryData;
  timeframeLabel: string;
}

export function FinanceOverviewTab({ financialSummary, timeframeLabel }: Props) {
  const { stream, totalRevenue } = financialSummary;

  const cards = [
    {
      title: '1. Bán Kho Máy',
      count: `${stream.machine.count} Máy`,
      badgeBg: 'bg-blue-100 text-blue-800',
      rev: stream.machine.rev,
      cost: stream.machine.cost,
      profit: stream.machine.profit,
    },
    {
      title: '2. Sửa Chữa Tiếp Nhận',
      count: `${stream.ticket.count} Phiếu`,
      badgeBg: 'bg-emerald-100 text-emerald-800',
      rev: stream.ticket.rev,
      cost: stream.ticket.cost,
      profit: stream.ticket.profit,
    },
    {
      title: '3. Cứu Hộ Onsite',
      count: `${stream.onsite.count} Ca`,
      badgeBg: 'bg-amber-100 text-amber-800',
      rev: stream.onsite.rev,
      cost: stream.onsite.cost,
      profit: stream.onsite.profit,
    },
    {
      title: '4. Key Win & Office',
      count: `${stream.key.count} Key`,
      badgeBg: 'bg-rose-100 text-rose-800',
      rev: stream.key.rev,
      cost: stream.key.cost,
      profit: stream.key.profit,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const margin = c.rev > 0 ? Math.round((c.profit / c.rev) * 100) : 0;
          return (
            <div key={c.title} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-700 uppercase">{c.title}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold font-mono ${c.badgeBg}`}>{c.count}</span>
              </div>
              <div className="text-xl font-black text-slate-900 font-mono">
                {c.rev.toLocaleString('vi-VN')}₫
              </div>
              <div className="pt-2.5 border-t border-slate-100 space-y-1 text-xs font-mono">
                <div className="flex justify-between text-slate-500">
                  <span>Giá vốn/Công:</span>
                  <span>{c.cost.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-700">
                  <span>Lãi gộp:</span>
                  <span>+{c.profit.toLocaleString('vi-VN')}₫ ({margin}%)</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Tỉ Trọng Doanh Thu ({timeframeLabel})</h3>
          <span className="text-xs text-slate-500 font-mono">Tổng: {totalRevenue.toLocaleString('vi-VN')}₫</span>
        </div>

        {totalRevenue > 0 ? (
          <div className="space-y-3">
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div style={{ width: `${(stream.machine.rev / totalRevenue) * 100}%` }} className="bg-blue-600 h-full" />
              <div style={{ width: `${(stream.ticket.rev / totalRevenue) * 100}%` }} className="bg-emerald-600 h-full" />
              <div style={{ width: `${(stream.onsite.rev / totalRevenue) * 100}%` }} className="bg-amber-500 h-full" />
              <div style={{ width: `${(stream.key.rev / totalRevenue) * 100}%` }} className="bg-rose-500 h-full" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600" /><span>Kho Máy ({Math.round((stream.machine.rev / totalRevenue) * 100)}%)</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /><span>Sửa Chữa ({Math.round((stream.ticket.rev / totalRevenue) * 100)}%)</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /><span>Cứu Hộ ({Math.round((stream.onsite.rev / totalRevenue) * 100)}%)</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /><span>Key ({Math.round((stream.key.rev / totalRevenue) * 100)}%)</span></div>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-xs text-slate-400">Chưa phát sinh doanh thu trong kỳ này.</div>
        )}
      </div>
    </div>
  );
}
