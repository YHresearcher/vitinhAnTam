'use client';

import { useMemo } from 'react';
import { useViTinhAnTamStore } from '@/lib/store';
import { TimeframeOption } from './types';
import { buildLedgerItems } from './financeHelpers';
import {
  calculateFinancialSummary,
  calculateTechnicianPayroll,
  calculateTimelineCashflow,
  calculateCategoryDistribution,
  calculateDebtAging,
} from './financeSummaryHelpers';

export function useFinancialData(timeframe: TimeframeOption) {
  const { inventory, tickets, onsiteDispatches, licenseKeys, spareParts, shiftLogs } = useViTinhAnTamStore();

  const { periodStart, periodEnd, timeframeLabel } = useMemo(() => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    let start: Date;
    let label = 'Tháng này';

    if (timeframe === 'today') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      label = 'Hôm nay';
    } else if (timeframe === 'week') {
      const dow = (now.getDay() + 6) % 7;
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dow);
      label = 'Tuần này';
    } else if (timeframe === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      label = `Tháng ${now.getMonth() + 1}/${now.getFullYear()}`;
    } else if (timeframe === 'quarter') {
      start = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      label = `Quý ${Math.floor(now.getMonth() / 3) + 1}`;
    } else if (timeframe === 'year') {
      start = new Date(now.getFullYear(), 0, 1);
      label = `Năm ${now.getFullYear()}`;
    } else {
      start = new Date(2020, 0, 1);
      label = 'Toàn bộ';
    }
    return { periodStart: start, periodEnd: end, timeframeLabel: label };
  }, [timeframe]);

  const allLedgerItems = useMemo(() => {
    return buildLedgerItems(inventory, tickets, onsiteDispatches, licenseKeys, shiftLogs);
  }, [inventory, tickets, onsiteDispatches, licenseKeys, shiftLogs]);

  const timeframeLedgerItems = useMemo(() => {
    return allLedgerItems.filter((tx) => {
      const d = new Date(tx.date);
      return d >= periodStart && d <= periodEnd;
    });
  }, [allLedgerItems, periodStart, periodEnd]);

  const financialSummary = useMemo(() => {
    return calculateFinancialSummary(timeframeLedgerItems, inventory, spareParts, licenseKeys);
  }, [timeframeLedgerItems, inventory, spareParts, licenseKeys]);

  const debtCustomersList = useMemo(() => {
    return timeframeLedgerItems.filter((tx) => tx.paymentStatus === 'unpaid' || tx.paymentStatus === 'partial');
  }, [timeframeLedgerItems]);

  const technicianPayrollSummary = useMemo(() => {
    return calculateTechnicianPayroll(shiftLogs, periodStart, periodEnd);
  }, [shiftLogs, periodStart, periodEnd]);

  const timelineCashflowData = useMemo(() => {
    return calculateTimelineCashflow(timeframeLedgerItems, timeframe);
  }, [timeframeLedgerItems, timeframe]);

  const categoryDistributionData = useMemo(() => {
    return calculateCategoryDistribution(timeframeLedgerItems);
  }, [timeframeLedgerItems]);

  const debtAgingData = useMemo(() => {
    return calculateDebtAging(debtCustomersList);
  }, [debtCustomersList]);

  return {
    timeframeLabel,
    timeframeLedgerItems,
    financialSummary,
    debtCustomersList,
    technicianPayrollSummary,
    timelineCashflowData,
    categoryDistributionData,
    debtAgingData,
  };
}
