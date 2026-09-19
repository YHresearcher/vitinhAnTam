'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { InventoryItem, generateCustomerCode } from '@/lib/supabase';
import ThermalLabelModal from '@/components/admin/ThermalLabelModal';
import {
  Search,
  Filter,
  Plus,
  Printer,
  ShieldCheck,
  HardDrive,
  Cpu,
  Layers,
  Lock,
  ShoppingBag,
  UserCheck,
  Calendar,
  Hash,
  Sparkles,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Barcode,
  X,
  RefreshCw
} from 'lucide-react';

export default function KhoMayPage() {
  const {
    inventory,
    currentUser,
    canEditStock,
    canUpdateRepairStatus,
    addInventoryItem,
    updateInventoryStock,
    updateQcStatus,
    deleteInventoryItem,
    canSellAndEditWarranty,
    sellInventoryItem,
    customers,
  } = useStore();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<'all' | 'Dell' | 'HP' | 'Lenovo' | 'other'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'ready_to_sell' | 'testing' | 'sold'>('all');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItemForLabel, setSelectedItemForLabel] = useState<InventoryItem | null>(null);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [tempStockValue, setTempStockValue] = useState<number>(1);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Sales & Handover Modal States (Admin & Sales)
  const [sellingItem, setSellingItem] = useState<InventoryItem | null>(null);
  const [sellCustomerName, setSellCustomerName] = useState('');
  const [sellCustomerBirthDate, setSellCustomerBirthDate] = useState('1992-05-15');
  const [sellCustomerPhone, setSellCustomerPhone] = useState('0918234891');
  const [sellCustomerAddress, setSellCustomerAddress] = useState('Long An - Tây Ninh');
  const [sellSerialNumber, setSellSerialNumber] = useState('');
  const [sellWarrantyMonths, setSellWarrantyMonths] = useState<number>(12);
  const [sellPrice, setSellPrice] = useState<number>(0);

  const existingCustomerCodes = customers
    .map((c) => c.customer_code)
    .filter((code): code is string => Boolean(code));
  const previewCustomerCode = generateCustomerCode(
    sellCustomerBirthDate,
    sellCustomerPhone,
    existingCustomerCodes
  );

  const handleOpenSellModal = (item: InventoryItem) => {
    if (!canSellAndEditWarranty()) {
      setActionNotice('Chỉ Quản trị viên và Nhân viên bán hàng mới có quyền xuất bán & điều chỉnh thông tin bảo hành!');
      setTimeout(() => setActionNotice(null), 3500);
      return;
    }
    setSellingItem(item);
    setSellCustomerName(item.customer_name || '');
    setSellCustomerBirthDate('1992-05-15');
    setSellCustomerPhone(item.customer_phone || '0918234891');
    setSellCustomerAddress('Long An - Tây Ninh');
    setSellSerialNumber(item.serial_number || `SN-${item.service_tag}-2025`);
    setSellWarrantyMonths(item.warranty_months || 12);
    setSellPrice(item.price ?? item.retail_price ?? 0);
  };

  const handleConfirmSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellingItem) return;
    if (!sellCustomerName.trim() || !sellCustomerPhone.trim()) {
      setActionNotice('Vui lòng nhập họ tên và số điện thoại khách hàng!');
      setTimeout(() => setActionNotice(null), 3500);
      return;
    }

    const res = await sellInventoryItem({
      itemId: sellingItem.id,
      customerName: sellCustomerName,
      customerPhone: sellCustomerPhone,
      birthDate: sellCustomerBirthDate,
      customerAddress: sellCustomerAddress,
      serialNumber: sellSerialNumber,
      warrantyMonths: sellWarrantyMonths,
      soldPrice: sellPrice,
    });

    if (res.success) {
      setActionNotice(res.message);
      setSellingItem(null);
      setTimeout(() => setActionNotice(null), 4000);
    } else {
      setActionNotice(res.message);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  // New Machine Form State
  const [newItem, setNewItem] = useState({
    brand: 'Dell',
    model: '',
    form_factor: 'SFF',
    service_tag: '',
    cpu: 'Intel Core i5-8500',
    ram: '16GB DDR4',
    ssd_capacity: '256GB NVMe',
    ssd_health: 98,
    import_price: 3500000,
    price: 4850000,
    stock_quantity: 1,
    shelf_location: 'Kệ A1-01',
    qc_status: 'testing' as InventoryItem['qc_status'],
    warranty_months: 12,
  });

  // Filtered inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const model = item.model || item.device_model || '';
      const matchesSearch =
        item.service_tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.shelf_location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBrand =
        selectedBrand === 'all'
          ? true
          : selectedBrand === 'other'
          ? !['Dell', 'HP', 'Lenovo'].includes(item.brand)
          : item.brand === selectedBrand;

      const matchesStatus =
        selectedStatus === 'all' ? true : item.qc_status === selectedStatus;

      return matchesSearch && matchesBrand && matchesStatus;
    });
  }, [inventory, searchQuery, selectedBrand, selectedStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = inventory.reduce((acc, curr) => acc + (curr.stock_quantity ?? curr.quantity ?? 1), 0);
    const ready = inventory.filter((i) => i.qc_status === 'ready_to_sell').length;
    const testing = inventory.filter((i) => i.qc_status === 'testing' || i.qc_status === 'pending_test').length;
    const highHealth = inventory.filter((i) => (i.ssd_health ?? i.specs?.ssd_health ?? 95) >= 90).length;
    return { total, ready, testing, highHealth };
  }, [inventory]);

  const handleOpenLabelModal = (item: InventoryItem) => {
    setSelectedItemForLabel(item);
    setIsLabelModalOpen(true);
  };

  const handleStockEditSave = async (id: string) => {
    if (!canEditStock()) {
      alert('Quyền bị từ chối: Chỉ Quản trị viên (Admin) mới có quyền điều chỉnh số lượng tồn kho!');
      return;
    }
    await updateInventoryStock(id, tempStockValue);
    setEditingStockId(null);
    setActionNotice('Đã cập nhật số lượng tồn kho thành công!');
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleCreateNewItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.service_tag || !newItem.model) {
      alert('Vui lòng nhập đầy đủ Model và Service Tag!');
      return;
    }

    try {
      await addInventoryItem({
        brand: newItem.brand,
        model: newItem.model,
        form_factor: newItem.form_factor,
        service_tag: newItem.service_tag.toUpperCase().trim(),
        cpu: newItem.cpu,
        ram: newItem.ram,
        ssd_capacity: newItem.ssd_capacity,
        ssd_health: Number(newItem.ssd_health),
        import_price: Number(newItem.import_price),
        price: Number(newItem.price),
        stock_quantity: Number(newItem.stock_quantity),
        shelf_location: newItem.shelf_location,
        qc_status: newItem.qc_status,
        warranty_months: Number(newItem.warranty_months),
        specs_summary: `${newItem.cpu} | ${newItem.ram} | SSD ${newItem.ssd_capacity} (${newItem.ssd_health}%)`,
      });

      setIsAddModalOpen(false);
      setActionNotice(`Đã thêm thiết bị mới [${newItem.service_tag.toUpperCase()}] vào kho!`);
      setTimeout(() => setActionNotice(null), 3000);

      // Reset form
      setNewItem({
        brand: 'Dell',
        model: '',
        form_factor: 'SFF',
        service_tag: '',
        cpu: 'Intel Core i5-8500',
        ram: '16GB DDR4',
        ssd_capacity: '256GB NVMe',
        ssd_health: 98,
        import_price: 3500000,
        price: 4850000,
        stock_quantity: 1,
        shelf_location: 'Kệ A1-01',
        qc_status: 'testing',
        warranty_months: 12,
      });
    } catch (err: any) {
      alert('Lỗi: ' + (err.message || 'Không thể thêm máy'));
    }
  };

  const handleDeleteItem = async (id: string, tag: string) => {
    if (!confirm(`Bạn có chắc muốn xóa thiết bị Service Tag [${tag}] khỏi kho?`)) return;
    const ok = await deleteInventoryItem(id);
    if (ok) {
      setActionNotice(`Đã xóa máy ${tag}`);
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="fixed top-20 right-6 z-50 bg-white text-slate-900 px-4 py-3 rounded-xl shadow-2xl border-2 border-blue-600 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium">{actionNotice}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Quản Lý Kho Máy & Thiết Bị
            <span className="text-xs px-2.5 py-1 bg-blue-100 text-blue-700 font-semibold rounded-full">
              {inventory.length} mã máy
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi cấu hình thực tế, vị trí kệ kho Long An - Tây Ninh, tỷ lệ sức khỏe SSD và phân quyền sửa tồn kho.
          </p>
        </div>

        {/* Action Button: Accessible to Admin, KTV, and Sales */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Nhập Máy Mới Về Kho
        </button>
      </div>

      {/* RBAC Notice Banner */}
      {!canEditStock() && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800">
            <span className="font-semibold">Phân quyền vai trò ({currentUser.name} - {currentUser.role === 'technician' ? 'Kỹ thuật viên' : 'Kinh doanh'}):</span>{' '}
            Bạn có toàn quyền xem thông tin hàng hóa, nhập thiết bị mới và xem số lượng tồn kho. Chức năng điều chỉnh số lượng tồn kho bị khóa (Chỉ Admin được cấp phép).
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Tổng Máy Tồn Kho</div>
            <div className="text-xl font-bold text-slate-900">{stats.total} chiếc</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Sẵn Sàng Bán (Ready)</div>
            <div className="text-xl font-bold text-emerald-700">{stats.ready} máy</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Đang Kiểm Tra (QC)</div>
            <div className="text-xl font-bold text-amber-700">{stats.testing} máy</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">SSD Chuẩn Cao (≥90%)</div>
            <div className="text-xl font-bold text-indigo-700">{stats.highHealth} máy</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo Service Tag, Model, Vị trí kệ..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Brand Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto p-1 bg-slate-100 rounded-lg">
            {(
              [
                { id: 'all', label: 'Tất cả dòng' },
                { id: 'Dell', label: 'Dell OptiPlex' },
                { id: 'HP', label: 'HP ProDesk' },
                { id: 'Lenovo', label: 'ThinkPad' },
                { id: 'other', label: 'Linh kiện khác' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedBrand(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                  selectedBrand === tab.id
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter Pill Row */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium">Trạng thái QC:</span>
          {(
            [
              { id: 'all', label: 'Tất cả trạng thái' },
              { id: 'ready_to_sell', label: 'Sẵn sàng bán (Ready)' },
              { id: 'testing', label: 'Đang kiểm tra (QC)' },
              { id: 'sold', label: 'Đã xuất bán' },
            ] as const
          ).map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStatus(s.id)}
              className={`px-2.5 py-1 rounded-full font-medium transition-all ${
                selectedStatus === s.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Thiết Bị / Model</th>
                <th className="py-3 px-4">Service Tag</th>
                <th className="py-3 px-4">Cấu Hình & SSD Health</th>
                <th className="py-3 px-4">Vị Trí Kệ</th>
                <th className="py-3 px-4">Trạng Thái QC</th>
                <th className="py-3 px-4">Số Lượng Tồn</th>
                <th className="py-3 px-4 text-right">Giá Bán Lẻ</th>
                <th className="py-3 px-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Không tìm thấy thiết bị nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const isReady = item.qc_status === 'ready_to_sell';
                  const isTesting = item.qc_status === 'testing';
                  const isSold = item.qc_status === 'sold';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Model & Form Factor */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{item.model}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-medium text-slate-700">{item.brand}</span>
                          <span>•</span>
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] text-slate-600 font-mono">
                            {item.form_factor}
                          </span>
                        </div>
                      </td>

                      {/* Service Tag */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1 font-mono font-bold text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">
                          <Barcode className="w-3.5 h-3.5 text-blue-500" />
                          {item.service_tag}
                        </div>
                      </td>

                      {/* Specs & SSD Health */}
                      <td className="py-3.5 px-4">
                        <div className="text-xs text-slate-700 flex items-center gap-1">
                          <Cpu className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.cpu}</span>
                          <span>•</span>
                          <span>{item.ram}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="text-xs font-mono text-slate-600 flex items-center gap-1">
                            <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                            {item.ssd_capacity}
                          </div>
                          {/* SSD Health Badge */}
                          {(() => {
                            const health = item.ssd_health ?? item.specs?.ssd_health ?? 95;
                            return (
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  health >= 90
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : health >= 80
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                Health {health}%
                              </span>
                            );
                          })()}
                        </div>
                      </td>

                      {/* Shelf location */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-mono">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {item.shelf_location}
                        </div>
                      </td>

                      {/* QC Status */}
                      <td className="py-3.5 px-4">
                        {canUpdateRepairStatus() ? (
                          <select
                            value={item.qc_status}
                            onChange={(e) =>
                              updateQcStatus(item.id, e.target.value as InventoryItem['qc_status'])
                            }
                            className={`text-xs font-semibold px-2 py-1 rounded-md border cursor-pointer focus:outline-none focus:ring-1 ${
                              isReady
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : isTesting
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-100 text-slate-600 border-slate-300'
                            }`}
                          >
                            <option value="ready_to_sell">✓ Sẵn sàng bán</option>
                            <option value="testing">⏳ Đang kiểm tra</option>
                            <option value="sold">✕ Đã bán</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                              isReady
                                ? 'bg-emerald-100 text-emerald-800'
                                : isTesting
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {isReady && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            {isTesting && <Clock className="w-3 h-3 text-amber-600" />}
                            {isReady ? 'Sẵn sàng bán' : isTesting ? 'Đang kiểm tra' : 'Đã bán'}
                          </span>
                        )}
                      </td>

                      {/* Stock Quantity (RBAC PROTECTED) */}
                      <td className="py-3.5 px-4">
                        {canEditStock() ? (
                          editingStockId === item.id ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min={0}
                                value={tempStockValue}
                                onChange={(e) => setTempStockValue(Number(e.target.value))}
                                className="w-16 px-2 py-1 text-xs border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                              />
                              <button
                                onClick={() => handleStockEditSave(item.id)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded"
                              >
                                Lưu
                              </button>
                              <button
                                onClick={() => setEditingStockId(null)}
                                className="px-1.5 py-1 text-slate-400 hover:text-slate-600 text-xs"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">
                                {item.stock_quantity ?? item.quantity ?? 1}
                              </span>
                              <button
                                onClick={() => {
                                  setEditingStockId(item.id);
                                  setTempStockValue(item.stock_quantity ?? item.quantity ?? 1);
                                }}
                                title="Admin: Sửa số lượng tồn kho"
                                className="text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50 transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )
                        ) : (
                          // Read-Only Display for Technician & Sales
                          <div
                            className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded text-slate-700 text-xs font-semibold cursor-not-allowed group relative"
                            title="Chỉ Admin mới có quyền điều chỉnh số lượng tồn kho"
                          >
                            <span>{item.stock_quantity ?? item.quantity ?? 1} cái</span>
                            <Lock className="w-3 h-3 text-slate-400 group-hover:text-amber-600" />
                          </div>
                        )}
                      </td>

                      {/* Sale Price */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-bold text-slate-900">
                          {(item.price ?? item.retail_price ?? 0).toLocaleString('vi-VN')} đ
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Bảo hành {item.warranty_months}T
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Sale Handover Button (Admin & Sales) */}
                          <button
                            onClick={() => handleOpenSellModal(item)}
                            title={
                              canSellAndEditWarranty()
                                ? 'Xuất bán máy, cấp mã KH & điều chỉnh bảo hành'
                                : 'Chỉ Admin và Bán Hàng có quyền bán máy'
                            }
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border transition-all ${
                              item.qc_status === 'sold'
                                ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300 shadow-xs'
                            }`}
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>{item.qc_status === 'sold' ? 'Đã bán' : 'Bán máy'}</span>
                          </button>

                          {/* Print 50x30mm Label */}
                          <button
                            onClick={() => handleOpenLabelModal(item)}
                            title="In tem nhiệt 50x30mm (Xprinter)"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Admin Only Delete */}
                          {canEditStock() && (
                            <button
                              onClick={() => handleDeleteItem(item.id, item.service_tag)}
                              title="Xóa máy khỏi kho (Chỉ Admin)"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nhập Máy Mới Về Kho (Available to ALL Roles: Admin, KTV, Sales) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-fade-in">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Nhập Thiết Bị / Máy Mới Về Kho</h3>
                <p className="text-xs text-slate-500">
                  Người thực hiện: <span className="font-semibold text-blue-600">{currentUser.name}</span> ({currentUser.role})
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewItem} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Brand */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Thương Hiệu
                  </label>
                  <select
                    value={newItem.brand}
                    onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Dell">Dell</option>
                    <option value="HP">HP</option>
                    <option value="Lenovo">Lenovo</option>
                    <option value="Asus">Asus</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                {/* Model */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tên Model / Mã Máy *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: OptiPlex 7070 SFF"
                    value={newItem.model}
                    onChange={(e) => setNewItem({ ...newItem, model: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Service Tag */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Service Tag / Số Serial *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: ST-99214X hoặc Dell 7 ký tự"
                    value={newItem.service_tag}
                    onChange={(e) => setNewItem({ ...newItem, service_tag: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Form factor */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kích Thước Case (Form Factor)
                  </label>
                  <select
                    value={newItem.form_factor}
                    onChange={(e) => setNewItem({ ...newItem, form_factor: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="SFF">SFF (Small Form Factor)</option>
                    <option value="Mini / Micro">Mini / Micro PC</option>
                    <option value="Tower / MT">Thùng lớn (Tower / MT)</option>
                    <option value="Laptop">Laptop Xách Tay</option>
                  </select>
                </div>

                {/* CPU */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vi Xử Lý (CPU)
                  </label>
                  <input
                    type="text"
                    placeholder="Intel Core i5-8500 3.0GHz"
                    value={newItem.cpu}
                    onChange={(e) => setNewItem({ ...newItem, cpu: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* RAM */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bộ Nhớ RAM
                  </label>
                  <input
                    type="text"
                    placeholder="16GB DDR4 2666MHz"
                    value={newItem.ram}
                    onChange={(e) => setNewItem({ ...newItem, ram: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* SSD Capacity */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ổ Cứng SSD
                  </label>
                  <input
                    type="text"
                    placeholder="256GB NVMe PCIe"
                    value={newItem.ssd_capacity}
                    onChange={(e) => setNewItem({ ...newItem, ssd_capacity: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* SSD Health */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sức Khỏe SSD (%)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={newItem.ssd_health}
                    onChange={(e) => setNewItem({ ...newItem, ssd_health: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Vị trí kệ */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vị Trí Kệ Kho Tân An
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Kệ A1-04"
                    value={newItem.shelf_location}
                    onChange={(e) => setNewItem({ ...newItem, shelf_location: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Initial Stock (Only Admin can set > 1, Tech/Sales default 1) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số Lượng Nhập Ban Đầu
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newItem.stock_quantity}
                    onChange={(e) => setNewItem({ ...newItem, stock_quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Giá Bán Dự Kiến (VNĐ)
                  </label>
                  <input
                    type="number"
                    step={50000}
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* QC Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Trạng Thái Kiểm Định Ban Đầu
                  </label>
                  <select
                    value={newItem.qc_status}
                    onChange={(e) =>
                      setNewItem({ ...newItem, qc_status: e.target.value as InventoryItem['qc_status'] })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="testing">⏳ Đang kiểm tra (Burn-in & QC)</option>
                    <option value="ready_to_sell">✓ Sẵn sàng bán ngay</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm"
                >
                  Lưu Thiết Bị Vào Kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* MODAL BÁN HÀNG & BÀN GIAO THIẾT BỊ (ADMIN & SALES ONLY) */}
      {sellingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-5 my-8">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-200">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase mb-0.5">
                    <span>Phân Quyền Bán Hàng &amp; Admin</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    Xuất Bán Thiết Bị &amp; Bàn Giao Khách Hàng
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setSellingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmSale} className="space-y-4">
              {/* Device Overview Banner */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Thiết bị xuất bán</span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">
                    {sellingItem.brand} {sellingItem.device_model || sellingItem.model} ({sellingItem.form_factor})
                  </div>
                  <div className="text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>Tag: <strong className="text-blue-700 font-mono">{sellingItem.service_tag}</strong></span>
                    <span>• Vị trí: {sellingItem.shelf_location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Giá đề xuất</span>
                  <div className="text-base font-black text-blue-700 mt-0.5">
                    {(sellingItem.price ?? sellingItem.retail_price ?? 0).toLocaleString('vi-VN')} đ
                  </div>
                </div>
              </div>

              {/* SECTION 1: CUSTOMER INFO & AUTO GENERATED CODE */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span>Thông Tin Khách Hàng</span>
                  </label>
                  <span className="text-[11px] text-blue-700 font-medium">Tự động cấp mã KH</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và Tên Khách Hàng *</label>
                    <input
                      type="text"
                      required
                      value={sellCustomerName}
                      onChange={(e) => setSellCustomerName(e.target.value)}
                      placeholder="VD: Anh Tuấn (Cty Vận Tải)"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Số Điện Thoại Khách Hàng *</label>
                    <input
                      type="tel"
                      required
                      value={sellCustomerPhone}
                      onChange={(e) => setSellCustomerPhone(e.target.value)}
                      placeholder="0918234891"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày, Tháng, Năm Sinh *</label>
                    <input
                      type="date"
                      required
                      value={sellCustomerBirthDate}
                      onChange={(e) => setSellCustomerBirthDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Địa Chỉ Giao Hàng</label>
                    <input
                      type="text"
                      value={sellCustomerAddress}
                      onChange={(e) => setSellCustomerAddress(e.target.value)}
                      placeholder="Số nhà, Phường/Xã, Long An - Tây Ninh..."
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Live Auto Generated Customer Code Display */}
                <div className="p-3 rounded-xl bg-white border border-blue-200 flex items-center justify-between gap-3 shadow-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                      Mã Khách Hàng Được Tạo Tự Động
                    </span>
                    <span className="text-base font-black text-blue-700 font-mono">
                      {previewCustomerCode || 'Đang tạo...'}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                      Công thức: [NgàyThángSinh DDMM] + [4 số cuối SĐT]. Nếu trùng lặp tự động thêm 2 số ngẫu nhiên.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold shrink-0">
                    Chuẩn CRM
                  </span>
                </div>
              </div>

              {/* SECTION 2: DEVICE SERIAL & WARRANTY DURATION */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Thông Số Bán Hàng &amp; Bảo Hành (Quyền Bán Hàng &amp; Admin)
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Serial Number Của Thiết Bị *
                    </label>
                    <input
                      type="text"
                      required
                      value={sellSerialNumber}
                      onChange={(e) => setSellSerialNumber(e.target.value)}
                      placeholder="VD: SN-DELL-8F4K92X-2025"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Thời Hạn Bảo Hành (Tháng) *
                    </label>
                    <select
                      value={sellWarrantyMonths}
                      onChange={(e) => setSellWarrantyMonths(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-700"
                    >
                      <option value={6}>6 Tháng (Linh kiện cơ bản)</option>
                      <option value={12}>12 Tháng (Chuẩn máy loại A)</option>
                      <option value={24}>24 Tháng (Gói cao cấp)</option>
                      <option value={36}>36 Tháng (SSD &amp; RAM mới hãng)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Giá Bán Thực Tế (VNĐ)</label>
                  <input
                    type="number"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSellingItem(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/25 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Xác Nhận Xuất Bán &amp; Kích Hoạt Bảo Hành</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Thermal Label Modal (50x30mm) */}
      <ThermalLabelModal
        isOpen={isLabelModalOpen}
        onClose={() => setIsLabelModalOpen(false)}
        item={selectedItemForLabel}
      />
    </div>
  );
}
