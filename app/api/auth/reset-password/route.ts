import { NextRequest, NextResponse } from 'next/server';
import { consumeRecoveryToken } from '@/lib/server/password-recovery';
import { setPassword } from '@/lib/server/users';
import { validatePassword } from '@/lib/server/password-validator';

export async function POST(request: NextRequest) {
  let body: { token?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Yêu cầu không hợp lệ.' }, { status: 400 });
  }

  const token = typeof body.token === 'string' ? body.token : '';
  const password = typeof body.password === 'string' ? body.password : '';
  
  const validation = validatePassword(password, []);
  if (!validation.valid) {
    return NextResponse.json({ success: false, message: validation.errors.join(' ') }, { status: 400 });
  }

  const userId = consumeRecoveryToken(token);
  if (!userId || !setPassword(userId, password)) {
    return NextResponse.json({ success: false, message: 'Liên kết khôi phục không hợp lệ hoặc đã hết hạn.' }, { status: 400 });
  }

  return NextResponse.json({ success: true, message: 'Đã cập nhật mật khẩu. Bạn có thể đăng nhập bằng mật khẩu mới.' });
}
