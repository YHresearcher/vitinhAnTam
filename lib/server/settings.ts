import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { isAbsolute, join, relative } from 'node:path';
import { initialSystemSettings, SystemSettings } from '@/lib/store';

const DATA_DIR = join(process.cwd(), '.data');
const SETTINGS_FILE = join(DATA_DIR, 'settings.json');

const BRAND_ASSET_FIELDS = ['logoUrl', 'faviconUrl'] as const;

type BrandAssetField = (typeof BRAND_ASSET_FIELDS)[number];

function removeReplacedLocalAsset(previousUrl: string | undefined, nextUrl: string | undefined) {
  if (!previousUrl || previousUrl === nextUrl || !previousUrl.startsWith('/img/')) return;

  // Chỉ xóa file nằm trong public/img, không bao giờ đụng tới URL ngoài hệ thống.
  const relativePath = previousUrl.split('?')[0].replace(/^\/img\//, '');
  const assetPath = join(process.cwd(), 'public', 'img', relativePath);
  const imgRoot = join(process.cwd(), 'public', 'img');
  const pathFromImgRoot = relative(imgRoot, assetPath);

  if (!isAbsolute(pathFromImgRoot) && !pathFromImgRoot.startsWith('..') && existsSync(assetPath)) {
    try {
      unlinkSync(assetPath);
    } catch (error) {
      console.warn(`Không thể xóa asset thương hiệu cũ (${previousUrl}):`, error);
    }
  }
}

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

  for (const field of BRAND_ASSET_FIELDS as readonly BrandAssetField[]) {
    if (field in data) {
      removeReplacedLocalAsset(current[field], updated[field]);
    }
  }

  memorySettings = updated;

  try {
    mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf8');
  } catch (err) {
    console.error('Không thể ghi file .data/settings.json:', err);
  }

  return updated;
}
