'use client';

import { useEffect, useState } from 'react';

interface ServiceWorkerStatus {
  isRegistered: boolean;
  isUpdateAvailable: boolean;
  isOffline: boolean;
  error: string | null;
}

export function useServiceWorker(): ServiceWorkerStatus {
  const [status, setStatus] = useState<ServiceWorkerStatus>({
    isRegistered: false,
    isUpdateAvailable: false,
    isOffline: false,
    error: null,
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log('[PWA] Service Worker registered:', registration.scope);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setStatus((prev) => ({ ...prev, isUpdateAvailable: true }));
              }
            });
          }
        });

        setStatus((prev) => ({ ...prev, isRegistered: true }));
      } catch (error) {
        console.error('[PWA] Service Worker registration failed:', error);
        setStatus((prev) => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Registration failed' 
        }));
      }
    };

    registerServiceWorker();

    // Listen for offline/online status
    const handleOnline = () => setStatus((prev) => ({ ...prev, isOffline: false }));
    const handleOffline = () => setStatus((prev) => ({ ...prev, isOffline: true }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial offline status
    setStatus((prev) => ({ ...prev, isOffline: !navigator.onLine }));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return status;
}
