'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  typeFilter: 'all' | 'income' | 'expense';
  onTypeFilterChange: (v: 'all' | 'income' | 'expense') => void;
  catFilter: string;
  onCatFilterChange: (v: string) => void;
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
}

export function FinanceLedgerFilter({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  catFilter,
  onCatFilterChange,
  statusFilter,
  onStatusFilterChange,
}: Props) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
      <div className="relative w-full md:w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm mã phiếu, khách hàng, KTV..."
          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <select
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value as any)}
          className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
        >
          <option value="all">Tất cả Thu / Chi</option>
          <option value="income">Khoản Thu (+)</option>
          <option value="expense">Khoản Chi (-)</option>
        </select>
        <select
          value={catFilter}
          onChange={(e) => onCatFilterChange(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
        >
          <option value="all">Tất cả mảng</option>
          <option value="machine">Kho Máy</option>
          <option value="ticket">Sửa Chữa</option>
          <option value="onsite">Cứu Hộ Onsite</option>
          <option value="key">Key Win/Office</option>
          <option value="payroll">Tiền Công KTV</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="paid">Đã thanh toán đủ</option>
          <option value="partial">Tạm ứng / Còn nợ</option>
          <option value="unpaid">Chưa thu tiền</option>
        </select>
      </div>
    </div>
  );
}
