'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useViTinhAnTamStore } from '@/lib/store';
import { TRANSLATIONS } from '@/lib/translations';
import { ShieldCheck, PhoneCall, ArrowUp, X, MessageCircle } from 'lucide-react';

export function FloatingContactWidget() {
  const { currentLang, systemSettings } = useViTinhAnTamStore();
  const [isZaloOpen, setIsZaloOpen] = useState(false);

  const isEn = currentLang === 'en';
  const t = TRANSLATIONS[currentLang || 'vi'];
  const hotline = systemSettings.hotline || '0909.053.058';
  const cleanHotline = hotline.replace(/\./g, '');

  const zaloList = (systemSettings.zaloContacts && systemSettings.zaloContacts.length > 0)
    ? systemSettings.zaloContacts
    : [
        { id: '1', name: 'Kỹ Thuật 1', phone: '0909053058', role: 'Tư vấn bán hàng' },
        { id: '2', name: 'Kỹ Thuật 2', phone: '0909053058', role: 'Hỗ trợ phần cứng' },
        { id: '3', name: 'Kỹ Thuật 3', phone: '0909053058', role: 'Cứu hộ khẩn cấp' },
      ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
      {/* 1. Tra cuu bao hanh */}
      <Link
        href="/tra-cuu-bao-hanh"
        className="pointer-events-auto w-12 h-12 rounded-full bg-white hover:bg-[#FAF7F2] text-[#C0392B] border-2 border-[#C0392B] shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 group relative"
        title={t.floating.warrantyTooltip}
      >
        <ShieldCheck className="w-5 h-5 text-[#C0392B]" strokeWidth={1.5} />
        <span className="opacity-0 group-hover:opacity-100 pointer-events-none transition-all absolute right-14 px-3 py-1.5 rounded-lg bg-[#2B1810] text-white text-xs font-semibold whitespace-nowrap shadow-xl">
          {t.floating.warrantyTooltip}
        </span>
      </Link>

      {/* 2. Hotline */}
      <a
        href={`tel:${cleanHotline}`}
        className="pointer-events-auto w-12 h-12 rounded-full bg-[#D9531E] hover:bg-[#C0392B] text-white shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 group relative"
        title={`Hotline: ${hotline}`}
      >
        <PhoneCall className="w-5 h-5" strokeWidth={1.5} />
        <span className="opacity-0 group-hover:opacity-100 pointer-events-none transition-all absolute right-14 px-3 py-1.5 rounded-lg bg-[#2B1810] text-white text-xs font-semibold whitespace-nowrap shadow-xl">
          Hotline: {hotline} (24/7)
        </span>
      </a>

      {/* 3. Zalo */}
      <div className="relative pointer-events-auto">
        <button
          type="button"
          onClick={() => setIsZaloOpen(!isZaloOpen)}
          className="w-12 h-12 rounded-full bg-[#0068FF] hover:bg-[#0054d1] text-white shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 group relative font-bold text-xs cursor-pointer"
          title="Zalo Kỹ thuật"
        >
          <span className="font-sans font-black">Zalo</span>
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#C0392B] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {zaloList.length}
          </span>
          <span className="opacity-0 group-hover:opacity-100 pointer-events-none transition-all absolute right-14 px-3 py-1.5 rounded-lg bg-[#2B1810] text-white text-xs font-semibold whitespace-nowrap shadow-xl">
            {isEn ? `${zaloList.length} Tech Hotlines` : `${zaloList.length} Số Zalo Kỹ Thuật`}
          </span>
        </button>

        {isZaloOpen && (
          <div className="absolute right-0 bottom-14 w-72 sm:w-80 p-4 rounded-2xl bg-white border border-[#E8E2D9] shadow-2xl space-y-3 z-50">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase">
                {isEn ? 'Support Technicians' : 'Chọn Kỹ Thuật Viên Hỗ Trợ'}
              </span>
              <button
                type="button"
                onClick={() => setIsZaloOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {zaloList.map((contact) => (
                <a
                  key={contact.id}
                  href={`https://zalo.me/${contact.phone.replace(/\./g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 flex items-center justify-between group/z"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-800 group-hover/z:text-[#0068FF]">
                      {contact.name} <span className="text-[10px] text-slate-400">({contact.phone})</span>
                    </div>
                    <div className="text-[10px] text-[#6E5D53] line-clamp-1">{contact.role}</div>
                  </div>
                  <span className="px-2 py-1 rounded bg-[#0068FF] text-white text-[10px] font-bold">Nhắn</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. WhatsApp */}
      <a
        href={systemSettings.whatsappLink || 'https://wa.me/84909053058'}
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 group relative"
        title="WhatsApp"
      >
        <MessageCircle className="w-5 h-5 text-white" />
        <span className="opacity-0 group-hover:opacity-100 pointer-events-none transition-all absolute right-14 px-3 py-1.5 rounded-lg bg-[#2B1810] text-white text-xs font-semibold whitespace-nowrap shadow-xl">
          WhatsApp: {systemSettings.whatsappNumber || '0909053058'}
        </span>
      </a>

      {/* 5. Scroll to Top */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="pointer-events-auto w-10 h-10 rounded-full bg-white hover:bg-[#FAF7F2] text-[#6E5D53] hover:text-[#2B1810] border border-[#E8E2D9] shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
        title={t.floating.backToTop}
      >
        <ArrowUp className="w-4 h-4 text-[#2B1810]" strokeWidth={1.5} />
      </button>
    </div>
  );
}
