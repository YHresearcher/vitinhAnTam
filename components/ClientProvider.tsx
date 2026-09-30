'use client';

import React, { useEffect } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { StoreProvider, useViTinhAnTamStore, SystemSettings } from '@/lib/store';
import { LogoutCountdownModal } from '@/components/LogoutCountdownModal';

const DEFAULT_TITLE = 'Vi tính An Tâm - Bán bằng tâm để bạn an tâm';

function FaviconUpdater() {
  const { systemSettings } = useViTinhAnTamStore();

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const targetFavicon = systemSettings.faviconUrl?.trim() || '/favicon.ico';

    const links = document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']");
    if (links.length > 0) {
      links.forEach((l) => {
        l.href = targetFavicon;
      });
    } else {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = targetFavicon;
      document.head.appendChild(link);
    }
  }, [systemSettings.faviconUrl]);

  return null;
}

function ThemedAppContainer({ children }: { children: React.ReactNode }) {
  const { themeMode } = useViTinhAnTamStore();
  const isDark = themeMode === 'dark';

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
      <FaviconUpdater />
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



