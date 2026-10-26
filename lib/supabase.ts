import { createClient, type SupabaseClient } from '@supabase/supabase-js';

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
export type UserRole = 'admin' | 'tech_manager' | 'technician' | 'sales_manager' | 'outsourced' | 'salesman';

export interface UserPermissions {
  can_edit_stock: boolean;
  can_update_repair_status: boolean;
  can_access_payroll: boolean;
  can_manage_users: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  username?: string;
  role: UserRole;
  roleTitle: string;
  avatarBg: string;
  email?: string;
  phone?: string;
  referral_code?: string;
}

export interface UserAccount extends UserProfile {
  username?: string;
  email: string;
  phone: string;
  /** Mật khẩu KHÔNG bao giờ lưu plaintext ở client. Server giữ hash trong .data/users.json. */
  password?: string;
  password_changed?: boolean;
  status: 'active' | 'suspended';
  created_at: string;
  last_login?: string;
  permissions: UserPermissions;
}

/**
 * Sinh id dạng UUID v4.
 * Dùng UUID vì cột `id` trong Supabase là UUID — id kiểu `inv-123` sẽ làm hỏng lệnh insert.
 * `crypto.randomUUID()` bắt buộc phải chạy trong secure context nên cần fallback.
 */
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

export type CustomerTierType = 'standard' | 'member' | 'loyal' | 'vip' | 'vvip';

export interface Customer {
  id: string;
  customer_code?: string; // Mã khách hàng: DDMM + 4 số cuối SĐT (VD: 15055678)
  full_name: string;
  name?: string;
  birth_date?: string; // YYYY-MM-DD hoặc DD/MM/YYYY
  phone: string;
  address: string;
  area_zone?: string;
  customer_tier?: CustomerTierType | 'Standard' | 'VIP' | 'Thân thiết';
  total_spent?: number; // Tổng chi tiêu tích lũy (VNĐ)
  last_purchase_date?: string; // Ngày phát sinh đơn mua hàng/phiếu sửa chữa gần nhất
  assigned_sales_id?: string; // ID nhân viên bán hàng phụ trách
  assigned_sales_name?: string; // Tên nhân viên bán hàng phụ trách
  notes?: string;
  created_at?: string;
}

export interface InventorySpecs {
  cpu: string;
  ram: string;
  ssd: string;
  ssd_health: number; // 0 - 100
  ssd_status: 'Good' | 'Caution' | 'Bad';
  gpu?: string;
  screen?: string;
  power?: string;
}

// Một linh kiện trong máy, ghi nhận lúc nhập máy sau khi test.
export interface MachineComponent {
  type: 'ram' | 'ssd' | 'psu' | 'other';
  serial?: string;
  health?: number; // Sức khỏe SSD (%) — chỉ dùng cho type 'ssd'
  note?: string;
}

export type WarrantyType = 'months' | 'manufacturer';

export interface InventoryItem {
  id: string;
  service_tag: string; // ST-8F4K92X, TP-994L2A
  device_model?: string; // Dell OptiPlex 7060 SFF
  model?: string;
  brand: 'Dell' | 'HP' | 'Lenovo' | 'Asus' | 'Khác' | string;
  form_factor: 'SFF' | 'Mini' | 'Laptop' | 'MT' | string;
  specs?: InventorySpecs;
  specs_summary?: string;
  cpu?: string;
  ram?: string;
  ssd_capacity?: string;
  ssd_health?: number;
  serial_number?: string;
  qc_status: 'pending_test' | 'testing' | 'ready_to_sell' | 'sold' | 'reserved' | 'dealer_sold';
  dealer_name?: string;
  dealer_sold_at?: string;
  burn_in_duration?: number;
  cost_price?: number;
  import_price?: number;
  import_date?: string; // YYYY-MM-DD - Ngày nhập hàng vào kho
  source?: 'vtat' | 'reseller' | string; // Nguồn nhập: 'vtat' = kho VTAT (không thời hạn) | 'reseller' = hàng Reseller (tự xoá khỏi kho sau 7 ngày chưa bán)
  retail_price?: number;
  price?: number;
  original_price?: number; // Giá gốc niêm yết (VNĐ)
  sale_price?: number; // Giá giảm khuyến mãi (VNĐ) - nếu = 0 hoặc trống thì bán theo giá gốc
  stock_quantity?: number;
  quantity?: number;
  deposit_amount?: number;
  warranty_months: number;
  warranty_type?: WarrantyType;
  shelf_location: string; // Kệ A1, B2, C1...
  image_urls?: string[];
  // Nhập máy 2026-10-26: thông tin người bán (chỉ nhập khi source = 'reseller')
  seller_name?: string;
  seller_phone?: string;
  seller_note?: string; // Ghi chú liên hệ (Zalo, địa chỉ...)
  // Linh kiện trong máy, ghi sau khi test trước khi nhập (S/N máy nằm ở
  // service_tag/serial_number — tách riêng với S/N từng linh kiện).
  components?: MachineComponent[];
  tested_before_import?: boolean; // Máy đã được test (RAM/SSD/nguồn) trước khi nhập
  customer_name?: string;
  customer_phone?: string;
  customer_code?: string;
  sold_by?: string;
  handover_date?: string;
  created_at?: string;
  reserved_order_code?: string;
  reserved_order_id?: string;
  reserved_delivery_method?: 'pickup' | 'delivery' | string;
  reserved_at?: string;
  reserved_note?: string;
  notes?: string;
}

