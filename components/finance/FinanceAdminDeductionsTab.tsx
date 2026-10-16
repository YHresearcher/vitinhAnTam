'use client';

import React, { useState, useMemo } from 'react';
import { useViTinhAnTamStore } from '@/lib/store';
import { AdminDeductionItem, formatDateVN } from '@/lib/supabase';

export function FinanceAdminDeductionsTab() {
  const { getAdminDeductions, currentUser } = useViTinhAnTamStore();

  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [productTypeFilter, setProductTypeFilter] = useState<'all' | 'machine' | 'key'>('all');

  // Lấy toàn bộ danh sách dòng tiền trích Admin
  const allDeductions = useMemo(() => {
    return getAdminDeductions();
  }, [getAdminDeductions]);

  // Danh sách các tháng có dữ liệu (YYYY-MM)
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    allDeductions.forEach((item) => {
      if (item.sale_date) {
        const d = new Date(item.sale_date);
        if (!isNaN(d.getTime())) {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          monthsSet.add(`${yyyy}-${mm}`);
        }
      }
    });
    return Array.from(monthsSet).sort().reverse();
  }, [allDeductions]);

  // Lọc dữ liệu theo tìm kiếm, tháng và loại sản phẩm
  const filteredList = useMemo(() => {
    return allDeductions.filter((item) => {
      // Lọc theo loại sản phẩm
      if (productTypeFilter !== 'all' && item.product_type !== productTypeFilter) {
        return false;
      }

      // Lọc theo tháng
      if (selectedMonth !== 'all' && item.sale_date) {
        const d = new Date(item.sale_date);
        if (!isNaN(d.getTime())) {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          if (`${yyyy}-${mm}` !== selectedMonth) return false;
        }
      }

      // Lọc theo từ khóa tìm kiếm
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchName = item.product_name.toLowerCase().includes(q);
        const matchCustomer = (item.customer_name || '').toLowerCase().includes(q);
        const matchPhone = (item.customer_phone || '').includes(q);
        const matchSeller = (item.seller_name || '').toLowerCase().includes(q);
        const matchSerial = (item.serial_number || '').toLowerCase().includes(q);
        const matchOrder = (item.order_code || '').toLowerCase().includes(q);
        if (!matchName && !matchCustomer && !matchPhone && !matchSeller && !matchSerial && !matchOrder) {
          return false;
        }
      }

      return true;
    });
  }, [allDeductions, productTypeFilter, selectedMonth, search]);

  // Phân nhóm dữ liệu theo từng tháng (YYYY-MM)
  const groupedByMonth = useMemo(() => {
    const groups: Record<
      string,
      {
        monthKey: string;
        monthLabel: string;
        items: AdminDeductionItem[];
        totalSales: number;
        totalProfit: number;
        totalAdminDeduction: number;
        totalCapitalRefund: number;
      }
    > = {};

    filteredList.forEach((item) => {
      let monthKey = 'unknown';
      let monthLabel = 'Không xác định ngày';
      if (item.sale_date) {
        const d = new Date(item.sale_date);
        if (!isNaN(d.getTime())) {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          monthKey = `${yyyy}-${mm}`;
          monthLabel = `Tháng ${mm}/${yyyy}`;
        }
      }

      if (!groups[monthKey]) {
        groups[monthKey] = {
          monthKey,
          monthLabel,
          items: [],
          totalSales: 0,
          totalProfit: 0,
          totalAdminDeduction: 0,
          totalCapitalRefund: 0,
        };
      }

      groups[monthKey].items.push(item);
      groups[monthKey].totalSales += item.sale_price || 0;
      groups[monthKey].totalProfit += item.net_profit || 0;
      groups[monthKey].totalAdminDeduction += item.admin_deduction || 0;
      groups[monthKey].totalCapitalRefund += item.capital_refund || 0;
    });

    // Sắp xếp các nhóm tháng theo thứ tự thời gian giảm dần
    return Object.values(groups).sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  }, [filteredList]);

  // Tổng hợp KPI chung
  const kpi = useMemo(() => {
    const currentMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    let totalAdminAllTime = 0;
    let totalAdminCurrentMonth = 0;
    let totalRefundAllTime = 0;
    let totalProfitAllTime = 0;
    let machineCount = 0;
    let keyCount = 0;

    allDeductions.forEach((item) => {
      totalAdminAllTime += item.admin_deduction || 0;
      totalRefundAllTime += item.capital_refund || 0;
      totalProfitAllTime += item.net_profit || 0;
      if (item.product_type === 'key') keyCount++;
      else machineCount++;

      if (item.sale_date) {
        const d = new Date(item.sale_date);
        if (!isNaN(d.getTime())) {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          if (`${yyyy}-${mm}` === currentMonthKey) {
            totalAdminCurrentMonth += item.admin_deduction || 0;
          }
        }
      }
    });

    return {
      totalAdminAllTime,
      totalAdminCurrentMonth,
      totalRefundAllTime,
      totalProfitAllTime,
      machineCount,
      keyCount,
      totalCount: allDeductions.length,
    };
  }, [allDeductions]);

  // Xuất file CSV cho Admin
  const handleExportCSV = () => {
    const headers =
      'STT,Phân Loại,Tên Thiết Bị / Sản Phẩm,Mã / Serial,Ngày Bán,Giá Bán,Tiền Vốn,Lợi Nhuận,Tỷ Lệ Trích,Tiền Trích Admin,Tiền Vốn Hoàn Trả,Khách Hàng,Số Điện Thoại,Người Bán,Ghi Chú\n';
    let index = 1;
    const rows = filteredList
      .map((item) => {
        const typeLabel = item.product_type === 'key' ? 'Key bản quyền' : 'Thiết bị máy tính';
        const rateLabel = `${Math.round(item.admin_rate * 100)}%`;
        const code = item.serial_number || item.order_code || '';
        return `"${index++}","${typeLabel}","${item.product_name.replace(/"/g, '""')}","${code}","${formatDateVN(
          item.sale_date
        )}",${item.sale_price},${item.cost_price},${item.net_profit},"${rateLabel}",${item.admin_deduction},${
          item.capital_refund
        },"${(item.customer_name || '').replace(/"/g, '""')}","${item.customer_phone || ''}","${(
          item.seller_name || ''
        ).replace(/"/g, '""')}","${(item.notes || '').replace(/"/g, '""')}"`;
      })
      .join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `danh-sach-trich-quy-admin-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 font-sans">
      {/* KPI Cards Top Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Tổng trích Quỹ Admin tích lũy */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-700 via-indigo-800 to-purple-900 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-3 -bottom-3 opacity-10 text-white">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-200">
              Tổng Trích Quỹ Admin
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/30">
              Chỉ Admin
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white">
            {kpi.totalAdminAllTime.toLocaleString('vi-VN')}
            <span className="text-lg font-sans ml-1 text-purple-200 font-semibold">₫</span>
          </div>
          <div className="mt-2 text-xs text-purple-200/90 flex items-center gap-1.5">
            <span>Tích lũy từ 10% Key &amp; 5% Thiết bị</span>
          </div>
        </div>

        {/* KPI 2: Trích Admin trong tháng này */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Trích Admin Tháng Này
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-emerald-600">
            {kpi.totalAdminCurrentMonth.toLocaleString('vi-VN')}
            <span className="text-lg font-sans ml-1 text-emerald-700 font-semibold">₫</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}
          </div>
        </div>

        {/* KPI 3: Tiền vốn hoàn trả (Vốn nhập + 5% LN) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tổng Vốn Hoàn Trả
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-amber-600">
            {kpi.totalRefundAllTime.toLocaleString('vi-VN')}
            <span className="text-lg font-sans ml-1 text-amber-700 font-semibold">₫</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">Hoàn người cho vay (Vốn + 5% LN)</div>
        </div>

        {/* KPI 4: Cơ cấu sản phẩm đã trích */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Cơ Cấu Sản Phẩm
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-blue-600">
            {kpi.totalCount}{' '}
            <span className="text-base font-sans font-medium text-slate-500">giao dịch</span>
          </div>
          <div className="mt-2 text-xs text-slate-600 flex items-center gap-3">
            <span className="inline-flex items-center gap-1 font-medium text-indigo-700">
              💻 {kpi.machineCount} máy (5%)
            </span>
            <span className="inline-flex items-center gap-1 font-medium text-purple-700">
              🔑 {kpi.keyCount} key (10%)
            </span>
          </div>
        </div>
      </div>

      {/* Bộ Lọc & Tìm Kiếm */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1 min-w-[260px]">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên thiết bị, khách hàng, số điện thoại, serial..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-purple-500 focus:bg-white transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Lọc theo Tháng */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="font-semibold">Tháng:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:border-purple-500"
              >
                <option value="all">Tất cả các tháng ({availableMonths.length})</option>
                {availableMonths.map((m) => {
                  const [yyyy, mm] = m.split('-');
                  return (
                    <option key={m} value={m}>
                      Tháng {mm}/{yyyy}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Lọc theo Loại sản phẩm */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="font-semibold">Loại:</span>
              <select
                value={productTypeFilter}
                onChange={(e) => setProductTypeFilter(e.target.value as any)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:border-purple-500"
              >
                <option value="all">Tất cả sản phẩm</option>
                <option value="machine">💻 Máy tính / Thiết bị (5%)</option>
                <option value="key">🔑 Key bản quyền (10%)</option>
              </select>
            </div>

            {/* Nút Xuất Excel */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-2xs transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Xuất Bảng Excel</span>
            </button>
          </div>
        </div>

        {/* Thông tin giải thích cơ chế phân bổ */}
        <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200/60 text-[11px] text-purple-900 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-600"></span>
            <span>
              <strong>Quy ước trích quỹ Admin:</strong> Key bản quyền trích <strong>10% lợi nhuận</strong> | Máy tính &amp; linh kiện trích <strong>5% lợi nhuận</strong>.
            </span>
          </div>
          <div className="text-purple-700 font-medium">
            <strong>Tiền vốn hoàn trả</strong> = Tiền vốn nhập + 5% lợi nhuận (cho người cho vay vốn)
          </div>
        </div>
      </div>

      {/* DANH SÁCH BẢNG PHÂN NHÓM THEO TỪNG THÁNG */}
      {groupedByMonth.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-slate-800">Chưa có giao dịch trích dòng tiền nào</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Khi có đơn bán máy tính thành công hoặc key bản quyền được kích hoạt, hệ thống sẽ tự động tính toán và ghi nhận chi tiết số tiền trích cho Admin theo từng tháng tại đây.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedByMonth.map((group) => (
            <div
              key={group.monthKey}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden"
            >
              {/* Month Group Header */}
              <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-400/30 flex items-center justify-center text-purple-300 font-bold text-sm">
                    📅
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
                      <span>{group.monthLabel}</span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/15 text-white border border-white/20">
                        {group.items.length} sản phẩm
                      </span>
                    </h3>
                    <p className="text-[11px] text-purple-200/80">
                      Tổng kết dòng tiền trích Admin &amp; vốn hoàn trả trong {group.monthLabel.toLowerCase()}
                    </p>
                  </div>
                </div>

                {/* Monthly Group Metrics Summary */}
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                    <span className="text-slate-300 block text-[10px]">Doanh thu tháng</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {group.totalSales.toLocaleString('vi-VN')}₫
                    </span>
                  </div>

                  <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                    <span className="text-slate-300 block text-[10px]">Lợi nhuận gộp</span>
                    <span className="font-mono font-bold text-emerald-300 text-sm">
                      {group.totalProfit.toLocaleString('vi-VN')}₫
                    </span>
                  </div>

                  <div className="bg-purple-600/40 px-3 py-1.5 rounded-xl border border-purple-400/40">
                    <span className="text-purple-200 block text-[10px] font-semibold">
                      Tổng Trích Admin
                    </span>
                    <span className="font-mono font-extrabold text-amber-300 text-sm">
                      +{group.totalAdminDeduction.toLocaleString('vi-VN')}₫
                    </span>
                  </div>

                  <div className="bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-400/30">
                    <span className="text-amber-200 block text-[10px]">Vốn hoàn trả</span>
                    <span className="font-mono font-bold text-amber-200 text-sm">
                      {group.totalCapitalRefund.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                </div>
              </div>

              {/* Table of products sold in this month */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                      <th className="py-3 px-4 w-12 text-center">STT</th>
                      <th className="py-3 px-4">Tên Thiết Bị / Sản Phẩm</th>
                      <th className="py-3 px-4 w-28">Ngày Bán</th>
                      <th className="py-3 px-4 text-right w-28">Giá Bán</th>
                      <th className="py-3 px-4 text-right w-28">Lợi Nhuận</th>
                      <th className="py-3 px-4 text-right w-36 bg-purple-50/50 text-purple-950">
                        Số Tiền Trích Cho Admin
                      </th>
                      <th className="py-3 px-4 text-right w-36 bg-amber-50/40 text-amber-950">
                        Tiền Vốn Hoàn Trả
                      </th>
                      <th className="py-3 px-4">Khách Hàng / Người Bán</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {group.items.map((item, idx) => {
                      const isKey = item.product_type === 'key';
                      const ratePercent = Math.round(item.admin_rate * 100);

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          <td className="py-3 px-4 text-center text-slate-400 font-mono text-[11px]">
                            {idx + 1}
                          </td>

                          {/* Tên Thiết Bị / Sản phẩm */}
                          <td className="py-3 px-4">
                            <div className="flex items-start gap-2">
                              <span
                                className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold shrink-0 mt-0.5 ${
                                  isKey
                                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                                }`}
                              >
                                {isKey ? '🔑 Key' : '💻 Máy'}
                              </span>
                              <div>
                                <div className="font-bold text-slate-800 group-hover:text-purple-700 transition-colors">
                                  {item.product_name}
                                </div>
                                <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                                  {item.serial_number && (
                                    <span title="Serial / Service Tag">
                                      Tag: <strong className="text-slate-700">{item.serial_number}</strong>
                                    </span>
                                  )}
                                  {item.order_code && (
                                    <span className="text-slate-400">
                                      Đơn: {item.order_code}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Ngày bán */}
                          <td className="py-3 px-4 text-slate-600 whitespace-nowrap font-medium text-[11px]">
                            {formatDateVN(item.sale_date)}
                          </td>

                          {/* Giá bán */}
                          <td className="py-3 px-4 text-right font-mono font-semibold text-slate-800">
                            {item.sale_price.toLocaleString('vi-VN')}₫
                          </td>

                          {/* Lợi nhuận */}
                          <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-600">
                            +{item.net_profit.toLocaleString('vi-VN')}₫
                          </td>

                          {/* Số tiền được trích cho Admin */}
                          <td className="py-3 px-4 text-right bg-purple-50/40">
                            <div className="font-mono font-extrabold text-purple-700 text-sm">
                              +{item.admin_deduction.toLocaleString('vi-VN')}₫
                            </div>
                            <div className="text-[10px] font-semibold text-purple-600 flex items-center justify-end gap-1 mt-0.5">
                              <span className="px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800 font-mono">
                                {ratePercent}% LN
                              </span>
                              <span>{isKey ? '(Key bản quyền)' : '(Thiết bị)'}</span>
                            </div>
                          </td>

                          {/* Tiền vốn hoàn trả */}
                          <td className="py-3 px-4 text-right bg-amber-50/30">
                            <div className="font-mono font-bold text-amber-700 text-xs">
                              {item.capital_refund.toLocaleString('vi-VN')}₫
                            </div>
                            <div className="text-[10px] text-amber-800/80 font-mono mt-0.5" title="Vốn gốc + 5% Lợi nhuận">
                              Vốn {item.cost_price.toLocaleString('vi-VN')}₫ + 5% LN
                            </div>
                          </td>

                          {/* Khách hàng / Người bán */}
                          <td className="py-3 px-4 text-slate-700">
                            <div className="font-medium text-slate-900">
                              {item.customer_name || 'Khách hàng lẻ'}
                              {item.customer_phone && (
                                <span className="text-[11px] text-slate-500 font-mono ml-1.5">
                                  ({item.customer_phone})
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <span>Bán bởi:</span>
                              <strong className="text-slate-700 font-medium">
                                {item.seller_name || 'Cửa hàng'}
                              </strong>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {/* Monthly Footer Total */}
                  <tfoot>
                    <tr className="bg-slate-100/90 font-bold border-t-2 border-slate-300 text-slate-900 text-xs">
                      <td colSpan={3} className="py-3 px-4 uppercase text-[11px]">
                        Tổng cộng {group.monthLabel} ({group.items.length} SP):
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        {group.totalSales.toLocaleString('vi-VN')}₫
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-700">
                        +{group.totalProfit.toLocaleString('vi-VN')}₫
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-purple-900 bg-purple-100/60 font-extrabold text-sm">
                        +{group.totalAdminDeduction.toLocaleString('vi-VN')}₫
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-amber-900 bg-amber-100/60 font-bold">
                        {group.totalCapitalRefund.toLocaleString('vi-VN')}₫
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-500 italic">
                        Đã đối soát dòng tiền hoàn tất
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
