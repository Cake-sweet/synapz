# synapz
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

synapz/
├── .zscripts/           # Build and management scripts
├── prisma/              # Database schema (SQLite)
├── public/              # Static assets and PWA manifest
└── src/
    ├── app/             # Application pages and API routes
    ├── components/      # UI components (Shadcn + Synapz Custom)
    ├── hooks/           # Custom React/PWA hooks
    ├── lib/             # Core logic (SRS, Leveling, Auth)
    └── stores/          # Zustand state stores




![icon-512](https://github.com/user-attachments/assets/3b885c74-1457-4027-9823-2b87039e8d61)
<img width="1818" height="795" alt="image" src="https://github.com/user-attachments/assets/21e8b628-f008-433d-8797-b797acf0372a" />
<img width="1838" height="952" alt="image" src="https://github.com/user-attachments/assets/4f411457-ef5a-4108-a64b-71402d90758d" />
<img width="1838" height="952" alt="image" src="https://github.com/user-attachments/assets/affa38aa-0638-4b7b-a1be-666b54407c4b" />



