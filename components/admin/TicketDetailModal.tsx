'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useViTinhAnTamStore } from '@/lib/store';
import { ServiceTicket } from '@/lib/supabase';
import {
  X,
  Phone,
  MessageCircle,
  Clock,
  Wrench,
  User,
  AlertTriangle,
  CheckCircle2,
  Printer,
  Plus,
  Trash2,
  Save,
  Cpu,
  FileText,
} from 'lucide-react';

interface TicketDetailModalProps {
  ticketId: string | null;
  onClose: () => void;
  onTicketUpdated?: () => void;
}

const STATUS_FLOW: Array<{ key: ServiceTicket['status']; label: string; desc: string; color: string }> = [
  { key: 'received', label: '1. Tiếp Nhận', desc: 'Đã nhận máy tại quầy/tận nơi', color: 'bg-blue-600' },
  { key: 'diagnosing', label: '2. QC & Kiểm Tra', desc: 'Đang chẩn đoán, test phần cứng', color: 'bg-amber-500' },
  { key: 'in_progress', label: '3. Đang Sửa Chữa', desc: 'KTV đang xử lý linh kiện / OS', color: 'bg-purple-600' },
  { key: 'ready', label: '4. Xong Chờ Giao', desc: 'Đã test ổn định, sẵn sàng trả khách', color: 'bg-emerald-600' },
  { key: 'delivered', label: '5. Đã Bàn Giao', desc: 'Khách đã nhận máy & thanh toán', color: 'bg-slate-700' },
];

