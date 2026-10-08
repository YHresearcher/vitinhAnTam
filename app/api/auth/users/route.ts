import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/session';
import {
  findUserByIdAsync,
  loadUsersAsync,
  removeUserAsync,
  resetUserPasswordAsync,
  setPasswordAsync,
  stripSecrets,
  upsertUserAsync,
} from '@/lib/server/users';
import type { UserAccount } from '@/lib/supabase';

type Action = 'create' | 'update' | 'password' | 'reset_password' | 'delete';

function requireAdmin(request: NextRequest) {
  const session = verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) return { error: NextResponse.json({ success: false, message: 'Phiên đăng nhập không tồn tại.' }, { status: 401 }) };
  if (session.role !== 'admin' && session.canManageUsers !== true) {
    return { error: NextResponse.json({ success: false, message: 'Chỉ Quản trị viên mới được quản lý tài khoản.' }, { status: 403 }) };
  }
  return { session };
}

function serverError(err: unknown): NextResponse {
  const message = err instanceof Error ? err.message : 'Lỗi máy chủ khi lưu tài khoản.';
  return NextResponse.json({ success: false, message }, { status: 500 });
}

export async function GET(request: NextRequest) {
  const guard = requireAdmin(request);
  if ('error' in guard) return guard.error;

  try {
    const users = await loadUsersAsync();
    return NextResponse.json({ success: true, data: users.map(stripSecrets) });
  } catch (err) {
    return serverError(err);
  }
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
    if (!user?.email || !user.name) {
      return NextResponse.json({ success: false, message: 'Thiếu họ tên hoặc email tài khoản.' }, { status: 400 });
    }
    let created;
    try {
      // Mật khẩu được khởi tạo tự động là 'Antam@2026', password_changed = false
      created = await upsertUserAsync(user);
    } catch (err) {
      return serverError(err);
    }
    return NextResponse.json({
      success: true,
      user: created,
      message: 'Tạo tài khoản thành công! Mật khẩu khởi tạo là Antam@2026 (yêu cầu đổi mật khẩu ở lần đăng nhập đầu tiên).',
    }, { status: 201 });
  }

  if (action === 'update') {
    const id = typeof body.id === 'string' ? body.id : '';
    const patch = (body.patch ?? {}) as Partial<UserAccount>;
    const existing = await findUserByIdAsync(id);
    if (!id || !existing) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy tài khoản.' }, { status: 404 });
    }
    const safePatch: Partial<UserAccount> = { ...patch };
    delete safePatch.password; // Admin không nhập mật khẩu bằng tay
    let updated;
    try {
      updated = await upsertUserAsync(safePatch, { id });
    } catch (err) {
      return serverError(err);
    }
    return NextResponse.json({ success: true, user: updated, message: 'Cập nhật thông tin thành công!' });
  }

  if (action === 'reset_password') {
    const id = typeof body.id === 'string' ? body.id : '';
    if (!id) {
      return NextResponse.json({ success: false, message: 'Thiếu id tài khoản.' }, { status: 400 });
    }
    let updated;
    try {
      updated = await resetUserPasswordAsync(id);
    } catch (err) {
      return serverError(err);
    }
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy tài khoản để reset mật khẩu.' }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      user: updated,
      message: 'Đã reset mật khẩu về mặc định "Antam@2026". Thành viên sẽ được yêu cầu đổi mật khẩu khi đăng nhập!',
    });
  }

  if (action === 'password') {
    const id = typeof body.id === 'string' ? body.id : '';
    const password = typeof body.password === 'string' ? body.password : '';
    
    // Validate mật khẩu với nguyên tắc bảo mật
    const { validatePassword } = await import('@/lib/server/password-validator');
    const validation = validatePassword(password, []);
    if (!validation.valid) {
      return NextResponse.json({ success: false, message: validation.errors.join(' ') }, { status: 400 });
    }
    
    let updated;
    try {
      updated = await setPasswordAsync(id, password);
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
    const removed = await removeUserAsync(id);
    if (!removed) {
      return NextResponse.json(
        { success: false, message: 'Không xóa được tài khoản (không tìm thấy hoặc không ghi được).' },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, message: 'Hành động không hợp lệ.' }, { status: 400 });
}


