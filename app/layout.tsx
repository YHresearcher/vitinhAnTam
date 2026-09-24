import type { Metadata, Viewport } from 'next';
import { Be_Vietnam_Pro, Inter } from 'next/font/google';
import './globals.css';
import { ClientProvider } from '@/components/ClientProvider';
import { AntdRegistry } from '@ant-design/nextjs-registry';

export const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-be-vietnam-pro',
  display: 'swap',
});

export const inter = Inter({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#C0392B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://vitinhantham.vn'),
  title: {
    default: 'Vi tính An Tâm - Bán bằng tâm để bạn an tâm',
    template: '%s | Vi tính An Tâm - Bán bằng tâm để bạn an tâm',
  },
  description:
    'PC đồng bộ & laptop tuyển chọn, Windows sạch bản quyền, linh kiện rõ ràng, bảo hành chu đáo và hỗ trợ kỹ thuật tận tâm. Hotline 0909.053.058.',
  keywords: [
    'Máy tính văn phòng',
    'Vi Tính An Tâm',
    'máy tính Long An',
    'laptop văn phòng',
    'Dell OptiPlex',
    'ThinkPad',
    'sửa máy tính tận nơi',
    'cứu hộ máy tính',
  ],
  icons: {
    icon: '/favicon.ico',
  },
  authors: [{ name: 'Vi Tính An Tâm', url: 'https://vitinhantham.vn' }],
  creator: 'Vi Tính An Tâm',
  publisher: 'Vi Tính An Tâm',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Vi tính An Tâm - Bán bằng tâm để bạn an tâm',
    description: 'PC đồng bộ & laptop tuyển chọn, linh kiện rõ ràng, bảo hành chu đáo. Hotline: 0909.053.058.',
    url: 'https://vitinhantham.vn',
    siteName: 'Vi Tính An Tâm',
    locale: 'vi_VN',
    type: 'website',
    images: [
      {
        url: 'https://vitinhantham.vn/anh-that-cua-hang.jpg',
        width: 1200,
        height: 630,
        alt: 'Vi Tính An Tâm — Máy Tính Đồng Bộ & Laptop Tuyển Chọn',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vi tính An Tâm - Bán bằng tâm để bạn an tâm',
    description: 'PC đồng bộ & laptop tuyển chọn, linh kiện rõ ràng, hỗ trợ tận tâm.',
    images: ['https://vitinhantham.vn/anh-that-cua-hang.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Vi Tính An Tâm',
  slogan: 'Bán bằng tâm để bạn an tâm',
  url: 'https://vitinhantham.vn',
  telephone: '+84909053058',
  email: 'lienhe@vitinhantham.vn',
  image: 'https://vitinhantham.vn/anh-that-cua-hang.jpg',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '45 Nguyễn Huệ, Phường 1',
    addressLocality: 'Tân An',
    addressRegion: 'Long An',
    postalCode: '820000',
    addressCountry: 'VN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 10.5333,
    longitude: 106.4167,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '21:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Saturday', 'Sunday'],
      opens: '08:00',
      closes: '21:00',
    },
  ],
  priceRange: '3.000.000₫ - 8.000.000₫',
  areaServed: [
    { '@type': 'AdministrativeArea', name: 'Long An' },
  ],
  sameAs: [
    'https://zalo.me/0909053058',
    'https://wa.me/84909053058',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} ${inter.variable} scroll-smooth`}>
      <head>
        {/* Schema.org Structured Data for Local SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[#FAF7F2] text-[#2B1810] font-sans antialiased flex flex-col selection:bg-[#FDE8DF] selection:text-[#C0392B]">
        <AntdRegistry>
          <ClientProvider>{children}</ClientProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
