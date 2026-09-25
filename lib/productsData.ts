// lib/productsData.ts
// Dữ liệu sản phẩm tập trung dùng chung cho Trang Chủ và Trang Danh Mục Sản Phẩm (/danh-muc-san-pham)

import { ENGLISH_PRODUCT_DETAILS } from './translations';

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

export const RAW_PRODUCTS: RawProduct[] = [
  // --- 1. MÁY ĐANG SẴN TẠI SHOP (IN-STOCK) ---
  {
    id: 'p2',
    serviceTag: 'HP-400G5M',
    img: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80',
    category: 'office',
    price: 4350000,
    defaultStock: 5,
    shelfLocationVi: 'Kệ A1 - Tầng 2',
    shelfLocationEn: 'Cabinet Mini B2',
    qcStatus: 'ready_to_sell',
    burnInDuration: 30,
    isSold: false,
    vi: {
      name: 'HP ProDesk 400 G5 Mini (Siêu Nhỏ Gọn)',
      badge: 'TIẾT KIỆM ĐIỆN 65W',
      subBadge: 'Nhỏ như quyển sổ tay',
      desc: 'Gọn gàng trên bàn làm việc, tích hợp sẵn Wi-Fi + Bluetooth.',
      specs: {
        cpu: 'Core i5-8500T (Tiết kiệm điện, mát máy)',
        ram: 'RAM 8GB DDR4 (Hỗ trợ nâng lên 32GB)',
        storage: 'SSD M.2 NVMe 256GB Siêu Tốc (Mới BH 36T)',
        highlight: 'Có Wi-Fi AC + Bluetooth bắt sóng xa',
        gift: 'Tặng combo phím chuột văn phòng mới',
      },
    },
  },
  {
    id: 'p3',
    serviceTag: 'TP-994L2A',
    img: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
    category: 'laptop',
    price: 6850000,
    defaultStock: 3,
    shelfLocationVi: 'Kệ Laptop L1',
    shelfLocationEn: 'Laptop Display Area C',
    qcStatus: 'ready_to_sell',
    burnInDuration: 60,
    isSold: false,
    vi: {
      name: 'Lenovo ThinkPad T480s (Doanh Nhân Vỏ Carbon)',
      badge: 'CHUẨN ĐỘ BỀN QUÂN ĐỘI',
      subBadge: 'Pin 4-6h liên tục',
      desc: 'Khung magie siêu bền 1.3kg, bàn phím gõ êm số 1 thế giới.',
      specs: {
        cpu: 'Core i5-8350U vPro (Bảo mật phần cứng)',
        ram: 'RAM 16GB DDR4 2400MHz',
        storage: 'SSD NVMe 256GB Tốc độ cao (Mới BH 36T)',
        highlight: 'Màn hình 14.0 inch Full HD IPS chống chói',
        gift: 'Tặng túi chống sốc cao cấp + Chuột quang',
      },
    },
  },
  {
    id: 'p4',
    serviceTag: 'DL-7490A1',
    img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80',
    category: 'laptop',
    price: 5950000,
    defaultStock: 2,
    shelfLocationVi: 'Tủ bảo quản kỹ thuật D1',
    shelfLocationEn: 'Technical Storage D1',
    qcStatus: 'ready_to_sell',
    burnInDuration: 40,
    isSold: false,
    vi: {
      name: 'Dell Latitude 7490 Nhôm Nguyên Khối',
      badge: 'VIỀN MÀN HÌNH SIÊU MỎNG',
      subBadge: 'Nhẹ 1.4kg',
      desc: 'Vỏ hợp kim Carbon đen mờ sang trọng, mở rộng góc 180 độ.',
      specs: {
        cpu: 'Core i5-8350U (4 nhân 8 luồng upto 3.60GHz)',
        ram: 'RAM 8GB DDR4 (Lên 16GB +400k)',
        storage: 'SSD M.2 256GB (Khởi động máy 5 giây)',
        highlight: 'Bàn phím có đèn LED nền làm việc ban đêm',
        gift: 'Balo chống nước An Tâm + Sạc Oval zin',
      },
    },
  },
  {
    id: 'p5',
    serviceTag: 'WS-T3620',
    img: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&auto=format&fit=crop&q=80',
    category: 'workstation',
    price: 7850000,
    defaultStock: 1,
    shelfLocationVi: 'Khu vực kiểm tra kỹ thuật E',
    shelfLocationEn: 'Technical Inspection Area E',
    qcStatus: 'ready_to_sell',
    burnInDuration: 90,
    isSold: false,
    vi: {
      name: 'Dell Precision Tower 3620 Workstation',
      badge: 'ĐỒ HỌA CHUYÊN NGHIỆP',
      subBadge: 'Nguồn 80 Plus Gold',
      desc: 'Chuyên trị AutoCAD, Revit, SketchUp, Photoshop mượt mà.',
      specs: {
        cpu: 'Intel Xeon E3-1240 v5 / Core i7-6700',
        ram: 'RAM 16GB DDR4 ECC Tự Sửa Lỗi',
        storage: 'SSD 256GB + HDD 1TB Lưu Trữ Dữ Liệu Lớn',
        highlight: 'Card rời NVIDIA Quadro Render 24/24',
        gift: 'Cài đặt miễn phí bộ Adobe, CAD bản quyền ổn định',
      },
    },
  },
  {
    id: 'p6',
    serviceTag: 'DELL-3670-MT',
    img: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&auto=format&fit=crop&q=80',
    category: 'office',
    price: 7500000,
    defaultStock: 2,
    shelfLocationVi: 'Kệ Kiểm Thử C1',
    shelfLocationEn: 'Testing Rack C1',
    qcStatus: 'ready_to_sell',
    burnInDuration: 45,
    isSold: false,
    vi: {
      name: 'Dell Vostro 3670 MT (Core i7 Đa Nhiệm)',
      badge: 'HIỆU NĂNG CAO CẤP',
      subBadge: 'Thùng máy tản nhiệt êm',
      desc: 'Xử lý mượt mà tác vụ văn phòng nặng, xuất nhiều màn hình cùng lúc.',
      specs: {
        cpu: 'Core i7-8700 (6 nhân 12 luồng Turbo 4.6GHz)',
        ram: 'RAM 16GB DDR4 Kênh Đôi',
        storage: 'SSD 512GB NVMe Mới 100% (BH 36T)',
        highlight: 'Card đồ họa rời GTX 1050Ti 4GB GDDR5',
        gift: 'Combo phím chuột giả cơ + Lót chuột lớn',
      },
    },
  },
  {
    id: 'p7',
    serviceTag: 'NB-ASUS-2024',
    img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    category: 'laptop',
    price: 13500000,
    defaultStock: 1,
    shelfLocationVi: 'Kệ Laptop L2',
    shelfLocationEn: 'Laptop Rack L2',
    qcStatus: 'ready_to_sell',
    burnInDuration: 45,
    isSold: false,
    vi: {
      name: 'Asus Zenbook 14 OLED UX3402',
      badge: 'MÀN HÌNH 2.8K OLED 90HZ',
      subBadge: 'Siêu mỏng nhẹ 1.39kg',
      desc: 'Màn hình màu 100% DCI-P3 chuẩn điện ảnh, vỏ nhôm xanh sang trọng.',
      specs: {
        cpu: 'Core i5-1240P (12 nhân 16 luồng thế hệ mới)',
        ram: 'RAM 16GB LPDDR5 4800MHz Siêu Nhanh',
        storage: 'SSD 512GB PCIe 4.0 NVMe Tốc Độ Cao',
        highlight: 'Màn hình OLED 2.8K sắc nét bảo vệ mắt',
        gift: 'Bao da chính hãng + Chuột Bluetooth',
      },
    },
  },

  // --- 2. MÁY ĐÃ BÁN / ĐÃ BÀN GIAO THỰC TẾ (SOLD ARCHIVE) ---
  {
    id: 's1',
    serviceTag: 'ST-8F4K92X',
    img: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=800&auto=format&fit=crop&q=80',
    category: 'office',
    price: 4950000,
    defaultStock: 0,
    shelfLocationVi: 'Đã bàn giao khách hàng',
    shelfLocationEn: 'Delivered',
    qcStatus: 'sold',
    burnInDuration: 45,
    isSold: true,
    customerName: 'Cty TNHH Vận Tải Long An (Anh Tuấn)',
    customerArea: 'KCN Lợi Bình Nhơn, Tân An',
    handoverDate: '15/05/2025',
    vi: {
      name: 'Dell OptiPlex 7060 SFF Đồng Bộ',
      badge: 'ĐÃ BÀN GIAO TẬN NƠI',
      subBadge: 'Bảo hành chu đáo, đổi nhanh',
      desc: 'Đã hoàn tất bàn giao và lắp đặt mạng LAN cho bộ phận kế toán.',
      specs: {
        cpu: 'Core i5-8500 (6 nhân 6 luồng 4.10GHz)',
        ram: 'RAM 16GB DDR4 Bus 2666',
        storage: 'SSD NVMe 256GB Kingston Mới 100%',
        highlight: 'Hợp đồng bảo trì định kỳ 10 máy OptiPlex',
        gift: 'Kèm màn hình Dell 24" & bộ phím chuột đồng bộ',
      },
    },
  },
  {
    id: 's2',
    serviceTag: 'PC-GAMING-9921',
    img: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80',
    category: 'workstation',
    price: 16800000,
    defaultStock: 0,
    shelfLocationVi: 'Đã bàn giao khách hàng',
    shelfLocationEn: 'Delivered',
    qcStatus: 'sold',
    burnInDuration: 60,
    isSold: true,
    customerName: 'Chú Bảy Tân An (Nguyễn Văn Bảy)',
    customerArea: 'Số 15 Huỳnh Văn Nhất, P.3, Tân An',
    handoverDate: '20/04/2025',
    vi: {
      name: 'PC Gaming & Đồ Họa Core i5 13400F',
      badge: 'ĐÃ GIAO KHÁCH HÀNG',
      subBadge: 'Bảo hành 24 tháng',
      desc: 'Bộ PC dựng hình AutoCAD và render video cho văn phòng gia đình.',
      specs: {
        cpu: 'Core i5-13400F (10C/16T Turbo 4.6GHz)',
        ram: 'RAM 32GB DDR4 Bus 3200 Tản Thép',
        storage: 'SSD NVMe 512GB Kingston NV2 Gen4',
        highlight: 'Card rời RTX 3060 12GB GDDR6 Dual Fan',
        gift: 'Nguồn Xigmatek 650W 80 Plus + Vỏ case kính',
      },
    },
  },
  {
    id: 's3',
    serviceTag: 'HP-840G5-HQ',
    img: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80',
    category: 'laptop',
    price: 6200000,
    defaultStock: 0,
    shelfLocationVi: 'Đã bàn giao khách hàng',
    shelfLocationEn: 'Delivered',
    qcStatus: 'sold',
    burnInDuration: 45,
    isSold: true,
    customerName: 'Cty Thiết Kế Hoàng Quân (Anh Quân)',
    customerArea: 'Số 88 Hùng Vương, P.2, Tân An',
    handoverDate: '02/05/2025',
    vi: {
      name: 'HP EliteBook 840 G5 Vỏ Nhôm Bạc',
      badge: 'ĐÃ BÀN GIAO DOANH NGHIỆP',
      subBadge: 'Hóa đơn VAT đầy đủ',
      desc: 'Máy làm việc cơ động cho kỹ sư công trình, bàn phím gõ êm nhẹ.',
      specs: {
        cpu: 'Core i5-8250U (4 nhân 8 luồng)',
        ram: 'RAM 16GB DDR4 Kênh Đôi',
        storage: 'SSD 256GB M.2 NVMe Siêu Bền',
        highlight: 'Màn hình 14.0" Full HD IPS chống chói',
        gift: 'Dock chuyển đổi Type-C + Cặp da cao cấp',
      },
    },
  },
  {
    id: 's4',
    serviceTag: 'HP-400G4-POS',
    img: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80',
    category: 'office',
    price: 3450000,
    defaultStock: 0,
    shelfLocationVi: 'Đã bàn giao khách hàng',
    shelfLocationEn: 'Delivered',
    qcStatus: 'sold',
    burnInDuration: 30,
    isSold: true,
    customerName: 'Chị Lan - Tạp hoá Tân Tây',
    customerArea: 'Ngã 3 Thủ Thừa, Huyện Thủ Thừa',
    handoverDate: '18/05/2025',
    vi: {
      name: 'HP ProDesk 400 G4 Mini (Máy Tính Tiền POS)',
      badge: 'ĐÃ LẮP ĐẶT TẬN NƠI',
      subBadge: 'Cài sẵn KiotViet & MISA',
      desc: 'Hệ thống bán hàng chạy 24/7 ổn định, kích thước siêu nhỏ gọn.',
      specs: {
        cpu: 'Core i3-7100T (Tiết kiệm điện 35W)',
        ram: 'RAM 8GB DDR4 Bus 2400',
        storage: 'SSD 128GB NVMe + HDD 500GB',
        highlight: 'Lắp gọn sau lưng màn hình POS',
        gift: 'KTV hỗ trợ đấu nối máy in nhiệt & quét mã vạch',
      },
    },
  },
];

