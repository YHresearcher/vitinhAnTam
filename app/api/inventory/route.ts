import { NextRequest, NextResponse } from 'next/server';
import { initialInventory } from '@/lib/mockData';

// Protected API - Only Admin can access
export async function GET(request: NextRequest) {
  const userRole = request.headers.get('x-user-role');

  if (userRole !== 'admin') {
    return NextResponse.json(
      {
        error: 'Forbidden',
        message: 'Quyền bị từ chối: Chỉ Quản trị viên (Admin) mới có quyền truy cập trực tiếp API này.',
      },
      { status: 403 }
    );
  }

  return NextResponse.json({
    success: true,
    total: initialInventory.length,
    data: initialInventory,
  });
}

export async function POST(request: NextRequest) {
  const userRole = request.headers.get('x-user-role');

  if (userRole !== 'admin') {
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
        item: { ...body, id: `inv-${Date.now()}` },
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: 'Bad Request', message: err.message }, { status: 400 });
  }
}
