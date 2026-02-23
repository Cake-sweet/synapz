# Synapz Development Worklog

---
Task ID: 1
Agent: Main Agent
Task: Build Synapz - Full-stack educational web application with daily facts, gamification, and TTS

Work Log:
- Created Prisma schema with User, Fact, and UserActivity models for gamification
- Implemented JWT-based authentication (register, login, logout, me endpoints)
- Created facts API routes (CRUD operations, feed with pagination, seeding)
- Built user profile and activity tracking API routes
- Implemented streak calculation logic (resets after 48h inactivity)
- Created Zustand stores for auth and facts state management
- Built core UI components: Navbar, FactCard, StreakCounter
- Built authentication forms: LoginForm, RegisterForm
- Created main page with client-side routing (landing, feed, profile views)
- Added text-to-speech functionality using Web Speech API
- Implemented gamification: points system, streaks, activity tracking
- Styled with dark theme (slate-900) and Violet/Emerald accents
- Fixed ESLint errors related to React hooks

Stage Summary:
- Complete Next.js 16 application with all requested features
- Authentication: JWT-based with httpOnly cookies
- Database: SQLite via Prisma ORM
- Gamification: Streaks, points, activity tracking
- TTS: Web Speech API for reading facts aloud
- 20 pre-seeded interesting facts across 5 categories
- Responsive design with mobile navigation
- All code passes ESLint validation

---
Task ID: 2
Agent: Main Agent
Task: Implement Smart Entities - Auto-linking proper nouns to Wikipedia

Work Log:
- Installed dompurify and @types/dompurify for safe HTML rendering
- Created linkifyText utility function in src/lib/linkifyText.ts
- Implemented proper noun detection with capitalized word sequences
- Added support for multi-word entities (e.g., "The Great Wall of China")
- Created known entities dictionary for manual overrides (historical figures, places, scientific terms)
- Added common words exclusion list to avoid false positives
- Updated Prisma schema to add keywords field to Fact model for manual entity overrides
- Updated facts API route to accept and store keywords as JSON
- Updated factsStore to include Keyword interface
- Updated FactCard component to use linkifyText with dangerouslySetInnerHTML
- Added violet-colored styling with underline for smart entity links
- Updated fetchFacts to parse keywords JSON from API response
- All code passes ESLint validation

Stage Summary:
- Smart Entities feature fully implemented
- Auto-detects proper nouns and links to Wikipedia
- Supports manual keyword overrides via database field
- Safe HTML rendering using DOMPurify
- Links styled with violet color and underline, open in new tab
- Keywords field added to Fact model for content creators

---
Task ID: 3
Agent: Main Agent
Task: Massively expand content library with Wikipedia integration and smart seeding

Work Log:
- Created comprehensive Wikipedia service (src/lib/wikiService.ts) using z-ai-web-dev-sdk
- Implemented fetchDailyFacts() to scrape Wikipedia "Did You Know" section
- Implemented searchRandomFacts() for web search-based fact discovery
- Implemented fetchFactsAboutTopic() for topic-specific fact fetching
- Created cleanText() utility to remove Wikipedia citations ([1], [citation needed], etc.)
- Implemented smart categorization with categorizeText() using keyword matching
- Created category keyword dictionaries for Science, History, Nature, Architecture, Food, Technology
- Built bulk-seed API endpoint (/api/facts/bulk-seed) with duplicate prevention
- Created AdminSeedPanel component for managing fact seeding
- Added Admin page view with authentication protection
- Updated Navbar to include Admin link for authenticated users
- Support for mixed source seeding (Wikipedia + Web Search)
- Topic-based seeding with suggested topics
- Real-time seeding status and results display

Stage Summary:
- Wikipedia service with 3 fetch methods (daily, random, topic-based)
- Smart categorization using 300+ keywords across 6 categories
- Text cleaning removes all common citation formats
- Bulk seed API prevents duplicates using text similarity matching
- Admin UI with Quick (10), Standard (50), Massive (100) seed options
- Source selection: Mixed, Wikipedia-only, Web Search-only
- Category breakdown display and recent facts preview
- All code passes ESLint validation

---
Task ID: 4
Agent: Main Agent
Task: Implement Append-Only Architecture with database-level duplicate prevention

Work Log:
- Updated Prisma schema with unique constraints:
  - Added `@@unique` on `title` field for title-based duplicate detection
  - Added `textHash` field (nullable unique) for text-based duplicate detection
  - Added indexes for efficient pagination sorting (`createdAt DESC`) and category filtering
- Created hash utility (src/lib/hash.ts) for generating SHA-256 hashes of text
- Updated bulk-seed API for append-only architecture:
  - Implemented `findFirst` for duplicate detection (like MongoDB `find_one`)
  - Logs "Duplicate skipped" when fact already exists
  - Never uses delete operations - only inserts new facts
  - Database-level UNIQUE constraint provides additional protection
- Updated facts API routes:
  - GET endpoint now defaults to limit=20 (was 10)
  - Added `hasNextPage` and `hasPrevPage` to pagination response
  - Always sorts by `createdAt DESC` (newest facts first)
  - POST endpoint checks for duplicates before inserting
- Updated factsStore to include textHash field and new pagination fields
- Updated FeedPage to use limit=20

Stage Summary:
- Append-Only Architecture fully implemented
- Unique constraints at database level (title + textHash)
- Smart duplicate detection: checks title first, then falls back to DB constraint
- Never deletes facts - library only grows over time
- Pagination shows newest facts first (sorted by created_at DESC)
- Default page size: 20 facts per page
- All code passes ESLint validation
- Note: Development server may cache old Prisma types; production builds will use correct types

