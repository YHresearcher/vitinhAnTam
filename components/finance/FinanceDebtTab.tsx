'use client';

import React from 'react';
import { LedgerItem } from './types';
import { AlertCircle, CheckCircle2, DollarSign } from 'lucide-react';

interface Props {
  debtCustomersList: LedgerItem[];
}

export function FinanceDebtTab({ debtCustomersList }: Props) {
  const totalDebt = debtCustomersList.reduce((sum, tx) => sum + tx.incomeAmount, 0);

  return (
    <div className="space-y-4 font-sans">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Danh Sách Khách Hàng Còn Nợ / Tạm Ứng Thiếu ({debtCustomersList.length} Phiếu)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Các đơn mua máy hoặc phiếu sửa chữa chưa thanh toán đủ số tiền
          </p>
        </div>
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <DollarSign className="w-5 h-5 text-amber-700 shrink-0" />
          <div>
            <div className="text-[10px] text-amber-700 font-bold uppercase">Tổng nợ cần thu</div>
            <div className="text-base font-black font-mono text-amber-900">{totalDebt.toLocaleString('vi-VN')}₫</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                <th className="py-3 px-3.5">Mã Đơn / Phiếu</th>
                <th className="py-3 px-3.5">Khách Hàng</th>
                <th className="py-3 px-3.5">Nội Dung</th>
                <th className="py-3 px-3.5 text-right">Tổng Tiền</th>
                <th className="py-3 px-3.5">Tình Trạng Công Nợ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {debtCustomersList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                    Tuyệt vời! Không có khách hàng nào đang nợ đọng trong kỳ này.
                  </td>
                </tr>
              ) : (
                debtCustomersList.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3.5 font-mono font-bold text-blue-700">{tx.code}</td>
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-slate-900">{tx.partyName}</div>
                      {tx.partyPhone && (
                        <div className="text-[10px] text-slate-400 font-mono">{tx.partyPhone}</div>
                      )}
                    </td>
                    <td className="py-3 px-3.5">{tx.title}</td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900">
                      {tx.incomeAmount.toLocaleString('vi-VN')}₫
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                        {tx.notes}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

