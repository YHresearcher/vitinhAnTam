'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Navigation, Phone, MapPin, Clock, CheckCircle2, Truck } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useStore } from '@/lib/store';
import { PageHeader } from '@/components/admin/ui/PageHeader';
import type { CustomerOrder, OnsiteDispatch, OnsiteDispatchStatus } from '@/lib/supabase';

// Đơn giao hàng gán cho nhân viên: các cột giao hàng nằm trên dòng orders
// (không có trong interface CustomerOrder gốc nên khai riêng ở đây).
interface MyDeliveryOrder extends CustomerOrder {
  delivery_staff_id?: string;
  delivery_staff_name?: string;
  delivery_fee?: number;
}

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  processing: 'Đang xử lý',
  completed: 'Đã bán — chờ giao',
  cancelled: 'Đã huỷ',
};

const STATUS_LABEL: Record<OnsiteDispatchStatus, string> = {
  pending: 'Chờ nhận việc',
  dispatched: 'Đã điều động',
  preparing: 'Đang chuẩn bị',
  on_the_way: 'Đang di chuyển',
  arrived: 'Đã đến nơi',
  in_progress: 'Đang xử lý',
  completed: 'Hoàn thành',
  cancelled: 'Đã huỷ',
};

const STATUS_BADGE: Record<OnsiteDispatchStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  dispatched: 'bg-blue-100 text-blue-800 border-blue-200',
  preparing: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  on_the_way: 'bg-violet-100 text-violet-800 border-violet-200',
  arrived: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  in_progress: 'bg-orange-100 text-orange-800 border-orange-200',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
};

// Bước tiếp theo KTV có thể bấm cho từng trạng thái
const NEXT_STEP: Partial<Record<OnsiteDispatchStatus, { next: OnsiteDispatchStatus; label: string }>> = {
  pending: { next: 'on_the_way', label: '🚗 Bắt đầu đi' },
  dispatched: { next: 'on_the_way', label: '🚗 Bắt đầu đi' },
  preparing: { next: 'on_the_way', label: '🚗 Bắt đầu đi' },
  on_the_way: { next: 'arrived', label: '📍 Đã đến nơi' },
  arrived: { next: 'in_progress', label: '🔧 Bắt đầu xử lý' },
  in_progress: { next: 'completed', label: '✅ Hoàn thành' },
};

