'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { ShiftLog, formatDateVN } from '@/lib/supabase';
import {
  DollarSign,
  Calendar,
  User,
  Clock,
  Award,
  Lock,
  Plus,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  X
} from 'lucide-react';

export default function TienCongPage() {
  const {
    currentUser,
    canAccessPayroll,
    setCurrentUserRole,
    shiftLogs,
    addShiftLog,
  } = useStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // New Shift form state
  const [newShift, setNewShift] = useState({
    technician_name: 'Trần Văn Kỹ Thuật (KTV Trưởng)',
    shift_date: new Date().toISOString().split('T')[0],
    shift_type: 'full_day' as ShiftLog['shift_type'],
    base_wage: 350000,
    tickets_completed: 4,
    bonus: 100000,
    notes: 'Hoàn thành 3 máy OptiPlex + 1 ca cứu hộ P.2',
  });

  // RESTRICTED SCREEN IF NOT ADMIN
  if (!canAccessPayroll()) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-5">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">
              Quyền Truy Cập Bị Giới Hạn (Chỉ Admin)
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Bạn đang đăng nhập với vai trò{' '}
              <strong className="text-blue-600">{currentUser.name}</strong> (
              <span className="capitalize">{currentUser.role === 'technician' ? 'Kỹ thuật viên' : 'Kinh doanh'}</span>
              ). Theo chính sách bảo mật nội bộ của Vi Tính An Tâm, dữ liệu bảng lương, tính tiền công theo ca và hoa hồng kỹ thuật viên chỉ được phép hiển thị cho Quản Trị Viên (Admin).
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 text-left space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Quy tắc ma trận RBAC đã áp dụng:
            </div>
            <div>• Kỹ thuật viên & Kinh doanh: Chỉ được xem kho máy, nhập thiết bị mới vào kho.</div>
            <div>• Bảng lương, tiền công, sửa số lượng tồn kho & cấu hình hệ thống: Thuộc đặc quyền Admin.</div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setCurrentUserRole('admin')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
              Chuyển Sang Vai Trò Admin (Demo Phân Quyền)
              <ArrowRight className="w-4 h-4" />
            </button>
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
        <div className="fixed top-20 right-6 z-50 bg-white text-slate-900 px-4 py-3 rounded-xl shadow-2xl border-2 border-blue-600 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium">{notice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Tính Tiền Công Theo Ca & Thưởng KPI
            <span className="text-xs px-2.5 py-1 bg-emerald-100 text-emerald-700 font-semibold rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Đặc quyền Admin
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Hạch toán tiền công thợ, tiền hoa hồng cứu hộ 10km và trích thưởng doanh số khu vực Long An - Tây Ninh.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Xuất Bảng Lương (CSV)
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            Ghi Nhận Ca Mới
          </button>
        </div>
      </div>

      {/* Payroll KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Tổng Chi Tiền Công</div>
            <div className="text-xl font-bold text-slate-900">
              {totalWages.toLocaleString('vi-VN')} đ
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Tổng Ca Đã Trực</div>
            <div className="text-xl font-bold text-emerald-700">{shiftLogs.length} ca</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Máy Đã Hoàn Tất</div>
            <div className="text-xl font-bold text-amber-700">{totalTicketsHandled} máy</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Thưởng Năng Suất KPI</div>
            <div className="text-xl font-bold text-purple-700">
              {totalBonus.toLocaleString('vi-VN')} đ
            </div>
          </div>
        </div>
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
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        {log.technician_name}
                      </div>
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
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
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
                  <option value="Trần Văn Kỹ Thuật (KTV Trưởng)">Trần Văn Kỹ Thuật (KTV Trưởng)</option>
                  <option value="Nguyễn Văn An (KTV Phần Cứng)">Nguyễn Văn An (KTV Phần Cứng)</option>
                  <option value="Lê Hoàng Phát (KTV Onsite)">Lê Hoàng Phát (KTV Onsite)</option>
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
