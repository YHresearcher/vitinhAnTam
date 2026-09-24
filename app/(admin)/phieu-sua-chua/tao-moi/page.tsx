'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store';

const COMMON_SERVICES = [
  {
    id: 'spa-tf7',
    name: 'Gói Spa Máy Tính & Tra Keo Thermalright TF7',
    price: 150000,
    warrantyMonths: 1,
    category: 'Vệ sinh & Bảo dưỡng',
  },
  {
    id: 'os-install',
    name: 'Cài Đặt Windows 11 Pro + Bộ Office Bản Quyền Chuẩn',
    price: 100000,
    warrantyMonths: 1,
    category: 'Hệ điều hành',
  },
  {
    id: 'ssd-500gb',
    name: 'Nâng Cấp SSD Kingston NV2 500GB NVMe PCIe 4.0',
    price: 890000,
    warrantyMonths: 36,
    category: 'Ổ cứng',
  },
  {
    id: 'ram-16gb',
    name: 'Nâng Cấp RAM DDR4 16GB Kingston Fury 3200MHz',
    price: 750000,
    warrantyMonths: 36,
    category: 'Bộ nhớ RAM',
  },
  {
    id: 'psu-500w',
    name: 'Thay Nguồn Công Suất Thực 500W Chuẩn 80 Plus',
    price: 650000,
    warrantyMonths: 36,
    category: 'Bộ nguồn',
  },
];

function generateTicketCode(): string {
  return `TK-${Math.floor(1000 + Math.random() * 9000)}`;
}

