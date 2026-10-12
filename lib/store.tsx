'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  supabase,
  isSupabaseConfigured,
  UserRole,
  UserAccount,
  Customer,
  InventoryItem,
  SparePart,
  SoftwareLicense,
  SoftwareKeyItem,
  ServiceTicket,
  OnsiteDispatch,
  ShiftLog,
  generateCustomerCode,
  KeyCategory,
  LicenseKeyItem,
  KeyReleaseRequest,
  KeyEmailTemplateConfig,
  WarrantyProvision,
  CustomerOrder,
  BlogPost,
  BlogCategory,
  MOCK_BLOG_POSTS,
  MOCK_BLOG_CATEGORIES,
  createId,
  isUuid,
} from './supabase';
import {
  initialUsers,
  FaqItem,
  CustomerReview,
  initialFaqs,
  initialKeyCategories,
  initialLicenseKeys,
  initialKeyEmailTemplate,
} from './mockData';


export interface ZaloContactItem {
  id: string;
  name: string;
  phone: string;
  role?: string;
}

export interface SystemSettings {
  brandSlogan?: string;
  hotline: string;
  zaloNumber: string;
  zaloLink: string;
  zaloContacts?: ZaloContactItem[];
  whatsappNumber: string;
  whatsappLink: string;
  email: string;
  address: string;
  streetAddress: string;
  district: string;
  city: string;
  serviceAreas: string;
  workingHoursWeekday: string;
  workingHoursWeekend: string;
  primeHours: string;
  footerAbout: string;
  footerCopyright: string;
  storeName: string;
  technicalHotline?: string;
  googleMapsEmbedUrl?: string;

  // Cấu hình QR Code Thanh Toán & Ngân Hàng (Hiển thị khi mua hàng)
  paymentQrUrl?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  paymentQrNote?: string;

  // Cấu hình Tích hợp Zalo Bot API (bot-api.zapps.me)
  botApiBaseUrl?: string;
  zaloBotToken?: string;
  zaloBotSecretToken?: string;
  zaloDefaultChatId?: string;
  customWebhookUrl?: string;
  notifyOnNewBooking?: boolean;
  notifyOnNewOrder?: boolean;
  notifyOnNewTicket?: boolean;
  notifyOnKeyRequest?: boolean;
  notifyOnSaleSuccess?: boolean;
}

export const initialSystemSettings: SystemSettings = {
  brandSlogan: 'Bán bằng tâm để bạn an tâm',
  hotline: '0909.053.058',
  zaloNumber: '0909053058',
  zaloLink: 'https://zalo.me/0909053058',
  zaloContacts: [
    { id: 'zalo-1', name: 'Kỹ Thuật 1', phone: '123456', role: 'Tư vấn bán hàng & cấu hình máy' },
    { id: 'zalo-2', name: 'Kỹ Thuật 2', phone: '345678', role: 'Hỗ trợ phần cứng & bảo hành' },
    { id: 'zalo-3', name: 'Kỹ Thuật 3', phone: '678910', role: 'Cứu hộ khẩn cấp & key bản quyền' },
  ],
  whatsappNumber: '0909053058',
  whatsappLink: 'https://wa.me/84909053058',
  email: 'lienhe@vitinhantam.com',
  address: '52 Nguyễn Cửu Vân, P. Long An, tỉnh Tây Ninh',
  streetAddress: '52 Nguyễn Cửu Vân',
  district: 'P. Long An',
  city: 'Tây Ninh',
  serviceAreas: 'Khu vực địa phương & các vùng lân cận',
  workingHoursWeekday: '08h00 - 17h30 (Hỗ trợ linh hoạt: 17h30 - 21h00)',
  workingHoursWeekend: '08h00 - 21h00 (Cả ngày)',
  primeHours: '17:30 - 21:00',
  footerAbout: 'Chuyên cung cấp PC/laptop tuyển chọn Dell, HP, ThinkPad & dịch vụ hỗ trợ kỹ thuật, bảo hành nhanh chóng, tận tâm.',
  footerCopyright: `© ${new Date().getFullYear()} Vi Tính An Tâm (vitinhantam.com) - Bán bằng tâm để bạn an tâm.`,
  storeName: 'Vi Tính An Tâm',

  // Mặc định cấu hình QR Code Thanh Toán & Ngân Hàng
  paymentQrUrl: '',
  bankName: 'MB Bank (Ngân hàng Quân Đội)',
  bankAccountNumber: '0909053058',
  bankAccountName: 'VI TINH AN TAM',
  paymentQrNote: 'Vui lòng quét mã QR hoặc chuyển khoản với nội dung: [Mã đơn hàng] - [Số điện thoại].',

  // Mặc định cấu hình Zalo Bot & Webhook
  botApiBaseUrl: '',
  zaloBotToken: '',
  zaloBotSecretToken: '',
  zaloDefaultChatId: '',
  customWebhookUrl: '',
  notifyOnNewBooking: true,
  notifyOnNewOrder: true,
  notifyOnNewTicket: true,
  notifyOnKeyRequest: true,
  notifyOnSaleSuccess: true,
};

interface StoreContextType {
  // System Settings & Language
  systemSettings: SystemSettings;
  updateSystemSettings: (data: Partial<SystemSettings>) => Promise<boolean>;
  currentLang: 'vi' | 'en';
  setLang: (lang: 'vi' | 'en') => void;

  // Theme (light/dark)
  themeMode: 'light' | 'dark';
  toggleTheme: () => void;

  // RBAC Profile & Auth & Member Management
  currentUser: UserAccount;
  users: UserAccount[];
  isLoggedIn: boolean;
  isLoggingOut: boolean;
  logoutCountdown: number;
  triggerImmediateRedirectToLogin: () => void;
  loginWithCredentials: (
    email: string,
    password: string
  ) => Promise<{
    success: boolean;
    mustChangePassword?: boolean;
    message: string;
    user?: UserAccount;
  }>;
  logout: () => void;
  canEditStock: () => boolean;
  canUpdateRepairStatus: () => boolean;
  canAccessPayroll: () => boolean;
  canAccessFinancials: () => boolean;
  canAccessSettings: () => boolean;
  canManageUsers: () => boolean;
  canAssignTasks: () => boolean; // Admin & Tech Lead (Technician) can assign/reassign tickets and dispatches
  canSellAndEditWarranty: () => boolean; // Admin & Sales have full access to sell, edit customer, serial & warranty
  canAccessCRM: () => boolean; // Admin & Sales have full CRM access, KTV view-only

  // Task / Ticket assignment actions
  assignTicketTechnician: (id: string, technicianName: string) => Promise<boolean>;
  assignDispatchTechnician: (id: string, technicianName: string) => Promise<boolean>;

  // CRM Customer actions
  addCustomer: (customer: Omit<Customer, 'id' | 'created_at'>) => Promise<Customer>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<boolean>;
  deleteCustomer: (id: string) => Promise<boolean>;

  // Sales & Handover action (Admin & Sales)
  sellInventoryItem: (params: {
    itemId: string;
    customerName: string;
    customerPhone: string;
    birthDate: string;
    customerAddress: string;
    serialNumber: string;
    warrantyMonths: number;
    soldPrice?: number;
    notes?: string;
    saleDate?: string;
  }) => Promise<{ success: boolean; customerCode: string; message: string }>;

  sellSparePart: (params: {
    partId: string;
    customerName: string;
    customerPhone: string;
    customerAddress?: string;
    quantity: number;
    warrantyMonths: number;
    soldPrice: number;
    saleDate?: string;
  }) => Promise<{ success: boolean; message: string }>;

  // Member management actions (Admin)
  updateUser: (id: string, data: Partial<UserAccount>) => Promise<boolean>;
  changeUserPassword: (id: string, newPassword: string) => Promise<{ ok: boolean; message?: string }>;
  resetUserPassword: (id: string) => Promise<{ ok: boolean; message?: string }>;
  addUser: (user: Omit<UserAccount, 'id' | 'created_at'>) => Promise<UserAccount>;
  deleteUser: (id: string) => Promise<boolean>;

  // Data Collections
  inventory: InventoryItem[];
  customers: Customer[];
  tickets: ServiceTicket[];
  spareParts: SparePart[];
  softwareLicenses: SoftwareLicense[];
  onsiteDispatches: OnsiteDispatch[];
  shiftLogs: ShiftLog[];
  pendingOrders: CustomerOrder[];
  pendingOrdersCount: number;
  fetchPendingOrders: () => Promise<CustomerOrder[]>;
  confirmPendingOrder: (order: CustomerOrder) => Promise<boolean>;

  // Sync state
  isUsingSupabase: boolean;
  isLoading: boolean;
  syncStatus: 'synced' | 'local' | 'syncing';
  syncError: string | null;
  lastSyncedAt: string | null;
  syncWithSupabase: () => Promise<void>;

  // Public Warranty Finder
  findWarrantyByTagOrPhone: (query: string) => {
    item?: InventoryItem;
    ticket?: ServiceTicket;
    customer?: Customer;
  } | null;

  // Inventory actions
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'created_at'>) => Promise<InventoryItem>;
  updateInventoryItem: (id: string, data: Partial<InventoryItem>) => Promise<void>;
  updateInventoryStock: (id: string, newQuantity: number) => Promise<boolean>; // Restricted to Admin
  updateQcStatus: (id: string, status: InventoryItem['qc_status']) => Promise<void>; // Tech & Admin
  deleteInventoryItem: (id: string) => Promise<boolean>; // Restricted to Admin
  reserveInventoryItem: (params: {
    itemId: string;
    customerName: string;
    customerPhone: string;
    orderCode?: string;
    orderId?: string;
    deliveryMethod?: 'pickup' | 'delivery' | string;
    note?: string;
  }) => Promise<boolean>;
  cancelReservationItem: (itemId: string, orderId?: string) => Promise<boolean>;

  // Spare parts actions (Linh kiện mới & cũ)
  addSparePart: (part: Omit<SparePart, 'id'>) => Promise<SparePart>;
  updateSparePart: (id: string, data: Partial<SparePart>) => Promise<boolean>;
  deleteSparePart: (id: string) => Promise<boolean>;

  // Software license actions (Phần mềm & Bản quyền)
  addSoftwareLicense: (item: Omit<SoftwareLicense, 'id'>) => Promise<SoftwareLicense>;
  updateSoftwareLicense: (id: string, data: Partial<SoftwareLicense>) => Promise<boolean>;
  deleteSoftwareLicense: (id: string) => Promise<boolean>;
  addSoftwareKeys: (softwareId: string, keys: string[], notes?: string) => Promise<boolean>;
  assignSoftwareKey: (softwareId: string, keyId: string, info: { customerName: string; ticketCode?: string; notes?: string }) => Promise<boolean>;
  updateSoftwareKeyStatus: (softwareId: string, keyId: string, status: SoftwareKeyItem['status'], notes?: string) => Promise<boolean>;
  deleteSoftwareKey: (softwareId: string, keyId: string) => Promise<boolean>;

  // Ticket actions
  addServiceTicket: (ticket: Omit<ServiceTicket, 'id' | 'created_at'>) => Promise<ServiceTicket>;
  updateTicketStatus: (id: string, status: ServiceTicket['status']) => Promise<boolean>; // Tech & Admin only
  updateTicketDetails: (id: string, updates: Partial<ServiceTicket>) => Promise<boolean>;

  // Onsite dispatch actions
  updateDispatchStatus: (id: string, status: OnsiteDispatch['status']) => Promise<void>;

  // Shift & Payroll (Admin Only)
  addShiftLog: (shift: Omit<ShiftLog, 'id' | 'created_at'>) => Promise<ShiftLog>;

  // FAQ & Reviews (Admin Management)
  faqs: FaqItem[];
  addFaq: (faq: Omit<FaqItem, 'id'>) => Promise<FaqItem>;
  updateFaq: (id: string, data: Partial<FaqItem>) => Promise<boolean>;
  deleteFaq: (id: string) => Promise<boolean>;
  reviews: CustomerReview[];
  addReview: (review: Omit<CustomerReview, 'id'>) => Promise<CustomerReview>;
  deleteReview: (id: string) => Promise<boolean>;

  // Windows / Office Key Management & Release System
  keyCategories: KeyCategory[];
  licenseKeys: LicenseKeyItem[];
  keyReleaseRequests: KeyReleaseRequest[];
  keyEmailTemplate: KeyEmailTemplateConfig;
  addKeyCategory: (category: { name: string; type: 'windows' | 'office' | 'others'; description: string }) => Promise<KeyCategory>;
  deleteKeyCategory: (id: string) => Promise<{ success: boolean; message: string }>;
  addLicenseKey: (item: Omit<LicenseKeyItem, 'id' | 'created_at'>) => Promise<LicenseKeyItem>;
  addBatchLicenseKeys: (categoryId: string, categoryName: string, rawKeysText: string, unitPrice?: number, importPrice?: number) => Promise<{ success: boolean; addedCount: number }>;
  deleteLicenseKey: (id: string) => Promise<boolean>;
  updateLicenseKey: (id: string, updates: Partial<LicenseKeyItem>) => Promise<boolean>;
  takeKeyForCustomer: (data: {
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    category_id: string;
  }) => Promise<{ success: boolean; message: string; key?: LicenseKeyItem; request?: KeyReleaseRequest }>;
  createKeyReleaseRequest: (data: {
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    category_id: string;
  }) => Promise<{ success: boolean; message: string; request?: KeyReleaseRequest }>;
  approveKeyReleaseRequest: (requestId: string, adminNote?: string) => Promise<{ success: boolean; message: string; key?: LicenseKeyItem }>;
  quickRestockAndApproveKeyRequest: (requestId: string, newKeyCode: string, costPrice?: number) => Promise<{ success: boolean; message: string; key?: LicenseKeyItem }>;
  confirmKeyActive: (requestId: string) => Promise<{ success: boolean; message: string }>;
  reportKeyFaulty: (requestId: string, reason: string) => Promise<{ success: boolean; message: string }>;
  restoreFaultyKey: (keyId: string, note?: string) => Promise<{ success: boolean; message: string }>;
  rejectKeyReleaseRequest: (requestId: string, reason: string) => Promise<boolean>;
  updateKeyEmailTemplate: (updates: Partial<KeyEmailTemplateConfig>) => Promise<boolean>;

  // 5% Warranty Provision Fund Lifecycle
  warrantyProvisions: WarrantyProvision[];
  approveWarrantyProvision: (provisionId: string) => Promise<{ success: boolean; message: string }>;
  unlockMaturedWarrantyProvisions: () => Promise<{ unlockedCount: number; unlockedTotal: number }>;
  settleUnlockedWarrantyProvisionsYearEnd: () => Promise<{ settledCount: number; settledTotal: number }>;

  // Blog & SEO Content System
  blogPosts: BlogPost[];
  blogCategories: BlogCategory[];
  addBlogPost: (post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>) => Promise<BlogPost>;
  updateBlogPost: (id: string, data: Partial<BlogPost>) => Promise<boolean>;
  deleteBlogPost: (id: string) => Promise<boolean>;
  addBlogCategory: (cat: Omit<BlogCategory, 'id' | 'created_at'>) => Promise<BlogCategory>;
  updateBlogCategory: (id: string, data: Partial<BlogCategory>) => Promise<boolean>;
  deleteBlogCategory: (id: string) => Promise<boolean>;

  // Reset
  resetToDefault: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEYS = {
  role: 'vtat_user_role_v3',
  userId: 'vtat_user_id_v3',
  users: 'vtat_users_v3',
  inventory: 'vtat_inventory_v3',
  customers: 'vtat_customers_v3',
  tickets: 'vtat_tickets_v3',
  spareParts: 'vtat_spare_parts_v3',
  softwareLicenses: 'vtat_software_licenses_v3',
  onsiteDispatches: 'vtat_onsite_dispatches_v3',
  shiftLogs: 'vtat_shift_logs_v3',
  faqs: 'vtat_faqs_v3',
  reviews: 'vtat_reviews_v3',
  isLoggedIn: 'vtat_is_logged_in_v3',
  keyCategories: 'vtat_key_categories_v3',
  licenseKeys: 'vtat_license_keys_v3',
  keyReleaseRequests: 'vtat_key_release_requests_v3',
  keyEmailTemplate: 'vtat_key_email_template_v3',
  warrantyProvisions: 'vtat_warranty_provisions_v3',
  blogPosts: 'vtat_blog_posts_v3',
  blogCategories: 'vtat_blog_categories_v3',
};

