'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useViTinhAnTamStore } from '@/lib/store';
import type { Branch } from '@/lib/store';
import { TRANSLATIONS } from '@/lib/translations';
import { ShieldCheck, PhoneCall, ArrowUp, X, MessageCircle, MapPin } from 'lucide-react';

// Số điện thoại -> link wa.me (84 + số không có 0 đầu).
function waLink(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const intl = digits.startsWith('84')
    ? digits
    : digits.startsWith('0')
    ? `84${digits.slice(1)}`
    : digits;
  return `https://wa.me/${intl}`;
}

// Chi nhánh hiển thị được: có tên hoặc địa chỉ (bỏ dòng trống cả hai).
function displayBranches(all: Branch[] | undefined): Branch[] {
  return (all ?? []).filter(
    (b) => (b.name || '').trim() !== '' || (b.address || '').trim() !== ''
  );
}

type Channel = 'zalo' | 'whatsapp' | 'email';

// Một mục "Phương thức liên hệ" duy nhất: chọn kênh TRƯỚC (Zalo / WhatsApp /
// Email), rồi chọn chi nhánh; số Zalo/WhatsApp/Email dùng chung cho mọi chi
// nhánh nên không nằm theo từng chi nhánh.
export function FloatingContactWidget() {
  const { currentLang, systemSettings } = useViTinhAnTamStore();
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [channel, setChannel] = useState<Channel>('zalo');
  const [branchId, setBranchId] = useState<string | null>(null);

  const isEn = currentLang === 'en';
  const t = TRANSLATIONS[currentLang || 'vi'];
  const cw = systemSettings.contactWidget;
  const hotline = systemSettings.hotline || '0909.053.058';
  const cleanHotline = hotline.replace(/\./g, '');

  const showZalo = cw?.showZalo !== false;
  const showWhatsapp = cw?.showWhatsapp !== false;

  // Kênh khả dụng: Zalo/WhatsApp theo công tắc Cài đặt, Email luôn có.
  const channelOptions: Array<{ key: Channel; label: string }> = [
    ...(showZalo ? [{ key: 'zalo' as Channel, label: 'Zalo' }] : []),
    ...(showWhatsapp ? [{ key: 'whatsapp' as Channel, label: 'WhatsApp' }] : []),
    { key: 'email' as Channel, label: 'Email' },
  ];
  const activeChannel: Channel = channelOptions.some((o) => o.key === channel)
    ? channel
    : channelOptions[0].key;

  const branches = displayBranches(systemSettings.branches);
  const selectedBranch: Branch | undefined =
    branches.find((b) => b.id === branchId) ?? branches[0];

  // Số liên hệ DÙNG CHUNG cho mọi chi nhánh (lấy từ Cài đặt chung).
  const zaloNumber = (systemSettings.zaloNumber || '0909053058').replace(/\./g, '');
  const zaloHref = systemSettings.zaloLink || `https://zalo.me/${zaloNumber}`;
  const whatsappNumber = systemSettings.whatsappNumber || '0909053058';
  const whatsappHref = systemSettings.whatsappLink || waLink(whatsappNumber);
  const email = systemSettings.email || 'hello@vitinhantam.com';

  const action =
    activeChannel === 'zalo'
      ? { href: zaloHref, label: isEn ? 'Chat on Zalo' : 'Nhắn Zalo', detail: zaloNumber, bg: 'bg-[#0068FF] hover:bg-[#0054d1]', external: true }
      : activeChannel === 'whatsapp'
      ? { href: whatsappHref, label: isEn ? 'Chat on WhatsApp' : 'Nhắn WhatsApp', detail: whatsappNumber, bg: 'bg-[#25D366] hover:bg-[#20ba5a]', external: true }
      : { href: `mailto:${email}`, label: isEn ? 'Send Email' : 'Gửi Email', detail: email, bg: 'bg-[#2B1810] hover:bg-[#1d110a]', external: false };

  const selectClassName =
    'w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#C0392B] focus:bg-white cursor-pointer';

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

      {/* 3. Phuong thuc lien he: 1 muc duy nhat, chon kenh truoc roi chon chi nhanh */}
      <div className="relative pointer-events-auto">
        <button
          type="button"
          onClick={() => setIsContactOpen(!isContactOpen)}
          aria-label={isEn ? 'Contact method' : 'Phương thức liên hệ'}
          aria-expanded={isContactOpen}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#2B1810] hover:bg-[#1d110a] text-white shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 group relative cursor-pointer"
          title={isEn ? 'Contact Method' : 'Phương thức liên hệ'}
        >
          <MessageCircle className="w-5 h-5 text-white" />
          <span className="opacity-0 group-hover:opacity-100 pointer-events-none transition-all absolute right-14 px-3 py-1.5 rounded-lg bg-[#2B1810] text-white text-xs font-semibold whitespace-nowrap shadow-xl">
            {isEn ? 'Contact Method' : 'Phương thức liên hệ'}
          </span>
        </button>

        {isContactOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={isEn ? 'Contact Method' : 'Phương thức liên hệ'}
            className="absolute right-0 bottom-14 w-72 sm:w-80 p-4 rounded-2xl bg-white border border-[#E8E2D9] shadow-2xl space-y-3 z-50 animate-fade-in"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase">
                {isEn ? 'Contact Method' : 'Phương thức liên hệ'}
              </span>
              <button
                type="button"
                onClick={() => setIsContactOpen(false)}
                aria-label={isEn ? 'Close' : 'Đóng'}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer rounded-lg hover:bg-slate-100"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Kênh liên hệ — chọn TRƯỚC */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                {isEn ? 'Choose a channel' : 'Chọn kênh liên hệ'}
              </label>
              <select
                value={activeChannel}
                onChange={(e) => setChannel(e.target.value as Channel)}
                className={selectClassName}
              >
                {channelOptions.map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Chi nhánh — chọn SAU (địa chỉ hiển thị, số liên hệ dùng chung) */}
            {branches.length > 0 ? (
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  {isEn ? 'Branch' : 'Chi nhánh'}
                </label>
                <select
                  value={selectedBranch?.id ?? ''}
                  onChange={(e) => setBranchId(e.target.value)}
                  className={selectClassName}
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name || b.address}
                    </option>
                  ))}
                </select>
                {selectedBranch && (
                  <p className="mt-1.5 flex items-start gap-1.5 text-[11px] leading-relaxed text-[#6E5D53]">
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-px text-[#C0392B]" />
                    <span>
                      {selectedBranch.name ? (
                        <span className="font-bold text-slate-800 block">{selectedBranch.name}</span>
                      ) : null}
                      {selectedBranch.address}
                    </span>
                  </p>
                )}
              </div>
            ) : (
              <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-[#6E5D53]">
                <MapPin className="w-3.5 h-3.5 shrink-0 mt-px text-[#C0392B]" />
                <span>{systemSettings.address || ''}</span>
              </p>
            )}

            {/* Nút liên hệ theo kênh đã chọn — số dùng chung mọi chi nhánh */}
            <a
              href={action.href}
              {...(action.external
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
              className={`block text-center py-2.5 rounded-xl text-white text-xs font-bold transition ${action.bg}`}
            >
              {action.label}
              <span className="block text-[10px] font-medium opacity-80 mt-0.5">{action.detail}</span>
            </a>
          </div>
        )}
      </div>

      {/* 4. Scroll to Top */}
      {cw?.showBackToTop !== false && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label={t.floating.backToTop || 'Cuộn lên đầu trang'}
          className="pointer-events-auto w-10 h-10 rounded-full bg-white hover:bg-[#FAF7F2] text-[#6E5D53] hover:text-[#2B1810] border border-[#E8E2D9] shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
          title={t.floating.backToTop}
        >
          <ArrowUp className="w-4 h-4 text-[#2B1810]" strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
}
