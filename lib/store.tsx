'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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
} from './supabase';
import {
  initialCustomers,
  initialInventory,
  initialSpareParts,
  initialSoftwareLicenses,
  initialTickets,
  initialOnsiteDispatches,
  initialShiftLogs,
  initialUsers,
  FaqItem,
  CustomerReview,
  initialFaqs,
  initialCustomerReviews,
} from './mockData';


export interface SystemSettings {
  logoUrl?: string;
  logoDisplayMode?: 'icon_with_text' | 'image_only';
  faviconUrl?: string;
  brandSlogan?: string;
  hotline: string;
  zaloNumber: string;
  zaloLink: string;
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
}

export const initialSystemSettings: SystemSettings = {
  logoUrl: '',
  logoDisplayMode: 'icon_with_text',
  faviconUrl: '',
  brandSlogan: 'Bán bằng tâm để bạn an tâm',
  hotline: '0909.053.058',
  zaloNumber: '0909053058',
  zaloLink: 'https://zalo.me/0909053058',
  whatsappNumber: '0909053058',
  whatsappLink: 'https://wa.me/84909053058',
  email: 'lienhe@vitinhantham.vn',
  address: '52 Nguyễn Cửu Vân, P. Long An, tỉnh Tây Ninh',
  streetAddress: '52 Nguyễn Cửu Vân',
  district: 'P. Long An',
  city: 'Tây Ninh',
  serviceAreas: 'Tân An, Thủ Thừa, Châu Thành, Tân Trụ',
  workingHoursWeekday: '08h00 - 17h30 (Cứu hộ ưu tiên: 17h30 - 21h00)',
  workingHoursWeekend: '08h00 - 21h00 (Cả ngày)',
  primeHours: '17:30 - 21:00',
  footerAbout: 'Chuyên cung cấp PC/laptop tuyển chọn nồi đồng cối đá Dell, HP, ThinkPad & dịch vụ cứu hộ, bảo hành hỏa tốc trong 2 giờ (<5km Tân An).',
  footerCopyright: `© ${new Date().getFullYear()} Vi Tính An Tâm (vitinhantham.vn) - Bán bằng tâm để bạn an tâm.`,
  storeName: 'Vi Tính An Tâm',
};

interface StoreContextType {
  // System Settings & Language
  systemSettings: SystemSettings;
  updateSystemSettings: (data: Partial<SystemSettings>) => Promise<boolean>;
  currentLang: 'vi' | 'en';
  setLang: (lang: 'vi' | 'en') => void;

