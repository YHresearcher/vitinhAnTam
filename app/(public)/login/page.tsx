'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useViTinhAnTamStore } from '@/lib/store';
import { UserAccount } from '@/lib/supabase';
import { Logo } from '@/components/Logo';
import { RoleLoginModal } from '@/components/login/RoleLoginModal';
import { RoleCardConfig } from '@/components/login/roleConfigs';
import { RoleCardGrid } from '@/components/login/RoleCardGrid';

export default function LoginPage() {
  const { users, loginWithCredentials } = useViTinhAnTamStore();

  const [activeModalRole, setActiveModalRole] = useState<RoleCardConfig | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [identifierInput, setIdentifierInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleOpenRoleModal = (roleConfig: RoleCardConfig) => {
    const roleUsers = users.filter((u) => u.role === roleConfig.role);
    const targetUser = roleUsers[0] || users.find((u) => u.role === 'admin') || users[0];

    setActiveModalRole(roleConfig);
    setSelectedUser(targetUser);
    setIdentifierInput(targetUser?.username || targetUser?.email || '');
    setPasswordInput('');
    setShowPassword(false);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSelectUserAccount = (user: UserAccount) => {
    setSelectedUser(user);
    setIdentifierInput(user.username || user.email);
    setPasswordInput('');
    setErrorMessage('');
  };

  const handleQuickFillPassword = () => {
    if (activeModalRole) {
      setPasswordInput(activeModalRole.defaultPass);
    }
  };

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const res = await loginWithCredentials(identifierInput, passwordInput);
    setIsSubmitting(false);

    if (res.success && res.user) {
      setSuccessMessage(res.message);
      // Chuyển hướng ngay lập tức đến trang quản trị
      window.location.replace('/dashboard');
    } else {
      setErrorMessage(res.message || 'Mật khẩu không chính xác!');
    }
  };

  const handleCloseModal = () => {
    setActiveModalRole(null);
    setErrorMessage('');
    setSuccessMessage('');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans">
      {/* Top Header */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between py-2">
        <Link href="/" className="inline-block transition-transform hover:scale-102">
          <Logo />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#735A4D] hover:text-[#C0392B] font-semibold px-3 py-1.5 rounded-lg hover:bg-white/80 transition-all"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          <span>Về trang chủ</span>
        </Link>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-3xl mx-auto my-auto py-6 sm:py-10">
        {/* Title & Badge */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100/70 border border-red-200 text-[#C0392B] text-[11px] font-bold tracking-wider uppercase mb-3 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#C0392B] animate-pulse" />
            <span>Cổng Đăng Nhập Nội Bộ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2B1810] tracking-tight">
            Chọn Vai Trò Để Đăng Nhập
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Nhấp vào vai trò tương ứng để mở bảng đăng nhập nhanh
          </p>
        </div>

        {/* Role Selection Cards */}
        <RoleCardGrid users={users} onSelectRole={handleOpenRoleModal} />
      </div>

      {/* Footer */}
      <div className="w-full max-w-4xl mx-auto text-center py-4 text-xs text-slate-400 font-medium">
        © {new Date().getFullYear()} Vi Tính An Tâm — Hệ Thống Quản Trị & Điều Phối Doanh Nghiệp
      </div>

      {/* FAST LOGIN POPUP MODAL */}
      {activeModalRole && (
        <RoleLoginModal
          activeRole={activeModalRole}
          users={users}
          selectedUser={selectedUser}
          identifierInput={identifierInput}
          passwordInput={passwordInput}
          showPassword={showPassword}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
          successMessage={successMessage}
          onSelectUser={handleSelectUserAccount}
          onIdentifierChange={setIdentifierInput}
          onPasswordChange={setPasswordInput}
          onToggleShowPassword={() => setShowPassword((prev) => !prev)}
          onQuickFillPassword={handleQuickFillPassword}
          onSubmit={handleFormLogin}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
