'use client';

import React from 'react';
import { Customer, formatVND } from '@/lib/supabase';
import {
  CRM_TIER_CONFIG,
  calculateCustomerTier,
  calculateTierProgress,
  normalizeCustomerTier,
} from '@/lib/crmTiers';
import { ShieldCheck, Sparkles, Award, ArrowUpRight, CheckCircle2, Gift } from 'lucide-react';

interface DigitalMemberCardProps {
  customer: Customer;
  className?: string;
  isEn?: boolean;
}

export function DigitalMemberCard({
  customer,
  className = '',
  isEn = false,
}: DigitalMemberCardProps) {
  const totalSpent = customer.total_spent || 0;
  const tierInfo = calculateCustomerTier(totalSpent, customer.last_purchase_date);
  const effectiveTier = tierInfo.effectiveTier;
  const config = CRM_TIER_CONFIG[effectiveTier];
  const progress = calculateTierProgress(totalSpent);

  const customerCode =
    customer.customer_code ||
    `VTAT-${(customer.phone || '0000').slice(-4)}-${(customer.id || '0000').slice(0, 4).toUpperCase()}`;

  return (
    <div className={`w-full max-w-lg mx-auto space-y-4 ${className}`}>
      {/* 3D Glass / Metal VIP Card */}
      <div
        className={`relative overflow-hidden rounded-3xl p-6 sm:p-7 shadow-2xl text-white transition-all duration-300 hover:scale-[1.01] bg-gradient-to-br ${config.cardGradient} border border-white/20`}
      >
        {/* Background decorative glows */}
        <div className="absolute -right-16 -top-16 w-52 h-52 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        {/* Card Header: Brand & Chip */}
        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest uppercase text-white/80 font-mono">
                VI TÍNH AN TÂM
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-xs border border-white/30">
                MEMBER PASS
              </span>
            </div>
            <p className="text-[11px] text-white/60 tracking-wider mt-0.5">
              Hệ Thống PC Đồng Bộ & Laptop Doanh Nghiệp
            </p>
          </div>

          {/* Micro Chip Graphic */}
          <div className="flex flex-col items-end">
            <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 via-amber-300 to-yellow-500 shadow-inner flex items-center justify-center p-1 border border-yellow-200/50">
              <div className="w-full h-full border border-amber-600/40 rounded-xs grid grid-cols-2 gap-0.5 opacity-60">
                <div className="border-r border-b border-amber-800/40" />
                <div className="border-b border-amber-800/40" />
                <div className="border-r border-amber-800/40" />
                <div />
              </div>
            </div>
            <span className="text-[9px] font-mono tracking-widest text-white/50 mt-1 uppercase">
              RFID SMART
            </span>
          </div>
        </div>

        {/* Card Body: Member Tier & Privileges */}
        <div className="my-6 relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-1 rounded-lg bg-white/15 backdrop-blur-xs">
              <Award className="w-5 h-5 text-amber-300" />
            </div>
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase font-sans">
              {config.label}
            </span>
            {config.discountRate > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-md">
                GIẢM {config.discountPercentText}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-white/80">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>
              {config.discountRate > 0
                ? `Đặc quyền chiết khấu trực tiếp ${config.discountPercentText} mọi đơn hàng`
                : 'Đặc quyền chăm sóc định kỳ & hỗ trợ kỹ thuật trọn đời'}
            </span>
          </div>
        </div>

        {/* Card Footer: Customer Name, Code, Spend */}
        <div className="pt-4 border-t border-white/15 flex items-end justify-between relative z-10">
          <div>
            <div className="text-[10px] text-white/60 uppercase font-mono tracking-wider">
              {isEn ? 'CARDHOLDER' : 'CHỦ THẺ'}
            </div>
            <div className="text-base sm:text-lg font-black tracking-wide text-white uppercase font-sans">
              {customer.full_name || customer.name || 'QUÝ KHÁCH HÀNG'}
            </div>
            <div className="text-xs font-mono tracking-widest text-white/70 mt-0.5">
              {customerCode}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-white/60 uppercase font-mono tracking-wider">
              {isEn ? 'TOTAL SPENT' : 'TÍCH LŨY'}
            </div>
            <div className="text-sm sm:text-base font-black text-amber-300 font-mono">
              {formatVND(totalSpent)}
            </div>
          </div>
        </div>
      </div>

      {/* Tier Progress Bar Card */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 font-sans">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Tiến Độ Thăng Hạng Thành Viên</span>
          </div>
          <span className="font-mono font-bold text-slate-600 text-[11px]">
            {progress.progressPercent}%
          </span>
        </div>

        {/* Progress bar track */}
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 via-emerald-500 to-amber-500 transition-all duration-500"
            style={{ width: `${progress.progressPercent}%` }}
          />
        </div>

        {/* Status description */}
        {progress.isMaxTier ? (
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-start gap-2 text-xs text-purple-900">
            <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Đã đạt hạng tối đa VVIP (Khách Hàng Kim Cương)</p>
              <p className="text-[11px] text-purple-700 mt-0.5">
                Quý khách được hưởng đặc quyền chiết khấu cao nhất 5% trọn đời và dịch vụ cứu hộ kỹ thuật ưu tiên 1-1!
              </p>
            </div>
          </div>
        ) : progress.nextTier ? (
          <div className="flex items-start justify-between gap-3 text-xs text-slate-600 pt-1">
            <div>
              <p>
                Tích lũy thêm{' '}
                <strong className="text-rose-600 font-mono font-bold">
                  {formatVND(progress.amountNeeded)}
                </strong>{' '}
                để nâng hạng lên{' '}
                <strong className="text-slate-900 font-bold uppercase">
                  {CRM_TIER_CONFIG[progress.nextTier].label}
                </strong>
                .
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Ưu đãi nâng hạng: Chiết khấu{' '}
                <strong className="text-emerald-700 font-bold">
                  {CRM_TIER_CONFIG[progress.nextTier].discountPercentText}
                </strong>{' '}
                trực tiếp trên mọi đơn hàng kế tiếp.
              </p>
            </div>
            <span className="shrink-0 p-1.5 rounded-lg bg-slate-100 text-slate-600">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
        ) : null}

        {/* Downgrade protection notice */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Gift className="w-3.5 h-3.5 text-amber-500" />
            <span>Hạng Thành Viên được bảo lưu vĩnh viễn</span>
          </span>
          {customer.last_purchase_date && (
            <span className="font-mono text-slate-400 text-[10px]">
              Giao dịch gần nhất: {new Date(customer.last_purchase_date).toLocaleDateString('vi-VN')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
