'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from 'antd';
import { CheckCircle } from 'lucide-react';
import { useViTinhAnTamStore } from '@/lib/store';
import { formatVND } from '@/lib/supabase';
import { TRANSLATIONS } from '@/lib/translations';
import { getShowcaseProducts } from '@/lib/productsData';
import HeroSection from './HeroSection';
import ProductShowcase from './ProductShowcase';
import ServicesSection from './ServicesSection';
import FAQSection from './FAQSection';
import ReviewsSection from './ReviewsSection';

export default function HomePage() {
  const router = useRouter();
  const { currentLang, inventory, systemSettings, keyCategories, licenseKeys, faqs, reviews } = useViTinhAnTamStore();
  const isEn = currentLang === 'en';
  const t = TRANSLATIONS[currentLang || 'vi'];

  // Search state for quick warranty lookup
  const [searchInput, setSearchInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Modal for QC & S/N inspection
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim();
    if (!query) {
      showToast(isEn ? 'Please enter Service Tag!' : 'Vui lòng nhập Service Tag!');
      return;
    }
    router.push(`/tra-cuu-bao-hanh?tag=${encodeURIComponent(query)}`);
  };

  return (
    <div className="w-full relative selection:bg-[#C0392B] selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div role="status" aria-live="polite" className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-lg bg-[#2B1810] text-white text-xs font-semibold shadow-xl border border-[#3E291F] flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="w-full">
        {/* Components in correct order */}
        <HeroSection 
          onSearchSubmit={handleSearchSubmit} 
          searchInput={searchInput} 
          setSearchInput={setSearchInput} 
          isEn={isEn} 
          t={t} 
        />
        <ProductShowcase isEn={isEn} t={t} />
        <ServicesSection isEn={isEn} t={t} />
        <FAQSection isEn={isEn} t={t} />
        <ReviewsSection isEn={isEn} t={t} />
      </main>
    </div>
  );
}

