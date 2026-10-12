'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useViTinhAnTamStore } from '@/lib/store';
import { formatVND, supabase, isSupabaseConfigured } from '@/lib/supabase';
import { OrderSuccessQrCard } from '@/components/public/OrderSuccessQrCard';
import {
  Check,
  ChevronRight,
  QrCode,
  Banknote,
  Store,
  Truck,
  CheckCircle2,
  ArrowLeft,
  Phone,
  ShieldCheck,
  Copy,
  Sparkles,
  Building,
  MessageCircle,
} from 'lucide-react';

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------
type PaymentMethod = 'qr' | 'cash' | null;
type DeliveryMethod = 'pickup' | 'delivery' | null;
type Step = 'payment' | 'delivery' | 'confirm' | 'success';

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------
export default function MuaHangClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { systemSettings, currentLang } = useViTinhAnTamStore();
  const isEn = currentLang === 'en';

  const deviceName = searchParams.get('device') || (isEn ? 'Selected Computer' : 'Máy tính tuyển chọn');
  const devicePrice = Number(searchParams.get('price')) || 0;
  const deviceTag = searchParams.get('tag') || '';

  // Step state
  const [step, setStep] = useState<Step>('payment');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(null);

  // Customer info (for delivery step)
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNote, setCustomerNote] = useState('');

  // Order submission
  const [orderCode] = useState(() => `#AT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const submitOrder = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    const orderPayload = {
      order_code: orderCode,
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      customer_address: customerAddress.trim(),
      device_name: deviceName.trim(),
      device_price: devicePrice,
      device_tag: deviceTag.trim(),
      payment_method: paymentMethod,
      delivery_method: deliveryMethod,
      note: customerNote.trim(),
      status: 'pending',
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        // Dự phòng ghi trực tiếp Supabase từ client nếu API trả về lỗi
        if (isSupabaseConfigured() && supabase) {
          const { error: sbErr } = await supabase.from('orders').insert([orderPayload]);
          if (sbErr) throw new Error(sbErr.message);
        } else {
          throw new Error(isEn ? 'Failed to place order' : 'Đặt hàng thất bại, vui lòng thử lại.');
        }
      }
      setStep('success');
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Đặt hàng thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  // QR Code Image Helper
  const getQrImageUrl = () => {
    if (systemSettings.paymentQrUrl?.trim()) {
      return systemSettings.paymentQrUrl.trim();
    }
    const acc = systemSettings.bankAccountNumber?.trim() || '0909053058';
    const bank = systemSettings.bankName?.trim() || 'MB Bank';
    const name = systemSettings.bankAccountName?.trim() || 'VI TINH AN TAM';
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
      `STK:${acc}|NH:${bank}|TEN:${name}|TIEN:${devicePrice}`
    )}`;
  };

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // ------------------------------------------------------------------
  // Step indicators
  // ------------------------------------------------------------------
  const steps: { id: Step; label: string }[] = [
    { id: 'payment', label: isEn ? 'Payment' : 'Thanh toán' },
    { id: 'delivery', label: isEn ? 'Delivery' : 'Nhận hàng' },
    { id: 'confirm', label: isEn ? 'Confirm' : 'Xác nhận' },
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
            <span>{step === 'payment' ? (isEn ? 'Back' : 'Quay lại') : (isEn ? 'Previous Step' : 'Bước trước')}</span>
          </button>
          <span className="text-xs font-bold text-[#2B1810]">{isEn ? 'PURCHASE ORDER' : 'ĐẶT MUA MÁY'}</span>
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
            <div className="text-[10px] uppercase tracking-wider text-[#C0392B] font-bold mb-0.5">
              {isEn ? 'Selected Computer' : 'Sản phẩm đặt mua'}
            </div>
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
            <h2 className="text-base font-black text-[#2B1810]">
              {isEn ? 'Select Payment Method' : 'Chọn hình thức thanh toán'}
            </h2>

            {/* QR Code / Chuyển khoản */}
            <div
              onClick={() => setPaymentMethod('qr')}
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
                  <h3 className="text-sm font-bold text-[#2B1810]">
                    {isEn ? 'VietQR Code / Bank Transfer' : 'Thanh toán QR Code'}
                  </h3>
                  {paymentMethod === 'qr' && <Check className="w-4 h-4 text-[#C0392B]" />}
                </div>
                <p className="text-xs text-[#6E5D53] mt-0.5 leading-snug">
                  {isEn
                    ? 'Scan VietQR code using mobile banking apps, MoMo, or ZaloPay. Instant confirmation.'
                    : 'Quét mã VietQR qua app ngân hàng, ví MoMo, ZaloPay. Xác nhận tức thì.'}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['VietQR', 'MoMo', 'ZaloPay', 'BIDV', 'Vietcombank', 'MB Bank'].map((b) => (
                    <span key={b} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium border border-slate-200">{b}</span>
                  ))}
                </div>

                {/* Thông tin tài khoản & QR Preview khi chọn QR */}
                {paymentMethod === 'qr' && (
                  <div className="mt-3.5 pt-3 border-t border-slate-100 bg-[#FAF7F2] p-3 rounded-lg border border-[#E8E2D9] space-y-2.5">
                    <div className="flex items-center gap-3">
                      <div className="p-1 bg-white rounded-lg border border-slate-200 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getQrImageUrl()}
                          alt="QR Code Thanh toán"
                          className="w-16 h-16 object-contain rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0 text-xs space-y-0.5">
                        <div className="font-bold text-[#2B1810] flex items-center gap-1.5">
                          <span>{systemSettings.bankName || 'MB Bank'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono font-bold text-[#C0392B]">
                          <span>{systemSettings.bankAccountNumber || '0909053058'}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(systemSettings.bankAccountNumber || '0909053058', 'acc_step1');
                            }}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 flex items-center gap-0.5 font-sans"
                          >
                            <Copy className="w-2.5 h-2.5" />
                            <span>
                              {isEn
                                ? copiedField === 'acc_step1'
                                  ? 'Copied'
                                  : 'Copy'
                                : copiedField === 'acc_step1'
                                ? 'Đã chép'
                                : 'Sao chép'}
                            </span>
                          </button>
                        </div>
                        <div className="text-[11px] text-[#6E5D53] font-semibold uppercase truncate">
                          {systemSettings.bankAccountName || 'VI TINH AN TAM'}
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] text-[#6E5D53] italic leading-tight">
                      {systemSettings.paymentQrNote || 'Quét mã QR qua app ngân hàng để chuyển khoản thanh toán nhanh chóng.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Tiền mặt / Thanh toán tại cửa hàng */}
            <div
              onClick={() => setPaymentMethod('cash')}
              className={`bg-white rounded-xl border-2 cursor-pointer transition-all p-4 flex items-start gap-3.5 ${paymentMethod === 'cash'
                ? 'border-[#C0392B] shadow-md shadow-[#C0392B]/10'
                : 'border-[#E8E2D9] hover:border-[#C0392B]/50'
                }`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${paymentMethod === 'cash' ? 'bg-[#C0392B]' : 'bg-[#FAF7F2]'}`}>
                <Banknote className={`w-5 h-5 ${paymentMethod === 'cash' ? 'text-white' : 'text-[#C0392B]'}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#2B1810]">
                    {isEn ? 'Cash at Showroom' : 'Tiền mặt tại cửa hàng'}
                  </h3>
                  {paymentMethod === 'cash' && <Check className="w-4 h-4 text-[#C0392B]" />}
                </div>
                <p className="text-xs text-[#6E5D53] mt-0.5 leading-snug">
                  {isEn
                    ? 'Pay cash directly when picking up your computer at the showroom. Staff will issue a VAT invoice on the spot.'
                    : 'Thanh toán tiền mặt trực tiếp khi nhận máy tại cửa hàng. Nhân viên xuất hóa đơn VAT ngay tại chỗ.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (!paymentMethod) return;
                setStep('delivery');
              }}
              disabled={!paymentMethod}
              className="w-full py-4 rounded-xl bg-[#C0392B] hover:bg-[#A93226] disabled:opacity-40 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <span>{isEn ? 'Continue' : 'Tiếp tục'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 2: CHỌN NHẬN HÀNG */}
        {/* ============================================================ */}
        {step === 'delivery' && (
          <div className="space-y-3">
            <h2 className="text-base font-black text-[#2B1810]">
              {isEn ? 'Select Delivery Method' : 'Chọn hình thức nhận hàng'}
            </h2>

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
                  <h3 className="text-sm font-bold text-[#2B1810]">
                    {isEn ? 'Pick Up at Showroom' : 'Mua tại cửa hàng'}
                  </h3>
                  {deliveryMethod === 'pickup' && <Check className="w-4 h-4 text-[#C0392B]" />}
                </div>
                <p className="text-xs text-[#6E5D53] mt-1 leading-snug">
                  {systemSettings.address || (isEn ? '52 Nguyen Cuu Van, Long An Ward, Tay Ninh' : '52 Nguyễn Cửu Vân, p. Long An, tỉnh Tây Ninh')}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                    {isEn ? 'Free Car Parking' : 'Có bãi đỗ xe'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#FBE8DE] text-[#C0392B] font-semibold border border-[#F2C4B2]">
                    {isEn ? 'Instant VAT Invoice' : 'Xuất hóa đơn ngay'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                    {isEn ? 'On-site Handover Dossier' : 'Bàn giao hồ sơ tại chỗ'}
                  </span>
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
                    <h3 className="text-sm font-bold text-[#2B1810]">
                      {isEn ? 'On-Site Delivery & Setup' : 'Giao hàng tận nơi'}
                    </h3>
                    {deliveryMethod === 'delivery' && <Check className="w-4 h-4 text-[#C0392B]" />}
                  </div>
                  <p className="text-xs text-[#6E5D53] mt-1 leading-snug">
                    {isEn
                      ? 'Personal delivery and on-site testing scheduled at your convenience.'
                      : 'Hỗ trợ giao máy và kiểm tra tận nơi theo lịch hẹn.'}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#FBE8DE] text-[#C0392B] font-semibold border border-[#F2C4B2]">
                      {isEn ? 'Doorstep Handover' : 'Giao máy tận nơi'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                      {isEn ? 'Inspection at Your Location' : 'Kiểm tra máy tại nhà'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery address form */}
              {deliveryMethod === 'delivery' && (
                <div className="mt-4 pt-3 border-t border-[#E8E2D9] space-y-3">
                  <div className="text-[11px] font-bold text-[#6E5D53] uppercase tracking-wide">
                    {isEn ? 'Delivery Address:' : 'Địa chỉ giao hàng:'}
                  </div>
                  <div>
                    <label className="text-xs text-[#6E5D53] mb-1 block">
                      {isEn ? 'Delivery Address *' : 'Địa chỉ giao hàng *'}
                    </label>
                    <input
                      type="text"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder={isEn ? 'House number, street name, area...' : 'Số nhà, đường, khu vực của bạn...'}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E2D9] text-sm bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C0392B]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Contact info (luôn hiển thị để xác nhận đơn hàng) */}
            {deliveryMethod && (
              <div className="bg-white rounded-xl border border-[#E8E2D9] p-4 space-y-3">
                <div className="text-[11px] font-bold text-[#6E5D53] uppercase tracking-wide">
                  {isEn ? 'Contact Information:' : 'Thông tin liên hệ:'}
                </div>
                <div>
                  <label className="text-xs text-[#6E5D53] mb-1 block">
                    {isEn ? 'Full Name *' : 'Họ và tên *'}
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={isEn ? 'e.g. John Doe / Nguyen Van An' : 'Nguyễn Văn An'}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E2D9] text-sm bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C0392B]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#6E5D53] mb-1 block">
                    {isEn ? 'Phone Number *' : 'Số điện thoại *'}
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0909 053 058"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E2D9] text-sm bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C0392B]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#6E5D53] mb-1 block">
                    {isEn ? 'Order Note (Optional)' : 'Ghi chú thêm (Không bắt buộc)'}
                  </label>
                  <textarea
                    rows={2}
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    placeholder={isEn ? 'Specific delivery time, software requests...' : 'Giao giờ hành chính, cài đặt phần mềm...'}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E2D9] text-sm bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C0392B] resize-none"
                  />
                </div>
              </div>
            )}

            <button
              onClick={() => {
                if (!deliveryMethod) return;
                if (!customerName.trim() || !customerPhone.trim()) return;
                if (deliveryMethod === 'delivery' && !customerAddress.trim()) return;
                setStep('confirm');
              }}
              disabled={
                !deliveryMethod ||
                !customerName.trim() ||
                !customerPhone.trim() ||
                (deliveryMethod === 'delivery' && !customerAddress.trim())
              }
              className="w-full py-4 rounded-xl bg-[#C0392B] hover:bg-[#A93226] disabled:opacity-40 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <span>{isEn ? 'Review Order Summary' : 'Xem xác nhận đơn hàng'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 3: XÁC NHẬN ĐƠN HÀNG */}
        {/* ============================================================ */}
        {step === 'confirm' && (
          <div className="space-y-4">
            <h2 className="text-base font-black text-[#2B1810]">
              {isEn ? 'Order Confirmation' : 'Xác nhận đơn hàng'}
            </h2>

            <div className="bg-white rounded-xl border border-[#E8E2D9] divide-y divide-[#E8E2D9] overflow-hidden shadow-xs">
              {/* Product */}
              <div className="p-4 space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-[#6E5D53] font-bold">
                  {isEn ? 'Product' : 'Sản phẩm'}
                </div>
                <div className="text-sm font-bold text-[#2B1810]">{deviceName}</div>
                {deviceTag && <div className="text-xs text-slate-500 font-mono">S/N: {deviceTag}</div>}
                {devicePrice > 0 && <div className="text-base font-bold text-[#C0392B] font-mono">{formatVND(devicePrice)}</div>}
              </div>

              {/* Payment */}
              <div className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-[#6E5D53] font-bold">
                    {isEn ? 'Payment' : 'Thanh toán'}
                  </div>
                  <div className="text-sm font-semibold text-[#2B1810] mt-0.5">
                    {paymentMethod === 'qr' && (isEn ? `VietQR Code / Bank Transfer (${systemSettings.bankName || 'Bank'} - ${systemSettings.bankAccountNumber || ''})` : `QR Code / Chuyển khoản (${systemSettings.bankName || 'Ngân hàng'} - STK: ${systemSettings.bankAccountNumber || ''})`)}
                    {paymentMethod === 'cash' && (isEn ? 'Cash at Showroom' : 'Tiền mặt tại cửa hàng')}
                  </div>
                </div>
                <button onClick={() => setStep('payment')} className="text-xs text-[#C0392B] font-semibold hover:underline">
                  {isEn ? 'Edit' : 'Sửa'}
                </button>
              </div>

              {/* Delivery */}
              <div className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-[#6E5D53] font-bold">
                    {isEn ? 'Delivery' : 'Nhận hàng'}
                  </div>
                  <div className="text-sm font-semibold text-[#2B1810] mt-0.5">
                    {deliveryMethod === 'pickup' && (isEn ? `Showroom Pickup — ${systemSettings.address || '52 Nguyen Cuu Van, Long An Ward, Tay Ninh'}` : `Mua tại cửa hàng — ${systemSettings.address || '52 Nguyễn Cửu Vân, P. Long An, tỉnh Tây Ninh'}`)}
                    {deliveryMethod === 'delivery' && (
                      <>
                        <span>{isEn ? 'Doorstep Delivery' : 'Giao hàng tận nơi'}</span>
                        {customerAddress && <span className="block text-xs text-[#6E5D53]">{customerAddress}</span>}
                      </>
                    )}
                  </div>
                  {customerName && (
                    <div className="text-xs text-[#6E5D53] mt-0.5">{customerName} • {customerPhone}</div>
                  )}
                </div>
                <button onClick={() => setStep('delivery')} className="text-xs text-[#C0392B] font-semibold hover:underline">
                  {isEn ? 'Edit' : 'Sửa'}
                </button>
              </div>
            </div>

            {/* Warranty note */}
            <div className="bg-[#FBE8DE] border border-[#F2C4B2] rounded-xl p-4 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#C0392B] shrink-0 mt-0.5" />
              {isEn ? (
                <div className="text-xs text-[#6E5D53] leading-relaxed">
                  <strong className="text-[#2B1810]">Warranty &amp; Support:</strong> Every computer comes with a clear warranty receipt. Both brand-new and tested pulled components are 100% transparent. In case of issues, we respond promptly to keep your workflow uninterrupted.
                </div>
              ) : (
                <div className="text-xs text-[#6E5D53] leading-relaxed">
                  <strong className="text-[#2B1810]">Bảo hành &amp; Hỗ trợ:</strong> Máy đi kèm phiếu bảo hành rõ ràng, linh kiện mới hay cũ bóc máy đều minh bạch thông tin. Nếu phát sinh sự cố, cửa hàng hỗ trợ xử lý nhanh chóng để không gián đoạn công việc của bạn.
                </div>
              )}
            </div>

            <button
              onClick={() => {
                submitOrder();
              }}
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-[#C0392B] hover:bg-[#A93226] disabled:opacity-50 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? (isEn ? 'Submitting order...' : 'Đang gửi đơn hàng...')
                  : (isEn ? 'Confirm Purchase Order' : 'Xác nhận đặt mua')}
              </span>
            </button>

            {submitError && (
              <p className="text-xs text-red-600 text-center font-semibold">{submitError}</p>
            )}

            <p className="text-[11px] text-[#6E5D53] text-center">
              {isEn
                ? 'After confirmation, an An Tam technician will contact you as soon as possible to arrange schedule and payment.'
                : 'Sau khi xác nhận, kỹ thuật viên An Tâm sẽ liên hệ trong thời gian nhanh nhất để thu xếp lịch hẹn và thanh toán.'}
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
              <h2 className="text-xl font-black text-[#2B1810]">
                {isEn ? 'Order Placed Successfully!' : 'Đặt mua thành công!'}
              </h2>
              <p className="text-xs text-[#6E5D53] mt-2">
                {isEn ? (
                  <>An Tam technician will contact you to verify <strong className="text-[#2B1810]">as soon as possible</strong>.</>
                ) : (
                  <>Kỹ thuật viên An Tâm sẽ liên hệ xác nhận trong <strong className="text-[#2B1810]">thời gian nhanh nhất</strong>.</>
                )}
              </p>
            </div>

            {/* Hiển thị mã QR thanh toán nếu chọn hình thức QR Code */}
            {paymentMethod === 'qr' && (
              <OrderSuccessQrCard
                systemSettings={systemSettings}
                devicePrice={devicePrice}
                orderCode={orderCode}
                customerPhone={customerPhone}
                isEn={isEn}
                copiedField={copiedField}
                copyToClipboard={copyToClipboard}
                getQrImageUrl={getQrImageUrl}
              />
            )}

            <div className="bg-[#FAF7F2] rounded-xl p-4 text-xs text-left space-y-2.5 border border-[#E8E2D9]">
              <div className="flex justify-between items-center border-b border-[#E8E2D9] pb-2">
                <span className="text-[#6E5D53]">{isEn ? 'Order Code:' : 'Mã đơn hàng:'}</span>
                <span className="font-mono font-black text-sm text-[#C0392B]">{orderCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E5D53]">{isEn ? 'Product:' : 'Sản phẩm:'}</span>
                <span className="font-semibold text-[#2B1810] text-right max-w-[200px] truncate">{deviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E5D53]">{isEn ? 'Payment:' : 'Thanh toán:'}</span>
                <span className="font-semibold text-[#2B1810]">
                  {paymentMethod === 'qr' && (isEn ? 'VietQR Code' : 'QR Code')}
                  {paymentMethod === 'cash' && (isEn ? 'Cash at Showroom' : 'Tiền mặt tại cửa hàng')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E5D53]">{isEn ? 'Delivery:' : 'Nhận hàng:'}</span>
                <span className="font-semibold text-[#2B1810]">
                  {deliveryMethod === 'pickup'
                    ? (isEn ? 'At Showroom' : 'Tại cửa hàng')
                    : (isEn ? 'Doorstep Delivery' : 'Giao tận nơi')}
                </span>
              </div>
              {devicePrice > 0 && (
                <div className="flex justify-between border-t border-[#E8E2D9] pt-2">
                  <span className="text-[#6E5D53] font-bold">{isEn ? 'Total Amount:' : 'Tổng tiền:'}</span>
                  <span className="font-bold text-[#C0392B] font-mono">{formatVND(devicePrice)}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2.5">
              <p className="text-xs text-[#6E5D53] text-center leading-relaxed">
                {isEn
                  ? 'The system has automatically notified the sales, admin, and technician teams to confirm your order.'
                  : 'Hệ thống đã tự động thông báo đến đội ngũ bán hàng, quản trị và kỹ thuật để xác nhận đơn hàng của bạn.'}
              </p>
              <Link
                href="/"
                className="w-full py-3 rounded-xl bg-[#FAF7F2] hover:bg-[#F0EBE3] text-[#2B1810] font-semibold text-sm flex items-center justify-center border border-[#E8E2D9] transition-all"
              >
                {isEn ? 'Back to Homepage' : 'Về trang chủ'}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
