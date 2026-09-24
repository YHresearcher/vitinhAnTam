import type { Metadata } from 'next';
import AppointmentBookingPage from './DatLichClient';

export const metadata: Metadata = {
  title: 'Đặt Lịch Sửa Chữa & Cứu Hộ Máy Tính Tận Nơi',
  description:
    'Đặt lịch sửa máy tính tận nhà tại Tân An, Thủ Thừa, Châu Thành, Tân Trụ. Cứu hộ khẩn 17h30–21h. Kỹ thuật viên đến trong 2 giờ. Hotline: 0909.053.058.',
  alternates: {
    canonical: '/dat-lich',
  },
  openGraph: {
    title: 'Đặt Lịch Sửa Máy Tính Tận Nơi — Vi Tính An Tâm',
    description:
      'Đặt lịch cứu hộ khẩn, sửa chữa máy tính tận nhà tại Tân An & các huyện lân cận. Phục vụ 7 ngày/tuần.',
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
