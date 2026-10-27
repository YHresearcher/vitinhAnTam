'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/lib/store';
import {
  InventoryItem,
  MachineComponent,
  generateCustomerCode,
  SparePart,
} from '@/lib/supabase';
import { SoldInventoryTab } from '@/components/admin/SoldInventoryTab';
import { PricePreview, formatMoney } from '@/components/PricePreview';
import { InventoryPriceDisplay } from '@/components/admin/InventoryPriceDisplay';
import EditPriceModal from '@/components/admin/EditPriceModal';
import Link from 'next/link';
import { message, Modal } from 'antd';
import { User, Ban, ShieldCheck, AlertCircle, Tag, Pencil, Sparkles, Coins, Landmark, ArrowRight } from 'lucide-react';
import CashflowSaleConfirmModal, { CashflowSaleConfirmData } from '@/components/admin/CashflowSaleConfirmModal';

type CashflowSaleConfirm = CashflowSaleConfirmData;

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
    canAddMachine,
    canUpdateRepairStatus,
    addInventoryItem,
    updateInventoryItem,
    updateInventoryStock,
    splitInventoryItem,
    updateQcStatus,
    deleteInventoryItem,
    reserveInventoryItem,
    cancelReservationItem,
    canSellAndEditWarranty,
    canSell,
    sellInventoryItem,
    markItemAsDealerSold,
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
    warranty_months: 6,
    distributor: 'Chính hãng',
    unit_cost: 450000,
    original_price: 650000,
    sale_price: 0,
    unit_price: 650000,
    shelf_location: 'Kệ Linh Kiện L1',
    notes: 'Mới 100% nguyên seal',
  });
  const [newPartWarrantyType, setNewPartWarrantyType] = useState<'months' | 'manufacturer'>('months');

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
  const [viewingSpecsItem, setViewingSpecsItem] = useState<InventoryItem | null>(null);
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [tempStockValue, setTempStockValue] = useState<number>(1);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  // Trạng thái mở/đóng nhóm dòng máy trong bảng kho (mặc định: lô 1 máy mở, lô nhiều máy thu gọn)
  const [machineGroupToggles, setMachineGroupToggles] = useState<Record<string, boolean>>({});

  // Price Edit Modals (Máy tính & Linh kiện)
  const [editingPriceMachine, setEditingPriceMachine] = useState<InventoryItem | null>(null);
  const [editingPricePart, setEditingPricePart] = useState<SparePart | null>(null);

  // Sales & Handover Modal States - Máy tính (Admin & Sales)
  const [sellingItem, setSellingItem] = useState<InventoryItem | null>(null);
  const [sellCustomerName, setSellCustomerName] = useState('');
  const [sellCustomerBirthDate, setSellCustomerBirthDate] = useState('');
  const [sellCustomerPhone, setSellCustomerPhone] = useState('');
  const [sellCustomerAddress, setSellCustomerAddress] = useState('');
  const [sellSerialNumber, setSellSerialNumber] = useState('');
  const [sellWarrantyMonths, setSellWarrantyMonths] = useState<number>(6);
  const [sellWarrantyType, setSellWarrantyType] = useState<'months' | 'manufacturer'>('months');
  const [sellPrice, setSellPrice] = useState<number>(0);
  const [sellDate, setSellDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [cashflowConfirmData, setCashflowConfirmData] = useState<CashflowSaleConfirm | null>(null);
  const [isSubmittingSale, setIsSubmittingSale] = useState(false);
  const [sellQuantity, setSellQuantity] = useState<number>(1);
  const [sellNotes, setSellNotes] = useState('');

  // Sales Modal States - Linh Kiện (Admin & Sales)
  const [sellingPart, setSellingPart] = useState<SparePart | null>(null);
  const [sellPartCustomerName, setSellPartCustomerName] = useState('');
  const [sellPartCustomerPhone, setSellPartCustomerPhone] = useState('');
  const [sellPartCustomerAddress, setSellPartCustomerAddress] = useState('');
  const [sellPartQuantity, setSellPartQuantity] = useState<number>(1);
  const [sellPartWarrantyMonths, setSellPartWarrantyMonths] = useState<number>(6);
  const [sellPartWarrantyType, setSellPartWarrantyType] = useState<'months' | 'manufacturer'>('months');
  const [sellPartPrice, setSellPartPrice] = useState<number>(0);
  const [sellPartDate, setSellPartDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Split Batch Modal States (Định danh S/N thực tế từ nhà máy cho từng máy)
  const [splittingBatchItem, setSplittingBatchItem] = useState<InventoryItem | null>(null);
  const [splittingUnits, setSplittingUnits] = useState<Array<{ serviceTag: string; serialNumber: string; ssdHealth: number }>>([]);

  const existingCustomerCodes = customers
    .map((c) => c.customer_code)
    .filter((code): code is string => Boolean(code));
  const previewCustomerCode = generateCustomerCode(
    sellCustomerBirthDate,
    sellCustomerPhone,
    existingCustomerCodes
  );

  const handleOpenSellModal = (item: InventoryItem) => {
    if (!canSell()) {
      setActionNotice('Chỉ Quản trị viên và Nhân viên bán hàng mới có quyền xuất bán & điều chỉnh thông tin bảo hành!');
      setTimeout(() => setActionNotice(null), 3500);
      return;
    }
    setSellingItem(item);
    setSellCustomerName(item.customer_name || '');
    setSellCustomerBirthDate('');
    setSellCustomerPhone(item.customer_phone || '');
    setSellCustomerAddress('');
    setSellSerialNumber(item.serial_number || item.service_tag);
    setSellWarrantyType(item.warranty_type === 'manufacturer' ? 'manufacturer' : 'months');
    setSellWarrantyMonths(6);
    const effectiveItemPrice = item.sale_price && item.sale_price > 0 ? item.sale_price : ((item.original_price || item.price) ?? item.retail_price ?? 0);
    setSellPrice(effectiveItemPrice);
    setSellQuantity(1);
    setSellNotes('');
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

  const handleConfirmSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellingItem) return;
    if (!sellCustomerName.trim() || !sellCustomerPhone.trim()) {
      setActionNotice('Vui lòng nhập họ tên và số điện thoại khách hàng!');
      setTimeout(() => setActionNotice(null), 3500);
      return;
    }

    const initialCost = Number(sellingItem.import_price || sellingItem.cost_price || 0);
    setCashflowConfirmData({
      item: sellingItem,
      customerName: sellCustomerName.trim(),
      customerPhone: sellCustomerPhone.trim(),
      customerBirthDate: sellCustomerBirthDate,
      customerAddress: sellCustomerAddress.trim(),
      serialNumber: sellSerialNumber.trim(),
      warrantyMonths: sellWarrantyMonths,
      warrantyType: sellWarrantyType,
      quantity: sellQuantity,
      soldPrice: Number(sellPrice) || 0,
      saleDate: sellDate,
      costPrice: initialCost,
    });
  };

  const handleFinalizeSale = async () => {
    if (!cashflowConfirmData || isSubmittingSale) return;
    setIsSubmittingSale(true);

    try {
      const {
        item,
        customerName,
        customerPhone,
        customerBirthDate,
        customerAddress,
        serialNumber,
        warrantyMonths,
        warrantyType,
        soldPrice,
        saleDate,
        costPrice,
        quantity,
      } = cashflowConfirmData;

      // NVKD chỉ bán, không được sửa giá vốn: ép về giá vốn trong kho,
      // mọi chỉnh sửa trong popup của NVKD đều bị bỏ qua.
      const effectiveCostPrice = canSellAndEditWarranty()
        ? costPrice
        : item.import_price || item.cost_price || 0;
      // Đồng bộ giá vốn nếu người dùng điều chỉnh trong popup
      if (effectiveCostPrice !== (item.import_price || item.cost_price || 0)) {
        await updateInventoryItem(item.id, { import_price: effectiveCostPrice });
      }

      const profit = Math.max(0, soldPrice - effectiveCostPrice);
      const sellerBonus = Math.round(profit * 0.10);
      const lenderBonus = Math.round(profit * 0.05);
      const lenderTotal = effectiveCostPrice + lenderBonus;
      const warrantyReserve = Math.round(profit * 0.05);
      const remainingProfit = profit - sellerBonus - lenderBonus - warrantyReserve;

      const cashflowNote = `[Phân bổ dòng tiền] Giá bán: ${soldPrice.toLocaleString('vi-VN')}₫ | Vốn nhập: ${effectiveCostPrice.toLocaleString('vi-VN')}₫ | Lợi nhuận: ${profit.toLocaleString('vi-VN')}₫ | Người bán (10%): ${sellerBonus.toLocaleString('vi-VN')}₫ | Hoàn người cho vay (Vốn+5%LN): ${lenderTotal.toLocaleString('vi-VN')}₫ | Dự phòng (5%): ${warrantyReserve.toLocaleString('vi-VN')}₫ | LN còn lại (80%): ${remainingProfit.toLocaleString('vi-VN')}₫${sellNotes.trim() ? ` | Ghi chú: ${sellNotes.trim()}` : ''}`;

      const res = await sellInventoryItem({
        itemId: item.id,
        customerName,
        customerPhone,
        birthDate: customerBirthDate || '',
        customerAddress: customerAddress || '',
        serialNumber,
        warrantyMonths,
        warrantyType,
        quantity,
        soldPrice,
        saleDate,
        notes: cashflowNote,
      });

      if (res.success) {
        message.success({
          content: `Xuất bán thành công máy [${item.service_tag}]! Dòng tiền đã được phân bổ & trích lập quỹ bảo hành.`,
          duration: 4,
        });
        setActionNotice(res.message);
        setCashflowConfirmData(null);
        setSellingItem(null);
        setTimeout(() => setActionNotice(null), 4000);
      } else {
        message.error(res.message || 'Lỗi khi xuất bán thiết bị!');
        setActionNotice(res.message);
        setTimeout(() => setActionNotice(null), 4000);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi hoàn tất đơn bán!';
      message.error(errorMsg);
    } finally {
      setIsSubmittingSale(false);
    }
  };

  const handleMarkDealerSold = async (item: InventoryItem) => {
    Modal.confirm({
      title: 'Xác nhận: Đã bán bởi Dealer?',
      icon: <AlertCircle className="w-5 h-5 text-orange-500" />,
      content: (
        <div className="text-xs text-slate-600 space-y-2 pt-1 font-sans">
          <p>
            Bạn đang đánh dấu thiết bị <strong className="text-slate-900 font-mono">{item.service_tag}</strong> ({item.model || item.device_model}) là <strong>hàng trading đã được Dealer bán mất máy</strong>.
          </p>
          <div className="text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 space-y-1">
            <p className="font-bold flex items-center gap-1">
              <span>⚠️ Lưu ý:</span>
            </p>
            <p>
              • Thiết bị sẽ được <strong>gỡ khỏi danh sách hiển thị trong hệ thống</strong> (tồn kho = 0).
            </p>
            <p>
              • <strong>Doanh thu máy này sẽ KHÔNG được cộng vào doanh thu tổng</strong> và không phát sinh quỹ bảo hành hay tích lũy khách hàng.
            </p>
          </div>
        </div>
      ),
      okText: 'Xác nhận Dealer đã bán (Gỡ máy)',
      okButtonProps: { className: '!bg-orange-600 hover:!bg-orange-700 !text-white' },
      cancelText: 'Hủy',
      onOk: async () => {
        const res = await markItemAsDealerSold(item.id);
        if (res.success) {
          message.success(`Đã đánh dấu máy [${item.service_tag}] đã bán bởi Dealer (Không tính doanh thu & đã gỡ khỏi hệ thống).`);
          setActionNotice(`Đã gỡ máy [${item.service_tag}] - Dealer đã bán`);
          if (sellingItem?.id === item.id) setSellingItem(null);
          setTimeout(() => setActionNotice(null), 4000);
        } else {
          message.error(res.message);
        }
      },
    });
  };

  // Mở modal bán linh kiện
  const handleOpenSellPartModal = (part: SparePart) => {
    if (!canSell()) {
      setActionNotice('Chỉ Quản trị viên và Nhân viên bán hàng mới có quyền xuất bán!');
      setTimeout(() => setActionNotice(null), 3500);
      return;
    }
    setSellingPart(part);
    setSellPartCustomerName('');
    setSellPartCustomerPhone('');
    setSellPartCustomerAddress('');
    setSellPartQuantity(1);
    setSellPartWarrantyType(part.warranty_type === 'manufacturer' ? 'manufacturer' : 'months');
    const validMonths = [3, 6];
    const partWarranty = validMonths.includes(part.warranty_months || 0) ? (part.warranty_months as number) : 6;
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
      warrantyType: sellPartWarrantyType,
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
    import_price: 0,
    import_date: new Date().toISOString().slice(0, 10),
    source: 'vtat',
    seller_name: '',
    seller_phone: '',
    seller_note: '',
    original_price: 0,
    sale_price: 0,
    price: 0,
    stock_quantity: 1,
    shelf_location: '',
    // Máy nhập vào luôn ở trạng thái sẵn sàng bán: máy chỉ được nhập sau
    // khi đã test (xem xác nhận test từng máy trong lô bên dưới).
    qc_status: 'ready_to_sell' as InventoryItem['qc_status'],
    warranty_months: 6,
  });

  // Hình ảnh máy nhập trong lô (tải lên qua /api/upload, lưu vào image_urls)
  const [newItemImages, setNewItemImages] = useState<string[]>([]);
  // Gỡ ảnh khỏi form nhập = xóa luôn file vừa tải lên (file chưa gắn với
  // máy nào nên xóa ngay được, khỏi để file mồ côi trong Storage).
  const removeNewItemImage = (idx: number) => {
    const url = newItemImages[idx];
    setNewItemImages((prev) => prev.filter((_, j) => j !== idx));
    if (url) {
      fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      }).catch(() => {});
    }
  };
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  // Lỗi tải ảnh hiện ngay trong form (không dùng alert — alert gốc dễ bị
  // trình duyệt chặn và người dùng tưởng là tải xong nhưng không có ảnh).
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const handleNewItemImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploadingImage(true);
    setImageUploadError(null);
    try {
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append('file', file);
        form.append('folder', 'machines');
        const res = await fetch('/api/upload', { method: 'POST', body: form });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.success || !data?.url) {
          setImageUploadError(
            `Không tải được ảnh ${file.name}: ${data?.message || 'lỗi không rõ'} — ảnh chưa được lưu, vui lòng thử lại.`
          );
          continue;
        }
        setNewItemImages((prev) => [...prev, data.url as string]);
      }
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Danh sách máy trong lô nhập: mỗi máy có S/N riêng (mã quản lý chính),
  // S/N từng linh kiện tách riêng (RAM / SSD / nguồn) và cờ "đã test".
  // Máy phải được test trước khi nhập — máy chưa tick "Đã test" sẽ bị chặn lưu.
  // Đơn giản hóa (2026-10-26): mỗi máy chỉ nhập S/N máy + % sức khỏe
  // SSD; RAM và nguồn mặc định là tốt, không nhập S/N linh kiện nữa.
  type BatchUnit = {
    serialNumber: string;
    ssdHealth: number;
    tested: boolean;
  };
  const blankBatchUnit = (ssdHealth = 98): BatchUnit => ({
    serialNumber: '',
    ssdHealth,
    tested: false,
  });
  const [batchUnits, setBatchUnits] = useState<BatchUnit[]>([blankBatchUnit()]);
  const setBatchQty = (qty: number) => {
    const n = Math.max(1, Math.min(50, Math.floor(Number(qty)) || 1));
    setBatchUnits((prev) =>
      Array.from({ length: n }, (_, i) => prev[i] || blankBatchUnit(prev[prev.length - 1]?.ssdHealth ?? 98))
    );
  };
  const addBatchUnit = () =>
    setBatchUnits((prev) => [...prev, blankBatchUnit(prev[prev.length - 1]?.ssdHealth ?? 98)]);
  const removeBatchUnit = (idx: number) =>
    setBatchUnits((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));
  const updateBatchUnit = (idx: number, patch: Partial<BatchUnit>) =>
    setBatchUnits((prev) => prev.map((u, i) => (i === idx ? { ...u, ...patch } : u)));

