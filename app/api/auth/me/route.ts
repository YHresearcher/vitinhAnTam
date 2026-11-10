import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, sessionCookieOptions, verifySession } from '@/lib/session';
import {
  changePasswordWithVerificationAsync,
  findUserById,
  findUserByIdAsync,
  stripSecrets,
  upsertUserAsync,
} from '@/lib/server/users';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(request: NextRequest) {
  const cookieValue = request.cookies.get(SESSION_COOKIE)?.value;
  const session = verifySession(cookieValue);

  if (!session) {
    return NextResponse.json({ success: false, user: null }, { status: 401 });
  }

  const user = findUserById(session.sub);
  if (!user || user.status === 'suspended') {
    return NextResponse.json({ success: false, user: null }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    user: stripSecrets(user),
  });
}

/**
 * Tự phục vụ tài khoản của CHÍNH MÌNH (trang /tai-khoan) — mọi vai trò đều dùng được.
 * - KHÔNG dùng requireAdmin: phiên đăng nhập thường là đủ.
 * - Mọi thao tác đều khóa vào session.sub — KHÔNG BAO GIỜ tin id/username do
 *   client gửi lên, nên không có đường nào sửa được tài khoản của người khác.
 */
export async function POST(request: NextRequest) {
  const session = verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ success: false, message: 'Phiên đăng nhập không tồn tại.' }, { status: 401 });
  }

  const me = await findUserByIdAsync(session.sub);
  if (!me || me.status === 'suspended') {
    return NextResponse.json({ success: false, message: 'Không tìm thấy tài khoản.' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Dữ liệu gửi lên không hợp lệ.' }, { status: 400 });
  }

  const action = body.action as string;

  // --- Cập nhật thông tin cá nhân: CHỈ họ tên, số điện thoại, email ---
  if (action === 'update_profile') {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!name) {
      return NextResponse.json({ success: false, message: 'Vui lòng nhập họ tên.' }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ success: false, message: 'Vui lòng nhập email hợp lệ!' }, { status: 400 });
    }

    try {
      // Chỉ truyền đúng 3 trường này: username, role, permissions, status...
      // không bao giờ lấy từ client, upsertUserAsync giữ nguyên giá trị cũ.
      await upsertUserAsync({ name, phone, email }, { id: session.sub });
    } catch (err) {
      // Lỗi trùng email (và các lỗi kiểm tra khác) từ upsertUserAsync.
      return NextResponse.json(
        { success: false, message: err instanceof Error ? err.message : 'Không thể cập nhật thông tin.' },
        { status: 400 }
      );
    }

    // upsertUserAsync chỉ ghi log khi lưu Supabase lỗi (không ném lỗi) — đọc
    // lại từ database để xác minh đã lưu thật, tránh "báo thành công rồi mất"
    // như lỗi tạo thành viên trước đây.
    const persisted = await findUserByIdAsync(session.sub);
    if (!persisted || persisted.name !== name || persisted.email !== email || (persisted.phone || '') !== phone) {
      return NextResponse.json(
        { success: false, message: 'Không lưu được thông tin xuống hệ thống. Vui lòng thử lại.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: stripSecrets(persisted),
      message: 'Đã cập nhật thông tin tài khoản!',
    });
  }

  // --- Đổi mật khẩu của chính mình: bắt buộc xác minh mật khẩu hiện tại ---
  if (action === 'change_password') {
    const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';
    const confirmPassword = typeof body.confirmPassword === 'string' ? body.confirmPassword : '';

    if (!currentPassword) {
      return NextResponse.json({ success: false, message: 'Vui lòng nhập mật khẩu hiện tại.' }, { status: 400 });
    }
    // Cùng chính sách với đổi mật khẩu lần đầu (FirstTimePasswordModal +
    // changePasswordWithVerificationAsync): tối thiểu 8 ký tự, khác mật khẩu cũ.
    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ success: false, message: 'Mật khẩu mới phải có tối thiểu 8 ký tự!' }, { status: 400 });
    }
    if (newPassword === currentPassword) {
      return NextResponse.json(
        { success: false, message: 'Mật khẩu mới không được trùng với mật khẩu hiện tại.' },
        { status: 400 }
      );
    }
    if (newPassword !== confirmPassword) {
      return NextResponse.json({ success: false, message: 'Mật khẩu mới và xác nhận mật khẩu không khớp.' }, { status: 400 });
    }

    // Định danh bằng session.sub (không tin identifier do client gửi) và
    // xác minh mật khẩu hiện tại với hash đã lưu.
    const result = await changePasswordWithVerificationAsync(session.sub, currentPassword, newPassword);
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }

    // Đổi mật khẩu xong thì đăng xuất giống luồng đổi mật khẩu lần đầu:
    // xóa cookie phiên, client đưa về /login.
    const response = NextResponse.json({
      success: true,
      message: 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại bằng mật khẩu mới.',
    });
    response.cookies.set(SESSION_COOKIE, '', {
      ...sessionCookieOptions,
      maxAge: 0,
    });
    return response;
  }

  return NextResponse.json({ success: false, message: 'Hành động không hợp lệ.' }, { status: 400 });
}
