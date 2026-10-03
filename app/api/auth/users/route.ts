import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/session';
import { findUserById, removeUser, setPassword, upsertUser } from '@/lib/server/users';
import type { UserAccount } from '@/lib/supabase';

type Action = 'create' | 'update' | 'password' | 'delete';

function requireAdmin(request: NextRequest) {
  const session = verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) return { error: NextResponse.json({ success: false, message: 'Phiên đăng nhập không tồn tại.' }, { status: 401 }) };
  if (session.role !== 'admin') {
    return { error: NextResponse.json({ success: false, message: 'Chỉ Quản trị viên mới được quản lý tài khoản.' }, { status: 403 }) };
  }
  return { session };
}

function serverError(err: unknown): NextResponse {
  const message = err instanceof Error ? err.message : 'Lỗi máy chủ khi lưu tài khoản.';
  return NextResponse.json({ success: false, message }, { status: 500 });
}

export async function POST(request: NextRequest) {
  const guard = requireAdmin(request);
  if ('error' in guard) return guard.error;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Dữ liệu gửi lên không hợp lệ.' }, { status: 400 });
  }

  const action = body.action as Action;

  if (action === 'create') {
    const user = body.user as Omit<UserAccount, 'id' | 'created_at'> | undefined;
    const password = typeof body.password === 'string' ? body.password : '';
    if (!user?.email || !user.name) {
      return NextResponse.json({ success: false, message: 'Thiếu họ tên hoặc email tài khoản.' }, { status: 400 });
    }
    if (password.length < 4) {
      return NextResponse.json({ success: false, message: 'Mật khẩu phải có tối thiểu 4 ký tự!' }, { status: 400 });
    }
    let created;
    try {
      created = upsertUser({ ...user, password });
    } catch (err) {
      return serverError(err);
    }
    return NextResponse.json({ success: true, user: created }, { status: 201 });
  }

  if (action === 'update') {
    const id = typeof body.id === 'string' ? body.id : '';
    const patch = (body.patch ?? {}) as Partial<UserAccount>;
    if (!id || !findUserById(id)) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy tài khoản.' }, { status: 404 });
    }
    const password = typeof body.password === 'string' && body.password ? body.password : undefined;
    if (password && password.length < 4) {
      return NextResponse.json({ success: false, message: 'Mật khẩu phải có tối thiểu 4 ký tự!' }, { status: 400 });
    }
    const safePatch: Partial<UserAccount> = { ...patch };
    delete safePatch.password;
    let updated;
    try {
      updated = upsertUser({ ...safePatch, password }, { id });
    } catch (err) {
      return serverError(err);
    }
    return NextResponse.json({ success: true, user: updated });
  }

  if (action === 'password') {
    const id = typeof body.id === 'string' ? body.id : '';
    const password = typeof body.password === 'string' ? body.password : '';
    if (password.length < 4) {
      return NextResponse.json({ success: false, message: 'Mật khẩu phải có tối thiểu 4 ký tự!' }, { status: 400 });
    }
    let updated;
    try {
      updated = setPassword(id, password);
    } catch (err) {
      return serverError(err);
    }
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy tài khoản.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, user: updated });
  }

  if (action === 'delete') {
    const id = typeof body.id === 'string' ? body.id : '';
    if (!id) {
      return NextResponse.json({ success: false, message: 'Thiếu id tài khoản.' }, { status: 400 });
    }
    if (id === guard.session?.sub) {
      return NextResponse.json({ success: false, message: 'Bạn không thể xóa chính mình.' }, { status: 400 });
    }
    const removed = removeUser(id);
    if (!removed) {
      return NextResponse.json(
        { success: false, message: 'Không xóa được tài khoản (không tìm thấy hoặc không ghi được file).' },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, message: 'Hành động không hợp lệ.' }, { status: 400 });
}
