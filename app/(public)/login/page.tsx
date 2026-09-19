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
      }, 600);
    }, 350);
  };

  const handleQuickLogin = (role: UserRole) => {
    login(role);
    const user = MOCK_USERS[role];
    setSuccessMessage(`Đăng nhập nhanh thành công: ${user.roleTitle} (${user.name})!`);
    setTimeout(() => {
      router.push('/dashboard');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center relative overflow-hidden">
      {/* Soft Blue Ambient Gradient Backdrop */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-50/70 via-sky-50/30 to-transparent pointer-events-none -z-10" />
      <div className="absolute -top-24 right-1/4 w-72 h-72 bg-blue-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-32 left-1/4 w-80 h-80 bg-sky-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl space-y-6">
        {/* Branding */}
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="inline-block hover:opacity-95 transition-opacity">
            <Logo />
          </Link>
          <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>CỔNG ĐĂNG NHẬP HỆ THỐNG NỘI BỘ</span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Xác Thực Quyền Truy Cập
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-md">
            Hệ thống phân quyền tự động theo vai trò người dùng: Quản Trị Viên (Admin), Kỹ Thuật Viên (Technician), và Kinh Doanh (Sales).
          </p>
        </div>

        {/* Main Card Container */}
        <div className="bg-white border border-slate-200 shadow-xl rounded-3xl p-6 sm:p-8 space-y-6">
          {/* Success message banner */}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-lg">check_circle</span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error message banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-600 text-lg">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1-Click Role Access Selector */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-blue-600">badge</span>
                <span>Chọn Vai Trò Để Đăng Nhập Nhanh</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">1 chạm vào hệ thống</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {/* Option 1: Admin */}
              <div
                onClick={() => handleRoleSelect('admin')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  selectedRole === 'admin'
                    ? 'bg-blue-50/80 border-2 border-blue-600 ring-2 ring-blue-100 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 text-white font-bold shadow-xs">
                  <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900">Quản Trị Viên (Admin)</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 font-bold">
                      Toàn Quyền
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                    {MOCK_USERS.admin.name} • <span className="font-mono text-blue-600">admin@vitinhantham.vn</span>
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                    ✓ Toàn quyền xem &amp; sửa kho, giá nhập, sửa số lượng tồn, duyệt tính lương tiền công.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickLogin('admin');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-[11px] font-bold text-white shrink-0 shadow-xs transition-colors self-center"
                >
                  Đăng Nhập
                </button>
              </div>

              {/* Option 2: Technician */}
              <div
                onClick={() => handleRoleSelect('technician')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  selectedRole === 'technician'
                    ? 'bg-emerald-50/80 border-2 border-emerald-600 ring-2 ring-emerald-100 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0 text-white font-bold shadow-xs">
                  <span className="material-symbols-outlined text-xl">build</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900">Kỹ Thuật Viên (Technician)</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
                      Kỹ Thuật &amp; QC
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                    {MOCK_USERS.technician.name} • <span className="font-mono text-emerald-700">ktv@vitinhantham.vn</span>
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                    ✓ Chẩn đoán, đổi trạng thái phiếu, nhập máy mới về kho • 🔒 Khóa quyền sửa số lượng tồn kho
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickLogin('technician');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-[11px] font-bold text-white shrink-0 shadow-xs transition-colors self-center"
                >
                  Đăng Nhập
                </button>
              </div>

              {/* Option 3: Sales */}
              <div
                onClick={() => handleRoleSelect('sales')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  selectedRole === 'sales'
                    ? 'bg-purple-50/80 border-2 border-purple-600 ring-2 ring-purple-100 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-purple-300 hover:bg-purple-50/30'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shrink-0 text-white font-bold shadow-xs">
                  <span className="material-symbols-outlined text-xl">point_of_sale</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900">Nhân Viên Kinh Doanh (Sales)</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 font-bold">
                      Kinh Doanh &amp; Lập Phiếu
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                    {MOCK_USERS.sales.name} • <span className="font-mono text-purple-700">sales@vitinhantham.vn</span>
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                    ✓ Xem kho hàng, lập phiếu tiếp nhận • 🔒 Khóa sửa trạng thái sửa chữa &amp; tồn kho
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickLogin('sales');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-[11px] font-bold text-white shrink-0 shadow-xs transition-colors self-center"
                >
                  Đăng Nhập
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-[11px] uppercase tracking-widest text-slate-400 font-bold">
              Hoặc Đăng Nhập Bằng Mật Khẩu
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleFormLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email / Tên Đăng Nhập
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-600 text-lg">
                  mail
                </span>
                <input
                  type="text"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="admin@vitinhantham.vn"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Mật Khẩu
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-600 text-lg">
                  lock
                </span>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
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
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 font-medium transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Quay lại trang chủ Vi Tính An Tâm</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
