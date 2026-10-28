import { NextRequest, NextResponse } from 'next/server';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getServerSupabase } from '@/lib/server/supabaseAdmin';
import { requireStaff } from '@/lib/server/auth';
import { rateLimit } from '@/lib/server/rateLimit';
import { dispatchSystemEvent } from '@/lib/server/zaloBot';

// Chỉ tin session cookie đã ký. Header x-user-role/x-staff-role và Referer
// đều do client tự đặt được — không dùng làm căn cứ xác thực nữa.
function isStaff(req: NextRequest): boolean {
  return requireStaff(req) !== null;
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
  if (!rateLimit(req, 'ticket-create', 10, 10 * 60 * 1000)) {
    return NextResponse.json({ success: false, error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' }, { status: 429 });
  }
  try {
    const body = await req.json().catch(() => ({}));
    if (!body.customer_name || !body.customer_phone) {
      return NextResponse.json({ success: false, error: 'Thiếu tên hoặc SĐT' }, { status: 400 });
    }
    // Khách công khai chỉ được tạo phiếu ở trạng thái tiếp nhận, không được
    // tự gán kỹ thuật viên/trạng thái xử lý. Nhân viên có session thì giữ nguyên.
    const staff = isStaff(req);
    const code = body.ticket_code || `#TK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const ticket: Record<string, unknown> = {
      id: body.id || (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `tk-${Date.now()}`),
      ticket_code: code,
      customer_name: String(body.customer_name).trim(),
      customer_phone: String(body.customer_phone).trim(),
      customer_address: body.customer_address?.trim() || '',
      device_name: body.device_name?.trim() || body.device_model?.trim() || 'Máy tính / Laptop',
      device_model: body.device_model?.trim() || undefined,
      service_tag: body.service_tag?.trim() || undefined,
      reception_mode: body.reception_mode || (body.ticket_type === 'onsite' ? 'mobile' : 'counter'),
      ticket_type: body.ticket_type || 'counter',
      issue_description: body.issue_description?.trim() || 'Kiểm tra máy tổng quát',
      issueDescription: body.issueDescription?.trim() || body.issue_description?.trim() || undefined,
      estimated_cost: Number(body.estimated_cost) || 100000,
      total_amount: Number(body.total_amount) || Number(body.estimated_cost) || 100000,
      dispatch_address: body.ticket_type === 'onsite' ? (body.customer_address || '') : undefined,
      technician_name: staff ? body.technician_name || 'KTV Trực ca Tiếp nhận' : 'KTV Trực ca Tiếp nhận',
      // Giữ đủ các trường phiếu mà form tạo gửi lên: trước đây bản ghi qua
      // API này làm rớt linh kiện/phí/tên máy (parts_used rỗng, phí mất),
      // phiếu mới tạo tải lại trang là hiện 0đ dù lúc tạo hiện 150k.
      parts_used: Array.isArray(body.parts_used) ? body.parts_used : [],
      selected_services: Array.isArray(body.selected_services) ? body.selected_services : [],
      technician_fee: Number(body.technician_fee) || 0,
      fee_synced_to_payroll: body.fee_synced_to_payroll === true,
      service_category: body.service_category || 'sua_chua',
      warranty_duration_months: Number.isFinite(Number(body.warranty_duration_months))
        ? Number(body.warranty_duration_months)
        : undefined,
      warranty_until: body.warranty_until || undefined,
      visual_condition: body.visual_condition || 'Tiếp nhận qua hệ thống đặt lịch Online',
      status: staff ? body.status || 'received' : 'received',
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

