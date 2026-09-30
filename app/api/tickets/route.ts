import { NextRequest, NextResponse } from 'next/server';
import { initialTickets } from '@/lib/mockData';
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
    } catch {
      // Fallback
    }
  }

  return NextResponse.json({
    success: true,
    total: initialTickets.length,
    data: initialTickets,
    source: 'fallback',
  });
}

