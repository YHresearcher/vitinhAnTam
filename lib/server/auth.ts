// Helper xác thực phía server dùng chung cho các API route.
// NGUYÊN TẮC: chỉ tin session cookie đã ký HMAC (lib/session.ts).
// TUYỆT ĐỐI không tin header do client tự đặt (x-staff-role, x-user-role)
// hay Referer — các giá trị đó ai cũng giả được bằng curl.
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySession, type SessionPayload } from '@/lib/session';

export const STAFF_ROLES = ['admin', 'tech_manager', 'sales_manager', 'sales', 'technician'] as const;

export function getSession(request: NextRequest): SessionPayload | null {
  return verifySession(request.cookies.get(SESSION_COOKIE)?.value);
}

/** Trả session nếu là nhân viên đã đăng nhập hợp lệ, ngược lại null. */
export function requireStaff(request: NextRequest): SessionPayload | null {
  const session = getSession(request);
  if (!session) return null;
  return (STAFF_ROLES as readonly string[]).includes(session.role) ? session : null;
}

/** Admin thật hoặc người được uỷ quyền quản lý (canManageUsers / canAccessPayroll tuỳ ngữ cảnh). */
export function isAdminLike(session: SessionPayload | null): boolean {
  return Boolean(session && (session.role === 'admin' || session.canManageUsers === true));
}
