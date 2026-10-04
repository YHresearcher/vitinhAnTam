import { MetadataRoute } from 'next';
import { MOCK_BLOG_POSTS } from '@/lib/supabase';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://vitinhantham.vn';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tin-tuc`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/danh-muc-san-pham`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tra-cuu-bao-hanh`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/dat-lich`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/vi-sao-chon-an-tam`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  const blogRoutes: MetadataRoute.Sitemap = MOCK_BLOG_POSTS.filter((p) => p.status === 'published').map((post) => ({
    url: `${baseUrl}/tin-tuc/${post.slug}`,
    lastModified: new Date(post.updated_at || post.published_at || post.created_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...blogRoutes];
}

