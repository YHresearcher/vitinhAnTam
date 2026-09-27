'use client';

import React, { useState } from 'react';

export interface FinancialBreakdownStream {
  revenue: number;
  cost: number;
  profit: number;
  count: number;
  percent: number;
}

export interface FinancialTransactionItem {
  id: string;
  date: string;
  title: string;
  category: 'machine' | 'ticket' | 'key' | 'part';
  customerName?: string;
  cost: number;
  revenue: number;
  profit: number;
  margin: number;
}

export interface FinancialDrilldownModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeframe: 'day' | 'week' | 'month' | 'quarter' | 'year';
  timeframeLabel: string;
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  profitMargin: number;
  roi: number;
  totalSalesCount: number;
  breakdown: {
    machines: FinancialBreakdownStream;
    tickets: FinancialBreakdownStream;
    keys: FinancialBreakdownStream;
    parts: FinancialBreakdownStream;
  };
  transactions: FinancialTransactionItem[];
}

export function FinancialDrilldownModal(props: FinancialDrilldownModalProps) {
  const {
    isOpen,
    onClose,
    timeframeLabel,
    totalIncome,
    totalExpense,
    netProfit,
    profitMargin,
    roi,
    totalSalesCount,
    breakdown,
    transactions,
  } = props;
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions'>('overview');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  if (!isOpen) return null;

  const filteredTransactions = (transactions || []).filter((t) => {
    if (filterCategory === 'all') return true;
    return t.category === filterCategory;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-fade-in flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase font-mono">
                Financial Analytics &amp; ROI Drill-Down
              </span>
              <span className="text-xs text-slate-300">
                Kỳ: <strong className="text-white">{timeframeLabel}</strong>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mt-1 tracking-tight text-white">
              Phân Tích Doanh Thu, Tỉ Suất Lợi Nhuận &amp; Hoàn Vốn ROI
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Chi tiết các nguồn tạo doanh thu, giá vốn đầu vào và hiệu quả sinh lời theo thời gian thực.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Financial KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 sm:p-6 bg-slate-50 border-b border-slate-200">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tổng Doanh Thu</span>
            <div className="text-base sm:text-lg font-black text-blue-700 font-mono mt-0.5">
              {totalIncome.toLocaleString('vi-VN')}₫
            </div>
            <span className="text-[10px] text-slate-500">100% dòng thu</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chi Phí Vốn</span>
            <div className="text-base sm:text-lg font-black text-orange-600 font-mono mt-0.5">
              {totalExpense.toLocaleString('vi-VN')}₫
            </div>
            <span className="text-[10px] text-slate-500">Giá vốn đầu vào</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lợi Nhuận Ròng</span>
            <div className={`text-base sm:text-lg font-black font-mono mt-0.5 ${netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {netProfit >= 0 ? `+${netProfit.toLocaleString('vi-VN')}₫` : `${netProfit.toLocaleString('vi-VN')}₫`}
            </div>
            <span className="text-[10px] text-slate-500">Doanh thu - Vốn</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Margin (Biên Lãi)</span>
            <div className="text-base sm:text-lg font-black text-indigo-700 font-mono mt-0.5">
              {profitMargin}%
            </div>
            <span className="text-[10px] text-slate-500">Lãi / Doanh thu</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tỉ Suất ROI</span>
            <div className="text-base sm:text-lg font-black text-purple-700 font-mono mt-0.5">
              {roi}%
            </div>
            <span className="text-[10px] text-slate-500">Lãi / Chi phí vốn</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sản Lượng Bán</span>
            <div className="text-base sm:text-lg font-black text-slate-900 font-mono mt-0.5">
              {totalSalesCount} đơn/món
            </div>
            <span className="text-[10px] text-slate-500">Kỳ {timeframeLabel}</span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center justify-between px-6 pt-3 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Cơ Cấu Doanh Thu &amp; Hiệu Suất Sinh Lời
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('transactions')}
              className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'transactions'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Danh Sách Giao Dịch Trong Kỳ ({transactions.length})
            </button>
          </div>
        </div>

        {/* Tab content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Nguồn Tạo Ra Doanh Thu (4 Mảng Kinh Doanh)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { key: 'machines', icon: '💻', name: 'Bán Máy Bộ', color: 'blue', data: breakdown.machines },
                  { key: 'tickets', icon: '🔧', name: 'Sửa Chữa', color: 'emerald', data: breakdown.tickets },
                  { key: 'keys', icon: '🔑', name: 'Key Bản Quyền', color: 'rose', data: breakdown.keys },
                  { key: 'parts', icon: '💾', name: 'Linh Kiện', color: 'purple', data: breakdown.parts },
                ].map(({ key, icon, name, color, data }) => (
                  <div key={key} className={`p-4 rounded-xl border border-${color}-200 bg-${color}-50/40 space-y-2`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <span>{icon}</span> {name}
                      </span>
                      <span className="text-xs font-black text-blue-700 font-mono">{data.percent}%</span>
                    </div>
                    <div className="text-lg font-black text-slate-900 font-mono">
                      {data.revenue.toLocaleString('vi-VN')}₫
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: `${data.percent}%` }} />
                    </div>
                    <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 space-y-1 font-mono">
                      <div className="flex justify-between">
                        <span>Giá vốn:</span>
                        <span className="font-semibold text-slate-800">{data.cost.toLocaleString('vi-VN')}₫</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lãi gộp:</span>
                        <span className="font-bold text-emerald-700">+{data.profit.toLocaleString('vi-VN')}₫</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Số lượng:</span>
                        <span>{data.count} món</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Methodology explanation */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span>📐</span> Công Thức Tài Chính Chi Tiết
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-slate-600">
                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-800">1. Tỉ Suất Hoàn Vốn (ROI)</span>
                    <p className="font-mono text-blue-700 font-semibold">ROI = (Lợi nhuận ròng / Chi phí vốn) × 100%</p>
                    <p className="text-slate-500">Mức sinh lời trên mỗi đồng vốn bỏ ra nhập kho. Hiện đạt <strong>{roi}%</strong>.</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-800">2. Tỉ Suất Lợi Nhuận (Margin)</span>
                    <p className="font-mono text-emerald-700 font-semibold">Margin = (Lợi nhuận ròng / Doanh thu) × 100%</p>
                    <p className="text-slate-500">Tỉ lệ giữ lại làm lãi ròng từ tổng doanh thu. Hiện đạt <strong>{profitMargin}%</strong>.</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-800">3. Vốn Luân Chuyển Kho</span>
                    <p className="font-mono text-purple-700 font-semibold">Velocity = Đơn bán / Vốn tồn kho</p>
                    <p className="text-slate-500">Tốc độ luân chuyển dòng tiền nhập-xuất kho máy tính và vật tư linh kiện.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">Lọc nguồn:</span>
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'machine', label: '💻 Bán máy' },
                  { id: 'ticket', label: '🔧 Sửa chữa' },
                  { id: 'key', label: '🔑 Key' },
                  { id: 'part', label: '💾 Linh kiện' },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setFilterCategory(c.id)}
                    className={`px-2.5 py-1 rounded-full font-medium transition-all ${
                      filterCategory === c.id ? 'bg-blue-600 text-white shadow-2xs font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Thời Gian</th>
                      <th className="py-2.5 px-3">Mặt Hàng / Nghiệp Vụ</th>
                      <th className="py-2.5 px-3">Khách Hàng</th>
                      <th className="py-2.5 px-3 text-right">Giá Vốn</th>
                      <th className="py-2.5 px-3 text-right">Doanh Thu</th>
                      <th className="py-2.5 px-3 text-right">Lợi Nhuận</th>
                      <th className="py-2.5 px-3 text-right">Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400 font-sans">
                          Không có giao dịch nào trong kỳ này.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3 text-slate-500">{tx.date}</td>
                          <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">{tx.title}</td>
                          <td className="py-2.5 px-3 font-sans text-slate-600">{tx.customerName || 'Khách vãng lai'}</td>
                          <td className="py-2.5 px-3 text-right text-slate-500">{tx.cost.toLocaleString('vi-VN')}₫</td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">{tx.revenue.toLocaleString('vi-VN')}₫</td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-700">+{tx.profit.toLocaleString('vi-VN')}₫</td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px]">
                              {tx.margin}%
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            Tổng cộng {transactions.length} giao dịch • Thực thu: {netProfit.toLocaleString('vi-VN')}₫
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors"
          >
            Đóng Phân Tích
          </button>
        </div>
      </div>
    </div>
  );
}
export default FinancialDrilldownModal;