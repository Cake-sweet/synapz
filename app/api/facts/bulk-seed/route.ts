import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cleanText, categorizeText } from '@/lib/wikiService';
import { generateTextHash } from '@/lib/hash';

interface SeedResult {
  success: boolean;
  totalFetched: number;
  totalAdded: number;
  duplicatesSkipped: number;
  facts: Array<{
    title: string;
    category: string;
    added: boolean;
    reason?: string;
  }>;
  errors: string[];
}

// Fallback facts for when web services are unavailable
const FALLBACK_FACTS = [
  {
    title: "Human Brain Neurons",
    text: "The human brain contains approximately 86 billion neurons, each forming thousands of connections with other neurons. This creates trillions of neural connections that enable complex thought, memory, and consciousness.",
    category: "Science",
    source: "Neuroscience Research"
  },
  {
    title: "Ancient Library of Alexandria",
    text: "The Library of Alexandria, one of the largest and most significant libraries of the ancient world, contained an estimated 400,000 scrolls at its peak. It was a major center of scholarship in the ancient world.",
    category: "History",
    source: "Historical Records"
  },
  {
    title: "Deep Ocean Pressure",
    text: "At the bottom of the Mariana Trench, the deepest part of the ocean, the pressure is about 1,000 times greater than standard atmospheric pressure at sea level. This is equivalent to the weight of 50 jumbo jets stacked on top of a person.",
    category: "Nature",
    source: "Oceanography"
  },
  {
    title: "Hagia Sophia Engineering",
    text: "The Hagia Sophia in Istanbul, completed in 537 AD, features a massive dome that appears to float above the building. Its innovative design used pendentives to transfer the dome's weight to the ground, revolutionizing architecture.",
    category: "Architecture",
    source: "Architectural History"
  },
  {
    title: "Chocolate's Ancient Origins",
    text: "The Olmec civilization in Mexico was the first to cultivate cacao around 1500 BC. They used it to create a bitter, frothy beverage consumed during religious ceremonies. Sugar wasn't added until the Spanish brought it to Europe.",
    category: "Food",
    source: "Culinary History"
  },
  {
    title: "Jupiter's Great Red Spot",
    text: "Jupiter's Great Red Spot is a giant storm that has been raging for at least 400 years. The storm is so large that three Earths could fit inside it, and its winds reach speeds of up to 400 miles per hour.",
    category: "Science",
    source: "NASA"
  },
  {
    title: "Terracotta Army",
    text: "The Terracotta Army, discovered in 1974, consists of over 8,000 life-sized clay soldiers buried with China's first emperor, Qin Shi Huang. Each soldier has unique facial features, suggesting they were modeled after real individuals.",
    category: "History",
    source: "Archaeology"
  },
  {
    title: "Bioluminescent Organisms",
    text: "Over 75% of deep-sea creatures produce their own light through bioluminescence. This ability helps them attract prey, communicate, and camouflage in the dark ocean depths.",
    category: "Nature",
    source: "Marine Biology"
  },
  {
    title: "Colosseum Design",
    text: "The Roman Colosseum could hold between 50,000 to 80,000 spectators and featured an advanced system of 80 entrances, allowing the entire venue to fill in 15 minutes. Underground tunnels housed gladiators and wild animals.",
    category: "Architecture",
    source: "Roman History"
  },
  {
    title: "Coffee Discovery Legend",
    text: "According to legend, coffee was discovered by an Ethiopian goat herder named Kaldi around 850 AD. He noticed his goats became energetic after eating berries from a certain tree, leading to the discovery of coffee's stimulant properties.",
    category: "Food",
    source: "Coffee History"
  },
  {
    title: "Quantum Entanglement",
    text: "Quantum entanglement is a phenomenon where two particles become connected, and measuring one instantly affects the other, regardless of distance. Einstein called this 'spooky action at a distance.'",
    category: "Science",
    source: "Quantum Physics"
  },
  {
    title: "Machu Picchu Mystery",
    text: "Machu Picchu, built by the Inca Empire in the 15th century, was likely an estate for the emperor Pachacuti. Its purpose remains debated, with theories suggesting it served as a religious site, astronomical observatory, or royal retreat.",
    category: "History",
    source: "Archaeology"
  },
  {
    title: "Axolotl Regeneration",
    text: "The axolotl, a Mexican salamander, can regenerate almost any part of its body, including its brain, heart, and spinal cord. Scientists study this ability to understand potential applications in human medicine.",
    category: "Nature",
    source: "Biology Research"
  },
  {
    title: "Leaning Tower of Pisa",
    text: "The Leaning Tower of Pisa took 199 years to build and began leaning during construction due to soft ground on one side. It leans at about 4 degrees and was stabilized in the 1990s to prevent collapse.",
    category: "Architecture",
    source: "Engineering History"
  },
  {
    title: "Honey's Eternal Shelf Life",
    text: "Honey never spoils due to its low moisture content and acidic pH. Archaeologists have found 3,000-year-old honey in Egyptian tombs that was still perfectly edible.",
    category: "Food",
    source: "Food Science"
  },
  {
    title: "Neutron Star Density",
    text: "A teaspoon of neutron star material would weigh about 6 billion tons on Earth. These collapsed stars are so dense that they pack more mass than the Sun into a sphere only 12 miles across.",
    category: "Science",
    source: "Astrophysics"
  },
  {
    title: "Angkor Wat Scale",
    text: "Angkor Wat in Cambodia is the largest religious monument in the world, covering 402 acres. It was originally built as a Hindu temple in the 12th century before being converted to Buddhism.",
    category: "Architecture",
    source: "Historical Records"
  },
  {
    title: "Electric Eel Power",
    text: "Electric eels can generate up to 860 volts of electricity, enough to stun a horse. They use this ability to hunt prey and defend themselves in the murky waters of the Amazon.",
    category: "Nature",
    source: "Wildlife Research"
  },
  {
    title: "Spices and Exploration",
    text: "The search for spices like pepper, cinnamon, and nutmeg drove European exploration in the 15th century. At one time, nutmeg was worth more than its weight in gold in Europe.",
    category: "History",
    source: "Trade History"
  },
  {
    title: "Saffron's Labor-Intensive Harvest",
    text: "Saffron is the most expensive spice in the world, requiring 75,000 saffron crocus flowers to produce one pound of saffron. Each flower produces only three threads of saffron, all harvested by hand.",
    category: "Food",
    source: "Agricultural Science"
  },
  {
    title: "Black Hole Time Dilation",
    text: "Near a black hole, time passes more slowly due to extreme gravity. If you watched someone fall into a black hole, they would appear to freeze at the event horizon, never quite crossing it from your perspective.",
    category: "Science",
    source: "General Relativity"
  },
  {
    title: "Petra's Treasury",
    text: "Petra's famous Treasury in Jordan was carved directly into a sandstone cliff face around the 1st century AD. Despite its name, it was likely a temple or royal tomb, not a treasury.",
    category: "Architecture",
    source: "Archaeology"
  },
  {
    title: "Tardigrade Resilience",
    text: "Tardigrades, microscopic water bears, can survive extreme conditions including the vacuum of space, temperatures near absolute zero, and radiation levels that would kill most other life forms.",
    category: "Nature",
    source: "Microbiology"
  },
  {
    title: "Silk Road Network",
    text: "The Silk Road was not a single road but a network of trade routes spanning 4,000 miles connecting East Asia to Europe. Goods, ideas, and diseases all traveled along these routes for centuries.",
    category: "History",
    source: "Trade History"
  },
  {
    title: "Truffle Hunting Tradition",
    text: "Truffles are so valuable that they're often hunted using trained dogs or pigs. A single white truffle once sold for over $330,000 at auction. They grow underground near tree roots and can't be cultivated reliably.",
    category: "Food",
    source: "Culinary Arts"
  },
  {
    title: "DNA Data Storage",
    text: "All the digital data in the world could theoretically fit in a teaspoon of DNA. DNA can store 215 petabytes per gram and remain readable for thousands of years if kept cool and dry.",
    category: "Technology",
    source: "Data Science"
  },
  {
    title: "Sagrada Familia Construction",
    text: "Barcelona's Sagrada Familia has been under construction since 1882, making it the world's longest-running architectural project. It's expected to be completed around 2026, over 140 years after construction began.",
    category: "Architecture",
    source: "Architectural History"
  },
  {
    title: "Vampire Squid Name",
    text: "The vampire squid's scientific name, Vampyroteuthis infernalis, translates to 'vampire squid from hell.' Despite its name, it's not a true squid or octopus and feeds on marine debris called 'marine snow.'",
    category: "Nature",
    source: "Marine Biology"
  },
  {
    title: "First Computer Programmer",
    text: "Ada Lovelace, daughter of poet Lord Byron, wrote the first algorithm intended for a machine in the 1840s. She is considered the first computer programmer for her work on Charles Babbage's Analytical Engine.",
    category: "Technology",
    source: "Computer History"
  },
  {
    title: "Pyramid Construction Workers",
    text: "The Great Pyramids were not built by slaves but by skilled workers who were paid and fed well. Archaeological evidence shows they had access to medical care and were buried with honor near the pyramids.",
    category: "History",
    source: "Egyptology"
  }
];

