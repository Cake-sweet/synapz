'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Brain, Menu, X, User, LogOut, Home, Award, Database, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { StreakCounter } from './StreakCounter';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [dueCount, setDueCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, setUser, setLoading } = useAuthStore();

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      }
    };
    checkAuth();
  }, [setUser]);

  // Fetch due facts count for notification dot
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchDueCount = async () => {
      try {
        const response = await fetch('/api/review');
        if (response.ok) {
          const data = await response.json();
          setDueCount(data.stats?.dueToday || 0);
        }
      } catch (error) {
        console.error('Failed to fetch due count:', error);
      }
    };

    fetchDueCount();
    // Refresh every 5 minutes
    const interval = setInterval(fetchDueCount, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Logout failed');
      }
      logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={isAuthenticated ? "/feed" : "/"} className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Brain className="h-8 w-8 text-violet-400" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">
              Synapz
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link 
                  href="/feed"
                  className={`transition-colors flex items-center gap-1 ${isActive('/feed') ? 'text-violet-400' : 'text-slate-300 hover:text-violet-400'}`}
                >
                  <Home size={18} />
                  Feed
                </Link>
                <Link 
                  href="/review"
                  className={`transition-colors flex items-center gap-1 relative ${isActive('/review') ? 'text-emerald-400' : 'text-slate-300 hover:text-emerald-400'}`}
                >
                  <Sparkles size={18} />
                  Brain Boost
                  {/* Notification dot */}
                  {dueCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-2 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-rose-500 text-white rounded-full"
                    >
                      {dueCount > 9 ? '9+' : dueCount}
                    </motion.span>
                  )}
                </Link>
                <Link 
                  href="/profile"
                  className={`transition-colors flex items-center gap-1 ${isActive('/profile') ? 'text-violet-400' : 'text-slate-300 hover:text-violet-400'}`}
                >
                  <User size={18} />
                  Profile
                </Link>
                <Link 
                  href="/admin"
                  className={`transition-colors flex items-center gap-1 ${isActive('/admin') ? 'text-amber-400' : 'text-slate-300 hover:text-amber-400'}`}
                >
                  <Database size={18} />
                  Admin
                </Link>
                <div className="flex items-center gap-4 pl-4 border-l border-slate-700">
                  <StreakCounter count={user?.streakCount || 0} size="sm" />
                  <div className="flex items-center gap-1 text-emerald-400">
                    <Award size={16} />
                    <span className="font-semibold">{user?.totalPoints || 0}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-rose-400"
                >
                  <LogOut size={18} className="mr-1" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/">
                  <Button variant="ghost" className={`text-slate-300 ${isActive('/') ? 'text-violet-400' : 'hover:text-violet-400'}`}>
                    <Home size={18} className="mr-1" />
                    Home
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="border-violet-500 text-violet-400 hover:bg-violet-500/10">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-violet-600 hover:bg-violet-700">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-900 border-b border-slate-800"
          >
            <div className="px-4 py-4 space-y-3">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-300">@{user?.username}</span>
                    <div className="flex items-center gap-4">
                      <StreakCounter count={user?.streakCount || 0} size="sm" />
                      <span className="text-emerald-400 font-semibold">{user?.totalPoints} pts</span>
                    </div>
                  </div>
                  <Link 
                    href="/feed" 
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-left py-2 text-slate-300 hover:text-violet-400"
                  >
                    <Home size={18} className="inline mr-2" />
                    Feed
                  </Link>
                  <Link 
                    href="/review" 
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-left py-2 text-slate-300 hover:text-emerald-400 relative"
                  >
                    <Sparkles size={18} className="inline mr-2" />
                    Brain Boost
                    {dueCount > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full">
                        {dueCount}
                      </span>
                    )}
                  </Link>
                  <Link 
                    href="/profile" 
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-left py-2 text-slate-300 hover:text-violet-400"
                  >
                    <User size={18} className="inline mr-2" />
                    Profile
                  </Link>
                  <Link 
                    href="/admin" 
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-left py-2 text-slate-300 hover:text-amber-400"
                  >
                    <Database size={18} className="inline mr-2" />
                    Admin
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                  >
                    <LogOut size={18} className="mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full text-slate-300">
                      <Home size={18} className="mr-2" />
                      Home
                    </Button>
                  </Link>
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full border-violet-500 text-violet-400">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-violet-600 hover:bg-violet-700">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
