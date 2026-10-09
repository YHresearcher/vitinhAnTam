import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FloatingContactWidget } from '@/components/FloatingContactWidget';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#0B132B] text-[#2B1810] dark:text-[#E2E8F0] flex flex-col selection:bg-[#C0392B] selection:text-white font-inter transition-colors duration-200">
      <Navbar />
      <div className="flex-1">{children}</div>
      <FloatingContactWidget />
      <Footer />
    </div>
  );
}

