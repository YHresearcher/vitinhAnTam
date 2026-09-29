export type TimeframeOption = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all' | 'custom';

export interface LedgerItem {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: 'machine' | 'ticket' | 'onsite' | 'key' | 'payroll' | 'part_purchase';
  categoryLabel: string;
  code: string;
  title: string;
  partyName: string;
  partyPhone?: string;
  incomeAmount: number;
  expenseAmount: number;
  netProfit: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid' | 'transferred';
  paymentMethod: 'Tiền mặt' | 'Chuyển khoản' | 'Công nợ' | 'Chưa thanh toán';
  notes?: string;
}

export interface PillarStreamData {
  machine: { rev: number; cost: number; profit: number; count: number };
  ticket: { rev: number; cost: number; profit: number; count: number };
  onsite: { rev: number; cost: number; profit: number; count: number };
  key: { rev: number; cost: number; profit: number; count: number };
  payroll: { expense: number; count: number };
}

export interface FinancialSummaryData {
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
  profitMargin: number;
  roiRate: number;
  collectedCash: number;
  uncollectedReceivable: number;
  totalAssetTiedCapital: number;
  stream: PillarStreamData;
  totalOrdersCount: number;
}
