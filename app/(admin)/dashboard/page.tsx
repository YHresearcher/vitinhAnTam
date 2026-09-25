'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useViTinhAnTamStore } from '@/lib/store';
import { ThermalLabelModal } from '@/components/admin/ThermalLabelModal';
import { InventoryItem, OnsiteDispatch } from '@/lib/supabase';

export default function DashboardPage() {
  const {
    inventory,
    tickets,
    onsiteDispatches,
    licenseKeys,
    currentUser,
    updateDispatchStatus,
    updateQcStatus,
  } = useViTinhAnTamStore();

  // Doanh thu / dòng tiền CHỈ dành cho Admin
  const isAdmin = currentUser.role === 'admin';

  const [selectedItemForLabel, setSelectedItemForLabel] = useState<InventoryItem | null>(null);
  const [cashflowTimeframe, setCashflowTimeframe] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('week');
  const [hoveredDataPoint, setHoveredDataPoint] = useState<number | null>(null);
  const [activeListTab, setActiveListTab] = useState<'tickets' | 'onsite' | 'qc'>('tickets');

  // ==========================================
  // THỐNG KÊ THIẾT BỊ (EQUIPMENT STATS)
  // ==========================================
  const deviceStats = useMemo(() => {
    const total = inventory.length;
    const rts = inventory.filter((i) => i.qc_status === 'ready_to_sell').length;
    const qc = inventory.filter((i) => i.qc_status === 'testing' || i.qc_status === 'pending_test').length;
    const sold = inventory.filter((i) => i.qc_status === 'sold').length;
    const other = Math.max(0, total - rts - qc - sold);

    // Phân bổ thương hiệu
    const dellCount = inventory.filter((i) => (i.brand || '').toLowerCase().includes('dell')).length;
    const hpCount = inventory.filter((i) => (i.brand || '').toLowerCase().includes('hp')).length;
    const thinkpadCount = inventory.filter((i) =>
      (i.brand || '').toLowerCase().includes('lenovo') || (i.brand || '').toLowerCase().includes('thinkpad')
    ).length;
    const otherBrandCount = Math.max(0, total - dellCount - hpCount - thinkpadCount);

    // Tổng giá trị kho (ước tính)
    const inventoryValue = inventory
      .filter((i) => i.qc_status !== 'sold')
      .reduce((sum, i) => sum + (i.price || i.retail_price || 4500000), 0);

    return {
      total,
      rts,
      qc,
      sold,
      other,
      dellCount,
      hpCount,
      thinkpadCount,
      otherBrandCount,
      inventoryValue,
    };
  }, [inventory]);

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

  const totalIncome = cashflowData.reduce((acc, cur) => acc + cur.income, 0);
  const totalExpense = cashflowData.reduce((acc, cur) => acc + cur.expense, 0);
  const netCashflow = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? Math.round((netCashflow / totalIncome) * 100) : 0;

  // Xử lý ca cứu hộ
  const handleUpdateDispatch = async (id: string, currentStatus: OnsiteDispatch['status']) => {
    const nextStatus: Record<string, OnsiteDispatch['status']> = {
      pending: 'dispatched',
      preparing: 'on_the_way',
      dispatched: 'in_progress',
      on_the_way: 'arrived',
      arrived: 'in_progress',
      in_progress: 'completed',
      completed: 'completed',
      cancelled: 'cancelled',
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
          <Link
            href="/cuu-ho-onsite"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-xs transition-colors"
          >
            Cứu Hộ
          </Link>
        </div>
      </div>

      {/* 4 Chỉ Số Tài Chính & Vận Hành Cốt Lõi (Compact KPI Badges) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1 & 2: DOANH THU / DÒNG TIỀN — CHỈ ADMIN THEO DÕI */}
        {isAdmin ? (
          <>
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-emerald-300 transition-colors">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span>Dòng Tiền Ròng ({cashflowTimeframe.toUpperCase()})</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  LÃI RÒNG
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-emerald-700 font-mono tracking-tight">
                {netCashflow >= 0 ? '+' : ''}
                {netCashflow.toLocaleString('vi-VN')}₫
              </div>
              <div className="text-[11px] text-emerald-600 mt-1 font-medium">
                Biên lợi nhuận gộp: {profitMargin}%
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span>Doanh Thu ({cashflowTimeframe.toUpperCase()})</span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                  TỔNG THU
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tracking-tight">
                {totalIncome.toLocaleString('vi-VN')}₫
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Vốn nhập kho: {totalExpense.toLocaleString('vi-VN')}₫
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-4 shadow-2xs flex flex-col justify-center">
              <div className="text-xs font-bold text-slate-500 mb-1">Lãi ròng</div>
              <div className="text-sm font-semibold text-slate-400">🔒 Chỉ Admin theo dõi</div>
            </div>
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-4 shadow-2xs flex flex-col justify-center">
              <div className="text-xs font-bold text-slate-500 mb-1">Doanh thu</div>
              <div className="text-sm font-semibold text-slate-400">🔒 Chỉ Admin theo dõi</div>
            </div>
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
            <span className="text-blue-700">{deviceStats.sold} đã bán</span>
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
      {/* 2 BIỂU ĐỒ TRỌNG TÂM: DÒNG TIỀN & PHÂN BỔ THIẾT BỊ       */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* CHART 1: BIỂU ĐỒ DÒNG TIỀN & DOANH THU — CHỈ ADMIN */}
        {isAdmin && (
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Biểu Đồ Dòng Tiền &amp; Doanh Thu
                </h2>
              </div>

              {/* Timeframe switch - Stock trading button style */}
              <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-lg border border-slate-200/80 shadow-2xs self-start sm:self-auto">
                {[
                  { key: 'day', label: 'Ngày' },
                  { key: 'week', label: 'Tuần' },
                  { key: 'month', label: 'Tháng' },
                  { key: 'quarter', label: 'Quý' },
                  { key: 'year', label: 'Năm' },
                ].map(({ key, label }) => {
                  const isActive = cashflowTimeframe === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCashflowTimeframe(key as typeof cashflowTimeframe)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SVG Area & Bar Chart */}
            <div className="relative w-full h-56 pt-2">
              {(() => {
                const maxVal = Math.max(...cashflowData.map((d) => Math.max(d.income, d.expense))) * 1.15 || 10000000;
                const width = 580;
                const height = 180;
                const padLeft = 45;
                const padRight = 15;
                const padTop = 15;
                const padBottom = 25;
                const plotW = width - padLeft - padRight;
                const plotH = height - padTop - padBottom;
                const step = plotW / (cashflowData.length - 1 || 1);

                // Điểm tọa độ
                const incomePoints = cashflowData.map((d, i) => ({
                  x: padLeft + i * step,
                  y: padTop + plotH - (d.income / maxVal) * plotH,
                  val: d.income,
                  date: d.date,
                  label: d.label,
                }));

                const expensePoints = cashflowData.map((d, i) => ({
                  x: padLeft + i * step,
                  y: padTop + plotH - (d.expense / maxVal) * plotH,
                  val: d.expense,
                  date: d.date,
                  label: d.label,
                }));

                // Tạo path d cho Income
                const incomePath = incomePoints.reduce(
                  (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
                  ''
                );
                const incomeArea = `${incomePath} L ${incomePoints[incomePoints.length - 1].x} ${
                  padTop + plotH
                } L ${incomePoints[0].x} ${padTop + plotH} Z`;

                // Tạo path d cho Expense
                const expensePath = expensePoints.reduce(
                  (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
                  ''
                );

                return (
                  <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines */}
                    {[0, 0.33, 0.66, 1].map((ratio, idx) => {
                      const y = padTop + plotH - ratio * plotH;
                      const rawVal = ratio * maxVal;
                      const labelText =
                        rawVal >= 1000000000
                          ? `${(rawVal / 1000000000).toFixed(1)}Tỷ`
                          : `${(rawVal / 1000000).toFixed(0)}Tr`;

                      return (
                        <g key={idx}>
                          <line
                            x1={padLeft}
                            y1={y}
                            x2={width - padRight}
                            y2={y}
                            stroke="#e2e8f0"
                            strokeDasharray="4 4"
                            strokeWidth="1"
                          />
                          <text
                            x={padLeft - 6}
                            y={y + 3}
                            textAnchor="end"
                            fontSize="9"
                            fill="#94a3b8"
                            fontFamily="sans-serif"
                          >
                            {labelText}
                          </text>
                        </g>
                      );
                    })}

                    {/* Area fill */}
                    <path d={incomeArea} fill="url(#incomeGrad)" />

                    {/* Expense Line */}
                    <path
                      d={expensePath}
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="2"
                      strokeDasharray="4 3"
                    />

                    {/* Income Line */}
                    <path d={incomePath} fill="none" stroke="#2563eb" strokeWidth="2.5" />

                    {/* Data Dots & X-Labels */}
                    {incomePoints.map((p, idx) => {
                      const expP = expensePoints[idx];
                      const isHovered = hoveredDataPoint === idx;

                      return (
                        <g
                          key={idx}
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredDataPoint(idx)}
                          onMouseLeave={() => setHoveredDataPoint(null)}
                        >
                          {/* Vertical guide line on hover */}
                          {isHovered && (
                            <line
                              x1={p.x}
                              y1={padTop}
                              x2={p.x}
                              y2={padTop + plotH}
                              stroke="#64748b"
                              strokeWidth="1"
                              strokeDasharray="2 2"
                            />
                          )}

                          {/* Expense dot */}
                          <circle
                            cx={expP.x}
                            cy={expP.y}
                            r={isHovered ? 4.5 : 3}
                            fill="#f97316"
                            stroke="#ffffff"
                            strokeWidth="1.5"
                          />

                          {/* Income dot */}
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={isHovered ? 5.5 : 4}
                            fill="#2563eb"
                            stroke="#ffffff"
                            strokeWidth="2"
                          />

                          {/* X-axis label */}
                          <text
                            x={p.x}
                            y={height - 6}
                            textAnchor="middle"
                            fontSize="10"
                            fill={isHovered ? '#0f172a' : '#64748b'}
                            fontWeight={isHovered ? 'bold' : 'normal'}
                          >
                            {p.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                );
              })()}
            </div>

            {/* Hover Tooltip Info if active */}
            {hoveredDataPoint !== null && cashflowData[hoveredDataPoint] && (
              <div className="bg-slate-900 text-white rounded-lg p-2.5 text-xs flex items-center justify-between gap-4 mt-1">
                <span className="font-semibold text-slate-300">
                  {cashflowData[hoveredDataPoint].label} ({cashflowData[hoveredDataPoint].date}):
                </span>
                <div className="flex items-center gap-4 font-mono text-[11px]">
                  <span className="text-blue-300">
                    Thu: +{cashflowData[hoveredDataPoint].income.toLocaleString('vi-VN')}₫
                  </span>
                  <span className="text-orange-300">
                    Chi: -{cashflowData[hoveredDataPoint].expense.toLocaleString('vi-VN')}₫
                  </span>
                  <span className="text-emerald-400 font-bold">
                    Ròng: +{(
                      cashflowData[hoveredDataPoint].income - cashflowData[hoveredDataPoint].expense
                    ).toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Legend and Summary row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-600" />
                <span className="font-medium text-slate-800">Dòng Thu</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1 rounded-full bg-orange-500" />
                <span className="font-medium text-slate-800">Dòng Chi (Vật tư)</span>
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Tổng thực thu kỳ này:{' '}
              <strong className="text-emerald-700 font-mono font-bold">
                {netCashflow.toLocaleString('vi-VN')}₫
              </strong>
            </div>
          </div>
        </div>
        )}

        {/* Non-admin: doanh thu bị khóa */}
        {!isAdmin && (
          <div className="lg:col-span-7 bg-white rounded-xl border border-dashed border-slate-300 p-8 shadow-2xs flex flex-col items-center justify-center text-center gap-2">
            <div className="text-2xl">🔒</div>
            <div className="text-sm font-bold text-slate-600">Quản lý doanh thu</div>
            <div className="text-xs text-slate-400 max-w-sm">
              Chỉ Quản trị viên (Admin) mới theo dõi được doanh thu, vốn nhập kho và lãi gộp.
            </div>
          </div>
        )}

        {/* CHART 2: BIỂU ĐỒ QUẢN LÝ THIẾT BỊ (5 Cột) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Cơ Cấu Thiết Bị Kho
                </h2>
              </div>
              <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                Tổng: {deviceStats.total}
              </span>
            </div>

            {/* Donut Chart with Center Label */}
            <div className="flex items-center justify-center gap-6 py-2">
              {(() => {
                const total = Math.max(deviceStats.total, 1);
                const rtsRatio = deviceStats.rts / total;
                const qcRatio = deviceStats.qc / total;
                const soldRatio = deviceStats.sold / total;
                const otherRatio = deviceStats.other / total;

                // Chu vi hình tròn bán kính r=38
                const radius = 38;
                const circumference = 2 * Math.PI * radius;

                const strokeRTS = rtsRatio * circumference;
                const strokeQC = qcRatio * circumference;
                const strokeSold = soldRatio * circumference;
                const strokeOther = otherRatio * circumference;

                const offsetRTS = 0;
                const offsetQC = -strokeRTS;
                const offsetSold = -(strokeRTS + strokeQC);
                const offsetOther = -(strokeRTS + strokeQC + strokeSold);

                return (
                  <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      {/* Base Track */}
                      <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="transparent"
                        stroke="#f1f5f9"
                        strokeWidth="11"
                      />

                      {/* Ready to sell (Emerald) */}
                      <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="transparent"
                        stroke="#10b981"
                        strokeWidth="11"
                        strokeDasharray={`${strokeRTS} ${circumference}`}
                        strokeDashoffset={offsetRTS}
                      />

                      {/* QC Testing (Amber) */}
                      <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="transparent"
                        stroke="#f59e0b"
                        strokeWidth="11"
                        strokeDasharray={`${strokeQC} ${circumference}`}
                        strokeDashoffset={offsetQC}
                      />

                      {/* Sold (Blue) */}
                      <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="transparent"
                        stroke="#3b82f6"
                        strokeWidth="11"
                        strokeDasharray={`${strokeSold} ${circumference}`}
                        strokeDashoffset={offsetSold}
                      />

                      {/* Other / Reserved (Slate) */}
                      {otherRatio > 0 && (
                        <circle
                          cx="50"
                          cy="50"
                          r={radius}
                          fill="transparent"
                          stroke="#94a3b8"
                          strokeWidth="11"
                          strokeDasharray={`${strokeOther} ${circumference}`}
                          strokeDashoffset={offsetOther}
                        />
                      )}
                    </svg>

                    {/* Donut Center */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                      <span className="text-xl font-bold font-mono text-slate-900 leading-tight">
                        {deviceStats.total}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">Thiết bị</span>
                    </div>
                  </div>
                );
              })()}

              {/* Status Breakdown Legend */}
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Sẵn bán (RTS)
                  </span>
                  <span className="font-mono font-bold text-slate-900">{deviceStats.rts} máy</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    Đang QC / Test
                  </span>
                  <span className="font-mono font-bold text-slate-900">{deviceStats.qc} máy</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    Đã xuất bán
                  </span>
                  <span className="font-mono font-bold text-slate-900">{deviceStats.sold} máy</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    Đặt cọc / Khác
                  </span>
                  <span className="font-mono font-bold text-slate-900">{deviceStats.other} máy</span>
                </div>
              </div>
            </div>

            {/* Brand Distribution Bar */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
                <span className="font-medium">Phân loại thương hiệu:</span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Dell ({deviceStats.dellCount}) • HP ({deviceStats.hpCount}) • ThinkPad (
                  {deviceStats.thinkpadCount})
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${(deviceStats.dellCount / (deviceStats.total || 1)) * 100}%` }}
                  className="bg-blue-600 h-full"
                  title="Dell"
                />
                <div
                  style={{ width: `${(deviceStats.hpCount / (deviceStats.total || 1)) * 100}%` }}
                  className="bg-cyan-500 h-full"
                  title="HP"
                />
                <div
                  style={{ width: `${(deviceStats.thinkpadCount / (deviceStats.total || 1)) * 100}%` }}
                  className="bg-red-500 h-full"
                  title="ThinkPad"
                />
                <div
                  style={{ width: `${(deviceStats.otherBrandCount / (deviceStats.total || 1)) * 100}%` }}
                  className="bg-slate-400 h-full"
                  title="Khác"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Ước tính giá trị hàng sẵn:</span>
            <span className="font-bold font-mono text-slate-900">
              ~{deviceStats.inventoryValue.toLocaleString('vi-VN')}₫
            </span>
          </div>
        </div>
      </div>

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
                ? '/phieu-sua-chua'
                : activeListTab === 'onsite'
                ? '/cuu-ho-onsite'
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
                    href={`/phieu-sua-chua`}
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
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {disp.status === 'completed'
                        ? 'Hoàn tất'
                        : disp.status === 'in_progress'
                        ? 'Đang xử lý'
                        : 'Di chuyển'}
                    </span>

                    {tel && (
                      <a
                        href={`tel:${tel}`}
                        className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded font-semibold"
                      >
                        Gọi
                      </a>
                    )}

                    <button
                      onClick={() => handleUpdateDispatch(disp.id, disp.status)}
                      className="px-2 py-1 text-[11px] font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      Tiến độ
                    </button>
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
