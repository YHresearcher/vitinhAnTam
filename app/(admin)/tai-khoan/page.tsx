'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useViTinhAnTamStore } from '@/lib/store';

// Trang "Tài khoản của tôi": mỗi thành viên tự sửa THÔNG TIN CỦA CHÍNH MÌNH.
// Chỉ 4 thứ được đổi ở đây: họ tên, số điện thoại, email, mật khẩu.
// Tên đăng nhập, vai trò, quyền hạn, trạng thái KHÔNG đổi được ở đây —
// vẫn chỉ Admin đổi trong /thanh-vien.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function MyAccountPage() {
  const { currentUser, isLoggedIn, applyMyProfile, logout } = useViTinhAnTamStore();

  // --- Toast (cùng mẫu với trang Thành viên) ---
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (msg: string, durationMs: number = 4000) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), durationMs);
  };
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // --- Form thông tin cá nhân (điền sẵn từ tài khoản đang đăng nhập) ---
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  // Đồng bộ form khi tài khoản đang đăng nhập đổi sang người khác (không
  // ghi đè các chỉnh sửa đang gõ dở của cùng một tài khoản).
  const loadedForIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!currentUser?.id || loadedForIdRef.current === currentUser.id) return;
    loadedForIdRef.current = currentUser.id;
    setProfileForm({
      name: currentUser.name || '',
      phone: currentUser.phone || '',
      email: currentUser.email || '',
    });
  }, [currentUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = profileForm.name.trim();
    const phone = profileForm.phone.trim();
    const email = profileForm.email.trim().toLowerCase();
    if (!name) {
      showToast('Vui lòng nhập họ tên.');
      return;
    }
    if (!EMAIL_RE.test(email)) {
      showToast('Vui lòng nhập email hợp lệ!');
      return;
    }
    setIsSavingProfile(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_profile', name, phone, email }),
      });
      const data = (await res.json().catch(() => null)) as {
        success?: boolean;
        message?: string;
        user?: Parameters<typeof applyMyProfile>[0];
      } | null;
      if (!res.ok || !data?.success) {
        showToast(data?.message || 'Không thể cập nhật thông tin. Vui lòng thử lại.');
        return;
      }
      // Cập nhật store ngay để header/sidebar hiện tên mới, không cần tải lại.
      if (data.user) applyMyProfile(data.user);
      showToast(data.message || 'Đã cập nhật thông tin tài khoản!');
    } catch {
      showToast('Lỗi kết nối máy chủ. Vui lòng thử lại.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // --- Form đổi mật khẩu ---
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    const current = passwordForm.current;
    const next = passwordForm.next;
    const confirm = passwordForm.confirm;
    // Cùng chính sách với đổi mật khẩu lần đầu: tối thiểu 8 ký tự, khác
    // mật khẩu hiện tại, nhập lại phải khớp (máy chủ kiểm tra lại một lần nữa).
    if (!current) {
      setPasswordError('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    if (!next || next.length < 8) {
      setPasswordError('Mật khẩu mới phải có tối thiểu 8 ký tự!');
      return;
    }
    if (next === current) {
      setPasswordError('Mật khẩu mới không được trùng với mật khẩu hiện tại.');
      return;
    }
    if (next !== confirm) {
      setPasswordError('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }
    setIsSavingPassword(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_password',
          currentPassword: current,
          newPassword: next,
          confirmPassword: confirm,
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        success?: boolean;
        message?: string;
      } | null;
      if (!res.ok || !data?.success) {
        setPasswordError(data?.message || 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại.');
        return;
      }
      // Đổi mật khẩu xong thì đăng xuất giống luồng đổi mật khẩu lần đầu:
      // máy chủ đã xóa cookie phiên; logout() dọn state client rồi tự đưa về /login.
      showToast(data.message || 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại bằng mật khẩu mới.');
      setPasswordForm({ current: '', next: '', confirm: '' });
      logout();
    } catch {
      setPasswordError('Lỗi kết nối máy chủ. Vui lòng thử lại.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Layout quản trị đã chặn người chưa đăng nhập; trang chỉ render khi có phiên.
  if (!isLoggedIn) return null;

  const inputCls =
    'w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all';
  const labelCls = 'block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1';

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-white text-slate-900 px-4 py-3 rounded-xl shadow-2xl border-2 border-blue-600 text-xs font-semibold flex items-center gap-2.5 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Tài khoản của tôi
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Xem và cập nhật thông tin tài khoản của chính bạn.
        </p>
      </div>

      {/* Thông tin chỉ xem: tên đăng nhập + vai trò (chỉ Admin mới đổi) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400">Tên đăng nhập: </span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {currentUser?.username || '—'}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400">Vai trò: </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {currentUser?.roleTitle || currentUser?.role || '—'}
            </span>
          </div>
          {currentUser?.referral_code ? (
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Mã ID: </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {currentUser.referral_code}
              </span>
            </div>
          ) : null}
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3">
          Tên đăng nhập và vai trò chỉ Admin mới thay đổi được (trong trang Nhân sự &amp; Phân quyền).
        </p>
      </div>

      {/* Thông tin cá nhân */}
      <form
        onSubmit={handleSaveProfile}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4"
      >
        <h2 className="text-base font-black text-slate-900 dark:text-white">Thông tin cá nhân</h2>

        <div>
          <label className={labelCls} htmlFor="my-name">
            Họ tên *
          </label>
          <input
            id="my-name"
            type="text"
            value={profileForm.name}
            onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Nhập họ tên..."
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="my-phone">
            Số điện thoại
          </label>
          <input
            id="my-phone"
            type="tel"
            value={profileForm.phone}
            onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="Nhập số điện thoại..."
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="my-email">
            Email *
          </label>
          <input
            id="my-email"
            type="email"
            value={profileForm.email}
            onChange={(e) => setProfileForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="Nhập email..."
            className={inputCls}
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Email dùng để nhận thông báo khôi phục mật khẩu — nhập đúng email bạn hay dùng.
          </p>
        </div>

        <div className="pt-1">
          <button
            type="submit"
            disabled={isSavingProfile}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-50"
          >
            {isSavingProfile ? 'Đang lưu...' : 'Lưu thông tin'}
          </button>
        </div>
      </form>

      {/* Đổi mật khẩu */}
      <form
        onSubmit={handleChangePassword}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 dark:text-white">Đổi mật khẩu</h2>
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="text-[11px] text-blue-600 hover:underline font-semibold"
          >
            {showPassword ? 'Ẩn' : 'Hiện'} mật khẩu
          </button>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Mật khẩu mới tối thiểu 8 ký tự và khác mật khẩu hiện tại. Sau khi đổi, bạn sẽ được đăng xuất và
          đăng nhập lại bằng mật khẩu mới.
        </p>

        <div>
          <label className={labelCls} htmlFor="my-current-password">
            Mật khẩu hiện tại *
          </label>
          <input
            id="my-current-password"
            type={showPassword ? 'text' : 'password'}
            value={passwordForm.current}
            onChange={(e) => setPasswordForm((f) => ({ ...f, current: e.target.value }))}
            placeholder="Nhập mật khẩu hiện tại..."
            className={`${inputCls} font-mono`}
            autoComplete="current-password"
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="my-new-password">
            Mật khẩu mới *
          </label>
          <input
            id="my-new-password"
            type={showPassword ? 'text' : 'password'}
            value={passwordForm.next}
            onChange={(e) => setPasswordForm((f) => ({ ...f, next: e.target.value }))}
            placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)..."
            className={`${inputCls} font-mono`}
            autoComplete="new-password"
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="my-confirm-password">
            Nhập lại mật khẩu mới *
          </label>
          <input
            id="my-confirm-password"
            type={showPassword ? 'text' : 'password'}
            value={passwordForm.confirm}
            onChange={(e) => setPasswordForm((f) => ({ ...f, confirm: e.target.value }))}
            placeholder="Nhập lại mật khẩu mới..."
            className={`${inputCls} font-mono`}
            autoComplete="new-password"
          />
        </div>

        {passwordError && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 font-medium flex items-center gap-2">
            <span>⚠️</span>
            <span>{passwordError}</span>
          </div>
        )}

        <div className="pt-1">
          <button
            type="submit"
            disabled={isSavingPassword}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-amber-600/20 cursor-pointer disabled:opacity-50"
          >
            {isSavingPassword ? 'Đang cập nhật...' : 'Đổi mật khẩu & Đăng xuất'}
          </button>
        </div>
      </form>
    </div>
  );
}
