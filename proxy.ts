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
  '/bai-viet',
];

const PROTECTED_APIS = ['/api/inventory', '/api/tickets'];

/**
 * Các trang nhạy cảm: ngoài việc phải đăng nhập, còn phải đúng quyền
 * (trùng khớp với check phía client: canAccessSettings / canManageUsers / canAccessPayroll).
 */
const ADMIN_ONLY_PAGES: Array<{ path: string; allow: (s: NonNullable<SessionPayload>) => boolean }> = [
  // Tài chính & Tiền công: CHỈ Admin (quyết định 2026-10-28: QL Kỹ thuật chỉ
  // đảm nhiệm kỹ thuật, không xem tài chính/tiền công). Checkbox
  // can_access_payroll cũng không mở 2 trang này cho QL Kỹ thuật — proxy
  // là lớp chặn cuối và chỉ tin role admin.
  { path: '/tai-chinh', allow: (s) => s.role === 'admin' },
  { path: '/cai-dat', allow: (s) => s.role === 'admin' || s.canManageUsers === true },
  { path: '/thanh-vien', allow: (s) => s.role === 'admin' || s.canManageUsers === true },
  { path: '/tien-cong', allow: (s) => s.role === 'admin' },
  // Chỉ Admin được xem/sửa Bài viết & SEO (quyết định 2026-10-27): không mở
  // cho tech_manager hay checkbox phân quyền như các trang trên.
  { path: '/bai-viet', allow: (s) => s.role === 'admin' },
  // Trang Khách hàng (CRM) chỉ Admin + QL Bán hàng (quyết định 2026-10-28):
  // khớp đúng check phía client (canAccessCRM: admin, sales_manager — không
  // có checkbox uỷ quyền). Chế độ "chỉ xem" cũ cho KTV bị bãi bỏ.
  { path: '/khach-hang', allow: (s) => s.role === 'admin' || s.role === 'sales_manager' },
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
    // Cho phép POST /api/tickets công khai để khách đặt lịch hẹn dịch vụ từ trang web
    if (pathname === '/api/tickets' && request.method === 'POST') {
      return NextResponse.next();
    }
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized', message: 'Phiên đăng nhập không tồn tại.' }, { status: 401 });
    }
    const STAFF_ROLES: Array<SessionPayload['role']> = ['admin', 'tech_manager', 'sales_manager', 'sales', 'technician'];
    if (!STAFF_ROLES.includes(session.role)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Chỉ Nhân viên hoặc Quản trị viên mới có quyền truy cập API này.' },
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
      // Đã đăng nhập nhưng không đủ quyền: HIỆN THÔNG BÁO thay vì đẩy về /login
      // (đẩy về /login khiến người dùng tưởng phiên đã hết, trong khi phiên vẫn còn).
      // Trang /khong-co-quyen chỉ hiển thị thông báo, không tải dữ liệu của trang bị khóa.
      const deniedUrl = request.nextUrl.clone();
      deniedUrl.pathname = '/khong-co-quyen';
      deniedUrl.search = '';
      deniedUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(deniedUrl);
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/tai-chinh/:path*',
    '/kho-may/:path*',
    '/phieu-sua-chua/:path*',
    '/khach-hang/:path*',
    '/thanh-vien/:path*',
    '/tien-cong/:path*',
    '/cai-dat/:path*',
    '/cuu-ho-onsite/:path*',
    '/quan-ly-key/:path*',
    '/quan-ly-don-hang/:path*',
    '/bai-viet/:path*',
    '/api/inventory/:path*',
    '/api/tickets/:path*',
  ],
};
