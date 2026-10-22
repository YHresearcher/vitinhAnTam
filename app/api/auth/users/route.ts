import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/session';
import {
  consumeTemporaryPassword,
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
      // Mật khẩu tạm được sinh ngẫu nhiên riêng cho tài khoản này, password_changed = false
      created = await upsertUserAsync(user);
    } catch (err) {
      return serverError(err);
    }
    const temporaryPassword = consumeTemporaryPassword(created.id);
    return NextResponse.json({
      success: true,
      user: created,
      temporaryPassword,
      message: temporaryPassword
        ? `Tạo tài khoản thành công! Mật khẩu tạm (chỉ hiện 1 lần): ${temporaryPassword} — hãy gửi cho thành viên, họ sẽ phải đổi ở lần đăng nhập đầu tiên.`
        : 'Tạo tài khoản thành công!',
    }, { status: 201 });
  }

  if (action === 'update') {
    const id = typeof body.id === 'string' ? body.id : '';
    const patch = (body.patch ?? {}) as Partial<UserAccount>;
    const existing = await findUserByIdAsync(id);
    if (!id || !existing) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy tài khoản.' }, { status: 404 });
    }
    // Whitelist trường được sửa qua endpoint này.
    const ALLOWED_FIELDS: Array<keyof UserAccount> = [
      'name', 'username', 'email', 'phone', 'roleTitle', 'avatarBg', 'referral_code',
    ];
    const safePatch: Partial<UserAccount> = {};
    for (const field of ALLOWED_FIELDS) {
      if (patch[field] !== undefined) {
        (safePatch as Record<string, unknown>)[field] = patch[field];
      }
    }
    // Trường nhạy cảm (vai trò / quyền hạn / trạng thái): chỉ admin thật mới đổi được,
    // tránh người được uỷ quyền quản lý user tự leo quyền thành admin.
    const SENSITIVE_FIELDS: Array<keyof UserAccount> = ['role', 'permissions', 'status'];
    const touchesSensitive = SENSITIVE_FIELDS.some((f) => patch[f] !== undefined);
    if (touchesSensitive) {
      if (guard.session?.role !== 'admin') {
        return NextResponse.json(
          { success: false, message: 'Chỉ Admin mới được thay đổi vai trò, quyền hạn hoặc trạng thái tài khoản.' },
          { status: 403 }
        );
      }
      for (const field of SENSITIVE_FIELDS) {
        if (patch[field] !== undefined) {
          (safePatch as Record<string, unknown>)[field] = patch[field];
        }
      }
    }
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
    const temporaryPassword = consumeTemporaryPassword(updated.id);
    return NextResponse.json({
      success: true,
      user: updated,
      temporaryPassword,
      message: temporaryPassword
        ? `Đã reset mật khẩu. Mật khẩu tạm mới (chỉ hiện 1 lần): ${temporaryPassword} — hãy gửi cho thành viên, họ sẽ được yêu cầu đổi mật khẩu khi đăng nhập!`
        : 'Đã reset mật khẩu. Thành viên sẽ được yêu cầu đổi mật khẩu khi đăng nhập!',
    });
  }

  if (action === 'password') {
    const id = typeof body.id === 'string' ? body.id : '';
    const password = typeof body.password === 'string' ? body.password : '';
    if (password.length < 8) {
      return NextResponse.json({ success: false, message: 'Mật khẩu phải có tối thiểu 8 ký tự!' }, { status: 400 });
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


