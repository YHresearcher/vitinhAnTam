import { NextRequest, NextResponse } from 'next/server';
import { getZaloBotConfig, sendZaloBotMessage } from '@/lib/server/zaloBot';
import {
  findUserByZaloChatIdAsync,
  linkUserZaloChatIdByPhoneAsync,
  unlinkUserZaloChatIdAsync,
} from '@/lib/server/users';

/**
 * Endpoint nhận incoming webhook từ Zalo Bot Platform
 * URL: https://vitinhantam.com/api/webhook/zalo
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

    // 1. Kiểm tra secret_token nếu có cấu hình.
    // BẮT BUỘC phải có header và khớp — trước đây thiếu header vẫn cho qua,
    // khiến việc kiểm tra secret vô hiệu.
    if (config.secretToken) {
      const headerSecret =
        req.headers.get('x-telegram-bot-api-secret-token') ||
        req.headers.get('x-bot-token') ||
        req.headers.get('secret_token') ||
        req.headers.get('x-zalo-secret') ||
        req.headers.get('authorization')?.replace('Bearer ', '');

      if (!headerSecret || headerSecret !== config.secretToken) {
        return NextResponse.json({ error: 'Unauthorized: Secret token không hợp lệ' }, { status: 401 });
      }
    }

    const rawBody = await req.json().catch(() => ({}));
    console.log('[Zalo Webhook Received]:', JSON.stringify(rawBody, null, 2));

    // Zalo Bot webhook bọc update trong trường "result" (xem ví dụ Flask trong docs python-zalo-bot)
    const body =
      rawBody && typeof rawBody === 'object' && rawBody.result && typeof rawBody.result === 'object'
        ? rawBody.result
        : rawBody;

    // 2. Trích xuất thông tin người gửi & nội dung tin nhắn (chuẩn Zalo Bot Platform)
    // Cấu trúc Zalo Bot payload:
    // { event_name: 'user_send_text', message: { text: '...', msg_id: '...' }, sender: { id: '...' }, recipient: { id: '...' } }
    // hoặc { message: { chat: { id: '...' }, from: { id: '...' }, text: '...' } }
    const message = body.message || body;
    const text = String(message.text || body.text || '').trim();
    const senderId = String(
      body.sender?.id ||
      message.from?.id ||
      message.chat?.id ||
      body.chat?.id ||
      body.chat_id ||
      body.user_id_by_app ||
      ''
    ).trim();

    const targetChatId = message.chat?.id || body.chat?.id || senderId;

    if (!senderId || !text) {
      // Nhận webhook hợp lệ (ack 200)
      return NextResponse.json({ ok: true, message: 'Event acknowledged' });
    }

    const textLower = text.toLowerCase();
    const storeName = config.settings.storeName || 'Vi Tính An Tâm';
    const hotline = config.settings.hotline || '0909.053.058';

    // 3. Xử lý phản hồi tự động
    let replyText = '';

    // ==========================================
    // NHÁNH 1: XỬ LÝ LIÊN KẾT TỰ ĐỘNG CHO NHÂN VIÊN (CÁCH 1)
    // ==========================================
    // Cú pháp 1: "ket noi 0909053058", "kn 0909053058", "link 0909053058"
    const linkMatch = text.match(/^(?:k[eê]t\s*n[oố]i|kn|link)\s*[:=]?\s*([0-9+.\s-]{9,15})$/i);
    // Cú pháp 2: Nhân viên gửi thẳng số điện thoại 9 - 11 chữ số
    const cleanDigits = text.replace(/[\s.-]/g, '');
    const isDirectPhoneNumber = /^(?:\+?84|0)[3|5|7|8|9]\d{8}$/.test(cleanDigits);

    if (linkMatch || isDirectPhoneNumber) {
      const phoneToLink = linkMatch ? linkMatch[1] : cleanDigits;
      const linkResult = await linkUserZaloChatIdByPhoneAsync(phoneToLink, senderId);

      if (linkResult.success && linkResult.user) {
        replyText =
          `✅ [KẾT NỐI ZALO THÀNH CÔNG]\n` +
          `━━━━━━━━━━━━━━━━━━━\n` +
          `👋 Xin chào: ${linkResult.user.name}\n` +
          `💼 Chức vụ: ${linkResult.user.roleTitle || linkResult.user.role}\n` +
          `📱 SĐT liên kết: ${linkResult.user.phone || phoneToLink}\n` +
          `🆔 Zalo Chat ID: ${senderId}\n` +
          `━━━━━━━━━━━━━━━━━━━\n` +
          `🎉 Từ bây giờ, bạn sẽ nhận được thông báo Zalo trực tiếp khi:\n` +
          `• Được phân công phiếu sửa chữa mới\n` +
          `• Có yêu cầu cứu hộ / sửa máy tận nơi\n` +
          `• Phân bổ đơn hàng & công việc của tiệm\n\n` +
          `💡 Gõ "profile" để xem thông tin hoặc "huy ket noi" nếu muốn hủy nhận tin.`;
      } else {
        if (linkMatch) {
          replyText =
            `⚠️ [KẾT NỐI THẤT BẠI]\n` +
            `━━━━━━━━━━━━━━━━━━━\n` +
            `${linkResult.message || 'Không thể liên kết tài khoản.'}\n\n` +
            `👉 Quản trị viên chỉ cần cập nhật SĐT của bạn vào danh sách Nhân sự, sau đó bạn gửi lại "ket noi <SĐT>" là xong!`;
        } else {
          // Người dùng chỉ nhắn số điện thoại thông thường nhưng không khớp nhân viên
          replyText =
            `ℹ️ Số điện thoại "${phoneToLink}" chưa khớp với nhân sự nào tại ${storeName}.\n\n` +
            `• Nếu bạn là Kỹ thuật viên: Vui lòng nhờ Admin cập nhật SĐT vào hồ sơ nhân viên trước.\n` +
            `• Nếu bạn là Khách hàng: Vui lòng nhập Mã phiếu sửa chữa (TN-...) hoặc Mã đơn hàng (AT-...) để tra cứu.`;
        }
      }
    }
    // Hủy kết nối
    else if (
      textLower === 'huy ket noi' ||
      textLower === 'huy lien ket' ||
      textLower === 'unlink' ||
      textLower === 'hủy kết nối' ||
      textLower === 'hủy liên kết'
    ) {
      const unlinkResult = await unlinkUserZaloChatIdAsync(senderId);
      if (unlinkResult.success) {
        replyText = `✅ ${unlinkResult.message}\nTài khoản Zalo của bạn đã ngừng nhận thông báo công việc từ ${storeName}.`;
      } else {
        replyText = `ℹ️ ${unlinkResult.message}`;
      }
    }
    // Tra cứu thông tin tài khoản nhân sự hiện tại (Who am I)
    else if (
      textLower === 'whoami' ||
      textLower === 'profile' ||
      textLower === 'thong tin' ||
      textLower === 'thông tin' ||
      textLower === 'kiem tra' ||
      textLower === 'kiểm tra'
    ) {
      const staff = await findUserByZaloChatIdAsync(senderId);
      if (staff) {
        replyText =
          `👤 [THÔNG TIN NHÂN SỰ ĐÃ LIÊN KẾT]\n` +
          `━━━━━━━━━━━━━━━━━━━\n` +
          `• Họ và tên: ${staff.name}\n` +
          `• Chức vụ: ${staff.roleTitle || staff.role}\n` +
          `• SĐT: ${staff.phone || 'Chưa cập nhật'}\n` +
          `• Email: ${staff.email}\n` +
          `• Mã ID: @${staff.referral_code || staff.username || staff.id}\n` +
          `• Zalo Chat ID: ${senderId}\n` +
          `• Trạng thái: 🟢 ĐANG NHẬN THÔNG BÁO TỰ ĐỘNG\n` +
          `━━━━━━━━━━━━━━━━━━━\n` +
          `💡 Gõ "huy ket noi" nếu bạn muốn ngưng nhận tin qua Zalo này.`;
      } else {
        replyText =
          `ℹ️ [CHƯA LIÊN KẾT TÀI KHOẢN]\n` +
          `Tài khoản Zalo này chưa được liên kết với nhân sự nào trong hệ thống.\n\n` +
          `👉 Kỹ thuật viên chỉ cần gửi tin nhắn: "ket noi <SĐT>" (VD: ket noi 0909053058) để tự động kích hoạt nhận ca sửa chữa!`;
      }
    }
    // Xem Chat ID cá nhân
    else if (textLower === 'id' || textLower === 'uid' || textLower === 'chatid' || textLower === 'user_id') {
      const staff = await findUserByZaloChatIdAsync(senderId);
      const linkedInfo = staff
        ? `\n🟢 Đã liên kết với nhân sự: ${staff.name} (${staff.roleTitle || staff.role})`
        : `\n⚪ Chưa liên kết với nhân sự nào (nhắn "ket noi <SĐT>" để liên kết).`;
      replyText = `🔎 Zalo Chat ID của bạn là: ${senderId}${linkedInfo}`;
    }
    // Chào hỏi & Start menu
    else if (
      textLower === '/start' ||
      textLower === 'hi' ||
      textLower === 'hello' ||
      textLower === 'menu' ||
      textLower === 'chào' ||
      textLower === 'chao'
    ) {
      const staff = await findUserByZaloChatIdAsync(senderId);
      if (staff) {
        replyText =
          `👋 Xin chào ${staff.name} (${staff.roleTitle || staff.role})!\n` +
          `Tài khoản Zalo của bạn đã được kết nối với hệ thống ${storeName}.\n\n` +
          `🛠️ Lệnh tra cứu cho nhân viên:\n` +
          `• Nhập "profile": Xem thông tin liên kết nhân sự\n` +
          `• Nhập [Mã phiếu] (VD: TN-2026-...): Xem thông tin phiếu\n` +
          `• Nhập [Mã đơn] (VD: AT-...): Xem thông tin đơn\n` +
          `• Nhập "huy ket noi": Ngừng nhận thông báo qua Zalo này\n\n` +
          `Chúc bạn một ngày làm việc hiệu quả và an toàn! 💪✨`;
      } else {
        replyText =
          `👋 Xin chào! Cảm ơn bạn đã nhắn tin cho ${storeName}.\n\n` +
          `👨‍🔧 DÀNH CHO NHÂN VIÊN / KỸ THUẬT VIÊN:\n` +
          `Để nhận thông báo ca trực, phiếu sửa chữa riêng cho bạn, hãy gửi tin nhắn:\n` +
          `👉 "ket noi <Số điện thoại>" (VD: ket noi 0909053058)\n\n` +
          `🛠️ DÀNH CHO KHÁCH HÀNG:\n` +
          `• Nhập [Mã phiếu] (VD: TN-2026-...) để tra cứu sửa chữa.\n` +
          `• Nhập [Mã đơn] (VD: AT-...) để tra cứu đơn hàng.\n` +
          `• Nhập "hotline" để nhận số điện thoại kỹ thuật viên.\n\n` +
          `📞 Hotline khẩn cấp: ${hotline}`;
      }
    } else if (textLower.includes('hotline') || textLower.includes('sdt') || textLower.includes('liên hệ')) {
      replyText =
        `📞 Tổng đài hỗ trợ ${storeName}:\n` +
        `• Hotline kỹ thuật: ${hotline}\n` +
        `• Zalo hỗ trợ: ${config.settings.zaloNumber || hotline}\n` +
        `• Giờ làm việc: ${config.settings.workingHoursWeekday || '08h00 - 17h30'}\n` +
        `• Địa chỉ: ${config.settings.address || 'Tây Ninh'}`;
    } else if (textLower.startsWith('tn-') || textLower.startsWith('phieu-')) {
      replyText = `🔍 Hệ thống đã tiếp nhận yêu cầu tra cứu mã phiếu [${text}]. Kỹ thuật viên sẽ kiểm tra chi tiết và phản hồi bạn trong thời gian nhanh nhất!`;
    } else if (textLower.startsWith('at-') || textLower.startsWith('don-')) {
      replyText = `📦 Hệ thống đã tiếp nhận yêu cầu tra cứu mã đơn hàng [${text}]. Kỹ thuật viên sẽ kiểm tra và phản hồi bạn trong thời gian nhanh nhất!`;
    }

    if (replyText) {
      await sendZaloBotMessage({
        chatId: targetChatId,
        text: replyText,
      });
    }

    return NextResponse.json({ ok: true, processed: true });
  } catch (err: unknown) {
    console.error('[Zalo Webhook Error]:', err);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
