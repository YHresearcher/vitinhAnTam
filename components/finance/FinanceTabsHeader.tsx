'use client';

import React from 'react';
import { Download, Printer, PieChart as PieChartIcon, FileText, User, AlertCircle } from 'lucide-react';

interface Props {
  activeTab: 'overview' | 'ledger' | 'payroll' | 'debt';
  onTabChange: (t: 'overview' | 'ledger' | 'payroll' | 'debt') => void;
  ledgerCount: number;
  debtCount: number;
  onExportCSV: () => void;
}

export function FinanceTabsHeader({ activeTab, onTabChange, ledgerCount, debtCount, onExportCSV }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
      <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-xl">
        <button
          onClick={() => onTabChange('overview')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'overview'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <PieChartIcon className="w-3.5 h-3.5" />
          <span>Cơ Cấu 4 Mảng</span>
        </button>

        <button
          onClick={() => onTabChange('ledger')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'ledger'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Sổ Quỹ Thu - Chi ({ledgerCount})</span>
        </button>

        <button
          onClick={() => onTabChange('payroll')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'payroll'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Chi Tiền Công KTV</span>
        </button>

        <button
          onClick={() => onTabChange('debt')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'debt'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Công Nợ Khách ({debtCount})</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-2xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Xuất Excel</span>
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-2xs"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>In Phiếu</span>
        </button>
      </div>
    </div>
  );
}
