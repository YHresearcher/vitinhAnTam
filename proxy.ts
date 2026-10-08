import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySession, type SessionPayload } from '@/lib/session';

/**
 * Chạy TRƯỚC khi request tới route (Next.js 16: middleware -> proxy).
 * - Không bao giờ tin header `x-user-role` do client gửi lên (đè lại từ session đã ký).
 * - Chặn trang admin và API quản trị khi chưa đăng nhập hợp lệ.
 * - Rate limiting cho auth endpoints.
 */

// Simple in-memory rate limiter (for single instance)
// For production multi-instance, use Upstash Redis or similar
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  if (forwarded) return forwarded.split(',')[0].trim();
  if (realIp) return realIp;
  return 'unknown';
}

function checkRateLimit(key: string, maxRequests: number, windowMs: number): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count, resetTime: record.resetTime };
}

// Cleanup old entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000); // Every 5 minutes
}

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

const PROTECTED_APIS = ['/api/inventory', '/api/tickets', '/api/webhook/notify', '/api/agent', '/api/orders'];

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

  // Rate limiting cho auth endpoints (POST)
  const authEndpoints = [
    '/api/auth/login',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/change-password',
  ];

  const isAuthEndpoint = authEndpoints.some((endpoint) => pathname.startsWith(endpoint));

  if (isAuthEndpoint && request.method === 'POST') {
    const ip = getClientIp(request);
    const key = `ratelimit:${pathname}:${ip}`;

    // Config: 5 requests per 15 minutes for login, 3 per 15 minutes for password reset
    const limits: Record<string, { max: number; windowMs: number }> = {
      '/api/auth/login': { max: 5, windowMs: 15 * 60 * 1000 },
      '/api/auth/forgot-password': { max: 3, windowMs: 15 * 60 * 1000 },
      '/api/auth/reset-password': { max: 3, windowMs: 15 * 60 * 1000 },
      '/api/auth/change-password': { max: 10, windowMs: 15 * 60 * 1000 },
    };

    const limit = limits[pathname] || { max: 10, windowMs: 15 * 60 * 1000 };
    const result = checkRateLimit(key, limit.max, limit.windowMs);

    if (!result.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': limit.max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
          },
        }
      );
    }

    // Add rate limit headers to successful responses
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', limit.max.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000).toString());
    // Note: We can't easily add headers to the actual response from the route handler here,
    // but the route handlers will add their own response headers.
  }

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
    
    // /api/orders GET/PATCH: cho phép staff (admin, tech_manager, sales_manager, sales, technician)
    if (pathname.startsWith('/api/orders') && request.method !== 'POST') {
      const staffRoles = ['admin', 'tech_manager', 'sales_manager', 'sales', 'technician'];
      if (!staffRoles.includes(session.role)) {
        return NextResponse.json(
          { error: 'Forbidden', message: 'Chỉ nhân sự (admin, sales, kỹ thuật) mới có quyền truy cập API này.' },
          { status: 403 }
        );
      }
      return NextResponse.next({ request: { headers: requestHeaders } });
    }
    
    // /api/agent: kiểm tra x-agent-key thay vì session (đã có trong route)
    if (pathname.startsWith('/api/agent')) {
      return NextResponse.next({ request: { headers: requestHeaders } });
    }
    
    // /api/webhook/notify, /api/inventory, /api/tickets: chỉ Admin
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
    '/api/webhook/notify/:path*',
    '/api/agent/:path*',
    '/api/orders/:path*',
    '/api/auth/login',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/change-password',
  ],
};
