import { NextRequest, NextResponse } from 'next/server';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getServerSupabase } from '@/lib/server/supabaseAdmin';
import { SESSION_COOKIE, verifySession } from '@/lib/session';
import { getSession, requireStaff } from '@/lib/server/auth';
import { rateLimit } from '@/lib/server/rateLimit';
import { dispatchSystemEvent } from '@/lib/server/zaloBot';
import { loadUsersAsync } from '@/lib/server/users';


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
  use_zalo?: boolean;
  referral_code?: string;
  created_by_id?: string;
  created_by_name?: string;
  seller_id?: string;
  seller_name?: string;
  assigned_care_id?: string;
  assigned_care_name?: string;
};

const VALID_PAYMENT = ['qr', 'cash'];
const VALID_DELIVERY = ['pickup', 'delivery'];
const STAFF_ROLES = ['admin', 'tech_manager', 'sales_manager', 'technician'];

/** Chỉ staff đã đăng nhập bằng session hợp lệ mới được xem/cập nhật đơn.
 *  KHÔNG tin x-staff-role/Referer — giả được bằng curl, từng làm lộ đơn hàng. */
function isStaff(request: NextRequest): boolean {
  return requireStaff(request) !== null;
}

/**
 * Ưu tiên service-role client (bỏ qua RLS) để ghi/đọc đơn hàng luôn thành công;
 * fallback về anon client nếu chưa cấu hình server key.
 */
