'use client';

import React, { useState } from 'react';
import { validatePassword, getPasswordStrength, DEFAULT_TEMPORARY_PASSWORD } from '@/lib/client/password-validator';

export interface FirstTimePasswordModalProps {
  userAccount: {
    identifier: string;
    currentPassword?: string;
    name?: string;
  };
  onSuccess: (message: string) => void;
  onCancel: () => void;
}

export function FirstTimePasswordModal({
  userAccount,
  onSuccess,
  onCancel,
}: FirstTimePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState(userAccount.currentPassword || DEFAULT_TEMPORARY_PASSWORD);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const passwordStrength = getPasswordStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!currentPassword.trim()) {
      setErrorMessage(`Vui lòng nhập mật khẩu hiện tại (mặc định: ${DEFAULT_TEMPORARY_PASSWORD}).`);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Xác nhận mật khẩu mới không khớp.');
      return;
    }

    // Validate mật khẩu với nguyên tắc bảo mật
    const validation = validatePassword(newPassword, [currentPassword]);
    if (!validation.valid) {
      setErrorMessage(validation.errors.join(' '));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: userAccount.identifier,
          currentPassword: currentPassword.trim(),
          newPassword: newPassword.trim(),
          confirmPassword: confirmPassword.trim(),
        }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (data.success) {
        onSuccess(data.message || 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
      } else {
        setErrorMessage(data.message || 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại.');
      }
    } catch {
      setIsSubmitting(false);
      setErrorMessage('Lỗi kết nối máy chủ. Vui lòng thử lại.');
    }
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-amber-50 border-b border-amber-200/70 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-lg shadow-sm">
              🔒
            </div>
            <div>
              <h3 className="text-base font-black text-amber-950">
                Yêu Cầu Đổi Mật Khẩu Lần Đầu
              </h3>
              <p className="text-xs text-amber-800">
                Bảo mật tài khoản {userAccount.name ? `cho ${userAccount.name}` : ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
            title="Hủy"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Tài khoản:</span>
              <span className="font-mono font-bold text-slate-800">{userAccount.identifier}</span>
            </div>
            <p className="text-[11px] text-slate-600 pt-1 border-t border-slate-200">
              Tài khoản đang dùng mật khẩu tạm thời. Vui lòng đổi sang mật khẩu cá nhân mới. Sau khi đổi, bạn sẽ đăng nhập lại với mật khẩu mới.
            </p>
          </div>

          {/* Current Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mật Khẩu Hiện Tại (Mặc định: Antam@2026) *
            </label>
            <input
              type="text"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Antam@2026"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>

          {/* New Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Mật Khẩu Mới (8-15 ký tự, chữ+số+đặc biệt) *
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-blue-600 hover:underline font-semibold"
              >
                {showPassword ? 'Ẩn' : 'Hiện'}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Xác Nhận Mật Khẩu Mới *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>

          {/* Password Strength Indicator */}
          {newPassword && (
            <div className="mt-2 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
              <div className="font-semibold text-slate-700 mb-1">Yêu cầu bảo mật:</div>
              <ul className="space-y-1">
                <li className={`flex items-center gap-1.5 ${passwordStrength.hasLength ? 'text-emerald-600' : 'text-slate-500'}`}>
                  <span>{passwordStrength.hasLength ? '✓' : '○'}</span>
                  <span>Từ 8 đến 15 ký tự</span>
                </li>
                <li className={`flex items-center gap-1.5 ${passwordStrength.hasLetters ? 'text-emerald-600' : 'text-slate-500'}`}>
                  <span>{passwordStrength.hasLetters ? '✓' : '○'}</span>
                  <span>Có chứa chữ cái</span>
                </li>
                <li className={`flex items-center gap-1.5 ${passwordStrength.hasNumbers ? 'text-emerald-600' : 'text-slate-500'}`}>
                  <span>{passwordStrength.hasNumbers ? '✓' : '○'}</span>
                  <span>Có chứa số</span>
                </li>
                <li className={`flex items-center gap-1.5 ${passwordStrength.hasSpecialChars ? 'text-emerald-600' : 'text-slate-500'}`}>
                  <span>{passwordStrength.hasSpecialChars ? '✓' : '○'}</span>
                  <span>Có chứa ký tự đặc biệt</span>
                </li>
              </ul>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-2 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Đang cập nhật...' : 'Đổi Mật Khẩu & Đăng Xuất'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

