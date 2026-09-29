'use client';

import React, { useEffect } from 'react';
import { ConfigProvider } from 'antd';
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
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: '#C0392B',
          borderRadius: 8,
          fontFamily: 'var(--font-be-vietnam-pro), system-ui, sans-serif',
          colorLink: '#C0392B',
          colorLinkHover: '#D9531E',
        },
      }}
    >
      <StoreProvider initialSettings={initialSettings}>
        <FaviconUpdater />
        <LogoutCountdownModal />
        {children}
      </StoreProvider>
    </ConfigProvider>
  );
}