export interface WarrantyProvision {
  id: string;
  item_id: string;
  item_type: 'machine' | 'spare_part' | 'key' | 'service';
  item_title: string;
  serial_number?: string;
  customer_name: string;
  customer_phone?: string;
  customer_code?: string;
  seller_name?: string;
  sale_date: string; // ISO string
  warranty_months: number;
  warranty_expiry_date: string; // ISO string
  sale_price: number;
  cost_price: number;
  net_profit: number;
  provision_rate: number; // 0.05 (5%)
  provision_amount: number; // net_profit * 0.05
  status: 'pending_approval' | 'locked' | 'unlocked' | 'settled';
  approved_at?: string;
  approved_by?: string;
  unlocked_at?: string;
  settled_at?: string;
  settlement_year?: number;
  notes?: string;
  created_at: string;
}

export interface AdminDeductionItem {
  id: string;
  product_name: string; // Tên thiết bị / sản phẩm bán ra
  product_type: 'machine' | 'key' | 'spare_part'; // Phân loại sản phẩm (Thiết bị máy tính / Key bản quyền / Linh kiện)
  sale_date: string; // Ngày bán
  sale_price: number; // Giá bán
  cost_price: number; // Tiền vốn nhập
  net_profit: number; // Lợi nhuận = Giá bán - Tiền vốn
  admin_rate: number; // 0.05 (5% đối với máy tính/linh kiện) hoặc 0.10 (10% đối với key)
  admin_deduction: number; // Số tiền được trích cho admin
  capital_refund: number; // Tiền vốn hoàn trả = Tiền vốn nhập + 5% lợi nhuận (cho người cho vay vốn)
  customer_name?: string;
  customer_phone?: string;
  seller_name?: string;
  order_code?: string;
  serial_number?: string;
  notes?: string;
  created_at?: string;
}


export interface SparePart {
  id: string;
  part_name: string;
  part_type: 'SSD' | 'RAM' | 'CPU' | 'VGA' | 'PSU' | 'Mainboard' | 'Screen' | 'Adapter' | 'ThermalPaste' | 'KeyboardMouse' | string;
  condition: 'new' | 'used'; // Mới 100% hoặc Zin bóc máy / Cũ 99%
  quantity_in_stock: number;
  warranty_months: number;
  warranty_type?: WarrantyType;
  distributor?: string;
  unit_cost?: number;
  unit_price: number;
  original_price?: number; // Giá gốc niêm yết (VNĐ)
  sale_price?: number; // Giá giảm khuyến mãi (VNĐ) - nếu = 0 hoặc trống thì bán theo giá gốc
  shelf_location?: string;
  notes?: string;
}

export interface SoftwareKeyItem {
  id: string;
  key_code: string;                          // Chuỗi mã key (VD: W269N-WFGWX-YVC9B-4J6C9-T83GX)
  status: 'available' | 'used' | 'revoked'; // Sẵn sàng | Đã kích hoạt/bàn giao | Đã thu hồi/lỗi
  assigned_customer?: string;                // Khách hàng nhận key
  assigned_ticket_code?: string;             // Phiếu sửa chữa / đơn hàng liên kết
  assigned_at?: string;                      // Ngày giờ xuất key
  notes?: string;                            // Ghi chú riêng
}

