import { NextRequest, NextResponse } from 'next/server';
import { dispatchSystemEvent, WebhookEventType } from '@/lib/server/zaloBot';
import { requireStaff } from '@/lib/server/auth';
import { rateLimit } from '@/lib/server/rateLimit';

/**
 * Endpoint kích hoạt webhook event nội bộ từ hệ thống (booking, ticket, license key).
 *
 * Phân quyền:
 * - Sự kiện công khai (khách đặt lịch/đặt hàng từ website): không cần đăng nhập
 *   nhưng bị giới hạn tần suất theo IP.
 * - Sự kiện nội bộ (bán hàng thành công, cấp key, nhắc CRM...): bắt buộc session
 *   nhân viên hợp lệ — tránh người lạ giả mạo thông báo vào nhóm Zalo nội bộ.
 */
const PUBLIC_EVENTS: WebhookEventType[] = [
  'new_booking',
  'new_order',
  'customer_zalo_order',
  'customer_zalo_booking',
];

const ALL_EVENTS: WebhookEventType[] = [
  ...PUBLIC_EVENTS,
  'new_ticket',
  'key_request',
  'sale_success',
  'key_release_success',
  'crm_birthday_alert',
  'crm_followup_milestone',
  'crm_warranty_expiring',
  'test_notification',
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const eventType = body.eventType as WebhookEventType;
    const payload = (body.payload || {}) as Record<string, unknown>;

    if (!eventType || !ALL_EVENTS.includes(eventType)) {
      return NextResponse.json({ ok: false, error: 'eventType không hợp lệ' }, { status: 400 });
    }

    if (!PUBLIC_EVENTS.includes(eventType)) {
      if (!requireStaff(req)) {
        return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
      }
    } else if (!rateLimit(req, 'webhook-notify', 20, 10 * 60 * 1000)) {
      return NextResponse.json({ ok: false, error: 'Quá nhiều yêu cầu' }, { status: 429 });
    }

    const result = await dispatchSystemEvent(eventType, payload);

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: errMsg }, { status: 500 });
  }
}
