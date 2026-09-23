'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { OnsiteDispatch } from '@/lib/supabase';

const STATUS_CONFIG: Record<
  OnsiteDispatch['status'],
  { label: string; bg: string; text: string; border: string }
> = {
  pending: { label: 'Chờ điều phối', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  preparing: { label: 'Chuẩn bị linh kiện', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  dispatched: { label: 'KTV đang di chuyển', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  on_the_way: { label: 'Đang trên đường', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  arrived: { label: 'Đã đến điểm hẹn', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  in_progress: { label: 'Đang xử lý tại nhà', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  completed: { label: 'Hoàn tất ca cứu hộ', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  cancelled: { label: 'Đã hủy', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};

export default function CuuHoOnsitePage() {
  const { onsiteDispatches, updateDispatchStatus } = useStore();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [notice, setNotice] = useState<string | null>(null);

  const filteredDispatches = onsiteDispatches.filter((d) =>
    filterStatus === 'all' ? true : d.status === filterStatus
  );

  const handleStatusChange = async (id: string, newStatus: OnsiteDispatch['status']) => {
    await updateDispatchStatus(id, newStatus);
    setNotice('Đã cập nhật trạng thái cứu hộ!');
    setTimeout(() => setNotice(null), 3000);
  };

  const activeCount = onsiteDispatches.filter(
    (d) => d.status === 'pending' || d.status === 'dispatched' || d.status === 'in_progress'
  ).length;

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notice */}
      {notice && (
        <div className="fixed top-20 right-6 z-50 bg-white text-slate-900 px-4 py-3 rounded-xl shadow-2xl border-2 border-blue-600 flex items-center gap-2">
          <span className="text-xs font-semibold">{notice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Cứu Hộ Tận Nơi
            <span className="text-xs px-2.5 py-1 bg-indigo-100 text-indigo-700 font-semibold rounded-full">
              {activeCount} ca đang chạy
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi và cập nhật trạng thái các ca xử lý tận nơi.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'all', label: 'Tất cả' },
          { id: 'pending', label: 'Chờ xử lý' },
          { id: 'dispatched', label: 'Đang di chuyển' },
          { id: 'in_progress', label: 'Đang xử lý' },
          { id: 'completed', label: 'Đã xong' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterStatus === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dispatch Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDispatches.map((dispatch) => {
          const cfg = STATUS_CONFIG[dispatch.status] || STATUS_CONFIG.pending;
          const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            dispatch.address
          )}`;

          return (
            <div
              key={dispatch.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header card */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-blue-600">
                      {dispatch.ticket_code}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-0.5">
                      {dispatch.customer_name}
                    </h3>
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                  >
                    {cfg.label}
                  </span>
                </div>

                {/* Contact phone */}
                <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                  <span className="text-slate-500">SĐT:</span>
                  <a
                    href={`tel:${dispatch.customer_phone}`}
                    className="font-mono font-bold text-blue-700 hover:underline"
                  >
                    {dispatch.customer_phone}
                  </a>
                </div>

                {/* Address & Distance */}
                <div className="space-y-1 text-xs">
                  <div className="text-slate-700">
                    <span className="font-medium text-slate-500">Địa chỉ: </span>
                    <span>{dispatch.address}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                    <span>Khoảng cách: <strong className="text-slate-800">{dispatch.distance_km} km</strong></span>
                    <span>•</span>
                    <span>Dự kiến đến: <strong className="text-blue-700">{dispatch.estimated_arrival_minutes} phút</strong></span>
                  </div>
                </div>

                {/* Issue Note */}
                <div className="bg-amber-50/70 border border-amber-100 p-2.5 rounded-lg text-xs text-amber-900">
                  <span className="font-semibold block mb-0.5">Mô tả sự cố:</span>
                  {dispatch.issue_summary}
                </div>

                {/* Technician assigned */}
                <div className="text-xs text-slate-600 flex items-center justify-between">
                  <span className="text-slate-500">KTV điều động:</span>
                  <span className="font-semibold text-slate-800">{dispatch.technician_name}</span>
                </div>
              </div>

              {/* Card Actions Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {/* Google Maps link */}
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  Bản đồ Maps
                </a>

                {/* Status Updater Dropdown/Buttons */}
                <select
                  value={dispatch.status}
                  onChange={(e) =>
                    handleStatusChange(dispatch.id, e.target.value as OnsiteDispatch['status'])
                  }
                  className="text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  <option value="pending">Chờ điều phối</option>
                  <option value="preparing">Chuẩn bị linh kiện</option>
                  <option value="dispatched">KTV đang di chuyển</option>
                  <option value="on_the_way">Đang trên đường</option>
                  <option value="arrived">Đã đến điểm hẹn</option>
                  <option value="in_progress">Đang xử lý</option>
                  <option value="completed">Hoàn tất</option>
                  <option value="cancelled">Hủy ca</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
