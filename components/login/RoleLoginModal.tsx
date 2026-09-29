'use client';

import React from 'react';
import { UserAccount } from '@/lib/supabase';
import { Lock, User, Eye, EyeOff, AlertCircle, CheckCircle2, LogIn } from 'lucide-react';

export interface RoleCardConfig {
  role: string;
  label: string;
  subLabel: string;
  badge: string;
  defaultPass: string;
  Icon: React.ElementType;
  colorScheme: {
    borderHover: string;
    bgHover: string;
    iconBg: string;
    badgeBg: string;
    badgeText: string;
    accentBtn: string;
    ringColor: string;
  };
}

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
  onQuickFillPassword: () => void;
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
  onQuickFillPassword,
  onSubmit,
  onClose,
}: RoleLoginModalProps) {
  const matchingUsers = users.filter((u) => u.role === activeRole.role);
  const Icon = activeRole.Icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in font-sans"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-md ${activeRole.colorScheme.iconBg}`}
            >
              <Icon className="w-5 h-5" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-base font-black text-[#2B1810]">
                {activeRole.label}
              </h3>
              <span
                className={`inline-block text-[10px] font-bold px-2 py-0.2 rounded border mt-0.5 ${activeRole.colorScheme.badgeBg} ${activeRole.colorScheme.badgeText}`}
              >
                {activeRole.badge}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-600 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
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
                      className={`p-2 rounded-xl text-left border text-xs transition-all cursor-pointer flex items-center gap-2 ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full bg-white/20 text-center flex items-center justify-center text-[10px] font-bold shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div className="truncate">
                        <div className="truncate font-semibold">{u.name}</div>
                        <div className="text-[10px] opacity-70 font-mono">@{u.username}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Identifier */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Tên đăng nhập / Email:
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                required
                value={identifierInput}
                onChange={(e) => onIdentifierChange(e.target.value)}
                placeholder="Nhập tên đăng nhập..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm font-mono focus:outline-none focus:bg-white focus:ring-2 ${activeRole.colorScheme.ringColor} transition-all`}
              />
            </div>
          </div>


          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">Mật khẩu:</label>
              <button
                type="button"
                onClick={onQuickFillPassword}
                className="text-[11px] font-bold text-[#C0392B] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Điền mẫu ({activeRole.defaultPass})</span>
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                value={passwordInput}
                onChange={(e) => onPasswordChange(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm font-mono focus:outline-none focus:bg-white focus:ring-2 ${activeRole.colorScheme.ringColor} transition-all`}
              />
              <button
                type="button"
                onClick={onToggleShowPassword}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage} Đang chuyển hướng...</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-5 rounded-xl text-white font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer ${activeRole.colorScheme.accentBtn}`}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" strokeWidth={2} />
                <span>Đăng Nhập Nhanh</span>
              </>
            )}
          </button>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors cursor-pointer"
            >
              Chọn vai trò khác
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
