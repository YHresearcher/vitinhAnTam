'use client';

import React, { useState } from 'react';
import { useViTinhAnTamStore, SystemSettings } from '@/lib/store';
import Link from 'next/link';

export default function CaiDatPage() {
  const { systemSettings, updateSystemSettings, currentUser, canAccessSettings } = useViTinhAnTamStore();

  const [formData, setFormData] = useState<SystemSettings>({
    ...systemSettings,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  const handleChange = (field: keyof SystemSettings, val: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateSystemSettings(formData);
    setIsSaving(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3500);
  };

  const handleResetDefaults = () => {
    if (confirm('Bạn có chắc chắn muốn đặt lại thông tin hệ thống về mặc định ban đầu?')) {
      const defaultData: SystemSettings = {
        hotline: '0909.053.058',
        zaloNumber: '0909053058',
        zaloLink: 'https://zalo.me/0909053058',
        address: 'Long An - Tây Ninh',
        serviceAreas: 'Long An - Tây Ninh',
        workingHoursWeekday: '08h00 - 17h30 (Cứu hộ ưu tiên: 17h30 - 21h00)',
        workingHoursWeekend: '08h00 - 21h00 (Trọn ngày)',
        primeHours: '17:30 - 21:00',
        footerAbout: 'Chuyên cung cấp PC đồng bộ văn phòng, laptop doanh nhân tuyển chọn kỹ lưỡng & dịch vụ xử lý tận nơi trong 2 giờ tại Long An - Tây Ninh.',
        footerCopyright: '© 2026 Vi Tính An Tâm (vitinhantam.vn) - Giữ trọn chữ tín, an tâm sử dụng.',
        storeName: 'Vi Tính An Tâm',
      };
      setFormData(defaultData);
      updateSystemSettings(defaultData);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 3500);
    }
  };

  if (!canAccessSettings()) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm mt-12">
        <span className="material-symbols-outlined text-4xl text-amber-500 mb-2">lock</span>
        <h2 className="text-lg font-bold text-slate-900 mb-1">YÊU CẦU QUYỀN QUẢN TRỊ VIÊN (ADMIN)</h2>
        <p className="text-xs text-slate-600 mb-4">
          Chỉ tài khoản Admin mới có quyền điều chỉnh số hotline, thông tin Zalo, chân trang và cấu hình toàn hệ thống.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Về Bảng Điều Khiển</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Toast Alert */}
      {saveToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-bounce">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span>ĐÃ CẬP NHẬT THÔNG TIN HỆ THỐNG THÀNH CÔNG!</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            Quản trị hệ thống
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            CẤU HÌNH THÔNG TIN DOANH NGHIỆP &amp; FOOTER
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Mọi thay đổi tại đây sẽ được cập nhật tức thì trên toàn bộ website (Header, Footer, Nút gọi, Zalo, Tem bảo hành).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">restart_alt</span>
            <span>Đặt Lại Mặc Định</span>
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. THÔNG TIN LIÊN HỆ CỐT LÕI */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="material-symbols-outlined text-blue-600">contact_phone</span>
            <span>1. THÔNG TIN LIÊN HỆ &amp; HOTLINE KỸ THUẬT</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Số Hotline Hiển Thị &amp; Gọi Điện
              </label>
              <input
                type="text"
                required
                value={formData.hotline}
                onChange={(e) => handleChange('hotline', e.target.value)}
                placeholder="0909.053.058"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Hiển thị trên Header, Footer, Nút nổi góc phải và tem in.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Số Zalo Kỹ Thuật Trực Ca
              </label>
              <input
                type="text"
                required
                value={formData.zaloNumber}
                onChange={(e) => {
                  handleChange('zaloNumber', e.target.value);
                  handleChange('zaloLink', `https://zalo.me/${e.target.value.replace(/\D/g, '')}`);
                }}
                placeholder="0909053058"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Số điện thoại liên kết tài khoản Zalo hỗ trợ khách hàng.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Đường Dẫn Zalo (Zalo URL Link)
              </label>
              <input
                type="text"
                required
                value={formData.zaloLink}
                onChange={(e) => handleChange('zaloLink', e.target.value)}
                placeholder="https://zalo.me/0909053058"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Địa Bàn Hoạt Động &amp; Phục Vụ
              </label>
              <input
                type="text"
                required
                value={formData.serviceAreas}
                onChange={(e) => handleChange('serviceAreas', e.target.value)}
                placeholder="Long An - Tây Ninh"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. THỜI GIAN LÀM VIỆC & KHUNG GIỜ VÀNG */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="material-symbols-outlined text-blue-600">schedule</span>
            <span>2. THỜI GIAN LÀM VIỆC &amp; KHUNG GIỜ VÀNG 2 GIỜ</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Giờ Hành Chính (Thứ 2 - Thứ 6)
              </label>
              <input
                type="text"
                value={formData.workingHoursWeekday}
                onChange={(e) => handleChange('workingHoursWeekday', e.target.value)}
                placeholder="08h00 - 17h30 (Cứu hộ ưu tiên: 17h30 - 21h00)"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Cuối Tuần (Thứ 7 &amp; Chủ Nhật)
              </label>
              <input
                type="text"
                value={formData.workingHoursWeekend}
                onChange={(e) => handleChange('workingHoursWeekend', e.target.value)}
                placeholder="08h00 - 21h00 (Trọn ngày)"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Khung Giờ Vàng Ưu Tiên 2 Giờ
              </label>
              <input
                type="text"
                value={formData.primeHours}
                onChange={(e) => handleChange('primeHours', e.target.value)}
                placeholder="17:30 - 21:00"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 3. NỘI DUNG CHÂN TRANG (FOOTER) */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="material-symbols-outlined text-blue-600">article</span>
            <span>3. NỘI DUNG CHÂN TRANG (FOOTER &amp; BẢN QUYỀN)</span>
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Đoạn Giới Thiệu Chân Trang (Footer About)
              </label>
              <textarea
                rows={3}
                value={formData.footerAbout}
                onChange={(e) => handleChange('footerAbout', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Dòng Bản Quyền Chân Trang (Footer Copyright)
              </label>
              <input
                type="text"
                value={formData.footerCopyright}
                onChange={(e) => handleChange('footerCopyright', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wide shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">save</span>
            <span>{isSaving ? 'ĐANG LƯU DỮ LIỆU...' : 'LƯU CẤU HÌNH HỆ THỐNG'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
