// Session an toàn phía máy chủ: cookie httpOnly + chữ ký HMAC-SHA256.
// CHỈ import từ server (proxy.ts / route handlers). Tuyệt đối không import từ client component.
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const SESSION_COOKIE = 'vtat_session';
export const SESSION_TTL_SECONDS = 12 * 60 * 60; // 12 giờ

export interface SessionPayload {
  sub: string; // user id
  role: string; // UserRole
  name: string;
  /** Copy quyền hạn vào session để proxy kiểm tra được mà không cần tra DB */
  canManageUsers?: boolean;
  canAccessPayroll?: boolean;
  exp: number; // epoch ms
}

let cachedSecret: string | null = null;

/**
 * Lấy secret dùng để ký session.
 * Ưu tiên SESSION_SECRET từ env; nếu thiếu thì tự sinh và lưu vào .data/session-secret
 * (không bao giờ hardcode secret trong source).
 */
function getSecret(): string {
  const fromEnv = process.env.SESSION_SECRET?.trim();
  if (fromEnv) return fromEnv;
  if (cachedSecret) return cachedSecret;

  const file = join(process.cwd(), '.data', 'session-secret');
  try {
    if (existsSync(file)) {
      const existing = readFileSync(file, 'utf8').trim();
      if (existing) {
        cachedSecret = existing;
        return existing;
      }
    }
    const generated = randomBytes(32).toString('hex');
    mkdirSync(join(process.cwd(), '.data'), { recursive: true });
    writeFileSync(file, generated, { encoding: 'utf8', mode: 0o600 });
    cachedSecret = generated;
    return generated;
  } catch {
    // Môi trường read-only (serverless): dùng secret trong RAM (session sẽ mất sau khi restart)
    if (!cachedSecret) cachedSecret = randomBytes(32).toString('hex');
    return cachedSecret;
  }
}

const encode = (value: string): string => Buffer.from(value, 'utf8').toString('base64url');
const decode = (value: string): string => Buffer.from(value, 'base64url').toString('utf8');

const hmac = (body: string): string =>
  createHmac('sha256', getSecret()).update(body).digest('base64url');

export function signSession(payload: Omit<SessionPayload, 'exp'>): string {
  const body = encode(JSON.stringify({ ...payload, exp: Date.now() + SESSION_TTL_SECONDS * 1000 }));
  return `${body}.${hmac(body)}`;
}

export function verifySession(token: string | null | undefined): SessionPayload | null {
  if (!token) return null;
  const separator = token.lastIndexOf('.');
  if (separator <= 0) return null;

  const body = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  const expected = hmac(body);

  const a = Buffer.from(signature, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(decode(body)) as SessionPayload;
    if (!payload || typeof payload.sub !== 'string' || typeof payload.role !== 'string') return null;
    if (typeof payload.exp !== 'number' || payload.exp <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Tùy chọn cookie dùng cho route handler (httpOnly -> JS phía client không đọc/đặt được). */
export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_TTL_SECONDS,
};
