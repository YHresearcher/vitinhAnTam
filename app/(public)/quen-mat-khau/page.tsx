'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { Logo } from '@/components/Logo';
import { useViTinhAnTamStore } from '@/lib/store';

export default function ForgotPasswordPage() {
  const { currentLang } = useViTinhAnTamStore();
  const isEn = currentLang === 'en';
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true); setError(''); setMessage('');
    try {
      const response = await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await response.json();
      if (!response.ok) setError(data.message || (isEn ? 'Failed to process request.' : 'Không thể xử lý yêu cầu.'));
      else setMessage(data.message);
    } catch { setError(isEn ? 'Server connection error. Please try again.' : 'Không thể kết nối máy chủ. Vui lòng thử lại.'); }
    finally { setLoading(false); }
  }

  return <main className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 sm:p-8">
      <Link href="/login" className="block mb-8"><Logo /></Link>
      <h1 className="text-2xl font-black text-[#2B1810]">{isEn ? 'Forgot Password?' : 'Quên mật khẩu?'}</h1>
      <p className="text-sm text-slate-500 mt-2">{isEn ? 'Enter your registered email to receive a recovery link.' : 'Nhập email tài khoản để nhận liên kết khôi phục.'}</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <input type="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="email@vitinhantam.com" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-200" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-emerald-700 bg-emerald-50 p-3 rounded-xl">{message}</p>}
        <button disabled={loading} className="w-full py-3 rounded-xl bg-[#C0392B] text-white font-bold disabled:opacity-50">{loading ? (isEn ? 'Sending...' : 'Đang gửi...') : (isEn ? 'Send Recovery Link' : 'Gửi liên kết khôi phục')}</button>
      </form>
      <Link href="/login" className="block text-center mt-5 text-sm text-slate-600 hover:text-[#C0392B]">{isEn ? '← Back to Sign In' : '← Quay lại đăng nhập'}</Link>
    </div>
  </main>;
}
