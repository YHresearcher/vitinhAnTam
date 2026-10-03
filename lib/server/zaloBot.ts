import { getStoredSettings } from '@/lib/server/settings';

// Zalo Bot API chính thức (SDK python-zalo-bot) — https://bot.zapps.vn/docs/create-bot/
// URL dạng: {base}/bot{token}/{method} — contract lấy từ source SDK (zalo_bot/_bot.py)
const ZALO_BOT_BASE_URL = 'https://bot-api.zapps.me';

/**
 * Định dạng cấu hình Bot & Webhook lấy từ settings
 */
export function getZaloBotConfig() {
  const settings = getStoredSettings();
  const apiBaseUrl = (settings.botApiBaseUrl || process.env.ZALO_BOT_API_BASE_URL || '').trim();
  const token = (settings.zaloBotToken || process.env.ZALO_BOT_TOKEN || '').trim();
  const secretToken = (settings.zaloBotSecretToken || process.env.ZALO_BOT_SECRET_TOKEN || '').trim();
  const defaultChatId = (settings.zaloDefaultChatId || process.env.ZALO_BOT_CHAT_ID || '').trim();
  const customWebhookUrl = (settings.customWebhookUrl || process.env.CUSTOM_WEBHOOK_URL || '').trim();

  return {
    apiBaseUrl,
    token,
    secretToken,
    defaultChatId,
    customWebhookUrl,
    settings,
  };
}

/**
 * Xây URL gọi Zalo Bot API: {base}/bot{token}/{method}
 */
function buildZaloBotUrl(apiBaseUrl: string, token: string, method: string): string {
  const base = (apiBaseUrl || ZALO_BOT_BASE_URL).replace(/\/+$/, '');
  return `${base}/bot${token}/${method}`;
}

// (Đã loại bỏ luồng Zalo OA OpenAPI — hệ thống chỉ dùng Zalo Bot API: bot-api.zapps.me)



/**
 * Gửi tin nhắn thông báo qua Zalo Bot API (bot-api.zapps.me)
 */
