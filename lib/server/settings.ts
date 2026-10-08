import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { initialSystemSettings, SystemSettings } from '@/lib/store';
import { getServerSupabase } from './supabaseAdmin';

const DATA_DIR = join(process.cwd(), '.data');
const SETTINGS_FILE = join(DATA_DIR, 'settings.json');
let memorySettings: SystemSettings | null = null;

// Mapping giữa TypeScript camelCase và Supabase snake_case
const FIELD_MAP: Array<[keyof SystemSettings, string]> = [
  ['brandSlogan', 'brand_slogan'],
  ['hotline', 'hotline'],
  ['zaloNumber', 'zalo_number'],
  ['zaloLink', 'zalo_link'],
  ['zaloContacts', 'zalo_contacts'],
  ['whatsappNumber', 'whatsapp_number'],
  ['whatsappLink', 'whatsapp_link'],
  ['email', 'email'],
  ['address', 'address'],
  ['streetAddress', 'street_address'],
  ['district', 'district'],
  ['city', 'city'],
  ['serviceAreas', 'service_areas'],
  ['workingHoursWeekday', 'working_hours_weekday'],
  ['workingHoursWeekend', 'working_hours_weekend'],
  ['primeHours', 'prime_hours'],
  ['footerAbout', 'footer_about'],
  ['footerCopyright', 'footer_copyright'],
  ['storeName', 'store_name'],
  ['paymentQrUrl', 'payment_qr_url'],
  ['bankName', 'bank_name'],
  ['bankAccountNumber', 'bank_account_number'],
  ['bankAccountName', 'bank_account_name'],
  ['paymentQrNote', 'payment_qr_note'],
  ['botApiBaseUrl', 'bot_api_base_url'],
  ['zaloDefaultChatId', 'zalo_default_chat_id'],
  ['customWebhookUrl', 'custom_webhook_url'],
  ['notifyOnNewBooking', 'notify_on_new_booking'],
  ['notifyOnNewOrder', 'notify_on_new_order'],
  ['notifyOnNewTicket', 'notify_on_new_ticket'],
  ['notifyOnKeyRequest', 'notify_on_key_request'],
  ['notifyOnSaleSuccess', 'notify_on_sale_success'],
];

export function rowToSettings(row: Record<string, unknown>): SystemSettings {
  const res: Record<string, unknown> = { ...initialSystemSettings };
  for (const [camel, snake] of FIELD_MAP) {
    if (row[snake] !== undefined && row[snake] !== null) {
      res[camel] = row[snake];
    }
  }
  return res as unknown as SystemSettings;
}

export function mergeRowIntoSettings(base: SystemSettings, row: Record<string, unknown>): SystemSettings {
  const res: Record<string, unknown> = { ...(base as unknown as Record<string, unknown>) };
  const baseRecord = base as unknown as Record<string, unknown>;
  for (const [camel, snake] of FIELD_MAP) {
    if (row[snake] !== undefined && row[snake] !== null) {
      if (typeof row[snake] === 'string') {
        const str = (row[snake] as string).trim();
        if (str !== '' || baseRecord[camel] === undefined) {
          res[camel] = str;
        }
      } else {
        res[camel] = row[snake];
      }
    }
  }
  return res as unknown as SystemSettings;
}

export function settingsToRow(data: Partial<SystemSettings>): Record<string, unknown> {
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const [camel, snake] of FIELD_MAP) {
    if (data[camel] !== undefined) {
      row[snake] = data[camel];
    }
  }
  return row;
}

function readFromFile(): SystemSettings | null {
  try {
    if (existsSync(SETTINGS_FILE)) {
      const parsed = JSON.parse(readFileSync(SETTINGS_FILE, 'utf8'));
      if (parsed && typeof parsed === 'object') return { ...initialSystemSettings, ...parsed };
    }
  } catch {}
  return null;
}

function writeToFile(settings: SystemSettings): void {
  try {
    mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
  } catch {}
}