export function StoreProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings?: SystemSettings;
}) {
  // Members & RBAC State & Login status (Mặc định khi mở web là KHÁCH, CHƯA ĐĂNG NHẬP)
  const [users, setUsers] = useState<UserAccount[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<UserAccount>(initialUsers[0]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Collections (Khởi tạo mảng rỗng để không có dữ liệu mockup gây ảnh hưởng đến hiệu quả hệ thống)
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>(initialFaqs);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [softwareLicenses, setSoftwareLicenses] = useState<SoftwareLicense[]>([]);
  const [onsiteDispatches, setOnsiteDispatches] = useState<OnsiteDispatch[]>([]);
  const [shiftLogs, setShiftLogs] = useState<ShiftLog[]>([]);
  const [pendingOrders, setPendingOrders] = useState<CustomerOrder[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [blogCategories, setBlogCategories] = useState<BlogCategory[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    if (initialSettings && typeof initialSettings === 'object') {
      return { ...initialSystemSettings, ...initialSettings };
    }
    if (typeof window !== 'undefined') {
      try {
        const init = (window as unknown as { __INITIAL_SYSTEM_SETTINGS__?: Partial<SystemSettings> }).__INITIAL_SYSTEM_SETTINGS__;
        if (init && typeof init === 'object') {
          return { ...initialSystemSettings, ...init };
        }
        const raw = localStorage.getItem('vtat_system_settings_v2');
        if (raw) {
          return { ...initialSystemSettings, ...JSON.parse(raw) };
        }
      } catch {
        // Fallback to initialSystemSettings on JSON parse/storage failure
      }
    }
    return initialSystemSettings;
  });
  const [currentLang, setCurrentLang] = useState<'vi' | 'en'>('vi');

  // Theme mode (light/dark) — đọc lựa chọn đã lưu, mặc định light
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('vtat_theme_v1');
        if (saved === 'dark' || saved === 'light') return saved;
      } catch (e) {}
    }
    return 'light';
  });

  // Đồng bộ trạng thái theme từ localStorage và DOM ngay khi client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vtat_theme_v1');
      if (saved === 'dark' || saved === 'light') {
        setThemeMode(saved);
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
          const p = window.location.pathname;
          const adminPrefixes = [
            '/dashboard',
            '/tai-chinh',
            '/quan-ly-key',
            '/quan-ly-don-hang',
            '/phieu-sua-chua',
            '/kho-may',
            '/khach-hang',
            '/cuu-ho-onsite',
            '/tien-cong',
            '/thanh-vien',
            '/cai-dat',
            '/bai-viet',
          ];
          const isAdmin = adminPrefixes.some((a) => p === a || p.startsWith(a + '/'));
          if (isAdmin && saved === 'dark') {
            document.documentElement.classList.add('dark');
            document.body.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
            document.body.classList.remove('dark');
          }
        }
      }
    } catch (e) {
      console.warn('Failed to sync theme from localStorage:', e);
    }
  }, []);

  // Windows & Office Keys Pool, Categories, Requests & Email Template
  const [keyCategories, setKeyCategories] = useState<KeyCategory[]>(initialKeyCategories);
  const [licenseKeys, setLicenseKeys] = useState<LicenseKeyItem[]>(initialLicenseKeys);
  const [keyReleaseRequests, setKeyReleaseRequests] = useState<KeyReleaseRequest[]>([]);
  const [keyEmailTemplate, setKeyEmailTemplate] = useState<KeyEmailTemplateConfig>(initialKeyEmailTemplate);

  // 5% Warranty Provision Fund State
  const [warrantyProvisions, setWarrantyProvisions] = useState<WarrantyProvision[]>([]);

  // Connection & Sync
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'local' | 'syncing'>('local');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const isUsingSupabase = isSupabaseConfigured();

  // Logout Countdown & Automatic 3s Redirection
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutCountdown, setLogoutCountdown] = useState(3);

  const triggerImmediateRedirectToLogin = () => {
    setIsLoggingOut(false);
    window.location.assign('/login');
  };

  useEffect(() => {
    if (!isLoggingOut) return;
    if (logoutCountdown <= 0) {
      window.location.assign('/login');
      return;
    }
    const timer = setTimeout(() => {
      setLogoutCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [isLoggingOut, logoutCountdown]);

  // Role permissions
  const canEditStock = () =>
    currentUser.role === 'admin' ||
    currentUser.role === 'tech_manager' ||
    currentUser.permissions?.can_edit_stock === true;
  const canUpdateRepairStatus = () =>
    currentUser.role === 'admin' ||
    currentUser.role === 'tech_manager' ||
    currentUser.role === 'technician' ||
    currentUser.role === 'outsourced' ||
    currentUser.permissions?.can_update_repair_status === true;
  const canAccessPayroll = () =>
    currentUser.role === 'admin' ||
    currentUser.role === 'tech_manager' ||
    currentUser.role === 'sales_manager' ||
    currentUser.permissions?.can_access_payroll === true;
  const canAccessFinancials = () =>
    currentUser.role === 'admin' ||
    currentUser.role === 'tech_manager' ||
    currentUser.role === 'sales_manager' ||
    currentUser.permissions?.can_access_payroll === true;
  const canAccessSettings = () => currentUser.role === 'admin' || currentUser.permissions?.can_manage_users === true;
  const canManageUsers = () => currentUser.role === 'admin' || currentUser.permissions?.can_manage_users === true;
  const canAssignTasks = () =>
    currentUser.role === 'admin' || currentUser.role === 'tech_manager' || currentUser.role === 'technician';
  const canSellAndEditWarranty = () =>
    currentUser.role === 'admin' || currentUser.role === 'sales_manager' || currentUser.role === 'sales';
  const canAccessCRM = () =>
    currentUser.role === 'admin' || currentUser.role === 'sales_manager' || currentUser.role === 'sales';

  /**
   * Đăng nhập: xác thực SERVER-SIDE qua /api/auth/login.
   * Server kiểm tra hash mật khẩu và cấp cookie httpOnly đã ký — client không bao giờ
   * lưu/tự so sánh mật khẩu plaintext nữa.
   */
  const loginWithCredentials = async (
    identifier: string,
    password: string
  ): Promise<{
    success: boolean;
    mustChangePassword?: boolean;
    message: string;
    user?: UserAccount;
  }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = (await response.json().catch(() => null)) as {
        success?: boolean;
        mustChangePassword?: boolean;
        message?: string;
        user?: UserAccount;
      } | null;

      if (!response.ok || !data?.success || !data.user) {
        return {
          success: false,
          message: data?.message || 'Đăng nhập thất bại. Vui lòng thử lại!',
        };
      }

      if (data.mustChangePassword) {
        return {
          success: true,
          mustChangePassword: true,
          message: data.message || 'Tài khoản cần đổi mật khẩu mặc định trước khi sử dụng.',
          user: data.user,
        };
      }

      const found = data.user;
      setCurrentUser(found);
      setIsLoggedIn(true);
      setIsLoggingOut(false);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.role, found.role);
        localStorage.setItem(STORAGE_KEYS.userId, found.id);
        localStorage.setItem(STORAGE_KEYS.isLoggedIn, 'true');
      }
      // Nạp ngay các bảng quản trị nội bộ sau khi nhân sự/admin đăng nhập thành công
      if (typeof syncWithSupabase === 'function') {
        syncWithSupabase().catch((e) => console.warn('Supabase post-login sync warning:', e));
      }
      return {
        success: true,
        message: data.message || `Đăng nhập thành công: ${found.roleTitle} (${found.name})!`,
        user: found,
      };
    } catch (err) {
      console.warn('Không gọi được /api/auth/login:', err);
      return {
        success: false,
        message: 'Không kết nối được máy chủ xác thực. Vui lòng thử lại sau!',
      };
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.isLoggedIn, 'false');
      localStorage.removeItem(STORAGE_KEYS.userId);
      localStorage.removeItem(STORAGE_KEYS.role);
    }
    fetch('/api/auth/logout', { method: 'POST' }).catch((err) => {
      console.warn('Không gọi được /api/auth/logout:', err);
    });
    setLogoutCountdown(3);
    setIsLoggingOut(true);
  };

  // ===== Member Management Actions =====
  // Danh sách thành viên ở client chỉ là bản sao để hiển thị;
  // mật khẩu và toàn bộ quyền hạn thực sự nằm ở server (.data/users.json).

  const persistUsersLocally = (next: UserAccount[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(next));
    }
  };

  const callUsersApi = async (payload: Record<string, unknown>): Promise<Response | null> => {
    try {
      return await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn('Không gọi được /api/auth/users:', err);
      return null;
    }
  };

  const updateUser = async (id: string, data: Partial<UserAccount>): Promise<boolean> => {
    const { password, ...patch } = data;
    const target = users.find((u) => u.id === id);
    if (!target) return false;

    const updatedUser: UserAccount = {
      ...target,
      ...patch,
      permissions: {
        ...target.permissions,
        ...(patch.permissions || {}),
      },
    };
    const next = users.map((u) => (u.id === id ? updatedUser : u));
    setUsers(next);
    persistUsersLocally(next);
    if (currentUser.id === id) setCurrentUser(updatedUser);

    const response = await callUsersApi({ action: 'update', id, patch, password });
    if (response && !response.ok) {
      console.warn('Máy chủ từ chối cập nhật tài khoản:', await response.text().catch(() => ''));
      return false;
    }
    return true;
  };

  const changeUserPassword = async (
    id: string,
    newPassword: string
  ): Promise<{ ok: boolean; message?: string }> => {
    const response = await callUsersApi({ action: 'password', id, password: newPassword });
    if (!response) {
      return { ok: false, message: 'Không gọi được máy chủ — mật khẩu CHƯA thay đổi.' };
    }
    const data = (await response.json().catch(() => null)) as {
      success?: boolean;
      message?: string;
    } | null;
    if (!response.ok || !data?.success) {
      return {
        ok: false,
        message: data?.message || 'Máy chủ từ chối cập nhật mật khẩu — mật khẩu CHƯA thay đổi.',
      };
    }
    return { ok: true };
  };

  const resetUserPassword = async (id: string): Promise<{ ok: boolean; message?: string }> => {
    const response = await callUsersApi({ action: 'reset_password', id });
    if (!response) {
      return { ok: false, message: 'Không gọi được máy chủ — chưa thể reset mật khẩu.' };
    }
    const data = (await response.json().catch(() => null)) as {
      success?: boolean;
      message?: string;
      user?: UserAccount;
    } | null;
    if (!response.ok || !data?.success) {
      return {
        ok: false,
        message: data?.message || 'Máy chủ từ chối reset mật khẩu.',
      };
    }
    if (data.user) {
      const next = users.map((u) => (u.id === id ? { ...u, ...data.user, password_changed: false } : u));
      setUsers(next);
      persistUsersLocally(next);
    }
    return { ok: true, message: data.message };
  };

  const addUser = async (userData: Omit<UserAccount, 'id' | 'created_at'>): Promise<UserAccount> => {
    const { password, ...rest } = userData;
    const cleanUsername = rest.username ? rest.username.trim().toLowerCase() : rest.email.split('@')[0].toLowerCase();
    const newUser: UserAccount = {
      ...rest,
      username: cleanUsername,
      password_changed: false,
      id: `u-${Date.now()}`,
      created_at: new Date().toISOString(),
      permissions: rest.permissions || {
        can_edit_stock: rest.role === 'admin' || rest.role === 'tech_manager',
        can_update_repair_status:
          rest.role === 'admin' ||
          rest.role === 'tech_manager' ||
          rest.role === 'technician' ||
          rest.role === 'outsourced',
        can_access_payroll: rest.role === 'admin' || rest.role === 'tech_manager' || rest.role === 'sales_manager',
        can_manage_users: rest.role === 'admin',
      },
    };

    const response = await callUsersApi({ action: 'create', user: newUser });
    if (response?.ok) {
      const created = (await response.json().catch(() => null)) as { user?: UserAccount } | null;
      if (created?.user) Object.assign(newUser, created.user);
    } else {
      const errData = (await response?.json().catch(() => null)) as { message?: string } | null;
      console.warn('Lỗi thêm tài khoản:', errData?.message);
      if (errData?.message) {
        throw new Error(errData.message);
      }
    }

    const next = [newUser, ...users];
    setUsers(next);
    persistUsersLocally(next);
    return newUser;
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    if (id === currentUser.id) return false;

    const response = await callUsersApi({ action: 'delete', id });
    if (!response || !response.ok) {
      console.warn('Máy chủ từ chối xóa tài khoản.');
      return false;
    }

    const next = users.filter((u) => u.id !== id);
    setUsers(next);
    persistUsersLocally(next);
    return true;
  };

  
  const updateSystemSettings = async (data: Partial<SystemSettings>): Promise<boolean> => {
    setSystemSettings((prev) => {
      const next = { ...prev, ...data };
      if (typeof window !== 'undefined') {
        localStorage.setItem('vtat_system_settings_v2', JSON.stringify(next));
      }
      return next;
    });

    // Đồng bộ cấu hình lên máy chủ & Supabase qua API server (/api/settings)
    // await để đảm bảo đã lưu xong trước khi handler gọi tiếp API (tránh race làm mất cấu hình Bot).
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        console.warn('Máy chủ từ chối lưu cấu hình:', res.status, errJson?.message);
        return false;
      }
      const resData = await res.json().catch(() => null);
      if (resData?.data) {
        setSystemSettings(resData.data);
        if (typeof window !== 'undefined') {
          localStorage.setItem('vtat_system_settings_v2', JSON.stringify(resData.data));
        }
      }
      return true;
    } catch (err) {
      console.warn('Không thể đồng bộ settings lên server:', err);
      return false;
    }
  };

  const setLang = (lang: 'vi' | 'en') => {
    setCurrentLang(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vtat_lang_v2', lang);
      try {
        document.documentElement.lang = lang;
      } catch {}
    }
  };

  const toggleTheme = () => {
    setThemeMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('vtat_theme_v1', next);
          localStorage.setItem('vtat_admin_theme_v1', next);
          if (typeof document !== 'undefined') {
            const p = window.location.pathname;
            const adminPrefixes = [
              '/dashboard',
              '/tai-chinh',
              '/quan-ly-key',
              '/quan-ly-don-hang',
              '/phieu-sua-chua',
              '/kho-may',
              '/khach-hang',
              '/cuu-ho-onsite',
              '/tien-cong',
              '/thanh-vien',
              '/cai-dat',
              '/bai-viet',
            ];
            const isAdmin = adminPrefixes.some((a) => p === a || p.startsWith(a + '/'));
            if (isAdmin && next === 'dark') {
              document.documentElement.classList.add('dark');
              document.body.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
              document.body.classList.remove('dark');
            }
          }
        } catch (e) {
          console.warn('Failed to persist theme preference:', e);
        }
      }
      return next;
    });
  };

  const saveToLocal = (key: string, data: unknown) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {
        console.warn('Local storage save failed:', e);
      }
    }
  };

  /**
   * Ghi lên Supabase CÓ KIỂM TRA LỖI.
   * supabase-js không ném exception — `{ error }` nằm trong kết quả — nên try/catch đơn thuần
   * sẽ không bao giờ bắt được gì và UI vẫn báo thành công trong khi DB không ghi gì.
   */
  const runSupabaseWrite = async (
    operation: () => PromiseLike<{ error: { message: string } | null }>,
    label: string
  ): Promise<boolean> => {
    try {
      const { error } = await operation();
      if (error) {
        console.warn(`${label}: Supabase trả lỗi -> ${error.message}`);
        setSyncError(`${label}: ${error.message}`);
        setSyncStatus('local');
        return false;
      }
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không xác định';
      console.warn(`${label}: không gọi được Supabase ->`, err);
      setSyncError(`${label}: ${message}`);
      setSyncStatus('local');
      return false;
    }
  };

  // Load from Storage or Supabase
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
      // Load saved users
      let currentUsersList = initialUsers;
      if (typeof window !== 'undefined') {
        const savedUsersJson = localStorage.getItem(STORAGE_KEYS.users);
        if (savedUsersJson) {
          try {
            const parsed = JSON.parse(savedUsersJson);
            if (Array.isArray(parsed) && parsed.length > 0) {
              // Không bao giờ khôi phục mật khẩu plaintext (nếu còn sót từ bản cũ)
              currentUsersList = parsed.map((item: Partial<UserAccount>) => {
                const safe: Partial<UserAccount> = { ...item };
                delete safe.password;
                return safe as UserAccount;
              });
              setUsers(currentUsersList);
            }
          } catch (e) {
            console.warn('Failed to parse saved users:', e);
          }
        }

        // Load saved user id or role ONLY if user is already logged in
        const savedLoggedIn = localStorage.getItem(STORAGE_KEYS.isLoggedIn);
        if (savedLoggedIn === 'true') {
          setIsLoggedIn(true);
          const savedUserId = localStorage.getItem(STORAGE_KEYS.userId);
          const savedRole = localStorage.getItem(STORAGE_KEYS.role) as UserRole | null;
          if (savedUserId) {
            const matched = currentUsersList.find((u) => u.id === savedUserId);
            if (matched) setCurrentUser(matched);
          } else if (savedRole) {
            const matched = currentUsersList.find((u) => u.role === savedRole);
            if (matched) setCurrentUser(matched);
          }
        } else {
          setIsLoggedIn(false);
        }
      }

      // Đọc dữ liệu từ Supabase. supabase-js KHÔNG ném exception — lỗi nằm trong `.error`,
      // nên bắt buộc phải kiểm tra từng kết quả, nếu không sẽ báo "đã đồng bộ" sai sự thật.
      const pullFromSupabase = async (includeAdminData: boolean): Promise<boolean> => {
        if (!isUsingSupabase || !supabase) return false;

        // 1. Tải kho máy công khai và blog (dùng cho cả khách vãng lai và nhân sự)
        const [invResult, blogPostRes, blogCatRes] = await Promise.all([
          supabase.from('inventory_items').select('*'),
          supabase.from('blog_posts').select('*').order('created_at', { ascending: false }),
          supabase.from('blog_categories').select('*').order('created_at', { ascending: true }),
        ]);
        if (invResult.error) {
          throw new Error(invResult.error.message);
        }
        setInventory((invResult.data as InventoryItem[]) || []);
        if (blogPostRes.data) setBlogPosts(blogPostRes.data as BlogPost[]);
        if (blogCatRes.data) setBlogCategories(blogCatRes.data as BlogCategory[]);

        // 2. TỐI ƯU SUPABASE EGRESS & BẢO MẬT:
        // Khách vãng lai (chưa đăng nhập): DỪNG LẠI TẠI ĐÂY!
        // Tuyệt đối không kéo 5 bảng bảo mật: customers, service_tickets, spare_parts, onsite_dispatches, shift_logs.
        // Giúp tiết kiệm hơn 90% băng thông Supabase Egress (5GB/tháng) và không làm rò rỉ dữ liệu khách hàng.
        if (!includeAdminData) {
          setLastSyncedAt(new Date().toLocaleTimeString('vi-VN'));
          return true;
        }

        // 3. Nhân sự/Admin đã đăng nhập: Tải các bảng quản trị nội bộ
        const [
          cusResult,
          tckResult,
          spResult,
          onsResult,
          shfResult,
        ] = await Promise.all([
          supabase.from('customers').select('*'),
          supabase.from('service_tickets').select('*'),
          supabase.from('spare_parts').select('*'),
          supabase.from('onsite_dispatches').select('*'),
          supabase.from('shift_logs').select('*'),
        ]);

        const failures = [cusResult, tckResult, spResult, onsResult, shfResult].flatMap(
          (result) => (result.error ? [result.error] : [])
        );
        if (failures.length > 0) {
          throw new Error(failures.map((failure) => failure.message).join(' | '));
        }

        setCustomers((cusResult.data as Customer[]) || []);
        setTickets((tckResult.data as ServiceTicket[]) || []);
        setSpareParts((spResult.data as SparePart[]) || []);
        setOnsiteDispatches((onsResult.data as OnsiteDispatch[]) || []);
        setShiftLogs((shfResult.data as ShiftLog[]) || []);

        setLastSyncedAt(new Date().toLocaleTimeString('vi-VN'));
        return true;
      };

      let supabasePulledOk = false;
      try {
        const isStaffLoggedIn = typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEYS.isLoggedIn) === 'true';
        if (await pullFromSupabase(isStaffLoggedIn)) {
          setSyncStatus('synced');
          supabasePulledOk = true;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Không xác định';
        console.warn('Could not fetch from Supabase, fallback to local storage:', err);
        setSyncError(`Tải dữ liệu Supabase: ${message}`);
      }

      // Local storage fallback / persistence for remaining items (keys, settings, faqs, reviews)
      if (typeof window !== 'undefined') {
        const isLegacyMockId = (id: unknown): boolean => {
          if (typeof id !== 'string') return false;
          return /^(inv-|c\d+$|t\d+$|sp-|lic-|od-|sh-|rev-|k-|p\d+$|s\d+$|TK-2025-059)/.test(id);
        };

        const readJson = <T,>(key: string, apply: (value: T) => void) => {
          const raw = localStorage.getItem(key);
          if (!raw) return;
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              // Lọc bỏ mọi dữ liệu mock tồn đọng trong localStorage của trình duyệt
              const sanitized = parsed.filter((item: any) => !item || !item.id || !isLegacyMockId(item.id));
              apply(sanitized as unknown as T);
              return;
            }
            apply(parsed as T);
          } catch (e) {
            console.warn(`Bỏ qua dữ liệu hỏng trong localStorage (${key}):`, e);
            localStorage.removeItem(key);
          }
        };

        if (!supabasePulledOk) {
          readJson<InventoryItem[]>(STORAGE_KEYS.inventory, setInventory);
          readJson<Customer[]>(STORAGE_KEYS.customers, setCustomers);
          readJson<ServiceTicket[]>(STORAGE_KEYS.tickets, setTickets);
          readJson<SparePart[]>(STORAGE_KEYS.spareParts, setSpareParts);
          readJson<OnsiteDispatch[]>(STORAGE_KEYS.onsiteDispatches, setOnsiteDispatches);
          readJson<ShiftLog[]>(STORAGE_KEYS.shiftLogs, setShiftLogs);
        }

        readJson<SoftwareLicense[]>(STORAGE_KEYS.softwareLicenses, setSoftwareLicenses);
        readJson<FaqItem[]>(STORAGE_KEYS.faqs, setFaqs);
        readJson<CustomerReview[]>(STORAGE_KEYS.reviews, setReviews);
        readJson<KeyCategory[]>(STORAGE_KEYS.keyCategories, (parsed) => {
          if (Array.isArray(parsed) && parsed.length > 0) {
            const merged = [...parsed];
            for (const initCat of initialKeyCategories) {
              const found = merged.find((c) => c.id === initCat.id);
              if (found) {
                found.description = initCat.description;
              } else {
                merged.push(initCat);
              }
            }
            setKeyCategories(merged);
          } else {
            setKeyCategories(initialKeyCategories);
          }
        });

        readJson<LicenseKeyItem[]>(STORAGE_KEYS.licenseKeys, (parsed) => {
          if (Array.isArray(parsed) && parsed.length > 0) {
            const existingCodes = new Set(parsed.map((k) => k.license_code.toUpperCase()));
            const missing = initialLicenseKeys.filter((k) => !existingCodes.has(k.license_code.toUpperCase()));
            const merged = [...parsed, ...missing];
            setLicenseKeys(merged);
          } else {
            setLicenseKeys(initialLicenseKeys);
          }
        });
        readJson<KeyReleaseRequest[]>(STORAGE_KEYS.keyReleaseRequests, setKeyReleaseRequests);
        readJson<KeyEmailTemplateConfig>(STORAGE_KEYS.keyEmailTemplate, setKeyEmailTemplate);
        readJson<WarrantyProvision[]>(STORAGE_KEYS.warrantyProvisions, setWarrantyProvisions);
        readJson<BlogPost[]>(STORAGE_KEYS.blogPosts, setBlogPosts);
        readJson<BlogCategory[]>(STORAGE_KEYS.blogCategories, setBlogCategories);

        readJson<SystemSettings>('vtat_system_settings_v2', (parsed) => {
          setSystemSettings((prev) => ({ ...prev, ...parsed }));
        });

        // Tải cấu hình mới nhất từ máy chủ (.data/settings.json)
        fetch('/api/settings')
          .then((res) => res.json())
          .then((resData) => {
            if (resData?.success && resData?.data) {
              setSystemSettings((prev) => ({ ...prev, ...resData.data }));
              try {
                localStorage.setItem('vtat_system_settings_v2', JSON.stringify(resData.data));
              } catch {}
            }
          })
          .catch(() => {});

        // Tự động hóa nhận diện ngôn ngữ & đồng bộ
        let resolvedLang: 'vi' | 'en' = 'vi';
        const savedLang = localStorage.getItem('vtat_lang_v2');
        if (savedLang === 'vi' || savedLang === 'en') {
          resolvedLang = savedLang;
        } else {
          try {
            const urlParams = new URLSearchParams(window.location.search);
            const queryLang = urlParams.get('lang');
            if (queryLang === 'vi' || queryLang === 'en') {
              resolvedLang = queryLang;
            } else if (typeof navigator !== 'undefined') {
              const navLang = (navigator.language || (navigator.languages && navigator.languages[0]) || '').toLowerCase();
              if (navLang && !navLang.startsWith('vi')) {
                resolvedLang = 'en';
              }
            }
          } catch {}
        }
        setCurrentLang(resolvedLang);
        try {
          document.documentElement.lang = resolvedLang;
        } catch {}
      }

      if (!supabasePulledOk) {
        setSyncStatus('local');
      }
    } finally {
      // Luôn tắt loading — kể cả khi JSON.parse/Supabase lỗi, nếu không app sẽ treo màn hình chờ.
      setIsLoading(false);
    }
  }

  loadData();

  // Cross-tab real-time storage listener
  const handleStorageChange = (e: StorageEvent) => {
    if (!e.newValue) return;
    try {
      if (e.key === STORAGE_KEYS.keyReleaseRequests) {
        setKeyReleaseRequests(JSON.parse(e.newValue));
      } else if (e.key === STORAGE_KEYS.licenseKeys) {
        setLicenseKeys(JSON.parse(e.newValue));
      } else if (e.key === STORAGE_KEYS.keyCategories) {
        setKeyCategories(JSON.parse(e.newValue));
      } else if (e.key === STORAGE_KEYS.tickets) {
        setTickets(JSON.parse(e.newValue));
      }
    } catch {}
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorageChange);
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorageChange);
    }
  };
}, [isUsingSupabase]);

  // Đồng bộ thủ công: kéo dữ liệu mới nhất từ Supabase về (ghi đã xảy ra inline ở từng hành động)
  const syncWithSupabase = async () => {
    if (!isUsingSupabase || !supabase) {
      setSyncError('Chưa cấu hình Supabase hoặc thiếu biến môi trường kết nối.');
      setSyncStatus('local');
      return;
    }
    setSyncStatus('syncing');
    setSyncError(null);
    try {
      const [
        invResult,
        cusResult,
        tckResult,
        spResult,
        onsResult,
        shfResult,
        blogPostResult,
        blogCatResult,
      ] = await Promise.all([
        supabase.from('inventory_items').select('*'),
        supabase.from('customers').select('*'),
        supabase.from('service_tickets').select('*'),
        supabase.from('spare_parts').select('*'),
        supabase.from('onsite_dispatches').select('*'),
        supabase.from('shift_logs').select('*'),
        supabase.from('blog_posts').select('*').order('created_at', { ascending: false }),
        supabase.from('blog_categories').select('*'),
      ]);

      const failures = [invResult, cusResult, tckResult, spResult, onsResult, shfResult].flatMap(
        (result) => (result.error ? [result.error] : [])
      );
      if (failures.length > 0) {
        throw new Error(failures.map((failure) => failure.message).join(' | '));
      }

      const invData = invResult.data ?? [];
      const cusData = cusResult.data ?? [];
      const tckData = tckResult.data ?? [];
      const spData = spResult.data ?? [];
      const onsData = onsResult.data ?? [];
      const shfData = shfResult.data ?? [];
      setInventory(invData as InventoryItem[]);
      setCustomers(cusData as Customer[]);
      setTickets(tckData as ServiceTicket[]);
      setSpareParts(spData as SparePart[]);
      setOnsiteDispatches(onsData as OnsiteDispatch[]);
      setShiftLogs(shfData as ShiftLog[]);
      setBlogPosts((blogPostResult.data as BlogPost[]) || []);
      setBlogCategories((blogCatResult.data as BlogCategory[]) || []);

      setLastSyncedAt(new Date().toLocaleTimeString('vi-VN'));
      setSyncStatus('synced');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không xác định';
      console.error('Sync failed:', err);
      setSyncError(message);
      setSyncStatus('local');
    }
  };

  // Public Warranty Finder Helper
  const findWarrantyByTagOrPhone = (query: string) => {
    const q = query.trim().toUpperCase();
    if (!q) return null;

    // Search by Service Tag
    const matchedItem = inventory.find((item) => item.service_tag.toUpperCase() === q);
    if (matchedItem) {
      const matchedCustomer = customers.find(
        (c) => c.phone === matchedItem.customer_phone || c.full_name === matchedItem.customer_name
      );
      const matchedTicket = tickets.find(
        (t) =>
          t.device_service_tag?.toUpperCase() === q ||
          t.service_tag?.toUpperCase() === q ||
          t.ticket_code.toUpperCase() === q
      );
      return { item: matchedItem, customer: matchedCustomer, ticket: matchedTicket };
    }

    // Search by Phone Number
    const rawDigits = query.replace(/\D/g, '');
    if (rawDigits.length >= 7) {
      const last7 = rawDigits.slice(-7);
      const isMatchPhone = (phone?: string) => {
        if (!phone) return false;
        const p = phone.replace(/\D/g, '');
        return p.includes(rawDigits) || rawDigits.includes(p) || (last7 && p.endsWith(last7));
      };

      const matchedCust = customers.find((c) => isMatchPhone(c.phone));
      const matchedTicket = tickets.find((t) => isMatchPhone(t.customer_phone));
      const matchedItemByPhone = inventory.find((i) => isMatchPhone(i.customer_phone));

      if (matchedCust || matchedTicket || matchedItemByPhone) {
        return { customer: matchedCust, ticket: matchedTicket, item: matchedItemByPhone };
      }
    }

    // Search by Ticket Code
    const matchedTicket = tickets.find((t) => t.ticket_code.toUpperCase().includes(q));
    if (matchedTicket) {
      const matchedCust = customers.find((c) => c.phone === matchedTicket.customer_phone);
      const matchedItem = inventory.find(
        (i) => i.service_tag === matchedTicket.device_service_tag || i.service_tag === matchedTicket.service_tag
      );
      return { ticket: matchedTicket, customer: matchedCust, item: matchedItem };
    }

    return null;
  };

  // Inventory actions
  const addInventoryItem = async (itemData: Omit<InventoryItem, 'id' | 'created_at'>): Promise<InventoryItem> => {
    const newItem: InventoryItem = {
      ...itemData,
      // UUID để khớp cột `id UUID` của Supabase
      id: createId(),
      created_at: new Date().toISOString(),
    };

    setInventory((prev) => {
      const next = [newItem, ...prev];
      saveToLocal(STORAGE_KEYS.inventory, next);
      return next;
    });

    if (isUsingSupabase && supabase) {
      const client = supabase;
      await runSupabaseWrite(
        () => client.from('inventory_items').insert([newItem]),
        'Thêm thiết bị'
      );
    }
    return newItem;
  };

  const updateInventoryItem = async (id: string, data: Partial<InventoryItem>) => {
    setInventory((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, ...data } : item));
      saveToLocal(STORAGE_KEYS.inventory, next);
      return next;
    });

    // Dữ liệu mock (inv-1, inv-2...) không tồn tại trong DB — chỉ ghi khi id là UUID hợp lệ
    if (isUsingSupabase && supabase && isUuid(id)) {
      const client = supabase;
      await runSupabaseWrite(
        () => client.from('inventory_items').update(data).eq('id', id),
        'Cập nhật thiết bị'
      );
    }
  };

  const updateInventoryStock = async (id: string, newQuantity: number): Promise<boolean> => {
    if (!canEditStock()) {
      return false;
    }
    await updateInventoryItem(id, { stock_quantity: newQuantity, quantity: newQuantity });
    return true;
  };

  const updateQcStatus = async (id: string, status: InventoryItem['qc_status']) => {
    if (!canUpdateRepairStatus()) {
      return;
    }
    const item = inventory.find((i) => i.id === id);
    await updateInventoryItem(id, { qc_status: status });

    if (status === 'sold' && item && item.qc_status !== 'sold') {
      try {
        fetch('/api/webhook/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: 'sale_success',
            payload: {
              sellerName: currentUser.name,
              deviceName: item.device_model || item.model || `${item.brand} ${item.form_factor}`,
              serviceTag: item.service_tag,
              serialNumber: item.serial_number || item.service_tag,
              customerName: item.customer_name || 'Khách mua tại kho',
              customerPhone: item.customer_phone || '---',
              customerCode: item.customer_code,
              soldPrice: item.price || item.retail_price || 0,
              warrantyMonths: item.warranty_months || 12,
              shelfLocation: item.shelf_location,
            },
          }),
        }).catch((err) => console.warn('Bot sale notification error:', err));
      } catch {
        // Silently ignore
      }
    }
  };

  const deleteInventoryItem = async (id: string): Promise<boolean> => {
    if (!canEditStock()) {
      return false;
    }
    setInventory((prev) => {
      const next = prev.filter((item) => item.id !== id);
      saveToLocal(STORAGE_KEYS.inventory, next);
      return next;
    });
    if (isUsingSupabase && supabase && isUuid(id)) {
      const client = supabase;
      await runSupabaseWrite(
        () => client.from('inventory_items').delete().eq('id', id),
        'Xóa thiết bị'
      );
    }
    return true;
  };

  const reserveInventoryItem = async (params: {
    itemId: string;
    customerName: string;
    customerPhone: string;
    orderCode?: string;
    orderId?: string;
    deliveryMethod?: 'pickup' | 'delivery' | string;
    note?: string;
  }): Promise<boolean> => {
    const item = inventory.find((i) => i.id === params.itemId || i.service_tag === params.itemId);
    if (!item) return false;

    const updatedData: Partial<InventoryItem> = {
      qc_status: 'reserved',
      customer_name: params.customerName.trim(),
      customer_phone: params.customerPhone.trim(),
      reserved_order_code: params.orderCode?.trim() || '',
      reserved_order_id: params.orderId || '',
      reserved_delivery_method: params.deliveryMethod || 'pickup',
      reserved_at: new Date().toISOString(),
      reserved_note: params.note || '',
    };

    await updateInventoryItem(item.id, updatedData);
    return true;
  };

  const cancelReservationItem = async (itemId: string, orderId?: string): Promise<boolean> => {
    const item = inventory.find((i) => i.id === itemId || i.service_tag === itemId);
    if (!item) return false;

    const updatedData: Partial<InventoryItem> = {
      qc_status: 'ready_to_sell',
      customer_name: '',
      customer_phone: '',
      customer_code: '',
      reserved_order_code: '',
      reserved_order_id: '',
      reserved_delivery_method: undefined,
      reserved_at: '',
      reserved_note: '',
    };

    await updateInventoryItem(item.id, updatedData);

    const targetOrderId = orderId || item.reserved_order_id;
    if (targetOrderId) {
      try {
        await fetch('/api/orders', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: targetOrderId, status: 'cancelled' }),
        });
      } catch (e) {
        console.warn('Sync cancel order error:', e);
      }
    }
    return true;
  };

  const fetchPendingOrders = async (): Promise<CustomerOrder[]> => {
    try {
      const res = await fetch('/api/orders?status=pending', { cache: 'no-store' });
      if (!res.ok) return [];
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPendingOrders(json.data);
        return json.data;
      }
    } catch {
      // Bỏ qua lỗi kết nối
    }
    return [];
  };

  const confirmPendingOrder = async (order: CustomerOrder): Promise<boolean> => {
    // 1. Tự động liên kết và chuyển trạng thái máy trong kho sang "Đang đợi bán" (reserved)
    let matched = inventory.find(
      (i) => i.service_tag === order.device_tag && i.qc_status !== 'sold'
    );
    if (!matched && order.device_name) {
      matched = inventory.find(
        (i) =>
          i.qc_status === 'ready_to_sell' &&
          (order.device_name.toLowerCase().includes((i.device_model || i.model || '').toLowerCase()) ||
            (i.device_model || i.model || '').toLowerCase().includes(order.device_name.toLowerCase()))
      );
    }
    if (matched) {
      await reserveInventoryItem({
        itemId: matched.id,
        customerName: order.customer_name,
        customerPhone: order.customer_phone,
        orderCode: order.order_code,
        orderId: order.id,
        deliveryMethod: order.delivery_method,
        note: `Khách đặt từ website (Đơn ${order.order_code})`,
      });
    }

    // 2. Gọi PATCH /api/orders
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: order.id,
          status: 'confirmed',
          matched_device_tag: matched?.service_tag,
        }),
      });
      if (res.ok) {
        setPendingOrders((prev) => prev.filter((o) => o.id !== order.id));
        return true;
      }
    } catch (e) {
      console.warn('Confirm order error:', e);
    }
    return false;
  };

  // Tự động kiểm tra đơn hàng mới định kỳ mỗi 20s cho nhân sự quản trị
  useEffect(() => {
    if (!isLoggedIn) return;
    const canSee = currentUser && ['admin', 'sales_manager', 'tech_manager', 'sales', 'technician'].includes(currentUser.role);
    if (!canSee) return;
    fetchPendingOrders();
    const tm = setInterval(fetchPendingOrders, 20000);
    return () => clearInterval(tm);
  }, [isLoggedIn, currentUser]);

  // Spare parts management (Linh kiện mới & cũ)
  const addSparePart = async (partData: Omit<SparePart, 'id'>): Promise<SparePart> => {
    const newPart: SparePart = {
      ...partData,
      id: createId(),
    };
    setSpareParts((prev) => {
      const next = [newPart, ...prev];
      saveToLocal(STORAGE_KEYS.spareParts, next);
      return next;
    });
    // Sync to Supabase
    if (isUsingSupabase && supabase) {
      const client = supabase;
      await runSupabaseWrite(
        () => client.from('spare_parts').insert([newPart]),
        'Thêm linh kiện'
      );
    }
    return newPart;
  };

  const updateSparePart = async (id: string, data: Partial<SparePart>): Promise<boolean> => {
    setSpareParts((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, ...data } : item));
      saveToLocal(STORAGE_KEYS.spareParts, next);
      return next;
    });
    // Sync to Supabase
    if (isUsingSupabase && supabase && isUuid(id)) {
      const client = supabase;
      await runSupabaseWrite(
        () => client.from('spare_parts').update(data).eq('id', id),
        'Cập nhật linh kiện'
      );
    }
    return true;
  };

  const deleteSparePart = async (id: string): Promise<boolean> => {
    if (!canEditStock()) {
      return false;
    }
    setSpareParts((prev) => {
      const next = prev.filter((item) => item.id !== id);
      saveToLocal(STORAGE_KEYS.spareParts, next);
      return next;
    });
    // Sync to Supabase
    if (isUsingSupabase && supabase && isUuid(id)) {
      const client = supabase;
      await runSupabaseWrite(
        () => client.from('spare_parts').delete().eq('id', id),
        'Xóa linh kiện'
      );
    }
    return true;
  };

  // Software license management (Phần mềm & Bản quyền)
  const addSoftwareLicense = async (swData: Omit<SoftwareLicense, 'id'>): Promise<SoftwareLicense> => {
    const newSw: SoftwareLicense = {
      ...swData,
      id: `sw-${Date.now()}`,
    };
    setSoftwareLicenses((prev) => {
      const next = [newSw, ...prev];
      saveToLocal(STORAGE_KEYS.softwareLicenses, next);
      return next;
    });
    return newSw;
  };

  const updateSoftwareLicense = async (id: string, data: Partial<SoftwareLicense>): Promise<boolean> => {
    setSoftwareLicenses((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, ...data } : item));
      saveToLocal(STORAGE_KEYS.softwareLicenses, next);
      return next;
    });
    return true;
  };

  const deleteSoftwareLicense = async (id: string): Promise<boolean> => {
    if (!canEditStock()) {
      return false;
    }
    setSoftwareLicenses((prev) => {
      const next = prev.filter((item) => item.id !== id);
      saveToLocal(STORAGE_KEYS.softwareLicenses, next);
      return next;
    });
    return true;
  };

  // Remote: Software Keys Management
  const addSoftwareKeys = async (softwareId: string, keys: string[], notes?: string): Promise<boolean> => {
    if (!canEditStock()) return false;
    const cleanKeys = keys.map((k) => k.trim()).filter((k) => k.length > 0);
    if (cleanKeys.length === 0) return false;

    setSoftwareLicenses((prev) => {
      const next = prev.map((item) => {
        if (item.id !== softwareId) return item;
        const existingKeys = item.license_keys || [];
        const newKeyItems: SoftwareKeyItem[] = cleanKeys.map((k, idx) => ({
          id: `key-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
          key_code: k,
          status: 'available' as const,
          notes: notes || undefined,
        }));
        const updatedKeys = [...existingKeys, ...newKeyItems];
        return {
          ...item,
          license_keys: updatedKeys,
          quantity_in_stock: updatedKeys.filter((k) => k.status === 'available').length,
        };
      });
      saveToLocal(STORAGE_KEYS.softwareLicenses, next);
      return next;
    });
    return true;
  };

  const assignSoftwareKey = async (
    softwareId: string,
    keyId: string,
    info: { customerName: string; ticketCode?: string; notes?: string }
  ): Promise<boolean> => {
    if (!canEditStock()) return false;
    setSoftwareLicenses((prev) => {
      const next = prev.map((item) => {
        if (item.id !== softwareId) return item;
        const keys = (item.license_keys || []).map((k) => {
          if (k.id !== keyId) return k;
          return {
            ...k,
            status: 'used' as const,
            assigned_customer: info.customerName,
            assigned_ticket_code: info.ticketCode || undefined,
            assigned_at: new Date().toISOString(),
            notes: info.notes ? (k.notes ? `${k.notes} | ${info.notes}` : info.notes) : k.notes,
          };
        });
        return {
          ...item,
          license_keys: keys,
          quantity_in_stock: keys.filter((k) => k.status === 'available').length,
        };
      });
      saveToLocal(STORAGE_KEYS.softwareLicenses, next);
      return next;
    });

    // Tự động gửi thông báo phát hành Key thành công qua Bot đến nhóm đã cài đặt
    const targetSw = softwareLicenses.find((s) => s.id === softwareId);
    const targetKey = targetSw?.license_keys?.find((k) => k.id === keyId);
    try {
      fetch('/api/webhook/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'key_release_success',
          payload: {
            categoryName: targetSw?.software_name || 'Bản quyền phần mềm',
            softwareName: targetSw?.software_name,
            keyCode: targetKey?.key_code,
            customerName: info.customerName,
            customerPhone: info.notes || '---',
            ticketCode: info.ticketCode,
            issuerName: currentUser.name,
          },
        }),
      }).catch((err) => console.warn('Bot key notification error:', err));
    } catch {
      // Silently ignore
    }

    return true;
  };

  const updateSoftwareKeyStatus = async (
    softwareId: string,
    keyId: string,
    status: SoftwareKeyItem['status'],
    notes?: string
  ): Promise<boolean> => {
    if (!canEditStock()) return false;
    setSoftwareLicenses((prev) => {
      const next = prev.map((item) => {
        if (item.id !== softwareId) return item;
        const keys = (item.license_keys || []).map((k) => {
          if (k.id !== keyId) return k;
          return {
            ...k,
            status,
            notes: notes ? (k.notes ? `${k.notes} | ${notes}` : notes) : k.notes,
            ...(status === 'available' ? { assigned_customer: undefined, assigned_ticket_code: undefined, assigned_at: undefined } : {}),
          };
        });
        return {
          ...item,
          license_keys: keys,
          quantity_in_stock: keys.filter((k) => k.status === 'available').length,
        };
      });
      saveToLocal(STORAGE_KEYS.softwareLicenses, next);
      return next;
    });
    return true;
  };

  const deleteSoftwareKey = async (softwareId: string, keyId: string): Promise<boolean> => {
    if (!canEditStock()) return false;
    setSoftwareLicenses((prev) => {
      const next = prev.map((item) => {
        if (item.id !== softwareId) return item;
        const keys = (item.license_keys || []).filter((k) => k.id !== keyId);
        return {
          ...item,
          license_keys: keys,
          quantity_in_stock: keys.filter((k) => k.status === 'available').length,
        };
      });
      saveToLocal(STORAGE_KEYS.softwareLicenses, next);
      return next;
    });
    return true;
  };

  // ==========================================
  // WINDOWS & OFFICE KEY MANAGEMENT & RELEASE
  // ==========================================
  const addKeyCategory = async (catData: { name: string; type: 'windows' | 'office' | 'others'; description: string }): Promise<KeyCategory> => {
    const trimmedName = catData.name.trim();
    // Check if existing category matches (case-insensitive, trimmed)
    const existing = keyCategories.find((c) => c.name.trim().toLowerCase() === trimmedName.toLowerCase());
    if (existing) {
      // Merge / update description if provided
      const updated: KeyCategory = {
        ...existing,
        description: catData.description || existing.description,
      };
      setKeyCategories((prev) => {
        const next = prev.map((c) => (c.id === existing.id ? updated : c));
        saveToLocal(STORAGE_KEYS.keyCategories, next);
        return next;
      });
      return updated;
    }

    const newCat: KeyCategory = {
      id: `cat-${Date.now()}`,
      name: trimmedName.toUpperCase(),
      type: catData.type,
      description: catData.description,
      is_default: false,
      created_at: new Date().toISOString(),
    };

    setKeyCategories((prev) => {
      const next = [...prev, newCat];
      saveToLocal(STORAGE_KEYS.keyCategories, next);
      return next;
    });
    return newCat;
  };

  const deleteKeyCategory = async (id: string): Promise<{ success: boolean; message: string }> => {
    const cat = keyCategories.find((c) => c.id === id);
    if (!cat) return { success: false, message: 'Không tìm thấy phân loại key cần xóa!' };
    if (cat.is_default || cat.type !== 'others') {
      return { success: false, message: 'Chỉ được phép xóa các phân loại thuộc nhóm "Others" (Không thể xóa các phân loại mặc định của hệ thống)!' };
    }
    setKeyCategories((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveToLocal(STORAGE_KEYS.keyCategories, next);
      return next;
    });
    return { success: true, message: 'Đã xóa phân loại thành công!' };
  };

  const addLicenseKey = async (item: Omit<LicenseKeyItem, 'id' | 'created_at'>): Promise<LicenseKeyItem> => {
    const newKey: LicenseKeyItem = {
      ...item,
      id: `key-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      license_code: item.license_code.trim().toUpperCase(),
      status: item.status || 'available',
      created_at: new Date().toISOString(),
    };
    setLicenseKeys((prev) => {
      const next = [newKey, ...prev];
      saveToLocal(STORAGE_KEYS.licenseKeys, next);
      return next;
    });
    return newKey;
  };

  const addBatchLicenseKeys = async (
    categoryId: string,
    categoryName: string,
    rawKeysText: string,
    unitPrice?: number,
    importPrice?: number
  ): Promise<{ success: boolean; addedCount: number }> => {
    const lines = rawKeysText.split(/[\r\n]+/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return { success: false, addedCount: 0 };
    const newKeys: LicenseKeyItem[] = lines.map((code, idx) => ({
      id: `key-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      category_id: categoryId,
      category_name: categoryName,
      license_code: code.toUpperCase(),
      status: 'available',
      import_price: importPrice || 0,
      unit_price: unitPrice || 350000,
      created_at: new Date().toISOString(),
    }));
    setLicenseKeys((prev) => {
      const next = [...newKeys, ...prev];
      saveToLocal(STORAGE_KEYS.licenseKeys, next);
      return next;
    });
    return { success: true, addedCount: newKeys.length };
  };

  const deleteLicenseKey = async (id: string): Promise<boolean> => {
    setLicenseKeys((prev) => {
      const next = prev.filter((k) => k.id !== id);
      saveToLocal(STORAGE_KEYS.licenseKeys, next);
      return next;
    });
    return true;
  };

  const updateLicenseKey = async (id: string, updates: Partial<LicenseKeyItem>): Promise<boolean> => {
    setLicenseKeys((prev) => {
      const next = prev.map((k) => (k.id === id ? { ...k, ...updates } : k));
      saveToLocal(STORAGE_KEYS.licenseKeys, next);
      return next;
    });
    return true;
  };

  /**
   * LẤY KEY TRỰC TIẾP cho khách hàng — không qua bước "tạo yêu cầu" rồi chờ Admin duyệt.
   * Tạo phiếu + bốc key + gán key diễn ra trong MỘT lần gọi (không phụ thuộc state vừa setState),
   * nên không bao giờ gặp lỗi "không tìm thấy yêu cầu" do state cũ.
   */
  const takeKeyForCustomer = async (data: {
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    category_id: string;
  }): Promise<{ success: boolean; message: string; key?: LicenseKeyItem; request?: KeyReleaseRequest }> => {
    const email = data.customer_email?.trim();
    if (!email || !email.includes('@') || !email.includes('.')) {
      return {
        success: false,
        message: 'Bắt buộc phải có email khách hàng hợp lệ để hệ thống gửi key cho khách!',
      };
    }
    if (!data.customer_name.trim()) {
      return { success: false, message: 'Vui lòng nhập họ tên khách hàng!' };
    }

    const cat = keyCategories.find((c) => c.id === data.category_id);
    if (!cat) {
      return { success: false, message: 'Phân loại key không tồn tại!' };
    }

    const availableKey = licenseKeys.find(
      (k) => k.category_id === data.category_id && k.status === 'available'
    );
    if (!availableKey) {
      return {
        success: false,
        message: `⚠️ KHO HẾT KEY (Volume = 0): Hiện tại không còn key khả dụng cho "${cat.name}". Vui lòng nhập thêm key vào kho trước khi xuất!`,
      };
    }

    const now = new Date().toISOString();
    const newReq: KeyReleaseRequest = {
      id: `req-${Date.now()}`,
      request_code: `REL-${Math.floor(1000 + Math.random() * 9000)}`,
      customer_name: data.customer_name.trim(),
      customer_phone: data.customer_phone.trim(),
      customer_email: email,
      category_id: data.category_id,
      category_name: cat.name,
      requester_name: currentUser.name,
      requester_role: currentUser.role,
      // Đã lấy key ngay lập tức -> không còn trạng thái "chờ Admin duyệt"
      status: 'approved_waiting_test',
      released_key_id: availableKey.id,
      released_key_code: availableKey.license_code,
      approved_by_admin: currentUser.name,
      approved_at: now,
      created_at: now,
      updated_at: now,
    };

    const assignedKey: LicenseKeyItem = {
      ...availableKey,
      status: 'assigned',
      assigned_to_customer: newReq.customer_name,
      assigned_to_phone: newReq.customer_phone,
      assigned_at: now,
      request_id: newReq.id,
    };

    setLicenseKeys((prev) => {
      const next = prev.map((k) => (k.id === availableKey.id ? assignedKey : k));
      saveToLocal(STORAGE_KEYS.licenseKeys, next);
      return next;
    });

    setKeyReleaseRequests((prev) => {
      const next = [newReq, ...prev];
      saveToLocal(STORAGE_KEYS.keyReleaseRequests, next);
      return next;
    });

    return {
      success: true,
      message: `Đã LẤY key [${assignedKey.license_code}] cho khách ${newReq.customer_name} (phiếu ${newReq.request_code}).`,
      key: assignedKey,
      request: newReq,
    };
  };

  /**
   * KỸ THUẬT VIÊN & SALES TẠO YÊU CẦU CẤP KEY (CHỜ ADMIN DUYỆT)
   */
  const createKeyReleaseRequest = async (data: {
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    category_id: string;
  }): Promise<{ success: boolean; message: string; request?: KeyReleaseRequest }> => {
    const email = data.customer_email?.trim();
    if (!email || !email.includes('@') || !email.includes('.')) {
      return {
        success: false,
        message: 'Bắt buộc phải có email khách hàng hợp lệ để hệ thống gửi key cho khách!',
      };
    }
    if (!data.customer_name.trim()) {
      return { success: false, message: 'Vui lòng nhập họ tên khách hàng!' };
    }

    const cat = keyCategories.find((c) => c.id === data.category_id);
    if (!cat) {
      return { success: false, message: 'Phân loại key không tồn tại!' };
    }

    const availableCount = licenseKeys.filter(
      (k) => k.category_id === data.category_id && k.status === 'available'
    ).length;

    const now = new Date().toISOString();
    const newReq: KeyReleaseRequest = {
      id: `req-${Date.now()}`,
      request_code: `REL-${Math.floor(1000 + Math.random() * 9000)}`,
      customer_name: data.customer_name.trim(),
      customer_phone: data.customer_phone.trim(),
      customer_email: email,
      category_id: data.category_id,
      category_name: cat.name,
      requester_id: currentUser.id,
      requester_name: currentUser.name,
      requester_role: currentUser.role,
      status: 'pending',
      admin_note: availableCount === 0 ? `[⚠️ KHO HẾT KEY - Volume: 0]` : undefined,
      created_at: now,
      updated_at: now,
    };

    setKeyReleaseRequests((prev) => {
      const next = [newReq, ...prev];
      saveToLocal(STORAGE_KEYS.keyReleaseRequests, next);
      return next;
    });

    // Gửi thông báo Webhook & Zalo Bot cho Admin
    if (typeof window !== 'undefined') {
      fetch('/api/webhook/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'key_request',
          payload: {
            requesterName: currentUser.name,
            keyCategory: cat.name,
            reason: `Yêu cầu cấp cho khách hàng ${data.customer_name.trim()} (${data.customer_phone.trim()})${availableCount === 0 ? ' [Kho hết key]' : ''}`,
          },
        }),
      }).catch(() => undefined);
    }

    if (availableCount === 0) {
      return {
        success: true,
        message: `⚠️ Yêu cầu cấp key (${cat.name}) đã được gửi đến Admin. CẢNH BÁO: Kho hiện tại đã HẾT KEY (Volume = 0), Admin cần nạp thêm kho trước khi duyệt cấp!`,
        request: newReq,
      };
    }

    return {
      success: true,
      message: `Đã gửi yêu cầu cấp key (${cat.name}) cho khách ${newReq.customer_name}. Đang chờ Admin duyệt!`,
      request: newReq,
    };
  };

  const approveKeyReleaseRequest = async (
    requestId: string,
    adminNote?: string
  ): Promise<{ success: boolean; message: string; key?: LicenseKeyItem }> => {
    const req = keyReleaseRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'Không tìm thấy yêu cầu cấp key!' };
    if (req.status !== 'pending' && req.status !== 'auto_re_requested') {
      return { success: false, message: `Yêu cầu này đã ở trạng thái [${req.status}], không thể duyệt lại!` };
    }

    const availableKey = licenseKeys.find(
      (k) => k.category_id === req.category_id && k.status === 'available'
    );
    if (!availableKey) {
      return {
        success: false,
        message: `⚠️ KHO HẾT KEY (Volume = 0): Trong kho đã hết key sẵn sàng cho danh mục "${req.category_name}". Vui lòng nhập thêm key vào kho trước khi xuất!`,
      };
    }

    // Mark key as assigned
    const assignedKey: LicenseKeyItem = {
      ...availableKey,
      status: 'assigned',
      assigned_to_customer: req.customer_name,
      assigned_to_phone: req.customer_phone,
      assigned_at: new Date().toISOString(),
      request_id: req.id,
    };

    setLicenseKeys((prev) => {
      const next = prev.map((k) => (k.id === availableKey.id ? assignedKey : k));
      saveToLocal(STORAGE_KEYS.licenseKeys, next);
      return next;
    });

    // Update request
    const approvedReq: KeyReleaseRequest = {
      ...req,
      status: 'approved_waiting_test',
      released_key_id: assignedKey.id,
      released_key_code: assignedKey.license_code,
      approved_by_admin: currentUser.name,
      approved_at: new Date().toISOString(),
      admin_note: adminNote || req.admin_note,
      updated_at: new Date().toISOString(),
    };

    setKeyReleaseRequests((prev) => {
      const next = prev.map((r) => (r.id === req.id ? approvedReq : r));
      saveToLocal(STORAGE_KEYS.keyReleaseRequests, next);
      return next;
    });

    return {
      success: true,
      message: `Đã duyệt cấp key thành công! Key đã hiển thị cho kỹ thuật/sales kiểm tra kích hoạt.`,
      key: assignedKey,
    };
  };

  const quickRestockAndApproveKeyRequest = async (
    requestId: string,
    newKeyCode: string,
    costPrice?: number
  ): Promise<{ success: boolean; message: string; key?: LicenseKeyItem }> => {
    const req = keyReleaseRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'Không tìm thấy yêu cầu cấp key!' };

    const trimmedCode = newKeyCode.trim().toUpperCase();
    if (!trimmedCode) return { success: false, message: 'Vui lòng nhập mã key mới!' };

    const newKey: LicenseKeyItem = {
      id: createId(),
      category_id: req.category_id,
      category_name: req.category_name,
      license_code: trimmedCode,
      status: 'assigned',
      assigned_to_customer: req.customer_name,
      assigned_to_phone: req.customer_phone,
      customer_name: req.customer_name,
      customer_phone: req.customer_phone,
      assigned_at: new Date().toISOString(),
      import_price: costPrice || 150000,
      unit_price: 350000,
      request_id: req.id,
      notes: `Nạp nhanh & cấp cho yêu cầu #${req.id.slice(-4)} (${req.customer_name})`,
      created_at: new Date().toISOString(),
    };

    setLicenseKeys((prev) => {
      const next = [newKey, ...prev];
      saveToLocal(STORAGE_KEYS.licenseKeys, next);
      return next;
    });

    const now = new Date().toISOString();
    setKeyReleaseRequests((prev) => {
      const next = prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'approved_waiting_test' as const,
              released_key_id: newKey.id,
              released_key_code: newKey.license_code,
              admin_id: currentUser.id,
              admin_name: currentUser.name,
              approved_at: now,
              updated_at: now,
            }
          : r
      );
      saveToLocal(STORAGE_KEYS.keyReleaseRequests, next);
      return next;
    });

    return {
      success: true,
      message: `Đã nạp nhanh key mới (${trimmedCode}) và duyệt cấp ngay cho khách ${req.customer_name}!`,
      key: newKey,
    };
  };

  const confirmKeyActive = async (requestId: string): Promise<{ success: boolean; message: string }> => {
    const req = keyReleaseRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'Không tìm thấy yêu cầu cấp key!' };
    if (!req.released_key_id) return { success: false, message: 'Yêu cầu chưa có key được cấp!' };

    // 1. Mark key as used
    setLicenseKeys((prev) => {
      const next = prev.map((k) =>
        k.id === req.released_key_id
          ? {
              ...k,
              status: 'used' as const,
            }
          : k
      );
      saveToLocal(STORAGE_KEYS.licenseKeys, next);
      return next;
    });

    // 2. Dispatch real/mock email via API route
    const emailSentTime = new Date().toISOString();
    try {
      if (typeof window !== 'undefined' && req.customer_email) {
        fetch('/api/send-key-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_email: req.customer_email,
            customer_name: req.customer_name,
            customer_phone: req.customer_phone,
            category_name: req.category_name,
            license_code: req.released_key_code || req.assigned_key_code,
            template: keyEmailTemplate,
          }),
        }).catch((err) => console.warn('Dispatch email error:', err));
      }
    } catch (e) {
      console.warn('Silent email fail:', e);
    }

    // 3. Mark request as active_confirmed
    setKeyReleaseRequests((prev) => {
      const next = prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'active_confirmed' as const,
              email_sent: true,
              email_sent_at: emailSentTime,
              updated_at: emailSentTime,
            }
          : r
      );
      saveToLocal(STORAGE_KEYS.keyReleaseRequests, next);
      return next;
    });

    // 4. Gửi thông báo phát hành Key thành công qua Bot đến nhóm đã cài đặt sẵn
    try {
      fetch('/api/webhook/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'key_release_success',
          payload: {
            categoryName: req.category_name,
            keyCode: req.released_key_code || req.assigned_key_code,
            customerName: req.customer_name,
            customerPhone: req.customer_phone,
            ticketCode: req.request_code || `#YC-${req.id.slice(-4)}`,
            issuerName: currentUser.name,
          },
        }),
      }).catch((err) => console.warn('Bot key notification error:', err));
    } catch {
      // Silently ignore
    }

    return {
      success: true,
      message: `Key đã được xác nhận HOẠT ĐỘNG! Hệ thống đã gửi email bàn giao key bản quyền đến [${req.customer_email}].`,
    };
  };

  const reportKeyFaulty = async (
    requestId: string,
    reason: string
  ): Promise<{ success: boolean; message: string }> => {
    const req = keyReleaseRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'Không tìm thấy yêu cầu cấp key!' };
    if (!req.released_key_id) return { success: false, message: 'Yêu cầu chưa có key được cấp!' };

    // Check available volume for replacement
    const availableCount = licenseKeys.filter(
      (k) => k.category_id === req.category_id && k.status === 'available'
    ).length;

    // 1. Mark faulty key
    setLicenseKeys((prev) => {
      const next = prev.map((k) =>
        k.id === req.released_key_id
          ? {
              ...k,
              status: 'faulty' as const,
              notes: `Key lỗi: ${reason} (Báo cáo bởi ${currentUser.name})`,
            }
          : k
      );
      saveToLocal(STORAGE_KEYS.licenseKeys, next);
      return next;
    });

    // 2. Update request and trigger auto re-request to Admin
    const prevKey = req.released_key_code || 'KEY_UNKNOWN';
    const now = new Date().toISOString();
    const updatedHistory = [
      ...(req.faulty_history || []),
      { key_code: prevKey, reason: reason.trim() || 'Key không hoạt động', timestamp: now },
    ];

    const note = availableCount === 0
      ? `Key trước (${prevKey}) không hoạt động: "${reason}". [⚠️ CẢNH BÁO: KHO HẾT KEY THAY THẾ (Volume: 0) - Cần nạp kho gấp]`
      : `Key trước (${prevKey}) không hoạt động: "${reason}". Hệ thống tự động yêu cầu cấp key mới.`;

    setKeyReleaseRequests((prev) => {
      const next = prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'auto_re_requested' as const,
              faulty_reason: reason.trim() || 'Key không hoạt động',
              faulty_history: updatedHistory,
              admin_note: note,
              released_key_id: undefined,
              released_key_code: undefined,
              updated_at: now,
            }
          : r
      );
      saveToLocal(STORAGE_KEYS.keyReleaseRequests, next);
      return next;
    });

    if (availableCount === 0) {
      return {
        success: true,
        message: `⚠️ Key lỗi đã được ghi nhận. CẢNH BÁO: Kho hiện tại đã HẾT KEY THAY THẾ (Volume = 0)! Đã gửi cảnh báo yêu cầu Admin nạp thêm key gấp.`,
      };
    }

    return {
      success: true,
      message: `Key lỗi đã được ghi nhận vào kho. Hệ thống đã tự động gửi yêu cầu cấp key mới đến Admin!`,
    };
  };

  const restoreFaultyKey = async (
    keyId: string,
    note?: string
  ): Promise<{ success: boolean; message: string }> => {
    const targetKey = licenseKeys.find((k) => k.id === keyId);
    if (!targetKey) {
      return { success: false, message: 'Không tìm thấy key trong hệ thống!' };
    }
    if (targetKey.status !== 'faulty') {
      return { success: false, message: 'Key này hiện không ở trạng thái lỗi!' };
    }

    const restoredKey: LicenseKeyItem = {
      ...targetKey,
      status: 'available',
      assigned_to_customer: undefined,
      assigned_to_phone: undefined,
      assigned_at: undefined,
      request_id: undefined,
      notes: note
        ? `Đã khôi phục về kho: ${note} (Bởi ${currentUser.name})`
        : `Đã khôi phục về kho sẵn sàng bởi ${currentUser.name}`,
    };

    setLicenseKeys((prev) => {
      const next = prev.map((k) => (k.id === keyId ? restoredKey : k));
      saveToLocal(STORAGE_KEYS.licenseKeys, next);
      return next;
    });

    return {
      success: true,
      message: `Đã khôi phục key [${targetKey.license_code}] về trạng thái SẴN SÀNG trong kho!`,
    };
  };

  const rejectKeyReleaseRequest = async (requestId: string, reason: string): Promise<boolean> => {
    setKeyReleaseRequests((prev) => {
      const next = prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'rejected' as const,
              admin_note: reason,
              updated_at: new Date().toISOString(),
            }
          : r
      );
      saveToLocal(STORAGE_KEYS.keyReleaseRequests, next);
      return next;
    });
    return true;
  };

  const updateKeyEmailTemplate = async (updates: Partial<KeyEmailTemplateConfig>): Promise<boolean> => {
    setKeyEmailTemplate((prev) => {
      const next = { ...prev, ...updates };
      saveToLocal(STORAGE_KEYS.keyEmailTemplate, next);
      return next;
    });
    return true;
  };

  // Ticket actions
  const addServiceTicket = async (ticketData: Omit<ServiceTicket, 'id' | 'created_at'>): Promise<ServiceTicket> => {
    const newTicket: ServiceTicket = {
      ...ticketData,
      id: createId(),
      created_at: new Date().toISOString(),
    };

    setTickets((prev) => {
      const next = [newTicket, ...prev];
      saveToLocal(STORAGE_KEYS.tickets, next);
      return next;
    });

    if (isUsingSupabase && supabase) {
      const client = supabase;
      await runSupabaseWrite(
        () => client.from('service_tickets').insert([newTicket]),
        'Tạo phiếu sửa chữa'
      );
    }
    // Gửi thông báo Webhook & Zalo Bot khi tạo phiếu tiếp nhận sửa chữa tại quầy
    if (typeof window !== 'undefined' && ticketData.visual_condition !== 'Tiếp nhận qua hệ thống đặt lịch Online') {
      fetch('/api/webhook/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'new_ticket',
          payload: {
            ticketCode: newTicket.ticket_code,
            customerName: newTicket.customer_name,
            customerPhone: newTicket.customer_phone,
            deviceType: newTicket.device_name,
            issueDescription: newTicket.issue_description,
            technicianName: newTicket.technician_name,
          },
        }),
      }).catch(() => undefined);
    }

    return newTicket;
  };

  const updateTicketStatus = async (id: string, status: ServiceTicket['status']): Promise<boolean> => {
    if (!canUpdateRepairStatus()) {
      return false;
    }
    setTickets((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, status } : t));
      saveToLocal(STORAGE_KEYS.tickets, next);
      return next;
    });

    if (isUsingSupabase && supabase && isUuid(id)) {
      const client = supabase;
      await runSupabaseWrite(
        () => client.from('service_tickets').update({ status }).eq('id', id),
        'Cập nhật trạng thái phiếu'
      );
    }
    return true;
  };

  const updateTicketDetails = async (id: string, updates: Partial<ServiceTicket>): Promise<boolean> => {
    setTickets((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
      saveToLocal(STORAGE_KEYS.tickets, next);
      return next;
    });

    if (isUsingSupabase && supabase && isUuid(id)) {
      const client = supabase;
      await runSupabaseWrite(
        () => client.from('service_tickets').update(updates).eq('id', id),
        'Cập nhật thông tin phiếu'
      );
    }
    return true;
  };

  const assignTicketTechnician = async (id: string, technicianName: string): Promise<boolean> => {
    if (!canAssignTasks()) {
      return false;
    }
    setTickets((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, technician_name: technicianName } : t));
      saveToLocal(STORAGE_KEYS.tickets, next);
      return next;
    });

    if (isUsingSupabase && supabase && isUuid(id)) {
      const client = supabase;
      await runSupabaseWrite(
        () => client.from('service_tickets').update({ technician_name: technicianName }).eq('id', id),
        'Phân bổ KTV xử lý phiếu'
      );
    }
    return true;
  };

  // Onsite dispatch actions
  const updateDispatchStatus = async (id: string, status: OnsiteDispatch['status']) => {
    setOnsiteDispatches((prev) => {
      const next = prev.map((d) => (d.id === id ? { ...d, status } : d));
      saveToLocal(STORAGE_KEYS.onsiteDispatches, next);
      return next;
    });

    // Trước đây chỉ ghi localStorage -> bật Supabase là mất trạng thái sau khi refresh
    if (isUsingSupabase && supabase && isUuid(id)) {
      const client = supabase;
      await runSupabaseWrite(
        () => client.from('onsite_dispatches').update({ status }).eq('id', id),
        'Cập nhật trạng thái cứu hộ'
      );
    }
  };

  const assignDispatchTechnician = async (id: string, technicianName: string): Promise<boolean> => {
    if (!canAssignTasks()) {
      return false;
    }
    setOnsiteDispatches((prev) => {
      const next = prev.map((d) => (d.id === id ? { ...d, technician_name: technicianName } : d));
      saveToLocal(STORAGE_KEYS.onsiteDispatches, next);
      return next;
    });

    if (isUsingSupabase && supabase && isUuid(id)) {
      const client = supabase;
      await runSupabaseWrite(
        () => client.from('onsite_dispatches').update({ technician_name: technicianName }).eq('id', id),
        'Phân bổ KTV điều phối Onsite'
      );
    }
    return true;
  };

  // Shift logs (Admin only)
  const addShiftLog = async (shiftData: Omit<ShiftLog, 'id' | 'created_at'>): Promise<ShiftLog> => {
    const newShift: ShiftLog = {
      ...shiftData,
      id: createId(),
      created_at: new Date().toISOString(),
    };

    setShiftLogs((prev) => {
      const next = [newShift, ...prev];
      saveToLocal(STORAGE_KEYS.shiftLogs, next);
      return next;
    });
    // Sync to Supabase
    if (isUsingSupabase && supabase) {
      const client = supabase;
      await runSupabaseWrite(
        () => client.from('shift_logs').insert([newShift]),
        'Thêm ca làm việc'
      );
    }
    return newShift;
  };


  // Sales & Handover implementation (Admin & Sales)
  const sellInventoryItem = async (params: {
    itemId: string;
    customerName: string;
    customerPhone: string;
    birthDate: string;
    customerAddress: string;
    serialNumber: string;
    warrantyMonths: number;
    soldPrice?: number;
    notes?: string;
    saleDate?: string;
  }): Promise<{ success: boolean; customerCode: string; message: string }> => {
    if (!canSellAndEditWarranty()) {
      return {
        success: false,
        customerCode: '',
        message: 'Bạn không có quyền thực hiện bán hàng hoặc điều chỉnh thông tin bảo hành!',
      };
    }

    const item = inventory.find((i) => i.id === params.itemId);
    if (!item) {
      return { success: false, customerCode: '', message: 'Không tìm thấy thiết bị trong kho!' };
    }

    const saleDateTime = params.saleDate ? new Date(params.saleDate) : new Date();
    const warrantyUntilDate = new Date(saleDateTime);
    warrantyUntilDate.setMonth(warrantyUntilDate.getMonth() + params.warrantyMonths);

    // Generate Customer Code: [DDMM] + [4 last digits of phone]
    const existingCustomerCodes = customers
      .map((c) => c.customer_code)
      .filter((code): code is string => Boolean(code));
    const customerCode = generateCustomerCode(params.birthDate, params.customerPhone, existingCustomerCodes);

    // 1. Update Inventory Item
    const updatedItem: InventoryItem = {
      ...item,
      qc_status: 'sold',
      customer_name: params.customerName.trim(),
      customer_phone: params.customerPhone.trim(),
      customer_code: customerCode,
      sold_by: currentUser.name,
      serial_number: params.serialNumber.trim() || item.serial_number || item.service_tag,
      warranty_months: params.warrantyMonths,
      handover_date: saleDateTime.toISOString(),
      retail_price: params.soldPrice || item.retail_price || item.price,
    };

    setInventory((prev) => {
      const next = prev.map((i) => (i.id === params.itemId ? updatedItem : i));
      saveToLocal(STORAGE_KEYS.inventory, next);
      return next;
    });

    // 2. Add or Update Customer with Customer Code and Birth Date
    const newCustomer: Customer = {
      id: createId(),
      customer_code: customerCode,
      full_name: params.customerName.trim(),
      birth_date: params.birthDate,
      phone: params.customerPhone.trim(),
      address: params.customerAddress.trim() || 'Long An - Tây Ninh',
      customer_tier: 'VIP',
      notes: `Mua máy ${item.device_model || item.brand} (Tag: ${item.service_tag}, Serial: ${params.serialNumber})`,
      created_at: saleDateTime.toISOString(),
    };

    setCustomers((prev) => {
      const next = [newCustomer, ...prev];
      saveToLocal(STORAGE_KEYS.customers, next);
      return next;
    });

    // 3. Create a Service Ticket record for warranty lookup
    const warrantyTicket: ServiceTicket = {
      id: createId(),
      ticket_code: `#HD-${customerCode}-${item.service_tag.slice(-4)}`,
      customer_name: params.customerName.trim(),
      customer_phone: params.customerPhone.trim(),
      customer_address: params.customerAddress.trim(),
      device_service_tag: item.service_tag,
      device_name: item.device_model || item.model || `${item.brand} ${item.form_factor}`,
      technician_name: currentUser.name,
      status: 'delivered',
      visual_condition: 'Máy chuẩn A bàn giao mới 100% nguyên bản',
      technician_note: `Bán hàng thành công. Serial: ${params.serialNumber}. Ngày bán: ${saleDateTime.toLocaleDateString('vi-VN')}. Bảo hành ${params.warrantyMonths} tháng (đến ${warrantyUntilDate.toLocaleDateString('vi-VN')}).`,
      estimated_cost: params.soldPrice || item.retail_price || item.price || 0,
      total_amount: params.soldPrice || item.retail_price || item.price || 0,
      created_at: saleDateTime.toISOString(),
      warranty_until: warrantyUntilDate.toISOString(),
    };

    setTickets((prev) => {
      const next = [warrantyTicket, ...prev];
      saveToLocal(STORAGE_KEYS.tickets, next);
      return next;
    });

    // Sync bán hàng lên Supabase (inventory + customer + ticket)
    if (isUsingSupabase && supabase) {
      const client = supabase;
      const itemId = params.itemId;
      await Promise.all([
        isUuid(itemId)
          ? runSupabaseWrite(
              () => client.from('inventory_items').update(updatedItem).eq('id', itemId),
              'Cập nhật thiết bị (bán hàng)'
            )
          : Promise.resolve(true),
        runSupabaseWrite(
          () => client.from('customers').insert([newCustomer]),
          'Thêm khách hàng (bán hàng)'
        ),
        runSupabaseWrite(
          () => client.from('service_tickets').insert([warrantyTicket]),
          'Tạo phiếu bảo hành (bán hàng)'
        ),
      ]);
    }

    // 4. Calculate 5% Warranty Provision Fund from Net Profit
    const finalSoldPrice = params.soldPrice || item.retail_price || item.price || 0;
    const finalCostPrice = item.cost_price || item.import_price || 0;
    const netProfit = Math.max(0, finalSoldPrice - finalCostPrice);
    const provisionAmount = Math.max(0, Math.round(netProfit * 0.05));

    if (provisionAmount > 0) {
      const expiryDate = new Date(Date.now() + params.warrantyMonths * 30 * 24 * 60 * 60 * 1000).toISOString();
      const newProvision: WarrantyProvision = {
        id: createId(),
        item_id: item.id,
        item_type: 'machine',
        item_title: item.device_model || item.model || `${item.brand} ${item.form_factor}`,
        serial_number: params.serialNumber.trim() || item.serial_number || item.service_tag,
        customer_name: params.customerName.trim(),
        customer_phone: params.customerPhone.trim(),
        customer_code: customerCode,
        seller_name: currentUser.name,
        sale_date: new Date().toISOString(),
        warranty_months: params.warrantyMonths,
        warranty_expiry_date: expiryDate,
        sale_price: finalSoldPrice,
        cost_price: finalCostPrice,
        net_profit: netProfit,
        provision_rate: 0.05,
        provision_amount: provisionAmount,
        status: currentUser.role === 'admin' ? 'locked' : 'pending_approval',
        approved_at: currentUser.role === 'admin' ? new Date().toISOString() : undefined,
        approved_by: currentUser.role === 'admin' ? currentUser.name : undefined,
        created_at: new Date().toISOString(),
      };

      setWarrantyProvisions((prev) => {
        const next = [newProvision, ...prev];
        saveToLocal(STORAGE_KEYS.warrantyProvisions, next);
        return next;
      });
    }

    // 5. Tự động gửi tin nhắn chúc mừng bán hàng qua Bot đến nhóm cài đặt sẵn
    try {
      fetch('/api/webhook/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'sale_success',
          payload: {
            sellerName: currentUser.name,
            deviceName: item.device_model || item.model || `${item.brand} ${item.form_factor}`,
            serviceTag: item.service_tag,
            serialNumber: params.serialNumber.trim() || item.serial_number || item.service_tag,
            customerName: params.customerName.trim(),
            customerPhone: params.customerPhone.trim(),
            customerCode,
            soldPrice: finalSoldPrice,
            warrantyMonths: params.warrantyMonths,
            shelfLocation: item.shelf_location,
          },
        }),
      }).catch((err) => console.warn('Bot sale notification error:', err));
    } catch {
      // Best-effort
    }

    return {
      success: true,
      customerCode,
      message: `Bán máy thành công! Mã khách hàng: ${customerCode} (Trích 5% Quỹ BH: ${provisionAmount.toLocaleString('vi-VN')}₫)`,
    };
  };

  const sellSparePart = async (params: {
    partId: string;
    customerName: string;
    customerPhone: string;
    customerAddress?: string;
    quantity: number;
    warrantyMonths: number;
    soldPrice: number;
    saleDate?: string;
  }): Promise<{ success: boolean; message: string }> => {
    if (!canSellAndEditWarranty()) {
      return {
        success: false,
        message: 'Bạn không có quyền thực hiện bán hàng hoặc điều chỉnh thông tin bảo hành!',
      };
    }

    const part = spareParts.find((p) => p.id === params.partId);
    if (!part) {
      return { success: false, message: 'Không tìm thấy linh kiện trong kho!' };
    }

    if (params.quantity <= 0) {
      return { success: false, message: 'Số lượng bán phải lớn hơn 0!' };
    }

    if (params.quantity > (part.quantity_in_stock || 0)) {
      return { success: false, message: `Số lượng tồn kho không đủ (chỉ còn ${part.quantity_in_stock})!` };
    }

    const saleDateTime = params.saleDate ? new Date(params.saleDate) : new Date();
    const warrantyUntilDate = new Date(saleDateTime);
    warrantyUntilDate.setMonth(warrantyUntilDate.getMonth() + params.warrantyMonths);

    // 1. Giảm tồn kho
    const updatedStock = Math.max(0, (part.quantity_in_stock || 0) - params.quantity);
    const updatedPart: SparePart = { ...part, quantity_in_stock: updatedStock };
    setSpareParts((prev) => {
      const next = prev.map((p) => (p.id === params.partId ? updatedPart : p));
      saveToLocal(STORAGE_KEYS.spareParts, next);
      return next;
    });

    // 2. Thêm hoặc cập nhật khách hàng
    const existingCustomerCodes = customers
      .map((c) => c.customer_code)
      .filter((code): code is string => Boolean(code));
    const customerCode = generateCustomerCode('', params.customerPhone, existingCustomerCodes);

    const newCustomer: Customer = {
      id: createId(),
      customer_code: customerCode,
      full_name: params.customerName.trim(),
      phone: params.customerPhone.trim(),
      address: params.customerAddress?.trim() || 'Long An - Tây Ninh',
      customer_tier: 'Standard',
      notes: `Mua linh kiện ${part.part_name} x${params.quantity}`,
      created_at: saleDateTime.toISOString(),
    };

    setCustomers((prev) => {
      const next = [newCustomer, ...prev];
      saveToLocal(STORAGE_KEYS.customers, next);
      return next;
    });

    // 3. Tạo phiếu bảo hành
    const warrantyTicket: ServiceTicket = {
      id: createId(),
      ticket_code: `#LK-${customerCode}-${Date.now().toString().slice(-4)}`,
      customer_name: params.customerName.trim(),
      customer_phone: params.customerPhone.trim(),
      customer_address: params.customerAddress?.trim() || 'Long An - Tây Ninh',
      device_service_tag: `LK-${part.part_type}-${part.id.slice(-4)}`,
      device_name: `Linh kiện: ${part.part_name} (x${params.quantity})`,
      technician_name: currentUser.name,
      status: 'delivered',
      visual_condition: part.condition === 'new' ? 'Linh kiện mới 100% nguyên seal' : 'Linh kiện zin tháo máy',
      technician_note: `Xuất bán linh kiện x${params.quantity}. Ngày bán: ${saleDateTime.toLocaleDateString('vi-VN')}. Bảo hành ${params.warrantyMonths} tháng (đến ${warrantyUntilDate.toLocaleDateString('vi-VN')}).`,
      estimated_cost: params.soldPrice,
      total_amount: params.soldPrice,
      created_at: saleDateTime.toISOString(),
      warranty_until: warrantyUntilDate.toISOString(),
    };

    setTickets((prev) => {
      const next = [warrantyTicket, ...prev];
      saveToLocal(STORAGE_KEYS.tickets, next);
      return next;
    });

    // Sync Supabase nếu khả dụng
    if (isUsingSupabase && supabase) {
      const client = supabase;
      await Promise.all([
        isUuid(part.id)
          ? runSupabaseWrite(
              () => client.from('spare_parts').update(updatedPart).eq('id', part.id),
              'Cập nhật tồn linh kiện'
            )
          : Promise.resolve(true),
        runSupabaseWrite(
          () => client.from('customers').insert([newCustomer]),
          'Thêm khách hàng (bán linh kiện)'
        ),
        runSupabaseWrite(
          () => client.from('service_tickets').insert([warrantyTicket]),
          'Tạo phiếu bảo hành (bán linh kiện)'
        ),
      ]);
    }

    return {
      success: true,
      message: `Xuất bán linh kiện thành công! Bảo hành ${params.warrantyMonths} tháng đến ${warrantyUntilDate.toLocaleDateString('vi-VN')}.`,
    };
  };

  const approveWarrantyProvision = async (provisionId: string): Promise<{ success: boolean; message: string }> => {
    let targetAmount = 0;
    setWarrantyProvisions((prev) => {
      const next = prev.map((wp) => {
        if (wp.id === provisionId) {
          targetAmount = wp.provision_amount;
          return {
            ...wp,
            status: 'locked' as const,
            approved_at: new Date().toISOString(),
            approved_by: currentUser.name,
          };
        }
        return wp;
      });
      saveToLocal(STORAGE_KEYS.warrantyProvisions, next);
      return next;
    });
    return {
      success: true,
      message: `Đã duyệt trích ${targetAmount.toLocaleString('vi-VN')}₫ vào Quỹ Bảo Hành phong tỏa!`,
    };
  };

  const unlockMaturedWarrantyProvisions = async (): Promise<{ unlockedCount: number; unlockedTotal: number }> => {
    const now = new Date().getTime();
    let count = 0;
    let total = 0;
    setWarrantyProvisions((prev) => {
      const next = prev.map((wp) => {
        if (wp.status === 'locked' && wp.warranty_expiry_date) {
          const expiryTime = new Date(wp.warranty_expiry_date).getTime();
          if (now >= expiryTime) {
            count++;
            total += wp.provision_amount;
            return {
              ...wp,
              status: 'unlocked' as const,
              unlocked_at: new Date().toISOString(),
            };
          }
        }
        return wp;
      });
      saveToLocal(STORAGE_KEYS.warrantyProvisions, next);
      return next;
    });
    return { unlockedCount: count, unlockedTotal: total };
  };

  const settleUnlockedWarrantyProvisionsYearEnd = async (): Promise<{ settledCount: number; settledTotal: number }> => {
    const currentYear = new Date().getFullYear();
    let count = 0;
    let total = 0;
    setWarrantyProvisions((prev) => {
      const next = prev.map((wp) => {
        if (wp.status === 'unlocked') {
          count++;
          total += wp.provision_amount;
          return {
            ...wp,
            status: 'settled' as const,
            settled_at: new Date().toISOString(),
            settlement_year: currentYear,
          };
        }
        return wp;
      });
      saveToLocal(STORAGE_KEYS.warrantyProvisions, next);
      return next;
    });
    return { settledCount: count, settledTotal: total };
  };

  // CRM Customer Management
  const addCustomer = async (customerData: Omit<Customer, 'id' | 'created_at'>): Promise<Customer> => {
    const existingCodes = customers
      .map((c) => c.customer_code)
      .filter((code): code is string => Boolean(code));
    const customerCode =
      customerData.customer_code ||
      generateCustomerCode(customerData.birth_date || '1990-01-01', customerData.phone, existingCodes);

    const newCustomer: Customer = {
      ...customerData,
      id: createId(),
      customer_code: customerCode,
      created_at: new Date().toISOString(),
    };

    setCustomers((prev) => {
      const next = [newCustomer, ...prev];
      saveToLocal(STORAGE_KEYS.customers, next);
      return next;
    });

    // Sync to Supabase
    if (isUsingSupabase && supabase) {
      const client = supabase;
      await runSupabaseWrite(
        () => client.from('customers').insert([newCustomer]),
        'Thêm khách hàng'
      );
    }

    return newCustomer;
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>): Promise<boolean> => {
    let updated = false;
    setCustomers((prev) => {
      const next = prev.map((c) => {
        if (c.id === id) {
          updated = true;
          return { ...c, ...updates };
        }
        return c;
      });
      if (updated) {
        saveToLocal(STORAGE_KEYS.customers, next);
      }
      return next;
    });
    // Sync to Supabase
    if (updated && isUsingSupabase && supabase && isUuid(id)) {
      const client = supabase;
      await runSupabaseWrite(
        () => client.from('customers').update(updates).eq('id', id),
        'Cập nhật khách hàng'
      );
    }
    return updated;
  };

  const deleteCustomer = async (id: string): Promise<boolean> => {
    let deleted = false;
    setCustomers((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (next.length !== prev.length) {
        deleted = true;
        saveToLocal(STORAGE_KEYS.customers, next);
      }
      return next;
    });
    // Sync to Supabase
    if (deleted && isUsingSupabase && supabase && isUuid(id)) {
      const client = supabase;
      await runSupabaseWrite(
        () => client.from('customers').delete().eq('id', id),
        'Xóa khách hàng'
      );
    }
    return deleted;
  };

  // FAQ CRUD
  const addFaq = async (faqData: Omit<FaqItem, 'id'>): Promise<FaqItem> => {
    const newFaq: FaqItem = {
      ...faqData,
      id: `faq-${Date.now()}`,
    };
    setFaqs((prev) => {
      const next = [...prev, newFaq];
      saveToLocal(STORAGE_KEYS.faqs, next);
      return next;
    });
    return newFaq;
  };

  const updateFaq = async (id: string, data: Partial<FaqItem>): Promise<boolean> => {
    setFaqs((prev) => {
      const next = prev.map((f) => (f.id === id ? { ...f, ...data } : f));
      saveToLocal(STORAGE_KEYS.faqs, next);
      return next;
    });
    return true;
  };

  const deleteFaq = async (id: string): Promise<boolean> => {
    setFaqs((prev) => {
      const next = prev.filter((f) => f.id !== id);
      saveToLocal(STORAGE_KEYS.faqs, next);
      return next;
    });
    return true;
  };

  // Review CRUD
  const addReview = async (revData: Omit<CustomerReview, 'id'>): Promise<CustomerReview> => {
    const newRev: CustomerReview = {
      ...revData,
      id: `rev-${Date.now()}`,
    };
    setReviews((prev) => {
      const next = [newRev, ...prev];
      saveToLocal(STORAGE_KEYS.reviews, next);
      return next;
    });
    return newRev;
  };

  const deleteReview = async (id: string): Promise<boolean> => {
    setReviews((prev) => {
      const next = prev.filter((r) => r.id !== id);
      saveToLocal(STORAGE_KEYS.reviews, next);
      return next;
    });
    return true;
  };

  // Blog Posts & Categories CRUD
  const addBlogPost = async (postData: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>): Promise<BlogPost> => {
    const newPost: BlogPost = {
      ...postData,
      id: createId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setBlogPosts((prev) => {
      const next = [newPost, ...prev];
      saveToLocal(STORAGE_KEYS.blogPosts, next);
      return next;
    });

    if (isUsingSupabase && supabase) {
      try {
        await supabase.from('blog_posts').insert(newPost);
      } catch (err) {
        console.error('Failed to sync new blog post to Supabase:', err);
      }
    }

    return newPost;
  };

  const updateBlogPost = async (id: string, data: Partial<BlogPost>): Promise<boolean> => {
    const updatedFields = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    setBlogPosts((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p));
      saveToLocal(STORAGE_KEYS.blogPosts, next);
      return next;
    });

    if (isUsingSupabase && supabase) {
      try {
        await supabase.from('blog_posts').update(updatedFields).eq('id', id);
      } catch (err) {
        console.error('Failed to update blog post on Supabase:', err);
      }
    }

    return true;
  };

  const deleteBlogPost = async (id: string): Promise<boolean> => {
    setBlogPosts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveToLocal(STORAGE_KEYS.blogPosts, next);
      return next;
    });

    if (isUsingSupabase && supabase) {
      try {
        await supabase.from('blog_posts').delete().eq('id', id);
      } catch (err) {
        console.error('Failed to delete blog post on Supabase:', err);
      }
    }

    return true;
  };

  const addBlogCategory = async (catData: Omit<BlogCategory, 'id' | 'created_at'>): Promise<BlogCategory> => {
    const newCat: BlogCategory = {
      ...catData,
      id: createId(),
      created_at: new Date().toISOString(),
    };

    setBlogCategories((prev) => {
      const next = [...prev, newCat];
      saveToLocal(STORAGE_KEYS.blogCategories, next);
      return next;
    });

    if (isUsingSupabase && supabase) {
      try {
        await supabase.from('blog_categories').insert(newCat);
      } catch (err) {
        console.error('Failed to insert blog category into Supabase:', err);
      }
    }

    return newCat;
  };

  const updateBlogCategory = async (id: string, data: Partial<BlogCategory>): Promise<boolean> => {
    setBlogCategories((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, ...data } : c));
      saveToLocal(STORAGE_KEYS.blogCategories, next);
      return next;
    });

    if (isUsingSupabase && supabase) {
      try {
        await supabase.from('blog_categories').update(data).eq('id', id);
      } catch (err) {
        console.error('Failed to update blog category on Supabase:', err);
      }
    }

    return true;
  };

  const deleteBlogCategory = async (id: string): Promise<boolean> => {
    setBlogCategories((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveToLocal(STORAGE_KEYS.blogCategories, next);
      return next;
    });

    if (isUsingSupabase && supabase) {
      try {
        await supabase.from('blog_categories').delete().eq('id', id);
      } catch (err) {
        console.error('Failed to delete blog category from Supabase:', err);
      }
    }

    return true;
  };

  const resetToDefault = () => {
    setInventory([]);
    setCustomers([]);
    setTickets([]);
    setSpareParts([]);
    setSoftwareLicenses([]);
    setOnsiteDispatches([]);
    setShiftLogs([]);
    setReviews([]);
    setLicenseKeys([]);
    setKeyReleaseRequests([]);
    setWarrantyProvisions([]);
    setBlogPosts([]);
    setBlogCategories([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.inventory);
      localStorage.removeItem(STORAGE_KEYS.customers);
      localStorage.removeItem(STORAGE_KEYS.tickets);
      localStorage.removeItem(STORAGE_KEYS.spareParts);
      localStorage.removeItem(STORAGE_KEYS.softwareLicenses);
      localStorage.removeItem(STORAGE_KEYS.onsiteDispatches);
      localStorage.removeItem(STORAGE_KEYS.shiftLogs);
      localStorage.removeItem(STORAGE_KEYS.faqs);
      localStorage.removeItem(STORAGE_KEYS.reviews);
      localStorage.removeItem(STORAGE_KEYS.licenseKeys);
      localStorage.removeItem(STORAGE_KEYS.keyReleaseRequests);
      localStorage.removeItem(STORAGE_KEYS.warrantyProvisions);
      localStorage.removeItem(STORAGE_KEYS.blogPosts);
      localStorage.removeItem(STORAGE_KEYS.blogCategories);
    }
    if (isUsingSupabase && supabase) {
      syncWithSupabase().catch((e) => console.warn('Supabase resync warning:', e));
    }
  };

  const contextValue = useMemo<StoreContextType>(
    () => ({
      systemSettings,
      updateSystemSettings,
      currentLang,
      setLang,
      themeMode,
      toggleTheme,
      currentUser,
      users,
      isLoggedIn,
      isLoggingOut,
      logoutCountdown,
      triggerImmediateRedirectToLogin,
      loginWithCredentials,
      logout,
      canEditStock,
      canUpdateRepairStatus,
      canAccessPayroll,
      canAccessFinancials,
      canAccessSettings,
      canManageUsers,
      canAssignTasks,
      canSellAndEditWarranty,
      canAccessCRM,
      sellInventoryItem,
      sellSparePart,
      updateUser,
      changeUserPassword,
      resetUserPassword,
      addUser,
      deleteUser,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      inventory,
      customers,
      tickets,
      spareParts,
      addSparePart,
      updateSparePart,
      deleteSparePart,
      softwareLicenses,
      addSoftwareLicense,
      updateSoftwareLicense,
      deleteSoftwareLicense,
      keyCategories,
      licenseKeys,
      keyReleaseRequests,
      keyEmailTemplate,
      addKeyCategory,
      deleteKeyCategory,
      addLicenseKey,
      addBatchLicenseKeys,
      deleteLicenseKey,
      updateLicenseKey,
      takeKeyForCustomer,
      createKeyReleaseRequest,
      approveKeyReleaseRequest,
      quickRestockAndApproveKeyRequest,
      confirmKeyActive,
      reportKeyFaulty,
      restoreFaultyKey,
      rejectKeyReleaseRequest,
      updateKeyEmailTemplate,
      warrantyProvisions,
      approveWarrantyProvision,
      unlockMaturedWarrantyProvisions,
      settleUnlockedWarrantyProvisionsYearEnd,
      addSoftwareKeys,
      assignSoftwareKey,
      updateSoftwareKeyStatus,
      deleteSoftwareKey,
      onsiteDispatches,
      shiftLogs,
      faqs,
      addFaq,
      updateFaq,
      deleteFaq,
      reviews,
      addReview,
      deleteReview,
      blogPosts,
      blogCategories,
      addBlogPost,
      updateBlogPost,
      deleteBlogPost,
      addBlogCategory,
      updateBlogCategory,
      deleteBlogCategory,
      isUsingSupabase,
      isLoading,
      syncStatus,
      syncError,
      lastSyncedAt,
      syncWithSupabase,
      findWarrantyByTagOrPhone,
      addInventoryItem,
      updateInventoryItem,
      updateInventoryStock,
      updateQcStatus,
      deleteInventoryItem,
      reserveInventoryItem,
      cancelReservationItem,
      addServiceTicket,
      updateTicketStatus,
      updateTicketDetails,
      assignTicketTechnician,
      updateDispatchStatus,
      assignDispatchTechnician,
      addShiftLog,
      pendingOrders,
      pendingOrdersCount: pendingOrders.length,
      fetchPendingOrders,
      confirmPendingOrder,
      resetToDefault,
    }),
    [
      systemSettings,
      currentLang,
      currentUser,
      users,
      isLoggedIn,
      isLoggingOut,
      logoutCountdown,
      inventory,
      customers,
      tickets,
      spareParts,
      softwareLicenses,
      keyCategories,
      licenseKeys,
      keyReleaseRequests,
      keyEmailTemplate,
      warrantyProvisions,
      onsiteDispatches,
      shiftLogs,
      pendingOrders,
      faqs,
      reviews,
      blogPosts,
      blogCategories,
      isUsingSupabase,
      isLoading,
      syncStatus,
      syncError,
      lastSyncedAt,
    ]
  );

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
}

export function useViTinhAnTamStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useViTinhAnTamStore must be used within a StoreProvider');
  }
  return context;
}

export const useStore = useViTinhAnTamStore;
