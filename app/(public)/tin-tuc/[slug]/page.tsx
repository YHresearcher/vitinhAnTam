import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ReadingProgressBar from '@/components/blog/ReadingProgressBar';
import BlogJsonLd from '@/components/blog/BlogJsonLd';
import { supabase, isSupabaseConfigured, BlogPost } from '@/lib/supabase';
import BlogPostDetailClient from './BlogPostDetailClient';

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (data && !error) return data as BlogPost;
  }
  const found = MOCK_BLOG_POSTS.find((p) => p.slug === slug && p.status === 'published');
  return found || null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: 'Bài viết không tồn tại | Vi Tính An Tâm' };

  return {
    title: post.meta_title || `${post.title} | Vi Tính An Tâm`,
    description: post.meta_description || post.excerpt,
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt,
      images: post.cover_image ? [{ url: post.cover_image }] : undefined,
      type: 'article',
      publishedTime: post.published_at || post.created_at,
      authors: [post.author_name || 'Vi Tính An Tâm'],
    },
  };
}

export default async function BlogPostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const postUrl = `https://vitinhantam.com/tin-tuc/${post.slug}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <ReadingProgressBar />
      <BlogJsonLd post={post} url={postUrl} />

      <BlogPostDetailClient post={post} postUrl={postUrl} />
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto whitespace-nowrap py-2">
          <Link href="/" className="hover:text-blue-600 transition">Trang chủ</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/tin-tuc" className="hover:text-blue-600 transition">Tin tức</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-xs">{post.title}</span>
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
                  Kỹ thuật & Cẩm nang
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  {post.reading_time_minutes || 1} phút đọc ({post.word_count || 0} từ)
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
                {post.title}
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
                      <Calendar className="w-3 h-3" />
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
                    title="Chia sẻ Facebook"
                  >
                    <Share2 className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Rich HTML Content */}
            <div
              className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-base leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            {/* Tags footer */}
            {post.tags && post.tags.length > 0 && (
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Thẻ từ khóa:</span>
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
            {post.faq_schema && post.faq_schema.length > 0 && (
              <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Câu hỏi thường gặp</h2>
                </div>
                <div className="space-y-3">
                  {post.faq_schema.map((faq, idx) => (
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


        </div>
      </div>
    </div>
  );
}
