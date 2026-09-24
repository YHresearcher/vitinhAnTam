import type { Metadata } from 'next';
import WhyUsPage from './ViSaoChonClient';

export const metadata: Metadata = {
  title: 'Vì Sao Chọn Vi Tính An Tâm? — 5 Lý Do Hàng Đầu',
  description:
    'Khám phá lý do Vi Tính An Tâm là địa chỉ mua máy tính cũ uy tín #1 Tân An, Long An: bo mạch chủ nguyên bản 100%, SSD/RAM mới BH 36 tháng, Win bản quyền vĩnh viễn, bảo hành 1 đổi 1 hỏa tốc.',
  alternates: {
    canonical: '/vi-sao-chon-an-tam',
  },
  openGraph: {
    title: 'Vì Sao Chọn Vi Tính An Tâm? — Mua Máy Tính Cũ Uy Tín Tân An',
    description:
      '5 lý do chọn Vi Tính An Tâm: Bo mạch chủ nguyên bản, SSD/RAM mới, Win bản quyền, BH 1 đổi 1 hỏa tốc, kỹ thuật tận nhà.',
    url: 'https://vitinhantham.vn/vi-sao-chon-an-tam',
    images: [
      {
        url: 'https://vitinhantham.vn/anh-that-cua-hang.jpg',
        width: 1200,
        height: 630,
        alt: 'Vì sao chọn Vi Tính An Tâm — Máy tính cũ uy tín Tân An',
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
      name: 'Vì sao chọn An Tâm',
      item: 'https://vitinhantham.vn/vi-sao-chon-an-tam',
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
      <WhyUsPage />
    </>
  );
}
