'use client';

import React from 'react';
import { InventoryItem, getQRCodeUrl } from '@/lib/supabase';

interface ThermalLabelModalProps {
  item: InventoryItem | null;
  onClose: () => void;
  isOpen?: boolean;
}

export function ThermalLabelModal({ item, onClose, isOpen = true }: ThermalLabelModalProps) {
  if (!item || !isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const lookupUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/tra-cuu-bao-hanh?tag=${item.service_tag}`
    : `https://vitinhantham.vn/tra-cuu-bao-hanh?tag=${item.service_tag}`;

  const qrUrl = getQRCodeUrl(lookupUrl, 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-xs p-4 print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-md w-full relative print:p-0 print:border-none print:shadow-none">
        {/* Controls - Hidden when printing */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-xl">print</span>
            <h3 className="font-bold text-slate-900 text-sm">In Tem Nhiệt 50x30mm (XP-350B)</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              <span>In Ngay</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 50x30mm Thermal Label Layout */}
        <div className="thermal-label-container flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-xl print:bg-white print:p-0 print:border-none">
          <div
            className="w-[50mm] h-[30mm] bg-white border border-dashed border-slate-400 p-2 flex flex-row items-center justify-between text-black select-none box-border overflow-hidden print:border-none print:m-0"
            style={{ width: '50mm', height: '30mm' }}
          >
            {/* Left Content */}
            <div className="flex flex-col justify-between h-full pr-1 flex-1 leading-tight">
              <div>
                <div className="font-black text-[9px] uppercase tracking-tighter text-blue-800 print:text-black">
                  VI TÍNH AN TÂM
                </div>
                <div className="text-[6.5px] text-slate-600 print:text-black">
                  0903.892.100 • Tân An
                </div>
              </div>

              <div>
                <div className="font-bold text-[8px] line-clamp-1">
                  {item.device_model || item.model}
                </div>
                <div className="text-[6.5px] text-slate-700 print:text-black">
                  {item.specs?.cpu || item.cpu || 'Intel Core i5'} • {item.specs?.ram || item.ram || '16GB RAM'}
                </div>
                <div className="text-[6.5px] text-slate-700 print:text-black">
                  {item.specs?.ssd || item.ssd_capacity || 'SSD NVMe'} (Good {item.specs?.ssd_health ?? item.ssd_health ?? 99}%)
                </div>
              </div>

              <div className="pt-0.5 border-t border-slate-300">
                <div className="font-mono font-black text-[8px] tracking-wider">
                  TAG: {item.service_tag}
                </div>
                <div className="text-[6px] text-slate-500 print:text-black">
                  BH {item.warranty_months}T • 1 đổi 1 trong 2H
                </div>
              </div>
            </div>

            {/* Right QR Code */}
            <div className="flex flex-col items-center justify-center shrink-0 w-[18mm]">
              <img
                src={qrUrl}
                alt={item.service_tag}
                className="w-[17mm] h-[17mm] object-contain border border-slate-300 print:border-black p-0.5"
              />
              <span className="text-[5.5px] text-center font-mono mt-0.5 tracking-tighter">
                QUÉT TRA CỨU
              </span>
            </div>
          </div>
        </div>

        {/* Note below label */}
        <p className="text-[11px] text-slate-500 text-center mt-3 print:hidden">
          * Đặt cỡ giấy <strong>50mm x 30mm</strong> trên máy in nhãn nhiệt Xprinter XP-350B, đặt lề 0mm.
        </p>
      </div>
    </div>
  );
}

export default ThermalLabelModal;
