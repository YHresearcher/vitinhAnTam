'use client';

import React, { useState, useEffect } from 'react';
import { useViTinhAnTamStore } from '@/lib/store';
import type { InventoryItem } from '@/lib/supabase';

interface Order {
  id: string;
  order_code: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  device_name: string;
  device_price: number;
  device_tag?: string;
  payment_method: 'qr' | 'cash';
  delivery_method: 'pickup' | 'delivery';
  note?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  created_at?: string;
}

const STATUSES = [
  { id: 'pending', label: 'Chờ (Mới đặt)', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'confirmed', label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' },
  { id: 'processing', label: 'Đang xử lý', color: 'bg-purple-100 text-purple-800' },
  { id: 'completed', label: 'Hoàn tất', color: 'bg-green-100 text-green-800' },
  { id: 'cancelled', label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
];

export default function OrderManagementPage() {
  const { inventory, sellInventoryItem } = useViTinhAnTamStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [executingOrder, setExecutingOrder] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/orders?limit=100', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setOrders(json.data);
      }
    } catch {
      showToast('Không thể tải đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const tm = setInterval(fetchOrders, 30000);
    return () => clearInterval(tm);
  }, []);

  const changeStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      if (res.ok) {
        showToast('Cập nhật trạng thái thành công!');
        setOrders(p => p.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
      }
    } catch {
      showToast('Có lỗi xảy ra');
    }
  };

  const executeSale = async (order: Order, matchedItem: InventoryItem, warrantyMonths: number) => {
    try {
      const res = await sellInventoryItem({
        itemId: matchedItem.id,
        customerName: order.customer_name,
        customerPhone: order.customer_phone,
        birthDate: '', 
        customerAddress: order.customer_address || '',
        serialNumber: matchedItem.serial_number || matchedItem.service_tag,
        warrantyMonths,
        soldPrice: order.device_price,
        notes: `Từ đơn online: ${order.order_code}. ${order.note || ''}`,
      });
      
      if (res.success) {
        await changeStatus(order.id, 'completed');
        showToast(`Đã xuất kho & tạo phiếu bảo hành cho ${order.customer_name}!`);
        setExecutingOrder(null);
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi xuất kho');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl text-sm animate-fade-in">
          {toastMessage}
        </div>
      )}
      <div className="flex justify-between items-end border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Đơn Hàng</h1>
          <p className="text-sm text-slate-500 mt-1">Xuất kho tự động tạo Phiếu Bảo Hành.</p>
        </div>
        <button onClick={fetchOrders} className="px-4 py-2 border rounded-lg text-sm bg-white hover:bg-slate-50">Làm mới</button>
      </div>

      {loading ? <div className="text-center py-12">Đang tải...</div> : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUSES.map(col => {
            const list = orders.filter(o => o.status === col.id);
            return (
              <div key={col.id} className="min-w-[280px] w-[280px] flex-shrink-0 bg-slate-50 rounded-xl h-full flex flex-col border p-2">
                <div className={`px-3 py-2 text-sm font-bold rounded-lg mb-2 ${col.color}`}>
                  {col.label} ({list.length})
                </div>
                <div className="space-y-3 overflow-y-auto max-h-[600px] p-1">
                  {list.map(order => (
                     <div key={order.id} className="bg-white p-3 rounded-lg border shadow-xs">
                        <div className="text-xs font-mono text-slate-500 mb-1">{order.order_code}</div>
                        <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{order.device_name}</h3>
                        <div className="text-xs text-slate-600 mt-1"><span className="font-semibold text-slate-900">{order.customer_name}</span> - {order.customer_phone}</div>
                        <div className="text-xs font-bold text-rose-600 mt-2 flex justify-between items-center">
                          {Number(order.device_price).toLocaleString('vi-VN')}₫
                          <span className="text-[10px] text-slate-500 px-1 bg-slate-100 rounded font-normal">
                            {order.delivery_method === 'delivery' ? 'Giao hàng' : 'Tại tiệm'}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-col gap-2 border-t pt-3">
                          {order.status === 'pending' && <button onClick={() => changeStatus(order.id, 'confirmed')} className="w-full text-xs font-bold bg-blue-50 text-blue-700 py-2 rounded hover:bg-blue-100">Xác nhận đơn</button>}
                          {order.status === 'confirmed' && <button onClick={() => changeStatus(order.id, 'processing')} className="w-full text-xs font-bold bg-purple-50 text-purple-700 py-2 rounded hover:bg-purple-100">Tiến hành xử lý</button>}
                          {order.status === 'processing' && <button onClick={() => setExecutingOrder(order)} className="w-full text-[11px] font-bold bg-green-500 text-white py-2 rounded hover:bg-green-600 shadow-xs">Chốt Xuất Kho & Tạo Bảo Hành</button>}
                          {(order.status !== 'completed' && order.status !== 'cancelled') && <button onClick={() => changeStatus(order.id, 'cancelled')} className="w-full text-[11px] text-slate-400 hover:text-red-600 py-1">Hủy đơn</button>}
                        </div>
                     </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {executingOrder && (
        <ExecuteOrderModal order={executingOrder} inventory={inventory} onClose={() => setExecutingOrder(null)} onConfirm={(i, m) => executeSale(executingOrder, i, m)} />
      )}
    </div>
  );
}
function ExecuteOrderModal({ order, inventory, onClose, onConfirm }: { order: Order, inventory: InventoryItem[], onClose: () => void, onConfirm: (i: InventoryItem, months: number) => void }) {
  const matchedItem = order.device_tag ? inventory.find(i => i.service_tag === order.device_tag && i.qc_status !== 'sold') : null;
  const [selectedTag, setSelectedTag] = useState<string>(matchedItem?.service_tag || '');
  const [months, setMonths] = useState(1);

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up border p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Hoàn Tất Đơn: {order.order_code}</h2>
        <p className="text-sm text-slate-500 mb-4">Hệ thống sẽ Xuất kho, Lưu CRM và tạo Phiếu bảo hành.</p>
        <div className="space-y-4 mb-6">
          <div className="bg-slate-50 p-3 rounded-lg border text-sm">
            <strong className="text-slate-900">{order.customer_name}</strong> - <strong>{order.customer_phone}</strong><br/>
            Khách mua: {order.device_name}
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Tag Thiết bị giao cho khách (*)</label>
            <select
              className="w-full px-3 py-2 border rounded-lg text-sm"
              value={selectedTag}
              onChange={e => setSelectedTag(e.target.value)}
            >
              <option value="">-- Chọn máy lấy từ kho --</option>
              {inventory.filter(i => i.qc_status !== 'sold').map(machine => (
                <option key={machine.id} value={machine.service_tag}>
                  {machine.service_tag} - {machine.device_model || machine.model || machine.brand}
                </option>
              ))}
            </select>
            {matchedItem && <p className="text-[11px] text-green-600 mt-1">Đã tự động khớp máy khách đặt.</p>}
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Thời gian bảo hành (Tháng)</label>
            <input type="number" className="w-full px-3 py-2 border rounded-lg text-sm" value={months} onChange={e => setMonths(Number(e.target.value))} min={1} max={36} />
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-4 border-t">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg text-sm">Hủy</button>
          <button 
            disabled={!selectedTag}
            onClick={() => { const item = inventory.find(i => i.service_tag === selectedTag); if (item) onConfirm(item, months); }} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold disabled:opacity-50"
          >
            Xuất kho & Hoàn thành
          </button>
        </div>
      </div>
    </div>
  );
}