// lib/productsData.ts
// Dữ liệu sản phẩm tập trung dùng chung cho Trang Chủ và Trang Danh Mục Sản Phẩm (/danh-muc-san-pham)

import { ENGLISH_PRODUCT_DETAILS } from './translations';
import type { InventoryItem } from './supabase';

export interface ShowcaseItem {
  id: string;
  name: string;
  serviceTag: string;
  img: string;
  category: 'office' | 'laptop' | 'workstation';
  badge: string;
  subBadge: string;
  desc: string;
  price: number;
  specs: {
    cpu: string;
    ram: string;
    storage: string;
    highlight: string;
    gift: string;
  };
  stockCount: number;
  shelfLocation: string;
  qcStatus: string;
  burnInDuration: number;
  isSold?: boolean;
  customerName?: string;
  customerArea?: string;
  handoverDate?: string;
}

export interface RawProduct {
  id: string;
  serviceTag: string;
  img: string;
  category: 'office' | 'laptop' | 'workstation';
  price: number;
  defaultStock: number;
  shelfLocationVi: string;
  shelfLocationEn: string;
  qcStatus: string;
  burnInDuration: number;
  isSold: boolean;
  customerName?: string;
  customerArea?: string;
  handoverDate?: string;
  vi: {
    name: string;
    badge: string;
    subBadge: string;
    desc: string;
    specs: {
      cpu: string;
      ram: string;
      storage: string;
      highlight: string;
      gift: string;
    };
  };
}

export const RAW_PRODUCTS: RawProduct[] = [];

export function getShowcaseProducts(isEn: boolean, inventory: InventoryItem[] = []): ShowcaseItem[] {
  if (inventory && inventory.length > 0) {
    return inventory.map((item) => {
      const rawMatch = RAW_PRODUCTS.find((p) => p.serviceTag === item.service_tag);
      const en = rawMatch ? ENGLISH_PRODUCT_DETAILS[rawMatch.id] : null;
      const isSold = item.qc_status === 'sold';
      const category: 'office' | 'laptop' | 'workstation' =
        item.form_factor === 'Laptop'
          ? 'laptop'
          : item.brand === 'Precision' || (item.device_model || '').includes('Precision') || item.form_factor === 'MT'
          ? 'workstation'
          : 'office';

      const specs = {
        cpu: item.cpu || item.specs?.cpu || 'Intel Core i5',
        ram: item.ram || item.specs?.ram || '16GB DDR4',
        storage: item.ssd_capacity || item.specs?.ssd || 'SSD NVMe Siêu Tốc',
        highlight: item.specs_summary || (item.specs?.ssd_health ? `SSD Health ${item.specs.ssd_health}%` : 'Chạy êm mát, bo mạch zin 100%'),
        gift: rawMatch?.vi.specs.gift || 'Tặng combo phím chuột & lót chuột mới',
      };

      const defaultImg =
        item.image_urls && item.image_urls.length > 0
          ? item.image_urls[0]
          : rawMatch?.img ||
            'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80';

      return {
        id: item.id,
        serviceTag: item.service_tag,
        img: defaultImg,
        category,
        price: item.retail_price || item.price || 0,
        stockCount: isSold ? 0 : (item.stock_quantity ?? item.quantity ?? 1),
        shelfLocation: item.shelf_location || 'Kệ A1',
        qcStatus: item.qc_status || 'ready_to_sell',
        burnInDuration: item.burn_in_duration || 60,
        isSold,
        customerName: item.customer_name,
        customerArea: item.customer_phone ? 'Khu vực Tây Ninh' : undefined,
        handoverDate: item.handover_date,
        name: isEn && en ? en.name : (item.device_model || item.model || `${item.brand} ${item.form_factor}`),
        badge: isEn && en ? en.badge : (rawMatch?.vi.badge || 'BO MẠCH NGUYÊN BẢN'),
        subBadge: isEn && en ? en.subBadge : (rawMatch?.vi.subBadge || 'Bảo hành 12 tháng'),
        desc: isEn && en ? en.desc : (rawMatch?.vi.desc || 'Máy tuyển chọn kỹ lưỡng, đã kiểm tra tải FurMark ổn định 100%.'),
        specs: isEn && en ? {
          cpu: en.cpu,
          ram: en.ram,
          storage: en.storage,
          highlight: en.highlight,
          gift: en.gift,
        } : specs,
      };
    });
  }

  // Không trả về dữ liệu mock nếu kho Supabase trống
  return [];
}
