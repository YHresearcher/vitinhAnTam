import type { Metadata } from 'next';
import ProductsCatalogPage from './DanhMucClient';

export const metadata: Metadata = {
  title: 'Danh Mục Máy Tính Cũ Chuẩn A Có Sẵn — Dell, HP, Lenovo Tuyển Chọn',
  description:
    'Xem toàn bộ PC đồng bộ & laptop doanh nhân Dell, HP, Lenovo tuyển chọn có sẵn tại Vi Tính An Tâm Tân An. SSD mới 100%, Win bản quyền số, bảo hành 1 đổi 1 hỏa tốc.',
  alternates: {
    canonical: '/danh-muc-san-pham',
  },
  openGraph: {
    title: 'Danh Mục Máy Tính Cũ Chuẩn A — Vi Tính An Tâm',
    description:
      'PC đồng bộ Dell OptiPlex, HP ProDesk, Lenovo ThinkCentre tuyển chọn. Giá từ 3tr, bảo hành 1 đổi 1 hỏa tốc.',
    url: 'https://vitinhantham.vn/danh-muc-san-pham',
    images: [
      {
        url: 'https://vitinhantham.vn/anh-that-cua-hang.jpg',
        width: 1200,
        height: 630,
        alt: 'Danh mục máy tính cũ chuẩn A tại Vi Tính An Tâm',
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
      name: 'Danh mục sản phẩm',
      item: 'https://vitinhantham.vn/danh-muc-san-pham',
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
      <ProductsCatalogPage />
    </>
  );
}
