import React, { useMemo } from 'react';
import type { AdminDeductionItem } from '@/lib/types';
import { saleBreakdownForMonth } from '@/lib/foundersSettlement';

const fmt = (n: number) => `${Math.round(n).toLocaleString('vi-VN')}₫`;

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/**
 * Bảng chi tiết theo từng đơn bán máy trong một tháng, dùng trong trang
 * /sao-ke của vai trò Founders. Đây là nơi DUY NHẤT founder thấy giá vốn
 * từng máy — quyết định minh bạch tiền theo đơn của chủ shop. Các trang
 * khác (kho máy, đơn hàng, tài chính) vẫn khóa giá vốn như cũ, không đổi.
 *
 * Chỉ hiện tiền theo máy: không tên khách, không số điện thoại khách, không
 * tên người bán. Cột "Phần của bạn" chính là dòng 7% của mỗi founder — mọi
 * founder đều nhận cùng 7% nên hai cột này bằng nhau theo từng đơn; hoa
 * hồng người bán 15% hiện riêng một dòng, KHÔNG cộng vào phần của bạn, vì
 * chuyện founder có hưởng hoa hồng bán hay không vẫn đang để sau (NVKD
 * tính sau) và chưa được quyết ở đây.
 *
 * Cộng theo cột khớp đúng tổng tháng (chia bằng phương pháp phần dư lớn
 * nhất); cộng ngang một đơn có thể lệch vài đồng so với N của đơn đó do
 * làm tròn — xem ghi chú dưới bảng.
 */
export default function FounderSaleBreakdown({
  deductions,
  month,
}: {
  deductions: AdminDeductionItem[];
  month: string;
}) {
  const { rows, totals } = useMemo(() => saleBreakdownForMonth(deductions, month), [deductions, month]);

  return (
    <div className="space-y-2">
      <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs min-w-[1080px]">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Máy / S/N</th>
              <th className="py-3 px-4">Ngày bán</th>
              <th className="py-3 px-4 text-right">Giá bán</th>
              <th className="py-3 px-4 text-right">Giá vốn</th>
              <th className="py-3 px-4 text-right">Lãi gộp</th>
              <th className="py-3 px-4 text-right">QC chuẩn</th>
              <th className="py-3 px-4 text-right">Lãi ròng N</th>
              <th className="py-3 px-4 text-right">Người bán 15%</th>
              <th className="py-3 px-4 text-right">Quỹ BH 10%</th>
              <th className="py-3 px-4 text-right">Tái đầu tư 40%</th>
              <th className="py-3 px-4 text-right">Người bỏ vốn 14%</th>
              <th className="py-3 px-4 text-right">Mỗi founder 7%</th>
              <th className="py-3 px-4 text-right">Phần của bạn</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/70">
                <td className="py-3 px-4">
                  <div className="font-bold text-slate-900">{r.productName}</div>
                  {r.serialNumber && <div className="text-slate-400 font-mono">{r.serialNumber}</div>}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">{fmtDate(r.saleDate)}</td>
                <td className="py-3 px-4 text-right font-mono">{fmt(r.salePrice)}</td>
                <td className="py-3 px-4 text-right font-mono">{fmt(r.costPrice)}</td>
                <td className="py-3 px-4 text-right font-mono">{fmt(r.grossProfit)}</td>
                <td className="py-3 px-4 text-right font-mono">{fmt(r.adsStandard)}</td>
                <td className="py-3 px-4 text-right font-mono font-bold">{fmt(r.netProfit)}</td>
                <td className="py-3 px-4 text-right font-mono">{fmt(r.seller)}</td>
                <td className="py-3 px-4 text-right font-mono">{fmt(r.warranty)}</td>
                <td className="py-3 px-4 text-right font-mono">{fmt(r.reinvest)}</td>
                <td className="py-3 px-4 text-right font-mono">{fmt(r.mainShare)}</td>
                <td className="py-3 px-4 text-right font-mono">{fmt(r.otherEach)}</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800">
                  {fmt(r.otherEach)}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={13} className="py-10 text-center text-slate-400">
                  Tháng này chưa có đơn bán máy nào.
                </td>
              </tr>
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-slate-300 bg-slate-50/80 font-bold text-slate-900">
                <td className="py-3 px-4" colSpan={6}>
                  Tổng tháng — khớp với bảng tháng ở trên
                </td>
                <td className="py-3 px-4 text-right font-mono">{fmt(totals.netProfit)}</td>
                <td className="py-3 px-4 text-right font-mono">{fmt(totals.seller)}</td>
                <td className="py-3 px-4 text-right font-mono">{fmt(totals.warranty)}</td>
                <td className="py-3 px-4 text-right font-mono">{fmt(totals.reinvest)}</td>
                <td className="py-3 px-4 text-right font-mono">{fmt(totals.mainShare)}</td>
                <td className="py-3 px-4 text-right font-mono">{fmt(totals.otherEach)}</td>
                <td className="py-3 px-4 text-right font-mono text-emerald-800">
                  {fmt(totals.otherEach)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      <p className="text-[11px] text-slate-400">
        Giá vốn và quảng cáo chuẩn 60.000đ là hai khoản chi phí tính vào từng đơn; chi phí vận hành
        khác do người bỏ vốn gánh riêng, không trừ vào lãi ròng N nên không có trong bảng này. Đơn
        lãi gộp dưới 60.000đ tính lãi ròng N = 0. Các dòng theo đơn được chia sao cho cộng theo cột
        khớp đúng tổng tháng; cộng ngang một đơn có thể lệch vài đồng do làm tròn tới đồng. Hoa
        hồng người bán 15% chỉ là một dòng trong thác nước, không cộng vào phần 7% của bạn.
      </p>
    </div>
  );
}
