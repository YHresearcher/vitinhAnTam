import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ReadingProgressBar from '@/components/blog/ReadingProgressBar';
import BlogJsonLd from '@/components/blog/BlogJsonLd';
import { supabase, isSupabaseConfigured, BlogPost, MOCK_BLOG_POSTS } from '@/lib/supabase';
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

  const postUrl = `https://www.vitinhantam.com/tin-tuc/${post.slug}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <ReadingProgressBar />
      <BlogJsonLd post={post} url={postUrl} />
      <BlogPostDetailClient post={post} postUrl={postUrl} />
    </div>
  );
}
