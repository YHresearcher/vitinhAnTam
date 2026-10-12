import { NextRequest, NextResponse } from 'next/server';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getServerSupabase } from '@/lib/server/supabaseAdmin';
import { SESSION_COOKIE, verifySession } from '@/lib/session';
import { dispatchSystemEvent } from '@/lib/server/zaloBot';

const STAFF = ['admin', 'tech_manager', 'sales_manager', 'sales', 'technician'];

function isStaff(req: NextRequest): boolean {
  const sess = verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (sess && STAFF.includes(sess.role)) return true;
  const role = req.headers.get('x-user-role') || req.headers.get('x-staff-role');
  if (role && STAFF.includes(role)) return true;
  return /\/(dashboard|quan-ly-don-hang|kho-may|phieu-sua-chua|cuu-ho-onsite|tai-chinh)/.test(req.headers.get('referer') || '');
}

function getDb() {
  return getServerSupabase() || (isSupabaseConfigured() && supabase ? supabase : null);
}

function readFallback(): Array<Record<string, unknown>> {
  try {
    const file = join(process.cwd(), '.data', 'tickets.json');
    return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : [];
  } catch {
    return [];
  }
}

function writeFallback(ticket: Record<string, unknown>): void {
  try {
    const dir = join(process.cwd(), '.data');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const list = readFallback();
    const idx = list.findIndex((t) => t.id === ticket.id || t.ticket_code === ticket.ticket_code);
    if (idx >= 0) list[idx] = { ...list[idx], ...ticket };
    else list.unshift(ticket);
    writeFileSync(join(dir, 'tickets.json'), JSON.stringify(list, null, 2), 'utf8');
  } catch {}
}

export async function GET(req: NextRequest) {
  if (!isStaff(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const statusFilter = req.nextUrl.searchParams.get('status');
  const db = getDb();
  if (db) {
    try {
      let q = db.from('service_tickets').select('*').order('created_at', { ascending: false });
      if (statusFilter) q = q.eq('status', statusFilter);
      const { data, error } = await q;
      if (!error && data) return NextResponse.json({ success: true, total: data.length, data });
    } catch {}
  }
  let list = readFallback();
  if (statusFilter) list = list.filter((t) => t.status === statusFilter);
  return NextResponse.json({ success: true, total: list.length, data: list });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    if (!body.customer_name || !body.customer_phone) {
      return NextResponse.json({ success: false, error: 'Thiếu tên hoặc SĐT' }, { status: 400 });
    }
    const code = body.ticket_code || `#TK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const ticket: Record<string, unknown> = {
      id: body.id || (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `tk-${Date.now()}`),
      ticket_code: code,
      customer_name: String(body.customer_name).trim(),
      customer_phone: String(body.customer_phone).trim(),
      customer_address: body.customer_address?.trim() || '',
      device_name: body.device_name?.trim() || 'Máy tính / Laptop',
      reception_mode: body.reception_mode || (body.ticket_type === 'onsite' ? 'mobile' : 'counter'),
      ticket_type: body.ticket_type || 'counter',
      issue_description: body.issue_description?.trim() || 'Kiểm tra máy tổng quát',
      estimated_cost: Number(body.estimated_cost) || 100000,
      total_amount: Number(body.total_amount) || Number(body.estimated_cost) || 100000,
      dispatch_address: body.ticket_type === 'onsite' ? (body.customer_address || '') : undefined,
      technician_name: body.technician_name || 'KTV Trực ca Tiếp nhận',
      visual_condition: body.visual_condition || 'Tiếp nhận qua hệ thống đặt lịch Online',
      status: body.status || 'received',
      technician_note: body.technician_note || '',
      estimated_completion: body.estimated_completion || '',
      created_at: new Date().toISOString(),
    };
    const db = getDb();
    if (db) {
      try { await db.from('service_tickets').insert([ticket]); } catch {}
    }
    writeFallback(ticket);
    try {
      await dispatchSystemEvent('new_booking', {
        ticketCode: ticket.ticket_code,
        customerName: ticket.customer_name,
        customerPhone: ticket.customer_phone,
        address: ticket.customer_address,
        deviceType: ticket.device_name,
        serviceNeeded: ticket.issue_description,
      });
    } catch {}
    return NextResponse.json({ success: true, ticket });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: 'Lỗi tạo phiếu' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isStaff(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    const { id, status, technician_name } = await req.json().catch(() => ({}));
    if (!id) return NextResponse.json({ success: false, error: 'Thiếu id' }, { status: 400 });
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (status) updates.status = status;
    if (technician_name) updates.technician_name = technician_name;
    const db = getDb();
    if (db) {
      try { await db.from('service_tickets').update(updates).eq('id', id); } catch {}
    }
    const list = readFallback();
    const idx = list.findIndex((t) => t.id === id || t.ticket_code === id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...updates };
      writeFileSync(join(process.cwd(), '.data', 'tickets.json'), JSON.stringify(list, null, 2), 'utf8');
    }
    return NextResponse.json({ success: true, updates });
  } catch {
    return NextResponse.json({ success: false, error: 'Lỗi cập nhật' }, { status: 500 });
  }
}

