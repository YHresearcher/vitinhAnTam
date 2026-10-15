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
    role: 'sales',
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

export const initialFaqs: FaqItem[] = [
  {
    id: 'faq-1',
    icon: 'Clock',
    question: 'Khi máy tính gặp sự cố, An Tâm hỗ trợ kỹ thuật như thế nào?',
    answer: 'Khi máy tính phát sinh vấn đề hoặc cần xử lý kỹ thuật, quý khách chỉ cần nhắn Zalo hoặc gọi trực tiếp. An Tâm luôn ưu tiên ứng phó nhanh nhất có thể: hỗ trợ xử lý từ xa qua UltraViewer/TeamViewer ngay lập tức cho các lỗi phần mềm, hoặc linh hoạt đến hỗ trợ tận nơi đối với các vấn đề phần cứng để công việc của quý khách không bị gián đoạn.',
  },
  {
    id: 'faq-2',
    icon: 'RefreshCw',
    question: 'Chính sách bảo hành và đổi trả linh kiện được xử lý ra sao?',
    answer: 'Linh kiện hoặc máy phát sinh sự cố trong thời gian bảo hành sẽ được kiểm tra và xử lý nhanh chóng. Trường hợp linh kiện lỗi, An Tâm đổi ngay linh kiện tương đương hoặc mới tùy theo cam kết của từng gói cấu hình, không giam máy kéo dài làm ảnh hưởng đến tiến độ công việc của khách hàng.',
  },
  {
    id: 'faq-3',
    icon: 'ShieldCheck',
    question: 'Nâng cấp SSD và cài lại máy có bị mất dữ liệu công việc & hóa đơn không?',
    answer: 'Hoàn toàn an tâm! Kỹ thuật viên áp dụng quy trình sao lưu và Clone nguyên bản từ ổ cứng cũ sang SSD mới. Toàn bộ chữ ký số, hóa đơn điện tử, dữ liệu phần mềm công việc, file ngoài màn hình Desktop và tài khoản Zalo / trình duyệt đều được giữ nguyên 100%, không cần cài đặt lại từ đầu.',
  },
  {
    id: 'faq-4',
    icon: 'CheckCircle2',
    question: 'Máy tính cũ tại An Tâm có được mở nắp kiểm tra linh kiện bên trong không?',
    answer: 'Khách hàng có toàn quyền yêu cầu kỹ thuật mở nắp thùng máy để kiểm tra trực tiếp: bo mạch sạch đẹp nguyên bản chưa qua sửa chữa, tình trạng linh kiện (mới báo mới, cũ báo cũ minh bạch), kiểm tra sức khỏe ổ cứng bằng phần mềm trước khi quyết định nhận máy.',
  },
];

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
export const initialKeyCategories: KeyCategory[] = [
  {
    id: 'cat-win11-pro',
    name: 'WINDOWS 11 PROFESSIONAL',
    type: 'windows',
    description: 'Key Retail chính hãng, kích hoạt 1 lần / 1 máy, sử dụng vĩnh viễn trọn đời (Lifetime)',
    is_default: true,
  },
  {
    id: 'cat-win11-home',
    name: 'WINDOWS 11 HOME',
    type: 'windows',
    description: 'Key Retail chính hãng, kích hoạt 1 lần / 1 máy, sử dụng vĩnh viễn trọn đời (Lifetime)',
    is_default: true,
  },
  {
    id: 'cat-office-2019',
    name: 'OFFICE PRO PLUS 2019',
    type: 'office',
    description: 'Key Retail chính hãng, kích hoạt 1 lần / 1 máy, sử dụng vĩnh viễn trọn đời (Lifetime)',
    is_default: true,
  },
  {
    id: 'cat-office-2021',
    name: 'OFFICE PRO PLUS 2021',
    type: 'office',
    description: 'Key Retail chính hãng, kích hoạt 1 lần / 1 máy, sử dụng vĩnh viễn trọn đời (Lifetime)',
    is_default: true,
  },
  {
    id: 'cat-office-2024',
    name: 'OFFICE PRO PLUS 2024',
    type: 'office',
    description: 'Key Retail chính hãng, kích hoạt 1 lần / 1 máy, sử dụng vĩnh viễn trọn đời (Lifetime)',
    is_default: true,
  },
];

