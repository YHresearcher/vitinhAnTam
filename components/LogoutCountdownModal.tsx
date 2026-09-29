'use client';

import React from 'react';
import { useViTinhAnTamStore } from '@/lib/store';
import { LogOut, ArrowRight, ShieldCheck } from 'lucide-react';

export function LogoutCountdownModal() {
  const { isLoggingOut, logoutCountdown, triggerImmediateRedirectToLogin } = useViTinhAnTamStore();

  if (!isLoggingOut) return null;

  const progressPercent = Math.max(0, Math.min(100, ((3 - (logoutCountdown || 0)) / 3) * 100));

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-fade-in font-sans">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-center p-7 sm:p-8 transform transition-all scale-100 animate-scale-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Animated Icon */}
        <div className="relative mx-auto w-20 h-20 mb-5 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-rose-100 animate-ping opacity-60" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-[#C0392B] to-[#E67E22] text-white flex items-center justify-center shadow-lg shadow-rose-500/25">
            <LogOut className="w-9 h-9 transform -rotate-12" strokeWidth={2} />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-black text-[#2B1810] tracking-tight">
          Đã Đăng Xuất An Toàn
        </h3>
        
        <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">
          Hệ thống sẽ tự động chuyển đến màn hình đăng nhập trong:
        </p>

        {/* Big Countdown Number */}
        <div className="my-5 flex items-center justify-center">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border-2 border-rose-200 text-[#C0392B] text-3xl font-black flex items-center justify-center font-mono shadow-inner shadow-rose-200/50">
              {logoutCountdown}
            </div>
            <span className="text-xs font-bold text-slate-400 ml-2">giây</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-6">
          <div
            className="bg-gradient-to-r from-[#C0392B] to-[#E67E22] h-full transition-all duration-1000 ease-linear rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={triggerImmediateRedirectToLogin}
          className="w-full py-3 px-5 rounded-xl bg-[#2B1810] hover:bg-[#C0392B] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Đăng nhập ngay</span>
          <ArrowRight className="w-4 h-4" strokeWidth={2} />
        </button>

        {/* Footer Security Badge */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Phiên làm việc đã kết thúc và bảo mật thành công</span>
        </div>
      </div>
    </div>
  );
}
