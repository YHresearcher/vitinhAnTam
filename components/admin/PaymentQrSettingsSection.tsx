'use client';

import React from 'react';
import { SystemSettings } from '@/lib/store';
import {
  QrCode,
  Upload,
  CreditCard,
  Trash2,
  Building,
  Sparkles,
} from 'lucide-react';

interface PaymentQrSettingsSectionProps {
  formData: SystemSettings;
  handleChange: (field: keyof SystemSettings, val: string) => void;
  isUploadingQr: boolean;
  handleUploadQrImage: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

const POPULAR_BANKS = [
  'MB Bank (Quân Đội)',
  'Vietcombank',
  'Techcombank',
  'ACB',
  'BIDV',
  'VietinBank',
  'VPBank',
  'TPBank',
  'MoMo / Ví điện tử',
];

export function PaymentQrSettingsSection({
  formData,
  handleChange,
  isUploadingQr,
  handleUploadQrImage,
}: PaymentQrSettingsSectionProps) {
  return (
    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <QrCode className="w-4 h-4 text-[#C0392B]" />
          4. Mã QR Thanh Toán &amp; Tài Khoản Ngân Hàng (Hiển thị khi mua hàng)
        </h3>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          Tự động hiển thị khi khách chọn thanh toán QR Code / Chuyển khoản
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Cột trái: Cấu hình thông tin & upload QR */}
        <div className="lg:col-span-7 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Hình ảnh Mã QR Code Thanh Toán (VietQR / Ngân hàng / MoMo)
            </label>
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
              <input
                type="text"
                value={formData.paymentQrUrl || ''}
                onChange={(e) => handleChange('paymentQrUrl', e.target.value)}
                placeholder="VD: /img/payment/qr-code.png hoặc dán link ảnh..."
                className="flex-1 min-w-[200px] px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#C0392B] bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900"
              />
              <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-900 text-[#C0392B] dark:text-red-400 text-xs font-bold cursor-pointer transition shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploadingQr ? 'Đang tải...' : 'Tải ảnh QR'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isUploadingQr}
                  onChange={handleUploadQrImage}
                />
              </label>
              {formData.paymentQrUrl && (
                <button
                  type="button"
                  onClick={() => handleChange('paymentQrUrl', '')}
                  className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg border border-rose-200 dark:border-rose-900 transition shrink-0"
                  title="Xóa ảnh QR này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
              Tải ảnh QR trực tiếp từ máy tính hoặc dán URL ảnh mã thanh toán đã có.
            </span>
          </div>

          <div>
            <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>Gợi ý ngân hàng nhanh:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_BANKS.map((bank) => (
                <button
                  key={bank}
                  type="button"
                  onClick={() => handleChange('bankName', bank)}
                  className={`text-[10px] px-2 py-1 rounded-md border transition ${
                    formData.bankName === bank
                      ? 'bg-red-50 dark:bg-red-950/40 text-[#C0392B] dark:text-red-400 border-red-300 dark:border-red-800 font-bold'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {bank}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tên Ngân Hàng / Ví Điện Tử *
              </label>
              <input
                type="text"
                value={formData.bankName || ''}
                onChange={(e) => handleChange('bankName', e.target.value)}
                placeholder="VD: MB Bank, Vietcombank, Techcombank..."
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#C0392B] bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Số Tài Khoản Nhận Tiền *
              </label>
              <input
                type="text"
                value={formData.bankAccountNumber || ''}
                onChange={(e) => handleChange('bankAccountNumber', e.target.value)}
                placeholder="VD: 0909053058"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold font-mono text-[#C0392B] dark:text-red-400 focus:outline-none focus:border-[#C0392B] bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tên Chủ Tài Khoản (In hoa không dấu) *
              </label>
              <input
                type="text"
                value={formData.bankAccountName || ''}
                onChange={(e) => handleChange('bankAccountName', e.target.value.toUpperCase())}
                placeholder="VD: VI TINH AN TAM hoặc NGUYEN VAN A"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold font-mono uppercase text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#C0392B] bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ghi Chú Hướng Dẫn Khách Hàng Chuyển Khoản
              </label>
              <input
                type="text"
                value={formData.paymentQrNote || ''}
                onChange={(e) => handleChange('paymentQrNote', e.target.value)}
                placeholder="VD: Vui lòng ghi nội dung: [Mã đơn hàng] - [Số điện thoại]"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#C0392B] bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900"
              />
            </div>
          </div>
        </div>
        {/* Cột phải: Xem trước hiển thị trực quan */}
        <div className="lg:col-span-5">
          <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-slate-900 border border-[#E8E2D9] dark:border-slate-800">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E8E2D9] dark:border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6E5D53] dark:text-slate-400 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-[#C0392B]" />
                Xem Trước Khi Mua Hàng
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Trực Quan
              </span>
            </div>

            <div className="bg-white dark:bg-slate-950 rounded-xl p-4 border border-[#E8E2D9] dark:border-slate-800 shadow-xs text-center space-y-3">
              <div className="flex justify-center">
                {formData.paymentQrUrl ? (
                  <div className="p-2 bg-white rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.paymentQrUrl}
                      alt="Mã QR thanh toán"
                      className="w-36 h-36 object-contain rounded-lg mx-auto"
                    />
                  </div>
                ) : formData.bankAccountNumber ? (
                  <div className="p-2 bg-white rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                        `STK:${formData.bankAccountNumber}|NH:${formData.bankName || 'BANK'}|TEN:${formData.bankAccountName || 'VI TINH AN TAM'}`
                      )}`}
                      alt="QR VietQR"
                      className="w-36 h-36 object-contain rounded-lg mx-auto"
                    />
                  </div>
                ) : (
                  <div className="w-36 h-36 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-xs p-2">
                    <QrCode className="w-8 h-8 mb-1 text-slate-300 dark:text-slate-600" />
                    <span>Chưa cấu hình QR</span>
                  </div>
                )}
              </div>

              <div className="text-left space-y-1.5 bg-[#FAF7F2] dark:bg-slate-900/80 p-3 rounded-lg border border-[#E8E2D9] dark:border-slate-800 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">Ngân hàng:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">{formData.bankName || 'Chưa nhập'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">Số tài khoản:</span>
                  <span className="font-mono font-bold text-[#C0392B] dark:text-red-400 text-xs">{formData.bankAccountNumber || 'Chưa nhập'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">Chủ tài khoản:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100 uppercase text-[11px]">{formData.bankAccountName || 'Chưa nhập'}</span>
                </div>
              </div>

              <p className="text-[11px] text-[#6E5D53] dark:text-slate-400 italic">
                {formData.paymentQrNote || 'Vui lòng quét mã QR hoặc chuyển khoản với nội dung đơn hàng.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

