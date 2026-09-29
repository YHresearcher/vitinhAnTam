'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useViTinhAnTamStore } from '@/lib/store';
import { KeyReleaseRequest } from '@/lib/supabase';
import {
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Clock,
  AlertTriangle,
  KeyRound,
  Loader2,
  Sparkles,
  User,
  Phone,
  Mail,
  ShieldAlert,
} from 'lucide-react';

export function RequesterKeyTestPopup() {
  const { currentUser, keyReleaseRequests, licenseKeys, confirmKeyActive, reportKeyFaulty } =
    useViTinhAnTamStore();

  const myActiveRequests = useMemo(() => {
    if (!currentUser?.name && !currentUser?.id) return [];
    return keyReleaseRequests.filter((r) => {
      const isMine =
        r.requester_id === currentUser.id ||
        r.requester_name === currentUser.name ||
        (currentUser.email && r.requester_name === currentUser.email);

      const isActiveState =
        r.status === 'approved_waiting_test' ||
        r.status === 'pending' ||
        r.status === 'auto_re_requested' ||
        r.status === 'faulty_re_requesting';

      return isMine && isActiveState;
    });
  }, [keyReleaseRequests, currentUser]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isClosed, setIsClosed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isReportingFaulty, setIsReportingFaulty] = useState(false);
  const [showFaultyDialog, setShowFaultyDialog] = useState(false);
  const [faultyReason, setFaultyReason] = useState('Key báo lỗi kích hoạt / không nhận bản quyền');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    if (currentIndex >= myActiveRequests.length && myActiveRequests.length > 0) {
      setCurrentIndex(myActiveRequests.length - 1);
    }
  }, [myActiveRequests.length, currentIndex]);

  const prevApprovedCountRef = useRef(0);
  const approvedCount = myActiveRequests.filter((r) => r.status === 'approved_waiting_test').length;

  useEffect(() => {
    if (approvedCount > prevApprovedCountRef.current) {
      setIsClosed(false);
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          if (ctx.state === 'suspended') ctx.resume();
          const now = ctx.currentTime;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(523.25, now);
          osc.frequency.setValueAtTime(659.25, now + 0.12);
          osc.frequency.setValueAtTime(783.99, now + 0.24);
          osc.frequency.setValueAtTime(1046.5, now + 0.36);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.65);
        }
      } catch {
        // ignore audio
      }
    }
    prevApprovedCountRef.current = approvedCount;
  }, [approvedCount]);

  if (myActiveRequests.length === 0) return null;

  const currentReq: KeyReleaseRequest = myActiveRequests[currentIndex] || myActiveRequests[0];
  if (!currentReq) return null;

  const isApproved = currentReq.status === 'approved_waiting_test';
  const isAutoReRequested =
    currentReq.status === 'auto_re_requested' || currentReq.status === 'faulty_re_requesting';
  const assignedKey = currentReq.released_key_code || currentReq.assigned_key_code || '';

  const categoryStock = licenseKeys.filter(
    (k) => k.category_id === currentReq.category_id && k.status === 'available'
  ).length;

  const handleCopyKey = () => {
    if (assignedKey && navigator.clipboard) {
      navigator.clipboard.writeText(assignedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleConfirmActive = async () => {
    setIsConfirming(true);
    const res = await confirmKeyActive(currentReq.id);
    setIsConfirming(false);
    if (res.success) {
      setFeedbackMsg(res.message);
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const handleSubmitFaulty = async () => {
    setIsReportingFaulty(true);
    const reason = faultyReason.trim() || 'Key không kích hoạt được trên máy khách';
    const res = await reportKeyFaulty(currentReq.id, reason);
    setIsReportingFaulty(false);
    setShowFaultyDialog(false);
    if (res.success) {
      setFeedbackMsg(res.message);
      setTimeout(() => setFeedbackMsg(null), 3500);
    }
  };

  const renderHeader = () => (
    <div
      className={`p-4 text-white flex items-center justify-between ${
        isApproved
          ? 'bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700'
          : isAutoReRequested
          ? 'bg-gradient-to-r from-amber-700 via-red-800 to-[#C0392B]'
          : 'bg-gradient-to-r from-[#2B1810] via-slate-800 to-slate-900'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          {isApproved ? (
            <KeyRound className="w-5 h-5 text-amber-300 animate-bounce" />
          ) : (
            <Clock className="w-5 h-5 text-amber-300 animate-spin" />
          )}
        </div>
        <div>
          <div className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
            {isApproved ? (
              <>
                <span>KEY BẢN QUYỀN ĐÃ ĐƯỢC DUYỆT CẤP</span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </>
            ) : isAutoReRequested ? (
              <>
                <span>ĐANG CHỜ ADMIN CẤP KEY THAY THẾ</span>
                <AlertTriangle className="w-4 h-4 text-amber-300" />
              </>
            ) : (
              <>
                <span>ĐANG CHỜ ADMIN DUYỆT CẤP KEY</span>
                <Clock className="w-4 h-4 text-blue-300" />
              </>
            )}
          </div>
          <div className="text-[11px] text-white/80 font-medium">
            Phiếu: <span className="font-mono font-bold text-white">{currentReq.request_code}</span> • {currentReq.category_name}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {myActiveRequests.length > 1 && (
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-mono text-[10px] font-bold">
            {currentIndex + 1}/{myActiveRequests.length}
          </span>
        )}
        <button
          type="button"
          onClick={() => setIsClosed(true)}
          className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
          title="Đóng popup (widget nhắc nhở ở góc phải vẫn hoạt động)"
          aria-label="Đóng popup test key"
        >
          ✕
        </button>
      </div>
    </div>
  );

  const renderApprovedSection = () => (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-amber-50/80 border-2 border-amber-400 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1">
            <KeyRound className="w-4 h-4 text-amber-700" /> MÃ KEY ĐƯỢC ADMIN CẤP:
          </span>
          {currentReq.approved_by_admin && (
            <span className="text-[10px] text-amber-800 font-medium">
              Duyệt bởi: <strong>{currentReq.approved_by_admin}</strong>
            </span>
          )}
        </div>

        <div className="p-3 bg-white rounded-lg border border-amber-300 font-mono font-black text-center text-base sm:text-lg tracking-widest text-[#2B1810] select-all break-all shadow-xs">
          {assignedKey}
        </div>

        <button
          type="button"
          onClick={handleCopyKey}
          className="w-full py-2 px-3 rounded-lg bg-[#2B1810] hover:bg-black text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300">ĐÃ SAO CHÉP MÃ KEY!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>SAO CHÉP MÃ KEY</span>
            </>
          )}
        </button>
      </div>

      <div className="text-[11px] text-slate-600 bg-blue-50/70 p-2.5 rounded-lg border border-blue-200">
        💡 <strong>Hướng dẫn:</strong> Nhập mã key trên thiết bị của khách hàng và bấm kích hoạt bản quyền. Vui lòng chọn xác nhận bên dưới:
      </div>

      {!showFaultyDialog ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            disabled={isConfirming}
            onClick={handleConfirmActive}
            className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-black tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {isConfirming ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>KEY HOẠT ĐỘNG</span>
          </button>

          <button
            type="button"
            onClick={() => setShowFaultyDialog(true)}
            className="py-3 px-4 rounded-xl bg-[#C0392B] hover:bg-[#A93226] active:bg-red-900 text-white text-xs font-black tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <XCircle className="w-4 h-4" />
            <span>KEY KHÔNG HOẠT ĐỘNG</span>
          </button>
        </div>
      ) : (
        <div className="p-3.5 bg-rose-50 border-2 border-rose-300 rounded-xl space-y-2.5">
          <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-700" />
            <span>Xác nhận Key không hoạt động:</span>
          </div>

          <select
            value={faultyReason}
            onChange={(e) => setFaultyReason(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-rose-300 bg-white text-xs font-medium text-slate-800 focus:outline-none"
          >
            <option value="Key báo lỗi kích hoạt / không nhận bản quyền">Key báo lỗi kích hoạt / không nhận bản quyền</option>
            <option value="Key đã hết lượt kích hoạt (0xC004C008 / 0xC004C020)">Key đã hết lượt kích hoạt (0xC004C008 / 0xC004C020)</option>
            <option value="Key bị chặn bởi Microsoft (0xC004C003 / 0xC004F213)">Key bị chặn bởi Microsoft (0xC004C003 / 0xC004F213)</option>
            <option value="Sai phiên bản Windows / Office của khách hàng">Sai phiên bản Windows / Office của khách hàng</option>
          </select>

          {categoryStock === 0 && (
            <div className="p-2 bg-rose-100/90 border border-rose-400 rounded-lg text-[11px] text-rose-950 flex items-start gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              <div>
                <strong>CẢNH BÁO: KHO HẾT KEY THAY THẾ (Volume: 0)!</strong>
                <div className="text-rose-800 mt-0.5">
                  Kho hiện không còn key khả dụng cho {currentReq.category_name}. Khi gửi báo lỗi, Admin sẽ nhận được yêu cầu nạp thêm kho trước khi cấp bù cho bạn.
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              disabled={isReportingFaulty}
              onClick={handleSubmitFaulty}
              className="flex-1 py-2 px-3 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isReportingFaulty ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              <span>GỬI YÊU CẦU CẤP KEY MỚI</span>
            </button>
            <button
              type="button"
              onClick={() => setShowFaultyDialog(false)}
              className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium cursor-pointer"
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderWaitingSection = () => (
    <div className="py-6 px-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-3">
      <div className="relative mx-auto w-12 h-12 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-red-100 animate-ping opacity-60"></div>
        <div className="relative w-12 h-12 rounded-full bg-red-50 border-2 border-[#C0392B] flex items-center justify-center text-[#C0392B]">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </div>

      <div className="space-y-1">
        <h4 className="text-sm font-black text-slate-900">
          {isAutoReRequested ? 'ĐÃ GỬI YÊU CẦU CẤP KEY THAY THẾ' : 'ĐANG CHỜ ADMIN DUYỆT YÊU CẦU'}
        </h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          {isAutoReRequested
            ? `Key trước đã được ghi nhận lỗi (${currentReq.faulty_reason || 'Không hoạt động'}). Hệ thống đã tự động gửi yêu cầu cấp key mới đến Admin.`
            : 'Thông báo yêu cầu cấp key đã được gửi đến Admin. Vui lòng giữ màn hình này, mã key sẽ tự động hiển thị ngay khi Admin phê duyệt.'}
        </p>
      </div>

      {categoryStock === 0 && (
        <div className="p-2.5 bg-amber-100 border border-amber-300 rounded-lg text-xs text-amber-950 font-medium">
          ⚠️ <strong>Kho hiện tại có Volume = 0 (hết key).</strong> Đang chờ Admin nạp thêm key mới vào kho để duyệt cấp.
        </div>
      )}

      {currentReq.faulty_history && currentReq.faulty_history.length > 0 && (
        <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded-lg text-left text-[11px] text-rose-800">
          <div className="font-bold">Lịch sử key lỗi:</div>
          {currentReq.faulty_history.map((fh, idx) => (
            <div key={idx} className="text-rose-700">
              • {fh.key_code} ({fh.reason})
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (isClosed) {
    return (
      <aside
        aria-label="Widget Nhắc Nhở Test Key"
        className="fixed bottom-[136px] sm:bottom-[142px] right-4 z-40 font-sans"
      >
        {approvedCount > 0 ? (
          <button
            type="button"
            onClick={() => setIsClosed(false)}
            className="flex flex-col w-[76px] sm:w-[80px] rounded-xl overflow-hidden shadow-xl border-2 border-emerald-500 bg-white hover:scale-105 active:scale-95 transition-all text-center cursor-pointer select-none group ring-2 ring-emerald-500/30"
            title={`Có ${approvedCount} key đã được Admin cấp, bấm để test và xác nhận!`}
          >
            <div className="py-2 px-1 bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex flex-col items-center justify-center transition-colors">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-black uppercase tracking-tighter leading-tight">
                  Test Key
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping inline-block" />
              </div>
            </div>
            <div className="py-2 px-1 bg-emerald-50 flex flex-col items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <span className="text-xl sm:text-2xl font-black font-mono leading-none text-emerald-800">
                {approvedCount}
              </span>
              <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-tighter mt-1">
                Chờ test 🔑
              </span>
            </div>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsClosed(false)}
            className="flex flex-col w-[76px] sm:w-[80px] rounded-xl overflow-hidden shadow-xl border-2 border-amber-500 bg-white hover:scale-105 active:scale-95 transition-all text-center cursor-pointer select-none group ring-2 ring-amber-500/20"
            title={`Đang chờ Admin duyệt ${myActiveRequests.length} yêu cầu cấp key...`}
          >
            <div className="py-2 px-1 bg-gradient-to-br from-amber-500 to-orange-600 text-white flex flex-col items-center justify-center transition-colors">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-black uppercase tracking-tighter leading-tight">
                  Chờ Key
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse inline-block" />
              </div>
            </div>
            <div className="py-2 px-1 bg-amber-50 flex flex-col items-center justify-center group-hover:bg-amber-100 transition-colors">
              <span className="text-xl sm:text-2xl font-black font-mono leading-none text-amber-900">
                {myActiveRequests.length}
              </span>
              <span className="text-[9px] font-bold text-amber-800 uppercase tracking-tighter mt-1">
                Chờ duyệt
              </span>
            </div>
          </button>
        )}
      </aside>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="bg-white rounded-2xl shadow-2xl border-2 border-[#C0392B] w-full max-w-lg overflow-hidden flex flex-col my-auto text-[#2B1810]"
        onClick={(e) => e.stopPropagation()}
      >
        {renderHeader()}

        <div className="p-5 space-y-4">
          {feedbackMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {/* Customer info */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-slate-500" /> Khách hàng:</span>
              <span className="text-slate-900">{currentReq.customer_name}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> Điện thoại:</span>
              <span className="font-mono font-medium">{currentReq.customer_phone || 'Không có'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> Email nhận key:</span>
              <span className="font-mono text-blue-700 font-medium">{currentReq.customer_email}</span>
            </div>
          </div>

          {/* Body Section */}
          {isApproved ? renderApprovedSection() : renderWaitingSection()}

          {/* Pagination */}
          {myActiveRequests.length > 1 && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs text-slate-600">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 font-bold text-[11px] cursor-pointer"
              >
                ◀ Yêu cầu trước
              </button>
              <span className="font-mono text-[11px] font-bold">
                Yêu cầu {currentIndex + 1} / {myActiveRequests.length}
              </span>
              <button
                type="button"
                disabled={currentIndex === myActiveRequests.length - 1}
                onClick={() => setCurrentIndex((prev) => Math.min(myActiveRequests.length - 1, prev + 1))}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 font-bold text-[11px] cursor-pointer"
              >
                Yêu cầu sau ▶
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
