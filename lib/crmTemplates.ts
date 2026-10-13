// lib/crmTemplates.ts
// Kho mẫu tin nhắn Zalo 1-Click dành cho Sales chăm sóc khách hàng (Vi Tính An Tâm)

import { CRM_TIER_CONFIG, normalizeCustomerTier } from './crmTiers';

export interface TemplateParams {
  customerName?: string;
  customerPhone?: string;
  birthDateFormatted?: string;
  daysRemaining?: number;
  tier?: string;
  deviceName?: string;
  serviceTag?: string;
  warrantyExpiryDate?: string;
  expiryDaysRemaining?: number;
  salesName?: string;
  storeHotline?: string;
}

const DEFAULT_SALES = 'Vi Tính An Tâm';
const DEFAULT_HOTLINE = '0909.053.058';

/**
 * 1. Mẫu chúc mừng sinh nhật (nhắc trước 3 ngày hoặc đúng ngày)
 */
export function getBirthdayZaloTemplate(params: TemplateParams): string {
  const name = params.customerName || 'Quý khách';
  const tierKey = normalizeCustomerTier(params.tier);
  const tierConfig = CRM_TIER_CONFIG[tierKey];
  const sales = params.salesName || DEFAULT_SALES;
  const isToday = params.daysRemaining === 0;

  let perkText = 'tặng 01 buổi vệ sinh máy tính & tra keo tản nhiệt cao cấp hoàn toàn miễn phí';
  if (tierKey === 'vvip') {
    perkText = 'tặng Voucher giảm 300.000đ khi mua máy mới/linh kiện + quà tặng công nghệ tri ân đặc biệt';
  } else if (tierKey === 'vip') {
    perkText = 'tặng Voucher giảm 200.000đ + miễn phí gói vệ sinh bảo dưỡng tận nơi';
  } else if (tierKey === 'loyal') {
    perkText = 'tặng Voucher giảm 100.000đ + vệ sinh tra keo tản nhiệt miễn phí tại quầy';
  }

  const timeHeader = isToday
    ? 'Hôm nay là ngày sinh nhật đặc biệt của anh/chị'
    : `Sắp tới ngày sinh nhật của anh/chị (${params.birthDateFormatted || 'sắp tới'})`;

  return `Dạ em chào anh/chị ${name} ạ! 🎉

Em là ${sales} từ Vi Tính An Tâm. ${timeHeader}, toàn thể đội ngũ Vi Tính An Tâm xin gửi lời chúc mừng sinh nhật chân thành nhất đến anh/chị! Chúc anh/chị luôn dồi dào sức khỏe, may mắn và công việc luôn hanh thông, thành công rực rỡ ạ.

🎂 Để tri ân sự gắn kết của anh/chị với hạng thành viên [${tierConfig.label}], Vi Tính An Tâm xin trân trọng gửi tặng anh/chị:
👉 ${perkText}.
(Ưu đãi có giá trị áp dụng trong suốt tháng sinh nhật của anh/chị ạ).

Khi nào tiện, anh/chị cứ ghé cửa hàng hoặc nhắn em để em chuẩn bị chu đáo nhất nhé. Em chúc anh/chị có một ngày sinh nhật thật ấm áp và ngập tràn niềm vui ạ! ❤️`;
}

/**
 * 2. Mẫu chăm sóc sau bán hàng: Mốc 1 tháng
 */
export function getFollowUp1MonthTemplate(params: TemplateParams): string {
  const name = params.customerName || 'Quý khách';
  const device = params.deviceName || 'máy tính';
  const sales = params.salesName || DEFAULT_SALES;

  return `Dạ em chào anh/chị ${name} ạ!

Em là ${sales} bên Vi Tính An Tâm. Thiết bị ${device} của anh/chị đến nay đã sử dụng được tròn 1 tháng rồi ạ.

Dạ em nhắn tin hỏi thăm xem trong tháng đầu trải nghiệm, máy hoạt động có mượt mà và đáp ứng tốt công việc/học tập của anh/chị không ạ? Anh/chị có gặp vướng mắc gì về phần mềm, kết nối máy in hay cần hỗ trợ kỹ thuật thêm không ạ?

Nếu cần bất cứ sự trợ giúp nào, anh/chị cứ nhắn lại ngay cho em hoặc gọi hotline ${DEFAULT_HOTLINE} để tụi em Ultraviewer hỗ trợ liền nhé. Chúc anh/chị làm việc thật hiệu quả ạ! 😊`;
}

/**
 * 3. Mẫu chăm sóc sau bán hàng: Mốc 3 tháng
 */
export function getFollowUp3MonthTemplate(params: TemplateParams): string {
  const name = params.customerName || 'Quý khách';
  const device = params.deviceName || 'máy tính';
  const sales = params.salesName || DEFAULT_SALES;

  return `Dạ em chào anh/chị ${name}!

Em là ${sales} từ Vi Tính An Tâm ạ. Máy ${device} của mình đã đồng hành được 3 tháng rồi.

Em nhắn hỏi thăm xem máy chạy vẫn êm ái, mát mẻ chứ ạ? Sau 3 tháng sử dụng, hệ điều hành Windows có thể tích tụ một số file rác tạm thời làm chậm máy, nếu anh/chị cảm thấy máy có dấu hiệu chậm lại thì báo em, kỹ thuật bên em sẽ hỗ trợ tối ưu dọn rác từ xa miễn phí cho mình nha.

Chúc anh/chị một tuần mới nhiều năng lượng và làm việc suôn sẻ ạ! ✨`;
}

