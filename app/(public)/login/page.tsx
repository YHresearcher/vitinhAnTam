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
  const { users, loginWithCredentials, currentLang } = useViTinhAnTamStore();
  const t = TRANSLATIONS[currentLang || 'vi'].login;

  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || 'u-admin-1');
  const [emailInput, setEmailInput] = useState(users[0]?.username || 'thanhphan');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Chọn tài khoản CHỈ điền tên đăng nhập — không bao giờ tự điền mật khẩu
  const handleSelectMember = (user: UserAccount) => {
    setSelectedUserId(user.id);
    setEmailInput(user.username || user.email);
    setPasswordInput('');
    setErrorMessage('');
  };

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const res = await loginWithCredentials(emailInput, passwordInput);
    setIsSubmitting(false);
    if (res.success && res.user) {
      setSuccessMessage(res.message);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 300);
    } else {
      setErrorMessage(res.message);
    }
  };

  // Find sample representative for each role from dynamic users
  const adminMember = users.find((u) => u.role === 'admin' || u.username === 'thanhphan') || users[0];
  const salesMember = users.find((u) => u.role === 'sales' || u.username === 'sales01') || users[1];
  const techMember = users.find((u) => u.role === 'technician' || u.username === 'tech01') || users[2];

  const quickRoles = [
    {
      role: 'admin' as UserRole,
      user: adminMember,
      label: currentLang === 'en' ? 'System Administrator (Admin)' : 'Quản Trị Viên (Admin)',
      badge: 'admin = thanhphan',
      badgeClass: 'bg-[#FBE8DE] text-[#C0392B] border-[#F2C4B2] font-mono',
      activeClass: 'bg-[#FBE8DE]/30 border-2 border-[#C0392B] ring-2 ring-[#F2C4B2] shadow-xs',
      hoverClass: 'hover:border-[#C0392B]/40 hover:bg-[#FBE8DE]/20',
      btnBg: 'bg-[#C0392B] hover:bg-[#A93226]',
      Icon: Shield,
      iconBg: 'bg-[#C0392B]',
      desc: currentLang === 'en' ? '✓ Full authority to manage inventory, credentials, remove staff, view payroll & revenue.' : '✓ Toàn quyền quản trị: cấu hình, xem/sửa kho, quản lý tài khoản, doanh thu và lương.',
    },
    {
      role: 'sales' as UserRole,
      user: salesMember,
      label: currentLang === 'en' ? 'Sales Consultant (Sales)' : 'Nhân Viên Kinh Doanh (Sales)',
      badge: 'sales = sales01',
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-200 font-mono',
      activeClass: 'bg-purple-50/80 border-2 border-purple-600 ring-2 ring-purple-100 shadow-xs',
      hoverClass: 'hover:border-purple-300 hover:bg-purple-50/30',
      btnBg: 'bg-purple-600 hover:bg-purple-700',
      Icon: BadgeDollarSign,
      iconBg: 'bg-purple-600',
      desc: currentLang === 'en' ? '✓ Browse live stock, sell & issue warranty, CRM • 🔒 Technical dispatch locked' : '✓ Bán máy, xuất phiếu bảo hành, quản lý khách hàng (CRM), xem tồn kho.',
    },
    {
      role: 'technician' as UserRole,
      user: techMember,
      label: currentLang === 'en' ? 'Technical Lead (Technician)' : 'Kỹ Thuật Viên (Kỹ thuật)',
      badge: 'Kỹ thuật = tech01',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200 font-mono',
      activeClass: 'bg-emerald-50/80 border-2 border-emerald-600 ring-2 ring-emerald-100 shadow-xs',
      hoverClass: 'hover:border-emerald-300 hover:bg-emerald-50/30',
      btnBg: 'bg-emerald-600 hover:bg-emerald-700',
      Icon: Wrench,
      iconBg: 'bg-emerald-600',
      desc: currentLang === 'en' ? '✓ Diagnostics, ticket status dispatch, warehouse receiving • 🔒 Stock editing restricted' : '✓ Tiếp nhận sửa chữa, xử lý phiếu cứu hộ tận nơi, kiểm tra QC phần cứng.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl space-y-6">
        {/* Branding */}
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="inline-block hover:opacity-95 transition-opacity">
            <Logo />
          </Link>
          <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF7F2] border border-[#E8E2D9] text-xs font-bold text-[#C0392B]">
            <span className="w-2 h-2 rounded-full bg-[#C0392B]" />
            <span>{t.badge}</span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#2B1810] tracking-tight">
            {t.title}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#735A4D]">
            {t.subtitle}
          </p>
        </div>

        {/* Notifications */}
        {errorMessage && (
          <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-shake">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Card Container */}
        <div className="bg-[#FFFDF9] p-6 sm:p-8 rounded-lg shadow-sm border border-[#E8E2D9] space-y-6">
          {/* Quick Login Role Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider font-bold text-[#735A4D]">
                {t.oneClickTitle}
              </span>
              <span className="text-[11px] text-[#C0392B] font-semibold">{t.oneClickAuto}</span>
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
                    className={`p-4 rounded-lg border transition-all cursor-pointer flex items-start gap-3.5 ${
                      isSelected ? 'bg-[#FAF7F2] border-2 border-[#C0392B] shadow-xs' : 'bg-white border-[#E8E2D9] hover:border-[#C0392B]/40 hover:bg-[#FAF7F2]/50'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg ${isSelected ? 'bg-[#C0392B]' : 'bg-[#2B1810]'} flex items-center justify-center shrink-0 text-white font-bold shadow-xs`}
                    >
                      <RoleIcon className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-bold text-[#2B1810]">{qr.label}</h3>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md border font-bold ${
                            qr.role === 'admin' ? 'bg-[#FAF7F2] text-[#C0392B] border-[#C0392B]/30' :
                            qr.role === 'sales' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {qr.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#735A4D] font-medium mt-0.5">
                        {qr.user.name} • Tên đăng nhập: <span className="font-mono font-bold text-[#C0392B] bg-[#FAF7F2] px-1.5 py-0.5 rounded border border-[#E8E2D9]">@{qr.user.username || qr.user.email.split('@')[0]}</span>
                      </p>
                      <p className="text-[10px] text-[#735A4D]/80 mt-1 leading-snug">{qr.desc}</p>
                    </div>
                    <span
                      className="px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#E8E2D9] text-[11px] font-bold text-[#735A4D] shrink-0 self-center"
                      aria-hidden="true"
                    >
                      {t.btnSelectAccount}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#E8E2D9]"></div>
            <span className="flex-shrink mx-4 text-[11px] uppercase tracking-widest text-[#735A4D]/60 font-bold">
              {t.orDivider}
            </span>
            <div className="flex-grow border-t border-[#E8E2D9]"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleFormLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#2B1810] mb-1.5">
                {t.emailLabel}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C0392B] w-4 h-4" strokeWidth={1.5} />
                <input
                  type="text"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="thanhphan, sales01, tech01 hoặc email..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#FAF7F2] border border-[#E8E2D9] text-[#2B1810] placeholder-[#735A4D]/50 text-xs sm:text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#C0392B] focus:border-[#C0392B] transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#2B1810]">{t.passwordLabel}</label>
                <span className="text-[11px] text-[#C0392B] font-semibold">{t.defaultPasswordHint}</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C0392B] w-4 h-4" strokeWidth={1.5} />
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#FAF7F2] border border-[#E8E2D9] text-[#2B1810] placeholder-[#735A4D]/50 text-xs sm:text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#C0392B] focus:border-[#C0392B] transition-all font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-lg bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-sm shadow-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" strokeWidth={1.5} />
              <span>{isSubmitting ? t.verifying : t.btnSubmit}</span>
            </button>
          </form>
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#735A4D] hover:text-[#C0392B] font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>{t.backToHome}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
