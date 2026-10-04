'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useViTinhAnTamStore } from '@/lib/store';
import { UserAccount, UserRole } from '@/lib/supabase';
// Lucide icons removed for minimalist text design


export default function MemberManagementPage() {
  const {
    currentUser,
    users,
    updateUser,
    changeUserPassword,
    addUser,
    deleteUser,
    canManageUsers,
  } = useViTinhAnTamStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal States
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [editUserPassword, setEditUserPassword] = useState('');
  const [passwordModalUser, setPasswordModalUser] = useState<UserAccount | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);

  // New User Form State
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'technician' as UserRole,
    password: '',
    roleTitle: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Generate random secure password
  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let res = '';
    for (let i = 0; i < 8; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(res);
    setShowPassword(true);
  };

  // Save Password Change
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser) return;
    if (!newPassword.trim() || newPassword.trim().length < 4) {
      showToast('Mật khẩu phải có tối thiểu 4 ký tự!');
      return;
    }

    const result = await changeUserPassword(passwordModalUser.id, newPassword.trim());
    if (result.ok) {
      showToast(`Đã cập nhật mật khẩu thành công cho ${passwordModalUser.name}!`);
      setPasswordModalUser(null);
      setNewPassword('');
    } else {
      showToast(result.message || 'Có lỗi xảy ra khi cập nhật mật khẩu.');
    }
  };

  // Save Member Profile & Role
  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

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
    } else if (editingUser.role === 'sales_manager') {
      defaultTitle = defaultTitle || 'Quản lý bán hàng';
      avatarBg = 'bg-indigo-600';
    } else {
      defaultTitle = defaultTitle || 'Chuyên viên kinh doanh';
      avatarBg = 'bg-purple-600';
    }

    const updatePayload: Partial<UserAccount> = {
      name: editingUser.name,
      email: editingUser.email.trim(),
      phone: editingUser.phone,
      role: editingUser.role,
      roleTitle: defaultTitle,
      avatarBg,
      status: editingUser.status,
      permissions: editingUser.permissions,
    };

    if (editUserPassword.trim()) {
      if (editUserPassword.trim().length < 4) {
        showToast('Mật khẩu mới phải có tối thiểu 4 ký tự!');
        return;
      }
      updatePayload.password = editUserPassword.trim();
    }

    const ok = await updateUser(editingUser.id, updatePayload);

    if (ok) {
      showToast(`Đã lưu thay đổi thông tin thành viên ${editingUser.name}!`);
      setEditingUser(null);
      setEditUserPassword('');
    }
  };

  // Create New Member
  const handleCreateNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name.trim() || !newUserForm.email.trim()) {
      showToast('Vui lòng điền đầy đủ Họ tên và Email!');
      return;
    }

    const pwd = newUserForm.password.trim();
    if (!pwd || pwd.length < 4) {
      showToast('Vui lòng nhập mật khẩu khởi tạo tối thiểu 4 ký tự!');
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
    } else if (newUserForm.role === 'sales_manager') {
      defaultTitle = defaultTitle || 'Quản lý bán hàng';
      avatarBg = 'bg-indigo-600';
    } else {
      defaultTitle = defaultTitle || 'Chuyên viên kinh doanh';
      avatarBg = 'bg-purple-600';
    }

    await addUser({
      username: newUserForm.email.trim().split('@')[0],
      name: newUserForm.name.trim(),
      email: newUserForm.email.trim(),
      phone: newUserForm.phone.trim() || '0909.053.058',
      role: newUserForm.role,
      roleTitle: defaultTitle,
      password: pwd,
      avatarBg,
      status: 'active',
      permissions: {
        can_edit_stock: newUserForm.role === 'admin' || newUserForm.role === 'tech_manager',
        can_update_repair_status:
          newUserForm.role === 'admin' ||
          newUserForm.role === 'tech_manager' ||
          newUserForm.role === 'technician' ||
          newUserForm.role === 'outsourced',
        can_access_payroll:
          newUserForm.role === 'admin' ||
          newUserForm.role === 'tech_manager' ||
          newUserForm.role === 'sales_manager',
        can_manage_users: newUserForm.role === 'admin',
      },
    });

    showToast(`Đã thêm thành viên mới: ${newUserForm.name.trim()} (${defaultTitle})!`);
    setIsAddingUser(false);
    setNewUserForm({
      name: '',
      email: '',
      phone: '',
      role: 'technician',
      password: '',
      roleTitle: '',
    });
  };

  // Delete User
  const handleDeleteUser = async (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa thành viên ${name} khỏi hệ thống không?`)) {
      const ok = await deleteUser(id);
      if (ok) {
        showToast(`Đã xóa thành viên ${name} thành công!`);
      } else {
        showToast('Không thể xóa tài khoản của chính bạn!');
      }
    }
  };

  // Filtered list
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const techCount = users.filter((u) => u.role === 'technician').length;
  const outsourcedCount = users.filter((u) => u.role === 'outsourced').length;
  const salesCount = users.filter((u) => u.role === 'sales').length;

  // Access check
  if (!canManageUsers()) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center space-y-6">
        <div className="inline-block px-3 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-full uppercase tracking-wider">
          Bảo Mật Nội Bộ
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900">Quyền Truy Cập Bị Giới Hạn</h1>
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

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-700">Kinh Doanh &amp; CSKH</span>
          <p className="text-2xl font-bold text-purple-700 mt-1 font-mono">{salesCount}</p>
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
          {(['all', 'admin', 'tech_manager', 'technician', 'outsourced', 'sales_manager', 'sales'] as const).map((tab) => (
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
                  sales_manager: 'QL Bán hàng',
                  sales: 'Kinh doanh',
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
                          sales_manager: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
                          sales: 'bg-purple-50 text-purple-700 border border-purple-200',
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
                        sales_manager: 'QL Bán Hàng',
                        sales: 'Kinh Doanh',
                      } as const
                    )[member.role]}
                  </span>
                </div>

                {/* Contact & Status details */}
                <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Tài khoản:</span>
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">@{member.username || member.email.split('@')[0]}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="font-mono font-medium text-slate-900">{member.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Số điện thoại:</span>
                    <span className="font-medium text-slate-900">{member.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Mật khẩu:</span>
                    <span className="font-mono font-bold text-blue-600">••••••</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-slate-400">Trạng thái:</span>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                        member.status === 'active' ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          member.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      />
                      {member.status === 'active' ? 'Đang hoạt động' : 'Tạm khóa'}
                    </span>
                  </div>
                </div>

                {/* Permissions pills */}
                <div className="flex flex-wrap gap-1 text-[10px]">
                  {member.permissions?.can_edit_stock && (
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium border border-blue-100">
                      ✓ Sửa tồn kho
                    </span>
                  )}
                  {member.permissions?.can_update_repair_status && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-medium border border-emerald-100">
                      ✓ Đổi trạng thái phiếu
                    </span>
                  )}
                  {member.permissions?.can_access_payroll && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-medium border border-amber-100">
                      ✓ Xem tiền công
                    </span>
                  )}
                  {member.permissions?.can_manage_users && (
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-medium border border-indigo-100">
                      ✓ Quản lý thành viên
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-1">
                  {/* Edit Profile & Role */}
                  <button
                    onClick={() => {
                      setEditingUser(member);
                      setEditUserPassword('');
                    }}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center border border-blue-200 transition-colors"
                  >
                    <span>Sửa thông tin</span>
                  </button>

                  {/* Change Password */}
                  <button
                    onClick={() => {
                      setPasswordModalUser(member);
                      setNewPassword('');
                      setShowPassword(false);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200 text-slate-700 text-xs font-semibold flex items-center justify-center border border-slate-200 transition-colors"
                    title="Đổi mật khẩu cho thành viên này"
                  >
                    <span>Mật khẩu</span>
                  </button>
                </div>

                {/* Đã gỡ nút "Chuyển ca": chuyển phiên sang tài khoản khác mà không cần mật khẩu
                    là lỗ hổng leo thang quyền (escalation). Muốn đổi vai trò -> đăng xuất, đăng nhập lại. */}

                {/* Delete button (cannot delete self) */}
                {!isMe && (
                  <button
                    onClick={() => handleDeleteUser(member.id, member.name)}
                    className="px-2 py-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs font-medium rounded transition-colors"
                    title="Xóa thành viên"
                  >
                    Xóa
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: CHANGE / RESET PASSWORD */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-5 animate-scale-up">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Đổi / Đặt Lại Mật Khẩu</h2>
                <p className="text-xs text-slate-500">
                  Áp dụng cho: <strong className="text-slate-900">{passwordModalUser.name}</strong>
                </p>
              </div>
              <button
                onClick={() => setPasswordModalUser(null)}
                className="text-slate-400 hover:text-slate-600 px-2 py-1 text-xs font-semibold rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Email đăng nhập:</span>
                  <span className="font-mono font-bold text-slate-900">{passwordModalUser.email}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Vai trò tài khoản:</span>
                  <span className="font-semibold text-blue-700 uppercase">{passwordModalUser.role}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Mật Khẩu Mới</label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-bold hover:underline"
                  >
                    Tạo ngẫu nhiên
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới (tối thiểu 4 ký tự)..."
                    className="w-full pl-3.5 pr-12 py-2.5 text-xs sm:text-sm rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold"
                  >
                    {showPassword ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all"
                >
                  Lưu Mật Khẩu
                </button>
              </div>
            </form>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Họ và Tên Nhân Sự</label>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tên Đăng Nhập (Email)</label>
                  <input
                    type="email"
                    required
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số Điện Thoại</label>
                  <input
                    type="text"
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Đổi Mật Khẩu Đăng Nhập <span className="font-normal text-slate-400">(Bỏ trống nếu giữ nguyên mật khẩu cũ)</span>
                </label>
                <input
                  type="text"
                  value={editUserPassword}
                  onChange={(e) => setEditUserPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới (tối thiểu 4 ký tự)..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
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
                    { id: 'sales', label: 'Kinh Doanh', desc: 'Bán hàng & Lập phiếu' },
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
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  placeholder="VD: Hoàng Đức Nam"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Đăng Nhập *</label>
                  <input
                    type="email"
                    required
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    placeholder="nam.hoang@vitinhantam.com"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số Điện Thoại</label>
                  <input
                    type="text"
                    value={newUserForm.phone}
                    onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                    placeholder="0912.345.678"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
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
                    { id: 'sales', label: 'Kinh Doanh', desc: 'Bán hàng & CSKH' },
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

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật Khẩu Khởi Tạo * (Tối thiểu 4 ký tự)
                </label>
                <input
                  type="text"
                  required
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  placeholder="Nhập mật khẩu khởi tạo..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
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
