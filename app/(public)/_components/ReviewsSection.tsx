'use client';

import React from 'react';
import { Star, CheckCircle } from 'lucide-react';
import { useViTinhAnTamStore } from '@/lib/store';
import { TRANSLATIONS, ENGLISH_REVIEWS } from '@/lib/translations';
import { initialCustomerReviews } from '@/lib/mockData';

interface ReviewsSectionProps {
  isEn: boolean;
  t: any;
}

export default function ReviewsSection({ isEn, t }: ReviewsSectionProps) {
  const { reviews } = useViTinhAnTamStore();
  
  const displayReviews = React.useMemo(() => {
    if (isEn) return ENGLISH_REVIEWS;
    if (reviews && reviews.length > 0) return reviews;
    return initialCustomerReviews;
  }, [isEn, reviews]);

  return (
    <section className="bg-[#FAF7F2] border-y border-[#E8E2D9] py-16 scroll-mt-20" id="danh-gia">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="text-xs uppercase tracking-widest text-[#C0392B] font-bold">{t.reviews.tag}</div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#2B1810] tracking-tight mt-1">{t.reviews.title}</h2>
          <p className="text-xs sm:text-sm text-[#6E5D53]">{t.reviews.ratingText}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayReviews.slice(0, 6).map((rev, idx) => (
            <div key={rev.id || idx} className="p-6 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs hover:border-[#C0392B] transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[...Array(rev.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle className="w-3 h-3 inline" /> {isEn ? 'Verified' : 'Đã xác thực'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#2B1810] italic mb-4">"{rev.comment}"</p>
              <div className="pt-3 border-t border-[#E8E2D9]">
                <div className="font-bold text-xs text-[#2B1810]">{rev.name}</div>
                <div className="text-[11px] text-[#6E5D53]">{rev.role}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{rev.location}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
