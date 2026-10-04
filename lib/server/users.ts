// Kho tài khoản máy chủ: mật khẩu chỉ lưu dạng hash (scrypt + salt).
// Hỗ trợ lưu trữ trực tiếp vào Supabase (bảng users) và fallback file .data/users.json.
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { initialUsers } from '@/lib/mockData';
import type { UserAccount } from '@/lib/supabase';
import { getServerSupabase } from './supabaseAdmin';

export type SafeUser = Omit<UserAccount, 'password'>;

export interface StoredUser extends SafeUser {
  password_hash: string;
  password_changed?: boolean;
}

const DATA_DIR = join(process.cwd(), '.data');
const USERS_FILE = join(DATA_DIR, 'users.json');

let memoryStore: StoredUser[] | null = null;

const seedPassword = (): string => {
  const envPass = process.env.SEED_ADMIN_PASSWORD?.trim();
  if (envPass) return envPass;
  return randomBytes(12).toString('hex');
};

export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(plain, salt, 64).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

function verifyPassword(plain: string, stored: string): boolean {
  if (!stored) return false;
  const [scheme, salt, expectedHex] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !expectedHex) return false;

  const expected = Buffer.from(expectedHex, 'hex');
  if (expected.length !== 64) return false;

  const candidate = scryptSync(plain, salt, 64);
  return timingSafeEqual(candidate, expected);
}

export function stripSecrets(user: StoredUser): SafeUser {
  const safe = { ...user } as SafeUser & { password_hash?: string };
  delete safe.password_hash;
  return safe;
}

export function rowToUser(row: Record<string, unknown>): StoredUser {
  return {
    id: String(row.id),
    username: row.username ? String(row.username) : undefined,
    name: String(row.name || ''),
    email: String(row.email || ''),
    phone: String(row.phone || ''),
    role: (row.role as UserAccount['role']) || 'technician',
    roleTitle: String(row.role_title || 'Thành viên'),
    avatarBg: String(row.avatar_bg || 'bg-slate-600'),
    status: (row.status as 'active' | 'suspended') || 'active',
    created_at: String(row.created_at || new Date().toISOString()),
    last_login: row.last_login ? String(row.last_login) : undefined,
    permissions: (row.permissions && typeof row.permissions === 'object')
      ? (row.permissions as UserAccount['permissions'])
      : {
          can_edit_stock: false,
          can_update_repair_status: false,
          can_access_payroll: false,
          can_manage_users: false,
        },
    password_hash: String(row.password_hash || ''),
    password_changed: row.password_changed !== false,
  };
}

export function userToRow(user: StoredUser): Record<string, unknown> {
  return {
    id: user.id,
    username: user.username || null,
    name: user.name,
    email: user.email,
    phone: user.phone || null,
    role: user.role,
    role_title: user.roleTitle,
    avatar_bg: user.avatarBg,
    status: user.status,
    permissions: user.permissions,
    password_hash: user.password_hash,
    password_changed: user.password_changed ?? true,
    created_at: user.created_at,
    last_login: user.last_login || null,
  };
}

function saveToFile(users: StoredUser[]): boolean {
  try {
    mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    memoryStore = users;
    return true;
  } catch (err) {
    console.error('Không ghi được .data/users.json:', err instanceof Error ? err.message : err);
    return false;
  }
}

function readFromFile(): StoredUser[] | null {
  try {
    if (existsSync(USERS_FILE)) {
      const parsed: unknown = JSON.parse(readFileSync(USERS_FILE, 'utf8'));
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as StoredUser[];
    }
  } catch {}
  return null;
}

const matchesIdentifier = (user: StoredUser, identifier: string): boolean => {
  const needle = identifier.toLowerCase();
  return (
    user.id.toLowerCase() === needle ||
    (user.username ?? '').toLowerCase() === needle ||
    user.email.toLowerCase() === needle
  );
};