export async function sendZaloBotMessage(params: {
  chatId?: string;
  text: string;
  parseMode?: 'markdown' | 'HTML';
  token?: string;
  apiBaseUrl?: string;
}): Promise<{ ok: boolean; result?: unknown; error?: string }> {
  const config = getZaloBotConfig();
  const apiBaseUrl = (params.apiBaseUrl !== undefined ? params.apiBaseUrl : config.apiBaseUrl).trim();
  const token = (params.token !== undefined ? params.token : config.token).trim();
  const targetChatId = (params.chatId || config.defaultChatId).trim();

  if (!token) {
    return { ok: false, error: 'Chưa nhập Zalo Bot Token.' };
  }
  if (!targetChatId) {
    return { ok: false, error: 'Chưa nhập Chat ID nhận tin nhắn.' };
  }

  try {
    // ZALO BOT API (bot-api.zapps.me — contract theo SDK python-zalo-bot)
    const url = buildZaloBotUrl(apiBaseUrl, token, 'sendMessage');
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
        error: humanizeBotApiError(data.description || data.message || `Lỗi sendMessage (HTTP ${res.status})`, token, apiBaseUrl),
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
 * Đăng ký Webhook với Bot Platform (setWebhook)
 */
export async function setZaloWebhook(
  webhookUrl: string,
  secretToken?: string,
  tokenOverride?: string,
  apiBaseUrlOverride?: string
): Promise<{ ok: boolean; result?: unknown; error?: string }> {
  const config = getZaloBotConfig();
  const token = (tokenOverride || config.token).trim();
  const secret = secretToken || config.secretToken;
  const apiBaseUrl = (apiBaseUrlOverride !== undefined ? apiBaseUrlOverride : config.apiBaseUrl).trim();

  if (!token) {
    return { ok: false, error: 'Chưa cấu hình Bot Token.' };
  }

  try {
    const url = buildZaloBotUrl(apiBaseUrl, token, 'setWebhook');
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
        error: humanizeBotApiError(data.description || data.message || `Lỗi setWebhook (HTTP ${res.status})`, token, apiBaseUrl),
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
 */
export async function getZaloWebhookInfo(
  tokenOverride?: string,
  apiBaseUrlOverride?: string
): Promise<{ ok: boolean; result?: unknown; error?: string }> {
  const config = getZaloBotConfig();
  const token = (tokenOverride || config.token).trim();
  const apiBaseUrl = (apiBaseUrlOverride !== undefined ? apiBaseUrlOverride : config.apiBaseUrl).trim();

  if (!token) {
    return { ok: false, error: 'Chưa cấu hình Bot Token.' };
  }

  try {
    const url = buildZaloBotUrl(apiBaseUrl, token, 'getWebhookInfo');
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });

    const data = await res.json();
    if (!res.ok || data.ok === false) {
      return {
        ok: false,
        error: humanizeBotApiError(data.description || data.message || `Lỗi getWebhookInfo (HTTP ${res.status})`, token, apiBaseUrl),
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
 */
export async function deleteZaloWebhook(
  tokenOverride?: string,
  apiBaseUrlOverride?: string
): Promise<{ ok: boolean; result?: unknown; error?: string }> {
  const config = getZaloBotConfig();
  const token = (tokenOverride || config.token).trim();
  const apiBaseUrl = (apiBaseUrlOverride !== undefined ? apiBaseUrlOverride : config.apiBaseUrl).trim();

  if (!token) {
    return { ok: false, error: 'Chưa cấu hình Bot Token.' };
  }

  try {
    const url = buildZaloBotUrl(apiBaseUrl, token, 'deleteWebhook');
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
        error: humanizeBotApiError(data.description || data.message || `Lỗi deleteWebhook (HTTP ${res.status})`, token, apiBaseUrl),
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
  | 'test_notification'; // Thông báo test từ admin

/**
 * Bắn thông báo tự động (Event Dispatcher) tới Zalo Bot & Custom Webhook
 */
export async function dispatchSystemEvent(
  eventType: WebhookEventType,
  payload: Record<string, unknown>
): Promise<{ zaloSent: boolean; customSent: boolean; error?: string }> {
  const { token, defaultChatId, customWebhookUrl, settings } = getZaloBotConfig();

  let shouldNotifyZalo = false;
  if (token && defaultChatId) {
    if (eventType === 'new_booking' && settings.notifyOnNewBooking !== false) shouldNotifyZalo = true;
    if (eventType === 'new_order' && settings.notifyOnNewOrder !== false) shouldNotifyZalo = true;
    if (eventType === 'new_ticket' && settings.notifyOnNewTicket !== false) shouldNotifyZalo = true;
    if (eventType === 'key_request' && settings.notifyOnKeyRequest !== false) shouldNotifyZalo = true;
    if (eventType === 'test_notification') shouldNotifyZalo = true;
  }

  let zaloSent = false;
  let customSent = false;
  let errorDetail: string | undefined;

  // 1. Gửi qua Zalo Bot nếu được cấu hình & bật
  if (shouldNotifyZalo) {
    let formattedText = '';
    const nowStr = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

    if (eventType === 'new_booking') {
      formattedText = `🚨 [ĐẶT LỊCH DỊCH VỤ TẬN NƠI MỚI]\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `🏷️ Mã tiếp nhận: ${payload.ticketCode || 'N/A'}\n` +
        `👤 Khách hàng: ${payload.customerName || 'N/A'}\n` +
        `📞 SĐT / Zalo: ${payload.customerPhone || 'N/A'}\n` +
        `📍 Địa chỉ: ${payload.address || 'N/A'}\n` +
        `💻 Thiết bị: ${payload.deviceType || 'N/A'}\n` +
        `🔧 Nhu cầu: ${payload.serviceNeeded || 'N/A'}\n` +
        `⏰ Thời gian hẹn: ${payload.bookingDate || 'N/A'} (${payload.bookingTime || 'N/A'})\n` +
        `⏱️ Tạo lúc: ${nowStr}\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `👉 Vui lòng liên hệ khách hàng để xác nhận lịch!`;
    } else if (eventType === 'new_order') {
      formattedText = `🛒 [ĐƠN HÀNG WEBSITE MỚI]\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `📦 Mã đơn: ${payload.orderCode || payload.id || 'N/A'}\n` +
        `👤 Khách hàng: ${payload.customerName || 'N/A'}\n` +
        `📞 Số điện thoại: ${payload.customerPhone || 'N/A'}\n` +
        `📍 Giao đến: ${payload.shippingAddress || 'N/A'}\n` +
        `💰 Tổng tiền: ${typeof payload.totalAmount === 'number' ? payload.totalAmount.toLocaleString('vi-VN') + ' đ' : payload.totalAmount || '0 đ'}\n` +
        `💳 Phương thức: ${payload.paymentMethod || 'VietQR'}\n` +
        `⏱️ Tạo lúc: ${nowStr}\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
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
    if (!res.ok) errorDetail = res.error;
  }

  // 2. Gửi qua Custom Webhook (n8n, Zapier, Make, Telegram, Discord, CRM) nếu có
  if (customWebhookUrl) {
    try {
      const resp = await fetch(customWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ViTinhAnTam-Webhook/1.0',
        },
        body: JSON.stringify({
          event: eventType,
          timestamp: new Date().toISOString(),
          data: payload,
        }),
      });
      customSent = resp.ok;
    } catch (err: unknown) {
      console.error('Lỗi khi bắn Custom Webhook:', err);
    }
  }

  return {
    zaloSent,
    customSent,
    error: errorDetail,
  };
}
