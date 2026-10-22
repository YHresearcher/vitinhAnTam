'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useViTinhAnTamStore } from '@/lib/store';
import { KeyCategory, KeyReleaseRequest, LicenseKeyItem } from '@/lib/supabase';
import { PricePreview } from '@/components/PricePreview';

// ===== Nhóm trạng thái (store đang dùng 'approved_waiting_test' / 'active_confirmed') =====
// Chờ xác nhận active sau khi đã LẤY key
const isWaitingTest = (r: KeyReleaseRequest) =>
  r.status === 'approved' || r.status === 'approved_waiting_test';
// Key đã kích hoạt thành công
const isActive = (r: KeyReleaseRequest) =>
  r.status === 'activated' || r.status === 'active_confirmed';
// Key lỗi -> cần LẤY key thay thế
const needsReplacement = (r: KeyReleaseRequest) =>
  r.status === 'auto_re_requested' || r.status === 'faulty_re_requesting';

export default function QuanLyKeyPage() {
  const {
    currentUser,
    keyCategories,
    licenseKeys,
    keyReleaseRequests,
    addKeyCategory,
    updateKeyCategory,
    bulkUpdateKeyPrices,
    deleteKeyCategory,
    addLicenseKey,
    addBatchLicenseKeys,
    deleteLicenseKey,
    updateLicenseKey,
    takeKeyForCustomer,
    createKeyReleaseRequest,
    approveKeyReleaseRequest,
    confirmKeyActive,
    reportKeyFaulty,
    restoreFaultyKey,
    rejectKeyReleaseRequest,
  } = useViTinhAnTamStore();

  const isAdmin = currentUser.role === 'admin';

  // Active Tab
  const [activeTab, setActiveTab] = useState<'requests' | 'inventory' | 'reports'>('requests');

  // Request Filter
  const [requestFilter, setRequestFilter] = useState<'all' | 'pending' | 'approved' | 'activated' | 'faulty'>('all');
  const [requestSearch, setRequestSearch] = useState('');

  // Modals
  const [isTakeKeyModalOpen, setIsTakeKeyModalOpen] = useState(false);
  const [isAddKeyModalOpen, setIsAddKeyModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [faultyModalReq, setFaultyModalReq] = useState<KeyReleaseRequest | null>(null);
  const [faultyReasonInput, setFaultyReasonInput] = useState('');

  // Unmasked key visible state: mapping of reqId -> boolean
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  // Form states: Lấy key trực tiếp cho khách / Tạo yêu cầu
  const [adminReleaseMode, setAdminReleaseMode] = useState<'direct' | 'request'>('direct');
  const [reqCustomerName, setReqCustomerName] = useState('');
  const [reqCustomerPhone, setReqCustomerPhone] = useState('');
  const [reqCustomerEmail, setReqCustomerEmail] = useState('');
  const [reqCategoryId, setReqCategoryId] = useState(keyCategories[0]?.id || '');
  const [isTakingKey, setIsTakingKey] = useState(false);

  // Form states: Add Key
  const [keyInputType, setKeyInputType] = useState<'single' | 'batch'>('batch');
  const [targetCatId, setTargetCatId] = useState(keyCategories[0]?.id || '');
  const [singleKeyCode, setSingleKeyCode] = useState('');
  const [batchKeysText, setBatchKeysText] = useState('');
  const [keyUnitPrice, setKeyUnitPrice] = useState<number>(350000);
  const [keyImportPrice, setKeyImportPrice] = useState<number>(0);

  // Form states: Category management
  const [catCategoryType, setCatCategoryType] = useState<'windows' | 'office' | 'others'>('windows');
  const [catSelectedPreset, setCatSelectedPreset] = useState<string>('WINDOWS 11 PROFESSIONAL');
  const [catCustomName, setCatCustomName] = useState('');
  const [catDescription, setCatDescription] = useState('Kích hoạt được chỉ cho 01 máy, không thể sử dụng lại trên máy khác');
  const [catDefaultImportPrice, setCatDefaultImportPrice] = useState<number>(0);
  const [catDefaultUnitPrice, setCatDefaultUnitPrice] = useState<number>(0);

  // Price editing states (per-key + per-category)
  const [priceEditKey, setPriceEditKey] = useState<LicenseKeyItem | null>(null);
  const [priceEditImport, setPriceEditImport] = useState<number>(0);
  const [priceEditUnit, setPriceEditUnit] = useState<number>(0);
  const [priceCatEdit, setPriceCatEdit] = useState<KeyCategory | null>(null);
  const [priceCatImport, setPriceCatImport] = useState<number>(0);
  const [priceCatUnit, setPriceCatUnit] = useState<number>(0);
  const [priceCatBusy, setPriceCatBusy] = useState(false);

  // Khi chọn phân loại trong form thêm key: tự điền giá mặc định của phân loại (nếu đã đặt)
  useEffect(() => {
    if (!isAddKeyModalOpen) return;
    const cat = keyCategories.find((c) => c.id === targetCatId);
    if (!cat) return;
    if (cat.default_import_price != null) setKeyImportPrice(cat.default_import_price);
    if (cat.default_unit_price != null) setKeyUnitPrice(cat.default_unit_price);
  }, [targetCatId, isAddKeyModalOpen, keyCategories]);

  // Inventory table filter
  const [invCatFilter, setInvCatFilter] = useState('all');
  const [invStatusFilter, setInvStatusFilter] = useState('all');
  const [invSearch, setInvSearch] = useState('');

  const triggerFeedback = (msg: string) => {
    setStatusFeedback(msg);
    setTimeout(() => setStatusFeedback(null), 3500);
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopyFeedback(`Đã sao chép: ${text}`);
      setTimeout(() => setCopyFeedback(null), 2500);
    }
  };

  // Filtered Requests
  const filteredRequests = useMemo(() => {
    return keyReleaseRequests.filter((r) => {
      if (requestFilter === 'pending' && r.status !== 'pending' && !needsReplacement(r)) return false;
      if (requestFilter === 'approved' && !isWaitingTest(r)) return false;
      if (requestFilter === 'activated' && !isActive(r)) return false;
      if (requestFilter === 'faulty' && !needsReplacement(r) && (!r.faulty_history || r.faulty_history.length === 0)) return false;

      if (requestSearch.trim()) {
        const q = requestSearch.trim().toLowerCase();
        const matchCode = r.request_code.toLowerCase().includes(q);
        const matchCustomer = r.customer_name.toLowerCase().includes(q) || r.customer_phone.includes(q) || r.customer_email.toLowerCase().includes(q);
        const matchCategory = r.category_name.toLowerCase().includes(q);
        const matchKey = r.assigned_key_code?.toLowerCase().includes(q);
        if (!matchCode && !matchCustomer && !matchCategory && !matchKey) return false;
      }
      return true;
    });
  }, [keyReleaseRequests, requestFilter, requestSearch]);

  // Filtered License Keys
  const filteredKeys = useMemo(() => {
    return licenseKeys.filter((k) => {
      if (invCatFilter !== 'all' && k.category_id !== invCatFilter) return false;
      if (invStatusFilter !== 'all' && k.status !== invStatusFilter) return false;
      if (invSearch.trim()) {
        const q = invSearch.trim().toLowerCase();
        const matchCode = k.license_code.toLowerCase().includes(q);
        const matchCat = k.category_name.toLowerCase().includes(q);
        const matchCustomer = (k.customer_name || '').toLowerCase().includes(q) || (k.customer_email || '').toLowerCase().includes(q);
        if (!matchCode && !matchCat && !matchCustomer) return false;
      }
      return true;
    });
  }, [licenseKeys, invCatFilter, invStatusFilter, invSearch]);

  // Inventory stats
  const stats = useMemo(() => {
    const total = licenseKeys.length;
    const available = licenseKeys.filter((k) => k.status === 'available').length;
    const reserved = licenseKeys.filter((k) => k.status === 'reserved').length;
    const activated = licenseKeys.filter((k) => k.status === 'activated').length;
    const faulty = licenseKeys.filter((k) => k.status === 'faulty').length;
    return { total, available, reserved, activated, faulty };
  }, [licenseKeys]);

  // Financial & Inventory Reports Computation
  const reportsData = useMemo(() => {
    let totalRevenue = 0;
    let totalImportCost = 0;
    let soldKeysCount = 0;
    let faultyKeysCount = 0;

    licenseKeys.forEach((k) => {
      totalImportCost += k.import_price || 0;
      if (k.status === 'activated' || k.status === 'used' || k.status === 'assigned' || k.status === 'reserved') {
        soldKeysCount++;
        totalRevenue += k.unit_price || 0;
      } else if (k.status === 'faulty') {
        faultyKeysCount++;
      }
    });

    const totalKeys = licenseKeys.length;
    const availableKeysCount = licenseKeys.filter((k) => k.status === 'available').length;
    const soldCost = soldKeysCount > 0 && totalKeys > 0 ? (totalImportCost / totalKeys) * soldKeysCount : 0;
    const grossProfit = totalRevenue - soldCost;
    const faultyRate = totalKeys > 0 ? ((faultyKeysCount / totalKeys) * 100).toFixed(1) : '0.0';

    const categoryStats = keyCategories.map((cat) => {
      const keysInCat = licenseKeys.filter((k) => k.category_id === cat.id);
      const catAvailable = keysInCat.filter((k) => k.status === 'available').length;
      const catSold = keysInCat.filter((k) => k.status === 'activated' || k.status === 'used' || k.status === 'assigned' || k.status === 'reserved').length;
      const catFaulty = keysInCat.filter((k) => k.status === 'faulty').length;
      const catImported = keysInCat.length;
      const catRevenue = keysInCat
        .filter((k) => k.status === 'activated' || k.status === 'used' || k.status === 'assigned' || k.status === 'reserved')
        .reduce((sum, k) => sum + (k.unit_price || 0), 0);
      const catCost = keysInCat.reduce((sum, k) => sum + (k.import_price || 0), 0);
      const catProfit = catRevenue - (catImported > 0 ? (catCost / catImported) * catSold : 0);
      const catFaultyRate = catImported > 0 ? ((catFaulty / catImported) * 100).toFixed(1) : '0.0';

      return {
        ...cat,
        totalImported: catImported,
        available: catAvailable,
        sold: catSold,
        faulty: catFaulty,
        faultyRate: catFaultyRate,
        revenue: catRevenue,
        cost: catCost,
        profit: catProfit,
      };
    });

    return {
      totalKeys,
      availableKeysCount,
      soldKeysCount,
      faultyKeysCount,
      totalRevenue,
      totalImportCost,
      grossProfit,
      faultyRate,
      categoryStats,
    };
  }, [licenseKeys, keyCategories]);

  // Export CSV for Key Management & Finance
  const handleExportKeyFinancialCSV = () => {
    if (keyReleaseRequests.length === 0) {
      alert('Chưa có dữ liệu yêu cầu key để xuất file!');
      return;
    }

    const headers = [
      'Mã Yêu Cầu',
      'Tên Khách Hàng',
      'Số Điện Thoại',
      'Email',
      'Phân Loại Key',
      'Mã Key Cấp',
      'Trạng Thái',
      'KTV Yêu Cầu',
      'Ngày Cấp',
      'Giá Bán (VNĐ)',
      'Ghi Chú',
    ];

    const rows = keyReleaseRequests.map((r) => {
      const assignedKey = r.assigned_key_code || r.released_key_code || '---';
      const keyObj = licenseKeys.find((k) => k.id === r.released_key_id || k.license_code === assignedKey);
      const price = keyObj?.unit_price || 350000;
      
      let statusText = 'Chờ duyệt';
      if (r.status === 'activated' || r.status === 'active_confirmed') statusText = 'Đã kích hoạt';
      else if (r.status === 'approved' || r.status === 'approved_waiting_test') statusText = 'Chờ test';
      else if (r.status === 'auto_re_requested' || r.status === 'faulty_re_requesting') statusText = 'Key lỗi - Đổi bù';
      else if (r.status === 'rejected') statusText = 'Từ chối';

      return [
        `"${r.request_code}"`,
        `"${(r.customer_name || '').replace(/"/g, '""')}"`,
        `"${r.customer_phone || ''}"`,
        `"${r.customer_email || ''}"`,
        `"${(r.category_name || '').replace(/"/g, '""')}"`,
        `"${assignedKey}"`,
        `"${statusText}"`,
        `"${(r.requester_name || '').replace(/"/g, '""')}"`,
        `"${new Date(r.created_at).toLocaleDateString('vi-VN')}"`,
        `"${price}"`,
        `"${(r.admin_note || r.faulty_reason || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bao_Cao_Doanh_Thu_Key_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Submit Handler: LẤY KEY (Admin) hoặc TẠO YÊU CẦU CẤP KEY (KTV / Sales)
  const handleTakeKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqCustomerEmail.trim()) {
      alert('Bắt buộc phải có email khách hàng để hệ thống gửi key cho khách!');
      return;
    }
    setIsTakingKey(true);
    let res;
    if (isAdmin && adminReleaseMode === 'direct') {
      res = await takeKeyForCustomer({
        customer_name: reqCustomerName,
        customer_phone: reqCustomerPhone,
        customer_email: reqCustomerEmail,
        category_id: reqCategoryId,
      });
    } else {
      res = await createKeyReleaseRequest({
        customer_name: reqCustomerName,
        customer_phone: reqCustomerPhone,
        customer_email: reqCustomerEmail,
        category_id: reqCategoryId,
      });
    }
    setIsTakingKey(false);

    if (res.success) {
      triggerFeedback(res.message);
      setIsTakeKeyModalOpen(false);
      setReqCustomerName('');
      setReqCustomerPhone('');
      setReqCustomerEmail('');
      setActiveTab('requests');
    } else {
      alert(res.message);
    }
  };

  // Submit Handler: Add Category (with Merge logic)
  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = catCategoryType === 'others' ? catCustomName.trim() : catSelectedPreset.trim();
    if (!finalName) {
      alert('Vui lòng nhập tên phân loại key!');
      return;
    }

    const created = await addKeyCategory({
      name: finalName,
      type: catCategoryType,
      description: catDescription.trim(),
      default_import_price: catDefaultImportPrice > 0 ? catDefaultImportPrice : null,
      default_unit_price: catDefaultUnitPrice > 0 ? catDefaultUnitPrice : null,
    });

    triggerFeedback(`Đã lưu phân loại: ${created.name}`);
    setIsAddCategoryModalOpen(false);
    setCatCustomName('');
    setCatDefaultImportPrice(0);
    setCatDefaultUnitPrice(0);
  };

  // Submit Handler: Delete Category
  const handleDeleteCategory = async (cat: KeyCategory) => {
    if (cat.is_default) {
      alert('Không thể xóa các phân loại mặc định của hệ thống!');
      return;
    }
    if (confirm(`Bạn có chắc chắn muốn xóa phân loại "${cat.name}"?`)) {
      const res = await deleteKeyCategory(cat.id);
      if (res.success) {
        triggerFeedback(res.message);
      } else {
        alert(res.message);
      }
    }
  };

  // Submit Handler: Add Keys
  const handleAddKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cat = keyCategories.find((c) => c.id === targetCatId);
    if (!cat) {
      alert('Vui lòng chọn phân loại key!');
      return;
    }

    if (keyInputType === 'single') {
      if (!singleKeyCode.trim()) {
        alert('Vui lòng nhập mã key!');
        return;
      }
      await addLicenseKey({
        category_id: cat.id,
        category_name: cat.name,
        license_code: singleKeyCode.trim(),
        status: 'available',
        import_price: keyImportPrice,
        unit_price: keyUnitPrice,
      });
      triggerFeedback(`Đã thêm key ${singleKeyCode.trim()} vào kho.`);
      setSingleKeyCode('');
    } else {
      if (!batchKeysText.trim()) {
        alert('Vui lòng nhập ít nhất 1 mã key!');
        return;
      }
      const res = await addBatchLicenseKeys(
        cat.id,
        cat.name,
        batchKeysText,
        keyUnitPrice,
        keyImportPrice
      );
      triggerFeedback(`Đã thêm thành công ${res.addedCount} key vào kho!`);
      setBatchKeysText('');
    }

    setIsAddKeyModalOpen(false);
  };

  // Submit Handler: Report Faulty Key
  const handleConfirmFaulty = async () => {
    if (!faultyModalReq) return;
    const reason = faultyReasonInput.trim() || 'Key không kích hoạt được trên thiết bị của khách';
    const res = await reportKeyFaulty(faultyModalReq.id, reason);
    setFaultyModalReq(null);
    setFaultyReasonInput('');
    triggerFeedback(res.message);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      {/* Toast Feedback */}
      {statusFeedback && (
        <div className="fixed top-20 right-6 z-50 bg-[#2B1810] text-white px-5 py-3 rounded-xl shadow-xl border border-[#E8E2D9] text-xs font-bold animate-fade-in">
          {statusFeedback}
        </div>
      )}

      {copyFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F4C5C] text-white px-4 py-2.5 rounded-lg shadow-lg text-xs font-bold font-mono">
          {copyFeedback}
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8E2D9] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#2B1810] tracking-tight">
            QUẢN LÝ KHO KEY BẢN QUYỀN WINDOWS &amp; OFFICE
          </h1>
          <p className="text-xs text-[#6E5D53] mt-1 max-w-2xl">
            {isAdmin
              ? 'Quản trị kho key bản quyền, phê duyệt cấp phát key thời gian thực, xử lý đổi key lỗi và cấu hình email bàn giao tự động.'
              : 'Kỹ thuật viên & Sales gửi yêu cầu cấp key. Sau khi Admin phê duyệt, mã key sẽ tự động hiển thị popup để kiểm tra kích hoạt.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsTakeKeyModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white text-xs font-bold transition-all shadow-xs"
          >
            {isAdmin ? 'XUẤT / CẤP KEY' : '+ YÊU CẦU CẤP KEY'}
          </button>

          {/* Admin shortcuts */}
          {isAdmin && (
            <>
              <button
                type="button"
                onClick={() => setIsAddKeyModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-[#2B1810] hover:bg-black text-white text-xs font-bold transition-all"
              >
                + NHẬP THÊM KEY VÀO KHO
              </button>
              <button
                type="button"
                onClick={() => setIsAddCategoryModalOpen(true)}
                className="px-3.5 py-2.5 rounded-xl bg-white border border-[#E8E2D9] text-[#2B1810] hover:border-[#C0392B] text-xs font-bold transition-all"
              >
                + QUẢN LÝ PHÂN LOẠI
              </button>
            </>
          )}
        </div>
      </div>

      {/* STATS OVERVIEW CARDS — 2 thẻ vận hành (đã kích hoạt / key lỗi)
          chỉ hiện khi có số liệu, tránh hàng thẻ toàn số 0 */}
      <div className={`grid grid-cols-2 gap-3 sm:gap-4 ${stats.activated > 0 || stats.faulty > 0 ? 'sm:grid-cols-4' : 'sm:grid-cols-2 max-w-2xl'}`}>
        <div className="bg-[#FFFDF9] p-4 rounded-xl border border-[#E8E2D9] shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#6E5D53]">
            TỔNG KEY TRONG KHO
          </div>
          <div className="text-2xl font-black text-[#2B1810] font-mono mt-1">
            {stats.total}
          </div>
          <div className="text-[11px] text-[#6E5D53] mt-0.5">
            Tất cả các phiên bản
          </div>
        </div>

        <div className="bg-[#FFFDF9] p-4 rounded-xl border border-emerald-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
            KEY SẴN SÀNG CẤP
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono mt-1">
            {stats.available}
          </div>
          <div className="text-[11px] text-emerald-800 mt-0.5">
            Có thể xuất kho ngay
          </div>
        </div>

        {stats.activated > 0 && (
          <div className="bg-[#FFFDF9] p-4 rounded-xl border border-blue-200 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
              ĐÃ KÍCH HOẠT THÀNH CÔNG
            </div>
            <div className="text-2xl font-black text-blue-700 font-mono mt-1">
              {stats.activated}
            </div>
            <div className="text-[11px] text-blue-800 mt-0.5">
              Đã gửi email cho khách
            </div>
          </div>
        )}

        {stats.faulty > 0 && (
          <div className="bg-[#FFFDF9] p-4 rounded-xl border border-rose-200 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
              KEY BÁO LỖI / XIN ĐỔI
            </div>
            <div className="text-2xl font-black text-rose-700 font-mono mt-1">
              {stats.faulty}
            </div>
            <div className="text-[11px] text-rose-800 mt-0.5">
              Lưu vết để bảo hành
            </div>
          </div>
        )}
      </div>

      {/* NAVIGATION TABS */}
      <div className="border-b border-[#E8E2D9] flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'requests'
              ? 'border-[#C0392B] text-[#C0392B] bg-[#FFFDF9]'
              : 'border-transparent text-[#6E5D53] hover:text-[#2B1810]'
          }`}
        >
          {isAdmin ? `YÊU CẦU & LỊCH SỬ XUẤT KEY (${keyReleaseRequests.length})` : `YÊU CẦU CỦA TÔI (${keyReleaseRequests.length})`}
        </button>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'inventory'
                ? 'border-[#C0392B] text-[#C0392B] bg-[#FFFDF9]'
                : 'border-transparent text-[#6E5D53] hover:text-[#2B1810]'
            }`}
          >
            KHO KEY CHI TIẾT &amp; PHÂN LOẠI ({licenseKeys.length})
          </button>
        )}

        {isAdmin && (
          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'reports'
                ? 'border-[#C0392B] text-[#C0392B] bg-[#FFFDF9]'
                : 'border-transparent text-[#6E5D53] hover:text-[#2B1810]'
            }`}
          >
            📊 BÁO CÁO &amp; DOANH THU KEY
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: YÊU CẦU CẤP & ACTIVE KEY (RELEASE WORKFLOW) */}
      {/* ========================================================================= */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {/* Request Filters & Search */}
          <div className="bg-[#FFFDF9] p-4 rounded-xl border border-[#E8E2D9] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setRequestFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  requestFilter === 'all'
                    ? 'bg-[#2B1810] text-white'
                    : 'bg-white border border-[#E8E2D9] text-[#6E5D53] hover:border-[#2B1810]'
                }`}
              >
                TẤT CẢ ({keyReleaseRequests.length})
              </button>
              <button
                type="button"
                onClick={() => setRequestFilter('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  requestFilter === 'pending'
                    ? 'bg-[#C0392B] text-white'
                    : 'bg-white border border-[#E8E2D9] text-[#6E5D53] hover:border-[#C0392B]'
                }`}
              >
                CHỜ ADMIN DUYỆT (
                {
                  keyReleaseRequests.filter(
                    (r) => r.status === 'pending' || needsReplacement(r)
                  ).length
                }
                )
              </button>
              <button
                type="button"
                onClick={() => setRequestFilter('approved')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  requestFilter === 'approved'
                    ? 'bg-blue-700 text-white'
                    : 'bg-white border border-[#E8E2D9] text-[#6E5D53] hover:border-blue-700'
                }`}
              >
                ĐÃ LẤY KEY • CHỜ ACTIVE (
                {keyReleaseRequests.filter((r) => isWaitingTest(r)).length})
              </button>
              <button
                type="button"
                onClick={() => setRequestFilter('activated')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  requestFilter === 'activated'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-white border border-[#E8E2D9] text-[#6E5D53] hover:border-emerald-700'
                }`}
              >
                ĐÃ KÍCH HOẠT (
                {keyReleaseRequests.filter((r) => isActive(r)).length})
              </button>
            </div>

            <div className="w-full sm:w-72">
              <input
                type="text"
                placeholder="Tìm mã phiếu, khách, email, SĐT..."
                value={requestSearch}
                onChange={(e) => setRequestSearch(e.target.value)}
                className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg text-xs bg-white text-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#C0392B]"
              />
            </div>
          </div>

          {/* Request Cards List */}
          {filteredRequests.length === 0 ? (
            <div className="p-12 text-center bg-[#FFFDF9] rounded-2xl border border-[#E8E2D9] text-xs text-[#6E5D53]">
              Không có yêu cầu cấp key nào phù hợp với bộ lọc.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((req) => {
                const isKeyRevealed = revealedKeys[req.id] || false;
                const assignedKey = req.assigned_key_code || '';
                const reqStock = licenseKeys.filter(
                  (k) => k.category_id === req.category_id && k.status === 'available'
                ).length;

                return (
                  <div
                    key={req.id}
                    className={`bg-[#FFFDF9] rounded-2xl border transition-all p-5 shadow-xs ${
                      req.status === 'approved'
                        ? 'border-amber-400 bg-amber-50/20'
                        : req.status === 'faulty_re_requesting'
                        ? 'border-rose-400 bg-rose-50/20'
                        : req.status === 'activated'
                        ? 'border-emerald-300'
                        : 'border-[#E8E2D9]'
                    }`}
                  >
                    {/* Top Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E8E2D9]">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-black bg-[#FAF7F2] px-2.5 py-1 rounded-lg border border-[#E8E2D9] text-[#2B1810]">
                          {req.request_code}
                        </span>
                        <h3 className="text-sm font-black text-[#2B1810] uppercase">
                          {req.category_name}
                        </h3>
                        {(req.status === 'pending' || needsReplacement(req)) && (
                          reqStock === 0 ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                              ⚠️ KHO HẾT KEY (VOL: 0)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                              Kho: {reqStock}
                            </span>
                          )
                        )}
                      </div>

                      {/* Status Badges */}
                      <div>
                        {req.status === 'pending' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            CHỜ ADMIN DUYỆT
                          </span>
                        )}
                        {needsReplacement(req) && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300 animate-pulse">
                            KEY LỖI • CẦN LẤY KEY THAY THẾ
                          </span>
                        )}
                        {isWaitingTest(req) && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
                            ĐÃ LẤY KEY • CHỜ XÁC NHẬN ACTIVE
                          </span>
                        )}
                        {isActive(req) && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                            HOẠT ĐỘNG TỐT • ĐÃ GỬI EMAIL
                          </span>
                        )}
                        {req.status === 'rejected' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                            ĐÃ TỪ CHỐI
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle Info Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-3 text-xs border-b border-[#E8E2D9]">
                      <div>
                        <span className="text-[#6E5D53] block mb-0.5">Khách hàng nhận bản quyền:</span>
                        <div className="font-bold text-[#2B1810]">
                          {req.customer_name} - {req.customer_phone}
                        </div>
                        <div className="text-[#0F4C5C] font-mono font-medium underline mt-0.5">
                          {req.customer_email}
                        </div>
                      </div>

                      <div>
                        <span className="text-[#6E5D53] block mb-0.5">Người yêu cầu cấp:</span>
                        <div className="font-bold text-[#2B1810]">
                          {req.requester_name}
                        </div>
                        <div className="text-[#6E5D53] capitalize">
                          {req.requester_role === 'technician'
                            ? 'Kỹ thuật viên'
                            : req.requester_role === 'outsourced'
                            ? 'KTV Thuê Ngoài'
                            : req.requester_role === 'sales'
                            ? 'Kinh doanh (Sales)'
                            : 'Quản trị viên'}
                        </div>
                      </div>

                      <div>
                        <span className="text-[#6E5D53] block mb-0.5">Thời gian ghi nhận:</span>
                        <div className="font-mono text-[#2B1810]">
                          {new Date(req.created_at).toLocaleString('vi-VN')}
                        </div>
                        {req.email_sent && req.email_sent_at && (
                          <div className="text-emerald-700 font-medium mt-0.5">
                            Email gửi lúc: {new Date(req.email_sent_at).toLocaleTimeString('vi-VN')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Faulty History if any */}
                    {req.faulty_history && req.faulty_history.length > 0 && (
                      <div className="my-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1">
                        <div className="font-bold text-rose-800 uppercase">
                          LỊCH SỬ KEY LỖI ĐÃ TỪNG CẤP CHO PHIẾU NÀY:
                        </div>
                        {req.faulty_history.map((fh, idx) => (
                          <div key={idx} className="text-rose-700 flex items-center justify-between">
                            <span>
                              Mã key: <strong className="font-mono">{fh.key_code}</strong> - Lý do: {fh.reason}
                            </span>
                            <span className="text-[10px] font-mono opacity-80">
                              {new Date(fh.timestamp).toLocaleTimeString('vi-VN')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* KEY BOX & CONFIRMATION ACTIONS */}
                    {isWaitingTest(req) && assignedKey && (
                      <div className="mt-4 p-4 rounded-xl bg-amber-50/70 border border-amber-300 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                              MÃ KEY ĐƯỢC ADMIN CẤP:
                            </span>
                            <div className="text-base sm:text-lg font-black font-mono tracking-wider text-[#2B1810] mt-0.5">
                              {isKeyRevealed
                                ? assignedKey
                                : `${assignedKey.substring(0, 5)}-•••••-•••••-•••••-${assignedKey.substring(assignedKey.length - 5)}`}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setRevealedKeys((prev) => ({
                                  ...prev,
                                  [req.id]: !isKeyRevealed,
                                }))
                              }
                              className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-bold transition-colors"
                            >
                              {isKeyRevealed ? 'ẨN MÃ KEY' : 'HIỆN ĐẦY ĐỦ'}
                            </button>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(assignedKey)}
                              className="px-3.5 py-1.5 rounded-lg bg-[#2B1810] text-white hover:bg-black text-xs font-bold transition-colors"
                            >
                              SAO CHÉP KEY
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-[#6E5D53] italic">
                          Sau khi kích hoạt trên máy khách, vui lòng bấm một trong 2 nút bên dưới để xác nhận kết quả.
                        </p>

                        {/* EXACTLY 2 BUTTONS BELOW KEY FIELD AS REQUIRED */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <button
                            type="button"
                            onClick={async () => {
                              const res = await confirmKeyActive(req.id);
                              triggerFeedback(res.message);
                            }}
                            className="py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black tracking-wider transition-all shadow-xs text-center"
                          >
                            [ KEY HOẠT ĐỘNG ]
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setFaultyModalReq(req);
                              setFaultyReasonInput('');
                            }}
                            className="py-3 px-4 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white text-xs font-black tracking-wider transition-all shadow-xs text-center"
                          >
                            [ KEY KHÔNG HOẠT ĐỘNG ]
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Hành động cho phiếu chờ duyệt (dữ liệu cũ) hoặc key lỗi cần lấy lại */}
                    {(req.status === 'pending' || needsReplacement(req)) && isAdmin && (
                      <div className="mt-3 flex flex-wrap items-center gap-2 pt-2">
                        {reqStock === 0 ? (
                          <button
                            type="button"
                            onClick={() =>
                              alert(
                                `Kho hiện tại có Volume = 0 cho danh mục "${req.category_name}". Vui lòng nạp thêm key vào kho trước khi cấp/duyệt!`
                              )
                            }
                            className="px-4 py-2 rounded-xl bg-slate-500 hover:bg-slate-600 text-white text-xs font-bold shadow-xs cursor-pointer"
                          >
                            ⚠️ KHO HẾT KEY (VOL: 0) - CHƯA THỂ CẤP
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={async () => {
                              const res = await approveKeyReleaseRequest(req.id);
                              if (res.success) {
                                triggerFeedback(res.message);
                              } else {
                                alert(res.message);
                              }
                            }}
                            className="px-4 py-2 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                          >
                            LẤY KEY THAY THẾ / CẤP NGAY
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={async () => {
                            const reason = prompt('Nhập lý do từ chối:');
                            if (reason !== null) {
                              await rejectKeyReleaseRequest(req.id, reason.trim() || 'Admin từ chối');
                              triggerFeedback('Đã từ chối yêu cầu.');
                            }
                          }}
                          className="px-4 py-2 rounded-xl bg-white border border-[#E8E2D9] text-[#6E5D53] hover:text-[#C0392B] hover:border-[#C0392B] text-xs font-bold"
                        >
                          TỪ CHỐI
                        </button>
                      </div>
                    )}

                    {/* Activated State Details */}
                    {req.status === 'activated' && assignedKey && (
                      <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-900">KEY ĐÃ KÍCH HOẠT:</span>
                          <span className="font-mono font-bold text-emerald-800">{assignedKey}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(assignedKey)}
                          className="px-2.5 py-1 rounded bg-white border border-emerald-300 text-emerald-900 text-[11px] font-bold hover:bg-emerald-100"
                        >
                          SAO CHÉP
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: KHO KEY CHI TIẾT & PHÂN LOẠI (INVENTORY & CATEGORIES) */}
      {/* ========================================================================= */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* Categories Management Panel */}
          <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#E8E2D9] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E2D9] pb-3">
              <div>
                <h3 className="text-sm font-black text-[#2B1810]">
                  DANH MỤC PHÂN LOẠI KEY WINDOWS &amp; OFFICE
                </h3>
                <p className="text-xs text-[#6E5D53] mt-0.5">
                  Phân loại mặc định của hệ thống được bảo vệ và không thể xóa. Các phân loại tự nhập thuộc &quot;Others&quot; có thể xóa hoặc tự động merge.
                </p>
              </div>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setIsAddCategoryModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white text-xs font-bold transition-all shrink-0"
                >
                  + THÊM PHÂN LOẠI MỚI
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {keyCategories.map((cat) => {
                const stockCount = licenseKeys.filter(
                  (k) => k.category_id === cat.id && k.status === 'available'
                ).length;

                return (
                  <div
                    key={cat.id}
                    className="p-4 rounded-xl border border-[#E8E2D9] bg-[#FAF7F2] flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-[#E8E2D9] text-[#6E5D53]">
                          {cat.type}
                        </span>
                        {cat.is_default ? (
                          <span className="text-[10px] font-bold text-[#6E5D53]">
                            Cố định hệ thống
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-[#D9531E]">
                            Tự nhập (Others)
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-black text-[#2B1810] uppercase mt-2">
                        {cat.name}
                      </h4>
                      <p className="text-[11px] text-[#6E5D53] mt-1 line-clamp-2">
                        {cat.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#E8E2D9]">
                      <span className="text-xs font-bold font-mono text-emerald-800">
                        Còn {stockCount} key khả dụng
                      </span>

                      {isAdmin && !cat.is_default && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat)}
                          className="text-[11px] text-rose-700 hover:text-rose-900 font-bold hover:underline"
                        >
                          Xóa phân loại
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Keys Inventory Table */}
          <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8E2D9] shadow-xs overflow-hidden">
            {/* Table Filters */}
            <div className="p-4 border-b border-[#E8E2D9] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <select
                  value={invCatFilter}
                  onChange={(e) => setInvCatFilter(e.target.value)}
                  className="px-3 py-2 border border-[#E8E2D9] rounded-lg text-xs bg-white text-[#2B1810] font-semibold"
                >
                  <option value="all">TẤT CẢ PHÂN LOẠI</option>
                  {keyCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  value={invStatusFilter}
                  onChange={(e) => setInvStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-[#E8E2D9] rounded-lg text-xs bg-white text-[#2B1810] font-semibold"
                >
                  <option value="all">TẤT CẢ TRẠNG THÁI</option>
                  <option value="available">Sẵn sàng cấp (Available)</option>
                  <option value="reserved">Đang chờ active (Reserved)</option>
                  <option value="activated">Đã kích hoạt (Activated)</option>
                  <option value="faulty">Bị lỗi (Faulty)</option>
                </select>
              </div>

              <div className="w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Tìm theo mã key, email khách..."
                  value={invSearch}
                  onChange={(e) => setInvSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg text-xs bg-white text-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#C0392B]"
                />
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#2B1810]">
                <thead>
                  <tr className="bg-[#FAF7F2] border-b border-[#E8E2D9] text-[11px] font-bold uppercase tracking-wider text-[#6E5D53]">
                    <th className="py-3 px-4">MÃ LICENSE KEY</th>
                    <th className="py-3 px-4">PHÂN LOẠI</th>
                    <th className="py-3 px-4">TRẠNG THÁI</th>
                    <th className="py-3 px-4">KHÁCH HÀNG GẮN KEY</th>
                    <th className="py-3 px-4">NGÀY TẠO</th>
                    {isAdmin && <th className="py-3 px-4 text-right">GIÁ NHẬP / BÁN</th>}
                    {isAdmin && <th className="py-3 px-4 text-right">THAO TÁC</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E2D9]">
                  {filteredKeys.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 7 : 5} className="py-8 text-center text-[#6E5D53]">
                        Không có mã key nào trong kho phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredKeys.map((k) => (
                      <tr key={k.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#2B1810]">
                          <div className="flex items-center gap-2">
                            <span>{k.license_code}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(k.license_code)}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[#6E5D53]"
                            >
                              Chép
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold text-xs uppercase text-[#C0392B]">
                          {k.category_name}
                        </td>
                        <td className="py-3 px-4">
                          {k.status === 'available' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              SẴN SÀNG
                            </span>
                          )}
                          {(k.status === 'reserved' || k.status === 'assigned') && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              ĐANG CHỜ ACTIVE
                            </span>
                          )}
                          {(k.status === 'activated' || k.status === 'used') && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                              ĐÃ KÍCH HOẠT
                            </span>
                          )}
                          {k.status === 'faulty' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                              KEY LỖI
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-[#6E5D53]">
                          {(k.customer_name || k.assigned_to_customer) ? (
                            <div>
                              <div className="font-bold text-[#2B1810]">{k.customer_name || k.assigned_to_customer}</div>
                              <div className="text-[11px] font-mono text-[#0F4C5C]">{k.customer_email || k.assigned_to_phone}</div>
                            </div>
                          ) : (
                            <span className="italic text-slate-400">Chưa cấp</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-[#6E5D53]">
                          {new Date(k.created_at).toLocaleDateString('vi-VN')}
                        </td>
                        {isAdmin && (
                          <td className="py-3 px-4 text-right font-mono text-[11px]">
                            <div className="text-rose-700 font-bold">{(k.import_price || 0).toLocaleString('vi-VN')} đ</div>
                            <div className="text-emerald-700 font-bold">{(k.unit_price || 0).toLocaleString('vi-VN')} đ</div>
                          </td>
                        )}
                        {isAdmin && (
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setPriceEditKey(k);
                                  setPriceEditImport(k.import_price || 0);
                                  setPriceEditUnit(k.unit_price || 0);
                                }}
                                className="px-2 py-1 bg-sky-50 border border-sky-300 text-sky-800 rounded text-[11px] font-bold hover:bg-sky-100 transition-colors shrink-0"
                                title="Sửa giá nhập / giá bán của key này"
                              >
                                💲 Giá
                              </button>
                              {k.status === 'faulty' && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    const note = prompt('Nhập lý do khôi phục key về kho sẵn sàng (tùy chọn):', 'Đã kiểm tra lại: thiết bị khách lỗi, mã key vẫn hoạt động bình thường');
                                    if (note !== null) {
                                      const res = await restoreFaultyKey(k.id, note);
                                      triggerFeedback(res.message);
                                    }
                                  }}
                                  className="px-2 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded text-[11px] font-bold hover:bg-emerald-100 transition-colors shrink-0"
                                  title="Khôi phục key về trạng thái SẴN SÀNG trong kho"
                                >
                                  🔄 Khôi phục
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={async () => {
                                  if (confirm(`Bạn có chắc muốn xóa mã key ${k.license_code}?`)) {
                                    await deleteLicenseKey(k.id);
                                    triggerFeedback('Đã xóa key khỏi kho.');
                                  }
                                }}
                                className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline"
                              >
                                Xóa
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: BÁO CÁO DOANH THU & XUẤT NHẬP TỒN KEY (ADMIN ONLY) */}
      {/* ========================================================================= */}
      {activeTab === 'reports' && isAdmin && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-emerald-300 shadow-xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                TỔNG DOANH THU BÁN KEY
              </div>
              <div className="text-2xl font-black text-emerald-700 font-mono mt-1">
                {reportsData.totalRevenue.toLocaleString('vi-VN')} đ
              </div>
              <div className="text-[11px] text-[#6E5D53] mt-1">
                Từ {reportsData.soldKeysCount} key đã xuất cho khách
              </div>
            </div>

            <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-blue-300 shadow-xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
                LỢI NHUẬN GỘP ƯỚC TÍNH
              </div>
              <div className="text-2xl font-black text-blue-700 font-mono mt-1">
                {Math.max(0, Math.round(reportsData.grossProfit)).toLocaleString('vi-VN')} đ
              </div>
              <div className="text-[11px] text-[#6E5D53] mt-1">
                Doanh thu trừ giá vốn xuất bán
              </div>
            </div>

            <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-amber-300 shadow-xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                TỔNG VỐN NHẬP KHO
              </div>
              <div className="text-2xl font-black text-amber-700 font-mono mt-1">
                {reportsData.totalImportCost.toLocaleString('vi-VN')} đ
              </div>
              <div className="text-[11px] text-[#6E5D53] mt-1">
                Tổng {reportsData.totalKeys} key đã nhập hệ thống
              </div>
            </div>

            <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-rose-300 shadow-xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
                TỶ LỆ KEY BÁO LỖI
              </div>
              <div className="text-2xl font-black text-rose-700 font-mono mt-1">
                {reportsData.faultyRate}%
              </div>
              <div className="text-[11px] text-[#6E5D53] mt-1">
                {reportsData.faultyKeysCount} key bị ghi nhận lỗi
              </div>
            </div>
          </div>

          <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#E8E2D9] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E2D9] pb-4">
              <div>
                <h3 className="text-sm font-black text-[#2B1810] uppercase">
                  BÁO CÁO CHI TIẾT TỪNG PHÂN LOẠI KEY BẢN QUYỀN
                </h3>
                <p className="text-xs text-[#6E5D53] mt-0.5">
                  Thống kê xuất nhập tồn, doanh thu, lợi nhuận và tỷ lệ lỗi chi tiết cho từng loại phần mềm.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportKeyFinancialCSV}
                className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs shrink-0 cursor-pointer"
              >
                <span>📥 Xuất Excel (CSV) Báo Cáo</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#2B1810]">
                <thead>
                  <tr className="bg-[#FAF7F2] border-b border-[#E8E2D9] text-[11px] font-bold uppercase tracking-wider text-[#6E5D53]">
                    <th className="py-3 px-4">TÊN PHÂN LOẠI</th>
                    <th className="py-3 px-4">LOẠI</th>
                    <th className="py-3 px-4 text-center">TỔNG NHẬP</th>
                    <th className="py-3 px-4 text-center">TỒN SẴN SÀNG</th>
                    <th className="py-3 px-4 text-center">ĐÃ XUẤT</th>
                    <th className="py-3 px-4 text-center">KEY LỖI</th>
                    <th className="py-3 px-4 text-right">DOANH THU</th>
                    <th className="py-3 px-4 text-right">LỢI NHUẬN</th>
                    {isAdmin && <th className="py-3 px-4 text-right">GIÁ NHẬP MẶC ĐỊNH</th>}
                    {isAdmin && <th className="py-3 px-4 text-right">GIÁ BÁN MẶC ĐỊNH</th>}
                    <th className="py-3 px-4 text-center">TRẠNG THÁI KHO</th>
                    {isAdmin && <th className="py-3 px-4 text-center">QUẢN LÝ GIÁ</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E2D9]">
                  {reportsData.categoryStats.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-black uppercase text-[#2B1810]">
                        {item.name}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-bold uppercase text-[10px] text-slate-700">
                          {item.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold">
                        {item.totalImported}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-emerald-700">
                        {item.available}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-blue-700">
                        {item.sold}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-rose-700">
                        {item.faulty} ({item.faultyRate}%)
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800">
                        {item.revenue.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-blue-800">
                        {Math.max(0, Math.round(item.profit)).toLocaleString('vi-VN')} đ
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-4 text-right font-mono font-bold text-rose-700">
                          {item.default_import_price != null ? `${item.default_import_price.toLocaleString('vi-VN')} đ` : '—'}
                        </td>
                      )}
                      {isAdmin && (
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                          {item.default_unit_price != null ? `${item.default_unit_price.toLocaleString('vi-VN')} đ` : '—'}
                        </td>
                      )}
                      <td className="py-3 px-4 text-center">
                        {item.available === 0 ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                            🔴 HẾT HÀNG (Vol: 0)
                          </span>
                        ) : item.available <= 2 ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                            ⚡ SẮP HẾT ({item.available})
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                            🟢 ĐỦ HÀNG ({item.available})
                          </span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              const cat = keyCategories.find((c) => c.id === item.id);
                              if (!cat) return;
                              setPriceCatEdit(cat);
                              setPriceCatImport(cat.default_import_price || 0);
                              setPriceCatUnit(cat.default_unit_price || 0);
                            }}
                            className="px-2.5 py-1 bg-sky-50 border border-sky-300 text-sky-800 rounded text-[11px] font-bold hover:bg-sky-100 transition-colors"
                            title="Đặt giá mặc định của phân loại và cập nhật hàng loạt cho key đang sẵn sàng"
                          >
                            💲 Sửa giá
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: LẤY KEY TRỰC TIẾP (ADMIN) HOẶC TẠO YÊU CẦU CẤP KEY (KTV / SALES) */}
      {/* ========================================================================= */}
      {isTakeKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-2xl shadow-2xl border border-[#E8E2D9] w-full max-w-lg overflow-hidden animate-fade-in font-sans">
            <div className="p-4 bg-[#C0392B] text-white flex items-center justify-between">
              <h3 className="text-sm font-black tracking-tight text-white uppercase">
                {isAdmin ? 'XUẤT / CẤP KEY CHO KHÁCH HÀNG' : 'TẠO YÊU CẦU CẤP KEY (CHỜ ADMIN DUYỆT)'}
              </h3>
              <button
                type="button"
                onClick={() => setIsTakeKeyModalOpen(false)}
                className="text-white/80 hover:text-white text-xs font-bold px-2 py-1 rounded bg-white/10"
              >
                Đóng
              </button>
            </div>

            <form onSubmit={handleTakeKeySubmit} className="p-5 space-y-4 text-xs">
              {isAdmin ? (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-2">
                  <div className="text-[11px] font-bold text-amber-950 uppercase tracking-wide">
                    CHẾ ĐỘ XUẤT KEY (DÀNH CHO ADMIN):
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAdminReleaseMode('direct')}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        adminReleaseMode === 'direct'
                          ? 'bg-amber-100 border-amber-600 text-amber-950 font-bold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-bold">⚡ Xuất key ngay</div>
                      <div className="text-[10px] opacity-80 mt-0.5">Bốc key từ kho, trạng thái chờ active</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminReleaseMode('request')}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        adminReleaseMode === 'request'
                          ? 'bg-amber-100 border-amber-600 text-amber-950 font-bold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-bold">📝 Tạo yêu cầu chờ duyệt</div>
                      <div className="text-[10px] opacity-80 mt-0.5">Thử nghiệm popup chuông &amp; luồng duyệt</div>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-[#6E5D53]">
                  Yêu cầu sẽ được gửi tới Admin kèm chuông thông báo thời gian thực. Sau khi Admin duyệt, mã key sẽ hiển thị trên popup kiểm tra của bạn.
                </p>
              )}

              <div>
                <label className="block font-bold text-[#2B1810] mb-1">
                  PHÂN LOẠI PHẦN MỀM CẦN CẤP *
                </label>
                <select
                  value={reqCategoryId}
                  onChange={(e) => setReqCategoryId(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg bg-white text-[#2B1810] font-bold focus:ring-2 focus:ring-[#C0392B] focus:outline-none"
                >
                  {keyCategories.map((c) => {
                    const count = licenseKeys.filter(
                      (k) => k.category_id === c.id && k.status === 'available'
                    ).length;
                    return (
                      <option key={c.id} value={c.id}>
                        {count === 0
                          ? `🔴 [HẾT KEY - Vol: 0] ${c.name}`
                          : `🟢 ${c.name} (Kho còn ${count} key)`}
                      </option>
                    );
                  })}
                </select>
              </div>

              {licenseKeys.filter(
                (k) => k.category_id === reqCategoryId && k.status === 'available'
              ).length === 0 && (
                <div className="p-3 bg-red-50 border-2 border-red-400 rounded-xl text-red-950 flex items-start gap-2 animate-pulse">
                  <span className="text-base leading-none shrink-0 mt-0.5">⚠️</span>
                  <div className="text-xs">
                    <div className="font-black uppercase text-red-900">
                      CẢNH BÁO KHO: VOLUME = 0 (HẾT KEY)
                    </div>
                    <div className="text-red-800 mt-0.5">
                      {isAdmin && adminReleaseMode === 'direct'
                        ? 'Kho hiện tại không còn key khả dụng cho phân loại này. Admin không thể xuất key ngay, vui lòng nhập thêm key vào kho!'
                        : 'Phân loại này hiện có volume = 0 trong kho. Yêu cầu của bạn sẽ được gửi tới Admin kèm cảnh báo cần nạp thêm kho trước khi duyệt cấp.'}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-[#2B1810] mb-1">
                  HỌ TÊN KHÁCH HÀNG *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Anh Minh Tuấn (Cty Vận Tải)"
                  value={reqCustomerName}
                  onChange={(e) => setReqCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg bg-white text-[#2B1810] focus:ring-2 focus:ring-[#C0392B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2B1810] mb-1">
                  SỐ ĐIỆN THOẠI KHÁCH HÀNG *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="VD: 0918.234.891"
                  value={reqCustomerPhone}
                  onChange={(e) => setReqCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg bg-white text-[#2B1810] focus:ring-2 focus:ring-[#C0392B] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-[#C0392B] mb-1">
                  EMAIL KHÁCH HÀNG NHẬN KEY (BẮT BUỘC) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="VD: anhtuan.ketoan@gmail.com"
                  value={reqCustomerEmail}
                  onChange={(e) => setReqCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-[#C0392B] rounded-lg bg-white text-[#2B1810] focus:ring-2 focus:ring-[#C0392B] focus:outline-none font-mono font-medium"
                />
                <span className="text-[11px] text-[#6E5D53] mt-1 block">
                  Nếu không có email, hệ thống sẽ không thể cung cấp và bàn giao key cho khách hàng.
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTakeKeyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[#6E5D53] hover:bg-slate-100 font-bold"
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  disabled={isTakingKey}
                  className="px-5 py-2.5 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white font-bold transition-all shadow-xs cursor-pointer"
                >
                  {isTakingKey
                    ? 'Đang xử lý...'
                    : isAdmin && adminReleaseMode === 'direct'
                    ? '⚡ XUẤT KEY NGAY'
                    : isAdmin && adminReleaseMode === 'request'
                    ? '📝 GỬI YÊU CẦU ĐỂ ADMIN DUYỆT'
                    : 'GỬI YÊU CẦU ĐẾN ADMIN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: THÊM KEY VÀO KHO (ADMIN ONLY) */}
      {/* ========================================================================= */}
      {isAddKeyModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-2xl shadow-2xl border border-[#E8E2D9] w-full max-w-lg overflow-hidden animate-fade-in font-sans">
            <div className="p-4 bg-[#2B1810] text-white flex items-center justify-between">
              <h3 className="text-sm font-black tracking-tight text-white uppercase">
                NHẬP KEY VÀO KHO BẢN QUYỀN
              </h3>
              <button
                type="button"
                onClick={() => setIsAddKeyModalOpen(false)}
                className="text-white/80 hover:text-white text-xs font-bold px-2 py-1 rounded bg-white/10"
              >
                Đóng
              </button>
            </div>

            <form onSubmit={handleAddKeySubmit} className="p-5 space-y-4 text-xs">
              <div className="flex items-center gap-2 border-b border-[#E8E2D9] pb-3">
                <button
                  type="button"
                  onClick={() => setKeyInputType('batch')}
                  className={`flex-1 py-2 rounded-lg font-bold text-center transition-all ${
                    keyInputType === 'batch'
                      ? 'bg-[#C0392B] text-white'
                      : 'bg-white border border-[#E8E2D9] text-[#6E5D53]'
                  }`}
                >
                  NHẬP HÀNG LOẠT (PASTE DANH SÁCH)
                </button>
                <button
                  type="button"
                  onClick={() => setKeyInputType('single')}
                  className={`flex-1 py-2 rounded-lg font-bold text-center transition-all ${
                    keyInputType === 'single'
                      ? 'bg-[#C0392B] text-white'
                      : 'bg-white border border-[#E8E2D9] text-[#6E5D53]'
                  }`}
                >
                  NHẬP 01 KEY LẺ
                </button>
              </div>

              <div>
                <label className="block font-bold text-[#2B1810] mb-1">
                  CHỌN PHÂN LOẠI KEY *
                </label>
                <select
                  value={targetCatId}
                  onChange={(e) => setTargetCatId(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg bg-white text-[#2B1810] font-bold"
                >
                  {keyCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {(() => {
                  const cat = keyCategories.find((c) => c.id === targetCatId);
                  if (!cat || (cat.default_import_price == null && cat.default_unit_price == null)) return null;
                  return (
                    <span className="text-[11px] text-[#6E5D53] mt-1 block">
                      Giá mặc định của phân loại — nhập:{' '}
                      {cat.default_import_price != null ? `${cat.default_import_price.toLocaleString('vi-VN')} đ` : '—'} · bán:{' '}
                      {cat.default_unit_price != null ? `${cat.default_unit_price.toLocaleString('vi-VN')} đ` : '—'} (đã tự điền bên dưới, sửa được nếu cần)
                    </span>
                  );
                })()}
              </div>

              {keyInputType === 'single' ? (
                <div>
                  <label className="block font-bold text-[#2B1810] mb-1">
                    MÃ LICENSE KEY *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: VK7JG-NPHTM-C97JM-9MPGT-3V66T"
                    value={singleKeyCode}
                    onChange={(e) => setSingleKeyCode(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg bg-white text-[#2B1810] font-mono font-bold"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-[#2B1810] mb-1">
                    DANH SÁCH KEY (MỖI DÒNG MỘT MÃ) *
                  </label>
                  <textarea
                    rows={6}
                    required
                    placeholder="VK7JG-NPHTM-C97JM-9MPGT-3V66T&#10;W269N-WFGWX-YVC9B-4J6C9-T83GX&#10;MH37W-N47XK-V7XM9-C7227-GCQG9"
                    value={batchKeysText}
                    onChange={(e) => setBatchKeysText(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg bg-white text-[#2B1810] font-mono"
                  />
                  <span className="text-[11px] text-[#6E5D53] mt-1 block">
                    Hệ thống sẽ tự động lọc dòng trống và thêm từng key vào kho sẵn sàng.
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#2B1810] mb-1">
                    GIÁ ĐẦU VÀO / KEY (VNĐ)
                  </label>
                  <PricePreview value={keyImportPrice} label="Giá đầu vào" tone="rose" />
                  <input
                    type="number"
                    min={0}
                    step={10000}
                    value={keyImportPrice}
                    onChange={(e) => setKeyImportPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg bg-white text-[#2B1810] font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#2B1810] mb-1">
                    GIÁ BÁN THAM CHIẾU (VNĐ)
                  </label>
                  <PricePreview value={keyUnitPrice} label="Giá bán" tone="emerald" />
                  <input
                    type="number"
                    min={0}
                    step={10000}
                    value={keyUnitPrice}
                    onChange={(e) => setKeyUnitPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg bg-white text-[#2B1810] font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddKeyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[#6E5D53] hover:bg-slate-100 font-bold"
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#2B1810] hover:bg-black text-white font-bold transition-all shadow-xs"
                >
                  LƯU VÀO KHO KEY
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: THÊM PHÂN LOẠI MỚI / MERGE DROPDOWN (ADMIN ONLY) */}
      {/* ========================================================================= */}
      {isAddCategoryModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-2xl shadow-2xl border border-[#E8E2D9] w-full max-w-lg overflow-hidden animate-fade-in font-sans">
            <div className="p-4 bg-[#2B1810] text-white flex items-center justify-between">
              <h3 className="text-sm font-black tracking-tight text-white uppercase">
                THÊM PHÂN LOẠI BẢN QUYỀN MỚI
              </h3>
              <button
                type="button"
                onClick={() => setIsAddCategoryModalOpen(false)}
                className="text-white/80 hover:text-white text-xs font-bold px-2 py-1 rounded bg-white/10"
              >
                Đóng
              </button>
            </div>

            <form onSubmit={handleAddCategorySubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#2B1810] mb-1">
                  NHÓM PHẦN MỀM *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCatCategoryType('windows');
                      setCatSelectedPreset('WINDOWS 11 PROFESSIONAL');
                    }}
                    className={`py-2 rounded-lg font-bold text-center transition-all ${
                      catCategoryType === 'windows'
                        ? 'bg-[#C0392B] text-white'
                        : 'bg-white border border-[#E8E2D9] text-[#6E5D53]'
                    }`}
                  >
                    WINDOWS
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCatCategoryType('office');
                      setCatSelectedPreset('OFFICE PRO PLUS 2021');
                    }}
                    className={`py-2 rounded-lg font-bold text-center transition-all ${
                      catCategoryType === 'office'
                        ? 'bg-[#C0392B] text-white'
                        : 'bg-white border border-[#E8E2D9] text-[#6E5D53]'
                    }`}
                  >
                    OFFICE
                  </button>
                  <button
                    type="button"
                    onClick={() => setCatCategoryType('others')}
                    className={`py-2 rounded-lg font-bold text-center transition-all ${
                      catCategoryType === 'others'
                        ? 'bg-[#C0392B] text-white'
                        : 'bg-white border border-[#E8E2D9] text-[#6E5D53]'
                    }`}
                  >
                    OTHERS (KHÁC)
                  </button>
                </div>
              </div>

              {catCategoryType === 'others' ? (
                <div>
                  <label className="block font-bold text-[#2B1810] mb-1">
                    TÊN PHÂN LOẠI MỚI (TỰ NHẬP) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: WINDOWS SERVER 2022 DATACENTER, OFFICE 2019..."
                    value={catCustomName}
                    onChange={(e) => setCatCustomName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg bg-white text-[#2B1810] font-bold uppercase"
                  />
                  <span className="text-[11px] text-[#6E5D53] mt-1 block">
                    Hệ thống sẽ kiểm tra với cơ sở dữ liệu: nếu trùng khớp với phân loại đã có, nó sẽ tự động merge dữ liệu. Nếu chưa có, phân loại mới sẽ được thêm vào dropdown list.
                  </span>
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-[#2B1810] mb-1">
                    PHIÊN BẢN CÓ SẴN TRONG HỆ THỐNG *
                  </label>
                  <select
                    value={catSelectedPreset}
                    onChange={(e) => setCatSelectedPreset(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg bg-white text-[#2B1810] font-bold"
                  >
                    {catCategoryType === 'windows' ? (
                      <>
                        <option value="WINDOWS 11 PROFESSIONAL">WINDOWS 11 PROFESSIONAL</option>
                        <option value="WINDOWS 11 HOME">WINDOWS 11 HOME</option>
                        <option value="WINDOWS 10 PROFESSIONAL">WINDOWS 10 PROFESSIONAL</option>
                      </>
                    ) : (
                      <>
                        <option value="OFFICE PRO PLUS 2024">OFFICE PRO PLUS 2024</option>
                        <option value="OFFICE PRO PLUS 2021">OFFICE PRO PLUS 2021</option>
                        <option value="OFFICE PRO PLUS 2019">OFFICE PRO PLUS 2019</option>
                        <option value="MICROSOFT 365 FAMILY">MICROSOFT 365 FAMILY</option>
                      </>
                    )}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-[#2B1810] mb-1">
                  MÔ TẢ ĐẶC TÍNH KEY *
                </label>
                <textarea
                  rows={3}
                  required
                  value={catDescription}
                  onChange={(e) => setCatDescription(e.target.value)}
                  placeholder="Kích hoạt được chỉ cho 01 máy, không thể sử dụng lại trên máy khác"
                  className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg bg-white text-[#2B1810]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#2B1810] mb-1">
                    GIÁ NHẬP MẶC ĐỊNH / KEY (VNĐ)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={10000}
                    value={catDefaultImportPrice}
                    onChange={(e) => setCatDefaultImportPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg bg-white text-[#2B1810] font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#2B1810] mb-1">
                    GIÁ BÁN MẶC ĐỊNH / KEY (VNĐ)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={10000}
                    value={catDefaultUnitPrice}
                    onChange={(e) => setCatDefaultUnitPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg bg-white text-[#2B1810] font-mono font-bold"
                  />
                </div>
              </div>
              <span className="text-[11px] text-[#6E5D53] block">
                Để 0 = chưa đặt giá mặc định. Giá mặc định sẽ tự điền vào form mỗi khi thêm key thuộc phân loại này.
              </span>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[#6E5D53] hover:bg-slate-100 font-bold"
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white font-bold transition-all shadow-xs"
                >
                  LƯU PHÂN LOẠI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SỬA GIÁ TỪNG KEY */}
      {/* ========================================================================= */}
      {priceEditKey && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-2xl shadow-2xl border border-[#E8E2D9] w-full max-w-md overflow-hidden animate-fade-in font-sans">
            <div className="p-4 bg-[#0F4C5C] text-white flex items-center justify-between">
              <h3 className="text-sm font-black tracking-tight text-white uppercase">SỬA GIÁ KEY</h3>
              <button
                type="button"
                onClick={() => setPriceEditKey(null)}
                className="text-white/80 hover:text-white text-xs font-bold px-2 py-1 rounded bg-white/10"
              >
                Đóng
              </button>
            </div>
            <form
              className="p-5 space-y-4 text-xs"
              onSubmit={async (e) => {
                e.preventDefault();
                await updateLicenseKey(priceEditKey.id, {
                  import_price: priceEditImport,
                  unit_price: priceEditUnit,
                });
                triggerFeedback(`Đã cập nhật giá cho key ${priceEditKey.license_code}.`);
                setPriceEditKey(null);
              }}
            >
              <div className="font-mono font-bold text-[#2B1810] break-all">{priceEditKey.license_code}</div>
              <div>
                <label className="block font-bold text-[#2B1810] mb-1">GIÁ NHẬP / KEY (VNĐ)</label>
                <PricePreview value={priceEditImport} label="Giá đầu vào" tone="rose" />
                <input
                  type="number"
                  min={0}
                  step={10000}
                  value={priceEditImport}
                  onChange={(e) => setPriceEditImport(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg bg-white text-[#2B1810] font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-[#2B1810] mb-1">GIÁ BÁN / KEY (VNĐ)</label>
                <PricePreview value={priceEditUnit} label="Giá bán" tone="emerald" />
                <input
                  type="number"
                  min={0}
                  step={10000}
                  value={priceEditUnit}
                  onChange={(e) => setPriceEditUnit(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg bg-white text-[#2B1810] font-mono font-bold"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPriceEditKey(null)}
                  className="px-4 py-2 rounded-xl text-[#6E5D53] hover:bg-slate-100 font-bold"
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0F4C5C] hover:bg-[#0B3A47] text-white font-bold transition-all shadow-xs"
                >
                  LƯU GIÁ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: QUẢN LÝ GIÁ THEO PHÂN LOẠI (giá mặc định + cập nhật hàng loạt) */}
      {/* ========================================================================= */}
      {priceCatEdit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-2xl shadow-2xl border border-[#E8E2D9] w-full max-w-md overflow-hidden animate-fade-in font-sans">
            <div className="p-4 bg-[#0F4C5C] text-white flex items-center justify-between">
              <h3 className="text-sm font-black tracking-tight text-white uppercase">QUẢN LÝ GIÁ — PHÂN LOẠI</h3>
              <button
                type="button"
                onClick={() => setPriceCatEdit(null)}
                className="text-white/80 hover:text-white text-xs font-bold px-2 py-1 rounded bg-white/10"
              >
                Đóng
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div className="font-black uppercase text-[#2B1810]">{priceCatEdit.name}</div>
              <div>
                <label className="block font-bold text-[#2B1810] mb-1">GIÁ NHẬP MẶC ĐỊNH / KEY (VNĐ)</label>
                <PricePreview value={priceCatImport} label="Giá đầu vào" tone="rose" />
                <input
                  type="number"
                  min={0}
                  step={10000}
                  value={priceCatImport}
                  onChange={(e) => setPriceCatImport(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg bg-white text-[#2B1810] font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-[#2B1810] mb-1">GIÁ BÁN MẶC ĐỊNH / KEY (VNĐ)</label>
                <PricePreview value={priceCatUnit} label="Giá bán" tone="emerald" />
                <input
                  type="number"
                  min={0}
                  step={10000}
                  value={priceCatUnit}
                  onChange={(e) => setPriceCatUnit(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg bg-white text-[#2B1810] font-mono font-bold"
                />
              </div>
              <span className="text-[11px] text-[#6E5D53] block">
                Để 0 = xoá giá mặc định. Giá mặc định chỉ tự điền khi thêm key mới, không tự thay đổi giá các key đã có.
              </span>
              <div className="pt-1 flex flex-col gap-2">
                <button
                  type="button"
                  disabled={priceCatBusy}
                  onClick={async () => {
                    setPriceCatBusy(true);
                    await updateKeyCategory({
                      ...priceCatEdit,
                      default_import_price: priceCatImport > 0 ? priceCatImport : null,
                      default_unit_price: priceCatUnit > 0 ? priceCatUnit : null,
                    });
                    setPriceCatBusy(false);
                    triggerFeedback(`Đã lưu giá mặc định cho phân loại ${priceCatEdit.name}.`);
                    setPriceCatEdit(null);
                  }}
                  className="w-full px-5 py-2.5 rounded-xl bg-[#0F4C5C] hover:bg-[#0B3A47] text-white font-bold transition-all shadow-xs disabled:opacity-50"
                >
                  LƯU GIÁ MẶC ĐỊNH
                </button>
                <button
                  type="button"
                  disabled={priceCatBusy}
                  onClick={async () => {
                    const availableCount = licenseKeys.filter(
                      (k) => k.category_id === priceCatEdit.id && k.status === 'available'
                    ).length;
                    if (availableCount === 0) {
                      alert('Phân loại này hiện không có key nào đang SẴN SÀNG.');
                      return;
                    }
                    if (
                      !confirm(
                        `Áp dụng giá nhập ${priceCatImport.toLocaleString('vi-VN')} đ và giá bán ${priceCatUnit.toLocaleString('vi-VN')} đ cho toàn bộ ${availableCount} key đang SẴN SÀNG của phân loại ${priceCatEdit.name}? Key đã xuất/kích hoạt không bị ảnh hưởng.`
                      )
                    ) {
                      return;
                    }
                    setPriceCatBusy(true);
                    const res = await bulkUpdateKeyPrices(priceCatEdit.id, priceCatImport, priceCatUnit);
                    setPriceCatBusy(false);
                    triggerFeedback(res.message);
                    if (res.success) setPriceCatEdit(null);
                  }}
                  className="w-full px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-all shadow-xs disabled:opacity-50"
                >
                  ÁP DỤNG CHO KEY ĐANG SẴN SÀNG (HÀNG LOẠT)
                </button>
                <button
                  type="button"
                  onClick={() => setPriceCatEdit(null)}
                  className="w-full px-4 py-2 rounded-xl text-[#6E5D53] hover:bg-slate-100 font-bold"
                >
                  ĐÓNG
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: BÁO CÁO KEY LỖI (FAULTY CONFIRMATION) */}
      {/* ========================================================================= */}
      {faultyModalReq && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-2xl shadow-2xl border-2 border-[#C0392B] w-full max-w-md overflow-hidden animate-fade-in font-sans">
            <div className="p-4 bg-[#C0392B] text-white flex items-center justify-between">
              <h3 className="text-sm font-black tracking-tight text-white uppercase">
                XÁC NHẬN KEY KHÔNG HOẠT ĐỘNG
              </h3>
              <button
                type="button"
                onClick={() => setFaultyModalReq(null)}
                className="text-white/80 hover:text-white text-xs font-bold px-2 py-1 rounded bg-black/20"
              >
                Đóng
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-[#6E5D53]">
                Hệ thống sẽ ghi nhận mã key <strong className="font-mono text-[#2B1810]">{faultyModalReq.assigned_key_code}</strong> vào danh sách key lỗi và tự động yêu cầu Admin cấp key mới ngay lập tức.
              </p>

              {licenseKeys.filter(
                (k) => k.category_id === faultyModalReq.category_id && k.status === 'available'
              ).length === 0 && (
                <div className="p-3 bg-red-50 border-2 border-red-400 rounded-xl text-red-950 flex items-start gap-2 animate-pulse">
                  <span className="text-base leading-none shrink-0 mt-0.5">⚠️</span>
                  <div className="text-xs">
                    <div className="font-black uppercase text-red-900">
                      CẢNH BÁO KHO: VOLUME = 0 (HẾT KEY THAY THẾ)
                    </div>
                    <div className="text-red-800 mt-0.5">
                      Kho hiện tại không còn key khả dụng cho <strong>{faultyModalReq.category_name}</strong>. Khi bạn gửi báo lỗi, Admin sẽ nhận được yêu cầu nạp thêm kho trước khi cấp bù cho bạn.
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-[#2B1810] mb-1">
                  NGUYÊN NHÂN / THÔNG BÁO LỖI *
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="VD: Báo lỗi 0xC004C008, mã key đã kích hoạt trên máy khác..."
                  value={faultyReasonInput}
                  onChange={(e) => setFaultyReasonInput(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg bg-white text-[#2B1810] focus:ring-2 focus:ring-[#C0392B] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFaultyModalReq(null)}
                  className="px-4 py-2 rounded-xl text-[#6E5D53] hover:bg-slate-100 font-bold"
                >
                  QUAY LẠI
                </button>
                <button
                  type="button"
                  onClick={handleConfirmFaulty}
                  className="px-5 py-2.5 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white font-bold transition-all shadow-xs"
                >
                  XÁC NHẬN &amp; TỰ ĐỘNG XIN CẤP LẠI
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
