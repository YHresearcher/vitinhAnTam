import { getStoredSettings } from '@/lib/server/settings';

/**
 * Định dạng cấu hình Bot & Webhook lấy từ settings
 */
export function getZaloBotConfig() {
  const settings = getStoredSettings();
  const provider = (settings.botProvider || process.env.BOT_PROVIDER || 'telegram') as 'telegram' | 'zalo_oa' | 'custom_gateway';
  const apiBaseUrl = (settings.botApiBaseUrl || process.env.BOT_API_BASE_URL || '').trim();
  const token = (settings.zaloBotToken || process.env.ZALO_BOT_TOKEN || '').trim();
  const secretToken = (settings.zaloBotSecretToken || process.env.ZALO_BOT_SECRET_TOKEN || '').trim();
  const defaultChatId = (settings.zaloDefaultChatId || process.env.ZALO_BOT_CHAT_ID || '').trim();
  const customWebhookUrl = (settings.customWebhookUrl || process.env.CUSTOM_WEBHOOK_URL || '').trim();

  return {
    provider,
    apiBaseUrl,
    token,
    secretToken,
    defaultChatId,
    customWebhookUrl,
    settings,
  };
}

/**
 * Gửi tin nhắn thông báo qua Bot (Telegram / Zalo OA / Custom Gateway)
 */
export async function sendZaloBotMessage(params: {
  chatId?: string;
  text: string;
  parseMode?: 'markdown' | 'HTML';
  token?: string;
  provider?: 'telegram' | 'zalo_oa' | 'custom_gateway';
  apiBaseUrl?: string;
}): Promise<{ ok: boolean; result?: unknown; error?: string }> {
  const config = getZaloBotConfig();
  const provider = params.provider || config.provider;
  const apiBaseUrl = (params.apiBaseUrl !== undefined ? params.apiBaseUrl : config.apiBaseUrl).trim();
  const token = (params.token !== undefined ? params.token : config.token).trim();
  const targetChatId = (params.chatId || config.defaultChatId).trim();

  if (!token && provider !== 'custom_gateway') {
    return { ok: false, error: 'Chưa nhập Bot Token / Access Token.' };
  }
  if (!targetChatId && provider !== 'custom_gateway') {
    return { ok: false, error: 'Chưa nhập Chat ID / User ID / Group ID nhận tin nhắn.' };
  }

  try {
    // 1. ZALO OA (Official Account OpenAPI)
    if (provider === 'zalo_oa') {
      const url = apiBaseUrl || 'https://openapi.zalo.me/v3.0/oa/message/cs';
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          access_token: token,
        },
        body: JSON.stringify({
          recipient: {
            user_id: targetChatId,
          },
          message: {
            text: params.text,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || (data.error && data.error !== 0)) {
        return {
          ok: false,
          error: data.message || `Lỗi Zalo OA API (mã lỗi: ${data.error})`,
          result: data,
        };
      }
      return { ok: true, result: data };
    }

    // 2. CUSTOM GATEWAY / PROXY BOT
    if (provider === 'custom_gateway') {
      const url = apiBaseUrl || targetChatId;
      if (!url || !url.startsWith('http')) {
        return { ok: false, error: 'Vui lòng nhập URL Endpoint hợp lệ (bắt đầu bằng http:// hoặc https://).' };
      }
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          chat_id: targetChatId,
          text: params.text,
          message: params.text,
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await res.json().catch(() => ({ status: res.status }));
      if (!res.ok) {
        return { ok: false, error: `Lỗi Gateway (HTTP ${res.status})`, result: data };
      }
      return { ok: true, result: data };
    }

    // 3. TELEGRAM BOT API (Mặc định - Cực kỳ tin cậy & miễn phí 100%)
    const base = apiBaseUrl || 'https://api.telegram.org';
    const cleanBase = base.replace(/\/+$/, '');
    const url = `${cleanBase}/bot${token}/sendMessage`;
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

    const data = await res.json();
    if (!res.ok || data.ok === false) {
      return {
        ok: false,
        error: data.description || data.message || `Lỗi Bot API (HTTP ${res.status})`,
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
    const base = apiBaseUrl || 'https://api.telegram.org';
    const cleanBase = base.replace(/\/+$/, '');
    const url = `${cleanBase}/bot${token}/setWebhook`;
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
        error: data.description || data.message || `Lỗi setWebhook (HTTP ${res.status})`,
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
    const base = apiBaseUrl || 'https://api.telegram.org';
    const cleanBase = base.replace(/\/+$/, '');
    const url = `${cleanBase}/bot${token}/getWebhookInfo`;
    const res = await fetch(url, {
      method: 'GET',
    });

    const data = await res.json();
    if (!res.ok || data.ok === false) {
      return {
        ok: false,
        error: data.description || data.message || `Lỗi getWebhookInfo (HTTP ${res.status})`,
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
    const base = apiBaseUrl || 'https://api.telegram.org';
    const cleanBase = base.replace(/\/+$/, '');
    const url = `${cleanBase}/bot${token}/deleteWebhook`;
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
        error: data.description || data.message || `Lỗi deleteWebhook (HTTP ${res.status})`,
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
