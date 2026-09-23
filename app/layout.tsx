import type { Metadata, Viewport } from 'next';
import { Be_Vietnam_Pro, JetBrains_Mono, Inter } from 'next/font/google';
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
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['vietnamese', 'latin'],
  variable: '--font-mono',
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
  title: 'Máy tính cũ chuẩn A Tân An | Vi Tính An Tâm — Long An',
  description:
    'PC đồng bộ & laptop doanh nhân tuyển chọn, Win bản quyền, bảo hành 1 đổi 1 hỏa tốc trong 2 giờ (<5km Tân An), hỗ trợ Thủ Thừa, Châu Thành, Tân Trụ. Hotline 0909.053.058.',
  keywords: [
    'Máy tính cũ chuẩn A Tân An',
    'Vi Tính An Tâm',
    'máy tính Long An',
    'laptop cũ Tân An',
    'Dell OptiPlex Long An',
    'ThinkPad Tân An',
    'hỏa tốc trong 2 giờ <5km Tân An',
    'sửa máy tính Tân An',
    'cứu hộ máy tính Long An',
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
    title: 'Vi Tính An Tâm — Máy tính cũ chuẩn A tại Tân An',
    description: 'Bảo hành 1 đổi 1 hỏa tốc 2 giờ (<5km Tân An). SSD/RAM mới BH 36 tháng. Hotline: 0909.053.058.',
    url: 'https://vitinhantham.vn',
    siteName: 'Vi Tính An Tâm',
    locale: 'vi_VN',
    type: 'website',
    images: [
      {
        url: 'https://vitinhantham.vn/anh-that-cua-hang.jpg',
        width: 1200,
        height: 630,
        alt: 'Vi Tính An Tâm — Máy Tính Cũ Chuẩn A Tại Tân An Long An',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vi Tính An Tâm — Máy tính cũ chuẩn A tại Tân An',
    description: 'Bảo hành 1 đổi 1 hỏa tốc 2 giờ (<5km Tân An). SSD/RAM mới BH 36 tháng.',
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
  address: {
    '@type': 'PostalAddress',
    streetAddress: '45 Nguyễn Huệ, Phường 1',
    addressLocality: 'Tân An',
    addressRegion: 'Long An',
    addressCountry: 'VN',
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
  areaServed: ['Tân An', 'Thủ Thừa', 'Châu Thành', 'Tân Trụ'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
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
