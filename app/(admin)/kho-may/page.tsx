'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/lib/store';
import {
  InventoryItem,
  generateCustomerCode,
  SparePart,
} from '@/lib/supabase';
import ThermalLabelModal from '@/components/admin/ThermalLabelModal';
import { SoldInventoryTab } from '@/components/admin/SoldInventoryTab';
import { PricePreview, formatMoney } from '@/components/PricePreview';
import { InventoryPriceDisplay } from '@/components/admin/InventoryPriceDisplay';
import EditPriceModal from '@/components/admin/EditPriceModal';
import Link from 'next/link';
import { message, Modal } from 'antd';
import { User, Ban, ShieldCheck, AlertCircle, Tag, Pencil, Sparkles } from 'lucide-react';


export default function KhoMayPage() {
  const searchParams = useSearchParams();
  const {
    inventory,
    spareParts,
    addSparePart,
    updateSparePart,
    deleteSparePart,
    currentUser,
    canEditStock,
    canUpdateRepairStatus,
    addInventoryItem,
    updateInventoryItem,
    updateInventoryStock,
    updateQcStatus,
    deleteInventoryItem,
    reserveInventoryItem,
    cancelReservationItem,
    canSellAndEditWarranty,
    sellInventoryItem,
    sellSparePart,
    customers,
  } = useStore();

  // Navigation tab state: Máy bộ, Laptop, Linh kiện, Máy đã bán
  const [activeTab, setActiveTab] = useState<'may-bo' | 'laptop' | 'components' | 'sold'>('may-bo');

  // Filter & Search states - Machines
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<'all' | 'Dell' | 'HP' | 'Lenovo' | 'other'>('all');
  const [selectedStatus, setSelectedStatus] = useState<
    'all' | 'ready_to_sell' | 'testing' | 'sold' | 'reserved' | 'aging_warning'
  >('all');

  // Đồng bộ URL params (khi bấm từ Widget "Xem trong kho")
  useEffect(() => {
    const q = searchParams.get('search');
    const s = searchParams.get('status');
    if (q) setSearchQuery(q);
    if (s && ['ready_to_sell', 'testing', 'sold', 'reserved', 'aging_warning'].includes(s)) {
      setSelectedStatus(s as any);
    }
  }, [searchParams]);

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
    original_price: 650000,
    sale_price: 0,
    unit_price: 650000,
    shelf_location: 'Kệ Linh Kiện L1',
    notes: 'Mới 100% nguyên seal',
  });

  // Helper tính ngày hết hạn bảo hành từ ngày bán
  const calculateWarrantyEndDate = (startDateStr: string, months: number): string => {
    if (!startDateStr) return '';
    const d = new Date(startDateStr);
    if (isNaN(d.getTime())) return '';
    d.setMonth(d.getMonth() + months);
    return d.toLocaleDateString('vi-VN');
  };

  // Modal states - Machines
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItemForLabel, setSelectedItemForLabel] = useState<InventoryItem | null>(null);
  const [viewingSpecsItem, setViewingSpecsItem] = useState<InventoryItem | null>(null);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [tempStockValue, setTempStockValue] = useState<number>(1);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Price Edit Modals (Máy tính & Linh kiện)
  const [editingPriceMachine, setEditingPriceMachine] = useState<InventoryItem | null>(null);
  const [editingPricePart, setEditingPricePart] = useState<SparePart | null>(null);

  // Sales & Handover Modal States - Máy tính (Admin & Sales)
  const [sellingItem, setSellingItem] = useState<InventoryItem | null>(null);
  const [sellCustomerName, setSellCustomerName] = useState('');
  const [sellCustomerBirthDate, setSellCustomerBirthDate] = useState('1992-05-15');
  const [sellCustomerPhone, setSellCustomerPhone] = useState('0918234891');
  const [sellCustomerAddress, setSellCustomerAddress] = useState('Long An - Tây Ninh');
  const [sellSerialNumber, setSellSerialNumber] = useState('');
  const [sellWarrantyMonths, setSellWarrantyMonths] = useState<number>(12);
  const [sellPrice, setSellPrice] = useState<number>(0);
  const [sellDate, setSellDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Sales Modal States - Linh Kiện (Admin & Sales)
  const [sellingPart, setSellingPart] = useState<SparePart | null>(null);
  const [sellPartCustomerName, setSellPartCustomerName] = useState('');
  const [sellPartCustomerPhone, setSellPartCustomerPhone] = useState('0918234891');
  const [sellPartCustomerAddress, setSellPartCustomerAddress] = useState('Long An - Tây Ninh');
  const [sellPartQuantity, setSellPartQuantity] = useState<number>(1);
  const [sellPartWarrantyMonths, setSellPartWarrantyMonths] = useState<number>(12);
  const [sellPartPrice, setSellPartPrice] = useState<number>(0);
  const [sellPartDate, setSellPartDate] = useState<string>(new Date().toISOString().split('T')[0]);

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
    const validMonths = [3, 6, 12, 36];
    const initialWarranty = validMonths.includes(item.warranty_months || 0) ? (item.warranty_months as number) : 12;
    setSellWarrantyMonths(initialWarranty);
    const effectiveItemPrice = item.sale_price && item.sale_price > 0 ? item.sale_price : (item.original_price || item.price ?? item.retail_price ?? 0);
    setSellPrice(effectiveItemPrice);
    setSellDate(new Date().toISOString().split('T')[0]);
  };

  // Xử lý lưu giá bán máy (giá gốc & giá giảm)
  const handleSaveMachinePrice = async (data: {
    originalPrice: number;
    salePrice: number;
    costPrice?: number;
  }) => {
    if (!editingPriceMachine) return;
    const effectivePrice = data.salePrice > 0 ? data.salePrice : data.originalPrice;
    const updatePayload: Partial<InventoryItem> = {
      original_price: data.originalPrice,
      sale_price: data.salePrice,
      price: effectivePrice,
      retail_price: effectivePrice,
    };
    if (typeof data.costPrice === 'number') {
      updatePayload.import_price = data.costPrice;
    }
    await updateInventoryItem(editingPriceMachine.id, updatePayload);
    message.success(`Đã cập nhật giá bán cho máy [${editingPriceMachine.service_tag}] thành công!`);
    setEditingPriceMachine(null);
  };

  // Xử lý lưu giá bán linh kiện (giá gốc & giá giảm)
  const handleSavePartPrice = async (data: {
    originalPrice: number;
    salePrice: number;
    costPrice?: number;
  }) => {
    if (!editingPricePart) return;
    const effectivePrice = data.salePrice > 0 ? data.salePrice : data.originalPrice;
    const updatePayload: Partial<SparePart> = {
      original_price: data.originalPrice,
      sale_price: data.salePrice,
      unit_price: effectivePrice,
    };
    if (typeof data.costPrice === 'number') {
      updatePayload.unit_cost = data.costPrice;
    }
    await updateSparePart(editingPricePart.id, updatePayload);
    message.success(`Đã cập nhật giá bán cho linh kiện [${editingPricePart.part_name}] thành công!`);
    setEditingPricePart(null);
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
      saleDate: sellDate,
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

  // Mở modal bán linh kiện
  const handleOpenSellPartModal = (part: SparePart) => {
    if (!canSellAndEditWarranty()) {
      setActionNotice('Chỉ Quản trị viên và Nhân viên bán hàng mới có quyền xuất bán!');
      setTimeout(() => setActionNotice(null), 3500);
      return;
    }
    setSellingPart(part);
    setSellPartCustomerName('');
    setSellPartCustomerPhone('0918234891');
    setSellPartCustomerAddress('Long An - Tây Ninh');
    setSellPartQuantity(1);
    const validMonths = [3, 6, 12, 36];
    const partWarranty = validMonths.includes(part.warranty_months || 0) ? (part.warranty_months as number) : 36;
    setSellPartWarrantyMonths(partWarranty);
    const effectivePartPrice = part.sale_price && part.sale_price > 0 ? part.sale_price : (part.original_price || part.unit_price || 0);
    setSellPartPrice(effectivePartPrice);
    setSellPartDate(new Date().toISOString().split('T')[0]);
  };

  // Xác nhận bán linh kiện
  const handleConfirmPartSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellingPart) return;
    if (!sellPartCustomerName.trim() || !sellPartCustomerPhone.trim()) {
      setActionNotice('Vui lòng nhập họ tên và số điện thoại khách hàng!');
      setTimeout(() => setActionNotice(null), 3500);
      return;
    }

    const res = await sellSparePart({
      partId: sellingPart.id,
      customerName: sellPartCustomerName,
      customerPhone: sellPartCustomerPhone,
      customerAddress: sellPartCustomerAddress,
      quantity: sellPartQuantity,
      warrantyMonths: sellPartWarrantyMonths,
      soldPrice: sellPartPrice,
      saleDate: sellPartDate,
    });

    if (res.success) {
      setActionNotice(res.message);
      setSellingPart(null);
      setTimeout(() => setActionNotice(null), 4000);
    } else {
      setActionNotice(res.message);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleCancelReservation = (item: InventoryItem) => {
    Modal.confirm({
      title: 'Xác nhận khách không mua?',
      icon: <AlertCircle className="w-5 h-5 text-amber-500 inline-block mr-2" />,
      content: (
        <div className="text-xs space-y-1.5 text-slate-600">
          <p>
            Bạn có chắc chắn muốn hủy giữ máy{' '}
            <strong>
              {item.device_model || item.model || item.brand} ({item.service_tag})
            </strong>{' '}
            cho khách hàng <strong>{item.customer_name || 'chưa có tên'}</strong>?
          </p>
          <p className="text-slate-500 italic">
            Thông tin khách hàng đặt trước sẽ được xóa và máy được đưa về lại trạng thái{' '}
            <span className="text-emerald-600 font-bold">Lưu kho (Sẵn bán)</span>.
          </p>
        </div>
      ),
      okText: 'Xác nhận Không Mua',
      okType: 'danger',
      cancelText: 'Đóng',
      async onOk() {
        try {
          const ok = await cancelReservationItem(item.id, item.reserved_order_id);
          if (ok) {
            message.success(
              `Đã hủy giữ máy ${item.service_tag} và đưa thiết bị về lưu kho sẵn sàng bán!`
            );
          } else {
            message.error('Không thể hủy giữ máy, vui lòng thử lại.');
          }
        } catch {
          message.error('Đã xảy ra lỗi khi hủy giữ máy.');
        }
      },
    });
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
    import_date: new Date().toISOString().slice(0, 10),
    original_price: 4850000,
    sale_price: 0,
    price: 4850000,
    stock_quantity: 1,
    shelf_location: 'Kệ A1-01',
    qc_status: 'testing' as InventoryItem['qc_status'],
    warranty_months: 12,
  });