function getCompletionPresetDate(hoursToAdd: number): string {
  const d = new Date();
  d.setHours(d.getHours() + hoursToAdd);
  d.setMinutes(0);
  d.setSeconds(0);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function TaoPhieuSuaChuaPage() {
  const router = useRouter();
  const { currentUser, customers, addServiceTicket } = useStore();

  const [ticketType, setTicketType] = useState<'counter' | 'onsite'>('counter');
  const [serviceCategory, setServiceCategory] = useState<'sua_chua' | 'bao_hanh'>('sua_chua');
  const [estimatedCompletion, setEstimatedCompletion] = useState<string>(() => getCompletionPresetDate(48));
  const [warrantyMonths, setWarrantyMonths] = useState<number>(3);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('Long An - Tây Ninh');
  const [deviceModel, setDeviceModel] = useState('');
  const [serviceTag, setServiceTag] = useState('');
  const [windowsPin, setWindowsPin] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>(['spa-tf7']);
  const [customCost, setCustomCost] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill customer if phone matches
  const handlePhoneChange = (val: string) => {
    setCustomerPhone(val);
    const existing = customers.find((c) => c.phone.replace(/\D/g, '') === val.replace(/\D/g, ''));
    if (existing) {
      setCustomerName(existing.name || existing.full_name);
      if (existing.address) setCustomerAddress(existing.address);
    }
  };

  const toggleService = (id: string) => {
    if (selectedServices.includes(id)) {
      setSelectedServices(selectedServices.filter((s) => s !== id));
    } else {
      setSelectedServices([...selectedServices, id]);
    }
  };

  // Calculate Total Cost
  const totalCost = selectedServices.reduce((sum, sId) => {
    const s = COMMON_SERVICES.find((item) => item.id === sId);
    return sum + (s ? s.price : 0);
  }, customCost);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhone || !customerName || !deviceModel || !issueDescription) {
      alert('Vui lòng điền đủ: Số điện thoại, Tên khách hàng, Tên thiết bị và Mô tả tình trạng!');
      return;
    }

    setIsSubmitting(true);
    try {
      const code = generateTicketCode();
      const parts = selectedServices.map((sId) => {
        const item = COMMON_SERVICES.find((s) => s.id === sId)!;
        return {
          part_name: item.name,
          quantity: 1,
          price: item.price,
          warranty_months: item.warrantyMonths,
        };
      });

      // Calculate warranty date based on warrantyMonths
      const wDate = new Date();
      wDate.setMonth(wDate.getMonth() + warrantyMonths);

      await addServiceTicket({
        ticket_code: code,
        customer_name: customerName,
        customer_phone: customerPhone,
        device_model: deviceModel,
        service_tag: serviceTag.toUpperCase() || undefined,
        technician_name: currentUser.name,
        ticket_type: ticketType,
        service_category: serviceCategory,
        estimated_completion: estimatedCompletion,
        warranty_duration_months: warrantyMonths,
        status: 'received',
        issueDescription: issueDescription + (windowsPin ? ` (Mật khẩu Windows: ${windowsPin})` : ''),
        issue_description: issueDescription + (windowsPin ? ` (Mật khẩu Windows: ${windowsPin})` : ''),
        estimated_cost: serviceCategory === 'bao_hanh' ? customCost : totalCost,
        parts_used: parts,
        warranty_until: wDate.toISOString().split('T')[0],
      });

      router.push('/phieu-sua-chua');
    } catch (err: unknown) {
      alert('Lỗi tạo phiếu: ' + (err instanceof Error ? err.message : 'Thử lại'));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Back button */}
      <div>
        <Link
          href="/phieu-sua-chua"
          className="inline-flex items-center text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium"
        >
          ← Quay lại danh sách phiếu sửa chữa
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Lập Phiếu Tiếp Nhận Máy Mới
          </h1>
        </div>

        {/* Type Toggle: Counter vs Onsite */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setTicketType('counter')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              ticketType === 'counter'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tại Quầy Cửa Hàng
          </button>
          <button
            type="button"
            onClick={() => setTicketType('onsite')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              ticketType === 'onsite'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cứu Hộ Tận Nơi (&lt;5km Hỏa Tốc)
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Customer Information */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100 text-sm font-bold text-slate-900">
            1. Thông Tin Khách Hàng
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số Điện Thoại Khách Hàng *
              </label>
              <div>
                <input
                  type="tel"
                  required
                  placeholder="VD: 0918234891"
                  value={customerPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên Khách Hàng / Doanh Nghiệp *
              </label>
              <input
                type="text"
                required
                placeholder="VD: Chị Mai - Shop Thời Trang"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {ticketType === 'onsite' && (
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Địa Chỉ Cứu Hộ Tận Nơi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: 45 Đường Hùng Vương, Phường 2, Long An - Tây Ninh"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Device & Issue Description */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100 text-sm font-bold text-slate-900">
            2. Thông Tin Thiết Bị &amp; Tình Trạng Lỗi Tiếp Nhận
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên Model Máy / Dòng Máy *
              </label>
              <input
                type="text"
                required
                placeholder="VD: Dell Inspiron 3520 / HP ProDesk 600"
                value={deviceModel}
                onChange={(e) => setDeviceModel(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Service Tag / Serial (Nếu có)
              </label>
              <input
                type="text"
                placeholder="VD: 7G4K8X2"
                value={serviceTag}
                onChange={(e) => setServiceTag(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mật Khẩu Windows / Mã PIN
              </label>
              <input
                type="text"
                placeholder="VD: 123456 hoặc Không có"
                value={windowsPin}
                onChange={(e) => setWindowsPin(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mô Tả Lỗi / Triệu Chứng Ban Đầu *
              </label>
              <textarea
                rows={3}
                required
                placeholder="VD: Bật máy quạt quay vù vù nhưng không lên hình, sờ tản nhiệt rất nóng, kèm sạc zin theo máy, vỏ trầy xước nhẹ mặt A..."
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Service Checklist & Pricing */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div>
              <div className="text-base font-bold text-slate-900">
                3. Dịch Vụ Sửa Chữa &amp; Linh Kiện Dự Kiến Thay Thế
              </div>
            </div>

            {/* Switch: Sửa chữa vs Bảo hành */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setServiceCategory('sua_chua');
                  setEstimatedCompletion(getCompletionPresetDate(48));
                }}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  serviceCategory === 'sua_chua'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sửa Chữa
              </button>
              <button
                type="button"
                onClick={() => {
                  setServiceCategory('bao_hanh');
                  setEstimatedCompletion(getCompletionPresetDate(72));
                }}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  serviceCategory === 'bao_hanh'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bảo Hành
              </button>
            </div>
          </div>

          {/* Time & Deadline Input Container */}
          <div className={`p-4 rounded-xl border space-y-3 transition-colors ${
            serviceCategory === 'bao_hanh'
              ? 'bg-purple-50/50 border-purple-200'
              : 'bg-blue-50/50 border-blue-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>
                  {serviceCategory === 'bao_hanh'
                    ? 'Thời Gian Hoàn Tất Xử Lý Bảo Hành (Hạn chót trả máy):'
                    : 'Thời Gian Hoàn Tất Sửa Chữa & Hẹn Trả Khách (Deadline):'}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-semibold">
                  Cảnh báo widget &lt; 3 ngày
                </span>
              </label>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 font-medium">Chọn nhanh:</span>
                {serviceCategory === 'sua_chua' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setEstimatedCompletion(getCompletionPresetDate(24))}
                      className="px-2 py-1 bg-white border border-slate-200 hover:border-blue-400 rounded text-[11px] font-semibold text-slate-700 transition-colors"
                    >
                      +24h (Mai)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEstimatedCompletion(getCompletionPresetDate(48))}
                      className="px-2 py-1 bg-white border border-slate-200 hover:border-blue-400 rounded text-[11px] font-semibold text-slate-700 transition-colors"
                    >
                      +48h (2 Ngày)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEstimatedCompletion(getCompletionPresetDate(72))}
                      className="px-2 py-1 bg-white border border-slate-200 hover:border-blue-400 rounded text-[11px] font-semibold text-slate-700 transition-colors"
                    >
                      +72h (3 Ngày)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEstimatedCompletion(getCompletionPresetDate(120))}
                      className="px-2 py-1 bg-white border border-slate-200 hover:border-blue-400 rounded text-[11px] font-semibold text-slate-700 transition-colors"
                    >
                      +5 Ngày
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setEstimatedCompletion(getCompletionPresetDate(8))}
                      className="px-2 py-1 bg-white border border-slate-200 hover:border-purple-400 rounded text-[11px] font-semibold text-slate-700 transition-colors"
                    >
                      Trong Ngày (Đổi Ngay)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEstimatedCompletion(getCompletionPresetDate(72))}
                      className="px-2 py-1 bg-white border border-slate-200 hover:border-purple-400 rounded text-[11px] font-semibold text-slate-700 transition-colors"
                    >
                      +3 Ngày (Test &amp; Trả)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEstimatedCompletion(getCompletionPresetDate(168))}
                      className="px-2 py-1 bg-white border border-slate-200 hover:border-purple-400 rounded text-[11px] font-semibold text-slate-700 transition-colors"
                    >
                      +7 Ngày (Gửi Hãng)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEstimatedCompletion(getCompletionPresetDate(336))}
                      className="px-2 py-1 bg-white border border-slate-200 hover:border-purple-400 rounded text-[11px] font-semibold text-slate-700 transition-colors"
                    >
                      +14 Ngày
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <input
                  type="datetime-local"
                  required
                  value={estimatedCompletion}
                  onChange={(e) => setEstimatedCompletion(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Warranty Duration Setting */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                  {serviceCategory === 'bao_hanh' ? 'Bảo hành máy/LK:' : 'Thời hạn BH sau sửa:'}
                </span>
                <div className="flex items-center gap-1 overflow-x-auto">
                  {[1, 3, 6, 12, 36].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setWarrantyMonths(m)}
                      className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                        warrantyMonths === m
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {m}T
                    </button>
                  ))}
                  <span className="text-xs text-slate-500 ml-1">tháng</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checklist Gói Dịch Vụ */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">
                {serviceCategory === 'bao_hanh'
                  ? 'Linh kiện hoặc Dịch vụ bảo hành tiếp nhận:'
                  : 'Linh kiện thay thế & Dịch vụ đi kèm:'}
              </span>
              <span className="text-xs text-slate-400">Tick chọn để cộng dồn</span>
            </div>

            <div className="space-y-2">
              {COMMON_SERVICES.map((s) => {
                const isChecked = selectedServices.includes(s.id);
                return (
                  <div
                    key={s.id}
                    onClick={() => toggleService(s.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-blue-50/70 border-blue-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-5 h-5 rounded border flex items-center justify-center text-xs font-bold font-mono transition-colors ${
                        isChecked ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-transparent border-slate-300'
                      }`}>
                        ✓
                      </span>
                      <div>
                        <div className="text-xs font-semibold text-slate-900">{s.name}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] text-slate-600">
                            {s.category}
                          </span>
                          <span>•</span>
                          <span className="text-emerald-700 font-medium">
                            Bảo hành {s.warrantyMonths} tháng
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-slate-900 font-mono">
                      {serviceCategory === 'bao_hanh' ? 'Bảo Hành 0đ' : `+${s.price.toLocaleString('vi-VN')} đ`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom cost */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">
              {serviceCategory === 'bao_hanh'
                ? 'Phụ thu phát sinh ngoài gói bảo hành (nếu có):'
                : 'Chi phí phát sinh khác / Tiền công cứu hộ ngoài giờ:'}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step={10000}
                value={customCost}
                onChange={(e) => setCustomCost(Number(e.target.value))}
                className="w-32 px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-right font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
              <span className="text-xs text-slate-500 font-medium">VNĐ</span>
            </div>
          </div>
        </div>

        {/* Multi-tier Warranty Preview Card - WHITE & BLUE THEME */}
        <div className="bg-gradient-to-br from-blue-50/90 to-indigo-50/70 text-slate-800 p-6 rounded-2xl shadow-xs border-2 border-blue-200">
          <div className="flex items-center justify-between pb-4 border-b border-blue-200">
            <div>
              <span className="font-bold text-base text-slate-900">Cam Kết Bảo Hành Phân Tầng Điện Tử</span>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500 font-medium">Tổng chi phí ước tính:</div>
              <div className="text-2xl font-black text-blue-700 font-mono">
                {totalCost.toLocaleString('vi-VN')} đ
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs">
            <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-xs">
              <div className="text-emerald-700 font-bold mb-1">Tầng 1: Linh Kiện Mới (36T)</div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Đổi mới 1-đổi-1 cho SSD/RAM/Nguồn nếu phát sinh lỗi phần cứng theo serial nhà sản xuất.
              </p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-xs">
              <div className="text-blue-700 font-bold mb-1">Tầng 2: Keo TF7 &amp; Nhiệt Độ (30N)</div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Bảo hành nhiệt độ CPU dưới 70°C khi làm việc văn phòng, miễn phí vệ sinh lại nếu quạt kêu.
              </p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-purple-200 shadow-xs">
              <div className="text-purple-700 font-bold mb-1">Tầng 3: Cài Đặt Hệ Thống (30N)</div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Hỗ trợ UltraViewer / Anydesk từ xa miễn phí lỗi font chữ, máy in, mạng nội bộ.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-500">
            Kỹ thuật viên lập phiếu:{' '}
            <span className="font-semibold text-slate-800">{currentUser.name}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg shadow-sm transition-all active:scale-95"
            >
              {isSubmitting ? 'Đang lưu phiếu...' : 'Xác Nhận Tiếp Nhận Phiếu'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
