'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { ServiceTicket } from '@/lib/supabase';
import { TicketDetailModal } from '@/components/admin/TicketDetailModal';

// Số tiền dự kiến thu của phiếu = tiền công + linh kiện (đúng định nghĩa
// trong modal phiếu). Chỉ khi cả hai đều 0 mới lùi về total_amount rồi
// estimated_cost. Dùng `??` trực tiếp trên actual_cost là sai vì actual_cost
// lưu 0 (không phải null) ở mọi phiếu chưa sửa tiền → danh sách hiện 0đ
// cho tất cả phiếu dù linh kiện/tổng tiền đã có.
function ticketExpectedAmount(t: ServiceTicket): number {
  const partsTotal = (t.parts_used || []).reduce(
    (sum, p) => sum + (p.price || 0) * (p.quantity || 1),
    0
  );
  const labor = t.actual_cost || 0;
  if (partsTotal > 0 || labor > 0) return partsTotal + labor;
  return t.total_amount || t.estimated_cost || 0;
}

const STATUS_LABELS: Record<ServiceTicket['status'], { label: string; bg: string; text: string; border: string }> = {
  received: { label: 'Tiếp nhận mới', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  diagnosing: { label: 'Đang kiểm tra / QC', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  in_progress: { label: 'Đang sửa chữa', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  processing: { label: 'Đang xử lý kỹ thuật', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  ready: { label: 'Đã xử lý xong (Chờ giao)', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  ready_deliver: { label: 'Sẵn sàng bàn giao', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  delivered: { label: 'Đã bàn giao khách', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
  completed: { label: 'Hoàn tất nghiệm thu', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
  cancelled: { label: 'Hủy phiếu', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};
export default function CounterRepairTab({
  selectedTicketIdFromUrl,
}: {
  selectedTicketIdFromUrl?: string | null;
}) {
  const {
    tickets,
    users,
    currentUser,
    canUpdateRepairStatus,
    canAssignTasks,
    updateTicketStatus,
    assignTicketTechnician,
  } = useStore();

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(selectedTicketIdFromUrl || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'counter' | 'onsite'>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const availableTechnicians = useMemo(() => {
    return users.filter((u) => u.role === 'technician' || u.role === 'outsourced' || u.role === 'salesman' || u.role === 'admin' || u.role === 'tech_manager');
  }, [users]);

  const filteredTickets = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return tickets.filter((t) => {
      const matchesSearch =
        t.ticket_code.toLowerCase().includes(q) ||
        t.customer_name.toLowerCase().includes(q) ||
        t.customer_phone.includes(q) ||
        (t.device_model || t.device_name || '').toLowerCase().includes(q) ||
        (t.device_service_tag || t.service_tag || '').toLowerCase().includes(q) ||
        (t.technician_name || '').toLowerCase().includes(q);

      const matchesStatus = selectedStatus === 'all' ? true : t.status === selectedStatus;
      const type = t.ticket_type || (t.reception_mode === 'mobile' ? 'onsite' : 'counter');
      const matchesType = selectedType === 'all' ? true : type === selectedType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [tickets, searchQuery, selectedStatus, selectedType]);

  const stats = useMemo(() => {
    const total = tickets.length;
    const inProgress = tickets.filter((t) => t.status === 'in_progress' || t.status === 'diagnosing').length;
    const ready = tickets.filter((t) => t.status === 'ready').length;
    const estimatedRev = tickets
      .filter((t) => t.status !== 'cancelled')
      .reduce((sum, t) => sum + ticketExpectedAmount(t), 0);
    return { total, inProgress, ready, estimatedRev };
  }, [tickets]);

  const handleStatusChange = async (ticketId: string, newStatus: ServiceTicket['status']) => {
    if (!canUpdateRepairStatus()) {
      alert('Quyền bị từ chối: Nhân viên Kinh doanh không có quyền điều chỉnh trạng thái kỹ thuật!');
      return;
    }
    const success = await updateTicketStatus(ticketId, newStatus);
    if (success) {
      setActionNotice('Đã cập nhật trạng thái phiếu sửa chữa thành công!');
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Mã Phiếu', 'Khách Hàng', 'Số Điện Thoại', 'Thiết Bị', 'Hình Thức', 'Mô Tả Lỗi', 'Trạng Thái', 'Kỹ Thuật Viên', 'Chi Phí (VNĐ)'];
    const rows = filteredTickets.map((t) => [
      t.ticket_code,
      `"${t.customer_name}"`,
      `"${t.customer_phone}"`,
      `"${t.device_model || t.device_name || ''}"`,
      t.ticket_type === 'onsite' ? 'Tận nơi' : 'Tại quầy',
      `"${(t.issue_description || '').replace(/"/g, '""')}"`,
      STATUS_LABELS[t.status]?.label || t.status,
      `"${t.technician_name || ''}"`,
      ticketExpectedAmount(t),
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Phieu_Sua_Chua_ViTinhAnTam_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {actionNotice && (
        <div className="fixed top-20 right-6 z-50 bg-white text-slate-900 px-4 py-3 rounded-xl shadow-2xl border-2 border-blue-600 flex items-center gap-2">
          <span className="text-xs font-semibold">{actionNotice}</span>
        </div>
      )}

      {/* Role Notice */}
      {!canUpdateRepairStatus() && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
          Tài khoản <span className="font-semibold">{currentUser.name}</span> (Kinh doanh) — Được phép tạo phiếu và xem, quyền sửa trạng thái thuộc về Kỹ thuật viên.
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Tổng phiếu</div>
          <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">{stats.total}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Đang sửa chữa / QC</div>
          <div className="text-xl font-bold text-amber-700 font-mono mt-0.5">{stats.inProgress}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Chờ giao khách</div>
          <div className="text-xl font-bold text-emerald-700 font-mono mt-0.5">{stats.ready}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Dự kiến thu</div>
          <div className="text-xl font-bold text-indigo-700 font-mono mt-0.5">
            {stats.estimatedRev.toLocaleString('vi-VN')} đ
          </div>
        </div>
      </div>

      {/* Filters & Actions bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm mã phiếu, khách hàng, SĐT, tag..."
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-2.5 py-1 font-semibold rounded-md transition-colors ${
                  selectedType === 'all' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setSelectedType('counter')}
                className={`px-2.5 py-1 font-semibold rounded-md transition-colors ${
                  selectedType === 'counter' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                Tại quầy
              </button>
              <button
                onClick={() => setSelectedType('onsite')}
                className={`px-2.5 py-1 font-semibold rounded-md transition-colors ${
                  selectedType === 'onsite' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                Tận nơi
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              Xuất CSV
            </button>
            <Link
              href="/phieu-sua-chua/tao-moi"
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-all"
            >
              + Tạo phiếu
            </Link>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 text-xs overflow-x-auto">
          <span className="text-slate-400 font-medium whitespace-nowrap text-[11px]">Trạng thái:</span>
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'received', label: 'Tiếp nhận' },
            { id: 'diagnosing', label: 'Đang QC / Test' },
            { id: 'in_progress', label: 'Đang sửa' },
            { id: 'ready', label: 'Xong chờ giao' },
            { id: 'delivered', label: 'Đã bàn giao' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStatus(st.id)}
              className={`px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap text-[11px] transition-all cursor-pointer ${
                selectedStatus === st.id
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>
      {/* Tickets Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-3">Mã Phiếu</th>
                <th className="py-2.5 px-3">Khách Hàng</th>
                <th className="py-2.5 px-3">Thiết Bị</th>
                <th className="py-2.5 px-3">Hình Thức</th>
                <th className="py-2.5 px-3">Mô Tả Lỗi</th>
                <th className="py-2.5 px-3">Trạng Thái</th>
                <th className="py-2.5 px-3">KTV</th>
                <th className="py-2.5 px-3 text-right">Chi Phí</th>
                <th className="py-2.5 px-3 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Không tìm thấy phiếu sửa chữa nào.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => {
                  const statusInfo = STATUS_LABELS[ticket.status] || {
                    label: ticket.status,
                    bg: 'bg-slate-100',
                    text: 'text-slate-700',
                    border: 'border-slate-200',
                  };
                  return (
                    <tr key={ticket.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-blue-600">
                        {ticket.ticket_code}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{ticket.customer_name}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">{ticket.customer_phone}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800">{ticket.device_model || ticket.device_name || 'Thiết bị'}</div>
                        {(ticket.service_tag || ticket.device_service_tag) && (
                          <div className="inline-block text-[10px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded mt-0.5">
                            Tag: {ticket.service_tag || ticket.device_service_tag}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          ticket.ticket_type === 'onsite' || ticket.reception_mode === 'mobile'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {ticket.ticket_type === 'onsite' || ticket.reception_mode === 'mobile' ? 'Tận nơi' : 'Tại quầy'}
                        </span>
                      </td>
                      <td className="py-3 px-3 max-w-xs">
                        <p className="text-slate-600 line-clamp-2 text-[11px]">
                          {ticket.issue_description || ticket.visual_condition || 'Không có mô tả'}
                        </p>
                      </td>

                      <td className="py-3 px-3">
                        {canUpdateRepairStatus() ? (
                          <select
                            value={ticket.status}
                            onChange={(e) => handleStatusChange(ticket.id, e.target.value as ServiceTicket['status'])}
                            className={`text-xs font-semibold px-2 py-1 rounded-md border cursor-pointer focus:outline-none ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                          >
                            <option value="received">Tiếp nhận mới</option>
                            <option value="diagnosing">Đang kiểm tra / QC</option>
                            <option value="in_progress">Đang sửa chữa</option>
                            <option value="ready">Đã xong (Chờ giao)</option>
                            <option value="delivered">Đã bàn giao khách</option>
                            <option value="cancelled">Hủy phiếu</option>
                          </select>
                        ) : (
                          <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
                            {statusInfo.label}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {canAssignTasks() ? (
                          <select
                            value={ticket.technician_name}
                            onChange={async (e) => {
                              const techName = e.target.value;
                              const ok = await assignTicketTechnician(ticket.id, techName);
                              if (ok) {
                                setActionNotice(`Đã phân bổ phiếu ${ticket.ticket_code} cho ${techName}!`);
                                setTimeout(() => setActionNotice(null), 3000);
                              }
                            }}
                            className="text-xs font-medium bg-white border border-slate-200 text-slate-800 rounded px-1.5 py-1 outline-none w-full max-w-[140px]"
                          >
                            {availableTechnicians.map((u) => (
                              <option key={u.id} value={u.name}>
                                {u.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs font-medium text-slate-800">{ticket.technician_name}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 font-mono">
                        {ticketExpectedAmount(ticket).toLocaleString('vi-VN')} đ
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedTicketId(ticket.id)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 hover:border-blue-600 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        >
                          Mở Phiếu
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTicketId && (
        <TicketDetailModal
          ticketId={selectedTicketId}
          onClose={() => setSelectedTicketId(null)}
        />
      )}
    </div>
  );
}