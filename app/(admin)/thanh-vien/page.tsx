'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useViTinhAnTamStore } from '@/lib/store';
import { UserAccount, UserRole, generateStaffId } from '@/lib/supabase';
// Lucide icons removed for minimalist text design


export default function MemberManagementPage() {
  const {
    currentUser,
    users,
    updateUser,
    resetUserPassword,
    addUser,
    deleteUser,
    canManageUsers,
    refreshUsersFromServer,
  } = useViTinhAnTamStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal States
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [resetModalUser, setResetModalUser] = useState<UserAccount | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Danh sách thành viên đọc TRỰC TIẾP từ database mỗi khi mở trang này
  // (admin) — không cần bấm nút nào: tải lại từ máy chủ, ghi đè cache cũ.
  useEffect(() => {
    if (!canManageUsers()) return;
    refreshUsersFromServer().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // New User Form State
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    role: 'technician' as UserRole,
    roleTitle: '',
  });

  // Timer của toast: mỗi lần showToast mới đều hủy timer cũ, để một toast
  // cũ không thể xóa sớm popup mật khẩu mới (vd: toast lưu thành viên trước đó).
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (msg: string, durationMs: number = 4000) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), durationMs);
  };
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Trigger Reset Password: cấp mật khẩu tạm ngẫu nhiên mới
  const handleConfirmResetPassword = async () => {
    if (!resetModalUser) return;
    setIsResetting(true);
    try {
      const res = await resetUserPassword(resetModalUser.id);
      if (res.ok) {
        // Đóng ô xác nhận TRƯỚC, rồi mới hiện popup mật khẩu mới: 5 giây
        // được tính từ lúc ô xác nhận biến mất, không tính từ lúc bấm nút.
        setResetModalUser(null);
        showToast(
          res.message ||
            `Đã reset mật khẩu của ${resetModalUser.name} (yêu cầu đổi mật khẩu ở lần đăng nhập tới)!`,
          5000
        );
      } else {
        showToast(res.message || 'Không thể reset mật khẩu.');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Lỗi khi reset mật khẩu.');
    } finally {
      setIsResetting(false);
    }
  };

  // Save Member Profile & Role (including Username)
  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const cleanUsername = (editingUser.username || '').trim().toLowerCase();
    if (cleanUsername && !/^[a-z0-9_.-]+$/.test(cleanUsername)) {
      showToast('Tên đăng nhập chỉ gồm chữ cái viết thường, số, dấu gạch dưới hoặc gạch ngang!');
      return;
    }

    if (!editingUser.email.trim()) {
      showToast('Vui lòng nhập email hợp lệ!');
      return;
    }

    let defaultTitle = editingUser.roleTitle;
    let avatarBg = editingUser.avatarBg;
    if (editingUser.role === 'admin') {
      defaultTitle = defaultTitle || 'Quản trị viên hệ thống';
      avatarBg = 'bg-blue-600';
    } else if (editingUser.role === 'tech_manager') {
      defaultTitle = defaultTitle || 'Quản lý kỹ thuật';
      avatarBg = 'bg-teal-600';
    } else if (editingUser.role === 'technician') {
      defaultTitle = defaultTitle || 'Kỹ thuật viên';
      avatarBg = 'bg-emerald-600';
    } else if (editingUser.role === 'outsourced') {
      defaultTitle = defaultTitle || 'Kỹ thuật viên đối tác / Thuê ngoài';
      avatarBg = 'bg-amber-600';
    } else if (editingUser.role === 'salesman') {
      defaultTitle = defaultTitle || 'NVKD';
      avatarBg = 'bg-orange-600';
    } else if (editingUser.role === 'sales_manager') {
      defaultTitle = defaultTitle || 'Quản lý bán hàng';
      avatarBg = 'bg-indigo-600';
    } else {
      defaultTitle = defaultTitle || 'Chuyên viên kinh doanh';
      avatarBg = 'bg-purple-600';
    }

    const updatePayload: Partial<UserAccount> = {
      name: editingUser.name.trim(),
      username: cleanUsername || undefined,
      referral_code: cleanUsername || editingUser.referral_code,
      email: editingUser.email.trim().toLowerCase(),
      phone: editingUser.phone?.trim() || '',
      role: editingUser.role,
      roleTitle: defaultTitle,
      avatarBg,
      status: editingUser.status,
      permissions: editingUser.permissions,
    };

    setIsSubmittingEdit(true);
    try {
      const ok = await updateUser(editingUser.id, updatePayload);
      if (ok) {
        showToast(`Đã lưu thay đổi thông tin thành viên ${editingUser.name}!`);
        setEditingUser(null);
      } else {
        showToast('Không thể cập nhật thành viên. Vui lòng kiểm tra lại tên đăng nhập hoặc email!');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Lỗi khi cập nhật thành viên.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Create New Member
  const handleCreateNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name.trim() || !newUserForm.email.trim()) {
      showToast('Vui lòng điền đầy đủ Họ tên và Email!');
      return;
    }

    const existingIds = users.map((u) => u.username || u.referral_code || u.id).filter(Boolean);
    let finalUsername = newUserForm.username.trim().toLowerCase();
    if (!finalUsername) {
      finalUsername = generateStaffId(newUserForm.name, existingIds);
    }

    if (!/^[a-z0-9_.-]+$/.test(finalUsername)) {
      showToast('Tên đăng nhập / Mã ID chỉ gồm chữ cái, số, dấu gạch nối!');
      return;
    }

    let defaultTitle = newUserForm.roleTitle.trim();
    let avatarBg = 'bg-blue-600';

    if (newUserForm.role === 'admin') {
      defaultTitle = defaultTitle || 'Quản trị viên hệ thống';
      avatarBg = 'bg-blue-600';
    } else if (newUserForm.role === 'tech_manager') {
      defaultTitle = defaultTitle || 'Quản lý kỹ thuật';
      avatarBg = 'bg-teal-600';
    } else if (newUserForm.role === 'technician') {
      defaultTitle = defaultTitle || 'Kỹ thuật viên phần cứng';
      avatarBg = 'bg-emerald-600';
    } else if (newUserForm.role === 'outsourced') {
      defaultTitle = defaultTitle || 'Kỹ thuật viên đối tác / Thuê ngoài';
      avatarBg = 'bg-amber-600';
    } else if (newUserForm.role === 'salesman') {
      defaultTitle = defaultTitle || 'NVKD';
      avatarBg = 'bg-orange-600';
    } else if (newUserForm.role === 'sales_manager') {
      defaultTitle = defaultTitle || 'Quản lý bán hàng';
      avatarBg = 'bg-indigo-600';
    } else {
      defaultTitle = defaultTitle || 'Chuyên viên kinh doanh';
      avatarBg = 'bg-purple-600';
    }

    setIsSubmittingAdd(true);
    try {
      const createdUser = await addUser({
        username: finalUsername,
        referral_code: finalUsername,
        name: newUserForm.name.trim(),
        email: newUserForm.email.trim().toLowerCase(),
        phone: newUserForm.phone.trim(),
        role: newUserForm.role,
        roleTitle: defaultTitle,
        avatarBg,
        status: 'active',
        password_changed: false,
        permissions: {
          can_edit_stock: newUserForm.role === 'admin' || newUserForm.role === 'tech_manager',
          can_update_repair_status:
            newUserForm.role === 'admin' ||
            newUserForm.role === 'tech_manager' ||
            newUserForm.role === 'technician' ||
            newUserForm.role === 'outsourced' ||
            newUserForm.role === 'salesman',
          can_access_payroll:
            newUserForm.role === 'admin' || newUserForm.role === 'tech_manager',
          can_manage_users: newUserForm.role === 'admin',
        },
      });

      const tempPw = (createdUser as { temporaryPassword?: string }).temporaryPassword;
      showToast(
        tempPw
          ? `Đã thêm thành viên mới: ${newUserForm.name.trim()} (Mã ID: @${finalUsername}). Mật khẩu tạm (chỉ hiện 1 lần): ${tempPw}`
          : `Đã thêm thành viên mới: ${newUserForm.name.trim()} (Mã ID: @${finalUsername})!`
      );
      setIsAddingUser(false);
      setNewUserForm({
        name: '',
        username: '',
        email: '',
        phone: '',
        role: 'technician',
        roleTitle: '',
      });
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Có lỗi khi tạo thành viên mới.');
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  // Delete User
  const handleDeleteUser = async (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa tài khoản "${name}" khỏi hệ thống không? Mã ID / Người giới thiệu của nhân viên này sẽ bị xóa hoàn toàn.`)) {
      const ok = await deleteUser(id);
      if (ok) {
        showToast(`Đã xóa thành viên "${name}" và ID thành công!`);
      } else {
        showToast('Không thể xóa tài khoản của chính bạn!');
      }
    }
  };

  // Filtered list
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone || '').includes(searchQuery);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const techCount = users.filter((u) => u.role === 'technician').length;
  const outsourcedCount = users.filter((u) => u.role === 'outsourced').length;
  const salesmanCount = users.filter((u) => u.role === 'salesman').length;
  const salesManagerCount = users.filter((u) => u.role === 'sales_manager').length;

  // Access check
  if (!canManageUsers()) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center space-y-6">
        <div className="inline-block px-3 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-full uppercase tracking-wider">
          Bảo Mật Nội Bộ
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900">Bạn không có quyền truy cập trang này</h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Tính năng quản lý thành viên, sửa mật khẩu và phân quyền nhân sự chỉ dành riêng cho{' '}
            <strong className="text-blue-700 font-bold">Quản Trị Viên (Admin)</strong>.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all"
          >
            Quay lại Trang Tổng Quan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-white text-slate-900 px-4 py-3 rounded-xl shadow-2xl border-2 border-blue-600 text-xs font-semibold flex items-center gap-2.5 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Thành Viên &amp; Phân Quyền
          </h1>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsAddingUser(true)}
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all active:scale-[0.98]"
          >
            + Thêm Thành Viên Mới
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Tổng Nhân Sự</span>
          <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">{users.length}</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700">Quản Trị Viên</span>
          <p className="text-2xl font-bold text-blue-700 mt-1 font-mono">{adminCount}</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">KTV Nội Bộ</span>
          <p className="text-2xl font-bold text-emerald-700 mt-1 font-mono">{techCount}</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-amber-200 bg-amber-50/30 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">KTV Thuê Ngoài</span>
          <p className="text-2xl font-bold text-amber-700 mt-1 font-mono">{outsourcedCount}</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-orange-200 bg-orange-50/30 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-orange-700">NVKD</span>
          <p className="text-2xl font-bold text-orange-700 mt-1 font-mono">{salesmanCount}</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-700">QL Bán Hàng</span>
          <p className="text-2xl font-bold text-purple-700 mt-1 font-mono">{salesManagerCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo họ tên, email hoặc số điện thoại..."
            className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Role Tabs */}
        <div className="flex items-center gap-1 shrink-0 bg-slate-100 p-1 rounded-xl border border-slate-200 flex-wrap">
          {(['all', 'admin', 'tech_manager', 'technician', 'outsourced', 'salesman', 'sales_manager'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setRoleFilter(tab)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                roleFilter === tab
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {(
                {
                  all: 'Tất cả',
                  admin: 'Admin',
                  tech_manager: 'QL Kỹ thuật',
                  technician: 'KTV Nội bộ',
                  outsourced: 'Thuê ngoài',
                  salesman: 'NVKD',
                  sales_manager: 'QL Bán hàng',
                } as const
              )[tab]}
            </button>
          ))}
        </div>
      </div>

      {/* Members Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((member) => {
          const isMe = member.id === currentUser.id;
          return (
            <div
              key={member.id}
              className={`p-5 rounded-2xl bg-white border transition-all flex flex-col justify-between space-y-4 relative hover:shadow-md ${
                isMe ? 'border-2 border-blue-600 shadow-xs ring-2 ring-blue-100' : 'border-slate-200 shadow-xs'
              }`}
            >
              {/* Member Card Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl ${member.avatarBg} text-white flex items-center justify-center font-bold text-sm shadow-xs`}
                    >
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-slate-900">{member.name}</h3>
                        {isMe && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-blue-100 text-blue-800 font-bold">
                            Bạn
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{member.roleTitle}</p>
                    </div>
                  </div>

                  {/* Role Badge */}
                  <span
                    className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                      (
                        {
                          admin: 'bg-blue-50 text-blue-700 border border-blue-200',
                          tech_manager: 'bg-teal-50 text-teal-700 border border-teal-200',
                          technician: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
                          outsourced: 'bg-amber-50 text-amber-800 border border-amber-200 font-semibold',
                          salesman: 'bg-orange-50 text-orange-800 border border-orange-200 font-semibold',
                          sales_manager: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
                        } as const
                      )[member.role]
                    }`}
                  >
                    {(
                      {
                        admin: 'Admin',
                        tech_manager: 'QL Kỹ Thuật',
                        technician: 'Kỹ Thuật',
                        outsourced: 'Thuê Ngoài',
                        salesman: 'NVKD',
                        sales_manager: 'QL Bán Hàng',
                      } as const
                    )[member.role]}
                  </span>
                </div>

                {/* Account Details: Username & Email separate */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  {/* Separate Username & Staff/Referral ID */}
                  <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                    <span className="text-slate-500 text-[11px] font-medium">Mã ID / Giới thiệu:</span>
                    <span className="font-mono font-bold text-blue-700">
                      @{member.referral_code || member.username || member.email.split('@')[0]}
                    </span>
                  </div>

                  {/* Separate Email */}
                  <div className="flex items-center justify-between px-1">
                    <span className="text-slate-500 text-[11px]">Email liên hệ:</span>
                    <span className="font-mono text-slate-700 truncate max-w-[180px]" title={member.email}>
                      {member.email}
                    </span>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center justify-between px-1">
                    <span className="text-slate-500 text-[11px]">Số điện thoại:</span>
                    <span className="font-mono text-slate-700">{member.phone || 'Chưa cập nhật'}</span>
                  </div>

                  {/* Password Status Banner */}
                  <div className="pt-1">
                    {member.password_changed === false ? (
                      <div className="px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium flex items-center justify-between">
                        <span>⚠️ Mật khẩu tạm chưa đổi</span>
                        <span className="font-bold text-[10px] text-amber-900 uppercase">Chưa đổi</span>
                      </div>
                    ) : (
                      <div className="px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium flex items-center justify-between">
                        <span>🔒 Mật khẩu cá nhân</span>
                        <span className="font-bold text-[10px] text-emerald-900 uppercase">Đã kích hoạt</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Permissions Indicators */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {member.permissions?.can_edit_stock && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                      Kho hàng
                    </span>
                  )}
                  {member.permissions?.can_update_repair_status && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                      Phiếu sửa
                    </span>
                  )}
                  {member.permissions?.can_access_payroll && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                      Lương &amp; Báo cáo
                    </span>
                  )}
                  {member.permissions?.can_manage_users && (
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">
                      Quản lý tài khoản
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-2">
                  {/* Edit Profile & Username */}
                  <button
                    onClick={() => setEditingUser(member)}
                    className="flex-1 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center border border-blue-200 transition-colors"
                  >
                    Sửa thông tin
                  </button>

                  {/* Reset Password: cấp mật khẩu tạm ngẫu nhiên */}
                  <button
                    onClick={() => setResetModalUser(member)}
                    className="flex-1 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center border border-amber-200 transition-colors"
                    title="Reset mật khẩu (cấp mật khẩu tạm ngẫu nhiên)"
                  >
                    Reset Mật Khẩu
                  </button>
                </div>

                {/* Delete button (cannot delete self) */}
                {!isMe && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleDeleteUser(member.id, member.name)}
                      className="px-2 py-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs font-medium rounded transition-colors"
                      title="Xóa tài khoản"
                    >
                      Xóa tài khoản
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: RESET PASSWORD CONFIRMATION */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-5 animate-scale-up">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Reset Mật Khẩu Thành Viên</h2>
                <p className="text-xs text-slate-500">
                  Tài khoản: <strong className="text-slate-900">{resetModalUser.name}</strong>
                </p>
              </div>
              <button
                onClick={() => setResetModalUser(null)}
                className="text-slate-400 hover:text-slate-600 px-2 py-1 text-xs font-semibold rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tên đăng nhập:</span>
                  <span className="font-mono font-bold text-blue-700">
                    @{resetModalUser.username || resetModalUser.email.split('@')[0]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-mono text-slate-800">{resetModalUser.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Vai trò:</span>
                  <span className="font-bold text-slate-800 uppercase">{resetModalUser.role}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <span>⚠️</span> Hệ thống sẽ cấp một mật khẩu tạm NGẪU NHIÊN mới (chỉ hiển thị 1 lần sau khi xác nhận).
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed pt-1">
                  Nhân viên bắt buộc phải đổi mật khẩu cá nhân mới ngay trong lần đăng nhập đầu tiên tiếp theo.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResetModalUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmResetPassword}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition-all"
              >
                Xác Nhận Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT MEMBER PROFILE & ROLE */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-5 animate-scale-up">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Sửa Thông Tin &amp; Phân Quyền</h2>
                <p className="text-xs text-slate-500">Mã tài khoản: {editingUser.id}</p>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 px-2 py-1 text-xs font-semibold rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Họ và Tên Nhân Sự *</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên Đăng Nhập (@username) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingUser.username || ''}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        username: e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''),
                      })
                    }
                    placeholder="VD: nam.hoang"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Dùng để đăng nhập vào hệ thống</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Liên Hệ *</label>
                  <input
                    type="email"
                    required
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Nhận thông báo &amp; có thể dùng đăng nhập</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số Điện Thoại</label>
                <input
                  type="text"
                  value={editingUser.phone || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  placeholder="0912.345.678"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Vai Trò Phân Quyền</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'admin', label: 'Admin', desc: 'Toàn quyền quản trị' },
                    { id: 'tech_manager', label: 'QL Kỹ Thuật', desc: 'Điều phối & kho máy' },
                    { id: 'sales_manager', label: 'QL Bán Hàng', desc: 'CRM & doanh số' },
                    { id: 'technician', label: 'KTV Nội Bộ', desc: 'Chẩn đoán & QC' },
                    { id: 'outsourced', label: 'KTV Thuê Ngoài', desc: 'Đối tác / CTV sửa chữa' },
                    { id: 'salesman', label: 'NVKD', desc: 'Bán hàng, giao máy & kỹ thuật thị trường' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setEditingUser({ ...editingUser, role: r.id as UserRole })}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        editingUser.role === r.id
                          ? 'bg-blue-50 border-2 border-blue-600 text-blue-900 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold">{r.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Trạng Thái Hoạt Động</label>
                <select
                  value={editingUser.status}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, status: e.target.value as 'active' | 'suspended' })
                  }
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Đang hoạt động (Active)</option>
                  <option value="suspended">Tạm khóa tài khoản (Suspended)</option>
                </select>
              </div>

              {/* Granular Permissions Checkboxes */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Phân Quyền Chi Tiết
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingUser.permissions?.can_edit_stock || false}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          permissions: {
                            ...editingUser.permissions,
                            can_edit_stock: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Sửa số lượng tồn kho</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingUser.permissions?.can_update_repair_status || false}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          permissions: {
                            ...editingUser.permissions,
                            can_update_repair_status: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Đổi trạng thái phiếu sửa</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingUser.permissions?.can_access_payroll || false}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          permissions: {
                            ...editingUser.permissions,
                            can_access_payroll: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Xem tiền công &amp; ca trực</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingUser.permissions?.can_manage_users || false}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          permissions: {
                            ...editingUser.permissions,
                            can_manage_users: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Quản lý thành viên &amp; mật khẩu</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD NEW MEMBER */}
      {isAddingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-5 animate-scale-up">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Thêm Thành Viên Mới</h2>
              </div>
              <button
                onClick={() => setIsAddingUser(false)}
                className="text-slate-400 hover:text-slate-600 px-2 py-1 text-xs font-semibold rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Họ và Tên Nhân Sự *</label>
                <input
                  type="text"
                  required
                  value={newUserForm.name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    const existingIds = users.map((u) => u.username || u.referral_code || u.id).filter(Boolean);
                    const autoId = generateStaffId(newName, existingIds);
                    setNewUserForm({
                      ...newUserForm,
                      name: newName,
                      username: autoId,
                      email: newUserForm.email || (autoId ? `${autoId}@vitinhantam.com` : ''),
                    });
                  }}
                  placeholder="VD: Nguyễn Văn Đăng"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Mã ID / Username *</span>
                    <span className="text-[10px] text-blue-600 font-mono font-semibold">Tự động (VD: nvdang)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserForm.username}
                    onChange={(e) =>
                      setNewUserForm({
                        ...newUserForm,
                        username: e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''),
                      })
                    }
                    placeholder="VD: nvdang"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono font-bold"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">Dùng đăng nhập &amp; mã người giới thiệu</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Liên Hệ *</label>
                  <input
                    type="email"
                    required
                    value={newUserForm.email}
                    onChange={(e) => {
                      const newEmail = e.target.value;
                      const autoUsername = newUserForm.username || newEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9_.-]/g, '');
                      setNewUserForm({
                        ...newUserForm,
                        email: newEmail,
                        username: newUserForm.username || autoUsername,
                      });
                    }}
                    placeholder="nam.hoang@vitinhantam.com"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Nhận thông báo hệ thống</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số Điện Thoại</label>
                <input
                  type="text"
                  value={newUserForm.phone}
                  onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                  placeholder="0912.345.678"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Vai Trò Khởi Tạo</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'admin', label: 'Admin', desc: 'Quản trị hệ thống' },
                    { id: 'tech_manager', label: 'QL Kỹ Thuật', desc: 'Điều phối & báo cáo' },
                    { id: 'sales_manager', label: 'QL Bán Hàng', desc: 'CRM & doanh số' },
                    { id: 'technician', label: 'KTV Nội Bộ', desc: 'Sửa chữa & QC' },
                    { id: 'outsourced', label: 'KTV Thuê Ngoài', desc: 'Đối tác / CTV ngoài' },
                    { id: 'salesman', label: 'NVKD', desc: 'Bán hàng, giao máy & kỹ thuật thị trường' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setNewUserForm({ ...newUserForm, role: r.id as UserRole })}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        newUserForm.role === r.id
                          ? 'bg-blue-50 border-2 border-blue-600 text-blue-900 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold">{r.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-bold">
                  <span>🔒 Mật khẩu tạm khởi tạo:</span>
                  <span className="font-mono bg-white px-2 py-0.5 rounded border border-amber-300 text-amber-950">
                    Sinh ngẫu nhiên, hiển thị 1 lần sau khi tạo
                  </span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Thành viên sẽ được yêu cầu đổi mật khẩu cá nhân ngay trong lần đăng nhập đầu tiên.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingUser(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all"
                >
                  Tạo Thành Viên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
