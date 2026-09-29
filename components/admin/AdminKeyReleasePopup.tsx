'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useViTinhAnTamStore } from '@/lib/store';
import { KeyReleaseRequest } from '@/lib/supabase';
import { KeyRound, Check, Copy, AlertTriangle } from 'lucide-react';

export function AdminKeyReleasePopup() {
  const {
    currentUser,
    keyReleaseRequests,
    licenseKeys,
    approveKeyReleaseRequest,
    rejectKeyReleaseRequest,
  } = useViTinhAnTamStore();

  const isAdmin = currentUser?.role === 'admin';

  const pendingRequests = useMemo(() => {
    return keyReleaseRequests.filter(
      (r) =>
        r.status === 'pending' ||
        r.status === 'auto_re_requested' ||
        r.status === 'faulty_re_requesting'
    );
  }, [keyReleaseRequests]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReasonInput, setRejectReasonInput] = useState('');
  const [approvedResult, setApprovedResult] = useState<{
    requestId: string;
    keyCode: string;
    customerName: string;
    categoryName: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (currentIndex >= pendingRequests.length && pendingRequests.length > 0) {
      setCurrentIndex(pendingRequests.length - 1);
    }
  }, [pendingRequests.length, currentIndex]);

  const prevCountRef = useRef(0);
  const prevAdminRef = useRef(isAdmin);
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (!isAdmin) {
      setIsOpen(false);
      prevAdminRef.current = false;
      return;
    }

    if (pendingRequests.length > 0) {
      if (isFirstMount.current || !prevAdminRef.current || pendingRequests.length > prevCountRef.current) {
        setIsOpen(true);

        try {
          const AudioCtx =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof window.AudioContext })
              .webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx();
            if (ctx.state === 'suspended') {
              ctx.resume();
            }
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, ctx.currentTime);
            osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
            gain.gain.setValueAtTime(0.18, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.45);
          }
        } catch {
          // Silently ignore
        }
      }
    }
    isFirstMount.current = false;
    prevAdminRef.current = true;
    prevCountRef.current = pendingRequests.length;
  }, [pendingRequests.length, isAdmin]);

  if (!isAdmin || (pendingRequests.length === 0 && !approvedResult)) {
    return null;
  }

  const currentReq: KeyReleaseRequest | undefined =
    pendingRequests[currentIndex] || pendingRequests[0];

  const availableCount = currentReq
    ? licenseKeys.filter(
        (k) => k.category_id === currentReq.category_id && k.status === 'available'
      ).length
    : 0;

  const isFaultyReplacement =
    currentReq?.status === 'auto_re_requested' ||
    currentReq?.status === 'faulty_re_requesting';

  const hasAnyFaulty = pendingRequests.some(
    (r) => r.status === 'auto_re_requested' || r.status === 'faulty_re_requesting'
  );

  const handleCopy = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleApprove = async () => {
    if (!currentReq) return;
    if (availableCount === 0) {
      alert(`Trong kho đã hết key cho "${currentReq.category_name}". Vui lòng nhập thêm key vào kho trước khi xuất!`);
      return;
    }
    setIsApproving(true);
    const res = await approveKeyReleaseRequest(currentReq.id);
    setIsApproving(false);

    if (res.success && res.key) {
      setApprovedResult({
        requestId: currentReq.id,
        keyCode: res.key.license_code,
        customerName: currentReq.customer_name,
        categoryName: currentReq.category_name,
      });
      setIsOpen(true);
    } else {
      alert(res.message);
    }
  };

  const handleReject = async () => {
    if (!currentReq) return;
    if (!rejectReasonInput.trim()) {
      alert('Vui lòng nhập lý do từ chối yêu cầu!');
      return;
    }
    await rejectKeyReleaseRequest(currentReq.id, rejectReasonInput.trim());
    setIsRejecting(false);
    setRejectReasonInput('');
  };

  const renderSuccessBanner = () => (
    <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-4 text-center space-y-3 animate-fade-in shadow-inner">
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-600 text-white font-black text-lg shadow-md">
        <Check className="w-6 h-6 stroke-[3]" />
      </div>
      <div>
        <div className="text-xs font-black text-emerald-900 uppercase tracking-wide">
          ĐÃ XUẤT KEY THÀNH CÔNG CHO KHÁCH HÀNG!
        </div>
        <div className="text-[11px] text-emerald-700 mt-0.5">
          {approvedResult?.customerName} • {approvedResult?.categoryName}
        </div>
      </div>

      <div className="p-3 bg-white rounded-xl border border-emerald-300 font-mono text-sm sm:text-base font-black text-emerald-800 break-all select-all tracking-wider shadow-xs">
        {approvedResult?.keyCode}
      </div>

      <p className="text-[11px] text-slate-600 italic">
        Key đã được chuyển tới popup kiểm tra của nhân viên để kích hoạt và gửi email bàn giao cho khách.
      </p>

      <div className="flex items-center justify-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => handleCopy(approvedResult?.keyCode || '')}
          className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? '✓ ĐÃ COPY MÃ' : 'SAO CHÉP MÃ KEY'}</span>
        </button>
        <button
          type="button"
          onClick={() => setApprovedResult(null)}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
        >
          ĐÓNG
        </button>
      </div>
    </div>
  );

  const renderDetails = () => (
    <>
      <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-2.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
              BẢN QUYỀN YÊU CẦU:
            </div>
            <div className="text-sm font-black text-[#2B1810] mt-0.5">
              {currentReq.category_name}
            </div>
          </div>
          <div className="text-right shrink-0">
            <span
              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                availableCount === 0
                  ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                  : availableCount <= 2
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              {availableCount === 0
                ? 'HẾT KEY (Vol: 0)'
                : availableCount <= 2
                ? `⚡ SẮP HẾT (Còn ${availableCount})`
                : `Kho: ${availableCount}`}
            </span>
          </div>
        </div>
        {isFaultyReplacement && currentReq.faulty_reason && (
          <div className="mt-1.5 pt-1.5 border-t border-amber-200/60 text-[11px] text-rose-700">
            <strong className="font-bold text-rose-900">Lý do: </strong>
            {currentReq.faulty_reason}
          </div>
        )}
      </div>

      {availableCount === 0 && (
        <div className="p-2.5 bg-red-100 border border-red-400 rounded-xl flex items-start gap-2 text-red-900 animate-pulse">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-tight">
            <div className="font-black text-red-950 uppercase">🚨 KHO HẾT KEY (VOLUME = 0):</div>
            <div className="mt-0.5 text-red-800">
              Không thể {isFaultyReplacement ? 'cấp đổi' : 'xuất'} key lúc này vì kho đã hết. Vui lòng nạp thêm key vào kho.
            </div>
          </div>
        </div>
      )}

      {availableCount > 0 && availableCount <= 2 && (
        <div className="p-2 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2 text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-tight">
            <span className="font-bold text-amber-950">⚠️ CẢNH BÁO TỒN KHO THẤP:</span> Kho chỉ còn <strong>{availableCount}</strong> key khả dụng. Đề xuất nạp thêm key sớm!
          </div>
        </div>
      )}

      <div className="space-y-1 text-xs">
        <div className="flex items-center justify-between text-[#6E5D53]">
          <span>Mã: <strong className="font-mono text-[#2B1810]">{currentReq.request_code}</strong></span>
          <span className="font-semibold text-[#2B1810]">KTV: {currentReq.requester_name}</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Khách hàng:</span>
            <strong className="text-slate-900">{currentReq.customer_name}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">SĐT:</span>
            <span className="font-mono font-semibold text-slate-800">{currentReq.customer_phone}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Email:</span>
            <span className="font-mono text-blue-700 truncate max-w-[190px]" title={currentReq.customer_email}>
              {currentReq.customer_email}
            </span>
          </div>
        </div>
      </div>
    </>
  );


  const renderActions = () => {
    if (isRejecting) {
      return (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2 animate-fade-in">
          <input
            type="text"
            value={rejectReasonInput}
            onChange={(e) => setRejectReasonInput(e.target.value)}
            placeholder="Lý do từ chối..."
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-rose-300 rounded-lg text-slate-900"
            autoFocus
          />
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setIsRejecting(false)}
              className="px-2.5 py-1 text-slate-600 text-xs font-semibold hover:bg-slate-200 rounded"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleReject}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded"
            >
              Từ Chối
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-1.5 pt-0.5">
        {availableCount === 0 ? (
          <button
            type="button"
            onClick={() =>
              alert(
                `Kho hiện tại có Volume = 0 (hết key cho "${currentReq.category_name}"). Vui lòng nạp thêm key vào kho trước khi duyệt cấp!`
              )
            }
            className="w-full py-2.5 px-4 rounded-xl text-white font-black text-xs tracking-wider shadow-md flex items-center justify-center gap-1.5 bg-slate-500 hover:bg-slate-600 cursor-pointer"
          >
            ⚠️ KHO HẾT KEY (VOLUME: 0) - CHƯA THỂ DUYỆT
          </button>
        ) : (
          <button
            type="button"
            disabled={isApproving}
            onClick={handleApprove}
            className="w-full py-2.5 px-4 rounded-xl text-white font-black text-xs tracking-wider shadow-md flex items-center justify-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 cursor-pointer"
          >
            {isApproving ? 'Đang bốc & xuất key...' : isFaultyReplacement ? '⚡ CẤP ĐỔI KEY MỚI NGAY' : '⚡ XUẤT KEY & DUYỆT NGAY'}
          </button>
        )}

        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setIsRejecting(true)}
            className="px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:text-rose-600 text-xs font-bold"
          >
            Từ chối
          </button>
          <Link
            href="/quan-ly-key"
            onClick={() => setIsOpen(false)}
            className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
              availableCount === 0
                ? 'bg-[#C0392B] hover:bg-[#A93226] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-[#2B1810]'
            }`}
          >
            {availableCount === 0 ? '+ Nạp key vào kho' : 'Mở Kho Key →'}
          </Link>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 1. RIGHT-SIDE FLOATING DOCKED REMINDER WIDGET FOR ADMIN */}
      {pendingRequests.length > 0 && !isOpen && (
        <aside
          aria-label="Widget Nhắc Nhở Duyệt Key Admin"
          className="fixed bottom-[136px] sm:bottom-[142px] right-4 sm:right-6 lg:right-8 z-40 font-sans"
        >
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex flex-col w-[76px] sm:w-[82px] rounded-xl overflow-hidden shadow-2xl border-2 border-red-500 bg-white hover:scale-105 active:scale-95 transition-all text-center cursor-pointer select-none group ring-4 ring-red-500/20 animate-pulse"
            title={`Có ${pendingRequests.length} yêu cầu cấp key đang chờ duyệt! Bấm để mở bảng duyệt.`}
          >
            <div className="py-2 px-1 bg-gradient-to-br from-red-600 to-rose-700 text-white flex flex-col items-center justify-center transition-colors">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-black uppercase tracking-tighter leading-tight">
                  Duyệt Key
                </span>
                <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping inline-block" />
              </div>
            </div>

            <div className="py-2 px-1 bg-red-50 flex flex-col items-center justify-center group-hover:bg-red-100 transition-colors">
              <span className="text-xl sm:text-2xl font-black font-mono leading-none text-red-700">
                {pendingRequests.length}
              </span>
              <span className="text-[9px] font-bold text-red-800 uppercase tracking-tighter mt-1">
                {hasAnyFaulty ? 'Cấp đổi ⚠️' : 'Chờ cấp'}
              </span>
            </div>
          </button>
        </aside>
      )}

      {/* 2. ADMIN KEY RELEASE POPUP CARD (WHEN OPEN) */}
      {isOpen && (
        <aside
          aria-label="Thông báo yêu cầu xuất key"
          className="fixed bottom-6 right-4 sm:right-6 lg:right-8 z-[60] w-[calc(100vw-32px)] sm:w-[420px] max-w-full font-sans animate-fade-in shadow-2xl"
        >
          <div className="bg-[#FFFDF9] rounded-2xl shadow-2xl border-2 border-red-500 overflow-hidden flex flex-col text-[#2B1810] ring-2 ring-black/10">
            <div className="bg-gradient-to-r from-[#2B1810] via-red-950 to-[#C0392B] text-white p-3.5 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-300"></span>
                </span>
                <span className="text-xs font-black tracking-wide uppercase flex items-center gap-1.5">
                  {approvedResult ? (
                    '✓ KẾT QUẢ XUẤT KEY'
                  ) : isFaultyReplacement ? (
                    '⚠️ CẤP KEY THAY THẾ'
                  ) : (
                    '🔔 YÊU CẦU XUẤT KEY'
                  )}
                </span>
                {!approvedResult && pendingRequests.length > 1 && (
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-mono text-[10px] font-bold">
                    {currentIndex + 1}/{pendingRequests.length}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/30 text-white flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
                  title="Đóng popup (widget nhắc nhở ở góc phải vẫn hiển thị)"
                  aria-label="Đóng thông báo yêu cầu key"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {approvedResult ? (
                renderSuccessBanner()
              ) : currentReq ? (
                <>
                  {renderDetails()}
                  {renderActions()}

                  {pendingRequests.length > 1 && (
                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-200 text-xs text-[#6E5D53]">
                      <button
                        type="button"
                        disabled={currentIndex === 0}
                        onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 font-bold text-[11px] cursor-pointer"
                      >
                        ◀ Trước
                      </button>

                      <span className="font-mono text-[10px] font-bold">
                        Yêu cầu {currentIndex + 1} / {pendingRequests.length}
                      </span>

                      <button
                        type="button"
                        disabled={currentIndex === pendingRequests.length - 1}
                        onClick={() => setCurrentIndex((prev) => Math.min(pendingRequests.length - 1, prev + 1))}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 font-bold text-[11px] cursor-pointer"
                      >
                        Sau ▶
                      </button>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
