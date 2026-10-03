import { NextRequest, NextResponse } from 'next/server';
import { dispatchSystemEvent, sendZaloBotMessage } from '@/lib/server/zaloBot';
import { SESSION_COOKIE, verifySession } from '@/lib/session';

export async function POST(req: NextRequest) {
  // Xác thực quyền Admin
  const sessionToken = req.cookies.get(SESSION_COOKIE)?.value;
  const session = verifySession(sessionToken);

  if (!session || (session.role !== 'admin' && !session.canManageUsers)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized. Yêu cầu quyền quản trị.' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const targetChatId = body.chatId;

    if (targetChatId) {
      const res = await sendZaloBotMessage({
        chatId: targetChatId,
        text: `🧪 [THỬ NGHIỆM KẾT NỐI ZALO BOT]\n` +
          `━━━━━━━━━━━━━━━━━━━\n` +
          `✅ Xin chào! Đây là tin nhắn kiểm tra kết nối từ hệ thống Vi Tính An Tam.\n` +
          `⏰ Thời gian: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}\n` +
          `🎉 Cấu hình Zalo Bot của bạn đang hoạt động rất tốt!`,
      });

      if (!res.ok) {
        return NextResponse.json({ ok: false, error: res.error, result: res.result }, { status: 400 });
      }

      return NextResponse.json({ ok: true, message: 'Gửi tin nhắn thử nghiệm thành công!', result: res.result });
    }

    // Gửi test notification qua event dispatcher
    const result = await dispatchSystemEvent('test_notification', {
      source: 'Admin Webhook Test',
    });

    if (!result.zaloSent && result.error) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      message: 'Gửi thông báo thử nghiệm thành công!',
      details: result,
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: errMsg }, { status: 500 });
  }
}
