import { NextRequest, NextResponse } from 'next/server';
import { dispatchSystemEvent, WebhookEventType } from '@/lib/server/zaloBot';

/**
 * Endpoint kích hoạt webhook event nội bộ từ hệ thống (booking, ticket, license key)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const eventType = body.eventType as WebhookEventType;
    const payload = (body.payload || {}) as Record<string, unknown>;

    if (!eventType) {
      return NextResponse.json({ ok: false, error: 'Thiếu eventType' }, { status: 400 });
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
