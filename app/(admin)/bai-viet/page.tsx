'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FileText, Plus, Search, Tag, Clock, Eye, Edit, Trash2, ExternalLink,
  Layers, CheckCircle2, FileEdit
} from 'lucide-react';
import { useViTinhAnTamStore } from '@/lib/store';
import { formatDateVN } from '@/lib/supabase';

export default function BlogManagementPage() {
  const { blogPosts, blogCategories, deleteBlogPost } = useViTinhAnTamStore();
  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filtered = useMemo(() => {
    return blogPosts.filter((p) => {
      const matchQ = !query || p.title.toLowerCase().includes(query.toLowerCase()) || p.slug.includes(query);
      const matchC = selectedCat === 'all' || p.category_id === selectedCat;
      const matchS = selectedStatus === 'all' || p.status === selectedStatus;
      return matchQ && matchC && matchS;
    });
  }, [blogPosts, query, selectedCat, selectedStatus]);

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Xóa bài viết "${title}"?`)) {
      await deleteBlogPost(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
            <FileText className="w-6 h-6" />
          </span>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Quản Lý Bài Viết & SEO Blog</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Soạn thảo Tiptap, tự động đo thời gian đọc, nhúng SP kho & Schema SEO</p>
          </div>
        </div>
        <Link href="/bai-viet/tao-moi" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition">
          <Plus className="w-4 h-4" />Viết bài mới
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 mb-1 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-blue-500" />Tổng bài viết</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{blogPosts.length}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 mb-1 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />Đã xuất bản</div>
          <div className="text-2xl font-bold text-emerald-600">{blogPosts.filter(p => p.status === 'published').length}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 mb-1 flex items-center gap-1.5"><FileEdit className="w-3.5 h-3.5 text-amber-500" />Bản nháp</div>
          <div className="text-2xl font-bold text-amber-600">{blogPosts.filter(p => p.status === 'draft').length}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 mb-1 flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-purple-500" />Chuyên mục</div>
          <div className="text-2xl font-bold text-purple-600">{blogCategories.length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Tìm kiếm tiêu đề, từ khóa, đường dẫn..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none" />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <select value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)} className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <option value="all">Tất cả chuyên mục</option>
            {blogCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đã xuất bản</option>
            <option value="draft">Bản nháp</option>
            <option value="archived">Lưu trữ</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Tiêu đề bài viết</th>
                <th className="py-3.5 px-4">Chuyên mục</th>
                <th className="py-3.5 px-4 text-center">Thời gian đọc</th>
                <th className="py-3.5 px-4 text-center">Lượt xem</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-slate-400">Không tìm thấy bài viết nào.</td></tr>
              ) : (
                filtered.map((post) => {
                  const cat = blogCategories.find(c => c.id === post.category_id);
                  return (
                    <tr key={post.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                      <td className="py-4 px-4">
                        <Link href={`/bai-viet/${post.id}`} className="font-bold text-slate-900 dark:text-white hover:text-blue-600 line-clamp-2">{post.title}</Link>
                        <div className="text-xs text-slate-500 mt-1">/tin-tuc/{post.slug} • {formatDateVN(post.created_at)}</div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap"><span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">{cat?.name || 'Chung'}</span></td>
                      <td className="py-4 px-4 text-center whitespace-nowrap"><span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"><Clock className="w-3 h-3" />{post.reading_time_minutes || 1}p ({post.word_count || 0} từ)</span></td>
                      <td className="py-4 px-4 text-center whitespace-nowrap text-xs text-slate-600"><Eye className="w-3.5 h-3.5 inline mr-1 text-slate-400" />{post.view_count || 0}</td>
                      <td className="py-4 px-4 text-center whitespace-nowrap"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${post.status === 'published' ? 'bg-emerald-100 text-emerald-700' : post.status === 'draft' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{post.status === 'published' ? 'Xuất bản' : post.status === 'draft' ? 'Bản nháp' : 'Lưu trữ'}</span></td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {post.status === 'published' && <Link href={`/tin-tuc/${post.slug}`} target="_blank" className="p-2 text-slate-500 hover:text-blue-600"><ExternalLink className="w-4 h-4" /></Link>}
                          <Link href={`/bai-viet/${post.id}`} className="p-2 text-slate-500 hover:text-blue-600"><Edit className="w-4 h-4" /></Link>
                          <button type="button" onClick={() => handleDelete(post.id, post.title)} className="p-2 text-slate-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
