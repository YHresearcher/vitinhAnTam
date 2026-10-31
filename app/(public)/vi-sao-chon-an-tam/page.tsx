import type { Metadata } from 'next';
import WhyUsPage from './ViSaoChonClient';

export const metadata: Metadata = {
  title: 'Lý Do Chọn Vi Tính An Tâm — Trung Thực, Trách Nhiệm & Tận Tâm',
  description:
    'Khám phá lý do khách hàng tin tưởng Vi Tính An Tâm: máy tính bo mạch nguyên bản chưa sửa chữa, linh kiện minh bạch rõ ràng mới/cũ, vệ sinh tra keo cẩn thận và hỗ trợ kỹ thuật nhanh chóng.',
  alternates: {
    canonical: '/vi-sao-chon-an-tam',
  },
  openGraph: {
    title: 'Lý Do Chọn Vi Tính An Tâm — Mua Máy Tính & Dịch Vụ Uy Tín',
    description:
      'Lý do chọn Vi Tính An Tâm: Bo mạch nguyên bản, linh kiện mới cũ minh bạch, kiểm tra cẩn thận và hỗ trợ kỹ thuật nhanh chóng không làm gián đoạn công việc của bạn.',
    url: 'https://www.vitinhantam.com/vi-sao-chon-an-tam',
    images: [
      {
        url: 'https://www.vitinhantam.com/images/hero-laptop-windows.webp',
        width: 1200,
        height: 630,
        alt: 'Lý do chọn Vi Tính An Tâm',
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
      item: 'https://www.vitinhantam.com',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Lý do chọn An Tâm',
      item: 'https://www.vitinhantam.com/vi-sao-chon-an-tam',
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
