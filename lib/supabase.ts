import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { BlogCategory, BlogPost, UserProfile, UserRole } from './types';
export type { UserRole, UserPermissions, UserProfile, UserAccount, CustomerTierType, Customer, InventorySpecs, MachineComponent, WarrantyType, InventoryItem, WarrantyProvision, AdminDeductionItem, SparePart, SoftwareKeyItem, SoftwareLicense, KeyCategory, LicenseKeyItem, KeyReleaseRequest, CustomerOrder, KeyEmailTemplateConfig, MultiTierWarranty, ServiceItem, ServiceTicket, OnsiteDispatchStatus, OnsiteDispatch, ShiftLog, BlogCategory, FaqSchemaItem, BlogPost, FaqItem, CustomerReview } from './types';

const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// Tự động chuẩn hóa nếu người dùng copy cả đường dẫn /rest/v1/ từ Dashboard

const supabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabasePublishableKey &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    !supabaseUrl.includes('placeholder')
  );
};

export let supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabasePublishableKey)
  : null;

/**
 * Sau khi nhân viên đăng nhập, server cấp một Supabase JWT (role
 * "authenticated") qua /api/auth/supabase-token. Gọi hàm này để thay
 * client anon bằng client mang JWT đó — RLS sẽ áp policy của nhân viên
 * thay vì policy công khai của anon. Truyền null khi đăng xuất để quay
 * về client anon. CHỈ gọi từ trình duyệt.
 */

export function setStaffAccessToken(token: string | null): void {
  if (!isSupabaseConfigured()) return;
  supabase = token
    ? createClient(supabaseUrl, supabasePublishableKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      })
    : createClient(supabaseUrl, supabasePublishableKey);
}

// ==========================================
// RBAC (ROLE-BASED ACCESS CONTROL)
// ==========================================

