'use client';

import React from 'react';
import { UserAccount } from '@/lib/supabase';
import { RoleCardConfig, ROLE_CONFIGS } from './roleConfigs';

interface RoleCardGridProps {
  users: UserAccount[];
  onSelectRole: (roleConfig: RoleCardConfig) => void;
}

export function RoleCardGrid({ users, onSelectRole }: RoleCardGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {ROLE_CONFIGS.map((config) => {
        const usersInRole = users.filter((u) => u.role === config.role);
        return (
          <button
            key={config.role}
            type="button"
            onClick={() => onSelectRole(config)}
            className={`group text-left p-5 sm:p-6 bg-white rounded-3xl border-2 transition-all duration-200 shadow-xs hover:shadow-xl hover:-translate-y-1 cursor-pointer flex flex-col justify-between relative overflow-hidden ${config.colorScheme.borderHover} ${config.colorScheme.bgHover}`}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm text-white bg-gradient-to-tr ${config.colorScheme.glowColor}`}
              >
                {config.iconSvg}
              </div>

              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${config.colorScheme.badgeBg} ${config.colorScheme.badgeText}`}
              >
                {config.badge}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-slate-900 group-hover:text-black">
                  {config.label}
                </h2>
                <span className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all text-sm font-bold">
                  →
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {config.subLabel}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>{usersInRole.length} tài khoản</span>
              <span className="font-bold text-slate-700 group-hover:text-red-600 transition-colors">
                Chọn đăng nhập
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

