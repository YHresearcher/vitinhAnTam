'use client';

import React from 'react';
import { DollarSign } from 'lucide-react';
import { TimeframeOption } from './types';

interface Props {
  timeframe: TimeframeOption;
  onTimeframeChange: (t: TimeframeOption) => void;
}

export function FinanceHeader({ timeframe, onTimeframeChange }: Props) {
  const pills: { id: TimeframeOption; label: string }[] = [
    { id: 'today', label: 'Hôm nay' },
    { id: 'week', label: 'Tuần này' },
    { id: 'month', label: 'Tháng này' },
    { id: 'quarter', label: 'Quý này' },
    { id: 'year', label: 'Năm nay' },
    { id: 'all', label: 'Toàn bộ' },
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
      <div className="flex items-center gap-2">
        <span className="p-2 rounded-xl bg-blue-100 text-blue-700">
          <DollarSign className="w-5 h-5" strokeWidth={2.5} />
        </span>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Phân Hệ Quản Lý Tài Chính &amp; Doanh Thu
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Trung tâm dòng tiền tập trung, báo cáo lợi nhuận 4 mảng &amp; chi trả tiền công
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl">
        {pills.map((t) => (
          <button
            key={t.id}
            onClick={() => onTimeframeChange(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeframe === t.id
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
