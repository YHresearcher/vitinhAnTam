'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Lock, Eye, EyeOff, LogIn, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useViTinhAnTamStore } from '@/lib/store';
import { Logo } from '@/components/Logo';
import { FirstTimePasswordModal } from '@/components/login/FirstTimePasswordModal';

export default function LoginPage() {
  const { loginWithCredentials } = useViTinhAnTamStore();

  const [identifierInput, setIdentifierInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [pageNotification, setPageNotification] = useState('');

  // First-time change password state
  const [mustChangePasswordAccount, setMustChangePasswordAccount] = useState<{
    identifier: string;
    currentPassword?: string;
    name?: string;
  } | null>(null);

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!identifierInput.trim()) {
      setErrorMessage('Vui lòng nhập tên đăng nhập hoặc email.');
      return;
    }

    if (!passwordInput) {
      setErrorMessage('Vui lòng nhập mật khẩu.');
      return;
    }

    setIsSubmitting(true);

    const res = await loginWithCredentials(identifierInput.trim(), passwordInput);
    setIsSubmitting(false);

    if (res.success && res.user) {
      if (res.mustChangePassword) {
        // Must change password first
        const account = {
          identifier: identifierInput.trim(),
          currentPassword: passwordInput,
          name: res.user.name,
        };
        setMustChangePasswordAccount(account);
        return;
      }

      setSuccessMessage(res.message || 'Đăng nhập thành công! Đang chuyển hướng...');
      // Chuyển hướng ngay lập tức đến trang quản trị
      setTimeout(() => {
        window.location.replace('/dashboard');
      }, 300);
    } else {
      setErrorMessage(res.message || 'Tên đăng nhập hoặc mật khẩu không chính xác!');
    }
  };

  const handlePasswordChangedSuccess = (message: string) => {
    setMustChangePasswordAccount(null);
    setPasswordInput('');
    setPageNotification(`✅ ${message}`);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-slate-950 flex flex-col justify-center p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-200">
      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block transition-transform hover:scale-102">
            <Logo />
          </Link>
        </div>
        {pageNotification && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs sm:text-sm font-medium flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{pageNotification}</span>
            </div>
            <button
              type="button"
              onClick={() => setPageNotification('')}
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 font-bold text-xs cursor-pointer p-1"
            >
              ✕
            </button>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8">
          {/* Title & Badge */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100/70 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-[#C0392B] dark:text-rose-400 text-[11px] font-bold tracking-wider uppercase mb-3 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#C0392B] dark:bg-rose-400 animate-pulse" />
              <span>Cổng Quản Trị Nội Bộ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#2B1810] dark:text-slate-100 tracking-tight">
              Đăng Nhập
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
              Nhập thông tin tài khoản để truy cập hệ thống
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleFormLogin} className="space-y-4">
            {/* Input 1: Tên đăng nhập / Email */}
            <div>
              <label
                htmlFor="identifier"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide"
              >
                Tên đăng nhập hoặc Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="identifier"
                  type="text"
                  required
                  autoComplete="username"
                  value={identifierInput}
                  onChange={(e) => {
                    setIdentifierInput(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="admin hoặc email@vitinhantam.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#C0392B] dark:focus:ring-rose-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Input 2: Mật khẩu */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide"
                >
                  Mật khẩu
                </label>
                <Link
                  href="/quen-mat-khau"
                  className="text-xs font-semibold text-[#C0392B] dark:text-rose-400 hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Nhập mật khẩu"
                  className="w-full pl-10 pr-11 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#C0392B] dark:focus:ring-rose-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 bg-[#C0392B] hover:bg-[#A93226] active:bg-[#922B21] text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Đăng Nhập</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-md mx-auto text-center py-4 text-xs text-slate-400 dark:text-slate-500 font-medium">
        © {new Date().getFullYear()} Vi Tính An Tâm — Hệ Thống Quản Trị Doanh Nghiệp
      </div>

      {/* FIRST TIME CHANGE PASSWORD MODAL */}
      {mustChangePasswordAccount && (
        <FirstTimePasswordModal
          userAccount={mustChangePasswordAccount}
          onSuccess={handlePasswordChangedSuccess}
          onCancel={() => setMustChangePasswordAccount(null)}
        />
      )}
    </div>
  );
}
