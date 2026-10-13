'use client';

import React from 'react';
import { Tag, Pencil } from 'lucide-react';

export interface InventoryPriceDisplayProps {
  originalPrice?: number;
  salePrice?: number;
  fallbackPrice?: number;
  warrantyMonths?: number;
  onEdit?: () => void;
  canEdit?: boolean;
  align?: 'left' | 'right' | 'center';
  size?: 'sm' | 'md' | 'lg';
  showEditButton?: boolean;
}

export function InventoryPriceDisplay({
  originalPrice,
  salePrice,
  fallbackPrice = 0,
  warrantyMonths,
  onEdit,
  canEdit = false,
  align = 'right',
  size = 'md',
  showEditButton = false,
}: InventoryPriceDisplayProps) {
  // Giá gốc: ưu tiên originalPrice, nếu không có thì lấy fallbackPrice (price/retail_price cũ)
  const orig = originalPrice && originalPrice > 0 ? originalPrice : (fallbackPrice || 0);
  // Giá giảm: chỉ coi là có giảm khi salePrice > 0
  const sale = salePrice && salePrice > 0 ? salePrice : 0;
  const hasSale = sale > 0;

  const alignClass =
    align === 'right' ? 'items-end text-right' : align === 'center' ? 'items-center text-center' : 'items-start text-left';

  const discountPercent =
    hasSale && orig > sale ? Math.round(((orig - sale) / orig) * 100) : null;

  return (
    <div className={`flex flex-col ${alignClass} group/price`}>
      {hasSale ? (
        // Có giá giảm: Giá gốc bị gạch bỏ, giá giảm nổi bật
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <span
              className={`font-black text-rose-600 font-mono tracking-tight ${
                size === 'lg' ? 'text-lg' : size === 'sm' ? 'text-xs' : 'text-sm'
              }`}
            >
              {sale.toLocaleString('vi-VN')} đ
            </span>
            {discountPercent !== null && discountPercent > 0 && (
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                -{discountPercent}%
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 justify-end">
            <span className="text-[11px] font-semibold text-slate-400 line-through font-mono">
              {orig > 0 ? `${orig.toLocaleString('vi-VN')} đ` : ''}
            </span>
            {canEdit && onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                title="Bấm để chỉnh sửa giá bán"
                className="opacity-0 group-hover/price:opacity-100 p-0.5 text-slate-400 hover:text-blue-600 transition-opacity"
              >
                <Pencil className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      ) : orig <= 0 ? (
        // Cả giá gốc <= 0: Hiển thị Liên hệ
        <div className="flex items-center gap-1">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            Liên hệ
          </span>
          {canEdit && onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              title="Bấm để đặt giá bán"
              className="opacity-0 group-hover/price:opacity-100 p-0.5 text-slate-400 hover:text-blue-600 transition-opacity"
            >
              <Pencil className="w-3 h-3" />
            </button>
          )}
        </div>
      ) : (
        // Chỉ có giá gốc (giá giảm = 0 hoặc trống)
        <div className="flex items-center gap-1 justify-end">
          <span
            className={`font-bold text-slate-900 font-mono ${
              size === 'lg' ? 'text-base' : size === 'sm' ? 'text-xs' : 'text-sm'
            }`}
          >
            {orig.toLocaleString('vi-VN')} đ
          </span>
          {canEdit && onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              title="Bấm để chỉnh sửa giá bán"
              className="opacity-0 group-hover/price:opacity-100 p-0.5 text-slate-400 hover:text-blue-600 transition-opacity"
            >
              <Pencil className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Hiển thị thời hạn bảo hành nếu có */}
      {typeof warrantyMonths === 'number' && (
        <div className="text-[11px] text-slate-400 mt-0.5">
          Bảo hành {warrantyMonths}T
        </div>
      )}
    </div>
  );
}
