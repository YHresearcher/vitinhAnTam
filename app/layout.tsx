import type { Metadata, Viewport } from 'next';
import { Be_Vietnam_Pro, Inter } from 'next/font/google';
import './globals.css';
import { ClientProvider } from '@/components/ClientProvider';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { getStoredSettings } from '@/lib/server/settings';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-be-vietnam-pro',
  display: 'swap',
});

const inter = Inter({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700'],
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
  metadataBase: new URL('https://vitinhantam.com'),
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  title: {
    default: 'Vi tính An Tâm - Bán bằng tâm để bạn an tâm',
    template: '%s | Vi tính An Tâm - Bán bằng tâm để bạn an tâm',
  },
  description:
    'PC đồng bộ & laptop tuyển chọn, Windows sạch bản quyền, linh kiện rõ ràng, bảo hành chu đáo và hỗ trợ kỹ thuật tận tâm. Hotline 0909.053.058.',
  keywords: [
    'Máy tính văn phòng',
    'Vi Tính An Tâm',
    'máy tính Tây Ninh',
    'laptop văn phòng',
    'Dell OptiPlex',
    'ThinkPad',
    'sửa máy tính tận nơi',
    'cứu hộ máy tính',
  ],
  authors: [{ name: 'Vi Tính An Tâm', url: 'https://vitinhantam.com' }],
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
    url: 'https://vitinhantam.com',
    siteName: 'Vi Tính An Tâm',
    locale: 'vi_VN',
    type: 'website',
    images: [
      {
        url: 'https://vitinhantam.com/anh-that-cua-hang.jpg',
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
    images: ['https://vitinhantam.com/anh-that-cua-hang.jpg'],
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
  url: 'https://vitinhantam.com',
  telephone: '+84909053058',
  email: 'hello@vitinhantam.com',
  image: 'https://vitinhantam.com/anh-that-cua-hang.jpg',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '52 Nguyễn Cửu Vân',
    addressLocality: 'Long An',
    addressRegion: 'Tây Ninh',
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
    { '@type': 'AdministrativeArea', name: 'Tây Ninh' },
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
  const initialSettings = getStoredSettings();

  return (
    <html lang="vi" className={`${beVietnamPro.variable} ${inter.variable} scroll-smooth`} suppressHydrationWarning>
      <head>
        {/* Anti-FOUC Theme Initialization (Only applies to Admin Portal) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=window.location.pathname;var adminPrefixes=['/dashboard','/tai-chinh','/quan-ly-key','/phieu-sua-chua','/kho-may','/khach-hang','/cuu-ho-onsite','/tien-cong','/thanh-vien','/cai-dat','/quan-ly-don-hang','/bai-viet'];var isAdmin=adminPrefixes.some(function(a){return p===a||p.indexOf(a+'/')===0;});if(isAdmin){var t=localStorage.getItem('vtat_admin_theme_v1')||localStorage.getItem('vtat_theme_v1');if(t==='dark'){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}else{document.documentElement.classList.remove('dark');}}catch(e){}})();`,
          }}
        />
        {/* Schema.org Structured Data for Local SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[#FAF7F2] text-[#2B1810] font-sans antialiased flex flex-col selection:bg-[#FDE8DF] selection:text-[#C0392B]">
        <AntdRegistry>
          <ClientProvider initialSettings={initialSettings}>{children}</ClientProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
