import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: currentUser.userId },
      select: {
        id: true,
        username: true,
        email: true,
        streakCount: true,
        longestStreak: true,
        totalPoints: true,
        factsRead: true,
        createdAt: true,
        lastLogin: true,
        _count: {
          select: {
            facts: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get recent activities
    const recentActivities = await db.userActivity.findMany({
      where: { userId: currentUser.userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({ 
      user: {
        ...user,
        factsCreated: user._count.facts,
      },
      recentActivities,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
