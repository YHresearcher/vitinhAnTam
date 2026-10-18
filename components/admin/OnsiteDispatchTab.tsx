'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { OnsiteDispatch, OnsiteDispatchStatus } from '@/lib/supabase';

// Định nghĩa 4 bước chuẩn hóa trong quy trình Cứu hộ Onsite
const ONSITE_STEPS = [
  {
    step: 1,
    id: 'pending' as OnsiteDispatchStatus,
    label: '1. Chờ điều phối',
    shortLabel: 'Tiếp nhận',
    desc: 'Chờ gán KTV & chuẩn bị',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    badgeBg: 'bg-amber-500',
    nextAction: 'KTV Di chuyển ➔',
    nextStatus: 'dispatched' as OnsiteDispatchStatus,
  },
  {
    step: 2,
    id: 'dispatched' as OnsiteDispatchStatus,
    label: '2. Đang di chuyển',
    shortLabel: 'Di chuyển',
    desc: 'KTV đang trên đường đến',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    badgeBg: 'bg-blue-600',
    nextAction: 'Bắt đầu xử lý ➔',
    nextStatus: 'in_progress' as OnsiteDispatchStatus,
  },
  {
    step: 3,
    id: 'in_progress' as OnsiteDispatchStatus,
    label: '3. Đang xử lý',
    shortLabel: 'Đang xử lý',
    desc: 'Kiểm tra & sửa chữa tại chỗ',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    badgeBg: 'bg-purple-600',
    nextAction: 'Hoàn tất ca ✓',
    nextStatus: 'completed' as OnsiteDispatchStatus,
  },
  {
    step: 4,
    id: 'completed' as OnsiteDispatchStatus,
    label: '4. Hoàn tất',
    shortLabel: 'Hoàn tất',
    desc: 'Khách đã nghiệm thu & xong',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    badgeBg: 'bg-emerald-600',
    nextAction: null,
    nextStatus: null,
  },
];

const STATUS_CONFIG: Record<
  string,
  { step: number; label: string; bg: string; text: string; border: string; badgeBg: string }
