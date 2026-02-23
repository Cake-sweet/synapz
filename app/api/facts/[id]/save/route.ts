import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// POST - Toggle save/unsave a fact
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { id: factId } = await params;

    // Check if fact exists
    const fact = await db.fact.findUnique({
      where: { id: factId },
    });

    if (!fact) {
      return NextResponse.json(
        { error: 'Fact not found' },
        { status: 404 }
      );
    }

    // Check if already saved using the new SavedFact model
    const existingSavedFact = await db.savedFact.findUnique({
      where: {
        userId_factId: {
          userId: currentUser.userId,
          factId: factId,
        },
      },
    });

    let action: 'saved' | 'unsaved';

    if (existingSavedFact) {
      // Unsave the fact - delete from SavedFact table
      await db.savedFact.delete({
        where: { id: existingSavedFact.id },
      });
      action = 'unsaved';
    } else {
      // Save the fact - create new SavedFact record with SRS defaults
      await db.savedFact.create({
        data: {
          userId: currentUser.userId,
          factId: factId,
          nextReviewDate: new Date(), // Due immediately for first review
          interval: 1,
          easeFactor: 2.5,
        },
      });
      action = 'saved';
    }

    // Get total saved count for user
    const savedCount = await db.savedFact.count({
      where: { userId: currentUser.userId },
    });

    // Award points for saving a fact (first time only)
    if (action === 'saved') {
      await db.user.update({
        where: { id: currentUser.userId },
        data: {
          totalPoints: { increment: 2 },
        },
      });

      await db.userActivity.create({
        data: {
          userId: currentUser.userId,
          activityType: 'fact_saved',
          points: 2,
          metadata: JSON.stringify({ factId }),
        },
      });
    }

    return NextResponse.json({
      action,
      isSaved: action === 'saved',
      savedCount,
    });
  } catch (error) {
    console.error('Toggle save error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
