import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { calculateNextReview, isDueForReview } from '@/lib/srs';

// GET - Fetch facts due for review today
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    // Get all saved facts due for review
    const dueFacts = await db.savedFact.findMany({
      where: {
        userId: currentUser.userId,
        nextReviewDate: {
          lte: today,
        },
      },
      include: {
        fact: {
          select: {
            id: true,
            title: true,
            text: true,
            category: true,
            source: true,
          },
        },
      },
      orderBy: {
        nextReviewDate: 'asc',
      },
    });

    // Get total stats
    const totalStats = await db.savedFact.aggregate({
      where: {
        userId: currentUser.userId,
      },
      _count: true,
      _sum: {
        timesReviewed: true,
        timesRemembered: true,
        timesForgot: true,
      },
    });

    // Get count of facts due today
    const dueTodayCount = await db.savedFact.count({
      where: {
        userId: currentUser.userId,
        nextReviewDate: {
          lte: today,
        },
      },
    });

    return NextResponse.json({
      dueFacts: dueFacts.map((sf) => ({
        id: sf.id,
        factId: sf.factId,
        fact: sf.fact,
        interval: sf.interval,
        timesReviewed: sf.timesReviewed,
        nextReviewDate: sf.nextReviewDate,
      })),
      stats: {
        totalSaved: totalStats._count,
        dueToday: dueTodayCount,
        totalReviews: totalStats._sum.timesReviewed || 0,
        totalRemembered: totalStats._sum.timesRemembered || 0,
        totalForgot: totalStats._sum.timesForgot || 0,
      },
    });
  } catch (error) {
    console.error('Get review facts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Submit a review result
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
    const { savedFactId, remembered } = body;

    if (!savedFactId || typeof remembered !== 'boolean') {
      return NextResponse.json(
        { error: 'savedFactId and remembered (boolean) are required' },
        { status: 400 }
      );
    }

    // Get the saved fact
    const savedFact = await db.savedFact.findFirst({
      where: {
        id: savedFactId,
        userId: currentUser.userId,
      },
    });

    if (!savedFact) {
      return NextResponse.json(
        { error: 'Saved fact not found' },
        { status: 404 }
      );
    }

    // Calculate new SRS values
    const srsUpdate = calculateNextReview(
      savedFact.interval,
      remembered,
      savedFact.easeFactor
    );

    // Update the saved fact
    const updated = await db.savedFact.update({
      where: { id: savedFactId },
      data: {
        nextReviewDate: srsUpdate.nextReviewDate,
        interval: srsUpdate.interval,
        easeFactor: srsUpdate.easeFactor,
        timesReviewed: { increment: 1 },
        timesRemembered: { increment: srsUpdate.timesRemembered },
        timesForgot: { increment: srsUpdate.timesForgot },
        lastReviewedAt: srsUpdate.lastReviewedAt,
      },
    });

    // Award points for reviewing
    const pointsEarned = remembered ? 3 : 1; // More points for remembering
    await db.user.update({
      where: { id: currentUser.userId },
      data: {
        totalPoints: { increment: pointsEarned },
      },
    });

    // Create activity record
    await db.userActivity.create({
      data: {
        userId: currentUser.userId,
        activityType: 'fact_reviewed',
        points: pointsEarned,
        metadata: JSON.stringify({
          factId: savedFact.factId,
          remembered,
          newInterval: srsUpdate.interval,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      remembered,
      newInterval: srsUpdate.interval,
      nextReviewDate: srsUpdate.nextReviewDate,
      pointsEarned,
    });
  } catch (error) {
    console.error('Submit review error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
