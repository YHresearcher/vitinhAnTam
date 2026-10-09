import { NextRequest, NextResponse } from 'next/server';
import { sendZaloBotMessage } from '@/lib/server/zaloBot';
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
    const token = body.token;

    const res = await sendZaloBotMessage({
      chatId: targetChatId,
      token,
      text: `🧪 [THỬ NGHIỆM KẾT NỐI ZALO BOT THÀNH CÔNG]\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `✅ Xin chào! Đây là tin nhắn kiểm tra kết nối từ hệ thống Quản Trị Vi Tính An Tâm.\n` +
        `⏰ Thời gian: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}\n` +
        `🎉 Zalo Bot API (bot-api.zapps.me) đang hoạt động rất tốt!`,
    });

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: res.error, result: res.result }, { status: 400 });
    }

    return NextResponse.json({ ok: true, message: 'Gửi tin nhắn thử nghiệm thành công!', result: res.result });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: errMsg }, { status: 500 });
  }
}