export interface SoftwareLicense {
  id: string;
  software_name: string;
  software_type: 'os' | 'office' | 'antivirus' | 'accounting' | 'pos' | 'utility' | string;
  license_type: 'oem' | 'retail' | 'subscription' | 'fpp' | string;
  quantity_in_stock: number; // Số lượng license / key sẵn có
  unit_cost: number;         // Giá nhập
  unit_price: number;        // Giá bán lẻ
  duration_months?: number;  // 0 = Vĩnh viễn (Lifetime), 12, 24, 36 tháng
  distributor?: string;
  notes?: string;
  license_keys?: SoftwareKeyItem[]; // Bể chứa key (Key Pool) chi tiết
}

export interface KeyCategory {
  id: string;
  name: string; // Tên phân loại (ví dụ: WINDOWS 11 PROFESSIONAL, WINDOWS 11 HOME, OFFICE PRO PLUS 2021)
  type: 'windows' | 'office' | 'others';
  description: string; // Mô tả đặc tính key
  is_default: boolean; // true nếu là phân loại mặc định (không cho phép xóa)
  /** Giá nhập mặc định của phân loại — tự điền khi thêm key mới (null = chưa đặt) */
  default_import_price?: number | null;
  /** Giá bán mặc định của phân loại — tự điền khi thêm key mới (null = chưa đặt) */
  default_unit_price?: number | null;
  created_at?: string;
}

export interface LicenseKeyItem {
  id: string;
  category_id: string;
  category_name: string;
  license_code: string; // XXXXX-XXXXX-XXXXX-XXXXX-XXXXX
  status: 'available' | 'reserved' | 'assigned' | 'activated' | 'used' | 'faulty';
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  assigned_to_customer?: string;
  assigned_to_phone?: string;
  assigned_at?: string;
  request_id?: string;
  faulty_reason?: string;
  release_request_id?: string;
  /** Giá nhập (giá đầu vào) — dùng cho quản lý doanh thu / lãi gộp (chỉ Admin xem) */
  import_price?: number;
  /** Giá bán tham khảo */
  unit_price?: number;
  notes?: string;
  created_at: string;
  activated_at?: string;
}

