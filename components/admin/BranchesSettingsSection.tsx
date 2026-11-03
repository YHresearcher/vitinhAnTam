'use client';

import React, { useState } from 'react';
import type { Branch, SystemSettings } from '@/lib/store';
import { MapPin, Plus, Trash2 } from 'lucide-react';

interface BranchesSettingsSectionProps {
  formData: SystemSettings;
  setFormData: (
    next: SystemSettings | ((prev: SystemSettings) => SystemSettings)
  ) => void;
}

const MAX_BRANCHES = 10;

const inputClassName =
  'w-full px-3.5 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-[#C0392B] bg-slate-50 focus:bg-white';

// Chi nhánh cửa hàng — tên + địa chỉ do admin tự nhập trong Cài đặt, lưu
// cùng cấu hình hệ thống (cột branches). Số Zalo/WhatsApp/Email dùng chung
// cho mọi chi nhánh nên KHÔNG nhập ở đây (sửa ở mục Thông tin liên hệ).
// Chi nhánh để trống cả tên lẫn địa chỉ sẽ không hiện ngoài trang khách;
// xóa hết chi nhánh thì chân trang và widget hiện lại địa chỉ cửa hàng chung.
export function BranchesSettingsSection({
  formData,
  setFormData,
}: BranchesSettingsSectionProps) {
  const branches: Branch[] = formData.branches ?? [];
  // Xóa 2 bước (không dùng confirm() hệ thống): bấm Xóa -> bấm Xác nhận xóa.
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const updateBranches = (updater: (list: Branch[]) => Branch[]) => {
    setFormData((prev) => ({
      ...prev,
      branches: updater(prev.branches ?? []),
    }));
  };

  const updateBranchField = (id: string, field: 'name' | 'address', val: string) => {
    updateBranches((list) =>
      list.map((b) => (b.id === id ? { ...b, [field]: val } : b))
    );
  };

  const removeBranch = (id: string) => {
    updateBranches((list) => list.filter((b) => b.id !== id));
    setConfirmingId(null);
  };

  const addBranch = () => {
    updateBranches((list) => {
      if (list.length >= MAX_BRANCHES) return list;
      return [...list, { id: `branch-${Date.now()}`, name: '', address: '' }];
    });
  };

  return (
    <div className="pt-2 border-t border-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2 mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-[#C0392B]" />
          Chi Nhánh Cửa Hàng
        </h3>
        <span className="text-[11px] text-slate-500 font-medium">
          Hiển thị trong widget Phương thức liên hệ và chân trang
        </span>
      </div>

      <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
        Tên và địa chỉ từng chi nhánh do bạn tự nhập. Số Zalo/WhatsApp/Email dùng
        chung cho mọi chi nhánh (sửa ở mục Thông tin liên hệ phía trên). Chi
        nhánh để trống cả tên lẫn địa chỉ sẽ không hiện ngoài trang khách; xóa
        hết chi nhánh thì chân trang và widget hiện lại địa chỉ cửa hàng chung.
      </p>

      {branches.length === 0 ? (
        <p className="text-[11px] text-slate-500 italic mb-3">
          Chưa có chi nhánh nào — chân trang và widget đang hiện địa chỉ cửa hàng chung.
        </p>
      ) : (
        <div className="space-y-2 mb-3">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className="grid grid-cols-1 sm:grid-cols-[1fr_1.5fr_auto] gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200"
            >
              <input
                type="text"
                value={branch.name}
                onChange={(e) => updateBranchField(branch.id, 'name', e.target.value)}
                placeholder="Tên chi nhánh — VD: Trụ sở chính"
                className={inputClassName}
              />
              <input
                type="text"
                value={branch.address}
                onChange={(e) => updateBranchField(branch.id, 'address', e.target.value)}
                placeholder="Địa chỉ — VD: 52 Nguyễn Cửu Vân, phường Long An, tỉnh Tây Ninh"
                className={inputClassName}
              />
              {confirmingId === branch.id ? (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => removeBranch(branch.id)}
                    className="px-2.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold whitespace-nowrap"
                  >
                    Xác nhận xóa?
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingId(null)}
                    className="px-2.5 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-bold"
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingId(branch.id)}
                  title="Xóa chi nhánh"
                  className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg bg-white hover:bg-red-50 border border-slate-200 text-slate-500 hover:text-red-600 text-[11px] font-bold whitespace-nowrap"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Xóa
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={addBranch}
        disabled={branches.length >= MAX_BRANCHES}
        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[#FAF7F2] hover:bg-[#F3EDE6] border border-[#E8E2D9] text-[#2B1810] text-[11px] font-bold transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Plus className="w-3.5 h-3.5" />
        Thêm chi nhánh
      </button>
    </div>
  );
}