/**
 * 4. Mẫu chăm sóc sau bán hàng: Mốc 6 tháng (Mời bảo dưỡng tra keo định kỳ)
 */
export function getFollowUp6MonthTemplate(params: TemplateParams): string {
  const name = params.customerName || 'Quý khách';
  const device = params.deviceName || 'máy tính';
  const sales = params.salesName || DEFAULT_SALES;

  return `Dạ em chào anh/chị ${name} ạ!

Em là ${sales} ở Vi Tính An Tâm. Máy ${device} của anh/chị đã sử dụng được 6 tháng rồi ạ.

🔧 Theo tiêu chuẩn bảo dưỡng của Vi Tính An Tâm, mốc 6 tháng là thời điểm vàng để:
• Thổi sạch bụi bẩn bám ở cánh quạt tản nhiệt
• Kiểm tra độ êm và nhiệt độ của CPU/VGA
• Tra lại keo tản nhiệt cao cấp nếu cần để máy luôn mát và bền bỉ lâu dài.

Bên em xin mời anh/chị mang máy ghé cửa hàng để các bạn kỹ thuật làm vệ sinh - bảo dưỡng MIỄN PHÍ trọn gói cho mình nha. Anh/chị ghé giờ nào thuận tiện cứ nhắn trước cho em để em dặn KTV tiếp đón chu đáo nhé ạ! Cảm ơn anh/chị rất nhiều ạ! 🛠️`;
}

/**
 * 5. Mẫu chăm sóc sau bán hàng: Mốc 12 tháng (Kỷ niệm 1 năm đồng hành)
 */
export function getFollowUp12MonthTemplate(params: TemplateParams): string {
  const name = params.customerName || 'Quý khách';
  const device = params.deviceName || 'máy tính';
  const sales = params.salesName || DEFAULT_SALES;

  return `Dạ em chào anh/chị ${name}! 💐

Thời gian trôi nhanh quá, chiếc ${device} đã đồng hành cùng anh/chị tròn 1 năm rồi ạ. Em là ${sales} bên Vi Tính An Tâm.

Trước hết, toàn thể đội ngũ Vi Tính An Tâm xin gửi lời cảm ơn chân thành nhất vì anh/chị đã tin tưởng và đồng hành cùng tụi em trong suốt một năm qua. Em nhắn hỏi thăm xem máy tính hiện tại vẫn hoạt động tốt và phục vụ hiệu quả cho anh/chị chứ ạ?

🎁 Nhân dịp kỷ niệm 1 năm, bên em xin gửi tặng anh/chị:
• Miễn phí gói vệ sinh, tra keo tản nhiệt gốm và cân chỉnh máy toàn diện.
• Ưu đãi giảm giá 10% nếu anh/chị có nhu cầu nâng cấp thêm RAM hoặc ổ cứng SSD tốc độ cao để máy chạy mượt mà hơn.

Anh/chị cần hỗ trợ gì cứ nhắn em nhé. Chúc anh/chị luôn dồi dào sức khỏe và gặt hái thêm nhiều thành công ạ! 🌟`;
}

/**
 * 6. Mẫu cảnh báo máy sắp hết hạn bảo hành trong 30 ngày tới
 */
export function getWarrantyExpiringTemplate(params: TemplateParams): string {
  const name = params.customerName || 'Quý khách';
  const device = params.deviceName || 'máy tính';
  const tag = params.serviceTag ? ` (Mã Service Tag: ${params.serviceTag})` : '';
  const days = params.expiryDaysRemaining ?? 30;
  const sales = params.salesName || DEFAULT_SALES;

  return `Dạ em chào anh/chị ${name} ạ!

Em là ${sales} phụ trách kỹ thuật tại Vi Tính An Tâm. Em xin phép thông báo: Thiết bị ${device}${tag} của anh/chị chỉ còn khoảng ${days} ngày nữa là kết thúc thời hạn bảo hành phần cứng ạ.

🛡️ Để đảm bảo quyền lợi tốt nhất cho anh/chị:
1. Em mời anh/chị mang máy qua Vi Tính An Tâm để KTV kiểm tra tổng thể phần cứng (sức khỏe ổ cứng SSD, RAM, quạt tản nhiệt, nguồn) HOÀN TOÀN MIỄN PHÍ trước khi hết hạn bảo hành. Nếu có linh kiện nào phát sinh lỗi tiềm ẩn, bên em sẽ đổi mới miễn phí ngay cho mình.
2. Nếu anh/chị muốn an tâm dùng lâu dài, bên em đang có chính sách trợ giá gia hạn gói bảo hành mở rộng thêm 12 tháng với chi phí cực kỳ ưu đãi cho khách hàng thân thiết.

Anh/chị sắp xếp mang máy ghé hoặc nhắn em hỗ trợ đặt lịch trước nhé ạ! Em cảm ơn anh/chị nhiều ạ! 🙏`;
}