export async function loadUsersAsync(): Promise<StoredUser[]> {
  const sb = getServerSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from('users').select('*').order('created_at', { ascending: true });
      if (!error && Array.isArray(data)) {
        if (data.length > 0) {
          const loaded = data.map(rowToUser);
          memoryStore = loaded;
          saveToFile(loaded);
          return loaded;
        }
        const fromFile = readFromFile();
        if (fromFile && fromFile.length > 0) {
          const rows = fromFile.map(userToRow);
          const { error: insertErr } = await sb.from('users').upsert(rows);
          if (!insertErr) {
            memoryStore = fromFile;
            return fromFile;
          }
        }
      }
    } catch (err) {
      console.warn('Lỗi đọc bảng users từ Supabase:', err);
    }
  }

  if (memoryStore) return memoryStore;
  const fromFile = readFromFile();
  if (fromFile) {
    memoryStore = fromFile;
    return fromFile;
  }

  const seeded = initialUsers.map((user) => ({
    ...user,
    password: undefined,
    password_hash: hashPassword(seedPassword()),
    password_changed: true,
  })) as StoredUser[];
  memoryStore = seeded;
  saveToFile(seeded);
  return seeded;
}
export function loadUsers(): StoredUser[] {
  if (memoryStore) return memoryStore;
  const fromFile = readFromFile();
  if (fromFile) {
    memoryStore = fromFile;
    return fromFile;
  }
  const seeded = initialUsers.map((user) => ({
    ...user,
    password: undefined,
    password_hash: hashPassword(seedPassword()),
    password_changed: true,
  })) as StoredUser[];
  memoryStore = seeded;
  saveToFile(seeded);
  return seeded;
}

/** Xác thực bằng mật khẩu hash — Tuyệt đối không fallback vào mật khẩu mặc định */
export async function authenticateAsync(identifier: string, password: string): Promise<StoredUser | null> {
  const users = await loadUsersAsync();
  const user = users.find((u) => matchesIdentifier(u, identifier.trim()));
  if (!user) return null;
  if (!verifyPassword(password, user.password_hash)) return null;
  return user;
}

export function authenticate(identifier: string, password: string): StoredUser | null {
  const user = loadUsers().find((u) => matchesIdentifier(u, identifier.trim()));
  if (!user) return null;
  if (!verifyPassword(password, user.password_hash)) return null;
  return user;
}

export async function findUserByIdAsync(id: string): Promise<StoredUser | null> {
  const users = await loadUsersAsync();
  return users.find((u) => u.id === id) ?? null;
}

export function findUserById(id: string): StoredUser | null {
  return loadUsers().find((u) => u.id === id) ?? null;
}

export async function upsertUserAsync(
  input: Partial<UserAccount> & { id?: string; created_at?: string; password?: string },
  options: { id?: string } = {}
): Promise<SafeUser> {
  const users = await loadUsersAsync();
  const id = options.id ?? input.id ?? `u-${Date.now()}`;
  const index = users.findIndex((u) => u.id === id);
  const { password, ...rest } = input;
  const base: StoredUser = index >= 0 ? users[index] : ({} as StoredUser);

  let pHash = base.password_hash;
  if (password) {
    pHash = hashPassword(password);
  } else if (!pHash) {
    pHash = hashPassword(seedPassword());
  }

  const next: StoredUser = {
    ...base,
    ...rest,
    id,
    role: rest.role ?? base.role ?? 'technician',
    roleTitle: rest.roleTitle ?? base.roleTitle ?? 'Thành viên',
    avatarBg: rest.avatarBg ?? base.avatarBg ?? 'bg-slate-600',
    permissions: rest.permissions ?? base.permissions ?? {
      can_edit_stock: false,
      can_update_repair_status: false,
      can_access_payroll: false,
      can_manage_users: false,
    },
    status: rest.status ?? base.status ?? 'active',
    created_at: base.created_at ?? new Date().toISOString(),
    password_hash: pHash,
    password_changed: true,
  };

  const updated = [...users];
  if (index >= 0) updated[index] = next;
  else updated.push(next);
  memoryStore = updated;
  saveToFile(updated);

  const sb = getServerSupabase();
  if (sb) {
    const row = userToRow(next);
    const { error } = await sb.from('users').upsert(row);
    if (error) console.error('Lỗi khi lưu user lên Supabase:', error.message);
  }

  return stripSecrets(next);
}

