import { NextRequest, NextResponse } from 'next/server';
import { getStoredSettingsAsync, saveStoredSettingsAsync } from '@/lib/server/settings';
import { SESSION_COOKIE, verifySession } from '@/lib/session';

export async function GET() {
  const settings = await getStoredSettingsAsync();
  return NextResponse.json({ success: true, data: settings });
}

export async function POST(request: NextRequest) {
  try {
    const session = verifySession(request.cookies.get(SESSION_COOKIE)?.value);
    if (!session || (session.role !== 'admin' && !session.canManageUsers)) {
      return NextResponse.json(
        { success: false, message: 'Bạn không có quyền cập nhật cấu hình hệ thống.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, message: 'Dữ liệu không hợp lệ.' }, { status: 400 });
    }

    const saved = await saveStoredSettingsAsync(body);
    return NextResponse.json({
      success: true,
      data: saved,
      message: 'Đã lưu cấu hình hệ thống thành công!',
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật cấu hình hệ thống:', error);
    return NextResponse.json({ success: false, message: 'Lỗi xử lý yêu cầu phía máy chủ.' }, { status: 500 });
  }
}

