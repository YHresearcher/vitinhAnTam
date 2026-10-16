import { NextRequest, NextResponse } from 'next/server';
import { createRecoveryToken } from '@/lib/server/password-recovery';
import { loadUsers } from '@/lib/server/users';

const GENERIC_MESSAGE = 'Nếu email tồn tại trong hệ thống, hướng dẫn khôi phục đã được gửi. Vui lòng kiểm tra hộp thư và thư mục spam.';

function isValidEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] as string);
}

export async function POST(request: NextRequest) {
  let body: { email?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: true, message: GENERIC_MESSAGE });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!isValidEmail(email)) return NextResponse.json({ success: true, message: GENERIC_MESSAGE });

  const user = loadUsers().find((candidate) => candidate.email.toLowerCase() === email && candidate.status !== 'suspended');
  if (!user) return NextResponse.json({ success: true, message: GENERIC_MESSAGE });

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || 'Vi Tính An Tâm <onboarding@resend.dev>';
  const appUrl = process.env.APP_URL || request.nextUrl.origin;
  const token = createRecoveryToken(user.id);
  const resetUrl = `${appUrl.replace(/\/$/, '')}/dat-lai-mat-khau?token=${encodeURIComponent(token)}`;

  if (!apiKey) {
    console.warn('Password recovery email not sent: RESEND_API_KEY is not configured.');
    return NextResponse.json({ success: true, message: GENERIC_MESSAGE });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        from,
        to: [user.email],
        reply_to: process.env.RESEND_REPLY_TO || 'p.nhatthanh87@gmail.com',
        subject: '[Vi Tính An Tâm] Khôi phục mật khẩu',
        html: `<p>Xin chào ${escapeHtml(user.name)},</p><p>Nhấn vào nút dưới đây để đặt mật khẩu mới. Liên kết có hiệu lực trong 30 phút và chỉ sử dụng được một lần.</p><p><a href="${escapeHtml(resetUrl)}" style="display:inline-block;padding:12px 18px;background:#C0392B;color:#fff;text-decoration:none;border-radius:8px">Đặt lại mật khẩu</a></p><p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>`,
      }),
    });
    if (!response.ok) console.error('Password recovery email provider error:', response.status);
  } catch (error) {
    console.error('Password recovery email error:', error);
  }

  return NextResponse.json({ success: true, message: GENERIC_MESSAGE });
}
