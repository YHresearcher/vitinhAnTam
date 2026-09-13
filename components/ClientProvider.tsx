'use client';

import React from 'react';
import { StoreProvider } from '@/lib/store';

export function ClientProvider({ children }: { children: React.ReactNode }) {
  return <StoreProvider>{children}</StoreProvider>;
}
