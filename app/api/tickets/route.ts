import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

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
        message: 'Quyền bị từ chối: Chỉ Quản trị viên (Admin) mới có quyền truy cập trực tiếp API phiếu sửa chữa.',
      },
      { status: 403 }
    );
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('service_tickets').select('*').order('created_at', { ascending: false });
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

