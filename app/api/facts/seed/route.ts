import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateTextHash } from '@/lib/hash';

const interestingFacts = [
  {
    title: "The Great Wall of China",
    text: "The Great Wall of China is not visible from space with the naked eye, despite popular belief. This myth was debunked by astronauts who confirmed that human-made structures are not visible without aid from low Earth orbit.",
    category: "History",
    source: "NASA",
  },
  {
    title: "Octopus Hearts",
    text: "An octopus has three hearts. Two hearts pump blood to the gills, while the third pumps it to the rest of the body. When an octopus swims, the heart that delivers blood to the body stops beating, which is why they prefer crawling.",
    category: "Science",
    source: "National Geographic",
  },
  {
    title: "Honey Never Spoils",
    text: "Honey never spoils. Archaeologists have found 3,000-year-old honey in Egyptian tombs that was still perfectly edible. Its low moisture content and acidic pH create an inhospitable environment for bacteria.",
    category: "Science",
    source: "Smithsonian Magazine",
  },
  {
    title: "Bananas Are Berries",
    text: "Botanically speaking, bananas are berries, but strawberries are not. A berry is a fruit produced from a single ovary, and bananas meet this criterion while strawberries do not.",
    category: "Science",
    source: "Botanical Society",
  },
  {
    title: "The Shortest War",
    text: "The shortest war in history lasted only 38-45 minutes. It was between Britain and Zanzibar on August 27, 1896. The war ended after the Sultan's forces were quickly defeated by British troops.",
    category: "History",
    source: "Historical Records",
  },
  {
    title: "Venus Day Length",
    text: "A day on Venus is longer than its year. Venus takes about 243 Earth days to rotate once on its axis, but only 225 Earth days to orbit the Sun. It also rotates in the opposite direction to most planets.",
    category: "Science",
    source: "NASA",
  },
  {
    title: "Oxford University Age",
    text: "Oxford University is older than the Aztec Empire. Teaching existed at Oxford by 1096, while the Aztec civilization began with the founding of Tenochtitlán in 1325.",
    category: "History",
    source: "Oxford Archives",
  },
  {
    title: "Cleopatra's Timeline",
    text: "Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid of Giza. She was born in 69 BC, while the pyramid was built around 2560 BC.",
    category: "History",
    source: "Historical Records",
  },
  {
    title: "T-Rex and Stegosaurus",
    text: "The T-Rex lived closer in time to humans than to the Stegosaurus. There was a 83 million year gap between Stegosaurus and T-Rex, but only 65 million years between T-Rex and humans.",
    category: "Science",
    source: "Paleontology Journal",
  },
  {
    title: "Sharks Older Than Trees",
    text: "Sharks are older than trees. Sharks have been around for about 400 million years, while the first trees appeared around 350 million years ago.",
    category: "Science",
    source: "Marine Biology Institute",
  },
  {
    title: "Human DNA Similarity",
    text: "Humans share 60% of their DNA with bananas. We share about 99% of our DNA with chimpanzees, but surprisingly, we also have significant genetic overlap with many plants.",
    category: "Science",
    source: "Genetics Research",
  },
  {
    title: "Wombat Cube Poop",
    text: "Wombats produce cube-shaped poop. This unique shape prevents the droppings from rolling away, helping wombats mark their territory effectively on rocks and logs.",
    category: "Nature",
    source: "Wildlife Research",
  },
  {
    title: "Clouds Are Heavy",
    text: "A typical cumulus cloud weighs about 1.1 million pounds (500,000 kg). Despite their weight, they float because the air below them is even heavier.",
    category: "Science",
    source: "Meteorological Society",
  },
  {
    title: "Eiffel Tower Growth",
    text: "The Eiffel Tower can grow by up to 6 inches (15 cm) during summer. The iron structure expands when heated by the sun, making it temporarily taller.",
    category: "Architecture",
    source: "Engineering Weekly",
  },
  {
    title: "Identical Snowflakes",
    text: "While no two snowflakes are exactly alike, identical twin snowflakes have been found. In 1988, scientist Nancy Knight discovered two snowflakes that were virtually indistinguishable.",
    category: "Science",
    source: "Weather Research",
  },
  {
    title: "Hot Water Freezes Faster",
    text: "Hot water can freeze faster than cold water, a phenomenon known as the Mpemba effect. Named after a Tanzanian student who observed it in 1963, scientists are still debating its exact cause.",
    category: "Science",
    source: "Physics Today",
  },
  {
    title: "Froot Loops Same Flavor",
    text: "All Froot Loops are the same flavor, regardless of color. The different colors are purely for visual appeal, but they all taste the same - a blend of fruit flavors.",
    category: "Food",
    source: "Kellogg's",
  },
  {
    title: "Kangaroo Can't Walk Backward",
    text: "Kangaroos cannot walk backward. Their large feet and tail make it physically impossible for them to move in reverse, which is why the kangaroo appears on the Australian coat of arms as a symbol of progress.",
    category: "Nature",
    source: "Australian Wildlife",
  },
  {
    title: "Strawberry Seeds Outside",
    text: "Strawberries are the only fruit with seeds on the outside. An average strawberry has about 200 seeds, and technically, each seed is a separate fruit called an achene.",
    category: "Science",
    source: "Botanical Society",
  },
  {
    title: "Cat's Righting Reflex",
    text: "Cats always land on their feet due to their righting reflex. This ability develops when kittens are about 3-4 weeks old and is fully developed by 7 weeks.",
    category: "Nature",
    source: "Veterinary Science",
  },
  // Additional 30 facts to reach 50+
  {
    title: "Armadillo Leprosy",
    text: "Armadillos can carry leprosy and are the only animals known to transmit it to humans. Scientists used armadillos to develop the leprosy vaccine because their body temperature is similar to human skin.",
    category: "Science",
    source: "CDC",
  },
  {
    title: "Sahara Desert Snow",
    text: "The Sahara Desert has experienced snow. In 2018, the world's largest hot desert was covered in up to 15 inches of snow, an extremely rare occurrence in the region.",
    category: "Nature",
    source: "Weather Channel",
  },
  {
    title: "Bamboo Growth Rate",
    text: "Bamboo is the fastest-growing plant on Earth. Some species can grow up to 35 inches (91 cm) in a single day, making it visible to the naked eye as it grows.",
    category: "Nature",
    source: "Botanical Research",
  },
  {
    title: "Owl Eye Movement",
    text: "Owls cannot move their eyes within their sockets. Their eyes are tube-shaped rather than spherical, which gives them excellent binocular vision but requires them to rotate their heads up to 270 degrees.",
    category: "Nature",
    source: "National Geographic",
  },
  {
    title: "Hawaii Moving to Alaska",
    text: "Hawaii is moving toward Alaska at a rate of about 2.5 inches per year. The Pacific Plate, on which Hawaii sits, is slowly moving northwest.",
    category: "Science",
    source: "US Geological Survey",
  },
  {
    title: "First Oranges Weren't Orange",
    text: "The original oranges from Southeast Asia were actually green. The orange color we know today developed as a mutation that was later selectively bred in warmer climates.",
    category: "Food",
    source: "Agricultural History",
  },
  {
    title: "Taj Mahal Color Change",
    text: "The Taj Mahal changes color throughout the day. It appears pinkish in the morning, white during the day, and golden under moonlight due to the way light reflects off its marble surfaces.",
    category: "Architecture",
    source: "Indian Tourism",
  },
  {
    title: "Hippo Milk is Pink",
    text: "Hippo milk is pink or reddish in color. This is due to the secretion of hipposudoric acid, a natural sunscreen that hippos produce to protect their skin from the sun.",
    category: "Nature",
    source: "Wildlife Biology",
  },
  {
    title: "Mount Everest Growth",
    text: "Mount Everest grows about 4 millimeters taller every year. The collision of the Indian and Eurasian tectonic plates continues to push the mountain upward.",
    category: "Nature",
    source: "Geological Survey",
  },
  {
    title: "Pistol Shrimp Sound",
    text: "The pistol shrimp can create a sound louder than a gunshot. When it snaps its claw, it creates a cavitation bubble that reaches temperatures of 8,000°F momentarily.",
    category: "Nature",
    source: "Marine Biology",
  },
  {
    title: "Chess Boxing Sport",
    text: "Chess boxing is a real sport that combines chess and boxing. Competitors alternate between rounds of chess and boxing, with matches lasting up to 11 rounds.",
    category: "History",
    source: "Sports History",
  },
  {
    title: "Pineapple Takes Two Years",
    text: "A single pineapple takes about two to three years to grow. This lengthy growth period is one reason why pineapples were once a symbol of wealth and hospitality.",
    category: "Food",
    source: "Agricultural Science",
  },
  {
    title: "Nokia Company Origin",
    text: "Nokia started as a paper mill in 1865. The company produced paper, rubber, and cables before becoming the mobile phone giant that dominated the early cellular market.",
    category: "History",
    source: "Business History",
  },
  {
    title: "Tardigrade Survival",
    text: "Tardigrades, or water bears, can survive in outer space. These microscopic creatures can withstand extreme temperatures, radiation, and the vacuum of space in their dormant state.",
    category: "Science",
    source: "Astrobiology Research",
  },
  {
    title: "Leaning Tower Construction Time",
    text: "The Leaning Tower of Pisa took 199 years to build. Construction was paused twice due to wars, which actually allowed the soil to settle and prevented the tower from falling.",
    category: "Architecture",
    source: "Italian Archives",
  },
  {
    title: "Electric Eels Voltage",
    text: "Electric eels can generate up to 860 volts of electricity. They use this ability to stun prey and defend themselves, making them one of the most powerful bioelectric animals.",
    category: "Nature",
    source: "Biology Research",
  },
  {
    title: "Wright Brothers Patent War",
    text: "The Wright brothers spent years in patent battles that hampered American aviation development. Their aggressive legal tactics delayed innovation until their patents expired.",
    category: "History",
    source: "Aviation History",
  },
  {
    title: "Butterfly Taste With Feet",
    text: "Butterflies taste with their feet. They have taste receptors on their legs that help them identify suitable host plants for laying eggs and find food sources.",
    category: "Nature",
    source: "Entomology",
  },
  {
    title: "Colosseum Seating Capacity",
    text: "The Roman Colosseum could hold between 50,000 to 80,000 spectators. It was designed with 80 entrances, allowing the entire venue to be filled in 15 minutes.",
    category: "Architecture",
    source: "Roman History",
  },
  {
    title: "Van Gogh Sold Only One Painting",
    text: "Vincent van Gogh sold only one painting during his lifetime, 'The Red Vineyard.' Despite producing over 2,000 artworks, he remained largely unknown until after his death.",
    category: "History",
    source: "Art History",
  },
  {
    title: "Mantis Shrimp Vision",
    text: "Mantis shrimp have 16 types of photoreceptor cells compared to humans' 3. They can see ultraviolet, infrared, and polarized light, giving them the most complex eyes in the animal kingdom.",
    category: "Science",
    source: "Marine Biology",
  },
  {
    title: "Shortest Commercial Flight",
    text: "The world's shortest commercial flight lasts just 57 seconds. It connects the Scottish islands of Westray and Papa Westray, covering a distance of only 1.7 miles.",
    category: "History",
    source: "Aviation Records",
  },
  {
    title: "Chocolate Currency",
    text: "The Aztecs and Mayans used cacao beans as currency. Chocolate was considered more valuable than gold, and you could buy a turkey for 100 cacao beans.",
    category: "History",
    source: "Mesoamerican Studies",
  },
  {
    title: "Frozen Frogs",
    text: "Wood frogs can survive being frozen solid during winter. Their bodies produce a natural antifreeze that protects their cells while up to 65% of their body water turns to ice.",
    category: "Nature",
    source: "Biology Research",
  },
  {
    title: "IBM Company Age",
    text: "IBM was founded in 1911, before the Titanic sank. Originally called the Computing-Tabulating-Recording Company, it has remained a technology leader for over a century.",
    category: "History",
    source: "Business History",
  },
  {
    title: "Sunlight Travel Time",
    text: "Sunlight takes about 8 minutes and 20 seconds to reach Earth. This means we always see the Sun as it was over 8 minutes ago, never as it currently is.",
    category: "Science",
    source: "NASA",
  },
  {
    title: "Machu Picchu Unknown Purpose",
    text: "The true purpose of Machu Picchu remains debated among archaeologists. Built by the Inca in the 15th century, theories suggest it was a royal estate, religious site, or astronomical observatory.",
    category: "History",
    source: "Archaeological Research",
  },
  {
    title: "Spider Silk Strength",
    text: "Spider silk is stronger than steel of the same thickness. A strand of spider silk the thickness of a pencil could theoretically stop a Boeing 747 in flight.",
    category: "Science",
    source: "Materials Science",
  },
  {
    title: "Hagfis Slime Defense",
    text: "A hagfish can produce enough slime to fill a bucket in minutes. This incredible defense mechanism can clog the gills of predators and deter even sharks from attacking.",
    category: "Nature",
    source: "Marine Biology",
  },
  {
    title: "First Computer Programmer",
    text: "The first computer programmer was a woman. Ada Lovelace wrote the first algorithm intended for a machine in the mid-1800s, working with Charles Babbage on his Analytical Engine.",
    category: "History",
    source: "Computer History",
  },
  {
    title: "Dolphin Sleep Pattern",
    text: "Dolphins sleep with one eye open. They shut down half of their brain at a time, allowing them to continue swimming and breathing while resting.",
    category: "Nature",
    source: "Marine Biology",
  },
  {
    title: "Sputnik Design Simplicity",
    text: "The first satellite, Sputnik 1, was only 23 inches in diameter. Despite its small size, its radio pulses could be heard by amateur radio operators around the world.",
    category: "History",
    source: "Space History",
  },
];

export async function POST() {
  try {
    // APPEND-ONLY: Check if facts already exist
    const existingCount = await db.fact.count();
    
    if (existingCount > 0) {
      return NextResponse.json({ 
        message: 'Database already seeded',
        count: existingCount 
      });
    }

    // APPEND-ONLY: Insert facts with textHash for duplicate detection
    let insertedCount = 0;
    for (const fact of interestingFacts) {
      try {
        const textHash = generateTextHash(fact.text);
        
        await db.fact.create({
          data: {
            title: fact.title,
            text: fact.text,
            textHash,
            category: fact.category,
            source: fact.source,
            isPublished: true,
          },
        });
        insertedCount++;
      } catch (error) {
        // Skip duplicates (unique constraint violation)
        console.log(`[APPEND-ONLY] Duplicate skipped: "${fact.title}"`);
      }
    }

    return NextResponse.json({ 
      message: 'Database seeded successfully',
      count: insertedCount 
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
