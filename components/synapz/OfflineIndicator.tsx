'use client';

import { useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';

// Subscribe function for online/offline events
function subscribe(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

// Snapshot functions for SSR compatibility
function getOnlineSnapshot() {
  return navigator.onLine;
}

function getServerSnapshot() {
  return true; // Assume online on server
}

export function OfflineIndicator() {
  const isOnline = useSyncExternalStore(subscribe, getOnlineSnapshot, getServerSnapshot);
  const isOffline = !isOnline;

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-amber-950 py-2 px-4 text-center text-sm font-medium"
        >
          <WifiOff className="w-4 h-4 inline mr-2" />
          You&apos;re offline. Some features may be limited.
        </motion.div>
      )}
    </AnimatePresence>
  );
}
