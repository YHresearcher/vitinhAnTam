import type { Metadata } from 'next';
import WarrantyLookupPage from './TraCuuClient';

export const metadata: Metadata = {
  title: 'Tra Cứu Bảo Hành Theo Service Tag',
  description:
    'Nhập mã Service Tag hoặc số điện thoại để tra cứu tình trạng bảo hành máy tính tại Vi Tính An Tâm. Bảo hành 1 đổi 1 hỏa tốc trong 2 giờ tại Tân An, Long An.',
  alternates: {
    canonical: '/tra-cuu-bao-hanh',
  },
  openGraph: {
    title: 'Tra Cứu Bảo Hành — Vi Tính An Tâm',
    description:
      'Tra cứu nhanh tình trạng bảo hành máy tính bằng Service Tag hoặc số điện thoại. Bảo hành 1 đổi 1 hỏa tốc.',
    url: 'https://vitinhantham.vn/tra-cuu-bao-hanh',
    images: [
      {
        url: 'https://vitinhantham.vn/anh-that-cua-hang.jpg',
        width: 1200,
        height: 630,
        alt: 'Tra cứu bảo hành máy tính tại Vi Tính An Tâm',
      },
    ],
  },
};

// BreadcrumbList structured data
const breadcrumbJsonLd = {
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
      name: 'Tra cứu bảo hành',
      item: 'https://vitinhantham.vn/tra-cuu-bao-hanh',
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <WarrantyLookupPage />
    </>
  );
}
