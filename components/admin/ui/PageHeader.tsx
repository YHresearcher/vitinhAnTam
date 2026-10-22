'use client';

import React from 'react';

// Khung header trang quản trị dùng chung (P2): tiêu đề bên trái, cụm
// nút thao tác bên phải — đúng bố cục đang dùng ở Khách hàng / Tiền
// công / Đơn hàng. Nội dung tiêu đề truyền vào dạng ReactNode để từng
// trang giữ nguyên badge/ghi chú riêng.
interface PageHeaderProps {
  title: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageHeader({ title, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>{title}</div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
