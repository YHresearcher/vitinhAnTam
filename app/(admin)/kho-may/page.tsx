'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { InventoryItem, SparePart, SoftwareLicense, SoftwareKeyItem, generateCustomerCode } from '@/lib/supabase';
import ThermalLabelModal from '@/components/admin/ThermalLabelModal';
// Lucide icons removed for minimalist text design


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
    addSoftwareKeys,
    assignSoftwareKey,
    updateSoftwareKeyStatus,
    deleteSoftwareKey,
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
    tickets,
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
    initial_keys_raw: '',
  });

  // Key Pool Management States
  const [selectedSoftwareForKeys, setSelectedSoftwareForKeys] = useState<SoftwareLicense | null>(null);
  const [keySearchQuery, setKeySearchQuery] = useState('');
  const [keyStatusFilter, setKeyStatusFilter] = useState<'all' | 'available' | 'used' | 'revoked'>('all');
  const [batchKeysInput, setBatchKeysInput] = useState('');
  const [batchKeysNotes, setBatchKeysNotes] = useState('');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [assigningKeyTarget, setAssigningKeyTarget] = useState<{ softwareId: string; key: SoftwareKeyItem } | null>(null);
  const [assignCustomerName, setAssignCustomerName] = useState('');
  const [assignTicketCode, setAssignTicketCode] = useState('');
  const [assignNotes, setAssignNotes] = useState('');

  // Modal states - Machines
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItemForLabel, setSelectedItemForLabel] = useState<InventoryItem | null>(null);
  const [viewingSpecsItem, setViewingSpecsItem] = useState<InventoryItem | null>(null);
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
      alert('Vui lòng nhập đầy đủ Model và Số Serial (Serial Number)!');
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
    if (!confirm(`Bạn có chắc muốn xóa thiết bị Số Serial [${tag}] khỏi kho?`)) return;
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
      const rawKeys = newSoftware.initial_keys_raw
        ? newSoftware.initial_keys_raw
            .split('\n')
            .map((k) => k.trim())
            .filter((k) => k.length > 0)
        : [];

      const initialKeyItems: SoftwareKeyItem[] = rawKeys.map((k, idx) => ({
        id: `key-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        key_code: k,
        status: 'available',
        notes: newSoftware.notes || undefined,
      }));

      const finalQuantity = initialKeyItems.length > 0 ? initialKeyItems.length : Number(newSoftware.quantity_in_stock);

      await addSoftwareLicense({
        software_name: newSoftware.software_name.trim(),
        software_type: newSoftware.software_type,
        license_type: newSoftware.license_type,
        quantity_in_stock: finalQuantity,
        unit_cost: Number(newSoftware.unit_cost),
        unit_price: Number(newSoftware.unit_price),
        duration_months: Number(newSoftware.duration_months),
        distributor: newSoftware.distributor,
        notes: newSoftware.notes,
        license_keys: initialKeyItems.length > 0 ? initialKeyItems : undefined,
      });

      setIsAddSoftwareModalOpen(false);
      setActionNotice(
        `Đã thêm phần mềm [${newSoftware.software_name}] với ${
          initialKeyItems.length > 0 ? `${initialKeyItems.length} key` : 'số lượng'
        } vào kho!`
      );
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
        initial_keys_raw: '',
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

  // Export CSV (Excel)
  const handleExportCSV = () => {
    if (activeTab === 'machines') {
      if (filteredInventory.length === 0) return;
      const headers = ['Mã Quản Lý', 'Model Thiết Bị', 'Số Serial', 'CPU', 'RAM', 'Ổ Cứng', 'Trạng Thái', 'Giá Bán', 'Bảo Hành', 'Ghi Chú'];
      const rows = filteredInventory.map((item) => [
        `"${item.service_tag || ''}"`,
        `"${(item.device_model || item.model || '').replace(/"/g, '""')}"`,
        `"${item.serial_number || ''}"`,
        `"${item.cpu || item.specs?.cpu || ''}"`,
        `"${item.ram || item.specs?.ram || ''}"`,
        `"${item.ssd_capacity || item.specs?.ssd || ''}"`,
        `"${item.qc_status || ''}"`,
        item.price || item.retail_price || 0,
        `"${item.warranty_months || 0} tháng"`,
        `"${(item.specs_summary || '').replace(/"/g, '""')}"`,
      ]);
      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `danh_sach_kho_may_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (activeTab === 'components') {
      if (filteredSpareParts.length === 0) return;
      const headers = ['Tên Linh Kiện', 'Phân Loại', 'Tình Trạng', 'Tồn Kho', 'Đơn Giá', 'Ghi Chú'];
      const rows = filteredSpareParts.map((part) => [
        `"${part.part_name.replace(/"/g, '""')}"`,
        `"${part.part_type || ''}"`,
        `"${part.condition || ''}"`,
        part.quantity_in_stock || 0,
        part.unit_price || 0,
        `"${(part.notes || '').replace(/"/g, '""')}"`,
      ]);
      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `danh_sach_linh_kien_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      if (filteredSoftwareLicenses.length === 0) return;
      const headers = ['Tên Phần Mềm', 'Phân Loại', 'Hình Thức', 'Tồn Kho', 'Giá Bán', 'Thời Hạn', 'Ghi Chú'];
      const rows = filteredSoftwareLicenses.map((lic) => [
        `"${lic.software_name.replace(/"/g, '""')}"`,
        `"${lic.software_type || ''}"`,
        `"${lic.license_type || ''}"`,
        lic.quantity_in_stock || 0,
        lic.unit_price || 0,
        `"${lic.duration_months === 0 ? 'Vĩnh viễn' : (lic.duration_months ? `${lic.duration_months} tháng` : '')}"`,
        `"${(lic.notes || '').replace(/"/g, '""')}"`,
      ]);
      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `danh_sach_phan_mem_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="fixed top-20 right-6 z-50 bg-white text-slate-900 px-4 py-3 rounded-xl shadow-2xl border-2 border-blue-600 flex items-center gap-3 animate-fade-in text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {activeTab === 'machines' && 'Kho Máy Bộ'}
            {activeTab === 'components' && 'Kho Linh Kiện'}
            {activeTab === 'software' && 'Kho Phần Mềm'}
            <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold rounded-md font-mono">
              {activeTab === 'machines' && `${inventory.length} máy`}
              {activeTab === 'components' && `${spareParts.length} mục`}
              {activeTab === 'software' && `${softwareLicenses.length} mục`}
            </span>
          </h1>
        </div>

        {/* Action Buttons: Export CSV & Add button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-all active:scale-95 whitespace-nowrap"
          >
            Xuất Excel (CSV)
          </button>
          {activeTab === 'machines' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center justify-center px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all active:scale-95 whitespace-nowrap shrink-0"
            >
              + Nhập máy
            </button>
          )}
          {activeTab === 'components' && (
            <button
              onClick={() => setIsAddPartModalOpen(true)}
              className="inline-flex items-center justify-center px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all active:scale-95 whitespace-nowrap shrink-0"
            >
              + Thêm linh kiện
            </button>
          )}
          {activeTab === 'software' && (
            <button
              onClick={() => setIsAddSoftwareModalOpen(true)}
              className="inline-flex items-center justify-center px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all active:scale-95 whitespace-nowrap shrink-0"
            >
              + Thêm phần mềm
            </button>
          )}
        </div>
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
          <span>Máy bộ</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold font-mono ${
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
          <span>Linh kiện</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold font-mono ${
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
          <span>Phần mềm</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold font-mono ${
            activeTab === 'software' ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-700'
          }`}>
            {stats.softwareTotal}
          </span>
        </button>
      </div>

      {/* RBAC Notice (Compact) */}
      {!canEditStock() && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
          <span>Tài khoản {currentUser.name} ({currentUser.role === 'technician' ? 'Kỹ thuật' : 'Kinh doanh'}) — Chỉ xem tồn kho, quyền sửa dành cho Admin.</span>
        </div>
      )}

      {/* KPI Stats Grid (Compact) - Clean Typography, No Empty Icon Boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] text-slate-500 truncate">Máy Tồn Kho</div>
          <div className="text-base font-bold text-slate-900 font-mono mt-0.5">{stats.total} máy</div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] text-slate-500 truncate">Sẵn Bán (RTS)</div>
          <div className="text-base font-bold text-emerald-700 font-mono mt-0.5">{stats.ready} máy</div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] text-slate-500 truncate">Đang QC</div>
          <div className="text-base font-bold text-amber-700 font-mono mt-0.5">{stats.testing} máy</div>
        </div>

        <div className={`p-3 rounded-xl border shadow-2xs transition-colors ${
          activeTab === 'components' ? 'bg-emerald-50/50 border-emerald-300' : 'bg-white border-slate-200'
        }`}>
          <div className="text-[11px] text-slate-500 truncate">Linh Kiện</div>
          <div className="text-base font-bold text-emerald-800 font-mono mt-0.5">{stats.componentsTotal} món</div>
          <div className="text-[10px] text-slate-500 font-medium">
            Mới {stats.componentsNew} • Cũ {stats.componentsUsed}
          </div>
        </div>

        <div className={`p-3 rounded-xl border shadow-2xs transition-colors ${
          activeTab === 'software' ? 'bg-purple-50/50 border-purple-300' : 'bg-white border-slate-200'
        }`}>
          <div className="text-[11px] text-slate-500 truncate">Phần Mềm</div>
          <div className="text-base font-bold text-purple-800 font-mono mt-0.5">{stats.softwareTotal} bản quyền</div>
          <div className="text-[10px] text-slate-500 font-medium">
            {stats.softwareCount} sản phẩm
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
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm Serial number, Model..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold"
              >
                ✕
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
                <th className="py-3 px-4">Serial Number</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4">Tồn Kho</th>
                <th className="py-3 px-4 text-right">Giá Bán</th>
                <th className="py-3 px-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
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

                      {/* Serial Number (Clickable to view detailed specs) */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => setViewingSpecsItem(item)}
                          className="group inline-flex flex-col text-left cursor-pointer"
                          title="Bấm để xem cấu hình chi tiết thiết bị"
                        >
                          <span className="inline-flex items-center font-mono font-bold text-xs bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white px-2.5 py-1 rounded-md border border-blue-200 group-hover:border-blue-600 transition-all shadow-2xs">
                            {item.serial_number || item.service_tag}
                          </span>
                          <span className="text-[10px] text-blue-600 group-hover:underline mt-0.5 font-medium">
                            Xem cấu hình chi tiết →
                          </span>
                        </button>
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
                            <option value="ready_to_sell">Sẵn bán (RTS)</option>
                            <option value="testing">Đang QC</option>
                            <option value="sold">Đã bán</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${
                              isReady
                                ? 'bg-emerald-100 text-emerald-800'
                                : isTesting
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
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
                                className="px-2 py-1 text-slate-500 hover:text-slate-700 text-xs font-semibold"
                              >
                                Hủy
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm font-mono">
                                {item.stock_quantity ?? item.quantity ?? 1}
                              </span>
                              <button
                                onClick={() => {
                                  setEditingStockId(item.id);
                                  setTempStockValue(item.stock_quantity ?? item.quantity ?? 1);
                                }}
                                title="Admin: Sửa số lượng tồn kho"
                                className="text-blue-600 hover:text-blue-800 text-xs px-1.5 py-0.5 rounded hover:bg-blue-50 transition-colors font-medium"
                              >
                                Sửa
                              </button>
                            </div>
                          )
                        ) : (
                          // Read-Only Display for Technician & Sales
                          <div
                            className="inline-flex items-center px-2 py-1 bg-slate-100 rounded text-slate-700 text-xs font-semibold font-mono"
                            title="Chỉ Admin mới có quyền điều chỉnh số lượng tồn kho"
                          >
                            <span>{item.stock_quantity ?? item.quantity ?? 1} cái</span>
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
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                              item.qc_status === 'sold'
                                ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300 shadow-xs'
                            }`}
                          >
                            {item.qc_status === 'sold' ? 'Đã bán' : 'Bán máy'}
                          </button>

                          {/* Print 50x30mm Label */}
                          <button
                            onClick={() => handleOpenLabelModal(item)}
                            title="In tem nhiệt 50x30mm (Xprinter)"
                            className="px-2 py-1 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors border border-blue-200 bg-blue-50"
                          >
                            In tem
                          </button>

                          {/* Admin Only Delete */}
                          {canEditStock() && (
                            <button
                              onClick={() => handleDeleteItem(item.id, item.service_tag)}
                              title="Xóa máy khỏi kho (Chỉ Admin)"
                              className="px-2 py-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Xóa
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
                <input
                  type="text"
                  value={partSearchQuery}
                  onChange={(e) => setPartSearchQuery(e.target.value)}
                  placeholder="Tìm linh kiện..."
                  className="w-full px-3 py-2 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
                {partSearchQuery && (
                  <button
                    onClick={() => setPartSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm font-bold"
                  >
                    ✕
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
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    partConditionFilter === 'new'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-emerald-700'
                  }`}
                >
                  Mới 100%
                </button>
                <button
                  onClick={() => setPartConditionFilter('used')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    partConditionFilter === 'used'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-purple-700'
                  }`}
                >
                  Cũ / Bóc máy
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
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Mới 100%
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
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
                                  className="px-2 py-1 bg-emerald-600 text-white rounded text-xs font-bold hover:bg-emerald-700"
                                >
                                  Lưu
                                </button>
                                <button
                                  onClick={() => setEditingPartStockId(null)}
                                  className="px-2 py-1 bg-slate-200 text-slate-600 rounded text-xs hover:bg-slate-300"
                                >
                                  Hủy
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className={`font-bold font-mono ${part.quantity_in_stock <= 2 ? 'text-rose-600' : 'text-slate-900'}`}>
                                  {part.quantity_in_stock} cái
                                </span>
                                {canEditStock() && (
                                  <button
                                    onClick={() => {
                                      setEditingPartStockId(part.id);
                                      setTempPartStockValue(part.quantity_in_stock);
                                    }}
                                    title="Sửa số lượng tồn (Chỉ Admin)"
                                    className="px-2 py-0.5 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200"
                                  >
                                    Sửa
                                  </button>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Cost Price */}
                          <td className="py-3.5 px-4 text-xs">
                            {canEditStock() ? (
                              <span className="font-medium text-slate-600 font-mono">
                                {new Intl.NumberFormat('vi-VN').format(part.unit_cost || 0)} đ
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Bảo mật</span>
                            )}
                          </td>

                          {/* Retail Price */}
                          <td className="py-3.5 px-4 text-right">
                            <span className="font-bold text-slate-900 font-mono">
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
                                className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded border border-rose-200 font-medium"
                              >
                                Xóa
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
                <input
                  type="text"
                  value={softwareSearchQuery}
                  onChange={(e) => setSoftwareSearchQuery(e.target.value)}
                  placeholder="Tìm phần mềm, đối tác..."
                  className="w-full px-3 py-2 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                />
                {softwareSearchQuery && (
                  <button
                    onClick={() => setSoftwareSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm font-bold"
                  >
                    ✕
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

                          {/* Quantity In Stock & Key Pool Count */}
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
                                  className="px-2 py-1 bg-purple-600 text-white rounded text-xs font-bold hover:bg-purple-700"
                                >
                                  Lưu
                                </button>
                                <button
                                  onClick={() => setEditingSoftwareStockId(null)}
                                  className="px-2 py-1 bg-slate-200 text-slate-600 rounded text-xs hover:bg-slate-300"
                                >
                                  Hủy
                                </button>
                              </div>
                            ) : (
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={`font-bold font-mono ${sw.quantity_in_stock <= 2 ? 'text-rose-600' : 'text-slate-900'}`}>
                                    {sw.quantity_in_stock} key
                                  </span>
                                  {(!sw.license_keys || sw.license_keys.length === 0) && canEditStock() && (
                                    <button
                                      onClick={() => {
                                        setEditingSoftwareStockId(sw.id);
                                        setTempSoftwareStockValue(sw.quantity_in_stock);
                                      }}
                                      title="Sửa số lượng tồn"
                                      className="px-2 py-0.5 text-xs text-purple-700 bg-purple-50 hover:bg-purple-100 rounded border border-purple-200"
                                    >
                                      Sửa
                                    </button>
                                  )}
                                </div>
                                {sw.license_keys && sw.license_keys.length > 0 && (
                                  <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    <span className="text-emerald-700 font-semibold">
                                      {sw.license_keys.filter((k) => k.status === 'available').length}
                                    </span>
                                    <span>/ {sw.license_keys.length} key trong kho</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Cost Price */}
                          <td className="py-3.5 px-4 text-xs">
                            {canEditStock() ? (
                              <span className="font-medium text-slate-600 font-mono">
                                {new Intl.NumberFormat('vi-VN').format(sw.unit_cost || 0)} đ
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Bảo mật</span>
                            )}
                          </td>

                          {/* Retail Price */}
                          <td className="py-3.5 px-4 text-right">
                            <span className="font-bold text-slate-900 font-mono">
                              {sw.unit_price === 0
                                ? 'Liên hệ'
                                : new Intl.NumberFormat('vi-VN').format(sw.unit_price) + ' đ'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedSoftwareForKeys(sw);
                                  setKeySearchQuery('');
                                  setKeyStatusFilter('all');
                                  setBatchKeysInput('');
                                  setBatchKeysNotes('');
                                }}
                                className="px-2.5 py-1 text-xs font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-md border border-purple-200 flex items-center gap-1 transition-colors"
                                title="Mở danh sách và quản lý Key"
                              >
                                <span>🔑</span>
                                <span>Quản Lý Key ({sw.license_keys?.length || 0})</span>
                              </button>

                              {canEditStock() && (
                                <button
                                  onClick={() => handleDeleteSoftware(sw.id, sw.software_name)}
                                  title="Xóa bản quyền"
                                  className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded border border-rose-200 font-medium"
                                >
                                  Xóa
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

      {/* Modal Nhập Máy Mới */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-fade-in">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Nhập Máy Mới</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 text-base font-bold"
              >
                ✕
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

                {/* Serial Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số Serial (Serial Number) *
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
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Bán Máy &amp; Bàn Giao
                </h2>
              </div>
              <button
                onClick={() => setSellingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors text-base font-bold"
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
                  <div className="text-base font-black text-blue-700 mt-0.5 font-mono">
                    {(sellingItem.price ?? sellingItem.retail_price ?? 0).toLocaleString('vi-VN')} đ
                  </div>
                </div>
              </div>

              {/* CUSTOMER INFO */}
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-blue-900 uppercase tracking-wider block">
                    Thông Tin Khách Hàng
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
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold font-mono"
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
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
                >
                  Xác Nhận Bán Máy
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
                <h3 className="text-base font-bold text-slate-900">
                  Thêm Linh Kiện Mới
                </h3>
              </div>
              <button
                onClick={() => setIsAddPartModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 text-base font-bold"
              >
                ✕
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
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      newPart.condition === 'new'
                        ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
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
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      newPart.condition === 'used'
                        ? 'border-purple-600 bg-purple-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold font-mono"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium font-mono"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold text-emerald-700 font-mono"
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
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
                >
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
                <h3 className="text-base font-bold text-slate-900">
                  Thêm Phần Mềm &amp; Bản Quyền
                </h3>
              </div>
              <button
                onClick={() => setIsAddSoftwareModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 text-base font-bold"
              >
                ✕
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none font-bold font-mono"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium font-mono"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none font-bold text-purple-700 font-mono"
                  />
                </div>

                {/* Batch Keys Input */}
                <div className="md:col-span-2 bg-purple-50/50 p-3 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                      <span>🔑</span> Nhập Danh Sách Key Bản Quyền (Tùy chọn)
                    </label>
                    <span className="text-[11px] text-purple-600 font-medium">
                      {newSoftware.initial_keys_raw.split('\n').filter((k) => k.trim().length > 0).length} key đã nhập
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Dán danh sách key bản quyền tại đây, mỗi dòng 1 key...&#10;VD: VK7JG-NPHTM-C97JM-9MPGT-3V66T&#10;Nếu nhập key tại đây, số lượng tồn kho sẽ tự động tính theo số key hợp lệ."
                    value={newSoftware.initial_keys_raw}
                    onChange={(e) => {
                      const text = e.target.value;
                      const validCount = text.split('\n').filter((k) => k.trim().length > 0).length;
                      setNewSoftware({
                        ...newSoftware,
                        initial_keys_raw: text,
                        quantity_in_stock: validCount > 0 ? validCount : newSoftware.quantity_in_stock,
                      });
                    }}
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg text-xs font-mono bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <div className="text-[11px] text-slate-500 mt-1">
                    Mỗi dòng là 1 license key. Hệ thống sẽ lưu trữ và quản lý trạng thái từng key riêng biệt.
                  </div>
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
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
                >
                  Lưu Phần Mềm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILED DEVICE SPECS MODAL (Khi click vào Serial Number) */}
      {viewingSpecsItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 to-blue-950 text-white flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/30 text-blue-200 border border-blue-400/30 uppercase tracking-wider">
                    Cấu Hình Chi Tiết Thiết Bị
                  </span>
                  <span className="font-mono text-xs text-blue-300">
                    Serial: {viewingSpecsItem.serial_number || viewingSpecsItem.service_tag}
                  </span>
                </div>
                <h3 className="text-xl font-bold mt-1 text-white tracking-tight">
                  {viewingSpecsItem.model}
                </h3>
                <div className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                  <span>Hãng: <strong>{viewingSpecsItem.brand}</strong></span>
                  <span>•</span>
                  <span>Kiểu dáng: <strong>{viewingSpecsItem.form_factor}</strong></span>
                  <span>•</span>
                  <span>Bảo hành: <strong>{viewingSpecsItem.warranty_months} tháng</strong></span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingSpecsItem(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition-colors"
                title="Đóng"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-800 flex-1">
              {/* Hardware Specs Grid */}
              <div>
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 pb-1 border-b border-slate-200 flex items-center justify-between">
                  <span>Thông Số Kỹ Thuật Phần Cứng</span>
                  <span className="text-[11px] text-slate-500 font-normal">Đã qua QC Test</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* CPU */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Bộ Vi Xử Lý (CPU)</span>
                    <div className="text-sm font-bold text-slate-900 mt-0.5 font-mono">
                      {viewingSpecsItem.cpu || viewingSpecsItem.specs?.cpu || 'Intel Core i5 (Đồng Bộ)'}
                    </div>
                  </div>

                  {/* RAM */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Bộ Nhớ RAM</span>
                    <div className="text-sm font-bold text-slate-900 mt-0.5 font-mono">
                      {viewingSpecsItem.ram || viewingSpecsItem.specs?.ram || '16GB DDR4 Dual Channel'}
                    </div>
                  </div>

                  {/* SSD & Storage */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Ổ Cứng Khởi Động</span>
                    <div className="text-sm font-bold text-slate-900 mt-0.5 font-mono">
                      {viewingSpecsItem.ssd_capacity || viewingSpecsItem.specs?.ssd || 'SSD NVMe 256GB / 512GB'}
                    </div>
                  </div>

                  {/* SSD Health */}
                  {(() => {
                    const health = viewingSpecsItem.ssd_health ?? viewingSpecsItem.specs?.ssd_health ?? 95;
                    return (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Sức Khỏe Ổ Cứng (SSD Health)</span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                              health >= 90
                                ? 'bg-emerald-100 text-emerald-800'
                                : health >= 80
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {health}% {health >= 90 ? 'Good' : 'Caution'}
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                          <div
                            className={`h-full rounded-full transition-all ${
                              health >= 90 ? 'bg-emerald-500' : health >= 80 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${health}%` }}
                          />
                        </div>
                      </div>
                    );
                  })()}

                  {/* GPU */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Card Đồ Họa (GPU)</span>
                    <div className="text-xs font-semibold text-slate-900 mt-0.5">
                      {viewingSpecsItem.specs?.gpu || 'Intel UHD Graphics Tích Hợp Xuất 4K'}
                    </div>
                  </div>

                  {/* PSU */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Nguồn Điện (PSU)</span>
                    <div className="text-xs font-semibold text-slate-900 mt-0.5">
                      {viewingSpecsItem.specs?.power || 'Nguồn Công Suất Thực Đồng Bộ Chuẩn 80 Plus'}
                    </div>
                  </div>
                </div>
              </div>

              {/* QC & Inventory Details */}
              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2">
                <div className="text-xs font-bold text-blue-900">Tình Trạng Kho &amp; Tiêu Chuẩn Xuất Xưởng</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] text-slate-500">Trạng thái:</span>
                    <div className="font-bold text-slate-800 mt-0.5">
                      {viewingSpecsItem.qc_status === 'ready_to_sell'
                        ? 'Sẵn bán (RTS)'
                        : viewingSpecsItem.qc_status === 'testing'
                        ? 'Đang QC / Test'
                        : 'Đã xuất bán'}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Thời gian Burn-in:</span>
                    <div className="font-bold text-slate-800 mt-0.5">
                      {viewingSpecsItem.burn_in_duration || 48} giờ Stress Test
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Tồn kho hiện tại:</span>
                    <div className="font-bold text-slate-800 mt-0.5 font-mono">
                      {viewingSpecsItem.stock_quantity ?? viewingSpecsItem.quantity ?? 1} bộ máy
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Giá bán niêm yết:</span>
                    <div className="font-bold text-blue-700 mt-0.5 font-mono text-sm">
                      {((viewingSpecsItem.price || viewingSpecsItem.retail_price) || 0).toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                </div>

                {viewingSpecsItem.specs_summary && (
                  <div className="pt-2 border-t border-blue-100 text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-700">Mô tả ngoại quan:</span>{' '}
                    {viewingSpecsItem.specs_summary}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewingSpecsItem(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-lg transition-colors"
              >
                Đóng
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedItemForLabel(viewingSpecsItem);
                    setIsLabelModalOpen(true);
                    setViewingSpecsItem(null);
                  }}
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
                >
                  In Tem Nhiệt (50x30mm)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleOpenSellModal(viewingSpecsItem);
                    setViewingSpecsItem(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all active:scale-95"
                >
                  Bán Máy / Đổi Trạng Thái
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL QUẢN LÝ KEY BẢN QUYỀN */}
      {/* ========================================================================= */}
      {selectedSoftwareForKeys && (() => {
        // Always get the freshest copy of the software license from store state
        const currentSw = softwareLicenses.find((s) => s.id === selectedSoftwareForKeys.id) || selectedSoftwareForKeys;
        const allKeys = currentSw.license_keys || [];
        const availableCount = allKeys.filter((k) => k.status === 'available').length;
        const usedCount = allKeys.filter((k) => k.status === 'used').length;
        const revokedCount = allKeys.filter((k) => k.status === 'revoked').length;

        // Filter keys
        const filteredKeys = allKeys.filter((k) => {
          const matchStatus = keyStatusFilter === 'all' ? true : k.status === keyStatusFilter;
          const q = keySearchQuery.toLowerCase().trim();
          const matchQuery = !q
            ? true
            : k.key_code.toLowerCase().includes(q) ||
              (k.assigned_customer || '').toLowerCase().includes(q) ||
              (k.assigned_ticket_code || '').toLowerCase().includes(q) ||
              (k.notes || '').toLowerCase().includes(q);
          return matchStatus && matchQuery;
        });

        const handleCopyKey = (keyItem: SoftwareKeyItem) => {
          navigator.clipboard.writeText(keyItem.key_code);
          setCopiedKeyId(keyItem.id);
          setTimeout(() => setCopiedKeyId(null), 2000);
        };

        const handleAddBatchKeys = async (e: React.FormEvent) => {
          e.preventDefault();
          const rawLines = batchKeysInput.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
          if (rawLines.length === 0) {
            alert('Vui lòng nhập ít nhất 1 mã key bản quyền!');
            return;
          }
          await addSoftwareKeys(currentSw.id, rawLines, batchKeysNotes);
          setBatchKeysInput('');
          setBatchKeysNotes('');
          setActionNotice(`Đã thêm thành công ${rawLines.length} key vào kho!`);
          setTimeout(() => setActionNotice(null), 3000);
        };

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-fade-in flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="px-6 py-4 bg-purple-900 text-white flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔑</span>
                    <h3 className="text-base font-bold text-white">
                      Kho Key Bản Quyền: {currentSw.software_name}
                    </h3>
                  </div>
                  <div className="text-xs text-purple-200 mt-0.5 flex items-center gap-2">
                    <span className="font-semibold text-white uppercase">{currentSw.license_type}</span>
                    <span>•</span>
                    <span>{currentSw.distributor || 'Chính hãng'}</span>
                    <span>•</span>
                    <span>{currentSw.duration_months === 0 ? 'Vĩnh viễn' : `${currentSw.duration_months} tháng`}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSoftwareForKeys(null)}
                  className="text-purple-200 hover:text-white p-1.5 rounded-lg hover:bg-purple-800 text-base font-bold transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {/* 4 Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                    <div className="text-[11px] font-semibold text-emerald-700">Khả Dụng (Sẵn sàng)</div>
                    <div className="text-2xl font-black text-emerald-900 font-mono mt-0.5">{availableCount}</div>
                    <div className="text-[10px] text-emerald-600">Sẵn sàng xuất / cài máy</div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
                    <div className="text-[11px] font-semibold text-amber-700">Đã Cấp / Đã Bán</div>
                    <div className="text-2xl font-black text-amber-900 font-mono mt-0.5">{usedCount}</div>
                    <div className="text-[10px] text-amber-600">Đã gán cho khách / máy</div>
                  </div>
                  <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl">
                    <div className="text-[11px] font-semibold text-rose-700">Thu Hồi / Báo Lỗi</div>
                    <div className="text-2xl font-black text-rose-900 font-mono mt-0.5">{revokedCount}</div>
                    <div className="text-[10px] text-rose-600">Tạm khóa hoặc đổi trả</div>
                  </div>
                  <div className="bg-slate-100 border border-slate-200 p-3 rounded-xl">
                    <div className="text-[11px] font-semibold text-slate-700">Tổng Số Key</div>
                    <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">{allKeys.length}</div>
                    <div className="text-[10px] text-slate-500">Toàn bộ kho lưu trữ</div>
                  </div>
                </div>

                {/* Batch Add Keys Section */}
                {canEditStock() && (
                  <form onSubmit={handleAddBatchKeys} className="bg-purple-50/60 p-4 rounded-xl border border-purple-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                        <span>➕</span> Nhập Thêm Danh Sách Key Mới Vào Kho
                      </span>
                      <span className="text-[11px] text-purple-700 font-medium">
                        {batchKeysInput.split('\n').filter((l) => l.trim().length > 0).length} key sắp thêm
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2">
                        <textarea
                          rows={2}
                          placeholder="Dán mã key tại đây (mỗi dòng 1 key, ví dụ: VK7JG-NPHTM-C97JM-9MPGT-3V66T)..."
                          value={batchKeysInput}
                          onChange={(e) => setBatchKeysInput(e.target.value)}
                          className="w-full px-3 py-2 border border-purple-300 rounded-lg text-xs font-mono bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2 flex flex-col justify-between">
                        <input
                          type="text"
                          placeholder="Ghi chú lô key (VD: Lô FPT 24/09)..."
                          value={batchKeysNotes}
                          onChange={(e) => setBatchKeysNotes(e.target.value)}
                          className="w-full px-3 py-1.5 border border-purple-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                        <button
                          type="submit"
                          disabled={!batchKeysInput.trim()}
                          className="w-full py-2 bg-purple-700 hover:bg-purple-800 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed"
                        >
                          Lưu Vào Kho
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <div className="relative w-full sm:w-72">
                    <input
                      type="text"
                      placeholder="Tìm mã key, khách hàng, phiếu..."
                      value={keySearchQuery}
                      onChange={(e) => setKeySearchQuery(e.target.value)}
                      className="w-full px-3 py-1.5 pr-7 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                    />
                    {keySearchQuery && (
                      <button
                        onClick={() => setKeySearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-stretch sm:self-auto overflow-x-auto">
                    {[
                      { id: 'all', label: `Tất cả (${allKeys.length})` },
                      { id: 'available', label: `Khả dụng (${availableCount})` },
                      { id: 'used', label: `Đã gán (${usedCount})` },
                      { id: 'revoked', label: `Lỗi/Khóa (${revokedCount})` },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setKeyStatusFilter(tab.id as any)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                          keyStatusFilter === tab.id
                            ? 'bg-white text-purple-800 shadow-xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Keys Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                          <th className="py-2.5 px-3">STT</th>
                          <th className="py-2.5 px-3">Mã Key Bản Quyền</th>
                          <th className="py-2.5 px-3">Trạng Thái</th>
                          <th className="py-2.5 px-3">Thông Tin Sử Dụng</th>
                          <th className="py-2.5 px-3">Ghi Chú</th>
                          <th className="py-2.5 px-3 text-right">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredKeys.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400">
                              Chưa có key bản quyền nào phù hợp. Hãy dán thêm key ở trên.
                            </td>
                          </tr>
                        ) : (
                          filteredKeys.map((k, index) => {
                            const isCopied = copiedKeyId === k.id;
                            return (
                              <tr key={k.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-2.5 px-3 text-slate-400 font-mono">{index + 1}</td>
                                
                                {/* Key Code with Copy Button */}
                                <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                                  <div className="flex items-center gap-2">
                                    <span className="tracking-wide select-all">{k.key_code}</span>
                                    <button
                                      onClick={() => handleCopyKey(k)}
                                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                                        isCopied
                                          ? 'bg-emerald-600 text-white'
                                          : 'bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-700 border border-slate-200 cursor-pointer'
                                      }`}
                                      title="Copy mã key"
                                    >
                                      {isCopied ? '✓ Đã copy' : 'Copy'}
                                    </button>
                                  </div>
                                </td>

                                {/* Status */}
                                <td className="py-2.5 px-3">
                                  {k.status === 'available' && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                      Khả dụng
                                    </span>
                                  )}
                                  {k.status === 'used' && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                      Đã xuất cho khách
                                    </span>
                                  )}
                                  {k.status === 'revoked' && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                      Lỗi / Thu hồi
                                    </span>
                                  )}
                                </td>

                                {/* Assignment Info */}
                                <td className="py-2.5 px-3 text-slate-700">
                                  {k.assigned_customer ? (
                                    <div>
                                      <div className="font-semibold text-slate-900">{k.assigned_customer}</div>
                                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                        {k.assigned_ticket_code && (
                                          <span className="font-mono text-purple-700 bg-purple-50 px-1 rounded">
                                            {k.assigned_ticket_code}
                                          </span>
                                        )}
                                        {k.assigned_at && (
                                          <span>{new Date(k.assigned_at).toLocaleDateString('vi-VN')}</span>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 italic">Chưa gán</span>
                                  )}
                                </td>

                                {/* Notes */}
                                <td className="py-2.5 px-3 text-slate-500 text-[11px] max-w-[150px] truncate" title={k.notes}>
                                  {k.notes || '—'}
                                </td>

                                {/* Actions */}
                                <td className="py-2.5 px-3 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {k.status === 'available' ? (
                                      <button
                                        onClick={() => {
                                          setAssigningKeyTarget({ softwareId: currentSw.id, key: k });
                                          setAssignCustomerName('');
                                          setAssignTicketCode('');
                                          setAssignNotes('');
                                        }}
                                        className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded border border-purple-200 font-semibold text-[11px] cursor-pointer"
                                      >
                                        Gán khách
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => updateSoftwareKeyStatus(currentSw.id, k.id, 'available')}
                                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium cursor-pointer"
                                        title="Hoàn lại key vào kho khả dụng"
                                      >
                                        Trả về kho
                                      </button>
                                    )}

                                    {k.status !== 'revoked' ? (
                                      <button
                                        onClick={() => updateSoftwareKeyStatus(currentSw.id, k.id, 'revoked')}
                                        className="px-2 py-1 text-amber-700 hover:bg-amber-50 rounded border border-amber-200 text-[11px] cursor-pointer"
                                        title="Báo lỗi / Khóa key này"
                                      >
                                        Khóa
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => updateSoftwareKeyStatus(currentSw.id, k.id, 'available')}
                                        className="px-2 py-1 text-emerald-700 hover:bg-emerald-50 rounded border border-emerald-200 text-[11px] cursor-pointer"
                                        title="Mở khóa key này"
                                      >
                                        Mở lại
                                      </button>
                                    )}

                                    {canEditStock() && (
                                      <button
                                        onClick={() => {
                                          if (confirm(`Xóa key [${k.key_code}] khỏi kho?`)) {
                                            deleteSoftwareKey(currentSw.id, k.id);
                                          }
                                        }}
                                        className="px-2 py-1 text-rose-600 hover:bg-rose-50 rounded border border-rose-200 text-[11px] cursor-pointer"
                                        title="Xóa vĩnh viễn"
                                      >
                                        ✕
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
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>
                  💡 Tự động cập nhật số lượng tồn kho theo số key khả dụng. Key có thể sao chép nhanh 1 chạm khi kỹ thuật cài máy.
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedSoftwareForKeys(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL GÁN KEY BẢN QUYỀN CHO KHÁCH HÀNG / PHIẾU DỊCH VỤ */}
      {/* ========================================================================= */}
      {assigningKeyTarget && (
        <div className="fixed inset-0 z-60 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in">
            <div className="px-5 py-3.5 bg-purple-700 text-white flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>🔑</span> Xuất &amp; Gán Key Cho Khách Hàng
              </h4>
              <button
                onClick={() => setAssigningKeyTarget(null)}
                className="text-purple-200 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!assignCustomerName.trim()) {
                  alert('Vui lòng nhập tên khách hàng!');
                  return;
                }
                await assignSoftwareKey(assigningKeyTarget.softwareId, assigningKeyTarget.key.id, {
                  customerName: assignCustomerName.trim(),
                  ticketCode: assignTicketCode.trim() || undefined,
                  notes: assignNotes.trim() || undefined,
                });
                setActionNotice(`Đã xuất key [${assigningKeyTarget.key.key_code}] cho khách [${assignCustomerName}]!`);
                setTimeout(() => setActionNotice(null), 3000);
                setAssigningKeyTarget(null);
              }}
              className="p-5 space-y-3.5 text-xs"
            >
              <div className="bg-purple-50 p-2.5 rounded-lg border border-purple-200 font-mono text-purple-900 font-bold select-all">
                {assigningKeyTarget.key.key_code}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tên Khách Hàng / Công Ty *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Anh Minh - Cty Xây Dựng Long An"
                  value={assignCustomerName}
                  onChange={(e) => setAssignCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mã Phiếu Dịch Vụ / Sửa Chữa (Nếu có)
                </label>
                <input
                  type="text"
                  placeholder="VD: #TK-2025-0590 hoặc Đơn Hàng #012"
                  value={assignTicketCode}
                  onChange={(e) => setAssignTicketCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Ghi Chú Kích Hoạt / Thiết Bị Cài Đặt
                </label>
                <input
                  type="text"
                  placeholder="VD: Kích hoạt trên laptop Dell Latitude 5420..."
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setAssigningKeyTarget(null)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800 font-medium cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Xác Nhận Xuất Key
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
