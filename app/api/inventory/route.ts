import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/server/supabaseAdmin';

// Protected API.
// `x-user-role` do proxy.ts đặt TỪ SESSION ĐÃ KÝ và đè lên mọi giá trị client gửi lên.
function isAuthorized(request: NextRequest): boolean {
  return request.headers.get('x-user-role') === 'admin';
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        error: 'Forbidden',
        message: 'Quyền bị từ chối: Chỉ Quản trị viên (Admin) mới có quyền truy cập trực tiếp API này.',
      },
      { status: 403 }
    );
  }

  const supabase = getServerSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('inventory_items').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        return NextResponse.json({
          success: true,
          total: data.length,
          data,
          source: 'supabase',
        });
      }
      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi truy vấn cơ sở dữ liệu Supabase';
      return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
  }

  return NextResponse.json({
    success: true,
    total: 0,
    data: [],
    source: 'supabase',
  });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        error: 'Forbidden',
        message: 'Quyền bị từ chối: Chỉ Quản trị viên (Admin) mới có quyền tạo mới thiết bị qua API.',
      },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    return NextResponse.json(
      {
        success: true,
        message: 'Đã nhận yêu cầu thêm thiết bị mới',
        item: { ...body, id: crypto.randomUUID() },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid request payload';
    return NextResponse.json({ error: 'Bad Request', message }, { status: 400 });
  }
}
