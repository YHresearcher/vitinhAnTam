import {
  Customer,
  InventoryItem,
  SparePart,
  SoftwareLicense,
  ServiceTicket,
  OnsiteDispatch,
  ShiftLog,
  UserAccount,
  KeyCategory,
  LicenseKeyItem,
  KeyReleaseRequest,
  KeyEmailTemplateConfig,
  WarrantyProvision,
} from './supabase';

// ==========================================
// THIẾT LẬP DỮ LIỆU THỰC - TOÀN BỘ DỮ LIỆU ĐƯỢC ĐỒNG BỘ TRỰC TIẾP TỪ SUPABASE
// ==========================================

export const initialCustomers: Customer[] = [];
export const initialInventory: InventoryItem[] = [];
export const initialSpareParts: SparePart[] = [];
export const initialSoftwareLicenses: SoftwareLicense[] = [];
export const initialTickets: ServiceTicket[] = [];
export const initialOnsiteDispatches: OnsiteDispatch[] = [];
export const initialShiftLogs: ShiftLog[] = [];

// ==========================================
// INITIAL USERS & RBAC STAFF LIST (Tài khoản mẫu ban đầu nếu Supabase users trống)
// ==========================================
export const initialUsers: UserAccount[] = [
  {
    id: 'u-admin-1',
    username: 'tphan',
    name: 'Thanh Phan',
    email: 'thanhphan@vitinhantam.com',
    phone: '0909.053.058',
    role: 'admin',
    roleTitle: 'Quản trị viên (Admin)',
    avatarBg: 'bg-blue-600',
    referral_code: 'tphan',
    status: 'active',
    created_at: '2024-01-15T08:00:00Z',
    last_login: new Date().toISOString(),
    permissions: {
      can_edit_stock: true,
      can_update_repair_status: true,
      can_access_payroll: true,
      can_manage_users: true,
    },
  },
  {
    id: 'u-sales-1',
    username: 'sales01',
    name: 'Sales 01',
    email: 'sales01@vitinhantam.com',
    phone: '0933.345.678',
    role: 'sales_manager',
    roleTitle: 'Chuyên viên Bán hàng & CSKH',
    avatarBg: 'bg-purple-600',
    referral_code: 'sales01',
    status: 'active',
    created_at: '2024-05-20T08:00:00Z',
    last_login: new Date().toISOString(),
    permissions: {
      can_edit_stock: false,
      can_update_repair_status: false,
      can_access_payroll: false,
      can_manage_users: false,
    },
  },
  {
    id: 'u-tech-1',
    username: 'ktv01',
    name: 'Kỹ thuật viên 01',
    email: 'tech01@vitinhantam.com',
    phone: '0977.123.456',
    role: 'technician',
    roleTitle: 'Kỹ thuật viên phần cứng & QC',
    avatarBg: 'bg-emerald-600',
    referral_code: 'ktv01',
    status: 'active',
    created_at: '2024-02-01T08:30:00Z',
    last_login: new Date().toISOString(),
    permissions: {
      can_edit_stock: false,
      can_update_repair_status: true,
      can_access_payroll: false,
      can_manage_users: false,
    },
  },
  {
    id: 'u-outsourced-1',
    username: 'tvcuong',
    name: 'Trần Văn Cường (KTV Thuê Ngoài)',
    email: 'cuong.ktvngoai@vitinhantam.com',
    phone: '0988.765.432',
    role: 'outsourced',
    roleTitle: 'Kỹ thuật viên đối tác / Thuê ngoài',
    avatarBg: 'bg-amber-600',
    referral_code: 'tvcuong',
    status: 'active',
    created_at: '2024-06-10T08:00:00Z',
    last_login: new Date().toISOString(),
    permissions: {
      can_edit_stock: false,
      can_update_repair_status: true,
      can_access_payroll: false,
      can_manage_users: false,
    },
  },
];

// ==========================================
// FAQ ITEMS
// ==========================================
export interface FaqItem {
  id: string;
  icon: string;
  question: string;
  answer: string;
}

export const initialFaqs: FaqItem[] = [];

// ==========================================
// CUSTOMER REVIEWS
// ==========================================
export interface CustomerReview {
  id: string;
  name: string;
  role: string;
  comment: string;
  service: string;
  location: string;
  rating?: number;
}

export const initialCustomerReviews: CustomerReview[] = [];

// ==========================================
// KEY MANAGEMENT & RELEASE SYSTEM
// ==========================================
export const initialKeyCategories: KeyCategory[] = [];

export const initialLicenseKeys: LicenseKeyItem[] = [];

export const initialKeyEmailTemplate: KeyEmailTemplateConfig = {
  sender_name: 'Vi Tính An Tâm',
  sender_email: 'hotro@vitinhantam.com',
  subject: '[Vi Tính An Tâm] Bàn Giao Bản Quyền Phần Mềm: {PRODUCT_NAME}',
  support_phone: '0909.053.058',
  support_zalo: '0909.053.058',
  content_template: `Kính gửi Quý khách {CUSTOMER_NAME},

Vi Tính An Tâm xin trân trọng gửi đến Quý khách thông tin bản quyền chính hãng đã được kích hoạt và xuất kho:

SẢN PHẨM: {PRODUCT_NAME}
MÃ BẢN QUYỀN (KEY): {LICENSE_KEY}
NGÀY XUẤT KEY: {RELEASE_DATE}

HƯỚNG DẪN KÍCH HOẠT:
1. Mở Start Menu -> Cài đặt (Settings) -> Hệ thống (System) -> Kích hoạt (Activation).
2. Chọn "Thay đổi khóa sản phẩm" (Change product key) và nhập mã bản quyền ở trên.
3. Nhấn "Tiếp theo" và chọn "Kích hoạt" (Activate).

CHÍNH SÁCH BẢO HÀNH & HỖ TRỢ:
- Bản quyền được bảo hành trọn đời theo chính sách của Vi Tính An Tâm.
- Mọi thắc mắc kỹ thuật xin vui lòng liên hệ Hotline: {HOTLINE_HO_TRO} hoặc Zalo CSKH: {ZALO_HO_TRO}.

Trân trọng cảm ơn Quý khách đã tin tưởng và đồng hành cùng Vi Tính An Tâm!`,
};

export const initialKeyReleaseRequests: KeyReleaseRequest[] = [];
export const initialWarrantyProvisions: WarrantyProvision[] = [];
