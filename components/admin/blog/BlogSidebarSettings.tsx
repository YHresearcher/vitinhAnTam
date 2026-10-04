'use client';

import React from 'react';
import { Sparkles, Image as ImageIcon } from 'lucide-react';
import { BlogCategory } from '@/lib/supabase';

interface BlogSidebarSettingsProps {
  status: 'draft' | 'published' | 'archived';
  setStatus: (status: 'draft' | 'published' | 'archived') => void;
  categoryId: string;
  setCategoryId: (id: string) => void;
  categories: BlogCategory[];
  serviceCtaType: string;
  setServiceCtaType: (type: string) => void;
  coverImage: string;
  setCoverImage: (url: string) => void;
  tagInput: string;
  setTagInput: (tags: string) => void;
  metaTitle: string;
  setMetaTitle: (title: string) => void;
  metaDescription: string;
  setMetaDescription: (desc: string) => void;
  focusKeyword: string;
  setFocusKeyword: (kw: string) => void;
}

export default function BlogSidebarSettings({
  status,
  setStatus,
  categoryId,
  setCategoryId,
  categories,
  serviceCtaType,
  setServiceCtaType,
  coverImage,
  setCoverImage,
  tagInput,
  setTagInput,
  metaTitle,
  setMetaTitle,
  metaDescription,
  setMetaDescription,
  focusKeyword,
  setFocusKeyword,
}: BlogSidebarSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2.5">
          Thiết lập xuất bản
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Trạng thái bài viết
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'draft' | 'published' | 'archived')}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200"
          >
            <option value="draft">Bản nháp (Chỉ Admin xem)</option>
            <option value="published">Xuất bản công khai (Public)</option>
            <option value="archived">Lưu trữ (Ẩn khỏi web)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Chuyên mục</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Khung Dịch vụ Kêu gọi (CTA)
          </label>
          <select
            value={serviceCtaType}
            onChange={(e) => setServiceCtaType(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          >
            <option value="spa_laptop">Spa & Vệ sinh Laptop 12 bước</option>
            <option value="cai_win">Cài Windows & Bản quyền</option>
            <option value="cuu_du_lieu">Cứu hộ Dữ liệu & Ổ cứng</option>
            <option value="none">Không hiển thị</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
            <ImageIcon className="w-3.5 h-3.5" />
            Ảnh đại diện (Cover Image URL)
          </label>
          <input
            type="text"
            placeholder="https://..."
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          />
        </div>

      {/* SEO Metadata Box */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <Sparkles className="w-4 h-4 text-amber-500" /> Cấu hình Google SEO
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Tiêu đề SEO (Meta Title)
          </label>
          <input
            type="text"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Từ khóa chính (Focus Keyword)
          </label>
          <input
            type="text"
            placeholder="VD: vệ sinh laptop thủ thừa"
            value={focusKeyword}
            onChange={(e) => setFocusKeyword(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Mô tả SEO (Meta Description)
          </label>
          <textarea
            rows={3}
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          />
        </div>
      </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Tags (cách nhau bằng dấu phẩy)
          </label>
          <input
            type="text"
            placeholder="Vệ sinh laptop, SSD, Tra keo"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          />
        </div>
      </div>
    </div>
  );
}
