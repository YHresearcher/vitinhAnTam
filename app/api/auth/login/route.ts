import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, sessionCookieOptions, signSession } from '@/lib/session';
import { authenticateAsync, stripSecrets } from '@/lib/server/users';

export async function POST(request: NextRequest) {
  let body: { identifier?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Dữ liệu gửi lên không hợp lệ.' }, { status: 400 });
  }

  const identifier = typeof body.identifier === 'string' ? body.identifier.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!identifier || !password) {
    return NextResponse.json(
      { success: false, message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.' },
      { status: 400 }
    );
  }

  const user = await authenticateAsync(identifier, password);
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!' },
      { status: 401 }
    );
  }

  if (user.status === 'suspended') {
    return NextResponse.json(
      { success: false, message: 'Tài khoản này đang bị tạm khóa. Vui lòng liên hệ Admin!' },
      { status: 403 }
    );
  }

  const response = NextResponse.json({
    success: true,
    message: `Đăng nhập thành công: ${user.roleTitle} (${user.name})!`,
    user: stripSecrets(user),
  });
  response.cookies.set(
    SESSION_COOKIE,
    signSession({
      sub: user.id,
      role: user.role,
      name: user.name,
      canManageUsers: user.role === 'admin' || user.permissions?.can_manage_users === true,
      canAccessPayroll: user.role === 'admin' || user.permissions?.can_access_payroll === true,
    }),
    sessionCookieOptions
  );
  return response;
}

