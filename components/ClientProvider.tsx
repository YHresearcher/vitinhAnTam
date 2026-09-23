'use client';

import React from 'react';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { StoreProvider } from '@/lib/store';

export function ClientProvider({ children }: { children: React.ReactNode }) {
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
