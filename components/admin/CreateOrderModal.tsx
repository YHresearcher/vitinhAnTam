'use client';

import React, { useState, useMemo } from 'react';
import { message } from 'antd';
import { X, Plus, ShoppingBag, UserCheck, Smartphone, DollarSign, Truck, CreditCard } from 'lucide-react';
import { InventoryItem, UserAccount } from '@/lib/supabase';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  currentUser: UserAccount;
  onOrderCreated: () => void;
}

export default function CreateOrderModal({
  isOpen,
  onClose,
  inventory,
  currentUser,
  onOrderCreated,
}: CreateOrderModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [selectedInventoryId, setSelectedInventoryId] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [devicePrice, setDevicePrice] = useState<number>(0);
  const [deviceTag, setDeviceTag] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'qr' | 'cash'>('qr');
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Danh sách máy sẵn sàng bán từ kho
  const availableItems = useMemo(
    () => inventory.filter((i) => i.qc_status !== 'sold'),
    [inventory]
  );

  if (!isOpen) return null;

  const handleSelectInventory = (itemId: string) => {
    setSelectedInventoryId(itemId);
    const item = inventory.find((i) => i.id === itemId);
    if (item) {
      const name = item.device_model || item.model || `${item.brand} ${item.form_factor || ''}`.trim();
      setDeviceName(name);
      setDevicePrice(item.retail_price || item.price || 0);
      setDeviceTag(item.service_tag || item.serial_number || '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      message.error('Vui lòng nhập họ tên khách hàng!');
      return;
    }
    if (!customerPhone.trim()) {
      message.error('Vui lòng nhập số điện thoại khách hàng!');
      return;
    }
    if (!deviceName.trim()) {
      message.error('Vui lòng nhập tên sản phẩm / thiết bị!');
      return;
    }
    if (!devicePrice || devicePrice <= 0) {
      message.error('Vui lòng nhập giá bán hợp lệ!');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          customer_address: customerAddress.trim(),
          device_name: deviceName.trim(),
          device_price: Number(devicePrice),
          device_tag: deviceTag.trim(),
          payment_method: paymentMethod,
          delivery_method: deliveryMethod,
          referral_code: currentUser.referral_code || currentUser.name,
          note: note.trim(),
          created_by_id: currentUser.id,
          created_by_name: currentUser.name,
          seller_id: currentUser.id,
          seller_name: currentUser.name,
          assigned_care_id: currentUser.id,
          assigned_care_name: currentUser.name,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        message.success(`Đã tạo đơn hàng thành công! Bạn (${currentUser.name}) được gán là người bán & CSKH.`);
        onOrderCreated();
        onClose();
      } else {
        message.error(data.message || 'Không thể tạo đơn hàng, vui lòng thử lại!');
      }
    } catch {
      message.error('Lỗi kết nối khi gửi tạo đơn hàng!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in font-sans">
      <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-200 p-5 sm:p-6 my-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Tạo Đơn Hàng Mới</h2>
              <p className="text-xs text-slate-500">
                Thêm đơn bán hàng nội bộ và tự động phân công chăm sóc khách hàng
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thông báo phân công tự động */}
        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex items-start gap-2">
          <UserCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Chính sách phân công: </span>
            Bạn (<strong className="text-blue-800">{currentUser.name}</strong>) tạo đơn sẽ được hệ thống mặc định gán là <strong>Người bán hàng</strong> và <strong>Người chăm sóc khách hàng</strong> sau này. (Chỉ Admin mới có quyền điều chuyển người CSKH).
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Thông tin khách hàng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tên khách hàng <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Số điện thoại <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="0909xxxxxx"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Địa chỉ nhận hàng (nếu có)
            </label>
            <input
              type="text"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="Số nhà, đường, phường/xã, tỉnh thành..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Chọn máy sẵn có trong kho */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Chọn máy từ kho sẵn bán (Tự động điền giá &amp; mã Tag)
            </label>
            <select
              value={selectedInventoryId}
              onChange={(e) => handleSelectInventory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="">-- Tự nhập máy tùy chỉnh hoặc chọn máy trong kho ({availableItems.length} máy) --</option>
              {availableItems.map((item) => (
                <option key={item.id} value={item.id}>
                  [{item.service_tag}] {item.device_model || item.model || item.brand} — {Number(item.retail_price || item.price || 0).toLocaleString('vi-VN')}₫
                </option>
              ))}
            </select>
          </div>

          {/* Tên thiết bị & Giá bán */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tên thiết bị / Sản phẩm <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="Laptop Dell Latitude 7490..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Giá bán ra (₫) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={0}
                step={50000}
                value={devicePrice}
                onChange={(e) => setDevicePrice(Math.max(0, Number(e.target.value) || 0))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Service Tag */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Service Tag / Serial (nếu có)
            </label>
            <input
              type="text"
              value={deviceTag}
              onChange={(e) => setDeviceTag(e.target.value)}
              placeholder="VD: DEL-7490-01"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Phương thức thanh toán & Giao hàng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Thanh toán</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('qr')}
                  className={`flex-1 py-1.5 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    paymentMethod === 'qr'
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>QR Code</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex-1 py-1.5 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    paymentMethod === 'cash'
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Tiền mặt</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nhận hàng</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`flex-1 py-1.5 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    deliveryMethod === 'pickup'
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Tại cửa hàng</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('delivery')}
                  className={`flex-1 py-1.5 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    deliveryMethod === 'delivery'
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Giao tận nơi</span>
                </button>
              </div>
            </div>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Ghi chú đơn hàng</label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Yêu cầu riêng, cài đặt ứng dụng, hẹn giờ giao..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Nút hành động */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'Đang tạo...' : 'Tạo Đơn Hàng Ngay'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