  // RBAC Profile & Auth & Member Management
  currentUser: UserAccount;
  users: UserAccount[];
  isLoggedIn: boolean;
  setCurrentUserRole: (role: UserRole) => void;
  setCurrentUserById: (id: string) => void;
  login: (role: UserRole) => void;
  loginWithCredentials: (email: string, password: string) => { success: boolean; message: string; user?: UserAccount };
  logout: () => void;
  canEditStock: () => boolean;
  canUpdateRepairStatus: () => boolean;
  canAccessPayroll: () => boolean;
  canAccessSettings: () => boolean;
  canManageUsers: () => boolean;
  canSellAndEditWarranty: () => boolean; // Admin & Sales have full access to sell, edit customer, serial & warranty
  canAccessCRM: () => boolean; // Admin & Sales have full CRM access, KTV view-only

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
  }) => Promise<{ success: boolean; customerCode: string; message: string }>;

  // Member management actions (Admin)
  updateUser: (id: string, data: Partial<UserAccount>) => Promise<boolean>;
  changeUserPassword: (id: string, newPassword: string) => Promise<boolean>;
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

  // Sync state
  isUsingSupabase: boolean;
  isLoading: boolean;
  syncStatus: 'synced' | 'local' | 'syncing';
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

  // Reset
  resetToDefault: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEYS = {
  role: 'vtat_user_role_v3',
  userId: 'vtat_user_id_v3',
  users: 'vtat_users_v3',
  isLoggedIn: 'vtat_is_logged_in_v3',
  inventory: 'vtat_inventory_v2',
  customers: 'vtat_customers_v2',
  tickets: 'vtat_tickets_v2',
  spareParts: 'vtat_spare_parts_v2',
  softwareLicenses: 'vtat_software_licenses_v1',
  onsiteDispatches: 'vtat_onsite_dispatches_v2',
  shiftLogs: 'vtat_shift_logs_v2',
  faqs: 'vtat_faqs_v2',
  reviews: 'vtat_reviews_v2',
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // Members & RBAC State & Login status (Mặc định khi mở web là KHÁCH, CHƯA ĐĂNG NHẬP)
  const [users, setUsers] = useState<UserAccount[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<UserAccount>(initialUsers[0]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Collections
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [faqs, setFaqs] = useState<FaqItem[]>(initialFaqs);
  const [reviews, setReviews] = useState<CustomerReview[]>(initialCustomerReviews);
  const [tickets, setTickets] = useState<ServiceTicket[]>(initialTickets);
  const [spareParts, setSpareParts] = useState<SparePart[]>(initialSpareParts);
  const [softwareLicenses, setSoftwareLicenses] = useState<SoftwareLicense[]>(initialSoftwareLicenses);
  const [onsiteDispatches, setOnsiteDispatches] = useState<OnsiteDispatch[]>(initialOnsiteDispatches);
  const [shiftLogs, setShiftLogs] = useState<ShiftLog[]>(initialShiftLogs);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(initialSystemSettings);
  const [currentLang, setCurrentLang] = useState<'vi' | 'en'>('vi');

  // Connection & Sync
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'local' | 'syncing'>('local');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const isUsingSupabase = isSupabaseConfigured();

  // Role permissions
  const canEditStock = () => currentUser.role === 'admin' || currentUser.permissions?.can_edit_stock === true;
  const canUpdateRepairStatus = () =>
    currentUser.role === 'admin' ||
    currentUser.role === 'technician' ||
    currentUser.permissions?.can_update_repair_status === true;
  const canAccessPayroll = () => currentUser.role === 'admin' || currentUser.permissions?.can_access_payroll === true;
  const canAccessSettings = () => currentUser.role === 'admin' || currentUser.permissions?.can_manage_users === true;
  const canManageUsers = () => currentUser.role === 'admin' || currentUser.permissions?.can_manage_users === true;
  const canSellAndEditWarranty = () => currentUser.role === 'admin' || currentUser.role === 'sales';
  const canAccessCRM = () => currentUser.role === 'admin' || currentUser.role === 'sales';

  const setCurrentUserRole = (role: UserRole) => {
    const found = users.find((u) => u.role === role) || initialUsers.find((u) => u.role === role) || initialUsers[0];
    setCurrentUser(found);
    setIsLoggedIn(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.role, role);
      localStorage.setItem(STORAGE_KEYS.userId, found.id);
      localStorage.setItem(STORAGE_KEYS.isLoggedIn, 'true');
    }
  };

  const setCurrentUserById = (id: string) => {
    const found = users.find((u) => u.id === id);
    if (found) {
      setCurrentUser(found);
      setIsLoggedIn(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.role, found.role);
        localStorage.setItem(STORAGE_KEYS.userId, found.id);
        localStorage.setItem(STORAGE_KEYS.isLoggedIn, 'true');
      }
    }
  };

  const login = (role: UserRole) => {
    setCurrentUserRole(role);
  };

  const loginWithCredentials = (
    identifier: string,
    password: string
  ): { success: boolean; message: string; user?: UserAccount } => {
    const raw = identifier.trim().toLowerCase();
    const cleanPhone = identifier.replace(/\D/g, '');
    const found = users.find((u) => {
      const uUsername = u.username?.toLowerCase();
      const uEmail = u.email?.toLowerCase();
      const uPhone = u.phone?.replace(/\D/g, '');
      return (
        (uUsername && uUsername === raw) ||
        (uEmail && uEmail === raw) ||
        (cleanPhone.length >= 8 && uPhone && uPhone === cleanPhone)
      );
    });

    if (!found) {
      return { success: false, message: 'Tên đăng nhập hoặc Email không tồn tại trên hệ thống.' };
    }
    if (found.password !== password.trim()) {
      return { success: false, message: 'Mật khẩu không chính xác. Vui lòng kiểm tra lại!' };
    }
    if (found.status === 'suspended') {
      return { success: false, message: 'Tài khoản này đang bị tạm khóa. Vui lòng liên hệ Admin!' };
    }
    setCurrentUser(found);
    setIsLoggedIn(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.role, found.role);
      localStorage.setItem(STORAGE_KEYS.userId, found.id);
      localStorage.setItem(STORAGE_KEYS.isLoggedIn, 'true');
    }
    return { success: true, message: `Đăng nhập thành công: ${found.roleTitle} (${found.name})!`, user: found };
  };

  const logout = () => {
    setIsLoggedIn(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.isLoggedIn, 'false');
      localStorage.removeItem(STORAGE_KEYS.userId);
      localStorage.removeItem(STORAGE_KEYS.role);
    }
  };

  // Member Management Actions
  const updateUser = async (id: string, data: Partial<UserAccount>): Promise<boolean> => {
    let updated = false;
    setUsers((prev) => {
      const next = prev.map((u) => {
        if (u.id === id) {
          updated = true;
          const updatedUser: UserAccount = {
            ...u,
            ...data,
            permissions: {
              ...u.permissions,
              ...(data.permissions || {}),
            },
          };
          if (currentUser.id === id) {
            setCurrentUser(updatedUser);
          }
          return updatedUser;
        }
        return u;
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(next));
      }
      return next;
    });
    return updated;
  };

  const changeUserPassword = async (id: string, newPassword: string): Promise<boolean> => {
    return updateUser(id, { password: newPassword });
  };

  const addUser = async (userData: Omit<UserAccount, 'id' | 'created_at'>): Promise<UserAccount> => {
    const newUser: UserAccount = {
      ...userData,
      username: userData.username || userData.email.split('@')[0],
      id: `u-${Date.now()}`,
      created_at: new Date().toISOString(),
      permissions: userData.permissions || {
        can_edit_stock: userData.role === 'admin',
        can_update_repair_status: userData.role === 'admin' || userData.role === 'technician',
        can_access_payroll: userData.role === 'admin',
        can_manage_users: userData.role === 'admin',
      },
    };
    setUsers((prev) => {
      const next = [newUser, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(next));
      }
      return next;
    });
    return newUser;
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    if (id === currentUser.id) return false;
    setUsers((prev) => {
      const next = prev.filter((u) => u.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(next));
      }
      return next;
    });
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
    return true;
  };

  const setLang = (lang: 'vi' | 'en') => {
    setCurrentLang(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vtat_lang_v2', lang);
    }
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

  // Load from Storage or Supabase
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);

      // Load saved users
      let currentUsersList = initialUsers;
      if (typeof window !== 'undefined') {
        const savedUsersJson = localStorage.getItem(STORAGE_KEYS.users);
        if (savedUsersJson) {
          try {
            const parsed = JSON.parse(savedUsersJson);
            if (Array.isArray(parsed) && parsed.length > 0) {
              currentUsersList = parsed;
              setUsers(parsed);
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

      if (isUsingSupabase && supabase) {
        try {
          const [
            { data: invData },
            { data: cusData },
            { data: tckData },
            { data: spData },
            { data: onsData },
            { data: shfData },
          ] = await Promise.all([
            supabase.from('inventory_items').select('*'),
            supabase.from('customers').select('*'),
            supabase.from('service_tickets').select('*'),
            supabase.from('spare_parts').select('*'),
            supabase.from('onsite_dispatches').select('*'),
            supabase.from('shift_logs').select('*'),
          ]);

          if (invData && invData.length > 0) setInventory(invData as InventoryItem[]);
          if (cusData && cusData.length > 0) setCustomers(cusData as Customer[]);
          if (tckData && tckData.length > 0) setTickets(tckData as ServiceTicket[]);
          if (spData && spData.length > 0) setSpareParts(spData as SparePart[]);
          if (onsData && onsData.length > 0) setOnsiteDispatches(onsData as OnsiteDispatch[]);
          if (shfData && shfData.length > 0) setShiftLogs(shfData as ShiftLog[]);

          setSyncStatus('synced');
          setLastSyncedAt(new Date().toLocaleTimeString('vi-VN'));
          setIsLoading(false);
          return;
        } catch (err) {
          console.warn('Could not fetch from Supabase, fallback to local storage:', err);
        }
      }

      // Local storage fallback
      if (typeof window !== 'undefined') {
        const savedInv = localStorage.getItem(STORAGE_KEYS.inventory);
        const savedCus = localStorage.getItem(STORAGE_KEYS.customers);
        const savedTck = localStorage.getItem(STORAGE_KEYS.tickets);
        const savedSp = localStorage.getItem(STORAGE_KEYS.spareParts);
        const savedSw = localStorage.getItem(STORAGE_KEYS.softwareLicenses);
        const savedOns = localStorage.getItem(STORAGE_KEYS.onsiteDispatches);
        const savedShf = localStorage.getItem(STORAGE_KEYS.shiftLogs);
        const savedFaqs = localStorage.getItem(STORAGE_KEYS.faqs);
        const savedRevs = localStorage.getItem(STORAGE_KEYS.reviews);

        if (savedInv) setInventory(JSON.parse(savedInv));
        if (savedCus) setCustomers(JSON.parse(savedCus));
        if (savedTck) setTickets(JSON.parse(savedTck));
        if (savedSp) setSpareParts(JSON.parse(savedSp));
        if (savedSw) setSoftwareLicenses(JSON.parse(savedSw));
        if (savedOns) setOnsiteDispatches(JSON.parse(savedOns));
        if (savedShf) setShiftLogs(JSON.parse(savedShf));
        if (savedFaqs) setFaqs(JSON.parse(savedFaqs));
        if (savedRevs) setReviews(JSON.parse(savedRevs));

        const savedSettings = localStorage.getItem('vtat_system_settings_v2');
        if (savedSettings) {
          try {
            const parsed = JSON.parse(savedSettings);
            setSystemSettings((prev) => ({ ...prev, ...parsed }));
          } catch (e) {
            console.warn('Failed to parse saved system settings', e);
          }
        }

        const savedLang = localStorage.getItem('vtat_lang_v2');
        if (savedLang === 'vi' || savedLang === 'en') {
          setCurrentLang(savedLang);
        }
      }

      setSyncStatus('local');
      setIsLoading(false);
    }

    loadData();
  }, [isUsingSupabase]);

  // Sync back to Supabase if configured
  const syncWithSupabase = async () => {
    if (!isUsingSupabase || !supabase) {
      setSyncStatus('local');
      return;
    }
    setSyncStatus('syncing');
    try {
      setLastSyncedAt(new Date().toLocaleTimeString('vi-VN'));
      setSyncStatus('synced');
    } catch (err) {
      console.error('Sync failed:', err);
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
      const matchedCust = customers.find((c) => c.phone.replace(/\D/g, '').includes(rawDigits));
      const matchedTicket = tickets.find((t) => t.customer_phone.replace(/\D/g, '').includes(rawDigits));
      const matchedItemByPhone = inventory.find((i) =>
        i.customer_phone ? i.customer_phone.replace(/\D/g, '').includes(rawDigits) : false
      );

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
      id: `inv-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    setInventory((prev) => {
      const next = [newItem, ...prev];
      saveToLocal(STORAGE_KEYS.inventory, next);
      return next;
    });

    if (isUsingSupabase && supabase) {
      try {
        await supabase.from('inventory_items').insert([newItem]);
      } catch (e) {
        console.warn('Supabase insert failed, local updated:', e);
      }
    }
    return newItem;
  };

  const updateInventoryItem = async (id: string, data: Partial<InventoryItem>) => {
    setInventory((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, ...data } : item));
      saveToLocal(STORAGE_KEYS.inventory, next);
      return next;
    });

    if (isUsingSupabase && supabase) {
      try {
        await supabase.from('inventory_items').update(data).eq('id', id);
      } catch (e) {
        console.warn('Supabase update failed:', e);
      }
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
    await updateInventoryItem(id, { qc_status: status });
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
    if (isUsingSupabase && supabase) {
      try {
        await supabase.from('inventory_items').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete failed:', e);
      }
    }
    return true;
  };

  // Spare parts management (Linh kiện mới & cũ)
  const addSparePart = async (partData: Omit<SparePart, 'id'>): Promise<SparePart> => {
    const newPart: SparePart = {
      ...partData,
      id: `sp-${Date.now()}`,
    };
    setSpareParts((prev) => {
      const next = [newPart, ...prev];
      saveToLocal(STORAGE_KEYS.spareParts, next);
      return next;
    });
    return newPart;
  };

  const updateSparePart = async (id: string, data: Partial<SparePart>): Promise<boolean> => {
    setSpareParts((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, ...data } : item));
      saveToLocal(STORAGE_KEYS.spareParts, next);
      return next;
    });
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

  // Ticket actions
  const addServiceTicket = async (ticketData: Omit<ServiceTicket, 'id' | 'created_at'>): Promise<ServiceTicket> => {
    const newTicket: ServiceTicket = {
      ...ticketData,
      id: `ticket-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    setTickets((prev) => {
      const next = [newTicket, ...prev];
      saveToLocal(STORAGE_KEYS.tickets, next);
      return next;
    });

    if (isUsingSupabase && supabase) {
      try {
        await supabase.from('service_tickets').insert([newTicket]);
      } catch (e) {
        console.warn('Supabase insert failed:', e);
      }
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

    if (isUsingSupabase && supabase) {
      try {
        await supabase.from('service_tickets').update({ status }).eq('id', id);
      } catch (e) {
        console.warn('Supabase ticket status update failed:', e);
      }
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
  };

  // Shift logs (Admin only)
  const addShiftLog = async (shiftData: Omit<ShiftLog, 'id' | 'created_at'>): Promise<ShiftLog> => {
    const newShift: ShiftLog = {
      ...shiftData,
      id: `shift-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    setShiftLogs((prev) => {
      const next = [newShift, ...prev];
      saveToLocal(STORAGE_KEYS.shiftLogs, next);
      return next;
    });
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
      serial_number: params.serialNumber.trim() || item.serial_number || item.service_tag,
      warranty_months: params.warrantyMonths,
      handover_date: new Date().toISOString(),
      retail_price: params.soldPrice || item.retail_price || item.price,
    };

    setInventory((prev) => {
      const next = prev.map((i) => (i.id === params.itemId ? updatedItem : i));
      saveToLocal(STORAGE_KEYS.inventory, next);
      return next;
    });

    // 2. Add or Update Customer with Customer Code and Birth Date
    const newCustomer: Customer = {
      id: `c-${Date.now()}`,
      customer_code: customerCode,
      full_name: params.customerName.trim(),
      birth_date: params.birthDate,
      phone: params.customerPhone.trim(),
      address: params.customerAddress.trim() || 'Long An - Tây Ninh',
      customer_tier: 'VIP',
      notes: `Mua máy ${item.device_model || item.brand} (Tag: ${item.service_tag}, Serial: ${params.serialNumber})`,
      created_at: new Date().toISOString(),
    };

    setCustomers((prev) => {
      const next = [newCustomer, ...prev];
      saveToLocal(STORAGE_KEYS.customers, next);
      return next;
    });

    // 3. Create a Service Ticket record for warranty lookup
    const warrantyTicket: ServiceTicket = {
      id: `tck-${Date.now()}`,
      ticket_code: `#HD-${customerCode}-${item.service_tag.slice(-4)}`,
      customer_name: params.customerName.trim(),
      customer_phone: params.customerPhone.trim(),
      customer_address: params.customerAddress.trim(),
      device_service_tag: item.service_tag,
      device_name: item.device_model || item.model || `${item.brand} ${item.form_factor}`,
      technician_name: currentUser.name,
      status: 'delivered',
      visual_condition: 'Máy chuẩn A bàn giao mới 100% nguyên bản',
      technician_note: `Bán hàng thành công. Serial: ${params.serialNumber}. Bảo hành ${params.warrantyMonths} tháng.`,
      estimated_cost: params.soldPrice || item.retail_price || item.price || 0,
      total_amount: params.soldPrice || item.retail_price || item.price || 0,
      created_at: new Date().toISOString(),
      warranty_until: new Date(Date.now() + params.warrantyMonths * 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    setTickets((prev) => {
      const next = [warrantyTicket, ...prev];
      saveToLocal(STORAGE_KEYS.tickets, next);
      return next;
    });

    return {
      success: true,
      customerCode,
      message: `Bán máy thành công! Mã khách hàng: ${customerCode} (Bảo hành ${params.warrantyMonths} tháng)`,
    };
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
      id: `cus-${Date.now()}`,
      customer_code: customerCode,
      created_at: new Date().toISOString(),
    };

    setCustomers((prev) => {
      const next = [newCustomer, ...prev];
      saveToLocal(STORAGE_KEYS.customers, next);
      return next;
    });

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

  const resetToDefault = () => {
    setUsers(initialUsers);
    setCurrentUser(initialUsers[0]);
    setInventory(initialInventory);
    setCustomers(initialCustomers);
    setTickets(initialTickets);
    setSpareParts(initialSpareParts);
    setSoftwareLicenses(initialSoftwareLicenses);
    setOnsiteDispatches(initialOnsiteDispatches);
    setShiftLogs(initialShiftLogs);
    setFaqs(initialFaqs);
    setReviews(initialCustomerReviews);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.users);
      localStorage.removeItem(STORAGE_KEYS.userId);
      localStorage.removeItem(STORAGE_KEYS.inventory);
      localStorage.removeItem(STORAGE_KEYS.customers);
      localStorage.removeItem(STORAGE_KEYS.tickets);
      localStorage.removeItem(STORAGE_KEYS.spareParts);
      localStorage.removeItem(STORAGE_KEYS.softwareLicenses);
      localStorage.removeItem(STORAGE_KEYS.onsiteDispatches);
      localStorage.removeItem(STORAGE_KEYS.shiftLogs);
      localStorage.removeItem(STORAGE_KEYS.faqs);
      localStorage.removeItem(STORAGE_KEYS.reviews);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        systemSettings,
        updateSystemSettings,
        currentLang,
        setLang,
        currentUser,
        users,
        isLoggedIn,
        setCurrentUserRole,
        setCurrentUserById,
        login,
        loginWithCredentials,
        logout,
        canEditStock,
        canUpdateRepairStatus,
        canAccessPayroll,
        canAccessSettings,
        canManageUsers,
        canSellAndEditWarranty,
        canAccessCRM,
        sellInventoryItem,
        updateUser,
        changeUserPassword,
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
        isUsingSupabase,
        isLoading,
        syncStatus,
        lastSyncedAt,
        syncWithSupabase,
        findWarrantyByTagOrPhone,
        addInventoryItem,
        updateInventoryItem,
        updateInventoryStock,
        updateQcStatus,
        deleteInventoryItem,
        addServiceTicket,
        updateTicketStatus,
        updateDispatchStatus,
        addShiftLog,
        resetToDefault,
      }}
    >
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
