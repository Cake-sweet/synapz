
Synapz is a high-performance web application designed to bridge the gap between information discovery and long-term memory. It transforms a social-style "facts feed" into a scientific learning tool by integrating a robust Spaced Repetition System (SRS).

Key Features

    Intelligent Discovery Feed: Users can explore a continuous stream of rich facts, categorized by topics like Science, History, and Nature.

    Scientific SRS Engine: A core memory retention mechanism that schedules reviews based on the user's past recall performance.

    Engagement & Gamification: * Streaks: Daily activity tracking to encourage consistent learning.

        Leveling System: An XP-based system where users grow their profile through active participation.

    Modern PWA Support: Built as a Progressive Web App with offline indicators and service worker support for seamless use on mobile or desktop.

    Content Administration: A dedicated dashboard for bulk-seeding data and managing content generation.

Tech Stack

    Framework: Next.js (App Router)

    Database: Prisma ORM with SQLite

    UI/UX: Tailwind CSS, Shadcn UI, and Framer Motion

    State Management: Zustand (Global) and React Query (Data Fetching)

    Infrastructure: Custom shell scripts for microservice management

 Directory Architecture

The project follows a modular Next.js structure:
Plaintext

Synapz is a high-performance web application designed to bridge the gap between information discovery and long-term memory. It transforms a social-style "facts feed" into a scientific learning tool by integrating a robust Spaced Repetition System (SRS).
🚀 Key Features

    Intelligent Discovery Feed: Users can explore a continuous stream of rich facts, categorized by topics like Science, History, and Nature.

    Scientific SRS Engine: A core memory retention mechanism that schedules reviews based on the user's past recall performance.

    Engagement & Gamification: * Streaks: Daily activity tracking to encourage consistent learning.

        Leveling System: An XP-based system where users grow their profile through active participation.

    Modern PWA Support: Built as a Progressive Web App with offline indicators and service worker support for seamless use on mobile or desktop.

    Content Administration: A dedicated dashboard for bulk-seeding data and managing content generation.

🛠️ Tech Stack

    Framework: Next.js (App Router)

    Database: Prisma ORM with SQLite

    UI/UX: Tailwind CSS, Shadcn UI, and Framer Motion

    State Management: Zustand (Global) and React Query (Data Fetching)

    Infrastructure: Custom shell scripts for microservice management

📂 Directory Architecture

The project follows a modular Next.js structure:
Plaintext
synapz/
├── .zscripts/           # Custom shell scripts for building and managing services
├── examples/            # Example code (e.g., WebSocket implementations)
├── mini-services/       # Directory for separate backend microservices
├── prisma/              # Prisma database schemas and migrations
├── public/              # Static public assets
│   ├── assets/          # Documentation and UI preview images
│   ├── manifest.json    # PWA configuration
│   ├── robots.txt       # Search engine instructions
│   └── sw.js            # Service worker for offline support
├── scripts/             # Development scripts (e.g., icon generation)
└── src/                 # Main application source code
    ├── app/             # Next.js App Router (Pages, Layouts, API routes)
    │   ├── admin/       # Dashboard for content management and seeding
    │   ├── api/         # Backend routes (Auth, SRS logic, User activity)
    │   ├── feed/        # Discovery feed for new facts
    │   └── review/      # Spaced Repetition (SRS) review interface
    ├── components/      # React components
    │   ├── synapz/      # Custom logic components (FactCard, StreakCounter, etc.)
    │   └── ui/          # Generic Shadcn UI components
    ├── hooks/           # Custom React hooks (PWA, Mobile, Toasts)
    ├── lib/             # Core utilities (SRS algorithm, Auth, Leveling)
    └── stores/          # Zustand global state (Auth and Facts)
