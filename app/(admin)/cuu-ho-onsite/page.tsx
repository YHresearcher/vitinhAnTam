'use client';

import React, { useState, useMemo } from 'react';
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
  const {
    onsiteDispatches,
    users,
    canAssignTasks,
    updateDispatchStatus,
    assignDispatchTechnician,
    addServiceTicket,
    currentUser,
  } = useStore();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [notice, setNotice] = useState<string | null>(null);
  const [convertingDispatch, setConvertingDispatch] = useState<OnsiteDispatch | null>(null);

  const availableTechnicians = useMemo(() => {
    return users.filter((u) => u.role === 'technician' || u.role === 'outsourced' || u.role === 'admin');
  }, [users]);

  const filteredDispatches = onsiteDispatches.filter((d) =>
    filterStatus === 'all' ? true : d.status === filterStatus
  );

  const handleStatusChange = async (id: string, newStatus: OnsiteDispatch['status']) => {
    await updateDispatchStatus(id, newStatus);
    setNotice('Đã cập nhật trạng thái cứu hộ!');
    setTimeout(() => setNotice(null), 3000);
  };

  const handleAssignTechnician = async (dispatchId: string, technicianName: string) => {
    const ok = await assignDispatchTechnician(dispatchId, technicianName);
    if (ok) {
      setNotice(`Đã điều động KTV ${technicianName} phụ trách ca cứu hộ!`);
      setTimeout(() => setNotice(null), 3000);
    }
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
                <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
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
                      className="w-full text-xs font-semibold bg-white border border-slate-300 text-slate-800 rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none"
                    >
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
                    <span className="font-semibold text-slate-800 block">{dispatch.technician_name}</span>
                  )}
                </div>
              </div>

              {/* Card Actions Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                  >
                    Bản đồ Maps
                  </a>
                  {dispatch.status === 'in_progress' && (
                    <button
                      onClick={() => setConvertingDispatch(dispatch)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-colors border border-indigo-200"
                    >
                      Nhận Máy Về Tiệm
                    </button>
                  )}
                </div>

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
  const [note, setNote] = useState(dispatch.issue_summary || '');

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
