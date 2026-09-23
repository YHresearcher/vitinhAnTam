'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { OnsiteDispatch } from '@/lib/supabase';
import {
  MapPin,
  Phone,
  User,
  Navigation,
  CheckCircle2,
  Compass,
  Radio
} from 'lucide-react';

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
    <div className="space-y-6">
      {/* Toast Notice */}
      {notice && (
        <div className="fixed top-20 right-6 z-50 bg-white text-slate-900 px-4 py-3 rounded-xl shadow-2xl border-2 border-blue-600 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium">{notice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Điều Phối Cứu Hộ Tận Nơi (&lt;5km Hỏa Tốc 2H)
            <span className="text-xs px-2.5 py-1 bg-indigo-100 text-indigo-700 font-semibold rounded-full flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse text-indigo-600" />
              {activeCount} ca đang chạy
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Phản ứng hỏa tốc trong 2 giờ cho khu vực &lt;5km từ trung tâm Tân An.
          </p>
        </div>
      </div>

      {/* 10km Coverage Map Info Banner - WHITE & BLUE THEME */}
      <div className="bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 text-slate-800 p-5 rounded-2xl shadow-xs border border-blue-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center flex-shrink-0 text-blue-600 shadow-xs">
            <Compass className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Trụ Sở Điều Phối: Tân An & Các Huyện Lân Cận
            </div>
            <div className="text-xs text-blue-700 font-medium mt-0.5">
              Phạm vi phục vụ: TP. Tân An (Phường 1-7, Khánh Hậu, Tân Khánh, Lợi Bình Nhơn) và các huyện lân cận theo lịch hẹn.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="tel:0909053058"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" /> Hotline: 0909.053.058
          </a>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'all', label: 'Tất cả ca' },
          { id: 'pending', label: 'Chờ điều phối' },
          { id: 'dispatched', label: 'KTV đang chạy xe' },
          { id: 'in_progress', label: 'Đang xử lý tại nhà' },
          { id: 'completed', label: 'Đã hoàn tất' },
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
                <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <a
                    href={`tel:${dispatch.customer_phone}`}
                    className="font-mono font-bold text-blue-700 hover:underline"
                  >
                    {dispatch.customer_phone}
                  </a>
                </div>

                {/* Address & Distance */}
                <div className="space-y-1 text-xs">
                  <div className="flex items-start gap-1.5 text-slate-700">
                    <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                    <span>{dispatch.address}</span>
                  </div>
                  <div className="flex items-center gap-3 pl-5 text-[11px] text-slate-500 font-medium">
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
                <div className="text-xs text-slate-600 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>KTV điều động: </span>
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
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  Chỉ Đường
                </a>

                {/* Change status selector */}
                <select
                  value={dispatch.status}
                  onChange={(e) =>
                    handleStatusChange(dispatch.id, e.target.value as OnsiteDispatch['status'])
                  }
                  className="text-xs font-semibold px-2 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="pending">Chờ điều phối</option>
                  <option value="dispatched">KTV đang di chuyển</option>
                  <option value="in_progress">Đang xử lý</option>
                  <option value="completed">✓ Đã xong</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
