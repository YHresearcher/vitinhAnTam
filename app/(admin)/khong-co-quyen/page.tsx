'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useViTinhAnTamStore } from '@/lib/store';

// Trang thông báo khi proxy (phía máy chủ) chặn một tài khoản đã đăng nhập
// nhưng không đủ quyền vào trang quản trị nhạy cảm. Trang này KHÔNG tải
// dữ liệu của trang bị khóa — chỉ hiển thị thông báo và nút quay lại.
// `from` chỉ dùng để hiển thị tên trang bị chặn, và chỉ nhận các đường
// dẫn quản trị đã biết (tránh phản chiếu URL lạ ra màn hình).
const BLOCKED_PAGES: Record<string, string> = {
  '/tai-chinh': 'Trang Tài chính & Doanh thu',
  '/tien-cong': 'Trang Tiền công KTV & Bảng lương',
  '/thanh-vien': 'Trang Thành viên & Phân quyền',
  '/cai-dat': 'Trang Cấu hình hệ thống',
};

export default function KhongCoQuyenPage() {
  const { isFieldStaff } = useViTinhAnTamStore();
  const [fromPath, setFromPath] = useState('');

  useEffect(() => {
    try {
      const from = new URLSearchParams(window.location.search).get('from') || '';
      const matched = Object.keys(BLOCKED_PAGES).find(
        (path) => from === path || from.startsWith(`${path}/`)
      );
      setFromPath(matched || '');
    } catch {
      setFromPath('');
    }
  }, []);

  const blockedLabel = fromPath ? BLOCKED_PAGES[fromPath] : '';
  const homeHref = isFieldStaff() ? '/viec-cua-toi' : '/dashboard';

  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-5">
        <div className="inline-block px-3 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-full uppercase">
          Không có quyền truy cập
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">Bạn không có quyền truy cập trang này</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            {blockedLabel
              ? `${blockedLabel} chỉ dành cho tài khoản có quyền quản trị phù hợp. Tài khoản của bạn vẫn đang đăng nhập bình thường.`
              : 'Trang bạn vừa mở chỉ dành cho tài khoản có quyền quản trị phù hợp. Tài khoản của bạn vẫn đang đăng nhập bình thường.'}
          </p>
        </div>
        <div className="pt-2">
          <Link
            href={homeHref}
            className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg"
          >
            Quay lại trang làm việc của bạn
          </Link>
        </div>
      </div>
    </div>
  );
}
