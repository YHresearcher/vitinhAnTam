// Tính toán tất toán quỹ founders theo bảng chốt 2026-11-02.
// ĐÂY LÀ NGUỒN TÍNH DUY NHẤT: tab tất toán của admin, bảng sao kê người bỏ
// vốn và bảng sao kê của Founders đều dùng các hàm dưới đây, nên số liệu ở
// mọi nơi luôn khớp nhau. Không hàm nào ở đây tự ý đổi tỉ lệ — tỉ lệ nằm
// trong bảng chốt và chỉ đổi khi bảng chốt đổi.
//
// Cơ sở N của một đơn bán máy = lãi gộp − 60.000đ quảng cáo chuẩn/đơn.
// Nguồn bản ghi: admin_deductions có product_type = 'machine' (mỗi đơn bán
// máy tạo đúng một bản ghi này, kể cả đơn lãi thấp; bản ghi trích quỹ bảo
// hành thì đơn lãi dưới 60k không tạo nên không dùng làm nguồn đếm đơn).
// Đơn bán key/linh kiện KHÔNG tính vào tất toán này (chúng vẫn chạy theo
// cơ chế trích admin riêng, không đổi).
import type { AdminDeductionItem, FounderMonthlyCosts, FounderSettlementRecord } from './types';
export type { FounderMonthlyCosts, FounderSettlementRecord };
import { STANDARD_ADS_COST_PER_ORDER } from './store';

export const FOUNDER_SELLER_RATE = 0.15;
export const FOUNDER_WARRANTY_RATE = 0.10;
export const FOUNDER_REINVEST_RATE = 0.40;
export const FOUNDER_MAIN_RATE_OF_REMAINDER = 0.40; // người bỏ vốn chính
export const FOUNDER_OTHER_RATE_OF_REMAINDER = 0.20; // mỗi đồng sáng lập còn lại
export const FOUNDER_OTHER_COUNT = 3;

