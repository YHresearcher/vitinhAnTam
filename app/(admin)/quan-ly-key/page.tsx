'use client';

import React, { useState, useMemo } from 'react';
import { useViTinhAnTamStore } from '@/lib/store';
import { KeyCategory, KeyReleaseRequest } from '@/lib/supabase';
import { PricePreview } from '@/components/PricePreview';

export default function QuanLyKeyPage() {
  const {
    currentUser,
    keyCategories,
    licenseKeys,
    keyReleaseRequests,
    keyEmailTemplate,
    addKeyCategory,
    deleteKeyCategory,
    addLicenseKey,
    addBatchLicenseKeys,
    deleteLicenseKey,
    takeKeyForCustomer,
    approveKeyReleaseRequest,
    confirmKeyActive,
    reportKeyFaulty,
    rejectKeyReleaseRequest,
    updateKeyEmailTemplate,
  } = useViTinhAnTamStore();

  const isAdmin = currentUser.role === 'admin';

  // Active Tab
  const [activeTab, setActiveTab] = useState<'requests' | 'inventory' | 'email'>('requests');

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

  // Form states: Lấy key trực tiếp cho khách
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

  // Form states: Email template
  const [emailForm, setEmailForm] = useState(keyEmailTemplate);
  const [isSavingEmail, setIsSavingEmail] = useState(false);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Submit Handler: LẤY KEY trực tiếp cho khách (bỏ qua bước tạo yêu cầu + duyệt)
  const handleTakeKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqCustomerEmail.trim()) {
      alert('Bắt buộc phải có email khách hàng để hệ thống gửi key cho khách!');
      return;
    }
    setIsTakingKey(true);
    const res = await takeKeyForCustomer({
      customer_name: reqCustomerName,
      customer_phone: reqCustomerPhone,
      customer_email: reqCustomerEmail,
      category_id: reqCategoryId,
    });
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
    });

    triggerFeedback(`Đã lưu phân loại: ${created.name}`);
    setIsAddCategoryModalOpen(false);
    setCatCustomName('');
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

  // Submit Handler: Email Template Save
  const handleSaveEmailTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingEmail(true);
    await updateKeyEmailTemplate(emailForm);
    setIsSavingEmail(false);
    triggerFeedback('Đã cập nhật cấu hình email gửi key thành công!');
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
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#C0392B] mb-1">
            LẤY KEY TRỰC TIẾP TỪ KHO &amp; BÀN GIAO CHO KHÁCH
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#2B1810] tracking-tight">
            QUẢN LÝ KHO KEY BẢN QUYỀN WINDOWS &amp; OFFICE
          </h1>
          <p className="text-xs text-[#6E5D53] mt-1 max-w-2xl">
            Chọn &quot;LẤY KEY&quot; để bốc ngay 1 key còn sẵn trong kho cho khách hàng — không cần tạo yêu cầu rồi chờ duyệt. Sau đó xác nhận hoạt động và gửi key qua email.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Lấy key trực tiếp cho khách — không còn bước tạo yêu cầu + chờ duyệt */}
          <button
            type="button"
            onClick={() => setIsTakeKeyModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white text-xs font-bold transition-all shadow-xs"
          >
            LẤY KEY
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

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
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
          LỊCH SỬ LẤY KEY &amp; TRẠNG THÁI ({keyReleaseRequests.length})
        </button>

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

        {isAdmin && (
          <button
            type="button"
            onClick={() => setActiveTab('email')}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'email'
                ? 'border-[#C0392B] text-[#C0392B] bg-[#FFFDF9]'
                : 'border-transparent text-[#6E5D53] hover:text-[#2B1810]'
            }`}
          >
            CẤU HÌNH MẪU EMAIL GỬI KEY
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
                CẦN XỬ LÝ / KEY LỖI (
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
                    ? 'bg-amber-700 text-white'
                    : 'bg-white border border-[#E8E2D9] text-[#6E5D53] hover:border-amber-700'
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
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black bg-[#FAF7F2] px-2.5 py-1 rounded-lg border border-[#E8E2D9] text-[#2B1810]">
                          {req.request_code}
                        </span>
                        <h3 className="text-sm font-black text-[#2B1810] uppercase">
                          {req.category_name}
                        </h3>
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
                          {req.requester_role === 'technician' ? 'Kỹ thuật viên' : req.requester_role === 'sales' ? 'Kinh doanh (Sales)' : 'Quản trị viên'}
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
                      <div className="mt-3 flex items-center gap-2 pt-2">
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
                          className="px-4 py-2 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white text-xs font-bold transition-all shadow-xs"
                        >
                          LẤY KEY THAY THẾ / CẤP NGAY
                        </button>
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
                    {isAdmin && <th className="py-3 px-4 text-right">THAO TÁC</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E2D9]">
                  {filteredKeys.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#6E5D53]">
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
                          {k.status === 'reserved' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              ĐANG CHỜ ACTIVE
                            </span>
                          )}
                          {k.status === 'activated' && (
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
                          {k.customer_name ? (
                            <div>
                              <div className="font-bold text-[#2B1810]">{k.customer_name}</div>
                              <div className="text-[11px] font-mono text-[#0F4C5C]">{k.customer_email}</div>
                            </div>
                          ) : (
                            <span className="italic text-slate-400">Chưa cấp</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-[#6E5D53]">
                          {new Date(k.created_at).toLocaleDateString('vi-VN')}
                        </td>
                        {isAdmin && (
                          <td className="py-3 px-4 text-right">
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
      {/* TAB 3: CẤU HÌNH MẪU EMAIL GỬI KEY (ADMIN ONLY) */}
      {/* ========================================================================= */}
      {activeTab === 'email' && isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Edit Form */}
          <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#E8E2D9] shadow-xs space-y-4">
            <div className="border-b border-[#E8E2D9] pb-3">
              <h3 className="text-sm font-black text-[#2B1810]">
                CHỈNH SỬA MẪU EMAIL GỬI KEY CHO KHÁCH
              </h3>
              <p className="text-xs text-[#6E5D53] mt-0.5">
                Khi kỹ thuật viên xác nhận key hoạt động, hệ thống sẽ tự động gửi email với nội dung bên dưới đến địa chỉ email của khách hàng.
              </p>
            </div>

            <form onSubmit={handleSaveEmailTemplate} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2B1810] mb-1">
                    TÊN NGƯỜI GỬI (SENDER NAME) *
                  </label>
                  <input
                    type="text"
                    required
                    value={emailForm.sender_name}
                    onChange={(e) => setEmailForm({ ...emailForm, sender_name: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg bg-white text-[#2B1810] focus:ring-2 focus:ring-[#C0392B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#2B1810] mb-1">
                    EMAIL NGƯỜI GỬI (SENDER EMAIL) *
                  </label>
                  <input
                    type="email"
                    required
                    value={emailForm.sender_email}
                    onChange={(e) => setEmailForm({ ...emailForm, sender_email: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg bg-white text-[#2B1810] focus:ring-2 focus:ring-[#C0392B] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#2B1810] mb-1">
                  TIÊU ĐỀ EMAIL (SUBJECT) *
                </label>
                <input
                  type="text"
                  required
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg bg-white text-[#2B1810] focus:ring-2 focus:ring-[#C0392B] focus:outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2B1810] mb-1">
                    HOTLINE HỖ TRỢ KỸ THUẬT *
                  </label>
                  <input
                    type="text"
                    value={emailForm.support_phone}
                    onChange={(e) => setEmailForm({ ...emailForm, support_phone: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg bg-white text-[#2B1810] focus:ring-2 focus:ring-[#C0392B] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#2B1810] mb-1">
                    ZALO CSKH HỖ TRỢ *
                  </label>
                  <input
                    type="text"
                    value={emailForm.support_zalo}
                    onChange={(e) => setEmailForm({ ...emailForm, support_zalo: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg bg-white text-[#2B1810] focus:ring-2 focus:ring-[#C0392B] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#2B1810] mb-1">
                  NỘI DUNG MẪU EMAIL (TEMPLATE BODY) *
                </label>
                <textarea
                  rows={10}
                  required
                  value={emailForm.content_template}
                  onChange={(e) => setEmailForm({ ...emailForm, content_template: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg bg-white text-[#2B1810] focus:ring-2 focus:ring-[#C0392B] focus:outline-none font-mono text-xs leading-relaxed"
                />
                <div className="mt-1.5 p-2 bg-[#FAF7F2] rounded-lg border border-[#E8E2D9] text-[11px] text-[#6E5D53] space-y-1">
                  <span className="font-bold text-[#2B1810]">Các biến thay thế tự động có sẵn:</span>
                  <div className="flex flex-wrap gap-1.5 font-mono text-[10px] text-[#C0392B]">
                    <span>{'{TEN_KHACH_HANG}'}</span>
                    <span>{'{TEN_SAN_PHAM}'}</span>
                    <span>{'{MA_KEY}'}</span>
                    <span>{'{HUONG_DAN_KICH_HOAT}'}</span>
                    <span>{'{HOTLINE_HO_TRO}'}</span>
                    <span>{'{ZALO_HO_TRO}'}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingEmail}
                  className="px-6 py-2.5 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-xs transition-all shadow-xs"
                >
                  {isSavingEmail ? 'Đang lưu...' : 'LƯU CẤU HÌNH MẪU EMAIL'}
                </button>
              </div>
            </form>
          </div>

          {/* Live Preview Panel */}
          <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#E8E2D9] shadow-xs space-y-4">
            <div className="border-b border-[#E8E2D9] pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[#2B1810]">
                  XEM TRƯỚC GIAO DIỆN EMAIL THỰC TẾ (LIVE PREVIEW)
                </h3>
                <p className="text-xs text-[#6E5D53] mt-0.5">
                  Mô phỏng bức thư điện tử hiển thị trong hộp thư đến của khách hàng.
                </p>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                CHUẨN HTML RESPONSIVE
              </span>
            </div>

            {/* Email Shell */}
            <div className="rounded-xl border border-[#E8E2D9] overflow-hidden bg-white shadow-sm font-sans text-xs">
              {/* Email Client Header */}
              <div className="bg-[#FAF7F2] p-3 border-b border-[#E8E2D9] space-y-1 text-[11px]">
                <div>
                  <span className="text-[#6E5D53]">Người gửi: </span>
                  <strong className="text-[#2B1810]">
                    {emailForm.sender_name} &lt;{emailForm.sender_email}&gt;
                  </strong>
                </div>
                <div>
                  <span className="text-[#6E5D53]">Tiêu đề: </span>
                  <strong className="text-[#C0392B]">{emailForm.subject}</strong>
                </div>
                <div>
                  <span className="text-[#6E5D53]">Người nhận: </span>
                  <strong className="text-[#2B1810]">anh.tuan.kế_toán@gmail.com</strong>
                </div>
              </div>

              {/* Email Client Body */}
              <div className="p-6 space-y-4 bg-white text-[#2B1810]">
                {/* Brand Banner */}
                <div className="p-4 rounded-xl bg-[#2B1810] text-white flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-amber-400">
                      BÀN GIAO BẢN QUYỀN CHÍNH HÃNG
                    </div>
                    <div className="text-base font-black tracking-tight text-white mt-0.5">
                      VI TÍNH AN TÂM
                    </div>
                  </div>
                  <span className="text-xs font-mono text-white/80">
                    Bảo hành trọn đời
                  </span>
                </div>

                {/* Rendered Template */}
                <div className="whitespace-pre-line leading-relaxed text-[#2B1810] font-sans">
                  {emailForm.content_template
                    .replace('{TEN_KHACH_HANG}', 'Anh Tuấn')
                    .replace('{TEN_SAN_PHAM}', 'WINDOWS 11 PROFESSIONAL')
                    .replace('{MA_KEY}', 'VK7JG-NPHTM-C97JM-9MPGT-3V66T')
                    .replace(
                      '{HUONG_DAN_KICH_HOAT}',
                      '1. Mở Cài đặt (Settings) -> System -> Activation.\n2. Bấm "Change product key" và dán mã trên vào ô nhập liệu.\n3. Bấm Activate để hoàn tất kích hoạt.'
                    )
                    .replace('{HOTLINE_HO_TRO}', emailForm.support_phone)
                    .replace('{ZALO_HO_TRO}', emailForm.support_zalo)}
                </div>

                {/* Footer Signature */}
                <div className="pt-4 border-t border-[#E8E2D9] text-[11px] text-[#6E5D53]">
                  <div><strong>TRUNG TÂM MÁY TÍNH VI TÍNH AN TÂM</strong></div>
                  <div>Địa chỉ: 45 Nguyễn Huệ, Phường 1, Tân An, Long An</div>
                  <div>Hotline hỗ trợ kỹ thuật: {emailForm.support_phone}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: LẤY KEY TRỰC TIẾP TỪ KHO CHO KHÁCH HÀNG (KHÔNG CẦN DUYỆT) */}
      {/* ========================================================================= */}
      {isTakeKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-2xl shadow-2xl border border-[#E8E2D9] w-full max-w-lg overflow-hidden animate-fade-in font-sans">
            <div className="p-4 bg-[#C0392B] text-white flex items-center justify-between">
              <h3 className="text-sm font-black tracking-tight text-white uppercase">
                LẤY KEY TỪ KHO BẢN QUYỀN
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
              <p className="text-[#6E5D53]">
                Hệ thống sẽ bốc ngay 1 key đang <strong>còn sẵn trong kho</strong> và gán cho khách hàng.
                Không cần tạo yêu cầu rồi chờ Admin duyệt.
              </p>

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
                        {c.name} (Kho còn {count} key)
                      </option>
                    );
                  })}
                </select>
              </div>

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
                  className="px-5 py-2.5 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white font-bold transition-all shadow-xs"
                >
                  {isTakingKey ? 'Đang bốc key...' : 'LẤY KEY NGAY'}
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
