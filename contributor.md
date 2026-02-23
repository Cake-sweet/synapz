Contributing to Synapz

First off, thank you for considering contributing to Synapz! It’s people like you that make Synapz a great tool for lifelong learners.
 Development Setup

    Fork and Clone: Create a fork of the repository and clone it to your local machine.

    Install Dependencies: Run npm install or bun install to set up the environment.

    Database Migration: Use Prisma to set up your local SQLite instance: npx prisma migrate dev.

    Run Development Server: Start the project with npm run dev.

 Folder Management & Project Structure

The project is organized as a Next.js application using the App Router, integrating Prisma, Shadcn UI, and custom mini-services.
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

Key File Responsibilities

    src/lib/srs.ts: Contains the core logic for the Spaced Repetition System.

    src/lib/leveling.ts: Manages the gamification and XP systems.

    prisma/schema.prisma: Defines the database models for users and facts.

    .zscripts/: Shell scripts used to automate building and starting microservices.

Contribution Workflow

    Branching: Create a new branch for your feature or bug fix: git checkout -b feature/your-feature-name.

    Coding Standards:

        Follow the existing Tailwind CSS patterns for styling.

        Do not add comments to .css files.

        Ensure all new components are placed in src/components/synapz/ if they are project-specific.

    Committing: Write clear, concise commit messages.

    Pull Request: Submit a PR to the main branch with a description of your changes.

Technical Stack Reference

    Frontend: Next.js (App Router), React, Tailwind CSS.

    Backend/DB: Next.js API Routes, Prisma ORM, SQLite.

    State: Zustand & React Query.

    PWA: Service Workers and Manifest for offline capability.