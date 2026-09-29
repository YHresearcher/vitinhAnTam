'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useViTinhAnTamStore } from '@/lib/store';
import { formatDateVN } from '@/lib/supabase';
import { TimeframeOption } from '@/components/finance/types';
import { useFinancialData } from '@/components/finance/useFinancialData';
import { FinanceHeader } from '@/components/finance/FinanceHeader';
import { FinanceKpiCards } from '@/components/finance/FinanceKpiCards';
import { FinanceTabsHeader } from '@/components/finance/FinanceTabsHeader';
import { FinanceOverviewTab } from '@/components/finance/FinanceOverviewTab';
import { FinanceWarrantyFundTab } from '@/components/finance/FinanceWarrantyFundTab';
import { FinanceLedgerTab } from '@/components/finance/FinanceLedgerTab';
import { FinancePayrollTab } from '@/components/finance/FinancePayrollTab';
import { FinanceDebtTab } from '@/components/finance/FinanceDebtTab';

export default function TaiChinhPage() {
  const { canAccessPayroll, warrantyProvisions } = useViTinhAnTamStore();

  if (!canAccessPayroll()) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-5">
          <div className="inline-block px-3 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-full uppercase">
            Bảo Mật Nội Bộ
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">Quyền Truy Cập Bị Giới Hạn</h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Phân hệ tài chính &amp; doanh thu chỉ dành cho Quản Trị Viên (Admin).
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg"
            >
              Đăng nhập bằng tài khoản Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<'overview' | 'warranty_fund' | 'ledger' | 'payroll' | 'debt'>('overview');
  const [timeframe, setTimeframe] = useState<TimeframeOption>('month');

  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [ledgerCatFilter, setLedgerCatFilter] = useState<string>('all');
  const [ledgerStatusFilter, setLedgerStatusFilter] = useState<string>('all');

  const {
    timeframeLabel,
    timeframeLedgerItems,
    financialSummary,
    debtCustomersList,
    technicianPayrollSummary,
  } = useFinancialData(timeframe);

  const filteredLedgerList = useMemo(() => {
    return timeframeLedgerItems.filter((item) => {
      if (ledgerTypeFilter !== 'all' && item.type !== ledgerTypeFilter) return false;
      if (ledgerCatFilter !== 'all' && item.category !== ledgerCatFilter) return false;
      if (ledgerStatusFilter !== 'all' && item.paymentStatus !== ledgerStatusFilter) return false;

      if (ledgerSearch.trim()) {
        const q = ledgerSearch.toLowerCase().trim();
        const matchCode = item.code.toLowerCase().includes(q);
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchParty = item.partyName.toLowerCase().includes(q) || (item.partyPhone && item.partyPhone.includes(q));
        if (!matchCode && !matchTitle && !matchParty) return false;
      }
      return true;
    });
  }, [timeframeLedgerItems, ledgerTypeFilter, ledgerCatFilter, ledgerStatusFilter, ledgerSearch]);

  const handleExportCSV = () => {
    const headers = 'Mã Giao Dịch,Ngày,Loại,Nghiệp Vụ,Nội Dung,Đối Tác,Thu Vào,Chi Ra,Lãi Ròng\n';
    const rows = filteredLedgerList
      .map((tx) => `"${tx.code}","${formatDateVN(tx.date)}","${tx.type}","${tx.categoryLabel}","${tx.title.replace(/"/g, '""')}","${tx.partyName.replace(/"/g, '""')}",${tx.incomeAmount},${tx.expenseAmount},${tx.netProfit}`)
      .join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `so-quy-tai-chinh-${timeframe}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      <FinanceHeader timeframe={timeframe} onTimeframeChange={setTimeframe} />
      <FinanceKpiCards financialSummary={financialSummary} timeframeLabel={timeframeLabel} />
      <FinanceTabsHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        ledgerCount={filteredLedgerList.length}
        debtCount={debtCustomersList.length}
        warrantyCount={warrantyProvisions.length}
        onExportCSV={handleExportCSV}
      />

      {activeTab === 'overview' && (
        <FinanceOverviewTab
          financialSummary={financialSummary}
          timeframeLabel={timeframeLabel}
          onOpenWarrantyFund={() => setActiveTab('warranty_fund')}
        />
      )}
      {activeTab === 'warranty_fund' && <FinanceWarrantyFundTab />}
      {activeTab === 'ledger' && (
        <FinanceLedgerTab
          ledgerList={filteredLedgerList}
          search={ledgerSearch}
          onSearchChange={setLedgerSearch}
          typeFilter={ledgerTypeFilter}
          onTypeFilterChange={setLedgerTypeFilter}
          catFilter={ledgerCatFilter}
          onCatFilterChange={setLedgerCatFilter}
          statusFilter={ledgerStatusFilter}
          onStatusFilterChange={setLedgerStatusFilter}
          collectedCash={financialSummary.collectedCash}
        />
      )}
      {activeTab === 'payroll' && (
        <FinancePayrollTab
          technicianPayrollSummary={technicianPayrollSummary}
          timeframeLabel={timeframeLabel}
        />
      )}
      {activeTab === 'debt' && <FinanceDebtTab debtCustomersList={debtCustomersList} />}
    </div>
  );
}
