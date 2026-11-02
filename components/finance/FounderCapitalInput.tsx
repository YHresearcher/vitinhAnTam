'use client';

import React, { useEffect, useState } from 'react';
import { useViTinhAnTamStore } from '@/lib/store';

/**
 * Nhập tổng vốn tự có của người bỏ vốn chính. Để trống = chưa biết tổng
 * vốn — khi đó gốc chưa đối trừ, phần 14% chỉ tích lũy để trừ sau.
 * Chỉ admin dùng (nằm trong trang tài chính vốn đã khóa admin).
 */
export function FounderCapitalInput() {
  const { founderCapital, setFounderCapital } = useViTinhAnTamStore();
  const [text, setText] = useState(founderCapital === null ? '' : String(founderCapital));
  const [savedNote, setSavedNote] = useState(false);

  useEffect(() => {
    setText(founderCapital === null ? '' : String(founderCapital));
  }, [founderCapital]);

  const handleSave = () => {
    const trimmed = text.trim();
    if (trimmed === '') {
      setFounderCapital(null);
    } else {
      const digits = trimmed.replace(/[^0-9]/g, '');
      const value = digits === '' ? null : Number(digits);
      setFounderCapital(value !== null && Number.isFinite(value) ? value : null);
    }
    setSavedNote(true);
    window.setTimeout(() => setSavedNote(false), 2000);
  };

  return (
    <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
      <div className="text-xs font-bold text-amber-900 uppercase">Tổng vốn tự có của người bỏ vốn</div>
      <p className="text-[11px] text-amber-700">
        Nhập tổng số vốn bạn đã bỏ ra. Phần 14% mỗi tháng sẽ trừ dần vào gốc này,
        bán xong là trừ, tới khi đủ thì thôi. Để trống nếu chưa chốt con số.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          inputMode="numeric"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ví dụ: 45000000"
          className="px-3 py-2 text-sm font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 w-56"
        />
        <span className="text-sm text-slate-600">₫</span>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl cursor-pointer"
        >
          Lưu tổng vốn
        </button>
        {savedNote && <span className="text-xs font-bold text-emerald-700">Đã lưu.</span>}
      </div>
      <div className="text-xs text-slate-600">
        Hiện tại:{' '}
        <strong className="font-mono">
          {founderCapital === null ? 'Chưa nhập' : `${founderCapital.toLocaleString('vi-VN')}₫`}
        </strong>
      </div>
    </div>
  );
}
