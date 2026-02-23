'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { AdminSeedPanel } from '@/components/synapz/AdminSeedPanel';
import { AppLayout } from '@/components/synapz/AppLayout';

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, setUser } = useAuthStore();

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
          router.push('/login');
        }
      } catch {
        setUser(null);
        router.push('/login');
      }
    };
    checkAuth();
  }, [setUser, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AdminSeedPanel />
        </motion.div>
      </div>
    </AppLayout>
  );
}
