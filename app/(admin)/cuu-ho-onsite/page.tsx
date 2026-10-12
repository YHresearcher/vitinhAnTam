'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Wrench, Bike } from 'lucide-react';
import CounterRepairTab from '@/components/admin/CounterRepairTab';
import OnsiteDispatchTab from '@/components/admin/OnsiteDispatchTab';

function CuuHoOnsiteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get('tab');
  const ticketIdParam = searchParams.get('ticketId');

  const [activeTab, setActiveTab] = useState<'onsite' | 'counter'>(
    tabParam === 'counter' || ticketIdParam ? 'counter' : 'onsite'
  );

  useEffect(() => {
    if (ticketIdParam) {
      setActiveTab('counter');
    } else if (tabParam === 'counter') {
      setActiveTab('counter');
    } else if (tabParam === 'onsite') {
      setActiveTab('onsite');
    }
  }, [tabParam, ticketIdParam]);

  const handleTabChange = (tab: 'onsite' | 'counter') => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    if (tab === 'onsite') {
      params.delete('ticketId');
    }
    router.replace(`/cuu-ho-onsite?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Navigation */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Trung Tâm Kỹ Thuật & Cứu Hộ</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản trị luồng Tiếp nhận sửa chữa tại quầy và Điều phối cứu hộ tận nơi
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1.5 bg-slate-100 rounded-xl border border-slate-200 self-start md:self-auto">
          <button
            type="button"
            onClick={() => handleTabChange('onsite')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'onsite'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>Cứu Hộ Onsite Tận Nơi</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('counter')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'counter'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Sửa Chữa Tại Quầy</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === 'onsite' ? (
        <OnsiteDispatchTab />
      ) : (
        <CounterRepairTab selectedTicketIdFromUrl={ticketIdParam} />
      )}
    </div>
  );
}

export default function CuuHoOnsitePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-400 text-sm animate-pulse">
          Đang tải dữ liệu Trung tâm Kỹ thuật...
        </div>
      }
    >
      <CuuHoOnsiteContent />
    </Suspense>
  );
}
