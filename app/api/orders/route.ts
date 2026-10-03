import { NextRequest, NextResponse } from 'next/server';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { SESSION_COOKIE, verifySession } from '@/lib/session';
import { dispatchSystemEvent } from '@/lib/server/zaloBot';


// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
type OrderPayload = {
  order_code?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  device_name?: string;
  device_price?: number;
  device_tag?: string;
  payment_method?: string;
  delivery_method?: string;
  note?: string;
  status?: string;
};

const VALID_PAYMENT = ['qr', 'cash'];
const VALID_DELIVERY = ['pickup', 'delivery'];
const STAFF_ROLES = ['admin', 'sales', 'technician'];

/** Chỉ staff (admin/sales/technician) đã đăng nhập mới được xem danh sách đơn. */
function isStaff(request: NextRequest): boolean {
  const session = verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  return Boolean(session && STAFF_ROLES.includes(session.role));
}

/** Fallback khi Supabase chưa cấu hình: lưu đơn vào file .data/orders.json */
function readFallbackOrders(): Array<Record<string, unknown>> {
  try {
    const file = join(process.cwd(), '.data', 'orders.json');
    if (!existsSync(file)) return [];
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return [];
  }
}

function writeFallbackOrder(order: Record<string, unknown>): void {
  try {
    const dir = join(process.cwd(), '.data');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const file = join(dir, 'orders.json');
    const list = readFallbackOrders();
    list.unshift(order);
    writeFileSync(file, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.warn('Fallback order save failed:', err);
  }
}

/** Gửi email thông báo nội bộ cho sales/admin/kỹ thuật (best-effort). */
async function notifyStaffByEmail(order: Record<string, unknown>): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) return;

  // Lấy email nhân sự từ Supabase (nếu có), fallback danh sách mặc định
  let recipients: string[] = [
    'thanhphan@vitinhantam.com',
    'sales01@vitinhantam.com',
    'tech01@vitinhantam.com',
  ];
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data } = await supabase
        .from('users')
        .select('email')
        .in('role', STAFF_ROLES)
        .eq('status', 'active');
      if (data && data.length > 0) {
        recipients = data.map((u) => u.email).filter(Boolean);
      }
    } catch {
      // Giữ danh sách fallback
    }
  }

  const subject = `[Vi Tính An Tâm] Đơn hàng mới ${order.order_code} cần xác nhận`;
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
    <div style="background:#C0392B;color:#fff;padding:16px;text-align:center">
      <h2 style="margin:0">🔔 ĐƠN HÀNG MỚI TỪ WEBSITE</h2>
    </div>
    <div style="padding:20px;color:#1f2937;font-size:14px;line-height:1.6">
      <p>Vừa có đơn hàng mới, vui lòng liên hệ khách xác nhận:</p>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:6px 0;color:#6b7280">Mã đơn:</td><td style="font-weight:bold;color:#C0392B">${order.order_code}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280">Khách hàng:</td><td><strong>${order.customer_name}</strong> — ${order.customer_phone}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280">Sản phẩm:</td><td>${order.device_name}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280">Giá:</td><td>${Number(order.device_price || 0).toLocaleString('vi-VN')}₫</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280">Thanh toán:</td><td>${order.payment_method === 'cash' ? 'Tiền mặt tại cửa hàng' : 'Chuyển khoản QR'}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280">Nhận hàng:</td><td>${order.delivery_method === 'delivery' ? `Giao tận nơi — ${order.customer_address || ''}` : 'Nhận tại cửa hàng'}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280">Thời gian:</td><td>${new Date().toLocaleString('vi-VN')}</td></tr>
      </table>
      <p style="margin-top:16px;color:#6b7280;font-size:12px">
        Email tự động từ hệ thống Vi Tính An Tâm — vui lòng không trả lời email này.
      </p>
    </div>
  </div>`;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Vi Tính An Tâm <onboarding@resend.dev>',
        to: recipients,
        subject,
        html,
      }),
    });
  } catch (err) {
    // Best-effort: không chặn luồng đặt hàng nếu gửi email thất bại
    console.warn('Notify staff email failed:', err);
  }
}

// ---------------------------------------------------------------------------
// POST /api/orders — Khách hàng đặt đơn (công khai)
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as OrderPayload;

    const customerName = (body.customer_name || '').trim();
    const customerPhone = (body.customer_phone || '').trim();
    const deviceName = (body.device_name || '').trim();

    if (!customerName || !customerPhone || !deviceName) {
      return NextResponse.json(
        { success: false, message: 'Thiếu thông tin: họ tên, số điện thoại và sản phẩm là bắt buộc.' },
        { status: 400 }
      );
    }
    if (!VALID_PAYMENT.includes(body.payment_method || '')) {
      return NextResponse.json(
        { success: false, message: 'Hình thức thanh toán không hợp lệ (chỉ chuyển khoản hoặc tiền mặt).' },
        { status: 400 }
      );
    }
    if (!VALID_DELIVERY.includes(body.delivery_method || '')) {
      return NextResponse.json(
        { success: false, message: 'Hình thức nhận hàng không hợp lệ.' },
        { status: 400 }
      );
    }

    const orderCode = body.order_code?.trim() || `#AT-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const order: Record<string, unknown> = {
      order_code: orderCode,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_address: (body.customer_address || '').trim(),
      device_name: deviceName,
      device_price: Number(body.device_price) || 0,
      device_tag: (body.device_tag || '').trim(),
      payment_method: body.payment_method,
      delivery_method: body.delivery_method,
      note: (body.note || '').trim(),
      status: 'pending',
    };

    let savedId: string | null = null;
    let source = 'fallback';

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('orders').insert([order]).select('id').single();
        if (!error && data) {
          savedId = data.id;
          source = 'supabase';

          // Thông báo đồng thời đến sales / admin / kỹ thuật
          const notification = {
            type: 'order',
            title: `Đơn hàng mới ${orderCode}`,
            body: `${customerName} (${customerPhone}) đặt ${deviceName} — ${
              order.delivery_method === 'delivery' ? 'giao tận nơi' : 'nhận tại cửa hàng'
            }. Cần xác nhận.`,
            reference_id: data.id,
            read: false,
          };
          try {
            await supabase.from('notifications').insert([notification]);
          } catch {
            // Không chặn đơn hàng nếu thông báo DB lỗi
          }

          // Gửi email nội bộ (best-effort)
          notifyStaffByEmail({ ...order, id: data.id }).catch(() => undefined);
        }
      } catch (err) {
        console.warn('Supabase order insert failed, using fallback:', err);
      }
    }

    if (source === 'fallback') {
      const fallbackOrder = { id: `local-${Date.now()}`, ...order, created_at: new Date().toISOString() };
      writeFallbackOrder(fallbackOrder);
      savedId = fallbackOrder.id as string;
      // Vẫn cố gắng gửi email thông báo
      notifyStaffByEmail(fallbackOrder).catch(() => undefined);
    }
    // Gửi thông báo Webhook & Zalo Bot (bất đồng bộ không chặn response)
    dispatchSystemEvent('new_order', {
      orderCode,
      customerName,
      customerPhone,
      shippingAddress: (body.customer_address || '').trim() || (order.delivery_method === 'pickup' ? 'Nhận tại quầy' : 'Giao tận nơi'),
      totalAmount: Number(body.device_price) || 0,
      paymentMethod: order.payment_method === 'qr' ? 'Chuyển khoản VietQR' : 'Tiền mặt khi nhận hàng',
      deviceName,
    }).catch((err) => console.warn('Zalo Bot / Webhook order notification error:', err));


    return NextResponse.json({
      success: true,
      message: 'Đặt hàng thành công. Hệ thống đã thông báo đến sales/admin/kỹ thuật để xác nhận đơn.',
      order_id: savedId,
      order_code: orderCode,
      source,
    });
  } catch (error: unknown) {
    console.error('Create order error:', error);
    const msg = error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo đơn hàng.';
    return NextResponse.json(
      { success: false, message: msg },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// GET /api/orders — Staff (admin/sales/technician) xem danh sách đơn
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  if (!isStaff(request)) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Chỉ admin, sales và kỹ thuật mới có quyền xem danh sách đơn hàng.' },
      { status: 403 }
    );
  }

  const status = request.nextUrl.searchParams.get('status');

  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (status) query = query.eq('status', status);
      const { data, error } = await query.limit(100);
      if (!error && data) {
        return NextResponse.json({ success: true, total: data.length, data, source: 'supabase' });
      }
    } catch {
      // Fallback
    }
  }

  let fallback = readFallbackOrders();
  if (status) fallback = fallback.filter((o) => o.status === status);
  return NextResponse.json({ success: true, total: fallback.length, data: fallback, source: 'fallback' });
}