export function upsertUser(
  input: Partial<UserAccount> & { id?: string; created_at?: string; password?: string },
  options: { id?: string } = {}
): SafeUser {
  const users = loadUsers();
  const id = options.id ?? input.id ?? `u-${Date.now()}`;
  const index = users.findIndex((u) => u.id === id);
  const { password, ...rest } = input;
  const base: StoredUser = index >= 0 ? users[index] : ({} as StoredUser);

  let pHash = base.password_hash;
  if (password) {
    pHash = hashPassword(password);
  } else if (!pHash) {
    pHash = hashPassword(seedPassword());
  }

  const next: StoredUser = {
    ...base,
    ...rest,
    id,
    role: rest.role ?? base.role ?? 'technician',
    roleTitle: rest.roleTitle ?? base.roleTitle ?? 'Thành viên',
    avatarBg: rest.avatarBg ?? base.avatarBg ?? 'bg-slate-600',
    permissions: rest.permissions ?? base.permissions ?? {
      can_edit_stock: false,
      can_update_repair_status: false,
      can_access_payroll: false,
      can_manage_users: false,
    },
    status: rest.status ?? base.status ?? 'active',
    created_at: base.created_at ?? new Date().toISOString(),
    password_hash: pHash,
    password_changed: true,
  };

  const updated = [...users];
  if (index >= 0) updated[index] = next;
  else updated.push(next);
  memoryStore = updated;
  saveToFile(updated);

  const sb = getServerSupabase();
  if (sb) {
    Promise.resolve(sb.from('users').upsert(userToRow(next))).then((res) => {
      if (res.error) console.error('Lỗi background save Supabase user:', res.error.message);
    }).catch((err: unknown) => console.error('Lỗi kết nối background Supabase user:', err));
  }

  return stripSecrets(next);
}

export async function setPasswordAsync(id: string, plain: string): Promise<SafeUser | null> {
  const users = await loadUsersAsync();
  const index = users.findIndex((u) => u.id === id);
  if (index < 0) return null;

  const next: StoredUser = {
    ...users[index],
    password_hash: hashPassword(plain),
    password_changed: true,
  };
  const updated = [...users];
  updated[index] = next;
  memoryStore = updated;
  saveToFile(updated);

  const sb = getServerSupabase();
  if (sb) {
    const { error } = await sb.from('users').update({
      password_hash: next.password_hash,
      password_changed: true,
    }).eq('id', id);
    if (error) console.error('Lỗi khi đổi mật khẩu trên Supabase:', error.message);
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
  memoryStore = updated;
  saveToFile(updated);

  const sb = getServerSupabase();
  if (sb) {
    Promise.resolve(sb.from('users').update({
      password_hash: next.password_hash,
      password_changed: true,
    }).eq('id', id)).then((res) => {
      if (res.error) console.error('Lỗi background setPassword Supabase:', res.error.message);
    }).catch((err: unknown) => console.error('Lỗi kết nối background Supabase user:', err));
  }

  return stripSecrets(next);
}

export async function removeUserAsync(id: string): Promise<boolean> {
  const users = await loadUsersAsync();
  if (!users.some((u) => u.id === id)) return false;
  const filtered = users.filter((u) => u.id !== id);
  memoryStore = filtered;
  saveToFile(filtered);

  const sb = getServerSupabase();
  if (sb) {
    const { error } = await sb.from('users').delete().eq('id', id);
    if (error) console.error('Lỗi xóa user trên Supabase:', error.message);
  }
  return true;
}

export function removeUser(id: string): boolean {
  const users = loadUsers();
  if (!users.some((u) => u.id === id)) return false;
  const filtered = users.filter((u) => u.id !== id);
  memoryStore = filtered;
  saveToFile(filtered);

  const sb = getServerSupabase();
  if (sb) {
    Promise.resolve(sb.from('users').delete().eq('id', id)).then((res) => {
      if (res.error) console.error('Lỗi background removeUser Supabase:', res.error.message);
    }).catch((err: unknown) => console.error('Lỗi kết nối background Supabase user:', err));
  }
  return true;
}
