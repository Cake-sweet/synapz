// Leveling System Configuration

export interface LevelInfo {
  level: number;
  title: string;
  xpRequired: number;
  icon: string;
}

// Level definitions with XP thresholds
// XP accumulates from activities: reading facts, saving, streaks, etc.
export const LEVELS: LevelInfo[] = [
  { level: 1, title: 'Novice', xpRequired: 0, icon: '🎓' },
  { level: 2, title: 'Curious Mind', xpRequired: 50, icon: '🧠' },
  { level: 3, title: 'Fact Finder', xpRequired: 150, icon: '🔍' },
  { level: 4, title: 'Knowledge Seeker', xpRequired: 300, icon: '📚' },
  { level: 5, title: 'Synapse Surfer', xpRequired: 500, icon: '🌊' },
  { level: 6, title: 'Brain Builder', xpRequired: 800, icon: '🏗️' },
  { level: 7, title: 'Wisdom Walker', xpRequired: 1200, icon: '🚶' },
  { level: 8, title: 'Mind Master', xpRequired: 1600, icon: '🎯' },
  { level: 9, title: 'Cognitive Champion', xpRequired: 2000, icon: '🏆' },
  { level: 10, title: 'Neuro Ninja', xpRequired: 2500, icon: '🥷' },
  { level: 11, title: 'Sage Supreme', xpRequired: 3000, icon: '👑' },
  { level: 12, title: 'Enlightened One', xpRequired: 4000, icon: '✨' },
  { level: 13, title: 'Universal Mind', xpRequired: 5000, icon: '🌌' },
  { level: 14, title: 'Cosmic Scholar', xpRequired: 6500, icon: '🌠' },
  { level: 15, title: 'Omniscient Being', xpRequired: 8000, icon: '🔮' },
];

// Badge definitions with conditions
export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color class
  condition: (stats: BadgeStats) => boolean;
}

export interface BadgeStats {
  streakCount: number;
  longestStreak: number;
  factsRead: number;
  factsSaved: number;
  wikiClicks: number;
  totalPoints: number;
  level: number;
}

export const BADGES: BadgeDefinition[] = [
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Read your first fact',
    icon: 'Baby',
    color: 'emerald',
    condition: (stats) => stats.factsRead >= 1,
  },
  {
    id: 'curious_mind',
    name: 'Curious Mind',
    description: 'Read 10 facts',
    icon: 'BookOpen',
    color: 'violet',
    condition: (stats) => stats.factsRead >= 10,
  },
  {
    id: 'knowledge_hunter',
    name: 'Knowledge Hunter',
    description: 'Read 50 facts',
    icon: 'Search',
    color: 'blue',
    condition: (stats) => stats.factsRead >= 50,
  },
  {
    id: 'fact_enthusiast',
    name: 'Fact Enthusiast',
    description: 'Read 100 facts',
    icon: 'Award',
    color: 'amber',
    condition: (stats) => stats.factsRead >= 100,
  },
  {
    id: 'fact_master',
    name: 'Fact Master',
    description: 'Read 500 facts',
    icon: 'Crown',
    color: 'rose',
    condition: (stats) => stats.factsRead >= 500,
  },
  {
    id: 'streak_starter',
    name: 'Streak Starter',
    description: '3 day streak',
    icon: 'Flame',
    color: 'orange',
    condition: (stats) => stats.streakCount >= 3,
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: '7 day streak',
    icon: 'Zap',
    color: 'yellow',
    condition: (stats) => stats.longestStreak >= 7,
  },
  {
    id: 'fortnight_fighter',
    name: 'Fortnight Fighter',
    description: '14 day streak',
    icon: 'Swords',
    color: 'red',
    condition: (stats) => stats.longestStreak >= 14,
  },
  {
    id: 'month_master',
    name: 'Month Master',
    description: '30 day streak',
    icon: 'Star',
    color: 'purple',
    condition: (stats) => stats.longestStreak >= 30,
  },
  {
    id: 'wiki_explorer',
    name: 'Wiki Explorer',
    description: 'Clicked 50 wiki links',
    icon: 'Globe',
    color: 'cyan',
    condition: (stats) => stats.wikiClicks >= 50,
  },
  {
    id: 'wiki_voyager',
    name: 'Wiki Voyager',
    description: 'Clicked 200 wiki links',
    icon: 'Compass',
    color: 'teal',
    condition: (stats) => stats.wikiClicks >= 200,
  },
  {
    id: 'memory_keeper',
    name: 'Memory Keeper',
    description: 'Saved 10 facts',
    icon: 'Bookmark',
    color: 'pink',
    condition: (stats) => stats.factsSaved >= 10,
  },
  {
    id: 'knowledge_vault',
    name: 'Knowledge Vault',
    description: 'Saved 50 facts',
    icon: 'Database',
    color: 'indigo',
    condition: (stats) => stats.factsSaved >= 50,
  },
  {
    id: 'point_collector',
    name: 'Point Collector',
    description: 'Earned 500 points',
    icon: 'Coins',
    color: 'gold',
    condition: (stats) => stats.totalPoints >= 500,
  },
  {
    id: 'point_millionaire',
    name: 'Point Millionaire',
    description: 'Earned 2000 points',
    icon: 'Gem',
    color: 'emerald',
    condition: (stats) => stats.totalPoints >= 2000,
  },
  {
    id: 'level_5',
    name: 'Synapse Surfer',
    description: 'Reached Level 5',
    icon: 'Waves',
    color: 'blue',
    condition: (stats) => stats.level >= 5,
  },
  {
    id: 'level_10',
    name: 'Neuro Ninja',
    description: 'Reached Level 10',
    icon: 'UserCheck',
    color: 'violet',
    condition: (stats) => stats.level >= 10,
  },
];

