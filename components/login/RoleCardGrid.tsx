'use client';

import React from 'react';
import { UserAccount } from '@/lib/supabase';
import { ChevronRight } from 'lucide-react';
import { RoleCardConfig } from './RoleLoginModal';
import { ROLE_CONFIGS } from './roleConfigs';

interface RoleCardGridProps {
  users: UserAccount[];
  onSelectRole: (roleConfig: RoleCardConfig) => void;
}

export function RoleCardGrid({ users, onSelectRole }: RoleCardGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {ROLE_CONFIGS.map((config) => {
        const Icon = config.Icon;
        const usersInRole = users.filter((u) => u.role === config.role);
        return (
          <button
            key={config.role}
            type="button"
            onClick={() => onSelectRole(config)}
            className={`group text-left p-5 sm:p-6 bg-white rounded-2xl border-2 transition-all duration-200 shadow-xs hover:shadow-xl hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between relative overflow-hidden ${config.colorScheme.borderHover} ${config.colorScheme.bgHover}`}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${config.colorScheme.iconBg}`}
              >
                <Icon className="w-6 h-6" strokeWidth={2} />
              </div>

              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${config.colorScheme.badgeBg} ${config.colorScheme.badgeText}`}
              >
                {config.badge}
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-[#2B1810] group-hover:text-slate-900">
                  {config.label}
                </h2>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {config.subLabel}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>{usersInRole.length} tài khoản có sẵn</span>
              <span className="font-semibold text-slate-600 group-hover:text-[#C0392B] transition-colors">
                Đăng nhập →
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
