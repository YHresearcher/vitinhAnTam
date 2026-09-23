'use client';

import React, { useEffect } from 'react';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { StoreProvider } from '@/lib/store';

const DEFAULT_TITLE = 'Vi tính An Tâm - Bán bằng tâm để bạn an tâm';

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
      <StoreProvider>{children}</StoreProvider>
    </ConfigProvider>
  );
}
