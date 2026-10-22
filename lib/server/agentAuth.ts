// Xác thực cho các endpoint /api/agent/* bằng header x-agent-key.
// BẮT BUỘC đặt biến môi trường AGENT_API_SECRET — tuyệt đối không có
// secret dự phòng hardcode trong source (từng khiến endpoint mở công khai).
import { timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';

export function isValidAgentKey(req: NextRequest): boolean {
  const expected = process.env.AGENT_API_SECRET?.trim();
  if (!expected) return false; // Chưa cấu hình secret -> khoá endpoint
  const header = req.headers.get('x-agent-key') || req.headers.get('authorization') || '';
  const token = header.replace('Bearer ', '').trim();
  if (!token) return false;
  const a = Buffer.from(token, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
