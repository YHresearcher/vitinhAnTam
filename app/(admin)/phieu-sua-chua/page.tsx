'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { ServiceTicket } from '@/lib/supabase';
import {
  Search,
  Plus,
  Wrench,
  Clock,
  CheckCircle2,
  Phone,
  Barcode,
  Truck,
  Building,
  Lock,
  Calendar,
  DollarSign,
  User,
  X
} from 'lucide-react';

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

export default function PhieuSuaChuaPage() {
  const {
    tickets,
    currentUser,
    canUpdateRepairStatus,
    updateTicketStatus,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'counter' | 'onsite'>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const q = searchQuery.toLowerCase();
      const model = (t.device_model || t.device_name || '').toLowerCase();
      const tag = (t.service_tag || t.device_service_tag || '').toLowerCase();
      const matchesSearch =
        t.ticket_code.toLowerCase().includes(q) ||
        t.customer_name.toLowerCase().includes(q) ||
        t.customer_phone.includes(q) ||
        model.includes(q) ||
        tag.includes(q);

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

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="fixed top-20 right-6 z-50 bg-white text-slate-900 px-4 py-3 rounded-xl shadow-2xl border-2 border-blue-600 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium">{actionNotice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            QUẢN LÝ PHIẾU DỊCH VỤ & SỬA CHỮA
            <span className="text-xs px-2.5 py-1 bg-blue-100 text-blue-700 font-semibold rounded-full">
              {tickets.length} phiếu
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi tiến độ sửa chữa máy bàn, laptop, bảo dưỡng keo tản nhiệt và cứu hộ Long An - Tây Ninh 10km.
          </p>
        </div>

        <Link
          href="/phieu-sua-chua/tao-moi"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all active:scale-95 whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tạo Phiếu Tiếp Nhận Mới
        </Link>
      </div>

      {/* Role Notice */}
      {!canUpdateRepairStatus() && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800">
            <span className="font-semibold">Phân quyền Kinh doanh ({currentUser.name}):</span>{' '}
            Bạn có quyền tạo phiếu tiếp nhận mới và xem thông tin kỹ thuật, nhưng không có quyền điều chỉnh trạng thái xử lý/chẩn đoán của Kỹ thuật viên.
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Tổng Phiếu Đã Lập</div>
            <div className="text-xl font-bold text-slate-900">{stats.total}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Đang Xử Lý / Kiểm Tra</div>
            <div className="text-xl font-bold text-amber-700">{stats.inProgress}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Chờ Khách Đến Nhận</div>
            <div className="text-xl font-bold text-emerald-700">{stats.ready}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Dự Tính Doanh Thu</div>
            <div className="text-xl font-bold text-indigo-700">
              {stats.estimatedRev.toLocaleString('vi-VN')} đ
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo Mã phiếu, Khách hàng, SĐT, Tag..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Type tabs (Counter / Onsite) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                selectedType === 'all' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              Tất cả hình thức
            </button>
            <button
              onClick={() => setSelectedType('counter')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                selectedType === 'counter' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              Tại Quầy
            </button>
            <button
              onClick={() => setSelectedType('onsite')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                selectedType === 'onsite' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              Tận Nơi 10km
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
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Mã Phiếu & Ngày</th>
                <th className="py-3 px-4">Khách Hàng & SĐT</th>
                <th className="py-3 px-4">Thiết Bị & Tag</th>
                <th className="py-3 px-4">Hình Thức</th>
                <th className="py-3 px-4">Mô Tả Lỗi / Yêu Cầu</th>
                <th className="py-3 px-4">Trạng Thái Xử Lý</th>
                <th className="py-3 px-4">KTV Phụ Trách</th>
                <th className="py-3 px-4 text-right">Chi Phí</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
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
                        <div className="font-mono font-bold text-blue-600 text-xs">
                          {ticket.ticket_code}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString('vi-VN') : 'Hôm nay'}
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{ticket.customer_name}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span className="font-mono">{ticket.customer_phone}</span>
                        </div>
                      </td>

                      {/* Device & Service Tag */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 text-xs">
                          {ticket.device_model || ticket.device_name || 'Thiết bị tiếp nhận'}
                        </div>
                        {(ticket.service_tag || ticket.device_service_tag) && (
                          <div className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mt-0.5">
                            <Barcode className="w-3 h-3 text-slate-400" />
                            {ticket.service_tag || ticket.device_service_tag}
                          </div>
                        )}
                      </td>

                      {/* Ticket Type */}
                      <td className="py-3.5 px-4">
                        {ticket.ticket_type === 'onsite' || ticket.reception_mode === 'mobile' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                            <Truck className="w-3 h-3" /> Tận nơi
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            <Building className="w-3 h-3" /> Tại quầy
                          </span>
                        )}
                      </td>

                      {/* Issue Description */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-xs text-slate-600 line-clamp-2">
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
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${statusInfo.bg} ${statusInfo.text}`}
                            title="Kinh doanh không có quyền đổi trạng thái sửa chữa"
                          >
                            <span>{statusInfo.label}</span>
                            <Lock className="w-3 h-3 text-slate-400" />
                          </div>
                        )}
                      </td>

                      {/* Tech in charge */}
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        <div className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{ticket.technician_name}</span>
                        </div>
                      </td>

                      {/* Cost */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-bold text-slate-900">
                          {(ticket.actual_cost ?? ticket.estimated_cost ?? ticket.total_amount ?? 0).toLocaleString('vi-VN')} đ
                        </div>
                        {ticket.actual_cost && ticket.actual_cost !== ticket.estimated_cost && (
                          <div className="text-[10px] text-slate-400 line-through">
                            {(ticket.estimated_cost ?? 0).toLocaleString('vi-VN')} đ
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
