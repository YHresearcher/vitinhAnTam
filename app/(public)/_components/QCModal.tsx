'use client';

import React from 'react';
import { Modal } from 'antd';
import Link from 'next/link';
import {
  Check,
  Cpu,
  HardDrive,
  CheckCircle,
  ScanLine,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import { useViTinhAnTamStore } from '@/lib/store';
import { formatVND } from '@/lib/supabase';
import { TRANSLATIONS } from '@/lib/translations';

interface QCModalProps {
  selectedProduct: any;
  setSelectedProduct: (value: any) => void;
  isEn: boolean;
  t: any;
  systemSettings: any;
}

export default function QCModal({
  selectedProduct,
  setSelectedProduct,
  isEn,
  t,
  systemSettings
}: QCModalProps) {
  return (
    <Modal
      open={!!selectedProduct}
      onCancel={() => setSelectedProduct(null)}
      footer={null}
      centered
      width={680}
      title={null}
      className="qc-detail-modal"
    >
      {selectedProduct && (
        <div className="p-2 sm:p-4 space-y-6 font-inter">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-xs font-bold mb-1.5 border border-emerald-200">
                <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.5} />
                <span>{t.qcModal.badge}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">{selectedProduct.name}</h3>
              <div className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                <span className="text-slate-500">{t.qcModal.serviceTag || (isEn ? 'QC Status:' : 'Trạng thái kiểm định:')}</span>
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                  {isEn ? '100% Factory Standard Passed' : '100% Đạt Chuẩn Xuất Xưởng'}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs text-slate-500">{t.qcModal.priceLabel}</div>
              <div className="text-xl font-bold text-[#C0392B] font-mono">{formatVND(selectedProduct.price)}</div>
            </div>
          </div>

          {/* Hardware & Test Evidence Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-[#C0392B]" strokeWidth={1.5} />
                <span>{t.qcModal.cpuMemoryTitle}</span>
              </div>
              <p className="text-slate-600 font-mono">{selectedProduct.specs.cpu}</p>
              <p className="text-slate-600 font-mono">{selectedProduct.specs.ram}</p>
              <div className="text-[11px] text-emerald-800 font-medium flex items-center gap-1 pt-1 border-t border-slate-200">
                <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.5} />
                <span>{t.qcModal.stressTestGood}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-[#C0392B]" strokeWidth={1.5} />
                <span>{t.qcModal.storageTitle}</span>
              </div>
              <p className="text-slate-600 font-mono">{selectedProduct.specs.storage}</p>
              <div className="text-[11px] text-emerald-800 font-medium flex items-center gap-1 pt-1 border-t border-slate-200">
                <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.5} />
                <span>{t.qcModal.diskInfoGood}</span>
              </div>
            </div>
          </div>

          {/* Warehouse Status Meta */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="font-bold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>{t.qcModal.warehouseStatusTitle}</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-[#C0392B] text-white text-[10px] font-bold">
                {t.qcModal.inWarehouseCount} {selectedProduct.stockCount} {t.qcModal.inWarehouseSuffix}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-600 text-[11px]">
              <div>
                • {t.qcModal.burnInDuration} <strong className="text-slate-900 font-mono">{selectedProduct.burnInDuration} {t.qcModal.minutes}</strong>
              </div>
              <div>
                • {t.qcModal.osLicense} <strong className="text-slate-900">{t.qcModal.osLicenseVal}</strong>
              </div>
              <div>
                • {t.qcModal.policy} <strong className="text-slate-900">{t.qcModal.policyVal}</strong>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href={`/mua-hang?device=${encodeURIComponent(selectedProduct.name)}&price=${selectedProduct.price}&tag=${encodeURIComponent(selectedProduct.serviceTag || '')}`}
              onClick={() => setSelectedProduct(null)}
              className="flex-1 py-3 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-xs sm:text-sm text-center transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <span>{t.products.btnOrder || 'Đặt Mua Máy'}</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </Link>
            <a
              href={`${systemSettings.zaloLink || 'https://zalo.me/0909053058'}?text=${encodeURIComponent(isEn ? `Hello An Tam, I would like photos and details for ${selectedProduct.name}` : `Chào An Tâm, tôi quan tâm máy ${selectedProduct.name}, vui lòng gửi thêm hình ảnh thực tế`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-5 rounded-xl bg-[#0068FF] hover:bg-[#0054d1] text-white font-bold text-xs sm:text-sm text-center transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
              <span>{t.qcModal.btnZaloPhotos || (isEn ? 'Chat Zalo For Real Photos' : 'Chat Zalo Xem Thêm Ảnh Thật')}</span>
            </a>
          </div>
        </div>
      )}
    </Modal>
  );
}
