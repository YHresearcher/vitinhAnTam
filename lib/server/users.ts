// Kho tài khoản phía máy chủ: mật khẩu chỉ được lưu dạng hash (scrypt + salt).
// Tuyệt đối không import từ client component.
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { initialUsers } from '@/lib/mockData';
import type { UserAccount } from '@/lib/supabase';

export type SafeUser = Omit<UserAccount, 'password'>;

export interface StoredUser extends SafeUser {
  password_hash: string;
  /** true khi người dùng đã chủ động đặt/đổi mật khẩu — khi đó không dùng mật khẩu mặc định nữa */
  password_changed?: boolean;
}

const DATA_DIR = join(process.cwd(), '.data');
const USERS_FILE = join(DATA_DIR, 'users.json');

let memoryStore: StoredUser[] | null = null;

const ROLE_DEFAULT_PASSWORDS: Record<string, string> = {
  admin: 'admin123',
  technician: 'tech123',
  sales: 'sales123',
  outsourced: '123456',
};

const seedPassword = (role?: string): string =>
  process.env.SEED_ADMIN_PASSWORD?.trim() || (role && ROLE_DEFAULT_PASSWORDS[role]) || '123456';

export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(plain, salt, 64).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

function verifyPassword(plain: string, stored: string): boolean {
  const [scheme, salt, expectedHex] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !expectedHex) return false;

  const expected = Buffer.from(expectedHex, 'hex');
  if (expected.length !== 64) return false;

  const candidate = scryptSync(plain, salt, 64);
  return timingSafeEqual(candidate, expected);
}

/** Bỏ mọi bí mật trước khi trả dữ liệu người dùng về phía client. */
export function stripSecrets(user: StoredUser): SafeUser {
  const safe = { ...user } as SafeUser & { password_hash?: string };
  delete safe.password_hash;
  return safe;
}

/**
 * Ghi danh sách người dùng ra file. Trả về false nếu không ghi được
 * (file read-only / sai quyền...). Khi ghi thất bại KHÔNG cập nhật RAM
 * để tránh "báo thành công nhưng không lưu được" và lệch giữa các instance.
 */
function save(users: StoredUser[]): boolean {
  try {
    mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    memoryStore = users;
    return true;
  } catch (err) {
    console.error(
      'Không ghi được .data/users.json:',
      err instanceof Error ? err.message : err
    );
    return false;
  }
}

export function loadUsers(): StoredUser[] {
  if (memoryStore) return memoryStore;

  try {
    if (existsSync(USERS_FILE)) {
      const parsed: unknown = JSON.parse(readFileSync(USERS_FILE, 'utf8'));
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryStore = parsed as StoredUser[];
        return memoryStore;
      }
    }
  } catch {
    // file hỏng -> seed lại
  }

  const seeded = initialUsers.map((user) => ({
    ...user,
    password: undefined,
    password_hash: hashPassword(seedPassword(user.role)),
  })) as StoredUser[];
  memoryStore = seeded; // dùng ngay cả khi không ghi được file (môi trường read-only)
  save(seeded);
  return seeded;
}

const matchesIdentifier = (user: StoredUser, identifier: string): boolean => {
  const needle = identifier.toLowerCase();
  return (
    user.id.toLowerCase() === needle ||
    (user.username ?? '').toLowerCase() === needle ||
    user.email.toLowerCase() === needle
  );
};

export function authenticate(identifier: string, password: string): StoredUser | null {
  const user = loadUsers().find((u) => matchesIdentifier(u, identifier.trim()));
  if (!user) return null;

  // Kiểm tra password hash
  if (verifyPassword(password, user.password_hash)) {
    return user;
  }

  // Mật khẩu mặc định theo vai trò (admin123, tech123...) hoặc 123456 CHỈ áp dụng
  // cho tài khoản CHƯA TỪNG đổi mật khẩu. Sau khi đổi, cửa hậu bị đóng để
  // mật khẩu cũ/mặc định không thể đăng nhập được nữa.
  if (!user.password_changed) {
    const roleDefault = ROLE_DEFAULT_PASSWORDS[user.role];
    if (password === roleDefault || password === '123456') {
      return user;
    }
  }

  return null;
}

export function findUserById(id: string): StoredUser | null {
  return loadUsers().find((u) => u.id === id) ?? null;
}

/** Tạo/sửa tài khoản. Chỉ gọi từ handler đã xác thực session admin. */
export function upsertUser(
  input: Partial<UserAccount> & { id?: string; created_at?: string; password?: string },
  options: { id?: string } = {}
): SafeUser {
  const users = loadUsers();
  const id = options.id ?? input.id ?? `u-${Date.now()}`;
  const index = users.findIndex((u) => u.id === id);

  const { password, ...rest } = input;
  const base: StoredUser = index >= 0 ? users[index] : ({} as StoredUser);

  const next = {
    ...base,
    ...rest,
    id,
    role: rest.role ?? base.role ?? 'technician',
    roleTitle: rest.roleTitle ?? base.roleTitle ?? 'Thành viên',
    avatarBg: rest.avatarBg ?? base.avatarBg ?? 'bg-slate-600',
    permissions:
      rest.permissions ??
      base.permissions ?? {
        can_edit_stock: false,
        can_update_repair_status: false,
        can_access_payroll: false,
        can_manage_users: false,
      },
    status: rest.status ?? base.status ?? 'active',
    created_at: base.created_at ?? new Date().toISOString(),
    password_hash: password
      ? hashPassword(password)
      : base.password_hash ?? hashPassword(seedPassword()),
    // Khi có đặt mật khẩu qua form => đóng cửa hậu mật khẩu mặc định của tài khoản này
    ...(password ? { password_changed: true } : {}),
  } as StoredUser;

  const updated = [...users];
  if (index >= 0) updated[index] = next;
  else updated.push(next);
  if (!save(updated)) {
    throw new Error('Không ghi được .data/users.json — thay đổi CHƯA được lưu.');
  }
  return stripSecrets(next);
}

export function setPassword(id: string, plain: string): SafeUser | null {
  const users = loadUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index < 0) return null;

  const next: StoredUser = {
    ...users[index],
    password_hash: hashPassword(plain),
    password_changed: true,
  };
  const updated = [...users];
  updated[index] = next;
  if (!save(updated)) {
    throw new Error('Không ghi được .data/users.json — mật khẩu CHƯA được lưu!');
  }
  return stripSecrets(next);
}

export function removeUser(id: string): boolean {
  const users = loadUsers();
  if (!users.some((u) => u.id === id)) return false;
  return save(users.filter((u) => u.id !== id));
}
