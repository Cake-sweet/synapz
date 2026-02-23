'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, RotateCw, CheckCircle, XCircle, 
  Loader2, ArrowLeft, Sparkles, Trophy
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { AppLayout } from '@/components/synapz/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getReviewMessage, getNextIntervalDisplay } from '@/lib/srs';

interface DueFact {
  id: string;
  factId: string;
  fact: {
    id: string;
    title: string;
    text: string;
    category: string;
    source: string | null;
  };
  interval: number;
  timesReviewed: number;
  nextReviewDate: string;
}

interface ReviewStats {
  totalSaved: number;
  dueToday: number;
  totalReviews: number;
  totalRemembered: number;
  totalForgot: number;
}

interface ReviewResponse {
  dueFacts: DueFact[];
  stats: ReviewStats;
}

interface SubmitResponse {
  success: boolean;
  remembered: boolean;
  newInterval: number;
  nextReviewDate: string;
  pointsEarned: number;
}

export default function ReviewPage() {
  const router = useRouter();
  const { isAuthenticated, setUser } = useAuthStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [dueFacts, setDueFacts] = useState<DueFact[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [sessionStats, setSessionStats] = useState({ remembered: 0, forgot: 0 });
  const [isComplete, setIsComplete] = useState(false);

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

  // Fetch due facts
  const fetchDueFacts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/review');
      const data: ReviewResponse = await response.json();
      setDueFacts(data.dueFacts);
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to fetch due facts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDueFacts();
    }
  }, [isAuthenticated, fetchDueFacts]);

  // Submit review result
  const submitReview = async (remembered: boolean) => {
    if (dueFacts.length === 0) return;
    
    setIsSubmitting(true);
    const currentFact = dueFacts[currentIndex];

    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          savedFactId: currentFact.id,
          remembered,
        }),
      });

      const data: SubmitResponse = await response.json();

      if (data.success) {
        // Update session stats
        setSessionStats((prev) => ({
          ...prev,
          [remembered ? 'remembered' : 'forgot']: prev[remembered ? 'remembered' : 'forgot'] + 1,
        }));

        // Move to next fact
        if (currentIndex < dueFacts.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setIsFlipped(false);
        } else {
          setIsComplete(true);
        }
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  const currentFact = dueFacts[currentIndex];
  const progress = ((currentIndex + 1) / dueFacts.length) * 100;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/feed')}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Feed
          </Button>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-violet-400" />
            <span className="text-violet-400 font-semibold">Brain Boost</span>
          </div>
        </div>

        {/* Stats Bar */}
        {stats && (
          <div className="flex items-center justify-center gap-6 mb-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Due Today:</span>
              <Badge variant="outline" className="border-violet-500 text-violet-400">
                {stats.dueToday}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Total Saved:</span>
              <span className="text-white">{stats.totalSaved}</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        {isComplete ? (
          // Completion Screen
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500/20 to-violet-500/20 mb-6"
            >
              <Trophy className="w-12 h-12 text-emerald-400" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-white mb-2">
              Review Complete! 🎉
            </h2>
            <p className="text-slate-400 mb-6">
              {getReviewMessage(sessionStats.remembered / (sessionStats.remembered + sessionStats.forgot))}
            </p>

            <div className="flex justify-center gap-8 mb-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-400">{sessionStats.remembered}</p>
                <p className="text-sm text-slate-400">Remembered</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-rose-400">{sessionStats.forgot}</p>
                <p className="text-sm text-slate-400">Forgot</p>
              </div>
            </div>

            <Button
              onClick={() => router.push('/feed')}
              className="bg-violet-600 hover:bg-violet-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Back to Feed
            </Button>
          </motion.div>
        ) : dueFacts.length === 0 ? (
          // Empty State
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-violet-500/20 to-emerald-500/20 mb-6">
              <Brain className="w-12 h-12 text-violet-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              No Facts Due for Review
            </h2>
            <p className="text-slate-400 mb-6">
              Save some facts to start your spaced repetition practice!
            </p>
            <Button
              onClick={() => router.push('/feed')}
              className="bg-violet-600 hover:bg-violet-700"
            >
              Browse Facts
            </Button>
          </motion.div>
        ) : (
          // Flashcard
          <>
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-slate-400 mb-2">
                <span>Fact {currentIndex + 1} of {dueFacts.length}</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-500 to-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Card */}
            <div className="perspective-1000 mb-6">
              <motion.div
                className="relative w-full"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: 'spring' }}
              >
                {/* Front */}
                <Card 
                  className={`bg-slate-800/50 border-slate-700 ${isFlipped ? 'invisible' : ''}`}
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="border-violet-500/30 text-violet-400">
                        {currentFact.fact.category}
                      </Badge>
                      {currentFact.timesReviewed > 0 && (
                        <span className="text-xs text-slate-500">
                          Reviewed {currentFact.timesReviewed}x
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="text-center py-8">
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {currentFact.fact.title}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Tap to reveal the fact
                    </p>
                    <Button
                      onClick={() => setIsFlipped(true)}
                      variant="outline"
                      className="mt-6 border-violet-500/50 text-violet-400 hover:bg-violet-500/10"
                    >
                      <RotateCw className="w-4 h-4 mr-2" />
                      Show Answer
                    </Button>
                  </CardContent>
                </Card>

                {/* Back */}
                <Card 
                  className={`bg-slate-800/50 border-slate-700 absolute inset-0 ${!isFlipped ? 'invisible' : ''}`}
                  style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="border-violet-500/30 text-violet-400">
                        {currentFact.fact.category}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        Current interval: {currentFact.interval} day{currentFact.interval > 1 ? 's' : ''}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="text-center py-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      {currentFact.fact.title}
                    </h3>
                    <p className="text-slate-300 leading-relaxed mb-4">
                      {currentFact.fact.text}
                    </p>
                    {currentFact.fact.source && (
                      <p className="text-xs text-slate-500">
                        Source: {currentFact.fact.source}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Action Buttons */}
            <AnimatePresence>
              {isFlipped && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="flex gap-4"
                >
                  <Button
                    onClick={() => submitReview(false)}
                    disabled={isSubmitting}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-6"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 mr-2" />
                        Forgot
                        <span className="text-xs ml-2 opacity-75">
                          (1 day)
                        </span>
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => submitReview(true)}
                    disabled={isSubmitting}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-6"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Remembered
                        <span className="text-xs ml-2 opacity-75">
                          ({getNextIntervalDisplay(currentFact.interval, true)})
                        </span>
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Session Stats */}
            {(sessionStats.remembered > 0 || sessionStats.forgot > 0) && (
              <div className="mt-6 flex justify-center gap-6 text-sm">
                <span className="text-emerald-400">
                  ✓ {sessionStats.remembered} remembered
                </span>
                <span className="text-rose-400">
                  ✗ {sessionStats.forgot} forgot
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
