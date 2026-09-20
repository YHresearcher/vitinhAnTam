'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useViTinhAnTamStore } from '@/lib/store';
import { TRANSLATIONS } from '@/lib/translations';
import { UserRole, UserAccount } from '@/lib/supabase';
import { Shield, Wrench, BadgeDollarSign, Mail, Lock, LogIn, ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/Logo';

export default function LoginPage() {
  const router = useRouter();
  const { users, loginWithCredentials, setCurrentUserById, currentLang } = useViTinhAnTamStore();
  const t = TRANSLATIONS[currentLang || 'vi'].login;

  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || 'u-admin-1');
  const [emailInput, setEmailInput] = useState(users[0]?.email || 'admin@vitinhantham.vn');
  const [passwordInput, setPasswordInput] = useState('123456');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSelectMember = (user: UserAccount) => {
    setSelectedUserId(user.id);
    setEmailInput(user.email);
    setPasswordInput(user.password || '123456');
    setErrorMessage('');
  };

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    setTimeout(() => {
      const res = loginWithCredentials(emailInput, passwordInput);
      setIsSubmitting(false);
      if (res.success && res.user) {
        setSuccessMessage(res.message);
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
      } else {
        setErrorMessage(res.message);
      }
    }, 300);
  };

  const handleQuickLoginUser = (user: UserAccount) => {
    setCurrentUserById(user.id);
    setSuccessMessage(currentLang === 'en' ? `Quick sign-in successful: ${user.roleTitle} (${user.name})!` : `Đăng nhập nhanh thành công: ${user.roleTitle} (${user.name})!`);
    setTimeout(() => {
      router.push('/dashboard');
    }, 450);
  };

  // Find sample representative for each role from dynamic users
  const adminMember = users.find((u) => u.role === 'admin') || users[0];
  const techMember = users.find((u) => u.role === 'technician') || users[1];
  const salesMember = users.find((u) => u.role === 'sales') || users[2];

  const quickRoles = [
    {
      role: 'admin' as UserRole,
      user: adminMember,
      label: currentLang === 'en' ? 'System Administrator (Admin)' : 'Quản Trị Viên (Admin)',
      badge: currentLang === 'en' ? 'Full Control' : 'Toàn Quyền',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
      activeClass: 'bg-blue-50/80 border-2 border-blue-600 ring-2 ring-blue-100 shadow-xs',
      hoverClass: 'hover:border-blue-300 hover:bg-blue-50/30',
      btnBg: 'bg-blue-600 hover:bg-blue-700',
      Icon: Shield,
      iconBg: 'bg-blue-600',
      desc: currentLang === 'en' ? '✓ Full authority to manage inventory, credentials, remove staff, view payroll & revenue.' : '✓ Toàn quyền xem & sửa kho, mật khẩu, xóa thành viên, tính lương tiền công.',
    },
    {
      role: 'technician' as UserRole,
      user: techMember,
      label: currentLang === 'en' ? 'Technical Lead (Technician)' : 'Kỹ Thuật Viên (Technician)',
      badge: currentLang === 'en' ? 'Engineering & QC' : 'Kỹ Thuật & QC',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      activeClass: 'bg-emerald-50/80 border-2 border-emerald-600 ring-2 ring-emerald-100 shadow-xs',
      hoverClass: 'hover:border-emerald-300 hover:bg-emerald-50/30',
      btnBg: 'bg-emerald-600 hover:bg-emerald-700',
      Icon: Wrench,
      iconBg: 'bg-emerald-600',
      desc: currentLang === 'en' ? '✓ Diagnostics, ticket status dispatch, warehouse receiving • 🔒 Stock editing restricted' : '✓ Chẩn đoán, đổi trạng thái phiếu, nhập máy mới về kho • 🔒 Khóa quyền sửa số lượng tồn',
    },
    {
      role: 'sales' as UserRole,
      user: salesMember,
      label: currentLang === 'en' ? 'Sales Consultant (Sales)' : 'Nhân Viên Kinh Doanh (Sales)',
      badge: currentLang === 'en' ? 'Sales & CS' : 'Kinh Doanh & CSKH',
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
      activeClass: 'bg-purple-50/80 border-2 border-purple-600 ring-2 ring-purple-100 shadow-xs',
      hoverClass: 'hover:border-purple-300 hover:bg-purple-50/30',
      btnBg: 'bg-purple-600 hover:bg-purple-700',
      Icon: BadgeDollarSign,
      iconBg: 'bg-purple-600',
      desc: currentLang === 'en' ? '✓ Browse live stock, initiate customer service tickets • 🔒 Technical dispatch locked' : '✓ Xem kho hàng, lập phiếu tiếp nhận • 🔒 Khóa sửa trạng thái sửa chữa & tồn kho',
    },
  ];

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
            <span>{t.badge}</span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t.title}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            {t.subtitle}
          </p>
        </div>

        {/* Notifications */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-shake">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Card Container */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-200 space-y-6">
          {/* Quick Login Role Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-500">
                {t.oneClickTitle}
              </span>
              <span className="text-[11px] text-blue-600 font-semibold">{t.oneClickAuto}</span>
            </div>

            <div className="space-y-2.5">
              {quickRoles.map((qr) => {
                if (!qr.user) return null;
                const isSelected = selectedUserId === qr.user.id;
                const RoleIcon = qr.Icon;
                return (
                  <div
                    key={qr.role}
                    onClick={() => handleSelectMember(qr.user)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      isSelected ? qr.activeClass : `bg-white border-slate-200 ${qr.hoverClass}`
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl ${qr.iconBg} flex items-center justify-center shrink-0 text-white font-bold shadow-xs`}
                    >
                      <RoleIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{qr.label}</h3>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${qr.badgeClass}`}
                        >
                          {qr.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                        {qr.user.name} • <span className="font-mono text-slate-700">{qr.user.email}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1 leading-snug">{qr.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickLoginUser(qr.user);
                      }}
                      className={`px-3 py-1.5 rounded-lg ${qr.btnBg} text-[11px] font-bold text-white shrink-0 shadow-xs transition-colors self-center`}
                    >
                      {t.btnQuickLogin}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-[11px] uppercase tracking-widest text-slate-400 font-bold">
              {t.orDivider}
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleFormLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t.emailLabel}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-600 w-4 h-4" />
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">{t.passwordLabel}</label>
                <span className="text-[11px] text-slate-400">{t.defaultPasswordHint}</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-600 w-4 h-4" />
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
              <LogIn className="w-4 h-4" />
              <span>{isSubmitting ? t.verifying : t.btnSubmit}</span>
            </button>
          </form>
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.backToHome}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
