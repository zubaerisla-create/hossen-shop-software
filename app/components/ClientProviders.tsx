'use client';

import React, { Suspense } from 'react';
import { AnalyticsProvider } from './AnalyticsProvider';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AnalyticsProvider>{children}</AnalyticsProvider>
    </Suspense>
  );
}
