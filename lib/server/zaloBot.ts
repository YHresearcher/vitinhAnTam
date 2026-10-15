import { getStoredSettings, getStoredSettingsAsync } from '@/lib/server/settings';

// Zalo Bot API chính thức (SDK python-zalo-bot) — https://bot.zapps.vn/docs/create-bot/
// URL dạng: {base}/bot{token}/{method} — contract lấy từ source SDK (zalo_bot/_bot.py)
const ZALO_BOT_BASE_URL = 'https://bot-api.zapps.me';

/**
 * Định dạng cấu hình Bot & Webhook lấy từ settings (bất đồng bộ từ Supabase/File)
 */
export async function getZaloBotConfigAsync() {
  const settings = await getStoredSettingsAsync();
  const token = (settings.zaloBotToken || process.env.ZALO_BOT_TOKEN || '').trim();
  const secretToken = (settings.zaloBotSecretToken || process.env.ZALO_BOT_SECRET_TOKEN || '').trim();
  const defaultChatId = (settings.zaloDefaultChatId || process.env.ZALO_BOT_CHAT_ID || '').trim();

  return {
    apiBaseUrl: ZALO_BOT_BASE_URL,
    token,
    secretToken,
    defaultChatId,
    settings,
  };
}

/**
 * Định dạng cấu hình Bot & Webhook lấy từ settings (đồng bộ)
 */
export function getZaloBotConfig() {
  const settings = getStoredSettings();
  const token = (settings.zaloBotToken || process.env.ZALO_BOT_TOKEN || '').trim();
  const secretToken = (settings.zaloBotSecretToken || process.env.ZALO_BOT_SECRET_TOKEN || '').trim();
  const defaultChatId = (settings.zaloDefaultChatId || process.env.ZALO_BOT_CHAT_ID || '').trim();

  return {
    apiBaseUrl: ZALO_BOT_BASE_URL,
    token,
    secretToken,
    defaultChatId,
    settings,
  };
}

/**
 * Xây URL gọi Zalo Bot API chính thức: https://bot-api.zapps.me/bot{token}/{method}
 * Luôn gọi trực tiếp máy chủ Zalo, không qua Cloudflare Worker hay bất kỳ proxy trung gian nào.
 */
function buildZaloBotUrl(token: string, method: string): string {
  return `${ZALO_BOT_BASE_URL}/bot${token}/${method}`;
}

/**
 * Gửi tin nhắn thông báo qua Zalo Bot API chính thức (bot-api.zapps.me)
 */
