'use client';

import React from 'react';
import { useViTinhAnTamStore } from '@/lib/store';
import { UserRole, MOCK_USERS } from '@/lib/supabase';

export function RoleSwitcher() {
  const { currentUser, setCurrentUserRole } = useViTinhAnTamStore();

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-slate-400 hidden sm:inline">Vai trò:</span>
      <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
        {(['admin', 'technician', 'sales'] as UserRole[]).map((r) => {
          const u = MOCK_USERS[r];
          const isActive = currentUser.role === r;
          return (
            <button
              key={r}
              onClick={() => setCurrentUserRole(r)}
              className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title={`${u.name} - ${u.roleTitle}`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  r === 'admin'
                    ? 'bg-blue-600'
                    : r === 'technician'
                    ? 'bg-emerald-600'
                    : 'bg-purple-600'
                }`}
              />
              <span className="capitalize">{r === 'technician' ? 'Kỹ thuật' : r === 'sales' ? 'Kinh doanh' : 'Admin'}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
