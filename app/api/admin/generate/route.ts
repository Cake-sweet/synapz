import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateTextHash } from '@/lib/hash';
import ZAI from 'z-ai-web-dev-sdk';

// Admin secret validation
function validateAdminSecret(request: NextRequest): boolean {
  const adminSecret = request.headers.get('X-Admin-Secret');
  const expectedSecret = process.env.ADMIN_SECRET || 'synapz-admin-2024';
  
  if (!adminSecret || adminSecret !== expectedSecret) {
    return false;
  }
  
  return true;
}

// Fact generation prompt
const FACT_GENERATION_PROMPT = `You are an educational content generator. Generate interesting, verified facts about the given topic.

IMPORTANT: Return ONLY a valid JSON array with NO additional text, markdown, or explanation.

Each fact object must have this exact structure:
{
  "title": "A short, catchy title (max 80 chars)",
  "text": "The fact content (100-300 chars, informative and engaging)",
  "category": "One of: Science, History, Nature, Technology, Geography, Health, Space, Animals, Food, Art",
  "source": "A credible source name (e.g., NASA, National Geographic, Scientific American)"
}

Example output for topic "Space":
[
  {
    "title": "A Day on Venus",
    "text": "A day on Venus is longer than its year. Venus takes 243 Earth days to rotate once but only 225 Earth days to orbit the Sun.",
    "category": "Space",
    "source": "NASA"
  }
]

Generate exactly COUNT facts about the given TOPIC. Make each fact unique, interesting, and educational.`;

interface GeneratedFact {
  title: string;
  text: string;
  category: string;
  source: string;
}

export async function POST(request: NextRequest) {
  try {
    // Validate admin secret
    if (!validateAdminSecret(request)) {
      return NextResponse.json(
        { error: 'Unauthorized. Valid X-Admin-Secret header required.' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { topic, count = 5 } = body;

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Topic is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate count (max 20 per request to avoid timeouts)
    const validCount = Math.min(Math.max(1, parseInt(String(count)) || 5), 20);

    console.log(`[AI Generate] Generating ${validCount} facts about: ${topic}`);

    // Initialize ZAI SDK
    const zai = await ZAI.create();

    // Generate facts using LLM
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: FACT_GENERATION_PROMPT
        },
        {
          role: 'user',
          content: `Generate exactly ${validCount} interesting facts about: "${topic}"`
        }
      ],
      thinking: { type: 'disabled' }
    });

    const rawResponse = completion.choices[0]?.message?.content;

    if (!rawResponse) {
      return NextResponse.json(
        { error: 'AI returned empty response' },
        { status: 500 }
      );
    }

    // Parse JSON response
    let facts: GeneratedFact[] = [];
    try {
      // Clean up response - remove any markdown code blocks
      let cleanedResponse = rawResponse.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.slice(7);
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.slice(3);
      }
      if (cleanedResponse.endsWith('```')) {
        cleanedResponse = cleanedResponse.slice(0, -3);
      }
      cleanedResponse = cleanedResponse.trim();

      facts = JSON.parse(cleanedResponse);

      if (!Array.isArray(facts)) {
        throw new Error('Response is not an array');
      }
    } catch (parseError) {
      console.error('[AI Generate] JSON parse error:', parseError);
      console.error('[AI Generate] Raw response:', rawResponse.substring(0, 500));
      
      return NextResponse.json(
        { 
          error: 'Failed to parse AI response as JSON',
          rawResponse: rawResponse.substring(0, 500)
        },
        { status: 500 }
      );
    }

    // Validate and prepare facts for database
    const validCategories = ['Science', 'History', 'Nature', 'Technology', 'Geography', 'Health', 'Space', 'Animals', 'Food', 'Art'];
    
    const validFacts = facts.filter((fact) => {
      return (
        fact.title &&
        fact.text &&
        fact.category &&
        validCategories.includes(fact.category) &&
        fact.title.length <= 100 &&
        fact.text.length >= 50 &&
        fact.text.length <= 500
      );
    });

    if (validFacts.length === 0) {
      return NextResponse.json(
        { error: 'No valid facts generated', rawFacts: facts },
        { status: 400 }
      );
    }

    // Insert facts one by one, checking for duplicates by title
    let insertedCount = 0;
    let duplicateCount = 0;
    const insertedFacts: { title: string; category: string }[] = [];
    const duplicateTitles: string[] = [];

    for (const fact of validFacts) {
      // Check if fact with this title already exists
      const existing = await db.fact.findFirst({
        where: { title: fact.title.trim() }
      });

      if (existing) {
        duplicateCount++;
        duplicateTitles.push(fact.title);
        continue;
      }

      // Create the fact
      try {
        await db.fact.create({
          data: {
            title: fact.title.trim(),
            text: fact.text.trim(),
            textHash: generateTextHash(fact.text),
            category: fact.category,
            source: fact.source?.trim() || 'AI Generated',
            isPublished: true,
          },
        });
        insertedCount++;
        insertedFacts.push({ title: fact.title, category: fact.category });
      } catch (createError) {
        console.error('[AI Generate] Failed to insert fact:', fact.title, createError);
        duplicateCount++;
      }
    }

    console.log(`[AI Generate] Inserted ${insertedCount} facts, skipped ${duplicateCount} duplicates`);

    return NextResponse.json({
      success: true,
      topic,
      requested: validCount,
      generated: facts.length,
      inserted: insertedCount,
      duplicates: duplicateCount,
      facts: insertedFacts,
      duplicateTitles: duplicateCount > 0 ? duplicateTitles : undefined,
    });

  } catch (error) {
    console.error('[AI Generate] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint to show API usage
export async function GET(request: NextRequest) {
  if (!validateAdminSecret(request)) {
    return NextResponse.json(
      { error: 'Unauthorized. Valid X-Admin-Secret header required.' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    name: 'Synapz AI Fact Generator',
    usage: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Secret': 'your-admin-secret'
      },
      body: {
        topic: 'string (required) - The topic to generate facts about',
        count: 'number (optional, default: 5, max: 20) - Number of facts to generate'
      }
    },
    categories: ['Science', 'History', 'Nature', 'Technology', 'Geography', 'Health', 'Space', 'Animals', 'Food', 'Art'],
    example: {
      request: { topic: 'Space', count: 5 },
      response: { success: true, inserted: 5, facts: [] }
    }
  });
}
