'use client';

import React from 'react';
import { Switch } from 'antd';
import { ContactWidgetConfig, SystemSettings, ZaloContactItem } from '@/lib/store';
import { MessagesSquare, Plus, Trash2, UserRound } from 'lucide-react';

interface ContactWidgetSettingsSectionProps {
  formData: SystemSettings;
  setFormData: (
    next: SystemSettings | ((prev: SystemSettings) => SystemSettings)
  ) => void;
}

const MAX_CONTACTS = 6;

const WIDGET_TOGGLES: Array<{ key: keyof ContactWidgetConfig; label: string }> = [
  { key: 'showWarranty', label: 'Nút tra cứu bảo hành' },
  { key: 'showHotline', label: 'Nút gọi Hotline' },
  { key: 'showZalo', label: 'Nút Zalo (danh sách kỹ thuật)' },
  { key: 'showWhatsapp', label: 'Nút WhatsApp' },
  { key: 'showBackToTop', label: 'Nút lên đầu trang' },
];

const inputClassName =
  'w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#C0392B] bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900';

export function ContactWidgetSettingsSection({
  formData,
  setFormData,
}: ContactWidgetSettingsSectionProps) {
  const contacts: ZaloContactItem[] = formData.zaloContacts ?? [];
  const widget: ContactWidgetConfig = formData.contactWidget ?? {};

  const updateContacts = (updater: (list: ZaloContactItem[]) => ZaloContactItem[]) => {
    setFormData((prev) => ({
      ...prev,
      zaloContacts: updater(prev.zaloContacts ?? []),
    }));
  };

  const updateContactField = (id: string, field: 'name' | 'phone' | 'role', val: string) => {
    updateContacts((list) =>
      list.map((contact) => {
        if (contact.id !== id) return contact;
        if (field === 'name') return { ...contact, name: val };
        if (field === 'phone') return { ...contact, phone: val };
        return { ...contact, role: val };
      })
    );
  };

  const removeContact = (id: string) => {
    updateContacts((list) => list.filter((contact) => contact.id !== id));
  };

  const addContact = () => {
    updateContacts((list) => {
      if (list.length >= MAX_CONTACTS) return list;
      return [
        ...list,
        {
          id: `zalo-${Date.now()}`,
          name: `Kỹ Thuật ${list.length + 1}`,
          phone: '',
          role: '',
        },
      ];
    });
  };

  const handleToggle = (key: keyof ContactWidgetConfig, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      contactWidget: { ...prev.contactWidget, [key]: checked },
    }));
  };

  const whatsappDigits = (formData.whatsappNumber || '')
    .replace(/\D/g, '')
    .replace(/^0/, '84');
  const whatsappPreview = whatsappDigits ? `https://wa.me/${whatsappDigits}` : '';

  return (
    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <MessagesSquare className="w-4 h-4 text-[#C0392B]" />
          Widget Liên Hệ Trang Chủ
        </h3>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          Các nút nổi góc dưới bên phải trang chủ (tra cứu bảo hành, hotline, Zalo, WhatsApp)
        </span>
      </div>

      <div className="space-y-6">
        {/* Danh sách liên hệ Zalo */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Danh Sách Kỹ Thuật Viên Trên Zalo (hiện khi khách bấm nút Zalo)
            </label>
            <button
              type="button"
              onClick={addContact}
              disabled={contacts.length >= MAX_CONTACTS}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-900 text-[#0068FF] dark:text-blue-400 text-[11px] font-bold transition shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm người liên hệ
            </button>
          </div>

          {contacts.length === 0 ? (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
              Chưa có người liên hệ nào — widget sẽ dùng danh sách mặc định của hệ thống.
            </p>
          ) : (
            <div className="space-y-2">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex flex-col md:flex-row md:items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 shrink-0">
                    <UserRound className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={contact.name}
                    onChange={(e) => updateContactField(contact.id, 'name', e.target.value)}
                    placeholder="Tên hiển thị (VD: Kỹ Thuật 1)"
                    className={`${inputClassName} md:flex-1`}
                  />
                  <input
                    type="text"
                    value={contact.phone}
                    onChange={(e) => updateContactField(contact.id, 'phone', e.target.value)}
                    placeholder="Số Zalo (VD: 0909053058)"
                    className={`${inputClassName} md:w-44 font-mono`}
                  />
                  <input
                    type="text"
                    value={contact.role || ''}
                    onChange={(e) => updateContactField(contact.id, 'role', e.target.value)}
                    placeholder="Vai trò (VD: Hỗ trợ tiếng Anh)"
                    className={`${inputClassName} md:flex-1`}
                  />
                  <button
                    type="button"
                    onClick={() => removeContact(contact.id)}
                    className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg border border-rose-200 dark:border-rose-900 transition shrink-0 self-end md:self-center"
                    title="Xóa người liên hệ này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 block">
            Tối đa {MAX_CONTACTS} người. Để thêm đầu mối hỗ trợ tiếng Anh cho khách nước ngoài, đặt Vai trò là
            &quot;Hỗ trợ tiếng Anh&quot; (hiển thị &quot;English Support&quot; ở bản tiếng Anh).
          </span>
        </div>

        {/* WhatsApp */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Số WhatsApp (nút WhatsApp trên widget)
            </label>
            <input
              type="text"
              value={formData.whatsappNumber || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, whatsappNumber: e.target.value }))
              }
              placeholder="VD: 0909053058"
              className={`${inputClassName} font-mono`}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Link WhatsApp sẽ dùng
            </label>
            <div className="px-3.5 py-2 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-xs sm:text-sm text-slate-600 dark:text-slate-300 break-all min-h-[38px] flex items-center">
              {whatsappPreview || 'Nhập số WhatsApp để xem link'}
            </div>
          </div>
        </div>

        {/* Bật / tắt từng nút trên widget */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Hiển Thị Các Nút Trên Widget
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {WIDGET_TOGGLES.map(({ key, label }) => (
              <div
                key={key}
                className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              >
                <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  {label}
                </span>
                <Switch
                  checked={widget[key] !== false}
                  onChange={(checked) => handleToggle(key, checked)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
