'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { InventoryItem, SparePart, SoftwareLicense, generateCustomerCode } from '@/lib/supabase';
import ThermalLabelModal from '@/components/admin/ThermalLabelModal';
import {
  Search,
  Plus,
  Printer,
  ShieldCheck,
  HardDrive,
  Cpu,
  Layers,
  Lock,
  ShoppingBag,
  UserCheck,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Barcode,
  X,
  Sparkles,
  Package,
  Wrench,
  Key,
  Monitor,
  Disc,
  Filter,
} from 'lucide-react';

export default function KhoMayPage() {
  const {
    inventory,
    spareParts,
    addSparePart,
    updateSparePart,
    deleteSparePart,
    softwareLicenses,
    addSoftwareLicense,
    updateSoftwareLicense,
    deleteSoftwareLicense,
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

  // Navigation tab state: Máy tính, Linh kiện (mới/cũ), Phần mềm bản quyền
  const [activeTab, setActiveTab] = useState<'machines' | 'components' | 'software'>('machines');

  // Filter & Search states - Machines
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<'all' | 'Dell' | 'HP' | 'Lenovo' | 'other'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'ready_to_sell' | 'testing' | 'sold'>('all');

  // Filter & Search states - Components (Linh kiện)
  const [partSearchQuery, setPartSearchQuery] = useState('');
  const [partConditionFilter, setPartConditionFilter] = useState<'all' | 'new' | 'used'>('all');
  const [partTypeFilter, setPartTypeFilter] = useState<string>('all');
  const [isAddPartModalOpen, setIsAddPartModalOpen] = useState(false);
  const [editingPartStockId, setEditingPartStockId] = useState<string | null>(null);
  const [tempPartStockValue, setTempPartStockValue] = useState<number>(1);
  const [newPart, setNewPart] = useState({
    part_name: '',
    part_type: 'SSD',
    condition: 'new' as 'new' | 'used',
    quantity_in_stock: 5,
    warranty_months: 36,
    distributor: 'Chính hãng',
    unit_cost: 450000,
    unit_price: 650000,
    shelf_location: 'Kệ Linh Kiện L1',
    notes: 'Mới 100% nguyên seal',
  });

  // Filter & Search states - Software (Phần mềm)
  const [softwareSearchQuery, setSoftwareSearchQuery] = useState('');
  const [softwareTypeFilter, setSoftwareTypeFilter] = useState<string>('all');
  const [softwareLicenseFilter, setSoftwareLicenseFilter] = useState<string>('all');
  const [isAddSoftwareModalOpen, setIsAddSoftwareModalOpen] = useState(false);
  const [editingSoftwareStockId, setEditingSoftwareStockId] = useState<string | null>(null);
  const [tempSoftwareStockValue, setTempSoftwareStockValue] = useState<number>(5);
  const [newSoftware, setNewSoftware] = useState({
    software_name: '',
    software_type: 'os',
    license_type: 'oem',
    quantity_in_stock: 10,
    unit_cost: 350000,
    unit_price: 550000,
    duration_months: 0,
    distributor: 'Microsoft Partner / Phân phối chính hãng',
    notes: 'Key kích hoạt kỹ thuật số chính hãng',
  });

  // Modal states - Machines
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

  // Filtered inventory - Machines
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

  // Filtered Spare Parts - Linh kiện
  const filteredSpareParts = useMemo(() => {
    return spareParts.filter((part) => {
      const matchesSearch =
        part.part_name.toLowerCase().includes(partSearchQuery.toLowerCase()) ||
        (part.distributor || '').toLowerCase().includes(partSearchQuery.toLowerCase()) ||
        (part.shelf_location || '').toLowerCase().includes(partSearchQuery.toLowerCase()) ||
        (part.notes || '').toLowerCase().includes(partSearchQuery.toLowerCase());

      const matchesCondition =
        partConditionFilter === 'all' ? true : part.condition === partConditionFilter;

      const matchesType =
        partTypeFilter === 'all' ? true : part.part_type === partTypeFilter;

      return matchesSearch && matchesCondition && matchesType;
    });
  }, [spareParts, partSearchQuery, partConditionFilter, partTypeFilter]);

  // Filtered Software Licenses - Phần mềm
  const filteredSoftwareLicenses = useMemo(() => {
    return softwareLicenses.filter((sw) => {
      const matchesSearch =
        sw.software_name.toLowerCase().includes(softwareSearchQuery.toLowerCase()) ||
        (sw.distributor || '').toLowerCase().includes(softwareSearchQuery.toLowerCase()) ||
        (sw.notes || '').toLowerCase().includes(softwareSearchQuery.toLowerCase());

      const matchesType =
        softwareTypeFilter === 'all' ? true : sw.software_type === softwareTypeFilter;

      const matchesLicense =
        softwareLicenseFilter === 'all' ? true : sw.license_type === softwareLicenseFilter;

      return matchesSearch && matchesType && matchesLicense;
    });
  }, [softwareLicenses, softwareSearchQuery, softwareTypeFilter, softwareLicenseFilter]);

  // Statistics (Updated: "SSD Chuẩn Cao" đổi thành "Linh Kiện" mới/cũ, bổ sung Phần Mềm)
  const stats = useMemo(() => {
    const total = inventory.reduce((acc, curr) => acc + (curr.stock_quantity ?? curr.quantity ?? 1), 0);
    const ready = inventory.filter((i) => i.qc_status === 'ready_to_sell').length;
    const testing = inventory.filter((i) => i.qc_status === 'testing' || i.qc_status === 'pending_test').length;

    // Linh kiện (Mới & Cũ bóc máy)
    const componentsTotal = spareParts.reduce((acc, p) => acc + (p.quantity_in_stock || 0), 0);
    const componentsNew = spareParts
      .filter((p) => p.condition === 'new')
      .reduce((acc, p) => acc + (p.quantity_in_stock || 0), 0);
    const componentsUsed = spareParts
      .filter((p) => p.condition === 'used')
      .reduce((acc, p) => acc + (p.quantity_in_stock || 0), 0);

    // Phần mềm bản quyền
    const softwareTotal = softwareLicenses.reduce((acc, s) => acc + (s.quantity_in_stock || 0), 0);
    const softwareCount = softwareLicenses.length;

    return {
      total,
      ready,
      testing,
      componentsTotal,
      componentsNew,
      componentsUsed,
      softwareTotal,
      softwareCount,
    };
  }, [inventory, spareParts, softwareLicenses]);

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
    } catch (err: unknown) {
      alert('Lỗi: ' + (err instanceof Error ? err.message : 'Không thể thêm máy'));
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

  // Handlers for Components (Linh kiện mới/cũ)
  const handleStockEditPart = async (id: string) => {
    if (!canEditStock()) {
      alert('Quyền bị từ chối: Chỉ Quản trị viên (Admin) mới có quyền điều chỉnh số lượng tồn kho!');
      return;
    }
    await updateSparePart(id, { quantity_in_stock: tempPartStockValue });
    setEditingPartStockId(null);
    setActionNotice('Đã cập nhật số lượng linh kiện thành công!');
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleCreateNewPart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPart.part_name.trim()) {
      alert('Vui lòng nhập tên linh kiện!');
      return;
    }

    try {
      await addSparePart({
        part_name: newPart.part_name.trim(),
        part_type: newPart.part_type,
        condition: newPart.condition,
        quantity_in_stock: Number(newPart.quantity_in_stock),
        warranty_months: Number(newPart.warranty_months),
        distributor: newPart.distributor,
        unit_cost: Number(newPart.unit_cost),
        unit_price: Number(newPart.unit_price),
        shelf_location: newPart.shelf_location,
        notes: newPart.notes,
      });

      setIsAddPartModalOpen(false);
      setActionNotice(`Đã thêm linh kiện [${newPart.part_name}] vào kho!`);
      setTimeout(() => setActionNotice(null), 3000);

      // Reset form
      setNewPart({
        part_name: '',
        part_type: 'SSD',
        condition: 'new',
        quantity_in_stock: 5,
        warranty_months: 36,
        distributor: 'Chính hãng',
        unit_cost: 450000,
        unit_price: 650000,
        shelf_location: 'Kệ Linh Kiện L1',
        notes: 'Mới 100% nguyên seal',
      });
    } catch (err: unknown) {
      alert('Lỗi: ' + (err instanceof Error ? err.message : 'Không thể thêm linh kiện'));
    }
  };

  const handleDeletePart = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa linh kiện [${name}] khỏi hệ thống?`)) return;
    const ok = await deleteSparePart(id);
    if (ok) {
      setActionNotice(`Đã xóa linh kiện ${name}`);
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  // Handlers for Software (Phần mềm & Bản quyền số)
  const handleStockEditSoftware = async (id: string) => {
    if (!canEditStock()) {
      alert('Quyền bị từ chối: Chỉ Quản trị viên (Admin) mới có quyền điều chỉnh số lượng tồn kho!');
      return;
    }
    await updateSoftwareLicense(id, { quantity_in_stock: tempSoftwareStockValue });
    setEditingSoftwareStockId(null);
    setActionNotice('Đã cập nhật số lượng key bản quyền thành công!');
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleCreateNewSoftware = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSoftware.software_name.trim()) {
      alert('Vui lòng nhập tên phần mềm / gói bản quyền!');
      return;
    }

    try {
      await addSoftwareLicense({
        software_name: newSoftware.software_name.trim(),
        software_type: newSoftware.software_type,
        license_type: newSoftware.license_type,
        quantity_in_stock: Number(newSoftware.quantity_in_stock),
        unit_cost: Number(newSoftware.unit_cost),
        unit_price: Number(newSoftware.unit_price),
        duration_months: Number(newSoftware.duration_months),
        distributor: newSoftware.distributor,
        notes: newSoftware.notes,
      });

      setIsAddSoftwareModalOpen(false);
      setActionNotice(`Đã thêm phần mềm [${newSoftware.software_name}] vào kho!`);
      setTimeout(() => setActionNotice(null), 3000);

      // Reset form
      setNewSoftware({
        software_name: '',
        software_type: 'os',
        license_type: 'oem',
        quantity_in_stock: 10,
        unit_cost: 350000,
        unit_price: 550000,
        duration_months: 0,
        distributor: 'Microsoft Partner / Phân phối chính hãng',
        notes: 'Key kích hoạt kỹ thuật số chính hãng',
      });
    } catch (err: unknown) {
      alert('Lỗi: ' + (err instanceof Error ? err.message : 'Không thể thêm phần mềm'));
    }
  };

  const handleDeleteSoftware = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa phần mềm [${name}] khỏi hệ thống?`)) return;
    const ok = await deleteSoftwareLicense(id);
    if (ok) {
      setActionNotice(`Đã xóa phần mềm ${name}`);
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
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {activeTab === 'machines' && 'Kho Máy Bộ'}
            {activeTab === 'components' && 'Kho Linh Kiện'}
            {activeTab === 'software' && 'Kho Phần Mềm'}
            <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold rounded-md">
              {activeTab === 'machines' && `${inventory.length} máy`}
              {activeTab === 'components' && `${spareParts.length} mục`}
              {activeTab === 'software' && `${softwareLicenses.length} mục`}
            </span>
          </h1>
        </div>

        {/* Action Button: Changes dynamically by active tab */}
        {activeTab === 'machines' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all active:scale-95 whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Nhập máy
          </button>
        )}
        {activeTab === 'components' && (
          <button
            onClick={() => setIsAddPartModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all active:scale-95 whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm linh kiện
          </button>
        )}
        {activeTab === 'software' && (
          <button
            onClick={() => setIsAddSoftwareModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all active:scale-95 whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm phần mềm
          </button>
        )}
      </div>

      {/* Category Tabs: Machines, Components, Software */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
        <button
          onClick={() => setActiveTab('machines')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'machines'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Monitor className="w-3.5 h-3.5 text-blue-600" />
          <span>Máy bộ</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
            activeTab === 'machines' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
          }`}>
            {stats.total}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('components')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'components'
              ? 'bg-white text-emerald-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wrench className="w-3.5 h-3.5 text-emerald-600" />
          <span>Linh kiện</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
            activeTab === 'components' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
          }`}>
            {stats.componentsTotal}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('software')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'software'
              ? 'bg-white text-purple-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Key className="w-3.5 h-3.5 text-purple-600" />
          <span>Phần mềm</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
            activeTab === 'software' ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-700'
          }`}>
            {stats.softwareTotal}
          </span>
        </button>
      </div>

      {/* RBAC Notice (Compact) */}
      {!canEditStock() && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2 text-xs text-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Tài khoản {currentUser.name} ({currentUser.role === 'technician' ? 'Kỹ thuật' : 'Kinh doanh'}) — Chỉ xem tồn kho, quyền sửa dành cho Admin.</span>
        </div>
      )}

      {/* KPI Stats Grid (Compact) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-slate-500 truncate">Máy Tồn Kho</div>
            <div className="text-base font-bold text-slate-900">{stats.total} máy</div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-slate-500 truncate">Sẵn Bán (RTS)</div>
            <div className="text-base font-bold text-emerald-700">{stats.ready} máy</div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-slate-500 truncate">Đang QC</div>
            <div className="text-base font-bold text-amber-700">{stats.testing} máy</div>
          </div>
        </div>

        <div className={`p-3 rounded-xl border shadow-2xs flex items-center gap-2.5 transition-colors ${
          activeTab === 'components' ? 'bg-emerald-50/50 border-emerald-300' : 'bg-white border-slate-200'
        }`}>
          <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Wrench className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-slate-500 truncate">Linh Kiện</div>
            <div className="text-base font-bold text-emerald-800">{stats.componentsTotal} món</div>
            <div className="text-[10px] text-slate-500 font-medium">
              Mới {stats.componentsNew} • Cũ {stats.componentsUsed}
            </div>
          </div>
        </div>

        <div className={`p-3 rounded-xl border shadow-2xs flex items-center gap-2.5 transition-colors ${
          activeTab === 'software' ? 'bg-purple-50/50 border-purple-300' : 'bg-white border-slate-200'
        }`}>
          <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Key className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-slate-500 truncate">Phần Mềm</div>
            <div className="text-base font-bold text-purple-800">{stats.softwareTotal} bản quyền</div>
            <div className="text-[10px] text-slate-500 font-medium">
              {stats.softwareCount} sản phẩm
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MÁY TÍNH & THIẾT BỊ ĐỒNG BỘ */}
      {/* ========================================================================= */}
      {activeTab === 'machines' && (
        <>
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
              placeholder="Tìm Service Tag, Model..."
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
                { id: 'all', label: 'Tất cả' },
                { id: 'Dell', label: 'Dell' },
                { id: 'HP', label: 'HP' },
                { id: 'Lenovo', label: 'Lenovo' },
                { id: 'other', label: 'Khác' },
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
          <span className="text-slate-400 font-medium">Hàng hóa:</span>
          {(
            [
              { id: 'all', label: 'Tất cả' },
              { id: 'ready_to_sell', label: 'RTS' },
              { id: 'testing', label: 'QC' },
              { id: 'sold', label: 'Sold' },
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
                <th className="py-3 px-4">Model</th>
                <th className="py-3 px-4">Service Tag</th>
                <th className="py-3 px-4">Cấu Hình</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4">Tồn Kho</th>
                <th className="py-3 px-4 text-right">Giá Bán</th>
                <th className="py-3 px-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Không tìm thấy thiết bị nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const isReady = item.qc_status === 'ready_to_sell';
                  const isTesting = item.qc_status === 'testing';

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
                        {(item.price ?? item.retail_price ?? 0) <= 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            Liên hệ
                          </span>
                        ) : (
                          <div className="font-bold text-slate-900 font-mono">
                            {(item.price ?? item.retail_price ?? 0).toLocaleString('vi-VN')} đ
                          </div>
                        )}
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
    </>
  )}

      {/* ========================================================================= */}
      {/* TAB 2: QUẢN LÝ LINH KIỆN PHẦN CỨNG (MỚI 100% & CŨ ZIN BÓC MÁY) */}
      {/* ========================================================================= */}
      {activeTab === 'components' && (
        <>
          {/* Search & Filter Toolbar - Components */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Search box */}
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={partSearchQuery}
                  onChange={(e) => setPartSearchQuery(e.target.value)}
                  placeholder="Tìm linh kiện..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
                {partSearchQuery && (
                  <button
                    onClick={() => setPartSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Condition Filter Tabs: Mới 100% vs Cũ/Zin bóc máy */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
                <button
                  onClick={() => setPartConditionFilter('all')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    partConditionFilter === 'all'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setPartConditionFilter('new')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                    partConditionFilter === 'new'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-emerald-700'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Mới 100%</span>
                </button>
                <button
                  onClick={() => setPartConditionFilter('used')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                    partConditionFilter === 'used'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-purple-700'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Cũ / Bóc máy</span>
                </button>
              </div>
            </div>

            {/* Part Type Filter Pills */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs overflow-x-auto">
              <span className="text-slate-400 font-medium shrink-0">Loại:</span>
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'SSD', label: 'SSD' },
                { id: 'RAM', label: 'RAM' },
                { id: 'CPU', label: 'CPU' },
                { id: 'VGA', label: 'VGA' },
                { id: 'PSU', label: 'Nguồn' },
                { id: 'Mainboard', label: 'Mainboard' },
                { id: 'ThermalPaste', label: 'Keo tản nhiệt' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setPartTypeFilter(t.id)}
                  className={`px-2.5 py-1 rounded-full font-medium transition-all whitespace-nowrap ${
                    partTypeFilter === t.id
                      ? 'bg-emerald-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Spare Parts Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Linh Kiện</th>
                    <th className="py-3 px-4">Loại</th>
                    <th className="py-3 px-4">Tình Trạng</th>
                    <th className="py-3 px-4">Tồn Kho</th>
                    <th className="py-3 px-4">Giá Nhập</th>
                    <th className="py-3 px-4 text-right">Giá Bán</th>
                    <th className="py-3 px-4 text-center">Bảo Hành</th>
                    <th className="py-3 px-4 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {filteredSpareParts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        Không tìm thấy linh kiện nào phù hợp với bộ lọc hiện tại.
                      </td>
                    </tr>
                  ) : (
                    filteredSpareParts.map((part) => {
                      const isNew = part.condition === 'new';

                      return (
                        <tr key={part.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Part Name & Distributor */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900">{part.part_name}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <span className="font-medium text-slate-600">{part.distributor || 'Chính hãng'}</span>
                              {part.notes && (
                                <>
                                  <span>•</span>
                                  <span className="text-slate-400 italic text-[11px]">{part.notes}</span>
                                </>
                              )}
                            </div>
                          </td>

                          {/* Part Type Badge */}
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-bold font-mono">
                              {part.part_type}
                            </span>
                          </td>

                          {/* Condition Badge (Mới 100% vs Cũ Zin bóc máy) */}
                          <td className="py-3.5 px-4">
                            {isNew ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <Sparkles className="w-3 h-3 text-emerald-600" />
                                Mới 100%
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                <Package className="w-3 h-3 text-purple-600" />
                                Zin bóc máy (Cũ)
                              </span>
                            )}
                          </td>

                          {/* Stock Quantity */}
                          <td className="py-3.5 px-4">
                            {editingPartStockId === part.id ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min={0}
                                  value={tempPartStockValue}
                                  onChange={(e) => setTempPartStockValue(Number(e.target.value))}
                                  className="w-16 px-2 py-1 text-xs border border-emerald-500 rounded font-bold"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleStockEditPart(part.id)}
                                  className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingPartStockId(null)}
                                  className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className={`font-bold ${part.quantity_in_stock <= 2 ? 'text-rose-600' : 'text-slate-900'}`}>
                                  {part.quantity_in_stock} cái
                                </span>
                                {canEditStock() ? (
                                  <button
                                    onClick={() => {
                                      setEditingPartStockId(part.id);
                                      setTempPartStockValue(part.quantity_in_stock);
                                    }}
                                    title="Sửa số lượng tồn (Chỉ Admin)"
                                    className="p-1 text-slate-400 hover:text-emerald-600 rounded hover:bg-emerald-50 transition-colors"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                ) : (
                                  <span title="Chỉ Admin mới có quyền sửa tồn kho">
                                    <Lock className="w-3 h-3 text-slate-300" />
                                  </span>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Cost Price */}
                          <td className="py-3.5 px-4 text-xs">
                            {canEditStock() ? (
                              <span className="font-medium text-slate-600">
                                {new Intl.NumberFormat('vi-VN').format(part.unit_cost || 0)} đ
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Bảo mật</span>
                            )}
                          </td>

                          {/* Retail Price */}
                          <td className="py-3.5 px-4 text-right">
                            <span className="font-bold text-slate-900">
                              {part.unit_price === 0
                                ? 'Giá liên hệ'
                                : new Intl.NumberFormat('vi-VN').format(part.unit_price) + ' đ'}
                            </span>
                          </td>

                          {/* Warranty */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                              {part.warranty_months} tháng
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-center">
                            {canEditStock() && (
                              <button
                                onClick={() => handleDeletePart(part.id, part.part_name)}
                                title="Xóa linh kiện (Chỉ Admin)"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: QUẢN LÝ PHẦN MỀM */}
      {/* ========================================================================= */}
      {activeTab === 'software' && (
        <>
          {/* Search & Filter Toolbar - Software */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Search box */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={softwareSearchQuery}
                  onChange={(e) => setSoftwareSearchQuery(e.target.value)}
                  placeholder="Tìm phần mềm, đối tác..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                />
                {softwareSearchQuery && (
                  <button
                    onClick={() => setSoftwareSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* License Type Filter */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg overflow-x-auto">
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'oem', label: 'OEM' },
                  { id: 'retail', label: 'Retail' },
                  { id: 'subscription', label: 'Subscription' },
                ].map((lic) => (
                  <button
                    key={lic.id}
                    onClick={() => setSoftwareLicenseFilter(lic.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                      softwareLicenseFilter === lic.id
                        ? 'bg-white text-purple-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lic.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Software Category Pills */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs overflow-x-auto">
              <span className="text-slate-400 font-medium shrink-0">Danh mục:</span>
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'os', label: 'Windows' },
                { id: 'office', label: 'Office' },
                { id: 'antivirus', label: 'Diệt virus' },
                { id: 'accounting', label: 'Kế toán' },
                { id: 'pos', label: 'Bán hàng' },
                { id: 'utility', label: 'Tiện ích' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSoftwareTypeFilter(c.id)}
                  className={`px-2.5 py-1 rounded-full font-medium transition-all whitespace-nowrap ${
                    softwareTypeFilter === c.id
                      ? 'bg-purple-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Software Licenses Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Phần Mềm &amp; Đối Tác</th>
                    <th className="py-3 px-4">Danh Mục</th>
                    <th className="py-3 px-4">Cấp Phép</th>
                    <th className="py-3 px-4">Thời Hạn</th>
                    <th className="py-3 px-4">Tồn Kho</th>
                    <th className="py-3 px-4">Giá Nhập</th>
                    <th className="py-3 px-4 text-right">Giá Bán</th>
                    <th className="py-3 px-4 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {filteredSoftwareLicenses.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        Không có phần mềm phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredSoftwareLicenses.map((sw) => {
                      return (
                        <tr key={sw.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Software Name & Partner */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900">{sw.software_name}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <span className="font-medium text-slate-600">{sw.distributor || 'Chính hãng'}</span>
                              {sw.notes && (
                                <>
                                  <span>•</span>
                                  <span className="text-slate-400 italic text-[11px]">{sw.notes}</span>
                                </>
                              )}
                            </div>
                          </td>

                          {/* Category Badge */}
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-semibold capitalize">
                              {sw.software_type === 'os' && 'Hệ điều hành'}
                              {sw.software_type === 'office' && 'Office'}
                              {sw.software_type === 'antivirus' && 'Diệt virus'}
                              {sw.software_type === 'accounting' && 'Kế toán'}
                              {sw.software_type === 'pos' && 'Bán hàng'}
                              {sw.software_type === 'utility' && 'Tiện ích'}
                              {!['os', 'office', 'antivirus', 'accounting', 'pos', 'utility'].includes(sw.software_type) && sw.software_type}
                            </span>
                          </td>

                          {/* License Type Badge */}
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              sw.license_type === 'oem'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : sw.license_type === 'subscription'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-purple-100 text-purple-800 border border-purple-200'
                            }`}>
                              {sw.license_type.toUpperCase()}
                            </span>
                          </td>

                          {/* Duration */}
                          <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                            {sw.duration_months === 0 ? (
                              <span className="text-emerald-700 font-bold">Vĩnh viễn</span>
                            ) : (
                              <span>{sw.duration_months} tháng</span>
                            )}
                          </td>

                          {/* Quantity In Stock */}
                          <td className="py-3.5 px-4">
                            {editingSoftwareStockId === sw.id ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min={0}
                                  value={tempSoftwareStockValue}
                                  onChange={(e) => setTempSoftwareStockValue(Number(e.target.value))}
                                  className="w-16 px-2 py-1 text-xs border border-purple-500 rounded font-bold"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleStockEditSoftware(sw.id)}
                                  className="p-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingSoftwareStockId(null)}
                                  className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className={`font-bold ${sw.quantity_in_stock <= 2 ? 'text-rose-600' : 'text-slate-900'}`}>
                                  {sw.quantity_in_stock} key
                                </span>
                                {canEditStock() ? (
                                  <button
                                    onClick={() => {
                                      setEditingSoftwareStockId(sw.id);
                                      setTempSoftwareStockValue(sw.quantity_in_stock);
                                    }}
                                    title="Sửa số lượng tồn"
                                    className="p-1 text-slate-400 hover:text-purple-600 rounded hover:bg-purple-50 transition-colors"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                ) : (
                                  <span title="Chỉ Admin mới có quyền sửa tồn kho">
                                    <Lock className="w-3 h-3 text-slate-300" />
                                  </span>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Cost Price */}
                          <td className="py-3.5 px-4 text-xs">
                            {canEditStock() ? (
                              <span className="font-medium text-slate-600">
                                {new Intl.NumberFormat('vi-VN').format(sw.unit_cost || 0)} đ
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Bảo mật</span>
                            )}
                          </td>

                          {/* Retail Price */}
                          <td className="py-3.5 px-4 text-right">
                            <span className="font-bold text-slate-900">
                              {sw.unit_price === 0
                                ? 'Liên hệ'
                                : new Intl.NumberFormat('vi-VN').format(sw.unit_price) + ' đ'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-center">
                            {canEditStock() && (
                              <button
                                onClick={() => handleDeleteSoftware(sw.id, sw.software_name)}
                                title="Xóa bản quyền"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal Nhập Máy Mới */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-fade-in">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Nhập Máy Mới</h3>
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
                    Model Máy *
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
                    Service Tag / Serial *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: ST-99214X"
                    value={newItem.service_tag}
                    onChange={(e) => setNewItem({ ...newItem, service_tag: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Form factor */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kích Thước Case
                  </label>
                  <select
                    value={newItem.form_factor}
                    onChange={(e) => setNewItem({ ...newItem, form_factor: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="SFF">SFF (Small Form Factor)</option>
                    <option value="Mini / Micro">Mini / Micro PC</option>
                    <option value="Tower / MT">Thùng lớn (Tower)</option>
                    <option value="Laptop">Laptop</option>
                  </select>
                </div>

                {/* CPU */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vi Xử Lý (CPU)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: i5-8500"
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
                    placeholder="VD: 16GB DDR4"
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
                    placeholder="VD: 256GB NVMe"
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


                {/* Initial Stock */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số Lượng
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Giá Bán (VNĐ)
                    </label>
                    <button
                      type="button"
                      onClick={() => setNewItem({ ...newItem, price: 0 })}
                      className={`text-[11px] px-2 py-0.5 rounded font-semibold transition-colors ${
                        newItem.price === 0
                          ? 'bg-amber-600 text-white'
                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      }`}
                    >
                      {newItem.price === 0 ? '✓ Giá Liên Hệ' : 'Đặt "Liên Hệ"'}
                    </button>
                  </div>
                  <input
                    type="number"
                    step={50000}
                    value={newItem.price === 0 ? '' : newItem.price}
                    placeholder={newItem.price === 0 ? 'Liên Hệ (0 đ)' : 'Nhập giá bán...'}
                    onChange={(e) =>
                      setNewItem({ ...newItem, price: e.target.value === '' ? 0 : Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* QC Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Trạng Thái
                  </label>
                  <select
                    value={newItem.qc_status}
                    onChange={(e) =>
                      setNewItem({ ...newItem, qc_status: e.target.value as InventoryItem['qc_status'] })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="testing">⏳ Đang QC (chạy thử)</option>
                    <option value="ready_to_sell">✓ Sẵn sàng bán (RTS)</option>
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
                  Lưu Máy Mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* MODAL BÁN MÁY */}
      {sellingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-200">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Bán Máy &amp; Bàn Giao
                  </h2>
                  <p className="text-xs text-slate-500">Ghi nhận thông tin khách và kích hoạt bảo hành</p>
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
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Thiết bị</span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">
                    {sellingItem.brand} {sellingItem.device_model || sellingItem.model} ({sellingItem.form_factor})
                  </div>
                  <div className="text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>Tag: <strong className="text-blue-700 font-mono">{sellingItem.service_tag}</strong></span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Giá niêm yết</span>
                  <div className="text-base font-black text-blue-700 mt-0.5">
                    {(sellingItem.price ?? sellingItem.retail_price ?? 0).toLocaleString('vi-VN')} đ
                  </div>
                </div>
              </div>

              {/* CUSTOMER INFO */}
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span>Thông Tin Khách Hàng</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    {previewCustomerCode || 'Mã KH tự động'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và Tên *</label>
                    <input
                      type="text"
                      required
                      value={sellCustomerName}
                      onChange={(e) => setSellCustomerName(e.target.value)}
                      placeholder="VD: Nguyễn Văn A"
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Số Điện Thoại *</label>
                    <input
                      type="tel"
                      required
                      value={sellCustomerPhone}
                      onChange={(e) => setSellCustomerPhone(e.target.value)}
                      placeholder="0918xxxxxx"
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày Sinh *</label>
                    <input
                      type="date"
                      required
                      value={sellCustomerBirthDate}
                      onChange={(e) => setSellCustomerBirthDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Địa Chỉ</label>
                    <input
                      type="text"
                      value={sellCustomerAddress}
                      onChange={(e) => setSellCustomerAddress(e.target.value)}
                      placeholder="Phường/Xã, Tỉnh..."
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* WARRANTY & PRICE */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Bảo Hành &amp; Thanh Toán
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Số Serial Thiết Bị *
                    </label>
                    <input
                      type="text"
                      required
                      value={sellSerialNumber}
                      onChange={(e) => setSellSerialNumber(e.target.value)}
                      placeholder="VD: SN-DELL-8F4K92X"
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Thời Hạn Bảo Hành *
                    </label>
                    <select
                      value={sellWarrantyMonths}
                      onChange={(e) => setSellWarrantyMonths(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-700"
                    >
                      <option value={6}>6 Tháng</option>
                      <option value={12}>12 Tháng</option>
                      <option value={24}>24 Tháng</option>
                      <option value={36}>36 Tháng</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Giá Bán Thực Tế (VNĐ)</label>
                  <input
                    type="number"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSellingItem(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Xác Nhận Bán Máy</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL THÊM LINH KIỆN MỚI */}
      {isAddPartModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-fade-in">
            <div className="px-6 py-4 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-emerald-600" />
                  Thêm Linh Kiện Mới
                </h3>
              </div>
              <button
                onClick={() => setIsAddPartModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewPart} className="p-6 space-y-4">
              {/* Tình Trạng Linh Kiện */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Tình Trạng *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewPart({ ...newPart, condition: 'new', warranty_months: 36 })}
                    className={`p-3 rounded-xl border-2 text-left transition-all flex items-start gap-2.5 ${
                      newPart.condition === 'new'
                        ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <Sparkles className={`w-5 h-5 shrink-0 ${newPart.condition === 'new' ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <div>
                      <div className={`text-xs font-bold ${newPart.condition === 'new' ? 'text-emerald-900' : 'text-slate-800'}`}>
                        Mới 100%
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Chính hãng (24-36 tháng)
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewPart({ ...newPart, condition: 'used', warranty_months: 3 })}
                    className={`p-3 rounded-xl border-2 text-left transition-all flex items-start gap-2.5 ${
                      newPart.condition === 'used'
                        ? 'border-purple-600 bg-purple-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <Package className={`w-5 h-5 shrink-0 ${newPart.condition === 'used' ? 'text-purple-600' : 'text-slate-400'}`} />
                    <div>
                      <div className={`text-xs font-bold ${newPart.condition === 'used' ? 'text-purple-900' : 'text-slate-800'}`}>
                        Cũ / Bóc Máy
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Đã test QC (1-6 tháng)
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Part Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tên Linh Kiện &amp; Model *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: SSD Kingston NV2 500GB NVMe"
                    value={newPart.part_name}
                    onChange={(e) => setNewPart({ ...newPart, part_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                  />
                </div>

                {/* Part Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phân Loại
                  </label>
                  <select
                    value={newPart.part_type}
                    onChange={(e) => setNewPart({ ...newPart, part_type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="SSD">Ổ cứng SSD</option>
                    <option value="RAM">Bộ nhớ RAM</option>
                    <option value="CPU">Vi xử lý CPU</option>
                    <option value="VGA">Card đồ họa VGA</option>
                    <option value="PSU">Nguồn máy tính (PSU)</option>
                    <option value="Mainboard">Bo mạch chủ (Mainboard)</option>
                    <option value="Screen">Màn hình</option>
                    <option value="ThermalPaste">Keo tản nhiệt / Phụ kiện</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>


                {/* Initial Stock */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số Lượng Tồn *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newPart.quantity_in_stock}
                    onChange={(e) => setNewPart({ ...newPart, quantity_in_stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
                  />
                </div>

                {/* Warranty Months */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bảo Hành (Tháng) *
                  </label>
                  <select
                    value={newPart.warranty_months}
                    onChange={(e) => setNewPart({ ...newPart, warranty_months: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-emerald-800"
                  >
                    <option value={1}>1 Tháng</option>
                    <option value={3}>3 Tháng</option>
                    <option value={6}>6 Tháng</option>
                    <option value={12}>12 Tháng</option>
                    <option value={24}>24 Tháng</option>
                    <option value={36}>36 Tháng</option>
                  </select>
                </div>

                {/* Distributor */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nhà Phân Phối / Hãng
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Viễn Sơn, FPT, Bóc máy..."
                    value={newPart.distributor}
                    onChange={(e) => setNewPart({ ...newPart, distributor: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Unit Cost */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Giá Nhập (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={newPart.unit_cost}
                    onChange={(e) => setNewPart({ ...newPart, unit_cost: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                  />
                </div>

                {/* Unit Price */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Giá Bán (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={newPart.unit_price}
                    onChange={(e) => setNewPart({ ...newPart, unit_price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold text-emerald-700"
                  />
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ghi Chú
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Còn tem phân phối, tốc độ đọc 3500MB/s..."
                    value={newPart.notes}
                    onChange={(e) => setNewPart({ ...newPart, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddPartModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Lưu Linh Kiện
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL THÊM PHẦN MỀM */}
      {isAddSoftwareModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-fade-in">
            <div className="px-6 py-4 bg-purple-50/70 border-b border-purple-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Key className="w-5 h-5 text-purple-600" />
                  Thêm Phần Mềm &amp; Bản Quyền
                </h3>
              </div>
              <button
                onClick={() => setIsAddSoftwareModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewSoftware} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Software Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tên Phần Mềm / Bản Quyền *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Windows 11 Pro"
                    value={newSoftware.software_name}
                    onChange={(e) => setNewSoftware({ ...newSoftware, software_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium"
                  />
                </div>

                {/* Software Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Danh Mục
                  </label>
                  <select
                    value={newSoftware.software_type}
                    onChange={(e) => setNewSoftware({ ...newSoftware, software_type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="os">Windows (Hệ điều hành)</option>
                    <option value="office">Office (Văn phòng)</option>
                    <option value="antivirus">Diệt virus</option>
                    <option value="accounting">Kế toán (MISA...)</option>
                    <option value="pos">Bán hàng (KiotViet...)</option>
                    <option value="utility">Tiện ích</option>
                  </select>
                </div>

                {/* License Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cấp Phép
                  </label>
                  <select
                    value={newSoftware.license_type}
                    onChange={(e) => setNewSoftware({ ...newSoftware, license_type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none font-semibold text-purple-800"
                  >
                    <option value="oem">OEM (Theo máy)</option>
                    <option value="retail">Retail (Chuyển máy được)</option>
                    <option value="subscription">Subscription (Đăng ký định kỳ)</option>
                    <option value="fpp">FPP (Hộp nguyên bản quyền)</option>
                  </select>
                </div>

                {/* Duration Months */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Thời Hạn
                  </label>
                  <select
                    value={newSoftware.duration_months}
                    onChange={(e) => setNewSoftware({ ...newSoftware, duration_months: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value={0}>Vĩnh viễn</option>
                    <option value={12}>12 Tháng</option>
                    <option value={24}>24 Tháng</option>
                    <option value={36}>36 Tháng</option>
                  </select>
                </div>

                {/* Initial Stock */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số Key Tồn Kho *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newSoftware.quantity_in_stock}
                    onChange={(e) => setNewSoftware({ ...newSoftware, quantity_in_stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none font-bold"
                  />
                </div>

                {/* Distributor */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Đối Tác / Nhà Phân Phối
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Microsoft CSP, MISA..."
                    value={newSoftware.distributor}
                    onChange={(e) => setNewSoftware({ ...newSoftware, distributor: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                {/* Unit Cost */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Giá Nhập (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={newSoftware.unit_cost}
                    onChange={(e) => setNewSoftware({ ...newSoftware, unit_cost: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium"
                  />
                </div>

                {/* Unit Price */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Giá Bán (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={newSoftware.unit_price}
                    onChange={(e) => setNewSoftware({ ...newSoftware, unit_price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none font-bold text-purple-700"
                  />
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ghi Chú
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Kích hoạt online, hỗ trợ xuất VAT..."
                    value={newSoftware.notes}
                    onChange={(e) => setNewSoftware({ ...newSoftware, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddSoftwareModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Lưu Phần Mềm
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
