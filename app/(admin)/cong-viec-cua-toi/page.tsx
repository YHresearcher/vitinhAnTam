'use client';

// Tab "Công việc của bạn" cho QL bán hàng (sales_manager) + NVKD (salesman):
// trước đây sales_manager không có trang việc của riêng mình nên khi được
// giao đi giao hàng thì không thấy chỗ mở Maps — trang này chỉ liệt kê
// đúng các yêu cầu cấp trên phân bổ cho tài khoản đang đăng nhập, kèm nút
// "Chỉ đường" (Google Maps) và "Gọi khách". Không có việc thì hiện trạng
// thái trống. Chỉ xem, không đổi trạng thái (đổi trạng thái vẫn làm ở
// trang điều phối / trang hiệu quả như cũ).

import React, { useEffect, useMemo, useState } from 'react';
import { Navigation, Phone, MapPin, Clock, Truck, Wrench, ClipboardList, Inbox } from 'lucide-react';
import { useStore } from '@/lib/store';
import { PageHeader } from '@/components/admin/ui/PageHeader';
import { TicketDetailModal } from '@/components/admin/TicketDetailModal';
import type { CustomerOrder, OnsiteDispatch, OnsiteDispatchStatus, ServiceTicket } from '@/lib/supabase';

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

const TICKET_STATUS_LABEL: Record<ServiceTicket['status'], string> = {
  received: 'Mới tiếp nhận',
  diagnosing: 'Đang kiểm tra / QC',
  in_progress: 'Đang sửa chữa',
  processing: 'Đang xử lý',
  ready: 'Xong chờ giao',
  ready_deliver: 'Sẵn sàng giao',
  completed: 'Hoàn tất',
  delivered: 'Đã bàn giao',
  cancelled: 'Đã huỷ',
};

const TICKET_STATUS_BADGE: Record<ServiceTicket['status'], string> = {
  received: 'bg-blue-100 text-blue-800 border-blue-200',
  diagnosing: 'bg-amber-100 text-amber-800 border-amber-200',
  in_progress: 'bg-purple-100 text-purple-800 border-purple-200',
  processing: 'bg-orange-100 text-orange-800 border-orange-200',
  ready: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  ready_deliver: 'bg-teal-100 text-teal-800 border-teal-200',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  delivered: 'bg-slate-100 text-slate-600 border-slate-200',
  cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
};

