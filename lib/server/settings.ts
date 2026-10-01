import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { initialSystemSettings, SystemSettings } from '@/lib/store';

const DATA_DIR = join(process.cwd(), '.data');
const SETTINGS_FILE = join(DATA_DIR, 'settings.json');

let memorySettings: SystemSettings | null = null;

/**
 * Lấy cấu hình hệ thống từ bộ nhớ hoặc file .data/settings.json
 */
export function getStoredSettings(): SystemSettings {
  if (memorySettings) return memorySettings;

  try {
    if (existsSync(SETTINGS_FILE)) {
      const content = readFileSync(SETTINGS_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === 'object') {
        const loaded: SystemSettings = { ...initialSystemSettings, ...parsed };
        memorySettings = loaded;
        return loaded;
      }
    }
  } catch (err) {
    console.warn('Không đọc được file .data/settings.json:', err);
  }

  const fallback: SystemSettings = { ...initialSystemSettings };
  memorySettings = fallback;
  return fallback;
}

/**
 * Lưu cấu hình hệ thống mới vào .data/settings.json
 */
export function saveStoredSettings(data: Partial<SystemSettings>): SystemSettings {
  const current = getStoredSettings();
  const updated: SystemSettings = { ...current, ...data };

  memorySettings = updated;

  try {
    mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf8');
  } catch (err) {
    console.error('Không thể ghi file .data/settings.json:', err);
  }

  return updated;
}
