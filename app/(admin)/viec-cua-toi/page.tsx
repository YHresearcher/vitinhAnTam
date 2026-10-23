'use client';

import React, { useMemo, useState } from 'react';
import { Navigation, Phone, MapPin, Clock, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { PageHeader } from '@/components/admin/ui/PageHeader';
import type { OnsiteDispatch, OnsiteDispatchStatus } from '@/lib/supabase';

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
  const { onsiteDispatches, currentUser, updateDispatchStatus } = useStore();
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

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
              Việc của tôi
              <span className="text-xs px-2.5 py-1 bg-blue-100 text-blue-700 font-semibold rounded-full">
                {activeJobs.length} việc đang chờ
              </span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Các ca giao máy / cứu hộ tận nơi được giao cho bạn
              {currentUser ? ` (${currentUser.name})` : ''}. Bấm "Chỉ đường" để Google Maps dẫn
              đường tới địa chỉ khách.
            </p>
          </div>
        }
      />

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
