import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'node:crypto';
import { SESSION_COOKIE, verifySession } from '@/lib/session';

// Cấp Supabase JWT (role "authenticated") cho nhân viên đã đăng nhập.
// Client dùng token này làm Authorization header khi gọi Supabase trực tiếp,
// để RLS áp policy nhân viên thay vì policy anon công khai.
// Token được ký bằng JWT secret của project (SUPABASE_JWT_SECRET — chỉ ở server).

const TOKEN_TTL_SECONDS = 8 * 60 * 60; // 8 giờ

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function signSupabaseJwt(payload: Record<string, unknown>, secret: string): string {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64url(JSON.stringify(payload));
  const signature = createHmac('sha256', secret).update(`${header}.${body}`).digest();
  return `${header}.${body}.${base64url(signature)}`;
}

export async function GET(request: NextRequest) {
  const cookieValue = request.cookies.get(SESSION_COOKIE)?.value;
  const session = verifySession(cookieValue);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const jwtSecret = process.env.SUPABASE_JWT_SECRET?.trim();
  if (!jwtSecret) {
    return NextResponse.json(
      { success: false, error: 'SUPABASE_JWT_SECRET chưa được cấu hình' },
      { status: 500 }
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const token = signSupabaseJwt(
    {
      aud: 'authenticated',
      role: 'authenticated',
      sub: session.sub,
      iat: now,
      exp: now + TOKEN_TTL_SECONDS,
      user_role: session.role,
      app_metadata: { provider: 'vtat-session' },
      user_metadata: { name: session.name },
    },
    jwtSecret
  );

  return NextResponse.json({ success: true, token, expires_in: TOKEN_TTL_SECONDS });
}
