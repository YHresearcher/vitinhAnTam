import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/server/supabaseAdmin';
import { supabase, isSupabaseConfigured, Customer, InventoryItem } from '@/lib/supabase';
import { dispatchSystemEvent } from '@/lib/server/zaloBot';
import {
  calculateCustomerTier,
  getCustomerBirthdayInfo,
  CRM_TIER_CONFIG,
  normalizeCustomerTier,
} from '@/lib/crmTiers';

function getDb() {
  const serverSb = getServerSupabase();
  if (serverSb) return serverSb;
  if (isSupabaseConfigured() && supabase) return supabase;
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    if (!db) {
      return NextResponse.json({ success: false, message: 'Database not available' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const shouldSendZalo = searchParams.get('sendZalo') === 'true';
    const salesId = searchParams.get('salesId');

    // 1. Lấy dữ liệu customers và inventory_items
    const [custRes, invRes] = await Promise.all([
      db.from('customers').select('*'),
      db.from('inventory_items').select('*'),
    ]);

    const customers: Customer[] = (custRes.data as Customer[]) || [];
    const inventory: InventoryItem[] = (invRes.data as InventoryItem[]) || [];

    const now = new Date();

    // Lọc theo Sales nếu có
    const filteredCustomers = salesId
      ? customers.filter((c) => c.assigned_sales_id === salesId || c.assigned_sales_name === salesId)
      : customers;

    // 2. Rà soát sinh nhật trong 3 ngày tới
    const upcomingBirthdays = filteredCustomers
      .map((c) => {
        const info = getCustomerBirthdayInfo(c.birth_date, now);
        if (info && info.isUpcoming) {
          const tierInfo = calculateCustomerTier(c.total_spent, c.last_purchase_date);
          const tierConf = CRM_TIER_CONFIG[tierInfo.effectiveTier];
          return {
            customerName: c.full_name || c.name || 'Khách hàng',
            customerPhone: c.phone,
            birthDateFormatted: info.dayFormatted,
            daysRemaining: info.daysRemaining,
            isToday: info.isToday,
            tierLabel: tierConf.label,
            discountPercent: tierConf.discountPercentText,
            salesName: c.assigned_sales_name || 'Vi Tính An Tâm',
            totalSpent: c.total_spent || 0,
          };
        }
        return null;
      })
      .filter(Boolean);

    // 3. Rà soát các mốc 1, 3, 6, 12 tháng
    const followUpMilestones: Array<Record<string, unknown>> = [];
    filteredCustomers.forEach((cust) => {
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

      let milestoneText = '';
      if (daysSince >= 25 && daysSince <= 35) {
        milestoneText = '1 THÁNG (Hỏi thăm ổn định)';
      } else if (daysSince >= 80 && daysSince <= 100) {
        milestoneText = '3 THÁNG (Tối ưu dọn rác Windows)';
      } else if (daysSince >= 170 && daysSince <= 195) {
        milestoneText = '6 THÁNG (Mời bảo dưỡng tra keo miễn phí)';
      } else if (daysSince >= 350 && daysSince <= 380) {
        milestoneText = '12 THÁNG (Kỷ niệm 1 năm đồng hành)';
      }

      if (milestoneText) {
        followUpMilestones.push({
          customerName: cust.full_name || cust.name,
          customerPhone: cust.phone,
          deviceName: deviceName || 'Máy tính',
          serviceTag,
          purchaseDate: latestDate.toLocaleDateString('vi-VN'),
          monthsSince,
          milestoneText,
          salesName: cust.assigned_sales_name || 'Vi Tính An Tâm',
        });
      }
    });

    // 4. Rà soát bảo hành sắp hết hạn trong 30 ngày tới
    const expiringWarranties: Array<Record<string, unknown>> = [];
    filteredCustomers.forEach((cust) => {
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
          expiringWarranties.push({
            customerName: cust.full_name || cust.name,
            customerPhone: cust.phone,
            deviceName: item.device_model || item.model || `${item.brand} ${item.form_factor}`,
            serviceTag: item.service_tag,
            warrantyExpiryDate: expiry.toLocaleDateString('vi-VN'),
            expiryDaysRemaining: daysRemaining,
            salesName: cust.assigned_sales_name || 'Vi Tính An Tâm',
          });
        }
      });
    });

    // 5. Nếu kích hoạt sendZalo=true, bắn thông báo vào Zalo Bot
    if (shouldSendZalo) {
      for (const b of upcomingBirthdays) {
        if (b) {
          await dispatchSystemEvent('crm_birthday_alert', b);
        }
      }
      for (const f of followUpMilestones) {
        await dispatchSystemEvent('crm_followup_milestone', f);
      }
      for (const w of expiringWarranties) {
        await dispatchSystemEvent('crm_warranty_expiring', w);
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalCustomers: customers.length,
        birthdaysCount: upcomingBirthdays.length,
        followUpsCount: followUpMilestones.length,
        warrantiesExpiringCount: expiringWarranties.length,
      },
      data: {
        upcomingBirthdays,
        followUpMilestones,
        expiringWarranties,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
