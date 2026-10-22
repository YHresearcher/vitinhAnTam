'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Customer, InventoryItem, ServiceTicket } from '@/lib/supabase';
import { useViTinhAnTamStore } from '@/lib/store';
import {
  CRM_TIER_CONFIG,
  calculateCustomerTier,
  getCustomerBirthdayInfo,
  normalizeCustomerTier,
} from '@/lib/crmTiers';
import {
  getBirthdayZaloTemplate,
  getFollowUp1MonthTemplate,
  getFollowUp3MonthTemplate,
  getFollowUp6MonthTemplate,
  getFollowUp12MonthTemplate,
  getWarrantyExpiringTemplate,
} from '@/lib/crmTemplates';
import {
  Cake,
  Clock,
  ShieldAlert,
  Copy,
  Check,
  ExternalLink,
  Users,
  Sparkles,
  Phone,
  Calendar,
} from 'lucide-react';

export interface CrmAlertsPanelProps {
  customers: Customer[];
  inventory: InventoryItem[];
  tickets: ServiceTicket[];
  compact?: boolean;
}

export function CrmAlertsPanel({
  customers,
  inventory,
  tickets,
  compact = false,
}: CrmAlertsPanelProps) {
  const { currentUser } = useViTinhAnTamStore();

  const [activeAlertTab, setActiveAlertTab] = useState<'birthday' | 'followup' | 'warranty'>('birthday');
  const [copiedZaloId, setCopiedZaloId] = useState<string | null>(null);
  const [selectedSalesFilter, setSelectedSalesFilter] = useState<string>('all');

  // Kiểm tra quyền quản lý
  const isManagerOrAdmin = Boolean(
    currentUser && ['admin', 'sales_manager', 'tech_manager'].includes(currentUser.role)
  );

  const handleCopyZalo = (text: string, id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedZaloId(id);
      setTimeout(() => setCopiedZaloId(null), 2500);
    }
  };

  // Danh sách Sales để lọc
  const salesList = useMemo(() => {
    const list = new Set<string>();
    customers.forEach((c) => {
      if (c.assigned_sales_name) list.add(c.assigned_sales_name);
    });
    return Array.from(list);
  }, [customers]);

  // Bộ lọc theo Lead Ownership
  const filterByOwnership = (c: Customer) => {
    if (isManagerOrAdmin) {
      if (selectedSalesFilter === 'all') return true;
      return c.assigned_sales_name === selectedSalesFilter || c.assigned_sales_id === selectedSalesFilter;
    }
    // Sales / Kỹ thuật viên: chỉ thấy khách mình phụ trách
    if (c.assigned_sales_id && c.assigned_sales_id === currentUser.id) return true;
    if (c.assigned_sales_name && currentUser.name && c.assigned_sales_name.toLowerCase().includes(currentUser.name.toLowerCase())) {
      return true;
    }
    return !c.assigned_sales_id && !c.assigned_sales_name;
  };

  // 1. Danh sách sinh nhật trong 3 ngày tới
  const upcomingBirthdayCustomers = useMemo(() => {
    const now = new Date();
    return customers
      .filter(filterByOwnership)
      .map((cust) => {
        const info = getCustomerBirthdayInfo(cust.birth_date, now);
        if (info && info.isUpcoming) {
          const tierInfo = calculateCustomerTier(cust.total_spent, cust.last_purchase_date);
          return {
            customer: cust,
            daysRemaining: info.daysRemaining,
            dayFormatted: info.dayFormatted,
            isToday: info.isToday,
            tier: tierInfo.effectiveTier,
          };
        }
        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [customers, selectedSalesFilter, currentUser, isManagerOrAdmin]);

  // 2. Chăm sóc các mốc 1, 3, 6, 12 tháng
  const followUpMilestones = useMemo(() => {
    const now = new Date();
    const result: Array<{
      customer: Customer;
      deviceName: string;
      serviceTag: string;
      purchaseDate: string;
      daysSince: number;
      monthsSince: number;
      milestone: '1' | '3' | '6' | '12';
      milestoneLabel: string;
      tier: string;
    }> = [];

    customers.filter(filterByOwnership).forEach((cust) => {
      const cleanPhone = cust.phone.replace(/\D/g, '');
      const custDevices = inventory.filter((item) => {
        if (item.customer_phone && item.customer_phone.replace(/\D/g, '') === cleanPhone) return true;
        if (item.customer_name && cust.full_name && item.customer_name.toLowerCase().includes(cust.full_name.toLowerCase())) return true;
        return false;
      });

      let latestDate: Date | null = null;
      let deviceName = '';
      let serviceTag = '';

      custDevices.forEach((d) => {
        const dStr = d.handover_date || d.created_at;
        if (dStr) {
          const dt = new Date(dStr);
          if (!Number.isNaN(dt.getTime()) && (!latestDate || dt > latestDate)) {
            latestDate = dt;
            deviceName = d.device_model || d.model || `${d.brand} ${d.form_factor}`;
            serviceTag = d.service_tag;
          }
        }
      });

      if (!latestDate && cust.last_purchase_date) {
        latestDate = new Date(cust.last_purchase_date);
        deviceName = 'Máy tính đồng bộ / Laptop';
      }

      if (!latestDate || Number.isNaN(latestDate.getTime())) return;

      const daysSince = Math.floor((now.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24));
      const monthsSince = Math.floor(daysSince / 30);

      let milestone: '1' | '3' | '6' | '12' | null = null;
      let milestoneLabel = '';

      if (daysSince >= 25 && daysSince <= 40) {
        milestone = '1';
        milestoneLabel = 'Mốc 1 Tháng (Ổn định ban đầu)';
      } else if (daysSince >= 80 && daysSince <= 105) {
        milestone = '3';
        milestoneLabel = 'Mốc 3 Tháng (Tối ưu dọn rác)';
      } else if (daysSince >= 170 && daysSince <= 200) {
        milestone = '6';
        milestoneLabel = 'Mốc 6 Tháng (Bảo dưỡng tra keo)';
      } else if (daysSince >= 350 && daysSince <= 385) {
        milestone = '12';
        milestoneLabel = 'Mốc 1 Năm (Tri ân & Nâng cấp)';
      }

      if (milestone) {
        const tierInfo = calculateCustomerTier(cust.total_spent, cust.last_purchase_date);
        result.push({
          customer: cust,
          deviceName: deviceName || 'Máy tính Vi Tính An Tâm',
          serviceTag,
          purchaseDate: latestDate.toLocaleDateString('vi-VN'),
          daysSince,
          monthsSince,
          milestone,
          milestoneLabel,
          tier: tierInfo.effectiveTier,
        });
      }
    });

    return result.sort((a, b) => a.daysSince - b.daysSince);
  }, [customers, inventory, selectedSalesFilter, currentUser, isManagerOrAdmin]);

  // 3. Thiết bị sắp hết hạn bảo hành trong 30 ngày
  const expiringWarranties = useMemo(() => {
    const now = new Date();
    const result: Array<{
      customer: Customer;
      deviceName: string;
      serviceTag: string;
      expiryDate: string;
      daysRemaining: number;
      tier: string;
    }> = [];

    customers.filter(filterByOwnership).forEach((cust) => {
      const cleanPhone = cust.phone.replace(/\D/g, '');
      const custDevices = inventory.filter((item) => {
        if (item.customer_phone && item.customer_phone.replace(/\D/g, '') === cleanPhone) return true;
        if (item.customer_name && cust.full_name && item.customer_name.toLowerCase().includes(cust.full_name.toLowerCase())) return true;
        return false;
      });

      custDevices.forEach((item) => {
        const handoverRaw = item.handover_date || item.created_at;
        if (!handoverRaw) return;
        const start = new Date(handoverRaw);
        if (Number.isNaN(start.getTime())) return;

        const months = item.warranty_months || 12;
        const expiry = new Date(start);
        expiry.setMonth(expiry.getMonth() + months);

        const daysRemaining = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysRemaining >= 0 && daysRemaining <= 30) {
          const tierInfo = calculateCustomerTier(cust.total_spent, cust.last_purchase_date);
          result.push({
            customer: cust,
            deviceName: item.device_model || item.model || `${item.brand} ${item.form_factor}`,
            serviceTag: item.service_tag,
            expiryDate: expiry.toLocaleDateString('vi-VN'),
            daysRemaining,
            tier: tierInfo.effectiveTier,
          });
        }
      });
    });

    return result.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [customers, inventory, selectedSalesFilter, currentUser, isManagerOrAdmin]);

  // Ẩn các tab không có dữ liệu; nếu tab đang chọn trống thì nhảy sang
  // tab đầu tiên có dữ liệu.
  const totalAlerts =
    upcomingBirthdayCustomers.length + followUpMilestones.length + expiringWarranties.length;
  useEffect(() => {
    const counts = {
      birthday: upcomingBirthdayCustomers.length,
      followup: followUpMilestones.length,
      warranty: expiringWarranties.length,
    };
    if (counts[activeAlertTab] === 0) {
      const firstNonEmpty = (Object.keys(counts) as Array<keyof typeof counts>).find(
        (key) => counts[key] > 0
      );
      if (firstNonEmpty) setActiveAlertTab(firstNonEmpty);
    }
  }, [activeAlertTab, upcomingBirthdayCustomers.length, followUpMilestones.length, expiringWarranties.length]);

  // Không có bất kỳ nhắc việc nào → thu thành một dải thông tin gọn
  if (totalAlerts === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs px-4 py-3 flex items-center gap-2 text-xs text-slate-500 font-sans">
        <Sparkles className="w-4 h-4 text-amber-400" />
        <span>
          <strong className="text-slate-700">Smart CRM:</strong> hôm nay không có sinh nhật, mốc hỏi
          thăm hay thiết bị sắp hết bảo hành cần xử lý.
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden font-sans">
      {/* Header & Tabs */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Smart CRM — Trung Tâm Chăm Sóc Khách Hàng Tự Động</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase font-mono">
              Lead Ownership
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Nhắc nhở sinh nhật trước 3 ngày, mốc hỏi thăm 1-3-6-12 tháng và cảnh báo bảo hành 30 ngày.
          </p>
        </div>

        {/* Manager Filter */}
        {isManagerOrAdmin && salesList.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedSalesFilter}
              onChange={(e) => setSelectedSalesFilter(e.target.value)}
              className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-2.5 py-1.5 text-xs text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="text-slate-900">Tất cả Sales</option>
              {salesList.map((salesName) => (
                <option key={salesName} value={salesName} className="text-slate-900">
                  {salesName}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50/60 px-4 pt-2.5 gap-2 overflow-x-auto">
        {upcomingBirthdayCustomers.length > 0 && (
        <button
          type="button"
          onClick={() => setActiveAlertTab('birthday')}
          className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeAlertTab === 'birthday'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Cake className="w-4 h-4" />
          <span>Sinh Nhật (3 ngày tới)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-700 font-mono">
            {upcomingBirthdayCustomers.length}
          </span>
        </button>
        )}

        {followUpMilestones.length > 0 && (
        <button
          type="button"
          onClick={() => setActiveAlertTab('followup')}
          className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeAlertTab === 'followup'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Hỏi Thăm Sau Bán (1, 3, 6, 12 Tháng)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-700 font-mono">
            {followUpMilestones.length}
          </span>
        </button>
        )}

        {expiringWarranties.length > 0 && (
        <button
          type="button"
          onClick={() => setActiveAlertTab('warranty')}
          className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeAlertTab === 'warranty'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Sắp Hết Bảo Hành (30 ngày)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-700 font-mono">
            {expiringWarranties.length}
          </span>
        </button>
        )}
      </div>

      {/* Content Body */}
      <div className={`p-4 sm:p-5 ${compact ? 'max-h-80' : 'max-h-96'} overflow-y-auto space-y-3`}>
        {/* TAB 1: SINH NHẬT */}
        {activeAlertTab === 'birthday' && (
          <>
            {upcomingBirthdayCustomers.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Không có khách hàng nào có sinh nhật trong 3 ngày tới.
              </div>
            ) : (
              upcomingBirthdayCustomers.map(({ customer, daysRemaining, dayFormatted, isToday, tier }) => {
                const cleanPhone = customer.phone.replace(/\D/g, '');
                const tierConf = CRM_TIER_CONFIG[normalizeCustomerTier(tier)];
                const template = getBirthdayZaloTemplate({
                  customerName: customer.full_name || customer.name || 'Quý khách',
                  birthDateFormatted: dayFormatted,
                  daysRemaining,
                  tier,
                  salesName: customer.assigned_sales_name || currentUser.name,
                });

                return (
                  <div
                    key={customer.id}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-slate-900 font-bold text-sm">
                          {customer.full_name || customer.name}
                        </strong>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${tierConf.badgeBg} ${tierConf.badgeTextColor} ${tierConf.badgeBorder}`}
                        >
                          {tierConf.label} (Giảm {tierConf.discountPercentText})
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isToday ? 'bg-rose-500 text-white' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isToday ? 'Hôm nay' : `Còn ${daysRemaining} ngày (${dayFormatted})`}
                        </span>
                      </div>
                      <div className="text-slate-500 mt-1 flex items-center gap-2">
                        <span>SĐT: <strong className="font-mono text-slate-700">{customer.phone}</strong></span>
                        <span>•</span>
                        <span>Sales: <strong className="text-slate-800">{customer.assigned_sales_name || 'Chưa gán'}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopyZalo(template, customer.id)}
                        className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg font-semibold text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        {copiedZaloId === customer.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Chép mẫu tin</span>
                          </>
                        )}
                      </button>

                      <a
                        href={`https://zalo.me/${cleanPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-[#0068FF] hover:bg-[#0054d1] text-white font-bold rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <span>Chat Zalo</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}

        {/* TAB 2: CHĂM SÓC SAU BÁN */}
        {activeAlertTab === 'followup' && (
          <>
            {followUpMilestones.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Không có khách hàng nào đang ở các mốc 1, 3, 6, 12 tháng hôm nay.
              </div>
            ) : (
              followUpMilestones.map((item, idx) => {
                const cleanPhone = item.customer.phone.replace(/\D/g, '');
                let template = '';
                if (item.milestone === '1') {
                  template = getFollowUp1MonthTemplate({
                    customerName: item.customer.full_name || item.customer.name,
                    deviceName: item.deviceName,
                    salesName: item.customer.assigned_sales_name || currentUser.name,
                  });
                } else if (item.milestone === '3') {
                  template = getFollowUp3MonthTemplate({
                    customerName: item.customer.full_name || item.customer.name,
                    deviceName: item.deviceName,
                    salesName: item.customer.assigned_sales_name || currentUser.name,
                  });
                } else if (item.milestone === '6') {
                  template = getFollowUp6MonthTemplate({
                    customerName: item.customer.full_name || item.customer.name,
                    deviceName: item.deviceName,
                    salesName: item.customer.assigned_sales_name || currentUser.name,
                  });
                } else {
                  template = getFollowUp12MonthTemplate({
                    customerName: item.customer.full_name || item.customer.name,
                    deviceName: item.deviceName,
                    salesName: item.customer.assigned_sales_name || currentUser.name,
                  });
                }

                const rowKey = `crm_${item.customer.id}_${item.milestone}_${idx}`;

                return (
                  <div
                    key={rowKey}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-slate-900 font-bold text-sm">
                          {item.customer.full_name || item.customer.name}
                        </strong>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {item.milestoneLabel}
                        </span>
                      </div>
                      <div className="text-slate-600 mt-1">
                        💻 {item.deviceName} {item.serviceTag && <span className="font-mono text-slate-500">({item.serviceTag})</span>} — Mua ngày: {item.purchaseDate}
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        SĐT: <strong className="font-mono text-slate-700">{item.customer.phone}</strong> • Sales: {item.customer.assigned_sales_name || 'Chưa gán'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopyZalo(template, rowKey)}
                        className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg font-semibold text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        {copiedZaloId === rowKey ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Chép mẫu tin</span>
                          </>
                        )}
                      </button>

                      <a
                        href={`https://zalo.me/${cleanPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-[#0068FF] hover:bg-[#0054d1] text-white font-bold rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <span>Chat Zalo</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}

        {/* TAB 3: SẮP HẾT HẠN BẢO HÀNH */}
        {activeAlertTab === 'warranty' && (
          <>
            {expiringWarranties.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Không có thiết bị nào sắp hết hạn bảo hành trong 30 ngày tới.
              </div>
            ) : (
              expiringWarranties.map((item, idx) => {
                const cleanPhone = item.customer.phone.replace(/\D/g, '');
                const template = getWarrantyExpiringTemplate({
                  customerName: item.customer.full_name || item.customer.name,
                  deviceName: item.deviceName,
                  serviceTag: item.serviceTag,
                  warrantyExpiryDate: item.expiryDate,
                  expiryDaysRemaining: item.daysRemaining,
                  salesName: item.customer.assigned_sales_name || currentUser.name,
                });
                const rowKey = `w_p_${item.serviceTag}_${idx}`;

                return (
                  <div
                    key={rowKey}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-slate-900 font-bold text-sm">
                          {item.customer.full_name || item.customer.name}
                        </strong>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                          Hết hạn trong {item.daysRemaining} ngày ({item.expiryDate})
                        </span>
                      </div>
                      <div className="text-slate-600 mt-1">
                        💻 {item.deviceName} • Service Tag: <span className="font-mono font-bold text-rose-600">{item.serviceTag}</span>
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        SĐT: <strong className="font-mono text-slate-700">{item.customer.phone}</strong> • Sales: {item.customer.assigned_sales_name || 'Chưa gán'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopyZalo(template, rowKey)}
                        className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg font-semibold text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        {copiedZaloId === rowKey ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Chép mẫu tin</span>
                          </>
                        )}
                      </button>

                      <a
                        href={`https://zalo.me/${cleanPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-[#0068FF] hover:bg-[#0054d1] text-white font-bold rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <span>Chat Zalo</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}
      </div>
    </div>
  );
}