> = {
  pending: { step: 1, label: '1. Chờ điều phối', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', badgeBg: 'bg-amber-500' },
  dispatched: { step: 2, label: '2. Đang di chuyển', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', badgeBg: 'bg-blue-600' },
  in_progress: { step: 3, label: '3. Đang xử lý', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', badgeBg: 'bg-purple-600' },
  completed: { step: 4, label: '4. Hoàn tất', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', badgeBg: 'bg-emerald-600' },
  cancelled: { step: 0, label: 'Đã hủy', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', badgeBg: 'bg-rose-500' },
  // Backward compatibility
  preparing: { step: 1, label: '1. Chờ điều phối', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', badgeBg: 'bg-amber-500' },
  on_the_way: { step: 2, label: '2. Đang di chuyển', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', badgeBg: 'bg-blue-600' },
  arrived: { step: 3, label: '3. Đang xử lý', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', badgeBg: 'bg-purple-600' },
};

function normalizeStatus(status: string): OnsiteDispatchStatus {
  if (status === 'preparing') return 'pending';
  if (status === 'on_the_way') return 'dispatched';
  if (status === 'arrived') return 'in_progress';
  return status as OnsiteDispatchStatus;
}

export default function OnsiteDispatchTab() {
  const {
    onsiteDispatches,
    users,
    canAssignTasks,
    updateDispatchStatus,
    assignDispatchTechnician,
    updateDispatchDetails,
    addServiceTicket,
    currentUser,
  } = useStore();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [notice, setNotice] = useState<string | null>(null);
  const [convertingDispatch, setConvertingDispatch] = useState<OnsiteDispatch | null>(null);

  const availableTechnicians = useMemo(() => {
    return users.filter((u) => u.role === 'technician' || u.role === 'tech_manager' || u.role === 'outsourced' || u.role === 'admin');
  }, [users]);

  const filteredDispatches = useMemo(() => {
    return onsiteDispatches.filter((d) => {
      const norm = normalizeStatus(d.status);
      if (filterStatus === 'all') return true;
      return norm === filterStatus || d.status === filterStatus;
    });
  }, [onsiteDispatches, filterStatus]);

  const handleStatusChange = async (id: string, newStatus: OnsiteDispatchStatus) => {
    await updateDispatchStatus(id, newStatus);
    const cfg = STATUS_CONFIG[newStatus];
    setNotice(`Đã chuyển trạng thái: ${cfg ? cfg.label : newStatus}`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleAssignTechnician = async (dispatchId: string, technicianName: string) => {
    const ok = await assignDispatchTechnician(dispatchId, technicianName);
    if (ok) {
      setNotice(`Đã điều động KTV ${technicianName} phụ trách ca cứu hộ!`);
      setTimeout(() => setNotice(null), 3000);
    }
  };

  const handleUpdateTechnicianFee = async (dispatchId: string, fee: number) => {
    await updateDispatchDetails(dispatchId, { technician_fee: fee });
    setNotice(`Đã cập nhật thù lao KTV: ${fee.toLocaleString('vi-VN')} đ`);
    setTimeout(() => setNotice(null), 2500);
  };

  const handleConvertToTicket = async (data: { device_name: string; device_service_tag: string; note: string }) => {
    if (!convertingDispatch) return;
    
    await addServiceTicket({
      ticket_code: `#TN-${Date.now().toString().slice(-6)}`, 
      customer_name: convertingDispatch.customer_name,
      customer_phone: convertingDispatch.customer_phone || convertingDispatch.phone || '',
      customer_address: convertingDispatch.address,
      device_name: data.device_name,
      device_service_tag: data.device_service_tag,
      technician_name: convertingDispatch.technician_name || currentUser.name,
      status: 'received',
      visual_condition: 'Nhận từ ca Cứu hộ Onsite',
      technician_note: data.note,
      estimated_cost: 0,
      total_amount: 0,
    });
    
    await updateDispatchStatus(convertingDispatch.id, 'completed');
    
    setConvertingDispatch(null);
    setNotice('Tạo Phiếu sửa chữa & Hoàn tất Onsite thành công!');
    setTimeout(() => setNotice(null), 3000);
  };

  const activeCount = onsiteDispatches.filter((d) => {
    const norm = normalizeStatus(d.status);
    return norm !== 'completed' && norm !== 'cancelled';
  }).length;

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
            Điều Phối Cứu Hộ Tận Nơi (Onsite)
            <span className="text-xs px-2.5 py-1 bg-indigo-100 text-indigo-700 font-semibold rounded-full">
              {activeCount} ca đang chạy
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quy trình điều phối tinh gọn 4 bước: Tiếp nhận ➔ Di chuyển ➔ Xử lý tại chỗ ➔ Hoàn tất ca.
          </p>
        </div>
      </div>

      {/* Stepper Guide Banner */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ONSITE_STEPS.map((step) => {
            const count = onsiteDispatches.filter((d) => normalizeStatus(d.status) === step.id).length;
            const isFilterActive = filterStatus === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setFilterStatus(filterStatus === step.id ? 'all' : step.id)}
                className={`text-left p-3 rounded-xl border transition-all ${
                  isFilterActive
                    ? 'bg-white border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                    : 'bg-white/70 hover:bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Bước {step.step}
                  </span>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                      count > 0 ? `${step.bg} ${step.text}` : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-800">{step.shortLabel}</div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">{step.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            filterStatus === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tất cả ({onsiteDispatches.length})
        </button>
        {ONSITE_STEPS.map((tab) => {
          const count = onsiteDispatches.filter((d) => normalizeStatus(d.status) === tab.id).length;
          return (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                filterStatus === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  filterStatus === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
        <button
          onClick={() => setFilterStatus('cancelled')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            filterStatus === 'cancelled'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <span>Đã hủy</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              filterStatus === 'cancelled' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {onsiteDispatches.filter((d) => normalizeStatus(d.status) === 'cancelled').length}
          </span>
        </button>
      </div>

      {/* Empty State */}
      {filteredDispatches.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-xl">
            🛵
          </div>
          <p className="font-semibold text-slate-700">Không có ca cứu hộ nào trong mục này</p>
          <p className="text-xs text-slate-400 mt-1">Các ca đặt lịch cứu hộ tận nơi mới sẽ tự động hiển thị tại đây.</p>
        </div>
      )}

      {/* Dispatch Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDispatches.map((dispatch) => {
          const normStatus = normalizeStatus(dispatch.status);
          const cfg = STATUS_CONFIG[normStatus] || STATUS_CONFIG.pending;
          const currentStepIdx = ONSITE_STEPS.findIndex((s) => s.id === normStatus);
          const currentStepConfig = ONSITE_STEPS[currentStepIdx] || ONSITE_STEPS[0];
          const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            dispatch.address
          )}`;

          return (
            <div
              key={dispatch.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3.5">
                {/* Header card */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600">
                        {dispatch.ticket_code || `#OS-${dispatch.id.slice(0, 6)}`}
                      </span>
                      {dispatch.urgency === 'urgent' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-100 text-red-700 rounded border border-red-200 animate-pulse">
                          Khẩn cấp
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mt-0.5">
                      {dispatch.customer_name}
                    </h3>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${cfg.bg} ${cfg.text} ${cfg.border}`}
                  >
                    {cfg.label}
                  </span>
                </div>

                {/* 4-Step Visual Progress Stepper */}
                {normStatus !== 'cancelled' ? (
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                      <span>Tiến độ 4 bước:</span>
                      <span className="text-slate-700">
                        Bước {currentStepConfig.step}/4: {currentStepConfig.shortLabel}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {ONSITE_STEPS.map((s, idx) => {
                        const isDone = currentStepIdx > idx;
                        const isCurrent = currentStepIdx === idx;
                        return (
                          <div
                            key={s.id}
                            title={`Bước ${s.step}: ${s.label}`}
                            className={`h-2 rounded-full transition-all ${
                              isCurrent
                                ? `${s.badgeBg} ring-2 ring-blue-400/40 animate-pulse`
                                : isDone
                                ? 'bg-emerald-500'
                                : 'bg-slate-200'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="bg-rose-50 p-2 rounded-lg border border-rose-200 text-rose-700 text-xs font-semibold text-center">
                    Ca cứu hộ này đã bị hủy
                  </div>
                )}

                {/* Contact phone & Scheduled time */}
                <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">SĐT:</span>
                    <a
                      href={`tel:${dispatch.customer_phone || dispatch.phone}`}
                      className="font-mono font-bold text-blue-700 hover:underline"
                    >
                      {dispatch.customer_phone || dispatch.phone || 'Chưa có'}
                    </a>
                  </div>
                  {dispatch.scheduled_time && (
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">Hẹn:</span>
                      <span className="font-semibold text-slate-800 font-mono">
                        {dispatch.scheduled_time}
                      </span>
                    </div>
                  )}
                </div>

                {/* Address & Distance */}
                <div className="space-y-1 text-xs">
                  <div className="text-slate-700">
                    <span className="font-medium text-slate-400">Địa chỉ: </span>
                    <span className="font-medium text-slate-800">{dispatch.address}</span>
                  </div>
                  {(dispatch.distance_km || dispatch.estimated_arrival_minutes) && (
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                      {dispatch.distance_km && (
                        <span>
                          Khoảng cách: <strong className="text-slate-800">{dispatch.distance_km} km</strong>
                        </span>
                      )}
                      {dispatch.distance_km && dispatch.estimated_arrival_minutes && <span>•</span>}
                      {dispatch.estimated_arrival_minutes && (
                        <span>
                          Dự kiến đến: <strong className="text-blue-700">{dispatch.estimated_arrival_minutes} phút</strong>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Issue Note */}
                <div className="bg-amber-50/60 border border-amber-100 p-2.5 rounded-xl text-xs text-amber-900">
                  <span className="font-semibold block mb-0.5 text-amber-800">Mô tả sự cố:</span>
                  <p className="leading-relaxed">{dispatch.issue_summary || dispatch.issue_description || 'Kiểm tra máy tận nơi'}</p>
                </div>

                {/* Technician assigned */}
                <div className="text-xs text-slate-600 space-y-1 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">KTV điều động:</span>
                    {availableTechnicians.find((u) => u.name === dispatch.technician_name)?.role === 'outsourced' && (
                      <span className="text-[10px] text-amber-800 bg-amber-100 font-bold px-1.5 py-0.2 rounded border border-amber-200">
                        Thuê Ngoài
                      </span>
                    )}
                  </div>
                  {canAssignTasks() ? (
                    <select
                      value={dispatch.technician_name}
                      onChange={(e) => handleAssignTechnician(dispatch.id, e.target.value)}
                      className="w-full text-xs font-semibold bg-white border border-slate-300 text-slate-800 rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none shadow-2xs"
                    >
                      <option value="">-- Chưa gán KTV --</option>
                      <optgroup label="KTV Nội Bộ">
                        {availableTechnicians
                          .filter((u) => u.role !== 'outsourced')
                          .map((u) => (
                            <option key={u.id} value={u.name}>
                              {u.name} {u.role === 'admin' ? '(Admin)' : ''}
                            </option>
                          ))}
                      </optgroup>
                      <optgroup label="KTV Thuê Ngoài / Đối Tác">
                        {availableTechnicians
                          .filter((u) => u.role === 'outsourced')
                          .map((u) => (
                            <option key={u.id} value={u.name}>
                              {u.name} (Thuê Ngoài)
                            </option>
                          ))}
                      </optgroup>
                    </select>
                  ) : (
                    <span className="font-semibold text-slate-800 block">{dispatch.technician_name || 'Chưa gán KTV'}</span>
                  )}
                </div>

                {/* Technician Fee (Thù lao / Tiền công ca) */}
                <div className="bg-emerald-50/70 border border-emerald-200 p-2.5 rounded-xl text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900 flex items-center gap-1">
                      <span>💵 Tiền công KTV:</span>
                    </span>
                    {dispatch.fee_synced_to_payroll ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-full border border-emerald-300 flex items-center gap-1">
                        ✓ Đã cộng vào lương
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-700 font-medium">
                        Tự cộng khi Hoàn tất
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        step="10000"
                        min="0"
                        value={dispatch.technician_fee ?? 0}
                        onChange={(e) => handleUpdateTechnicianFee(dispatch.id, Number(e.target.value))}
                        disabled={dispatch.fee_synced_to_payroll}
                        placeholder="0"
                        className="w-full pl-2 pr-7 py-1 bg-white border border-emerald-300 rounded-lg text-xs font-mono font-bold text-emerald-950 focus:ring-1 focus:ring-emerald-500 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                      />
                      <span className="absolute right-2 top-1 text-[11px] font-bold text-emerald-700 pointer-events-none">
                        đ
                      </span>
                    </div>

                    {!dispatch.fee_synced_to_payroll && (
                      <div className="flex items-center gap-1">
                        {[50000, 100000, 150000].map((fee) => (
                          <button
                            key={fee}
                            type="button"
                            onClick={() => handleUpdateTechnicianFee(dispatch.id, fee)}
                            className={`px-1.5 py-1 text-[10px] font-bold rounded border transition-colors ${
                              dispatch.technician_fee === fee
                                ? 'bg-emerald-700 text-white border-emerald-700'
                                : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                            }`}
                          >
                            {fee / 1000}k
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Actions Footer */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                {/* Primary Quick Action Button */}
                {currentStepConfig.nextStatus && normStatus !== 'cancelled' && (
                  <button
                    onClick={() => handleStatusChange(dispatch.id, currentStepConfig.nextStatus!)}
                    className="w-full py-2 px-3 text-xs font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-xs shadow-blue-500/20"
                  >
                    <span>{currentStepConfig.nextAction}</span>
                  </button>
                )}

                {/* Sub-actions & Quick Status selector */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span>📍 Bản đồ</span>
                    </a>
                    {normStatus === 'in_progress' && (
                      <button
                        onClick={() => setConvertingDispatch(dispatch)}
                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-colors border border-indigo-200"
                        title="Tạo phiếu biên nhận để mang máy về phòng kỹ thuật"
                      >
                        📦 Nhận Máy Về
                      </button>
                    )}
                  </div>

                  {/* Status Dropdown (Tối giản 4 bước) */}
                  <select
                    value={normStatus}
                    onChange={(e) =>
                      handleStatusChange(dispatch.id, e.target.value as OnsiteDispatchStatus)
                    }
                    className="text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    <option value="pending">Bước 1: Chờ điều phối</option>
                    <option value="dispatched">Bước 2: Đang di chuyển</option>
                    <option value="in_progress">Bước 3: Đang xử lý</option>
                    <option value="completed">Bước 4: Hoàn tất</option>
                    <option value="cancelled">-- Hủy ca --</option>
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {convertingDispatch && (
        <ConvertOnsiteModal 
          dispatch={convertingDispatch}
          onClose={() => setConvertingDispatch(null)}
          onConfirm={handleConvertToTicket}
        />
      )}
    </div>
  );
}


function ConvertOnsiteModal({
  dispatch,
  onClose,
  onConfirm,
}: {
  dispatch: OnsiteDispatch;
  onClose: () => void;
  onConfirm: (data: { device_name: string; device_service_tag: string; note: string }) => void;
}) {
  const [deviceName, setDeviceName] = useState('');
  const [deviceTag, setDeviceTag] = useState('');
  const [note, setNote] = useState(dispatch.issue_summary || dispatch.issue_description || '');

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4 text-left">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-1">Nhận Máy Về Tiệm (Tạo Phiếu)</h3>
        <p className="text-xs text-slate-500 mb-4">
          Tạo nhanh Phiếu Sửa Chữa từ khách hàng <strong>{dispatch.customer_name}</strong>.
        </p>

        <div className="space-y-3 mt-4 text-sm">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tên thiết bị nhận về</label>
            <input
              type="text"
              required
              placeholder="VD: Laptop Dell Latitude 7490"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Serial / Service Tag</label>
            <input
              type="text"
              required
              placeholder="S/N của máy để bảo hành sau này"
              value={deviceTag}
              onChange={(e) => setDeviceTag(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 uppercase"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú & Tình trạng lúc nhận</label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 border rounded-lg">Hủy</button>
          <button
            disabled={!deviceName || !deviceTag}
            onClick={() => onConfirm({ device_name: deviceName, device_service_tag: deviceTag, note })}
            className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg font-bold disabled:opacity-50"
          >
            Tạo & Hoàn tất Onsite
          </button>
        </div>
      </div>
    </div>
  );
}