// Calculate level from XP
export function calculateLevel(xp: number): { level: number; xpForNextLevel: number; xpInCurrentLevel: number; progress: number } {
  let currentLevel = 1;
  let xpForNextLevel = 0;
  
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpRequired) {
      currentLevel = LEVELS[i].level;
      const nextLevel = LEVELS[i + 1];
      xpForNextLevel = nextLevel ? nextLevel.xpRequired - xp : 0;
      break;
    }
  }
  
  const currentLevelInfo = LEVELS[currentLevel - 1];
  const nextLevelInfo = LEVELS[currentLevel];
  
  const xpInCurrentLevel = nextLevelInfo 
    ? xp - currentLevelInfo.xpRequired 
    : 0;
  
  const xpNeededForCurrentLevel = nextLevelInfo 
    ? nextLevelInfo.xpRequired - currentLevelInfo.xpRequired 
    : 1;
  
  const progress = nextLevelInfo 
    ? (xpInCurrentLevel / xpNeededForCurrentLevel) * 100 
    : 100;
  
  return {
    level: currentLevel,
    xpForNextLevel,
    xpInCurrentLevel,
    progress: Math.min(progress, 100),
  };
}

// Get level info by level number
export function getLevelInfo(level: number): LevelInfo {
  return LEVELS.find(l => l.level === level) || LEVELS[0];
}

// Check for new badges based on stats
export function checkForNewBadges(
  currentBadges: string[], 
  stats: BadgeStats
): string[] {
  const newBadges: string[] = [];
  
  for (const badge of BADGES) {
    if (!currentBadges.includes(badge.id) && badge.condition(stats)) {
      newBadges.push(badge.id);
    }
  }
  
  return newBadges;
}

// Get badge definition by ID
export function getBadgeById(id: string): BadgeDefinition | undefined {
  return BADGES.find(b => b.id === id);
}

// XP rewards for different activities
export const XP_REWARDS = {
  fact_read: 5,
  fact_saved: 2,
  fact_created: 15,
  login: 3,
  streak_day: 10,
  wiki_click: 1,
  level_up: 50,
};
