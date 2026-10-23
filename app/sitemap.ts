import { MetadataRoute } from 'next';
import { getServerSupabase } from '@/lib/server/supabaseAdmin';

// Sitemap đọc bài blog published THẬT từ DB (trước đây đọc MOCK_BLOG_POSTS
// luôn rỗng nên không có URL blog nào). Lỗi DB → vẫn trả route tĩnh.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.vitinhantam.com';

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

  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const db = getServerSupabase();
    if (db) {
      const { data, error } = await db
        .from('blog_posts')
        .select('slug, updated_at, published_at, created_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(1000);
      if (!error && data) {
        blogRoutes = data
          .filter((post) => typeof post.slug === 'string' && post.slug.length > 0)
          .map((post) => ({
            url: `${baseUrl}/tin-tuc/${post.slug}`,
            lastModified: new Date(post.updated_at || post.published_at || post.created_at),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
          }));
      }
    }
  } catch {
    // Sitemap không bao giờ được sập vì lỗi DB — trả phần tĩnh.
  }

  return [...staticRoutes, ...blogRoutes];
}
