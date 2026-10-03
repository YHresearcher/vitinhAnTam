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
    const { action, webhookUrl, secretToken, token, apiBaseUrl } = body;

    if (action === 'set') {
      if (!webhookUrl) {
        return NextResponse.json({ ok: false, error: 'Vui lòng cung cấp URL Webhook cần đăng ký.' }, { status: 400 });
      }
      const res = await setZaloWebhook(webhookUrl, secretToken, token, apiBaseUrl);
      if (!res.ok) {
        return NextResponse.json({ ok: false, error: res.error, result: res.result }, { status: 400 });
      }
      return NextResponse.json({ ok: true, message: 'Đăng ký Webhook với Bot thành công!', result: res.result });
    }

    if (action === 'info') {
      const res = await getZaloWebhookInfo(token, apiBaseUrl);
      if (!res.ok) {
        return NextResponse.json({ ok: false, error: res.error, result: res.result }, { status: 400 });
      }
      return NextResponse.json({ ok: true, info: res.result });
    }

    if (action === 'delete') {
      const res = await deleteZaloWebhook(token, apiBaseUrl);
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
