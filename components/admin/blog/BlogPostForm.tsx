'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Save, ArrowLeft, Eye, Sparkles, HelpCircle, Plus, Trash2, Tag, Check
} from 'lucide-react';
import BlogEditor from './BlogEditor';
import BlogPostFaqEditor from './BlogPostFaqEditor';
import BlogSidebarSettings from './BlogSidebarSettings';
import { useViTinhAnTamStore } from '@/lib/store';
import { BlogPost, FaqSchemaItem } from '@/lib/supabase';

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

interface BlogPostFormProps {
  initialPost?: Partial<BlogPost>;
  isNew?: boolean;
}

export default function BlogPostForm({ initialPost, isNew = false }: BlogPostFormProps) {
  const router = useRouter();
  const { blogCategories, addBlogPost, updateBlogPost } = useViTinhAnTamStore();

  const [title, setTitle] = useState(initialPost?.title || '');
  const [slug, setSlug] = useState(initialPost?.slug || '');
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || '');
  const [content, setContent] = useState(initialPost?.content || '');
  const [contentJson, setContentJson] = useState<Record<string, unknown> | undefined>(initialPost?.content_json);
  const [coverImage, setCoverImage] = useState(initialPost?.cover_image || '');
  const [categoryId, setCategoryId] = useState(initialPost?.category_id || blogCategories[0]?.id || '');
  const [tagInput, setTagInput] = useState(initialPost?.tags?.join(', ') || '');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>(initialPost?.status || 'draft');
  const [metaTitle, setMetaTitle] = useState(initialPost?.meta_title || '');
  const [metaDescription, setMetaDescription] = useState(initialPost?.meta_description || '');
  const [focusKeyword, setFocusKeyword] = useState(initialPost?.focus_keyword || '');
  const [serviceCtaType, setServiceCtaType] = useState(initialPost?.service_cta_type || 'spa_laptop');
  const [faqs, setFaqs] = useState<FaqSchemaItem[]>(initialPost?.faq_schema || []);
  const [readingTimeMinutes, setReadingTimeMinutes] = useState(initialPost?.reading_time_minutes || 1);
  const [wordCount, setWordCount] = useState(initialPost?.word_count || 0);

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (isNew || !slug) {
      setSlug(generateSlug(val));
    }
    if (!metaTitle) {
      setMetaTitle(`${val} | Vi Tính An Tâm`);
    }
  };

  const handleAddFaq = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const handleRemoveFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const handleFaqChange = (index: number, field: 'question' | 'answer', val: string) => {
    const next = [...faqs];
    next[index][field] = val;
    setFaqs(next);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tiêu đề bài viết.');
      return;
    }

    const finalSlug = slug.trim() || generateSlug(title);
    const tagsArray = tagInput.split(',').map((t) => t.trim()).filter(Boolean);

    setIsSaving(true);
    try {
      if (isNew) {
        const created = await addBlogPost({
          title,
          slug: finalSlug,
          excerpt,
          content,
          content_json: contentJson,
          cover_image: coverImage,
          category_id: categoryId || undefined,
          tags: tagsArray,
          author_name: 'Vi Tính An Tâm',
          status,
          meta_title: metaTitle || `${title} | Vi Tính An Tâm`,
          meta_description: metaDescription || excerpt,
          focus_keyword: focusKeyword,
          faq_schema: faqs.filter((f) => f.question.trim() && f.answer.trim()),
          reading_time_minutes: readingTimeMinutes,
          word_count: wordCount,
          service_cta_type: serviceCtaType,
          view_count: 0,
          published_at: status === 'published' ? new Date().toISOString() : undefined,
        });
        setSavedSuccess(true);
        setTimeout(() => router.push(`/bai-viet/${created.id}`), 1000);
      } else if (initialPost?.id) {
        await updateBlogPost(initialPost.id, {
          title,
          slug: finalSlug,
          excerpt,
          content,
          content_json: contentJson,
          cover_image: coverImage,
          category_id: categoryId || undefined,
          tags: tagsArray,
          status,
          meta_title: metaTitle,
          meta_description: metaDescription,
          focus_keyword: focusKeyword,
          faq_schema: faqs.filter((f) => f.question.trim() && f.answer.trim()),
          reading_time_minutes: readingTimeMinutes,
          word_count: wordCount,
          service_cta_type: serviceCtaType,
          published_at: status === 'published' && !initialPost.published_at ? new Date().toISOString() : initialPost.published_at,
        });
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi lưu bài viết.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link href="/bai-viet" className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {isNew ? 'Soạn bài viết mới' : 'Chỉnh sửa bài viết'}
            </h1>
            <p className="text-xs text-slate-500">
              {status === 'published' ? '🟢 Xuất bản công khai' : '🟡 Bản nháp nội bộ'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isNew && status === 'published' && (
            <Link href={`/tin-tuc/${slug}`} target="_blank" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50">
              <Eye className="w-3.5 h-3.5" />Xem bài
            </Link>
          )}
          <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md transition disabled:opacity-50">
            {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Đang lưu...' : savedSuccess ? 'Đã lưu!' : 'Lưu bài viết'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tiêu đề bài viết *</label>
              <input type="text" required placeholder="VD: 5 Dấu hiệu Laptop cần vệ sinh tra keo tản nhiệt gấp..." value={title} onChange={handleTitleChange} className="w-full px-4 py-2.5 text-base font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Đường dẫn tĩnh (Slug URL)</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">/tin-tuc/</span>
                <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tóm tắt ngắn (Excerpt)</label>
              <textarea rows={2} placeholder="Tóm tắt ngắn hiển thị ở trang danh sách..." value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <BlogEditor content={content} onChange={(html, json, mins, words) => { setContent(html); setContentJson(json); if (mins) setReadingTimeMinutes(mins); if (words) setWordCount(words); }} />
          </div>

          <BlogPostFaqEditor faqs={faqs} onChange={setFaqs} />
        </div>

        <BlogSidebarSettings
          status={status}
          setStatus={setStatus}
          categoryId={categoryId}
          setCategoryId={setCategoryId}
          categories={blogCategories}
          serviceCtaType={serviceCtaType}
          setServiceCtaType={setServiceCtaType}
          coverImage={coverImage}
          setCoverImage={setCoverImage}
          tagInput={tagInput}
          setTagInput={setTagInput}
          metaTitle={metaTitle}
          setMetaTitle={setMetaTitle}
          metaDescription={metaDescription}
          setMetaDescription={setMetaDescription}
          focusKeyword={focusKeyword}
          setFocusKeyword={setFocusKeyword}
        />
      </div>
    </form>
  );
}