// Helper tính số ngày tồn kho
function calculateDaysInStock(item: InventoryItem, nowTimestamp: number): number {
  const dateStr = item.import_date || item.created_at;
  if (!dateStr) return 0;
  const itemDate = new Date(dateStr).getTime();
  if (Number.isNaN(itemDate)) return 0;
  return Math.max(0, Math.floor((nowTimestamp - itemDate) / (1000 * 60 * 60 * 24)));
}

  const nowTimestamp = useMemo(() => Date.now(), []);

  // Filtered inventory - Machines (Máy bộ vs Laptop)
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      // Phân tách Máy Bộ vs Laptop
      const isLaptop =
        (item.form_factor || '').toLowerCase() === 'laptop' ||
        (item.model || '').toLowerCase().includes('laptop') ||
        (item.device_model || '').toLowerCase().includes('laptop');

      if (activeTab === 'may-bo' && isLaptop) return false;
      if (activeTab === 'laptop' && !isLaptop) return false;

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

      let matchesStatus = true;
      if (selectedStatus === 'aging_warning') {
        const days = calculateDaysInStock(item, nowTimestamp);
        matchesStatus = days >= 50 && item.qc_status !== 'sold';
      } else if (selectedStatus !== 'all') {
        matchesStatus = item.qc_status === selectedStatus;
      }

      return matchesSearch && matchesBrand && matchesStatus;
    });
  }, [inventory, activeTab, searchQuery, selectedBrand, selectedStatus, nowTimestamp]);

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

  // Statistics
  const stats = useMemo(() => {
    const total = inventory.reduce((acc, curr) => acc + (curr.stock_quantity ?? curr.quantity ?? 1), 0);
    const ready = inventory.filter((i) => i.qc_status === 'ready_to_sell').length;
    const testing = inventory.filter((i) => i.qc_status === 'testing' || i.qc_status === 'pending_test').length;

    // Phân loại Máy Bộ vs Laptop
    const mayBoTotal = inventory.filter((i) => {
      const isLaptop =
        (i.form_factor || '').toLowerCase() === 'laptop' ||
        (i.model || '').toLowerCase().includes('laptop') ||
        (i.device_model || '').toLowerCase().includes('laptop');
      return !isLaptop && i.qc_status !== 'sold';
    }).reduce((acc, curr) => acc + (curr.stock_quantity ?? curr.quantity ?? 1), 0);

    const laptopTotal = inventory.filter((i) => {
      const isLaptop =
        (i.form_factor || '').toLowerCase() === 'laptop' ||
        (i.model || '').toLowerCase().includes('laptop') ||
        (i.device_model || '').toLowerCase().includes('laptop');
      return isLaptop && i.qc_status !== 'sold';
    }).reduce((acc, curr) => acc + (curr.stock_quantity ?? curr.quantity ?? 1), 0);

    // Linh kiện (Mới & Cũ bóc máy)
    const componentsTotal = spareParts.reduce((acc, p) => acc + (p.quantity_in_stock || 0), 0);
    const componentsNew = spareParts
      .filter((p) => p.condition === 'new')
      .reduce((acc, p) => acc + (p.quantity_in_stock || 0), 0);
    const componentsUsed = spareParts
      .filter((p) => p.condition === 'used')
      .reduce((acc, p) => acc + (p.quantity_in_stock || 0), 0);

    // Thiết bị cảnh báo tồn kho lâu (Aging Warning: 50-55d Yellow, 56-60d+ Red)
    const agingYellow = inventory.filter((i) => {
      const days = calculateDaysInStock(i, nowTimestamp);
      return days >= 50 && days < 56 && i.qc_status !== 'sold';
    }).length;
    const agingRed = inventory.filter((i) => {
      const days = calculateDaysInStock(i, nowTimestamp);
      return days >= 56 && i.qc_status !== 'sold';
    }).length;
    const agingTotal = agingYellow + agingRed;
    const sold = inventory.filter((i) => i.qc_status === 'sold' || Boolean(i.handover_date)).length;
    const reserved = inventory.filter((i) => i.qc_status === 'reserved').length;

    return {
      total,
      mayBoTotal,
      laptopTotal,
      ready,
      reserved,
      testing,
      sold,
      agingYellow,
      agingRed,
      agingTotal,
      componentsTotal,
      componentsNew,
      componentsUsed,
    };
  }, [inventory, spareParts, nowTimestamp]);

  // Helper tính toán thời gian bảo hành thời gian thực
  const getRealtimeWarrantyStatus = (handoverDateStr?: string, warrantyMonths: number = 12) => {
    if (!handoverDateStr) {
      return {
        isExpired: false,
        isNearExpiry: false,
        remainingText: 'Chưa kích hoạt',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
        percentElapsed: 0,
      };
    }

    const startDate = new Date(handoverDateStr).getTime();
    const durationMs = warrantyMonths * 30 * 24 * 60 * 60 * 1000;
    const expiryDate = startDate + durationMs;
    const now = new Date().getTime();
    const diffMs = expiryDate - now;
    const elapsedMs = now - startDate;
    const percentElapsed = Math.min(100, Math.max(0, Math.round((elapsedMs / durationMs) * 100)));

    if (diffMs <= 0) {
      const expiredDaysAgo = Math.floor(Math.abs(diffMs) / (24 * 60 * 60 * 1000));
      return {
        isExpired: true,
        isNearExpiry: false,
        remainingText: `Đã hết hạn (${expiredDaysAgo > 0 ? `quá ${expiredDaysAgo} ngày` : 'hôm nay'})`,
        badgeClass: 'bg-red-50 text-red-700 border-red-200 font-bold',
        percentElapsed: 100,
      };
    }

    const daysRemaining = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    const monthsRemaining = Math.floor(daysRemaining / 30);
    const leftoverDays = daysRemaining % 30;

    let text = '';
    if (monthsRemaining > 0) {
      text = `Còn ${monthsRemaining} tháng ${leftoverDays > 0 ? `${leftoverDays} ngày` : ''}`;
    } else {
      text = `Còn ${daysRemaining} ngày`;
    }

    const isNearExpiry = daysRemaining <= 30;
    const badgeClass = isNearExpiry
      ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold animate-pulse'
      : 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold';

    return {
      isExpired: false,
      isNearExpiry,
      remainingText: text,
      badgeClass,
      percentElapsed,
    };
  };

  // Danh sách máy đã bán
  const soldMachines = useMemo(() => {
    return inventory.filter((item) => item.qc_status === 'sold' || Boolean(item.handover_date));
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
      alert('Vui lòng nhập đầy đủ Model và Số Serial (Serial Number)!');
      return;
    }

    try {
      const orig = Number(newItem.original_price) || 0;
      const sale = Number(newItem.sale_price) || 0;
      const effectivePrice = sale > 0 ? sale : orig;
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
        import_date: newItem.import_date || new Date().toISOString().slice(0, 10),
        original_price: orig,
        sale_price: sale,
        price: effectivePrice,
        retail_price: effectivePrice,
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
        import_date: new Date().toISOString().slice(0, 10),
        original_price: 4850000,
        sale_price: 0,
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
      const orig = Number(newPart.original_price) || 0;
      const sale = Number(newPart.sale_price) || 0;
      const effectivePrice = sale > 0 ? sale : orig;
      await addSparePart({
        part_name: newPart.part_name.trim(),
        part_type: newPart.part_type,
        condition: newPart.condition,
        quantity_in_stock: Number(newPart.quantity_in_stock),
        warranty_months: Number(newPart.warranty_months),
        distributor: newPart.distributor,
        unit_cost: Number(newPart.unit_cost),
        original_price: orig,
        sale_price: sale,
        unit_price: effectivePrice,
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
        original_price: 650000,
        sale_price: 0,
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



  // Export CSV (Excel)
  const handleExportCSV = () => {
    if (activeTab === 'may-bo' || activeTab === 'laptop') {
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
      link.setAttribute('download', `danh_sach_${activeTab === 'may-bo' ? 'may_bo' : 'laptop'}_${new Date().toISOString().slice(0, 10)}.csv`);
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
    } else if (activeTab === 'sold') {
      if (soldMachines.length === 0) return;
      const headers = ['Mã Quản Lý', 'Model Thiết Bị', 'Khách Hàng', 'SĐT', 'Ngày Bán', 'Bảo Hành', 'Số Serial'];
      const rows = soldMachines.map((m) => [
        `"${m.service_tag || ''}"`,
        `"${(m.device_model || m.model || '').replace(/"/g, '""')}"`,
        `"${(m.customer_name || '').replace(/"/g, '""')}"`,
        `"${m.customer_phone || ''}"`,
        `"${(m.handover_date || '').slice(0, 10)}"`,
        `"${m.warranty_months || 0} tháng"`,
        `"${m.serial_number || ''}"`,
      ]);
      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `danh_sach_may_da_ban_${new Date().toISOString().slice(0, 10)}.csv`);
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
            {activeTab === 'may-bo' && 'Kho Máy Bộ'}
            {activeTab === 'laptop' && 'Kho Laptop'}
            {activeTab === 'sold' && 'Máy Đã Bán & Bảo Hành'}
            {activeTab === 'components' && 'Kho Linh Kiện'}
            <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold rounded-md font-mono">
              {activeTab === 'may-bo' && `${stats.mayBoTotal} máy bộ`}
              {activeTab === 'laptop' && `${stats.laptopTotal} laptop`}
              {activeTab === 'sold' && `${stats.sold} máy đã bán`}
              {activeTab === 'components' && `${spareParts.length} mục`}
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
          {(activeTab === 'may-bo' || activeTab === 'laptop') && canEditStock() && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center justify-center px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all active:scale-95 whitespace-nowrap shrink-0"
            >
              + Nhập máy
            </button>
          )}
          {activeTab === 'components' && canEditStock() && (
            <button
              onClick={() => setIsAddPartModalOpen(true)}
              className="inline-flex items-center justify-center px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all active:scale-95 whitespace-nowrap shrink-0"
            >
              + Thêm linh kiện
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs: Máy bộ, Laptop, Linh kiện, Máy đã bán */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
        <button
          onClick={() => setActiveTab('may-bo')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'may-bo'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Máy bộ tồn kho</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold font-mono ${
            activeTab === 'may-bo' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
          }`}>
            {stats.mayBoTotal}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('laptop')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'laptop'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Laptop tồn kho</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold font-mono ${
            activeTab === 'laptop' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-700'
          }`}>
            {stats.laptopTotal}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('components')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'components'
              ? 'bg-white text-emerald-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Kho linh kiện</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold font-mono ${
            activeTab === 'components' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
          }`}>
            {stats.componentsTotal}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('sold')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'sold'
              ? 'bg-white text-purple-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Máy đã bán &amp; BH</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold font-mono ${
            activeTab === 'sold' ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-700'
          }`}>
            {stats.sold}
          </span>
        </button>
      </div>

      {/* RBAC Notice (Compact) */}
      {!canEditStock() && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
          <span>Tài khoản {currentUser.name} ({currentUser.role === 'technician' ? 'Kỹ thuật' : 'Kinh doanh'}) — Chỉ xem tồn kho, quyền sửa dành cho Admin.</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className={`p-3 rounded-xl border shadow-2xs transition-colors ${
          activeTab === 'may-bo' ? 'bg-blue-50/50 border-blue-300' : 'bg-white border-slate-200'
        }`}>
          <div className="text-[11px] text-slate-500 truncate">Máy Bộ Tồn Kho</div>
          <div className="text-base font-bold text-blue-800 font-mono mt-0.5">{stats.mayBoTotal} máy</div>
        </div>

        <div className={`p-3 rounded-xl border shadow-2xs transition-colors ${
          activeTab === 'laptop' ? 'bg-indigo-50/50 border-indigo-300' : 'bg-white border-slate-200'
        }`}>
          <div className="text-[11px] text-slate-500 truncate">Laptop Tồn Kho</div>
          <div className="text-base font-bold text-indigo-800 font-mono mt-0.5">{stats.laptopTotal} máy</div>
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
          <div className="text-[11px] text-slate-500 truncate">Linh Kiện Tồn Kho</div>
          <div className="text-base font-bold text-emerald-800 font-mono mt-0.5">{stats.componentsTotal} món</div>
          <div className="text-[10px] text-slate-500 font-medium">
            Mới {stats.componentsNew} • Cũ {stats.componentsUsed}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MÁY TÍNH & LAPTOP */}
      {/* ========================================================================= */}
      {(activeTab === 'may-bo' || activeTab === 'laptop') && (
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
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium">Hàng hóa:</span>
          {(
            [
              { id: 'all', label: 'Tất cả' },
              { id: 'ready_to_sell', label: 'RTS (Sẵn bán)' },
              { id: 'reserved', label: `Đang đợi bán (${stats.reserved})` },
              { id: 'testing', label: 'QC' },
              { id: 'sold', label: 'Sold' },
            ] as const
          ).map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStatus(s.id)}
              className={`px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer ${
                selectedStatus === s.id
                  ? s.id === 'reserved'
                    ? 'bg-purple-600 text-white shadow-xs font-bold'
                    : 'bg-blue-600 text-white'
                  : s.id === 'reserved' && stats.reserved > 0
                  ? 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}

          {/* Aging Liquidation Alert Filter Pill */}
          <button
            onClick={() => setSelectedStatus('aging_warning')}
            className={`px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 transition-all ${
              selectedStatus === 'aging_warning'
                ? 'bg-rose-600 text-white shadow-xs'
                : stats.agingTotal > 0
                ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <span>⚠️ Cảnh báo thanh lý (50-60+ ngày)</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                selectedStatus === 'aging_warning' ? 'bg-white text-rose-700' : 'bg-rose-600 text-white'
              }`}
            >
              {stats.agingTotal}
            </span>
          </button>
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
                <th className="py-3 px-4">Ngày Nhập &amp; Tuổi Kho</th>
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
                  const isReserved = item.qc_status === 'reserved';
                  const daysInStock = calculateDaysInStock(item, nowTimestamp);
                  const isYellowAging = daysInStock >= 50 && daysInStock < 56 && item.qc_status !== 'sold' && !isReserved;
                  const isRedAging = daysInStock >= 56 && item.qc_status !== 'sold' && !isReserved;

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isReserved
                          ? 'bg-purple-50/50 hover:bg-purple-50/80'
                          : isRedAging
                          ? 'bg-rose-50/40 hover:bg-rose-50/70'
                          : isYellowAging
                          ? 'bg-amber-50/40 hover:bg-amber-50/70'
                          : 'hover:bg-slate-50/70'
                      }`}
                    >
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
                        {isReserved && (
                          <div className="mt-1.5 p-1.5 bg-purple-100/70 border border-purple-200 rounded-md text-[11px] text-purple-900 max-w-xs">
                            <div className="font-semibold flex items-center gap-1 text-purple-800">
                              <User className="w-3 h-3 flex-shrink-0" />
                              <span>Đợi khách: <span className="font-bold">{item.customer_name || 'Khách đặt online'}</span></span>
                            </div>
                            {item.customer_phone && (
                              <div className="text-[10px] text-purple-700 font-mono mt-0.5 pl-4">
                                SĐT: {item.customer_phone}
                              </div>
                            )}
                            {item.reserved_order_code && (
                              <div className="text-[10px] text-slate-600 font-mono pl-4">
                                Đơn: #{item.reserved_order_code}
                              </div>
                            )}
                          </div>
                        )}
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

                      {/* Ngày nhập & Tuổi kho (Aging Alerts) */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-mono text-slate-700 font-semibold">
                            {item.import_date
                              ? new Date(item.import_date).toLocaleDateString('vi-VN')
                              : item.created_at
                              ? new Date(item.created_at).toLocaleDateString('vi-VN')
                              : 'Chưa ghi nhận'}
                          </span>
                          {item.qc_status === 'sold' ? (
                            <span className="text-[11px] text-slate-400 font-mono">
                              Đã xuất bán
                            </span>
                          ) : isRedAging ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 w-fit">
                              🚨 {daysInStock} ngày (Thanh lý gấp)
                            </span>
                          ) : isYellowAging ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 w-fit">
                              ⚠️ {daysInStock} ngày (Tồn lâu)
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-500 font-mono">
                              Tồn: {daysInStock} ngày
                            </span>
                          )}
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
                              isReserved
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : isReady
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : isTesting
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-100 text-slate-600 border-slate-300'
                            }`}
                          >
                            <option value="ready_to_sell">Sẵn bán (RTS)</option>
                            <option value="reserved">Đang đợi bán</option>
                            <option value="testing">Đang QC</option>
                            <option value="sold">Đã bán</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${
                              isReserved
                                ? 'bg-purple-100 text-purple-800'
                                : isReady
                                ? 'bg-emerald-100 text-emerald-800'
                                : isTesting
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {isReserved ? 'Đang đợi bán' : isReady ? 'Sẵn sàng bán' : isTesting ? 'Đang kiểm tra' : 'Đã bán'}
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
                      <td
                        className={`py-3.5 px-4 text-right ${
                          canSellAndEditWarranty()
                            ? 'cursor-pointer hover:bg-blue-50/50 transition-colors'
                            : ''
                        }`}
                        onClick={() => {
                          if (canSellAndEditWarranty()) setEditingPriceMachine(item);
                        }}
                        title={canSellAndEditWarranty() ? 'Bấm để chỉnh sửa giá bán máy' : undefined}
                      >
                        <InventoryPriceDisplay
                          originalPrice={item.original_price}
                          salePrice={item.sale_price}
                          fallbackPrice={item.price ?? item.retail_price ?? 0}
                          warrantyMonths={item.warranty_months}
                          canEdit={canSellAndEditWarranty()}
                          onEdit={() => setEditingPriceMachine(item)}
                        />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Khách không mua - Huỷ đặt trước & trả máy về kho */}
                          {isReserved && (
                            <button
                              onClick={() => handleCancelReservation(item)}
                              title="Khách không mua: Huỷ giữ máy và trả về kho"
                              className="px-2 py-1 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-bold transition-colors border border-rose-300 bg-rose-50 flex items-center gap-1 shadow-2xs"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              Không mua
                            </button>
                          )}

                          {/* Edit Price Button (Admin & Sales) */}
                          {canSellAndEditWarranty() && (
                            <button
                              onClick={() => setEditingPriceMachine(item)}
                              title="Chỉnh sửa giá gốc và giá giảm của máy"
                              className="px-2 py-1 text-slate-700 hover:text-blue-700 hover:bg-blue-50 rounded-lg text-xs font-semibold transition-colors border border-slate-200 bg-white flex items-center gap-1 shadow-2xs"
                            >
                              <Tag className="w-3.5 h-3.5 text-blue-600" />
                              Sửa giá
                            </button>
                          )}

                          {/* Sale Handover Button (Admin & Sales) */}
                          {canSellAndEditWarranty() && (
                            <button
                              onClick={() => handleOpenSellModal(item)}
                              title="Xuất bán máy, cấp mã KH & điều chỉnh bảo hành"
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                                item.qc_status === 'sold'
                                    ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                    : isReserved
                                    ? 'bg-purple-600 hover:bg-purple-700 text-white border-purple-700 shadow-xs'
                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300 shadow-xs'
                              }`}
                            >
                              {item.qc_status === 'sold' ? 'Đã bán' : isReserved ? 'Bán máy' : 'Bán máy'}
                            </button>
                          )}

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
      {/* TAB: MÁY ĐÃ BÁN & BẢO HÀNH THỜI GIAN THỰC */}
      {/* ========================================================================= */}
      {activeTab === 'sold' && (
        <SoldInventoryTab
          soldMachines={soldMachines}
          onPrintLabel={handleOpenLabelModal}
          getRealtimeWarrantyStatus={getRealtimeWarrantyStatus}
        />
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
                    {canEditStock() && <th className="py-3 px-4">Giá Nhập</th>}
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

                          {/* Cost Price - Only visible to authorized roles */}
                          {canEditStock() && (
                            <td className="py-3.5 px-4 text-xs">
                              <span className="font-medium text-slate-600 font-mono">
                                {new Intl.NumberFormat('vi-VN').format(part.unit_cost || 0)} đ
                              </span>
                            </td>
                          )}

                          {/* Retail Price */}
                          <td
                            className={`py-3.5 px-4 text-right ${
                              canSellAndEditWarranty()
                                ? 'cursor-pointer hover:bg-blue-50/50 transition-colors'
                                : ''
                            }`}
                            onClick={() => {
                              if (canSellAndEditWarranty()) setEditingPricePart(part);
                            }}
                            title={canSellAndEditWarranty() ? 'Bấm để chỉnh sửa giá bán linh kiện' : undefined}
                          >
                            <InventoryPriceDisplay
                              originalPrice={part.original_price}
                              salePrice={part.sale_price}
                              fallbackPrice={part.unit_price || 0}
                              canEdit={canSellAndEditWarranty()}
                              onEdit={() => setEditingPricePart(part)}
                            />
                          </td>

                          {/* Warranty */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                              {part.warranty_months} tháng
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Sửa giá LK */}
                              {canSellAndEditWarranty() && (
                                <button
                                  onClick={() => setEditingPricePart(part)}
                                  title="Chỉnh sửa giá gốc và giá giảm linh kiện"
                                  className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-blue-700 bg-white hover:bg-blue-50 rounded border border-slate-200 transition-colors flex items-center gap-1 shadow-2xs"
                                >
                                  <Tag className="w-3 h-3 text-blue-600" />
                                  Sửa giá
                                </button>
                              )}
                              {canSellAndEditWarranty() && (
                                <button
                                  onClick={() => handleOpenSellPartModal(part)}
                                  disabled={part.quantity_in_stock <= 0}
                                  title={part.quantity_in_stock <= 0 ? 'Hết hàng tồn' : 'Xuất bán linh kiện này'}
                                  className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 disabled:pointer-events-none rounded border border-emerald-200 transition-colors"
                                >
                                  Bán LK
                                </button>
                              )}
                              {canEditStock() && (
                                <button
                                  onClick={() => handleDeletePart(part.id, part.part_name)}
                                  title="Xóa linh kiện (Chỉ Admin)"
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

                {/* Giá đầu vào (vốn nhập kho) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Giá Đầu Vào (VNĐ)
                  </label>
                  <PricePreview value={newItem.import_price} label="Giá đầu vào" tone="rose" />
                  <input
                    type="number"
                    min={0}
                    step={50000}
                    value={newItem.import_price === 0 ? '' : newItem.import_price}
                    placeholder="Nhập giá mua vào..."
                    onChange={(e) =>
                      setNewItem({ ...newItem, import_price: e.target.value === '' ? 0 : Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>

                {/* Ngày Nhập Hàng */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ngày Nhập Hàng *
                  </label>
                  <input
                    type="date"
                    required
                    value={newItem.import_date}
                    onChange={(e) => setNewItem({ ...newItem, import_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono font-medium text-slate-800"
                  />
                </div>

                {/* Giá Gốc & Giá Giảm */}
                <div className="md:col-span-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-blue-600" />
                      Quản lý giá bán (Giá gốc & Giá giảm)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Nếu không giảm giá: để trống ô giá giảm
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Giá Gốc */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700">
                          Giá Gốc Niêm Yết (VNĐ) *
                        </label>
                        <button
                          type="button"
                          onClick={() => setNewItem({ ...newItem, original_price: 0, price: 0 })}
                          className={`text-[11px] px-1.5 py-0.5 rounded font-semibold transition-colors ${
                            newItem.original_price === 0
                              ? 'bg-amber-600 text-white'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                        >
                          {newItem.original_price === 0 ? '✓ Giá Liên Hệ' : 'Đặt "Liên Hệ"'}
                        </button>
                      </div>
                      <PricePreview
                        value={newItem.original_price}
                        label="Giá gốc"
                        tone="slate"
                        emptyText="Giá liên hệ (0 ₫)"
                      />
                      <input
                        type="number"
                        min={0}
                        step={50000}
                        value={newItem.original_price === 0 ? '' : newItem.original_price}
                        placeholder={newItem.original_price === 0 ? 'Liên Hệ (0 đ)' : 'Nhập giá gốc...'}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : Number(e.target.value);
                          setNewItem({ ...newItem, original_price: val, price: val });
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    {/* Giá Giảm */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700">
                          Giá Giảm Khuyến Mãi (VNĐ)
                        </label>
                        {newItem.sale_price > 0 && (
                          <button
                            type="button"
                            onClick={() => setNewItem({ ...newItem, sale_price: 0 })}
                            className="text-[11px] text-rose-600 hover:underline font-semibold"
                          >
                            Xóa giảm giá
                          </button>
                        )}
                      </div>
                      <PricePreview
                        value={newItem.sale_price}
                        label="Giá giảm"
                        tone="rose"
                        emptyText="Không giảm (0 ₫)"
                      />
                      <input
                        type="number"
                        min={0}
                        step={50000}
                        value={newItem.sale_price === 0 ? '' : newItem.sale_price}
                        placeholder="Để trống hoặc 0 nếu không giảm..."
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : Number(e.target.value);
                          setNewItem({ ...newItem, sale_price: val });
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold text-rose-600 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Live Preview Display Rule */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Hiển thị thực tế:</span>
                    {newItem.sale_price > 0 ? (
                      <div className="flex items-baseline gap-2">
                        <span className="font-extrabold text-rose-600 font-mono text-sm">
                          {formatMoney(newItem.sale_price)}
                        </span>
                        <span className="text-xs text-slate-400 line-through font-mono">
                          {formatMoney(newItem.original_price)}
                        </span>
                        {newItem.original_price > newItem.sale_price && (
                          <span className="text-[10px] font-extrabold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                            -{Math.round(((newItem.original_price - newItem.sale_price) / newItem.original_price) * 100)}%
                          </span>
                        )}
                      </div>
                    ) : newItem.original_price <= 0 ? (
                      <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-xs">
                        Liên hệ
                      </span>
                    ) : (
                      <span className="font-bold text-slate-900 font-mono text-sm">
                        {formatMoney(newItem.original_price)}
                      </span>
                    )}
                  </div>
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
                      Ngày Bán (Bắt Đầu Bảo Hành) *
                    </label>
                    <input
                      type="date"
                      required
                      value={sellDate}
                      onChange={(e) => setSellDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Thời Hạn Bảo Hành *
                    </label>
                    <select
                      value={sellWarrantyMonths}
                      onChange={(e) => setSellWarrantyMonths(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-700"
                    >
                      <option value={3}>3 Tháng</option>
                      <option value={6}>6 Tháng</option>
                      <option value={12}>12 Tháng</option>
                      <option value={36}>36 Tháng</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Giá Bán Thực Tế (VNĐ)</label>
                    <PricePreview value={sellPrice} label="Giá bán" tone="emerald" />
                    <input
                      type="number"
                      min={0}
                      step={50000}
                      value={sellPrice}
                      onChange={(e) => setSellPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold font-mono"
                    />
                  </div>
                </div>

                {/* Live Warranty Calculation */}
                <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-600 font-medium">
                    Kích hoạt BH: <strong className="text-slate-900 font-mono">{sellDate ? new Date(sellDate).toLocaleDateString('vi-VN') : '—'}</strong>
                  </span>
                  <span className="text-blue-800 font-semibold">
                    Hết hạn BH: <strong className="text-blue-700 font-mono">{calculateWarrantyEndDate(sellDate, sellWarrantyMonths) || '—'}</strong>
                  </span>
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

      {/* MODAL BÁN LINH KIỆN */}
      {sellingPart && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-4 my-8 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Bán Linh Kiện &amp; Kích Hoạt Bảo Hành
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tự động trừ kho linh kiện và tạo phiếu bảo hành cho khách hàng.
                </p>
              </div>
              <button
                onClick={() => setSellingPart(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors text-base font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmPartSale} className="space-y-4">
              {/* Part Overview Banner */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Linh kiện</span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">
                    {sellingPart.part_name}
                  </div>
                  <div className="text-slate-500 mt-0.5 flex items-center gap-2">
                    <span className="capitalize">Loại: <strong>{sellingPart.part_type}</strong></span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold">Tồn kho: {sellingPart.quantity_in_stock} cái</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Đơn giá niêm yết</span>
                  <div className="text-base font-black text-emerald-700 mt-0.5 font-mono">
                    {(sellingPart.unit_price || 0).toLocaleString('vi-VN')} đ
                  </div>
                </div>
              </div>

              {/* CUSTOMER INFO */}
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                <label className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
                  Thông Tin Khách Hàng
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và Tên *</label>
                    <input
                      type="text"
                      required
                      value={sellPartCustomerName}
                      onChange={(e) => setSellPartCustomerName(e.target.value)}
                      placeholder="VD: Nguyễn Văn A"
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Số Điện Thoại *</label>
                    <input
                      type="tel"
                      required
                      value={sellPartCustomerPhone}
                      onChange={(e) => setSellPartCustomerPhone(e.target.value)}
                      placeholder="0918xxxxxx"
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Địa Chỉ</label>
                  <input
                    type="text"
                    value={sellPartCustomerAddress}
                    onChange={(e) => setSellPartCustomerAddress(e.target.value)}
                    placeholder="Phường/Xã, Tỉnh..."
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* QUANTITY, PRICE & WARRANTY */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Số Lượng, Ngày Bán &amp; Bảo Hành
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Số Lượng Bán (Tối đa {sellingPart.quantity_in_stock}) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={sellingPart.quantity_in_stock}
                      value={sellPartQuantity}
                      onChange={(e) => setSellPartQuantity(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Giá Bán Thực Tế (VNĐ / Cái) *
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={10000}
                      value={sellPartPrice}
                      onChange={(e) => setSellPartPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Ngày Bán (Bắt Đầu Bảo Hành) *
                    </label>
                    <input
                      type="date"
                      required
                      value={sellPartDate}
                      onChange={(e) => setSellPartDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Thời Hạn Bảo Hành *
                    </label>
                    <select
                      value={sellPartWarrantyMonths}
                      onChange={(e) => setSellPartWarrantyMonths(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-700"
                    >
                      <option value={3}>3 Tháng</option>
                      <option value={6}>6 Tháng</option>
                      <option value={12}>12 Tháng</option>
                      <option value={36}>36 Tháng</option>
                    </select>
                  </div>
                </div>

                {/* Live calculation banner */}
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-600 font-medium">
                    Kích hoạt: <strong className="text-slate-900 font-mono">{sellPartDate ? new Date(sellPartDate).toLocaleDateString('vi-VN') : '—'}</strong>
                  </span>
                  <span className="text-emerald-800 font-semibold">
                    Hết hạn BH: <strong className="text-emerald-700 font-mono">{calculateWarrantyEndDate(sellPartDate, sellPartWarrantyMonths) || '—'}</strong>
                  </span>
                </div>

                <div className="pt-1 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Tổng tiền thanh toán:</span>
                  <span className="font-bold text-sm text-emerald-700 font-mono">
                    {(sellPartPrice * sellPartQuantity).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSellingPart(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
                >
                  Xác Nhận Bán Linh Kiện
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
                  <PricePreview value={newPart.unit_cost} label="Giá đầu vào" tone="rose" />
                  <input
                    type="number"
                    min={0}
                    step={10000}
                    value={newPart.unit_cost}
                    onChange={(e) => setNewPart({ ...newPart, unit_cost: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium font-mono"
                  />
                </div>

                {/* Giá Gốc & Giá Giảm Linh Kiện */}
                <div className="md:col-span-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-blue-600" />
                      Quản lý giá bán linh kiện (Giá gốc & Giá giảm)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Nếu không giảm giá: để trống ô giá giảm
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Giá Gốc */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700">
                          Giá Gốc Niêm Yết (VNĐ) *
                        </label>
                        <button
                          type="button"
                          onClick={() => setNewPart({ ...newPart, original_price: 0, unit_price: 0 })}
                          className={`text-[11px] px-1.5 py-0.5 rounded font-semibold transition-colors ${
                            newPart.original_price === 0
                              ? 'bg-amber-600 text-white'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                        >
                          {newPart.original_price === 0 ? '✓ Giá Liên Hệ' : 'Đặt "Liên Hệ"'}
                        </button>
                      </div>
                      <PricePreview
                        value={newPart.original_price}
                        label="Giá gốc"
                        tone="slate"
                        emptyText="Giá liên hệ (0 ₫)"
                      />
                      <input
                        type="number"
                        min={0}
                        step={10000}
                        value={newPart.original_price === 0 ? '' : newPart.original_price}
                        placeholder={newPart.original_price === 0 ? 'Liên Hệ (0 đ)' : 'Nhập giá gốc...'}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : Number(e.target.value);
                          setNewPart({ ...newPart, original_price: val, unit_price: val });
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    {/* Giá Giảm */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700">
                          Giá Giảm Khuyến Mãi (VNĐ)
                        </label>
                        {newPart.sale_price > 0 && (
                          <button
                            type="button"
                            onClick={() => setNewPart({ ...newPart, sale_price: 0 })}
                            className="text-[11px] text-rose-600 hover:underline font-semibold"
                          >
                            Xóa giảm giá
                          </button>
                        )}
                      </div>
                      <PricePreview
                        value={newPart.sale_price}
                        label="Giá giảm"
                        tone="rose"
                        emptyText="Không giảm (0 ₫)"
                      />
                      <input
                        type="number"
                        min={0}
                        step={10000}
                        value={newPart.sale_price === 0 ? '' : newPart.sale_price}
                        placeholder="Để trống hoặc 0 nếu không giảm..."
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : Number(e.target.value);
                          setNewPart({ ...newPart, sale_price: val });
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold text-rose-600 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Live Preview */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Hiển thị thực tế:</span>
                    {newPart.sale_price > 0 ? (
                      <div className="flex items-baseline gap-2">
                        <span className="font-extrabold text-rose-600 font-mono text-sm">
                          {formatMoney(newPart.sale_price)}
                        </span>
                        <span className="text-xs text-slate-400 line-through font-mono">
                          {formatMoney(newPart.original_price)}
                        </span>
                        {newPart.original_price > newPart.sale_price && (
                          <span className="text-[10px] font-extrabold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                            -{Math.round(((newPart.original_price - newPart.sale_price) / newPart.original_price) * 100)}%
                          </span>
                        )}
                      </div>
                    ) : newPart.original_price <= 0 ? (
                      <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-xs">
                        Liên hệ
                      </span>
                    ) : (
                      <span className="font-bold text-slate-900 font-mono text-sm">
                        {formatMoney(newPart.original_price)}
                      </span>
                    )}
                  </div>
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

              {/* Reserved Customer Details Card */}
              {viewingSpecsItem.qc_status === 'reserved' && (
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-purple-600" />
                      Thông Tin Khách Hàng Đặt Mua (Đang Đợi Bán)
                    </div>
                    <span className="text-[10px] bg-purple-200 text-purple-800 font-bold px-2 py-0.5 rounded-full">
                      Đang giữ máy
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1 text-xs">
                    <div>
                      <span className="text-[10px] text-purple-700">Tên khách hàng:</span>
                      <div className="font-bold text-slate-800 mt-0.5">{viewingSpecsItem.customer_name || 'Khách đặt online'}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-purple-700">Số điện thoại:</span>
                      <div className="font-bold text-slate-800 mt-0.5 font-mono">{viewingSpecsItem.customer_phone || '---'}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-purple-700">Mã đơn hàng:</span>
                      <div className="font-bold text-slate-800 mt-0.5 font-mono">
                        {viewingSpecsItem.reserved_order_code ? `#${viewingSpecsItem.reserved_order_code}` : '---'}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-purple-700">Hình thức nhận:</span>
                      <div className="font-semibold text-slate-700 mt-0.5">
                        {viewingSpecsItem.reserved_delivery_method === 'pickup'
                          ? 'Nhận tại cửa hàng/kho'
                          : viewingSpecsItem.reserved_delivery_method === 'delivery'
                          ? 'Giao hàng tận nơi'
                          : viewingSpecsItem.reserved_delivery_method || 'Nhận tại kho'}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-purple-700">Thời gian giữ máy:</span>
                      <div className="font-semibold text-slate-700 mt-0.5">
                        {viewingSpecsItem.reserved_at
                          ? new Date(viewingSpecsItem.reserved_at).toLocaleString('vi-VN')
                          : '---'}
                      </div>
                    </div>
                    {viewingSpecsItem.reserved_note && (
                      <div className="col-span-2 sm:col-span-3">
                        <span className="text-[10px] text-purple-700">Ghi chú đặt:</span>
                        <div className="text-slate-700 mt-0.5 italic">{viewingSpecsItem.reserved_note}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* QC & Inventory Details */}
              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2">
                <div className="text-xs font-bold text-blue-900">Tình Trạng Kho &amp; Tiêu Chuẩn Xuất Xưởng</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] text-slate-500">Trạng thái:</span>
                    <div className="font-bold text-slate-800 mt-0.5">
                      {viewingSpecsItem.qc_status === 'reserved'
                        ? 'Đang đợi bán (Khách đặt)'
                        : viewingSpecsItem.qc_status === 'ready_to_sell'
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
                    <span className="text-[10px] text-slate-500">Ngày nhập hàng:</span>
                    <div className="font-bold text-slate-800 mt-0.5 font-mono">
                      {viewingSpecsItem.import_date
                        ? new Date(viewingSpecsItem.import_date).toLocaleDateString('vi-VN')
                        : viewingSpecsItem.created_at
                        ? new Date(viewingSpecsItem.created_at).toLocaleDateString('vi-VN')
                        : 'Chưa cập nhật'}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Tuổi kho &amp; Cảnh báo:</span>
                    <div className="mt-0.5">
                      {(() => {
                        const days = calculateDaysInStock(viewingSpecsItem, nowTimestamp);
                        if (viewingSpecsItem.qc_status === 'sold') {
                          return <span className="text-slate-400 font-mono">Đã bán</span>;
                        }
                        if (days >= 56) {
                          return (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                              🚨 {days} ngày (Cần thanh lý gấp)
                            </span>
                          );
                        }
                        if (days >= 50) {
                          return (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                              ⚠️ {days} ngày (Cảnh báo tồn lâu)
                            </span>
                          );
                        }
                        return <span className="font-bold text-slate-800 font-mono">{days} ngày</span>;
                      })()}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Giá bán áp dụng:</span>
                    <div className="mt-0.5">
                      <InventoryPriceDisplay
                        originalPrice={viewingSpecsItem.original_price}
                        salePrice={viewingSpecsItem.sale_price}
                        fallbackPrice={viewingSpecsItem.price ?? viewingSpecsItem.retail_price ?? 0}
                        align="left"
                      />
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
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Đóng
              </button>

              <div className="flex items-center gap-2">
                {viewingSpecsItem.qc_status === 'reserved' && (
                  <button
                    type="button"
                    onClick={() => {
                      const target = viewingSpecsItem;
                      setViewingSpecsItem(null);
                      handleCancelReservation(target);
                    }}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 text-xs font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    Không mua (Trả về kho)
                  </button>
                )}
                {canSellAndEditWarranty() && (
                  <button
                    type="button"
                    onClick={() => {
                      const target = viewingSpecsItem;
                      setViewingSpecsItem(null);
                      setEditingPriceMachine(target);
                    }}
                    className="px-3.5 py-2 bg-white hover:bg-blue-50 border border-slate-300 text-blue-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Tag className="w-3.5 h-3.5 text-blue-600" />
                    Sửa Giá Bán
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedItemForLabel(viewingSpecsItem);
                    setIsLabelModalOpen(true);
                    setViewingSpecsItem(null);
                  }}
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  In Tem Nhiệt (50x30mm)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleOpenSellModal(viewingSpecsItem);
                    setViewingSpecsItem(null);
                  }}
                  className={`px-4 py-2 text-white text-xs font-bold rounded-lg shadow-xs transition-all active:scale-95 cursor-pointer ${
                    viewingSpecsItem.qc_status === 'reserved'
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {viewingSpecsItem.qc_status === 'reserved' ? 'Bán máy cho khách này' : 'Bán Máy / Đổi Trạng Thái'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Chỉnh Sửa Giá Bán Máy */}
      <EditPriceModal
        isOpen={Boolean(editingPriceMachine)}
        onClose={() => setEditingPriceMachine(null)}
        title="Chỉnh sửa giá bán máy"
        itemName={editingPriceMachine ? `${editingPriceMachine.brand} ${editingPriceMachine.model}` : ''}
        itemSubtext={editingPriceMachine ? `Serial / Tag: ${editingPriceMachine.service_tag}` : ''}
        costPrice={editingPriceMachine?.import_price || 0}
        initialOriginalPrice={
          editingPriceMachine?.original_price && editingPriceMachine.original_price > 0
            ? editingPriceMachine.original_price
            : editingPriceMachine?.price ?? editingPriceMachine?.retail_price ?? 0
        }
        initialSalePrice={editingPriceMachine?.sale_price || 0}
        canEditCost={canEditStock()}
        onSave={handleSaveMachinePrice}
      />

      {/* Modal Chỉnh Sửa Giá Bán Linh Kiện */}
      <EditPriceModal
        isOpen={Boolean(editingPricePart)}
        onClose={() => setEditingPricePart(null)}
        title="Chỉnh sửa giá bán linh kiện"
        itemName={editingPricePart?.part_name || ''}
        itemSubtext={
          editingPricePart
            ? `Loại: ${editingPricePart.part_type} • ${
                editingPricePart.condition === 'new' ? 'Mới 100%' : 'Zin bóc máy'
              }`
            : ''
        }
        costPrice={editingPricePart?.unit_cost || 0}
        initialOriginalPrice={
          editingPricePart?.original_price && editingPricePart.original_price > 0
            ? editingPricePart.original_price
            : editingPricePart?.unit_price || 0
        }
        initialSalePrice={editingPricePart?.sale_price || 0}
        canEditCost={canEditStock()}
        onSave={handleSavePartPrice}
      />

      {/* Thermal Label Modal (50x30mm) */}
      <ThermalLabelModal
        isOpen={isLabelModalOpen}
        onClose={() => setIsLabelModalOpen(false)}
        item={selectedItemForLabel}
      />
    </div>
  );
}
