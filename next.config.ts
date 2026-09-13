import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
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

