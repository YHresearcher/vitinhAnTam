'use client';

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import BlogPostForm from '@/components/admin/blog/BlogPostForm';
import { useViTinhAnTamStore } from '@/lib/store';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function EditBlogPostPage() {
  const params = useParams();
  const id = params?.id as string;
  const { blogPosts } = useViTinhAnTamStore();

  const post = useMemo(() => {
    return blogPosts.find((p) => p.id === id);
  }, [blogPosts, id]);

  if (!post) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center max-w-md mx-auto my-12 space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Không tìm thấy bài viết</h2>
        <p className="text-xs text-slate-500">
          Bài viết có thể đã bị xóa hoặc đường dẫn không chính xác (ID: {id}).
        </p>
        <Link
          href="/bai-viet"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách bài viết
        </Link>
      </div>
    );
  }

  return <BlogPostForm initialPost={post} isNew={false} />;
}