export async function POST(request: NextRequest) {
  const result: SeedResult = {
    success: false,
    totalFetched: 0,
    totalAdded: 0,
    duplicatesSkipped: 0,
    facts: [],
    errors: [],
  };

  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const { count = 50 } = body;

    // Use fallback facts (shuffled)
    const shuffledFacts = [...FALLBACK_FACTS].sort(() => 0.5 - Math.random());
    const factsToProcess = shuffledFacts.slice(0, count);

    result.totalFetched = factsToProcess.length;

    // Process and save facts - APPEND-ONLY ARCHITECTURE
    for (const fact of factsToProcess) {
      try {
        // Clean the text
        const cleanedText = cleanText(fact.text);
        
        // Skip if text is too short or too long
        if (cleanedText.length < 50 || cleanedText.length > 500) {
          result.facts.push({
            title: fact.title,
            category: fact.category || 'Science',
            added: false,
            reason: 'Text length invalid',
          });
          continue;
        }

        // Generate text hash for future duplicate detection
        const textHash = generateTextHash(cleanedText);

        // Use provided category or auto-categorize
        const category = fact.category || categorizeText(cleanedText);

        // APPEND-ONLY: Check if fact exists using findFirst (like MongoDB find_one)
        // Use title for duplicate detection (unique constraint at DB level)
        const existingFact = await db.fact.findFirst({
          where: { title: fact.title },
        });

        if (existingFact) {
          result.duplicatesSkipped++;
          result.facts.push({
            title: fact.title,
            category,
            added: false,
            reason: 'Duplicate (title match)',
          });
          console.log(`[APPEND-ONLY] Duplicate skipped: "${fact.title}"`);
          continue;
        }

        // APPEND-ONLY: Insert new fact (never delete, only add)
        try {
          await db.fact.create({
            data: {
              title: fact.title,
              text: cleanedText,
              textHash,
              category,
              source: fact.source,
              isPublished: true,
            },
          });

          result.totalAdded++;
          result.facts.push({
            title: fact.title,
            category,
            added: true,
          });
          console.log(`[APPEND-ONLY] New fact inserted: "${fact.title}"`);
        } catch (insertError) {
          // Handle unique constraint violation at database level
          if (insertError instanceof Error && 
              (insertError.message.includes('UNIQUE constraint failed') ||
               insertError.message.includes('Unique constraint failed'))) {
            result.duplicatesSkipped++;
            result.facts.push({
              title: fact.title,
              category,
              added: false,
              reason: 'Database constraint violation (duplicate)',
            });
            console.log(`[APPEND-ONLY] Duplicate skipped (DB constraint): "${fact.title}"`);
          } else {
            throw insertError;
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(`Failed to process fact "${fact.title}": ${errorMsg}`);
        console.error(`[APPEND-ONLY] Error processing "${fact.title}":`, errorMsg);
      }
    }

    result.success = result.totalAdded > 0 || result.totalFetched > 0;

    return NextResponse.json(result);
  } catch (error) {
    console.error('Bulk seed error:', error);
    result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(result, { status: 500 });
  }
}

// GET endpoint to check seeding status and get suggestions
export async function GET() {
  try {
    // Get current fact counts by category
    const factsByCategory = await db.fact.groupBy({
      by: ['category'],
      _count: {
        id: true,
      },
    });

    const totalFacts = await db.fact.count();

    // Get recent facts (sorted by createdAt DESC - newest first)
    const recentFacts = await db.fact.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        title: true,
        category: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      totalFacts,
      factsByCategory: factsByCategory.map(f => ({
        category: f.category,
        count: f._count.id,
      })),
      recentFacts,
      suggestedTopics: [
        'Ancient Rome',
        'Quantum Physics',
        'Deep Sea Creatures',
        'Space Exploration',
        'Famous Inventors',
        'World Wonders',
        'Human Body',
        'Natural Disasters',
        'Ancient Civilizations',
        'Modern Technology',
      ],
    });
  } catch (error) {
    console.error('Get seed status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
