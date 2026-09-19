'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  supabase,
  isSupabaseConfigured,
  UserRole,
  UserProfile,
  MOCK_USERS,
  Customer,
  InventoryItem,
  SparePart,
  ServiceTicket,
  OnsiteDispatch,
  ShiftLog,
} from './supabase';
import {
  initialCustomers,
  initialInventory,
  initialSpareParts,
  initialTickets,
  initialOnsiteDispatches,
  initialShiftLogs,
} from './mockData';

interface StoreContextType {
  // RBAC Profile & Auth
  currentUser: UserProfile;
  isLoggedIn: boolean;
  setCurrentUserRole: (role: UserRole) => void;
  login: (role: UserRole) => void;
  logout: () => void;
  canEditStock: () => boolean;
  canUpdateRepairStatus: () => boolean;
  canAccessPayroll: () => boolean;
  canAccessSettings: () => boolean;

  // Data Collections
  inventory: InventoryItem[];
  customers: Customer[];
  tickets: ServiceTicket[];
  spareParts: SparePart[];
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

  // Ticket actions
  addServiceTicket: (ticket: Omit<ServiceTicket, 'id' | 'created_at'>) => Promise<ServiceTicket>;
  updateTicketStatus: (id: string, status: ServiceTicket['status']) => Promise<boolean>; // Tech & Admin only

  // Onsite dispatch actions
  updateDispatchStatus: (id: string, status: OnsiteDispatch['status']) => Promise<void>;

  // Shift & Payroll (Admin Only)
  addShiftLog: (shift: Omit<ShiftLog, 'id' | 'created_at'>) => Promise<ShiftLog>;

  // Reset
  resetToDefault: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEYS = {
  role: 'vtat_user_role_v2',
  isLoggedIn: 'vtat_is_logged_in_v2',
  inventory: 'vtat_inventory_v2',
  customers: 'vtat_customers_v2',
  tickets: 'vtat_tickets_v2',
  spareParts: 'vtat_spare_parts_v2',
  onsiteDispatches: 'vtat_onsite_dispatches_v2',
  shiftLogs: 'vtat_shift_logs_v2',
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // RBAC State & Login status
  const [currentUser, setCurrentUser] = useState<UserProfile>(MOCK_USERS.admin);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  // Collections
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [tickets, setTickets] = useState<ServiceTicket[]>(initialTickets);
  const [spareParts, setSpareParts] = useState<SparePart[]>(initialSpareParts);
  const [onsiteDispatches, setOnsiteDispatches] = useState<OnsiteDispatch[]>(initialOnsiteDispatches);
  const [shiftLogs, setShiftLogs] = useState<ShiftLog[]>(initialShiftLogs);

  // Connection & Sync
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'local' | 'syncing'>('local');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const isUsingSupabase = isSupabaseConfigured();

  // Role permissions
  const canEditStock = () => currentUser.role === 'admin';
  const canUpdateRepairStatus = () => currentUser.role === 'admin' || currentUser.role === 'technician';
  const canAccessPayroll = () => currentUser.role === 'admin';
  const canAccessSettings = () => currentUser.role === 'admin';

  const setCurrentUserRole = (role: UserRole) => {
    setCurrentUser(MOCK_USERS[role]);
    setIsLoggedIn(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.role, role);
      localStorage.setItem(STORAGE_KEYS.isLoggedIn, 'true');
    }
  };

  const login = (role: UserRole) => {
    setCurrentUser(MOCK_USERS[role]);
    setIsLoggedIn(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.role, role);
      localStorage.setItem(STORAGE_KEYS.isLoggedIn, 'true');
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.isLoggedIn);
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

      // Load saved role and login status if any
      if (typeof window !== 'undefined') {
        const savedRole = localStorage.getItem(STORAGE_KEYS.role) as UserRole | null;
        const savedLoggedIn = localStorage.getItem(STORAGE_KEYS.isLoggedIn);
        if (savedRole && MOCK_USERS[savedRole]) {
          setCurrentUser(MOCK_USERS[savedRole]);
        }
        if (savedLoggedIn === 'false') {
          setIsLoggedIn(false);
        } else if (savedLoggedIn === 'true') {
          setIsLoggedIn(true);
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
        const savedOns = localStorage.getItem(STORAGE_KEYS.onsiteDispatches);
        const savedShf = localStorage.getItem(STORAGE_KEYS.shiftLogs);

        if (savedInv) setInventory(JSON.parse(savedInv));
        if (savedCus) setCustomers(JSON.parse(savedCus));
        if (savedTck) setTickets(JSON.parse(savedTck));
        if (savedSp) setSpareParts(JSON.parse(savedSp));
        if (savedOns) setOnsiteDispatches(JSON.parse(savedOns));
        if (savedShf) setShiftLogs(JSON.parse(savedShf));
      }

      setSyncStatus('local');
      setIsLoading(false);
    }

