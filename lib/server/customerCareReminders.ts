import { getStoredSettingsAsync } from '@/lib/server/settings';
import { sendZaloBotMessage } from '@/lib/server/zaloBot';
import { getServerSupabase } from '@/lib/server/supabaseAdmin';

interface ReminderConfig {
  enableCustomerCareReminders: boolean;
  customerCareReminderChatId: string;
  customerCareReminderIntervals: number[];
  customerCareReminderMessage: string;
}

interface SaleRecord {
  customer_name: string;
  customer_phone: string;
  device_model: string;
  service_tag: string;
  sale_date: string; // ISO string
  warranty_months: number;
  handover_date?: string;
}

/**
 * Lấy cấu hình nhắc nhở chăm sóc khách hàng
 */
export async function getReminderConfig(): Promise<ReminderConfig | null> {
  const settings = await getStoredSettingsAsync();
  
  if (!settings.enableCustomerCareReminders) {
    return null;
  }
  
  if (!settings.customerCareReminderChatId?.trim()) {
    console.warn('[CustomerCareReminders] Chat ID không được cấu hình');
    return null;
  }
  
  return {
    enableCustomerCareReminders: settings.enableCustomerCareReminders,
    customerCareReminderChatId: settings.customerCareReminderChatId.trim(),
    customerCareReminderIntervals: settings.customerCareReminderIntervals || [1, 6, 12],
    customerCareReminderMessage: settings.customerCareReminderMessage || '',
  };
}

/**
 * Render template tin nhắn với dữ liệu thực tế
 */
function renderMessageTemplate(template: string, data: SaleRecord, interval: number): string {
  const saleDate = data.handover_date || data.sale_date;
  const formattedDate = saleDate ? new Date(saleDate).toLocaleDateString('vi-VN') : 'N/A';
  
  return template
    .replace(/{{customer_name}}/g, data.customer_name)
    .replace(/{{customer_phone}}/g, data.customer_phone)
    .replace(/{{device_model}}/g, data.device_model || 'N/A')
    .replace(/{{service_tag}}/g, data.service_tag || 'N/A')
    .replace(/{{sale_date}}/g, formattedDate)
    .replace(/{{warranty_months}}/g, String(data.warranty_months))
    .replace(/{{interval}}/g, String(interval));
}

/**
 * Kiểm tra xem một bản ghi bán hàng có cần nhắc nhở tại interval tháng không
 */
function shouldRemindAtInterval(saleDate: string, warrantyMonths: number, interval: number): boolean {
  const sale = new Date(saleDate);
  const reminderDate = new Date(sale);
  reminderDate.setMonth(reminderDate.getMonth() + interval);
  
  // So sánh ngày (bỏ qua giờ)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  reminderDate.setHours(0, 0, 0, 0);
  
  // Chỉ nhắc nhở nếu chưa quá hạn bảo hành
  const warrantyEnd = new Date(sale);
  warrantyEnd.setMonth(warrantyEnd.getMonth() + warrantyMonths);
  warrantyEnd.setHours(0, 0, 0, 0);
  
  return reminderDate.getTime() === today.getTime() && reminderDate <= warrantyEnd;
}

/**
 * Lấy danh sách bán hàng từ inventory_items (bán hàng kho)
 */
async function getInventorySales(): Promise<SaleRecord[]> {
  const supabase = getServerSupabase();
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('inventory_items')
    .select('customer_name, customer_phone, device_model, model, service_tag, handover_date, warranty_months, created_at')
    .eq('qc_status', 'sold')
    .not('customer_name', 'is', null)
    .not('handover_date', 'is', null);
  
  if (error) {
    console.error('[CustomerCareReminders] Lỗi truy vấn inventory_items:', error);
    return [];
  }
  
  return (data || []).map((item) => ({
    customer_name: item.customer_name || '',
    customer_phone: item.customer_phone || '',
    device_model: item.device_model || item.model || '',
    service_tag: item.service_tag || '',
    sale_date: item.handover_date || item.created_at || '',
    warranty_months: item.warranty_months || 12,
    handover_date: item.handover_date,
  }));
}

/**
 * Lấy danh sách sửa chữa/bảo hành từ service_tickets
 */
