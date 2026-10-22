'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { ShiftLog, formatDateVN } from '@/lib/supabase';
import { TechnicianWorkloadRecharts } from '@/components/dashboard/TechnicianWorkloadRecharts';
import { StatCard } from '@/components/admin/ui/StatCard';
import { PageHeader } from '@/components/admin/ui/PageHeader';
// Lucide icons removed for minimalist text design


export default function TienCongPage() {
  const {
    canAccessPayroll,
    shiftLogs,
    users,
    tickets,
    addShiftLog,
  } = useStore();

  // Năng suất KTV theo phiếu (chuyển từ Dashboard sang đây)
  const technicianWorkloadData = React.useMemo(() => {
    const techs = users.filter((u) => u.role === 'technician' || u.role === 'tech_manager' || u.role === 'outsourced');
    return techs.map((u) => {
      const techTickets = tickets.filter((t) => t.technician_name === u.name);
      const completed = techTickets.filter((t) => t.status === 'completed' || t.status === 'delivered').length;
      const inProgress = techTickets.filter((t) => t.status !== 'completed' && t.status !== 'delivered' && t.status !== 'cancelled').length;
      return {
        name: u.name.split(' ').slice(-1)[0] || u.name,
        completed,
        inProgress,
        isOutsourced: u.role === 'outsourced',
      };
    });
  }, [users, tickets]);

  const availableTechnicians = React.useMemo(() => {
    return users.filter((u) => u.role === 'technician' || u.role === 'tech_manager' || u.role === 'outsourced' || u.role === 'admin');
  }, [users]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // New Shift form state
  const [newShift, setNewShift] = useState({
    technician_name: '',
    shift_date: new Date().toISOString().split('T')[0],
    shift_type: 'full_day' as ShiftLog['shift_type'],
    base_wage: 300000,
    tickets_completed: 0,
    bonus: 0,
    notes: '',
  });

  // RESTRICTED SCREEN IF NOT ADMIN
  if (!canAccessPayroll()) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-5">
          <div className="inline-block px-3 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-full uppercase tracking-wider">
            Bảo Mật Nội Bộ
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">
              Quyền Truy Cập Bị Giới Hạn (Chỉ Admin)
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Tính năng tính tiền công và bảng lương chỉ dành riêng cho Quản Trị Viên (Admin).
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all active:scale-95"
            >
              Đăng nhập lại bằng tài khoản Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN VIEW: FULL PAYROLL ACCESS
  const totalWages = shiftLogs.reduce(
    (sum, s) => sum + s.base_wage + (s.bonus || 0),
    0
  );
  const totalTicketsHandled = shiftLogs.reduce(
    (sum, s) => sum + s.tickets_completed,
    0
  );
  const totalBonus = shiftLogs.reduce((sum, s) => sum + (s.bonus || 0), 0);

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    await addShiftLog({
      technician_name: newShift.technician_name,
      shift_date: newShift.shift_date,
      shift_type: newShift.shift_type,
      base_wage: Number(newShift.base_wage),
      tickets_completed: Number(newShift.tickets_completed),
      bonus: Number(newShift.bonus),
      notes: newShift.notes,
    });

    setIsAddModalOpen(false);
    setNotice('Đã ghi nhận ca làm việc và tính tiền công thành công!');
    setTimeout(() => setNotice(null), 3000);
  };

  const handleExportCsv = () => {
    const headers = 'ID,Kỹ Thuật Viên,Ngày Trực,Loại Ca,Tiền Công Cứng,Số Máy Xử Lý,Thưởng KPI,Tổng Nhận,Ghi Chú\n';
    const rows = shiftLogs
      .map(
        (s) =>
          `"${s.id}","${s.technician_name}","${s.shift_date}","${s.shift_type}",${s.base_wage},${s.tickets_completed},${s.bonus || 0},${s.base_wage + (s.bonus || 0)},"${s.notes || ''}"`
      )
      .join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bang_Luong_Tien_Cong_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {notice && (
        <div className="fixed top-20 right-6 z-50 bg-white text-slate-900 px-4 py-3 rounded-xl shadow-2xl border-2 border-blue-600 flex items-center gap-3 animate-fade-in text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          <span>{notice}</span>
        </div>
      )}

      {/* Header */}
      <PageHeader
        title={
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Tính Tiền Công Theo Ca & Thưởng KPI
            <span className="text-xs px-2.5 py-1 bg-emerald-100 text-emerald-700 font-semibold rounded-full">
              Đặc quyền Admin
            </span>
          </h1>
        }
        actions={
          <>
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            Xuất Bảng Lương (CSV)
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            + Ghi Nhận Ca Mới
          </button>
          </>
        }
      />

      {/* Năng suất KTV (trước đây ở Dashboard) */}
      <div className="max-w-xl">
        <TechnicianWorkloadRecharts data={technicianWorkloadData} />
      </div>

      {/* Payroll KPI Cards - Clean Typography, No Empty Icon Boxes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tổng Chi Tiền Công" value={`${totalWages.toLocaleString('vi-VN')} đ`} />
        <StatCard label="Tổng Ca Đã Trực" value={`${shiftLogs.length} ca`} tone="emerald" />
        <StatCard label="Máy Đã Hoàn Tất" value={`${totalTicketsHandled} máy`} tone="amber" />
        <StatCard label="Thưởng Năng Suất KPI" value={`${totalBonus.toLocaleString('vi-VN')} đ`} tone="purple" />
      </div>

      {/* Shift Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            Nhật Ký Ca Trực & Bảng Phân Bổ Tiền Công
          </h3>
          <span className="text-xs text-slate-500">Dữ liệu nội bộ cửa hàng</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Kỹ Thuật Viên</th>
                <th className="py-3 px-4">Ngày Làm Việc</th>
                <th className="py-3 px-4">Loại Ca</th>
                <th className="py-3 px-4 text-center">Máy Đã Xử Lý</th>
                <th className="py-3 px-4 text-right">Tiền Công Cứng</th>
                <th className="py-3 px-4 text-right">Thưởng KPI</th>
                <th className="py-3 px-4 text-right">Tổng Thực Nhận</th>
                <th className="py-3 px-4">Ghi Chú Ca</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {shiftLogs.map((log) => {
                const totalShiftPay = log.base_wage + (log.bonus || 0);

                return (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {log.technician_name}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">
                      {formatDateVN(log.shift_date)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                        {log.shift_type === 'full_day'
                          ? 'Cả Ngày (8h - 17h30)'
                          : log.shift_type === 'morning'
                          ? 'Ca Sáng (8h - 12h)'
                          : log.shift_type === 'afternoon'
                          ? 'Ca Chiều (13h30 - 17h30)'
                          : 'Cứu Hộ Ngoài Giờ'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {log.tickets_completed} máy
                    </td>

                    <td className="py-3.5 px-4 text-right text-slate-700 font-medium">
                      {log.base_wage.toLocaleString('vi-VN')} đ
                    </td>

                    <td className="py-3.5 px-4 text-right text-emerald-700 font-medium">
                      +{(log.bonus || 0).toLocaleString('vi-VN')} đ
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {totalShiftPay.toLocaleString('vi-VN')} đ
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate">
                      {log.notes || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Shift Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Ghi Nhận Ca Trực Mới</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 px-2 py-1 text-xs font-semibold rounded-lg hover:bg-slate-200/50"
              >
                Đóng
              </button>
            </div>

            <form onSubmit={handleCreateShift} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kỹ Thuật Viên *
                </label>
                <select
                  value={newShift.technician_name}
                  onChange={(e) =>
                    setNewShift({ ...newShift, technician_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ngày Làm Việc *
                  </label>
                  <input
                    type="date"
                    required
                    value={newShift.shift_date}
                    onChange={(e) => setNewShift({ ...newShift, shift_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Khung Ca Trực
                  </label>
                  <select
                    value={newShift.shift_type}
                    onChange={(e) =>
                      setNewShift({
                        ...newShift,
                        shift_type: e.target.value as ShiftLog['shift_type'],
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="full_day">Cả Ngày</option>
                    <option value="morning">Ca Sáng (8h - 12h)</option>
                    <option value="afternoon">Ca Chiều (13h30 - 17h30)</option>
                    <option value="night_onsite">Cứu Hộ Ngoài Giờ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tiền Công Cứng
                  </label>
                  <input
                    type="number"
                    step={10000}
                    value={newShift.base_wage}
                    onChange={(e) =>
                      setNewShift({ ...newShift, base_wage: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số Máy Đã Sửa
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newShift.tickets_completed}
                    onChange={(e) =>
                      setNewShift({
                        ...newShift,
                        tickets_completed: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Thưởng KPI
                  </label>
                  <input
                    type="number"
                    step={10000}
                    value={newShift.bonus}
                    onChange={(e) =>
                      setNewShift({ ...newShift, bonus: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi Chú Ca Làm
                </label>
                <input
                  type="text"
                  placeholder="Ghi nhận máy bảo hành, phát sinh, v.v."
                  value={newShift.notes}
                  onChange={(e) => setNewShift({ ...newShift, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm"
                >
                  Lưu & Hạch Toán
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
