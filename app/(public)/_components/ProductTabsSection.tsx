'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useViTinhAnTamStore } from '@/lib/store';
import { getShowcaseProducts } from '@/lib/productsData';
import { formatVND } from '@/lib/supabase';
import { TRANSLATIONS } from '@/lib/translations';
import HardwareSection from './HardwareSection';
import ComponentsSection from './ComponentsSection';
import SoftwareSection from './SoftwareSection';

interface ProductTabsSectionProps {
  isEn: boolean;
  t: any;
}

export default function ProductTabsSection({ isEn, t }: ProductTabsSectionProps) {
  const { inventory, keyCategories, licenseKeys, spareParts, systemSettings } = useViTinhAnTamStore();
  const [homeProductTab, setHomeProductTab] = useState<'all' | 'hardware' | 'components' | 'software'>('all');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Lấy dữ liệu sản phẩm (Memoized để tăng tốc độ phản hồi UI)
  const allProducts = useMemo(() => getShowcaseProducts(isEn, inventory), [isEn, inventory]);
  const inStockProducts = useMemo(() => allProducts.filter((p) => !p.isSold), [allProducts]);

  // YÊU CẦU 1: Trang chủ chỉ lấy đúng 3 sản phẩm nổi bật đang sẵn kho
  const featuredProducts = useMemo(() => inStockProducts.slice(0, 3), [inStockProducts]);

  // 3 sản phẩm RAM & SSD ngẫu nhiên / sẵn kho từ kho linh kiện (spareParts)
  const featuredComponents = useMemo(() => {
    const list = (spareParts || []).filter((p) => {
      const type = (p.part_type || '').toUpperCase();
      const name = (p.part_name || '').toUpperCase();
      return (
        type === 'RAM' ||
        type === 'SSD' ||
        name.includes('RAM') ||
        name.includes('SSD') ||
        name.includes('NVME')
      );
    });

    if (list.length === 0) return [];

    // Chọn phong phú cả SSD và RAM, lấy đúng 3 sản phẩm
    const ssds = list.filter((p) => (p.part_type || '').toUpperCase() === 'SSD' || (p.part_name || '').toUpperCase().includes('SSD'));
    const rams = list.filter((p) => (p.part_type || '').toUpperCase() === 'RAM' || (p.part_name || '').toUpperCase().includes('RAM'));

    const picked: typeof list = [];
    if (ssds.length > 0) picked.push(ssds[0]);
    if (rams.length > 0) picked.push(rams[0]);
    if (ssds.length > 1 && picked.length < 3) picked.push(ssds[1]);
    if (rams.length > 1 && picked.length < 3) picked.push(rams[1]);

    for (const item of list) {
      if (picked.length >= 3) break;
      if (!picked.some((x) => x.id === item.id)) {
        picked.push(item);
      }
    }
    return picked.slice(0, 3);
  }, [spareParts]);

  // Software products available in stock
  const availableSoftwareCategories = useMemo(() => {
    return (keyCategories || [])
      .map((cat) => {
        const keys = (licenseKeys || []).filter(
          (k) => k.category_id === cat.id && k.status === 'available'
        );
        return {
          ...cat,
          availableStock: keys.length,
          price: keys[0]?.unit_price || (cat.type === 'office' ? 450000 : 350000),
        };
      })
      .filter((cat) => cat.availableStock > 0);
  }, [keyCategories, licenseKeys]);

  return (
    <>
      {/* 1. MÁY TÍNH ĐỒNG BỘ & LAPTOP DOANH NGHIỆP */}
      {(homeProductTab === 'all' || homeProductTab === 'hardware') && (
        <HardwareSection
          isEn={isEn}
          t={t}
          featuredProducts={featuredProducts}
          setSelectedProduct={setSelectedProduct}
        />
      )}

      {/* 1.5. LINH KIỆN NÂNG CẤP (RAM, SSD CHÍNH HÃNG TRONG KHO HÀNG) */}
      {(homeProductTab === 'all' || homeProductTab === 'components') && (
        <ComponentsSection
          isEn={isEn}
          t={t}
          featuredComponents={featuredComponents}
          systemSettings={systemSettings}
        />
      )}

      {/* 2. PHẦN MỀM & KEY BẢN QUYỀN WINDOWS / OFFICE */}
      {(homeProductTab === 'all' || homeProductTab === 'software') && (
        <SoftwareSection
          isEn={isEn}
          t={t}
          availableSoftwareCategories={availableSoftwareCategories}
          systemSettings={systemSettings}
        />
      )}

      {/* Nút Xem Toàn Bộ Kho Hàng (chỉ hiển thị khi không trong tab software) */}
      {(homeProductTab === 'all' || homeProductTab === 'hardware' || homeProductTab === 'components') && (
        <div className="pt-2 pb-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/danh-muc-san-pham"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-sm sm:text-base tracking-wide shadow-lg shadow-[#C0392B]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 group text-center cursor-pointer"
          >
            <span>
              {isEn ? 'View Entire Inventory' : 'Xem toàn bộ kho hàng'}
            </span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
          </a>
        </div>
      )}
    </>
  );
}