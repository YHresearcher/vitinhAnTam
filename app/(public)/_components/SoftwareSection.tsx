'use client';

import React from 'react';
import Link from 'next/link';
import { formatVND } from '@/lib/supabase';
import {
  CheckCircle,
  Clock,
} from 'lucide-react';
import { useViTinhAnTamStore } from '@/lib/store';
import { TRANSLATIONS } from '@/lib/translations';

interface SoftwareSectionProps {
  isEn: boolean;
  t: any;
  availableSoftwareCategories: any[];
  systemSettings: any;
}

export default function SoftwareSection({
  isEn,
  t,
  availableSoftwareCategories,
  systemSettings
}: SoftwareSectionProps) {
  if (availableSoftwareCategories.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl bg-white border border-[#E8E2D9] text-xs text-[#6E5D53]">
        {isEn ? 'License keys are temporarily being replenished.' : 'Các phiên bản key bản quyền đang được cập nhật thêm vào kho.'}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 mb-8 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#C0392B]"></div>
            <h3 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
              {isEn ? 'GENUINE DIGITAL LICENSE KEYS (LIFETIME ON MOTHERBOARD)' : 'KEY BẢN QUYỀN SỐ CHÍNH HÃNG (VĨNH VIỄN THEO MAINBOARD)'}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => { /* setHomeProductTab('software') - handled by parent */ }}
            className="text-xs font-bold text-[#C0392B] hover:underline uppercase cursor-pointer"
          >
            {isEn ? 'All License Keys →' : 'Xem toàn bộ kho key →'}
          </button>
        </div>

        {availableSoftwareCategories.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-white border border-[#E8E2D9] text-xs text-[#6E5D53]">
            {isEn ? 'License keys are temporarily being replenished.' : 'Các phiên bản key bản quyền đang được cập nhật thêm vào kho.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableSoftwareCategories.map((cat) => (
              <div
                key={cat.id}
                className="group bg-white rounded-2xl border border-[#E8E2D9] hover:border-[#C0392B] shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden p-6"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#FBE8DE] text-[#C0392B]">
                      {cat.type === 'office' ? (isEn ? 'OFFICE SUITE' : 'ỨNG DỤNG VĂN PHÒNG') : (isEn ? 'OPERATING SYSTEM' : 'HỆ ĐIỀU HÀNH')}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>{isEn ? `${cat.availableStock} licenses available` : `Còn ${cat.availableStock} key`}</span>
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-black text-[#2B1810] group-hover:text-[#C0392B] transition-colors uppercase">
                      {cat.name}
                    </h4>
                    <div className="text-2xl font-black text-[#C0392B] font-mono tracking-tight mt-1">
                      {formatVND(cat.price)}
                    </div>
                    <p className="text-xs text-[#6E5D53] mt-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-[#6E5D53]">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{isEn ? 'Lifetime motherboard digital entitlement, never expires' : 'Kích hoạt vĩnh viễn theo máy, không hết hạn'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{isEn ? 'Official Microsoft security updates & genuine patches' : 'Cập nhật Windows / Office Update chính hãng'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{isEn ? 'Remote activation & installation support included' : 'Hỗ trợ cài đặt từ xa qua UltraViewer / AnyDesk'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center gap-2">
                  <Link
                    href={`/mua-hang?device=${encodeURIComponent(cat.name)}&price=${cat.price}&tag=${encodeURIComponent(cat.type || 'KEY')}`}
                    className="flex-1 py-2.5 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-xs transition-colors shadow-2xs text-center uppercase tracking-wider block"
                  >
                    {isEn ? 'BUY LICENSE DIRECTLY' : 'MUA KEY TRỰC TIẾP'}
                  </Link>
                  <a
                    href={`https://zalo.me/${systemSettings.zaloNumber || '0909053058'}?text=${encodeURIComponent(isEn ? `Hello Vi Tinh An Tam, I need consultation on license: ${cat.name}` : `Chào Vi Tính An Tâm, tôi cần tư vấn key bản quyền: ${cat.name}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3.5 rounded-xl border border-[#E8E2D9] hover:bg-slate-50 text-[#2B1810] font-semibold text-xs transition-colors"
                  >
                    {isEn ? 'Chat Zalo' : 'Zalo'}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}