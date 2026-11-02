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
  const cw = systemSettings.contactWidget;
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
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2.5 sm:gap-3 pointer-events-none">
      {/* 1. Tra cuu bao hanh (Hien tren desktop, an tren mobile de tranh chiem man hinh) */}
      {cw?.showWarranty !== false && (
        <Link
          href="/tra-cuu-bao-hanh"
          aria-label={t.floating.warrantyTooltip || 'Tra cứu bảo hành'}
          className="pointer-events-auto hidden sm:flex w-12 h-12 rounded-full bg-white hover:bg-[#FAF7F2] text-[#C0392B] border-2 border-[#C0392B] shadow-lg items-center justify-center transition-all hover:scale-110 active:scale-95 group relative"
          title={t.floating.warrantyTooltip}
        >
          <ShieldCheck className="w-5 h-5 text-[#C0392B]" strokeWidth={1.5} />
          <span className="opacity-0 group-hover:opacity-100 pointer-events-none transition-all absolute right-14 px-3 py-1.5 rounded-lg bg-[#2B1810] text-white text-xs font-semibold whitespace-nowrap shadow-xl">
            {t.floating.warrantyTooltip}
          </span>
        </Link>
      )}

      {/* 2. Hotline (Luon hien tren ca mobile & desktop) */}
      {cw?.showHotline !== false && (
        <a
          href={`tel:${cleanHotline}`}
          aria-label={`Gọi Hotline ${hotline}`}
          className="pointer-events-auto w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#D9531E] hover:bg-[#C0392B] text-white shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 group relative"
          title={`Hotline: ${hotline}`}
        >
          <PhoneCall className="w-5 h-5" strokeWidth={1.5} />
          <span className="opacity-0 group-hover:opacity-100 pointer-events-none transition-all absolute right-14 px-3 py-1.5 rounded-lg bg-[#2B1810] text-white text-xs font-semibold whitespace-nowrap shadow-xl">
            Hotline: {hotline} (24/7)
          </span>
        </a>
      )}

      {/* 3. Zalo (Kenh lien he chinh, tinh gon tren mobile) */}
      {cw?.showZalo !== false && (
        <div className="relative pointer-events-auto">
          <button
            type="button"
            onClick={() => setIsZaloOpen(!isZaloOpen)}
            aria-label="Tư vấn nhanh qua Zalo kỹ thuật"
            aria-expanded={isZaloOpen}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#0068FF] hover:bg-[#0054d1] text-white shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 group relative font-bold text-xs cursor-pointer"
            title="Zalo Kỹ thuật"
          >
            <span className="font-sans font-black">Zalo</span>
            {/* Cham xanh online thay vi badge do gay ap luc */}
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
            <span className="opacity-0 group-hover:opacity-100 pointer-events-none transition-all absolute right-14 px-3 py-1.5 rounded-lg bg-[#2B1810] text-white text-xs font-semibold whitespace-nowrap shadow-xl">
              {isEn ? `${zaloList.length} Tech Hotlines` : `${zaloList.length} Số Zalo Kỹ Thuật`}
            </span>
          </button>

          {isZaloOpen && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label={isEn ? 'Support Technicians' : 'Chọn Kỹ Thuật Viên Hỗ Trợ'}
              className="absolute right-0 bottom-14 w-72 sm:w-80 p-4 rounded-2xl bg-white border border-[#E8E2D9] shadow-2xl space-y-3 z-50 animate-fade-in"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 uppercase">
                  {isEn ? 'Support Technicians' : 'Chọn Kỹ Thuật Viên Hỗ Trợ'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsZaloOpen(false)}
                  aria-label={isEn ? 'Close' : 'Đóng'}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer rounded-lg hover:bg-slate-100"
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
                      <div className="text-[10px] text-[#6E5D53] line-clamp-1">
                        {isEn
                          ? contact.role === 'Tư vấn bán hàng'
                            ? 'Sales & Consultation'
                            : contact.role === 'Hỗ trợ phần cứng'
                            ? 'Hardware Support'
                            : contact.role === 'Cứu hộ khẩn cấp'
                            ? 'Emergency Dispatch'
                            : contact.role === 'Hỗ trợ tiếng Anh'
                            ? 'English Support'
                            : contact.role && contact.role.includes('English')
                            ? contact.role
                            : contact.role
                          : contact.role}
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded bg-[#0068FF] text-white text-[10px] font-bold">
                      {isEn ? 'Chat' : 'Nhắn'}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. WhatsApp (Hien tren desktop neu co bat, an tren mobile de tiet kiem khong gian) */}
      {cw?.showWhatsapp !== false && (
        <a
          href={systemSettings.whatsappLink || 'https://wa.me/84909053058'}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Liên hệ qua WhatsApp"
          className="pointer-events-auto hidden sm:flex w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-lg items-center justify-center transition-all hover:scale-110 active:scale-95 group relative"
          title="WhatsApp"
        >
          <MessageCircle className="w-5 h-5 text-white" />
          <span className="opacity-0 group-hover:opacity-100 pointer-events-none transition-all absolute right-14 px-3 py-1.5 rounded-lg bg-[#2B1810] text-white text-xs font-semibold whitespace-nowrap shadow-xl">
            WhatsApp: {systemSettings.whatsappNumber || '0909053058'}
          </span>
        </a>
      )}

      {/* 5. Scroll to Top */}
      {cw?.showBackToTop !== false && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label={t.floating.backToTop || 'Cuộn lên đầu trang'}
          className="pointer-events-auto w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-[#FAF7F2] text-[#6E5D53] hover:text-[#2B1810] border border-[#E8E2D9] shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
          title={t.floating.backToTop}
        >
          <ArrowUp className="w-4 h-4 text-[#2B1810]" strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
}
