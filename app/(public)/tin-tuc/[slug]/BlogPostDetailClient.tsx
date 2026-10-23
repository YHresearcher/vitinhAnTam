'use client';

import React from 'react';
import Link from 'next/link';
import {
  Clock, Calendar, Share2, Tag,
  HelpCircle, ChevronRight, PhoneCall
} from 'lucide-react';
import DOMPurify from 'dompurify';
import TableOfContents from '@/components/blog/TableOfContents';
import { BlogPost, formatDateVN } from '@/lib/supabase';
import { useViTinhAnTamStore } from '@/lib/store';
import { TRANSLATIONS } from '@/lib/translations';

interface BlogPostDetailClientProps {
  post: BlogPost;
  postUrl: string;
}

export default function BlogPostDetailClient({ post, postUrl }: BlogPostDetailClientProps) {
  const { currentLang } = useViTinhAnTamStore();
  const isEn = currentLang === 'en';
  const t = TRANSLATIONS[currentLang || 'vi'].blog;

  // Bản tiếng Anh đã lưu sẵn (nếu có) — khách chọn English sẽ đọc bản này
  const title = isEn && post.title_en ? post.title_en : post.title;
  const contentHtml = (isEn && post.content_en ? post.content_en : post.content) || '';
  const faqs =
    isEn && post.faq_schema_en && post.faq_schema_en.length > 0 ? post.faq_schema_en : post.faq_schema;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto whitespace-nowrap py-2">
        <Link href="/" className="hover:text-blue-600 transition">
          {t?.breadcrumbHome || (isEn ? 'Home' : 'Trang chủ')}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/tin-tuc" className="hover:text-blue-600 transition">
          {t?.breadcrumbBlog || (isEn ? 'Tech Blog' : 'Tin tức')}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-xs">{title}</span>
      </nav>

      {/* Article Container Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Article Content */}
        <article className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xs space-y-8">
          {/* Post Header */}
          <div className="space-y-4 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold">
                <Tag className="w-3 h-3" />
                {t?.technicalGuideTag || (isEn ? 'Technical Guide' : 'Kỹ thuật & Cẩm nang')}
              </span>
              <span className="inline-flex items-center gap-1 font-bold text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                {post.reading_time_minutes || 1} {t?.readingTime || (isEn ? 'min read' : 'phút đọc')} ({post.word_count || 0} {t?.wordsSuffix || (isEn ? 'words' : 'từ')})
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
              {title}
            </h1>

            {post.excerpt && (
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed italic border-l-4 border-blue-500 pl-4 py-1">
                {post.excerpt}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-slate-500">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  AT
                </div>
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{post.author_name}</div>
                  <div className="text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDateVN(post.published_at || post.created_at)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 transition"
                  title={t?.shareFacebook || (isEn ? 'Share on Facebook' : 'Chia sẻ Facebook')}
                >
                  <Share2 className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Rich HTML Content — bắt buộc sanitize để chống stored XSS */}
          <div
            className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-base leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(contentHtml) }}
          />

          {/* Tags footer */}
          {post.tags && post.tags.length > 0 && (
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">{isEn ? 'Keywords & Tags:' : 'Thẻ từ khóa:'}</span>
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* FAQ Accordion Section */}
          {faqs && faqs.length > 0 && (
            <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isEn ? 'Frequently Asked Questions' : 'Câu hỏi thường gặp'}
                </h2>
              </div>
              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5"
                  >
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {idx + 1}. {faq.question}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Right Sticky Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="sticky top-20 space-y-6">
            <TableOfContents contentHtml={contentHtml} />

            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg space-y-4">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold tracking-wider uppercase">
                {isEn ? 'Hardware Diagnostics & Care' : 'Tư vấn & Sửa chữa Laptop'}
              </span>
              <h3 className="text-lg font-bold">
                {isEn ? 'Need hardware diagnostics or performance tuning?' : 'Cần hỗ trợ kiểm tra hoặc tối ưu máy tính?'}
              </h3>
              <p className="text-xs text-blue-100 leading-relaxed">
                {isEn
                  ? 'Our certified technician team offers complimentary diagnostics, same-day cooling spa with Arctic MX-4, and instant hardware acceleration.'
                  : 'Đội ngũ kỹ thuật viên Vi Tính An Tâm sẵn sàng kiểm tra máy miễn phí, vệ sinh tra keo tản nhiệt lấy liền và nâng cấp tốc độ trong ngày.'}
              </p>
              <div className="pt-2">
                <a
                  href="tel:0909053058"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white text-blue-700 font-bold text-sm shadow-md hover:bg-blue-50 transition"
                >
                  <PhoneCall className="w-4 h-4" /> {isEn ? 'Call Hotline: 0909.053.058' : 'Gọi hotline 0909.053.058'}
                </a>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
