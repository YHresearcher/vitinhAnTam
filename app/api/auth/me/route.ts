import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/session';
import { findUserById, stripSecrets } from '@/lib/server/users';

export async function GET(request: NextRequest) {
  const cookieValue = request.cookies.get(SESSION_COOKIE)?.value;
  const session = verifySession(cookieValue);

  if (!session) {
    return NextResponse.json({ success: false, user: null }, { status: 401 });
  }

  const user = findUserById(session.sub);
  if (!user || user.status === 'suspended') {
    return NextResponse.json({ success: false, user: null }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    user: stripSecrets(user),
  });
}
