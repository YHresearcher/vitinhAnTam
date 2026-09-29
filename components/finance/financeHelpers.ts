import { LedgerItem } from './types';
import { InventoryItem, ServiceTicket, OnsiteDispatch, LicenseKeyItem, ShiftLog } from '@/lib/supabase';

export function buildLedgerItems(
  inventory: InventoryItem[],
  tickets: ServiceTicket[],
  onsiteDispatches: OnsiteDispatch[],
  licenseKeys: LicenseKeyItem[],
  shiftLogs: ShiftLog[]
): LedgerItem[] {
  const items: LedgerItem[] = [];

  inventory.forEach((i) => {
    if (i.qc_status === 'sold') {
      const rev = i.price ?? i.retail_price ?? 0;
      const cost = i.import_price ?? i.cost_price ?? 0;
      const dStr = i.handover_date || i.import_date || i.created_at || new Date().toISOString();
      items.push({
        id: `m-${i.id}`,
        date: dStr,
        type: 'income',
        category: 'machine',
        categoryLabel: 'Bán Kho Máy',
        code: i.service_tag || i.serial_number || `INV-${i.id.slice(0, 6)}`,
        title: `${i.device_model || i.model || 'Máy tính'} (${i.brand})`,
        partyName: i.customer_name || 'Khách lẻ',
        partyPhone: i.customer_phone,
        incomeAmount: rev,
        expenseAmount: cost,
        netProfit: rev - cost,
        paymentStatus: 'paid',
        paymentMethod: 'Chuyển khoản',
      });
    }
  });

  tickets.forEach((t) => {
    const rev = t.total_amount ?? t.actual_cost ?? 0;
    const cost = Math.round(rev * 0.35);
    const dStr = t.created_at || t.estimated_completion || new Date().toISOString();
    if (rev > 0) {
      items.push({
        id: `t-${t.id}`,
        date: dStr,
        type: 'income',
        category: 'ticket',
        categoryLabel: 'Sửa Chữa',
        code: t.ticket_code,
        title: `Sửa chữa ${t.device_model || t.device_name || 'thiết bị'}: ${t.issue_description?.slice(0, 35) || 'Sự cố'}`,
        partyName: t.customer_name,
        partyPhone: t.customer_phone,
        incomeAmount: rev,
        expenseAmount: cost,
        netProfit: rev - cost,
        paymentStatus: t.status === 'completed' || t.status === 'delivered' ? 'paid' : 'partial',
        paymentMethod: 'Tiền mặt',
        notes: t.status === 'completed' ? 'Đã thu đủ' : 'Đang xử lý',
      });
    }
  });

  onsiteDispatches.forEach((d) => {
    const isUrgent = d.urgency === 'urgent';
    const rev = isUrgent ? 350000 : 200000;
    const wage = isUrgent ? 200000 : 120000;
    const dStr = d.created_at || d.scheduled_time || new Date().toISOString();

    items.push({
      id: `dsp-${d.id}`,
      date: dStr,
      type: 'income',
      category: 'onsite',
      categoryLabel: 'Cứu Hộ Onsite',
      code: d.ticket_code || `DSP-${d.id.slice(0, 6)}`,
      title: `Cứu hộ: ${d.issue_summary?.slice(0, 30) || d.address}`,
      partyName: d.customer_name,
      partyPhone: d.customer_phone || d.phone,
      incomeAmount: rev,
      expenseAmount: wage,
      netProfit: rev - wage,
      paymentStatus: d.status === 'completed' ? 'paid' : 'unpaid',
      paymentMethod: 'Tiền mặt',
    });
  });

  licenseKeys.forEach((k) => {
    if (k.status === 'used' || k.status === 'activated' || k.assigned_to_customer) {
      const rev = k.unit_price ?? 350000;
      const cost = k.import_price ?? Math.round(rev * 0.55);
      items.push({
        id: `k-${k.id}`,
        date: k.activated_at || k.created_at,
        type: 'income',
        category: 'key',
        categoryLabel: 'Key Bản Quyền',
        code: k.license_code,
        title: `Cấp bản quyền ${k.category_name || 'Windows/Office'}`,
        partyName: k.assigned_to_customer || k.customer_name || 'Khách mua key',
        incomeAmount: rev,
        expenseAmount: cost,
        netProfit: rev - cost,
        paymentStatus: 'paid',
        paymentMethod: 'Chuyển khoản',
      });
    }
  });

  shiftLogs.forEach((s) => {
    const bonus = s.bonus || s.bonus_amount || 0;
    const payout = s.base_wage + bonus;
    const dStr = s.shift_date ? `${s.shift_date}T18:00:00` : new Date().toISOString();
    items.push({
      id: `s-${s.id}`,
      date: dStr,
      type: 'expense',
      category: 'payroll',
      categoryLabel: 'Tiền Công KTV',
      code: `SHIFT-${s.id.slice(0, 6)}`,
      title: `Tiền công ca trực (${s.tickets_completed} máy)`,
      partyName: s.technician_name || s.ktv_name || 'KTV',
      incomeAmount: 0,
      expenseAmount: payout,
      netProfit: -payout,
      paymentStatus: 'paid',
      paymentMethod: 'Chuyển khoản',
    });
  });

  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

