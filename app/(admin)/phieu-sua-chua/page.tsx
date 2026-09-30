'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/lib/store';
import { ServiceTicket } from '@/lib/supabase';
import { TicketDetailModal } from '@/components/admin/TicketDetailModal';

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

function PhieuSuaChuaContent() {
  const {
    tickets,
    users,
    currentUser,
    canUpdateRepairStatus,
    canAssignTasks,
    updateTicketStatus,
    assignTicketTechnician,
  } = useStore();

  const searchParams = useSearchParams();
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Sync ticketId from URL query param
  useEffect(() => {
    const ticketIdParam = searchParams.get('ticketId') || searchParams.get('id') || searchParams.get('code');
    if (ticketIdParam) {
      const match = tickets.find((t) => t.id === ticketIdParam || t.ticket_code === ticketIdParam);
      if (match) {
        setSelectedTicketId(match.id);
      }
    }
  }, [searchParams, tickets]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'counter' | 'onsite'>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const availableTechnicians = useMemo(() => {
    return users.filter((u) => u.role === 'technician' || u.role === 'outsourced' || u.role === 'admin');
  }, [users]);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const q = searchQuery.toLowerCase();
      const model = (t.device_model || t.device_name || '').toLowerCase();
      const tag = (t.service_tag || t.device_service_tag || '').toLowerCase();
      const tech = (t.technician_name || '').toLowerCase();
      const matchesSearch =
        t.ticket_code.toLowerCase().includes(q) ||
        t.customer_name.toLowerCase().includes(q) ||
        t.customer_phone.includes(q) ||
        model.includes(q) ||
        tag.includes(q) ||
        tech.includes(q);

      const matchesStatus = selectedStatus === 'all' ? true : t.status === selectedStatus;
      const type = t.ticket_type || (t.reception_mode === 'mobile' ? 'onsite' : 'counter');
      const matchesType = selectedType === 'all' ? true : type === selectedType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [tickets, searchQuery, selectedStatus, selectedType]);

  // Status counters
  const stats = useMemo(() => {
    const total = tickets.length;
    const inProgress = tickets.filter((t) => t.status === 'in_progress' || t.status === 'diagnosing').length;
    const ready = tickets.filter((t) => t.status === 'ready').length;
    const estimatedRev = tickets
      .filter((t) => t.status !== 'cancelled')
      .reduce((sum, t) => sum + (t.actual_cost ?? t.estimated_cost ?? t.total_amount ?? 0), 0);
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

  // Xuất file CSV / Excel
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
      t.actual_cost ?? t.estimated_cost ?? t.total_amount ?? 0,
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
    <div className="space-y-6 font-sans">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="fixed top-20 right-6 z-50 bg-white text-slate-900 px-4 py-3 rounded-xl shadow-2xl border-2 border-blue-600 flex items-center gap-2">
          <span className="text-xs font-semibold">{actionNotice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Phiếu Sửa Chữa
            <span className="text-xs px-2.5 py-1 bg-blue-100 text-blue-700 font-semibold rounded-full">
              {tickets.length} phiếu
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
          >
            Xuất Excel (CSV)
          </button>
          <Link
            href="/phieu-sua-chua/tao-moi"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-all active:scale-95"
          >
            + Tạo phiếu mới
          </Link>
        </div>
      </div>

      {/* Role Notice */}
      {!canUpdateRepairStatus() && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
          Tài khoản <span className="font-semibold">{currentUser.name}</span> (Kinh doanh) — Được phép tạo phiếu và xem, quyền sửa trạng thái thuộc về Kỹ thuật viên.
        </div>
      )}

      {/* Stats Summary (Loại bỏ hoàn toàn các ô khung rỗng) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Tổng phiếu</div>
          <div className="text-xl font-bold text-slate-900 font-mono mt-1">{stats.total}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Đang sửa</div>
          <div className="text-xl font-bold text-amber-700 font-mono mt-1">{stats.inProgress}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Chờ giao</div>
          <div className="text-xl font-bold text-emerald-700 font-mono mt-1">{stats.ready}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Dự kiến thu</div>
          <div className="text-xl font-bold text-indigo-700 font-mono mt-1">
            {stats.estimatedRev.toLocaleString('vi-VN')} đ
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm mã phiếu, khách hàng, SĐT, tag..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
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

          {/* Type tabs (Counter / Onsite) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 font-semibold rounded-md transition-colors ${
                selectedType === 'all' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setSelectedType('counter')}
              className={`px-3 py-1.5 font-semibold rounded-md transition-colors ${
                selectedType === 'counter' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              Tại quầy
            </button>
            <button
              onClick={() => setSelectedType('onsite')}
              className={`px-3 py-1.5 font-semibold rounded-md transition-colors ${
                selectedType === 'onsite' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              Tận nơi
            </button>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs overflow-x-auto">
          <span className="text-slate-400 font-medium whitespace-nowrap">Trạng thái:</span>
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
              className={`px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-all ${
                selectedStatus === st.id
                  ? 'bg-blue-600 text-white'
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
                <th className="py-3 px-4">Mã Phiếu</th>
                <th className="py-3 px-4">Khách Hàng</th>
                <th className="py-3 px-4">Thiết Bị</th>
                <th className="py-3 px-4">Hình Thức</th>
                <th className="py-3 px-4">Mô Tả Lỗi</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4">KTV</th>
                <th className="py-3 px-4 text-right">Chi Phí</th>
                <th className="py-3 px-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Không tìm thấy phiếu sửa chữa nào.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => {
                  const statusInfo = STATUS_LABELS[ticket.status] || STATUS_LABELS.received;

                  return (
                    <tr key={ticket.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Ticket Code & Date */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-blue-600">
                          {ticket.ticket_code}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString('vi-VN') : 'Hôm nay'}
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{ticket.customer_name}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {ticket.customer_phone}
                        </div>
                      </td>

                      {/* Device & Service Tag */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">
                          {ticket.device_model || ticket.device_name || 'Thiết bị tiếp nhận'}
                        </div>
                        {(ticket.service_tag || ticket.device_service_tag) && (
                          <div className="inline-block text-[11px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded mt-0.5">
                            Tag: {ticket.service_tag || ticket.device_service_tag}
                          </div>
                        )}
                      </td>

                      {/* Ticket Type & Service Category */}
                      <td className="py-3.5 px-4 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            ticket.service_category === 'bao_hanh'
                              ? 'bg-purple-100 text-purple-700 border border-purple-200'
                              : 'bg-blue-100 text-blue-700 border border-blue-200'
                          }`}>
                            {ticket.service_category === 'bao_hanh' ? 'Bảo Hành' : 'Sửa Chữa'}
                          </span>

                          {ticket.ticket_type === 'onsite' || ticket.reception_mode === 'mobile' ? (
                            <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
                              Tận nơi
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                              Tại quầy
                            </span>
                          )}
                        </div>

                        {ticket.estimated_completion && (
                          <div className="text-[10px] text-slate-500 font-mono">
                            Hạn: {(() => {
                              const d = new Date(ticket.estimated_completion);
                              return !isNaN(d.getTime())
                                ? `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} ${d.toLocaleDateString('vi-VN')}`
                                : ticket.estimated_completion;
                            })()}
                          </div>
                        )}
                      </td>

                      {/* Issue Description */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-slate-600 line-clamp-2">
                          {ticket.issue_description || ticket.issueDescription || ticket.visual_condition || 'Không có mô tả'}
                        </p>
                        {ticket.parts_used && ticket.parts_used.length > 0 && (
                          <div className="text-[10px] text-blue-600 mt-0.5">
                            + {ticket.parts_used.length} linh kiện/dịch vụ
                          </div>
                        )}
                      </td>

                      {/* Status Dropdown / Badge (RBAC Checked) */}
                      <td className="py-3.5 px-4">
                        {canUpdateRepairStatus() ? (
                          <select
                            value={ticket.status}
                            onChange={(e) =>
                              handleStatusChange(ticket.id, e.target.value as ServiceTicket['status'])
                            }
                            className={`text-xs font-semibold px-2 py-1 rounded-md border cursor-pointer focus:outline-none focus:ring-1 ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                          >
                            <option value="received">Tiếp nhận mới</option>
                            <option value="diagnosing">Đang kiểm tra / QC</option>
                            <option value="in_progress">Đang sửa chữa</option>
                            <option value="ready">Đã xong (Chờ giao)</option>
                            <option value="delivered">Đã bàn giao khách</option>
                            <option value="cancelled">Hủy phiếu</option>
                          </select>
                        ) : (
                          <div
                            className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${statusInfo.bg} ${statusInfo.text}`}
                            title="Kinh doanh không có quyền đổi trạng thái sửa chữa"
                          >
                            {statusInfo.label}
                          </div>
                        )}
                      </td>

                      {/* Tech in charge */}
                      <td className="py-3.5 px-4 text-slate-600">
                        {canAssignTasks() ? (
                          <div className="flex flex-col gap-1">
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
                              className="text-xs font-semibold bg-white border border-slate-200 text-slate-800 rounded-lg px-2 py-1 focus:ring-1 focus:ring-blue-500 outline-none w-full max-w-[180px]"
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
                            {availableTechnicians.find((u) => u.name === ticket.technician_name)?.role === 'outsourced' && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-semibold bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                Thuê ngoài
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-slate-800 font-medium">{ticket.technician_name}</span>
                            {availableTechnicians.find((u) => u.name === ticket.technician_name)?.role === 'outsourced' && (
                              <span className="text-[10px] text-amber-700 bg-amber-50 px-1 rounded border border-amber-200">
                                Thuê ngoài
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Cost */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-bold text-slate-900 font-mono">
                          {(ticket.actual_cost ?? ticket.estimated_cost ?? ticket.total_amount ?? 0).toLocaleString('vi-VN')} đ
                        </div>
                        {ticket.actual_cost && ticket.actual_cost !== ticket.estimated_cost && (
                          <div className="text-[10px] text-slate-400 line-through font-mono">
                            {(ticket.estimated_cost ?? 0).toLocaleString('vi-VN')} đ
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedTicketId(ticket.id)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 hover:border-blue-600 rounded-lg text-xs font-bold transition-all shadow-2xs"
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

      {/* Ticket Detail Modal */}
      {selectedTicketId && (
        <TicketDetailModal
          ticketId={selectedTicketId}
          onClose={() => setSelectedTicketId(null)}
        />
      )}
    </div>
  );
}

export default function PhieuSuaChuaPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-500 text-sm font-medium">
          Đang tải dữ liệu phiếu sửa chữa...
        </div>
      }
    >
      <PhieuSuaChuaContent />
    </Suspense>
  );
}
