import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/server/supabaseAdmin';
import { requireStaff } from '@/lib/server/auth';

// Chỉ chấp nhận session cookie đã ký. KHÔNG tin x-staff-role/Referer:
// cả hai đều giả được bằng curl và từng khiến toàn bộ kho key bị lộ.
function isStaff(request: NextRequest): boolean {
  return requireStaff(request) !== null;
}

// GET /api/keys — Tải toàn bộ danh mục key, kho key, và yêu cầu cấp key từ Supabase
export async function GET(request: NextRequest) {
  if (!isStaff(request)) {
    return NextResponse.json({ error: 'Forbidden', message: 'Không có quyền truy cập kho key.' }, { status: 403 });
  }

  const db = getServerSupabase();
  if (!db) {
    return NextResponse.json({ success: false, message: 'Chưa cấu hình Supabase Server Key' }, { status: 500 });
  }

  try {
    const [catsRes, keysRes, reqsRes] = await Promise.all([
      db.from('key_categories').select('*').order('created_at', { ascending: true }),
      db.from('license_keys').select('*').order('created_at', { ascending: false }),
      db.from('key_release_requests').select('*').order('created_at', { ascending: false }),
    ]);

    return NextResponse.json({
      success: true,
      categories: catsRes.data || [],
      keys: keysRes.data || [],
      requests: reqsRes.data || [],
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Lỗi tải dữ liệu key';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

// POST /api/keys — Thêm key đơn lẻ, thêm batch, thêm category, tạo yêu cầu cấp key
export async function POST(request: NextRequest) {
  if (!isStaff(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const db = getServerSupabase();
  if (!db) {
    return NextResponse.json({ success: false, message: 'Chưa cấu hình Supabase' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'add_key' && body.key) {
      const { data, error } = await db.from('license_keys').insert([body.key]).select('*').single();
      if (error) throw error;
      return NextResponse.json({ success: true, key: data });
    }

    if (action === 'add_batch' && Array.isArray(body.keys)) {
      const { data, error } = await db.from('license_keys').insert(body.keys).select('*');
      if (error) throw error;
      return NextResponse.json({ success: true, keys: data, count: data?.length || 0 });
    }

    if (action === 'add_category' && body.category) {
      const { data, error } = await db.from('key_categories').upsert([body.category]).select('*').single();
      if (error) throw error;
      return NextResponse.json({ success: true, category: data });
    }

    if (action === 'create_request' && body.request) {
      const { data, error } = await db.from('key_release_requests').upsert([body.request]).select('*').single();
      if (error) throw error;
      return NextResponse.json({ success: true, request: data });
    }

    return NextResponse.json({ success: false, message: 'Hành động không hợp lệ' }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Lỗi xử lý key';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

// PATCH /api/keys — Cập nhật key hoặc yêu cầu cấp key
export async function PATCH(request: NextRequest) {
  if (!isStaff(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const db = getServerSupabase();
  if (!db) {
    return NextResponse.json({ success: false, message: 'Chưa cấu hình Supabase' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { action, id, data } = body;

    // Cập nhật giá hàng loạt cho mọi key đang SẴN SÀNG của một phân loại
    if (action === 'bulk_update_prices') {
      const categoryId = typeof body.category_id === 'string' ? body.category_id : '';
      const importPrice = Number(body.import_price);
      const unitPrice = Number(body.unit_price);
      if (!categoryId || !Number.isFinite(importPrice) || !Number.isFinite(unitPrice) || importPrice < 0 || unitPrice < 0) {
        return NextResponse.json({ success: false, message: 'Thiếu phân loại hoặc giá không hợp lệ' }, { status: 400 });
      }
      const { data: updated, error } = await db
        .from('license_keys')
        .update({ import_price: importPrice, unit_price: unitPrice })
        .eq('category_id', categoryId)
        .eq('status', 'available')
        .select('id');
      if (error) throw error;
      return NextResponse.json({ success: true, count: updated?.length || 0 });
    }

    // Hiệu chỉnh giá ĐỒNG LOẠT (công cụ riêng ở trang Quản lý key):
    // phạm vi = 1 phân loại hoặc tất cả; chỉ key đang SẴN SÀNG.
    // mode 'set': đặt giá cố định (trường null = giữ nguyên; 0 = hiển thị "Liên hệ").
    // mode 'percent': tăng/giảm theo % trên giá hiện tại (trường null = giữ
    // nguyên), kết quả làm tròn đến hàng nghìn đồng.
    if (action === 'bulk_adjust_prices') {
      const categoryId =
        typeof body.category_id === 'string' && body.category_id ? body.category_id : null;
      const mode = body.mode === 'percent' ? 'percent' : 'set';
      const rawImport = body.import_price;
      const rawUnit = body.unit_price;
      const importVal =
        rawImport === null || rawImport === undefined || rawImport === '' ? null : Number(rawImport);
      const unitVal =
        rawUnit === null || rawUnit === undefined || rawUnit === '' ? null : Number(rawUnit);
      if (importVal === null && unitVal === null) {
        return NextResponse.json(
          { success: false, message: 'Chưa nhập giá trị hiệu chỉnh nào' },
          { status: 400 }
        );
      }
      if (
        (importVal !== null && !Number.isFinite(importVal)) ||
        (unitVal !== null && !Number.isFinite(unitVal)) ||
        (mode === 'set' && ((importVal !== null && importVal < 0) || (unitVal !== null && unitVal < 0))) ||
        (mode === 'percent' && ((importVal !== null && importVal <= -100) || (unitVal !== null && unitVal <= -100)))
      ) {
        return NextResponse.json({ success: false, message: 'Giá trị hiệu chỉnh không hợp lệ' }, { status: 400 });
      }

      let query = db
        .from('license_keys')
        .select('id, import_price, unit_price')
        .eq('status', 'available');
      if (categoryId) query = query.eq('category_id', categoryId);
      const { data: keys, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      if (!keys || keys.length === 0) {
        return NextResponse.json({ success: true, count: 0, updated: [] });
      }

      const roundThousand = (v: number) => Math.max(0, Math.round(v / 1000) * 1000);
      const updated: { id: string; import_price: number; unit_price: number }[] = [];
      for (const k of keys) {
        const oldImport = Number(k.import_price) || 0;
        const oldUnit = Number(k.unit_price) || 0;
        const newImport =
          importVal === null
            ? oldImport
            : mode === 'set'
              ? importVal
              : roundThousand(oldImport * (1 + importVal / 100));
        const newUnit =
          unitVal === null
            ? oldUnit
            : mode === 'set'
              ? unitVal
              : roundThousand(oldUnit * (1 + unitVal / 100));
        if (newImport === oldImport && newUnit === oldUnit) continue;
        const { error: updError } = await db
          .from('license_keys')
          .update({ import_price: newImport, unit_price: newUnit })
          .eq('id', k.id);
        if (updError) throw updError;
        updated.push({ id: k.id, import_price: newImport, unit_price: newUnit });
      }
      return NextResponse.json({ success: true, count: updated.length, updated });
    }

    if (!id || !data) {
      return NextResponse.json({ success: false, message: 'Thiếu id hoặc dữ liệu cập nhật' }, { status: 400 });
    }

    if (action === 'update_key') {
      const { error } = await db.from('license_keys').update(data).eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'update_request') {
      const { error } = await db.from('key_release_requests').update(data).eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, message: 'Hành động không hợp lệ' }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Lỗi cập nhật key';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

// DELETE /api/keys — Xóa key hoặc phân loại
export async function DELETE(request: NextRequest) {
  if (!isStaff(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const db = getServerSupabase();
  if (!db) {
    return NextResponse.json({ success: false, message: 'Chưa cấu hình Supabase' }, { status: 500 });
  }

  try {
    let action: string | null = null;
    let id: string | null = null;

    const { searchParams } = new URL(request.url);
    action = searchParams.get('action');
    id = searchParams.get('id');

    if (!id) {
      try {
        const body = await request.json();
        action = body.action || action;
        id = body.id || id;
      } catch {
        // Body might be empty
      }
    }

    if (!id) {
      return NextResponse.json({ success: false, message: 'Thiếu id cần xóa' }, { status: 400 });
    }

    if (action === 'delete_key') {
      const { error } = await db.from('license_keys').delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'delete_category') {
      const { error } = await db.from('key_categories').delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, message: 'Hành động không hợp lệ' }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Lỗi xóa key';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
