import React from 'react';
import { BlogPost } from '@/lib/supabase';
import { calculateReadingTime } from '@/lib/reading-time';

interface BlogJsonLdProps {
  post: BlogPost;
  url: string;
}

export default function BlogJsonLd({ post, url }: BlogJsonLdProps) {
  const stats = calculateReadingTime(post.content || '');

  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.meta_description || post.excerpt,
    image: post.cover_image ? [post.cover_image] : undefined,
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at || post.created_at,
    author: {
      '@type': 'Organization',
      name: post.author_name || 'Vi Tính An Tâm',
      url: 'https://vitinhantham.vn',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Vi Tính An Tâm',
      logo: {
        '@type': 'ImageObject',
        url: 'https://vitinhantham.vn/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    wordCount: post.word_count || stats.words,
    timeRequired: stats.timeRequiredIso,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Trang chủ',
        item: 'https://vitinhantham.vn',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tin tức & Thủ thuật',
        item: 'https://vitinhantham.vn/tin-tuc',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: url,
      },
    ],
  };

  const hasFaqs = post.faq_schema && post.faq_schema.length > 0;
  const faqSchema = hasFaqs
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: post.faq_schema!.map((f) => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.answer,
          },
        })),
      }
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </>
  );
}
