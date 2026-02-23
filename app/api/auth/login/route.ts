import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update streak and login time
    const now = new Date();
    const lastActive = user.lastActive;
    let streakCount = user.streakCount;
    let pointsEarned = 0;

    if (lastActive) {
      const hoursSinceLastActive = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastActive >= 24 && hoursSinceLastActive < 48) {
        // Within streak window - increment streak
        streakCount += 1;
        pointsEarned = streakCount * 5; // More points for longer streaks
      } else if (hoursSinceLastActive >= 48) {
        // Streak broken - reset
        streakCount = 1;
        pointsEarned = 5;
      }
      // If less than 24 hours, don't update streak
    } else {
      // First login
      streakCount = 1;
      pointsEarned = 5;
    }

    // Update longest streak if current streak is higher
    const longestStreak = Math.max(user.longestStreak, streakCount);

    // Update user
    await db.user.update({
      where: { id: user.id },
      data: {
        lastLogin: now,
        lastActive: now,
        streakCount,
        longestStreak,
        totalPoints: user.totalPoints + pointsEarned,
      },
    });

    // Create activity record
    if (pointsEarned > 0) {
      await db.userActivity.create({
        data: {
          userId: user.id,
          activityType: 'login',
          points: pointsEarned,
          metadata: JSON.stringify({ streakCount }),
        },
      });
    }

    // Create token and set cookie
    const token = await createToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        streakCount,
        longestStreak,
        totalPoints: user.totalPoints + pointsEarned,
        factsRead: user.factsRead,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
