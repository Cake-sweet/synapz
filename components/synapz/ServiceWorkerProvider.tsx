'use client';

import { useEffect } from 'react';
import { PWAUpdateNotification } from './PWAUpdateNotification';
import { OfflineIndicator } from './OfflineIndicator';

export function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Register service worker
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('[PWA] Service Worker registered:', registration.scope);

        // Check for updates
        registration.update();
      })
      .catch((error) => {
        console.error('[PWA] Service Worker registration failed:', error);
      });
  }, []);

  return (
    <>
      {children}
      <OfflineIndicator />
      <PWAUpdateNotification />
    </>
  );
}
