'use client';

import React from 'react';
import { SystemSettings } from '@/lib/store';
import { formatVND } from '@/lib/supabase';
import { QrCode, Copy } from 'lucide-react';

interface OrderSuccessQrCardProps {
  systemSettings: SystemSettings;
  devicePrice: number;
  orderCode: string;
  customerPhone?: string;
  isEn: boolean;
  copiedField: string | null;
  copyToClipboard: (text: string, fieldId: string) => void;
  getQrImageUrl: () => string;
}

export function OrderSuccessQrCard({
  systemSettings,
  devicePrice,
  orderCode,
  customerPhone,
  isEn,
  copiedField,
  copyToClipboard,
  getQrImageUrl,
}: OrderSuccessQrCardProps) {
  const memoText = `${orderCode}${customerPhone ? ` - ${customerPhone}` : ''}`;

  return (
    <div className="bg-white rounded-xl border-2 border-[#C0392B]/30 shadow-md p-4 sm:p-5 text-left space-y-3.5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <QrCode className="w-4 h-4 text-[#C0392B]" />
          <h3 className="text-xs sm:text-sm font-bold text-[#2B1810]">
            {isEn ? 'Scan QR / Bank Transfer Details' : 'Thông Tin Chuyển Khoản & Quét Mã QR'}
          </h3>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
          {isEn ? 'Pending Payment' : 'Chờ chuyển khoản'}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-2xs shrink-0 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getQrImageUrl()}
            alt="QR Code Thanh Toán"
            className="w-32 h-32 object-contain rounded-lg mx-auto"
          />
          <span className="text-[10px] text-slate-500 font-medium mt-1 block">
            {isEn ? 'Scan with Banking App' : 'Quét bằng App Ngân Hàng'}
          </span>
        </div>

        <div className="flex-1 w-full space-y-1.5 text-xs">
          <div className="flex justify-between items-center p-2 rounded-lg bg-[#FAF7F2] border border-[#E8E2D9]">
            <span className="text-[#6E5D53]">{isEn ? 'Bank:' : 'Ngân hàng:'}</span>
            <span className="font-bold text-[#2B1810]">{systemSettings.bankName || 'MB Bank'}</span>
          </div>

          <div className="flex justify-between items-center p-2 rounded-lg bg-[#FAF7F2] border border-[#E8E2D9]">
            <div>
              <span className="text-[#6E5D53] block text-[10px]">{isEn ? 'Account No:' : 'Số tài khoản:'}</span>
              <span className="font-mono font-bold text-sm text-[#C0392B]">
                {systemSettings.bankAccountNumber || '0909053058'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(systemSettings.bankAccountNumber || '0909053058', 'acc_success')}
              className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1 shadow-2xs transition"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedField === 'acc_success' ? (isEn ? 'Copied' : 'Đã chép') : (isEn ? 'Copy' : 'Sao chép')}</span>
            </button>
          </div>

          <div className="flex justify-between items-center p-2 rounded-lg bg-[#FAF7F2] border border-[#E8E2D9]">
            <span className="text-[#6E5D53]">{isEn ? 'Account Owner:' : 'Chủ tài khoản:'}</span>
            <span className="font-mono font-bold text-[#2B1810] uppercase truncate">
              {systemSettings.bankAccountName || 'VI TINH AN TAM'}
            </span>
          </div>

          {devicePrice > 0 && (
            <div className="flex justify-between items-center p-2 rounded-lg bg-[#FAF7F2] border border-[#E8E2D9]">
              <div>
                <span className="text-[#6E5D53] block text-[10px]">{isEn ? 'Amount:' : 'Số tiền:'}</span>
                <span className="font-mono font-bold text-sm text-[#C0392B]">{formatVND(devicePrice)}</span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(String(devicePrice), 'amount_success')}
                className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1 shadow-2xs transition"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedField === 'amount_success' ? (isEn ? 'Copied' : 'Đã chép') : (isEn ? 'Copy' : 'Sao chép')}</span>
              </button>
            </div>
          )}

          <div className="flex justify-between items-center p-2 rounded-lg bg-amber-50 border border-amber-200">
            <div className="min-w-0 flex-1 mr-2">
              <span className="text-amber-800 block text-[10px] font-bold uppercase">
                {isEn ? 'Transfer Memo:' : 'Nội dung CK:'}
              </span>
              <span className="font-mono font-bold text-xs text-amber-950 truncate block">
                {memoText}
              </span>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(memoText, 'memo_success')}
              className="px-2 py-1 rounded bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-semibold flex items-center gap-1 shrink-0 shadow-2xs transition"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedField === 'memo_success' ? (isEn ? 'Copied' : 'Đã chép') : (isEn ? 'Copy' : 'Sao chép')}</span>
            </button>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-[#6E5D53] italic leading-tight">
        {systemSettings.paymentQrNote ||
          (isEn
            ? 'Please include the order code in your transfer note.'
            : 'Vui lòng ghi đúng nội dung chuyển khoản để hệ thống xác nhận nhanh nhất.')}
      </p>
    </div>
  );
}

