import { LedgerItem, FinancialSummaryData } from './types';
import { TechSummary } from './FinancePayrollTab';
import { InventoryItem, SparePart, LicenseKeyItem, ShiftLog } from '@/lib/supabase';

export function calculateFinancialSummary(
  timeframeLedgerItems: LedgerItem[],
  inventory: InventoryItem[],
  spareParts: SparePart[],
  licenseKeys: LicenseKeyItem[]
): FinancialSummaryData {
  let totalRevenue = 0;
  let totalExpense = 0;
  let collectedCash = 0;
  let uncollectedReceivable = 0;

  const stream = {
    machine: { rev: 0, cost: 0, profit: 0, count: 0 },
    ticket: { rev: 0, cost: 0, profit: 0, count: 0 },
    onsite: { rev: 0, cost: 0, profit: 0, count: 0 },
    key: { rev: 0, cost: 0, profit: 0, count: 0 },
    payroll: { expense: 0, count: 0 },
  };

  timeframeLedgerItems.forEach((tx) => {
    if (tx.type === 'income') {
      totalRevenue += tx.incomeAmount;
      totalExpense += tx.expenseAmount;
      if (tx.paymentStatus === 'paid') collectedCash += tx.incomeAmount;
      else if (tx.paymentStatus === 'partial') {
        collectedCash += Math.round(tx.incomeAmount * 0.4);
        uncollectedReceivable += Math.round(tx.incomeAmount * 0.6);
      } else uncollectedReceivable += tx.incomeAmount;

      if (tx.category === 'machine') {
        stream.machine.rev += tx.incomeAmount;
        stream.machine.cost += tx.expenseAmount;
        stream.machine.profit += tx.netProfit;
        stream.machine.count += 1;
      } else if (tx.category === 'ticket') {
        stream.ticket.rev += tx.incomeAmount;
        stream.ticket.cost += tx.expenseAmount;
        stream.ticket.profit += tx.netProfit;
        stream.ticket.count += 1;
      } else if (tx.category === 'onsite') {
        stream.onsite.rev += tx.incomeAmount;
        stream.onsite.cost += tx.expenseAmount;
        stream.onsite.profit += tx.netProfit;
        stream.onsite.count += 1;
      } else if (tx.category === 'key') {
        stream.key.rev += tx.incomeAmount;
        stream.key.cost += tx.expenseAmount;
        stream.key.profit += tx.netProfit;
        stream.key.count += 1;
      }
    } else if (tx.type === 'expense' && tx.category === 'payroll') {
      totalExpense += tx.expenseAmount;
      stream.payroll.expense += tx.expenseAmount;
      stream.payroll.count += 1;
    }
  });

  const netProfit = totalRevenue - totalExpense;
  const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;
  const roiRate = totalExpense > 0 ? Math.round((netProfit / totalExpense) * 100) : 0;

  const warehouseCapital = inventory
    .filter((i) => i.qc_status !== 'sold')
    .reduce((sum, i) => sum + (i.import_price || i.cost_price || 3200000), 0);
  const sparePartsCapital = spareParts.reduce((sum, p) => sum + (p.unit_cost || 0) * (p.quantity_in_stock || 1), 0);
  const keysCapital = licenseKeys
    .filter((k) => k.status === 'available')
    .reduce((sum, k) => sum + (k.import_price || 150000), 0);

  return {
    totalRevenue,
    totalExpense,
    netProfit,
    profitMargin,
    roiRate,
    collectedCash,
    uncollectedReceivable,
    totalAssetTiedCapital: warehouseCapital + sparePartsCapital + keysCapital,
    stream,
    totalOrdersCount: stream.machine.count + stream.ticket.count + stream.onsite.count + stream.key.count,
  };
}

export function calculateTechnicianPayroll(
  shiftLogs: ShiftLog[],
  periodStart: Date,
  periodEnd: Date
): TechSummary[] {
  const map: Record<string, TechSummary> = {};
  shiftLogs.forEach((s) => {
    const techName = s.technician_name || s.ktv_name || 'Kỹ thuật viên';
    const d = new Date(s.shift_date ? `${s.shift_date}T00:00:00` : new Date());
    if (d >= periodStart && d <= periodEnd) {
      if (!map[techName]) {
        map[techName] = { name: techName, totalWage: 0, totalBonus: 0, shiftsCount: 0, ticketsDone: 0 };
      }
      const bonus = s.bonus || s.bonus_amount || 0;
      map[techName].totalWage += s.base_wage || 0;
      map[techName].totalBonus += bonus;
      map[techName].shiftsCount += 1;
      map[techName].ticketsDone += s.tickets_completed || 0;
    }
  });
  return Object.values(map).sort((a, b) => b.totalWage + b.totalBonus - (a.totalWage + a.totalBonus));
}
