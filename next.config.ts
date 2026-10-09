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

