import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, sessionCookieOptions } from '@/lib/session';
import { changePasswordWithVerificationAsync } from '@/lib/server/users';

export async function POST(request: NextRequest) {
  let body: {
    identifier?: unknown;
    currentPassword?: unknown;
    newPassword?: unknown;
    confirmPassword?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Dữ liệu gửi lên không hợp lệ.' }, { status: 400 });
  }

  const identifier = typeof body.identifier === 'string' ? body.identifier.trim() : '';
  const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
  const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';
  const confirmPassword = typeof body.confirmPassword === 'string' ? body.confirmPassword : '';

  if (!identifier) {
    return NextResponse.json({ success: false, message: 'Thiếu thông tin tài khoản cần đổi mật khẩu.' }, { status: 400 });
  }

  if (!currentPassword) {
    return NextResponse.json({ success: false, message: 'Vui lòng nhập mật khẩu hiện tại.' }, { status: 400 });
  }

  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json({ success: false, message: 'Mật khẩu mới phải có tối thiểu 6 ký tự.' }, { status: 400 });
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json({ success: false, message: 'Mật khẩu mới và xác nhận mật khẩu không khớp.' }, { status: 400 });
  }

  if (newPassword === currentPassword) {
    return NextResponse.json(
      { success: false, message: 'Mật khẩu mới không được trùng với mật khẩu hiện tại.' },
      { status: 400 }
    );
  }

  const result = await changePasswordWithVerificationAsync(identifier, currentPassword, newPassword);
  if (!result.success) {
    return NextResponse.json({ success: false, message: result.message }, { status: 400 });
  }

  // Tự động đăng xuất: Xóa cookie phiên làm việc
  const response = NextResponse.json({
    success: true,
    message: 'Đổi mật khẩu thành công! Bạn đã được tự động đăng xuất. Vui lòng đăng nhập lại bằng mật khẩu mới.',
  });

  response.cookies.set(SESSION_COOKIE, '', {
    ...sessionCookieOptions,
    maxAge: 0,
  });

  return response;
}
