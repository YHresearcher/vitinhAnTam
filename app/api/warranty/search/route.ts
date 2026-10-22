import { NextRequest, NextResponse } from 'next/server';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getServerSupabase } from '@/lib/server/supabaseAdmin';
import { rateLimit } from '@/lib/server/rateLimit';

/**
 * Tra cứu bảo hành công khai (khách nhập SĐT hoặc mã máy/mã phiếu).
 *
 * BẢO MẬT: endpoint này không cần đăng nhập nên:
 * - Giới hạn tần suất theo IP để chống dò quét số điện thoại.
 * - Chỉ trả về các trường tối thiểu cần hiển thị cho khách — KHÔNG trả
 *   địa chỉ, giá vốn, hay toàn bộ bản ghi như trước.
 * - Số điện thoại được che, chỉ hiện 4 số cuối.
 * - Tìm theo SĐT yêu cầu khớp 9 số cuối trở lên; không còn fallback
 *   "trả bản ghi đầu tiên" khi không khớp.
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

function maskPhone(phone: unknown): string | null {
  const digits = normalizePhoneDigits(phone);
  if (!digits) return null;
  return `*******${digits.slice(-3)}`;
}

/** Loại ký tự có thể phá vỡ cú pháp bộ lọc PostgREST (.or / .ilike). */
function sanitizeQuery(q: string): string {
  return q.replace(/[,()*%'"\\]/g, '').trim().slice(0, 64);
}

type Row = Record<string, unknown>;

function pick(row: Row | null, fields: string[]): Row | null {
  if (!row) return null;
  const out: Row = {};
  for (const f of fields) {
    if (row[f] !== undefined) out[f] = row[f];
  }
  return out;
}

function sanitizeItem(row: Row | null): Row | null {
  const out = pick(row, [
    'id',
    'service_tag',
    'serial_number',
    'device_model',
    'brand',
    'customer_name',
    'handover_date',
    'warranty_months',
    'price',
    'retail_price',
    'qc_status',
  ]);
  if (out && row) out.customer_phone = maskPhone(row.customer_phone);
  return out;
}

function sanitizeTicket(row: Row | null): Row | null {
  const out = pick(row, [
    'id',
    'ticket_code',
    'customer_name',
    'device_name',
    'device_model',
    'device_service_tag',
    'service_tag',
    'status',
    'warranty_duration_months',
    'warranty_until',
    'created_at',
    'completed_at',
    'estimated_completion',
  ]);
  if (out && row) {
    out.customer_phone = maskPhone(row.customer_phone);
    const parts = Array.isArray(row.parts_used) ? (row.parts_used as Array<Row>) : null;
    if (parts) {
      out.parts_used = parts.map((p) => pick(p, ['part_name', 'quantity', 'warranty_months']) || {});
    }
  }
  return out;
}

function sanitizeCustomer(row: Row | null): Row | null {
  const out = pick(row, ['full_name', 'customer_code', 'customer_tier']);
  if (out && row) out.phone = maskPhone(row.phone);
  return out;
}

function sanitizeOrder(row: Row | null): Row | null {
  return pick(row, [
    'order_code',
    'customer_name',
    'device_name',
    'device_tag',
    'device_price',
    'status',
    'delivery_method',
    'payment_method',
    'created_at',
  ]);
}

export async function GET(request: NextRequest) {
  if (!rateLimit(request, 'warranty-search', 20, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Quá nhiều lượt tra cứu. Vui lòng thử lại sau ít phút.' },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const q = sanitizeQuery((searchParams.get('q') || '').trim());

  if (!q) {
    return NextResponse.json({ error: 'Query parameter q is required' }, { status: 400 });
  }

  const rawDigits = q.replace(/\D/g, '');
  const isPhoneSearch = rawDigits.length >= 9;
  const last9Digits = isPhoneSearch ? rawDigits.slice(-9) : '';

  const db = getServerSupabase() || (isSupabaseConfigured() && supabase ? supabase : null);

  if (db) {
    try {
      let invQuery = db.from('inventory_items').select('*');
      if (isPhoneSearch) {
        invQuery = invQuery.or(`customer_phone.ilike.%${rawDigits}%`);
      } else {
        invQuery = invQuery.or(`service_tag.ilike.%${q}%,serial_number.ilike.%${q}%,device_model.ilike.%${q}%`);
      }

      let tckQuery = db.from('service_tickets').select('*');
      if (isPhoneSearch) {
        tckQuery = tckQuery.or(`customer_phone.ilike.%${rawDigits}%`);
      } else {
        tckQuery = tckQuery.or(`ticket_code.ilike.%${q}%,device_service_tag.ilike.%${q}%,service_tag.ilike.%${q}%`);
      }

      const cusQuery = isPhoneSearch
        ? db.from('customers').select('*').or(`phone.ilike.%${rawDigits}%`)
        : db.from('customers').select('*').ilike('customer_code', `%${q}%`);

      const ordQuery = isPhoneSearch
        ? db.from('orders').select('*').or(`customer_phone.ilike.%${rawDigits}%`)
        : db.from('orders').select('*').ilike('order_code', `%${q}%`);

      const [invRes, tckRes, cusRes, ordRes] = await Promise.all([
        invQuery.limit(5),
        tckQuery.limit(5),
        cusQuery.limit(5),
        ordQuery.limit(5),
      ]);

      const items = (invRes.data || []) as Array<Row>;
      const tickets = (tckRes.data || []) as Array<Row>;
      const customers = (cusRes.data || []) as Array<Row>;
      const orders = (ordRes.data || []) as Array<Row>;

      const phoneMatch = (value: unknown): boolean => {
        const p = normalizePhoneDigits(value);
        return Boolean(p) && (p === rawDigits || p.slice(-9) === last9Digits);
      };

      let matchedItem = isPhoneSearch
        ? items.find((i) => phoneMatch(i.customer_phone)) || null
        : items[0] || null;

      const matchedTicket = isPhoneSearch
        ? tickets.find((t) => phoneMatch(t.customer_phone)) || null
        : tickets[0] || null;

      const matchedCustomer = isPhoneSearch
        ? customers.find((c) => phoneMatch(c.phone)) || null
        : customers[0] || null;

      const matchedOrder = isPhoneSearch
        ? orders.find((o) => phoneMatch(o.customer_phone)) || null
        : orders[0] || null;

      if (matchedOrder && !matchedItem && matchedOrder.device_tag) {
        const { data: tagItems } = await db
          .from('inventory_items')
          .select('*')
          .eq('service_tag', matchedOrder.device_tag)
          .limit(1);
        if (tagItems && tagItems.length > 0) {
          matchedItem = tagItems[0] as Row;
        }
      }

      if (matchedItem || matchedTicket || matchedCustomer || matchedOrder) {
        return NextResponse.json({
          found: true,
          query: q,
          source: 'supabase',
          data: {
            item: sanitizeItem(matchedItem),
            ticket: sanitizeTicket(matchedTicket),
            customer: sanitizeCustomer(matchedCustomer),
            order: sanitizeOrder(matchedOrder),
          },
        });
      }
    } catch (err: unknown) {
      console.warn('Supabase warranty search query error:', err);
    }
  }

  const localOrders = readFallbackOrders();
  const matchedLocalOrder = localOrders.find((o) => {
    if (isPhoneSearch) {
      const p = normalizePhoneDigits(o.customer_phone);
      return Boolean(p) && (p === rawDigits || p.slice(-9) === last9Digits);
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
        order: sanitizeOrder(matchedLocalOrder),
        customer: {
          full_name: matchedLocalOrder.customer_name,
          phone: maskPhone(matchedLocalOrder.customer_phone),
        },
      },
    });
  }

  return NextResponse.json(
    { found: false, message: 'Không tìm thấy dữ liệu bảo hành cho thông tin đã nhập trong hệ thống.' },
    { status: 404 }
  );
}
