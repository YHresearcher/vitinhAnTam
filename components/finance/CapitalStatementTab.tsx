'use client';

import React, { useMemo } from 'react';
import { useViTinhAnTamStore } from '@/lib/store';
import {
  allSettlementMonths,
  computeMonthSettlement,
  monthLabel,
  principalSchedule,
  totalCosts,
} from '@/lib/foundersSettlement';
import { FounderCapitalInput } from './FounderCapitalInput';

const fmt = (n: number) => `${Math.round(n).toLocaleString('vi-VN')}₫`;

/**
 * Bảng sao kê của người bỏ vốn chính (admin). Chỉ admin xem được (trang tài
 * chính đã khóa admin). Hiện dòng tiền của riêng người bỏ vốn: hoàn quảng
 * cáo chuẩn, phần 14%, trả gốc, chi phí chịu, phần thực nhận.
 */
export function CapitalStatementTab() {
  const { getAdminDeductions, founderSettlements, founderCapital } = useViTinhAnTamStore();

  const deductions = useMemo(() => getAdminDeductions(), [getAdminDeductions]);
  const months = useMemo(
    () => allSettlementMonths(deductions, founderSettlements),
    [deductions, founderSettlements],
  );

  const rows = useMemo(() => {
    const asc = [...months].sort();
    const schedule = principalSchedule(
      asc.map((m) => ({ month: m, mainShare: computeMonthSettlement(deductions, m).mainShare })),
      founderCapital,
    );
    const byMonth = new Map(schedule.map((r) => [r.month, r]));
    return [...months].sort((a, b) => (a < b ? 1 : -1)).map((m) => {
      const s = computeMonthSettlement(deductions, m);
      const record = founderSettlements.find((r) => r.id === m);
      const costs = record ? totalCosts(record.costs) : 0;
      const p = byMonth.get(m);
      return {
        month: m,
        orderCount: s.orderCount,
        netProfit: s.netProfit,
        reimbursement: s.reimbursement,
        mainShare: s.mainShare,
        repaidThisMonth: p?.repaidThisMonth ?? 0,
        remaining: p?.remaining ?? null,
        costs,
        effective: s.mainShare - costs,
        status: record?.status ?? 'pending',
        accumulatedShares: p?.accumulatedShares ?? 0,
      };
    });
  }, [months, deductions, founderSettlements, founderCapital]);

  const totals = rows.reduce(
    (acc, r) => ({
      netProfit: acc.netProfit + r.netProfit,
      reimbursement: acc.reimbursement + r.reimbursement,
      mainShare: acc.mainShare + r.mainShare,
      repaid: acc.repaid + r.repaidThisMonth,
      costs: acc.costs + r.costs,
      effective: acc.effective + r.effective,
      orders: acc.orders + r.orderCount,
    }),
    { netProfit: 0, reimbursement: 0, mainShare: 0, repaid: 0, costs: 0, effective: 0, orders: 0 },
  );
  const lastRow = rows[0];
  const accumulatedShares = lastRow?.accumulatedShares ?? 0;

  return (
    <div className="space-y-5 font-sans">
      <div>
        <h3 className="text-base font-black text-slate-900">Sao kê người bỏ vốn</h3>
        <p className="text-xs text-slate-500">
          Chỉ bạn xem được bảng này. Mỗi tháng một dòng: hoàn quảng cáo chuẩn, phần 14%, trả gốc,
          chi phí bạn chịu, phần thực nhận.
        </p>
      </div>

      <FounderCapitalInput />

      {founderCapital === null && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-900">
          Chưa nhập tổng vốn tự có nên cột trả gốc đang để trống. Tổng phần 14% tích lũy tới nay là{' '}
          <strong className="font-mono">{fmt(accumulatedShares)}</strong> — số này sẽ trừ dần vào gốc
          khi bạn nhập tổng vốn ở trên.
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs min-w-[900px]">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Tháng</th>
              <th className="py-3 px-4 text-right">Đơn</th>
              <th className="py-3 px-4 text-right">Lãi ròng N</th>
              <th className="py-3 px-4 text-right">Hoàn 60k/đơn</th>
              <th className="py-3 px-4 text-right">Phần 14%</th>
              <th className="py-3 px-4 text-right">Trả gốc (tháng)</th>
              <th className="py-3 px-4 text-right">Gốc còn lại</th>
              <th className="py-3 px-4 text-right">Chi phí chịu</th>
              <th className="py-3 px-4 text-right">Thực nhận</th>
              <th className="py-3 px-4 text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.month} className="hover:bg-slate-50/70">
                <td className="py-3 px-4 font-bold text-slate-900">{monthLabel(r.month)}</td>
                <td className="py-3 px-4 text-right font-mono">{r.orderCount}</td>
                <td className="py-3 px-4 text-right font-mono">{fmt(r.netProfit)}</td>
                <td className="py-3 px-4 text-right font-mono">{fmt(r.reimbursement)}</td>
                <td className="py-3 px-4 text-right font-mono">{fmt(r.mainShare)}</td>
                <td className="py-3 px-4 text-right font-mono">
                  {founderCapital === null ? '—' : fmt(r.repaidThisMonth)}
                </td>
                <td className="py-3 px-4 text-right font-mono">
                  {founderCapital === null || r.remaining === null ? '—' : fmt(r.remaining)}
                </td>
                <td className="py-3 px-4 text-right font-mono">{fmt(r.costs)}</td>
                <td className="py-3 px-4 text-right font-mono font-bold">{fmt(r.effective)}</td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      r.status === 'settled'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {r.status === 'settled' ? 'Đã chốt' : 'Chờ chốt'}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={10} className="py-10 text-center text-slate-400">
                  Chưa có tháng nào để sao kê.
                </td>
              </tr>
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="bg-slate-900 text-white font-bold">
                <td className="py-3 px-4">Cộng dồn</td>
                <td className="py-3 px-4 text-right font-mono">{totals.orders}</td>
                <td className="py-3 px-4 text-right font-mono">{fmt(totals.netProfit)}</td>
                <td className="py-3 px-4 text-right font-mono">{fmt(totals.reimbursement)}</td>
                <td className="py-3 px-4 text-right font-mono">{fmt(totals.mainShare)}</td>
                <td className="py-3 px-4 text-right font-mono">
                  {founderCapital === null ? '—' : fmt(totals.repaid)}
                </td>
                <td className="py-3 px-4 text-right font-mono">
                  {founderCapital === null || lastRow?.remaining === undefined || lastRow?.remaining === null
                    ? '—'
                    : fmt(lastRow.remaining)}
                </td>
                <td className="py-3 px-4 text-right font-mono">{fmt(totals.costs)}</td>
                <td className="py-3 px-4 text-right font-mono">{fmt(totals.effective)}</td>
                <td className="py-3 px-4" />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      <p className="text-[11px] text-slate-400">
        Thực nhận = phần 14% trừ chi phí thực tế trong tháng. Hoàn quảng cáo chuẩn nằm ngoài lãi ròng N,
        trả riêng cho người bỏ vốn nên không cộng vào thực nhận ở đây.
      </p>
    </div>
  );
}
