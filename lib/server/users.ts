// Kho tài khoản máy chủ: mật khẩu chỉ lưu dạng hash (scrypt + salt).
// Hỗ trợ lưu trữ trực tiếp vào Supabase (bảng users) và fallback file .data/users.json.
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { initialUsers } from '@/lib/mockData';
import { generateReferralCode, type UserAccount } from '@/lib/supabase';
import { getServerSupabase } from './supabaseAdmin';

export const DEFAULT_TEMPORARY_PASSWORD = 'Antam@2026';

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
    username: row.username ? String(row.username).trim().toLowerCase() : undefined,
    name: String(row.name || ''),
    email: String(row.email || '').trim().toLowerCase(),
    phone: String(row.phone || ''),
    role: (row.role as UserAccount['role']) || 'technician',
    roleTitle: String(row.role_title || 'Thành viên'),
    avatarBg: String(row.avatar_bg || 'bg-slate-600'),
    referral_code: row.referral_code ? String(row.referral_code).trim().toUpperCase() : undefined,
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
    password_changed: row.password_changed === false ? false : true,
  };
}

export function userToRow(user: StoredUser): Record<string, unknown> {
  return {
    id: user.id,
    username: user.username ? user.username.trim().toLowerCase() : null,
    name: user.name,
    email: user.email ? user.email.trim().toLowerCase() : '',
    phone: user.phone || null,
    role: user.role,
    role_title: user.roleTitle,
    avatar_bg: user.avatarBg,
    referral_code: user.referral_code || null,
    status: user.status,
    permissions: user.permissions,
    password_hash: user.password_hash,
    password_changed: user.password_changed === false ? false : true,
    created_at: user.created_at,
    last_login: user.last_login || null,
  };
}