/** 'YYYY-MM' từ chuỗi ngày ISO. Trả null nếu ngày không đọc được. */
export function monthKeyFromISO(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** 'Tháng M/YYYY' từ 'YYYY-MM'. */
export function monthLabel(month: string): string {
  const [y, m] = month.split('-');
  const year = Number(y);
  const mon = Number(m);
  if (!year || !mon || mon < 1 || mon > 12) return month;
  return `Tháng ${mon}/${year}`;
}

/** Tháng hiện tại theo lịch địa phương, dạng 'YYYY-MM'. */
export function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/** Các đơn bán máy trong một tháng (lọc theo ngày bán). */
export function machineSalesForMonth(
  deductions: AdminDeductionItem[],
  month: string,
): AdminDeductionItem[] {
  return deductions.filter(
    (d) => d.product_type === 'machine' && monthKeyFromISO(d.sale_date) === month,
  );
}

export interface MonthSettlement {
  month: string;
  orderCount: number;
  grossProfit: number;
  /** Lãi ròng N: cộng theo từng đơn, mỗi đơn trừ 60k chuẩn, đơn lỗ tính N = 0. */
  netProfit: number;
  seller: number; // 15% N
  warranty: number; // 10% N (giữ trong quỹ)
  reinvest: number; // 40% N (giữ trong quỹ tăng trưởng)
  remainder: number; // 35% N (phần còn lại chia founder)
  mainShare: number; // 40% phần còn lại = 14% N
  otherEach: number; // 20% phần còn lại = 7% N (mỗi đồng sáng lập còn lại)
  /** Hoàn quảng cáo chuẩn cho người bỏ vốn: số đơn × 60k. Nằm ngoài N. */
  reimbursement: number;
}

/** Toàn bộ thác nước chia của một tháng, tính từ bản ghi bán máy. */
export function computeMonthSettlement(
  deductions: AdminDeductionItem[],
  month: string,
): MonthSettlement {
  const sales = machineSalesForMonth(deductions, month);
  let grossProfit = 0;
  let netProfit = 0;
  for (const s of sales) {
    const gross = s.net_profit || 0;
    grossProfit += gross;
    netProfit += Math.max(0, gross - STANDARD_ADS_COST_PER_ORDER);
  }
  const seller = Math.round(netProfit * FOUNDER_SELLER_RATE);
  const warranty = Math.round(netProfit * FOUNDER_WARRANTY_RATE);
  const reinvest = Math.round(netProfit * FOUNDER_REINVEST_RATE);
  const remainder = netProfit - seller - warranty - reinvest;
  const mainShare = Math.round(remainder * FOUNDER_MAIN_RATE_OF_REMAINDER);
  const otherEach = Math.round(remainder * FOUNDER_OTHER_RATE_OF_REMAINDER);
  return {
    month,
    orderCount: sales.length,
    grossProfit,
    netProfit,
    seller,
    warranty,
    reinvest,
    remainder,
    mainShare,
    otherEach,
    reimbursement: sales.length * STANDARD_ADS_COST_PER_ORDER,
  };
}

/**
 * Một dòng chi tiết theo đơn bán máy, dùng cho bảng sao kê của Founders.
 * Các dòng thác nước (bán/quỹ/tái đầu tư/người bỏ vốn/mỗi founder) được chia
 * bằng phương pháp phần dư lớn nhất (largest remainder) từ tổng tháng, nên
 * cộng theo cột luôn khớp đúng tổng tháng từ computeMonthSettlement — không
 * lệch vài đồng như khi làm tròn từng đơn riêng lẻ. Đổi lại, cộng ngang một
 * đơn có thể lệch vài đồng so với N của đơn đó do làm tròn; ghi chú này
 * hiện cùng bảng chi tiết để founder tự đối chiếu.
 */
export interface SaleBreakdownRow {
  id: string;
  productName: string;
  serialNumber: string;
  saleDate: string;
  salePrice: number;
  costPrice: number;
  grossProfit: number;
  /** Quảng cáo chuẩn mỗi đơn, luôn 60.000đ (nằm ngoài N, không trừ thêm). */
  adsStandard: number;
  /** Lãi ròng của đơn: max(0, lãi gộp − 60k). Đơn lãi dưới 60k tính N = 0. */
  netProfit: number;
  seller: number; // 15% N
  warranty: number; // 10% N
  reinvest: number; // 40% N
  mainShare: number; // 14% N (người bỏ vốn)
  otherEach: number; // 7% N (mỗi đồng sáng lập còn lại)
}

/**
 * Chia một tổng tháng cho các đơn theo trọng số (lãi ròng từng đơn) sao cho
 * tổng các phần chia bằng đúng tổng tháng. Mỗi phần là floor hoặc ceil của
 * phần chia đúng tỉ lệ, phần dư được phát theo thứ tự phần lẻ lớn nhất.
 */
function allocateLargestRemainder(total: number, weights: number[]): number[] {
  const out = weights.map(() => 0);
  const weightSum = weights.reduce((a, b) => a + b, 0);
  if (total <= 0 || weightSum <= 0) return out;
  const raws = weights.map((w) => (total * w) / weightSum);
  let assigned = 0;
  raws.forEach((r, i) => {
    out[i] = Math.floor(r);
    assigned += out[i];
  });
  let left = total - assigned;
  const order = raws
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i);
  for (const o of order) {
    if (left <= 0) break;
    if (weights[o.i] <= 0) continue;
    out[o.i] += 1;
    left -= 1;
  }
  return out;
}

/**
 * Chi tiết theo từng đơn bán máy trong một tháng, kèm tổng tháng.
 * Nguồn và cách xếp tháng giống hệt computeMonthSettlement (admin_deductions
 * có product_type = 'machine', xếp theo sale_date) nên bảng chi tiết và bảng
 * tháng luôn nói cùng một con số. Chỉ đơn bán máy — key/linh kiện loại ra.
 * Không hiện tên/số điện thoại khách, không hiện tên người bán: founder chỉ
 * cần đối chiếu tiền theo máy, không cần biết khách là ai hay ai bán.
 */