export function getShowcaseProducts(isEn: boolean, inventory: any[] = []): ShowcaseItem[] {
  return RAW_PRODUCTS.map((p) => {
    const en = ENGLISH_PRODUCT_DETAILS[p.id];
    const liveInv = inventory.find((i) => i.service_tag === p.serviceTag);
    const stockCount = p.isSold ? 0 : (liveInv?.quantity ?? p.defaultStock);
    const shelfLocation = isEn
      ? p.shelfLocationEn
      : (liveInv?.shelf_location || p.shelfLocationVi);

    return {
      id: p.id,
      serviceTag: p.serviceTag,
      img: p.img,
      category: p.category,
      price: p.price,
      stockCount,
      shelfLocation,
      qcStatus: p.qcStatus,
      burnInDuration: p.burnInDuration,
      isSold: p.isSold,
      customerName: p.customerName,
      customerArea: p.customerArea,
      handoverDate: p.handoverDate,
      name: isEn && en ? en.name : p.vi.name,
      badge: isEn && en ? en.badge : p.vi.badge,
      subBadge: isEn && en ? en.subBadge : p.vi.subBadge,
      desc: isEn && en ? en.desc : p.vi.desc,
      specs: isEn && en ? {
        cpu: en.cpu,
        ram: en.ram,
        storage: en.storage,
        highlight: en.highlight,
        gift: en.gift,
      } : p.vi.specs,
    };
  });
}
