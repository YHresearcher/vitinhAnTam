'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Wrench, Bike, Plus } from 'lucide-react';
import { useStore } from '@/lib/store';
import CounterRepairTab from '@/components/admin/CounterRepairTab';
import OnsiteDispatchTab from '@/components/admin/OnsiteDispatchTab';
import { SlaHealthDashboardChart } from '@/components/dashboard/SlaHealthDashboardChart';

function CuuHoOnsiteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { tickets, onsiteDispatches } = useStore();

  const tabParam = searchParams.get('tab');
  const ticketIdParam = searchParams.get('ticketId');

  const [activeTab, setActiveTab] = useState<'onsite' | 'counter'>(
    tabParam === 'onsite' ? 'onsite' : 'counter'
  );

  const pendingTicketsCount = tickets.filter(
    (t) => t.status === 'received' || t.status === 'diagnosing' || t.status === 'in_progress' || t.status === 'processing'
  ).length;
  const pendingDispatchesCount = onsiteDispatches.filter((d) => d.status !== 'completed').length;

  // SLA Health Data (chuyển từ Dashboard sang đây — đúng ngữ cảnh vận hành dịch vụ)
  const slaHealthData = useMemo(() => {
    const now = new Date();
    let overdue = 0;
    let nearDeadline = 0;
    let onTrack = 0;
    let readyDeliver = 0;
    let completed = 0;

    tickets.forEach((t) => {
      if (t.status === 'completed') {
        completed++;
      } else if (t.status === 'ready' || t.status === 'ready_deliver') {
        readyDeliver++;
      } else if (t.status === 'cancelled') {
        // Skip
      } else {
        const est = t.estimated_completion ? new Date(t.estimated_completion) : null;
        const diffHours = est && !isNaN(est.getTime()) ? (est.getTime() - now.getTime()) / (1000 * 60 * 60) : 48;
        if (diffHours < 0) {
          overdue++;
        } else if (diffHours < 24) {
          nearDeadline++;
        } else {
          onTrack++;
        }
      }
    });

    return { overdue, nearDeadline, onTrack, readyDeliver, completed };
  }, [tickets]);

  useEffect(() => {
    if (ticketIdParam) {
      setActiveTab('counter');
    } else if (tabParam === 'onsite') {
      setActiveTab('onsite');
    } else if (tabParam === 'counter') {
      setActiveTab('counter');
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
        <div className="flex items-center p-1.5 bg-slate-100 rounded-xl border border-slate-200 self-start md:self-auto gap-1">
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
            {pendingTicketsCount > 0 && (
              <span
                className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full font-mono ${
                  activeTab === 'counter'
                    ? 'bg-white/20 text-white'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {pendingTicketsCount}
              </span>
            )}
          </button>

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
            <span>Cứu Hộ Tận Nơi</span>
            {pendingDispatchesCount > 0 && (
              <span
                className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full font-mono ${
                  activeTab === 'onsite'
                    ? 'bg-white/20 text-white'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {pendingDispatchesCount}
              </span>
            )}
          </button>
        </div>

        {/* Action Button: Tạo Phiếu Mới */}
        <Link
          href="/phieu-sua-chua/tao-moi"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs shrink-0 self-start md:self-auto cursor-pointer"
          title="Tạo phiếu tiếp nhận sửa chữa mới"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tạo Phiếu Mới</span>
        </Link>
      </div>

      {/* Sức khỏe SLA dịch vụ (trước đây ở Dashboard) */}
      <div className="max-w-xl">
        <SlaHealthDashboardChart slaData={slaHealthData} />
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
