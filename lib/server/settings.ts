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
  ['botApiBaseUrl', 'bot_api_base_url'],
  ['zaloBotToken', 'zalo_bot_token'],
  ['zaloBotSecretToken', 'zalo_bot_secret_token'],
  ['zaloDefaultChatId', 'zalo_default_chat_id'],
  ['customWebhookUrl', 'custom_webhook_url'],
  ['notifyOnNewBooking', 'notify_on_new_booking'],
  ['notifyOnNewOrder', 'notify_on_new_order'],
  ['notifyOnNewTicket', 'notify_on_new_ticket'],
  ['notifyOnKeyRequest', 'notify_on_key_request'],
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
  const sb = getServerSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from('system_settings').select('*').eq('id', 1).maybeSingle();
      if (!error && data) {
        const fromDb = rowToSettings(data);
        memorySettings = fromDb;
        writeToFile(fromDb);
        return fromDb;
      }
    } catch (err) {
      console.warn('Lỗi đọc system_settings từ Supabase:', err);
    }
  }
  if (memorySettings) return memorySettings;
  const fileSettings = readFromFile();
  if (fileSettings) {
    memorySettings = fileSettings;
    return fileSettings;
  }
  const fallback = { ...initialSystemSettings };
  memorySettings = fallback;
  return fallback;
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

export async function saveStoredSettingsAsync(data: Partial<SystemSettings>): Promise<SystemSettings> {
  const current = await getStoredSettingsAsync();
  const updated: SystemSettings = { ...current, ...data };
  memorySettings = updated;
  writeToFile(updated);

  const sb = getServerSupabase();
  if (sb) {
    try {
      const rowPayload = settingsToRow(updated);
      const { error } = await sb.from('system_settings').upsert({ id: 1, ...rowPayload });
      if (error) console.error('Lỗi khi upsert system_settings lên Supabase:', error.message);
    } catch (err) {
      console.error('Lỗi kết nối Supabase khi lưu settings:', err);
    }
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
    Promise.resolve(sb.from('system_settings').upsert({ id: 1, ...rowPayload }))
      .then((res) => {
        if (res.error) console.error('Lỗi background save Supabase settings:', res.error.message);
      })
      .catch((err: unknown) => console.error('Lỗi kết nối background Supabase settings:', err));
  }
  return updated;
}
