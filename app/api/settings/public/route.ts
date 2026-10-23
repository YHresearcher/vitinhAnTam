import { NextResponse } from 'next/server';
import { getStoredSettingsAsync } from '@/lib/server/settings';
import type { SystemSettings } from '@/lib/store';

// Cac truong cau hinh duoc phep hien thi cong khai (trang chu, widget lien he,
// footer...). Tuyet doi khong dua token/secret cua Zalo Bot hay cau hinh noi bo.
const PUBLIC_FIELDS: (keyof SystemSettings)[] = [
  'brandSlogan',
  'hotline',
  'zaloNumber',
  'zaloLink',
  'zaloContacts',
  'contactWidget',
  'whatsappNumber',
  'whatsappLink',
  'email',
  'address',
  'streetAddress',
  'district',
  'city',
  'serviceAreas',
  'workingHoursWeekday',
  'workingHoursWeekend',
  'primeHours',
  'footerAbout',
  'footerCopyright',
  'storeName',
  'technicalHotline',
  'googleMapsEmbedUrl',
];

export async function GET() {
  const settings = await getStoredSettingsAsync();
  const data: Record<string, unknown> = {};
  for (const key of PUBLIC_FIELDS) {
    const value = settings[key];
    if (value !== undefined) data[key] = value;
  }
  return NextResponse.json({ success: true, data });
}