function getDb() {
  const serverSb = getServerSupabase();
  if (serverSb) return serverSb;
  if (isSupabaseConfigured() && supabase) return supabase;
  return null;
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
    process.env.RESEND_REPLY_TO || 'p.nhatthanh87@gmail.com',
    'sales01@vitinhantam.com',
    'tech01@vitinhantam.com',
  ];
  const serverSb = getServerSupabase();
  if (serverSb) {
    try {
      const { data } = await serverSb
        .from('users')
        .select('email')
        .in('role', STAFF_ROLES)
        .eq('status', 'active');
      if (data && data.length > 0) {
        recipients = data.map((u: { email: string }) => u.email).filter(Boolean);
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
        from: process.env.RESEND_FROM_EMAIL || 'Vi Tính An Tâm <hotro@vitinhantam.com>',
        to: recipients,
        reply_to: process.env.RESEND_REPLY_TO || 'p.nhatthanh87@gmail.com',
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
  if (!rateLimit(request, 'order-create', 10, 10 * 60 * 1000)) {
    return NextResponse.json(
      { success: false, message: 'Bạn đã gửi quá nhiều đơn trong thời gian ngắn. Vui lòng thử lại sau.' },
      { status: 429 }
    );
  }
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
    const useZalo = Boolean(body.use_zalo);
    const rawNote = (body.note || '').trim();

    const referralCode = (body.referral_code || '').trim() || 'Khách vãng lai';
    const createdById = body.created_by_id || null;
    const createdByName = body.created_by_name || null;

    let matchedUser = null;
    if (referralCode !== 'Khách vãng lai' && (!body.seller_id || !body.seller_name)) {
      try {
        const allUsers = await loadUsersAsync();
        const codeClean = referralCode.trim().toLowerCase();
        matchedUser = allUsers.find(
          (u) =>
            (u.referral_code && u.referral_code.toLowerCase() === codeClean) ||
            (u.username && u.username.toLowerCase() === codeClean) ||
            (u.id && u.id.toLowerCase() === codeClean)
        );
      } catch (err) {
        console.warn('Lỗi tìm kiếm nhân viên theo mã giới thiệu:', err);
      }
    }

    // Chỉ nhân viên đã đăng nhập mới được tự khai người bán/CSKH.
    // Khách công khai chỉ ghi nhận được qua mã giới thiệu khớp với nhân viên thật —
    // tránh giả mạo ghi công bán hàng cho người khác.
    const staffSession = getSession(request);
    const sellerId = staffSession
      ? body.seller_id || createdById || (matchedUser ? matchedUser.id : null)
      : matchedUser
        ? matchedUser.id
        : null;
    const sellerName = staffSession
      ? body.seller_name || createdByName || (matchedUser ? matchedUser.name : referralCode !== 'Khách vãng lai' ? referralCode : null)
      : matchedUser
        ? matchedUser.name
        : null;
    const assignedCareId = staffSession ? body.assigned_care_id || createdById || (matchedUser ? matchedUser.id : null) : matchedUser ? matchedUser.id : null;
    const assignedCareName = staffSession ? body.assigned_care_name || createdByName || (matchedUser ? matchedUser.name : null) : matchedUser ? matchedUser.name : null;

    // Giá bán KHÔNG tin dữ liệu client: nếu có mã máy (device_tag) khớp kho,
    // luôn lấy giá thật từ DB (giá khuyến mãi nếu có, không thì giá niêm yết).
    let verifiedPrice = Number(body.device_price) || 0;
    const deviceTag = (body.device_tag || '').trim();
    if (deviceTag) {
      const priceDb = getDb();
      if (priceDb) {
        try {
          const { data: inv } = await priceDb
            .from('inventory_items')
            .select('retail_price, sale_price, price')
            .eq('service_tag', deviceTag)
            .limit(1)
            .maybeSingle();
          if (inv) {
            const dbPrice = Number(inv.sale_price) > 0 ? Number(inv.sale_price) : Number(inv.retail_price) || Number(inv.price) || 0;
            if (dbPrice > 0) verifiedPrice = dbPrice;
          }
        } catch (err) {
          console.warn('Không đối chiếu được giá từ kho:', err);
        }
      }
    }

    const extraTags = [
      `[Người GT: ${referralCode}]`,
      sellerName ? `[Người bán: ${sellerName}]` : '',
      assignedCareName ? `[CSKH: ${assignedCareName}]` : '',
    ].filter(Boolean).join(' ');

    const finalNote = [
      rawNote,
      useZalo ? '[Khách dùng Zalo]' : '',
      extraTags,
    ].filter(Boolean).join(' • ');

    const order: Record<string, unknown> = {
      order_code: orderCode,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_address: (body.customer_address || '').trim(),
      device_name: deviceName,
      device_price: verifiedPrice,
      device_tag: deviceTag,
      payment_method: body.payment_method,
      delivery_method: body.delivery_method,
      note: finalNote,
      status: 'pending',
      referral_code: referralCode,
      created_by_id: createdById,
      created_by_name: createdByName,
      seller_id: sellerId,
      seller_name: sellerName,
      assigned_care_id: assignedCareId,
      assigned_care_name: assignedCareName,
    };

    let savedId: string | null = null;
    let source = 'fallback';

    const db = getDb();
    if (db) {
      try {
        let { data, error } = await db.from('orders').insert([order]).select('id').single();
        if (error && error.message?.includes('column')) {
          // Fallback if some new columns are not yet in Supabase SQL schema
          const safeOrder: Record<string, unknown> = {
            order_code: orderCode,
            customer_name: customerName,
            customer_phone: customerPhone,
            customer_address: (body.customer_address || '').trim(),
            device_name: deviceName,
            device_price: verifiedPrice,
            device_tag: deviceTag,
            payment_method: body.payment_method,
            delivery_method: body.delivery_method,
            note: finalNote,
            status: 'pending',
          };
          const retry = await db.from('orders').insert([safeOrder]).select('id').single();
          data = retry.data;
          error = retry.error;
        }

        if (!error && data) {
          savedId = data.id;
          source = 'supabase';

          // Thông báo đồng thời đến sales / admin / kỹ thuật
          const notification = {
            type: 'order',
            title: `Đơn hàng mới ${orderCode}${useZalo ? ' (Zalo)' : ''}`,
            body: `${customerName} (${customerPhone}) đặt ${deviceName} — ${
              order.delivery_method === 'delivery' ? 'giao tận nơi' : 'nhận tại cửa hàng'
            }.${useZalo ? ' Khách có dùng Zalo.' : ''} Cần xác nhận.`,
            reference_id: data.id,
            read: false,
          };
          try {
            await db.from('notifications').insert([notification]);
          } catch {
            // Không chặn đơn hàng nếu thông báo DB lỗi
          }

          // Gửi email nội bộ (best-effort)
          notifyStaffByEmail({ ...order, id: data.id }).catch(() => undefined);
        } else if (error) {
          console.error('Supabase order insert error:', error.message, error);
        }
      } catch (err) {
        console.error('Supabase order insert failed, using fallback:', err);
      }
    }

    if (source === 'fallback') {
      const fallbackOrder = { id: `local-${Date.now()}`, ...order, created_at: new Date().toISOString() };
      writeFallbackOrder(fallbackOrder);
      savedId = fallbackOrder.id as string;
      // Vẫn cố gắng gửi email thông báo
      notifyStaffByEmail(fallbackOrder).catch(() => undefined);
    }
    // Gửi thông báo Webhook & Zalo Bot tự động đến nhóm nội bộ
    try {
      await dispatchSystemEvent('new_order', {
        orderCode,
        customerName,
        customerPhone,
        shippingAddress: (body.customer_address || '').trim() || (order.delivery_method === 'pickup' ? 'Nhận tại quầy' : 'Giao tận nơi'),
        totalAmount: Number(body.device_price) || 0,
        paymentMethod: order.payment_method === 'qr' ? 'Chuyển khoản VietQR' : 'Tiền mặt khi nhận hàng',
        deviceName,
        useZalo,
        note: (body.note || '').trim(),
      });
    } catch (err) {
      console.warn('Zalo Bot / Webhook order notification error:', err);
    }


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
  // Nhân viên hiện trường (KTV thuê ngoài, NVKD) cũng được xem đơn —
  // nhưng CHỈ các đơn giao hàng gán cho chính mình (phục vụ mục "Giao máy
  // tận nơi" trong trang Thống kê hiệu quả kinh doanh). Cùng cách siết
  // phạm vi như /api/dispatches; nhân viên nội bộ xem toàn bộ như trước.
  const session = getSession(request);
  const isStaffSession =
    !!session && (STAFF_ROLES as readonly string[]).includes(session.role);
  const isFieldSession =
    !!session && (['outsourced', 'salesman'] as readonly string[]).includes(session.role);
  if (!isStaffSession && !isFieldSession) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Chỉ admin, sales và kỹ thuật mới có quyền xem danh sách đơn hàng.' },
      { status: 403 }
    );
  }

  const status = request.nextUrl.searchParams.get('status');
  let rows: Array<Record<string, unknown>> = [];

  const db = getDb();
  if (db) {
    try {
      let query = db.from('orders').select('*').order('created_at', { ascending: false });
      if (status) query = query.eq('status', status);
      if (isFieldSession && session) {
        query = query.eq('delivery_staff_id', session.sub).eq('delivery_method', 'delivery');
      }
      const { data, error } = await query.limit(100);
      if (!error && data) {
        rows = data as Array<Record<string, unknown>>;
      } else if (error) {
        console.warn('Supabase orders select error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase orders select failed:', err);
    }
  }

  // Merge đơn còn nằm trong file fallback (id bắt đầu bằng 'local-') để không bỏ sót.
  // Chỉ áp dụng cho nhân viên nội bộ — đơn fallback không mang delivery_staff_id
  // nên không được lọt vào phạm vi của nhân viên hiện trường.
  if (isStaffSession) {
    const seenCodes = new Set(rows.map((o) => String(o.order_code || '')));
    for (const o of readFallbackOrders()) {
      if (seenCodes.has(String(o.order_code || ''))) continue;
      if (status && o.status !== status) continue;
      rows.push(o);
    }
  }
  rows.sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));

  const normalizedRows = rows.map((r) => {
    const noteStr = String(r.note || '');
    let referralCode = r.referral_code;
    let sellerName = r.seller_name;
    let assignedCareName = r.assigned_care_name;

    if (!referralCode) {
      const match = noteStr.match(/\[Người GT:\s*([^\]]+)\]/);
      if (match) referralCode = match[1].trim();
      else referralCode = 'Khách vãng lai';
    }
    if (!sellerName) {
      const match = noteStr.match(/\[Người bán:\s*([^\]]+)\]/);
      if (match) sellerName = match[1].trim();
    }
    if (!assignedCareName) {
      const match = noteStr.match(/\[CSKH:\s*([^\]]+)\]/);
      if (match) assignedCareName = match[1].trim();
    }

    return {
      ...r,
      referral_code: referralCode,
      seller_name: sellerName,
      assigned_care_name: assignedCareName,
    };
  });

  return NextResponse.json({
    success: true,
    total: normalizedRows.length,
    data: normalizedRows,
    source: db ? 'supabase+fallback' : 'fallback',
  });
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
    const body = (await request.json()) as {
      id?: string;
      status?: string;
      matched_device_tag?: string;
      assigned_care_id?: string;
      assigned_care_name?: string;
      delivery_method?: string;
      delivery_staff_id?: string;
      delivery_staff_name?: string;
      delivery_fee?: number;
      customer_address?: string;
      note?: string;
    };

    if (!body.id) {
      return NextResponse.json(
        { success: false, message: 'Thiếu id đơn hàng.' },
        { status: 400 }
      );
    }

    const allowed = ['confirmed', 'processing', 'completed', 'cancelled'];
    if (body.status && !allowed.includes(body.status)) {
      return NextResponse.json(
        { success: false, message: 'Trạng thái không hợp lệ.' },
        { status: 400 }
      );
    }

    // Kiểm tra quyền: Chỉ admin mới có quyền thay đổi người chăm sóc khách hàng
    const session = verifySession(request.cookies.get(SESSION_COOKIE)?.value);
    const isAdmin = session?.role === 'admin';

    if ((body.assigned_care_id !== undefined || body.assigned_care_name !== undefined) && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Chỉ admin mới có quyền thay đổi người chăm sóc khách hàng.' },
        { status: 403 }
      );
    }

    const patchData: Record<string, unknown> = {};
    if (body.status) {
      patchData.status = body.status;
      patchData.confirmed_by = session?.name || 'staff';
      patchData.confirmed_at = new Date().toISOString();
    }
    if (body.assigned_care_id !== undefined) {
      patchData.assigned_care_id = body.assigned_care_id;
    }
    if (body.assigned_care_name !== undefined) {
      patchData.assigned_care_name = body.assigned_care_name;
    }
    if (body.delivery_method !== undefined) {
      patchData.delivery_method = body.delivery_method;
    }
    if (body.delivery_staff_id !== undefined) {
      patchData.delivery_staff_id = body.delivery_staff_id;
    }
    if (body.delivery_staff_name !== undefined) {
      patchData.delivery_staff_name = body.delivery_staff_name;
    }
    if (body.delivery_fee !== undefined) {
      patchData.delivery_fee = body.delivery_fee;
    }
    if (body.customer_address !== undefined) {
      patchData.customer_address = body.customer_address;
    }
    if (body.note !== undefined) {
      patchData.note = body.note;
    }

    const db = getDb();
    if (db) {
      try {
        const { data: orderData } = await db
          .from('orders')
          .select('*')
          .eq('id', body.id)
          .single();

        let { error } = await db
          .from('orders')
          .update(patchData)
          .eq('id', body.id);

        if (error && error.message?.includes('column')) {
          const safePatch: Record<string, unknown> = {};
          if (body.status) {
            safePatch.status = body.status;
            safePatch.confirmed_by = session?.name || 'staff';
            safePatch.confirmed_at = new Date().toISOString();
          }
          if (body.assigned_care_name) {
            safePatch.note = `${orderData?.note || ''} • [CSKH: ${body.assigned_care_name}]`;
          }
          const retry = await db.from('orders').update(safePatch).eq('id', body.id);
          error = retry.error;
        }

        if (!error) {
          // Tự động đồng bộ trạng thái máy trong kho
          const deviceTag = body.matched_device_tag || orderData?.device_tag;
          if (deviceTag && body.status) {
            if (body.status === 'confirmed' || body.status === 'processing') {
              await db
                .from('inventory_items')
                .update({
                  qc_status: 'reserved',
                  customer_name: orderData?.customer_name,
                  customer_phone: orderData?.customer_phone,
                  reserved_order_code: orderData?.order_code,
                  reserved_order_id: body.id,
                  reserved_delivery_method: orderData?.delivery_method,
                  reserved_at: new Date().toISOString(),
                })
                .eq('service_tag', deviceTag);
            } else if (body.status === 'cancelled') {
              await db
                .from('inventory_items')
                .update({
                  qc_status: 'ready_to_sell',
                  customer_name: null,
                  customer_phone: null,
                  reserved_order_code: null,
                  reserved_order_id: null,
                })
                .eq('service_tag', deviceTag);
            }
          }
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
          if (body.status) {
            target.status = body.status;
            target.confirmed_by = session?.name || 'staff';
            target.confirmed_at = new Date().toISOString();
          }
          if (body.assigned_care_id !== undefined) {
            target.assigned_care_id = body.assigned_care_id;
          }
          if (body.assigned_care_name !== undefined) {
            target.assigned_care_name = body.assigned_care_name;
          }
          if (body.delivery_method !== undefined) {
            target.delivery_method = body.delivery_method;
          }
          if (body.delivery_staff_id !== undefined) {
            target.delivery_staff_id = body.delivery_staff_id;
          }
          if (body.delivery_staff_name !== undefined) {
            target.delivery_staff_name = body.delivery_staff_name;
          }
          if (body.delivery_fee !== undefined) {
            target.delivery_fee = body.delivery_fee;
          }
          if (body.note !== undefined) {
            target.note = body.note;
          }
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