async function getServiceTicketSales(): Promise<SaleRecord[]> {
  const supabase = getServerSupabase();
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('service_tickets')
    .select('customer_name, customer_phone, device_model, device_name, device_service_tag, service_tag, created_at, warranty_duration_months, warranty_until, handover_date')
    .in('status', ['delivered', 'completed'])
    .not('customer_name', 'is', null)
    .not('warranty_until', 'is', null);
  
  if (error) {
    console.error('[CustomerCareReminders] Lỗi truy vấn service_tickets:', error);
    return [];
  }
  
  return (data || []).map((ticket) => ({
    customer_name: ticket.customer_name || '',
    customer_phone: ticket.customer_phone || '',
    device_model: ticket.device_model || ticket.device_name || '',
    service_tag: ticket.device_service_tag || ticket.service_tag || '',
    sale_date: ticket.handover_date || ticket.created_at || '',
    warranty_months: ticket.warranty_duration_months || 12,
    handover_date: ticket.handover_date,
  }));
}

/**
 * Chạy job nhắc nhở chăm sóc khách hàng
 * Trả về số lượng tin nhắn đã gửi thành công
 */
export async function runCustomerCareReminders(): Promise<{
  success: boolean;
  sent: number;
  errors: string[];
  details: Array<{ interval: number; customer: string; success: boolean; error?: string }>;
}> {
  const config = await getReminderConfig();
  
  if (!config) {
    return { success: true, sent: 0, errors: ['Reminders disabled or not configured'], details: [] };
  }
  
  const { customerCareReminderChatId, customerCareReminderIntervals, customerCareReminderMessage } = config;
  
  // Lấy tất cả bản ghi bán hàng/sửa chữa
  const [inventorySales, ticketSales] = await Promise.all([
    getInventorySales(),
    getServiceTicketSales(),
  ]);
  
  const allSales = [...inventorySales, ...ticketSales];
  
  if (allSales.length === 0) {
    return { success: true, sent: 0, errors: [], details: [] };
  }
  
  const results: Array<{ interval: number; customer: string; success: boolean; error?: string }> = [];
  const errors: string[] = [];
  let sent = 0;
  
  // Duyệt qua từng interval và từng bản ghi
  for (const interval of customerCareReminderIntervals) {
    for (const sale of allSales) {
      if (!sale.sale_date) continue;
      
      if (shouldRemindAtInterval(sale.sale_date, sale.warranty_months, interval)) {
        const message = renderMessageTemplate(customerCareReminderMessage, sale, interval);
        
        try {
          const result = await sendZaloBotMessage({
            chatId: customerCareReminderChatId,
            text: message,
            parseMode: 'markdown',
          });
          
          if (result.ok) {
            sent++;
            results.push({ interval, customer: sale.customer_name, success: true });
          } else {
            const error = `Gửi thất bại cho ${sale.customer_name} (${interval}T): ${result.error}`;
            errors.push(error);
            results.push({ interval, customer: sale.customer_name, success: false, error: result.error });
          }
        } catch (err) {
          const error = `Lỗi exception cho ${sale.customer_name} (${interval}T): ${err instanceof Error ? err.message : String(err)}`;
          errors.push(error);
          results.push({ interval, customer: sale.customer_name, success: false, error: String(err) });
        }
        
        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  }
  
  return { success: errors.length === 0, sent, errors, details: results };
}

/**
 * Hàm test gửi tin nhắn nhắc nhở với dữ liệu mẫu
 */
export async function testCustomerCareReminder(
  chatId: string,
  messageTemplate: string,
  apiBaseUrl?: string
): Promise<{ ok: boolean; error?: string }> {
  const testMessage = messageTemplate
    .replace(/{{customer_name}}/g, 'Nguyễn Văn A (Test)')
    .replace(/{{customer_phone}}/g, '0909123456')
    .replace(/{{device_model}}/g, 'Dell OptiPlex 7060 SFF')
    .replace(/{{service_tag}}/g, 'ST-TEST123')
    .replace(/{{sale_date}}/g, new Date().toLocaleDateString('vi-VN'))
    .replace(/{{warranty_months}}/g, '12')
    .replace(/{{interval}}/g, '1');
  
  return sendZaloBotMessage({
    chatId,
    text: testMessage,
    parseMode: 'markdown',
    apiBaseUrl,
  });
}