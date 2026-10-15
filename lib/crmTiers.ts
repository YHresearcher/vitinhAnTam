// lib/crmTiers.ts
// Bộ máy phân hạng khách hàng tự động, quy tắc rớt hạng 12 tháng và chính sách chiết khấu Vi Tính An Tâm

import { CustomerTierType } from './supabase';

export interface TierConfig {
  id: CustomerTierType;
  label: string;
  minSpend: number;
  discountRate: number; // 0, 0.01, 0.03, 0.05
  discountPercentText: string;
  badgeBg: string;
  badgeTextColor: string;
  badgeBorder: string;
  cardGradient: string;
  cardTextColor: string;
  cardChipColor: string;
  description: string;
}

export const CRM_TIER_CONFIG: Record<CustomerTierType, TierConfig> = {
  standard: {
    id: 'standard',
    label: 'Khách thường',
    minSpend: 0,
    discountRate: 0,
    discountPercentText: '0%',
    badgeBg: 'bg-slate-100',
    badgeTextColor: 'text-slate-700',
    badgeBorder: 'border-slate-200',
    cardGradient: 'from-slate-700 via-slate-800 to-slate-900',
    cardTextColor: 'text-slate-100',
    cardChipColor: 'bg-slate-400',
    description: 'Chưa đủ điều kiện tích lũy thẻ thành viên (< 3 triệu)',
  },
  member: {
    id: 'member',
    label: 'Thành viên',
    minSpend: 3_000_000,
    discountRate: 0,
    discountPercentText: '0%',
    badgeBg: 'bg-blue-50',
    badgeTextColor: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    cardGradient: 'from-blue-700 via-indigo-800 to-slate-900',
    cardTextColor: 'text-white',
    cardChipColor: 'bg-amber-300',
    description: 'Tích lũy từ 3 triệu - 10 triệu (Hạng bảo lưu vĩnh viễn, không bị giảm hạng)',
  },
  loyal: {
    id: 'loyal',
    label: 'Thân thiết',
    minSpend: 11_000_000,
    discountRate: 0.01,
    discountPercentText: '1%',
    badgeBg: 'bg-emerald-50',
    badgeTextColor: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
    cardGradient: 'from-emerald-700 via-teal-800 to-slate-900',
    cardTextColor: 'text-white',
    cardChipColor: 'bg-amber-300',
    description: 'Tích lũy từ 11 triệu - 18 triệu (Chiết khấu 1% khi mua hàng)',
  },
  vip: {
    id: 'vip',
    label: 'VIP',
    minSpend: 19_000_000,
    discountRate: 0.03,
    discountPercentText: '3%',
    badgeBg: 'bg-amber-50',
    badgeTextColor: 'text-amber-800',
    badgeBorder: 'border-amber-300',
    cardGradient: 'from-amber-600 via-yellow-700 to-amber-950',
    cardTextColor: 'text-amber-50',
    cardChipColor: 'bg-yellow-200',
    description: 'Tích lũy từ 19 triệu - 30 triệu (Chiết khấu 3% khi mua hàng)',
  },
  vvip: {
    id: 'vvip',
    label: 'VVIP',
    minSpend: 30_000_001,
    discountRate: 0.05,
    discountPercentText: '5%',
    badgeBg: 'bg-purple-50',
    badgeTextColor: 'text-purple-700',
    badgeBorder: 'border-purple-300',
    cardGradient: 'from-purple-800 via-indigo-900 to-slate-950',
    cardTextColor: 'text-purple-50',
    cardChipColor: 'bg-amber-300',
    description: 'Tích lũy trên 30 triệu (Chiết khấu tối đa 5% mọi đơn hàng)',
  },
};

const TIER_ORDER: CustomerTierType[] = ['standard', 'member', 'loyal', 'vip', 'vvip'];

/**
 * Chuẩn hóa giá trị hạng từ bất kỳ format nào (kể cả dữ liệu cũ 'Standard', 'Thân thiết', 'VIP')
 */
export function normalizeCustomerTier(raw?: string | null): CustomerTierType {
  if (!raw) return 'standard';
  const clean = raw.toLowerCase().trim();
  if (clean === 'vvip') return 'vvip';
  if (clean === 'vip') return 'vip';
  if (clean === 'loyal' || clean === 'thân thiết' || clean === 'than thiet') return 'loyal';
  if (clean === 'member' || clean === 'thành viên' || clean === 'thanh vien') return 'member';
  return 'standard';
}

/**
 * Tính toán hạng khách hàng tự động dựa trên tổng chi tiêu (total_spent)
 * và ngày mua hàng gần nhất (last_purchase_date).
 *
 * Quy tắc:
 * - 3 triệu - 10 triệu = thành viên
 * - 11 - 18 triệu = thân thiết
 * - 19 - 30 triệu = VIP
 * - > 30 triệu = VVIP
 * - Mỗi 12 tháng (365 ngày) chưa mua lại thì bị giảm 1 hạng.
 * - Sàn bảo lưu: "Thành viên" một khi đã đạt thì KHÔNG BAO GIỜ bị giảm về "Khách thường".
 */