export async function sendZaloBotMessage(params: {
  chatId?: string;
  text: string;
  parseMode?: 'markdown' | 'HTML';
  token?: string;
  apiBaseUrl?: string; // Giữ để tương thích ngược, hệ thống luôn kết nối trực tiếp
}): Promise<{ ok: boolean; result?: unknown; error?: string }> {
  const config = await getZaloBotConfigAsync();
  const token = (params.token !== undefined && params.token !== '' ? params.token : config.token).trim();
  const targetChatId = (params.chatId !== undefined && params.chatId !== '' ? params.chatId : config.defaultChatId).trim();

  if (!token) {
    return { ok: false, error: 'Chưa nhập Zalo Bot Token.' };
  }
  if (!targetChatId) {
    return { ok: false, error: 'Chưa nhập Chat ID nhận tin nhắn.' };
  }

  try {
    // Luôn gọi trực tiếp Zalo Bot API chính thức (bot-api.zapps.me)
    const url = buildZaloBotUrl(token, 'sendMessage');
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: targetChatId,
        text: params.text,
        ...(params.parseMode ? { parse_mode: params.parseMode } : {}),
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) {
      return {
        ok: false,
        error: humanizeBotApiError(data.description || data.message || `Lỗi sendMessage (HTTP ${res.status})`, token),
        result: data,
      };
    }
    return { ok: true, result: data };

  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Lỗi kết nối Bot API: ${errMsg}` };
  }
}


/**
 * Phân tích Zalo Bot Token để chỉ ra chính xác lỗi format (chỉ hiển thị phần id, không lộ secret)
 */
function diagnoseZaloToken(token: string): string {
  if (!token) return 'chưa có Token';
  if (/^https?:\/\//i.test(token)) {
    return 'bạn đang dán cả URL vào ô Token — cần dán chuỗi <id>:<secret>';
  }
  if (token.startsWith('bot') && token.slice(3).includes(':')) {
    return 'Token có tiền tố "bot" ở đầu — hãy bỏ phần "bot"';
  }
  if (!token.includes(':')) {
    return `thiếu dấu ":" (chuỗi ${token.length} ký tự) — cần dạng <id>:<secret>`;
  }
  const pre = token.split(':', 1)[0];
  if (!/^\d+$/.test(pre)) {
    return `phần trước dấu ":" phải là SỐ, hiện tại là "${pre.slice(0, 24)}"`;
  }
  if (/\s/.test(token)) {
    return 'Token có khoảng trắng ở giữa — copy lại cả chuỗi';
  }
  if (/[/?#]/.test(token)) {
    return 'Token chứa ký tự / ? # — làm hỏng URL, hãy lấy lại Token';
  }
  return `đúng chuẩn <id>:<secret> (id ${pre.length} số) — sai ở secret (bị cắt cụt?) hoặc token đã bị thu hồi`;
}

/**
 * Chuyển lỗi thô từ Zalo Bot API thành thông báo dễ hiểu cho quản trị viên
 * VD: "Unauthorized: invalid token specified" -> kèm hướng dẫn kiểm tra lại Token
 */
function humanizeBotApiError(rawError: unknown, token?: string, apiBaseUrl?: string): string {
  const raw = typeof rawError === 'string' ? rawError : String(rawError);
  const lower = raw.toLowerCase();
  const tokenDiagnosis = token ? diagnoseZaloToken(token) : 'chưa có Token';

  if (lower.includes('invalid token specified') || lower === 'unauthorized') {
    return `${raw} — Zalo Bot Token không hoạt động: ${tokenDiagnosis}. Lấy lại Token tại https://bot.zapps.vn/docs/create-bot/.`;
  }
  if (lower.includes('not found')) {
    const base = apiBaseUrl?.trim() || `${ZALO_BOT_BASE_URL} (mặc định)`;
    return `${raw} — Kiểm tra lại Zalo Bot Token & Bot API Base URL. | Token: ${tokenDiagnosis} | Base URL đang dùng: ${base}`;
  }
  return raw;
}

/**
 * Đăng ký Webhook với Zalo Bot Platform (setWebhook)
 * Luôn gọi trực tiếp https://bot-api.zapps.me
 */
export async function setZaloWebhook(
  webhookUrl: string,
  secretToken?: string,
  tokenOverride?: string
): Promise<{ ok: boolean; result?: unknown; error?: string }> {
  const config = await getZaloBotConfigAsync();
  const token = (tokenOverride || config.token).trim();
  const secret = secretToken || config.secretToken;

  if (!token) {
    return { ok: false, error: 'Chưa cấu hình Bot Token.' };
  }

  try {
    const url = buildZaloBotUrl(token, 'setWebhook');
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: webhookUrl,
        ...(secret ? { secret_token: secret } : {}),
      }),
    });

    const data = await res.json();
    if (!res.ok || data.ok === false) {
      return {
        ok: false,
        error: humanizeBotApiError(data.description || data.message || `Lỗi setWebhook (HTTP ${res.status})`, token),
        result: data,
      };
    }

    return { ok: true, result: data };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Lỗi kết nối: ${errMsg}` };
  }
}

/**
 * Lấy thông tin trạng thái Webhook (getWebhookInfo)
 * Luôn gọi trực tiếp https://bot-api.zapps.me
 */
export async function getZaloWebhookInfo(
  tokenOverride?: string
): Promise<{ ok: boolean; result?: unknown; error?: string }> {
  const config = await getZaloBotConfigAsync();
  const token = (tokenOverride || config.token).trim();

  if (!token) {
    return { ok: false, error: 'Chưa cấu hình Bot Token.' };
  }

  try {
    const url = buildZaloBotUrl(token, 'getWebhookInfo');
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });

    const data = await res.json();
    if (!res.ok || data.ok === false) {
      return {
        ok: false,
        error: humanizeBotApiError(data.description || data.message || `Lỗi getWebhookInfo (HTTP ${res.status})`, token),
        result: data,
      };
    }

    return { ok: true, result: data };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Lỗi kết nối: ${errMsg}` };
  }
}