function mapsUrl(address: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

function telHref(phone: string) {
  return `tel:${phone.replace(/[^0-9+]/g, '')}`;
}

export default function CongViecCuaToiPage() {
  const { currentUser, onsiteDispatches, tickets, isFieldStaff } = useStore();
  const fmt = (n: number) => `${n.toLocaleString('vi-VN')} đ`;
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Phiếu sửa chữa gán cho riêng tài khoản đang đăng nhập (khớp theo tên KTV
  // phụ trách — phiếu không có technician_id, chỉ có technician_name).
  // Chỉ những phiếu này mới hiện ở đây; NVKD không thấy phiếu của người khác
  // và không vào được trang phiếu chung.
  const myTickets = useMemo(() => {
    if (!currentUser) return [] as ServiceTicket[];
    return tickets
      .filter((t) => t.technician_name === currentUser.name)
      .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
  }, [tickets, currentUser]);
  const activeTickets = myTickets.filter(
    (t) => t.status !== 'completed' && t.status !== 'delivered' && t.status !== 'cancelled'
  );

  // Ca dịch vụ gán cho riêng tài khoản đang đăng nhập (khớp id, fallback tên).
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

  // Đơn giao hàng tận nơi gán cho riêng tài khoản đang đăng nhập.
  // Đơn giao KHÔNG nằm trong ca điều phối: nó được gán ở bước xuất kho
  // (delivery_staff_id trên dòng orders). Lọc lại ở client cho chắc dù
  // /api/orders đã siết theo người giao với vai trò hiện trường.
  const [myDeliveries, setMyDeliveries] = useState<CustomerOrder[]>([]);
  const [deliveriesLoaded, setDeliveriesLoaded] = useState(false);
  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json().catch(() => ({}));
        const rows: CustomerOrder[] = Array.isArray(data) ? data : data.data || [];
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
      } finally {
        if (!cancelled) setDeliveriesLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  const totalActive = activeJobs.length + myDeliveries.length + activeTickets.length;
  const showEmpty = deliveriesLoaded && totalActive === 0;

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title={
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Công việc của bạn
              <span className="text-xs px-2.5 py-1 bg-blue-100 text-blue-700 font-semibold rounded-full">
                {totalActive} việc được giao
              </span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Các yêu cầu cấp trên phân bổ cho bạn: giao máy tận nơi, ca dịch vụ
              và phiếu sửa chữa được giao cho bạn. Bấm &quot;Chỉ đường&quot; để Google Maps
              dẫn đường tới địa chỉ khách; bấm &quot;Mở phiếu &amp; cập nhật&quot; để đổi
              trạng thái và ghi chú phiếu của bạn.
            </p>
          </div>
        }
      />

      {showEmpty && (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3 shadow-sm">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Inbox className="w-7 h-7 text-slate-400" />
          </div>
          <p className="font-bold text-slate-900 text-base">Chưa có công việc nào được phân bổ</p>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Khi cấp trên giao việc (giao hàng, ca dịch vụ hoặc phiếu sửa chữa),
            công việc sẽ hiện ở đây kèm địa chỉ, số điện thoại khách và nút Chỉ đường.
          </p>
        </div>
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
                        href={telHref(phone)}
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

      {activeJobs.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            <Wrench className="w-4 h-4" /> Ca dịch vụ được giao ({activeJobs.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activeJobs.map((job) => {
              const phone = job.customer_phone || job.phone;
              return (
                <div key={job.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-900 text-base leading-snug">{job.customer_name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {job.ticket_code || `Ca ${job.id.slice(-4)}`}
                      </p>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${STATUS_BADGE[job.status]}`}
                    >
                      {STATUS_LABEL[job.status] || job.status}
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
                  {job.technician_fee ? (
                    <p className="text-xs text-emerald-700 font-semibold">
                      Thù lao ca: {fmt(job.technician_fee)}
                    </p>
                  ) : null}
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
                        href={telHref(phone)}
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

      {activeTickets.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            <ClipboardList className="w-4 h-4" /> Phiếu sửa chữa được giao cho bạn ({activeTickets.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activeTickets.map((t) => (
              <div key={t.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-900 text-base leading-snug">{t.customer_name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {t.ticket_code || `Phiếu ${t.id.slice(-4)}`} • {t.device_name || t.device_model || 'Máy tính / Laptop'}
                    </p>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${TICKET_STATUS_BADGE[t.status]}`}
                  >
                    {TICKET_STATUS_LABEL[t.status] || t.status}
                  </span>
                </div>
                {t.customer_address && (
                  <p className="flex items-start gap-1.5 text-sm text-slate-700">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <span className="font-medium">{t.customer_address}</span>
                  </p>
                )}
                {t.issue_description && (
                  <div className="bg-amber-50/60 border border-amber-100 p-2.5 rounded-xl text-xs text-amber-900">
                    <span className="font-semibold block mb-0.5 text-amber-800">Mô tả sự cố:</span>
                    <p className="leading-relaxed">{t.issue_description}</p>
                  </div>
                )}
                {t.technician_fee ? (
                  <p className="text-xs text-emerald-700 font-semibold">
                    Thù lao phiếu: {fmt(t.technician_fee)}
                  </p>
                ) : null}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedTicketId(t.id)}
                    className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl px-3 py-2.5"
                  >
                    <ClipboardList className="w-4 h-4" /> Mở phiếu &amp; cập nhật
                  </button>
                  {t.customer_phone ? (
                    <a
                      href={telHref(t.customer_phone)}
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
            ))}
          </div>
        </div>
      )}

      {!deliveriesLoaded && (
        <p className="text-sm text-slate-400 text-center">Đang tải đơn giao hàng được giao cho bạn…</p>
      )}

      {selectedTicketId && (
        <TicketDetailModal
          ticketId={selectedTicketId}
          fieldMode={isFieldStaff()}
          onClose={() => setSelectedTicketId(null)}
        />
      )}
    </div>
  );
}
