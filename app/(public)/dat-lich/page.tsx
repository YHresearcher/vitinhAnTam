import type { Metadata } from 'next';
import AppointmentBookingPage from './DatLichClient';

export const metadata: Metadata = {
  title: 'Đặt Lịch Sửa Chữa & Cứu Hộ Máy Tính Tận Nơi',
  description:
    'Đặt lịch sửa chữa và kiểm tra máy tính tận nơi theo lịch hẹn thuận tiện. Kỹ thuật viên hỗ trợ tận tình. Hotline: 0909.053.058.',
  alternates: {
    canonical: '/dat-lich',
  },
  openGraph: {
    title: 'Đặt Lịch Sửa Máy Tính Tận Nơi — Vi Tính An Tâm',
    description:
      'Đặt lịch kiểm tra và sửa chữa máy tính tận nơi linh hoạt. Phục vụ cả ngày trong tuần và ngoài giờ.',
    url: 'https://vitinhantham.vn/dat-lich',
    images: [
      {
        url: 'https://vitinhantham.vn/anh-that-cua-hang.jpg',
        width: 1200,
        height: 630,
        alt: 'Đặt lịch sửa chữa máy tính tận nơi tại Vi Tính An Tâm',
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
      name: 'Đặt lịch sửa chữa',
      item: 'https://vitinhantham.vn/dat-lich',
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
      <AppointmentBookingPage />
    </>
  );
}
