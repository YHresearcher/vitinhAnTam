'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useViTinhAnTamStore } from '@/lib/store';
import { ThermalLabelModal } from '@/components/admin/ThermalLabelModal';
import {
  FinancialDrilldownModal,
  FinancialTransactionItem,
} from '@/components/admin/FinancialDrilldownModal';
import { CrmAlertsPanel } from '@/components/admin/CrmAlertsPanel';
import { InventoryItem, OnsiteDispatch } from '@/lib/supabase';
import { InteractiveCashflowChart } from '@/components/dashboard/InteractiveCashflowChart';
import { RevenuePillarsDonutChart } from '@/components/dashboard/RevenuePillarsDonutChart';
import { SlaHealthDashboardChart } from '@/components/dashboard/SlaHealthDashboardChart';
import { TechnicianWorkloadRecharts } from '@/components/dashboard/TechnicianWorkloadRecharts';
import { InventoryAgingRecharts } from '@/components/dashboard/InventoryAgingRecharts';
import { message } from 'antd';

export default function DashboardPage() {
  const {
    inventory,
    tickets,
    onsiteDispatches,
    licenseKeys,
    spareParts,
    customers,
    users,
    currentUser,
    updateDispatchStatus,
    updateQcStatus,
    pendingOrders,
    confirmPendingOrder,
  } = useViTinhAnTamStore();

  // Doanh thu / dòng tiền CHỈ dành cho Admin
  const isAdmin = currentUser.role === 'admin';

  const [selectedItemForLabel, setSelectedItemForLabel] = useState<InventoryItem | null>(null);
  const [cashflowTimeframe, setCashflowTimeframe] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('month');
  const [isDrilldownOpen, setIsDrilldownOpen] = useState(false);
  const [activeListTab, setActiveListTab] = useState<'tickets' | 'onsite' | 'qc'>('tickets');

// Helper tính số ngày tồn kho của thiết bị (thuần túy theo timestamp)
function calculateDaysInStock(item: InventoryItem, nowTimestamp: number): number {
  const dateStr = item.import_date || item.created_at;
  if (!dateStr) return 0;
  const itemDate = new Date(dateStr).getTime();
  if (Number.isNaN(itemDate)) return 0;
  return Math.max(0, Math.floor((nowTimestamp - itemDate) / (1000 * 60 * 60 * 24)));
}

  // ==========================================
  // THỐNG KÊ THIẾT BỊ & CẢNH BÁO TỒN KHO LÂU
  // ==========================================
  const nowTimestamp = Date.now();

  const deviceStats = useMemo(() => {
    const total = inventory.length;
    const rts = inventory.filter((i) => i.qc_status === 'ready_to_sell').length;
    const qc = inventory.filter((i) => i.qc_status === 'testing' || i.qc_status === 'pending_test').length;
    const sold = inventory.filter((i) => i.qc_status === 'sold').length;
    const other = Math.max(0, total - rts - qc - sold);

    // Aging alerts: 50-55d Yellow, 56-60d+ Red
    const agingYellowItems = inventory.filter((i) => {
      const days = calculateDaysInStock(i, nowTimestamp);
      return days >= 50 && days < 56 && i.qc_status !== 'sold';
    });
    const agingRedItems = inventory.filter((i) => {
      const days = calculateDaysInStock(i, nowTimestamp);
      return days >= 56 && i.qc_status !== 'sold';
    });
    const allAgingItems = [...agingRedItems, ...agingYellowItems].sort(
      (a, b) => calculateDaysInStock(b, nowTimestamp) - calculateDaysInStock(a, nowTimestamp)
    );
    const agingCapital = allAgingItems.reduce(
      (sum, i) => sum + (i.import_price || i.cost_price || 0),
      0
    );

    // Phân bổ thương hiệu
    const dellCount = inventory.filter((i) => (i.brand || '').toLowerCase().includes('dell')).length;
    const hpCount = inventory.filter((i) => (i.brand || '').toLowerCase().includes('hp')).length;
    const thinkpadCount = inventory.filter(
      (i) =>
        (i.brand || '').toLowerCase().includes('lenovo') ||
        (i.brand || '').toLowerCase().includes('thinkpad')
    ).length;
    const otherBrandCount = Math.max(0, total - dellCount - hpCount - thinkpadCount);

    // Tổng giá trị kho (ước tính)
    const inventoryValue = inventory
      .filter((i) => i.qc_status !== 'sold')
      .reduce((sum, i) => sum + (i.price || i.retail_price || 4500000), 0);
    const inventoryCapital = inventory
      .filter((i) => i.qc_status !== 'sold')
      .reduce((sum, i) => sum + (i.import_price || i.cost_price || 3200000), 0);

    return {
      total,
      rts,
      qc,
      sold,
      other,
      agingYellowItems,
      agingRedItems,
      allAgingItems,
      agingCapital,
      dellCount,
      hpCount,
      thinkpadCount,
      otherBrandCount,
      inventoryValue,
      inventoryCapital,
    };
  }, [inventory]);

  // QUẢN LÝ DOANH THU & PHÂN TÍCH CHUYÊN SÂU (FINANCIAL DRILL-DOWN)
  const financialAnalytics = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dow = (startOfDay.getDay() + 6) % 7;
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - dow);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
    const startOfQuarter = new Date(now.getFullYear(), quarterMonth, 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    let periodStart = startOfMonth;
    let timeframeLabel = 'Tháng này';

    if (cashflowTimeframe === 'day') {
      periodStart = startOfDay; timeframeLabel = 'Hôm nay';
    } else if (cashflowTimeframe === 'week') {
      periodStart = startOfWeek; timeframeLabel = 'Tuần này';
    } else if (cashflowTimeframe === 'quarter') {
      periodStart = startOfQuarter; timeframeLabel = `Quý ${Math.floor(now.getMonth() / 3) + 1}/${now.getFullYear()}`;
    } else if (cashflowTimeframe === 'year') {
      periodStart = startOfYear; timeframeLabel = `Năm ${now.getFullYear()}`;
    }

    const parse = (v?: string) => (v && !Number.isNaN(new Date(v).getTime()) ? new Date(v) : null);
    let mRev = 0, mCost = 0, mCount = 0, tRev = 0, tCost = 0, tCount = 0;
    let kRev = 0, kCost = 0, kCount = 0, pRev = 0, pCost = 0, pCount = 0;
    const txList: FinancialTransactionItem[] = [];

    // 1. Máy tính đã bán
    inventory.forEach((item) => {
      const soldDate = parse(item.handover_date || item.created_at);
      if (item.qc_status === 'sold' && soldDate && soldDate >= periodStart) {
        const rev = item.price ?? item.retail_price ?? 0;
        const cost = item.import_price ?? item.cost_price ?? 0;
        const profit = rev - cost;
        mRev += rev; mCost += cost; mCount += 1;
        txList.push({
          id: item.id,
          date: soldDate.toLocaleDateString('vi-VN'),
          title: `Bán ${item.device_model || item.model || item.brand} (${item.service_tag})`,
          category: 'machine',
          customerName: item.customer_name,
          cost, revenue: rev, profit, margin: rev > 0 ? Math.round((profit / rev) * 100) : 0,
        });
      }
    });

    // 2. Phiếu sửa chữa
    tickets.forEach((tck) => {
      const done = tck.status === 'completed' || tck.status === 'delivered';
      const tckDate = parse(tck.completed_at || tck.created_at);
      if (done && tckDate && tckDate >= periodStart) {
        const rev = tck.total_amount ?? tck.actual_cost ?? 0;
        const cost = Math.round(rev * 0.35);
        const profit = rev - cost;
        tRev += rev; tCost += cost; tCount += 1;
        txList.push({
          id: tck.id,
          date: tckDate.toLocaleDateString('vi-VN'),
          title: `Sửa ${tck.ticket_code} - ${tck.device_name}`,
          category: 'ticket',
          customerName: tck.customer_name,
          cost, revenue: rev, profit, margin: rev > 0 ? Math.round((profit / rev) * 100) : 0,
        });
      }
    });

    // 3. Key bản quyền
    (licenseKeys || []).forEach((key) => {
      const delivered = ['assigned', 'used', 'activated'].includes(key.status);
      const keyDate = parse(key.assigned_at || key.created_at);
      if (delivered && keyDate && keyDate >= periodStart) {
        const rev = key.unit_price ?? 350000;
        const cost = key.import_price ?? Math.round(rev * 0.55);
        const profit = rev - cost;
        kRev += rev; kCost += cost; kCount += 1;
        txList.push({
          id: key.id,
          date: keyDate.toLocaleDateString('vi-VN'),
          title: `Key ${key.category_name} (${key.license_code.slice(0, 8)}...)`,
          category: 'key',
          customerName: key.assigned_to_customer || key.customer_name,
          cost, revenue: rev, profit, margin: rev > 0 ? Math.round((profit / rev) * 100) : 0,
        });
      }
    });

    // 4. Linh kiện
    (spareParts || []).forEach((sp) => {
      if (sp.quantity_in_stock < 15) {
        const qty = Math.max(1, 15 - sp.quantity_in_stock);
        const rev = sp.unit_price * qty;
        const cost = (sp.unit_cost || Math.round(sp.unit_price * 0.7)) * qty;
        const profit = rev - cost;
        pRev += rev; pCost += cost; pCount += qty;
        txList.push({
          id: sp.id,
          date: new Date().toLocaleDateString('vi-VN'),
          title: `Linh kiện ${sp.part_name} (x${qty})`,
          category: 'part',
          cost, revenue: rev, profit, margin: rev > 0 ? Math.round((profit / rev) * 100) : 0,
        });
      }
    });

    const totIncome = mRev + tRev + kRev + pRev;
    const totExpense = mCost + tCost + kCost + pCost;
    const netProf = totIncome - totExpense;
    const pMargin = totIncome > 0 ? Math.round((netProf / totIncome) * 100) : 0;
    const roiRate = totExpense > 0 ? Math.round((netProf / totExpense) * 100) : (netProf > 0 ? 100 : 0);
    const getPct = (r: number) => (totIncome > 0 ? Math.round((r / totIncome) * 100) : 0);

    return {
      timeframeLabel,
      totalIncome: totIncome,
      totalExpense: totExpense,
      netProfit: netProf,
      profitMargin: pMargin,
      roi: roiRate,
      totalSalesCount: mCount + tCount + kCount + pCount,
      breakdown: {
        machines: { revenue: mRev, cost: mCost, profit: mRev - mCost, count: mCount, percent: getPct(mRev) },
        tickets: { revenue: tRev, cost: tCost, profit: tRev - tCost, count: tCount, percent: getPct(tRev) },
        keys: { revenue: kRev, cost: kCost, profit: kRev - kCost, count: kCount, percent: getPct(kRev) },
        parts: { revenue: pRev, cost: pCost, profit: pRev - pCost, count: pCount, percent: getPct(pRev) },
      },
      transactions: txList,
    };
  }, [inventory, tickets, licenseKeys, spareParts, cashflowTimeframe]);

  // QUẢN LÝ DOANH THU — tính THẬT từ giá đầu vào & giá bán
  // đã nhập ở các màn hình nhập kho (thiết bị / key / phiếu sửa chữa).
  const cashflowData = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dow = (startOfDay.getDay() + 6) % 7; // 0 = Thứ 2
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - dow);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const quarterMonth = Math.floor(now.getMonth() / 3) * 3;

    const dLabel = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}`;
    const WEEK_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    let buckets: { start: Date; end: Date; label: string; date: string }[] = [];

    switch (cashflowTimeframe) {
      case 'day':
        buckets = Array.from({ length: 8 }, (_, i) => {
          const h = i * 3;
          const s = new Date(startOfDay);
          s.setHours(h, 0, 0, 0);
          const e = new Date(startOfDay);
          e.setHours(h + 3, 0, 0, 0);
          return { start: s, end: e, label: `${String(h).padStart(2, '0')}h`, date: dLabel(startOfDay) };
        });
        break;
      case 'week':
        buckets = Array.from({ length: 7 }, (_, i) => {
          const s = new Date(startOfWeek);
          s.setDate(startOfWeek.getDate() + i);
          const e = new Date(s);
          e.setDate(s.getDate() + 1);
          return { start: s, end: e, label: WEEK_LABELS[i], date: dLabel(s) };
        });
        break;
      case 'month':
        buckets = Array.from({ length: 5 }, (_, i) => {
          const s = new Date(startOfMonth);
          s.setDate(startOfMonth.getDate() + i * 7);
          const e = new Date(s);
          e.setDate(s.getDate() + 7);
          return { start: s, end: e, label: `Tuần ${i + 1}`, date: dLabel(s) };
        });
        break;
      case 'quarter':
        buckets = Array.from({ length: 3 }, (_, i) => {
          const s = new Date(now.getFullYear(), quarterMonth + i, 1);
          const e = new Date(now.getFullYear(), quarterMonth + i + 1, 1);
          return {
            start: s,
            end: e,
            label: `Tháng ${quarterMonth + i + 1}`,
            date: `${quarterMonth + i + 1}/${now.getFullYear()}`,
          };
        });
        break;
      case 'year':
        buckets = Array.from({ length: 12 }, (_, i) => {
          const s = new Date(now.getFullYear(), i, 1);
          const e = new Date(now.getFullYear(), i + 1, 1);
          return { start: s, end: e, label: `T${i + 1}`, date: `${i + 1}/${now.getFullYear()}` };
        });
        break;
      default:
        buckets = [];
    }

    const parse = (value?: string): Date | null => {
      if (!value) return null;
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? null : d;
    };

    type CashflowEvent = { at: Date | null; income: number; expense: number };
    const events: CashflowEvent[] = [];

    // THIẾT BỊ: giá đầu vào = vốn nhập khi về kho; giá bán = doanh thu khi đã bán
    inventory.forEach((item) => {
      const qty = item.quantity ?? item.stock_quantity ?? 1;
      const importPrice = item.import_price ?? item.cost_price ?? 0;
      if (importPrice > 0) {
        events.push({ at: parse(item.created_at), income: 0, expense: importPrice * qty });
      }
      if (item.qc_status === 'sold') {
        const sellPrice = item.price ?? item.retail_price ?? 0;
        if (sellPrice > 0) {
          events.push({ at: parse(item.handover_date || item.created_at), income: sellPrice, expense: 0 });
        }
      }
    });

    // KEY: giá đầu vào khi nhập kho; giá bán khi đã gán cho khách
    licenseKeys.forEach((key) => {
      const importPrice = key.import_price ?? 0;
      if (importPrice > 0) {
        events.push({ at: parse(key.created_at), income: 0, expense: importPrice });
      }
      const delivered = ['assigned', 'used', 'activated'].includes(key.status);
      const sellPrice = key.unit_price ?? 0;
      if (delivered && sellPrice > 0) {
        events.push({ at: parse(key.assigned_at || key.created_at), income: sellPrice, expense: 0 });
      }
    });

    // PHIẾU SỬA CHỮA: tổng tiền phiếu khi đã hoàn tất
    tickets.forEach((ticket) => {
      const done = ticket.status === 'completed' || ticket.status === 'delivered';
      const amount = ticket.total_amount ?? ticket.actual_cost ?? 0;
      if (done && amount > 0) {
        events.push({ at: parse(ticket.completed_at || ticket.created_at), income: amount, expense: 0 });
      }
    });

    return buckets.map((bucket) => {
      let income = 0;
      let expense = 0;
      events.forEach((ev) => {
        if (!ev.at || ev.at < bucket.start || ev.at >= bucket.end) return;
        income += ev.income;
        expense += ev.expense;
      });
      return { label: bucket.label, date: bucket.date, income, expense };
    });
  }, [inventory, licenseKeys, tickets, cashflowTimeframe]);

  // 4 Revenue Pillars Data for Donut Chart
  const revenuePillarsData = useMemo(() => {
    const { breakdown } = financialAnalytics;
    return [
      {
        name: 'Bán Kho Máy',
        value: breakdown.machines.revenue,
        cost: breakdown.machines.cost,
        profit: breakdown.machines.profit,
        count: breakdown.machines.count,
        color: '#3b82f6',
      },
      {
        name: 'Sửa Chữa Tiếp Nhận',
        value: breakdown.tickets.revenue,
        cost: breakdown.tickets.cost,
        profit: breakdown.tickets.profit,
        count: breakdown.tickets.count,
        color: '#10b981',
      },
      {
        name: 'Cứu Hộ Onsite',
        value: onsiteDispatches.length * 150000,
        cost: Math.round(onsiteDispatches.length * 150000 * 0.25),
        profit: Math.round(onsiteDispatches.length * 150000 * 0.75),
        count: onsiteDispatches.length,
        color: '#f59e0b',
      },
      {
        name: 'Key Win & Office',
        value: breakdown.keys.revenue,
        cost: breakdown.keys.cost,
        profit: breakdown.keys.profit,
        count: breakdown.keys.count,
        color: '#ec4899',
      },
    ];
  }, [financialAnalytics, onsiteDispatches]);

  // SLA Health Data for Service Monitoring
  const slaHealthData = useMemo(() => {
    const now = new Date();
    let overdue = 0;
    let nearDeadline = 0;
    let onTrack = 0;
    let readyDeliver = 0;
    let completed = 0;

    tickets.forEach((t) => {
      if (t.status === 'completed') {
        completed++;
      } else if (t.status === 'ready' || t.status === 'ready_deliver') {
        readyDeliver++;
      } else if (t.status === 'cancelled') {
        // Skip
      } else {
        const est = t.estimated_completion ? new Date(t.estimated_completion) : null;
        const diffHours = est && !isNaN(est.getTime()) ? (est.getTime() - now.getTime()) / (1000 * 60 * 60) : 48;
        if (diffHours < 0) {
          overdue++;
        } else if (diffHours < 24) {
          nearDeadline++;
        } else {
          onTrack++;
        }
      }
    });

    return { overdue, nearDeadline, onTrack, readyDeliver, completed };
  }, [tickets]);

  // Technician Workload Data
  const technicianWorkloadData = useMemo(() => {
    const techs = users.filter((u) => u.role === 'technician' || u.role === 'tech_manager' || u.role === 'outsourced');
    return techs.map((u) => {
      const techTickets = tickets.filter((t) => t.technician_name === u.name);
      const completed = techTickets.filter((t) => t.status === 'completed' || t.status === 'delivered').length;
      const inProgress = techTickets.filter((t) => t.status !== 'completed' && t.status !== 'delivered' && t.status !== 'cancelled').length;
      return {
        name: u.name.split(' ').slice(-1)[0] || u.name,
        completed,
        inProgress,
        isOutsourced: u.role === 'outsourced',
      };
    });
  }, [users, tickets]);

  // Xử lý ca cứu hộ (Tối giản 4 bước: pending -> dispatched -> in_progress -> completed)
  const handleUpdateDispatch = async (id: string, currentStatus: OnsiteDispatch['status']) => {
    const nextStatus: Record<string, OnsiteDispatch['status']> = {
      pending: 'dispatched',
      dispatched: 'in_progress',
      in_progress: 'completed',
      completed: 'completed',
      cancelled: 'cancelled',
      // Legacy fallback
      preparing: 'dispatched',
      on_the_way: 'in_progress',
      arrived: 'in_progress',
    };
    await updateDispatchStatus(id, nextStatus[currentStatus] || 'completed');
  };

  const handlePassTesting = async (id: string) => {
    await updateQcStatus(id, 'ready_to_sell');
  };

  const handleFailTesting = async (id: string) => {
    await updateQcStatus(id, 'pending_test');
  };

  // Các thiết bị đang kiểm định QC
  const qcTestingItems = inventory.filter(
    (i) => i.qc_status === 'testing' || i.qc_status === 'pending_test'
  );

  return (
    <div className="flex flex-col w-full gap-6 font-sans">
      {/* Thermal Label Modal */}
      <ThermalLabelModal
        item={selectedItemForLabel}
        onClose={() => setSelectedItemForLabel(null)}
      />

      {/* Financial Analytics & ROI Drilldown Modal */}
      {isAdmin && (
        <FinancialDrilldownModal
          isOpen={isDrilldownOpen}
          onClose={() => setIsDrilldownOpen(false)}
          timeframe={cashflowTimeframe}
          timeframeLabel={financialAnalytics.timeframeLabel}
          totalIncome={financialAnalytics.totalIncome}
          totalExpense={financialAnalytics.totalExpense}
          netProfit={financialAnalytics.netProfit}
          profitMargin={financialAnalytics.profitMargin}
          roi={financialAnalytics.roi}
          totalSalesCount={financialAnalytics.totalSalesCount}
          breakdown={financialAnalytics.breakdown}
          transactions={financialAnalytics.transactions}
        />
      )}

      {/* Top Header & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Tổng Quan Quản Trị
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Admin
            </span>
          </h1>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {isAdmin && (
            <Link
              href="/tai-chinh"
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>📊 Phân Hệ Tài Chính →</span>
            </Link>
          )}
          <Link
            href="/phieu-sua-chua/tao-moi"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
          >
            + Tạo Phiếu Sửa
          </Link>
          <Link
            href="/kho-may"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-xs transition-colors"
          >
            Quản Lý Kho
          </Link>
        </div>
      </div>

      {/* CẢNH BÁO ĐƠN HÀNG MỚI TỪ WEBSITE */}
      {pendingOrders.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 via-rose-50 to-amber-50 dark:from-red-950/40 dark:via-rose-950/30 dark:to-amber-950/30 border-2 border-red-300 dark:border-red-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-red-200/80 dark:border-red-900/60">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
              <span className="text-sm font-black text-red-950 dark:text-red-200 uppercase tracking-wide flex items-center gap-1.5">
                🛒 Có {pendingOrders.length} đơn hàng mới từ Website cần xác nhận!
              </span>
            </div>
            <Link
              href="/quan-ly-don-hang"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
            >
              <span>Vào trang Quản lý Đơn hàng</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-3">
            {pendingOrders.slice(0, 3).map((order) => {
              const cleanPhone = String(order.customer_phone || '').replace(/\D/g, '');
              return (
                <div
                  key={order.id}
                  className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-red-200 dark:border-red-900/60 shadow-2xs space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-black text-[#C0392B] dark:text-rose-400">{order.order_code}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800">
                        Chờ xác nhận
                      </span>
                    </div>
                    <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {order.customer_name} • {order.customer_phone}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 truncate">
                      {order.device_name}
                    </div>
                    <div className="font-mono font-black text-sm text-[#C0392B] dark:text-rose-400">
                      {Number(order.device_price || 0).toLocaleString('vi-VN')}₫
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                    {cleanPhone && (
                      <a
                        href={`https://zalo.me/${cleanPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 rounded bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-[10px] font-bold border border-blue-200 dark:border-blue-800 transition-colors"
                      >
                        Zalo
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={async () => {
                        const ok = await confirmPendingOrder(order);
                        if (ok) {
                          message.success(`Đã xác nhận đơn ${order.order_code}! Thiết bị đã được chuyển sang trạng thái "Đang đợi bán".`);
                        } else {
                          message.error('Không thể xác nhận đơn hàng lúc này.');
                        }
                      }}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors cursor-pointer text-center"
                    >
                      ✓ Xác nhận nhanh
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4 Chỉ Số Cốt Lõi (Phân quyền Admin vs KTV/Sales) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1 & 2: DOANH THU / DÒNG TIỀN — CHỈ ADMIN THEO DÕI */}
        {isAdmin ? (
          <>
            <Link
              href="/tai-chinh"
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span>Lãi Ròng ({financialAnalytics.timeframeLabel})</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  ROI: {financialAnalytics.roi}% ↗
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-emerald-700 font-mono tracking-tight">
                {financialAnalytics.netProfit >= 0 ? '+' : ''}
                {financialAnalytics.netProfit.toLocaleString('vi-VN')}₫
              </div>
              <div className="flex items-center justify-between text-[11px] text-emerald-600 mt-1 font-medium">
                <span>Biên lãi: {financialAnalytics.profitMargin}%</span>
                <span className="text-blue-600 font-bold group-hover:underline">Chi tiết →</span>
              </div>
            </Link>

            <Link
              href="/tai-chinh"
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span>Doanh Thu ({financialAnalytics.timeframeLabel})</span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {financialAnalytics.totalSalesCount} ĐƠN
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tracking-tight">
                {financialAnalytics.totalIncome.toLocaleString('vi-VN')}₫
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                <span>Vốn: {financialAnalytics.totalExpense.toLocaleString('vi-VN')}₫</span>
                <span className="text-blue-600 font-bold group-hover:underline">Phân tích →</span>
              </div>
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/cuu-ho-onsite?tab=counter"
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span>Phiếu Sửa Chữa</span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                  TIẾP NHẬN
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tracking-tight">
                {tickets.filter((t) => t.status !== 'completed').length} ca
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {tickets.filter((t) => t.status === 'processing').length} đang sửa • {tickets.filter((t) => t.status === 'received').length} mới
              </div>
            </Link>

            <Link
              href="/cuu-ho-onsite"
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-amber-300 transition-colors"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span>Cứu Hộ Tận Nơi</span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                  ONSITE
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tracking-tight">
                {onsiteDispatches.filter((d) => d.status !== 'completed').length} ca
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Đang trực chiến &amp; điều phối
              </div>
            </Link>
          </>
        )}

        {/* KPI 3: Thiết bị kho */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>Thiết Bị Kho</span>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
              TỒN KHO
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tracking-tight">
            {deviceStats.total} máy
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
            <span className="text-emerald-700 font-semibold">{deviceStats.rts} sẵn bán</span>
            <span>•</span>
            <span className="text-amber-700 font-semibold">{deviceStats.qc} QC</span>
            <span>•</span>
            {deviceStats.allAgingItems.length > 0 ? (
              <span className="text-rose-600 font-bold">⚠️ {deviceStats.allAgingItems.length} tồn lâu</span>
            ) : (
              <span className="text-blue-700">{deviceStats.sold} đã bán</span>
            )}
          </div>
        </div>

        {/* KPI 4: Vận hành dịch vụ */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-purple-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>Tiến Độ Vận Hành</span>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
              DỊCH VỤ
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tracking-tight">
            {tickets.filter((t) => t.status !== 'completed').length} ca
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
            <span>{tickets.filter((t) => t.status === 'processing').length} đang sửa</span>
            <span>•</span>
            <span className="text-indigo-600 font-medium">
              {onsiteDispatches.filter((d) => d.status !== 'completed').length} cứu hộ
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2 BIỂU ĐỒ TRỌNG TÂM: DÒNG TIỀN & DOANH THU 4 TRỤ CỘT       */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* CHART 1: BIỂU ĐỒ HOẠT ĐỘNG / DOANH SỐ */}
        <div className="lg:col-span-7">
          <InteractiveCashflowChart
            data={cashflowData}
            isAdmin={isAdmin}
            timeframe={cashflowTimeframe}
            onTimeframeChange={setCashflowTimeframe}
            onOpenDrilldown={() => setIsDrilldownOpen(true)}
          />
        </div>
        {/* CHART 2: CƠ CẤU DOANH THU 4 TRỤ CỘT */}
        <div className="lg:col-span-5">
          <RevenuePillarsDonutChart
            data={revenuePillarsData}
            totalRevenue={financialAnalytics.totalIncome}
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3 BIỂU ĐỒ VẬN HÀNH: SLA DỊCH VỤ, KTV, TỒN KHO           */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <SlaHealthDashboardChart slaData={slaHealthData} />
        <TechnicianWorkloadRecharts data={technicianWorkloadData} />
        <InventoryAgingRecharts
          inventoryData={{
            rts: deviceStats.rts,
            qc: deviceStats.qc,
            repair: tickets.filter((t) => t.status === 'processing' || t.status === 'in_progress').length,
            sold: deviceStats.sold,
            agingCount: deviceStats.allAgingItems.length,
          }}
          totalDevices={deviceStats.total}
        />
      </div>


      {/* ======================================================== */}
      {/* CẢNH BÁO THIẾT BỊ TỒN KHO LÂU & DÒNG TIỀN VỐN ĐỌNG      */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-rose-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                <span>📦</span> Quản Lý Dòng Tiền &amp; Cảnh Báo Thiết Bị Quá Hạn Cần Thanh Lý
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30 uppercase font-mono">
                Aging Alert
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Cảnh báo Vàng (50–55 ngày tồn) và Cảnh báo Đỏ (56–60+ ngày tồn) giúp tối ưu dòng vốn lưu động.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/kho-may"
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 font-bold transition-all shadow-2xs"
            >
              Vào Kho Thanh Lý →
            </Link>
          </div>
        </div>

        {/* Summary Stat Pills */}
        <div className={`grid ${isAdmin ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2'} gap-3 p-4 bg-slate-50 border-b border-slate-200 text-xs`}>
          <div className="p-3 bg-white rounded-xl border border-rose-200 shadow-2xs">
            <span className="text-[10px] font-bold text-rose-700 uppercase">🚨 Thanh Lý Gấp (56-60d+)</span>
            <div className="text-lg font-black text-rose-700 font-mono mt-0.5">
              {deviceStats.agingRedItems.length} máy
            </div>
            <span className="text-[10px] text-slate-500">Mức đỏ nghiêm trọng</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-amber-200 shadow-2xs">
            <span className="text-[10px] font-bold text-amber-800 uppercase">⚠️ Cảnh Báo Tồn Lâu (50-55d)</span>
            <div className="text-lg font-black text-amber-800 font-mono mt-0.5">
              {deviceStats.agingYellowItems.length} máy
            </div>
            <span className="text-[10px] text-slate-500">Đề xuất giảm giá</span>
          </div>

          {isAdmin && (
            <>
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase">💰 Vốn Đọng Hàng Quá Hạn</span>
                <div className="text-lg font-black text-slate-900 font-mono mt-0.5">
                  {deviceStats.agingCapital.toLocaleString('vi-VN')}₫
                </div>
                <span className="text-[10px] text-slate-500">Vốn bị giam trong kho</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase">🏬 Tổng Vốn Hàng Tồn</span>
                <div className="text-lg font-black text-blue-700 font-mono mt-0.5">
                  {deviceStats.inventoryCapital.toLocaleString('vi-VN')}₫
                </div>
                <span className="text-[10px] text-slate-500">Toàn bộ kho ({deviceStats.total} máy)</span>
              </div>
            </>
          )}
        </div>

        {/* Table of Aging Items */}
        <div className="p-4">
          {deviceStats.allAgingItems.length === 0 ? (
            <div className="py-6 text-center text-xs text-emerald-700 font-semibold bg-emerald-50 rounded-xl border border-emerald-200">
              ✓ Toàn bộ thiết bị trong kho hiện đều dưới 50 ngày tuổi. Dòng tiền lưu chuyển rất tốt!
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Thiết Bị &amp; Model</th>
                    <th className="py-2.5 px-3">Serial Tag</th>
                    <th className="py-2.5 px-3">Ngày Nhập Kho</th>
                    <th className="py-2.5 px-3">Tuổi Kho</th>
                    {isAdmin && <th className="py-2.5 px-3 text-right">Vốn Đọng</th>}
                    <th className="py-2.5 px-3 text-right">Giá Bán</th>
                    <th className="py-2.5 px-3 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deviceStats.allAgingItems.map((item) => {
                    const days = calculateDaysInStock(item, nowTimestamp);
                    const isRed = days >= 56;

                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors ${isRed ? 'bg-rose-50/40 hover:bg-rose-50/70' : 'bg-amber-50/40 hover:bg-amber-50/70'}`}
                      >
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {item.device_model || item.model || item.brand} ({item.form_factor})
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                          {item.service_tag}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">
                          {item.import_date
                            ? new Date(item.import_date).toLocaleDateString('vi-VN')
                            : item.created_at
                            ? new Date(item.created_at).toLocaleDateString('vi-VN')
                            : 'N/A'}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full ${
                              isRed
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}
                          >
                            {isRed ? `🚨 ${days} ngày (Thanh lý gấp)` : `⚠️ ${days} ngày (Tồn lâu)`}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                            {(item.import_price || item.cost_price || 0).toLocaleString('vi-VN')}₫
                          </td>
                        )}
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          {(item.price || item.retail_price || 0).toLocaleString('vi-VN')}₫
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedItemForLabel(item)}
                              className="px-2 py-0.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-[11px] font-semibold rounded"
                            >
                              In tem
                            </button>
                            <Link
                              href="/kho-may"
                              className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded"
                            >
                              Xử lý →
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* SMART CRM AUTOMATION: SINH NHẬT & NHẮC BẢO DƯỠNG 6T     */}
      {/* ======================================================== */}
      <CrmAlertsPanel customers={customers} inventory={inventory} tickets={tickets} compact={true} />

      {/* ======================================================== */}
      {/* THÔNG TIN VẬN HÀNH DẠNG DÒNG NGẮN GỌN (COMPACT ROW LIST) */}
      {/* ======================================================== */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Tab switchers */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveListTab('tickets')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                activeListTab === 'tickets'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              Phiếu Sửa Chữa ({tickets.length})
            </button>
            <button
              onClick={() => setActiveListTab('onsite')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                activeListTab === 'onsite'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              Cứu Hộ Tận Nơi ({onsiteDispatches.length})
            </button>
            <button
              onClick={() => setActiveListTab('qc')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                activeListTab === 'qc'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              Đang Kiểm Định ({qcTestingItems.length})
            </button>
          </div>

          <Link
            href={
              activeListTab === 'tickets'
                ? '/cuu-ho-onsite?tab=counter'
                : activeListTab === 'onsite'
                ? '/cuu-ho-onsite?tab=onsite'
                : '/kho-may'
            }
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
          >
            Quản lý chi tiết →
          </Link>
        </div>

        {/* Tab 1: Danh sách phiếu sửa chữa (Dòng ngắn gọn) */}
        {activeListTab === 'tickets' && (
          <div className="divide-y divide-slate-100">
            {tickets.slice(0, 5).map((tk) => (
              <div
                key={tk.id}
                className="px-5 py-3 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                {/* Cột 1: Mã & Khách */}
                <div className="flex items-center gap-3 min-w-[200px]">
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {tk.ticket_code}
                  </span>
                  <div>
                    <span className="font-semibold text-slate-900">{tk.customer_name}</span>
                    <span className="text-slate-400 font-mono text-[11px] ml-1.5">
                      ({tk.customer_phone})
                    </span>
                  </div>
                </div>

                {/* Cột 2: Thiết bị & KTV */}
                <div className="flex items-center gap-2 text-slate-600 truncate max-w-sm">
                  <span className="truncate">{tk.device_name || tk.device_model || 'Thiết bị'}</span>
                  {tk.device_service_tag && (
                    <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                      Tag: {tk.device_service_tag}
                    </span>
                  )}
                  <span className="text-slate-400">• KTV: {tk.technician_name}</span>
                </div>

                {/* Cột 3: Chi phí, Trạng thái & Link */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="font-mono font-bold text-slate-900 text-xs">
                    {(tk.total_amount ?? tk.estimated_cost ?? 0).toLocaleString('vi-VN')}₫
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      tk.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : tk.status === 'ready_deliver'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {tk.status === 'completed'
                      ? 'Hoàn tất'
                      : tk.status === 'ready_deliver'
                      ? 'Chờ giao'
                      : 'Đang sửa'}
                  </span>

                  <Link
                    href={`/cuu-ho-onsite?tab=counter&ticketId=${tk.id}`}
                    className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded font-semibold transition-colors"
                  >
                    Xem
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Danh sách điều phối cứu hộ (Dòng ngắn gọn) */}
        {activeListTab === 'onsite' && (
          <div className="divide-y divide-slate-100">
            {onsiteDispatches.map((disp) => {
              const tel = (disp.phone || disp.customer_phone || '').replace(/\D/g, '');
              return (
                <div
                  key={disp.id}
                  className="px-5 py-3 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  {/* Cột 1: Giờ & Khách */}
                  <div className="flex items-center gap-3 min-w-[210px]">
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {disp.scheduled_time}
                    </span>
                    <div>
                      <span className="font-semibold text-slate-900">{disp.customer_name}</span>
                      <span className="text-slate-400 font-mono text-[11px] ml-1.5">
                        {disp.distance_km}km
                      </span>
                    </div>
                  </div>

                  {/* Cột 2: Địa chỉ & Sự cố */}
                  <div className="flex items-center gap-2 text-slate-600 truncate max-w-md">
                    <span className="truncate">{disp.address}</span>
                    <span className="text-slate-400 shrink-0">•</span>
                    <span className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded text-[11px] truncate">
                      {disp.issue_description}
                    </span>
                  </div>

                  {/* Cột 3: Trạng thái & Thao tác */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        disp.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : disp.status === 'in_progress'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : disp.status === 'dispatched'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : disp.status === 'cancelled'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {disp.status === 'completed'
                        ? '4. Hoàn tất'
                        : disp.status === 'in_progress'
                        ? '3. Đang xử lý'
                        : disp.status === 'dispatched'
                        ? '2. Đang di chuyển'
                        : disp.status === 'cancelled'
                        ? 'Đã hủy'
                        : '1. Chờ điều phối'}
                    </span>

                    {tel && (
                      <a
                        href={`tel:${tel}`}
                        className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded font-semibold"
                      >
                        Gọi
                      </a>
                    )}

                    {disp.status !== 'completed' && disp.status !== 'cancelled' && (
                      <button
                        onClick={() => handleUpdateDispatch(disp.id, disp.status)}
                        className="px-2 py-1 text-[11px] font-semibold rounded bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors border border-blue-200"
                        title="Chuyển sang bước tiếp theo"
                      >
                        Tiến độ ➔
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: Thiết bị kiểm định QC (Dòng ngắn gọn) */}
        {activeListTab === 'qc' && (
          <div className="divide-y divide-slate-100">
            {qcTestingItems.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Hiện không có thiết bị nào đang chờ kiểm định QC.
              </div>
            ) : (
              qcTestingItems.map((item) => (
                <div
                  key={item.id}
                  className="px-5 py-3 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  {/* Cột 1: Service Tag & Model */}
                  <div className="flex items-center gap-3 min-w-[220px]">
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {item.service_tag}
                    </span>
                    <div>
                      <span className="font-semibold text-slate-900">
                        {item.device_model || item.model || 'Máy bộ'}
                      </span>
                    </div>
                  </div>

                  {/* Cột 2: Cấu hình tóm tắt */}
                  <div className="text-slate-600 text-[11px] truncate max-w-sm">
                    {item.specs_summary ||
                      `${item.specs?.cpu || ''} • ${item.specs?.ram || ''} • ${
                        item.specs?.ssd || ''
                      }`}
                  </div>

                  {/* Cột 3: Tình trạng & Thao tác */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      Đang Test
                    </span>

                    <button
                      onClick={() => setSelectedItemForLabel(item)}
                      className="px-2 py-1 text-xs text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded font-semibold"
                    >
                      In tem
                    </button>

                    <button
                      onClick={() => handleFailTesting(item.id)}
                      className="px-2 py-1 text-[11px] font-semibold rounded bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors"
                    >
                      Báo lỗi
                    </button>

                    <button
                      onClick={() => handlePassTesting(item.id)}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                    >
                      PASS (Sẵn bán)
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
