'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ConfigProvider, theme as antdTheme } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { StoreProvider, useViTinhAnTamStore, SystemSettings } from '@/lib/store';
import { LogoutCountdownModal } from '@/components/LogoutCountdownModal';

const DEFAULT_TITLE = 'Vi tính An Tâm - Bán bằng tâm để bạn an tâm';

const ADMIN_PREFIXES = [
  '/dashboard',
  '/tai-chinh',
  '/quan-ly-key',
  '/quan-ly-don-hang',
  '/phieu-sua-chua',
  '/kho-may',
  '/khach-hang',
  '/cuu-ho-onsite',
  '/tien-cong',
  '/thanh-vien',
  '/cai-dat',
  '/bai-viet',
];

function ThemedAppContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { themeMode } = useViTinhAnTamStore();

  // Chỉ cho phép dark mode ở các trang quản trị (Admin), trang chủ khách luôn là theme sáng
  const isAdminRoute = Boolean(
    pathname && ADMIN_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + '/'))
  );
  const isDark = isAdminRoute && themeMode === 'dark';

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    }
  }, [isDark]);

  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: isDark ? '#E05A47' : '#C0392B',
          borderRadius: 8,
          fontFamily: 'var(--font-be-vietnam-pro), system-ui, sans-serif',
          colorLink: isDark ? '#60A5FA' : '#C0392B',
          colorLinkHover: isDark ? '#93C5FD' : '#D9531E',
          ...(isDark
            ? {
                colorBgBase: '#0B132B',
                colorBgContainer: '#1C2541',
                colorBgElevated: '#232F52',
                colorBorder: '#2D3A66',
                colorBorderSecondary: '#1E294B',
                colorText: '#E2E8F0',
                colorTextSecondary: '#94A3B8',
                colorTextHeading: '#F1F5F9',
              }
            : {}),
        },
      }}
    >
      <LogoutCountdownModal />
      {children}
    </ConfigProvider>
  );
}

export function ClientProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings?: SystemSettings;
}) {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (!document.title || document.title.includes('localhost')) {
        document.title = DEFAULT_TITLE;
      }
    }
  }, []);

  return (
    <StoreProvider initialSettings={initialSettings}>
      <ThemedAppContainer>{children}</ThemedAppContainer>
    </StoreProvider>
  );
}