export function calculateCustomerTier(
  totalSpent: number = 0,
  lastPurchaseDate?: string | null,
  currentDate: Date = new Date()
): {
  baseTier: CustomerTierType;
  effectiveTier: CustomerTierType;
  isDowngraded: boolean;
  monthsSinceLastPurchase: number;
} {
  // 1. Xác định base tier theo tổng chi tiêu
  let baseTier: CustomerTierType = 'standard';
  if (totalSpent > 30_000_000) {
    baseTier = 'vvip';
  } else if (totalSpent >= 19_000_000) {
    baseTier = 'vip';
  } else if (totalSpent >= 11_000_000) {
    baseTier = 'loyal';
  } else if (totalSpent >= 3_000_000) {
    baseTier = 'member';
  }

  // 2. Nếu là khách thường, không có quy tắc giảm hạng
  if (baseTier === 'standard' || !lastPurchaseDate) {
    return {
      baseTier,
      effectiveTier: baseTier,
      isDowngraded: false,
      monthsSinceLastPurchase: 0,
    };
  }

  // 3. Tính số tháng / năm không phát sinh đơn hàng
  const lastDate = new Date(lastPurchaseDate);
  if (Number.isNaN(lastDate.getTime())) {
    return {
      baseTier,
      effectiveTier: baseTier,
      isDowngraded: false,
      monthsSinceLastPurchase: 0,
    };
  }

  const diffMs = currentDate.getTime() - lastDate.getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const monthsSinceLastPurchase = Math.floor(diffDays / 30);
  const yearsInactive = Math.floor(diffDays / 365);

  if (yearsInactive <= 0) {
    return {
      baseTier,
      effectiveTier: baseTier,
      isDowngraded: false,
      monthsSinceLastPurchase,
    };
  }

  // 4. Áp dụng quy tắc giảm 1 hạng cho mỗi 12 tháng không mua lại
  // Sàn dừng: 'member' (index 1 trong TIER_ORDER)
  const baseIndex = TIER_ORDER.indexOf(baseTier);
  const memberIndex = TIER_ORDER.indexOf('member');

  let newIndex = baseIndex - yearsInactive;
  // Nếu baseTier >= member thì tối thiểu giữ ở member
  if (baseIndex >= memberIndex && newIndex < memberIndex) {
    newIndex = memberIndex;
  }
  newIndex = Math.max(0, newIndex);

  const effectiveTier = TIER_ORDER[newIndex];
  const isDowngraded = effectiveTier !== baseTier;

  return {
    baseTier,
    effectiveTier,
    isDowngraded,
    monthsSinceLastPurchase,
  };
}

/**
 * Lấy tỉ lệ chiết khấu theo hạng (Thành viên: 0%, Thân thiết: 1%, VIP: 3%, VVIP: 5%)
 */
export function getCustomerDiscountRate(tier: CustomerTierType | string): number {
  const norm = normalizeCustomerTier(tier);
  return CRM_TIER_CONFIG[norm].discountRate;
}

/**
 * Tính số tiền chiết khấu dựa trên giá trị đơn hàng và hạng khách hàng
 */
export function calculateDiscountAmount(orderAmount: number, tier: CustomerTierType | string): number {
  const rate = getCustomerDiscountRate(tier);
  return Math.round(orderAmount * rate);
}

/**
 * Tính toán tiến độ thăng hạng (Progress to Next Tier) phục vụ Thẻ Thành Viên Điện Tử
 */
export interface TierProgress {
  currentTier: CustomerTierType;
  nextTier: CustomerTierType | null;
  currentSpend: number;
  nextTierMinSpend: number;
  amountNeeded: number;
  progressPercent: number;
  isMaxTier: boolean;
}

export function calculateTierProgress(totalSpent: number = 0): TierProgress {
  const currentTier = calculateCustomerTier(totalSpent).effectiveTier;

  if (currentTier === 'vvip') {
    return {
      currentTier,
      nextTier: null,
      currentSpend: totalSpent,
      nextTierMinSpend: 30_000_001,
      amountNeeded: 0,
      progressPercent: 100,
      isMaxTier: true,
    };
  }

  let nextTier: CustomerTierType = 'member';
  let prevThreshold = 0;
  let nextThreshold = 3_000_000;

  if (currentTier === 'standard') {
    nextTier = 'member';
    prevThreshold = 0;
    nextThreshold = 3_000_000;
  } else if (currentTier === 'member') {
    nextTier = 'loyal';
    prevThreshold = 3_000_000;
    nextThreshold = 11_000_000;
  } else if (currentTier === 'loyal') {
    nextTier = 'vip';
    prevThreshold = 11_000_000;
    nextThreshold = 19_000_000;
  } else if (currentTier === 'vip') {
    nextTier = 'vvip';
    prevThreshold = 19_000_000;
    nextThreshold = 30_000_001;
  }

  const amountNeeded = Math.max(0, nextThreshold - totalSpent);
  const range = nextThreshold - prevThreshold;
  const currentInRange = Math.max(0, totalSpent - prevThreshold);
  const progressPercent = Math.min(100, Math.round((currentInRange / range) * 100));

  return {
    currentTier,
    nextTier,
    currentSpend: totalSpent,
    nextTierMinSpend: nextThreshold,
    amountNeeded,
    progressPercent,
    isMaxTier: false,
  };
}

/**
 * Tính toán số ngày còn lại đến sinh nhật khách hàng (0 - 3 ngày: sắp tới)
 */
export function getCustomerBirthdayInfo(birthDateStr?: string | null, now: Date = new Date()) {
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
    isToday: daysRemaining === 0,
  };
}
