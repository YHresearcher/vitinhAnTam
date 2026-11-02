'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useViTinhAnTamStore } from '@/lib/store';
import {
  allSettlementMonths,
  computeMonthSettlement,
  monthLabel,
} from '@/lib/foundersSettlement';
import FounderSaleBreakdown from '@/components/finance/FounderSaleBreakdown';

const fmt = (n: number) => `${Math.round(n).toLocaleString('vi-VN')}₫`;

/**
 * Bảng sao kê của riêng từng founder (vai trò Founders, key co_founder).
 * Mỗi người chỉ thấy phần 7% của chính mình + tổng lãi ròng và thác nước
 * chung của tháng để đối chiếu. Không hiện phần của founder khác, chi phí
 * của người bỏ vốn, hay tiền gốc. Admin xem được bản xem trước để kiểm tra.
 * Cổng proxy chỉ cho admin và Founders vào trang này; các vai trò khác bị
 * đưa về trang thông báo không có quyền.
 */
export default function FounderStatementPage() {
  const { currentUser, isLoggedIn, isLoading, getAdminDeductions, founderSettlements } =
    useViTinhAnTamStore();

  const deductions = useMemo(() => getAdminDeductions(), [getAdminDeductions]);
  const months = useMemo(
    () => allSettlementMonths(deductions, founderSettlements),
    [deductions, founderSettlements],
  );

  const rows = useMemo(() => {
    let cumulative = 0;
    return [...months]
      .sort((a, b) => (a < b ? 1 : -1))
      .map((m) => {
        const s = computeMonthSettlement(deductions, m);
        cumulative += s.otherEach;
        return {
          month: m,
          orderCount: s.orderCount,
          netProfit: s.netProfit,
          seller: s.seller,
          warranty: s.warranty,
          reinvest: s.reinvest,
          remainder: s.remainder,
          mine: s.otherEach,
          cumulative,
          status: founderSettlements.find((r) => r.id === m)?.status ?? 'pending',
        };
      });
  }, [months, deductions, founderSettlements]);

  const totalMine = rows.reduce((acc, r) => acc + r.mine, 0);

  // Tháng nổi bật: tháng mới nhất CÓ đơn bán máy (rows xếp mới nhất trước).
  // Tháng hiện tại chưa có đơn thì không làm tháng nổi bật, tránh số 0 giả.
  const featured = rows.find((r) => r.orderCount > 0);
  const salesRows = rows.filter((r) => r.orderCount > 0);
  const earliestSalesMonth = salesRows[salesRows.length - 1]?.month;

  // Tháng đang mở chi tiết theo đơn; mặc định mở tháng mới nhất.
  const [expandedMonth, setExpandedMonth] = useState<string | null>(rows[0]?.month ?? null);

  if (isLoading || !isLoggedIn || !currentUser) {
    return (
      <div className="p-6 text-center text-sm text-slate-500 font-sans">Đang tải bảng sao kê…</div>
    );
  }

  if (currentUser.role !== 'admin' && currentUser.role !== 'co_founder') {
    return (
      <div className="p-6 text-center font-sans">
        <h1 className="text-base font-black text-slate-900">Bạn không có quyền xem trang này</h1>
        <p className="mt-2 text-sm text-slate-500">
          Bảng sao kê chỉ dành cho admin và các founders.
        </p>
      </div>
    );
  }

  const isAdminPreview = currentUser.role === 'admin';

  return (
    <div className="p-4 sm:p-6 space-y-5 font-sans max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-black text-slate-900">Sao kê của bạn — vai trò Founders</h1>
        <p className="mt-1 text-sm text-slate-500">
          Mỗi tháng bạn nhận 7% lãi ròng, tính từ đơn bán máy trong tháng. Bảng này chỉ hiện phần của
          bạn, không hiện phần của người khác. Bấm “Xem đơn” ở mỗi tháng để xem tiền từng máy bán
          ra trong tháng đó — gồm giá bán, giá vốn, lãi gộp và phần 7% của bạn theo từng đơn.
        </p>
      </div>

      {isAdminPreview && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-900">
          Bạn đang xem với quyền admin — đây là bảng mẫu của một đồng sáng lập (7% lãi ròng mỗi
          tháng). Muốn xem toàn bộ thác nước và chi phí, mở tab{' '}
          <Link href="/tai-chinh" className="font-bold underline">
            Tài chính &amp; Doanh thu → Tất toán Founders
          </Link>
          .
        </div>
      )}

      {/* Dashboard tổng quan: 4 ô lớn + danh sách gọn theo tháng. Chỉ dùng
          số từ computeMonthSettlement (cùng nguồn với bảng tháng bên dưới).
          Tháng chưa có đơn bán thì hiện "Chưa có đơn bán", không tô số 0. */}
      {featured ? (
        <section className="space-y-3">
          <h2 className="text-sm font-black text-slate-900">Tổng quan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <p className="text-xs text-slate-500">Phần của bạn — {monthLabel(featured.month)}</p>
              <p className="mt-1 font-mono text-xl font-black text-slate-900">
                {fmt(featured.mine)}
              </p>
              <p className="mt-1 text-xs text-slate-500">7% lãi ròng tháng này</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <p className="text-xs text-slate-500">Cộng dồn từ đầu</p>
              <p className="mt-1 font-mono text-xl font-black text-slate-900">{fmt(totalMine)}</p>
              <p className="mt-1 text-xs text-slate-500">
                {earliestSalesMonth && earliestSalesMonth !== featured.month
                  ? `Từ ${monthLabel(earliestSalesMonth)} đến ${monthLabel(featured.month)}`
                  : monthLabel(featured.month)}
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <p className="text-xs text-slate-500">Trạng thái — {monthLabel(featured.month)}</p>
              <p className="mt-1">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    featured.status === 'settled'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {featured.status === 'settled' ? 'Đã chốt' : 'Chờ chốt'}
                </span>
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {featured.status === 'settled'
                  ? 'Tháng này đã chốt, số không đổi nữa.'
                  : 'Tháng này chưa chốt, số còn đổi khi có đơn mới.'}
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <p className="text-xs text-slate-500">Lãi ròng N — {monthLabel(featured.month)}</p>
              <p className="mt-1 font-mono text-xl font-black text-slate-900">
                {fmt(featured.netProfit)}
              </p>
              <p className="mt-1 text-xs text-slate-500">Phần của bạn = 7% × N, tự nhân lại được.</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
            {rows.map((r) => (
              <div
                key={r.month}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{monthLabel(r.month)}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      r.status === 'settled'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {r.status === 'settled' ? 'Đã chốt' : 'Chờ chốt'}
                  </span>
                </div>
                {r.orderCount > 0 ? (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    <span className="text-slate-500">
                      Lãi ròng N{' '}
                      <strong className="font-mono text-slate-900">{fmt(r.netProfit)}</strong>
                    </span>
                    <span className="text-slate-500">
                      Phần của bạn{' '}
                      <strong className="font-mono text-slate-900">{fmt(r.mine)}</strong>
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-slate-400">Chưa có đơn bán</span>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-500">
          Chưa có đơn bán máy nào nên chưa có số liệu tổng quan.
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs min-w-[760px]">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Tháng</th>
              <th className="py-3 px-4 text-right">Lãi ròng N</th>
              <th className="py-3 px-4 text-right">Người bán 15%</th>
              <th className="py-3 px-4 text-right">Dự phòng BH 10%</th>
              <th className="py-3 px-4 text-right">Tái đầu tư 40%</th>
              <th className="py-3 px-4 text-right">Còn lại chia 35%</th>
              <th className="py-3 px-4 text-right">Phần của bạn 7%</th>
              <th className="py-3 px-4 text-right">Cộng dồn</th>
              <th className="py-3 px-4 text-center">Trạng thái</th>
              <th className="py-3 px-4 text-center">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <React.Fragment key={r.month}>
                <tr className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-bold text-slate-900">{monthLabel(r.month)}</td>
                  <td className="py-3 px-4 text-right font-mono">{fmt(r.netProfit)}</td>
                  <td className="py-3 px-4 text-right font-mono">{fmt(r.seller)}</td>
                  <td className="py-3 px-4 text-right font-mono">{fmt(r.warranty)}</td>
                  <td className="py-3 px-4 text-right font-mono">{fmt(r.reinvest)}</td>
                  <td className="py-3 px-4 text-right font-mono">{fmt(r.remainder)}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold">{fmt(r.mine)}</td>
                  <td className="py-3 px-4 text-right font-mono">{fmt(r.cumulative)}</td>
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
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedMonth(expandedMonth === r.month ? null : r.month)
                      }
                      className="px-2 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700"
                    >
                      {expandedMonth === r.month ? 'Ẩn đơn' : 'Xem đơn'}
                    </button>
                  </td>
                </tr>
                {expandedMonth === r.month && (
                  <tr>
                    <td colSpan={10} className="py-4 px-4 bg-slate-50/60">
                      <FounderSaleBreakdown deductions={deductions} month={r.month} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={10} className="py-10 text-center text-slate-400">
                  Chưa có tháng nào để sao kê.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-slate-400">
        Lãi ròng N = lãi gộp trừ 60.000đ quảng cáo chuẩn mỗi đơn. Phần của bạn = 20% của phần còn lại
        sau khi trừ người bán, dự phòng bảo hành và tái đầu tư — tức 7% lãi ròng.
      </p>
    </div>
  );
}
