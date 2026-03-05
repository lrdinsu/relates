# Relates

Relates is a high-performance, full-stack social media platform inspired by modern threads-style interaction. Built with `React`, `TypeScript`, `Vite`, `Express`, and `PostgreSQL`, it features a sophisticated UI, real-time optimistic updates, and a robust search engine.

## Table of Contents

- [Core Features](#core-features)
- [Client Architecture](#client-architecture)
  - [Technologies](#technologies)
  - [Key Features](#key-features)
- [Server Architecture](#server-architecture)
  - [Technologies](#technologies-1)
  - [Key Features](#key-features-1)
- [Packages](#packages)
- [Getting Started](#getting-started)
- [License](#license)

## Core Features

- **Dynamic Content Discovery**: "For You" and "Following" feeds with intelligent navigation.
- **Universal Search**: Real-time debounced search for both users and post content.
- **Sophisticated Media Experience**: Full-screen image viewer with multi-image navigation and keyboard shortcuts.
- **Optimistic UI Interaction**: Zero-latency feedback for Likes and interactions via React Query.
- **Full Post Lifecycle**: Create, Edit, and Soft-Delete capabilities for posts and nested replies.
- **Advanced Profile Management**: Live profile editing (Name, Bio, Avatar URL) with instant cross-app synchronization.
- **Secure Authentication**: JWT-based auth with automatic token refresh linked to live database state.
- **Responsive Design**: Polished mobile and desktop layouts featuring a smart navigation system and unified "Menu" button.

## Client Architecture

The client is a modern SPA designed for speed and responsiveness.

### Technologies

- **React 18** & **TypeScript**
- **Vite** for optimized bundling
- **Mantine UI** for professional-grade component architecture
- **React Query** for state synchronization and optimistic updates
- **Zustand** for lightweight global state management
- **React Router v7** with advanced lazy loading and path-aware navigation

### Key Features

- **Smart Navigation**: Header tabs that dynamically sync with home routes and hide during search/profile views.
- **Unified Post Component**: Single versatile component handling creation, replies, and edits.
- **Portal-based Modals**: Clean, accessible modals for profile editing and post management.
- **Intelligent Back Button**: Context-aware visibility logic based on navigation history.
- **Theme Engine**: Seamless light/dark mode transitions with persistent user preferences.

## Server Architecture

A scalable Express backend focused on data integrity and performance.

### Technologies

- **Express** & **TypeScript**
- **Prisma ORM** for type-safe database operations
- **PostgreSQL** for relational data storage
- **Zod** for end-to-end type safety and validation
- **Argon2** for industry-standard password hashing

### Key Features

- **Soft-Delete System**: Database-safe post removal ensuring data integrity and relationship stability.
- **Blended Feed Logic**: Complex Prisma queries for fetching network-relevant content.
- **Type-Safe Search**: Case-insensitive partial matching for users and posts.
- **Live Token Refresh**: Refresh mechanism that pulls latest profile data from DB to prevent stale client state.
- **Modular Controllers**: Clean separation of concerns for Auth, Post, User, and Search logic.

## Packages

### Validation

Shared Zod schemas located in `packages/validation/`. This ensures the client and server are always in sync regarding data structures, reducing runtime errors.

- **Sync Schemas**: One source of truth for Users, Posts, Searches, and Interactions.

## Getting Started

### Prerequisites

- **Node.js** (v18+)
- **pnpm** (preferred)
- **Docker** & **Docker Compose**

### Installation

1. **Clone & Install**:
    ```bash
    git clone `repository-url`
    cd relates
    pnpm install
    ```

2. **Environment**:
    - Configure `.env` in the root using the provided samples.

3. **Database**:
    - Ensure PostgreSQL is running (or use Docker).
    - Run `npx prisma generate` and `npx prisma migrate dev`.

### Running the Application

**Using Docker**:
```bash
docker-compose up --build
```

**Development Mode**:
```bash
# Terminal 1 (Client)
cd client && pnpm dev

# Terminal 2 (Server)
cd server && pnpm dev
```

## License

MIT License. See `LICENSE` for details.
