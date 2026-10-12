import { NextRequest, NextResponse } from 'next/server';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getServerSupabase } from '@/lib/server/supabaseAdmin';

/**
 * Đọc đơn hàng từ fallback local file
 */
function readFallbackOrders(): Array<Record<string, unknown>> {
  try {
    const file = join(process.cwd(), '.data', 'orders.json');
    if (!existsSync(file)) return [];
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return [];
  }
}

function normalizePhoneDigits(phone: unknown): string {
  if (!phone || typeof phone !== 'string') return '';
  return phone.replace(/\D/g, '');
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();

  if (!q) {
    return NextResponse.json({ error: 'Query parameter q is required' }, { status: 400 });
  }

  const rawDigits = q.replace(/\D/g, '');
  const isPhoneSearch = rawDigits.length >= 7;
  const last7Digits = isPhoneSearch ? rawDigits.slice(-7) : '';
  const last9Digits = isPhoneSearch ? rawDigits.slice(-9) : '';

  // Ưu tiên Server Supabase (service-role) để vượt qua RLS
  const db = getServerSupabase() || (isSupabaseConfigured() && supabase ? supabase : null);

  if (db) {
    try {
      // 1. Tìm trong inventory_items (Máy tính, linh kiện xuất kho)
      let invQuery = db.from('inventory_items').select('*');
      if (isPhoneSearch) {
        invQuery = invQuery.or(
          `customer_phone.ilike.%${rawDigits}%,customer_phone.ilike.%${last7Digits}%,customer_phone.ilike.%${q}%`
        );
      } else {
        invQuery = invQuery.or(
          `service_tag.ilike.%${q}%,serial_number.ilike.%${q}%,device_model.ilike.%${q}%`
        );
      }

      // 2. Tìm trong service_tickets (Phiếu sửa chữa / tiếp nhận bảo hành)
      let tckQuery = db.from('service_tickets').select('*');
      if (isPhoneSearch) {
        tckQuery = tckQuery.or(
          `customer_phone.ilike.%${rawDigits}%,customer_phone.ilike.%${last7Digits}%,customer_phone.ilike.%${q}%`
        );
      } else {
        tckQuery = tckQuery.or(
          `ticket_code.ilike.%${q}%,device_service_tag.ilike.%${q}%,service_tag.ilike.%${q}%`
        );
      }

      // 3. Tìm trong customers (Danh sách khách hàng)
      const cusQuery = isPhoneSearch
        ? db.from('customers').select('*').or(`phone.ilike.%${rawDigits}%,phone.ilike.%${last7Digits}%,phone.ilike.%${q}%`)
        : db.from('customers').select('*').ilike('customer_code', `%${q}%`);

      // 4. Tìm trong orders (Đơn hàng đặt mua máy tính online)
      const ordQuery = isPhoneSearch
        ? db.from('orders').select('*').or(`customer_phone.ilike.%${rawDigits}%,customer_phone.ilike.%${last7Digits}%,customer_phone.ilike.%${q}%`)
        : db.from('orders').select('*').ilike('order_code', `%${q}%`);

      const [invRes, tckRes, cusRes, ordRes] = await Promise.all([
        invQuery.limit(5),
        tckQuery.limit(5),
        cusQuery.limit(5),
        ordQuery.limit(5),
      ]);

      const items = (invRes.data || []) as Array<Record<string, unknown>>;
      const tickets = (tckRes.data || []) as Array<Record<string, unknown>>;
      const customers = (cusRes.data || []) as Array<Record<string, unknown>>;
      const orders = (ordRes.data || []) as Array<Record<string, unknown>>;

      // Lọc chính xác hơn bằng JS nếu tìm theo số điện thoại
      let matchedItem = items.find((i) => {
        if (!isPhoneSearch) return true;
        const p = normalizePhoneDigits(i.customer_phone);
        return p && (p.includes(rawDigits) || rawDigits.includes(p) || p.slice(-7) === last7Digits);
      }) || items[0] || null;

      const matchedTicket = tickets.find((t) => {
        if (!isPhoneSearch) return true;
        const p = normalizePhoneDigits(t.customer_phone);
        return p && (p.includes(rawDigits) || rawDigits.includes(p) || p.slice(-7) === last7Digits);
      }) || tickets[0] || null;

      const matchedCustomer = customers.find((c) => {
        if (!isPhoneSearch) return true;
        const p = normalizePhoneDigits(c.phone);
        return p && (p.includes(rawDigits) || rawDigits.includes(p) || p.slice(-7) === last7Digits);
      }) || customers[0] || null;

      const matchedOrder = orders.find((o) => {
        if (!isPhoneSearch) return true;
        const p = normalizePhoneDigits(o.customer_phone);
        return p && (p.includes(rawDigits) || rawDigits.includes(p) || p.slice(-7) === last7Digits);
      }) || orders[0] || null;

      // Nếu có đơn hàng mà chưa có item, thử tìm item tương ứng theo device_tag của đơn hàng
      if (matchedOrder && !matchedItem && matchedOrder.device_tag) {
        const { data: tagItems } = await db
          .from('inventory_items')
          .select('*')
          .eq('service_tag', matchedOrder.device_tag)
          .limit(1);
        if (tagItems && tagItems.length > 0) {
          matchedItem = tagItems[0];
        }
      }

      if (matchedItem || matchedTicket || matchedCustomer || matchedOrder) {
        return NextResponse.json({
          found: true,
          query: q,
          source: 'supabase',
          data: {
            item: matchedItem,
            ticket: matchedTicket,
            customer: matchedCustomer,
            order: matchedOrder,
          },
        });
      }
    } catch (err: unknown) {
      console.warn('Supabase warranty search query error:', err);
    }
  }

  // Fallback: Kiểm tra đơn hàng trong file local (.data/orders.json)
  const localOrders = readFallbackOrders();
  const matchedLocalOrder = localOrders.find((o) => {
    if (isPhoneSearch) {
      const p = normalizePhoneDigits(o.customer_phone);
      return p && (p.includes(rawDigits) || rawDigits.includes(p) || p.slice(-7) === last7Digits);
    }
    const code = String(o.order_code || '').toUpperCase();
    const tag = String(o.device_tag || '').toUpperCase();
    return code.includes(q.toUpperCase()) || tag.includes(q.toUpperCase());
  });

  if (matchedLocalOrder) {
    return NextResponse.json({
      found: true,
      query: q,
      source: 'fallback',
      data: {
        order: matchedLocalOrder,
        customer: {
          full_name: matchedLocalOrder.customer_name,
          phone: matchedLocalOrder.customer_phone,
          address: matchedLocalOrder.customer_address,
        },
      },
    });
  }

  return NextResponse.json(
    { found: false, message: 'Không tìm thấy dữ liệu bảo hành cho thông tin đã nhập trong hệ thống.' },
    { status: 404 }
  );
}
