import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/server/supabaseAdmin';
import { requireStaff } from '@/lib/server/auth';
import { rateLimit } from '@/lib/server/rateLimit';

// API ca cứu hộ onsite (điều phối KTV). Mọi thao tác đều cần session
// nhân viên; ghi/đọc qua server client (service role) giống /api/users
// và /api/tickets — đường ghi trực tiếp từ trình duyệt qua PostgREST
// đã chứng minh không đáng tin cậy trong thực tế (ca tạo trên bảng
// điều phối không lưu xuống DB, kiểm chứng live 2026-10-23), nên toàn
// bộ luồng dispatch đi qua route này.

const DISPATCH_COLUMNS = [
  'id',
  'ticket_code',
  'customer_name',
  'phone',
  'address',
  'area_zone',
  'scheduled_time',
  'distance_km',
  'estimated_arrival_minutes',
  'urgency',
  'status',
  'issue_summary',
  'issue_description',
  'technician_name',
  'technician_id',
  'technician_fee',
  'fee_synced_to_payroll',
  'created_at',
] as const;

function pickRow(body: Record<string, unknown>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const col of DISPATCH_COLUMNS) {
    if (body[col] !== undefined) row[col] = body[col];
  }
  // Phía app dùng customer_phone; bảng chỉ có cột phone.
  if (row.phone === undefined && typeof body.customer_phone === 'string' && body.customer_phone) {
    row.phone = body.customer_phone;
  }
  return row;
}

export async function GET(req: NextRequest) {
  if (!requireStaff(req)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }
  const db = getServerSupabase();
  if (!db) {
    return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 500 });
  }
  const { data, error } = await db
    .from('onsite_dispatches')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, total: data.length, data });
}

export async function POST(req: NextRequest) {
  if (!requireStaff(req)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }
  if (!rateLimit(req, 'dispatch-create', 30, 10 * 60 * 1000)) {
    return NextResponse.json(
      { success: false, error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' },
      { status: 429 }
    );
  }
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const row = pickRow(body);
  if (!row.customer_name || !row.address) {
    return NextResponse.json(
      { success: false, error: 'Thiếu tên khách hàng hoặc địa chỉ' },
      { status: 400 }
    );
  }
  if (!row.id) {
    row.id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `os-${Date.now()}`;
  }
  if (!row.status) row.status = 'pending';
  if (!row.created_at) row.created_at = new Date().toISOString();

  const db = getServerSupabase();
  if (!db) {
    return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 500 });
  }
  const { data, error } = await db.from('onsite_dispatches').insert([row]).select();
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, data: data?.[0] ?? row });
}

export async function PATCH(req: NextRequest) {
  if (!requireStaff(req)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const id = body.id;
  if (typeof id !== 'string' || !id) {
    return NextResponse.json({ success: false, error: 'Thiếu id ca' }, { status: 400 });
  }
  const updates = pickRow(body);
  delete updates.id;
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ success: false, error: 'Không có trường nào để cập nhật' }, { status: 400 });
  }
  const db = getServerSupabase();
  if (!db) {
    return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 500 });
  }
  const { data, error } = await db.from('onsite_dispatches').update(updates).eq('id', id).select();
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, data: data?.[0] ?? null });
}
