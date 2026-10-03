import { NextRequest, NextResponse } from 'next/server';
import { getZaloBotConfig, sendZaloBotMessage } from '@/lib/server/zaloBot';

/**
 * Endpoint nhận incoming webhook từ Zalo Bot Platform
 * URL: https://vitinhantham.vn/api/webhook/zalo
 */
export async function GET() {
  return NextResponse.json({
    status: 'active',
    service: 'Vi Tính An Tâm - Zalo Bot Webhook Receiver',
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const config = getZaloBotConfig();

    // 1. Kiểm tra secret_token nếu có cấu hình
    if (config.secretToken) {
      const headerSecret =
        req.headers.get('x-bot-token') ||
        req.headers.get('secret_token') ||
        req.headers.get('x-zalo-secret') ||
        req.headers.get('authorization')?.replace('Bearer ', '');

      if (headerSecret && headerSecret !== config.secretToken) {
        return NextResponse.json({ error: 'Unauthorized: Secret token không hợp lệ' }, { status: 401 });
      }
    }

    const body = await req.json().catch(() => ({}));
    console.log('[Zalo Webhook Received]:', JSON.stringify(body, null, 2));

    // 2. Trích xuất thông tin người gửi & nội dung tin nhắn (chuẩn Zalo Bot Platform)
    // Cấu trúc Zalo Bot payload:
    // { event_name: 'user_send_text', message: { text: '...', msg_id: '...' }, sender: { id: '...' }, recipient: { id: '...' } }
    // hoặc { message: { chat: { id: '...' }, from: { id: '...' }, text: '...' } }
    const message = body.message || body;
    const text = (message.text || body.text || '').trim();
    const senderId =
      body.sender?.id ||
      message.from?.id ||
      message.chat?.id ||
      body.chat_id ||
      body.user_id_by_app;

    if (!senderId || !text) {
      // Nhận webhook hợp lệ (ack 200)
      return NextResponse.json({ ok: true, message: 'Event acknowledged' });
    }

    const textLower = text.toLowerCase();
    const storeName = config.settings.storeName || 'Vi Tính An Tâm';
    const hotline = config.settings.hotline || '0909.053.058';

    // 3. Xử lý phản hồi tự động cơ bản
    let replyText = '';

    if (textLower === '/start' || textLower === 'hi' || textLower === 'hello' || textLower === 'menu' || textLower === 'chào') {
      replyText = `👋 Xin chào! Cảm ơn bạn đã nhắn tin cho ${storeName}.\n\n` +
        `🛠️ Các cú pháp tra cứu nhanh:\n` +
        `• Nhập [Mã phiếu] (VD: TN-2026-...) để tra cứu tiến độ sửa chữa.\n` +
        `• Nhập [Mã đơn] (VD: AT-...) để tra cứu tình trạng đơn hàng.\n` +
        `• Nhập "hotline" để nhận số điện thoại kỹ thuật viên.\n\n` +
        `📞 Hotline khẩn cấp: ${hotline}`;
    } else if (textLower.includes('hotline') || textLower.includes('sdt') || textLower.includes('liên hệ')) {
      replyText = `📞 Tổng đài hỗ trợ ${storeName}:\n` +
        `• Hotline kỹ thuật: ${hotline}\n` +
        `• Zalo hỗ trợ: ${config.settings.zaloNumber || hotline}\n` +
        `• Giờ làm việc: ${config.settings.workingHoursWeekday || '08h00 - 17h30'}\n` +
        `• Địa chỉ: ${config.settings.address || 'Tây Ninh'}`;
    } else if (textLower.startsWith('tn-') || textLower.startsWith('phieu-')) {
      replyText = `🔍 Hệ thống đã tiếp nhận yêu cầu tra cứu mã phiếu [${text}]. Kỹ thuật viên sẽ kiểm tra chi tiết và phản hồi bạn trong ít phút!`;
    } else if (textLower.startsWith('at-') || textLower.startsWith('don-')) {
      replyText = `📦 Hệ thống đã tiếp nhận yêu cầu tra cứu mã đơn hàng [${text}]. Kỹ thuật viên sẽ kiểm tra và phản hồi bạn trong ít phút!`;
    }

    if (replyText) {
      await sendZaloBotMessage({
        chatId: senderId,
        text: replyText,
      });
    }

    return NextResponse.json({ ok: true, processed: true });
  } catch (err: unknown) {
    console.error('[Zalo Webhook Error]:', err);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