export async function getStoredSettingsAsync(): Promise<SystemSettings> {
  const base = memorySettings || readFromFile() || { ...initialSystemSettings };
  const sb = getServerSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from('system_settings').select('*').eq('id', 1).maybeSingle();
      if (!error && data) {
        const merged = mergeRowIntoSettings(base, data);
        memorySettings = merged;
        writeToFile(merged);
        return merged;
      }
    } catch (err) {
      console.warn('Lỗi đọc system_settings từ Supabase:', err);
    }
  }
  memorySettings = base;
  return base;
}

export function getStoredSettings(): SystemSettings {
  if (memorySettings) return memorySettings;
  const fromFile = readFromFile();
  if (fromFile) {
    memorySettings = fromFile;
    return fromFile;
  }
  const fallback = { ...initialSystemSettings };
  memorySettings = fallback;
  return fallback;
}

async function upsertSupabaseSettingsSafely(sb: ReturnType<typeof getServerSupabase>, payload: Record<string, unknown>): Promise<void> {
  if (!sb) return;
  try {
    const rowPayload = { ...payload };
    const { error } = await sb.from('system_settings').upsert({ id: 1, ...rowPayload });
    if (!error) return;

    // Nếu lỗi do cột mới chưa tồn tại trong schema cache Supabase (mã PGRST204)
    if (error.code === 'PGRST204') {
      const missingMatch = error.message.match(/Could not find the '([^']+)' column/);
      if (missingMatch && missingMatch[1]) {
        delete rowPayload[missingMatch[1]];
      }

      // Danh sách các cột lõi chắc chắn đã có trong DB
      const CORE_DB_COLUMNS = new Set([
        'brand_slogan', 'hotline', 'zalo_number', 'zalo_link', 'zalo_contacts',
        'whatsapp_number', 'whatsapp_link', 'email', 'address', 'street_address',
        'district', 'city', 'service_areas', 'working_hours_weekday', 'working_hours_weekend',
        'prime_hours', 'footer_about', 'footer_copyright', 'store_name',
        'bot_api_base_url', 'zalo_default_chat_id',
        'custom_webhook_url', 'notify_on_new_booking', 'notify_on_new_order',
        'notify_on_new_ticket', 'notify_on_key_request'
      ]);

      const sanitized: Record<string, unknown> = { id: 1, updated_at: new Date().toISOString() };
      for (const [k, v] of Object.entries(rowPayload)) {
        if (CORE_DB_COLUMNS.has(k)) {
          sanitized[k] = v;
        }
      }

      const retryRes = await sb.from('system_settings').upsert(sanitized);
      if (retryRes.error) {
        console.error('Lỗi khi retry upsert system_settings:', retryRes.error.message);
      }
    } else {
      console.error('Lỗi khi upsert system_settings lên Supabase:', error.message);
    }
  } catch (err) {
    console.error('Lỗi kết nối Supabase khi lưu settings:', err);
  }
}

export async function saveStoredSettingsAsync(data: Partial<SystemSettings>): Promise<SystemSettings> {
  const current = await getStoredSettingsAsync();
  const updated: SystemSettings = { ...current, ...data };
  memorySettings = updated;
  writeToFile(updated);

  const sb = getServerSupabase();
  if (sb) {
    const rowPayload = settingsToRow(updated);
    await upsertSupabaseSettingsSafely(sb, rowPayload);
  }
  return updated;
}

export function saveStoredSettings(data: Partial<SystemSettings>): SystemSettings {
  const current = getStoredSettings();
  const updated: SystemSettings = { ...current, ...data };
  memorySettings = updated;
  writeToFile(updated);

  const sb = getServerSupabase();
  if (sb) {
    const rowPayload = settingsToRow(updated);
    Promise.resolve(upsertSupabaseSettingsSafely(sb, rowPayload)).catch((err: unknown) =>
      console.error('Lỗi background save Supabase settings:', err)
    );
  }
  return updated;
}
