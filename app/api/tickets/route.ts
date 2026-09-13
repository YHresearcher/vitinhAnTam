import { NextRequest, NextResponse } from 'next/server';
import { initialTickets } from '@/lib/mockData';

// Protected API - Only Admin can access
export async function GET(request: NextRequest) {
  const userRole = request.headers.get('x-user-role');

  if (userRole !== 'admin') {
    return NextResponse.json(
      {
        error: 'Forbidden',
        message: 'Quyền bị từ chối: Chỉ Quản trị viên (Admin) mới có quyền truy cập trực tiếp API phiếu sửa chữa.',
      },
      { status: 403 }
    );
  }

  return NextResponse.json({
    success: true,
    total: initialTickets.length,
    data: initialTickets,
  });
}
