'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store';

interface ServiceItem {
  id: string;
  name: string;
  defaultPrice: number;
  warrantyMonths: number;
  category: string;
}

const COMMON_SERVICES: ServiceItem[] = [
  {
    id: 've-sinh-tra-keo',
    name: 'Vệ sinh, bảo dưỡng & Tra keo tản nhiệt',
    defaultPrice: 150000,
    warrantyMonths: 1,
    category: 'Vệ sinh & Bảo dưỡng',
  },
  {
    id: 'cai-dat-he-thong',
    name: 'Cài đặt hệ điều hành & Phần mềm',
    defaultPrice: 150000,
    warrantyMonths: 1,
    category: 'Hệ điều hành / Phần mềm',
  },
  {
    id: 'nang-cap-ssd',
    name: 'Nâng cấp / Thay thế ổ cứng (SSD / HDD)',
    defaultPrice: 0,
    warrantyMonths: 36,
    category: 'Ổ cứng lưu trữ',
  },
  {
    id: 'nang-cap-ram',
    name: 'Nâng cấp / Thay thế bộ nhớ RAM',
    defaultPrice: 0,
    warrantyMonths: 36,
    category: 'Bộ nhớ RAM',
  },
  {
    id: 'thay-nguon-psu',
    name: 'Thay thế / Sửa chữa nguồn máy tính (PSU)',
    defaultPrice: 0,
    warrantyMonths: 12,
    category: 'Bộ nguồn',
  },
  {
    id: 'sua-chua-mainboard',
    name: 'Sửa chữa phần cứng Mainboard / Chipset',
    defaultPrice: 0,
    warrantyMonths: 3,
    category: 'Phần cứng Mainboard',
  },
  {
    id: 'thay-linh-kien-khac',
    name: 'Thay thế linh kiện khác (Màn hình, Phím, Pin, Quạt)',
    defaultPrice: 0,
    warrantyMonths: 6,
    category: 'Linh kiện khác',
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
  const { currentUser, users, customers, addServiceTicket } = useStore();

  const availableTechnicians = useMemo(() => {
    return users.filter((u) => u.role === 'technician' || u.role === 'outsourced' || u.role === 'salesman' || u.role === 'admin');
  }, [users]);

  const [ticketType, setTicketType] = useState<'counter' | 'onsite'>('counter');
  const [serviceCategory, setServiceCategory] = useState<'sua_chua' | 'bao_hanh'>('sua_chua');
  const [assignedTechnician, setAssignedTechnician] = useState<string>(() => currentUser.name);
  const [estimatedCompletion, setEstimatedCompletion] = useState<string>(() => getCompletionPresetDate(48));
  const [warrantyMonths, setWarrantyMonths] = useState<number>(3);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [deviceModel, setDeviceModel] = useState('');
  const [serviceTag, setServiceTag] = useState('');
  const [windowsPin, setWindowsPin] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>(['ve-sinh-tra-keo']);
  const [servicePrices, setServicePrices] = useState<Record<string, number>>(() => ({
    've-sinh-tra-keo': 150000,
  }));
  const [serviceNotes, setServiceNotes] = useState<Record<string, string>>({});
  const [serviceWarranties, setServiceWarranties] = useState<Record<string, number>>({});
  const [customCost, setCustomCost] = useState<number>(0);
  const [technicianFee, setTechnicianFee] = useState<number>(50000);
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
      if (servicePrices[id] === undefined) {
        const item = COMMON_SERVICES.find((s) => s.id === id);
        setServicePrices((prev) => ({ ...prev, [id]: item ? item.defaultPrice : 0 }));
      }
    }
  };

  const handlePriceChange = (id: string, price: number) => {
    setServicePrices((prev) => ({
      ...prev,
      [id]: Math.max(0, price),
    }));
  };

  const handleNoteChange = (id: string, note: string) => {
    setServiceNotes((prev) => ({
      ...prev,
      [id]: note,
    }));
  };

  const handleWarrantyChange = (id: string, months: number) => {
    setServiceWarranties((prev) => ({
      ...prev,
      [id]: months,
    }));
  };

  // Calculate Total Cost: Tổng các dịch vụ đã chọn (cho phép tự nhập) + phụ thu
  const totalCost = selectedServices.reduce((sum, sId) => {
    if (serviceCategory === 'bao_hanh') return sum;
    return sum + (servicePrices[sId] ?? 0);
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
        const note = serviceNotes[sId]?.trim();
        const price = serviceCategory === 'bao_hanh' ? 0 : (servicePrices[sId] ?? 0);
        return {
          part_name: note ? `${item.name} (${note})` : item.name,
          quantity: 1,
          price,
          warranty_months: serviceWarranties[sId] ?? item.warrantyMonths,
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
        technician_name: assignedTechnician || currentUser.name,
        technician_fee: technicianFee,
        ticket_type: ticketType,
        service_category: serviceCategory,
        estimated_completion: estimatedCompletion,
        warranty_duration_months: warrantyMonths,
        status: 'received',
        issueDescription: issueDescription + (windowsPin ? ` (Mật khẩu Windows: ${windowsPin})` : ''),
        issue_description: issueDescription + (windowsPin ? ` (Mật khẩu Windows: ${windowsPin})` : ''),
        estimated_cost: serviceCategory === 'bao_hanh' ? customCost : totalCost,
        total_amount: totalCost,
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

          {/* Phân Bổ Kỹ Thuật Viên Xử Lý */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Phân Bổ Kỹ Thuật Viên Phụ Trách &amp; Xử Lý Máy *
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <select
                value={assignedTechnician}
                onChange={(e) => setAssignedTechnician(e.target.value)}
                className="w-full sm:w-80 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <optgroup label="Kỹ Thuật Viên Nội Bộ">
                  {availableTechnicians
                    .filter((u) => u.role !== 'outsourced')
                    .map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name} {u.role === 'admin' ? '(Admin)' : u.role === 'salesman' ? '(NVKD)' : ''}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Kỹ Thuật Viên Thuê Ngoài / Đối Tác">
                  {availableTechnicians
                    .filter((u) => u.role === 'outsourced')
                    .map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name} (Thuê Ngoài)
                      </option>
                    ))}
                </optgroup>
              </select>
              <span className="text-[11px] text-slate-500">
                Admin và KTV Trưởng có thể điều phối linh hoạt cho nhân viên nội bộ hoặc KTV thuê ngoài.
              </span>
            </div>
          </div>

          {/* Thiết Lập Thù Lao / Tiền Công Cho KTV */}
          <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-xl space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <span>💵 Tiền Công / Thù Lao Chi Trả Cho KTV ({assignedTechnician || 'KTV'}):</span>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-200 text-emerald-800 rounded font-semibold">
                  Tự động cộng vào lương
                </span>
              </label>
              <span className="text-[11px] text-emerald-700">
                Tự động kết chuyển vào bảng lương khi hoàn tất / bàn giao máy
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative w-full sm:w-56">
                <input
                  type="number"
                  step={10000}
                  min={0}
                  value={technicianFee}
                  onChange={(e) => setTechnicianFee(Number(e.target.value))}
                  placeholder="0"
                  className="w-full pl-3 pr-8 py-2 bg-white border border-emerald-300 rounded-lg text-sm font-mono font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-emerald-700 pointer-events-none">
                  đ
                </span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-emerald-800 font-medium">Chọn nhanh:</span>
                {[0, 50000, 100000, 150000, 200000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setTechnicianFee(val)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                      technicianFee === val
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    {val === 0 ? '0 đ' : `${val / 1000}k`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Checklist Gói Dịch Vụ & Linh Kiện Tổng Quát */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">
                {serviceCategory === 'bao_hanh'
                  ? 'Hạng mục dịch vụ / linh kiện bảo hành tiếp nhận:'
                  : 'Hạng mục dịch vụ & Linh kiện (cho phép tự nhập giá tiền theo nhu cầu khách):'}
              </span>
              <span className="text-xs text-slate-400">Tick chọn để nhập giá tiền &amp; ghi chú</span>
            </div>

            <div className="space-y-2.5">
              {COMMON_SERVICES.map((s) => {
                const isChecked = selectedServices.includes(s.id);
                const currentPrice = servicePrices[s.id] ?? s.defaultPrice;
                const currentNote = serviceNotes[s.id] ?? '';
                const currentWarranty = serviceWarranties[s.id] ?? s.warrantyMonths;

                return (
                  <div
                    key={s.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isChecked
                        ? 'bg-blue-50/50 border-blue-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div
                        onClick={() => toggleService(s.id)}
                        className="flex items-start gap-3 cursor-pointer flex-1 select-none"
                      >
                        <span className={`w-5 h-5 mt-0.5 rounded border flex items-center justify-center text-xs font-bold font-mono transition-colors shrink-0 ${
                          isChecked ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-transparent border-slate-300'
                        }`}>
                          ✓
                        </span>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{s.name}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] text-slate-600 font-medium">
                              {s.category}
                            </span>
                            <span>•</span>
                            <span className="text-emerald-700 font-medium">
                              Bảo hành {currentWarranty} tháng
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Hiển thị / Nhập giá tiền */}
                      <div className="text-right shrink-0">
                        {serviceCategory === 'bao_hanh' ? (
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-lg border border-emerald-200 font-mono">
                            Bảo Hành 0đ
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-slate-500 font-medium">Giá:</span>
                            <input
                              type="number"
                              disabled={!isChecked}
                              step={10000}
                              min={0}
                              value={currentPrice === 0 ? '' : currentPrice}
                              onChange={(e) => handlePriceChange(s.id, Number(e.target.value))}
                              placeholder="0"
                              onClick={(e) => e.stopPropagation()}
                              className={`w-28 px-2.5 py-1 text-xs text-right font-bold font-mono rounded-lg border focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                                isChecked
                                  ? 'bg-white border-blue-300 text-blue-700'
                                  : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                              }`}
                            />
                            <span className="text-xs text-slate-600 font-semibold font-mono">đ</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Chi tiết linh kiện & bảo hành khi được chọn */}
                    {isChecked && (
                      <div className="mt-2.5 pt-2 border-t border-blue-100/80 flex flex-col sm:flex-row sm:items-center gap-2.5">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={currentNote}
                            onChange={(e) => handleNoteChange(s.id, e.target.value)}
                            placeholder="Ghi chú chi tiết linh kiện / model nếu có (VD: SSD 500GB, RAM 8GB DDR4...)"
                            className="w-full px-2.5 py-1 bg-white border border-slate-200 focus:border-blue-400 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
                          />
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[11px] text-slate-500 whitespace-nowrap">BH riêng:</span>
                          {[1, 3, 6, 12, 24, 36].map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => handleWarrantyChange(s.id, m)}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                                currentWarranty === m
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                              }`}
                            >
                              {m}T
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
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

        {/* Khối Tổng Chi Phí Ước Tính (Thay thế khối cam kết bảo hành phân tầng) */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {serviceCategory === 'bao_hanh' ? 'Tổng phụ thu bảo hành ước tính' : 'Tổng chi phí ước tính (Dịch vụ & Linh kiện)'}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>{selectedServices.length} hạng mục được chọn</span>
              {customCost > 0 && <span>• Có phụ thu ngoài: {customCost.toLocaleString('vi-VN')} đ</span>}
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
              {totalCost.toLocaleString('vi-VN')} đ
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
