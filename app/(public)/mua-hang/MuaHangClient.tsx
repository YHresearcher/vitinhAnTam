'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useViTinhAnTamStore } from '@/lib/store';
import { formatVND } from '@/lib/supabase';
import {
  Check,
  ChevronRight,
  CreditCard,
  QrCode,
  Banknote,
  Store,
  Truck,
  CheckCircle2,
  MessageCircle,
  ArrowLeft,
  Phone,
  ShieldCheck,
} from 'lucide-react';

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------
type PaymentMethod = 'qr' | 'installment' | null;
type DeliveryMethod = 'pickup' | 'delivery' | null;
type Step = 'payment' | 'delivery' | 'confirm' | 'success';

const INSTALLMENT_PARTNERS = [
  { id: 'home_credit', name: 'Home Credit', logo: '🏦', note: '0% lãi suất 6 tháng (duyệt nhanh 15 phút)' },
  { id: 'fecredit', name: 'FE Credit', logo: '💳', note: 'Trả góp linh hoạt 6-36 tháng' },
  { id: 'shinhan', name: 'Shinhan Finance', logo: '🏧', note: 'Lãi suất ưu đãi, không cần tài sản đảm bảo' },
];

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------
export default function MuaHangClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { systemSettings } = useViTinhAnTamStore();

  const deviceName = searchParams.get('device') || 'Máy tính tuyển chọn';
  const devicePrice = Number(searchParams.get('price')) || 0;
  const deviceTag = searchParams.get('tag') || '';

  // Step state
  const [step, setStep] = useState<Step>('payment');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [selectedInstallmentPartner, setSelectedInstallmentPartner] = useState<string | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(null);

  // Customer info (for delivery step)
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // Order success
  const [orderCode] = useState(() => `#AT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // ------------------------------------------------------------------
  // Step indicators
  // ------------------------------------------------------------------
  const steps: { id: Step; label: string }[] = [
    { id: 'payment', label: 'Thanh toán' },
    { id: 'delivery', label: 'Nhận hàng' },
    { id: 'confirm', label: 'Xác nhận' },
  ];
  const stepOrder: Step[] = ['payment', 'delivery', 'confirm', 'success'];
  const currentStepIndex = stepOrder.indexOf(step);

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Top bar */}
      <div className="bg-white border-b border-[#E8E2D9] sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => {
              if (step === 'payment') router.back();
              else {
                const prev = stepOrder[stepOrder.indexOf(step) - 1];
                setStep(prev as Step);
              }
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#6E5D53] hover:text-[#2B1810] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{step === 'payment' ? 'Quay lại' : 'Bước trước'}</span>
          </button>
          <span className="text-xs font-bold text-[#2B1810]">ĐẶT MUA MÁY</span>
          <a
            href={`tel:${(systemSettings.hotline || '0909053058').replace(/\./g, '')}`}
            className="flex items-center gap-1 text-xs font-semibold text-[#C0392B]"
          >
            <Phone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{systemSettings.hotline || '0909.053.058'}</span>
          </a>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Product summary card */}
        <div className="bg-white rounded-xl border border-[#E8E2D9] p-4 flex items-start gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-[#FBE8DE] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#C0392B]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-[#C0392B] font-bold mb-0.5">Sản phẩm đặt mua</div>
            <div className="text-sm font-bold text-[#2B1810] truncate">{deviceName}</div>
            {deviceTag && (
              <div className="text-[11px] text-slate-500 font-mono">S/N: {deviceTag}</div>
            )}
          </div>
          {devicePrice > 0 && (
            <div className="text-base font-bold text-[#C0392B] font-mono shrink-0">{formatVND(devicePrice)}</div>
          )}
        </div>

        {/* Step Progress (only before success) */}
        {step !== 'success' && (
          <div className="flex items-center gap-0">
            {steps.map((s, idx) => {
              const isActive = s.id === step;
              const isDone = stepOrder.indexOf(s.id) < currentStepIndex;
              return (
                <React.Fragment key={s.id}>
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${isDone
                        ? 'bg-emerald-600 text-white'
                        : isActive
                          ? 'bg-[#C0392B] text-white'
                          : 'bg-white border-2 border-[#E8E2D9] text-[#6E5D53]'
                        }`}
                    >
                      {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <span className={`text-[10px] font-semibold ${isActive ? 'text-[#C0392B]' : isDone ? 'text-emerald-600' : 'text-[#6E5D53]'}`}>
                      {s.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 rounded-full mb-4 ${isDone ? 'bg-emerald-500' : 'bg-[#E8E2D9]'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 1: CHỌN THANH TOÁN */}
        {/* ============================================================ */}
        {step === 'payment' && (
          <div className="space-y-3">
            <h2 className="text-base font-black text-[#2B1810]">Chọn hình thức thanh toán</h2>

            {/* QR Code / Chuyển khoản */}
            <div
              onClick={() => { setPaymentMethod('qr'); setSelectedInstallmentPartner(null); }}
              className={`bg-white rounded-xl border-2 cursor-pointer transition-all p-4 flex items-start gap-3.5 ${paymentMethod === 'qr'
                ? 'border-[#C0392B] shadow-md shadow-[#C0392B]/10'
                : 'border-[#E8E2D9] hover:border-[#C0392B]/50'
                }`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${paymentMethod === 'qr' ? 'bg-[#C0392B]' : 'bg-[#FAF7F2]'}`}>
                <QrCode className={`w-5 h-5 ${paymentMethod === 'qr' ? 'text-white' : 'text-[#C0392B]'}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#2B1810]">Thanh toán QR Code</h3>
                  {paymentMethod === 'qr' && <Check className="w-4 h-4 text-[#C0392B]" />}
                </div>
                <p className="text-xs text-[#6E5D53] mt-0.5 leading-snug">
                  Quét mã VietQR qua app ngân hàng, ví MoMo, ZaloPay. Xác nhận tức thì.
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['VietQR', 'MoMo', 'ZaloPay', 'BIDV', 'Vietcombank'].map((b) => (
                    <span key={b} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium border border-slate-200">{b}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Tiền mặt */}
            <div
              onClick={() => { setPaymentMethod('installment'); setSelectedInstallmentPartner(null); }}
              className={`bg-white rounded-xl border-2 cursor-pointer transition-all p-4 ${paymentMethod === 'installment'
                ? 'border-[#C0392B] shadow-md shadow-[#C0392B]/10'
                : 'border-[#E8E2D9] hover:border-[#C0392B]/50'
                }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${paymentMethod === 'installment' ? 'bg-[#C0392B]' : 'bg-[#FAF7F2]'}`}>
                  <Banknote className={`w-5 h-5 ${paymentMethod === 'installment' ? 'text-white' : 'text-[#C0392B]'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#2B1810]">Trả góp qua công ty tài chính</h3>
                    {paymentMethod === 'installment' && <Check className="w-4 h-4 text-[#C0392B]" />}
                  </div>
                  <p className="text-xs text-[#6E5D53] mt-0.5 leading-snug">
                    Duyệt nhanh 15 -60 phút, không cần tài sản đảm bảo. Kì hạn 6-36 tháng.
                  </p>
                </div>
              </div>

              {/* Installment partner options */}
              {paymentMethod === 'installment' && (
                <div className="mt-4 pt-3 border-t border-[#E8E2D9] space-y-2">
                  <div className="text-[11px] font-bold text-[#6E5D53] uppercase tracking-wide">Chọn đối tác tài chính:</div>
                  {INSTALLMENT_PARTNERS.map((partner) => (
                    <div
                      key={partner.id}
                      onClick={(e) => { e.stopPropagation(); setSelectedInstallmentPartner(partner.id); }}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedInstallmentPartner === partner.id
                        ? 'border-[#C0392B] bg-[#FBE8DE]'
                        : 'border-[#E8E2D9] bg-white hover:border-[#C0392B]/50'
                        }`}
                    >
                      <span className="text-xl">{partner.logo}</span>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-[#2B1810]">{partner.name}</div>
                        <div className="text-[11px] text-[#6E5D53]">{partner.note}</div>
                      </div>
                      {selectedInstallmentPartner === partner.id && (
                        <Check className="w-4 h-4 text-[#C0392B] shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tiền mặt tại quầy */}
            <div className="bg-white rounded-xl border border-[#E8E2D9] p-3 flex items-center gap-2.5">
              <CreditCard className="w-4 h-4 text-[#6E5D53] shrink-0" />
              <p className="text-xs text-[#6E5D53]">
                Hoặc <strong className="text-[#2B1810]">thanh toán tiền mặt / thẻ ngân hàng trực tiếp</strong> tại cửa hàng.
              </p>
            </div>

            <button
              onClick={() => {
                if (!paymentMethod) return;
                if (paymentMethod === 'installment' && !selectedInstallmentPartner) return;
                setStep('delivery');
              }}
              disabled={!paymentMethod || (paymentMethod === 'installment' && !selectedInstallmentPartner)}
              className="w-full py-4 rounded-xl bg-[#C0392B] hover:bg-[#A93226] disabled:opacity-40 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <span>Tiếp tục</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 2: CHỌN NHẬN HÀNG */}
        {/* ============================================================ */}
        {step === 'delivery' && (
          <div className="space-y-3">
            <h2 className="text-base font-black text-[#2B1810]">Chọn hình thức nhận hàng</h2>

            {/* Mua tại cửa hàng */}
            <div
              onClick={() => setDeliveryMethod('pickup')}
              className={`bg-white rounded-xl border-2 cursor-pointer transition-all p-4 flex items-start gap-3.5 ${deliveryMethod === 'pickup'
                ? 'border-[#C0392B] shadow-md shadow-[#C0392B]/10'
                : 'border-[#E8E2D9] hover:border-[#C0392B]/50'
                }`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${deliveryMethod === 'pickup' ? 'bg-[#C0392B]' : 'bg-[#FAF7F2]'}`}>
                <Store className={`w-5 h-5 ${deliveryMethod === 'pickup' ? 'text-white' : 'text-[#C0392B]'}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#2B1810]">Mua tại cửa hàng</h3>
                  {deliveryMethod === 'pickup' && <Check className="w-4 h-4 text-[#C0392B]" />}
                </div>
                <p className="text-xs text-[#6E5D53] mt-1 leading-snug">
                  52 Nguyễn Cửu Vân, p. Long An, tỉnh Tây Ninh

                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">Có bãi đỗ xe</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#FBE8DE] text-[#C0392B] font-semibold border border-[#F2C4B2]">Xuất hóa đơn ngay</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold border border-amber-200">Bàn giao hồ sơ tại chỗ</span>
                </div>
              </div>
            </div>

            {/* Giao hàng tận nơi */}
            <div
              onClick={() => setDeliveryMethod('delivery')}
              className={`bg-white rounded-xl border-2 cursor-pointer transition-all p-4 ${deliveryMethod === 'delivery'
                ? 'border-[#C0392B] shadow-md shadow-[#C0392B]/10'
                : 'border-[#E8E2D9] hover:border-[#C0392B]/50'
                }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${deliveryMethod === 'delivery' ? 'bg-[#C0392B]' : 'bg-[#FAF7F2]'}`}>
                  <Truck className={`w-5 h-5 ${deliveryMethod === 'delivery' ? 'text-white' : 'text-[#C0392B]'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#2B1810]">Giao hàng tận nơi</h3>
                    {deliveryMethod === 'delivery' && <Check className="w-4 h-4 text-[#C0392B]" />}
                  </div>
                  <p className="text-xs text-[#6E5D53] mt-1 leading-snug">
                    Hỏa tốc 2 giờ tại TP. Tân An.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#FBE8DE] text-[#C0392B] font-semibold border border-[#F2C4B2]">Hỏa tốc 2H (&lt;5km)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">Kiểm tra máy tại nhà</span>
                  </div>
                </div>
              </div>

              {/* Delivery address form */}
              {deliveryMethod === 'delivery' && (
                <div className="mt-4 pt-3 border-t border-[#E8E2D9] space-y-3">
                  <div className="text-[11px] font-bold text-[#6E5D53] uppercase tracking-wide">Thông tin giao hàng:</div>
                  <div>
                    <label className="text-xs text-[#6E5D53] mb-1 block">Họ và tên *</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nguyễn Văn An"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E2D9] text-sm bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C0392B]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#6E5D53] mb-1 block">Số điện thoại *</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="0909 053 058"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E2D9] text-sm bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C0392B]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#6E5D53] mb-1 block">Địa chỉ giao hàng *</label>
                    <input
                      type="text"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Số nhà, đường, phường, TP. Tân An..."
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E2D9] text-sm bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C0392B]"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                if (!deliveryMethod) return;
                if (deliveryMethod === 'delivery' && (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim())) return;
                setStep('confirm');
              }}
              disabled={
                !deliveryMethod ||
                (deliveryMethod === 'delivery' && (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()))
              }
              className="w-full py-4 rounded-xl bg-[#C0392B] hover:bg-[#A93226] disabled:opacity-40 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <span>Xem xác nhận đơn hàng</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 3: XÁC NHẬN ĐƠN HÀNG */}
        {/* ============================================================ */}
        {step === 'confirm' && (
          <div className="space-y-4">
            <h2 className="text-base font-black text-[#2B1810]">Xác nhận đơn hàng</h2>

            <div className="bg-white rounded-xl border border-[#E8E2D9] divide-y divide-[#E8E2D9] overflow-hidden shadow-xs">
              {/* Product */}
              <div className="p-4 space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-[#6E5D53] font-bold">Sản phẩm</div>
                <div className="text-sm font-bold text-[#2B1810]">{deviceName}</div>
                {deviceTag && <div className="text-xs text-slate-500 font-mono">S/N: {deviceTag}</div>}
                {devicePrice > 0 && <div className="text-base font-bold text-[#C0392B] font-mono">{formatVND(devicePrice)}</div>}
              </div>

              {/* Payment */}
              <div className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-[#6E5D53] font-bold">Thanh toán</div>
                  <div className="text-sm font-semibold text-[#2B1810] mt-0.5">
                    {paymentMethod === 'qr' && 'QR Code / Chuyển khoản'}
                    {paymentMethod === 'installment' && `Trả góp — ${INSTALLMENT_PARTNERS.find(p => p.id === selectedInstallmentPartner)?.name || ''}`}
                  </div>
                </div>
                <button onClick={() => setStep('payment')} className="text-xs text-[#C0392B] font-semibold hover:underline">Sửa</button>
              </div>

              {/* Delivery */}
              <div className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-[#6E5D53] font-bold">Nhận hàng</div>
                  <div className="text-sm font-semibold text-[#2B1810] mt-0.5">
                    {deliveryMethod === 'pickup' && 'Mua tại cửa hàng — 45 Nguyễn Huệ, P.1, Tân An'}
                    {deliveryMethod === 'delivery' && (
                      <>
                        Giao tận nơi (hỏa tốc 2H)
                        {customerAddress && <span className="block text-xs text-[#6E5D53]">{customerAddress}</span>}
                      </>
                    )}
                  </div>
                  {deliveryMethod === 'delivery' && customerName && (
                    <div className="text-xs text-[#6E5D53] mt-0.5">{customerName} • {customerPhone}</div>
                  )}
                </div>
                <button onClick={() => setStep('delivery')} className="text-xs text-[#C0392B] font-semibold hover:underline">Sửa</button>
              </div>
            </div>

            {/* Warranty note */}
            <div className="bg-[#FBE8DE] border border-[#F2C4B2] rounded-xl p-4 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#C0392B] shrink-0 mt-0.5" />
              <div className="text-xs text-[#6E5D53] leading-relaxed">
                <strong className="text-[#2B1810]">Bảo hành đi kèm:</strong> Máy đi kèm phiếu bảo hành 12 tháng, SSD/RAM mới 100% bảo hành 36 tháng hãng. Đổi mới 1:1 tận nơi trong 2 giờ nếu có sự cố phần cứng.
              </div>
            </div>

            <button
              onClick={() => setStep('success')}
              className="w-full py-4 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Xác nhận đặt mua</span>
            </button>

            <p className="text-[11px] text-[#6E5D53] text-center">
              Sau khi xác nhận, kỹ thuật viên sẽ liên hệ trong 10 phút để thu xếp lịch hẹn và thanh toán.
            </p>
          </div>
        )}

        {/* ============================================================ */}
        {/* SUCCESS */}
        {/* ============================================================ */}
        {step === 'success' && (
          <div className="bg-white rounded-2xl border border-emerald-200 shadow-lg p-6 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#2B1810]">Đặt mua thành công!</h2>
              <p className="text-xs text-[#6E5D53] mt-2">
                Kỹ thuật viên An Tâm sẽ liên hệ xác nhận trong vòng <strong className="text-[#2B1810]">10 phút</strong>.
              </p>
            </div>

            <div className="bg-[#FAF7F2] rounded-xl p-4 text-xs text-left space-y-2.5 border border-[#E8E2D9]">
              <div className="flex justify-between items-center border-b border-[#E8E2D9] pb-2">
                <span className="text-[#6E5D53]">Mã đơn hàng:</span>
                <span className="font-mono font-black text-sm text-[#C0392B]">{orderCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E5D53]">Sản phẩm:</span>
                <span className="font-semibold text-[#2B1810] text-right max-w-[200px] truncate">{deviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E5D53]">Thanh toán:</span>
                <span className="font-semibold text-[#2B1810]">
                  {paymentMethod === 'qr' && 'QR Code'}
                  {paymentMethod === 'installment' && `Trả góp — ${INSTALLMENT_PARTNERS.find(p => p.id === selectedInstallmentPartner)?.name || ''}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E5D53]">Nhận hàng:</span>
                <span className="font-semibold text-[#2B1810]">
                  {deliveryMethod === 'pickup' ? 'Tại cửa hàng' : 'Giao tận nơi'}
                </span>
              </div>
              {devicePrice > 0 && (
                <div className="flex justify-between border-t border-[#E8E2D9] pt-2">
                  <span className="text-[#6E5D53] font-bold">Tổng tiền:</span>
                  <span className="font-bold text-[#C0392B] font-mono">{formatVND(devicePrice)}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2.5">
              <a
                href={`${systemSettings.zaloLink || 'https://zalo.me/0909053058'}?text=${encodeURIComponent(`Chào An Tâm, tôi vừa đặt mua máy trên website:\n- Mã đơn: ${orderCode}\n- Máy: ${deviceName}\n- Thanh toán: ${paymentMethod === 'qr' ? 'QR Code' : 'Trả góp'}\n- Nhận: ${deliveryMethod === 'pickup' ? 'Tại cửa hàng' : `Giao tận nơi — ${customerAddress}`}\nNhờ xác nhận giúp tôi!`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-[#0068FF] hover:bg-[#0054d1] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Gửi xác nhận qua Zalo</span>
              </a>
              <Link
                href="/"
                className="w-full py-3 rounded-xl bg-[#FAF7F2] hover:bg-[#F0EBE3] text-[#2B1810] font-semibold text-sm flex items-center justify-center border border-[#E8E2D9] transition-all"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
