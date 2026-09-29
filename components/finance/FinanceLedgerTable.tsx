'use client';

import React from 'react';
import { LedgerItem } from './types';
import { formatDateVN } from '@/lib/supabase';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface Props {
  ledgerList: LedgerItem[];
  collectedCash: number;
}

export function FinanceLedgerTable({ ledgerList, collectedCash }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
              <th className="py-3 px-3.5">Mã Giao Dịch</th>
              <th className="py-3 px-3.5">Ngày</th>
              <th className="py-3 px-3.5">Nội Dung</th>
              <th className="py-3 px-3.5">Khách Hàng/Đối Tác</th>
              <th className="py-3 px-3.5 text-right">Thu Vào</th>
              <th className="py-3 px-3.5 text-right">Chi Ra</th>
              <th className="py-3 px-3.5 text-right">Lãi Ròng</th>
              <th className="py-3 px-3.5 text-center">Trạng Thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ledgerList.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  Không tìm thấy giao dịch nào phù hợp.
                </td>
              </tr>
            ) : (
              ledgerList.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3.5 font-mono font-bold text-blue-700">{tx.code}</td>
                  <td className="py-3 px-3.5 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                    {formatDateVN(tx.date)}
                  </td>
                  <td className="py-3 px-3.5">
                    <div className="font-semibold text-slate-900">{tx.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{tx.categoryLabel}</div>
                  </td>
                  <td className="py-3 px-3.5">
                    <div className="font-medium text-slate-800">{tx.partyName}</div>
                    {tx.partyPhone && <div className="text-[10px] text-slate-400 font-mono">{tx.partyPhone}</div>}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-blue-700">
                    {tx.incomeAmount > 0 ? `+${tx.incomeAmount.toLocaleString('vi-VN')}₫` : '-'}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono text-rose-600">
                    {tx.expenseAmount > 0 ? `-${tx.expenseAmount.toLocaleString('vi-VN')}₫` : '-'}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold">
                    {tx.netProfit > 0 ? (
                      <span className="text-emerald-700">+{tx.netProfit.toLocaleString('vi-VN')}₫</span>
                    ) : tx.netProfit < 0 ? (
                      <span className="text-rose-600">{tx.netProfit.toLocaleString('vi-VN')}₫</span>
                    ) : (
                      <span className="text-slate-400">0₫</span>
                    )}
                  </td>
                  <td className="py-3 px-3.5 text-center">
                    {tx.paymentStatus === 'paid' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Đã thu
                      </span>
                    ) : tx.paymentStatus === 'partial' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <Clock className="w-3 h-3" /> Tạm ứng
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <AlertCircle className="w-3 h-3" /> Chưa thu
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono">
        <span>{ledgerList.length} giao dịch • Thực thu: <strong>{collectedCash.toLocaleString('vi-VN')}₫</strong></span>
        <span className="text-[11px] text-slate-400">Vi Tính An Tâm</span>
      </div>
    </div>
  );
}