// Helper tính số ngày tồn kho
function calculateDaysInStock(item: InventoryItem, nowTimestamp: number): number {
  const dateStr = item.import_date || item.created_at;
  if (!dateStr) return 0;
  const itemDate = new Date(dateStr).getTime();
  if (Number.isNaN(itemDate)) return 0;
  return Math.max(0, Math.floor((nowTimestamp - itemDate) / (1000 * 60 * 60 * 24)));
}

  const nowTimestamp = useMemo(() => Date.now(), []);

  // Filtered inventory - Machines (Máy bộ vs Laptop), sắp xếp theo nhóm trạng thái: Sẵn bán → Đang QC → Đã bán
  const filteredInventory = useMemo(() => {
    const STATUS_ORDER: Record<string, number> = {
      ready_to_sell: 0,
      reserved: 0,
      testing: 1,
      pending_test: 1,
      sold: 2,
      dealer_sold: 2,
    };
    return inventory
      .filter((item) => {
      // Máy đã bán bởi dealer không còn hiển thị trong hệ thống
      if (item.qc_status === 'dealer_sold') return false;

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
      })
      .sort((a, b) => (STATUS_ORDER[a.qc_status] ?? 9) - (STATUS_ORDER[b.qc_status] ?? 9));
  }, [inventory, activeTab, searchQuery, selectedBrand, selectedStatus, nowTimestamp]);

  // ==========================================
  // Hiển thị bảng kho theo NHÓM DÒNG MÁY (cùng dòng máy + cấu hình):
  // - Dòng nhóm: hiện model, cấu hình gộp và TỔNG TỒN KHO của cả lô
  // - Bấm để mở rộng ra từng máy (S/N riêng, trạng thái riêng)
  // - Máy đã bán hiển thị phẳng cuối bảng (chỉ xem)
  // ==========================================
  type MachineDisplayRow =
    | {
        kind: 'group';
        key: string;
        model: string;
        config: string;
        size: number;
        totalQty: number;
        readyCount: number;
        testingCount: number;
        reservedCount: number;
        isQcBucket: boolean;
        firstItem?: InventoryItem;
      }
    | { kind: 'item'; item: InventoryItem };

  const isMachineGroupOpen = (key: string, size: number) =>
    key in machineGroupToggles ? machineGroupToggles[key] : size === 1;

  const toggleMachineGroup = (key: string, size: number) =>
    setMachineGroupToggles((prev) => ({ ...prev, [key]: !isMachineGroupOpen(key, size) }));

  const machineDisplayRows = useMemo<MachineDisplayRow[]>(() => {
    const orderOf = (s: InventoryItem['qc_status']) =>
      s === 'ready_to_sell' || s === 'reserved' ? 0 : s === 'testing' || s === 'pending_test' ? 1 : 2;

    const groupMap = new Map<
      string,
      { model: string; config: string; statusOrder: number; isQcBucket: boolean; items: InventoryItem[] }
    >();
    const soldRows: MachineDisplayRow[] = [];

    filteredInventory.forEach((item) => {
      if (item.qc_status === 'sold') {
        soldRows.push({ kind: 'item', item });
        return;
      }
      const model = item.model || item.device_model || `${item.brand} ${item.form_factor}`;
      const cpu = item.cpu || item.specs?.cpu || '';
      const ram = item.ram || item.specs?.ram || '';
      const ssd = item.ssd_capacity || item.specs?.ssd || '';
      const isQcBucket = item.qc_status === 'testing' || item.qc_status === 'pending_test';
      const key = `${isQcBucket ? 'qc' : 'ready'}::${item.brand}|${model}|${item.form_factor}|${cpu}|${ram}|${ssd}`.toLowerCase();
      const g = groupMap.get(key) || {
        model,
        config: [cpu, ram, ssd].filter(Boolean).join(' • '),
        statusOrder: orderOf(item.qc_status),
        isQcBucket,
        items: [] as InventoryItem[],
      };
      g.items.push(item);
      groupMap.set(key, g);
    });

    const groupAndItems: MachineDisplayRow[] = [...groupMap.entries()]
      .sort((a, b) => a[1].statusOrder - b[1].statusOrder || a[1].model.localeCompare(b[1].model))
      .flatMap(([key, g]) => {
        const header: MachineDisplayRow = {
          kind: 'group',
          key,
          model: g.model,
          config: g.config,
          size: g.items.length,
          totalQty: g.items.reduce((s, i) => s + (i.stock_quantity ?? i.quantity ?? 1), 0),
          readyCount: g.items.filter((i) => i.qc_status === 'ready_to_sell').length,
          testingCount: g.items.filter((i) => i.qc_status === 'testing' || i.qc_status === 'pending_test').length,
          reservedCount: g.items.filter((i) => i.qc_status === 'reserved').length,
          isQcBucket: g.isQcBucket,
          firstItem: g.items[0],
        };
        const open = key in machineGroupToggles ? machineGroupToggles[key] : g.items.length === 1;
        const items: MachineDisplayRow[] = open
          ? [...g.items]
              .sort(
                (a, b) =>
                  orderOf(a.qc_status) - orderOf(b.qc_status) ||
                  (a.serial_number || a.service_tag).localeCompare(b.serial_number || b.service_tag)
              )
              .map((item) => ({ kind: 'item' as const, item }))
          : [];
        return [header, ...items];
      });

    return [...groupAndItems, ...soldRows];
  }, [filteredInventory, machineGroupToggles]);

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
    const total = inventory
      .filter((i) => i.qc_status !== 'dealer_sold')
      .reduce((acc, curr) => acc + (curr.stock_quantity ?? curr.quantity ?? 1), 0);
    const ready = inventory.filter((i) => i.qc_status === 'ready_to_sell').length;
    const testing = inventory.filter((i) => i.qc_status === 'testing' || i.qc_status === 'pending_test').length;

    // Phân loại Máy Bộ vs Laptop (loại trừ đã bán và dealer đã bán)
    const mayBoTotal = inventory.filter((i) => {
      const isLaptop =
        (i.form_factor || '').toLowerCase() === 'laptop' ||
        (i.model || '').toLowerCase().includes('laptop') ||
        (i.device_model || '').toLowerCase().includes('laptop');
      return !isLaptop && i.qc_status !== 'sold' && i.qc_status !== 'dealer_sold';
    }).reduce((acc, curr) => acc + (curr.stock_quantity ?? curr.quantity ?? 1), 0);

    const laptopTotal = inventory.filter((i) => {
      const isLaptop =
        (i.form_factor || '').toLowerCase() === 'laptop' ||
        (i.model || '').toLowerCase().includes('laptop') ||
        (i.device_model || '').toLowerCase().includes('laptop');
      return isLaptop && i.qc_status !== 'sold' && i.qc_status !== 'dealer_sold';
    }).reduce((acc, curr) => acc + (curr.stock_quantity ?? curr.quantity ?? 1), 0);

    // Linh kiện (Mới & Cũ bóc máy)
    const componentsTotal = spareParts.reduce((acc, p) => acc + (p.quantity_in_stock || 0), 0);
    const componentsNew = spareParts
      .filter((p) => p.condition === 'new')
      .reduce((acc, p) => acc + (p.quantity_in_stock || 0), 0);
    const componentsUsed = spareParts
      .filter((p) => p.condition === 'used')
      .reduce((acc, p) => acc + (p.quantity_in_stock || 0), 0);

    // Thiết bị cảnh báo tồn kho lâu (Aging Warning: 50-55d Yellow, 56-60d+ Red - loại trừ đã bán & dealer bán)
    const agingYellow = inventory.filter((i) => {
      const days = calculateDaysInStock(i, nowTimestamp);
      return days >= 50 && days < 56 && i.qc_status !== 'sold' && i.qc_status !== 'dealer_sold';
    }).length;
    const agingRed = inventory.filter((i) => {
      const days = calculateDaysInStock(i, nowTimestamp);
      return days >= 56 && i.qc_status !== 'sold' && i.qc_status !== 'dealer_sold';
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
  const getRealtimeWarrantyStatus = (handoverDateStr?: string, warrantyMonths: number = 12, warrantyType?: 'months' | 'manufacturer') => {
    if (warrantyType === 'manufacturer') {
      return {
        isExpired: false,
        isNearExpiry: false,
        remainingText: 'Theo nhà sản xuất',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
        percentElapsed: 0,
      };
    }
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



  const handleSplitBatch = (item: InventoryItem) => {
    if (!canEditStock()) {
      alert('Quyền bị từ chối: Chỉ Quản trị viên (Admin) mới có quyền tách lô máy!');
      return;
    }
    const currentStock = Math.max(0, item.stock_quantity ?? item.quantity ?? 1);
    if (currentStock <= 1) return;

    const units: Array<{ serviceTag: string; serialNumber: string; ssdHealth: number }> = [];
    // Máy 1: Lấy thông tin máy gốc hiện hành
    const initialSn = item.serial_number || item.service_tag;
    units.push({
      serviceTag: initialSn,
      serialNumber: initialSn,
      ssdHealth: item.ssd_health ?? 98,
    });
    // Các máy còn lại trong lô: Chờ người dùng quét/nhập số S/N từ máy
    for (let i = 1; i < currentStock; i++) {
      units.push({
        serviceTag: '',
        serialNumber: '',
        ssdHealth: item.ssd_health ?? 98,
      });
    }
    setSplittingUnits(units);
    setSplittingBatchItem(item);
  };

  const handleConfirmSplitBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!splittingBatchItem) return;

    for (let i = 0; i < splittingUnits.length; i++) {
      const u = splittingUnits[i];
      if (!u.serialNumber.trim()) {
        alert(`Vui lòng nhập số Serial (S/N) cho Máy #${i + 1}!`);
        return;
      }
    }

    const serials = splittingUnits.map((u) => u.serialNumber.trim().toUpperCase());
    if (new Set(serials).size !== serials.length) {
      alert('Có số Serial (S/N) bị trùng lặp giữa các máy trong lô đang tách! Vui lòng kiểm tra lại.');
      return;
    }

    const existingSerials = new Set(
      inventory
        .filter((i) => i.id !== splittingBatchItem.id)
        .flatMap((i) => [i.serial_number?.toUpperCase(), i.service_tag?.toUpperCase()].filter(Boolean))
    );

    for (let i = 0; i < splittingUnits.length; i++) {
      const s = serials[i];
      if (existingSerials.has(s)) {
        alert(`Số Serial [${s}] của Máy #${i + 1} đã tồn tại ở máy khác trong kho! Vui lòng kiểm tra lại.`);
        return;
      }
    }

    const unitsToSave = splittingUnits.map((u) => ({
      serviceTag: u.serialNumber.trim().toUpperCase(),
      serialNumber: u.serialNumber.trim().toUpperCase(),
      ssdHealth: u.ssdHealth,
    }));

    const ok = await splitInventoryItem(splittingBatchItem.id, unitsToSave);
    if (ok) {
      setActionNotice(`Đã định danh và tách thành công ${splittingUnits.length} máy riêng biệt theo số S/N!`);
      setTimeout(() => setActionNotice(null), 3500);
      setSplittingBatchItem(null);
      setSplittingUnits([]);
    }
  };

  const handleStockEditSave = async (id: string) => {
    if (!canEditStock()) {
      alert('Quyền bị từ chối: Chỉ Quản trị viên (Admin) mới có quyền điều chỉnh số lượng tồn kho!');
      return;
    }
    if (tempStockValue > 1) {
      if (
        !confirm(
          `Cảnh báo nghiệp vụ:\nThiết bị máy tính (máy bộ/laptop) được quản lý theo số Serial (S/N) duy nhất cho từng máy vật lý.\n\nNếu bạn nhập số lượng ${tempStockValue} máy trên dòng này, hệ thống sẽ gộp ${tempStockValue} máy vào chung 1 Serial. Bạn vẫn muốn lưu số lượng này chứ? (Khuyên dùng: Dùng chức năng 'Nhập lô máy' để có S/N riêng cho từng con máy)`
        )
      ) {
        return;
      }
    }
    await updateInventoryStock(id, tempStockValue);
    setEditingStockId(null);
    setActionNotice('Đã cập nhật số lượng tồn kho thành công!');
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleCreateNewItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAddMachine()) {
      alert('Quyền bị từ chối: Bạn không có quyền nhập máy mới!');
      return;
    }
    if (!newItem.model) {
      alert('Vui lòng nhập Model!');
      return;
    }

    // Quản lý CHỈ bằng S/N (bỏ Mã Quản Lý Lô/Tag Gốc): service_tag của
    // từng máy = chính S/N của máy đó. Máy chưa kịp ghi S/N thì tự sinh
    // một mã tạm duy nhất để vẫn tra cứu/quản lý được, sửa S/N sau.
    const takenIds = new Set(
      inventory
        .flatMap((i) => [i.service_tag?.toUpperCase(), i.serial_number?.toUpperCase()])
        .filter(Boolean) as string[]
    );

    // S/N không được trùng trong lô, cũng không trùng máy đã có trong kho
    // Hàng Reseller bắt buộc có thông tin người bán để liên hệ khi cần
    if (newItem.source === 'reseller' && (!newItem.seller_name.trim() || !newItem.seller_phone.trim())) {
      alert('Hàng Reseller cần nhập Tên người bán và SĐT liên hệ để tiện liên hệ khi cần!');
      return;
    }

    // Máy phải được test trước khi nhập — chặn máy chưa tick "Đã test"
    const untested = batchUnits
      .map((u, i) => (!u.tested ? i + 1 : null))
      .filter((n): n is number => n !== null);
    if (untested.length > 0) {
      alert(`Máy số ${untested.join(', ')} chưa được tick "Đã test" — máy phải được test (RAM / SSD / nguồn) trước khi nhập kho!`);
      return;
    }

    const serials = batchUnits.map((u) => u.serialNumber.trim().toUpperCase()).filter(Boolean);
    if (new Set(serials).size !== serials.length) {
      alert('Có S/N bị trùng trong lô — mỗi máy phải có S/N riêng!');
      return;
    }
    const clash = serials.find((s) => takenIds.has(s));
    if (clash) {
      alert(`S/N [${clash}] đã tồn tại trong kho — mỗi máy được quản lý bằng một S/N riêng!`);
      return;
    }

    const stamp = Date.now().toString(36).toUpperCase();
    const identityFor = (unit: { serialNumber: string }, index: number): string => {
      const sn = unit.serialNumber.trim().toUpperCase();
      if (sn) return sn;
      let candidate = `VTAT-${stamp}-${index + 1}`;
      let n = 1;
      while (takenIds.has(candidate)) {
        n += 1;
        candidate = `VTAT-${stamp}-${index + 1}-${n}`;
      }
      takenIds.add(candidate);
      return candidate;
    };

    try {
      const orig = Number(newItem.original_price) || 0;
      const sale = Number(newItem.sale_price) || 0;
      const effectivePrice = sale > 0 ? sale : orig;

      // Nhập từng máy thành 1 dòng riêng (1 dòng = 1 máy): chỉ ghi % sức
      // khỏe SSD; RAM và nguồn mặc định là tốt (ghi note 'Tốt', không nhập
      // S/N linh kiện). Máy nào cũng đã test và vào kho ở trạng thái sẵn
      // sàng bán (RTS).
      let failedCount = 0;
      for (let i = 0; i < batchUnits.length; i += 1) {
        const unit = batchUnits[i];
        const tag = identityFor(unit, i);
        const health = Math.max(1, Math.min(100, Number(unit.ssdHealth) || 98));
        const serial = unit.serialNumber.trim() || tag;
        const components: MachineComponent[] = [
          { type: 'ram' as const, note: 'Tốt' },
          { type: 'ssd' as const, health },
          { type: 'psu' as const, note: 'Tốt' },
        ];
        const added = await addInventoryItem({
          brand: newItem.brand,
          model: newItem.model,
          form_factor: newItem.form_factor,
          service_tag: tag,
          serial_number: serial,
          cpu: newItem.cpu,
          ram: newItem.ram,
          ssd_capacity: newItem.ssd_capacity,
          ssd_health: health,
          import_price: Number(newItem.import_price),
          import_date: newItem.import_date || new Date().toISOString().slice(0, 10),
          source: newItem.source || 'vtat',
          seller_name: newItem.source === 'reseller' ? newItem.seller_name.trim() : undefined,
          seller_phone: newItem.source === 'reseller' ? newItem.seller_phone.trim() : undefined,
          seller_note: newItem.source === 'reseller' ? newItem.seller_note.trim() : undefined,
          components,
          tested_before_import: true,
          image_urls: newItemImages,
          original_price: orig,
          sale_price: sale,
          price: effectivePrice,
          retail_price: effectivePrice,
          stock_quantity: 1,
          quantity: 1,
          shelf_location: newItem.shelf_location,
          qc_status: 'ready_to_sell',
          warranty_months: Number(newItem.warranty_months),
          specs_summary: `${newItem.cpu} | ${newItem.ram} | SSD ${newItem.ssd_capacity} (${health}%)`,
        });
        if (!added) failedCount += 1;
      }

      // Ghi DB thất bại thì KHÔNG báo thành công, KHÔNG đóng form để nhập lại.
      if (failedCount > 0) {
        setActionNotice(`Không lưu được ${failedCount}/${batchUnits.length} máy vào kho (lỗi ghi dữ liệu), vui lòng thử lại!`);
        setTimeout(() => setActionNotice(null), 8000);
        return;
      }

      setIsAddModalOpen(false);
      setActionNotice(`Đã nhập ${batchUnits.length} máy vào kho!`);
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
        source: 'vtat',
        seller_name: '',
        seller_phone: '',
        seller_note: '',
        original_price: 4850000,
        sale_price: 0,
        price: 4850000,
        stock_quantity: 1,
        shelf_location: 'Kệ A1-01',
        qc_status: 'ready_to_sell',
        warranty_months: 6,
      });
      setBatchUnits([blankBatchUnit()]);
      setNewItemImages([]);
      setImageUploadError(null);
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
        warranty_type: newPartWarrantyType,
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
        warranty_months: 6,
        distributor: 'Chính hãng',
        unit_cost: 450000,
        original_price: 650000,
        sale_price: 0,
        unit_price: 650000,
        shelf_location: 'Kệ Linh Kiện L1',
        notes: 'Mới 100% nguyên seal',
      });
      setNewPartWarrantyType('months');
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
        `"${item.warranty_type === 'manufacturer' ? 'Theo nhà sản xuất' : `${item.warranty_months || 0} tháng`}"`,
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
        `"${m.warranty_type === 'manufacturer' ? 'Theo nhà sản xuất' : `${m.warranty_months || 0} tháng`}"`,
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
            {activeTab === 'may-bo' && `Kho Máy Bộ (${stats.mayBoTotal} máy)`}
            {activeTab === 'laptop' && `Kho Laptop (${stats.laptopTotal} laptop)`}
            {activeTab === 'sold' && `Máy Đã Bán & Bảo Hành (${stats.sold} máy)`}
            {activeTab === 'components' && `Kho Linh Kiện (${spareParts.length} mục)`}
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
          {(activeTab === 'may-bo' || activeTab === 'laptop') && canAddMachine() && (
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
          <span>Máy bộ</span>
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
          <span>Laptop</span>
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
          <span>Linh kiện</span>
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
          <span>
          {currentUser.role === 'salesman'
            ? `Tài khoản ${currentUser.name} (NVKD) — Được bán máy/linh kiện, nhập máy mới và xin key; không sửa giá, xóa hay đổi trạng thái QC.`
            : `Tài khoản ${currentUser.name} (${currentUser.role === 'technician' ? 'Kỹ thuật' : 'Kinh doanh'}) — Chỉ xem tồn kho, quyền sửa dành cho Admin.`}
        </span>
        </div>
      )}

      {/* (Đã bỏ hàng thẻ KPI: số lượng theo trạng thái đã hiển thị ở
          tab điều hướng và chip lọc ngay dưới đây — tránh lặp 3 lần.) */}

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
              { id: 'sold', label: `Đã bán (${stats.sold})` },
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
                <th className="py-3 px-4">Model & Kiểu Dáng</th>
                <th className="py-3 px-4">Serial Number (S/N) / Tag</th>
                <th className="py-3 px-4 text-right">Giá Bán</th>
                <th className="py-3 px-4">Trạng Thái QC</th>
                <th className="py-3 px-4 text-center">Định Danh / Tồn</th>
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
                machineDisplayRows.map((row) => {
                  if (row.kind === 'group') {
                    const open = isMachineGroupOpen(row.key, row.size);
                    return (
                      <tr
                        key={row.key}
                        className={`transition-colors border-y border-slate-200/80 ${
                          row.isQcBucket ? 'bg-amber-50/70 hover:bg-amber-50' : 'bg-blue-50/60 hover:bg-blue-50'
                        }`}
                      >
                        <td colSpan={6} className="py-2.5 px-4">
                          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
                            <button
                              type="button"
                              onClick={() => toggleMachineGroup(row.key, row.size)}
                              className="flex items-center gap-2 text-left cursor-pointer group"
                              title={open ? 'Thu gọn dòng máy này' : 'Mở rộng xem từng máy'}
                            >
                              <span
                                className={`inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold transition-transform ${
                                  row.isQcBucket
                                    ? 'bg-amber-100 text-amber-700 border border-amber-300'
                                    : 'bg-blue-100 text-blue-700 border border-blue-300'
                                } ${open ? 'rotate-90' : ''}`}
                              >
                                ›
                              </span>
                              <span className="text-sm font-bold text-slate-900 group-hover:text-blue-800">
                                {row.model}
                              </span>
                              {row.config && (
                                <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                                  {row.config}
                                </span>
                              )}
                            </button>

                            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
                              {row.readyCount > 0 && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono">
                                  Sẵn bán {row.readyCount}
                                </span>
                              )}
                              {row.reservedCount > 0 && (
                                <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200 font-mono">
                                  Đang đợi {row.reservedCount}
                                </span>
                              )}
                              {row.testingCount > 0 && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 font-mono">
                                  Đang QC {row.testingCount}
                                </span>
                              )}
                              <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono">
                                Tổng cấu hình: {row.totalQty} máy
                              </span>
                              {row.size === 1 && row.totalQty > 1 && canEditStock() && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (row.firstItem) handleSplitBatch(row.firstItem);
                                  }}
                                  title="Tách lô gộp nhiều máy chung 1 S/N thành từng máy độc lập"
                                  className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-600 text-white font-bold cursor-pointer text-[11px] shadow-2xs"
                                >
                                  ⚠️ Lô {row.totalQty} máy chung S/N • Bấm tách ngay
                                </button>
                              )}
                              {row.size > 1 && (
                                <button
                                  type="button"
                                  onClick={() => toggleMachineGroup(row.key, row.size)}
                                  className="px-2 py-0.5 rounded border border-slate-300 bg-white text-slate-600 hover:text-blue-700 hover:border-blue-300 font-semibold cursor-pointer"
                                >
                                  {open ? 'Thu gọn' : `Xem chi tiết ${row.size} máy`}
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                  const item = row.item;
                  const isReady = item.qc_status === 'ready_to_sell';
                  const isTesting = item.qc_status === 'testing';
                  const isReserved = item.qc_status === 'reserved';
                  const daysInStock = calculateDaysInStock(item, nowTimestamp);
                  const isYellowAging = daysInStock >= 50 && daysInStock < 56 && item.qc_status !== 'sold' && !isReserved;
                  const isRedAging = daysInStock >= 56 && item.qc_status !== 'sold' && !isReserved;
                  const currentItemStock = Math.max(0, item.stock_quantity ?? item.quantity ?? 1);
                  const effectivePrice = item.sale_price && item.sale_price > 0 ? item.sale_price : ((item.original_price || item.price) ?? item.retail_price ?? 0);

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
                        {item.source === 'reseller' &&
                          item.qc_status !== 'sold' &&
                          item.qc_status !== 'dealer_sold' && (
                            <div className="mt-1.5">
                              <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  daysInStock >= 7
                                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                    : 7 - daysInStock <= 2
                                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                      : 'bg-sky-50 text-sky-700 border border-sky-200'
                                }`}
                                title="Hàng Reseller: tự động xoá khỏi kho sau 7 ngày kể từ ngày nhập nếu chưa bán"
                              >
                                {daysInStock >= 7
                                  ? 'RESELLER · QUÁ HẠN 7 NGÀY — SẮP TỰ XOÁ'
                                  : `RESELLER · CÒN ${7 - daysInStock} NGÀY`}
                              </span>
                            </div>
                          )}
                        {item.source === 'reseller' && item.seller_name && (
                          <div className="mt-1 text-[11px] text-slate-600">
                            Người bán: <strong>{item.seller_name}</strong>
                            {item.seller_phone && (
                              <>
                                {' '}•{' '}
                                <a
                                  href={`tel:${item.seller_phone}`}
                                  className="font-mono text-blue-700 hover:underline"
                                >
                                  {item.seller_phone}
                                </a>
                              </>
                            )}
                          </div>
                        )}
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

                      {/* Serial Number & Device Identity */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
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
                          {item.ssd_health !== undefined && (
                            <span className="text-[10px] font-mono text-slate-500">
                              SSD Health:{' '}
                              <strong className={item.ssd_health >= 90 ? 'text-emerald-700' : 'text-amber-700'}>
                                {item.ssd_health}%
                              </strong>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Price Column */}
                      <td className="py-3.5 px-4 text-right">
                        {item.sale_price && item.sale_price > 0 && (item.original_price || item.price) && (item.original_price || item.price)! > item.sale_price ? (
                          <div>
                            <div className="font-bold text-blue-700 font-mono text-xs">
                              {item.sale_price.toLocaleString('vi-VN')}₫
                            </div>
                            <div className="text-[10px] text-slate-400 line-through font-mono">
                              {((item.original_price || item.price) ?? 0).toLocaleString('vi-VN')}₫
                            </div>
                          </div>
                        ) : (
                          <div className="font-bold text-slate-900 font-mono text-xs">
                            {effectivePrice.toLocaleString('vi-VN')}₫
                          </div>
                        )}
                      </td>

                      {/* QC Status — máy đã bán: chỉ xem (khóa select); NVKD cũng chỉ xem (không đổi QC) */}
                      <td className="py-3.5 px-4">
                        {canUpdateRepairStatus() && currentUser.role !== 'salesman' && item.qc_status !== 'sold' ? (
                          <select
                            value={item.qc_status}
                            onChange={(e) => {
                              const val = e.target.value as InventoryItem['qc_status'];
                              if (val === 'dealer_sold') {
                                handleMarkDealerSold(item);
                              } else {
                                updateQcStatus(item.id, val);
                              }
                            }}
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
                            <option value="sold">Đã bán (Shop)</option>
                            <option value="dealer_sold">Đã bán bởi dealer (Gỡ máy)</option>
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
                            {isReserved
                              ? 'Đang đợi bán'
                              : isReady
                              ? 'Sẵn sàng bán'
                              : isTesting
                              ? 'Đang kiểm tra'
                              : 'Đã bán'}
                          </span>
                        )}
                      </td>

                      {/* Machine Identity & Stock Column (1 máy = 1 Serial Number) */}
                      <td className="py-3.5 px-4 text-center">
                        {currentItemStock > 1 ? (
                          <div className="inline-flex flex-col items-center gap-1">
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold font-mono"
                              title="Lỗi dữ liệu cũ: 1 số Serial nhưng lại lưu số lượng nhiều máy"
                            >
                              ⚠️ {currentItemStock} máy / 1 S/N
                            </span>
                            {canEditStock() && (
                              <button
                                type="button"
                                onClick={() => handleSplitBatch(item)}
                                title="Bấm để tách thành từng máy riêng biệt, mỗi máy có 1 S/N và Tag riêng"
                                className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold transition-all shadow-2xs cursor-pointer"
                              >
                                Tách {currentItemStock} máy riêng →
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-md text-slate-700 text-xs font-semibold font-mono">
                            <span>1 máy</span>
                            <span className="text-[10px] text-slate-400 font-normal">(Đơn chiếc)</span>
                          </div>
                        )}
                      </td>

                      {/* Actions: máy đã bán bị khóa mọi thao tác (xem trong tab Đã bán) */}
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

                          {/* Edit Price Button (Admin & Sales) — khóa với máy đã bán */}
                          {canSellAndEditWarranty() && item.qc_status !== 'sold' && item.qc_status !== 'dealer_sold' && (
                            <button
                              onClick={() => setEditingPriceMachine(item)}
                              title="Chỉnh sửa giá gốc và giá giảm của máy"
                              className="px-2 py-1 text-slate-700 hover:text-blue-700 hover:bg-blue-50 rounded-lg text-xs font-semibold transition-colors border border-slate-200 bg-white flex items-center gap-1 shadow-2xs"
                            >
                              <Tag className="w-3.5 h-3.5 text-blue-600" />
                              Sửa giá
                            </button>
                          )}

                          {/* Sale Handover Button (Admin, Sales & NVKD) — khóa với máy đã bán */}
                          {canSell() && item.qc_status !== 'sold' && (
                            <button
                              onClick={() => handleOpenSellModal(item)}
                              title={
                                item.qc_status === 'dealer_sold'
                                  ? 'Hàng trading đã bán bởi dealer (Không ghi nhận doanh thu)'
                                  : 'Xuất bán máy, cấp mã KH & điều chỉnh bảo hành'
                              }
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                                item.qc_status === 'dealer_sold'
                                  ? 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
                                  : isReserved
                                  ? 'bg-purple-600 hover:bg-purple-700 text-white border-purple-700 shadow-xs'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300 shadow-xs'
                              }`}
                            >
                              {item.qc_status === 'dealer_sold'
                                ? 'Dealer đã bán'
                                : isReserved
                                ? 'Bán máy'
                                : 'Bán máy'}
                            </button>
                          )}

                          {/* Admin Only Delete — khóa với máy đã bán */}
                          {canEditStock() && item.qc_status !== 'sold' && (
                            <button
                              onClick={() => handleDeleteItem(item.id, item.service_tag)}
                              title="Xóa máy khỏi kho (Chỉ Admin)"
                              className="px-2 py-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Xóa
                            </button>
                          )}
                          {(item.qc_status === 'sold' || item.qc_status === 'dealer_sold') && (
                            <span className="text-[11px] text-slate-400 font-mono">Đã khóa thao tác</span>
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
      {/* TAB: MÁY ĐÃ BÁN & BẢO HÀNH THỜI GIAN THỰC (chỉ xem + Admin đổi NV phụ trách) */}
      {/* ========================================================================= */}
      {activeTab === 'sold' && (
        <SoldInventoryTab
          soldMachines={soldMachines}
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
                              {part.warranty_type === 'manufacturer' ? 'Theo NSX' : `${part.warranty_months} tháng`}
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
                              {canSell() && (
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
          <div className="bg-white w-full max-w-3xl max-h-[94vh] flex flex-col rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900">Nhập máy mới</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Cùng 1 dòng máy / cấu hình — S/N và sức khỏe SSD nhập riêng cho từng máy.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 text-base font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewItem} className="p-4 space-y-3 overflow-y-auto min-h-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Brand */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-0.5">
                    Thương Hiệu
                  </label>
                  <select
                    value={newItem.brand}
                    onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-[13px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                  <label className="block text-xs font-semibold text-slate-700 mb-0.5">
                    Model Máy *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: OptiPlex 7070 SFF"
                    value={newItem.model}
                    onChange={(e) => setNewItem({ ...newItem, model: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-[13px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Form factor */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-0.5">
                    Kích Thước Case
                  </label>
                  <select
                    value={newItem.form_factor}
                    onChange={(e) => setNewItem({ ...newItem, form_factor: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-[13px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="SFF">SFF (Small Form Factor)</option>
                    <option value="Mini / Micro">Mini / Micro PC</option>
                    <option value="Tower / MT">Thùng lớn (Tower)</option>
                    <option value="Laptop">Laptop</option>
                  </select>
                </div>

                {/* CPU */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-0.5">
                    Vi Xử Lý (CPU)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: i5-8500"
                    value={newItem.cpu}
                    onChange={(e) => setNewItem({ ...newItem, cpu: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-[13px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* RAM */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-0.5">
                    Bộ Nhớ RAM
                  </label>
                  <input
                    type="text"
                    placeholder="VD: 16GB DDR4"
                    value={newItem.ram}
                    onChange={(e) => setNewItem({ ...newItem, ram: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-[13px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* SSD Capacity */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-0.5">
                    Ổ Cứng SSD
                  </label>
                  <input
                    type="text"
                    placeholder="VD: 256GB NVMe"
                    value={newItem.ssd_capacity}
                    onChange={(e) => setNewItem({ ...newItem, ssd_capacity: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-[13px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Số lượng máy trong lô */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-0.5">
                    Số Lượng Máy Trong Lô *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={batchUnits.length}
                    onChange={(e) => setBatchQty(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-[13px] focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                  />
                </div>


                {/* Danh sách từng máy trong lô: S/N máy + % sức khỏe SSD + xác nhận test */}
                <div className="md:col-span-3 p-3 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900">
                      S/N máy, % sức khỏe SSD &amp; xác nhận test từng máy
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">{batchUnits.length} máy</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    S/N máy là mã quản lý chính. Chỉ nhập % sức khỏe SSD — RAM và nguồn mặc định
                    là tốt. Máy nào chưa tick “Đã test” sẽ không lưu được.
                  </p>
                  {batchUnits.map((unit, idx) => (
                    <div key={idx} className="space-y-1.5 rounded-lg border border-indigo-100 bg-white/70 p-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 text-[11px] font-mono font-bold text-slate-500 shrink-0">#{idx + 1}</span>
                        <input
                          type="text"
                          value={unit.serialNumber}
                          onChange={(e) => updateBatchUnit(idx, { serialNumber: e.target.value })}
                          placeholder={`S/N máy ${idx + 1} (mã quản lý chính của máy)`}
                          className="flex-1 min-w-0 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono bg-white focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                        />
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={unit.ssdHealth}
                          onChange={(e) => updateBatchUnit(idx, { ssdHealth: Number(e.target.value) })}
                          title="Sức khỏe SSD (%)"
                          className="w-20 px-2 py-1.5 border border-slate-300 rounded-lg text-xs font-mono bg-white focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                        />
                        <span className="text-[11px] text-slate-400 font-mono shrink-0">SSD %</span>
                        <label className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 cursor-pointer select-none shrink-0">
                          <input
                            type="checkbox"
                            checked={unit.tested}
                            onChange={(e) => updateBatchUnit(idx, { tested: e.target.checked })}
                            className="w-3.5 h-3.5 accent-emerald-600"
                          />
                          ✓ Đã test
                        </label>
                        {batchUnits.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeBatchUnit(idx)}
                            title="Xóa máy này khỏi lô"
                            className="text-slate-400 hover:text-rose-600 text-xs font-bold px-1 shrink-0"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addBatchUnit}
                    className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900"
                  >
                    + Thêm 1 máy vào lô
                  </button>
                </div>

                {/* Hình ảnh máy trong lô */}
                <div className="md:col-span-3 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-800">
                    Hình Ảnh Máy (ảnh chụp thực tế của lô máy này)
                  </span>
                  {newItemImages.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {newItemImages.map((url, i) => (
                        <div key={url} className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt={`Ảnh máy ${i + 1}`}
                            className="h-20 w-20 object-cover rounded-lg border border-slate-300"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewItemImage(i)}
                            title="Gỡ ảnh này"
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-bold leading-none shadow"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      multiple
                      disabled={isUploadingImage}
                      onChange={(e) => {
                        handleNewItemImageUpload(e.target.files);
                        e.target.value = '';
                      }}
                      className="text-xs text-slate-600 file:mr-2 file:px-3 file:py-1 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:text-xs file:font-bold hover:file:bg-blue-700 disabled:opacity-50"
                    />
                    {isUploadingImage && (
                      <span className="text-[11px] text-slate-500">Đang tải lên...</span>
                    )}
                    {imageUploadError && (
                      <span className="text-[11px] font-semibold text-rose-700">{imageUploadError}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Tối đa 4MB/ảnh (PNG/JPG/WebP). Ảnh tự động nén về tối đa 1600px khi tải
                    lên để nhẹ hệ thống. Ảnh lưu chung cho các máy trong lô này.
                  </p>
                </div>

                {/* Giá đầu vào (vốn nhập kho) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-0.5">
                    Giá Đầu Vào (VNĐ)
                  </label>
                  {/* Ô nhập để TRƯỚC, dòng đọc giá để dưới — để ô nhập ngang
                      hàng với ô Ngày Nhập/Nguồn Nhập cùng hàng */}
                  <input
                    type="number"
                    min={0}
                    step={50000}
                    value={newItem.import_price === 0 ? '' : newItem.import_price}
                    placeholder="Nhập giá mua vào..."
                    onChange={(e) =>
                      setNewItem({ ...newItem, import_price: e.target.value === '' ? 0 : Number(e.target.value) })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-[13px] focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                  <PricePreview value={newItem.import_price} label="Giá đầu vào" tone="rose" />
                </div>

                {/* Ngày Nhập Hàng */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-0.5">
                    Ngày Nhập Hàng *
                  </label>
                  <input
                    type="date"
                    required
                    value={newItem.import_date}
                    onChange={(e) => setNewItem({ ...newItem, import_date: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-[13px] focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono font-medium text-slate-800"
                  />
                </div>

                {/* Nguồn Nhập: Kho VTAT (không thời hạn) / Reseller (tự xoá sau 7 ngày) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-0.5">
                    Nguồn Nhập *
                  </label>
                  <select
                    value={newItem.source}
                    onChange={(e) => setNewItem({ ...newItem, source: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-[13px] focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-slate-800 bg-white"
                  >
                    <option value="vtat">Kho VTAT (không thời hạn)</option>
                    <option value="reseller">Reseller (tự xoá khỏi kho sau 7 ngày)</option>
                  </select>
                  {newItem.source === 'reseller' && (
                    <p className="text-[11px] text-amber-700 mt-1">
                      Máy Reseller chưa bán sẽ <strong>tự động xoá khỏi kho sau 7 ngày</strong> kể
                      từ ngày nhập (máy đang giữ cho khách/đã bán không bị xoá).
                    </p>
                  )}
                </div>

                {/* Thông tin người bán — chỉ hiện khi nguồn Reseller */}
                {newItem.source === 'reseller' && (
                  <div className="md:col-span-3 p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                    <span className="text-xs font-bold text-amber-900">
                      Thông Tin Người Bán (Reseller) — để liên hệ khi cần
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                          Tên người bán *
                        </label>
                        <input
                          type="text"
                          value={newItem.seller_name}
                          onChange={(e) => setNewItem({ ...newItem, seller_name: e.target.value })}
                          placeholder="VD: Anh Tuấn — Cửa hàng ABC"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-[13px] bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                          SĐT liên hệ *
                        </label>
                        <input
                          type="tel"
                          value={newItem.seller_phone}
                          onChange={(e) => setNewItem({ ...newItem, seller_phone: e.target.value })}
                          placeholder="VD: 0909..."
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-[13px] font-mono bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                        Ghi chú liên hệ
                      </label>
                      <input
                        type="text"
                        value={newItem.seller_note}
                        onChange={(e) => setNewItem({ ...newItem, seller_note: e.target.value })}
                        placeholder="VD: Zalo cùng số — liên hệ giờ hành chính, địa chỉ kho..."
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-[13px] bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Giá Gốc & Giá Giảm */}
                <div className="md:col-span-3 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
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
                      <div className="flex items-center justify-between mb-0.5">
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
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-[13px] font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    {/* Giá Giảm */}
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
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
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-[13px] font-mono font-bold text-rose-600 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      />
                    </div>
                  </div>

                </div>

                {/* Giá hiển thị thực tế — nằm bên DƯỚI và NGOÀI khung giá bán,
                    không đóng khung để không nhầm với ô nhập liệu; chưa nhập
                    giá bán nào thì hiện 'Chưa có' */}
                <div className="md:col-span-3 flex items-center justify-between text-xs px-1 -mt-1">
                  <span className="text-slate-500 font-medium">Giá hiển thị thực tế:</span>
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
                    <span className="font-semibold text-slate-400">Chưa có</span>
                  ) : (
                    <span className="font-bold text-slate-900 font-mono text-sm">
                      {formatMoney(newItem.original_price)}
                    </span>
                  )}
                </div>

              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
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
                  Lưu máy mới ({batchUnits.length} máy)
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
                    {sellingItem.qc_status !== 'sold' && (
                      <span>
                        Tồn kho: <strong className="text-emerald-700 font-mono">{sellingItem.stock_quantity ?? sellingItem.quantity ?? 1} máy</strong>
                      </span>
                    )}
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

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi Chú</label>
                    <input
                      type="text"
                      value={sellNotes}
                      onChange={(e) => setSellNotes(e.target.value)}
                      placeholder="Ghi chú thêm cho đơn bán (nếu có)..."
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
                      value={sellWarrantyType === 'manufacturer' ? 'manufacturer' : 'months:6'}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === 'manufacturer') {
                          setSellWarrantyType('manufacturer');
                        } else {
                          setSellWarrantyType('months');
                          setSellWarrantyMonths(6);
                        }
                      }}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-700"
                    >
                      <option value="months:6">6 Tháng</option>
                      <option value="manufacturer">Theo nhà sản xuất</option>
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
                      readOnly={!canSellAndEditWarranty()}
                      onChange={(e) => setSellPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold font-mono"
                    />
                    {!canSellAndEditWarranty() && (
                      <span className="text-[10px] text-slate-500 mt-0.5 block">Giá niêm yết (NVKD không chỉnh sửa được)</span>
                    )}
                  </div>
                </div>

                {/* SALE QUANTITY (lô nhiều máy) */}
                {sellingItem.qc_status !== 'sold' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Số Lượng Bán (Tối đa {sellingItem.stock_quantity ?? sellingItem.quantity ?? 1} máy) *
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        max={sellingItem.stock_quantity ?? sellingItem.quantity ?? 1}
                        value={sellQuantity}
                        onChange={(e) => setSellQuantity(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold font-mono"
                      />
                      <span className="block text-[11px] text-slate-500 mt-1">
                        Sau khi bán còn lại:{' '}
                        {Math.max(
                          0,
                          (sellingItem.stock_quantity ?? sellingItem.quantity ?? 1) - (sellQuantity || 0)
                        )}{' '}
                        máy trong kho
                      </span>
                    </div>
                    <div className="flex items-end">
                      <div className="w-full p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
                        <span className="text-emerald-700 font-semibold">Tổng tiền {sellQuantity || 0} máy:</span>
                        <div className="font-bold text-emerald-800 font-mono mt-0.5">
                          {((sellPrice || 0) * (sellQuantity || 0)).toLocaleString('vi-VN')} đ
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Live Warranty Calculation */}
                <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-600 font-medium">
                    Kích hoạt BH: <strong className="text-slate-900 font-mono">{sellDate ? new Date(sellDate).toLocaleDateString('vi-VN') : '—'}</strong>
                  </span>
                  <span className="text-blue-800 font-semibold">
                    {sellWarrantyType === 'manufacturer' ? (
                      'Bảo hành theo nhà sản xuất'
                    ) : (
                      <>Hết hạn BH: <strong className="text-blue-700 font-mono">{calculateWarrantyEndDate(sellDate, sellWarrantyMonths) || '—'}</strong></>
                    )}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => handleMarkDealerSold(sellingItem)}
                  title="Sản phẩm trading lấy thông tin từ dealer, dealer đã bán mất máy nên không cộng doanh thu"
                  className="w-full sm:w-auto px-3.5 py-2 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Ban className="w-3.5 h-3.5 text-orange-600" />
                  <span>Đã Bán Bởi Dealer (Trading)</span>
                </button>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setSellingItem(null)}
                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Tiếp tục: Xem phân bổ dòng tiền</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP THỐNG KÊ DÒNG TIỀN KHI XÁC NHẬN BÁN MÁY */}
      {cashflowConfirmData && (() => {
        const item = cashflowConfirmData.item;
        const soldPrice = cashflowConfirmData.soldPrice;
        const costPrice = cashflowConfirmData.costPrice;
        const profit = soldPrice - costPrice; // Lợi nhuận = giá bán ra - giá nhập
        const isProfitable = profit > 0;

        // 1. Tiền cho người bán (10% lợi nhuận)
        const sellerCommission = isProfitable ? Math.round(profit * 0.10) : 0;
        // 2. Thưởng người cho vay vốn (5% lợi nhuận)
        const lenderBonus = isProfitable ? Math.round(profit * 0.05) : 0;
        // Tiền hoàn người cho vay vốn (tiền vốn nhập + 5% lợi nhuận)
        const lenderTotal = costPrice + lenderBonus;
        // 3. 5% tiền trích lập dự phòng
        const warrantyReserve = isProfitable ? Math.round(profit * 0.05) : 0;
        // 4. Lợi nhuận còn lại (80% lợi nhuận)
        const remainingProfit = isProfitable
          ? profit - sellerCommission - lenderBonus - warrantyReserve
          : profit;

        return (
          <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-4 my-8">
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Coins className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>Thống Kê Dòng Tiền &amp; Xác Nhận Bán Máy</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Kiểm tra phân bổ dòng tiền bán máy trước khi xuất kho chính thức
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCashflowConfirmData(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors text-base font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Thông tin thiết bị & khách hàng */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Thiết bị</div>
                  <div className="font-bold text-slate-800 text-sm mt-0.5">
                    {item.brand} {item.device_model || item.model} ({item.form_factor})
                  </div>
                  <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                    Tag: <strong className="text-blue-700">{item.service_tag}</strong> • Serial: <strong className="text-slate-700">{cashflowConfirmData.serialNumber}</strong>
                  </div>
                </div>
                <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Khách mua hàng</div>
                  <div className="font-bold text-slate-800 text-sm mt-0.5">
                    {cashflowConfirmData.customerName}
                  </div>
                  <div className="text-slate-600 font-mono text-[11px] mt-0.5">
                    SĐT: {cashflowConfirmData.customerPhone}
                  </div>
                </div>
              </div>

              {/* 3 Chỉ số nền tảng: Giá bán ra - Giá vốn nhập - Lợi nhuận gộp */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                  <span className="text-[11px] text-blue-700 font-semibold uppercase tracking-wider block">
                    1. Giá Bán Ra
                  </span>
                  <div className="text-lg font-black text-blue-800 font-mono mt-1">
                    {soldPrice.toLocaleString('vi-VN')} ₫
                  </div>
                  <span className="text-[10px] text-blue-600 mt-0.5 block">Tổng thu từ khách hàng</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-600 font-semibold uppercase tracking-wider block">
                      2. Giá Vốn Nhập
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Tự động lấy</span>
                  </div>
                  <div className="mt-1">
                    <input
                      type="number"
                      step={50000}
                      min={0}
                      readOnly={!canSellAndEditWarranty()}
                      value={cashflowConfirmData.costPrice}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 0;
                        setCashflowConfirmData((prev) => (prev ? { ...prev, costPrice: val } : null));
                      }}
                      className="w-full px-2 py-1 text-base font-black text-slate-800 font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title={canSellAndEditWarranty() ? 'Bạn có thể điều chỉnh giá vốn nếu máy chưa có giá vốn ban đầu' : 'Giá vốn từ kho (NVKD không chỉnh sửa được)'}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">{canSellAndEditWarranty() ? 'Có thể chỉnh nhanh nếu cần' : 'Giá vốn từ kho (NVKD không chỉnh sửa được)'}</span>
                </div>

                <div className={`p-3 border rounded-xl ${
                  isProfitable ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50/70 border-rose-200'
                }`}>
                  <span className={`text-[11px] font-semibold uppercase tracking-wider block ${
                    isProfitable ? 'text-emerald-700' : 'text-rose-700'
                  }`}>
                    3. Lợi Nhuận Gộp
                  </span>
                  <div className={`text-lg font-black font-mono mt-1 ${
                    isProfitable ? 'text-emerald-800' : 'text-rose-700'
                  }`}>
                    {profit.toLocaleString('vi-VN')} ₫
                  </div>
                  <span className={`text-[10px] mt-0.5 block ${
                    isProfitable ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    = Giá bán ra - Giá vốn nhập
                  </span>
                </div>
              </div>

              {/* 4 Khoản phân bổ dòng tiền theo đúng yêu cầu */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Chi Tiết 4 Khoản Phân Bổ Dòng Tiền</span>
                  <span className="text-[11px] text-slate-500 lowercase font-normal">
                    (tính trên lợi nhuận {profit > 0 ? profit.toLocaleString('vi-VN') + ' ₫' : '0 ₫'})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Khoản 1: Người bán 10% LN */}
                  <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                        <User className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Tiền cho người bán</span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono">
                        10% LN
                      </span>
                    </div>
                    <div className="text-base font-black text-indigo-950 font-mono">
                      {sellerCommission.toLocaleString('vi-VN')} ₫
                    </div>
                    <p className="text-[11px] text-indigo-700">
                      Hoa hồng cho nhân viên tư vấn &amp; chốt đơn
                    </p>
                  </div>

                  {/* Khoản 2: Hoàn người cho vay vốn (Vốn + 5% LN) */}
                  <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                        <Landmark className="w-3.5 h-3.5 text-amber-600" />
                        <span>Tiền hoàn người cho vay vốn</span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono">
                        Vốn + 5% LN
                      </span>
                    </div>
                    <div className="text-base font-black text-amber-950 font-mono">
                      {lenderTotal.toLocaleString('vi-VN')} ₫
                    </div>
                    <p className="text-[11px] text-amber-800">
                      Vốn gốc: {costPrice.toLocaleString('vi-VN')}₫ + Thưởng 5% LN: {lenderBonus.toLocaleString('vi-VN')}₫
                    </p>
                  </div>

                  {/* Khoản 3: 5% trích lập dự phòng */}
                  <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900">
                        <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                        <span>5% trích lập dự phòng</span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-mono">
                        5% LN
                      </span>
                    </div>
                    <div className="text-base font-black text-rose-950 font-mono">
                      {warrantyReserve.toLocaleString('vi-VN')} ₫
                    </div>
                    <p className="text-[11px] text-rose-700">
                      Quỹ dự phòng rủi ro bảo hành thiết bị
                    </p>
                  </div>

                  {/* Khoản 4: Lợi nhuận còn lại */}
                  <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Lợi nhuận còn lại</span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
                        80% LN
                      </span>
                    </div>
                    <div className="text-base font-black text-emerald-950 font-mono">
                      {remainingProfit.toLocaleString('vi-VN')} ₫
                    </div>
                    <p className="text-[11px] text-emerald-700">
                      Lợi nhuận ròng giữ lại cho cửa hàng
                    </p>
                  </div>
                </div>
              </div>

              {/* Thanh kiểm toán cân đối dòng tiền */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600 flex items-center gap-1">
                    <span>Tổng dòng tiền phân bổ:</span>
                    <strong className="text-slate-900 font-mono">{soldPrice.toLocaleString('vi-VN')} ₫</strong>
                  </span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <span>✓ Khớp 100% dòng tiền</span>
                  </span>
                </div>
                {/* Visual stacked bar */}
                <div className="w-full h-2.5 rounded-full overflow-hidden bg-slate-200 flex">
                  {soldPrice > 0 && (
                    <>
                      <div
                        style={{ width: `${Math.max(4, (lenderTotal / soldPrice) * 100)}%` }}
                        className="bg-amber-500 h-full transition-all"
                        title={`Hoàn vốn vay: ${lenderTotal.toLocaleString('vi-VN')}₫`}
                      />
                      <div
                        style={{ width: `${Math.max(4, (sellerCommission / soldPrice) * 100)}%` }}
                        className="bg-indigo-500 h-full transition-all"
                        title={`Người bán: ${sellerCommission.toLocaleString('vi-VN')}₫`}
                      />
                      <div
                        style={{ width: `${Math.max(3, (warrantyReserve / soldPrice) * 100)}%` }}
                        className="bg-rose-500 h-full transition-all"
                        title={`Quỹ dự phòng: ${warrantyReserve.toLocaleString('vi-VN')}₫`}
                      />
                      <div
                        style={{ width: `${Math.max(4, (remainingProfit / soldPrice) * 100)}%` }}
                        className="bg-emerald-500 h-full transition-all"
                        title={`Lợi nhuận còn lại: ${remainingProfit.toLocaleString('vi-VN')}₫`}
                      />
                    </>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 pt-0.5 font-mono">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Hoàn người vay vốn
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" /> Người bán (10%)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Dự phòng (5%)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> LN còn lại (80%)
                  </span>
                </div>
              </div>

              {/* Nút hành động */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCashflowConfirmData(null)}
                  className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  ← Quay lại chỉnh sửa
                </button>
                <button
                  type="button"
                  disabled={isSubmittingSale}
                  onClick={handleFinalizeSale}
                  className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingSale ? (
                    <span>Đang hoàn tất...</span>
                  ) : (
                    <>
                      <span>Xác Nhận &amp; Xuất Bán Ngay</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

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
                      value={sellPartWarrantyType === 'manufacturer' ? 'manufacturer' : `months:${sellPartWarrantyMonths}`}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === 'manufacturer') {
                          setSellPartWarrantyType('manufacturer');
                        } else {
                          setSellPartWarrantyType('months');
                          setSellPartWarrantyMonths(Number(v.replace('months:', '')));
                        }
                      }}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-700"
                    >
                      <option value="months:3">3 Tháng</option>
                      <option value="months:6">6 Tháng</option>
                      <option value="manufacturer">Theo nhà sản xuất</option>
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
                    onClick={() => { setNewPart({ ...newPart, condition: 'new', warranty_months: 6 }); setNewPartWarrantyType('months'); }}
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
                        Chính hãng (6 tháng hoặc theo NSX)
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setNewPart({ ...newPart, condition: 'used', warranty_months: 3 }); setNewPartWarrantyType('months'); }}
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
                        Đã test QC (3 tháng hoặc theo NSX)
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
                    Bảo Hành *
                  </label>
                  <select
                    value={newPartWarrantyType === 'manufacturer' ? 'manufacturer' : `months:${newPart.warranty_months}`}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === 'manufacturer') {
                        setNewPartWarrantyType('manufacturer');
                        setNewPart({ ...newPart, warranty_months: 0 });
                      } else {
                        setNewPartWarrantyType('months');
                        setNewPart({ ...newPart, warranty_months: Number(v.replace('months:', '')) });
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-emerald-800"
                  >
                    <option value="months:3">3 Tháng</option>
                    <option value="months:6">6 Tháng</option>
                    <option value="manufacturer">Theo nhà sản xuất</option>
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
                  {viewingSpecsItem.warranty_type === 'manufacturer' ? (<span>Bảo hành: <strong>Theo nhà sản xuất</strong></span>) : (<span>Bảo hành: <strong>{viewingSpecsItem.warranty_months} tháng</strong></span>)}
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

              {/* Hình ảnh thực tế của máy */}
              {viewingSpecsItem.image_urls && viewingSpecsItem.image_urls.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 pb-1 border-b border-slate-200">
                    Hình Ảnh Máy
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {viewingSpecsItem.image_urls.map((url, i) => (
                      <a key={url} href={url} target="_blank" rel="noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Ảnh máy ${i + 1}`}
                          className="h-24 w-24 object-cover rounded-lg border border-slate-200 hover:border-blue-400"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Linh kiện trong máy (ghi lúc nhập, sau khi test) */}
              {viewingSpecsItem.components && viewingSpecsItem.components.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 pb-1 border-b border-slate-200 flex items-center justify-between">
                    <span>Linh Kiện Trong Máy</span>
                    {viewingSpecsItem.tested_before_import && (
                      <span className="text-[11px] font-bold text-emerald-700 normal-case">
                        ✓ Đã test trước khi nhập
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {viewingSpecsItem.components.map((c, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <span className="font-bold text-slate-800">
                          {c.type === 'ram' ? 'RAM' : c.type === 'ssd' ? 'SSD' : c.type === 'psu' ? 'Nguồn (PSU)' : 'Linh kiện khác'}
                        </span>
                        <span className="font-mono text-slate-600">
                          {c.serial || c.note || '—'}
                          {c.health !== undefined && ` · Sức khỏe ${c.health}%`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Thông tin người bán — hàng Reseller */}
              {viewingSpecsItem.source === 'reseller' &&
                (viewingSpecsItem.seller_name || viewingSpecsItem.seller_phone) && (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
                    <div className="text-xs font-bold text-amber-900">
                      Người Bán (Reseller) — liên hệ khi cần
                    </div>
                    {viewingSpecsItem.seller_name && (
                      <div>Tên: <strong>{viewingSpecsItem.seller_name}</strong></div>
                    )}
                    {viewingSpecsItem.seller_phone && (
                      <div>
                        SĐT:{' '}
                        <a
                          href={`tel:${viewingSpecsItem.seller_phone}`}
                          className="font-mono font-bold text-blue-700 hover:underline"
                        >
                          {viewingSpecsItem.seller_phone}
                        </a>
                      </div>
                    )}
                    {viewingSpecsItem.seller_note && (
                      <div className="text-slate-600">{viewingSpecsItem.seller_note}</div>
                    )}
                  </div>
                )}

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
                        : viewingSpecsItem.qc_status === 'dealer_sold'
                        ? 'Đã bán bởi dealer (Trading)'
                        : viewingSpecsItem.qc_status === 'ready_to_sell'
                        ? 'Sẵn bán (RTS)'
                        : viewingSpecsItem.qc_status === 'testing'
                        ? 'Đang QC / Test'
                        : 'Đã xuất bán (Shop)'}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Thời gian Burn-in:</span>
                    <div className="font-bold text-slate-800 mt-0.5">
                      {viewingSpecsItem.burn_in_duration || 48} giờ Stress Test
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Định danh máy:</span>
                    <div className="font-bold text-slate-800 mt-0.5 font-mono">
                      {(viewingSpecsItem.stock_quantity ?? viewingSpecsItem.quantity ?? 1) === 1
                        ? '1 máy (Định danh theo S/N riêng)'
                        : `⚠️ ${viewingSpecsItem.stock_quantity ?? viewingSpecsItem.quantity} máy (Đang gộp chung 1 S/N - Cần tách)`}
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
                          return <span className="text-slate-400 font-mono">Đã bán (Shop)</span>;
                        }
                        if (viewingSpecsItem.qc_status === 'dealer_sold') {
                          return <span className="text-orange-600 font-mono font-bold">Dealer đã bán (Trading)</span>;
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
                {viewingSpecsItem.qc_status !== 'sold' && viewingSpecsItem.qc_status !== 'dealer_sold' && (
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
                )}
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

      {/* Modal Định Danh Số Serial (S/N) Khi Tách Lô */}
      {splittingBatchItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-4 sm:px-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-lg">
                  🏷️
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    Định Danh Số Serial (S/N) Cho {splittingUnits.length} Máy
                  </h3>
                  <p className="text-xs text-blue-200 mt-0.5">
                    Model: <strong className="text-white">{splittingBatchItem.brand} {splittingBatchItem.model || splittingBatchItem.device_model}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSplittingBatchItem(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Units Form */}
            <form onSubmit={handleConfirmSplitBatch} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {splittingUnits.map((unit, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all ${
                    idx === 0
                      ? 'bg-slate-50/80 border-slate-200'
                      : 'bg-white border-blue-200 shadow-2xs hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/80">
                    <span className="font-bold text-xs uppercase tracking-wide flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-mono flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-slate-900">Chiếc máy #{idx + 1}</span>
                      {idx === 0 && (
                        <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-700 rounded font-semibold normal-case">
                          Máy gốc hiện tại
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      1 máy vật lý = 1 Serial (S/N)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="sm:col-span-2">
                      <label className="block text-slate-700 font-semibold mb-1">
                        Serial Number (S/N) *
                      </label>
                      <input
                        type="text"
                        required
                        value={unit.serialNumber}
                        placeholder="Quét mã vạch hoặc nhập số S/N..."
                        onChange={(e) => {
                          const val = e.target.value;
                          setSplittingUnits((prev) =>
                            prev.map((u, i) => (i === idx ? { ...u, serialNumber: val, serviceTag: val } : u))
                          );
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold uppercase text-slate-900 focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-1">
                      <label className="block text-slate-700 font-semibold mb-1">
                        Sức khỏe SSD (%)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={unit.ssdHealth}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setSplittingUnits((prev) =>
                            prev.map((u, i) => (i === idx ? { ...u, ssdHealth: val } : u))
                          );
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-emerald-700 focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setSplittingBatchItem(null)}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Hủy Bỏ
                </button>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>✓ Lưu Định Danh S/N &amp; Tách {splittingUnits.length} Máy</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