export function TicketDetailModal({ ticketId, onClose, onTicketUpdated }: TicketDetailModalProps) {
  const {
    tickets,
    users,
    canUpdateRepairStatus,
    canAssignTasks,
    updateTicketDetails,
    updateTicketStatus,
    assignTicketTechnician,
  } = useViTinhAnTamStore();

  const ticket = useMemo(() => {
    if (!ticketId) return null;
    return tickets.find((t) => t.id === ticketId || t.ticket_code === ticketId) || null;
  }, [tickets, ticketId]);

  const [status, setStatus] = useState<ServiceTicket['status']>('received');
  const [technicianName, setTechnicianName] = useState('');
  const [technicianNote, setTechnicianNote] = useState('');
  const [technicianFee, setTechnicianFee] = useState<number>(0);
  const [actualCost, setActualCost] = useState<number>(0);
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [estimatedCompletion, setEstimatedCompletion] = useState('');
  const [parts, setParts] = useState<Array<{ part_name: string; quantity: number; price: number; warranty_months?: number }>>([]);
  const [newPartName, setNewPartName] = useState('');
  const [newPartQty, setNewPartQty] = useState(1);
  const [newPartPrice, setNewPartPrice] = useState<number>(0);
  const [newPartWarranty] = useState<number>(12);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const availableTechnicians = useMemo(() => {
    return users.filter((u) => u.role === 'technician' || u.role === 'outsourced' || u.role === 'salesman' || u.role === 'admin');
  }, [users]);

  useEffect(() => {
    if (ticket) {
      setStatus(ticket.status || 'received');
      setTechnicianName(ticket.technician_name || '');
      setTechnicianNote(ticket.technician_note || '');
      setTechnicianFee(ticket.technician_fee ?? 0);
      setActualCost(ticket.actual_cost ?? ticket.total_amount ?? 0);
      setEstimatedCost(ticket.estimated_cost ?? 0);
      setEstimatedCompletion(ticket.estimated_completion || '');
      setParts(ticket.parts_used || []);
      setSaveSuccessMsg(null);
    }
  }, [ticket]);
  const deadlineInfo = useMemo(() => {
    if (!ticket) return null;
    const now = new Date();
    let targetDate: Date;

    if (ticket.estimated_completion) {
      const parsed = new Date(ticket.estimated_completion);
      if (!isNaN(parsed.getTime())) {
        targetDate = parsed;
      } else {
        const parts = ticket.estimated_completion.match(/(\d{1,2}):(\d{1,2})\s+(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (parts) {
          targetDate = new Date(Number(parts[5]), Number(parts[4]) - 1, Number(parts[3]), Number(parts[1]), Number(parts[2]));
        } else {
          targetDate = new Date(ticket.created_at || now);
          targetDate.setDate(targetDate.getDate() + 3);
        }
      }
    } else {
      targetDate = new Date(ticket.created_at || now);
      targetDate.setDate(targetDate.getDate() + 3);
    }

    const diffMs = targetDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const isOverdue = diffHours < 0 && ticket.status !== 'completed' && ticket.status !== 'delivered';

    let text = '';
    if (ticket.status === 'completed' || ticket.status === 'delivered') {
      text = 'Đã hoàn tất bàn giao';
    } else if (isOverdue) {
      const absHours = Math.abs(diffHours);
      if (absHours < 24) {
        text = `Quá hạn ${Math.round(absHours)} giờ!`;
      } else {
        text = `Quá hạn ${Math.floor(absHours / 24)} ngày ${Math.round(absHours % 24)}h!`;
      }
    } else if (diffHours < 24) {
      const hours = Math.floor(diffHours);
      const mins = Math.round((diffHours - hours) * 60);
      text = `Còn ${hours}h ${mins}p`;
    } else {
      const days = Math.floor(diffHours / 24);
      const hours = Math.round(diffHours % 24);
      text = `Còn ${days} ngày ${hours}h`;
    }

    return { targetDate, isOverdue, text, diffHours };
  }, [ticket]);

  if (!ticketId || !ticket) {
    return null;
  }

  const handleAddPart = () => {
    if (!newPartName.trim()) return;
    setParts((prev) => [
      ...prev,
      {
        part_name: newPartName.trim(),
        quantity: Number(newPartQty) || 1,
        price: Number(newPartPrice) || 0,
        warranty_months: Number(newPartWarranty) || 12,
      },
    ]);
    setNewPartName('');
    setNewPartQty(1);
    setNewPartPrice(0);
  };

  const handleRemovePart = (index: number) => {
    setParts((prev) => prev.filter((_, i) => i !== index));
  };

  const partsTotal = parts.reduce((sum, p) => sum + p.price * p.quantity, 0);

  // Xem trước trực tiếp (live preview): dòng linh kiện đang gõ dở —
  // chưa bấm "Thêm" — cũng được tính vào các con số hiển thị, để người
  // nhập thấy tổng tiền thay đổi theo từng phím gõ. Số LƯU xuống phiếu
  // vẫn chỉ gồm các dòng đã bấm Thêm (xem handleSave).
  const draftPartTotal = (Number(newPartQty) || 0) * (Number(newPartPrice) || 0);
  const hasDraftPart = draftPartTotal > 0;
  const partsPreviewTotal = partsTotal + draftPartTotal;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (canUpdateRepairStatus() && status !== ticket.status) {
        await updateTicketStatus(ticket.id, status);
      }
      if (canAssignTasks() && technicianName !== ticket.technician_name) {
        await assignTicketTechnician(ticket.id, technicianName);
      }

      await updateTicketDetails(ticket.id, {
        status,
        technician_name: technicianName,
        technician_note: technicianNote,
        technician_fee: technicianFee,
        actual_cost: actualCost,
        estimated_cost: estimatedCost,
        estimated_completion: estimatedCompletion,
        parts_used: parts,
        total_amount: (actualCost || 0) + partsTotal,
      });

      setSaveSuccessMsg('Đã lưu thông tin phiếu sửa chữa thành công!');
      if (onTicketUpdated) onTicketUpdated();
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (err: unknown) {
      alert('Lỗi lưu thông tin: ' + (err instanceof Error ? err.message : 'Thử lại'));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const cleanPhone = (ticket.customer_phone || '').replace(/\D/g, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs font-sans animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-4 sm:px-6 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-black text-base text-white tracking-wide">
                  {ticket.ticket_code}
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    ticket.service_category === 'bao_hanh'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                  }`}
                >
                  {ticket.service_category === 'bao_hanh' ? 'Bảo Hành' : 'Sửa Chữa'}
                </span>
                <span className="text-[11px] font-semibold text-slate-300 bg-white/10 px-2 py-0.5 rounded-md">
                  {ticket.ticket_type === 'onsite' || ticket.reception_mode === 'mobile' ? 'Tận Nơi' : 'Tại Quầy'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Khởi tạo: {ticket.created_at ? new Date(ticket.created_at).toLocaleString('vi-VN') : 'Mới tạo'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">In Phiếu</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-rose-600/80 text-white flex items-center justify-center text-xs font-bold transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SLA Banner */}
        {deadlineInfo && (
          <div
            className={`px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs font-medium shrink-0 ${
              deadlineInfo.isOverdue
                ? 'bg-rose-50 text-rose-800 border-b border-rose-200'
                : 'bg-amber-50 text-amber-900 border-b border-amber-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {deadlineInfo.isOverdue ? (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 animate-bounce" />
              ) : (
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span>
                <strong>Hạn cam kết trả máy:</strong> {deadlineInfo.targetDate.toLocaleString('vi-VN')}
              </span>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full font-bold font-mono text-[11px] ${
                deadlineInfo.isOverdue ? 'bg-rose-600 text-white shadow-xs animate-pulse' : 'bg-amber-200 text-amber-900'
              }`}
            >
              {deadlineInfo.text}
            </span>
          </div>
        )}

        {/* Success Alert */}
        {saveSuccessMsg && (
          <div className="bg-emerald-50 text-emerald-800 px-4 py-2 text-xs font-bold border-b border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1 text-xs">
          {/* Status Progression */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-800 uppercase tracking-wide text-[11px]">
              Tiến Trình Xử Lý Phiếu
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {STATUS_FLOW.map((s) => {
                const isActive = status === s.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    disabled={!canUpdateRepairStatus()}
                    onClick={() => setStatus(s.key)}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      isActive
                        ? `${s.color} text-white font-bold shadow-xs border-transparent`
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    } ${!canUpdateRepairStatus() ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                  >
                    <div className="text-xs">{s.label}</div>
                    <div className={`text-[10px] mt-0.5 truncate ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                      {s.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Customer & Device 2-Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Customer Box */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <User className="w-4 h-4 text-blue-600" />
                <span>Khách Hàng</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center py-0.5 border-b border-slate-200">
                  <span className="text-slate-500">Tên:</span>
                  <span className="font-bold text-slate-900">{ticket.customer_name}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-slate-200">
                  <span className="text-slate-500">SĐT:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-700">{ticket.customer_phone}</span>
                    {cleanPhone && (
                      <div className="flex items-center gap-1">
                        <a
                          href={`tel:${cleanPhone}`}
                          className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                          title="Gọi điện"
                        >
                          <Phone className="w-3 h-3" />
                        </a>
                        <a
                          href={`https://zalo.me/${cleanPhone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          title="Nhắn Zalo"
                        >
                          <MessageCircle className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                {ticket.customer_address && (
                  <div className="flex items-start justify-between py-0.5 gap-2">
                    <span className="text-slate-500 shrink-0">Địa chỉ:</span>
                    <span className="text-right text-slate-800 font-medium">{ticket.customer_address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Device Box */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Cpu className="w-4 h-4 text-indigo-600" />
                  <span>Thiết Bị Tiếp Nhận</span>
                </div>
                {(ticket.service_tag || ticket.device_service_tag) && (
                  <span className="font-mono text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-bold">
                    TAG: {ticket.service_tag || ticket.device_service_tag}
                  </span>
                )}
              </div>
              <div className="space-y-1 text-xs">
                <div>
                  <span className="text-slate-500">Model:</span>
                  <p className="font-bold text-slate-900">{ticket.device_model || ticket.device_name || 'PC / Laptop'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Lỗi khách báo:</span>
                  <p className="text-slate-800 font-medium mt-0.5 bg-amber-50 p-1.5 rounded border border-amber-200">
                    {ticket.issue_description || ticket.issueDescription || ticket.visual_condition || 'Không có mô tả'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Technician & Appointment */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
            <h3 className="font-bold text-slate-800 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Phân Bổ Kỹ Thuật &amp; Ghi Chú</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">KTV phụ trách:</label>
                <select
                  disabled={!canAssignTasks()}
                  value={technicianName}
                  onChange={(e) => setTechnicianName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                >
                  <option value="">-- Chưa chỉ định --</option>
                  {availableTechnicians.map((u) => (
                    <option key={u.id} value={u.name}>
                      {u.name} ({u.role === 'admin' ? 'Quản lý' : u.role === 'outsourced' ? 'CTV' : u.role === 'salesman' ? 'NVKD' : 'KTV'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Hạn trả máy:</label>
                <input
                  type="text"
                  value={estimatedCompletion}
                  onChange={(e) => setEstimatedCompletion(e.target.value)}
                  placeholder="VD: 17:00 25/10/2025"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Ghi chú xử lý:</label>
              <textarea
                rows={2}
                value={technicianNote}
                onChange={(e) => setTechnicianNote(e.target.value)}
                placeholder="Ghi chú kỹ thuật, linh kiện kiểm tra..."
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800"
              />
            </div>

            {/* KTV Technician Fee Setting & Auto-Payroll Sync */}
            <div className="bg-emerald-50/80 border border-emerald-200 p-2.5 rounded-xl space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <span>💵 Tiền công / Thù lao KTV ({technicianName || 'Chưa chọn'}):</span>
                  {ticket.fee_synced_to_payroll ? (
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-full font-bold border border-emerald-300">
                      ✓ Đã cộng vào bảng lương
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-700 font-medium">
                      Tự động cộng khi hoàn tất
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative w-36">
                  <input
                    type="number"
                    step={10000}
                    min={0}
                    disabled={ticket.fee_synced_to_payroll}
                    value={technicianFee}
                    onChange={(e) => setTechnicianFee(Number(e.target.value))}
                    className="w-full pl-2.5 pr-6 py-1 bg-white border border-emerald-300 rounded-lg text-xs font-mono font-bold text-emerald-950 focus:ring-1 focus:ring-emerald-500 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                  />
                  <span className="absolute right-2 top-1 text-[11px] font-bold text-emerald-700 pointer-events-none">
                    đ
                  </span>
                </div>

                {!ticket.fee_synced_to_payroll && (
                  <div className="flex items-center gap-1">
                    {[0, 50000, 100000, 150000, 200000].map((fee) => (
                      <button
                        key={fee}
                        type="button"
                        onClick={() => setTechnicianFee(fee)}
                        className={`px-2 py-1 text-[10px] font-bold rounded border transition-colors ${
                          technicianFee === fee
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                        }`}
                      >
                        {fee === 0 ? '0 đ' : `${fee / 1000}k`}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Parts Used */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-emerald-600" />
                <span>Linh Kiện &amp; Dịch Vụ Tính Phí</span>
              </h3>
              <span className="text-xs font-mono font-bold text-emerald-700">
                {partsPreviewTotal.toLocaleString('vi-VN')} đ
                {hasDraftPart && (
                  <span className="ml-1.5 font-sans text-[10px] font-semibold text-amber-600">
                    (gồm {draftPartTotal.toLocaleString('vi-VN')} đ đang nhập)
                  </span>
                )}
              </span>
            </div>

            {parts.length > 0 && (
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-600 text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-1.5">Tên Linh Kiện</th>
                      <th className="p-1.5 text-center w-12">SL</th>
                      <th className="p-1.5 text-right w-24">Đơn Giá</th>
                      <th className="p-1.5 text-right w-24">Thành Tiền</th>
                      <th className="p-1.5 text-center w-8">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {parts.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-1.5 font-medium text-slate-900">{p.part_name}</td>
                        <td className="p-1.5 text-center font-mono">{p.quantity}</td>
                        <td className="p-1.5 text-right font-mono">{p.price.toLocaleString('vi-VN')} đ</td>
                        <td className="p-1.5 text-right font-mono font-bold text-slate-900">
                          {(p.price * p.quantity).toLocaleString('vi-VN')} đ
                        </td>
                        <td className="p-1.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemovePart(idx)}
                            className="text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Add part form */}
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex flex-wrap items-end gap-2 text-xs">
              <div className="flex-1 min-w-[140px]">
                <input
                  type="text"
                  value={newPartName}
                  onChange={(e) => setNewPartName(e.target.value)}
                  placeholder="Tên linh kiện / dịch vụ thêm..."
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                />
              </div>
              <div className="w-12">
                <input
                  type="number"
                  min="1"
                  value={newPartQty}
                  onChange={(e) => setNewPartQty(Number(e.target.value))}
                  placeholder="SL"
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs text-center font-mono"
                />
              </div>
              <div className="w-24">
                <input
                  type="number"
                  step="10000"
                  value={newPartPrice}
                  onChange={(e) => setNewPartPrice(Number(e.target.value))}
                  placeholder="Đơn giá"
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs text-right font-mono"
                />
              </div>
              {hasDraftPart && (
                <span className="whitespace-nowrap pb-1 font-mono font-bold text-emerald-700">
                  = {draftPartTotal.toLocaleString('vi-VN')} đ
                </span>
              )}
              <button
                type="button"
                onClick={handleAddPart}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold flex items-center gap-1 text-xs h-7"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm</span>
              </button>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Tiền công kỹ thuật:</span>
              <input
                type="number"
                step="10000"
                value={actualCost}
                onChange={(e) => setActualCost(Number(e.target.value))}
                className="w-32 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs font-mono font-bold text-white"
              />
              <span className="text-xs text-slate-400">VNĐ</span>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 mr-3">
                Linh kiện: {partsPreviewTotal.toLocaleString('vi-VN')} đ
              </span>
              <span className="text-xs text-slate-400 mr-2">Tổng thu dự kiến:</span>
              <span className="text-lg font-black font-mono text-emerald-400">
                {((actualCost || 0) + partsPreviewTotal).toLocaleString('vi-VN')} đ
              </span>
              {hasDraftPart && (
                <span className="block text-[10px] font-semibold text-amber-400">
                  Tạm tính — gồm dòng đang nhập, bấm Thêm để chốt vào phiếu
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 p-3 px-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 font-semibold rounded-lg text-xs"
          >
            Đóng
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="w-full sm:w-auto px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 text-xs"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi & Cập Nhật Phiếu'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
