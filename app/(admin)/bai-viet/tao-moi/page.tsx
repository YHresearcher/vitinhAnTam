'use client';

import React from 'react';
import Link from 'next/link';
import BlogPostForm from '@/components/admin/blog/BlogPostForm';
import { useViTinhAnTamStore } from '@/lib/store';

export default function CreateBlogPostPage() {
  const { currentUser } = useViTinhAnTamStore();

  // Chỉ Admin được xem/sửa Bài viết & SEO (quyết định 2026-10-27).
  if (currentUser?.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-5">
          <div className="inline-block px-3 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-full uppercase">
            Không có quyền truy cập
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">Bạn không có quyền truy cập trang này</h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Trang Bài viết &amp; SEO chỉ dành cho Quản Trị Viên (Admin).
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg"
            >
              Quay lại Trang Tổng Quan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <BlogPostForm isNew={true} />;
}
