'use client';

import React, { useEffect } from 'react';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { StoreProvider, useViTinhAnTamStore } from '@/lib/store';

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

export function ClientProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Immediate lock
    if (!document.title || document.title.includes('localhost')) {
      document.title = DEFAULT_TITLE;
    }

    // Mutation observer ensures document.title is never empty during head updates/hydration
    const observer = new MutationObserver(() => {
      if (!document.title || document.title.includes('localhost')) {
        document.title = DEFAULT_TITLE;
      }
    });

    if (typeof document !== 'undefined' && document.head) {
      observer.observe(document.head, { childList: true, subtree: true });
    }

    return () => observer.disconnect();
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
      <StoreProvider>
        <FaviconUpdater />
        {children}
      </StoreProvider>
    </ConfigProvider>
  );
}
