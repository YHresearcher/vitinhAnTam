import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    !supabaseUrl.includes('placeholder')
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================
// RBAC (ROLE-BASED ACCESS CONTROL)
// ==========================================
export type UserRole = 'admin' | 'technician' | 'sales';

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
}

export interface UserAccount extends UserProfile {
  username?: string;
  email: string;
  phone: string;
  password: string;
  status: 'active' | 'suspended';
  created_at: string;
  last_login?: string;
  permissions: UserPermissions;
}

export const MOCK_USERS: Record<UserRole, UserProfile> = {
  admin: {
    id: 'u-admin-1',
    username: 'thanhphan',
    name: 'Thanh Phan',
    role: 'admin',
    roleTitle: 'Quản trị viên (Admin)',
    avatarBg: 'bg-blue-600',
    email: 'thanhphan@vitinhantham.vn',
    phone: '0909.053.058',
  },
  technician: {
    id: 'u-tech-1',
    username: 'tech01',
    name: 'Kỹ thuật viên 01',
    role: 'technician',
    roleTitle: 'Kỹ thuật viên phần cứng & QC',
    avatarBg: 'bg-emerald-600',
    email: 'tech01@vitinhantham.vn',
    phone: '0977.123.456',
  },
  sales: {
    id: 'u-sales-1',
    username: 'sales01',
    name: 'Sales 01',
    role: 'sales',
    roleTitle: 'Chuyên viên Bán hàng & CSKH',
    avatarBg: 'bg-purple-600',
    email: 'sales01@vitinhantham.vn',
    phone: '0933.345.678',
  },
};

// ==========================================
// DATABASE SCHEMA TYPES
// ==========================================

export interface Customer {
  id: string;
  customer_code?: string; // Mã khách hàng: DDMM + 4 số cuối SĐT (VD: 15055678)
  full_name: string;
  name?: string;
  birth_date?: string; // YYYY-MM-DD hoặc DD/MM/YYYY
  phone: string;
  address: string;
  area_zone?: string;
  customer_tier?: 'Standard' | 'VIP' | 'Thân thiết';
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
  qc_status: 'pending_test' | 'testing' | 'ready_to_sell' | 'sold' | 'reserved';
  burn_in_duration?: number;
  cost_price?: number;
  import_price?: number;
  retail_price?: number;
  price?: number;
  stock_quantity?: number;
  quantity?: number;
  deposit_amount?: number;
  warranty_months: number;
  shelf_location: string; // Kệ A1, B2, C1...
  image_urls?: string[];
  customer_name?: string;
  customer_phone?: string;
  handover_date?: string;
  created_at?: string;
}

export interface SparePart {
  id: string;
  part_name: string;
  part_type: 'SSD' | 'RAM' | 'CPU' | 'VGA' | 'PSU' | 'Mainboard' | 'Screen' | 'Adapter' | 'ThermalPaste' | 'KeyboardMouse' | string;
  condition: 'new' | 'used'; // Mới 100% hoặc Zin bóc máy / Cũ 99%
  quantity_in_stock: number;
  warranty_months: number;
  distributor?: string;
  unit_cost?: number;
  unit_price: number;
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
  requester_role: 'admin' | 'technician' | 'sales';
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
  estimated_completion?: string; // Thời gian hoàn tất / hẹn trả dự kiến
  repair_deadline?: string;
  warranty_deadline?: string;
  completed_at?: string;
  warranty_until?: string;
  created_at?: string;
}

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
  status: 'pending' | 'preparing' | 'dispatched' | 'on_the_way' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';
  issue_summary?: string;
  issue_description?: string;
  technician_name: string;
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
