'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Logo } from '@/components/Logo';

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setMessage('');
    if (!token) return setError('Liên kết khôi phục không hợp lệ.');
    if (password !== confirm) return setError('Mật khẩu xác nhận không khớp.');
    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) });
      const data = await response.json();
      if (!response.ok) setError(data.message || 'Không thể cập nhật mật khẩu.'); else setMessage(data.message);
    } catch { setError('Không thể kết nối máy chủ. Vui lòng thử lại.'); }
    finally { setLoading(false); }
  }

  return <main className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 sm:p-8">
      <Link href="/login" className="block mb-8"><Logo /></Link>
      <h1 className="text-2xl font-black text-[#2B1810]">Đặt lại mật khẩu</h1>
      <p className="text-sm text-slate-500 mt-2">Mật khẩu mới cần có từ 8 đến 128 ký tự.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <input type="password" required minLength={8} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mật khẩu mới" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-200" />
        <input type="password" required minLength={8} maxLength={128} value={confirm} onChange={(event) => setConfirm(event.target.value)} placeholder="Nhập lại mật khẩu mới" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-200" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-emerald-700 bg-emerald-50 p-3 rounded-xl">{message}</p>}
        <button disabled={loading || Boolean(message)} className="w-full py-3 rounded-xl bg-[#C0392B] text-white font-bold disabled:opacity-50">{loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}</button>
      </form>
      <Link href="/login" className="block text-center mt-5 text-sm text-slate-600 hover:text-[#C0392B]">← Quay lại đăng nhập</Link>
    </div>
  </main>;
}