export const initialLicenseKeys: LicenseKeyItem[] = [
  // --- WINDOWS 11 PROFESSIONAL (Retail, 1 lần/máy, vĩnh viễn) ---
  {
    id: 'key-w11p-01',
    category_id: 'cat-win11-pro',
    category_name: 'WINDOWS 11 PROFESSIONAL',
    license_code: 'W269N-WFGWX-YVC9B-4J6C9-T83GX',
    status: 'available',
    unit_price: 350000,
    import_price: 150000,
    notes: 'Key Retail chính hãng, active 1 lần/máy, dùng vĩnh viễn',
    created_at: new Date().toISOString(),
  },
  {
    id: 'key-w11p-02',
    category_id: 'cat-win11-pro',
    category_name: 'WINDOWS 11 PROFESSIONAL',
    license_code: 'VK7JG-NPHTM-C97JM-9MPGT-3V66T',
    status: 'available',
    unit_price: 350000,
    import_price: 150000,
    notes: 'Key Retail chính hãng, active 1 lần/máy, dùng vĩnh viễn',
    created_at: new Date().toISOString(),
  },
  {
    id: 'key-w11p-03',
    category_id: 'cat-win11-pro',
    category_name: 'WINDOWS 11 PROFESSIONAL',
    license_code: 'NF6HC-QH89W-F8WYV-WWXV4-WFG6P',
    status: 'available',
    unit_price: 350000,
    import_price: 150000,
    notes: 'Key Retail chính hãng, active 1 lần/máy, dùng vĩnh viễn',
    created_at: new Date().toISOString(),
  },

  // --- WINDOWS 11 HOME (Retail, 1 lần/máy, vĩnh viễn) ---
  {
    id: 'key-w11h-01',
    category_id: 'cat-win11-home',
    category_name: 'WINDOWS 11 HOME',
    license_code: 'TX9XD-98N7V-6WMQ6-BX7FG-H8Q99',
    status: 'available',
    unit_price: 290000,
    import_price: 120000,
    notes: 'Key Retail chính hãng, active 1 lần/máy, dùng vĩnh viễn',
    created_at: new Date().toISOString(),
  },
  {
    id: 'key-w11h-02',
    category_id: 'cat-win11-home',
    category_name: 'WINDOWS 11 HOME',
    license_code: 'YTMG3-N6DKC-DKB77-7M9GH-8HVX7',
    status: 'available',
    unit_price: 290000,
    import_price: 120000,
    notes: 'Key Retail chính hãng, active 1 lần/máy, dùng vĩnh viễn',
    created_at: new Date().toISOString(),
  },
  {
    id: 'key-w11h-03',
    category_id: 'cat-win11-home',
    category_name: 'WINDOWS 11 HOME',
    license_code: '4CPRK-NM3K3-X6XXQ-RXX86-WXCHW',
    status: 'available',
    unit_price: 290000,
    import_price: 120000,
    notes: 'Key Retail chính hãng, active 1 lần/máy, dùng vĩnh viễn',
    created_at: new Date().toISOString(),
  },

  // --- OFFICE PRO PLUS 2019 (Retail, 1 lần/máy, vĩnh viễn) ---
  {
    id: 'key-off19-01',
    category_id: 'cat-office-2019',
    category_name: 'OFFICE PRO PLUS 2019',
    license_code: 'NMMKJ-6RK4F-KMJVX-8D9MJ-6MWKP',
    status: 'available',
    unit_price: 390000,
    import_price: 180000,
    notes: 'Key Retail chính hãng, active 1 lần/máy, dùng vĩnh viễn',
    created_at: new Date().toISOString(),
  },
  {
    id: 'key-off19-02',
    category_id: 'cat-office-2019',
    category_name: 'OFFICE PRO PLUS 2019',
    license_code: 'W8W6K-3N7KK-P69H8-D8VDG-H8788',
    status: 'available',
    unit_price: 390000,
    import_price: 180000,
    notes: 'Key Retail chính hãng, active 1 lần/máy, dùng vĩnh viễn',
    created_at: new Date().toISOString(),
  },

  // --- OFFICE PRO PLUS 2021 (Retail, 1 lần/máy, vĩnh viễn) ---
  {
    id: 'key-off21-01',
    category_id: 'cat-office-2021',
    category_name: 'OFFICE PRO PLUS 2021',
    license_code: 'FXYTK-NJ27C-K22GT-DD42Q-K8TYQ',
    status: 'available',
    unit_price: 450000,
    import_price: 200000,
    notes: 'Key Retail chính hãng, active 1 lần/máy, dùng vĩnh viễn',
    created_at: new Date().toISOString(),
  },
  {
    id: 'key-off21-02',
    category_id: 'cat-office-2021',
    category_name: 'OFFICE PRO PLUS 2021',
    license_code: 'KDNJ9-G2MPB-HWJB4-DC6C2-6327Y',
    status: 'available',
    unit_price: 450000,
    import_price: 200000,
    notes: 'Key Retail chính hãng, active 1 lần/máy, dùng vĩnh viễn',
    created_at: new Date().toISOString(),
  },
  {
    id: 'key-off21-03',
    category_id: 'cat-office-2021',
    category_name: 'OFFICE PRO PLUS 2021',
    license_code: 'TKN68-GX9QT-HFBF8-FC26H-R223P',
    status: 'available',
    unit_price: 450000,
    import_price: 200000,
    notes: 'Key Retail chính hãng, active 1 lần/máy, dùng vĩnh viễn',
    created_at: new Date().toISOString(),
  },

  // --- OFFICE PRO PLUS 2024 (Retail, 1 lần/máy, vĩnh viễn) ---
  {
    id: 'key-off24-01',
    category_id: 'cat-office-2024',
    category_name: 'OFFICE PRO PLUS 2024',
    license_code: '2T7NM-39948-DDJ4K-6B9P9-P7X39',
    status: 'available',
    unit_price: 550000,
    import_price: 250000,
    notes: 'Key Retail chính hãng, active 1 lần/máy, dùng vĩnh viễn',
    created_at: new Date().toISOString(),
  },
  {
    id: 'key-off24-02',
    category_id: 'cat-office-2024',
    category_name: 'OFFICE PRO PLUS 2024',
    license_code: 'N9J9Q-Q8BGX-C69WX-KBBKP-M33Y9',
    status: 'available',
    unit_price: 550000,
    import_price: 250000,
    notes: 'Key Retail chính hãng, active 1 lần/máy, dùng vĩnh viễn',
    created_at: new Date().toISOString(),
  },
  {
    id: 'key-off24-03',
    category_id: 'cat-office-2024',
    category_name: 'OFFICE PRO PLUS 2024',
    license_code: 'V4N6J-498C7-M7W84-28B9X-976X3',
    status: 'available',
    unit_price: 550000,
    import_price: 250000,
    notes: 'Key Retail chính hãng, active 1 lần/máy, dùng vĩnh viễn',
    created_at: new Date().toISOString(),
  },
];

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
