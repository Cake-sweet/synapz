import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET - Fetch all saved facts for the current user
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Support search query
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search')?.toLowerCase().trim();

    // Fetch saved facts using the new SavedFact model
    const savedFacts = await db.savedFact.findMany({
      where: {
        userId: currentUser.userId,
      },
      include: {
        fact: {
          include: {
            author: {
              select: { username: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter by search if provided
    const filteredFacts = search
      ? savedFacts.filter((sf) => {
          const fact = sf.fact;
          return (
            fact.title.toLowerCase().includes(search) ||
            fact.text.toLowerCase().includes(search) ||
            fact.category.toLowerCase().includes(search)
          );
        })
      : savedFacts;

    // Return facts in the same format as before for compatibility
    const facts = filteredFacts.map((sf) => ({
      ...sf.fact,
      savedFactId: sf.id,
      nextReviewDate: sf.nextReviewDate,
      interval: sf.interval,
      timesReviewed: sf.timesReviewed,
    }));

    return NextResponse.json({
      facts,
      total: facts.length,
    });
  } catch (error) {
    console.error('Fetch saved facts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
