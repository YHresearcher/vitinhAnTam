import { NextRequest, NextResponse } from 'next/server';
import { dispatchSystemEvent, WebhookEventType } from '@/lib/server/zaloBot';
import { SESSION_COOKIE, verifySession } from '@/lib/session';

/**
 * Endpoint kích hoạt webhook event nội bộ từ hệ thống (booking, ticket, license key)
 * Yêu cầu quyền Admin hoặc canManageUsers
 */
export async function POST(req: NextRequest) {
  // Xác thực quyền Admin
  const sessionToken = req.cookies.get(SESSION_COOKIE)?.value;
  const session = verifySession(sessionToken);

  if (!session || (session.role !== 'admin' && !session.canManageUsers)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized. Yêu cầu quyền quản trị.' }, { status: 401 });
  }

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
