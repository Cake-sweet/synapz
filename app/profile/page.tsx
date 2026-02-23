'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Target, Award, BookOpen, Calendar, Sparkles, Loader2, 
  Crown, Zap, Star, Flame, Search, Globe, Compass, Bookmark, Database, 
  Coins, Gem, Waves, UserCheck, Baby, Swords
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { MemoryBox } from '@/components/MemoryBox';
import { AppLayout } from '@/components/synapz/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { calculateLevel, getLevelInfo, getBadgeById, BADGES, type BadgeStats } from '@/lib/leveling';

// Badge Icon Mapping
const badgeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Baby, BookOpen, Search, Award, Crown, Flame, Zap, Swords, Star, Globe, Compass, Bookmark, Database, Coins, Gem, Waves, UserCheck,
};

// Level Badge Component
function LevelBadge({ level, size = 'lg' }: { level: number; size?: 'sm' | 'lg' }) {
  const levelInfo = getLevelInfo(level);
  const sizeClasses = size === 'lg' ? 'w-16 h-16 text-3xl' : 'w-10 h-10 text-xl';
  
  return (
    <div className={`${sizeClasses} rounded-full bg-gradient-to-br from-violet-500 to-emerald-500 flex items-center justify-center`}>
      <span>{levelInfo.icon}</span>
    </div>
  );
}

// Badge Display Component
function BadgeDisplay({ badgeIds }: { badgeIds: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {badgeIds.map((badgeId) => {
        const badge = getBadgeById(badgeId);
        if (!badge) return null;
        const IconComponent = badgeIcons[badge.icon] || Award;
        return (
          <motion.div
            key={badgeId}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="group relative"
          >
            <div className={`w-12 h-12 rounded-full bg-${badge.color}-500/20 border border-${badge.color}-500/30 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform`}>
              <IconComponent className={`w-6 h-6 text-${badge.color}-400`} />
            </div>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                <p className="text-sm font-semibold text-white">{badge.name}</p>
                <p className="text-xs text-slate-400">{badge.description}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, setUser } = useAuthStore();
  const [activities, setActivities] = useState<Array<{
    id: string;
    activityType: string;
    points: number;
    createdAt: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // Fetch profile data
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/users/me');
        const data = await response.json();
        if (response.ok && data.recentActivities) {
          setActivities(data.recentActivities);
        }
      } catch {
        // Ignore errors
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  // Calculate level progress
  const levelInfo = calculateLevel(user.totalXP || 0);
  const currentLevelInfo = getLevelInfo(levelInfo.level);
  const userBadges = user.badges ? JSON.parse(user.badges) : [];

  const activityLabels: Record<string, string> = {
    register: 'Joined Synapz',
    login: 'Daily login streak',
    fact_read: 'Read a fact',
    fact_created: 'Created a fact',
    fact_saved: 'Saved a fact',
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Profile Header with Level */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <LevelBadge level={levelInfo.level} />
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-white">@{user.username}</h1>
                    <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 text-xs font-semibold">
                      {currentLevelInfo.title}
                    </span>
                  </div>
                  <p className="text-slate-400">{user.email}</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Member since {new Date(user.createdAt || '').toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {/* Level Progress Bar */}
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">
                    Level {levelInfo.level} - {currentLevelInfo.title}
                  </span>
                  <span className="text-violet-400">
                    {user.totalXP || 0} XP
                  </span>
                </div>
                <Progress value={levelInfo.progress} className="h-3 bg-slate-700" />
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{currentLevelInfo.xpRequired} XP</span>
                  <span>
                    {levelInfo.level < 15 
                      ? `${levelInfo.xpForNextLevel} XP to next level` 
                      : 'Max level reached!'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Badges Section */}
          {userBadges.length > 0 && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  Badges ({userBadges.length}/{BADGES.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BadgeDisplay badgeIds={userBadges} />
              </CardContent>
            </Card>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Current Streak', value: user.streakCount, icon: TrendingUp, color: 'orange' },
              { label: 'Longest Streak', value: user.longestStreak, icon: Target, color: 'violet' },
              { label: 'Total Points', value: user.totalPoints, icon: Award, color: 'emerald' },
              { label: 'Facts Read', value: user.factsRead, icon: BookOpen, color: 'blue' },
            ].map((stat) => (
              <Card key={stat.label} className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-${stat.color}-500/20 flex items-center justify-center`}>
                      <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-xs text-slate-400">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Memory Box Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Bookmark className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-semibold text-white">Memory Box</h2>
              <span className="text-xs text-slate-500">Your saved facts</span>
            </div>
            <MemoryBox />
          </div>

          {/* Recent Activity */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-violet-400" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                </div>
              ) : activities.length > 0 ? (
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-violet-400" />
                          </div>
                          <div>
                            <p className="text-sm text-white">
                              {activityLabels[activity.activityType] || activity.activityType}
                            </p>
                            <p className="text-xs text-slate-500">
                              {new Date(activity.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                          +{activity.points} pts
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-slate-400 text-center py-8">No recent activity</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
