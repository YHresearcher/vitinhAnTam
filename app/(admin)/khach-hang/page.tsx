'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { Customer, InventoryItem, ServiceTicket, generateCustomerCode } from '@/lib/supabase';
import { CrmAlertsPanel } from '@/components/admin/CrmAlertsPanel';
// Lucide icons removed for minimalist text design


export default function KhachHangCrmPage() {
  const {
    customers,
    inventory,
    tickets,
    currentUser,
    canAccessCRM,
    addCustomer,
    updateCustomer,
    deleteCustomer,
  } = useStore();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<'all' | 'VIP' | 'Thân thiết' | 'Standard'>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewing360Customer, setViewing360Customer] = useState<Customer | null>(null);
  const [active360Tab, setActive360Tab] = useState<'devices' | 'tickets' | 'notes'>('devices');

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    birth_date: '1992-05-15',
    address: 'Long An - Tây Ninh',
    area_zone: 'Long An - Tây Ninh',
    customer_tier: 'Standard' as 'Standard' | 'VIP' | 'Thân thiết',
    notes: '',
  });

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedZaloId, setCopiedZaloId] = useState<string | null>(null);
  const [activeAlertTab, setActiveAlertTab] = useState<'birthday' | 'maintenance'>('birthday');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper: Tính số ngày còn lại đến sinh nhật (Trong vòng 3 ngày)
  const getBirthdayInfo = (birthDateStr?: string) => {
    if (!birthDateStr) return null;
    let bMonth = 0;
    let bDay = 0;

    if (birthDateStr.includes('-')) {
      const parts = birthDateStr.split('-');
      if (parts.length >= 3) {
        bMonth = parseInt(parts[1], 10);
        bDay = parseInt(parts[2], 10);
      }
    } else if (birthDateStr.includes('/')) {
      const parts = birthDateStr.split('/');
      if (parts.length >= 2) {
        bDay = parseInt(parts[0], 10);
        bMonth = parseInt(parts[1], 10);
      }
    }

    if (!bMonth || !bDay || Number.isNaN(bMonth) || Number.isNaN(bDay)) return null;

    const now = new Date();
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let target = new Date(now.getFullYear(), bMonth - 1, bDay);

    const diffDays = Math.round((target.getTime() - nowMidnight.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      target = new Date(now.getFullYear() + 1, bMonth - 1, bDay);
    }
    const daysRemaining = Math.round((target.getTime() - nowMidnight.getTime()) / (1000 * 60 * 60 * 24));

    return {
      daysRemaining,
      dayFormatted: `${String(bDay).padStart(2, '0')}/${String(bMonth).padStart(2, '0')}`,
      isUpcoming: daysRemaining >= 0 && daysRemaining <= 3,
    };
  };

  // Danh sách sinh nhật sắp tới trong 3 ngày
  const upcomingBirthdayCustomers = useMemo(() => {
    return customers
      .map((cust) => {
        const info = getBirthdayInfo(cust.birth_date);
        if (info && info.isUpcoming) {
          return {
            customer: cust,
            daysRemaining: info.daysRemaining,
            dayFormatted: info.dayFormatted,
          };
        }
        return null;
      })
      .filter((item): item is { customer: Customer; daysRemaining: number; dayFormatted: string } => item !== null)
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [customers]);

  // Danh sách nhắc bảo dưỡng định kỳ 6 tháng (180 ngày)
  const maintenanceDueList = useMemo(() => {
    return customers
      .map((cust) => {
        const cleanPhone = cust.phone.replace(/\D/g, '');
        const custDevices = inventory.filter((item) => {
          if (item.customer_phone && item.customer_phone.replace(/\D/g, '') === cleanPhone) return true;
          if (item.customer_name && cust.full_name && item.customer_name.toLowerCase().includes(cust.full_name.toLowerCase())) return true;
          return false;
        });

        const custTickets = tickets.filter((t) => {
          if (t.customer_phone && t.customer_phone.replace(/\D/g, '') === cleanPhone) return true;
          if (t.customer_name && cust.full_name && t.customer_name.toLowerCase().includes(cust.full_name.toLowerCase())) return true;
          return false;
        });

        let latestDate: Date | null = null;
        let latestDeviceName = '';
        let latestServiceTag = '';

        custDevices.forEach((d) => {
          const dateStr = d.handover_date || d.created_at;
          if (dateStr) {
            const dt = new Date(dateStr);
            if (!Number.isNaN(dt.getTime()) && (!latestDate || dt > latestDate)) {
              latestDate = dt;
              latestDeviceName = d.device_model || d.model || `${d.brand} ${d.form_factor}`;
              latestServiceTag = d.service_tag;
            }
          }
        });

        custTickets.forEach((t) => {
          const dateStr = t.completed_at || t.created_at;
          if (dateStr) {
            const dt = new Date(dateStr);
            if (!Number.isNaN(dt.getTime()) && (!latestDate || dt > latestDate)) {
              latestDate = dt;
              latestDeviceName = t.device_name || `Phiếu ${t.ticket_code}`;
              latestServiceTag = t.device_service_tag || '';
            }
          }
        });

        if (!latestDate) return null;

        const daysSince = Math.floor((Date.now() - (latestDate as Date).getTime()) / (1000 * 60 * 60 * 24));
        const monthsSince = Math.floor(daysSince / 30);

        if (daysSince >= 180) {
          return {
            customer: cust,
            latestDate: latestDate as Date,
            daysSince,
            monthsSince,
            deviceName: latestDeviceName || 'Máy tính đồng bộ',
            serviceTag: latestServiceTag,
          };
        }
        return null;
      })
      .filter((item): item is { customer: Customer; latestDate: Date; daysSince: number; monthsSince: number; deviceName: string; serviceTag: string } => item !== null)
      .sort((a, b) => b.daysSince - a.daysSince);
  }, [customers, inventory, tickets]);

  const handleCopyZalo = (text: string, id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedZaloId(id);
      showToast('Đã sao chép mẫu tin nhắn Zalo CSKH!');
      setTimeout(() => setCopiedZaloId(null), 2500);
    }
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const total = customers.length;
    const vipCount = customers.filter((c) => c.customer_tier === 'VIP').length;
    const loyalCount = customers.filter((c) => c.customer_tier === 'Thân thiết').length;
    const standardCount = total - vipCount - loyalCount;
    return { total, vipCount, loyalCount, standardCount };
  }, [customers]);

  // Unique Zones
  const zones = useMemo(() => {
    const set = new Set<string>();
    customers.forEach((c) => {
      if (c.area_zone) set.add(c.area_zone);
      else if (c.address) set.add(c.address.split(',').pop()?.trim() || 'Khu vực khác');
    });
    return Array.from(set);
  }, [customers]);

  // Filtered List
  const filteredCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return customers.filter((c) => {
      const matchSearch =
        !q ||
        c.full_name?.toLowerCase().includes(q) ||
        c.name?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.customer_code?.toLowerCase().includes(q) ||
        c.address?.toLowerCase().includes(q);

      const matchTier = selectedTier === 'all' || (c.customer_tier || 'Standard') === selectedTier;

      const matchZone =
        selectedZone === 'all' ||
        c.area_zone === selectedZone ||
        (c.address && c.address.includes(selectedZone));

      return matchSearch && matchTier && matchZone;
    });
  }, [customers, searchQuery, selectedTier, selectedZone]);

  // Devices & Tickets for a Customer
  const getCustomerDevices = (cust: Customer): InventoryItem[] => {
    const cleanPhone = cust.phone.replace(/\D/g, '');
    return inventory.filter((item) => {
      if (item.customer_phone && item.customer_phone.replace(/\D/g, '') === cleanPhone) return true;
      if (item.customer_name && cust.full_name && item.customer_name.toLowerCase().includes(cust.full_name.toLowerCase())) return true;
      return false;
    });
  };

  const getCustomerTickets = (cust: Customer): ServiceTicket[] => {
    const cleanPhone = cust.phone.replace(/\D/g, '');
    return tickets.filter((t) => {
      if (t.customer_phone && t.customer_phone.replace(/\D/g, '') === cleanPhone) return true;
      if (t.customer_name && cust.full_name && t.customer_name.toLowerCase().includes(cust.full_name.toLowerCase())) return true;
      return false;
    });
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({
      full_name: '',
      phone: '',
      birth_date: '1992-05-15',
      address: 'Long An - Tây Ninh',
      area_zone: 'Long An - Tây Ninh',
      customer_tier: 'Standard',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (cust: Customer) => {
    setEditingCustomer(cust);
    setFormData({
      full_name: cust.full_name || cust.name || '',
      phone: cust.phone || '',
      birth_date: cust.birth_date || '1992-05-15',
      address: cust.address || '',
      area_zone: cust.area_zone || 'Long An - Tây Ninh',
      customer_tier: cust.customer_tier || 'Standard',
      notes: cust.notes || '',
    });
    setIsAddModalOpen(true);
  };

  // Save Customer (Add or Edit)
  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name.trim() || !formData.phone.trim()) {
      showToast('Vui lòng nhập họ tên và số điện thoại khách hàng!');
      return;
    }

    if (editingCustomer) {
      await updateCustomer(editingCustomer.id, {
        full_name: formData.full_name.trim(),
        name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        birth_date: formData.birth_date,
        address: formData.address.trim(),
        area_zone: formData.area_zone.trim(),
        customer_tier: formData.customer_tier,
        notes: formData.notes.trim(),
      });
      showToast(`Đã cập nhật hồ sơ khách hàng ${formData.full_name}!`);
    } else {
      const existingCodes = customers.map((c) => c.customer_code).filter((code): code is string => Boolean(code));
      const newCode = generateCustomerCode(formData.birth_date, formData.phone, existingCodes);

      await addCustomer({
        full_name: formData.full_name.trim(),
        name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        birth_date: formData.birth_date,
        address: formData.address.trim(),
        area_zone: formData.area_zone.trim(),
        customer_tier: formData.customer_tier,
        customer_code: newCode,
        notes: formData.notes.trim(),
      });
      showToast(`Đã thêm khách hàng mới: ${formData.full_name} (${newCode})!`);
    }

    setIsAddModalOpen(false);
  };

  // Delete Customer
  const handleDeleteCustomer = async (cust: Customer) => {
    if (currentUser.role !== 'admin') {
      showToast('Chỉ Quản trị viên mới có quyền xóa hồ sơ khách hàng!');
      return;
    }
    if (confirm(`Bạn có chắc chắn muốn xóa khách hàng "${cust.full_name || cust.name}" khỏi CRM?`)) {
      const res = await deleteCustomer(cust.id);
      if (res) {
        showToast(`Đã xóa khách hàng ${cust.full_name || cust.name}!`);
      }
    }
  };

  // Open 360 View
  const handleOpen360 = (cust: Customer) => {
    setViewing360Customer(cust);
    setActive360Tab('devices');
  };

  // Export CSV (Excel)
  const handleExportCSV = () => {
    if (filteredCustomers.length === 0) return;
    const headers = ['Mã KH', 'Tên khách hàng', 'Số điện thoại', 'Địa chỉ', 'Khu vực', 'Phân hạng', 'Số máy gửi sửa', 'Ghi chú'];
    const rows = filteredCustomers.map((c) => [
      `"${c.customer_code || ''}"`,
      `"${(c.full_name || c.name || '').replace(/"/g, '""')}"`,
      `"${c.phone}"`,
      `"${(c.address || '').replace(/"/g, '""')}"`,
      `"${c.area_zone || ''}"`,
      `"${c.customer_tier || 'Standard'}"`,
      getCustomerDevices(c).length,
      `"${(c.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `danh_sach_khach_hang_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-white text-slate-900 px-4 py-3 rounded-xl shadow-2xl border-2 border-emerald-600 flex items-center gap-3 animate-fade-in text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Quản Lý Khách Hàng & CRM
            <span className="text-xs px-2.5 py-1 bg-emerald-100 text-emerald-800 font-semibold rounded-full font-mono">
              {customers.length} khách hàng
            </span>
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-all active:scale-95 whitespace-nowrap"
          >
            Xuất Excel (CSV)
          </button>
          {canAccessCRM() && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-95 whitespace-nowrap shrink-0"
            >
              + Thêm Khách Hàng Mới
            </button>
          )}
        </div>
      </div>

      {/* RBAC Notice for KTV */}
      {!canAccessCRM() && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
          <span className="font-semibold">{currentUser.name} (Kỹ thuật viên):</span>{' '}
          Chế độ chỉ xem lịch sử và tra cứu. Quyền cập nhật dành cho Quản trị viên và Bán hàng.
        </div>
      )}

      {/* KPI Stats Grid - Clean typography, no empty icon boxes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Tổng Khách Hàng</div>
          <div className="text-xl font-bold text-slate-900 mt-1 font-mono">{stats.total} người</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Khách Hàng VIP</div>
          <div className="text-xl font-bold text-amber-700 mt-1 font-mono">{stats.vipCount} đối tác</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Khách Thân Thiết</div>
          <div className="text-xl font-bold text-purple-700 mt-1 font-mono">{stats.loyalCount} khách quen</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Khu Vực Phục Vụ</div>
          <div className="text-xl font-bold text-emerald-700 mt-1">Long An - Tây Ninh</div>
        </div>
      </div>

      {/* Smart CRM Automation Alerts: 3-Day Birthday & 6-Month Maintenance */}
      <CrmAlertsPanel customers={customers} inventory={inventory} tickets={tickets} />

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative w-full md:w-96">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo Tên, SĐT, Mã định danh, Địa chỉ..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Xóa
              </button>
            )}
          </div>

          {/* Tier Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto p-1 bg-slate-100 rounded-lg">
            {(
              [
                { id: 'all', label: 'Tất cả hạng' },
                { id: 'VIP', label: 'VIP' },
                { id: 'Thân thiết', label: 'Thân thiết' },
                { id: 'Standard', label: 'Tiêu chuẩn' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTier(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                  selectedTier === tab.id
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Zone Filter Pill Row */}
        {zones.length > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs overflow-x-auto">
            <span className="text-slate-400 font-medium shrink-0">Khu vực:</span>
            <button
              onClick={() => setSelectedZone('all')}
              className={`px-2.5 py-1 rounded-full font-medium transition-all whitespace-nowrap ${
                selectedZone === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả khu vực
            </button>
            {zones.map((zone) => (
              <button
                key={zone}
                onClick={() => setSelectedZone(zone)}
                className={`px-2.5 py-1 rounded-full font-medium transition-all whitespace-nowrap ${
                  selectedZone === zone
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {zone}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Customer List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Mã KH & Họ Tên</th>
                <th className="py-3 px-4">Liên Hệ & Zalo</th>
                <th className="py-3 px-4">Phân Hạng</th>
                <th className="py-3 px-4">Địa Chỉ / Khu Vực</th>
                <th className="py-3 px-4 text-center">Máy Đã Mua</th>
                <th className="py-3 px-4 text-center">Phiếu Sửa Chữa</th>
                <th className="py-3 px-4 text-center">Thao Tác Nhanh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Không tìm thấy khách hàng nào phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const custDevices = getCustomerDevices(cust);
                  const custTickets = getCustomerTickets(cust);
                  const cleanPhone = cust.phone.replace(/\D/g, '');
                  const displayName = cust.full_name || cust.name || 'Khách hàng';

                  return (
                    <tr key={cust.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & Code */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          {displayName}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5 font-mono">
                          <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold">
                            {cust.customer_code || 'CHƯA CÓ MÃ'}
                          </span>
                          {cust.birth_date && (
                            <span className="text-[11px] text-slate-400">
                              Sinh: {cust.birth_date}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Phone & Zalo */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 font-mono flex items-center gap-2">
                          {cust.phone}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <a
                            href={`tel:${cleanPhone}`}
                            className="inline-flex items-center text-[11px] text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded font-medium"
                          >
                            Gọi ngay
                          </a>
                          <a
                            href={`https://zalo.me/${cleanPhone}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center text-[11px] text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded font-medium"
                          >
                            Zalo
                          </a>
                        </div>
                      </td>

                      {/* Tier Badge */}
                      <td className="py-3.5 px-4">
                        {cust.customer_tier === 'VIP' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            VIP
                          </span>
                        )}
                        {cust.customer_tier === 'Thân thiết' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                            Thân Thiết
                          </span>
                        )}
                        {(!cust.customer_tier || cust.customer_tier === 'Standard') && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                            Tiêu chuẩn
                          </span>
                        )}
                      </td>

                      {/* Address & Zone */}
                      <td className="py-3.5 px-4">
                        <div className="text-xs text-slate-700 max-w-xs truncate" title={cust.address}>
                          {cust.address || 'Chưa cập nhật'}
                        </div>
                        {cust.notes && (
                          <div className="text-[11px] text-slate-400 mt-0.5 max-w-xs truncate italic" title={cust.notes}>
                            {cust.notes}
                          </div>
                        )}
                      </td>

                      {/* Devices Count */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleOpen360(cust)}
                          className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold"
                        >
                          {custDevices.length} máy
                        </button>
                      </td>

                      {/* Tickets Count */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleOpen360(cust)}
                          className="px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold"
                        >
                          {custTickets.length} phiếu
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpen360(cust)}
                            className="px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 font-medium rounded transition-colors"
                            title="Xem Hồ sơ 360°"
                          >
                            Xem
                          </button>
                          {canAccessCRM() && (
                            <button
                              onClick={() => handleOpenEdit(cust)}
                              className="px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50 font-medium rounded transition-colors"
                              title="Chỉnh sửa thông tin"
                            >
                              Sửa
                            </button>
                          )}
                          {currentUser.role === 'admin' && (
                            <button
                              onClick={() => handleDeleteCustomer(cust)}
                              className="px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 font-medium rounded transition-colors"
                              title="Xóa khách hàng"
                            >
                              Xóa
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: HỒ SƠ KHÁCH HÀNG 360 ĐỘ (CUSTOMER 360 VIEW) */}
      {/* ======================================================== */}
      {viewing360Customer && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-fade-in">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xl shadow-md">
                  {(viewing360Customer.full_name || viewing360Customer.name || 'K').charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">
                      {viewing360Customer.full_name || viewing360Customer.name}
                    </h3>
                    <span className="px-2 py-0.5 bg-white/20 text-white rounded text-[11px] font-mono font-bold">
                      {viewing360Customer.customer_code || 'NO-CODE'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 flex items-center gap-3">
                    <span className="font-mono">
                      ĐT: {viewing360Customer.phone}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span>ĐC: {viewing360Customer.address || 'Long An - Tây Ninh'}</span>
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewing360Customer(null)}
                className="text-slate-400 hover:text-white px-2.5 py-1 text-xs font-semibold rounded-lg hover:bg-white/10"
              >
                Đóng
              </button>
            </div>

            {/* Quick Action Bar inside Modal */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Phân hạng:</span>
                <span className="font-bold text-slate-800">
                  {viewing360Customer.customer_tier || 'Tiêu chuẩn'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${viewing360Customer.phone.replace(/\D/g, '')}`}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold inline-flex items-center"
                >
                  Gọi điện
                </a>
                <a
                  href={`https://zalo.me/${viewing360Customer.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold inline-flex items-center"
                >
                  Nhắn Zalo
                </a>
                <Link
                  href={`/phieu-sua-chua/tao-moi?customerPhone=${encodeURIComponent(viewing360Customer.phone)}&customerName=${encodeURIComponent(viewing360Customer.full_name || viewing360Customer.name || '')}`}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold inline-flex items-center"
                >
                  + Tạo phiếu sửa
                </Link>
              </div>
            </div>

            {/* 360 Tabs */}
            <div className="flex border-b border-slate-200 px-6 pt-2 bg-white">
              <button
                onClick={() => setActive360Tab('devices')}
                className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
                  active360Tab === 'devices'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Thiết Bị Đã Mua ({getCustomerDevices(viewing360Customer).length})
              </button>
              <button
                onClick={() => setActive360Tab('tickets')}
                className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
                  active360Tab === 'tickets'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Lịch Sử Sửa Chữa ({getCustomerTickets(viewing360Customer).length})
              </button>
              <button
                onClick={() => setActive360Tab('notes')}
                className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
                  active360Tab === 'notes'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Ghi Chú CSKH
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {/* Tab 1: Devices */}
              {active360Tab === 'devices' && (
                <div className="space-y-3">
                  {getCustomerDevices(viewing360Customer).length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      Khách hàng này chưa có máy tính nào được ghi nhận xuất kho tại An Tâm.
                    </div>
                  ) : (
                    getCustomerDevices(viewing360Customer).map((dev) => (
                      <div
                        key={dev.id}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="font-semibold text-slate-900 flex items-center gap-2">
                            {dev.device_model || dev.model || `${dev.brand} ${dev.form_factor}`}
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-mono text-xs font-bold">
                              {dev.service_tag}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600">
                            Serial: <span className="font-mono font-medium">{dev.serial_number || 'N/A'}</span> • Cấu hình: {dev.cpu || dev.specs?.cpu || 'i5'}, {dev.ram || dev.specs?.ram || '16GB'}, {dev.ssd_capacity || dev.specs?.ssd || 'SSD'}
                          </div>
                          {dev.warranty_months ? (
                            <div className="text-xs text-emerald-700 font-medium">
                              Bảo hành: {dev.warranty_months} tháng {dev.handover_date ? `(Bàn giao: ${new Date(dev.handover_date).toLocaleDateString('vi-VN')})` : ''}
                            </div>
                          ) : null}
                        </div>
                        <Link
                          href={`/tra-cuu-bao-hanh?tag=${encodeURIComponent(dev.service_tag)}`}
                          target="_blank"
                          className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs font-medium whitespace-nowrap shrink-0"
                        >
                          Tra cứu bảo hành
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 2: Tickets */}
              {active360Tab === 'tickets' && (
                <div className="space-y-3">
                  {getCustomerTickets(viewing360Customer).length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      Chưa ghi nhận phiếu sửa chữa hoặc yêu cầu cứu hộ nào của khách hàng này.
                    </div>
                  ) : (
                    getCustomerTickets(viewing360Customer).map((tck) => (
                      <div
                        key={tck.id}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="font-semibold text-slate-900 flex items-center gap-2">
                            <span className="font-mono text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-bold">
                              {tck.ticket_code}
                            </span>
                            <span>{tck.device_name}</span>
                          </div>
                          <div className="text-xs text-slate-600">
                            Hiện trạng: <span className="text-slate-800 font-medium">{tck.visual_condition || tck.technician_note || 'Kiểm tra bảo dưỡng'}</span>
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-3">
                            <span>KTV: {tck.technician_name}</span>
                            <span>•</span>
                            <span>Chi phí: {(tck.total_amount || tck.estimated_cost || 0).toLocaleString()}đ</span>
                            <span>•</span>
                            <span className="font-semibold text-emerald-700">
                              {tck.status === 'delivered' || tck.status === 'completed'
                                ? '✓ Đã hoàn tất'
                                : tck.status === 'ready' || tck.status === 'ready_deliver'
                                ? 'Sẵn sàng giao'
                                : 'Đang xử lý'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 3: Notes */}
              {active360Tab === 'notes' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Ghi chú chăm sóc &amp; Lịch sử trao đổi
                    </label>
                    <textarea
                      rows={4}
                      value={viewing360Customer.notes || ''}
                      readOnly
                      placeholder="Chưa có ghi chú đặc biệt..."
                      className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="text-xs text-slate-500">
                    💡 <span className="font-semibold">Mẹo CSKH:</span> Sử dụng thông tin ngày sinh ({viewing360Customer.birth_date || 'N/A'}) để gửi tin nhắn chúc mừng sinh nhật hoặc voucher giảm 10% tiền công sửa chữa qua Zalo!
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setViewing360Customer(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                Đóng Hồ Sơ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: THÊM / SỬA KHÁCH HÀNG (ADD & EDIT CUSTOMER) */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-fade-in">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingCustomer ? 'Chỉnh Sửa Hồ Sơ Khách Hàng' : 'Thêm Khách Hàng Mới Vào CRM'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 px-2 py-1 text-xs font-semibold rounded-lg hover:bg-slate-200/50"
              >
                Đóng
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên khách hàng *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Cty TNHH Vận Tải Long An hoặc Chú Bảy"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số điện thoại (Di động / Zalo) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="VD: 0918234891"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ngày sinh (Tạo mã định danh)
                  </label>
                  <input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phân hạng thành viên
                  </label>
                  <select
                    value={formData.customer_tier}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customer_tier: e.target.value as 'Standard' | 'VIP' | 'Thân thiết',
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Standard">Tiêu chuẩn (Standard)</option>
                    <option value="Thân thiết">Khách Thân Thiết (Loyal)</option>
                    <option value="VIP">Khách VIP (Doanh nghiệp/Đại lý)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Khu vực / Tuyến cứu hộ
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Long An - Tây Ninh hoặc KCN Lợi Bình Nhơn"
                    value={formData.area_zone}
                    onChange={(e) => setFormData({ ...formData, area_zone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Địa chỉ chi tiết (Giao hàng / Onsite)
                </label>
                <input
                  type="text"
                  placeholder="Số nhà, tên đường, ấp/phường, quận/huyện..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú nội bộ CSKH
                </label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Thích cài Win 10, máy văn phòng, bảo dưỡng định kỳ 6 tháng..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm"
                >
                  {editingCustomer ? 'Lưu Cập Nhật' : 'Tạo Khách Hàng Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
