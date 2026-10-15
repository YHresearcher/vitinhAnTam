'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatVND } from '@/lib/supabase';
import {
  CheckCircle,
  Cpu,
  HardDrive,
  Zap,
  Gift,
  Monitor,
  ArrowRight,
  ScanLine,
} from 'lucide-react';
import { useViTinhAnTamStore } from '@/lib/store';
import { TRANSLATIONS } from '@/lib/translations';
import { getShowcaseProducts } from '@/lib/productsData';

interface HardwareSectionProps {
  isEn: boolean;
  t: any;
  featuredProducts: any[];
  setSelectedProduct: (value: any) => void;
}

export default function HardwareSection({
  isEn,
  t,
  featuredProducts,
  setSelectedProduct
}: HardwareSectionProps) {
  const { inventory } = useViTinhAnTamStore();

  // Helper tính tổng số lượng tồn kho thực tế cho dòng/model máy này
  const getModelStockCount = (prod: any): number => {
    if (typeof prod.modelStockCount === 'number') {
      return prod.modelStockCount;
    }
    if (!inventory || inventory.length === 0) {
      return Math.max(0, Number(prod.stockCount) || 0);
    }
    const targetModel = (prod.modelName || prod.name || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const matchingItems = inventory.filter((item) => {
      if (item.qc_status === 'sold') return false;
      const m = (item.device_model || item.model || `${item.brand || ''} ${item.form_factor || ''}`.trim()).toLowerCase().replace(/\s+/g, ' ');
      return m === targetModel || (targetModel && m.includes(targetModel)) || (m && targetModel.includes(m));
    });
    if (matchingItems.length === 0) {
      return Math.max(0, Number(prod.stockCount) || 0);
    }
    return matchingItems.reduce(
      (sum, item) => {
        const qty = typeof item.stock_quantity === 'number'
          ? Math.max(0, item.stock_quantity)
          : typeof item.quantity === 'number'
          ? Math.max(0, item.quantity)
          : 1;
        return sum + qty;
      },
      0
    );
  };

  // Ẩn tất cả các model máy có số lượng tồn kho = 0 khỏi danh sách hàng hóa
  const availableProducts = featuredProducts.filter((prod) => getModelStockCount(prod) > 0);

  if (availableProducts.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-2xl bg-white border border-dashed border-slate-200">
        <Monitor className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-600">
          {isEn ? 'Hardware inventory is currently being updated.' : 'Kho máy tính đang được cập nhật thiết bị mới từ hệ thống.'}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          {isEn ? 'Please contact our hotline or Zalo for instant consultation.' : 'Quý khách vui lòng liên hệ Hotline/Zalo để được tư vấn cấu hình phù hợp.'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableProducts.map((prod) => {
            const stockCount = getModelStockCount(prod);

            return (
              <div
                key={prod.id}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Image & Stock Badge */}
                <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
                  <Image
                    src={prod.img}
                    alt={prod.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {/* Bỏ các badge phía trên, thay bằng số lượng model máy tồn kho hiện tại */}
                  <div className="absolute top-3 left-3 flex items-center">
                    {stockCount > 0 ? (
                      <span className="px-2.5 py-1 rounded-md bg-emerald-700/95 backdrop-blur-xs text-white text-[11px] font-bold tracking-tight shadow-xs flex items-center gap-1.5 border border-emerald-600/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                        <span>
                          {isEn
                            ? `In Stock: ${stockCount} ${stockCount > 1 ? 'units' : 'unit'}`
                            : `Tồn kho: ${stockCount} máy`}
                        </span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md bg-slate-800/90 backdrop-blur-xs text-white text-[11px] font-semibold tracking-tight shadow-xs flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        <span>{isEn ? 'Out of Stock' : 'Tạm hết hàng'}</span>
                      </span>
                    )}
                  </div>
                </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-[#C0392B] transition-colors">
                    {prod.name}
                  </h3>
                  <div className="text-2xl font-black text-[#C0392B] font-mono tracking-tight mt-1">
                    {formatVND(prod.price)}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                    {prod.desc}
                  </p>

                  {/* Specs Grid */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate font-mono">{prod.specs.cpu}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate font-mono">{prod.specs.ram}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate font-mono">{prod.specs.storage}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-0.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate font-medium text-emerald-800">{prod.specs.highlight}</span>
                    </div>
                  </div>

                  {/* Gift badge */}
                  {prod.specs.gift && (
                    <div className="mt-3.5 p-2 rounded-lg bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">{prod.specs.gift}</span>
                    </div>
                  )}
                </div>

                {/* Actions: Thông tin thiết bị & Đặt Mua Máy */}
                <div className="pt-3 flex items-center gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(prod)}
                    className="flex-1 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <ScanLine className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t.products.btnInspect}</span>
                  </button>
                  <Link
                    href={`/mua-hang?device=${encodeURIComponent(prod.name)}&price=${prod.price}&tag=${encodeURIComponent(prod.serviceTag || '')}`}
                    className="flex-1 py-2.5 rounded-lg bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-xs text-center transition-colors shadow-2xs flex items-center justify-center gap-1"
                  >
                    <span>{t.products.btnOrder}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </>
  );
}
