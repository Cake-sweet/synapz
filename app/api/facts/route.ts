import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { generateTextHash } from '@/lib/hash';

// GET - Fetch all facts with pagination
// Supports: ?page=1&limit=20&category=Science
// Returns facts sorted by created_at DESC (newest first)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20'); // Default limit changed to 20
    const category = searchParams.get('category');
    
    const skip = (page - 1) * limit;

    const where = {
      isPublished: true,
      ...(category && { category }),
    };

    // APPEND-ONLY: Always sort by createdAt DESC to show newest first
    const [facts, total] = await Promise.all([
      db.fact.findMany({
        where,
        orderBy: { createdAt: 'desc' }, // Newest facts first
        skip,
        take: limit,
        include: {
          author: {
            select: { username: true },
          },
        },
      }),
      db.fact.count({ where }),
    ]);

    return NextResponse.json({
      facts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Fetch facts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new fact (authenticated)
// APPEND-ONLY: Never deletes, only inserts new facts
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
    const { title, text, category, source, imageUrl, keywords } = body;

    if (!title || !text || !category) {
      return NextResponse.json(
        { error: 'Title, text, and category are required' },
        { status: 400 }
      );
    }

    // APPEND-ONLY: Check for duplicates before inserting (using title)
    const existingFact = await db.fact.findFirst({
      where: { title },
    });

    if (existingFact) {
      return NextResponse.json(
        { 
          error: 'Duplicate fact detected',
          reason: 'Title already exists',
        },
        { status: 409 }
      );
    }

    // Validate and parse keywords if provided
    let keywordsJson: string | null = null;
    if (keywords) {
      try {
        if (typeof keywords === 'string') {
          keywordsJson = keywords;
        } else if (Array.isArray(keywords)) {
          keywordsJson = JSON.stringify(keywords);
        }
      } catch {
        return NextResponse.json(
          { error: 'Invalid keywords format' },
          { status: 400 }
        );
      }
    }

    // Generate text hash for duplicate detection
    const textHash = generateTextHash(text);

    // APPEND-ONLY: Insert new fact
    const fact = await db.fact.create({
      data: {
        title,
        text,
        textHash,
        category,
        source,
        imageUrl,
        keywords: keywordsJson,
        authorId: currentUser.userId,
      },
    });

    // Award points for creating a fact
    await db.user.update({
      where: { id: currentUser.userId },
      data: {
        totalPoints: { increment: 15 },
      },
    });

    await db.userActivity.create({
      data: {
        userId: currentUser.userId,
        activityType: 'fact_created',
        points: 15,
        metadata: JSON.stringify({ factId: fact.id }),
      },
    });

    return NextResponse.json({ fact });
  } catch (error) {
    console.error('Create fact error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
