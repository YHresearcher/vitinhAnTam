import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientProvider } from "@/components/ClientProvider";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vi Tính An Tâm - Hệ Thống Bảo Hành Điện Tử & CRM Kỹ Thuật",
  description: "Cổng tra cứu bảo hành điện tử, quản lý kho máy tính đồng bộ Dell/HP, quản lý phiếu tiếp nhận và tính tiền công ca kỹ thuật viên.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-white text-slate-900 antialiased flex flex-col font-sans">
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}