export const createId = (): string => {
  const cryptoApi = globalThis.crypto as Crypto | undefined;
  if (cryptoApi && typeof cryptoApi.randomUUID === 'function') {
    return cryptoApi.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Chỉ id dạng UUID mới được đẩy lên Supabase (dữ liệu mock `inv-1` không tồn tại ở đó). */

export const isUuid = (value: string): boolean => UUID_PATTERN.test(value);

/**
 * Tự động tạo Mã ID nhân viên / Mã người giới thiệu độc nhất từ họ tên tiếng Việt.
 * Quy tắc: Các chữ cái đầu của họ và tên đệm + toàn bộ tên chính (viết thường, không dấu).
 * Ví dụ: "Nguyễn Văn Đăng" -> "nvdang"
 * Tránh trùng lặp: Nếu "nvdang" đã tồn tại -> sinh tiếp "nvdang1", "nvdang2", ...
 */

export const generateStaffId = (fullName?: string, existingIds: string[] = []): string => {
  if (!fullName || !fullName.trim()) return `user${Date.now().toString().slice(-4)}`;

  const cleanStr = fullName
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .toLowerCase();

  const words = cleanStr.split(/\s+/).filter(Boolean);
  let baseId = '';

  if (words.length === 0) {
    baseId = 'user';
  } else if (words.length === 1) {
    baseId = words[0];
  } else {
    // Chữ cái đầu các từ trước + toàn bộ từ cuối cùng (VD: Nguyen Van Dang -> n + v + dang = nvdang)
    const initials = words.slice(0, -1).map((w) => w.charAt(0)).join('');
    const lastName = words[words.length - 1];
    baseId = `${initials}${lastName}`;
  }

  baseId = baseId.replace(/[^a-z0-9]/g, '') || 'user';

  const existingSet = new Set(
    existingIds
      .filter(Boolean)
      .map((id) => id.trim().toLowerCase())
  );

  if (!existingSet.has(baseId)) {
    return baseId;
  }

  let counter = 1;
  while (existingSet.has(`${baseId}${counter}`)) {
    counter++;
  }
  return `${baseId}${counter}`;
};

// Alias để tương thích

export const generateReferralCode = generateStaffId;

export const MOCK_USERS: Record<UserRole, UserProfile> = {
  tech_manager: {
    id: 'u-techmgr-1',
    username: 'qlkythuat',
    name: 'Quản Lý Kỹ Thuật',
    role: 'tech_manager',
    roleTitle: 'Quản lý kỹ thuật',
    avatarBg: 'bg-teal-600',
    email: 'qlkythuat@vitinhantam.com',
    phone: '0909.053.058',
  },
  sales_manager: {
    id: 'u-salesmgr-1',
    username: 'qlbanhang',
    name: 'Quản Lý Bán Hàng',
    role: 'sales_manager',
    roleTitle: 'Quản lý bán hàng',
    avatarBg: 'bg-indigo-600',
    email: 'qlbanhang@vitinhantam.com',
    phone: '0909.053.058',
  },
  admin: {
    id: 'u-admin-1',
    username: 'thanhphan',
    name: 'Thanh Phan',
    role: 'admin',
    roleTitle: 'Quản trị viên (Admin)',
    avatarBg: 'bg-blue-600',
    email: 'thanhphan@vitinhantam.com',
    phone: '0909.053.058',
  },
  technician: {
    id: 'u-tech-1',
    username: 'tech01',
    name: 'Kỹ thuật viên 01',
    role: 'technician',
    roleTitle: 'Kỹ thuật viên phần cứng & QC',
    avatarBg: 'bg-emerald-600',
    email: 'tech01@vitinhantam.com',
    phone: '0977.123.456',
  },
  outsourced: {
    id: 'u-outsourced-1',
    username: 'ktv_ngoai01',
    name: 'Trần Văn Cường (KTV Thuê Ngoài)',
    role: 'outsourced',
    roleTitle: 'Kỹ thuật viên đối tác / Thuê ngoài',
    avatarBg: 'bg-amber-600',
    email: 'cuong.ktvngoai@vitinhantam.com',
    phone: '0988.765.432',
  },
  salesman: {
    id: 'u-salesman-1',
    username: 'salesman01',
    name: 'Salesman 01',
    role: 'salesman',
    roleTitle: 'NVKD',
    avatarBg: 'bg-orange-600',
    email: 'salesman01@vitinhantam.com',
    phone: '0933.345.679',
  },
};

// ==========================================
// DATABASE SCHEMA TYPES
// ==========================================

export const getQRCodeUrl = (text: string, size = 150): string => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
};

export const formatVND = (amount: number, contactText = 'Liên hệ'): string => {
  if (!amount || amount <= 0) return contactText;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Sinh Mã Khách Hàng tự động theo công thức: [NgàyThángSinh (DDMM)] + [4 số cuối SĐT]
// Ví dụ: Sinh 15/05/1992, SĐT 012345678 -> 15055678. Nếu trùng lặp -> thêm 2 số ngẫu nhiên.

export const generateCustomerCode = (
  birthDate: string,
  phone: string,
  existingCodes: string[] = []
): string => {
  let day = '01';
  let month = '01';

  if (birthDate) {
    if (birthDate.includes('-')) {
      const parts = birthDate.split('-');
      if (parts.length === 3) {
        day = parts[2].padStart(2, '0');
        month = parts[1].padStart(2, '0');
      }
    } else if (birthDate.includes('/')) {
      const parts = birthDate.split('/');
      if (parts.length === 3) {
        day = parts[0].padStart(2, '0');
        month = parts[1].padStart(2, '0');
      }
    }
  }

  const cleanPhone = phone.replace(/\D/g, '');
  const last4 = cleanPhone.slice(-4).padStart(4, '0');
  let code = `${day}${month}${last4}`;

  if (existingCodes.includes(code)) {
    const randomSuffix = Math.floor(10 + Math.random() * 90).toString();
    code = `${code}${randomSuffix}`;
  }

  return code;
};

// Định dạng hiển thị ngày chuẩn DD/MM/YYYY

export const formatDateVN = (dateInput: string | Date | undefined | null): string => {
  if (!dateInput) return '';
  if (typeof dateInput === 'string') {
    // Check if it is already DD/MM/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}/.test(dateInput)) {
      return dateInput.slice(0, 10);
    }
    // Handle YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}/.test(dateInput)) {
      const parts = dateInput.split('T')[0].split('-');
      return parts[2] + '/' + parts[1] + '/' + parts[0];
    }
  }
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return String(dateInput);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return day + '/' + month + '/' + year;
};

// ==========================================
// BLOG & AGENTIC AI CONTENT TYPES
// ==========================================

export const MOCK_BLOG_CATEGORIES: BlogCategory[] = [];

export const MOCK_BLOG_POSTS: BlogPost[] = [];
