import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySession, type SessionPayload } from '@/lib/session';

/**
 * Chạy TRƯỚC khi request tới route (Next.js 16: middleware -> proxy).
 * - Không bao giờ tin header `x-user-role` do client gửi lên (đè lại từ session đã ký).
 * - Chặn trang admin và API quản trị khi chưa đăng nhập hợp lệ.
 */

const PROTECTED_PAGES = [
  '/dashboard',
  '/tai-chinh',
  '/kho-may',
  '/phieu-sua-chua',
  '/khach-hang',
  '/thanh-vien',
  '/tien-cong',
  '/cai-dat',
  '/cuu-ho-onsite',
  '/quan-ly-key',
  '/quan-ly-don-hang',
];

const PROTECTED_APIS = ['/api/inventory', '/api/tickets'];

/**
 * Các trang nhạy cảm: ngoài việc phải đăng nhập, còn phải đúng quyền
 * (trùng khớp với check phía client: canAccessSettings / canManageUsers / canAccessPayroll).
 */
const ADMIN_ONLY_PAGES: Array<{ path: string; allow: (s: NonNullable<SessionPayload>) => boolean }> = [
  { path: '/tai-chinh', allow: (s) => s.role === 'admin' || s.canAccessPayroll === true },
  { path: '/cai-dat', allow: (s) => s.role === 'admin' || s.canManageUsers === true },
  { path: '/thanh-vien', allow: (s) => s.role === 'admin' || s.canManageUsers === true },
  { path: '/tien-cong', allow: (s) => s.role === 'admin' || s.canAccessPayroll === true },
];

const isProtectedPage = (pathname: string): boolean =>
  PROTECTED_PAGES.some((path) => pathname === path || pathname.startsWith(`${path}/`));

const isProtectedApi = (pathname: string): boolean =>
  PROTECTED_APIS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = verifySession(request.cookies.get(SESSION_COOKIE)?.value);

  // Đè mọi header định danh do client tự đặt
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete('x-user-role');
  requestHeaders.delete('x-user-id');
  if (session) {
    requestHeaders.set('x-user-role', session.role);
    requestHeaders.set('x-user-id', session.sub);
  }

  if (isProtectedApi(pathname)) {
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized', message: 'Phiên đăng nhập không tồn tại.' }, { status: 401 });
    }
    if (session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Chỉ Quản trị viên (Admin) mới có quyền truy cập API này.' },
        { status: 403 }
      );
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (isProtectedPage(pathname)) {
    if (!session) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.search = '';
      return NextResponse.redirect(loginUrl);
    }

    const rule = ADMIN_ONLY_PAGES.find((r) => pathname === r.path || pathname.startsWith(`${r.path}/`));
    if (rule && !rule.allow(session)) {
      const deniedUrl = request.nextUrl.clone();
      deniedUrl.pathname = '/login';
      deniedUrl.search = '';
      return NextResponse.redirect(deniedUrl);
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/kho-may/:path*',
    '/phieu-sua-chua/:path*',
    '/khach-hang/:path*',
    '/thanh-vien/:path*',
    '/tien-cong/:path*',
    '/cai-dat/:path*',
    '/cuu-ho-onsite/:path*',
    '/quan-ly-key/:path*',
    '/quan-ly-don-hang/:path*',
    '/api/inventory/:path*',
    '/api/tickets/:path*',
  ],
};
