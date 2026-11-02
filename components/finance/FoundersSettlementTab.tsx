'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useViTinhAnTamStore } from '@/lib/store';
import {
  allSettlementMonths,
  computeMonthSettlement,
  currentMonthKey,
  emptyCosts,
  monthLabel,
  principalSchedule,
  totalCosts,
  type FounderMonthlyCosts,
} from '@/lib/foundersSettlement';
import { FounderCapitalInput } from './FounderCapitalInput';

const fmt = (n: number) => `${Math.round(n).toLocaleString('vi-VN')}₫`;

/**
 * Tab tất toán quỹ founders (admin). Mọi con số tính trực tiếp từ bản ghi
 * bán máy theo bảng chốt 2026-11-02 — cùng một hàm tính với bảng sao kê,
 * nên số ở đây và số ở bảng sao kê luôn khớp nhau.
 */
export function FoundersSettlementTab() {
  const {
    getAdminDeductions,
    founderSettlements,
    saveFounderSettlement,
    setSettlementStatus,
    founderCapital,
    currentUser,
  } = useViTinhAnTamStore();

  const deductions = useMemo(() => getAdminDeductions(), [getAdminDeductions]);
  const months = useMemo(
    () => allSettlementMonths(deductions, founderSettlements),
    [deductions, founderSettlements],
  );
  const [month, setMonth] = useState(currentMonthKey());

  const selectedMonth = months.includes(month) ? month : months[0] || currentMonthKey();
  const settlement = useMemo(
    () => computeMonthSettlement(deductions, selectedMonth),
    [deductions, selectedMonth],
  );
  const record = founderSettlements.find((r) => r.id === selectedMonth);
  const isSettled = record?.status === 'settled';

  const [form, setForm] = useState<FounderMonthlyCosts>(() => record?.costs ?? emptyCosts());
  const [costSaved, setCostSaved] = useState(false);
  useEffect(() => {
    setForm(record?.costs ?? emptyCosts());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth]);

  const costsTotal = totalCosts(form);

  const principal = useMemo(() => {
    const asc = [...months].sort();
    const rows = principalSchedule(
      asc.map((m) => ({ month: m, mainShare: computeMonthSettlement(deductions, m).mainShare })),
      founderCapital,
    );
    return rows.find((r) => r.month === selectedMonth);
  }, [months, deductions, founderCapital, selectedMonth]);

  const handleSaveCosts = () => {
    saveFounderSettlement({
      id: selectedMonth,
      costs: form,
      status: record?.status ?? 'pending',
      settledAt: record?.settledAt,
      settledBy: record?.settledBy,
      created_at: record?.created_at,
    });
    setCostSaved(true);
    window.setTimeout(() => setCostSaved(false), 2000);
  };

  const setNum = (key: keyof FounderMonthlyCosts, value: string) => {
    const n = Number(value);
    setForm((prev) => ({ ...prev, [key]: Number.isFinite(n) && n >= 0 ? Math.round(n) : 0 }));
  };

  const costFields: { key: keyof FounderMonthlyCosts; label: string }[] = [
    { key: 'adsAboveStandard', label: 'Ads vượt chuẩn' },
    { key: 'rent', label: 'Mặt bằng' },
    { key: 'salaries', label: 'Lương' },
    { key: 'utilities', label: 'Điện nước' },
    { key: 'other', label: 'Khác' },
  ];

  return (
    <div className="space-y-5 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-slate-900">Tất toán quỹ founders theo tháng</h3>
          <p className="text-xs text-slate-500">
            Tính từ đơn bán máy trong tháng. Đơn bán key và linh kiện chưa tính vào bảng này.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600" htmlFor="founder-settle-month">
            Tháng
          </label>
          <select
            id="founder-settle-month"
            value={selectedMonth}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-2 text-sm font-bold bg-white border border-slate-300 rounded-xl cursor-pointer"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {monthLabel(m)}
                {founderSettlements.find((r) => r.id === m)?.status === 'settled' ? ' — Đã chốt' : ''}
              </option>
            ))}
          </select>
          {isSettled ? (
            <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
              Đã chốt
            </span>
          ) : (
            <span className="px-3 py-1.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
              Chờ chốt
            </span>
          )}
        </div>
      </div>

      {settlement.orderCount === 0 && !record ? (
        <div className="p-6 bg-white border border-slate-200 rounded-2xl text-center text-sm text-slate-500">
          Tháng này chưa có đơn bán máy nào. Bạn vẫn nhập được chi phí thực tế và tổng vốn bên dưới.
        </div>
      ) : null}

      {/* Thác nước chia */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 bg-slate-900 text-white text-xs font-bold uppercase">
          Thác nước chia — {monthLabel(selectedMonth)}
        </div>
        <div className="divide-y divide-slate-100 text-sm">
          <div className="flex justify-between px-4 py-2.5">
            <span className="text-slate-600">Đơn bán máy trong tháng</span>
            <strong className="font-mono">{settlement.orderCount} đơn</strong>
          </div>
          <div className="flex justify-between px-4 py-2.5">
            <span className="text-slate-600">Lãi gộp (giá bán trừ giá vốn)</span>
            <strong className="font-mono">{fmt(settlement.grossProfit)}</strong>
          </div>
          <div className="flex justify-between px-4 py-2.5">
            <span className="text-slate-600">Lãi ròng N (mỗi đơn trừ 60.000đ quảng cáo chuẩn)</span>
            <strong className="font-mono">{fmt(settlement.netProfit)}</strong>
          </div>
          <div className="flex justify-between px-4 py-2.5">
            <span className="text-slate-600">Người bán — 15% N</span>
            <strong className="font-mono">{fmt(settlement.seller)}</strong>
          </div>
          <div className="flex justify-between px-4 py-2.5">
            <span className="text-slate-600">Dự phòng rủi ro bảo hành — 10% N (giữ trong quỹ)</span>
            <strong className="font-mono">{fmt(settlement.warranty)}</strong>
          </div>
          <div className="flex justify-between px-4 py-2.5">
            <span className="text-slate-600">Tái đầu tư — 40% N (giữ trong quỹ tăng trưởng)</span>
            <strong className="font-mono">{fmt(settlement.reinvest)}</strong>
          </div>
          <div className="flex justify-between px-4 py-2.5 bg-slate-50">
            <span className="text-slate-600">Còn lại chia founder — 35% N</span>
            <strong className="font-mono">{fmt(settlement.remainder)}</strong>
          </div>
          <div className="flex justify-between px-4 py-2.5">
            <span className="text-slate-600">Người bỏ vốn chính — 40% phần còn lại (14% N)</span>
            <strong className="font-mono">{fmt(settlement.mainShare)}</strong>
          </div>
          <div className="flex justify-between px-4 py-2.5">
            <span className="text-slate-600">Mỗi đồng sáng lập còn lại — 20% phần còn lại (7% N)</span>
            <strong className="font-mono">{fmt(settlement.otherEach)} / người</strong>
          </div>
          <div className="flex justify-between px-4 py-2.5">
            <span className="text-slate-600">3 đồng sáng lập còn lại — cộng lại</span>
            <strong className="font-mono">{fmt(settlement.remainder - settlement.mainShare)}</strong>
          </div>
          <div className="flex justify-between px-4 py-2.5 bg-blue-50/60">
            <span className="text-slate-600">Hoàn quảng cáo chuẩn cho người bỏ vốn ({settlement.orderCount} × 60.000đ)</span>
            <strong className="font-mono">{fmt(settlement.reimbursement)}</strong>
          </div>
        </div>
        <p className="px-4 py-2 text-[11px] text-slate-400">
          Số tiền làm tròn tới đồng. Hoàn quảng cáo chuẩn nằm ngoài lãi ròng N, trả riêng cho người bỏ vốn.
        </p>
      </div>

      {/* Chi phí thực tế + phần thực nhận */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black text-slate-900">Chi phí thực tế trong tháng (người bỏ vốn chịu)</h4>
          {isSettled && (
            <span className="text-[11px] text-slate-500">Tháng đã chốt — mở lại mới sửa được.</span>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {costFields.map((f) => (
            <label key={f.key} className="block">
              <span className="text-[11px] font-bold text-slate-600">{f.label}</span>
              <input
                type="number"
                min={0}
                disabled={isSettled}
                value={form[f.key] as number}
                onChange={(e) => setNum(f.key, e.target.value)}
                className="mt-1 w-full px-2 py-2 text-sm font-mono bg-white border border-slate-300 rounded-xl disabled:bg-slate-100"
              />
            </label>
          ))}
        </div>
        <label className="block">
          <span className="text-[11px] font-bold text-slate-600">Ghi chú chi phí</span>
          <input
            type="text"
            disabled={isSettled}
            value={form.note || ''}
            onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
            placeholder="Ví dụ: chạy ads đợt lễ, sửa điện shop..."
            className="mt-1 w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl disabled:bg-slate-100"
          />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSaveCosts}
            disabled={isSettled}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Lưu chi phí tháng
          </button>
          {costSaved && <span className="text-xs font-bold text-emerald-700">Đã lưu.</span>}
          <span className="text-sm text-slate-600">
            Tổng chi phí: <strong className="font-mono">{fmt(costsTotal)}</strong>
          </span>
          <span className="text-sm text-slate-600">
            Phần thực nhận của bạn (14% trừ chi phí):{' '}
            <strong className="font-mono">{fmt(settlement.mainShare - costsTotal)}</strong>
          </span>
        </div>
      </div>

      {/* Gốc + trạng thái */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
          <h4 className="text-sm font-black text-slate-900">Tiền gốc của người bỏ vốn</h4>
          {founderCapital === null ? (
            <p className="text-sm text-slate-600">
              Chưa nhập tổng vốn tự có nên gốc chưa đối trừ. Phần 14% tích lũy tới hết tháng này là{' '}
              <strong className="font-mono">{fmt(principal?.accumulatedShares ?? 0)}</strong>, sẽ trừ dần
              vào gốc khi bạn nhập tổng vốn.
            </p>
          ) : (
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600">Tổng vốn tự có</span>
                <strong className="font-mono">{fmt(founderCapital)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Trả gốc trong tháng này</span>
                <strong className="font-mono">{fmt(principal?.repaidThisMonth ?? 0)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Đã trả lũy kế</span>
                <strong className="font-mono">{fmt(principal?.repaidCumulative ?? 0)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Gốc còn lại</span>
                <strong className="font-mono">{fmt(principal?.remaining ?? 0)}</strong>
              </div>
            </div>
          )}
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
          <h4 className="text-sm font-black text-slate-900">Chốt tháng</h4>
          <p className="text-sm text-slate-600">
            {isSettled
              ? `Tháng đã chốt${record?.settledBy ? ` bởi ${record.settledBy}` : ''}. Muốn sửa chi phí thì mở lại tháng.`
              : 'Chốt tháng khi số liệu đã đúng. Bảng sao kê của các founders sẽ hiện trạng thái này.'}
          </p>
          {isSettled ? (
            <button
              type="button"
              onClick={() => setSettlementStatus(selectedMonth, 'pending')}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl cursor-pointer"
            >
              Mở lại tháng
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setSettlementStatus(selectedMonth, 'settled', currentUser.name)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Chốt tháng này
            </button>
          )}
        </div>
      </div>

      <FounderCapitalInput />
    </div>
  );
}
