'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Clock,
  ArrowRight,
  BookOpen,
  Laptop,
  Calendar,
} from 'lucide-react';
import { useViTinhAnTamStore } from '@/lib/store';
import { formatDateVN } from '@/lib/supabase';
import { TRANSLATIONS } from '@/lib/translations';

export default function PublicBlogPage() {
  const { blogPosts, blogCategories, currentLang } = useViTinhAnTamStore();
  const isEn = currentLang === 'en';
  const t = TRANSLATIONS[currentLang || 'vi'].blog;
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  const publishedPosts = useMemo(() => {
    return blogPosts.filter((p) => p.status === 'published');
  }, [blogPosts]);

  const filteredPosts = useMemo(() => {
    return publishedPosts.filter((p) => {
      const matchSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.excerpt?.toLowerCase().includes(search.toLowerCase()) ||
        p.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()));

      const matchCat = selectedCat === 'all' || p.category_id === selectedCat;
      return matchSearch && matchCat;
    });
  }, [publishedPosts, search, selectedCat]);

  const featuredPost = filteredPosts[0];
  const remainingPosts = filteredPosts.slice(1);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            {t?.badge || (isEn ? 'IT Knowledge & Hardware Insights' : 'Kiến thức máy tính & Tin tức Vi Tính An Tâm')}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t?.title || (isEn ? 'Tech Insights & Hardware Handbook' : 'Góc Kỹ Thuật & Cẩm Nang Laptop')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            {t?.subtitle || (isEn ? 'Expert computer optimization tips, enterprise hardware diagnostics, and transparent repair case studies.' : 'Tổng hợp các thủ thuật tối ưu máy tính, phân tích phần cứng thực tế và kinh nghiệm sửa chữa minh bạch.')}
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setSelectedCat('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedCat === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {t?.allPosts || (isEn ? 'All Articles' : 'Tất cả bài viết')}
            </button>
            {blogCategories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCat(c.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedCat === c.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t?.searchPlaceholder || (isEn ? 'Search articles, hardware guides...' : 'Tìm kiếm bài viết...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>
        </div>
        {/* Featured Post Hero Card */}
        {featuredPost && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
                    {t?.featuredPost || (isEn ? 'Featured Story' : 'Bài viết nổi bật')}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    {featuredPost.reading_time_minutes || 1} {t?.readingTime || (isEn ? 'min read' : 'phút đọc')}
                  </span>
                </div>

                <Link href={`/tin-tuc/${featuredPost.slug}`}>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white hover:text-blue-600 transition leading-snug">
                    {featuredPost.title}
                  </h2>
                </Link>

                <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-3 leading-relaxed">
                  {featuredPost.excerpt || (isEn ? 'Read our comprehensive breakdown for technical symptoms and optimal solutions...' : 'Đọc bài viết chi tiết để hiểu rõ hơn các dấu hiệu hỏng hóc và cách khắc phục tối ưu...')}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDateVN(featuredPost.published_at || featuredPost.created_at)}</span>
                    <span>• {featuredPost.author_name}</span>
                  </div>
                  <Link
                    href={`/tin-tuc/${featuredPost.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition"
                  >
                    {t?.readArticle || (isEn ? 'Read Article' : 'Đọc tiếp')} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-slate-800 dark:to-slate-800/60 rounded-2xl h-56 lg:h-72 flex flex-col items-center justify-center p-6 text-center border border-blue-200 dark:border-slate-700">
                <Laptop className="w-16 h-16 text-blue-600 dark:text-blue-400 mb-3 opacity-90" />
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Vi Tính An Tâm Lab</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">{isEn ? 'Diagnostics & Technical Reviews' : 'Đánh giá & Hướng dẫn kỹ thuật'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Grid of articles */}
        {remainingPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {remainingPosts.map((post) => {
              const cat = blogCategories.find((c) => c.id === post.category_id);
              return (
                <div
                  key={post.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between p-5 space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        {cat?.name || 'Thủ thuật'}
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-500">
                        <Clock className="w-3 h-3 text-blue-500" />
                        {post.reading_time_minutes || 1} phút đọc
                      </span>
                    </div>

                    <Link href={`/tin-tuc/${post.slug}`}>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white hover:text-blue-600 transition line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {post.excerpt || 'Đọc chi tiết hướng dẫn chuẩn kỹ thuật...'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <span>{formatDateVN(post.published_at || post.created_at)}</span>
                    <Link
                      href={`/tin-tuc/${post.slug}`}
                      className="font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                    >
                      Chi tiết <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          !featuredPost && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">Không tìm thấy bài viết nào</h3>
              <p className="text-xs text-slate-500 mt-1">Hãy thử tìm kiếm với từ khóa khác.</p>
            </div>
          )
        )}

      </div>
    </div>
  );
}