/**
 * Hủy đăng ký Webhook (deleteWebhook)
 * Luôn gọi trực tiếp https://bot-api.zapps.me
 */
export async function deleteZaloWebhook(
  tokenOverride?: string
): Promise<{ ok: boolean; result?: unknown; error?: string }> {
  const config = await getZaloBotConfigAsync();
  const token = (tokenOverride || config.token).trim();

  if (!token) {
    return { ok: false, error: 'Chưa cấu hình Bot Token.' };
  }

  try {
    const url = buildZaloBotUrl(token, 'deleteWebhook');
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const data = await res.json();
    if (!res.ok || data.ok === false) {
      return {
        ok: false,
        error: humanizeBotApiError(data.description || data.message || `Lỗi deleteWebhook (HTTP ${res.status})`, token),
        result: data,
      };
    }

    return { ok: true, result: data };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Lỗi kết nối: ${errMsg}` };
  }
}

export type WebhookEventType =
  | 'new_booking' // Khách đặt lịch cứu hộ / sửa chữa tận nơi
  | 'new_order' // Khách đặt đơn mua hàng / thanh toán VietQR
  | 'new_ticket' // Tạo phiếu sửa chữa mới
  | 'key_request' // Yêu cầu xuất/cấp License Key
  | 'sale_success' // Bán laptop/pc thành công -> bot chúc mừng đến nhóm đã cài đặt sẵn
  | 'key_release_success' // Phát hành/bán key bản quyền thành công -> bot chúc mừng đến nhóm
  | 'customer_zalo_order' // Gửi xác nhận đơn hàng đến Zalo khách hàng
  | 'customer_zalo_booking' // Gửi xác nhận đặt lịch hẹn đến Zalo khách hàng
  | 'crm_birthday_alert' // Nhắc nhở sinh nhật khách hàng trước 3 ngày
  | 'crm_followup_milestone' // Nhắc nhở sales hỏi thăm khách các mốc 1, 3, 6, 12 tháng
  | 'crm_warranty_expiring' // Cảnh báo thiết bị sắp hết bảo hành trong 30 ngày
  | 'test_notification'; // Thông báo test từ admin

/**
 * Bắn thông báo tự động (Event Dispatcher) tới Zalo Bot & Custom Webhook
 */
export async function dispatchSystemEvent(
  eventType: WebhookEventType,
  payload: Record<string, unknown>
): Promise<{ zaloSent: boolean; customSent: boolean; error?: string }> {
  const { token, defaultChatId, settings } = await getZaloBotConfigAsync();

  let shouldNotifyZalo = false;
  if (token && defaultChatId) {
    if (eventType === 'new_booking' && settings.notifyOnNewBooking !== false) shouldNotifyZalo = true;
    if (eventType === 'new_order' && settings.notifyOnNewOrder !== false) shouldNotifyZalo = true;
    if (eventType === 'new_ticket' && settings.notifyOnNewTicket !== false) shouldNotifyZalo = true;
    if (eventType === 'key_request' && settings.notifyOnKeyRequest !== false) shouldNotifyZalo = true;
    if (eventType === 'sale_success' && settings.notifyOnSaleSuccess !== false) shouldNotifyZalo = true;
    if (eventType === 'key_release_success' && settings.notifyOnSaleSuccess !== false) shouldNotifyZalo = true;
    if (eventType === 'customer_zalo_order') shouldNotifyZalo = true;
    if (eventType === 'customer_zalo_booking') shouldNotifyZalo = true;
    if (eventType === 'crm_birthday_alert') shouldNotifyZalo = true;
    if (eventType === 'crm_followup_milestone') shouldNotifyZalo = true;
    if (eventType === 'crm_warranty_expiring') shouldNotifyZalo = true;
    if (eventType === 'test_notification') shouldNotifyZalo = true;
  }

  let zaloSent = false;
  let errorDetail: string | undefined;

  // 1. Gửi qua Zalo Bot nếu được cấu hình & bật
  if (shouldNotifyZalo) {
    let formattedText = '';
    const nowStr = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

    if (eventType === 'new_booking') {
      const cleanPhone = String(payload.customerPhone || '').replace(/\D/g, '');
      formattedText = `🚨 [ĐẶT LỊCH DỊCH VỤ MỚI]\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `🏷️ Mã tiếp nhận: ${payload.ticketCode || 'N/A'}\n` +
        `👤 Khách hàng: ${payload.customerName || 'N/A'}\n` +
        `📞 SĐT khách: ${payload.customerPhone || 'N/A'}\n` +
        `📍 Địa điểm: ${payload.address || 'Tại quầy cửa hàng'}\n` +
        `💻 Thiết bị: ${payload.deviceType || 'Máy tính'}\n` +
        `🔧 Dịch vụ yêu cầu: ${payload.serviceNeeded || 'Kiểm tra tổng quát'}\n` +
        `⏰ Thời gian hẹn: ${payload.bookingDate || 'Hôm nay'} (${payload.bookingTime || 'Sớm nhất'})\n` +
        `⏱️ Tạo lúc: ${nowStr}\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        (cleanPhone ? `👉 KTV bấm link để chat Zalo ngay với khách:\nhttps://zalo.me/${cleanPhone}\n` : '') +
        `👉 Vui lòng liên hệ khách hàng để xác nhận lịch!`;
    } else if (eventType === 'new_order') {
      const cleanPhone = String(payload.customerPhone || '').replace(/\D/g, '');
      formattedText = `🛒 [ĐƠN HÀNG MUA MÁY / LINH KIỆN MỚI]\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `📦 Mã đơn: ${payload.orderCode || payload.id || 'N/A'}\n` +
        `💻 Sản phẩm: ${payload.deviceName || 'N/A'}\n` +
        `👤 Khách hàng: ${payload.customerName || 'N/A'}\n` +
        `📞 Số điện thoại: ${payload.customerPhone || 'N/A'}\n` +
        `📍 Giao đến: ${payload.shippingAddress || 'Nhận tại cửa hàng'}\n` +
        `💰 Tổng tiền: ${typeof payload.totalAmount === 'number' ? payload.totalAmount.toLocaleString('vi-VN') + ' đ' : payload.totalAmount || '0 đ'}\n` +
        `💳 Phương thức: ${payload.paymentMethod || 'Chuyển khoản VietQR'}\n` +
        (payload.note ? `📝 Ghi chú: ${payload.note}\n` : '') +
        `⏱️ Tạo lúc: ${nowStr}\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        (cleanPhone ? `👉 KTV bấm link để chat Zalo ngay với khách:\nhttps://zalo.me/${cleanPhone}\n` : '') +
        `👉 Xem chi tiết tại menu Quản Lý Đơn Hàng.`;
    } else if (eventType === 'new_ticket') {
      formattedText = `🛠️ [PHIẾU SỬA CHỮA MỚI]\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `🏷️ Mã phiếu: ${payload.ticketCode || 'N/A'}\n` +
        `👤 Khách hàng: ${payload.customerName || 'N/A'}\n` +
        `📞 Điện thoại: ${payload.customerPhone || 'N/A'}\n` +
        `💻 Thiết bị: ${payload.deviceType || payload.model || 'N/A'}\n` +
        `⚠️ Tình trạng lỗi: ${payload.issueDescription || payload.serviceNeeded || 'N/A'}\n` +
        `👨🔧 KTV phụ trách: ${payload.technicianName || 'Chưa phân công'}\n` +
        `⏱️ Tiếp nhận: ${nowStr}`;
    } else if (eventType === 'key_request') {
      formattedText = `🔑 [YÊU CẦU XUẤT KEY BẢN QUYỀN]\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `👤 Người yêu cầu: ${payload.requesterName || 'N/A'}\n` +
        `🏷️ Loại phần mềm: ${payload.keyCategory || 'N/A'}\n` +
        `📝 Lý do: ${payload.reason || 'N/A'}\n` +
        `⏱️ Lúc: ${nowStr}\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `👉 Vui lòng duyệt cấp key trên phần mềm!`;
    } else if (eventType === 'sale_success') {
      const soldPriceStr = typeof payload.soldPrice === 'number'
        ? payload.soldPrice.toLocaleString('vi-VN') + ' ₫'
        : (payload.soldPrice || '0 ₫');

      formattedText = `🎉 [CHÚC MỪNG XUẤT KHO & BÁN HÀNG THÀNH CÔNG!]\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `🏆 Người chốt đơn: ${payload.sellerName || 'Admin'}\n` +
        `💻 Thiết bị: ${payload.deviceName || 'Máy tính'}\n` +
        `🏷️ Service Tag: ${payload.serviceTag || payload.serialNumber || 'N/A'}\n` +
        `👤 Khách hàng: ${payload.customerName || 'N/A'}\n` +
        `📞 SĐT: ${payload.customerPhone || 'N/A'}\n` +
        (payload.customerCode ? `🎫 Mã khách hàng: ${payload.customerCode}\n` : '') +
        `💰 Giá bán: ${soldPriceStr}\n` +
        `🛡️ Bảo hành: ${payload.warrantyMonths || 12} tháng\n` +
        (payload.shelfLocation ? `📍 Kệ xuất kho: ${payload.shelfLocation}\n` : '') +
        `⏱️ Hoàn tất lúc: ${nowStr}\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `🚀 Vi Tính An Tâm chúc mừng toàn đội ngũ! Cùng nhau bứt phá doanh số nhé! 💪✨`;
    } else if (eventType === 'key_release_success') {
      formattedText = `🔑 [PHÁT HÀNH KEY BẢN QUYỀN THÀNH CÔNG!]\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `🏷️ Phần mềm: ${payload.categoryName || payload.softwareName || 'Bản quyền phần mềm'}\n` +
        (payload.keyCode ? `🔐 Mã Key: ${payload.keyCode}\n` : '') +
        `👤 Khách hàng: ${payload.customerName || 'N/A'}\n` +
        `📞 SĐT: ${payload.customerPhone || 'N/A'}\n` +
        (payload.ticketCode ? `🎫 Mã phiếu / Đơn: ${payload.ticketCode}\n` : '') +
        `👨‍💻 Người xuất / cấp: ${payload.issuerName || payload.adminName || 'Admin'}\n` +
        `⏱️ Hoàn tất lúc: ${nowStr}\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `🚀 Key đã được phát hành và kích hoạt thành công cho khách hàng! ✨`;
    } else if (eventType === 'customer_zalo_order') {
      const amountStr = typeof payload.totalAmount === 'number'
        ? payload.totalAmount.toLocaleString('vi-VN') + ' đ'
        : (payload.totalAmount || '0 đ');
      const cleanPhone = String(payload.customerPhone || '').replace(/\D/g, '');
      formattedText = `📱 [YÊU CẦU XÁC NHẬN ĐƠN QUA ZALO KHÁCH HÀNG]\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `👤 Khách hàng: ${payload.customerName || 'N/A'}\n` +
        `📞 Số điện thoại Zalo: ${payload.customerPhone || 'N/A'}\n` +
        `📦 Mã đơn: ${payload.orderCode || 'N/A'}\n` +
        `💻 Sản phẩm: ${payload.deviceName || 'N/A'}\n` +
        `💰 Tổng tiền: ${amountStr}\n` +
        `📍 Nhận hàng: ${payload.deliveryMethod === 'pickup' ? 'Nhận trực tiếp tại cửa hàng' : `Giao tận nơi — ${payload.shippingAddress || ''}`}\n` +
        `💳 Phương thức: ${payload.paymentMethod || 'Chuyển khoản QR'}\n` +
        `⏰ Thời gian đặt: ${nowStr}\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        (cleanPhone ? `👉 KTV bấm vào link để chat Zalo ngay với khách:\nhttps://zalo.me/${cleanPhone}\n` : '') +
        `💬 KTV vui lòng gửi tin nhắn xác nhận đơn cho khách sớm nhất nhé!`;
    } else if (eventType === 'customer_zalo_booking') {
      const cleanPhone = String(payload.customerPhone || '').replace(/\D/g, '');
      formattedText = `📱 [YÊU CẦU XÁC NHẬN LỊCH HẸN QUA ZALO KHÁCH HÀNG]\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `👤 Khách hàng: ${payload.customerName || 'N/A'}\n` +
        `📞 Số điện thoại Zalo: ${payload.customerPhone || 'N/A'}\n` +
        `🏷️ Mã tiếp nhận: ${payload.ticketCode || 'N/A'}\n` +
        `💻 Thiết bị: ${payload.deviceType || 'Máy tính'}\n` +
        `🔧 Dịch vụ yêu cầu: ${payload.serviceNeeded || 'Kiểm tra tổng quát'}\n` +
        `⏰ Thời gian hẹn: ${payload.bookingDate || 'Hôm nay'} (${payload.bookingTime || 'Sớm nhất'})\n` +
        `📍 Địa chỉ: ${payload.address || 'Tại cửa hàng'}\n` +
        `⏱️ Thời gian đặt: ${nowStr}\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        (cleanPhone ? `👉 KTV bấm vào link để chat Zalo ngay với khách:\nhttps://zalo.me/${cleanPhone}\n` : '') +
        `💬 KTV trực ca vui lòng liên hệ xác nhận lịch hẹn cho khách nhé!`;
    } else if (eventType === 'crm_birthday_alert') {
      const cleanPhone = String(payload.customerPhone || '').replace(/\D/g, '');
      const days = payload.daysRemaining !== undefined ? payload.daysRemaining : 3;
      const daysText = days === 0 ? 'HÔM NAY' : `CÒN ${days} NGÀY NỮA`;
      formattedText = `🎂 [CRM: NHẮC NHỞ SINH NHẬT KHÁCH HÀNG — ${daysText}]\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `👤 Khách hàng: ${payload.customerName || 'N/A'}\n` +
        `📅 Ngày sinh: ${payload.birthDateFormatted || payload.birthDate || 'N/A'}\n` +
        `🎖️ Hạng thành viên: ${payload.tierLabel || 'Thành viên'} (Chiết khấu: ${payload.discountPercent || '0%'})\n` +
        `💼 Sales phụ trách: ${payload.salesName || 'Vi Tính An Tâm'}\n` +
        `📞 Số điện thoại: ${payload.customerPhone || 'N/A'}\n` +
        (payload.totalSpent ? `💰 Tổng tích lũy: ${typeof payload.totalSpent === 'number' ? payload.totalSpent.toLocaleString('vi-VN') + ' đ' : payload.totalSpent}\n` : '') +
        `⏱️ Thời gian nhắc: ${nowStr}\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        (cleanPhone ? `👉 Sales bấm link để chat Zalo gửi lời chúc & quà tặng ngay:\nhttps://zalo.me/${cleanPhone}\n` : '') +
        `💬 Hãy mở trang Quản Trị CRM để sao chép lời nhắn mẫu chỉ với 1 click!`;
    } else if (eventType === 'crm_followup_milestone') {
      const cleanPhone = String(payload.customerPhone || '').replace(/\D/g, '');
      formattedText = `🔔 [CRM: NHẮC SALES CHĂM SÓC KHÁCH — MỐC ${payload.milestoneText || '1 THÁNG'}]\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `👤 Khách hàng: ${payload.customerName || 'N/A'}\n` +
        `📞 Điện thoại: ${payload.customerPhone || 'N/A'}\n` +
        `💻 Thiết bị đã mua: ${payload.deviceName || 'Máy tính'}\n` +
        (payload.serviceTag ? `🏷️ Service Tag: ${payload.serviceTag}\n` : '') +
        (payload.purchaseDate ? `📅 Ngày mua: ${payload.purchaseDate}\n` : '') +
        `💼 Sales phụ trách: ${payload.salesName || 'Vi Tính An Tâm'}\n` +
        `⏱️ Cảnh báo lúc: ${nowStr}\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        (cleanPhone ? `👉 Sales bấm link để chat Zalo hỏi thăm khách:\nhttps://zalo.me/${cleanPhone}\n` : '') +
        `💬 Gợi ý: Hãy mở trang Quản Trị CRM để sao chép tin nhắn mẫu chăm sóc khách hàng!`;
    } else if (eventType === 'crm_warranty_expiring') {
      const cleanPhone = String(payload.customerPhone || '').replace(/\D/g, '');
      const days = payload.expiryDaysRemaining ?? 30;
      formattedText = `🛡️ [CRM: CẢNH BÁO MÁY SẮP HẾT HẠN BẢO HÀNH — CÒN ${days} NGÀY]\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `👤 Khách hàng: ${payload.customerName || 'N/A'}\n` +
        `📞 Điện thoại: ${payload.customerPhone || 'N/A'}\n` +
        `💻 Thiết bị: ${payload.deviceName || 'Máy tính'}\n` +
        (payload.serviceTag ? `🏷️ Service Tag: ${payload.serviceTag}\n` : '') +
        `🛡️ Hạn bảo hành đến: ${payload.warrantyExpiryDate || 'Trong 30 ngày tới'}\n` +
        `💼 Phụ trách: ${payload.salesName || 'Vi Tính An Tâm'}\n` +
        `⏱️ Cảnh báo lúc: ${nowStr}\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        (cleanPhone ? `👉 Sales bấm link để chat Zalo mời khách kiểm tra máy trước hạn:\nhttps://zalo.me/${cleanPhone}\n` : '') +
        `💬 Mời khách ghé bảo dưỡng tổng thể miễn phí hoặc tư vấn gia hạn gói bảo hành!`;
    } else {
      formattedText = `🧪 [THÔNG BÁO TEST KẾT NỐI ZALO BOT]\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `✅ Hệ thống Vi Tính An Tâm đã kết nối thành công với Zalo Bot API!\n` +
        `⏰ Thời gian gửi: ${nowStr}\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `Chúc bạn một ngày làm việc hiệu quả!`;
    }

    const res = await sendZaloBotMessage({
      chatId: defaultChatId,
      text: formattedText,
    });

    zaloSent = res.ok;
    if (!res.ok) {
      errorDetail = res.error;
      console.error('[Zalo Bot] Gửi thông báo thất bại:', res.error);
    } else {
      console.log(`[Zalo Bot] Đã gửi thông báo thành công cho sự kiện: ${eventType}`);
    }
  } else {
    if (!token || !defaultChatId) {
      console.warn('[Zalo Bot] Bỏ qua gửi thông báo do chưa cấu hình Zalo Bot Token hoặc Chat ID.');
    }
  }

  return {
    zaloSent,
    customSent: false,
    error: errorDetail,
  };
}
