import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { 
  calculateLevel, 
  checkForNewBadges, 
  XP_REWARDS,
  type BadgeStats 
} from '@/lib/leveling';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { activityType, factId } = body;

    // Get current user data
    const user = await db.user.findUnique({
      where: { id: currentUser.userId },
      select: {
        id: true,
        level: true,
        totalXP: true,
        totalPoints: true,
        factsRead: true,
        streakCount: true,
        longestStreak: true,
        wikiClicks: true,
        savedFactIds: true,
        badges: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let xpEarned = 0;
    let pointsEarned = 0;
    let levelUp = false;
    let newLevel = user.level;
    let newBadges: string[] = [];

    if (activityType === 'fact_read' && factId) {
      // Check if this fact was already read today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const existingActivity = await db.userActivity.findFirst({
        where: {
          userId: currentUser.userId,
          activityType: 'fact_read',
          metadata: { contains: factId },
          createdAt: { gte: today },
        },
      });

      if (existingActivity) {
        return NextResponse.json({ 
          message: 'Fact already read today',
          pointsEarned: 0,
          xpEarned: 0,
        });
      }

      xpEarned = XP_REWARDS.fact_read;
      pointsEarned = 5;
      
      // Calculate new XP and check for level up
      const newXP = user.totalXP + xpEarned;
      const levelInfo = calculateLevel(newXP);
      
      if (levelInfo.level > user.level) {
        levelUp = true;
        newLevel = levelInfo.level;
        xpEarned += XP_REWARDS.level_up; // Bonus XP for leveling up
      }

      // Check for new badges
      const currentBadges = JSON.parse(user.badges || '[]');
      const stats: BadgeStats = {
        streakCount: user.streakCount,
        longestStreak: user.longestStreak,
        factsRead: user.factsRead + 1,
        factsSaved: JSON.parse(user.savedFactIds || '[]').length,
        wikiClicks: user.wikiClicks,
        totalPoints: user.totalPoints + pointsEarned,
        level: newLevel,
      };
      newBadges = checkForNewBadges(currentBadges, stats);

      await db.$transaction([
        // Create activity record
        db.userActivity.create({
          data: {
            userId: currentUser.userId,
            activityType: 'fact_read',
            points: pointsEarned,
            metadata: JSON.stringify({ factId, xpEarned }),
          },
        }),
        // Update user stats
        db.user.update({
          where: { id: currentUser.userId },
          data: {
            totalXP: { increment: xpEarned },
            totalPoints: { increment: pointsEarned },
            factsRead: { increment: 1 },
            level: newLevel,
            lastActive: new Date(),
            ...(newBadges.length > 0 && {
              badges: JSON.stringify([...currentBadges, ...newBadges]),
            }),
          },
        }),
      ]);

      return NextResponse.json({ 
        message: 'Activity recorded',
        pointsEarned,
        xpEarned,
        levelUp,
        newLevel: levelUp ? newLevel : undefined,
        newBadges: newBadges.length > 0 ? newBadges : undefined,
      });
    }

    if (activityType === 'wiki_click') {
      xpEarned = XP_REWARDS.wiki_click;
      
      const newXP = user.totalXP + xpEarned;
      const levelInfo = calculateLevel(newXP);
      
      if (levelInfo.level > user.level) {
        levelUp = true;
        newLevel = levelInfo.level;
        xpEarned += XP_REWARDS.level_up;
      }

      // Check for wiki explorer badges
      const currentBadges = JSON.parse(user.badges || '[]');
      const stats: BadgeStats = {
        streakCount: user.streakCount,
        longestStreak: user.longestStreak,
        factsRead: user.factsRead,
        factsSaved: JSON.parse(user.savedFactIds || '[]').length,
        wikiClicks: user.wikiClicks + 1,
        totalPoints: user.totalPoints,
        level: newLevel,
      };
      newBadges = checkForNewBadges(currentBadges, stats);

      await db.user.update({
        where: { id: currentUser.userId },
        data: {
          totalXP: { increment: xpEarned },
          wikiClicks: { increment: 1 },
          level: newLevel,
          ...(newBadges.length > 0 && {
            badges: JSON.stringify([...currentBadges, ...newBadges]),
          }),
        },
      });

      return NextResponse.json({ 
        message: 'Wiki click recorded',
        xpEarned,
        levelUp,
        newLevel: levelUp ? newLevel : undefined,
        newBadges: newBadges.length > 0 ? newBadges : undefined,
      });
    }

    return NextResponse.json({ error: 'Invalid activity type' }, { status: 400 });
  } catch (error) {
    console.error('Activity error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const activities = await db.userActivity.findMany({
      where: { userId: currentUser.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Get activities error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
