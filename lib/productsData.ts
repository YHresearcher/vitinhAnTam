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
  originalPrice?: number;
  salePrice?: number;
  specs: {
    cpu: string;
    ram: string;
    storage: string;
    highlight: string;
    gift: string;
  };
  stockCount: number;
  modelStockCount?: number;
  modelName?: string;
  shelfLocation: string;
  qcStatus: string;
  burnInDuration: number;
  warrantyMonths: number;
  warrantyType?: 'months' | 'manufacturer';
  isSold?: boolean;
  addedAt?: string; // Ngày nhập kho (import_date) hoặc ngày tạo — để sắp xếp "mới nhất" ở trang chủ
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
    const getInvItemStock = (i: InventoryItem): number => {
      if (i.qc_status === 'sold' || i.qc_status === 'dealer_sold') return 0;
      if (typeof i.stock_quantity === 'number') return Math.max(0, i.stock_quantity);
      if (typeof i.quantity === 'number') return Math.max(0, i.quantity);
      return 1;
    };

    // Tính tổng số lượng máy đang tồn kho sẵn bán theo từng model máy
    const modelStockMap = new Map<string, number>();

    inventory.forEach((inv) => {
      if (inv.qc_status !== 'sold' && inv.qc_status !== 'dealer_sold') {
        const rawModel = (
          inv.device_model ||
          inv.model ||
          `${inv.brand || ''} ${inv.form_factor || ''}`.trim()
        )
          .toLowerCase()
          .replace(/\s+/g, ' ');
        if (rawModel) {
          const qty = getInvItemStock(inv);
          modelStockMap.set(rawModel, (modelStockMap.get(rawModel) || 0) + qty);
        }
      }
    });

    return inventory.map((item) => {
      const rawMatch = RAW_PRODUCTS.find((p) => p.serviceTag === item.service_tag);
      const en = rawMatch ? ENGLISH_PRODUCT_DETAILS[rawMatch.id] : null;
      const isSold = item.qc_status === 'sold' || item.qc_status === 'dealer_sold';
      const category: 'office' | 'laptop' | 'workstation' =
        item.form_factor === 'Laptop'
          ? 'laptop'
          : item.brand === 'Precision' || (item.device_model || '').includes('Precision') || item.form_factor === 'MT'
          ? 'workstation'
          : 'office';

      const specs = {
        cpu: item.cpu || item.specs?.cpu || 'Intel Core i5',
        ram: item.ram || item.specs?.ram || '16GB DDR4',
        storage: item.ssd_capacity || item.specs?.ssd || (isEn ? 'High-Speed NVMe SSD' : 'SSD NVMe Siêu Tốc'),
        highlight: item.specs_summary
          ? item.specs_summary
          : item.specs?.ssd_health
          ? `SSD Health ${item.specs.ssd_health}%`
          : isEn
          ? 'Whisper-quiet & cool, 100% factory-original motherboard'
          : 'Chạy êm mát, bo mạch zin 100%',
        gift: isEn
          ? 'Complimentary business keyboard & mouse bundle + mousepad'
          : (rawMatch?.vi.specs.gift || 'Tặng combo phím chuột & lót chuột mới'),
      };

      const defaultImg =
        item.image_urls && item.image_urls.length > 0
          ? item.image_urls[0]
          : rawMatch?.img ||
            'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80';

      const shelf = item.shelf_location
        ? isEn
          ? `Shelf ${item.shelf_location.replace(/^Kệ\s*/i, '')}`
          : item.shelf_location
        : isEn
        ? 'Shelf A1'
        : 'Kệ A1';

      const rawModel = item.device_model || item.model || `${item.brand || ''} ${item.form_factor || ''}`.trim();
      const normalizedModel = rawModel.toLowerCase().replace(/\s+/g, ' ');
      const rawItemQty = getInvItemStock(item);
      const modelStockCount = isSold ? 0 : (modelStockMap.get(normalizedModel) ?? rawItemQty);
      const stockCount = isSold ? 0 : rawItemQty;

      const rawOriginal = item.original_price || item.price || item.retail_price || 0;
      const rawSale = item.sale_price && item.sale_price > 0 ? item.sale_price : 0;
      const effectivePrice = rawSale > 0 ? rawSale : rawOriginal;

      return {
        id: item.id,
        serviceTag: item.service_tag,
        img: defaultImg,
        category,
        price: effectivePrice,
        originalPrice: rawOriginal,
        salePrice: rawSale,
        stockCount,
        modelStockCount,
        modelName: rawModel,
        shelfLocation: shelf,
        qcStatus: item.qc_status || 'ready_to_sell',
        burnInDuration: item.burn_in_duration || 60,
        warrantyMonths: item.warranty_months ?? 6,
        warrantyType: item.warranty_type ?? 'months',
        isSold,
        addedAt: item.import_date || item.created_at || undefined,
        customerName: item.customer_name,
        customerArea: item.customer_phone ? (isEn ? 'Tay Ninh Region' : 'Khu vực Tây Ninh') : undefined,
        handoverDate: item.handover_date,
        name: isEn && en ? en.name : (rawModel || `${item.brand} ${item.form_factor}`),
        badge: isEn
          ? en
            ? en.badge
            : category === 'laptop'
            ? 'GRADE-A CERTIFIED • CARBON CHASSIS'
            : 'FACTORY-ORIGINAL MOTHERBOARD'
          : (rawMatch?.vi.badge || 'BO MẠCH NGUYÊN BẢN'),
        subBadge: isEn
          ? en
            ? en.subBadge
            : '6-Month Full-System Warranty'
          : (rawMatch?.vi.subBadge || 'Bảo hành 6 tháng'),
        desc: isEn
          ? en
            ? en.desc
            : 'Meticulously inspected enterprise hardware, 100% stress-tested with FurMark & AIDA64 for quiet and cool operation.'
          : (rawMatch?.vi.desc || 'Máy tuyển chọn kỹ lưỡng, đã kiểm tra tải FurMark ổn định 100%.'),
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
