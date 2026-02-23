'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PWAUpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Check for waiting worker - called when registration changes
  const checkWaitingWorker = useCallback((reg: ServiceWorkerRegistration | null) => {
    if (reg?.waiting) {
      setShowUpdate(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    navigator.serviceWorker.ready.then((reg) => {
      setRegistration(reg);
      checkWaitingWorker(reg);
    });

    // Check for updates periodically
    const checkForUpdates = () => {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) {
          reg.update();
        }
      });
    };

    // Check every 30 minutes
    const interval = setInterval(checkForUpdates, 30 * 60 * 1000);

    // Listen for controller change (new version activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });

    return () => clearInterval(interval);
  }, [checkWaitingWorker]);

  useEffect(() => {
    if (!registration) return;

    const handleNewWorker = () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setShowUpdate(true);
          }
        });
      }
    };

    registration.addEventListener('updatefound', handleNewWorker);

    return () => {
      registration.removeEventListener('updatefound', handleNewWorker);
    };
  }, [registration]);

  const handleUpdate = () => {
    if (registration?.waiting) {
      // Tell the waiting service worker to activate
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    setShowUpdate(false);
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  return (
    <AnimatePresence>
      {showUpdate && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
        >
          <div className="bg-gradient-to-r from-emerald-900/95 to-slate-900/95 backdrop-blur-lg rounded-2xl border border-emerald-500/30 p-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm">
                  Update Available
                </h3>
                <p className="text-slate-300 text-xs mt-1">
                  A new version of Synapz is ready! Update to get the latest features.
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className="flex-1 text-slate-300 hover:text-white hover:bg-white/10"
              >
                Later
              </Button>
              <Button
                onClick={handleUpdate}
                size="sm"
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Update Now
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
