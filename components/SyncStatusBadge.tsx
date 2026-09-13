'use client';

import React from 'react';
import { useViTinhAnTamStore } from '@/lib/store';

export function SyncStatusBadge() {
  const { isUsingSupabase, syncStatus, lastSyncedAt, syncWithSupabase } = useViTinhAnTamStore();

  return (
    <div className="flex items-center gap-2 text-xs">
      <button
        onClick={() => syncWithSupabase()}
        disabled={syncStatus === 'syncing'}
        title={
          isUsingSupabase
            ? `Trạng thái: ${syncStatus}. Nhấp để đồng bộ ngay.`
            : 'Đang dùng bộ nhớ cục bộ (Local Storage). Nhấp để kiểm tra Supabase.'
        }
        className={`px-2.5 py-1 rounded-full border transition-all flex items-center gap-1.5 font-medium ${
          syncStatus === 'synced'
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40'
            : syncStatus === 'syncing'
            ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300 animate-pulse'
            : 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/40'
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${
            syncStatus === 'synced'
              ? 'bg-emerald-400'
              : syncStatus === 'syncing'
              ? 'bg-cyan-400 animate-spin'
              : 'bg-amber-400'
          }`}
        />
        <span>
          {syncStatus === 'synced'
            ? `Cloud Synced (${lastSyncedAt || 'OK'})`
            : syncStatus === 'syncing'
            ? 'Đang đồng bộ...'
            : 'Offline / Local Store'}
        </span>
        {syncStatus !== 'syncing' && (
          <svg className="w-3.5 h-3.5 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        )}
      </button>
    </div>
  );
}
