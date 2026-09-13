import React from 'react';
import { Navbar } from '@/components/Navbar';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-blue-600 selection:text-white">
      <Navbar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