export function ensureReferralCodes(users: StoredUser[]): boolean {
  let changed = false;
  const existingCodes = users.map((u) => u.referral_code).filter(Boolean) as string[];
  for (const user of users) {
    if (!user.referral_code) {
      user.referral_code = generateReferralCode(user.username || user.name, existingCodes);
      existingCodes.push(user.referral_code);
      changed = true;
    }
  }
  return changed;
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

export const matchesIdentifier = (user: StoredUser, identifier: string): boolean => {
  const needle = identifier.trim().toLowerCase();
  if (!needle) return false;
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
          ensureReferralCodes(loaded);
          memoryStore = loaded;
          saveToFile(loaded);
          return loaded;
        }
        const fromFile = readFromFile();
        if (fromFile && fromFile.length > 0) {
          ensureReferralCodes(fromFile);
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

  if (memoryStore) {
    if (ensureReferralCodes(memoryStore)) saveToFile(memoryStore);
    return memoryStore;
  }
  const fromFile = readFromFile();
  if (fromFile) {
    ensureReferralCodes(fromFile);
    memoryStore = fromFile;
    return fromFile;
  }

  const seeded = initialUsers.map((user) => ({
    ...user,
    password: undefined,
    password_hash: hashPassword(seedPassword()),
    password_changed: true,
  })) as StoredUser[];
  ensureReferralCodes(seeded);
  memoryStore = seeded;
  saveToFile(seeded);
  return seeded;
}
export function loadUsers(): StoredUser[] {
  if (memoryStore) {
    if (ensureReferralCodes(memoryStore)) saveToFile(memoryStore);
    return memoryStore;
  }
  const fromFile = readFromFile();
  if (fromFile) {
    ensureReferralCodes(fromFile);
    memoryStore = fromFile;
    return fromFile;
  }
  const seeded = initialUsers.map((user) => ({
    ...user,
    password: undefined,
    password_hash: hashPassword(seedPassword()),
    password_changed: true,
  })) as StoredUser[];
  ensureReferralCodes(seeded);
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

  const cleanUsername = rest.username !== undefined ? (rest.username ? rest.username.trim().toLowerCase() : undefined) : base.username;
  const cleanEmail = rest.email !== undefined ? (rest.email ? rest.email.trim().toLowerCase() : '') : base.email;

  // Kiểm tra trùng username (nếu có username)
  if (cleanUsername) {
    const duplicateUsername = users.find(
      (u) => u.id !== id && u.username && u.username.toLowerCase() === cleanUsername
    );
    if (duplicateUsername) {
      throw new Error(`Tên đăng nhập "${cleanUsername}" đã được sử dụng bởi ${duplicateUsername.name}. Vui lòng chọn tên khác!`);
    }
  }

  // Kiểm tra trùng email
  if (cleanEmail) {
    const duplicateEmail = users.find(
      (u) => u.id !== id && u.email && u.email.toLowerCase() === cleanEmail
    );
    if (duplicateEmail) {
      throw new Error(`Email "${cleanEmail}" đã được sử dụng bởi ${duplicateEmail.name}. Vui lòng chọn email khác!`);
    }
  }

  let pHash = base.password_hash;
  let pChanged = base.password_changed;

  if (index < 0) {
    // Tạo mới tài khoản: mặc định 'Antam@2026', password_changed = false (bắt buộc đổi MK lần đầu)
    pHash = hashPassword(password || DEFAULT_TEMPORARY_PASSWORD);
    pChanged = false;
  } else {
    // Cập nhật tài khoản cũ
    if (password) {
      pHash = hashPassword(password);
      pChanged = false;
    }
    if (typeof rest.password_changed === 'boolean') {
      pChanged = rest.password_changed;
    }
  }

  const existingCodes = users.filter((u) => u.id !== id).map((u) => u.referral_code).filter(Boolean) as string[];
  const cleanReferral = rest.referral_code?.trim().toUpperCase() || base.referral_code || generateReferralCode(cleanUsername || rest.name || base.name, existingCodes);

  const next: StoredUser = {
    ...base,
    ...rest,
    id,
    username: cleanUsername,
    email: cleanEmail,
    role: rest.role ?? base.role ?? 'technician',
    roleTitle: rest.roleTitle ?? base.roleTitle ?? 'Thành viên',
    avatarBg: rest.avatarBg ?? base.avatarBg ?? 'bg-slate-600',
    referral_code: cleanReferral,
    permissions: rest.permissions ?? base.permissions ?? {
      can_edit_stock: false,
      can_update_repair_status: false,
      can_access_payroll: false,
      can_manage_users: false,
    },
    status: rest.status ?? base.status ?? 'active',
    created_at: base.created_at ?? new Date().toISOString(),
    password_hash: pHash || hashPassword(DEFAULT_TEMPORARY_PASSWORD),
    password_changed: pChanged === false ? false : true,
  };

  const updated = [...users];
  if (index >= 0) updated[index] = next;
  else updated.push(next);
  memoryStore = updated;
  saveToFile(updated);

  const sb = getServerSupabase();
  if (sb) {
    const row = userToRow(next);
    let { error } = await sb.from('users').upsert(row);
    if (error && (error.code === 'PGRST204' || String(error.message).includes('referral_code'))) {
      const fallbackRow = { ...row };
      delete fallbackRow.referral_code;
      const res = await sb.from('users').upsert(fallbackRow);
      error = res.error;
    }
    if (error) {
      console.warn('Lỗi khi lưu user lên Supabase:', error.message);
    }
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

  const cleanUsername = rest.username !== undefined ? (rest.username ? rest.username.trim().toLowerCase() : undefined) : base.username;
  const cleanEmail = rest.email !== undefined ? (rest.email ? rest.email.trim().toLowerCase() : '') : base.email;

  let pHash = base.password_hash;
  let pChanged = base.password_changed;

  if (index < 0) {
    pHash = hashPassword(password || DEFAULT_TEMPORARY_PASSWORD);
    pChanged = false;
  } else {
    if (password) {
      pHash = hashPassword(password);
      pChanged = false;
    }
    if (typeof rest.password_changed === 'boolean') {
      pChanged = rest.password_changed;
    }
  }

  const existingCodesSync = users.filter((u) => u.id !== id).map((u) => u.referral_code).filter(Boolean) as string[];
  const cleanReferralSync = rest.referral_code?.trim().toUpperCase() || base.referral_code || generateReferralCode(cleanUsername || rest.name || base.name, existingCodesSync);

  const next: StoredUser = {
    ...base,
    ...rest,
    id,
    username: cleanUsername,
    email: cleanEmail,
    role: rest.role ?? base.role ?? 'technician',
    roleTitle: rest.roleTitle ?? base.roleTitle ?? 'Thành viên',
    avatarBg: rest.avatarBg ?? base.avatarBg ?? 'bg-slate-600',
    referral_code: cleanReferralSync,
    permissions: rest.permissions ?? base.permissions ?? {
      can_edit_stock: false,
      can_update_repair_status: false,
      can_access_payroll: false,
      can_manage_users: false,
    },
    status: rest.status ?? base.status ?? 'active',
    created_at: base.created_at ?? new Date().toISOString(),
    password_hash: pHash || hashPassword(DEFAULT_TEMPORARY_PASSWORD),
    password_changed: pChanged === false ? false : true,
  };

  const updated = [...users];
  if (index >= 0) updated[index] = next;
  else updated.push(next);
  memoryStore = updated;
  saveToFile(updated);

  const sb = getServerSupabase();
  if (sb) {
    Promise.resolve().then(async () => {
      const row = userToRow(next);
      let res = await sb.from('users').upsert(row);
      if (res.error && (res.error.code === 'PGRST204' || String(res.error.message).includes('referral_code'))) {
        const fallbackRow = { ...row };
        delete fallbackRow.referral_code;
        res = await sb.from('users').upsert(fallbackRow);
      }
      if (res.error) console.warn('Lỗi background save Supabase user:', res.error.message);
    }).catch((err: unknown) => console.warn('Lỗi kết nối background Supabase user:', err));
  }

  return stripSecrets(next);
}

/** Admin đặt lại mật khẩu về mặc định 'Antam@2026' và yêu cầu đổi mật khẩu ở lần đăng nhập tới */
export async function resetUserPasswordAsync(id: string): Promise<SafeUser | null> {
  const users = await loadUsersAsync();
  const index = users.findIndex((u) => u.id === id);
  if (index < 0) return null;

  const next: StoredUser = {
    ...users[index],
    password_hash: hashPassword(DEFAULT_TEMPORARY_PASSWORD),
    password_changed: false,
  };
  const updated = [...users];
  updated[index] = next;
  memoryStore = updated;
  saveToFile(updated);

  const sb = getServerSupabase();
  if (sb) {
    const { error } = await sb.from('users').update({
      password_hash: next.password_hash,
      password_changed: false,
    }).eq('id', id);
    if (error) console.error('Lỗi khi reset mật khẩu trên Supabase:', error.message);
  }

  return stripSecrets(next);
}

/** Người dùng đổi mật khẩu (lần đầu hoặc chủ động) có kiểm tra xác thực mật khẩu cũ */
export async function changePasswordWithVerificationAsync(
  identifierOrId: string,
  currentPlain: string,
  newPlain: string
): Promise<{ success: boolean; message: string; user?: SafeUser }> {
  const users = await loadUsersAsync();
  const user = users.find((u) => matchesIdentifier(u, identifierOrId));
  if (!user) {
    return { success: false, message: 'Không tìm thấy tài khoản người dùng.' };
  }

  if (!verifyPassword(currentPlain, user.password_hash)) {
    return { success: false, message: 'Mật khẩu hiện tại không chính xác. Vui lòng kiểm tra lại!' };
  }

  if (!newPlain || newPlain.length < 6) {
    return { success: false, message: 'Mật khẩu mới phải có tối thiểu 6 ký tự!' };
  }

  if (newPlain === currentPlain) {
    return { success: false, message: 'Mật khẩu mới không được trùng với mật khẩu hiện tại!' };
  }

  if (newPlain === DEFAULT_TEMPORARY_PASSWORD) {
    return { success: false, message: 'Mật khẩu mới không được trùng mật khẩu mặc định (Antam@2026)!' };
  }

  const nextHash = hashPassword(newPlain);
  const index = users.findIndex((u) => u.id === user.id);
  const next: StoredUser = {
    ...user,
    password_hash: nextHash,
    password_changed: true,
  };

  const updated = [...users];
  updated[index] = next;
  memoryStore = updated;
  saveToFile(updated);

  const sb = getServerSupabase();
  if (sb) {
    const { error } = await sb.from('users').update({
      password_hash: nextHash,
      password_changed: true,
    }).eq('id', user.id);
    if (error) {
      console.error('Lỗi khi cập nhật mật khẩu mới trên Supabase:', error.message);
      return { success: false, message: `Lỗi máy chủ lưu mật khẩu: ${error.message}` };
    }
  }

  return {
    success: true,
    message: 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại bằng mật khẩu mới.',
    user: stripSecrets(next),
  };
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
