'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useViTinhAnTamStore } from '@/lib/store';

export default function AppointmentBookingPage() {
  const { addServiceTicket } = useViTinhAnTamStore();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [locationType, setLocationType] = useState<'counter' | 'onsite'>('onsite');
  const [address, setAddress] = useState('');
  const [deviceType, setDeviceType] = useState('PC Đồng bộ Dell/HP');
  const [serviceNeeded, setServiceNeeded] = useState('');
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
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const quickServices = [
    'Nâng cấp SSD NVMe Kingston 256GB (Tăng tốc x5)',
    'Spa làm mát tra keo Thermalright TF7 (Hạ 15-20°C)',
    'Cài lại Windows 10/11 Pro sạch không crack',
    'Máy tính bật không lên nguồn / Kêu tít tít',
    'Khắc phục máy chậm, đơ khi mở phần mềm MISA/Excel',
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
      setErrorMsg('Vui lòng nhập địa chỉ cụ thể tại Tân An hoặc các huyện lân cận!');
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
      });
    } catch (err) {
      setErrorMsg('Có lỗi xảy ra trong quá trình đặt lịch. Vui lòng gọi trực tiếp 0909.053.058!');
    } finally {
      setIsSubmitting(false);
    }
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
          <span className="text-xs uppercase tracking-widest text-blue-600 font-bold bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            Cứu Hộ Tận Nơi Trong 2 Giờ
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
            Đặt Lịch Sửa Chữa &amp; Nâng Cấp Máy Tính
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-xl mx-auto">
            Kỹ thuật viên An Tâm mang đầy đủ trang thiết bị chuyên dụng đến kiểm tra, bảo dưỡng và xử lý trực tiếp trước sự giám sát của quý khách.
          </p>
        </div>

        {/* Success Modal */}
        {bookingSuccess ? (
          <div className="bg-white rounded-2xl border border-emerald-200 shadow-md p-6 sm:p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <span className="material-symbols-outlined text-3xl">task_alt</span>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">
                Đặt Lịch Thành Công!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Cảm ơn <strong>{bookingSuccess.name}</strong>, kỹ thuật viên trực ca sẽ liên hệ xác nhận trong vòng 10 phút.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 text-xs text-left max-w-md mx-auto space-y-2 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Mã phiếu hẹn:</span>
                <span className="font-mono font-bold text-blue-700">{bookingSuccess.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Số điện thoại:</span>
                <span className="font-semibold text-slate-800">{bookingSuccess.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Thời gian hẹn:</span>
                <span className="font-semibold text-slate-800">
                  {bookingSuccess.slot} • {bookingSuccess.date}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Địa điểm:</span>
                <span className="font-semibold text-slate-800 text-right max-w-[200px] truncate">
                  {bookingSuccess.location}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setBookingSuccess(null)}
                className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
              >
                Đặt thêm lịch khác
              </button>
              <Link
                href="/"
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. Hình thức phục vụ */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  1. Chọn hình thức phục vụ
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setLocationType('onsite')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      locationType === 'onsite'
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-blue-600 text-2xl">
                      electric_moped
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">KTV Đến Tận Nơi (Trong 2 Giờ)</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Phục vụ tận nhà/văn phòng tại Tân An, Thủ Thừa, Châu Thành (Bán kính 10km)
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => setLocationType('counter')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      locationType === 'counter'
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-blue-600 text-2xl">storefront</span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Mang Máy Đến Cửa Hàng</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        45 Nguyễn Huệ, P.1, Long An - Tây Ninh (Có chỗ đỗ ô tô, lấy ngay trong 30-45 phút)
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
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white"
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
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white"
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
                      placeholder="Số nhà, tên đường, phường/xã, huyện (VD: 42 Hùng Vương, P.2, Tân An)"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white"
                      required={locationType === 'onsite'}
                    />
                  </div>
                )}
              </div>

              {/* 3. Nhu cầu dịch vụ */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  3. Nhu cầu sửa chữa / Nâng cấp
                </label>

                {/* Quick Service Pills */}
                <div className="flex flex-wrap gap-2">
                  {quickServices.map((qs, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectQuickService(qs)}
                      className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 transition-colors"
                    >
                      + {qs}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  value={serviceNeeded}
                  onChange={(e) => setServiceNeeded(e.target.value)}
                  placeholder="Mô tả cụ thể hiện trạng máy (VD: Máy Dell OptiPlex đang chạy chậm, cần nâng SSD 256GB và cài Win 11 sạch)..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white"
                  required
                />
              </div>

              {/* 4. Thời gian hẹn */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-slate-500 mb-1 block">Ngày hẹn</span>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <span className="text-xs text-slate-500 mb-1 block">Khung giờ tiếp nhận</span>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white"
                  >
                    <option value="Sáng (08:00 - 11:30)">Sáng (08:00 - 11:30)</option>
                    <option value="Chiều (13:30 - 17:30)">Chiều (13:30 - 17:30)</option>
                    <option value="Khung giờ vàng (17:30 - 21:00)">Khung giờ vàng (17:30 - 21:00)</option>
                    <option value="Cứu hộ khẩn cấp (Ngay trong 60 phút)">Cứu hộ khẩn cấp (Ngay trong 60 phút)</option>
                  </select>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-lg">calendar_month</span>
                  <span>{isSubmitting ? 'Đang gửi yêu cầu...' : 'Xác Nhận Đặt Lịch Hẹn'}</span>
                </button>
                <p className="text-[11px] text-slate-500 text-center mt-2">
                  Cam kết: Kỹ thuật viên có mặt đúng hẹn • Không phụ thu phí ngoài giờ sau 17h30.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
