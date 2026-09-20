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
          colorPrimary: '#2563eb',
          borderRadius: 8,
          fontFamily: 'var(--font-inter), system-ui, sans-serif',
        },
      }}
    >
      <StoreProvider>{children}</StoreProvider>
    </ConfigProvider>
  );
}
