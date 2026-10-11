'use client';

import React, { useState, useMemo } from 'react';
import { Customer, InventoryItem, ServiceTicket } from '@/lib/supabase';

export interface CrmAlertsPanelProps {
  customers: Customer[];
  inventory: InventoryItem[];
  tickets: ServiceTicket[];
  compact?: boolean;
}

// Helper thuần túy: Tính số ngày còn lại đến sinh nhật (0 - 3 ngày)
function getBirthdayInfo(birthDateStr: string | undefined, now: Date) {
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
}

export function CrmAlertsPanel({
  customers,
  inventory,
  tickets,
  compact = false,
}: CrmAlertsPanelProps) {
  const [activeAlertTab, setActiveAlertTab] = useState<'birthday' | 'maintenance'>('birthday');
  const [copiedZaloId, setCopiedZaloId] = useState<string | null>(null);

  // Danh sách sinh nhật trong 3 ngày tới
  const upcomingBirthdayCustomers = useMemo(() => {
    const now = new Date();
    return customers
      .map((cust) => {
        const info = getBirthdayInfo(cust.birth_date, now);
        if (info && info.isUpcoming) {
          return { customer: cust, daysRemaining: info.daysRemaining, dayFormatted: info.dayFormatted };
        }
        return null;
      })
      .filter((item): item is { customer: Customer; daysRemaining: number; dayFormatted: string } => item !== null)
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [customers]);

    // Danh sách nhắc bảo dưỡng 6 tháng (>= 180 ngày)
  const maintenanceDueList = useMemo(() => {
    const now = new Date();
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
        const daysSince = Math.floor((now.getTime() - (latestDate as Date).getTime()) / (1000 * 60 * 60 * 24));
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
      setTimeout(() => setCopiedZaloId(null), 2500);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header & Tabs */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              <span>🔔</span> Thông Báo Chăm Sóc Khách Hàng Tự Động
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase font-mono">
              Smart CRM
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Tự động cảnh báo sinh nhật trong 3 ngày và lịch nhắc bảo dưỡng máy định kỳ 6 tháng.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-white/10 rounded-xl backdrop-blur-xs border border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => setActiveAlertTab('birthday')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeAlertTab === 'birthday'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>🎂 Sinh Nhật (3 Ngày)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-black/20 text-current">
              {upcomingBirthdayCustomers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAlertTab('maintenance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeAlertTab === 'maintenance'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>🛠️ Bảo Dưỡng 6 Tháng</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-black/20 text-current">
              {maintenanceDueList.length}
            </span>
          </button>
        </div>
      </div>

      {/* Panels */}
      <div className="p-4 sm:p-5">
        {/* Tab 1: Sinh nhật trong 3 ngày */}
        {activeAlertTab === 'birthday' && (
          <div>
            {upcomingBirthdayCustomers.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                Hiện không có khách hàng nào có ngày sinh trong 3 ngày tới.
              </div>
            ) : (
              <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                {upcomingBirthdayCustomers.map(({ customer: cust, daysRemaining, dayFormatted }) => {
                  const cleanPhone = cust.phone.replace(/\D/g, '');
                  const isToday = daysRemaining === 0;
                  const displayName = cust.full_name || cust.name || 'Khách hàng';
                  const zaloMsg = `Chào Anh/Chị ${displayName}, Vi Tính An Tâm xin trân trọng chúc mừng sinh nhật Anh/Chị! Kính chúc Anh/Chị thật nhiều sức khỏe, hạnh phúc và thành công. An Tâm xin gửi tặng Anh/Chị Voucher giảm 10% dịch vụ & Gói vệ sinh máy MIỄN PHÍ nhân dịp sinh nhật này ạ!`;

                  return (
                    <div
                      key={cust.id}
                      className={`p-4 rounded-xl border transition-all space-y-3 ${
                        isToday
                          ? 'bg-amber-50/70 border-amber-300 shadow-sm'
                          : 'bg-slate-50/80 border-slate-200 hover:border-amber-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{displayName}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                              {cust.customer_tier || 'Standard'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                            <span>SĐT: <strong className="text-slate-800">{cust.phone}</strong></span>
                            <span>•</span>
                            <span>Mã KH: <strong className="text-blue-700">{cust.customer_code || 'N/A'}</strong></span>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-black shrink-0 ${
                            isToday ? 'bg-rose-600 text-white animate-pulse' : 'bg-amber-500 text-slate-950 font-bold'
                          }`}
                        >
                          {isToday ? '🎉 Hôm Nay Sinh Nhật!' : `🎂 Còn ${daysRemaining} ngày (${dayFormatted})`}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 text-[11px] text-slate-600 italic">
                        &ldquo;{zaloMsg.slice(0, 110)}...&rdquo;
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200/60">
                        <button
                          type="button"
                          onClick={() => handleCopyZalo(zaloMsg, `bday-${cust.id}`)}
                          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold transition-colors"
                        >
                          {copiedZaloId === `bday-${cust.id}` ? '✓ Đã chép' : 'Sao chép tin nhắn'}
                        </button>
                        <a
                          href={`https://zalo.me/${cleanPhone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shadow-2xs"
                        >
                          <span>Gửi Zalo Chúc Mừng →</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Nhắc bảo dưỡng định kỳ 6 tháng */}
        {activeAlertTab === 'maintenance' && (
          <div>
            {maintenanceDueList.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                Chưa có khách hàng nào đến mốc 6 tháng cần bảo dưỡng định kỳ.
              </div>
            ) : (
              <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                {maintenanceDueList.map(({ customer: cust, latestDate, daysSince, monthsSince, deviceName, serviceTag }) => {
                  const cleanPhone = cust.phone.replace(/\D/g, '');
                  const displayName = cust.full_name || cust.name || 'Khách hàng';
                  const zaloMsg = `Chào Anh/Chị ${displayName}, thiết bị ${deviceName} của Anh/Chị đã sử dụng được khoảng ${monthsSince} tháng (${latestDate.toLocaleDateString('vi-VN')}). Vi Tính An Tâm xin phép liên hệ thăm hỏi tình hình hoạt động của máy và mời Anh/Chị ghé cửa hàng để kiểm tra & tra keo tản nhiệt định kỳ miễn phí ạ!`;

                  return (
                    <div
                      key={cust.id}
                      className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 hover:bg-blue-50/70 transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{displayName}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200 font-mono">
                              {serviceTag ? `Tag: ${serviceTag}` : 'Khách quen'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 mt-0.5">
                            Thiết bị: <strong className="text-slate-900 font-medium">{deviceName}</strong>
                          </div>
                          <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
                            <span>SĐT: <strong className="text-slate-800">{cust.phone}</strong></span>
                            <span>•</span>
                            <span>Lần cuối: {latestDate.toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 shrink-0 font-mono">
                          🛠️ Đã ~{monthsSince} tháng ({daysSince} ngày)
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 text-[11px] text-slate-600 italic">
                        &ldquo;{zaloMsg.slice(0, 115)}...&rdquo;
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200/60">
                        <button
                          type="button"
                          onClick={() => handleCopyZalo(zaloMsg, `maint-${cust.id}`)}
                          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold"
                        >
                          {copiedZaloId === `maint-${cust.id}` ? '✓ Đã chép' : 'Sao chép tin nhắn'}
                        </button>
                        <a
                          href={`https://zalo.me/${cleanPhone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-2xs"
                        >
                          <span>Nhắn Zalo CSKH →</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
export default CrmAlertsPanel;