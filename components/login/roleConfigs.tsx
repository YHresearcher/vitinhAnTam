import React from 'react';

export interface RoleCardConfig {
  role: 'admin' | 'technician' | 'sales';
  label: string;
  subLabel: string;
  badge: string;
  defaultPass: string;
  iconSvg: React.ReactNode;
  colorScheme: {
    borderHover: string;
    bgHover: string;
    badgeBg: string;
    badgeText: string;
    accentBtn: string;
    activeRing: string;
    glowColor: string;
  };
}

export const ROLE_CONFIGS: RoleCardConfig[] = [
  {
    role: 'admin',
    label: 'Quản Trị Viên',
    subLabel: 'Kho máy, duyệt key & tài chính',
    badge: 'Toàn quyền',
    defaultPass: 'admin123',
    iconSvg: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    colorScheme: {
      borderHover: 'hover:border-red-500 border-slate-200',
      bgHover: 'hover:bg-red-50/40',
      badgeBg: 'bg-red-50 border-red-200',
      badgeText: 'text-red-700',
      accentBtn: 'bg-red-600 hover:bg-red-700 text-white',
      activeRing: 'focus:ring-red-500',
      glowColor: 'from-red-600 to-rose-700',
    },
  },
  {
    role: 'technician',
    label: 'Kỹ Thuật Viên',
    subLabel: 'Tiếp nhận máy, sửa chữa & test key',
    badge: 'Kỹ thuật',
    defaultPass: 'tech123',
    iconSvg: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    colorScheme: {
      borderHover: 'hover:border-emerald-500 border-slate-200',
      bgHover: 'hover:bg-emerald-50/40',
      badgeBg: 'bg-emerald-50 border-emerald-200',
      badgeText: 'text-emerald-700',
      accentBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      activeRing: 'focus:ring-emerald-500',
      glowColor: 'from-emerald-600 to-teal-700',
    },
  },
  {
    role: 'sales',
    label: 'Kinh Doanh & Sales',
    subLabel: 'Bán hàng, CRM & yêu cầu cấp key',
    badge: 'Bán hàng',
    defaultPass: 'sales123',
    iconSvg: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
    colorScheme: {
      borderHover: 'hover:border-blue-500 border-slate-200',
      bgHover: 'hover:bg-blue-50/40',
      badgeBg: 'bg-blue-50 border-blue-200',
      badgeText: 'text-blue-700',
      accentBtn: 'bg-blue-600 hover:bg-blue-700 text-white',
      activeRing: 'focus:ring-blue-500',
      glowColor: 'from-blue-600 to-indigo-700',
    },
  },
];

