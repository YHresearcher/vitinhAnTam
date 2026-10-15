'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useViTinhAnTamStore } from '@/lib/store';
import { TRANSLATIONS, ENGLISH_FAQS } from '@/lib/translations';

interface FAQSectionProps {
  isEn: boolean;
  t: any;
}

export default function FAQSection({ isEn, t }: FAQSectionProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const { faqs } = useViTinhAnTamStore();
  
  const activeFaqs = React.useMemo(() => {
    if (isEn && ENGLISH_FAQS) return ENGLISH_FAQS;
    if (faqs && faqs.length > 0) {
      return faqs.map((f) => ({ question: f.question, answer: f.answer }));
    }
    return [];
  }, [isEn, faqs]);

  if (activeFaqs.length === 0) return null;

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 scroll-mt-20" id="faq-an-tam">
      <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black text-[#2B1810] tracking-tight">{t.faq.title}</h2>
        <p className="text-xs sm:text-sm text-[#6E5D53]">{t.faq.subtitle}</p>
      </div>

      <div className="space-y-3">
        {activeFaqs.map((item, idx) => {
          const isOpen = openFaqIndex === idx;
          return (
            <div key={idx} className="rounded-xl bg-white border border-[#E8E2D9] p-4 hover:border-[#C0392B] transition-all">
              <button
                onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="text-sm font-bold text-[#2B1810] pr-4">{item.question}</span>
                <ChevronDown className={`w-4 h-4 text-[#C0392B] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <div className="pt-3 mt-2 border-t border-[#E8E2D9]">
                  <p className="text-xs text-[#6E5D53] leading-relaxed">{item.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
