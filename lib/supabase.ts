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

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  avatarBg: string;
}

export const MOCK_USERS: Record<UserRole, UserProfile> = {
  admin: {
    id: 'u-admin-1',
    name: 'Nguyễn Văn An',
    role: 'admin',
    roleTitle: 'Quản trị viên trưởng',
    avatarBg: 'bg-blue-600',
  },
  technician: {
    id: 'u-tech-1',
    name: 'Trịnh Minh Tuấn',
    role: 'technician',
    roleTitle: 'Kỹ thuật viên phần cứng',
    avatarBg: 'bg-emerald-600',
  },
  sales: {
    id: 'u-sales-1',
    name: 'Lê Thu Hà',
    role: 'sales',
    roleTitle: 'Chuyên viên bán hàng & CSKH',
    avatarBg: 'bg-purple-600',
  },
};

// ==========================================
// DATABASE SCHEMA TYPES
// ==========================================

export interface Customer {
  id: string;
  full_name: string;
  name?: string;
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
  part_type: 'SSD' | 'RAM' | 'ThermalPaste' | 'Adapter' | 'Mainboard' | string;
  quantity_in_stock: number;
  warranty_months: number;
  distributor?: string;
  unit_cost?: number;
  unit_price: number;
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
  estimated_completion?: string;
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

export const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};