export interface KeyReleaseRequest {
  id: string;
  request_code: string; // VD: REQ-KEY-001
  requester_id?: string;
  requester_name: string;
  requester_role: UserRole;
  customer_name: string;
  customer_phone: string;
  customer_email: string; // Bắt buộc
  category_id: string;
  category_name: string;
  status: 'pending' | 'approved' | 'approved_waiting_test' | 'activated' | 'active_confirmed' | 'faulty_re_requesting' | 'auto_re_requested' | 'rejected';
  assigned_key_id?: string;
  assigned_key_code?: string;
  released_key_id?: string;
  released_key_code?: string;
  approved_by_admin?: string;
  approved_at?: string;
  faulty_history?: Array<{
    key_code: string;
    reason: string;
    timestamp: string;
  }>;
  faulty_reason?: string;
  admin_note?: string;
  email_sent?: boolean;
  email_sent_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerOrder {
  id: string;
  order_code: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  device_name: string;
  device_price: number;
  device_tag?: string;
  payment_method: 'qr' | 'cash';
  delivery_method: 'pickup' | 'delivery';
  // Người giao hàng gán ở bước xuất kho (migration 2026-10-26: 3 cột này
  // trước đó chưa từng tồn tại nên việc gán bị lặng lẽ bỏ qua).
  delivery_staff_id?: string;
  delivery_staff_name?: string;
  delivery_fee?: number;
  note?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  confirmed_by?: string;
  confirmed_at?: string;
  created_at?: string;
}

export interface KeyEmailTemplateConfig {
  sender_name: string;
  sender_email: string;
  subject: string;
  content_template: string;
  support_phone: string;
  support_zalo: string;
}


export interface MultiTierWarranty {
  chassis_months: number; // Tầng 1: Thân máy (VD: 12 tháng)
  ssd_months: number;     // Tầng 2: SSD chính hãng (VD: 36 tháng)
  ram_months: number;     // Tầng 2: RAM mới (VD: 36 tháng)
  software_days: number;  // Tầng 3: Hỗ trợ phần mềm từ xa (VD: 30 ngày)
  expiry_date?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  desc?: string;
  price: number;
  warranty_tier?: string;
}

export interface ServiceTicket {
  id: string;
  ticket_code: string; // #TK-2025-0590
  customer_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  device_service_tag?: string;
  service_tag?: string;
  device_name?: string;
  device_model?: string;
  ticket_type?: 'counter' | 'onsite';
  reception_mode?: 'counter' | 'mobile';
  dispatch_address?: string;
  technician_name: string;
  selected_services?: ServiceItem[];
  parts_used?: Array<{
    part_name: string;
    quantity: number;
    price: number;
    warranty_months?: number;
  }>;
  multi_tier_warranty?: MultiTierWarranty;
  total_amount?: number;
  estimated_cost?: number;
  actual_cost?: number;
  visual_condition?: string;
  issue_description?: string;
  issueDescription?: string;
  inspection_photos?: string[];
  status:
    | 'received'
    | 'diagnosing'
    | 'in_progress'
    | 'processing'
    | 'ready'
    | 'ready_deliver'
    | 'completed'
    | 'delivered'
    | 'cancelled';
  technician_note?: string;
  service_category?: 'sua_chua' | 'bao_hanh'; // 'sua_chua' = Sửa chữa, 'bao_hanh' = Bảo hành
  warranty_duration_months?: number; // Thời gian bảo hành (tháng)
  warranty_type?: WarrantyType;
  estimated_completion?: string; // Thời gian hoàn tất / hẹn trả dự kiến
  repair_deadline?: string;
  warranty_deadline?: string;
  completed_at?: string;
  warranty_until?: string;
  technician_fee?: number; // Tiền công / thù lao trả cho KTV cho phiếu này (VNĐ)
  fee_synced_to_payroll?: boolean; // Đã tự động kết chuyển sang bảng lương KTV chưa
  use_zalo?: boolean;
  created_at?: string;
}

export type OnsiteDispatchStatus =
  | 'pending'
  | 'dispatched'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'preparing'
  | 'on_the_way'
  | 'arrived';

export interface OnsiteDispatch {
  id: string;
  ticket_code?: string;
  customer_name: string;
  phone?: string;
  customer_phone?: string;
  address: string;
  area_zone?: string; // P.2 Tân An, TT. Thủ Thừa...
  scheduled_time?: string;
  distance_km?: number;
  estimated_arrival_minutes?: number;
  urgency?: 'normal' | 'urgent';
  status: OnsiteDispatchStatus;
  issue_summary?: string;
  issue_description?: string;
  technician_name: string;
  technician_id?: string; // ID tài khoản KTV được giao (để KTV thấy việc của mình)
  technician_fee?: number; // Tiền công / thù lao trả cho KTV ca này (VNĐ)
  fee_synced_to_payroll?: boolean; // Đã tự động kết chuyển sang bảng lương KTV chưa
  created_at?: string;
}

export interface ShiftLog {
  id: string;
  technician_name?: string;
  ktv_name?: string;
  ktv_role?: string;
  shift_date: string;
  shift_name?: string;
  shift_type?: 'full_day' | 'morning' | 'afternoon' | 'night_onsite' | string;
  base_wage: number;
  tickets_completed: number;
  commission_per_ticket?: number;
  total_commission?: number;
  bonus_amount?: number;
  bonus?: number;
  total_wage?: number;
  notes?: string;
  created_at?: string;
}

// ==========================================
// HELPERS
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

export interface BlogCategory {
  id: string;
  name: string;
  name_en?: string;
  slug: string;
  description?: string;
  created_at?: string;
}

export interface FaqSchemaItem {
  question: string;
  answer: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string; // Clean HTML
  content_json?: Record<string, unknown>; // Tiptap JSON AST
  cover_image?: string;
  category_id?: string;
  category?: BlogCategory;
  tags: string[];
  author_id?: string;
  author_name: string;
  status: 'draft' | 'published' | 'archived';
  
  // SEO & Schema
  meta_title?: string;
  meta_description?: string;
  focus_keyword?: string;
  faq_schema?: FaqSchemaItem[];

  // Bản dịch tiếng Anh (dịch 1 lần, lưu cố định — hiển thị khi khách chọn English)
  title_en?: string;
  excerpt_en?: string;
  content_en?: string;
  meta_title_en?: string;
  meta_description_en?: string;
  faq_schema_en?: FaqSchemaItem[];
  
  // Reading metrics
  reading_time_minutes: number;
  word_count: number;
  
  // Business Grounding & CRO
  related_inventory_ids?: string[];
  service_cta_type?: 'spa_laptop' | 'cai_win' | 'cuu_du_lieu' | 'none' | string;
  
  view_count: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface FaqItem {
  id: string;
  icon: string;
  question: string;
  answer: string;
}

export interface CustomerReview {
  id: string;
  name: string;
  role: string;
  comment: string;
  service: string;
  location: string;
  rating?: number;
}

export const MOCK_BLOG_CATEGORIES: BlogCategory[] = [];

export const MOCK_BLOG_POSTS: BlogPost[] = [];

