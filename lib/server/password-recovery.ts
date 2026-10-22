import { createHash, randomBytes } from 'node:crypto';
import { getServerSupabase } from './supabaseAdmin';

// Token khôi phục mật khẩu lưu trong DB (bảng password_reset_tokens,
// chỉ service-role truy cập được). Trước đây token nằm ở file .data /
// bộ nhớ của từng instance serverless nên link đặt lại mật khẩu thường
// xuyên "hết hạn" giả khi request rơi vào instance khác — nay mọi
// instance đều đọc cùng một nguồn. Token vẫn chỉ lưu dạng SHA-256,
// hạn 30 phút, dùng một lần, mỗi user chỉ có 1 token hiệu lực.

export const RECOVERY_TOKEN_TTL_MS = 30 * 60 * 1000;

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export async function createRecoveryToken(userId: string): Promise<string> {
  const db = getServerSupabase();
  if (!db) throw new Error('Supabase server client chưa được cấu hình');

  const rawToken = randomBytes(32).toString('base64url');

  // Dọn token cũ/hết hạn của user này để mỗi user chỉ có 1 token hiệu lực
  await db.from('password_reset_tokens').delete().eq('user_id', userId);
  await db
    .from('password_reset_tokens')
    .delete()
    .lt('expires_at', new Date().toISOString());

  const { error } = await db.from('password_reset_tokens').insert({
    user_id: userId,
    token_hash: hashToken(rawToken),
    expires_at: new Date(Date.now() + RECOVERY_TOKEN_TTL_MS).toISOString(),
  });
  if (error) throw new Error(`Không tạo được token khôi phục: ${error.message}`);

  return rawToken;
}

export async function consumeRecoveryToken(rawToken: string): Promise<string | null> {
  if (!/^[A-Za-z0-9_-]{40,}$/.test(rawToken)) return null;
  const db = getServerSupabase();
  if (!db) return null;

  const tokenHash = hashToken(rawToken);
  const { data, error } = await db
    .from('password_reset_tokens')
    .select('id, user_id, expires_at, used_at')
    .eq('token_hash', tokenHash)
    .maybeSingle();
  if (error || !data) return null;
  if (data.used_at) return null;
  if (new Date(data.expires_at as string).getTime() <= Date.now()) return null;

  // Đánh dấu đã dùng (single-use). Điều kiện used_at IS NULL giúp hai
  // request đồng thời không thể cùng dùng một token.
  const { data: updated, error: updateError } = await db
    .from('password_reset_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('id', data.id)
    .is('used_at', null)
    .select('user_id');
  if (updateError || !updated || updated.length === 0) return null;

  return data.user_id as string;
}
