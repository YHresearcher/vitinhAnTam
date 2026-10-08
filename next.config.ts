import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    optimizePackageImports: ['lucide-react', 'antd', '@ant-design/icons', 'recharts'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'vitinhantham.vn',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://www.googletagmanager.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://*.supabase.co https://api.resend.com https://bot-api.zapps.me",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/dang-nhap",
        destination: "/login",
        permanent: false,
      },
      {
        source: "/admin/login",
        destination: "/login",
        permanent: false,
      },
      {
        source: "/ktv/login",
        destination: "/login",
        permanent: false,
      },
      {
        source: "/admin",
        destination: "/dashboard",
        permanent: false,
      },
      {
        source: "/admin/dashboard",
        destination: "/dashboard",
        permanent: false,
      },
      {
        source: "/admin/kho-may",
        destination: "/kho-may",
        permanent: false,
      },
      {
        source: "/admin/tickets",
        destination: "/phieu-sua-chua",
        permanent: false,
      },
      {
        source: "/admin/phieu-sua-chua",
        destination: "/phieu-sua-chua",
        permanent: false,
      },
      {
        source: "/admin/phieu-sua-chua/tao-moi",
        destination: "/phieu-sua-chua/tao-moi",
        permanent: false,
      },
      {
        source: "/admin/cuu-ho-onsite",
        destination: "/cuu-ho-onsite",
        permanent: false,
      },
      {
        source: "/admin/tien-cong",
        destination: "/tien-cong",
        permanent: false,
      },
      {
        source: "/admin/lich-hen",
        destination: "/cuu-ho-onsite",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

