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
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col selection:bg-[#C0392B] selection:text-white font-inter">
      <Navbar />
      <div className="flex-1">{children}</div>
      <FloatingContactWidget />
      <Footer />
    </div>
  );
}

