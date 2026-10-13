'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatVND } from '@/lib/supabase';
import {
  CheckCircle,
  ShieldCheck,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import { useViTinhAnTamStore } from '@/lib/store';
import { TRANSLATIONS } from '@/lib/translations';

interface ComponentsSectionProps {
  isEn: boolean;
  t: any;
  featuredComponents: any[];
  systemSettings: any;
}

export default function ComponentsSection({
  isEn,
  t,
  featuredComponents,
  systemSettings
}: ComponentsSectionProps) {
  const getPartImage = (part: { part_type?: string; part_name?: string }) => {
    const type = (part.part_type || '').toUpperCase();
    const name = (part.part_name || '').toUpperCase();
    if (type === 'SSD' || name.includes('SSD') || name.includes('NVME')) {
      return 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=80';
    }
    if (type === 'RAM' || name.includes('RAM') || name.includes('DDR')) {
      return 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=600&auto=format&fit=crop&q=80';
    }
    return 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80';
  };

  if (featuredComponents.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl bg-white border border-[#E8E2D9] text-xs text-[#6E5D53]">
        {isEn ? 'Components are currently being replenished.' : 'Kho linh kiện RAM & SSD đang được cập nhật thêm.'}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 mb-10 pt-2 border-t border-slate-200">
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#C0392B]"></div>
            <h3 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
              {isEn ? 'GENUINE UPGRADE COMPONENTS (RAM, HIGH-SPEED SSD)' : 'LINH KIỆN NÂNG CẤP CHÍNH HÃNG (RAM, SSD CHUYÊN DỤNG)'}
            </h3>
          </div>
          <Link
            href="/danh-muc-san-pham?tab=components"
            className="text-xs font-bold text-[#C0392B] hover:underline uppercase cursor-pointer flex items-center gap-1"
          >
            <span>{isEn ? 'All components →' : 'Xem toàn bộ linh kiện →'}</span>
          </Link>
        </div>

        {featuredComponents.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-white border border-[#E8E2D9] text-xs text-[#6E5D53]">
            {isEn ? 'Components are currently being replenished.' : 'Kho linh kiện RAM & SSD đang được cập nhật thêm.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredComponents.map((part) => (
              <div
                key={part.id}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-[#C0392B] shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Image & Badges */}
                <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
                  <Image
                    src={getPartImage(part)}
                    alt={part.part_name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[85%]">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-700 text-white text-[11px] font-bold tracking-tight shadow-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                      <span>{isEn ? `IN STOCK (${part.quantity_in_stock})` : `SẴN KHO (${part.quantity_in_stock})`}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#2B1810]/90 backdrop-blur-xs text-white text-[10px] font-semibold">
                      {part.warranty_months ? `BH ${part.warranty_months}T` : 'CHÍNH HÃNG'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#FBE8DE] text-[#C0392B]">
                        {part.part_type || 'LINH KIỆN'}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {part.condition === 'new' ? 'Mới 100% Chính Hãng' : 'Zin bóc máy'}
                      </span>
                    </span>
                    <h3 className="text-base font-bold text-slate-900 line-clamp-2 group-hover:text-[#C0392B] transition-colors leading-snug">
                      {part.part_name}
                    </h3>
                    <div className="text-2xl font-black text-[#C0392B] font-mono tracking-tight mt-1.5">
                      {formatVND(part.unit_price)}
                    </div>
                    {part.notes && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                        {part.notes}
                      </p>
                    )}

                    {/* Quick spec info */}
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{isEn ? 'Warranty:' : 'Bảo hành:'} <strong>{part.warranty_months ? `${part.warranty_months} tháng (1 đổi 1)` : 'Chính hãng'}</strong></span>
                      </div>
                      {part.distributor && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{isEn ? 'Distributor:' : 'Phân phối:'} {part.distributor}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 flex items-center gap-2 border-t border-slate-100">
                    <Link
                      href="https://zalo.me/0961803623"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                      <span>{isEn ? 'Consult' : 'Tư vấn'}</span>
                    </Link>
                    <Link
                      href={`/mua-hang?device=${encodeURIComponent(part.part_name)}&price=${part.unit_price}&tag=${encodeURIComponent(part.id)}`}
                      className="flex-1 py-2.5 rounded-lg bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-xs text-center transition-colors shadow-2xs flex items-center justify-center gap-1"
                    >
                      <span>{t.products.btnOrder}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nút Xem Toàn Bộ Kho Hàng */}
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
    </>
  );
}