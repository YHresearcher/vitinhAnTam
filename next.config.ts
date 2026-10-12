import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  compress: true,
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
        hostname: 'vitinhantam.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
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
        destination: "/cuu-ho-onsite?tab=counter",
        permanent: false,
      },
      {
        source: "/admin/phieu-sua-chua",
        destination: "/cuu-ho-onsite?tab=counter",
        permanent: false,
      },
      {
        source: "/phieu-sua-chua",
        destination: "/cuu-ho-onsite?tab=counter",
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

