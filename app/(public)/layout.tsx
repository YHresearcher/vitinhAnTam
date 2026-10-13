'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FloatingContactWidget } from '@/components/FloatingContactWidget';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  // Giao diện trang chủ và công khai luôn luôn giữ theme sáng
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2B1810] flex flex-col selection:bg-[#C0392B] selection:text-white font-inter">
      {!isLoginPage && <Navbar />}
      <div className="flex-1">{children}</div>
      {!isLoginPage && <FloatingContactWidget />}
      {!isLoginPage && <Footer />}
    </div>
  );
}

