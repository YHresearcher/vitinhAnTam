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
}

const DATA_DIR = join(process.cwd(), '.data');
const USERS_FILE = join(DATA_DIR, 'users.json');

let memoryStore: StoredUser[] | null = null;

const seedPassword = (): string => process.env.SEED_ADMIN_PASSWORD?.trim() || '123456';

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

function save(users: StoredUser[]): void {
  memoryStore = users;
  try {
    mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch {
    // Không ghi được file -> giữ trong RAM (mất sau khi restart)
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
    password_hash: hashPassword(seedPassword()),
  })) as StoredUser[];
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
  return verifyPassword(password, user.password_hash) ? user : null;
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
  } as StoredUser;

  const updated = [...users];
  if (index >= 0) updated[index] = next;
  else updated.push(next);
  save(updated);
  return stripSecrets(next);
}

export function setPassword(id: string, plain: string): SafeUser | null {
  const users = loadUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index < 0) return null;

  const next: StoredUser = { ...users[index], password_hash: hashPassword(plain) };
  const updated = [...users];
  updated[index] = next;
  save(updated);
  return stripSecrets(next);
}

export function removeUser(id: string): boolean {
  const users = loadUsers();
  if (!users.some((u) => u.id === id)) return false;
  save(users.filter((u) => u.id !== id));
  return true;
}