    loadData();
  }, [isUsingSupabase]);

  const syncWithSupabase = async () => {
    if (!isUsingSupabase || !supabase) {
      setSyncStatus('local');
      return;
    }
    try {
      setSyncStatus('syncing');
      await Promise.all([
        supabase.from('inventory_items').upsert(inventory),
        supabase.from('customers').upsert(customers),
        supabase.from('service_tickets').upsert(tickets),
        supabase.from('spare_parts').upsert(spareParts),
        supabase.from('onsite_dispatches').upsert(onsiteDispatches),
        supabase.from('shift_logs').upsert(shiftLogs),
      ]);
      setSyncStatus('synced');
      setLastSyncedAt(new Date().toLocaleTimeString('vi-VN'));
    } catch (err) {
      console.warn('Sync failed:', err);
      setSyncStatus('local');
    }
  };

  // Tra cứu công khai theo SĐT hoặc Service Tag
  const findWarrantyByTagOrPhone = (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return null;

    // Tìm trong inventory
    const matchedItem = inventory.find(
      (item) =>
        item.service_tag.toLowerCase() === q ||
        (item.customer_phone && item.customer_phone.replace(/\D/g, '').includes(q.replace(/\D/g, '')))
    );

    // Tìm trong tickets
    const matchedTicket = tickets.find(
      (t) =>
        (t.device_service_tag && t.device_service_tag.toLowerCase() === q) ||
        (t.service_tag && t.service_tag.toLowerCase() === q) ||
        t.ticket_code.toLowerCase() === q ||
        t.customer_phone.replace(/\D/g, '').includes(q.replace(/\D/g, ''))
    );

    // Tìm khách hàng
    const matchedCustomer = customers.find((c) =>
      c.phone.replace(/\D/g, '').includes(q.replace(/\D/g, ''))
    );

    if (matchedItem || matchedTicket || matchedCustomer) {
      return {
        item: matchedItem,
        ticket: matchedTicket,
        customer: matchedCustomer,
      };
    }
    return null;
  };

  // Inventory Actions
  const addInventoryItem = async (
    itemData: Omit<InventoryItem, 'id' | 'created_at'>
  ): Promise<InventoryItem> => {
    const newItem: InventoryItem = {
      ...itemData,
      id: 'inv_' + Date.now(),
      created_at: new Date().toISOString(),
    };

    if (isUsingSupabase && supabase) {
      try {
        const { data, error } = await supabase
          .from('inventory_items')
          .insert(newItem)
          .select()
          .single();
        if (!error && data) {
          const finalItem = data as InventoryItem;
          const updated = [finalItem, ...inventory];
          setInventory(updated);
          saveToLocal(STORAGE_KEYS.inventory, updated);
          return finalItem;
        }
      } catch (e) {
        console.warn('Supabase insert error, fallback local:', e);
      }
    }

    const updated = [newItem, ...inventory];
    setInventory(updated);
    saveToLocal(STORAGE_KEYS.inventory, updated);
    return newItem;
  };

  const updateInventoryItem = async (id: string, data: Partial<InventoryItem>): Promise<void> => {
    const updated = inventory.map((item) => (item.id === id ? { ...item, ...data } : item));
    setInventory(updated);
    saveToLocal(STORAGE_KEYS.inventory, updated);

    if (isUsingSupabase && supabase) {
      try {
        await supabase.from('inventory_items').update(data).eq('id', id);
      } catch (e) {
        console.warn('Supabase update error:', e);
      }
    }
  };

  // Restricted to Admin
  const updateInventoryStock = async (id: string, newQuantity: number): Promise<boolean> => {
    if (!canEditStock()) {
      alert('Chỉ Quản trị viên (Admin) mới có quyền điều chỉnh số lượng tồn kho!');
      return false;
    }
    await updateInventoryItem(id, { quantity: newQuantity });
    return true;
  };

  // Tech & Admin can update testing/ready_to_sell status
  const updateQcStatus = async (id: string, qc_status: InventoryItem['qc_status']): Promise<void> => {
    await updateInventoryItem(id, { qc_status });
  };

  // Restricted to Admin
  const deleteInventoryItem = async (id: string): Promise<boolean> => {
    if (!canEditStock()) {
      alert('Chỉ Quản trị viên (Admin) mới có quyền xóa thiết bị trong kho!');
      return false;
    }
    const updated = inventory.filter((item) => item.id !== id);
    setInventory(updated);
    saveToLocal(STORAGE_KEYS.inventory, updated);

    if (isUsingSupabase && supabase) {
      try {
        await supabase.from('inventory_items').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete error:', e);
      }
    }
    return true;
  };

  // Ticket Actions
  const addServiceTicket = async (
    ticketData: Omit<ServiceTicket, 'id' | 'created_at'>
  ): Promise<ServiceTicket> => {
    const newTicket: ServiceTicket = {
      ...ticketData,
      id: 'tk_' + Date.now(),
      created_at: new Date().toISOString(),
    };

    if (isUsingSupabase && supabase) {
      try {
        const { data, error } = await supabase
          .from('service_tickets')
          .insert(newTicket)
          .select()
          .single();
        if (!error && data) {
          const finalTicket = data as ServiceTicket;
          const updated = [finalTicket, ...tickets];
          setTickets(updated);
          saveToLocal(STORAGE_KEYS.tickets, updated);
          return finalTicket;
        }
      } catch (e) {
        console.warn('Supabase ticket insert error, fallback local:', e);
      }
    }

    const updated = [newTicket, ...tickets];
    setTickets(updated);
    saveToLocal(STORAGE_KEYS.tickets, updated);
    return newTicket;
  };

  // Tech & Admin only
  const updateTicketStatus = async (id: string, status: ServiceTicket['status']): Promise<boolean> => {
    if (!canUpdateRepairStatus()) {
      alert('Tài khoản Kinh doanh (Sales) không có quyền can thiệp thay đổi trạng thái kỹ thuật!');
      return false;
    }

    const updated = tickets.map((t) => (t.id === id ? { ...t, status } : t));
    setTickets(updated);
    saveToLocal(STORAGE_KEYS.tickets, updated);

    if (isUsingSupabase && supabase) {
      try {
        await supabase.from('service_tickets').update({ status }).eq('id', id);
      } catch (e) {
        console.warn('Supabase ticket status error:', e);
      }
    }
    return true;
  };

  // Onsite dispatch update
  const updateDispatchStatus = async (id: string, status: OnsiteDispatch['status']): Promise<void> => {
    const updated = onsiteDispatches.map((d) => (d.id === id ? { ...d, status } : d));
    setOnsiteDispatches(updated);
    saveToLocal(STORAGE_KEYS.onsiteDispatches, updated);

    if (isUsingSupabase && supabase) {
      try {
        await supabase.from('onsite_dispatches').update({ status }).eq('id', id);
      } catch (e) {
        console.warn('Supabase dispatch update error:', e);
      }
    }
  };

  // Shift logs (Admin only)
  const addShiftLog = async (shiftData: Omit<ShiftLog, 'id' | 'created_at'>): Promise<ShiftLog> => {
    const newShift: ShiftLog = {
      ...shiftData,
      id: 's_' + Date.now(),
      created_at: new Date().toISOString(),
    };

    const updated = [newShift, ...shiftLogs];
    setShiftLogs(updated);
    saveToLocal(STORAGE_KEYS.shiftLogs, updated);

    if (isUsingSupabase && supabase) {
      try {
        await supabase.from('shift_logs').insert(newShift);
      } catch (e) {
        console.warn('Supabase shift_logs insert error:', e);
      }
    }
    return newShift;
  };

  const resetToDefault = () => {
    setInventory(initialInventory);
    setCustomers(initialCustomers);
    setTickets(initialTickets);
    setSpareParts(initialSpareParts);
    setOnsiteDispatches(initialOnsiteDispatches);
    setShiftLogs(initialShiftLogs);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.inventory);
      localStorage.removeItem(STORAGE_KEYS.customers);
      localStorage.removeItem(STORAGE_KEYS.tickets);
      localStorage.removeItem(STORAGE_KEYS.spareParts);
      localStorage.removeItem(STORAGE_KEYS.onsiteDispatches);
      localStorage.removeItem(STORAGE_KEYS.shiftLogs);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        isLoggedIn,
        setCurrentUserRole,
        login,
        logout,
        canEditStock,
        canUpdateRepairStatus,
        canAccessPayroll,
        canAccessSettings,
        inventory,
        customers,
        tickets,
        spareParts,
        onsiteDispatches,
        shiftLogs,
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