export function saleBreakdownForMonth(
  deductions: AdminDeductionItem[],
  month: string,
): { rows: SaleBreakdownRow[]; totals: MonthSettlement } {
  const totals = computeMonthSettlement(deductions, month);
  const sales = machineSalesForMonth(deductions, month).sort((a, b) => {
    if (a.sale_date < b.sale_date) return -1;
    if (a.sale_date > b.sale_date) return 1;
    return a.id < b.id ? -1 : 1;
  });
  const weights = sales.map((s) => Math.max(0, (s.net_profit || 0) - STANDARD_ADS_COST_PER_ORDER));
  const sellerCol = allocateLargestRemainder(totals.seller, weights);
  const warrantyCol = allocateLargestRemainder(totals.warranty, weights);
  const reinvestCol = allocateLargestRemainder(totals.reinvest, weights);
  const mainCol = allocateLargestRemainder(totals.mainShare, weights);
  const otherCol = allocateLargestRemainder(totals.otherEach, weights);
  const rows: SaleBreakdownRow[] = sales.map((s, i) => {
    const gross = s.net_profit || 0;
    return {
      id: s.id,
      productName: s.product_name || 'Máy tính',
      serialNumber: s.serial_number || '',
      saleDate: s.sale_date,
      salePrice: s.sale_price || 0,
      costPrice: s.cost_price || 0,
      grossProfit: gross,
      adsStandard: STANDARD_ADS_COST_PER_ORDER,
      netProfit: weights[i],
      seller: sellerCol[i],
      warranty: warrantyCol[i],
      reinvest: reinvestCol[i],
      mainShare: mainCol[i],
      otherEach: otherCol[i],
    };
  });
  return { rows, totals };
}

/** Các tháng cần hiện: tháng có đơn bán máy, tháng đã có tất toán, tháng hiện tại. Mới nhất trước. */
export function allSettlementMonths(
  deductions: AdminDeductionItem[],
  settlements: FounderSettlementRecord[],
): string[] {
  const set = new Set<string>();
  for (const d of deductions) {
    if (d.product_type !== 'machine') continue;
    const key = monthKeyFromISO(d.sale_date);
    if (key) set.add(key);
  }
  for (const s of settlements) {
    if (s.id) set.add(s.id);
  }
  set.add(currentMonthKey());
  return [...set].sort((a, b) => (a < b ? 1 : -1));
}

/** Chi phí tháng rỗng (mặc định khi chưa nhập). */
export function emptyCosts(): FounderMonthlyCosts {
  return { adsAboveStandard: 0, rent: 0, salaries: 0, utilities: 0, other: 0, note: '' };
}

/** Tổng chi phí thực tế trong tháng. */
export function totalCosts(costs: FounderMonthlyCosts): number {
  return (
    (costs.adsAboveStandard || 0) +
    (costs.rent || 0) +
    (costs.salaries || 0) +
    (costs.utilities || 0) +
    (costs.other || 0)
  );
}

export interface PrincipalRow {
  month: string;
  mainShare: number;
  /** Gốc trả trong tháng này (0 khi chưa nhập tổng vốn). */
  repaidThisMonth: number;
  /** Gốc đã trả lũy kế tới hết tháng này. */
  repaidCumulative: number;
  /** Gốc còn lại sau tháng này; null khi chưa nhập tổng vốn. */
  remaining: number | null;
  /** Tổng phần 14% tích lũy (dùng khi chưa nhập vốn: "tạm giữ để trừ gốc"). */
  accumulatedShares: number;
}

/**
 * Lịch trả gốc theo từng tháng (tháng cũ trước, để trừ dần đúng thứ tự).
 * Gốc trả trong tháng = min(phần 14% của tháng, gốc còn lại đầu tháng).
 * Khi chưa nhập tổng vốn: không trừ, chỉ tích lũy phần 14%.
 */
export function principalSchedule(
  monthsAscending: { month: string; mainShare: number }[],
  capital: number | null,
): PrincipalRow[] {
  let remaining = capital;
  let repaidCumulative = 0;
  let accumulatedShares = 0;
  return monthsAscending.map(({ month, mainShare }) => {
    accumulatedShares += mainShare;
    let repaidThisMonth = 0;
    if (remaining !== null && remaining > 0) {
      repaidThisMonth = Math.min(remaining, mainShare);
      remaining -= repaidThisMonth;
      repaidCumulative += repaidThisMonth;
    }
    return {
      month,
      mainShare,
      repaidThisMonth,
      repaidCumulative,
      remaining,
      accumulatedShares,
    };
  });
}
