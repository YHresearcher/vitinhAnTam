'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useViTinhAnTamStore } from '@/lib/store';
import { getShowcaseProducts } from '@/lib/productsData';
import { TRANSLATIONS } from '@/lib/translations';

interface ProductShowcaseProps {
  isEn: boolean;
  t: any;
}

export default function ProductShowcase({ isEn, t }: ProductShowcaseProps) {
  const { inventory, keyCategories, licenseKeys } = useViTinhAnTamStore();
  const [homeProductTab, setHomeProductTab] = useState<'all' | 'hardware' | 'software'>('all');

  const allProducts = useMemo(() => getShowcaseProducts(isEn, inventory), [isEn, inventory]);
  const inStockProducts = useMemo(() => allProducts.filter((p) => !p.isSold), [allProducts]);
  const featuredProducts = useMemo(() => inStockProducts.slice(0, 3), [inStockProducts]);

  const availableSoftwareCategories = useMemo(() => {
    return (keyCategories || [])
      .map((cat) => {
        const keys = (licenseKeys || []).filter((k) => k.category_id === cat.id && k.status === 'available');
        return { ...cat, availableStock: keys.length, price: keys[0]?.unit_price || 0 };
      })
      .filter((cat) => cat.availableStock > 0);
  }, [keyCategories, licenseKeys]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20" id="san-pham">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl sm:text-4xl font-black text-[#1A0F0A] tracking-tight">{t.products.title}</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-2xl">{t.products.description}</p>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredProducts.map((prod) => (
          <div key={prod.id} className="group bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden">
            <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
              <Image src={prod.img} alt={prod.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="p-4 space-y-3">
              <h3 className="font-bold text-sm text-slate-900">{prod.name}</h3>
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg text-[#C0392B]">{prod.price}</span>
                <button className="px-3 py-1.5 rounded-lg bg-[#C0392B] text-white text-xs font-bold hover:bg-[#A93226]">
                  {t.products.seeDetails}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