function mapsUrl(address: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

export default function ViecCuaToiPage() {
  const { onsiteDispatches, currentUser, updateDispatchStatus, shiftLogs, adminDeductions } = useStore();
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // ---- Thu nhập của tôi (chỉ tính số liệu của riêng tài khoản đang đăng nhập) ----
  // Thù lao ca/giao máy & kỹ thuật: cộng dồn trong shift_logs theo ngày ca trực
  // (đã tự cộng khi hoàn tất ca). Hoa hồng bán máy: 10% lợi nhuận từ
  // 26/10/2026, trước đó 15% (giữ đúng mức từng thời điểm, không viết lại lịch sử).
  const COMMISSION_CUTOFF = '2026-10-26';
  const today = new Date();
  const [incomeYear, setIncomeYear] = useState(today.getFullYear());
  const [incomeMonth, setIncomeMonth] = useState<number | 'all'>(today.getMonth() + 1);
  const myName = (currentUser?.name || '').toLowerCase().trim();
  const monthKeyOf = (d: string) => (d || '').slice(0, 7);

  const feeByMonth = useMemo(() => {
    const byMonth = new Map<string, number>();
    for (const s of shiftLogs) {
      const name = (s.technician_name || s.ktv_name || '').toLowerCase().trim();
      if (myName && name !== myName) continue;
      const key = monthKeyOf(s.shift_date || '');
      if (!/^\d{4}-\d{2}$/.test(key)) continue;
      byMonth.set(key, (byMonth.get(key) || 0) + (s.bonus ?? s.bonus_amount ?? 0));
    }
    return byMonth;
  }, [shiftLogs, myName]);

  const saleByMonth = useMemo(() => {
    const byMonth = new Map<string, { commission: number; deals: number; profit: number }>();
    for (const d of adminDeductions) {
      if (d.product_type !== 'machine') continue;
      if (myName && (d.seller_name || '').toLowerCase().trim() !== myName) continue;
      const key = monthKeyOf(d.sale_date || '');
      if (!/^\d{4}-\d{2}$/.test(key)) continue;
      const rate = (d.sale_date || '') < COMMISSION_CUTOFF ? 0.15 : 0.1;
      const commission = Math.round(Math.max(0, d.net_profit || 0) * rate);
      const cur = byMonth.get(key) || { commission: 0, deals: 0, profit: 0 };
      cur.commission += commission;
      cur.deals += 1;
      cur.profit += Math.max(0, d.net_profit || 0);
      byMonth.set(key, cur);
    }
    return byMonth;
  }, [adminDeductions, myName]);

  const thisYear = today.getFullYear();
  const incomeYears = useMemo(() => {
    const years = new Set<number>([thisYear]);
    for (const key of [...feeByMonth.keys(), ...saleByMonth.keys()]) {
      years.add(Number(key.slice(0, 4)));
    }
    return [...years].sort((a, b) => b - a);
  }, [feeByMonth, saleByMonth, thisYear]);

  const incomeFor = (year: number, month: number | 'all') => {
    let fee = 0;
    let commission = 0;
    let deals = 0;
    let profit = 0;
    const keys =
      month === 'all'
        ? Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`)
        : [`${year}-${String(month).padStart(2, '0')}`];
    for (const key of keys) {
      fee += feeByMonth.get(key) || 0;
      const s = saleByMonth.get(key);
      if (s) {
        commission += s.commission;
        deals += s.deals;
        profit += s.profit;
      }
    }
    return { fee, commission, deals, profit, total: fee + commission };
  };
  const selectedIncome = incomeFor(incomeYear, incomeMonth);
  const fmt = (n: number) => `${n.toLocaleString('vi-VN')} đ`;

  const myJobs = useMemo(() => {
    if (!currentUser) return [] as OnsiteDispatch[];
    return onsiteDispatches
      .filter(
        (d) =>
          d.technician_id === currentUser.id ||
          (!d.technician_id && d.technician_name === currentUser.name)
      )
      .sort((a, b) => {
        const ta = a.scheduled_time ? new Date(a.scheduled_time).getTime() : Number.MAX_SAFE_INTEGER;
        const tb = b.scheduled_time ? new Date(b.scheduled_time).getTime() : Number.MAX_SAFE_INTEGER;
        if (isNaN(ta) && isNaN(tb)) return 0;
        if (isNaN(ta)) return 1;
        if (isNaN(tb)) return -1;
        return ta - tb;
      });
  }, [onsiteDispatches, currentUser]);

  const activeJobs = myJobs.filter((d) => d.status !== 'completed' && d.status !== 'cancelled');
  const doneJobs = myJobs.filter((d) => d.status === 'completed');

  // ---- Đơn giao hàng tận nơi gán cho riêng tài khoản đang đăng nhập ----
  // Đơn giao KHÔNG nằm trong ca điều phối: nó được gán ở bước xuất kho
  // (delivery_staff_id trên dòng orders). /api/orders siết sẵn theo người
  // giao cho vai trò hiện trường nên ở đây chỉ lọc lại lần nữa cho chắc.
  const [myDeliveries, setMyDeliveries] = useState<MyDeliveryOrder[]>([]);
  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json().catch(() => ({}));
        // GET /api/orders trả { data: [...] } (không phải mảng trần).
        const rows: MyDeliveryOrder[] = Array.isArray(data) ? data : data.data || [];
        if (cancelled) return;
        setMyDeliveries(
          rows
            .filter(
              (o) =>
                o.delivery_method === 'delivery' &&
                o.status !== 'cancelled' &&
                (o.delivery_staff_id === currentUser.id ||
                  (!o.delivery_staff_id && o.delivery_staff_name === currentUser.name))
            )
            .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
        );
      } catch {
        // Không có đơn giao thì thôi, không chặn trang.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  // Dữ liệu chart: thu nhập từng tháng của năm đang chọn (thù lao + hoa hồng).
  const chartData = Array.from({ length: 12 }, (_, i) => {
    const m = incomeFor(incomeYear, i + 1);
    return { month: i + 1, label: `T${i + 1}`, fee: m.fee, commission: m.commission, total: m.total };
  });

  const handleAdvance = async (job: OnsiteDispatch) => {
    const step = NEXT_STEP[job.status];
    if (!step || busyId) return;
    setBusyId(job.id);
    await updateDispatchStatus(job.id, step.next);
    setBusyId(null);
    setNotice(`Đã cập nhật: ${STATUS_LABEL[step.next]}`);
    setTimeout(() => setNotice(null), 3000);
  };

  const renderJob = (job: OnsiteDispatch) => {
    const phone = job.customer_phone || job.phone;
    const step = NEXT_STEP[job.status];
    return (
      <div key={job.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-bold text-slate-900 text-base leading-snug">{job.customer_name}</p>
            {job.ticket_code && <p className="text-[11px] text-slate-400 font-mono">{job.ticket_code}</p>}
          </div>
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${STATUS_BADGE[job.status]}`}
          >
            {STATUS_LABEL[job.status]}
          </span>
        </div>

        {job.scheduled_time && (
          <p className="flex items-center gap-1.5 text-sm text-slate-600">
            <Clock className="w-4 h-4 text-slate-400" />
            Hẹn: <strong className="text-slate-800">{job.scheduled_time}</strong>
            {job.area_zone && <span className="text-slate-400">• {job.area_zone}</span>}
            {job.urgency === 'urgent' && (
              <span className="text-[10px] font-bold text-red-700 bg-red-100 border border-red-200 px-1.5 py-0.5 rounded-full">
                GẤP
              </span>
            )}
          </p>
        )}

        <p className="flex items-start gap-1.5 text-sm text-slate-700">
          <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
          <span className="font-medium">{job.address}</span>
        </p>

        {(job.issue_summary || job.issue_description) && (
          <div className="bg-amber-50/60 border border-amber-100 p-2.5 rounded-xl text-xs text-amber-900">
            <span className="font-semibold block mb-0.5 text-amber-800">Mô tả sự cố:</span>
            <p className="leading-relaxed">{job.issue_summary || job.issue_description}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-1">
          <a
            href={mapsUrl(job.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl px-3 py-2.5"
          >
            <Navigation className="w-4 h-4" /> Chỉ đường
          </a>
          {phone ? (
            <a
              href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
              className="flex items-center justify-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-sm font-bold rounded-xl px-3 py-2.5"
            >
              <Phone className="w-4 h-4" /> Gọi khách
            </a>
          ) : (
            <span className="flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-400 text-sm font-semibold rounded-xl px-3 py-2.5">
              <Phone className="w-4 h-4" /> Chưa có SĐT
            </span>
          )}
        </div>

        {step && (
          <button
            onClick={() => handleAdvance(job)}
            disabled={busyId === job.id}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl px-3 py-2.5"
          >
            {busyId === job.id ? 'Đang cập nhật…' : step.label}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 font-sans">
      {notice && (
        <div className="fixed top-20 right-6 z-50 bg-white text-slate-900 px-4 py-3 rounded-xl shadow-2xl border-2 border-emerald-600 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-semibold">{notice}</span>
        </div>
      )}

      <PageHeader
        title={
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Thống kê hiệu quả kinh doanh
              <span className="text-xs px-2.5 py-1 bg-blue-100 text-blue-700 font-semibold rounded-full">
                {activeJobs.length} việc đang chờ
              </span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Các ca giao máy / cứu hộ tận nơi và đơn giao hàng được giao cho bạn
              {currentUser ? ` (${currentUser.name})` : ''}. Bấm "Chỉ đường" để Google Maps dẫn
              đường tới địa chỉ khách.
            </p>
          </div>
        }
      />

      {/* Thu nhập của tôi — thống kê theo tháng / năm */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">💰 Thu nhập của tôi</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chỉ tính số liệu của riêng bạn ({currentUser?.name || '—'}): thù lao ca giao máy /
              kỹ thuật (đã cộng vào bảng lương khi hoàn tất ca) + hoa hồng bán máy.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={incomeMonth}
              onChange={(e) =>
                setIncomeMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold bg-white"
            >
              <option value="all">Cả năm {incomeYear}</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Tháng {i + 1}
                </option>
              ))}
            </select>
            <select
              value={incomeYear}
              onChange={(e) => setIncomeYear(Number(e.target.value))}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold bg-white"
            >
              {incomeYears.map((y) => (
                <option key={y} value={y}>
                  Năm {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">
              Thù lao ca / kỹ thuật
            </div>
            <div className="text-xl font-black font-mono text-emerald-900 mt-1">
              {fmt(selectedIncome.fee)}
            </div>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              {incomeMonth === 'all' ? `Năm ${incomeYear}` : `Tháng ${incomeMonth}/${incomeYear}`}
            </p>
          </div>
          <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl">
            <div className="text-[11px] font-bold text-indigo-700 uppercase tracking-wide">
              Hoa hồng bán máy
            </div>
            <div className="text-xl font-black font-mono text-indigo-900 mt-1">
              {fmt(selectedIncome.commission)}
            </div>
            <p className="text-[11px] text-indigo-700 mt-0.5">
              {selectedIncome.deals} giao dịch · Lợi nhuận {fmt(selectedIncome.profit)}
            </p>
          </div>
          <div className="p-3.5 bg-slate-900 rounded-xl">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
              Tổng thu nhập
            </div>
            <div className="text-xl font-black font-mono text-emerald-400 mt-1">
              {fmt(selectedIncome.total)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Thù lao + hoa hồng bán máy
            </p>
          </div>
        </div>

        {/* Chart hiệu quả làm việc: thu nhập từng tháng của năm đang chọn */}
        <div>
          <div className="text-xs font-bold text-slate-700 mb-2">
            Biểu đồ thu nhập theo tháng — năm {incomeYear} (bấm vào một cột để xem tháng đó)
          </div>
          <div className="w-full h-56 border border-slate-200 rounded-xl p-2 cursor-pointer">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                onClick={(e: any) => {
                  const m = e?.activePayload?.[0]?.payload?.month;
                  if (m) setIncomeMonth(m);
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) =>
                    v >= 1000000 ? `${Math.round(v / 1000000)}tr` : v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`
                  }
                />
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (!active || !payload || !payload.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900/95 text-white p-2.5 rounded-xl shadow-xl border border-slate-700 text-xs">
                        <p className="font-bold">Tháng {d.month}/{incomeYear}</p>
                        <div className="space-y-1 font-mono mt-1 text-[11px]">
                          <div className="text-emerald-400">Thù lao: {fmt(d.fee)}</div>
                          <div className="text-indigo-400">Hoa hồng: {fmt(d.commission)}</div>
                          <div className="text-white font-bold">Tổng: {fmt(d.total)}</div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="fee" stackId="income" name="Thù lao ca / kỹ thuật" fill="#059669" />
                <Bar dataKey="commission" stackId="income" name="Hoa hồng bán máy" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <div className="text-xs font-bold text-slate-700 mb-2">
            Chi tiết từng tháng năm {incomeYear} (bấm vào một tháng để xem)
          </div>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-left">
                  <th className="px-3 py-2 font-bold">Tháng</th>
                  <th className="px-3 py-2 font-bold text-right">Thù lao</th>
                  <th className="px-3 py-2 font-bold text-right">Hoa hồng bán máy</th>
                  <th className="px-3 py-2 font-bold text-right">Tổng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.from({ length: 12 }, (_, i) => {
                  const m = incomeFor(incomeYear, i + 1);
                  const isSelected = incomeMonth === i + 1;
                  return (
                    <tr
                      key={i + 1}
                      onClick={() => setIncomeMonth(i + 1)}
                      className={`cursor-pointer hover:bg-blue-50/60 ${
                        isSelected ? 'bg-blue-50 font-bold' : ''
                      }`}
                    >
                      <td className="px-3 py-2">Tháng {i + 1}</td>
                      <td className="px-3 py-2 text-right font-mono">{fmt(m.fee)}</td>
                      <td className="px-3 py-2 text-right font-mono">{fmt(m.commission)}</td>
                      <td className="px-3 py-2 text-right font-mono font-bold">{fmt(m.total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Hoa hồng bán máy tính theo lợi nhuận từng máy: 10% từ 26/10/2026, trước đó 15%.
          </p>
        </div>
      </div>

      {activeJobs.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center">
          <Navigation className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-600 font-semibold">Chưa có việc nào được giao cho bạn.</p>
          <p className="text-sm text-slate-400 mt-1">
            Khi quản lý điều phối một ca tới tài khoản của bạn, ca đó sẽ tự hiện ở đây.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{activeJobs.map(renderJob)}</div>
      )}

      {myDeliveries.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            <Truck className="w-4 h-4" /> Giao máy tận nơi — đơn giao cho bạn ({myDeliveries.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {myDeliveries.map((o) => {
              const phone = o.customer_phone;
              return (
                <div key={o.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-900 text-base leading-snug">{o.customer_name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {o.order_code} • {o.device_name}
                      </p>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border shrink-0 bg-blue-100 text-blue-800 border-blue-200">
                      {ORDER_STATUS_LABEL[o.status] || o.status}
                    </span>
                  </div>
                  {o.customer_address && (
                    <p className="flex items-start gap-1.5 text-sm text-slate-700">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                      <span className="font-medium">{o.customer_address}</span>
                    </p>
                  )}
                  {o.delivery_fee ? (
                    <p className="text-xs text-emerald-700 font-semibold">
                      Thù lao giao: {fmt(o.delivery_fee)}
                    </p>
                  ) : null}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {o.customer_address ? (
                      <a
                        href={mapsUrl(o.customer_address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl px-3 py-2.5"
                      >
                        <Navigation className="w-4 h-4" /> Chỉ đường
                      </a>
                    ) : (
                      <span className="flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-400 text-sm font-semibold rounded-xl px-3 py-2.5">
                        <Navigation className="w-4 h-4" /> Chưa có địa chỉ
                      </span>
                    )}
                    {phone ? (
                      <a
                        href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                        className="flex items-center justify-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-sm font-bold rounded-xl px-3 py-2.5"
                      >
                        <Phone className="w-4 h-4" /> Gọi khách
                      </a>
                    ) : (
                      <span className="flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-400 text-sm font-semibold rounded-xl px-3 py-2.5">
                        <Phone className="w-4 h-4" /> Chưa có SĐT
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {doneJobs.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide">
            Đã hoàn thành ({doneJobs.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 opacity-75">
            {doneJobs.map(renderJob)}
          </div>
        </div>
      )}
    </div>
  );
}
