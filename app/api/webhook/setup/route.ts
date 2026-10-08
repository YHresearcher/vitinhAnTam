import { NextRequest, NextResponse } from 'next/server';
import { deleteZaloWebhook, getZaloWebhookInfo, setZaloWebhook } from '@/lib/server/zaloBot';
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
    const { action, webhookUrl, apiBaseUrl } = body;

    if (action === 'set') {
      if (!webhookUrl) {
        return NextResponse.json({ ok: false, error: 'Vui lòng cung cấp URL Webhook cần đăng ký.' }, { status: 400 });
      }
      // Token & secretToken đọc từ env vars trong zaloBot.ts
      const res = await setZaloWebhook(webhookUrl, undefined, undefined, apiBaseUrl);
      if (!res.ok) {
        return NextResponse.json({ ok: false, error: res.error, result: res.result }, { status: 400 });
      }
      return NextResponse.json({ ok: true, message: 'Đăng ký Webhook với Bot thành công!', result: res.result });
    }

    if (action === 'info') {
      // Token đọc từ env vars trong zaloBot.ts
      const res = await getZaloWebhookInfo(undefined, apiBaseUrl);
      if (!res.ok) {
        return NextResponse.json({ ok: false, error: res.error, result: res.result }, { status: 400 });
      }
      return NextResponse.json({ ok: true, info: res.result });
    }

    if (action === 'delete') {
      // Token đọc từ env vars trong zaloBot.ts
      const res = await deleteZaloWebhook(undefined, apiBaseUrl);
      if (!res.ok) {
        return NextResponse.json({ ok: false, error: res.error, result: res.result }, { status: 400 });
      }
      return NextResponse.json({ ok: true, message: 'Đã hủy đăng ký Webhook thành công!', result: res.result });
    }

    return NextResponse.json({ ok: false, error: 'Hành động không hợp lệ (hỗ trợ set, info, delete)' }, { status: 400 });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: errMsg }, { status: 500 });
  }
}
