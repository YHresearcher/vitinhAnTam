"use client";

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
            ? 'Trạng thái: ' + syncStatus + '. Nhấp để đồng bộ ngay.'
            : 'Dữ liệu bảo mật an toàn. Nhấp để đồng bộ Supabase.'
        }
        className={'px-2.5 py-1 rounded-full border transition-all flex items-center gap-1.5 font-medium ' + (
          syncStatus === 'synced'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
            : syncStatus === 'syncing'
            ? 'bg-cyan-50 border-cyan-300 text-cyan-700 animate-pulse'
            : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
        )}
      >
        <span
          className={'h-2 w-2 rounded-full ' + (
            syncStatus === 'synced'
              ? 'bg-emerald-500'
              : syncStatus === 'syncing'
              ? 'bg-cyan-500 animate-spin'
              : 'bg-blue-500'
          )}
        />
        <span>
          {syncStatus === 'synced'
            ? 'Đã đồng bộ Cloud (' + (lastSyncedAt || 'OK') + ')'
            : syncStatus === 'syncing'
            ? 'Đang đồng bộ...'
            : 'Dữ liệu an toàn'}
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
