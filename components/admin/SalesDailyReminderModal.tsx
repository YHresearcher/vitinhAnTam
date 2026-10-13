'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useViTinhAnTamStore } from '@/lib/store';
import { Customer, InventoryItem, ServiceTicket } from '@/lib/supabase';
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
  X,
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
  AlertTriangle,
} from 'lucide-react';

interface SalesDailyReminderModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export function SalesDailyReminderModal({
  forceOpen = false,
  onClose,
}: SalesDailyReminderModalProps) {
  const { customers, inventory, tickets, currentUser } = useViTinhAnTamStore();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'birthday' | 'followup' | 'warranty'>('birthday');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedSalesFilter, setSelectedSalesFilter] = useState<string>('all');

  // Kiểm tra quyền xem toàn bộ khách hay chỉ khách của mình
  const isManagerOrAdmin = Boolean(
    currentUser && ['admin', 'sales_manager', 'tech_manager'].includes(currentUser.role)
  );

  // Mở tự động 1 lần mỗi ngày khi Sales vào hệ thống
  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      return;
    }

    if (typeof window !== 'undefined') {
      const todayStr = new Date().toISOString().slice(0, 10);
      const dismissedDate = localStorage.getItem(`vtat_sales_reminder_dismissed_${currentUser.id}`);
      if (dismissedDate !== todayStr) {
        // Trì hoãn nhẹ 1 giây để trang tải xong giao diện chính
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [forceOpen, currentUser.id]);

  const handleDismissToday = () => {
    if (typeof window !== 'undefined') {
      const todayStr = new Date().toISOString().slice(0, 10);
      localStorage.setItem(`vtat_sales_reminder_dismissed_${currentUser.id}`, todayStr);
    }
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleCopy = (text: string, id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  // Danh sách nhân viên bán hàng để quản lý lọc
  const salesList = useMemo(() => {
    const list = new Set<string>();
    customers.forEach((c) => {
      if (c.assigned_sales_name) list.add(c.assigned_sales_name);
    });
    return Array.from(list);
  }, [customers]);

  // Bộ lọc theo Lead Ownership: Nhân viên thường chỉ thấy khách của mình
  const filterByOwnership = (c: Customer) => {
    if (isManagerOrAdmin) {
      if (selectedSalesFilter === 'all') return true;
      return c.assigned_sales_name === selectedSalesFilter || c.assigned_sales_id === selectedSalesFilter;
    }
    // Sales / Technician thường: Chỉ thấy khách của mình
    if (c.assigned_sales_id && c.assigned_sales_id === currentUser.id) return true;
    if (c.assigned_sales_name && currentUser.name && c.assigned_sales_name.toLowerCase().includes(currentUser.name.toLowerCase())) {
      return true;
    }
    // Nếu khách chưa gán ai, cho phép sales phụ trách
    return !c.assigned_sales_id && !c.assigned_sales_name;
  };

  // 1. Khách hàng sinh nhật trong 3 ngày tới
  const upcomingBirthdays = useMemo(() => {
    const now = new Date();
    return customers
      .filter(filterByOwnership)
      .map((c) => {
        const info = getCustomerBirthdayInfo(c.birth_date, now);
        if (info && info.isUpcoming) {
          const tierInfo = calculateCustomerTier(c.total_spent, c.last_purchase_date);
          return {
            customer: c,
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

  // 2. Chăm sóc sau bán hàng: Các mốc 1, 3, 6, 12 tháng
  const followUpMilestones = useMemo(() => {
    const now = new Date();
    const result: Array<{
      customer: Customer;
      deviceName: string;
      serviceTag: string;
      purchaseDate: string;
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
        milestoneLabel = 'Mốc 1 Tháng (Hỏi thăm độ ổn định)';
      } else if (daysSince >= 80 && daysSince <= 105) {
        milestone = '3';
        milestoneLabel = 'Mốc 3 Tháng (Tối ưu dọn rác Windows)';
      } else if (daysSince >= 170 && daysSince <= 200) {
        milestone = '6';
        milestoneLabel = 'Mốc 6 Tháng (Mời vệ sinh tra keo miễn phí)';
      } else if (daysSince >= 350 && daysSince <= 385) {
        milestone = '12';
        milestoneLabel = 'Mốc 1 Năm (Tri ân 1 năm & Ưu đãi nâng cấp)';
      }

      if (milestone) {
        const tierInfo = calculateCustomerTier(cust.total_spent, cust.last_purchase_date);
        result.push({
          customer: cust,
          deviceName: deviceName || 'Máy tính Vi Tính An Tâm',
          serviceTag,
          purchaseDate: latestDate.toLocaleDateString('vi-VN'),
          monthsSince,
          milestone,
          milestoneLabel,
          tier: tierInfo.effectiveTier,
        });
      }
    });

    return result;
  }, [customers, inventory, selectedSalesFilter, currentUser, isManagerOrAdmin]);

  // 3. Cảnh báo thiết bị sắp hết bảo hành trong 30 ngày tới
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

  const totalActionCount = upcomingBirthdays.length + followUpMilestones.length + expiringWarranties.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in font-sans">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </span>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                Bảng Nhắc Việc Chăm Sóc Khách Hàng Hôm Nay
              </h2>
              {totalActionCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500 text-white shadow-xs">
                  {totalActionCount} cần liên hệ
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Phân quyền thông minh:{' '}
              {isManagerOrAdmin
                ? 'Toàn bộ khách hàng cửa hàng (Quyền Quản lý / Admin)'
                : `Danh sách khách do [${currentUser.name}] phụ trách`}
            </p>
          </div>

          <button
            type="button"
            onClick={handleDismissToday}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Manager Sales Selector (Nếu là Quản lý) */}
        {isManagerOrAdmin && salesList.length > 0 && (
          <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-3 text-xs text-slate-600 shrink-0">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-700">Lọc theo Sales phụ trách:</span>
            <select
              value={selectedSalesFilter}
              onChange={(e) => setSelectedSalesFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Tất cả nhân viên ({customers.length} khách)</option>
              {salesList.map((salesName) => (
                <option key={salesName} value={salesName}>
                  {salesName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-5 pt-3 gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('birthday')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'birthday'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Cake className="w-4 h-4" />
            <span>Sinh Nhật Sắp Tới (3 ngày)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-700 font-mono">
              {upcomingBirthdays.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('followup')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'followup'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Chăm Sóc Sau Bán (1, 3, 6, 12 Tháng)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-700 font-mono">
              {followUpMilestones.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('warranty')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'warranty'
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Sắp Hết Hạn Bảo Hành (30 ngày)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-700 font-mono">
              {expiringWarranties.length}
            </span>
          </button>
        </div>

        {/* Tab Content List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3 bg-slate-50/50">
          {/* TAB 1: SINH NHẬT */}
          {activeTab === 'birthday' && (
            <>
              {upcomingBirthdays.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Cake className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold text-slate-600">
                    Không có khách hàng nào có sinh nhật trong 3 ngày tới!
                  </p>
                </div>
              ) : (
                upcomingBirthdays.map(({ customer, daysRemaining, dayFormatted, isToday, tier }) => {
                  const cleanPhone = customer.phone.replace(/\D/g, '');
                  const tierConf = CRM_TIER_CONFIG[normalizeCustomerTier(tier)];
                  const templateText = getBirthdayZaloTemplate({
                    customerName: customer.full_name || customer.name || 'Quý khách',
                    birthDateFormatted: dayFormatted,
                    daysRemaining,
                    tier,
                    salesName: customer.assigned_sales_name || currentUser.name,
                  });

                  return (
                    <div
                      key={customer.id}
                      className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-900">
                            {customer.full_name || customer.name}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${tierConf.badgeBg} ${tierConf.badgeTextColor} ${tierConf.badgeBorder}`}
                          >
                            {tierConf.label} (Giảm {tierConf.discountPercentText})
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              isToday
                                ? 'bg-rose-500 text-white animate-pulse'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isToday ? '🎂 SINH NHẬT HÔM NAY!' : `Còn ${daysRemaining} ngày (${dayFormatted})`}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <strong className="font-mono text-slate-700">{customer.phone}</strong>
                          </span>
                          <span>•</span>
                          <span>Sales phụ trách: <strong className="text-slate-800">{customer.assigned_sales_name || 'Chưa gán'}</strong></span>
                        </div>
                      </div>

                      {/* 1-Click Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopy(templateText, customer.id)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                          title="Sao chép lời chúc sinh nhật cá nhân hóa"
                        >
                          {copiedId === customer.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Đã chép!</span>
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
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0068FF] hover:bg-[#0054d1] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                        >
                          <span>Mở Zalo</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* TAB 2: CHĂM SÓC SAU BÁN HÀNG */}
          {activeTab === 'followup' && (
            <>
              {followUpMilestones.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Clock className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold text-slate-600">
                    Không có khách hàng nào đang ở các mốc chăm sóc 1, 3, 6, 12 tháng hôm nay!
                  </p>
                </div>
              ) : (
                followUpMilestones.map((item, idx) => {
                  const cleanPhone = item.customer.phone.replace(/\D/g, '');
                  let templateText = '';
                  if (item.milestone === '1') {
                    templateText = getFollowUp1MonthTemplate({
                      customerName: item.customer.full_name || item.customer.name,
                      deviceName: item.deviceName,
                      salesName: item.customer.assigned_sales_name || currentUser.name,
                    });
                  } else if (item.milestone === '3') {
                    templateText = getFollowUp3MonthTemplate({
                      customerName: item.customer.full_name || item.customer.name,
                      deviceName: item.deviceName,
                      salesName: item.customer.assigned_sales_name || currentUser.name,
                    });
                  } else if (item.milestone === '6') {
                    templateText = getFollowUp6MonthTemplate({
                      customerName: item.customer.full_name || item.customer.name,
                      deviceName: item.deviceName,
                      salesName: item.customer.assigned_sales_name || currentUser.name,
                    });
                  } else {
                    templateText = getFollowUp12MonthTemplate({
                      customerName: item.customer.full_name || item.customer.name,
                      deviceName: item.deviceName,
                      salesName: item.customer.assigned_sales_name || currentUser.name,
                    });
                  }

                  const rowKey = `${item.customer.id}_${item.milestone}_${idx}`;

                  return (
                    <div
                      key={rowKey}
                      className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-900">
                            {item.customer.full_name || item.customer.name}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {item.milestoneLabel}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600">
                          💻 <strong className="text-slate-800">{item.deviceName}</strong>{' '}
                          {item.serviceTag && <span className="font-mono text-slate-500">({item.serviceTag})</span>}
                          {' '}— Mua ngày: {item.purchaseDate}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          SĐT: <strong className="font-mono text-slate-700">{item.customer.phone}</strong> • Sales: {item.customer.assigned_sales_name || 'Chưa gán'}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopy(templateText, rowKey)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                        >
                          {copiedId === rowKey ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Đã chép!</span>
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
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0068FF] hover:bg-[#0054d1] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                        >
                          <span>Mở Zalo</span>
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
          {activeTab === 'warranty' && (
            <>
              {expiringWarranties.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <ShieldAlert className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold text-slate-600">
                    Không có thiết bị nào sắp hết hạn bảo hành trong 30 ngày tới!
                  </p>
                </div>
              ) : (
                expiringWarranties.map((item, idx) => {
                  const cleanPhone = item.customer.phone.replace(/\D/g, '');
                  const templateText = getWarrantyExpiringTemplate({
                    customerName: item.customer.full_name || item.customer.name,
                    deviceName: item.deviceName,
                    serviceTag: item.serviceTag,
                    warrantyExpiryDate: item.expiryDate,
                    expiryDaysRemaining: item.daysRemaining,
                    salesName: item.customer.assigned_sales_name || currentUser.name,
                  });
                  const rowKey = `w_${item.serviceTag}_${idx}`;

                  return (
                    <div
                      key={rowKey}
                      className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-900">
                            {item.customer.full_name || item.customer.name}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                            Hết hạn trong {item.daysRemaining} ngày ({item.expiryDate})
                          </span>
                        </div>
                        <div className="text-xs text-slate-600">
                          💻 <strong className="text-slate-800">{item.deviceName}</strong> • Mã ST:{' '}
                          <span className="font-mono font-bold text-rose-600">{item.serviceTag}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          SĐT: <strong className="font-mono text-slate-700">{item.customer.phone}</strong> • Sales: {item.customer.assigned_sales_name || 'Chưa gán'}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopy(templateText, rowKey)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                        >
                          {copiedId === rowKey ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Đã chép!</span>
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
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0068FF] hover:bg-[#0054d1] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                        >
                          <span>Mở Zalo</span>
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

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>
            💡 Hãy gửi tin nhắn chăm sóc qua Zalo trước 11h sáng để khách hàng có trải nghiệm tốt nhất.
          </span>
          <button
            type="button"
            onClick={handleDismissToday}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs transition-colors shadow-2xs cursor-pointer"
          >
            Đã xem & Bỏ qua hôm nay
          </button>
        </div>
      </div>
    </div>
  );
}
