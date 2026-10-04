'use client';

import React from 'react';
import { UserAccount } from '@/lib/supabase';
import { RoleCardConfig } from './roleConfigs';

export interface RoleLoginModalProps {
  activeRole: RoleCardConfig;
  users: UserAccount[];
  selectedUser: UserAccount | null;
  identifierInput: string;
  passwordInput: string;
  showPassword: boolean;
  isSubmitting: boolean;
  errorMessage: string;
  successMessage: string;
  onSelectUser: (user: UserAccount) => void;
  onIdentifierChange: (val: string) => void;
  onPasswordChange: (val: string) => void;
  onToggleShowPassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function RoleLoginModal({
  activeRole,
  users,
  selectedUser,
  identifierInput,
  passwordInput,
  showPassword,
  isSubmitting,
  errorMessage,
  successMessage,
  onSelectUser,
  onIdentifierChange,
  onPasswordChange,
  onToggleShowPassword,
  onSubmit,
  onClose,
}: RoleLoginModalProps) {
  const matchingUsers = users.filter((u) => u.role === activeRole.role);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-tr ${activeRole.colorScheme.glowColor} shadow-md`}>
              {activeRole.iconSvg}
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                {activeRole.label}
              </h3>
              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border mt-0.5 ${activeRole.colorScheme.badgeBg} ${activeRole.colorScheme.badgeText}`}>
                {activeRole.badge}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
            title="Đóng"
          >
            ✕
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={onSubmit} className="p-5 sm:p-6 space-y-4">
          {matchingUsers.length > 1 && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Chọn tài khoản:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {matchingUsers.map((u) => {
                  const isSelected = selectedUser?.id === u.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => onSelectUser(u)}
                      className={`p-2.5 rounded-xl text-left border text-xs transition-all cursor-pointer flex items-center gap-2 ${
                        isSelected
                          ? `${activeRole.colorScheme.badgeBg} border-current ${activeRole.colorScheme.badgeText} font-bold shadow-xs`
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <div className="truncate font-semibold">{u.name}</div>
                        <div className="text-[10px] text-slate-400 truncate font-mono">@{u.username}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Identifier Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tên đăng nhập / Email
            </label>
            <input
              type="text"
              required
              value={identifierInput}
              onChange={(e) => onIdentifierChange(e.target.value)}
              placeholder="VD: admin hoặc admin@vitinhantam.com"
              className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 ${activeRole.colorScheme.activeRing} transition-all`}
            />
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Mật khẩu
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={passwordInput}
                onChange={(e) => onPasswordChange(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className={`w-full px-3.5 py-2.5 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 ${activeRole.colorScheme.activeRing} transition-all`}
              />
              <button
                type="button"
                onClick={onToggleShowPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold p-1 cursor-pointer"
              >
                {showPassword ? 'Ẩn' : 'Hiện'}
              </button>
            </div>
          </div>

          <div className="text-right -mt-2">
            <a href="/quen-mat-khau" className="text-[11px] font-semibold text-blue-600 hover:text-blue-800">
              Quên mật khẩu?
            </a>
          </div>

          {/* Messages */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-medium flex items-center gap-2">
              <span>✓</span>
              <span>{successMessage} Đang chuyển hướng...</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-2 py-2.5 ${activeRole.colorScheme.accentBtn} font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50`}
            >
              {isSubmitting ? (
                <span>Đang xử lý...</span>
              ) : (
                <span>Đăng Nhập Nhanh →</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
