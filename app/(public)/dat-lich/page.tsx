'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useViTinhAnTamStore } from '@/lib/store';
import {
  Calendar,
  Clock,
  Phone,
  User,
  MapPin,
  Store,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  Bike,
  Sparkles,
} from 'lucide-react';

function AppointmentBookingContent() {
  const searchParams = useSearchParams();
  const prefilledService = searchParams.get('service') || '';
  const prefilledDevice = searchParams.get('device') || '';

  const { addServiceTicket, systemSettings } = useViTinhAnTamStore();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [locationType, setLocationType] = useState<'counter' | 'onsite'>('onsite');
  const [address, setAddress] = useState('');
  const [deviceType, setDeviceType] = useState(prefilledDevice || 'PC Đồng bộ Dell/HP');
  const [serviceNeeded, setServiceNeeded] = useState(prefilledService || '');
  const [appointmentDate, setAppointmentDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [timeSlot, setTimeSlot] = useState('Khung giờ vàng (17:30 - 21:00)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<{
    code: string;
    name: string;
    phone: string;
    date: string;
    slot: string;
    location: string;
    service: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (prefilledService && !serviceNeeded) {
      setServiceNeeded(prefilledService);
    }
    if (prefilledDevice) {
      setDeviceType(prefilledDevice);
    }
  }, [prefilledService, prefilledDevice]);

  const quickServices = [
    'Nâng cấp SSD NVMe Kingston 256GB (Tăng tốc x5)',
    'Spa làm mát tra keo Thermalright TF7 (Hạ 15-20°C)',
    'Cài lại Windows 10/11 Pro sạch không crack',
    'Máy tính bật không lên nguồn / Kêu tít tít',
    'Khắc phục máy chậm, đơ khi mở phần mềm MISA/Excel',
  ];

  const timeSlots = [
    { label: 'Sáng (08:00 - 11:30)', desc: 'Tiếp nhận giờ hành chính', icon: '🌅' },
    { label: 'Chiều (13:30 - 17:30)', desc: 'Xử lý trong ngày', icon: '🌤️' },
    { label: 'Khung giờ vàng (17:30 - 21:00)', desc: 'Ưu tiên cứu hộ sau giờ làm', icon: '⚡' },
    { label: 'Cứu hộ khẩn cấp (Trong 60 phút)', desc: 'Đội cơ động xuất phát ngay', icon: '🚨' },
  ];

  const handleSelectQuickService = (serv: string) => {
    if (serviceNeeded) {
      if (!serviceNeeded.includes(serv)) {
        setServiceNeeded(`${serviceNeeded}, ${serv}`);
      }
    } else {
      setServiceNeeded(serv);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !serviceNeeded.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ Họ tên, Số điện thoại và Nhu cầu dịch vụ!');
      return;
    }

    if (locationType === 'onsite' && !address.trim()) {
      setErrorMsg('Vui lòng nhập địa chỉ cụ thể tại Tân An hoặc các huyện lân cận (Long An - Tây Ninh)!');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const ticketCode = `#TK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      await addServiceTicket({
        ticket_code: ticketCode,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_address: address.trim() || 'Tại quầy 45 Nguyễn Huệ, P.1 Tân An',
        device_service_tag: 'ST-PENDING',
        device_name: deviceType,
        reception_mode: locationType === 'onsite' ? 'mobile' : 'counter',
        ticket_type: locationType === 'onsite' ? 'onsite' : 'counter',
        issue_description: `Khách đặt lịch hẹn: ${serviceNeeded || 'Kiểm tra máy tổng quát'}`,
        estimated_cost: locationType === 'onsite' ? 150000 : 100000,
        dispatch_address: locationType === 'onsite' ? address.trim() : undefined,
        technician_name: 'KTV Trực ca Long An',
        selected_services: [
          {
            id: 'srv-booking',
            name: serviceNeeded,
            price: locationType === 'onsite' ? 150000 : 100000,
            warranty_tier: 'Tận nơi trong 2 giờ',
          },
        ],
        multi_tier_warranty: {
          chassis_months: 12,
          ssd_months: 36,
          ram_months: 36,
          software_days: 30,
        },
        total_amount: locationType === 'onsite' ? 150000 : 100000,
        visual_condition: 'Tiếp nhận qua hệ thống đặt lịch Online',
        status: 'processing',
        technician_note: `Lịch hẹn: ${appointmentDate} (${timeSlot})`,
        estimated_completion: `${timeSlot} - ${appointmentDate}`,
      });

      setBookingSuccess({
        code: ticketCode,
        name: customerName,
        phone: customerPhone,
        date: appointmentDate,
        slot: timeSlot,
        location:
          locationType === 'onsite'
            ? address
            : 'Trụ sở Vi Tính An Tâm (45 Nguyễn Huệ, P.1, Long An - Tây Ninh)',
        service: serviceNeeded,
      });
    } catch (err) {
      setErrorMsg('Có lỗi xảy ra trong quá trình đặt lịch. Vui lòng gọi trực tiếp 0909.053.058!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getZaloShareUrl = () => {
    if (!bookingSuccess) return systemSettings.zaloLink;
    const msg = `Xin chào Vi Tính An Tâm, tôi vừa đặt lịch hẹn trên website:\n- Mã phiếu: ${bookingSuccess.code}\n- Khách hàng: ${bookingSuccess.name} (${bookingSuccess.phone})\n- Nhu cầu: ${bookingSuccess.service}\n- Thời gian: ${bookingSuccess.slot} ngày ${bookingSuccess.date}\n- Địa điểm: ${bookingSuccess.location}\nNhờ kỹ thuật viên xác nhận giúp tôi!`;
    return `https://zalo.me/${systemSettings.zaloNumber}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-blue-600">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Đặt lịch dịch vụ</span>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-widest text-blue-700 font-bold bg-blue-50 border border-blue-200 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Cứu Hộ Tận Nơi Trong 2 Giờ (Bán Kính 10KM)</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
            Đặt Lịch Sửa Chữa &amp; Nâng Cấp Máy Tính
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-xl mx-auto">
            Kỹ thuật viên An Tâm mang đầy đủ trang thiết bị chuyên dụng đến kiểm tra, bảo dưỡng và xử lý trực tiếp trước sự giám sát của quý khách.
          </p>
        </div>

        {/* Success Modal / Card */}
        {bookingSuccess ? (
          <div className="bg-white rounded-3xl border border-emerald-200 shadow-lg p-6 sm:p-8 text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Đặt Lịch Thành Công!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Cảm ơn <strong>{bookingSuccess.name}</strong>, kỹ thuật viên trực ca sẽ liên hệ xác nhận trong vòng 10 phút.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 text-xs text-left max-w-md mx-auto space-y-2.5 border border-slate-200">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">Mã phiếu tiếp nhận:</span>
                <span className="font-mono font-black text-sm text-blue-700">{bookingSuccess.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Khách hàng:</span>
                <span className="font-semibold text-slate-800">{bookingSuccess.name} ({bookingSuccess.phone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dịch vụ yêu cầu:</span>
                <span className="font-semibold text-slate-800 text-right max-w-[220px]">{bookingSuccess.service}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Thời gian hẹn:</span>
                <span className="font-semibold text-blue-700">
                  {bookingSuccess.slot} • {bookingSuccess.date}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Địa điểm:</span>
                <span className="font-semibold text-slate-800 text-right max-w-[220px]">
                  {bookingSuccess.location}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href={getZaloShareUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Gửi Xác Nhận Qua Zalo Kỹ Thuật</span>
              </a>
              <button
                onClick={() => setBookingSuccess(null)}
                className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
              >
                Đặt thêm lịch khác
              </button>
              <Link
                href="/"
                className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. Hình thức phục vụ */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
                  1. Chọn hình thức phục vụ
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setLocationType('onsite')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                      locationType === 'onsite'
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <Bike className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">KTV Đến Tận Nơi (Trong 2 Giờ)</h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        Phục vụ tận nhà/văn phòng tại Tân An và bán kính 10km (Long An - Tây Ninh)
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => setLocationType('counter')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                      locationType === 'counter'
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Mang Máy Đến Cửa Hàng</h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        45 Nguyễn Huệ, P.1, Tân An (Có chỗ đỗ xe, kiểm tra &amp; lấy ngay sau 30 phút)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Thông tin liên hệ */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  2. Thông tin khách hàng
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-slate-500 mb-1 block">Họ và tên *</span>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="VD: Nguyễn Văn An"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 mb-1 block">Số điện thoại / Zalo *</span>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="VD: 0909053058"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-colors"
                      required
                    />
                  </div>
                </div>

                {locationType === 'onsite' && (
                  <div>
                    <span className="text-xs text-slate-500 mb-1 block">Địa chỉ tiếp nhận tận nơi *</span>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Số nhà, tên đường, phường/xã (VD: 42 Hùng Vương, P.2, Tân An)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-colors"
                      required={locationType === 'onsite'}
                    />
                  </div>
                )}
              </div>

              {/* 3. Dòng máy & Nhu cầu */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  3. Nhu cầu sửa chữa / Nâng cấp
                </label>

                <div>
                  <span className="text-xs text-slate-500 mb-1 block">Dòng máy / Thiết bị</span>
                  <input
                    type="text"
                    value={deviceType}
                    onChange={(e) => setDeviceType(e.target.value)}
                    placeholder="VD: PC Dell OptiPlex 7060, ThinkPad T480s, Laptop HP..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-colors mb-2"
                  />
                </div>

                {/* Quick Service Pills */}
                <span className="text-[11px] text-slate-500 block">Bấm chọn nhanh gói dịch vụ:</span>
                <div className="flex flex-wrap gap-2">
                  {quickServices.map((qs, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectQuickService(qs)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 transition-colors text-left"
                    >
                      + {qs}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  value={serviceNeeded}
                  onChange={(e) => setServiceNeeded(e.target.value)}
                  placeholder="Mô tả cụ thể hiện trạng máy (VD: Máy đang chạy chậm, cần nâng SSD 256GB và cài Win sạch)..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-colors"
                  required
                />
              </div>

              {/* 4. Thời gian hẹn */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  4. Chọn ngày &amp; khung giờ tiếp nhận
                </label>

                <div>
                  <span className="text-xs text-slate-500 mb-1 block">Ngày hẹn</span>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-colors"
                  />
                </div>

                {/* Time slot chips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {timeSlots.map((ts) => {
                    const isSelected = timeSlot === ts.label;
                    return (
                      <div
                        key={ts.label}
                        onClick={() => setTimeSlot(ts.label)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                        }`}
                      >
                        <span className="text-xl">{ts.icon}</span>
                        <div>
                          <div className="text-xs font-bold">{ts.label}</div>
                          <div className="text-[10px] text-slate-500">{ts.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{isSubmitting ? 'Đang gửi yêu cầu tiếp nhận...' : 'Xác Nhận Đặt Lịch Hẹn Ngay'}</span>
                </button>
                <p className="text-[11px] text-slate-500 text-center mt-2.5">
                  Cam kết: Kỹ thuật viên có mặt đúng hẹn • Minh bạch linh kiện • Báo giá trước khi thực hiện.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AppointmentBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <AppointmentBookingContent />
    </Suspense>
  );
}
