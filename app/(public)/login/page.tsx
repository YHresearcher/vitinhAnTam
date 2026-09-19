'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useViTinhAnTamStore } from '@/lib/store';
import { UserRole, MOCK_USERS } from '@/lib/supabase';
import { Logo } from '@/components/Logo';

export default function LoginPage() {
  const router = useRouter();
  const { login, currentUser } = useViTinhAnTamStore();

  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [emailInput, setEmailInput] = useState('admin@vitinhantham.vn');
  const [passwordInput, setPasswordInput] = useState('123456');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'admin') {
      setEmailInput('admin@vitinhantham.vn');
    } else if (role === 'technician') {
      setEmailInput('ktv@vitinhantham.vn');
    } else {
      setEmailInput('sales@vitinhantham.vn');
    }
    setErrorMessage('');
  };

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const email = emailInput.trim().toLowerCase();
    let detectedRole: UserRole = selectedRole;

    if (email.includes('admin')) {
      detectedRole = 'admin';
    } else if (email.includes('ktv') || email.includes('tech') || email.includes('tuan')) {
      detectedRole = 'technician';
    } else if (email.includes('sales') || email.includes('ha') || email.includes('kd')) {
      detectedRole = 'sales';
    }

    setTimeout(() => {
      login(detectedRole);
      setIsSubmitting(false);
      const user = MOCK_USERS[detectedRole];
      setSuccessMessage(`Đăng nhập thành công với vai trò ${user.roleTitle} (${user.name})!`);
      setTimeout(() => {
        router.push('/dashboard');
      }, 700);
    }, 400);
  };

  const handleQuickLogin = (role: UserRole) => {
    login(role);
    const user = MOCK_USERS[role];
    setSuccessMessage(`Đăng nhập thành công với vai trò ${user.roleTitle} (${user.name})!`);
    setTimeout(() => {
      router.push('/dashboard');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Link href="/" className="inline-block p-3 rounded-2xl bg-white shadow-xl hover:scale-105 transition-transform">
              <Logo />
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Đăng Nhập Cổng Nội Bộ
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Hệ thống quản lý dịch vụ, kho máy và bảo hành điện tử. Tự động phân quyền theo tài khoản làm việc.
          </p>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="bg-emerald-500/20 border border-emerald-400 text-emerald-100 px-4 py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2 animate-fade-in">
            <span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>
            <span>{successMessage} Đang chuyển tiếp vào hệ thống...</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-rose-500/20 border border-rose-400 text-rose-100 px-4 py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-400 text-lg">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Role Selection Tabs / Quick Login Cards */}
        <div className="bg-white/10 backdrop-blur-md border border-white/15 p-6 rounded-2xl shadow-2xl space-y-6 text-white">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-blue-300">
                Chọn Tài Khoản Vai Trò
              </span>
              <span className="text-slate-400 text-[11px]">Bấm vào thẻ để đăng nhập nhanh</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {/* Option 1: Admin */}
              <div
                onClick={() => handleRoleSelect('admin')}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  selectedRole === 'admin'
                    ? 'bg-blue-600/30 border-blue-400 ring-2 ring-blue-500/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 text-white font-bold">
                  <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-white">Quản Trị Viên (Admin)</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30 font-semibold">
                      Toàn Quyền
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    {MOCK_USERS.admin.name} • admin@vitinhantham.vn
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                    ✓ Điều chỉnh số lượng tồn kho • Duyệt bảng lương &amp; ca làm • Quản trị API
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickLogin('admin');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-[11px] font-bold text-white shrink-0 shadow-xs transition-colors self-center"
                >
                  Đăng Nhập
                </button>
              </div>

              {/* Option 2: Technician */}
              <div
                onClick={() => handleRoleSelect('technician')}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  selectedRole === 'technician'
                    ? 'bg-emerald-600/30 border-emerald-400 ring-2 ring-emerald-500/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0 text-white font-bold">
                  <span className="material-symbols-outlined text-xl">build</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-white">Kỹ Thuật Viên (Technician)</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 font-semibold">
                      Kỹ Thuật &amp; QC
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    {MOCK_USERS.technician.name} • ktv@vitinhantham.vn
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                    ✓ Chẩn đoán, đổi trạng thái phiếu • Nhập máy mới về kho • 🔒 Khóa quyền sửa số lượng tồn
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickLogin('technician');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-[11px] font-bold text-white shrink-0 shadow-xs transition-colors self-center"
                >
                  Đăng Nhập
                </button>
              </div>

              {/* Option 3: Sales */}
              <div
                onClick={() => handleRoleSelect('sales')}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  selectedRole === 'sales'
                    ? 'bg-purple-600/30 border-purple-400 ring-2 ring-purple-500/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shrink-0 text-white font-bold">
                  <span className="material-symbols-outlined text-xl">point_of_sale</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-white">Nhân Viên Kinh Doanh (Sales)</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30 font-semibold">
                      Kinh Doanh &amp; Lập Phiếu
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    {MOCK_USERS.sales.name} • sales@vitinhantham.vn
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                    ✓ Xem kho hàng, lập phiếu tiếp nhận • 🔒 Khóa sửa trạng thái sửa chữa &amp; tồn kho
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickLogin('sales');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-[11px] font-bold text-white shrink-0 shadow-xs transition-colors self-center"
                >
                  Đăng Nhập
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-white/15"></div>
            <span className="flex-shrink mx-4 text-[11px] uppercase tracking-widest text-slate-400 font-semibold">
              Hoặc Đăng Nhập Thủ Công
            </span>
            <div className="flex-grow border-t border-white/15"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleFormLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Email / Tên Đăng Nhập
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                  mail
                </span>
                <input
                  type="text"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="admin@vitinhantham.vn"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/20 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Mật Khẩu
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                  lock
                </span>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/20 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">login</span>
              <span>{isSubmitting ? 'Đang xác thực...' : 'Xác Nhận Đăng Nhập'}</span>
            </button>
          </form>
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Quay lại trang chủ Vi Tính An Tâm</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
