'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useViTinhAnTamStore } from '@/lib/store';
import { UserAccount, UserRole } from '@/lib/supabase';
import {
  ShieldCheck,
  UserCog,
  KeyRound,
  UserPlus,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  Trash2,
  LogIn,
  Search,
  Shield,
  Wrench,
  BadgeDollarSign,
} from 'lucide-react';

export default function MemberManagementPage() {
  const {
    currentUser,
    users,
    updateUser,
    changeUserPassword,
    addUser,
    deleteUser,
    setCurrentUserById,
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

    const ok = await changeUserPassword(passwordModalUser.id, newPassword.trim());
    if (ok) {
      showToast(`Đã cập nhật mật khẩu thành công cho ${passwordModalUser.name}!`);
      setPasswordModalUser(null);
      setNewPassword('');
    } else {
      showToast('Có lỗi xảy ra khi cập nhật mật khẩu.');
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
    } else if (editingUser.role === 'technician') {
      defaultTitle = defaultTitle || 'Kỹ thuật viên';
      avatarBg = 'bg-emerald-600';
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

    const pwd = newUserForm.password.trim() || '123456';
    let defaultTitle = newUserForm.roleTitle.trim();
    let avatarBg = 'bg-blue-600';

    if (newUserForm.role === 'admin') {
      defaultTitle = defaultTitle || 'Quản trị viên hệ thống';
      avatarBg = 'bg-blue-600';
    } else if (newUserForm.role === 'technician') {
      defaultTitle = defaultTitle || 'Kỹ thuật viên phần cứng';
      avatarBg = 'bg-emerald-600';
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
        can_edit_stock: newUserForm.role === 'admin',
        can_update_repair_status: newUserForm.role === 'admin' || newUserForm.role === 'technician',
        can_access_payroll: newUserForm.role === 'admin',
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
  const salesCount = users.filter((u) => u.role === 'sales').length;

  // Access check
  if (!canManageUsers()) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
          <Lock className="w-8 h-8" />
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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all"
          >
            <span>Quay lại Trang Tổng Quan</span>
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
          <CheckCircle2 className="w-5 h-5 text-blue-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs text-slate-500 font-medium">
            <Link href="/dashboard" className="hover:text-blue-600">
              CRM
            </Link>
            <span>/</span>
            <span className="text-blue-700 font-semibold">Quản lý thành viên &amp; Phân quyền</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <UserCog className="w-7 h-7 text-blue-600" />
            <span>Thành Viên &amp; Phân Quyền Hệ Thống</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Toàn quyền sửa thông tin, cập nhật mật khẩu, phân bổ vai trò và cấp phép cho tất cả nhân sự (kể cả Admin).
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsAddingUser(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all active:scale-[0.98]"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Thêm Thành Viên Mới</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tổng Nhân Sự</span>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{users.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-blue-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Quản Trị Viên</span>
            <p className="text-2xl font-black text-blue-700 mt-0.5">{adminCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Kỹ Thuật Viên</span>
            <p className="text-2xl font-black text-emerald-700 mt-0.5">{techCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Wrench className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-purple-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">Kinh Doanh &amp; CSKH</span>
            <p className="text-2xl font-black text-purple-700 mt-0.5">{salesCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <BadgeDollarSign className="w-5 h-5 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo họ tên, email hoặc số điện thoại..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Role Tabs */}
        <div className="flex items-center gap-1.5 shrink-0 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {(['all', 'admin', 'technician', 'sales'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setRoleFilter(tab)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                roleFilter === tab
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'all'
                ? 'Tất cả'
                : tab === 'admin'
                ? 'Admin'
                : tab === 'technician'
                ? 'Kỹ thuật'
                : 'Kinh doanh'}
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
                      member.role === 'admin'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : member.role === 'technician'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}
                  >
                    {member.role === 'admin'
                      ? 'Admin'
                      : member.role === 'technician'
                      ? 'Kỹ Thuật'
                      : 'Kinh Doanh'}
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
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center gap-1 border border-blue-200 transition-colors"
                  >
                    <UserCog className="w-3.5 h-3.5" />
                    <span>Sửa thông tin</span>
                  </button>

                  {/* Change Password */}
                  <button
                    onClick={() => {
                      setPasswordModalUser(member);
                      setNewPassword('');
                      setShowPassword(false);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 border border-slate-200 transition-colors"
                    title="Đổi mật khẩu cho thành viên này"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Mật khẩu</span>
                  </button>
                </div>

                {/* Switch Session to this User */}
                {!isMe && (
                  <button
                    onClick={() => {
                      setCurrentUserById(member.id);
                      showToast(`Đã chuyển ca làm việc sang: ${member.name} (${member.roleTitle})!`);
                    }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Đăng nhập với tài khoản này để kiểm tra quyền"
                  >
                    <LogIn className="w-4 h-4" />
                  </button>
                )}

                {/* Delete button (cannot delete self) */}
                {!isMe && (
                  <button
                    onClick={() => handleDeleteUser(member.id, member.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Xóa thành viên"
                  >
                    <Trash2 className="w-4 h-4" />
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
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-200">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Đổi / Đặt Lại Mật Khẩu</h2>
                  <p className="text-xs text-slate-500">
                    Áp dụng cho: <strong className="text-slate-900">{passwordModalUser.name}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPasswordModalUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
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
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 hover:underline"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Tạo ngẫu nhiên an toàn</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới (tối thiểu 4 ký tự)..."
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-200">
                  <UserCog className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Sửa Thông Tin &amp; Phân Quyền</h2>
                  <p className="text-xs text-slate-500">Mã tài khoản: {editingUser.id}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
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
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'admin', label: 'Quản Trị Viên (Admin)', desc: 'Toàn quyền' },
                    { id: 'technician', label: 'Kỹ Thuật Viên', desc: 'Chẩn đoán & QC' },
                    { id: 'sales', label: 'Kinh Doanh & CSKH', desc: 'Bán hàng & Lập phiếu' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setEditingUser({ ...editingUser, role: r.id as UserRole })}
                      className={`p-3 rounded-xl border text-left transition-all ${
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
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-200">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Thêm Thành Viên Mới</h2>
                  <p className="text-xs text-slate-500">Cấp tài khoản đăng nhập nội bộ cho nhân sự</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddingUser(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
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
                    placeholder="nam.hoang@vitinhantham.vn"
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
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'admin', label: 'Admin', desc: 'Quản trị' },
                    { id: 'technician', label: 'Kỹ Thuật', desc: 'Sửa chữa & QC' },
                    { id: 'sales', label: 'Kinh Doanh', desc: 'Bán hàng' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setNewUserForm({ ...newUserForm, role: r.id as UserRole })}
                      className={`p-3 rounded-xl border text-center transition-all ${
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
                  Mật Khẩu Khởi Tạo (Mặc định: 123456)
                </label>
                <input
                  type="text"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  placeholder="123456"
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
