import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ClientProvider } from '@/components/ClientProvider';

export const inter = Inter({
  subsets: ['vietnamese', 'latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['vietnamese', 'latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#1D4ED8',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://vitinhantham.vn'),
  title: {
    default: 'Vi Tính An Tâm - Máy Tính Cũ Tuyển Chọn Loại 1 & Dịch Vụ 2H Tận Nơi Long An - Tây Ninh',
    template: '%s | Vi Tính An Tâm',
  },
  description: 'Chuyên PC đồng bộ văn phòng, laptop doanh nhân tuyển chọn loại 1 nguyên bản >95%, cài sẵn Windows bản quyền số vĩnh viễn và dịch vụ kiểm tra bảo hành, cứu hộ tận nơi trong 2 giờ tại Long An - Tây Ninh.',
  keywords: [
    'Vi tính An Tâm',
    'máy tính cũ loại 1',
    'máy tính đồng bộ Long An',
    'máy tính Tây Ninh',
    'laptop doanh nhân cũ',
    'Dell OptiPlex',
    'ThinkPad T480s',
    'cứu hộ máy tính tận nơi 2 giờ',
    'kiểm tra bảo hành điện tử',
    'sửa máy tính Long An',
    'sửa máy tính Tây Ninh',
    'Windows bản quyền số',
  ],
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
    title: 'Vi Tính An Tâm - Máy Tính Cũ Tuyển Chọn Loại 1 & Xử Lý Tận Nơi Trong 2 Giờ',
    description: 'Máy tính đồng bộ doanh nghiệp nguyên bản, bảo hành 1 đổi 1 tận nơi trong 2 giờ tại Long An - Tây Ninh. Hotline: 0909.053.058.',
    url: 'https://vitinhantham.vn',
    siteName: 'Vi Tính An Tâm',
    locale: 'vi_VN',
    type: 'website',
    images: [
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVHGVQdGoKoVXAwU6yjMLDBWAOvJvMJjMYYR-uGGp_yR16sbGNGfIGEVOI-jK5EAILW4owtjMgdNjqreUBRD3syOQ6OcUN6-yvS10I7Hqh9Ae-XW9vinCGiMR2fyCR5Rzcds6m7N29w5XAXbs-Aov2qfO1UDnRW3Vm7Je5H1DzWR2urIl3fYFAKLRqktLbhDsPj4GRtfMV3CNdDsWOVFl7arQwFItiQU2tj-mWbZRBt-i7YRGXhE19',
        width: 1200,
        height: 630,
        alt: 'Vi Tính An Tâm - Máy Tính Cũ Tuyển Chọn Loại 1 Long An - Tây Ninh',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vi Tính An Tâm - Máy Tính Cũ Chuẩn Doanh Nghiệp Long An - Tây Ninh',
    description: '1 đổi 1 linh kiện tận nơi trong 2 giờ. Windows bản quyền số vĩnh viễn.',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuCVHGVQdGoKoVXAwU6yjMLDBWAOvJvMJjMYYR-uGGp_yR16sbGNGfIGEVOI-jK5EAILW4owtjMgdNjqreUBRD3syOQ6OcUN6-yvS10I7Hqh9Ae-XW9vinCGiMR2fyCR5Rzcds6m7N29w5XAXbs-Aov2qfO1UDnRW3Vm7Je5H1DzWR2urIl3fYFAKLRqktLbhDsPj4GRtfMV3CNdDsWOVFl7arQwFItiQU2tj-mWbZRBt-i7YRGXhE19'],
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
  '@graph': [
    {
      '@type': 'ComputerStore',
      '@id': 'https://vitinhantham.vn/#store',
      name: 'Vi Tính An Tâm',
      url: 'https://vitinhantham.vn',
      logo: 'https://vitinhantham.vn/logo.png',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVHGVQdGoKoVXAwU6yjMLDBWAOvJvMJjMYYR-uGGp_yR16sbGNGfIGEVOI-jK5EAILW4owtjMgdNjqreUBRD3syOQ6OcUN6-yvS10I7Hqh9Ae-XW9vinCGiMR2fyCR5Rzcds6m7N29w5XAXbs-Aov2qfO1UDnRW3Vm7Je5H1DzWR2urIl3fYFAKLRqktLbhDsPj4GRtfMV3CNdDsWOVFl7arQwFItiQU2tj-mWbZRBt-i7YRGXhE19',
      telephone: '0909.053.058',
      priceRange: '3000000 - 8000000 VND',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Long An - Tây Ninh',
        addressRegion: 'Long An - Tây Ninh',
        addressCountry: 'VN',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 10.5333,
        longitude: 106.4,
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
      areaServed: [
        'Long An',
        'Tây Ninh',
        'TP. Tân An',
        'Bến Lức',
        'Thủ Thừa',
        'Trảng Bàng',
        'Gò Dầu',
        'TP. Tây Ninh',
      ],
    },
    {
      '@type': 'ComputerRepairService',
      '@id': 'https://vitinhantham.vn/#service',
      name: 'Dịch Vụ Cứu Hộ & Bảo Dưỡng Máy Tính Tận Nơi Trong 2 Giờ',
      provider: {
        '@id': 'https://vitinhantham.vn/#store',
      },
      areaServed: 'Long An - Tây Ninh',
      serviceType: 'Sửa chữa, nâng cấp SSD và bảo dưỡng máy tính tận nơi',
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
        {/* Schema.org Structured Data for Local SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[#F8FAFC] text-[#334155] font-sans antialiased flex flex-col selection:bg-orange-100 selection:text-orange-900">
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}
