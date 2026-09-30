import { LedgerItem, FinancialSummaryData, TimeframeOption } from './types';
import { TechSummary } from './FinancePayrollTab';
import { InventoryItem, SparePart, LicenseKeyItem, ShiftLog } from '@/lib/supabase';

export interface CashflowTimelinePoint {
  date: string;
  label: string;
  income: number;
  expense: number;
  profit: number;
}

export interface CategoryDistributionPoint {
  category: string;
  name: string;
  income: number;
  expense: number;
  netProfit: number;
  count: number;
  color: string;
}

export interface DebtAgingBucket {
  range: string;
  label: string;
  count: number;
  totalAmount: number;
  color: string;
}

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

export function calculateTimelineCashflow(
  items: LedgerItem[],
  timeframe: TimeframeOption
): CashflowTimelinePoint[] {
  const map: Record<string, { income: number; expense: number; profit: number; label: string }> = {};

  items.forEach((item) => {
    const d = new Date(item.date);
    let key = '';
    let label = '';

    if (isNaN(d.getTime())) return;

    if (timeframe === 'today') {
      const h = d.getHours();
      key = `${String(h).padStart(2, '0')}:00`;
      label = `${h}h00`;
    } else if (timeframe === 'week' || timeframe === 'month') {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      key = `${d.getFullYear()}-${month}-${day}`;
      label = `${day}/${month}`;
    } else {
      const month = String(d.getMonth() + 1).padStart(2, '0');
      key = `${d.getFullYear()}-${month}`;
      label = `T${d.getMonth() + 1}/${d.getFullYear().toString().slice(-2)}`;
    }

    if (!map[key]) {
      map[key] = { income: 0, expense: 0, profit: 0, label };
    }

    if (item.type === 'income') {
      map[key].income += item.incomeAmount;
      map[key].expense += item.expenseAmount;
      map[key].profit += item.netProfit;
    } else if (item.type === 'expense') {
      map[key].expense += item.expenseAmount;
      map[key].profit -= item.expenseAmount;
    }
  });

  const sortedKeys = Object.keys(map).sort();
  if (sortedKeys.length === 0) {
    return [
      { date: 'today', label: 'Hôm nay', income: 0, expense: 0, profit: 0 }
    ];
  }

  return sortedKeys.map((k) => ({
    date: k,
    label: map[k].label,
    income: map[k].income,
    expense: map[k].expense,
    profit: map[k].profit,
  }));
}

export function calculateCategoryDistribution(items: LedgerItem[]): CategoryDistributionPoint[] {
  const categoryConfig: Record<string, { name: string; color: string }> = {
    machine: { name: 'Bán Kho Máy', color: '#2563eb' },
    ticket: { name: 'Sửa Chữa Tiếp Nhận', color: '#10b981' },
    onsite: { name: 'Cứu Hộ Onsite', color: '#f59e0b' },
    key: { name: 'Key Win & Office', color: '#f43f5e' },
    payroll: { name: 'Tiền Công / Lương KTV', color: '#8b5cf6' },
    part_purchase: { name: 'Nhập Linh Kiện', color: '#64748b' },
  };

  const map: Record<string, { income: number; expense: number; netProfit: number; count: number }> = {};

  items.forEach((tx) => {
    const cat = tx.category || 'other';
    if (!map[cat]) {
      map[cat] = { income: 0, expense: 0, netProfit: 0, count: 0 };
    }
    if (tx.type === 'income') {
      map[cat].income += tx.incomeAmount;
      map[cat].expense += tx.expenseAmount;
      map[cat].netProfit += tx.netProfit;
      map[cat].count += 1;
    } else {
      map[cat].expense += tx.expenseAmount;
      map[cat].netProfit -= tx.expenseAmount;
      map[cat].count += 1;
    }
  });

  return Object.entries(map).map(([cat, val]) => {
    const cfg = categoryConfig[cat] || { name: cat, color: '#94a3b8' };
    return {
      category: cat,
      name: cfg.name,
      income: val.income,
      expense: val.expense,
      netProfit: val.netProfit,
      count: val.count,
      color: cfg.color,
    };
  }).sort((a, b) => (b.income + b.expense) - (a.income + a.expense));
}

export function calculateDebtAging(debtList: LedgerItem[]): DebtAgingBucket[] {
  const now = new Date().getTime();
  const buckets: Record<string, { count: number; totalAmount: number; label: string; color: string }> = {
    under7: { label: 'Dưới 7 ngày (An toàn)', count: 0, totalAmount: 0, color: '#10b981' },
    under15: { label: '7 - 14 ngày (Cần nhắc)', count: 0, totalAmount: 0, color: '#f59e0b' },
    under30: { label: '15 - 30 ngày (Theo dõi)', count: 0, totalAmount: 0, color: '#f97316' },
    over30: { label: 'Quá 30 ngày (Rủi ro cao)', count: 0, totalAmount: 0, color: '#ef4444' },
  };

  debtList.forEach((tx) => {
    const itemDate = new Date(tx.date).getTime();
    const diffDays = Math.max(0, Math.floor((now - itemDate) / (1000 * 60 * 60 * 24)));
    if (diffDays <= 7) {
      buckets.under7.count += 1;
      buckets.under7.totalAmount += tx.incomeAmount;
    } else if (diffDays <= 14) {
      buckets.under15.count += 1;
      buckets.under15.totalAmount += tx.incomeAmount;
    } else if (diffDays <= 30) {
      buckets.under30.count += 1;
      buckets.under30.totalAmount += tx.incomeAmount;
    } else {
      buckets.over30.count += 1;
      buckets.over30.totalAmount += tx.incomeAmount;
    }
  });

  return Object.entries(buckets).map(([range, val]) => ({
    range,
    label: val.label,
    count: val.count,
    totalAmount: val.totalAmount,
    color: val.color,
  }));
}
