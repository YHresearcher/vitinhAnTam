'use client';

import React from 'react';
import { InventoryItem } from '@/lib/supabase';
import { Printer, Tag, X, CheckCircle2 } from 'lucide-react';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-md w-full relative print:p-0 print:border-none print:shadow-none">
        {/* Controls - Hidden when printing */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 print:hidden">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Tem Thông Số &amp; S/N Thiết Bị (50x30mm)</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Ngay</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 50x30mm Label Layout without QR */}
        <div className="thermal-label-container flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-xl print:bg-white print:p-0 print:border-none">
          <div
            className="w-[50mm] h-[30mm] bg-white border border-dashed border-slate-400 p-2 flex flex-col justify-between text-black select-none box-border overflow-hidden print:border-none print:m-0"
            style={{ width: '50mm', height: '30mm' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-0.5">
              <div className="font-black text-[9px] uppercase tracking-tighter text-blue-900 print:text-black">
                VI TÍNH AN TÂM
              </div>
              <div className="text-[6px] text-slate-700 font-mono font-bold">
                0909.053.058
              </div>
            </div>

            {/* Model & Specs */}
            <div className="my-0.5 leading-tight">
              <div className="font-bold text-[8.5px] line-clamp-1 text-slate-900 print:text-black">
                {item.device_model || item.model}
              </div>
              <div className="text-[6.5px] text-slate-800 print:text-black mt-0.5 font-medium">
                {item.specs?.cpu || item.cpu || 'Intel Core'} • {item.specs?.ram || item.ram || 'RAM'}
              </div>
              <div className="text-[6.5px] text-slate-800 print:text-black font-medium">
                {item.specs?.ssd || item.ssd_capacity || 'SSD NVMe'} (Sức khỏe {item.specs?.ssd_health ?? item.ssd_health ?? 100}%)
              </div>
            </div>

            {/* S/N Box & Warranty */}
            <div className="pt-0.5 border-t border-slate-800 flex items-end justify-between">
              <div>
                <div className="text-[6px] uppercase font-bold text-slate-600 print:text-black">
                  Số Serial (S/N):
                </div>
                <div className="font-mono font-black text-[9px] tracking-wider text-blue-800 print:text-black bg-slate-100 print:bg-transparent px-1 py-0.2 rounded border border-slate-300 print:border-none">
                  {item.service_tag}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[6.5px] font-bold text-emerald-700 print:text-black">
                  BH {item.warranty_months}T (1 ĐỔI 1)
                </div>
                <div className="text-[5.5px] text-slate-500 print:text-black">
                  Tra cứu theo S/N máy
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Note below label */}
        <p className="text-[11px] text-slate-500 text-center mt-3 print:hidden">
          * Sử dụng Số Serial (S/N) / Service Tag dập sẵn trên thân máy để kiểm tra bảo hành điện tử.
        </p>
      </div>
    </div>
  );
}

export default ThermalLabelModal;
