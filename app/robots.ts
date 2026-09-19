import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/kho-may', '/phieu-sua-chua', '/tien-cong', '/cuu-ho-onsite', '/thanh-vien', '/cai-dat', '/api/'],
      },
    ],
    sitemap: 'https://vitinhantham.vn/sitemap.xml',
  };
}
