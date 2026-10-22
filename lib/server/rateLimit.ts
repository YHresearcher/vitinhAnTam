// Rate limit đơn giản theo IP, lưu trong bộ nhớ tiến trình.
// LƯU Ý: trên serverless nhiều instance thì mỗi instance đếm riêng — đây là
// lớp giảm thiểu brute-force/spam cơ bản, không thay thế được WAF/rate-limit
// ở tầng edge. Vẫn tốt hơn nhiều so với không có gì.
import type { NextRequest } from 'next/server';

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export function clientIp(request: NextRequest): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

/**
 * Trả true nếu request được phép đi tiếp, false nếu đã vượt giới hạn.
 * @param key     khoá phân loại (vd 'login', 'warranty')
 * @param limit   số request tối đa trong cửa sổ
 * @param windowMs độ dài cửa sổ (ms)
 */
export function rateLimit(request: NextRequest, key: string, limit: number, windowMs: number): boolean {
  const id = `${key}:${clientIp(request)}`;
  const now = Date.now();
  const bucket = buckets.get(id);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(id, { count: 1, resetAt: now + windowMs });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= limit;
}