// ---------------------------------------------------------------------------
// PATCH /api/orders — Staff xác nhận / cập nhật trạng thái đơn hàng
// ---------------------------------------------------------------------------
export async function PATCH(request: NextRequest) {
  if (!isStaff(request)) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Chỉ admin, sales và kỹ thuật mới có quyền cập nhật đơn hàng.' },
      { status: 403 }
    );
  }

  try {
    const body = (await request.json()) as { id?: string; status?: string };
    const allowed = ['confirmed', 'processing', 'completed', 'cancelled'];
    if (!body.id || !body.status || !allowed.includes(body.status)) {
      return NextResponse.json(
        { success: false, message: 'Thiếu id hoặc trạng thái không hợp lệ.' },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        const session = verifySession(request.cookies.get(SESSION_COOKIE)?.value);
        const { error } = await supabase
          .from('orders')
          .update({
            status: body.status,
            confirmed_by: session?.name || 'staff',
            confirmed_at: new Date().toISOString(),
          })
          .eq('id', body.id);
        if (!error) {
          return NextResponse.json({ success: true, source: 'supabase' });
        }
      } catch {
        // Fallback
      }
    }

    // Fallback: cập nhật file local
    try {
      const file = join(process.cwd(), '.data', 'orders.json');
      if (existsSync(file)) {
        const list = JSON.parse(readFileSync(file, 'utf8')) as Array<Record<string, unknown>>;
        const target = list.find((o) => o.id === body.id);
        if (target) {
          target.status = body.status;
          const session = verifySession(request.cookies.get(SESSION_COOKIE)?.value);
          target.confirmed_by = session?.name || 'staff';
          target.confirmed_at = new Date().toISOString();
          writeFileSync(file, JSON.stringify(list, null, 2), 'utf8');
        }
      }
    } catch (err) {
      console.warn('Fallback order update failed:', err);
    }

    return NextResponse.json({ success: true, source: 'fallback' });
  } catch (error: unknown) {
    console.error('Update order error:', error);
    const msg = error instanceof Error ? error.message : 'Có lỗi xảy ra khi cập nhật đơn hàng.';
    return NextResponse.json(
      { success: false, message: msg },
      { status: 500 }
    );
  }
}
