'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useFactsStore, type Fact } from '@/stores/factsStore';
import { FactCard } from '@/components/synapz/FactCard';
import { AppLayout } from '@/components/synapz/AppLayout';
import { TopicScroller } from '@/components/synapz/TopicScroller';
import { Button } from '@/components/ui/button';

export default function FeedPage() {
  const router = useRouter();
  const { isAuthenticated, updateUser, setUser, setLoading } = useAuthStore();
  const { facts, pagination, isLoading, setFacts, setPagination, setLoading: setFactsLoading, setError } = useFactsStore();
  const [activeCategory, setActiveCategory] = useState('All');
  const [savedFactIds, setSavedFactIds] = useState<Set<string>>(new Set());

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

  // Fetch saved facts to know which ones are saved
  const fetchSavedFactIds = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await fetch('/api/users/saved');
      if (response.ok) {
        const data = await response.json();
        setSavedFactIds(new Set(data.facts.map((f: { id: string }) => f.id)));
      }
    } catch {
      // Ignore errors
    }
  }, [isAuthenticated]);

  const fetchFacts = useCallback(async (page = 1, category?: string) => {
    setFactsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (category && category !== 'All') {
        params.set('category', category);
      }
      
      const response = await fetch(`/api/facts?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        const parsedFacts = data.facts.map((fact: Fact & { keywords?: string; textHash?: string | null }) => ({
          ...fact,
          keywords: fact.keywords ? (typeof fact.keywords === 'string' ? JSON.parse(fact.keywords) : fact.keywords) : null,
        }));
        setFacts(parsedFacts);
        setPagination(data.pagination);
      } else {
        setError(data.error);
      }
    } catch {
      setError('Failed to fetch facts');
    } finally {
      setFactsLoading(false);
    }
  }, [setFacts, setPagination, setFactsLoading, setError]);

  // Seed facts on first load
  useEffect(() => {
    const seedFacts = async () => {
      try {
        await fetch('/api/facts/seed', { method: 'POST' });
      } catch {
        // Ignore seeding errors
      }
    };
    seedFacts();
  }, []);

  // Fetch facts when category changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchFacts(1, activeCategory);
    }
  }, [activeCategory, fetchFacts, isAuthenticated]);

  // Fetch saved facts when authenticated
  useEffect(() => {
    fetchSavedFactIds();
  }, [fetchSavedFactIds]);

  const handleFactRead = async (factId: string) => {
    try {
      const response = await fetch('/api/users/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityType: 'fact_read', factId }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.pointsEarned > 0) {
          updateUser({ totalPoints: (useAuthStore.getState().user?.totalPoints || 0) + data.pointsEarned });
        }
      }
    } catch {
      // Ignore errors
    }
  };

  const handleToggleSave = (factId: string, isSaved: boolean) => {
    setSavedFactIds(prev => {
      const newSet = new Set(prev);
      if (isSaved) {
        newSet.add(factId);
      } else {
        newSet.delete(factId);
      }
      return newSet;
    });
  };

  const loadMore = () => {
    if (pagination && pagination.page < pagination.totalPages) {
      fetchFacts(pagination.page + 1, activeCategory);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  return (
    <AppLayout>
      {/* Topic Scroller - Netflix style horizontal scroll */}
      <div className="sticky top-16 z-40 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <TopicScroller 
          selectedTopic={activeCategory} 
          onTopicChange={setActiveCategory} 
        />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Facts List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {facts.map((fact) => (
              <FactCard 
                key={fact.id} 
                fact={fact} 
                onRead={() => handleFactRead(fact.id)}
                isSaved={savedFactIds.has(fact.id)}
                onToggleSave={handleToggleSave}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
          </div>
        )}

        {/* Load More Button */}
        {pagination && pagination.page < pagination.totalPages && !isLoading && (
          <div className="flex justify-center mt-8">
            <Button
              variant="outline"
              onClick={loadMore}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Load More Facts
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && facts.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No facts found. Check back later!</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
